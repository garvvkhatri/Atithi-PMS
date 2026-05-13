const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");
const { prisma, dbPath, backupDir } = require("./db.cjs");
const { initDatabase } = require("./init-db.cjs");

const app = express();
const port = process.env.PORT || 4100;

app.use(cors());
app.use(express.json());

const toInt = (value) => Number.parseInt(value || 0, 10);
const nightsBetween = (checkIn, checkOut) => Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
const paymentStatus = (advance, total) => (advance >= total ? "PAID" : advance > 0 ? "PARTIAL" : "PENDING");
const bookingCode = () => `BK-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;

async function hasOverlap(roomId, checkIn, checkOut, ignoreBookingId) {
  const overlap = await prisma.booking.findFirst({
    where: {
      roomId: toInt(roomId),
      id: ignoreBookingId ? { not: toInt(ignoreBookingId) } : undefined,
      status: { not: "CANCELLED" },
      checkIn: { lt: new Date(checkOut) },
      checkOut: { gt: new Date(checkIn) }
    }
  });
  const groupOverlap = await prisma.groupRoom.findFirst({
    where: {
      roomId: toInt(roomId),
      groupBooking: {
        status: { not: "CANCELLED" },
        checkIn: { lt: new Date(checkOut) },
        checkOut: { gt: new Date(checkIn) }
      }
    }
  });
  return Boolean(overlap || groupOverlap);
}

async function refreshRoomStatus(roomId) {
  const active = await prisma.booking.findFirst({
    where: { roomId: toInt(roomId), status: "CHECKED_IN" }
  });
  const reserved = await prisma.booking.findFirst({
    where: { roomId: toInt(roomId), status: "RESERVED" }
  });
  await prisma.room.update({
    where: { id: toInt(roomId) },
    data: { status: active ? "OCCUPIED" : reserved ? "RESERVED" : "AVAILABLE" }
  });
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/api/dashboard", async (_req, res) => {
  const [rooms, bookings, expenses] = await Promise.all([
    prisma.room.findMany({ include: { bookings: { include: { guest: true }, orderBy: { checkIn: "desc" }, take: 1 } } }),
    prisma.booking.findMany({ include: { room: true, guest: true }, orderBy: { createdAt: "desc" } }),
    prisma.expense.findMany()
  ]);
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthlyBookings = bookings.filter((booking) => new Date(booking.checkIn).getMonth() === month && new Date(booking.checkIn).getFullYear() === year);
  const todayBookings = bookings.filter((booking) => new Date(booking.createdAt).toDateString() === now.toDateString());
  const paidRevenue = bookings.reduce((sum, booking) => sum + booking.advancePayment, 0);
  const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const monthlyExpenses = expenses
    .filter((expense) => new Date(expense.spentAt).getMonth() === month && new Date(expense.spentAt).getFullYear() === year)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const statuses = rooms.reduce((acc, room) => ({ ...acc, [room.status]: (acc[room.status] || 0) + 1 }), {});
  const trend = Array.from({ length: 6 }).map((_, i) => {
    const trendDate = new Date(year, month - 5 + i, 1);
    const items = bookings.filter((booking) => {
      const date = new Date(booking.checkIn);
      return date.getMonth() === trendDate.getMonth() && date.getFullYear() === trendDate.getFullYear();
    });
    return {
      month: trendDate.toLocaleString("en-IN", { month: "short" }),
      revenue: items.reduce((sum, booking) => sum + booking.totalAmount, 0),
      occupancy: Math.round((items.length / Math.max(rooms.length, 1)) * 100)
    };
  });

  res.json({
    totalRooms: rooms.length,
    occupiedRooms: statuses.OCCUPIED || 0,
    availableRooms: statuses.AVAILABLE || 0,
    reservedRooms: statuses.RESERVED || 0,
    cleaningRooms: statuses.CLEANING || 0,
    maintenanceRooms: statuses.MAINTENANCE || 0,
    todayRevenue: todayBookings.reduce((sum, booking) => sum + booking.advancePayment, 0),
    monthlyRevenue,
    pendingPayments: bookings.reduce((sum, booking) => sum + booking.pendingAmount, 0),
    monthlyExpenses,
    monthlyProfit: monthlyRevenue - monthlyExpenses,
    paidRevenue,
    occupancyPercentage: Math.round(((statuses.OCCUPIED || 0) / Math.max(rooms.length, 1)) * 100),
    upcomingCheckouts: bookings.filter((booking) => ["CHECKED_IN", "RESERVED"].includes(booking.status)).slice(0, 5),
    recentBookings: bookings.slice(0, 8),
    trend
  });
});

app.get("/api/rooms", async (_req, res) => {
  const rooms = await prisma.room.findMany({
    include: {
      bookings: {
        where: { status: { in: ["CHECKED_IN", "RESERVED"] } },
        include: { guest: true },
        orderBy: { checkIn: "asc" },
        take: 1
      },
      groupRooms: {
        where: { groupBooking: { status: { in: ["CHECKED_IN", "RESERVED"] } } },
        include: { groupBooking: true },
        take: 1
      }
    },
    orderBy: [{ floor: "asc" }, { number: "asc" }]
  });
  res.json(rooms);
});

app.post("/api/rooms", async (req, res) => {
  try {
    const room = await prisma.room.create({
      data: {
        number: req.body.number?.trim(),
        floor: toInt(req.body.floor),
        type: req.body.type?.trim(),
        capacity: toInt(req.body.capacity),
        price: toInt(req.body.price),
        status: req.body.status || "AVAILABLE",
        notes: req.body.notes?.trim() || null
      }
    });
    res.status(201).json(room);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "A room with this number already exists." });
    }
    res.status(400).json({ message: "Unable to create room. Please check room details." });
  }
});

app.patch("/api/rooms/:id/status", async (req, res) => {
  const room = await prisma.room.update({
    where: { id: toInt(req.params.id) },
    data: { status: req.body.status }
  });
  res.json(room);
});

app.delete("/api/rooms/:id", async (req, res) => {
  const roomId = toInt(req.params.id);
  const [bookingCount, groupRoomCount] = await Promise.all([
    prisma.booking.count({ where: { roomId } }),
    prisma.groupRoom.count({ where: { roomId } })
  ]);
  if (bookingCount || groupRoomCount) {
    return res.status(409).json({ message: "This room has booking history. Mark it Maintenance instead of deleting it." });
  }
  await prisma.room.delete({ where: { id: roomId } });
  res.json({ deleted: true });
});

app.get("/api/bookings", async (req, res) => {
  const search = req.query.search?.toString() || "";
  const bookings = await prisma.booking.findMany({
    where: search
      ? {
          OR: [
            { bookingCode: { contains: search } },
            { guest: { fullName: { contains: search } } },
            { guest: { phone: { contains: search } } },
            { room: { number: { contains: search } } },
            { groupBooking: { eventName: { contains: search } } }
          ]
        }
      : undefined,
    include: { guest: true, room: true, groupBooking: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(bookings);
});

app.post("/api/bookings", async (req, res) => {
  const body = req.body;
  if (await hasOverlap(body.roomId, body.checkIn, body.checkOut)) {
    return res.status(409).json({ message: "Room is already booked for the selected dates." });
  }
  const nights = nightsBetween(body.checkIn, body.checkOut);
  const roomPrice = toInt(body.roomPrice);
  const totalAmount = nights * roomPrice;
  const advancePayment = toInt(body.advancePayment);
  const booking = await prisma.$transaction(async (tx) => {
    const guest = await tx.guest.create({
      data: {
        fullName: body.fullName,
        phone: body.phone,
        address: body.address,
        idProof: body.idProof,
        idNumber: body.idNumber,
        vehicleNumber: body.vehicleNumber
      }
    });
    const created = await tx.booking.create({
      data: {
        bookingCode: bookingCode(),
        guestId: guest.id,
        roomId: toInt(body.roomId),
        checkIn: new Date(body.checkIn),
        checkOut: new Date(body.checkOut),
        nights,
        numberOfGuests: toInt(body.numberOfGuests),
        roomPrice,
        totalAmount,
        advancePayment,
        pendingAmount: totalAmount - advancePayment,
        paymentStatus: paymentStatus(advancePayment, totalAmount),
        status: body.status || "RESERVED",
        source: body.source,
        notes: body.notes
      },
      include: { guest: true, room: true }
    });
    await tx.room.update({
      where: { id: toInt(body.roomId) },
      data: { status: created.status === "CHECKED_IN" ? "OCCUPIED" : "RESERVED" }
    });
    return created;
  });
  res.status(201).json(booking);
});

app.patch("/api/bookings/:id", async (req, res) => {
  const existing = await prisma.booking.findUnique({ where: { id: toInt(req.params.id) } });
  if (!existing) return res.status(404).json({ message: "Booking not found." });
  if (req.body.roomId && req.body.checkIn && req.body.checkOut && (await hasOverlap(req.body.roomId, req.body.checkIn, req.body.checkOut, req.params.id))) {
    return res.status(409).json({ message: "Room is already booked for the selected dates." });
  }
  const nights = req.body.checkIn && req.body.checkOut ? nightsBetween(req.body.checkIn, req.body.checkOut) : existing.nights;
  const roomPrice = req.body.roomPrice ? toInt(req.body.roomPrice) : existing.roomPrice;
  const totalAmount = nights * roomPrice;
  const advancePayment = req.body.advancePayment !== undefined ? toInt(req.body.advancePayment) : existing.advancePayment;
  const updated = await prisma.booking.update({
    where: { id: toInt(req.params.id) },
    data: {
      roomId: req.body.roomId ? toInt(req.body.roomId) : undefined,
      checkIn: req.body.checkIn ? new Date(req.body.checkIn) : undefined,
      checkOut: req.body.checkOut ? new Date(req.body.checkOut) : undefined,
      nights,
      numberOfGuests: req.body.numberOfGuests ? toInt(req.body.numberOfGuests) : undefined,
      roomPrice,
      totalAmount,
      advancePayment,
      pendingAmount: totalAmount - advancePayment,
      paymentStatus: paymentStatus(advancePayment, totalAmount),
      status: req.body.status,
      source: req.body.source,
      notes: req.body.notes
    },
    include: { guest: true, room: true }
  });
  await refreshRoomStatus(existing.roomId);
  await refreshRoomStatus(updated.roomId);
  res.json(updated);
});

app.post("/api/bookings/:id/check-in", async (req, res) => {
  const booking = await prisma.booking.update({
    where: { id: toInt(req.params.id) },
    data: { status: "CHECKED_IN" },
    include: { room: true, guest: true }
  });
  await prisma.room.update({ where: { id: booking.roomId }, data: { status: "OCCUPIED" } });
  res.json(booking);
});

app.post("/api/bookings/:id/check-out", async (req, res) => {
  const booking = await prisma.booking.update({
    where: { id: toInt(req.params.id) },
    data: { status: "CHECKED_OUT", pendingAmount: 0, paymentStatus: "PAID" },
    include: { room: true, guest: true }
  });
  await prisma.room.update({ where: { id: booking.roomId }, data: { status: "CLEANING" } });
  res.json(booking);
});

app.post("/api/bookings/:id/cancel", async (req, res) => {
  const booking = await prisma.booking.update({
    where: { id: toInt(req.params.id) },
    data: { status: "CANCELLED" }
  });
  await refreshRoomStatus(booking.roomId);
  res.json(booking);
});

app.get("/api/groups", async (_req, res) => {
  const groups = await prisma.groupBooking.findMany({
    include: { rooms: { include: { room: true } }, bookings: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(groups);
});

app.post("/api/groups", async (req, res) => {
  const body = req.body;
  const roomIds = body.roomIds || [];
  for (const roomId of roomIds) {
    if (await hasOverlap(roomId, body.checkIn, body.checkOut)) {
      return res.status(409).json({ message: `Room ${roomId} is unavailable for this group booking.` });
    }
  }
  const group = await prisma.groupBooking.create({
    data: {
      eventName: body.eventName,
      eventType: body.eventType,
      groupLeader: body.groupLeader,
      phone: body.phone,
      totalGuests: toInt(body.totalGuests),
      cateringNotes: body.cateringNotes,
      decorationNotes: body.decorationNotes,
      checkIn: new Date(body.checkIn),
      checkOut: new Date(body.checkOut),
      rooms: { create: roomIds.map((roomId) => ({ roomId: toInt(roomId) })) }
    },
    include: { rooms: { include: { room: true } } }
  });
  await prisma.room.updateMany({ where: { id: { in: roomIds.map(toInt) } }, data: { status: "RESERVED" } });
  res.status(201).json(group);
});

app.get("/api/expenses", async (_req, res) => {
  const expenses = await prisma.expense.findMany({ orderBy: { spentAt: "desc" } });
  res.json(expenses);
});

app.post("/api/expenses", async (req, res) => {
  const expense = await prisma.expense.create({
    data: {
      category: req.body.category,
      description: req.body.description,
      amount: toInt(req.body.amount),
      spentAt: new Date(req.body.spentAt)
    }
  });
  res.status(201).json(expense);
});

app.get("/api/analytics", async (_req, res) => {
  const [rooms, bookings, guests] = await Promise.all([
    prisma.room.findMany({ include: { bookings: true } }),
    prisma.booking.findMany({ include: { room: true, guest: true } }),
    prisma.guest.findMany({ include: { bookings: true } })
  ]);
  res.json({
    mostProfitableRooms: rooms
      .map((room) => ({ room: room.number, revenue: room.bookings.reduce((sum, booking) => sum + booking.totalAmount, 0), usage: room.bookings.length }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8),
    repeatCustomers: guests.filter((guest) => guest.bookings.length > 1).length,
    averageStay: Math.round(bookings.reduce((sum, booking) => sum + booking.nights, 0) / Math.max(bookings.length, 1)),
    roomUsage: rooms.map((room) => ({ room: room.number, usage: room.bookings.length }))
  });
});

app.get("/api/users", async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { role: "asc" } });
  res.json(users);
});

app.get("/api/receipts/:bookingId", async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: toInt(req.params.bookingId) },
    include: { guest: true, room: true }
  });
  if (!booking) return res.status(404).send("Receipt not found");
  res.type("html").send(`<!doctype html><html><head><title>${booking.bookingCode}</title><style>body{font-family:Arial;padding:40px;color:#111827}.box{border:1px solid #ddd;padding:24px;border-radius:12px}table{width:100%;border-collapse:collapse}td{padding:8px;border-bottom:1px solid #eee}.total{font-size:24px;font-weight:700}</style></head><body><div class="box"><h1>Atithi Guest House</h1><p>GST-ready Booking Receipt</p><h2>${booking.bookingCode}</h2><table><tr><td>Guest</td><td>${booking.guest.fullName}</td></tr><tr><td>Room</td><td>${booking.room.number} - ${booking.room.type}</td></tr><tr><td>Check In</td><td>${booking.checkIn.toDateString()}</td></tr><tr><td>Check Out</td><td>${booking.checkOut.toDateString()}</td></tr><tr><td>Nights</td><td>${booking.nights}</td></tr><tr><td>Total</td><td>Rs ${booking.totalAmount}</td></tr><tr><td>Advance</td><td>Rs ${booking.advancePayment}</td></tr><tr><td>Pending</td><td class="total">Rs ${booking.pendingAmount}</td></tr></table><script>window.print()</script></div></body></html>`);
});

app.post("/api/backups", async (_req, res) => {
  fs.mkdirSync(backupDir, { recursive: true });
  const target = path.join(backupDir, `atithi-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
  const source = dbPath;
  fs.copyFileSync(source, target);
  res.json({ path: target });
});

app.post("/api/backups/restore", async (req, res) => {
  const source = req.body.path;
  const target = dbPath;
  if (!source || !fs.existsSync(source)) return res.status(400).json({ message: "Backup file not found." });
  fs.copyFileSync(source, target);
  res.json({ restored: true });
});

initDatabase()
  .then(() => {
    app.listen(port, "127.0.0.1", () => {
      console.log(`Atithi PMS API running on http://127.0.0.1:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize SQLite database", error);
    process.exit(1);
  });

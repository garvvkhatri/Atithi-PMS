const { prisma } = require("./db.cjs");

const statements = [
  `PRAGMA foreign_keys = ON`,
  `CREATE TABLE IF NOT EXISTS "Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Room_number_key" ON "Room"("number")`,
  `CREATE TABLE IF NOT EXISTS "Guest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "idProof" TEXT,
    "idNumber" TEXT,
    "vehicleNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "GroupBooking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "groupLeader" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "totalGuests" INTEGER NOT NULL,
    "cateringNotes" TEXT,
    "decorationNotes" TEXT,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RESERVED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingCode" TEXT NOT NULL,
    "guestId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "groupBookingId" INTEGER,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "nights" INTEGER NOT NULL,
    "numberOfGuests" INTEGER NOT NULL,
    "roomPrice" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "advancePayment" INTEGER NOT NULL DEFAULT 0,
    "pendingAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RESERVED',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "source" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_groupBookingId_fkey" FOREIGN KEY ("groupBookingId") REFERENCES "GroupBooking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Booking_bookingCode_key" ON "Booking"("bookingCode")`,
  `CREATE TABLE IF NOT EXISTS "GroupRoom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupBookingId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    CONSTRAINT "GroupRoom_groupBookingId_fkey" FOREIGN KEY ("groupBookingId") REFERENCES "GroupBooking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GroupRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "GroupRoom_groupBookingId_roomId_key" ON "GroupRoom"("groupBookingId", "roomId")`,
  `CREATE TABLE IF NOT EXISTS "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "note" TEXT,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "spentAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`
];

async function initDatabase() {
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
}

if (require.main === module) {
  initDatabase()
    .then(async () => {
      console.log("SQLite schema is ready.");
      await prisma.$disconnect();
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}

module.exports = { initDatabase };

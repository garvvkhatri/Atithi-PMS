const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.groupRoom.deleteMany();
  await prisma.groupBooking.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { name: "Property Owner", email: "owner@atithi.local", role: "OWNER" },
      { name: "Front Desk Manager", email: "manager@atithi.local", role: "MANAGER" },
      { name: "Reception Staff", email: "reception@atithi.local", role: "RECEPTION" }
    ]
  });

  console.log("Clean first-use database seeded. Rooms, bookings, guests, and expenses are empty.");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

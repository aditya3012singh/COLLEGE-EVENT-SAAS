// prisma/seed.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ====================================================
  // College 1: KIET
  // ====================================================
  const college1 = await prisma.college.upsert({
    where: { code: "KIET" },
    update: {},
    create: {
      name: "KIET",
      code: "KIET",
    },
  });

  const admin1 = await prisma.user.upsert({
    where: { email: "admin@kiet.edu" },
    update: {},
    create: {
      name: "Admin KIET",
      email: "admin@kiet.edu",
      password: "securepassword",
      role: "ADMIN",
      collegeId: college1.id,
    },
  });

  const organizer1 = await prisma.user.upsert({
    where: { email: "organizer@kiet.edu" },
    update: {},
    create: {
      name: "Organizer KIET",
      email: "organizer@kiet.edu",
      password: "securepassword",
      role: "ORGANIZER",
      collegeId: college1.id,
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: "student@kiet.edu" },
    update: {},
    create: {
      name: "Student KIET",
      email: "student@kiet.edu",
      password: "securepassword",
      role: "STUDENT",
      collegeId: college1.id,
    },
  });

  const club1 = await prisma.club.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "CPByte",
      collegeId: college1.id,
      createdBy: admin1.id,
    },
  });

  const event1 = await prisma.event.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Intro to Competitive Programming",
      description: "Kickstart your CP journey with CPByte!",
      dateTime: new Date("2025-10-10T10:00:00Z"),
      venue: "Auditorium, KIET",
      collegeId: college1.id,
      clubId: club1.id,
      createdBy: organizer1.id,
      visibility: "ALL",
    },
  });

  await prisma.registration.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: student1.id,
      eventId: event1.id,
      qrPayload: "QR123456",
      qrImageUrl: "https://fake-qr.com/qr123456.png",
      attended: false,
      paidAmount: 0,
      paymentStatus: "PAID",
    },
  });

  // ====================================================
  // College 2: ABES
  // ====================================================
  const college2 = await prisma.college.upsert({
    where: { code: "ABES" },
    update: {},
    create: {
      name: "ABES Engineering College",
      code: "ABES",
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: "admin@abes.edu" },
    update: {},
    create: {
      name: "Admin ABES",
      email: "admin@abes.edu",
      password: "securepassword",
      role: "ADMIN",
      collegeId: college2.id,
    },
  });

  const organizer2 = await prisma.user.upsert({
    where: { email: "organizer@abes.edu" },
    update: {},
    create: {
      name: "Organizer ABES",
      email: "organizer@abes.edu",
      password: "securepassword",
      role: "ORGANIZER",
      collegeId: college2.id,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "student@abes.edu" },
    update: {},
    create: {
      name: "Student ABES",
      email: "student@abes.edu",
      password: "securepassword",
      role: "STUDENT",
      collegeId: college2.id,
    },
  });

  const club2 = await prisma.club.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Robotics Club",
      collegeId: college2.id,
      createdBy: admin2.id,
    },
  });

  const event2 = await prisma.event.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: "Robotics Workshop",
      description: "Build and program your first robot!",
      dateTime: new Date("2025-11-15T14:00:00Z"),
      venue: "Lab Hall, ABES",
      collegeId: college2.id,
      clubId: club2.id,
      createdBy: organizer2.id,
      visibility: "ALL",
    },
  });

  await prisma.registration.upsert({
    where: { id: 2 },
    update: {},
    create: {
      userId: student2.id,
      eventId: event2.id,
      qrPayload: "QR654321",
      qrImageUrl: "https://fake-qr.com/qr654321.png",
      attended: false,
      paidAmount: 0,
      paymentStatus: "PAID",
    },
  });

  console.log("🎉 Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

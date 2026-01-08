// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

// ====== HELPER FUNCTIONS ======
const hashPassword = async (password) => bcrypt.hash(password, BCRYPT_ROUNDS);
const generateToken = () => crypto.randomBytes(32).toString("hex");
const dateFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

async function main() {
  console.log("🌱 Seeding database...");

  try {
    // ====================================================
    // 1. COLLEGES
    // ====================================================
    console.log("📚 Creating colleges...");

    const college1 = await prisma.college.upsert({
      where: { code: "KIET" },
      update: {},
      create: {
        name: "KIET Group of Institutions",
        code: "KIET",
        logo: "https://kiet.edu/logo.png",
      },
    });

    const college2 = await prisma.college.upsert({
      where: { code: "ABES" },
      update: {},
      create: {
        name: "ABES Engineering College",
        code: "ABES",
        logo: "https://abes.edu/logo.png",
      },
    });

    const college3 = await prisma.college.upsert({
      where: { code: "DTU" },
      update: {},
      create: {
        name: "Delhi Technological University",
        code: "DTU",
        logo: "https://dtu.edu/logo.png",
      },
    });

    console.log("✅ Colleges created");

    // ====================================================
    // 2. USERS - COLLEGE 1 (KIET)
    // ====================================================
    console.log("👥 Creating users for KIET...");

    const admin1Password = await hashPassword("admin123");
    const admin1 = await prisma.user.upsert({
      where: { email: "admin@kiet.edu" },
      update: {},
      create: {
        name: "Rajesh Kumar",
        email: "admin@kiet.edu",
        password: admin1Password,
        role: "ADMIN",
        collegeId: college1.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const organizer1Password = await hashPassword("organizer123");
    const organizer1 = await prisma.user.upsert({
      where: { email: "organizer@kiet.edu" },
      update: {},
      create: {
        name: "Priya Singh",
        email: "organizer@kiet.edu",
        password: organizer1Password,
        role: "ORGANIZER",
        collegeId: college1.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const organizer1bPassword = await hashPassword("organizer123");
    const organizer1b = await prisma.user.upsert({
      where: { email: "event.organizer@kiet.edu" },
      update: {},
      create: {
        name: "Amit Patel",
        email: "event.organizer@kiet.edu",
        password: organizer1bPassword,
        role: "ORGANIZER",
        collegeId: college1.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const student1Password = await hashPassword("student123");
    const student1 = await prisma.user.upsert({
      where: { email: "student1@kiet.edu" },
      update: {},
      create: {
        name: "Arjun Verma",
        email: "student1@kiet.edu",
        password: student1Password,
        role: "STUDENT",
        collegeId: college1.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const student2Password = await hashPassword("student123");
    const student2 = await prisma.user.upsert({
      where: { email: "student2@kiet.edu" },
      update: {},
      create: {
        name: "Neha Gupta",
        email: "student2@kiet.edu",
        password: student2Password,
        role: "STUDENT",
        collegeId: college1.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const student3Password = await hashPassword("student123");
    const student3 = await prisma.user.upsert({
      where: { email: "student3@kiet.edu" },
      update: {},
      create: {
        name: "Rohan Sharma",
        email: "student3@kiet.edu",
        password: student3Password,
        role: "STUDENT",
        collegeId: college1.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    console.log("✅ KIET users created");

    // ====================================================
    // 3. USERS - COLLEGE 2 (ABES)
    // ====================================================
    console.log("👥 Creating users for ABES...");

    const admin2Password = await hashPassword("admin123");
    const admin2 = await prisma.user.upsert({
      where: { email: "admin@abes.edu" },
      update: {},
      create: {
        name: "Dr. Vikram Sethi",
        email: "admin@abes.edu",
        password: admin2Password,
        role: "ADMIN",
        collegeId: college2.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const organizer2Password = await hashPassword("organizer123");
    const organizer2 = await prisma.user.upsert({
      where: { email: "organizer@abes.edu" },
      update: {},
      create: {
        name: "Deepak Nair",
        email: "organizer@abes.edu",
        password: organizer2Password,
        role: "ORGANIZER",
        collegeId: college2.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const student4Password = await hashPassword("student123");
    const student4 = await prisma.user.upsert({
      where: { email: "student1@abes.edu" },
      update: {},
      create: {
        name: "Sanya Desai",
        email: "student1@abes.edu",
        password: student4Password,
        role: "STUDENT",
        collegeId: college2.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const student5Password = await hashPassword("student123");
    const student5 = await prisma.user.upsert({
      where: { email: "student2@abes.edu" },
      update: {},
      create: {
        name: "Kabir Singh",
        email: "student2@abes.edu",
        password: student5Password,
        role: "STUDENT",
        collegeId: college2.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    console.log("✅ ABES users created");

    // ====================================================
    // 4. USERS - COLLEGE 3 (DTU)
    // ====================================================
    console.log("👥 Creating users for DTU...");

    const admin3Password = await hashPassword("admin123");
    const admin3 = await prisma.user.upsert({
      where: { email: "admin@dtu.edu" },
      update: {},
      create: {
        name: "Prof. Anand Kumar",
        email: "admin@dtu.edu",
        password: admin3Password,
        role: "ADMIN",
        collegeId: college3.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const organizer3Password = await hashPassword("organizer123");
    const organizer3 = await prisma.user.upsert({
      where: { email: "organizer@dtu.edu" },
      update: {},
      create: {
        name: "Sneha Reddy",
        email: "organizer@dtu.edu",
        password: organizer3Password,
        role: "ORGANIZER",
        collegeId: college3.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const student6Password = await hashPassword("student123");
    const student6 = await prisma.user.upsert({
      where: { email: "student1@dtu.edu" },
      update: {},
      create: {
        name: "Aditya Singh",
        email: "student1@dtu.edu",
        password: student6Password,
        role: "STUDENT",
        collegeId: college3.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    console.log("✅ DTU users created");

    // ====================================================
    // 5. CLUBS
    // ====================================================
    console.log("🏛️ Creating clubs...");

    const club1 = await prisma.club.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "CPByte - Competitive Programming",
        collegeId: college1.id,
        createdBy: organizer1.id,
        description: "Master competitive programming with experienced mentors",
        department: "CSE",
        domain: "Technology",
        clubLeadId: student1.id,
      },
    });

    const club2 = await prisma.club.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Web Dev Club",
        collegeId: college1.id,
        createdBy: organizer1.id,
        description: "Learn and build amazing web applications",
        department: "CSE",
        domain: "Technology",
        clubLeadId: student2.id,
      },
    });

    const club3 = await prisma.club.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "Design Studio",
        collegeId: college1.id,
        createdBy: organizer1.id,
        description: "Create stunning UI/UX designs",
        department: "ECE",
        domain: "Design",
        clubLeadId: student3.id,
      },
    });

    const club4 = await prisma.club.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: "Robotics Club",
        collegeId: college2.id,
        createdBy: organizer2.id,
        description: "Build and program robots",
        department: "Mechanical",
        domain: "Technology",
        clubLeadId: student4.id,
      },
    });

    const club5 = await prisma.club.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: "AI & ML Club",
        collegeId: college3.id,
        createdBy: organizer3.id,
        description: "Explore artificial intelligence and machine learning",
        department: "CSE",
        domain: "Technology",
        clubLeadId: student6.id,
      },
    });

    console.log("✅ Clubs created");

    // ====================================================
    // 6. CLUB DOMAIN LEADS
    // ====================================================
    console.log("👔 Creating club domain leads...");

    await prisma.clubDomainLead.upsert({
      where: { clubId_userId_domain: { clubId: club1.id, userId: student1.id, domain: "Mentorship" } },
      update: {},
      create: {
        clubId: club1.id,
        userId: student1.id,
        domain: "Mentorship",
      },
    });

    await prisma.clubDomainLead.upsert({
      where: { clubId_userId_domain: { clubId: club1.id, userId: student2.id, domain: "Content Creation" } },
      update: {},
      create: {
        clubId: club1.id,
        userId: student2.id,
        domain: "Content Creation",
      },
    });

    await prisma.clubDomainLead.upsert({
      where: { clubId_userId_domain: { clubId: club2.id, userId: student2.id, domain: "Frontend" } },
      update: {},
      create: {
        clubId: club2.id,
        userId: student2.id,
        domain: "Frontend",
      },
    });

    await prisma.clubDomainLead.upsert({
      where: { clubId_userId_domain: { clubId: club4.id, userId: student4.id, domain: "Hardware" } },
      update: {},
      create: {
        clubId: club4.id,
        userId: student4.id,
        domain: "Hardware",
      },
    });

    console.log("✅ Club domain leads created");

    // ====================================================
    // 7. CLUB ACHIEVEMENTS
    // ====================================================
    console.log("🏆 Creating club achievements...");

    await prisma.clubAchievement.upsert({
      where: { id: 1 },
      update: {},
      create: {
        clubId: club1.id,
        title: "Won National Programming Championship",
        description: "Team from CPByte won 1st place in ICPC 2024",
        type: "CLUB",
      },
    });

    await prisma.clubAchievement.upsert({
      where: { id: 2 },
      update: {},
      create: {
        clubId: club1.id,
        memberId: student1.id,
        title: "Ranked 1 in CodeChef",
        description: "Arjun achieved 6-star rating on CodeChef",
        type: "MEMBER",
      },
    });

    await prisma.clubAchievement.upsert({
      where: { id: 3 },
      update: {},
      create: {
        clubId: club4.id,
        title: "Robotics Innovation Award",
        description: "Built an autonomous rover winning state-level competition",
        type: "CLUB",
      },
    });

    console.log("✅ Club achievements created");

    // ====================================================
    // 8. CLUB MEMBERSHIPS
    // ====================================================
    console.log("🤝 Creating club memberships...");

    await prisma.clubMembership.upsert({
      where: { userId_clubId: { userId: student1.id, clubId: club1.id } },
      update: {},
      create: {
        userId: student1.id,
        clubId: club1.id,
        status: "APPROVED",
        joinedAt: new Date("2024-01-15"),
      },
    });

    await prisma.clubMembership.upsert({
      where: { userId_clubId: { userId: student2.id, clubId: club1.id } },
      update: {},
      create: {
        userId: student2.id,
        clubId: club1.id,
        status: "APPROVED",
        joinedAt: new Date("2024-02-01"),
      },
    });

    await prisma.clubMembership.upsert({
      where: { userId_clubId: { userId: student2.id, clubId: club2.id } },
      update: {},
      create: {
        userId: student2.id,
        clubId: club2.id,
        status: "APPROVED",
        joinedAt: new Date("2024-03-10"),
      },
    });

    await prisma.clubMembership.upsert({
      where: { userId_clubId: { userId: student3.id, clubId: club3.id } },
      update: {},
      create: {
        userId: student3.id,
        clubId: club3.id,
        status: "APPROVED",
        joinedAt: new Date("2024-04-05"),
      },
    });

    await prisma.clubMembership.upsert({
      where: { userId_clubId: { userId: student4.id, clubId: club4.id } },
      update: {},
      create: {
        userId: student4.id,
        clubId: club4.id,
        status: "APPROVED",
        joinedAt: new Date("2024-05-12"),
      },
    });

    console.log("✅ Club memberships created");

    // ====================================================
    // 9. CLUB RECRUITMENTS
    // ====================================================
    console.log("📢 Creating club recruitment posts...");

    await prisma.clubRecruitment.upsert({
      where: { id: 1 },
      update: {},
      create: {
        clubId: club1.id,
        title: "Junior Programmer - CPByte",
        description: "Looking for enthusiastic programmers to join our competitive programming team",
        status: "OPEN",
        startDate: new Date(),
        endDate: dateFromNow(30),
        requirements: "Knowledge of basic data structures and algorithms. 2+ months commitment required.",
      },
    });

    await prisma.clubRecruitment.upsert({
      where: { id: 2 },
      update: {},
      create: {
        clubId: club2.id,
        title: "Frontend Developer - Web Dev Club",
        description: "We're looking for talented frontend developers to build modern web applications",
        status: "OPEN",
        startDate: new Date(),
        endDate: dateFromNow(21),
        requirements: "Experience with React/Vue or similar framework. Passion for UI/UX design.",
      },
    });

    await prisma.clubRecruitment.upsert({
      where: { id: 3 },
      update: {},
      create: {
        clubId: club4.id,
        title: "Robotics Engineer - Robotics Club",
        description: "Join our mission to build next-generation robots",
        status: "OPEN",
        startDate: new Date(),
        endDate: dateFromNow(45),
        requirements: "Basic electronics and mechanical knowledge. Self-motivated learners preferred.",
      },
    });

    console.log("✅ Club recruitment posts created");

    // ====================================================
    // 10. EVENTS
    // ====================================================
    console.log("📅 Creating events...");

    const event1 = await prisma.event.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: "Intro to Competitive Programming",
        description: "Kickstart your CP journey with CPByte! Learn fundamentals, best practices, and solve coding challenges.",
        dateTime: new Date("2025-02-15T10:00:00Z"),
        venue: "Main Auditorium, KIET",
        collegeId: college1.id,
        clubId: club1.id,
        createdBy: organizer1.id,
        visibility: "ALL",
        isPaid: false,
      },
    });

    const event2 = await prisma.event.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: "Robotics Workshop",
        description: "Build and program your first robot! Hands-on session with industry experts.",
        dateTime: new Date("2025-03-10T14:00:00Z"),
        venue: "Robotics Lab, ABES",
        collegeId: college2.id,
        clubId: club4.id,
        createdBy: organizer2.id,
        visibility: "ALL",
        isPaid: true,
        price: 50000,
        currency: "INR",
      },
    });

    const event3 = await prisma.event.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: "Web Development Bootcamp",
        description: "8-week intensive bootcamp to master full-stack web development with hands-on projects.",
        dateTime: new Date("2025-02-20T09:00:00Z"),
        venue: "Computer Lab 1, KIET",
        collegeId: college1.id,
        clubId: club2.id,
        createdBy: organizer1b.id,
        visibility: "ALL",
        isPaid: true,
        price: 150000,
        currency: "INR",
      },
    });

    const event4 = await prisma.event.upsert({
      where: { id: 4 },
      update: {},
      create: {
        title: "AI/ML Conference 2025",
        description: "Learn cutting-edge AI and ML techniques from industry leaders and researchers.",
        dateTime: new Date("2025-04-05T10:00:00Z"),
        venue: "Convention Center, DTU",
        collegeId: college3.id,
        clubId: club5.id,
        createdBy: organizer3.id,
        visibility: "SELECTED",
        isPaid: false,
      },
    });

    const event5 = await prisma.event.upsert({
      where: { id: 5 },
      update: {},
      create: {
        title: "Design Hackathon",
        description: "24-hour hackathon focused on UI/UX design. Create amazing designs and win prizes!",
        dateTime: new Date("2025-03-22T08:00:00Z"),
        venue: "Design Studio, KIET",
        collegeId: college1.id,
        clubId: club3.id,
        createdBy: organizer1.id,
        visibility: "ALL",
        isPaid: false,
      },
    });

    const event6 = await prisma.event.upsert({
      where: { id: 6 },
      update: {},
      create: {
        title: "College Annual Tech Fest",
        description: "Grand celebration of technology with competitions, workshops, and exhibitions.",
        dateTime: new Date("2025-03-28T08:00:00Z"),
        venue: "Main Campus, KIET",
        collegeId: college1.id,
        clubId: null,
        createdBy: admin1.id,
        visibility: "ALL",
        isPaid: true,
        price: 20000,
        currency: "INR",
      },
    });

    console.log("✅ Events created");

    // ====================================================
    // 11. EVENT ALLOWED COLLEGES (for SELECTED visibility)
    // ====================================================
    console.log("🔐 Setting event access permissions...");

    await prisma.eventAllowedCollege.upsert({
      where: { eventId_collegeId: { eventId: event4.id, collegeId: college1.id } },
      update: {},
      create: {
        eventId: event4.id,
        collegeId: college1.id,
      },
    });

    await prisma.eventAllowedCollege.upsert({
      where: { eventId_collegeId: { eventId: event4.id, collegeId: college2.id } },
      update: {},
      create: {
        eventId: event4.id,
        collegeId: college2.id,
      },
    });

    console.log("✅ Event permissions set");

    // ====================================================
    // 12. REGISTRATIONS (Free & Paid)
    // ====================================================
    console.log("📝 Creating registrations...");

    await prisma.registration.upsert({
      where: { userId_eventId: { userId: student1.id, eventId: event1.id } },
      update: {},
      create: {
        userId: student1.id,
        eventId: event1.id,
        attended: true,
        paymentStatus: "PAID",
        paidAmount: 0,
        scannedAt: new Date("2025-02-15T10:30:00Z"),
        scannedBy: organizer1.id,
      },
    });

    await prisma.registration.upsert({
      where: { userId_eventId: { userId: student2.id, eventId: event2.id } },
      update: {},
      create: {
        userId: student2.id,
        eventId: event2.id,
        attended: false,
        paymentStatus: "PAID",
        paidAmount: 50000,
        currency: "INR",
        paymentGateway: "RAZORPAY",
        paymentId: "order_1234567890",
        paymentAttemptedAt: new Date(),
        paymentConfirmedAt: new Date(),
      },
    });

    await prisma.registration.upsert({
      where: { userId_eventId: { userId: student1.id, eventId: event3.id } },
      update: {},
      create: {
        userId: student1.id,
        eventId: event3.id,
        attended: false,
        paymentStatus: "PAID",
        paidAmount: 150000,
        currency: "INR",
        paymentGateway: "RAZORPAY",
        paymentId: "order_0987654321",
        paymentAttemptedAt: new Date(),
        paymentConfirmedAt: new Date(),
      },
    });

    await prisma.registration.upsert({
      where: { userId_eventId: { userId: student3.id, eventId: event3.id } },
      update: {},
      create: {
        userId: student3.id,
        eventId: event3.id,
        attended: false,
        paymentStatus: "PENDING",
        paidAmount: 0,
        currency: "INR",
        paymentGateway: "RAZORPAY",
        paymentId: "order_pending_123",
        paymentAttemptedAt: new Date(),
      },
    });

    await prisma.registration.upsert({
      where: { userId_eventId: { userId: student2.id, eventId: event5.id } },
      update: {},
      create: {
        userId: student2.id,
        eventId: event5.id,
        attended: false,
        paymentStatus: "PAID",
        paidAmount: 0,
      },
    });

    await prisma.registration.upsert({
      where: { userId_eventId: { userId: student1.id, eventId: event6.id } },
      update: {},
      create: {
        userId: student1.id,
        eventId: event6.id,
        attended: false,
        paymentStatus: "PAID",
        paidAmount: 20000,
        currency: "INR",
        paymentGateway: "RAZORPAY",
        paymentId: "order_tech_fest_001",
        paymentAttemptedAt: new Date(),
        paymentConfirmedAt: new Date(),
      },
    });

    console.log("✅ Registrations created");

    // ====================================================
    // 13. EMAIL VERIFICATIONS
    // ====================================================
    console.log("📧 Creating email verification tokens...");

    await prisma.emailVerification.upsert({
      where: { id: 1 },
      update: {},
      create: {
        userId: student1.id,
        token: generateToken(),
        expiresAt: dateFromNow(7),
        used: true,
      },
    });

    console.log("✅ Email verifications created");

    // ====================================================
    // 14. REFRESH TOKENS
    // ====================================================
    console.log("🔑 Creating refresh tokens...");

    await prisma.refreshToken.upsert({
      where: { id: 1 },
      update: {},
      create: {
        userId: student1.id,
        token: generateToken(),
        expiresAt: dateFromNow(30),
        revoked: false,
      },
    });

    console.log("✅ Refresh tokens created");

    // ====================================================
    // 15. AUDIT LOGS
    // ====================================================
    console.log("📝 Creating audit logs...");

    await prisma.auditLog.upsert({
      where: { id: 1 },
      update: {},
      create: {
        actorId: admin1.id,
        action: "CREATED_CLUB",
        targetType: "CLUB",
        targetId: club1.id,
        payload: { clubName: "CPByte" },
      },
    });

    await prisma.auditLog.upsert({
      where: { id: 2 },
      update: {},
      create: {
        actorId: organizer1.id,
        action: "CREATED_EVENT",
        targetType: "EVENT",
        targetId: event1.id,
        payload: { eventTitle: "Intro to Competitive Programming" },
      },
    });

    await prisma.auditLog.upsert({
      where: { id: 3 },
      update: {},
      create: {
        actorId: student1.id,
        action: "REGISTERED_EVENT",
        targetType: "REGISTRATION",
        targetId: 1,
        payload: { eventId: event1.id },
      },
    });

    console.log("✅ Audit logs created");

    // ====================================================
    // SUMMARY
    // ====================================================
    console.log("\n========================================");
    console.log("🎉 Seeding completed successfully!");
    console.log("========================================");
    console.log("\n📊 Summary:");
    console.log(`  ✅ 3 colleges created`);
    console.log(`  ✅ 13 users created`);
    console.log(`  ✅ 5 clubs created`);
    console.log(`  ✅ 6 events created`);
    console.log(`  ✅ 6 registrations created`);
    console.log(`  ✅ Club memberships, achievements, recruitments created`);
    console.log(`  ✅ Verification tokens, refresh tokens, and audit logs created`);
    console.log("\n🔐 Test Credentials:");
    console.log("\n  KIET:");
    console.log(`    Admin:      admin@kiet.edu / admin123`);
    console.log(`    Organizer:  organizer@kiet.edu / organizer123`);
    console.log(`    Student:    student1@kiet.edu / student123`);
    console.log("\n  ABES:");
    console.log(`    Admin:      admin@abes.edu / admin123`);
    console.log(`    Organizer:  organizer@abes.edu / organizer123`);
    console.log(`    Student:    student1@abes.edu / student123`);
    console.log("\n  DTU:");
    console.log(`    Admin:      admin@dtu.edu / admin123`);
    console.log(`    Organizer:  organizer@dtu.edu / organizer123`);
    console.log(`    Student:    student1@dtu.edu / student123`);
    console.log("\n========================================\n");

  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    throw error;
  }
}

// Execute
main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✅ Prisma disconnected");
  })
  .catch(async (e) => {
    console.error("❌ Fatal error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

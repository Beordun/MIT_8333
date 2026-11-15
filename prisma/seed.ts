import { PrismaClient, RoleName, Priority, RequestStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Seed Roles
  const roleData = [
    {
      name: RoleName.STUDENT_STAFF,
      description: "University student or staff member who submits and tracks maintenance requests.",
    },
    {
      name: RoleName.MAINTENANCE_OFFICER,
      description: "Facilities technician who inspects, updates, and resolves assigned maintenance jobs.",
    },
    {
      name: RoleName.ADMIN,
      description: "Facilities administrator who triages tickets, assigns officers, manages users, and exports reports.",
    },
  ];

  for (const r of roleData) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
  }

  const studentRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.STUDENT_STAFF } });
  const officerRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.MAINTENANCE_OFFICER } });
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.ADMIN } });

  // 2. Seed Request Categories
  const categories = [
    { name: "Electrical", description: "Power outages, faulty sockets, lighting, and AC electrical faults.", slaHours: 12 },
    { name: "Plumbing", description: "Leaking pipes, blocked drains, taps, and restroom water supply.", slaHours: 12 },
    { name: "ICT / Internet", description: "Campus Wi-Fi, Ethernet ports, projectors, and lab computers.", slaHours: 24 },
    { name: "Furniture", description: "Broken desks, chairs, doors, locks, and hostel beds.", slaHours: 48 },
    { name: "Classroom Equipment", description: "Smartboards, public address systems, fans, and whiteboards.", slaHours: 24 },
    { name: "Hostel Maintenance", description: "General hostel room and common area repairs.", slaHours: 24 },
  ];

  for (const cat of categories) {
    await prisma.requestCategory.upsert({
      where: { name: cat.name },
      update: { description: cat.description, slaHours: cat.slaHours },
      create: cat,
    });
  }

  const electricalCat = await prisma.requestCategory.findUniqueOrThrow({ where: { name: "Electrical" } });
  const plumbingCat = await prisma.requestCategory.findUniqueOrThrow({ where: { name: "Plumbing" } });
  const ictCat = await prisma.requestCategory.findUniqueOrThrow({ where: { name: "ICT / Internet" } });

  // 3. Seed Demo Users (password: "MivaFix2026!")
  const passwordHash = await bcrypt.hash("MivaFix2026!", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@miva.edu.ng" },
    update: { emailVerified: true, failedLoginAttempts: 0, lockedUntil: null },
    create: {
      fullName: "Dr. Amina Bello",
      email: "admin@miva.edu.ng",
      passwordHash,
      department: "Facilities & Works Management",
      emailVerified: true,
      roleId: adminRole.id,
    },
  });

  const officerUser = await prisma.user.upsert({
    where: { email: "officer@miva.edu.ng" },
    update: { emailVerified: true, failedLoginAttempts: 0, lockedUntil: null },
    create: {
      fullName: "Engr. Chinedu Okafor",
      email: "officer@miva.edu.ng",
      passwordHash,
      department: "Electrical & Mechanical Unit",
      emailVerified: true,
      roleId: officerRole.id,
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "student@miva.edu.ng" },
    update: { emailVerified: true, failedLoginAttempts: 0, lockedUntil: null },
    create: {
      fullName: "Toluwani Adeyemi",
      email: "student@miva.edu.ng",
      passwordHash,
      department: "M.Sc. Information Technology",
      emailVerified: true,
      roleId: studentRole.id,
    },
  });

  // 4. Seed Sample Service Requests (idempotent via ticketNumber)
  const existingReq1 = await prisma.serviceRequest.findUnique({ where: { ticketNumber: "MIVA-2026-001" } });
  if (!existingReq1) {
    const req1 = await prisma.serviceRequest.create({
      data: {
        ticketNumber: "MIVA-2026-001",
        title: "Sparking wall socket in Hostel Block B",
        description: "The double wall socket beside the study desk sparks whenever a laptop charger is plugged in.",
        location: "Female Hostel Block B, Room 204",
        priority: Priority.CRITICAL,
        status: RequestStatus.IN_PROGRESS,
        requesterId: studentUser.id,
        categoryId: electricalCat.id,
      },
    });

    await prisma.assignment.create({
      data: {
        requestId: req1.id,
        officerId: officerUser.id,
        assignedById: adminUser.id,
        notes: "Urgent electrical safety check required immediately.",
      },
    });

    await prisma.statusUpdate.createMany({
      data: [
        {
          requestId: req1.id,
          updatedById: studentUser.id,
          oldStatus: null,
          newStatus: RequestStatus.PENDING,
          comment: "Request submitted by student.",
        },
        {
          requestId: req1.id,
          updatedById: adminUser.id,
          oldStatus: RequestStatus.PENDING,
          newStatus: RequestStatus.ASSIGNED,
          comment: "Assigned to Engr. Chinedu Okafor for immediate inspection.",
        },
        {
          requestId: req1.id,
          updatedById: officerUser.id,
          oldStatus: RequestStatus.ASSIGNED,
          newStatus: RequestStatus.IN_PROGRESS,
          comment: "Breaker isolated; replacing burnt 13A socket faceplate.",
        },
      ],
    });
  }

  const existingReq2 = await prisma.serviceRequest.findUnique({ where: { ticketNumber: "MIVA-2026-002" } });
  if (!existingReq2) {
    const req2 = await prisma.serviceRequest.create({
      data: {
        ticketNumber: "MIVA-2026-002",
        title: "Leaking washbasin pipe on 2nd floor",
        description: "Water is dripping continuously under the sink near Lecture Theatre 2.",
        location: "Academic Block A, 2nd Floor Restroom",
        priority: Priority.HIGH,
        status: RequestStatus.PENDING,
        requesterId: studentUser.id,
        categoryId: plumbingCat.id,
      },
    });

    await prisma.statusUpdate.create({
      data: {
        requestId: req2.id,
        updatedById: studentUser.id,
        oldStatus: null,
        newStatus: RequestStatus.PENDING,
        comment: "Request submitted by student.",
      },
    });
  }

  const existingReq3 = await prisma.serviceRequest.findUnique({ where: { ticketNumber: "MIVA-2026-003" } });
  if (!existingReq3) {
    const req3 = await prisma.serviceRequest.create({
      data: {
        ticketNumber: "MIVA-2026-003",
        title: "No Wi-Fi signal in Virtual Lab 1",
        description: "Access point AP-04 has a solid amber light and students cannot connect.",
        location: "ICT Innovation Wing, Virtual Lab 1",
        priority: Priority.MEDIUM,
        status: RequestStatus.RESOLVED,
        requesterId: studentUser.id,
        categoryId: ictCat.id,
      },
    });

    await prisma.assignment.create({
      data: {
        requestId: req3.id,
        officerId: officerUser.id,
        assignedById: adminUser.id,
        notes: "Check PoE switch port and reboot access point.",
      },
    });

    await prisma.statusUpdate.createMany({
      data: [
        {
          requestId: req3.id,
          updatedById: studentUser.id,
          oldStatus: null,
          newStatus: RequestStatus.PENDING,
          comment: "Request submitted by student.",
        },
        {
          requestId: req3.id,
          updatedById: adminUser.id,
          oldStatus: RequestStatus.PENDING,
          newStatus: RequestStatus.ASSIGNED,
          comment: "Assigned to Engr. Chinedu Okafor.",
        },
        {
          requestId: req3.id,
          updatedById: officerUser.id,
          oldStatus: RequestStatus.ASSIGNED,
          newStatus: RequestStatus.RESOLVED,
          comment: "Replaced faulty Cat6 patch cable; Wi-Fi signal restored.",
        },
      ],
    });
  }

  console.log("Seed completed: roles, categories, demo users, and sample requests created.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


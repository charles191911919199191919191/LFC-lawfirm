const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lawfirm.local' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@lawfirm.local',
      password,
      role: 'ADMIN'
    }
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@lawfirm.local' },
    update: {},
    create: {
      name: 'Staff Member',
      email: 'staff@lawfirm.local',
      password,
      role: 'STAFF'
    }
  });

  const lawyer1User = await prisma.user.upsert({
    where: { email: 'lawyer1@lawfirm.local' },
    update: {},
    create: {
      name: 'Lawyer One',
      email: 'lawyer1@lawfirm.local',
      password,
      role: 'LAWYER'
    }
  });

  const lawyer2User = await prisma.user.upsert({
    where: { email: 'lawyer2@lawfirm.local' },
    update: {},
    create: {
      name: 'Lawyer Two',
      email: 'lawyer2@lawfirm.local',
      password,
      role: 'LAWYER'
    }
  });

  const lawyer1 = await prisma.lawyer.upsert({
    where: { userId: lawyer1User.id },
    update: {},
    create: {
      userId: lawyer1User.id,
      phone: '555-0123',
      specialization: 'Family Law',
      active: true
    }
  });

  const lawyer2 = await prisma.lawyer.upsert({
    where: { userId: lawyer2User.id },
    update: {},
    create: {
      userId: lawyer2User.id,
      phone: '555-0456',
      specialization: 'Corporate Law',
      active: true
    }
  });

  const appointments = [
    {
      clientName: 'Arthur Dent',
      contactInfo: 'arthur@example.com',
      date: new Date('2026-05-12'),
      startTime: '09:00',
      endTime: '10:00',
      caseType: 'Regular',
      assignedLawyerId: lawyer1.id,
      notes: 'Review contract terms',
      status: 'Scheduled',
      createdById: staff.id
    },
    {
      clientName: 'Trillian Astra',
      contactInfo: 'trillian@example.com',
      date: new Date('2026-05-12'),
      startTime: '10:30',
      endTime: '11:30',
      caseType: 'Urgent',
      assignedLawyerId: lawyer2.id,
      notes: 'Domestic violence hearing preparation',
      status: 'Scheduled',
      createdById: staff.id
    },
    {
      clientName: 'Ford Prefect',
      contactInfo: 'ford@example.com',
      date: new Date('2026-05-13'),
      startTime: '14:00',
      endTime: '15:00',
      caseType: 'Regular',
      assignedLawyerId: lawyer1.id,
      notes: 'Corporate merger documents',
      status: 'Scheduled',
      createdById: staff.id
    },
    {
      clientName: 'Zaphod Beeblebrox',
      contactInfo: 'zaphod@example.com',
      date: new Date('2026-05-13'),
      startTime: '15:00',
      endTime: '16:00',
      caseType: 'Urgent',
      assignedLawyerId: lawyer2.id,
      notes: 'Emergency injunction review',
      status: 'Scheduled',
      createdById: staff.id
    }
  ];

  await prisma.appointment.createMany({
    data: appointments,
    skipDuplicates: true
  });

  console.log('Seed complete. Sample users: admin@lawfirm.local, staff@lawfirm.local, lawyer1@lawfirm.local, lawyer2@lawfirm.local with password password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

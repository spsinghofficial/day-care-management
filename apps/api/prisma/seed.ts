import { PrismaClient, UserRole, BusinessStatus, DocumentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@daycare-platform.com' },
    update: {},
    create: {
      email: 'admin@daycare-platform.com',
      password: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Created Super Admin:', superAdmin.email);

  // Create Demo Tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Daycare Center',
      subdomain: 'demo',
      email: 'contact@demo-daycare.com',
      phone: '(555) 123-4567',
      address: '123 Kids Street',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      status: BusinessStatus.ACTIVE,
    },
  });

  console.log('✅ Created Demo Tenant:', demoTenant.name);

  // Create Sunshine Daycare Tenant
  const sunshineTenant = await prisma.tenant.upsert({
    where: { subdomain: 'sunshine-daycare' },
    update: {},
    create: {
      name: 'Sunshine Daycare',
      subdomain: 'sunshine-daycare',
      email: 'hello@sunshine-daycare.com',
      phone: '(555) 987-6543',
      address: '456 Sunshine Ave',
      city: 'Brighttown',
      state: 'FL',
      zipCode: '54321',
      status: BusinessStatus.ACTIVE,
    },
  });

  console.log('✅ Created Sunshine Tenant:', sunshineTenant.name);

  // Create Business Admin for Demo
  const adminPassword = await bcrypt.hash('admin123', 10);
  const demoAdmin = await prisma.user.upsert({
    where: { email: 'admin@demo-daycare.com' },
    update: {},
    create: {
      email: 'admin@demo-daycare.com',
      password: adminPassword,
      firstName: 'Demo',
      lastName: 'Administrator',
      role: UserRole.BUSINESS_ADMIN,
      tenantId: demoTenant.id,
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Created Demo Admin:', demoAdmin.email);

  // Create Educator for Demo
  const educatorPassword = await bcrypt.hash('educator123', 10);
  const demoEducator = await prisma.user.upsert({
    where: { email: 'sarah@demo-daycare.com' },
    update: {},
    create: {
      email: 'sarah@demo-daycare.com',
      password: educatorPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.EDUCATOR,
      tenantId: demoTenant.id,
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Created Demo Educator:', demoEducator.email);

  // Create Parent for Demo
  const parentPassword = await bcrypt.hash('parent123', 10);
  const demoParent = await prisma.user.upsert({
    where: { email: 'parent@demo-daycare.com' },
    update: {},
    create: {
      email: 'parent@demo-daycare.com',
      password: parentPassword,
      firstName: 'John',
      lastName: 'Smith',
      phone: '(555) 111-2222',
      role: UserRole.PARENT,
      tenantId: demoTenant.id,
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Created Demo Parent:', demoParent.email);

  // Create Services for Demo Tenant
  const infantService = await prisma.service.create({
    data: {
      name: 'Infant Care',
      description: 'Care for babies 6 weeks to 12 months',
      tenantId: demoTenant.id,
      minAgeMonths: 1,
      maxAgeMonths: 12,
      capacity: 8,
      schedules: {
        create: [
          { dayOfWeek: 1, startTime: '07:00', endTime: '18:00' }, // Monday
          { dayOfWeek: 2, startTime: '07:00', endTime: '18:00' }, // Tuesday
          { dayOfWeek: 3, startTime: '07:00', endTime: '18:00' }, // Wednesday
          { dayOfWeek: 4, startTime: '07:00', endTime: '18:00' }, // Thursday
          { dayOfWeek: 5, startTime: '07:00', endTime: '18:00' }, // Friday
        ],
      },
    },
  });

  const toddlerService = await prisma.service.create({
    data: {
      name: 'Toddler Program',
      description: 'Active learning for children 1-3 years',
      tenantId: demoTenant.id,
      minAgeMonths: 12,
      maxAgeMonths: 36,
      capacity: 12,
      schedules: {
        create: [
          { dayOfWeek: 1, startTime: '07:30', endTime: '17:30' },
          { dayOfWeek: 2, startTime: '07:30', endTime: '17:30' },
          { dayOfWeek: 3, startTime: '07:30', endTime: '17:30' },
          { dayOfWeek: 4, startTime: '07:30', endTime: '17:30' },
          { dayOfWeek: 5, startTime: '07:30', endTime: '17:30' },
        ],
      },
    },
  });

  const preschoolService = await prisma.service.create({
    data: {
      name: 'Preschool',
      description: 'School readiness for children 3-5 years',
      tenantId: demoTenant.id,
      minAgeMonths: 36,
      maxAgeMonths: 60,
      capacity: 15,
      schedules: {
        create: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' },
          { dayOfWeek: 2, startTime: '08:00', endTime: '17:00' },
          { dayOfWeek: 3, startTime: '08:00', endTime: '17:00' },
          { dayOfWeek: 4, startTime: '08:00', endTime: '17:00' },
          { dayOfWeek: 5, startTime: '08:00', endTime: '17:00' },
        ],
      },
    },
  });

  console.log('✅ Created Services:', [infantService.name, toddlerService.name, preschoolService.name]);

  // Assign educator to services
  await prisma.serviceAssignment.createMany({
    data: [
      { educatorId: demoEducator.id, serviceId: infantService.id },
      { educatorId: demoEducator.id, serviceId: toddlerService.id },
    ],
  });

  // Create Document Types for Demo Tenant
  const documentTypes = await prisma.documentType.createMany({
    data: [
      {
        name: 'Immunization Records',
        description: 'Up-to-date vaccination records',
        tenantId: demoTenant.id,
        allowedFormats: JSON.stringify(['pdf', 'jpg', 'png']),
        isRequired: true,
        expiryRequired: true,
      },
      {
        name: 'Birth Certificate',
        description: 'Official birth certificate',
        tenantId: demoTenant.id,
        allowedFormats: JSON.stringify(['pdf', 'jpg', 'png']),
        isRequired: true,
        expiryRequired: false,
      },
      {
        name: 'Emergency Contact Form',
        description: 'Emergency contact information',
        tenantId: demoTenant.id,
        allowedFormats: JSON.stringify(['pdf', 'doc', 'docx']),
        isRequired: true,
        expiryRequired: false,
      },
      {
        name: 'Medical Information',
        description: 'Medical history and allergies',
        tenantId: demoTenant.id,
        allowedFormats: JSON.stringify(['pdf', 'doc', 'docx']),
        isRequired: false,
        expiryRequired: false,
      },
    ],
  });

  console.log('✅ Created Document Types');

  // Create sample child and parent relationship
  const sampleChild = await prisma.child.create({
    data: {
      firstName: 'Emma',
      lastName: 'Smith',
      dateOfBirth: new Date('2022-03-15'),
      tenantId: demoTenant.id,
      notes: 'Loves reading books and playing with blocks',
    },
  });

  await prisma.parentChildRelation.create({
    data: {
      parentId: demoParent.id,
      childId: sampleChild.id,
      relationshipType: 'FATHER',
      isPrimaryContact: true,
    },
  });

  // Enroll child in toddler program
  await prisma.serviceEnrollment.create({
    data: {
      childId: sampleChild.id,
      serviceId: toddlerService.id,
    },
  });

  console.log('✅ Created Sample Child and Enrollment');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log('- Super Admin: admin@daycare-platform.com / admin123');
  console.log('- Demo Admin: admin@demo-daycare.com / admin123');
  console.log('- Demo Educator: sarah@demo-daycare.com / educator123');
  console.log('- Demo Parent: parent@demo-daycare.com / parent123');
  console.log('\n🏢 Tenants:');
  console.log('- Demo Daycare Center (subdomain: demo)');
  console.log('- Sunshine Daycare (subdomain: sunshine-daycare)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
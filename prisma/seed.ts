import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { hash } from 'bcryptjs';
import 'dotenv/config';

// Create a connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the adapter
const adapter = new PrismaPg(pool);

// Create Prisma Client with the adapter
const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // Create admin user with hashed password
  const hashedPassword = await hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@taskflow.com',
      password: hashedPassword,
    },
  });

  // Create demo user with hashed password
  const demoPassword = await hash('demo123', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@taskflow.com',
      password: demoPassword,
    },
  });

  // Create some default roles
  const adminRole = await prisma.role.upsert({
    where: { roleName: 'Admin' },
    update: {},
    create: {
      roleName: 'Admin',
      description: 'Full system access and control',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { roleName: 'Manager' },
    update: {},
    create: {
      roleName: 'Manager',
      description: 'Can manage projects and teams',
    },
  });

  const developerRole = await prisma.role.upsert({
    where: { roleName: 'Developer' },
    update: {},
    create: {
      roleName: 'Developer',
      description: 'Can work on tasks and projects',
    },
  });

  // Assign roles to users
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: demoUser.id,
        roleId: developerRole.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      roleId: developerRole.id,
    },
  });

  console.log('✅ Seed data created successfully');
  console.log('Admin user:', { username: adminUser.username, email: adminUser.email });
  console.log('Demo user:', { username: demoUser.username, email: demoUser.email });
  console.log('Roles:', { adminRole, managerRole, developerRole });
  console.log('\n🔐 Login credentials:');
  console.log('  Admin: username=admin, password=admin123');
  console.log('  Demo:  username=demo, password=demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

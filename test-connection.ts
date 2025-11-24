import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');

    // Test read
    const userCount = await prisma.users.count();
    console.log(`✅ Read test passed. Current user count: ${userCount}`);

    // Test connection info
    console.log('Connection successful!');

  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.count();
    const users = await prisma.user.count();
    const campaigns = await prisma.adCampaign.count();
    
    console.log('--- DATABASE STATUS ---');
    console.log('Products:', products);
    console.log('Users:', users);
    console.log('AdCampaigns:', campaigns);
    console.log('-----------------------');
    
    if (products === 0) {
      console.log('Database is empty. Re-seeding via API...');
    }
  } catch (err) {
    console.error('Database Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

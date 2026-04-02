import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const usersCount = await prisma.user.count();
  const productsCount = await prisma.product.count();
  const campaignsCount = await prisma.adCampaign.count();

  console.log("--- Database Connection Summary ---");
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`);
  console.log(`Users in DB: ${usersCount}`);
  console.log(`Products in DB: ${productsCount}`);
  console.log(`Campaigns in DB: ${campaignsCount}`);
  console.log("------------------------------------");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

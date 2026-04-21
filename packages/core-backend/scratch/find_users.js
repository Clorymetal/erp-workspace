const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUser() {
  const users = await prisma.core_User.findMany();
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

findUser();

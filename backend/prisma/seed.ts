import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Initialize Settings
  const settings = await prisma.settings.findUnique({
    where: { id: 1 },
  });

  if (!settings) {
    await prisma.settings.create({
      data: {
        id: 1,
        isRevealedSecrets: false,
      },
    });
    console.log('Settings initialized');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

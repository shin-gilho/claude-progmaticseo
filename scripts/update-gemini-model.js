const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Updating geminiModel in Settings...');

  const result = await prisma.settings.updateMany({
    where: {
      geminiModel: 'gemini-1.5-pro'
    },
    data: {
      geminiModel: 'gemini-2.5-flash'
    }
  });

  console.log(`Updated ${result.count} records`);

  // 모든 Settings 레코드 조회
  const allSettings = await prisma.settings.findMany();
  console.log('\nCurrent Settings:');
  allSettings.forEach(setting => {
    console.log(`- ID: ${setting.id}, geminiModel: ${setting.geminiModel}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

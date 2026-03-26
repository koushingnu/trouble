const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDates() {
  try {
    console.log('🔄 登録日・退会日をリセットします...\n');

    const result = await prisma.token.updateMany({
      data: {
        registered_at: null,
        cancelled_at: null,
      },
    });

    console.log(`✅ ${result.count}件のトークンをリセットしました`);
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDates();

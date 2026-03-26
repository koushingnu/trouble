const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDates() {
  try {
    // サンプルを5件取得
    const tokens = await prisma.token.findMany({
      take: 5,
      include: {
        user_token: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    console.log('📊 登録日・退会日のサンプル（5件）:\n');
    
    for (const token of tokens) {
      const userEmail = token.user_token?.email || '未割り当て';
      const registeredAt = token.registered_at 
        ? token.registered_at.toISOString().split('T')[0]
        : 'なし';
      const cancelledAt = token.cancelled_at
        ? token.cancelled_at.toISOString().slice(0, 7)
        : 'なし';
      
      console.log(`ユーザー: ${userEmail}`);
      console.log(`ステータス: ${token.status}`);
      console.log(`登録日: ${registeredAt}`);
      console.log(`退会日: ${cancelledAt}\n`);
    }

    // 統計情報
    const stats = await prisma.token.aggregate({
      _count: {
        registered_at: true,
        cancelled_at: true,
      },
    });

    const total = await prisma.token.count();

    console.log('📈 統計情報:');
    console.log(`総トークン数: ${total}件`);
    console.log(`登録日設定済み: ${stats._count.registered_at}件`);
    console.log(`退会日設定済み: ${stats._count.cancelled_at}件`);

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDates();

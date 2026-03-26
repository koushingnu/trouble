const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTestDates() {
  try {
    console.log('📅 テストデータ（登録日・退会日）を追加します...\n');

    // ユーザーが作成されているトークンのみを取得
    const tokens = await prisma.token.findMany({
      where: {
        user_token: {
          isNot: null,
        },
      },
      include: {
        user_token: {
          select: {
            email: true,
          },
        },
      },
    });

    console.log(`📊 対象トークン数（ユーザー作成済み）: ${tokens.length}件\n`);

    let updated = 0;
    let skipped = 0;

    for (const token of tokens) {
      const userEmail = token.user_token?.email || '未割り当て';
      
      // 登録日: 2024年1月～2026年2月のランダムな日付
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2026-02-28');
      const randomRegisteredAt = new Date(
        startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      );

      // 退会日: ステータスがREVOKEDの場合のみ設定（登録日より後）
      let randomCancelledAt = null;
      if (token.status === 'REVOKED') {
        const cancelStartDate = new Date(randomRegisteredAt);
        cancelStartDate.setMonth(cancelStartDate.getMonth() + 1); // 登録日の1ヶ月後から
        const cancelEndDate = new Date('2026-03-31');
        randomCancelledAt = new Date(
          cancelStartDate.getTime() + Math.random() * (cancelEndDate.getTime() - cancelStartDate.getTime())
        );
        // 月末日に設定
        randomCancelledAt = new Date(
          randomCancelledAt.getFullYear(),
          randomCancelledAt.getMonth() + 1,
          0
        );
      }

      await prisma.token.update({
        where: { id: token.id },
        data: {
          registered_at: randomRegisteredAt,
          cancelled_at: randomCancelledAt,
        },
      });

      updated++;
      console.log(
        `✅ 更新: ${userEmail}\n` +
        `   登録日: ${randomRegisteredAt.toISOString().split('T')[0]}\n` +
        `   退会日: ${randomCancelledAt ? randomCancelledAt.toISOString().slice(0, 7) : 'なし'}\n` +
        `   ステータス: ${token.status}\n`
      );
    }

    console.log(`\n✅ 完了: ${updated}件更新, ${skipped}件スキップ`);
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestDates();

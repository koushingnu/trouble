const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateExistingUsers() {
  try {
    console.log('既存ユーザーの更新を開始します...');

    // 自社通番が未設定のユーザーを取得
    const users = await prisma.user.findMany({
      where: {
        company_serial_number: null,
      },
      orderBy: {
        id: 'asc',
      },
    });

    console.log(`${users.length}件のユーザーを更新します`);

    let updated = 0;
    for (const user of users) {
      // 自社通番を生成 (mm0000000形式)
      const serialNumber = `mm${user.id.toString().padStart(7, '0')}`;
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          company_serial_number: serialNumber,
          acquisition_source: 'トラブル解決ラボ',
        },
      });

      updated++;
      if (updated % 100 === 0) {
        console.log(`${updated}件更新完了...`);
      }
    }

    console.log(`\n更新完了: ${updated}件のユーザーを更新しました`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingUsers();

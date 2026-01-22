const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showLatestToken() {
  try {
    // 最新のトークンを1つ取得
    const latestToken = await prisma.token.findFirst({
      orderBy: {
        id: 'desc',
      },
      select: {
        id: true,
        token_value: true,
        status: true,
        created_at: true,
      },
    });
    
    if (latestToken) {
      console.log('✨ 最新のテスト用トークン情報:');
      console.log('');
      console.log(`   ID: ${latestToken.id}`);
      console.log(`   ステータス: ${latestToken.status}`);
      console.log(`   作成日時: ${latestToken.created_at}`);
      console.log('');
      console.log('📋 トークン値（コピーして使用してください）:');
      console.log('');
      console.log(`   ${latestToken.token_value}`);
      console.log('');
    } else {
      console.log('❌ トークンが見つかりませんでした。');
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showLatestToken();

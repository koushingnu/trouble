const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

async function createRevokedUsers() {
  try {
    console.log('📦 退会ユーザー3件を作成します...\n');

    const testUsers = [
      {
        email: 'revoked1@test.com',
        lastName: '退会',
        firstName: '太郎',
        lastNameKana: 'タイカイ',
        firstNameKana: 'タロウ',
        phoneNumber: '09011111111',
        postalCode: '1234567',
        address: '東京都渋谷区テスト1-1-1',
        registeredAt: new Date('2024-06-15'),
        cancelledAt: new Date('2025-12-31'), // 2025-12
      },
      {
        email: 'revoked2@test.com',
        lastName: '解約',
        firstName: '花子',
        lastNameKana: 'カイヤク',
        firstNameKana: 'ハナコ',
        phoneNumber: '09022222222',
        postalCode: '2345678',
        address: '東京都新宿区テスト2-2-2',
        registeredAt: new Date('2024-03-20'),
        cancelledAt: new Date('2026-01-31'), // 2026-01
      },
      {
        email: 'revoked3@test.com',
        lastName: '終了',
        firstName: '次郎',
        lastNameKana: 'シュウリョウ',
        firstNameKana: 'ジロウ',
        phoneNumber: '09033333333',
        postalCode: '3456789',
        address: '東京都港区テスト3-3-3',
        registeredAt: new Date('2024-09-10'),
        cancelledAt: new Date('2025-11-30'), // 2025-11
      },
    ];

    const hashedPassword = await hash('password123', 12);

    for (const userData of testUsers) {
      // トランザクションで作成
      const result = await prisma.$transaction(async (tx) => {
        // トークンを作成
        const token = await tx.token.create({
          data: {
            token_value: uuidv4(),
            status: 'REVOKED',
            registered_at: userData.registeredAt,
            cancelled_at: userData.cancelledAt,
          },
        });

        // ユーザーを作成
        const user = await tx.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            token_id: token.id,
            last_name: userData.lastName,
            first_name: userData.firstName,
            last_name_kana: userData.lastNameKana,
            first_name_kana: userData.firstNameKana,
            phone_number: userData.phoneNumber,
            postal_code: userData.postalCode,
            address: userData.address,
            acquisition_source: 'トラブル解決ラボ',
          },
        });

        // 自社通番を生成して更新
        const serialNumber = `mm${user.id.toString().padStart(7, '0')}`;
        await tx.user.update({
          where: { id: user.id },
          data: {
            company_serial_number: serialNumber,
          },
        });

        // トークンの assigned_to を更新
        await tx.token.update({
          where: { id: token.id },
          data: {
            assigned_to: user.id,
          },
        });

        return { user, token };
      });

      console.log(`✅ 作成: ${userData.email}`);
      console.log(`   自社通番: mm${result.user.id.toString().padStart(7, '0')}`);
      console.log(`   登録日: ${userData.registeredAt.toISOString().split('T')[0]}`);
      console.log(`   退会日: ${userData.cancelledAt.toISOString().slice(0, 7)}`);
      console.log(`   ステータス: REVOKED\n`);
    }

    console.log('✅ 完了: 退会ユーザー3件を作成しました');
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRevokedUsers();

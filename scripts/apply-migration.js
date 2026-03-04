const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('マイグレーションを適用します...');

    // カラムが存在するか確認
    const checkColumn = await prisma.$queryRaw`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'User' 
        AND COLUMN_NAME = 'company_serial_number'
    `;

    if (checkColumn.length > 0) {
      console.log('カラムは既に存在します。');
      return;
    }

    console.log('カラムを追加します...');

    // カラムを追加
    await prisma.$executeRaw`
      ALTER TABLE User 
      ADD COLUMN company_serial_number VARCHAR(10) NULL,
      ADD COLUMN acquisition_source VARCHAR(50) NULL,
      ADD COLUMN last_name_kana VARCHAR(50) NULL,
      ADD COLUMN first_name_kana VARCHAR(50) NULL,
      ADD COLUMN postal_code VARCHAR(7) NULL,
      ADD COLUMN address VARCHAR(255) NULL
    `;

    console.log('カラムを追加しました。');

    // ユニークインデックスを追加
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX User_company_serial_number_key ON User(company_serial_number)
    `;

    console.log('インデックスを追加しました。');
    console.log('マイグレーション完了！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

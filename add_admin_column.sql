-- usersテーブルにis_adminカラムを追加
ALTER TABLE `users` ADD COLUMN `is_admin` BOOLEAN NOT NULL DEFAULT FALSE;

-- 既存の特定のユーザーを管理者に設定（emailを適切なものに変更してください）
UPDATE `users` SET `is_admin` = TRUE WHERE `email` = 'm@m'; 
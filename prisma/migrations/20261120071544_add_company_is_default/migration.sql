-- AlterTable
ALTER TABLE `Company` ADD COLUMN `is_default` BOOLEAN NOT NULL DEFAULT false;

-- 自社（直販）の既定行。トークンには紐付けない（卸先未設定 = company_id NULL のまま）。
-- 解約URLは従来コードに固定で書かれていた月額PAYのURL。
INSERT INTO `Company` (`code`, `name`, `cancellation_url`, `is_default`)
SELECT 'direct', '自社（直販）', 'https://neoglyph.co.jp/mypage/login.php', true
WHERE NOT EXISTS (SELECT 1 FROM `Company` WHERE `is_default` = true);

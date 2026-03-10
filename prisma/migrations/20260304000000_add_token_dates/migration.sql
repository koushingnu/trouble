-- AlterTable
ALTER TABLE `Token` ADD COLUMN `registered_at` DATETIME(3) NULL,
                    ADD COLUMN `cancelled_at` DATETIME(3) NULL;

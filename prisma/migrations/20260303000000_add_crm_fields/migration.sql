-- AlterTable
ALTER TABLE `User` ADD COLUMN `company_serial_number` VARCHAR(10) NULL,
    ADD COLUMN `acquisition_source` VARCHAR(50) NULL,
    ADD COLUMN `last_name_kana` VARCHAR(50) NULL,
    ADD COLUMN `first_name_kana` VARCHAR(50) NULL,
    ADD COLUMN `postal_code` VARCHAR(7) NULL,
    ADD COLUMN `address` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_company_serial_number_key` ON `User`(`company_serial_number`);

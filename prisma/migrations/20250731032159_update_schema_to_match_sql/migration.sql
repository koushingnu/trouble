/*
  Warnings:

  - You are about to alter the column `status` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE `Token` MODIFY `status` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `is_admin` BOOLEAN NOT NULL DEFAULT false;

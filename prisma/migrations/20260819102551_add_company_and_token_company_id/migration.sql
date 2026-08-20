-- AlterTable
ALTER TABLE `Token` ADD COLUMN `company_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `cancellation_url` VARCHAR(500) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Company_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Token_company_id_fkey` ON `Token`(`company_id`);

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `ChatRoom` RENAME INDEX `ChatRoom_user_status_idx` TO `ChatRoom_user_id_status_idx`;

-- RenameIndex
ALTER TABLE `Message` RENAME INDEX `Message_room_created_idx` TO `Message_chat_room_id_created_at_idx`;

-- CreateIndex
CREATE INDEX `ChatRoom_created_at_idx` ON `ChatRoom`(`created_at`);

-- CreateIndex
CREATE INDEX `ChatRoom_status_idx` ON `ChatRoom`(`status`);

-- CreateIndex
CREATE INDEX `ChatRoom_user_status_idx` ON `ChatRoom`(`user_id`, `status`);

-- CreateIndex
CREATE INDEX `Message_created_at_idx` ON `Message`(`created_at`);

-- CreateIndex
CREATE INDEX `Message_room_created_idx` ON `Message`(`chat_room_id`, `created_at`);


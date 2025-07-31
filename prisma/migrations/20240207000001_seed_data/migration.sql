-- Insert tokens first
INSERT INTO `tokens` (`id`, `token_value`, `status`, `created_at`) VALUES
(1, 'e3f339ec-2a27-4178-b191-740643ddf8bc', 'active', '2025-07-09 16:09:53'),
(2, '58d6217b-b95f-40a3-9c68-17d9536cb57d', 'active', '2025-07-09 16:10:22'),
(3, 'a69a0011-6329-460d-93d6-508108a839be', 'active', '2025-07-09 16:10:22'),
(22, 'f1397faf-7b92-444f-9e74-6a9bcbe8fef3', 'active', '2025-07-09 16:10:22'),
(112, '589ed72c-9673-42d1-8ded-3c9cd6236664', 'active', '2025-07-09 17:20:03');

-- Insert users
INSERT INTO `users` (`id`, `email`, `password`, `token_id`, `created_at`, `is_admin`) VALUES
(2, 'jiysub@hosaduy.com', '$2y$10$lTKCZScB7vmjtHcVFjxDwO8nuSx7TNFwqrGjdNKwBPuYuU2uXmA6u', NULL, '2025-07-09 14:00:37', 0),
(3, 'koushin1022mrs@icloud.com', '$2y$10$XKaKQyuO1grw/6otjGYrgO03oQ4zYoeZvnuY1TN9BmvGI4tO2pyL2', 1, '2025-07-09 16:44:39', 0),
(4, 'koushin1022apple@gmail.com', '$2b$10$wvyzlnx0p9hlgQp2k1MiAOm4KIsanS3FHFkwcQRLAXY/yNXf0a5vq', 2, '2025-07-09 17:25:29', 0),
(5, 'm@m', '$2b$10$dzvpuXI2xkJLa/kbUAZK5.8nZhG11dWK76qXvdOXRWLYIaulN068i', 3, '2025-07-09 19:05:30', 1),
(6, 'koushin@iaia.com', '$2y$10$a60JpBIkGMR.SdQlZxpAwuifLe0ev2i17qTeKZDNzYF/Swnk6cjVS', 22, '2025-07-10 11:50:40', 0),
(7, 'k@k', '$2y$10$.csEPR4fdRk5cCRRp3s6BekmCo6r8elOAUbZjmDxgN7zQpfnbyaAO', 112, '2025-07-28 17:13:33', 0);

-- Update tokens with assigned_to
UPDATE `tokens` SET `assigned_to` = 3 WHERE `id` = 1;
UPDATE `tokens` SET `assigned_to` = 4 WHERE `id` = 2;
UPDATE `tokens` SET `assigned_to` = 5 WHERE `id` = 3;
UPDATE `tokens` SET `assigned_to` = 6 WHERE `id` = 22;
UPDATE `tokens` SET `assigned_to` = 7 WHERE `id` = 112; 
-- ユーザーデータの移行（is_adminカラムを追加）
INSERT INTO User (id, email, password, token_id, created_at, is_admin) 
VALUES 
(1, 'kou@test.com', '$2a$10$lTKCZScB7vmjtHcVFjxDwO8nuSx7TNFwqrGjdNKwBPuYuU2uXmA6u', NULL, '2025-07-09 13:53:16', true),
(2, 'jiysub@hosaduy.com', '$2a$10$lTKCZScB7vmjtHcVFjxDwO8nuSx7TNFwqrGjdNKwBPuYuU2uXmA6u', NULL, '2025-07-09 14:00:37', false);

-- アクセスログの移行
INSERT INTO AccessLog (id, user_id, event, created_at)
VALUES (1, 2, 'user_created', '2025-07-09 14:00:37');
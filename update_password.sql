-- パスワードをハッシュ化
UPDATE users 
SET password = '$2y$10$lTKCZScB7vmjtHcVFjxDwO8nuSx7TNFwqrGjdNKwBPuYuU2uXmA6u'
WHERE email = 'kou@test.com'; 
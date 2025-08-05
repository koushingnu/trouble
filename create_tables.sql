-- データベース作成（存在しない場合）
CREATE DATABASE IF NOT EXISTS trouble;
USE trouble;

-- 既存のテーブルを削除（必要な場合）
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chat_rooms;
DROP TABLE IF EXISTS access_logs;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS users;

-- Userテーブル
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(191) NOT NULL,
  token_id INT UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  password VARCHAR(191) NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id),
  UNIQUE INDEX email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tokenテーブル
CREATE TABLE tokens (
  id INT NOT NULL AUTO_INCREMENT,
  status VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_to INT,
  token_value VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX token_value_unique (token_value),
  INDEX Token_assigned_to_fkey (assigned_to),
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User-Token外部キー制約を追加
ALTER TABLE users
ADD CONSTRAINT users_token_id_fkey
FOREIGN KEY (token_id) REFERENCES tokens(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- AccessLogテーブル
CREATE TABLE access_logs (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  event VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX AccessLog_user_id_fkey (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ChatRoomテーブル
CREATE TABLE chat_rooms (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX ChatRoom_user_id_fkey (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messageテーブル
CREATE TABLE messages (
  id INT NOT NULL AUTO_INCREMENT,
  chat_room_id INT NOT NULL,
  sender VARCHAR(50) NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX Message_chat_room_id_fkey (chat_room_id),
  FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
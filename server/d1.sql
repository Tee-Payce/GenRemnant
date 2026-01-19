-- ===========================
-- Users table
-- ===========================

CREATE TABLE IF NOT EXISTS Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Users (id, username, email, password, createdAt) VALUES
(1, 'tkpat', 'tkpat3@gmail.com', '$2b$10$8IhX5x259ynekwxNeXR7z.4.u5Q6PSNnDIHQTj6Oyz/5YnE5G1lGG', '2025-11-13T07:47:46.000Z'),
(2, 'siziba', 'sizibapa3@gmail.com', '$2b$10$FyG9qHLVDmUD2O79k2pC6uZ4efbkXi1yHXqd.O5FSPiFBy0Ui5xcy', '2025-11-13T08:08:54.000Z');


-- ===========================
-- Posts table
-- ===========================

CREATE TABLE IF NOT EXISTS Posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  userId INTEGER NOT NULL
);

INSERT INTO Posts (id, title, content, createdAt, userId) VALUES
(1, 'Power of Consistency', 'Consistency is key to success in any journey...', '2025-11-13T08:09:38.000Z', 2);


-- ===========================
-- Comments table
-- ===========================

CREATE TABLE IF NOT EXISTS Comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  userId INTEGER NOT NULL,
  postId INTEGER NOT NULL
);

INSERT INTO Comments (id, text, createdAt, userId, postId) VALUES
(1, 'Well said', '2025-11-13T08:10:11.000Z', 2, 1),
(2, 'Great message', '2025-11-13T08:10:31.000Z', 1, 1),
(3, 'I love this insight', '2025-11-13T08:10:49.000Z', 2, 1);


-- ===========================
-- Reactions table
-- ===========================

CREATE TABLE IF NOT EXISTS Reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  userId INTEGER NOT NULL,
  postId INTEGER NOT NULL
);

INSERT INTO Reactions (id, type, createdAt, userId, postId) VALUES
(1, 'like', '2025-11-13T08:09:57.000Z', 1, 1),
(2, 'love', '2025-11-13T08:10:03.000Z', 2, 1);


-- ===========================
-- Unique index
-- ===========================

CREATE UNIQUE INDEX IF NOT EXISTS unique_post_user_reaction
ON Reactions (userId, postId);

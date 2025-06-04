-- Drop tables (order matters for FKs if not dropping all)
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS recipes;

-- Create photos Table
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY DEFAULT ('photo_' || substr(lower(hex(randomblob(13))), 1, 26)),
  creatorId TEXT NOT NULL,
  filename TEXT NOT NULL,
  imageId TEXT,
  contentType TEXT NOT NULL,
  size INTEGER NOT NULL,
  metadata TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP DEFAULT NULL
);

-- Create recipes Table
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  preparationTime TEXT NOT NULL,
  complexity TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  instructions TEXT NOT NULL,
  image TEXT,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);


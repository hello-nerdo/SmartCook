-- Drop tables (order matters for FKs if not dropping all)
DROP TABLE IF EXISTS photos;

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
  deletedAt TIMESTAMP DEFAULT NULL,
  FOREIGN KEY (logId) REFERENCES logs(id) ON DELETE CASCADE,
  FOREIGN KEY (teamId) REFERENCES teams(id)
);
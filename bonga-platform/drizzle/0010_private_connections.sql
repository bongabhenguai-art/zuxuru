CREATE TABLE IF NOT EXISTS private_connections (
  object_key TEXT PRIMARY KEY NOT NULL,
  envelope TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS jarvis_cloud_reports (id TEXT PRIMARY KEY NOT NULL,owner_email TEXT NOT NULL,report TEXT NOT NULL,run_id TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS jarvis_cloud_reports_owner ON jarvis_cloud_reports(owner_email,created_at);

CREATE TABLE `studio_jobs` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`payload` text NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_studio_job_user` ON `studio_jobs` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_studio_job_identity` ON `studio_jobs` (`user_id`,`id`);
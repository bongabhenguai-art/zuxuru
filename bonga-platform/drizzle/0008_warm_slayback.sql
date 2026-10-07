CREATE TABLE `system_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`report` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_system_run_user_date` ON `system_runs` (`user_id`,`created_at`);
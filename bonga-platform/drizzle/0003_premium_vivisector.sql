CREATE TABLE `designer_media` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`object_key` text NOT NULL,
	`name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `designer_media_object_key_unique` ON `designer_media` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_media_user_date` ON `designer_media` (`user_id`,`created_at`);
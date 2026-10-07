CREATE TABLE `business_book` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`payload` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_book_user_updated` ON `business_book` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `studio_rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tokens` text NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_studio_owner` ON `studio_rooms` (`user_id`);--> statement-breakpoint
CREATE TABLE `studio_signals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` text NOT NULL,
	`slot` integer NOT NULL,
	`sender` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_signal_room_sender_id` ON `studio_signals` (`room_id`,`sender`,`id`);
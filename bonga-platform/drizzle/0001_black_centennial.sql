CREATE TABLE `designer_enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL,
	`sender_hash` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_enquiry_user_date` ON `designer_enquiries` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_enquiry_sender_date` ON `designer_enquiries` (`sender_hash`,`created_at`);--> statement-breakpoint
CREATE TABLE `designer_storefronts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`public_data` text NOT NULL,
	`published_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `designer_storefronts_slug_unique` ON `designer_storefronts` (`slug`);
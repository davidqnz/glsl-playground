CREATE TABLE `programs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`title` text DEFAULT '' NOT NULL,
	`vertex_source` text DEFAULT '' NOT NULL,
	`fragment_source` text DEFAULT '' NOT NULL,
	`did_compile` integer,
	`created_at` integer,
	`modified_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
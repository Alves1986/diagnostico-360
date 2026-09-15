CREATE TABLE `appSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`whatsappNumber` varchar(32) NOT NULL DEFAULT '',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`company` varchar(200) NOT NULL,
	`segment` varchar(160),
	`role` varchar(120),
	`whatsapp` varchar(40) NOT NULL,
	`email` varchar(320),
	`objective` text,
	`challenge` text,
	`maturity` int,
	`level` varchar(40),
	`temperature` varchar(40),
	`priority` varchar(40),
	`recommendation` varchar(200),
	`answersJson` text NOT NULL,
	`diagnosisJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

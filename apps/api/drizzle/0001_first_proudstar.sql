CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`txnid` varchar(50) NOT NULL,
	`amount` varchar(12) NOT NULL,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`mihpayid` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_txnid_unique` UNIQUE(`txnid`)
);
--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;
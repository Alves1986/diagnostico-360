CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "appSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"whatsappNumber" varchar(32) DEFAULT '' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"company" varchar(200) NOT NULL,
	"segment" varchar(160),
	"role" varchar(120),
	"whatsapp" varchar(40) NOT NULL,
	"email" varchar(320),
	"objective" text,
	"challenge" text,
	"maturity" integer,
	"level" varchar(40),
	"temperature" varchar(40),
	"priority" varchar(40),
	"recommendation" varchar(200),
	"answersJson" text NOT NULL,
	"diagnosisJson" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);

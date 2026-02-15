ALTER TABLE "avsDocument" ADD COLUMN "fileKey" text;--> statement-breakpoint
ALTER TABLE "avsDocument" ADD COLUMN "validFrom" date;--> statement-breakpoint
ALTER TABLE "avsDocument" ADD COLUMN "validUntil" date;--> statement-breakpoint
ALTER TABLE "avsDocument" ADD COLUMN "validityStatus" text;
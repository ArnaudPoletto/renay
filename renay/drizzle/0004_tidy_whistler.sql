CREATE TABLE "avsDocument" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subcontractorId" uuid NOT NULL,
	"isCurrent" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "avsDocument" ADD CONSTRAINT "avsDocument_subcontractorId_subcontractor_id_fk" FOREIGN KEY ("subcontractorId") REFERENCES "public"."subcontractor"("id") ON DELETE cascade ON UPDATE no action;
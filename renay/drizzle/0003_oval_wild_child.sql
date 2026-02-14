CREATE TABLE "subcontractor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subcontractorProject" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subcontractorId" uuid NOT NULL,
	"projectId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "subcontractorProject" ADD CONSTRAINT "subcontractorProject_subcontractorId_subcontractor_id_fk" FOREIGN KEY ("subcontractorId") REFERENCES "public"."subcontractor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcontractorProject" ADD CONSTRAINT "subcontractorProject_projectId_project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
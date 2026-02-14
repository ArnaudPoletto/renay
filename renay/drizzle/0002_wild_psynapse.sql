CREATE TABLE "projectAccess" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projectAccess" ADD CONSTRAINT "projectAccess_projectId_project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectAccess" ADD CONSTRAINT "projectAccess_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
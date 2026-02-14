import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { project, projectAccess } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CreateProjectDialog } from "@/app/dashboard/projects/create-project-dialog";
import { Button } from "@/components/ui/button";
import { ProjectsTable } from "./projects-table";

export default async function ProjectsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  const projects = await db
    .select({ id: project.id, name: project.name, createdAt: project.createdAt })
    .from(projectAccess)
    .innerJoin(project, eq(projectAccess.projectId, project.id))
    .where(eq(projectAccess.userId, session.user.id));

  return (
    <>
      <header className="h-14 border-b bg-background flex items-center justify-between px-4 md:px-6 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" /> Dashboard
        </Link>
        <CreateProjectDialog>
          <Button size="sm" className="cursor-pointer">
            <Plus className="size-4 mr-1.5" /> New Project
          </Button>
        </CreateProjectDialog>
      </header>

      <main className="flex-1 px-4 md:px-6 py-6">
        <ProjectsTable projects={projects} />
      </main>
    </>
  );
}

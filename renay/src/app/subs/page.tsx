import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subcontractor, projectAccess, project, subcontractorProject } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { CreateSubDialog } from "./create-sub-dialog";
import { SubsTable } from "./subs-table";

export default async function SubsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  const [subsRaw, projects] = await Promise.all([
    db
      .select({
        id: subcontractor.id,
        name: subcontractor.name,
        createdAt: subcontractor.createdAt,
        projectName: project.name,
      })
      .from(subcontractor)
      .leftJoin(subcontractorProject, eq(subcontractorProject.subcontractorId, subcontractor.id))
      .leftJoin(project, eq(project.id, subcontractorProject.projectId)),
    db
      .select({ id: project.id, name: project.name })
      .from(projectAccess)
      .innerJoin(project, eq(projectAccess.projectId, project.id))
      .where(eq(projectAccess.userId, session.user.id)),
  ]);

  // Group project names per sub
  const subsMap = new Map<string, { id: string; name: string; createdAt: Date; projects: string[] }>();
  for (const r of subsRaw) {
    if (!subsMap.has(r.id)) {
      subsMap.set(r.id, { id: r.id, name: r.name, createdAt: r.createdAt, projects: [] });
    }
    if (r.projectName) subsMap.get(r.id)!.projects.push(r.projectName);
  }
  const subs = Array.from(subsMap.values());

  return (
    <>
      <header className="h-14 border-b bg-background flex items-center justify-between px-4 md:px-6 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" /> Dashboard
        </Link>
        <CreateSubDialog projects={projects}>
          <Button size="sm" className="cursor-pointer">
            <Plus className="size-4 mr-1.5" /> New Sub
          </Button>
        </CreateSubDialog>
      </header>

      <main className="flex-1 px-4 md:px-6 py-6">
        <SubsTable subs={subs} />
      </main>
    </>
  );
}

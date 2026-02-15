import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FolderOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { project, projectAccess, subcontractor, subcontractorProject } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { SubsSection } from "./subs-section";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
  if (!isUuid) notFound();

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  const [[row], assignedSubs, allSubs] = await Promise.all([
    db
      .select({ id: project.id, name: project.name })
      .from(project)
      .innerJoin(projectAccess, eq(projectAccess.projectId, project.id))
      .where(
        and(
          eq(project.id, projectId),
          eq(projectAccess.userId, session.user.id)
        )
      )
      .limit(1),
    db
      .select({ id: subcontractor.id, name: subcontractor.name })
      .from(subcontractorProject)
      .innerJoin(subcontractor, eq(subcontractor.id, subcontractorProject.subcontractorId))
      .where(eq(subcontractorProject.projectId, projectId)),
    db
      .select({ id: subcontractor.id, name: subcontractor.name })
      .from(subcontractor),
  ]);

  if (!row) notFound();

  const assignedIds = new Set(assignedSubs.map((s) => s.id));
  const availableSubs = allSubs.filter((s) => !assignedIds.has(s.id));

  return (
    <>
      <header className="h-14 border-b bg-background flex items-center px-4 md:px-6 shrink-0">
        <Link
          href="/projects"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" /> Projects
        </Link>
      </header>

      <main className="flex-1 px-4 md:px-6 py-6 flex flex-col gap-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <FolderOpen className="size-5" /> {row.name}
        </h1>

        <SubsSection
          projectId={projectId}
          assigned={assignedSubs}
          available={availableSubs}
        />
      </main>
    </>
  );
}

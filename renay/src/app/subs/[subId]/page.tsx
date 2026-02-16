import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subcontractor, subcontractorProject, project, avsDocument } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { AvsDocumentSection } from "./avs-document-section";
import { ProjectsSection } from "./projects-section";

export default async function SubPage({
  params,
}: {
  params: Promise<{ subId: string }>;
}) {
  const { subId } = await params;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subId);
  if (!isUuid) notFound();

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  const [[row], assignedProjects, allProjects, avsDocs] = await Promise.all([
    db
      .select({ id: subcontractor.id, name: subcontractor.name })
      .from(subcontractor)
      .where(eq(subcontractor.id, subId))
      .limit(1),
    db
      .select({ id: project.id, name: project.name })
      .from(subcontractorProject)
      .innerJoin(project, eq(project.id, subcontractorProject.projectId))
      .where(eq(subcontractorProject.subcontractorId, subId)),
    db
      .select({ id: project.id, name: project.name })
      .from(project),
    db
      .select({ id: avsDocument.id, fileKey: avsDocument.fileKey, description: avsDocument.description, validFrom: avsDocument.validFrom, validUntil: avsDocument.validUntil, validityStatus: avsDocument.validityStatus, archivedAt: avsDocument.archivedAt, createdAt: avsDocument.createdAt })
      .from(avsDocument)
      .where(eq(avsDocument.subcontractorId, subId))
      .orderBy(desc(avsDocument.validUntil), desc(avsDocument.createdAt)),
  ]);

  const assignedIds = new Set(assignedProjects.map((p) => p.id));
  const availableProjects = allProjects.filter((p) => !assignedIds.has(p.id));

  if (!row) notFound();

  return (
    <>
      <header className="h-14 border-b bg-background flex items-center px-4 md:px-6 shrink-0">
        <Link
          href="/subs"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" /> Subcontractors
        </Link>
      </header>

      <main className="flex-1 px-4 md:px-6 py-6 flex flex-col gap-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Users className="size-5" /> {row.name}
        </h1>

        <AvsDocumentSection subId={subId} docs={avsDocs} />

        <ProjectsSection
          subId={subId}
          assigned={assignedProjects}
          available={availableProjects}
        />
      </main>
    </>
  );
}

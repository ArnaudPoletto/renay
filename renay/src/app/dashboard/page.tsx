import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projectAccess, project, subcontractor, avsDocument, subcontractorProject } from "@/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { EmptyState } from "./projects/empty-state";
import { ProjectsView } from "./projects/projects-view";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  const [projects, subs, alertDocs, subsWithAnyDoc, projectSubs, validAvsSubs] = await Promise.all([
    db
      .select({ id: project.id, name: project.name })
      .from(projectAccess)
      .innerJoin(project, eq(projectAccess.projectId, project.id))
      .where(eq(projectAccess.userId, session.user.id)),
    db.select({ id: subcontractor.id, name: subcontractor.name }).from(subcontractor),
    db
      .select({
        subcontractorId: avsDocument.subcontractorId,
        validityStatus: avsDocument.validityStatus,
        validUntil: avsDocument.validUntil,
      })
      .from(avsDocument)
      .where(and(inArray(avsDocument.validityStatus, ["expired", "expiring_soon"]), isNull(avsDocument.archivedAt))),
    db
      .selectDistinct({ subcontractorId: avsDocument.subcontractorId })
      .from(avsDocument)
      .where(isNull(avsDocument.archivedAt)),
    db
      .select({ projectId: subcontractorProject.projectId, subcontractorId: subcontractorProject.subcontractorId })
      .from(subcontractorProject),
    db
      .selectDistinct({ subcontractorId: avsDocument.subcontractorId })
      .from(avsDocument)
      .where(and(eq(avsDocument.validityStatus, "valid"), isNull(avsDocument.archivedAt))),
  ]);

  if (projects.length === 0) return <EmptyState />;

  const validSubIds = new Set(validAvsSubs.map((r) => r.subcontractorId));
  const projectsWithCompliance = projects.map((p) => {
    const projectSubIds = projectSubs.filter((ps) => ps.projectId === p.id).map((ps) => ps.subcontractorId);
    const total = projectSubIds.length;
    const compliant = projectSubIds.filter((id) => validSubIds.has(id)).length;
    return { ...p, totalSubs: total, compliantSubs: compliant };
  });

  const subsWithDocIds = new Set(subsWithAnyDoc.map((r) => r.subcontractorId));
  const subsWithAlertDocIds = new Set(alertDocs.map((r) => r.subcontractorId));

  // Build alerts: expired/expiring_soon docs, then missing docs
  const alerts: { type: "expired" | "expiring_soon" | "missing"; subId: string; subName: string; validUntil: string | null }[] = [];

  for (const sub of subs) {
    const docs = alertDocs.filter((d) => d.subcontractorId === sub.id);
    for (const doc of docs) {
      alerts.push({
        type: doc.validityStatus as "expired" | "expiring_soon",
        subId: sub.id,
        subName: sub.name,
        validUntil: doc.validUntil,
      });
    }
    if (!subsWithDocIds.has(sub.id)) {
      alerts.push({ type: "missing", subId: sub.id, subName: sub.name, validUntil: null });
    }
  }

  return <ProjectsView projects={projectsWithCompliance} subs={subs} alerts={alerts} />;
}

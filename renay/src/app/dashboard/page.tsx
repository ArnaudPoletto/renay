import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projectAccess, project, subcontractor } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EmptyState } from "./projects/empty-state";
import { ProjectsView } from "./projects/projects-view";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  const [projects, subs] = await Promise.all([
    db
      .select({ id: project.id, name: project.name })
      .from(projectAccess)
      .innerJoin(project, eq(projectAccess.projectId, project.id))
      .where(eq(projectAccess.userId, session.user.id)),
    db.select({ id: subcontractor.id, name: subcontractor.name }).from(subcontractor),
  ]);

  if (projects.length === 0) return <EmptyState />;

  return <ProjectsView projects={projects} subs={subs} />;
}

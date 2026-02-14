import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subcontractor, subcontractorProject, project } from "@/db/schema";
import { eq } from "drizzle-orm";

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

  const [[row], projects] = await Promise.all([
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
  ]);

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
        <h1 className="text-xl font-semibold">{row.name}</h1>

        <section className="rounded-xl border bg-background">
          <div className="px-4 md:px-5 py-3 md:py-4 border-b">
            <h2 className="font-semibold text-sm">Projects</h2>
          </div>
          {projects.length > 0 ? (
            <ul className="divide-y">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="flex items-center px-4 md:px-5 py-3 md:py-3.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 md:px-5 py-6 text-sm text-muted-foreground text-center">
              Not assigned to any projects
            </p>
          )}
        </section>
      </main>
    </>
  );
}

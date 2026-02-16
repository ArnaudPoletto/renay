import { project, subcontractor } from "@/db/schema";
import { ProjectsStats } from "./stats";
import { ProjectsList } from "./projects-list";
import { SubsList } from "../subs/subs-list";
import { AlertsList } from "../alerts/alerts-list";

type Project = Pick<typeof project.$inferSelect, "id" | "name"> & { totalSubs: number; compliantSubs: number };
type Sub = Pick<typeof subcontractor.$inferSelect, "id" | "name">;
type Alert = { type: "expired" | "expiring_soon" | "missing"; subId: string; subName: string; validUntil: string | null };

export function ProjectsView({ projects, subs, alerts }: { projects: Project[]; subs: Sub[]; alerts: Alert[] }) {
  return (
    <>
      {/* Top bar */}
      <header className="h-14 border-b bg-background flex items-center px-4 md:px-6 shrink-0">
        <h1 className="font-semibold text-sm text-muted-foreground">Overview</h1>
      </header>

      <main className="flex-1 px-4 md:px-6 py-4 md:py-6 flex flex-col gap-4 md:gap-6 pb-20 md:pb-6">
        <ProjectsStats projectCount={projects.length} subcontractorCount={subs.length} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
          <div className="lg:col-span-2">
            <ProjectsList projects={projects} />
          </div>
          <AlertsList alerts={alerts} />
        </div>
        <SubsList subs={subs} />
      </main>
    </>
  );
}

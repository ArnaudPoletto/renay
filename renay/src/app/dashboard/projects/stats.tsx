import { FolderOpen, Users } from "lucide-react";

export function ProjectsStats({ projectCount, subcontractorCount }: { projectCount: number; subcontractorCount: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <div className="rounded-xl border bg-background p-3 md:p-4 flex items-center gap-3 md:gap-4">
        <div className="rounded-lg bg-muted p-2 md:p-2.5 shrink-0">
          <FolderOpen className="size-4 md:size-5 text-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-xl md:text-2xl font-bold leading-none">{projectCount}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-tight">Active Projects</p>
        </div>
      </div>
      <div className="rounded-xl border bg-background p-3 md:p-4 flex items-center gap-3 md:gap-4">
        <div className="rounded-lg bg-muted p-2 md:p-2.5 shrink-0">
          <Users className="size-4 md:size-5 text-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-xl md:text-2xl font-bold leading-none">{subcontractorCount}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-tight">Total Subs</p>
        </div>
      </div>
    </div>
  );
}

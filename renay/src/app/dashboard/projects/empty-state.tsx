import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "./create-project-dialog";

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center pb-20 md:pb-0">
      <div className="rounded-full bg-muted p-4">
        <FolderPlus className="size-8 text-muted-foreground" />
      </div>
      <div>
        <h2 className="font-semibold text-lg">No projects yet</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Create your first project to start tracking subcontractor compliance.
        </p>
      </div>
      <CreateProjectDialog>
        <Button className="cursor-pointer">
          <FolderPlus className="size-4 mr-2" /> Start First Project
        </Button>
      </CreateProjectDialog>
    </div>
  );
}

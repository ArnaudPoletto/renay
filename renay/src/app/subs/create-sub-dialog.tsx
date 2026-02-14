"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSub } from "./actions";

type Project = { id: string; name: string };

export function CreateSubDialog({ children, projects }: { children: React.ReactNode; projects: Project[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function toggleProject(id: string) {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await createSub(name.trim(), selectedProjects);
      setName("");
      setSelectedProjects([]);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New subcontractor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sub-name">Company name</Label>
            <Input
              id="sub-name"
              placeholder="e.g. Alpine Electrical GmbH"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {projects.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Assign to projects <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto rounded-md border p-2">
                {projects.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(p.id)}
                      onChange={() => toggleProject(p.id)}
                      className="accent-primary"
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" disabled={isPending || !name.trim()} className="cursor-pointer">
            {isPending ? "Creating…" : (
              <><UserPlus className="size-4 mr-2" /> Add subcontractor</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

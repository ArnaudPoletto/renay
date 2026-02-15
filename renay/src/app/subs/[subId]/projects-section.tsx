"use client";

import { useMemo, useState, useTransition } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { assignSubToProject, unassignSubFromProject } from "../sub-actions";

type Project = { id: string; name: string };

export function ProjectsSection({
  subId,
  assigned,
  available,
}: {
  subId: string;
  assigned: Project[];
  available: Project[];
}) {
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const fuse = useMemo(() => new Fuse(available, { keys: ["name"], threshold: 0.4 }), [available]);
  const filteredProjects = projectSearch.trim() ? fuse.search(projectSearch).map((r) => r.item) : available;

  function toggleProject(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    if (selected.length === 0) return;
    startTransition(async () => {
      await Promise.all(selected.map((projectId) => assignSubToProject(subId, projectId)));
    });
    setSelected([]);
    setOpen(false);
  }

  return (
    <section className="rounded-xl border bg-background">
      <div className="px-4 md:px-5 py-3 md:py-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm">Projects</h2>
        {available.length > 0 && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSelected([]); setProjectSearch(""); } }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-xs cursor-pointer">
                <Plus className="size-3.5 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign to projects</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex flex-col gap-1 rounded-md border">
                  <div className="flex items-center gap-2 px-2 border-b">
                    <Search className="size-3.5 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      placeholder="Search projects…"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="flex-1 py-2 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto p-1">
                  {filteredProjects.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggleProject(p.id)}
                        className="accent-primary"
                      />
                      {p.name}
                    </label>
                  ))}
                  </div>
                </div>
                <Button
                  disabled={selected.length === 0}
                  onClick={handleSubmit}
                  className="cursor-pointer"
                >
                  Assign {selected.length > 0 ? `(${selected.length})` : ""}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {assigned.length === 0 ? (
        <p className="px-4 md:px-5 py-6 text-sm text-muted-foreground text-center">
          Not assigned to any projects.
        </p>
      ) : (
        <ul className="divide-y">
          {assigned.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 md:px-5 py-3">
              <Link href={`/projects/${p.id}`} className="text-sm hover:underline">
                {p.name}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                onClick={() => startTransition(() => unassignSubFromProject(subId, p.id))}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

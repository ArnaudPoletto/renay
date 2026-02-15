"use client";

import { useRef, useMemo, useState, useTransition } from "react";
import Fuse from "fuse.js";
import { Paperclip, Search, UserPlus, X } from "lucide-react";
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
import { createSub, updateAvsFileKey } from "./actions";

type Project = { id: string; name: string };

export function CreateSubDialog({ children, projects }: { children: React.ReactNode; projects: Project[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [avsFile, setAvsFile] = useState<File | null>(null);
  const [avsValidFrom, setAvsValidFrom] = useState("");
  const [avsValidUntil, setAvsValidUntil] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fuse = useMemo(() => new Fuse(projects, { keys: ["name"], threshold: 0.4 }), [projects]);
  const filteredProjects = projectSearch.trim() ? fuse.search(projectSearch).map((r) => r.item) : projects;

  function toggleProject(id: string) {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      // 1. Create sub (+ avs doc row if file selected)
      const { subId, avsDocId } = await createSub(name.trim(), selectedProjects, !!avsFile);

      // 2. Upload file and patch fileKey + dates if a file was selected
      if (avsFile && avsDocId) {
        const formData = new FormData();
        formData.append("file", avsFile);
        formData.append("subId", subId);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const { key } = await res.json();
          await updateAvsFileKey(avsDocId, key, avsValidFrom || null, avsValidUntil || null);
        }
      }

      setName("");
      setSelectedProjects([]);
      setProjectSearch("");
      setAvsFile(null);
      setAvsValidFrom("");
      setAvsValidUntil("");
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
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto p-1">
                  {filteredProjects.map((p) => (
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
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>AVS document <span className="text-muted-foreground font-normal">(optional)</span></Label>
            {avsFile ? (
              <div className="relative flex items-center gap-2 rounded-md border px-3 py-2 pr-8 text-sm">
                <Paperclip className="size-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1 truncate text-muted-foreground min-w-0">{avsFile.name.length > 20 ? avsFile.name.slice(0, 20) + "…" : avsFile.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAvsFile(null);
                    setAvsValidFrom("");
                    setAvsValidUntil("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors cursor-pointer"
              >
                <Paperclip className="size-3.5" /> Attach file (PDF, JPEG, PNG — max 10 MB)
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => setAvsFile(e.target.files?.[0] ?? null)}
            />

            {avsFile && (
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  From
                  <input
                    type="date"
                    value={avsValidFrom}
                    max={avsValidUntil || undefined}
                    onChange={(e) => setAvsValidFrom(e.target.value)}
                    className="rounded border bg-background px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  Until
                  <input
                    type="date"
                    value={avsValidUntil}
                    min={avsValidFrom || undefined}
                    onChange={(e) => setAvsValidUntil(e.target.value)}
                    className="rounded border bg-background px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>

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

"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronRight, FolderOpen, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { project } from "@/db/schema";
import { deleteProject } from "./actions";

type Project = Pick<typeof project.$inferSelect, "id" | "name"> & { totalSubs: number; compliantSubs: number };

export function ProjectsList({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();

  const fuse = useMemo(
    () => new Fuse(projects, { keys: ["name"], threshold: 0.4 }),
    [projects]
  );

  const filtered = query.trim()
    ? fuse.search(query).map((r) => r.item)
    : projects;

  return (
    <div className="rounded-xl border bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b">
        <h2 className="font-semibold text-sm flex items-center gap-1.5"><FolderOpen className="size-3.5" /> Projects</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 h-7 text-xs w-36"
            />
          </div>
          <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 shrink-0">
            View all <ChevronRight className="size-3" />
          </Link>
        </div>
      </div>

      <div className="divide-y overflow-y-auto max-h-80">
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <ContextMenu key={p.id}>
              <ContextMenuTrigger asChild>
                <Link
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between px-4 md:px-5 py-3 md:py-3.5 hover:bg-muted/50 active:bg-muted transition-colors"
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    const el = e.currentTarget;
                    const timer = setTimeout(() => {
                      el.dispatchEvent(
                        new MouseEvent("contextmenu", {
                          bubbles: true,
                          clientX: touch.clientX,
                          clientY: touch.clientY,
                        })
                      );
                    }, 500);
                    el.dataset.longPressTimer = String(timer);
                  }}
                  onTouchEnd={(e) => {
                    clearTimeout(Number(e.currentTarget.dataset.longPressTimer));
                  }}
                  onTouchMove={(e) => {
                    clearTimeout(Number(e.currentTarget.dataset.longPressTimer));
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.totalSubs === 0
                        ? "No subs yet"
                        : p.compliantSubs === p.totalSubs
                        ? `All ${p.totalSubs} subs compliant`
                        : `${p.compliantSubs}/${p.totalSubs} compliant subs`}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                </Link>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onSelect={() => startTransition(() => deleteProject(p.id))}
                >
                  <Trash2 className="size-4 mr-2" /> Delete project
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))
        ) : (
          <p className="px-4 md:px-5 py-6 text-sm text-muted-foreground text-center">
            No projects match &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

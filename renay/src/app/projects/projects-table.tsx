"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2 } from "lucide-react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { project } from "@/db/schema";
import { deleteProject } from "@/app/dashboard/projects/actions";

type Project = Pick<typeof project.$inferSelect, "id" | "name" | "createdAt">;

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const router = useRouter();

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
        <h2 className="font-semibold text-sm">All Projects</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 h-7 text-xs w-48"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-6 text-sm">
                No projects yet.
              </TableCell>
            </TableRow>
          ) : filtered.length > 0 ? (
            filtered.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer"
                onClick={() => router.push(`/projects/${p.id}`)}
              >
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                  {new Date(p.createdAt).toLocaleDateString("en-CH", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      startTransition(() => deleteProject(p.id));
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-6 text-sm">
                No projects match &ldquo;{query}&rdquo;
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

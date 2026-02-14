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
import { deleteSub } from "./actions";

type SubRow = {
  id: string;
  name: string;
  createdAt: Date;
  projects: string[];
};

export function SubsTable({ subs }: { subs: SubRow[] }) {
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const router = useRouter();

  const fuse = useMemo(
    () => new Fuse(subs, { keys: ["name", "projects"], threshold: 0.4 }),
    [subs]
  );

  const filtered = query.trim()
    ? fuse.search(query).map((r) => r.item)
    : subs;

  return (
    <div className="rounded-xl border bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b">
        <h2 className="font-semibold text-sm">All Subs</h2>
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
            <TableHead className="hidden sm:table-cell">Project</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {subs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-6 text-sm">
                No subcontractors yet.
              </TableCell>
            </TableRow>
          ) : filtered.length > 0 ? (
            filtered.map((s) => (
              <TableRow
                key={s.id}
                className="cursor-pointer"
                onClick={() => router.push(`/subs/${s.id}`)}
              >
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-sm">
                  {s.projects.length === 0 ? (
                    <span className="text-muted-foreground/50">—</span>
                  ) : (
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-muted-foreground">{s.projects[0]}</span>
                      {s.projects.length > 1 && (
                        <span className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                          +{s.projects.length - 1}
                        </span>
                      )}
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                  {new Date(s.createdAt).toLocaleDateString("en-CH", {
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
                      startTransition(() => deleteSub(s.id));
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-6 text-sm">
                No subs match &ldquo;{query}&rdquo;
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

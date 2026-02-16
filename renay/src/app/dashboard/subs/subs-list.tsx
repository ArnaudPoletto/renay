"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronRight, Search, Trash2, Users } from "lucide-react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { subcontractor } from "@/db/schema";
import { deleteSub } from "@/app/subs/actions";

type Sub = Pick<typeof subcontractor.$inferSelect, "id" | "name">;

export function SubsList({ subs }: { subs: Sub[] }) {
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();

  const fuse = useMemo(
    () => new Fuse(subs, { keys: ["name"], threshold: 0.4 }),
    [subs]
  );

  const filtered = query.trim()
    ? fuse.search(query).map((r) => r.item)
    : subs;

  return (
    <div className="rounded-xl border bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b">
        <h2 className="font-semibold text-sm flex items-center gap-1.5"><Users className="size-3.5" /> Subs</h2>
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
          <Link href="/subs" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 shrink-0">
            View all <ChevronRight className="size-3" />
          </Link>
        </div>
      </div>

      <div className="divide-y overflow-y-auto max-h-80">
        {filtered.length > 0 ? (
          filtered.map((s) => (
            <ContextMenu key={s.id}>
              <ContextMenuTrigger asChild>
                <Link
                  href={`/subs/${s.id}`}
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
                  <p className="text-sm font-medium">{s.name}</p>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                </Link>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onSelect={() => startTransition(() => deleteSub(s.id))}
                >
                  <Trash2 className="size-4 mr-2" /> Delete sub
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))
        ) : (
          <p className="px-4 md:px-5 py-6 text-sm text-muted-foreground text-center">
            {query ? <>No subs match &ldquo;{query}&rdquo;</> : "No subcontractors yet."}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assignSubToProject, unassignSubFromProject } from "../../subs/sub-actions";

type Sub = { id: string; name: string };

export function SubsSection({
  projectId,
  assigned,
  available,
}: {
  projectId: string;
  assigned: Sub[];
  available: Sub[];
}) {
  const [, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <section className="rounded-xl border bg-background">
      <div className="px-4 md:px-5 py-3 md:py-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm">Subs</h2>
        {available.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs cursor-pointer"
            onClick={() => setPickerOpen((v) => !v)}
          >
            <Plus className="size-3.5 mr-1" /> Add
          </Button>
        )}
      </div>

      {pickerOpen && (
        <div className="border-b px-4 md:px-5 py-3 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground mb-1">Select a sub to assign:</p>
          {available.map((s) => (
            <button
              key={s.id}
              className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-muted text-left cursor-pointer"
              onClick={() => {
                setPickerOpen(false);
                startTransition(() => assignSubToProject(s.id, projectId));
              }}
            >
              <Check className="size-3.5 text-muted-foreground" />
              {s.name}
            </button>
          ))}
        </div>
      )}

      {assigned.length === 0 ? (
        <p className="px-4 md:px-5 py-6 text-sm text-muted-foreground text-center">
          No subs assigned.
        </p>
      ) : (
        <ul className="divide-y">
          {assigned.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-4 md:px-5 py-3">
              <Link href={`/subs/${s.id}`} className="text-sm hover:underline">
                {s.name}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                onClick={() => startTransition(() => unassignSubFromProject(s.id, projectId))}
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

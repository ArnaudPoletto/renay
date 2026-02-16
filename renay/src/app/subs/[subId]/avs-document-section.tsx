"use client";

import { useTransition, useRef, useState } from "react";
import { Plus, Trash2, CheckCircle2, CircleDashed, Clock, XCircle, Eye, Loader2, Pencil, Paperclip, X, Archive, ArchiveRestore, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addAvsDocument, deleteAvsDocument, toggleArchiveAvsDocument, updateAvsDocumentDates } from "../avs-actions";
import { Label } from "@/components/ui/label";

type AvsDoc = {
  id: string;
  fileKey: string | null;
  description: string | null;
  validFrom: string | null;
  validUntil: string | null;
  validityStatus: string | null;
  archivedAt: Date | null;
  createdAt: Date;
};

async function downloadDoc(fileKey: string) {
  const res = await fetch(`/api/download?key=${encodeURIComponent(fileKey)}`);
  if (!res.ok) return;
  const { url } = await res.json();
  window.open(url, "_blank");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-CH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AvsDocRow({ doc, subId }: { doc: AvsDoc; subId: string }) {
  const [, startTransition] = useTransition();
  const [validFrom, setValidFrom] = useState(doc.validFrom ?? "");
  const [validUntil, setValidUntil] = useState(doc.validUntil ?? "");
  const [description, setDescription] = useState(doc.description ?? "");
  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const showInputs = editing || !doc.validUntil;

  function commit(from: string, until: string, desc: string) {
    startTransition(() =>
      updateAvsDocumentDates(doc.id, subId, from || null, until || null, desc || null)
    );
    if (until) setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function handleGroupBlur(e: React.FocusEvent<HTMLLIElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      formRef.current?.requestSubmit();
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    commit(validFrom, validUntil, description);
  }

  const isArchived = !!doc.archivedAt;

  return (
    <li className={`flex items-start justify-between px-4 md:px-5 py-3 gap-4 ${isArchived ? "opacity-50" : ""}`} onBlur={handleGroupBlur} onKeyDown={handleKeyDown}>
      <div className="flex items-start gap-3 min-w-0">
          {isArchived ? (
            <Archive className="size-4 text-muted-foreground shrink-0 mt-0.5" />
          ) : doc.validityStatus === "expired" ? (
            <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />
          ) : doc.validityStatus === "expiring_soon" ? (
            <Clock className="size-4 text-yellow-500 shrink-0 mt-0.5" />
          ) : doc.validityStatus === "valid" ? (
            <CheckCircle2 className="size-4 text-green-500 shrink-0 mt-0.5" />
          ) : (
            <CircleDashed className="size-4 text-muted-foreground shrink-0 mt-0.5" />
          )}
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-sm font-medium">
            {isArchived ? "Archived" : doc.validityStatus === "expired" ? "Expired" : doc.validityStatus === "expiring_soon" ? "Expiring soon" : doc.validityStatus === "valid" ? "Valid" : "No dates set"}
          </p>
          {showInputs ? (
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="rounded border bg-background px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full"
            />
          ) : doc.description ? (
            <p className="text-xs text-muted-foreground break-words">{doc.description}</p>
          ) : null}
          {showInputs ? (
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                From
                <input
                  type="date"
                  value={validFrom}
                  max={validUntil || undefined}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="rounded border bg-background px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                />
              </label>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                Until
                <input
                  type="date"
                  value={validUntil}
                  min={validFrom || undefined}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="rounded border bg-background px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                />
              </label>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">
              {doc.validFrom ? `${formatDate(doc.validFrom)} – ${formatDate(doc.validUntil!)}` : `Until ${formatDate(doc.validUntil!)}`}
            </p>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {doc.fileKey && (
            <DropdownMenuItem className="cursor-pointer" onSelect={() => downloadDoc(doc.fileKey!)}>
              <Eye className="size-4 mr-2" /> View document
            </DropdownMenuItem>
          )}
          {doc.validUntil && (
            <DropdownMenuItem className="cursor-pointer" onSelect={() => setEditing((v) => !v)}>
              <Pencil className="size-4 mr-2" /> Edit
            </DropdownMenuItem>
          )}
          {(doc.fileKey || doc.validUntil) && <DropdownMenuSeparator />}
          <DropdownMenuItem className="cursor-pointer" onSelect={() => startTransition(() => toggleArchiveAvsDocument(doc.id, subId, !isArchived))}>
            {isArchived ? <ArchiveRestore className="size-4 mr-2" /> : <Archive className="size-4 mr-2" />}
            {isArchived ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" className="cursor-pointer" onSelect={() => startTransition(() => deleteAvsDocument(doc.id, subId))}>
            <Trash2 className="size-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

function AddAvsDocDialog({ subId }: { subId: string }) {
  const [open, setOpen] = useState(false);
  const [avsFile, setAvsFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setAvsFile(null);
    setDescription("");
    setValidFrom("");
    setValidUntil("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      let fileKey: string | undefined;
      if (avsFile) {
        const formData = new FormData();
        formData.append("file", avsFile);
        formData.append("subId", subId);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const { key } = await res.json();
          fileKey = key;
        }
      }
      await addAvsDocument(subId, fileKey, validFrom || undefined, validUntil || undefined, description || undefined);
      reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-xs cursor-pointer">
          <Plus className="size-3.5 mr-1" />
          Add new
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New AVS document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label>AVS document</Label>
            {avsFile ? (
              <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <Paperclip className="size-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1 truncate text-muted-foreground min-w-0">{avsFile.name.length > 20 ? avsFile.name.slice(0, 20) + "…" : avsFile.name}</span>
                <button
                  type="button"
                  onClick={() => { setAvsFile(null); setValidFrom(""); setValidUntil(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
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
                    value={validFrom}
                    max={validUntil || undefined}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="rounded border bg-background px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  Until
                  <input
                    type="date"
                    value={validUntil}
                    min={validFrom || undefined}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="rounded border bg-background px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="avs-description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <input
              id="avs-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Renewed after audit"
              className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <Button type="submit" disabled={isPending || !avsFile} className="cursor-pointer">
            {isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Plus className="size-4 mr-2" />}
            {isPending ? "Adding…" : "Add document"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AvsDocumentSection({ subId, docs }: { subId: string; docs: AvsDoc[] }) {
  const [showArchived, setShowArchived] = useState(false);
  const hasArchived = docs.some((d) => !!d.archivedAt);
  const visible = showArchived ? docs : docs.filter((d) => !d.archivedAt);

  return (
    <section className="rounded-xl border bg-background">
      <div className="px-4 md:px-5 py-3 md:py-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm">AVS Documents</h2>
        <div className="flex flex-col items-end gap-2.5">
          <AddAvsDocDialog subId={subId} />
          {hasArchived && (
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="accent-primary cursor-pointer"
              />
              Show archived
            </label>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="px-4 md:px-5 py-6 text-sm text-muted-foreground text-center">
          No AVS document uploaded yet.
        </p>
      ) : (
        <ul className="divide-y">
          {visible.map((doc) => (
            <AvsDocRow key={doc.id} doc={doc} subId={subId} />
          ))}
        </ul>
      )}
    </section>
  );
}

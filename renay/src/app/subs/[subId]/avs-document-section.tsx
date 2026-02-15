"use client";

import { useTransition, useRef, useState } from "react";
import { Plus, Trash2, CheckCircle2, CircleDashed, Clock, XCircle, Eye, Loader2, Pencil, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addAvsDocument, deleteAvsDocument, updateAvsDocumentDates } from "../avs-actions";
import { Label } from "@/components/ui/label";

type AvsDoc = {
  id: string;
  fileKey: string | null;
  validFrom: string | null;
  validUntil: string | null;
  validityStatus: string | null;
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
  const [editing, setEditing] = useState(false);
  const pencilRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const bothSet = !!doc.validFrom && !!doc.validUntil;
  const showInputs = editing || !bothSet;

  function commit(from: string, until: string) {
    startTransition(() =>
      updateAvsDocumentDates(doc.id, subId, from || null, until || null)
    );
    if (bothSet) setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function handleGroupBlur(e: React.FocusEvent<HTMLLIElement>) {
    // Don't close if focus moved to the pencil button (it will toggle itself)
    if (pencilRef.current !== null && e.relatedTarget === pencilRef.current) return;
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      formRef.current?.requestSubmit();
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    commit(validFrom, validUntil);
  }

  return (
    <li className="flex items-center justify-between px-4 md:px-5 py-3 gap-4" onBlur={handleGroupBlur} onKeyDown={handleKeyDown}>
      <div className="flex items-start gap-3 min-w-0">
          {doc.validityStatus === "expired" ? (
            <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />
          ) : doc.validityStatus === "expiring_soon" ? (
            <Clock className="size-4 text-yellow-500 shrink-0 mt-0.5" />
          ) : doc.validityStatus === "valid" ? (
            <CheckCircle2 className="size-4 text-green-500 shrink-0 mt-0.5" />
          ) : (
            <CircleDashed className="size-4 text-muted-foreground shrink-0 mt-0.5" />
          )}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium">
            {doc.validityStatus === "expired" ? "Expired" : doc.validityStatus === "expiring_soon" ? "Expiring soon" : doc.validityStatus === "valid" ? "Valid" : "No dates set"}
          </p>
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
              {formatDate(doc.validFrom!)} – {formatDate(doc.validUntil!)}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className={`size-8 cursor-pointer ${doc.fileKey ? "text-muted-foreground hover:text-foreground" : "invisible"}`}
          onClick={() => doc.fileKey && downloadDoc(doc.fileKey)}
          tabIndex={doc.fileKey ? 0 : -1}
        >
          <Eye className="size-4" />
        </Button>
        <Button
          ref={pencilRef}
          variant="ghost"
          size="icon"
          className={`size-8 cursor-pointer ${!bothSet ? "invisible" : editing ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => setEditing((v) => !v)}
          tabIndex={bothSet ? 0 : -1}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
          onClick={() => startTransition(() => deleteAvsDocument(doc.id, subId))}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
}

function AddAvsDocDialog({ subId }: { subId: string }) {
  const [open, setOpen] = useState(false);
  const [avsFile, setAvsFile] = useState<File | null>(null);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setAvsFile(null);
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
      await addAvsDocument(subId, fileKey, validFrom || undefined, validUntil || undefined);
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
  return (
    <section className="rounded-xl border bg-background">
      <div className="px-4 md:px-5 py-3 md:py-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm">AVS Documents</h2>
        <AddAvsDocDialog subId={subId} />
      </div>

      {docs.length === 0 ? (
        <p className="px-4 md:px-5 py-6 text-sm text-muted-foreground text-center">
          No AVS document uploaded yet.
        </p>
      ) : (
        <ul className="divide-y">
          {docs.map((doc) => (
            <AvsDocRow key={doc.id} doc={doc} subId={subId} />
          ))}
        </ul>
      )}
    </section>
  );
}

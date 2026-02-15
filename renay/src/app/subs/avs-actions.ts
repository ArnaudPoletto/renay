"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { avsDocument } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteFile } from "@/lib/storage";

function computeValidityStatus(
  _validFrom: string | null,
  validUntil: string | null,
): string | null {
  if (!validUntil) return null;

  const warningDays = parseInt(process.env.AVS_WARNING_EXPIRE_DAYS ?? "20", 10);
  const today = new Date().toISOString().slice(0, 10);

  if (today > validUntil) return "expired";

  const warnDate = new Date(validUntil);
  warnDate.setDate(warnDate.getDate() - warningDays);
  const warnStr = warnDate.toISOString().slice(0, 10);

  if (today >= warnStr) return "expiring_soon";
  return "valid";
}

export async function addAvsDocument(
  subcontractorId: string,
  fileKey?: string,
  validFrom?: string,
  validUntil?: string,
): Promise<string> {
  const vf = validFrom ?? null;
  const vu = validUntil ?? null;

  const [doc] = await db
    .insert(avsDocument)
    .values({
      subcontractorId,
      fileKey: fileKey ?? null,
      validFrom: vf,
      validUntil: vu,
      validityStatus: computeValidityStatus(vf, vu),
    })
    .returning({ id: avsDocument.id });

  revalidatePath(`/subs/${subcontractorId}`);
  return doc.id;
}

export async function updateAvsDocumentDates(
  id: string,
  subcontractorId: string,
  validFrom: string | null,
  validUntil: string | null,
) {
  await db
    .update(avsDocument)
    .set({ validFrom, validUntil, validityStatus: computeValidityStatus(validFrom, validUntil) })
    .where(eq(avsDocument.id, id));

  revalidatePath(`/subs/${subcontractorId}`);
}

export async function updateAvsDocumentFile(
  id: string,
  subcontractorId: string,
  newFileKey: string,
) {
  const [existing] = await db
    .select({ fileKey: avsDocument.fileKey })
    .from(avsDocument)
    .where(eq(avsDocument.id, id))
    .limit(1);

  if (existing?.fileKey) {
    await deleteFile(existing.fileKey);
  }

  await db
    .update(avsDocument)
    .set({ fileKey: newFileKey })
    .where(eq(avsDocument.id, id));

  revalidatePath(`/subs/${subcontractorId}`);
}

export async function deleteAvsDocument(id: string, subcontractorId: string) {
  const [doc] = await db
    .delete(avsDocument)
    .where(eq(avsDocument.id, id))
    .returning({ fileKey: avsDocument.fileKey });

  if (doc?.fileKey) {
    await deleteFile(doc.fileKey);
  }

  revalidatePath(`/subs/${subcontractorId}`);
}

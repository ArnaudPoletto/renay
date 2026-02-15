"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subcontractor, subcontractorProject, avsDocument } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createSub(
  name: string,
  projectIds: string[],
  addAvs: boolean
): Promise<{ subId: string; avsDocId: string | null }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const [newSub] = await db
    .insert(subcontractor)
    .values({ name })
    .returning({ id: subcontractor.id });

    // Assign sub to projects, if any
    const inserts: Promise<unknown>[] = [];
    if (projectIds.length > 0) {
      inserts.push(
        db.insert(subcontractorProject).values(
          projectIds.map((projectId) => ({ subcontractorId: newSub.id, projectId }))
        )
      );
    }
  
  // Create AVS document if requested 
  let avsDocId: string | null = null;
  if (addAvs) {
    inserts.push(
      db
        .insert(avsDocument)
        .values({ subcontractorId: newSub.id})
        .returning({ id: avsDocument.id })
        .then(([doc]) => { avsDocId = doc.id; })
    );
  }

  await Promise.all(inserts);

  revalidatePath("/dashboard");
  revalidatePath("/subs");

  return { subId: newSub.id, avsDocId };
}

export async function updateAvsFileKey(
  avsDocId: string,
  fileKey: string,
  validFrom?: string | null,
  validUntil?: string | null,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await db
    .update(avsDocument)
    .set({ fileKey, validFrom: validFrom ?? null, validUntil: validUntil ?? null })
    .where(eq(avsDocument.id, avsDocId));
}

export async function deleteSub(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await db.delete(subcontractor).where(eq(subcontractor.id, id));

  revalidatePath("/dashboard");
  revalidatePath("/subs");
}

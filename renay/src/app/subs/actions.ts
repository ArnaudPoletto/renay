"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subcontractor, subcontractorProject } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createSub(name: string, projectIds: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const [newSub] = await db
    .insert(subcontractor)
    .values({ name })
    .returning({ id: subcontractor.id });

  if (projectIds.length > 0) {
    await db.insert(subcontractorProject).values(
      projectIds.map((projectId) => ({ subcontractorId: newSub.id, projectId }))
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/subs");
}

export async function deleteSub(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await db.delete(subcontractor).where(eq(subcontractor.id, id));

  revalidatePath("/dashboard");
  revalidatePath("/subs");
}

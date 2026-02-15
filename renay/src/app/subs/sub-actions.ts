"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { subcontractorProject } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function assignSubToProject(subcontractorId: string, projectId: string) {
  await db.insert(subcontractorProject).values({ subcontractorId, projectId });
  revalidatePath(`/subs/${subcontractorId}`);
  revalidatePath(`/projects/${projectId}`);
}

export async function unassignSubFromProject(subcontractorId: string, projectId: string) {
  await db
    .delete(subcontractorProject)
    .where(
      and(
        eq(subcontractorProject.subcontractorId, subcontractorId),
        eq(subcontractorProject.projectId, projectId)
      )
    );
  revalidatePath(`/subs/${subcontractorId}`);
  revalidatePath(`/projects/${projectId}`);
}

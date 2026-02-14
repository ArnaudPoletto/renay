"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { project, projectAccess } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function createProject(name: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const [newProject] = await db
    .insert(project)
    .values({ name })
    .returning({ id: project.id });

  await db.insert(projectAccess).values({
    projectId: newProject.id,
    userId: session.user.id,
  });

  revalidatePath("/dashboard");
}

export async function deleteProject(projectId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  // Verify the user has access to this project before deleting
  const [access] = await db
    .select({ id: projectAccess.id })
    .from(projectAccess)
    .where(
      and(
        eq(projectAccess.projectId, projectId),
        eq(projectAccess.userId, session.user.id)
      )
    )
    .limit(1);

  if (!access) throw new Error("Not found");

  await db.delete(project).where(eq(project.id, projectId));

  revalidatePath("/dashboard");
}

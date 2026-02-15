import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const subId = formData.get("subId") as string | null;

  if (!file || !subId) {
    return NextResponse.json({ error: "Missing file or subId" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF, JPEG, and PNG files are allowed" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const key = `avs/${subId}/${randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadFile(key, buffer, file.type);

  return NextResponse.json({ key });
}

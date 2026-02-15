import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,
  region: process.env.S3_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  // Required for MinIO — path-style addressing (bucket in path, not subdomain)
  forcePathStyle: true,
});

const bucket = process.env.S3_BUCKET!;

/**
 * Upload a file buffer to storage.
 * @param key  Object key, e.g. "avs/sub-uuid/doc-uuid.pdf"
 */
export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
}

/**
 * Generate a presigned URL valid for 1 hour.
 * Use this to serve files to the browser without exposing credentials.
 */
export async function getSignedFileUrl(key: string): Promise<string> {
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 3600 }
  );
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(key: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key })
  );
}

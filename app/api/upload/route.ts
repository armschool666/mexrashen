import path from "node:path";
import { del, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../auth-check";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".jpg", ".jpeg", ".png", ".gif", ".webp",
  ".txt", ".csv", ".zip",
];

function hasValidMagicBytes(ext: string, buf: Buffer): boolean {
  switch (ext) {
    case ".pdf":
      return buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
    case ".jpg":
    case ".jpeg":
      return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case ".png":
      return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    case ".gif":
      return buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38;
    case ".webp":
      return (
        buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
        buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
      );
    case ".zip":
    case ".docx":
    case ".xlsx":
    case ".pptx":
      return buf[0] === 0x50 && buf[1] === 0x4b;
    case ".doc":
    case ".xls":
    case ".ppt":
      return buf[0] === 0xd0 && buf[1] === 0xcf;
    case ".txt":
    case ".csv":
      return true;
    default:
      return false;
  }
}

function safeFileName(value: string) {
  const extension = path.extname(value);
  const base = path
    .basename(value, extension)
    .replace(/[^\p{L}\p{N}-]+/gu, "-")
    .replace(/-+/g, "-");
  return `uploads/${base || "file"}-${Date.now()}${extension}`;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!hasValidMagicBytes(ext, buffer)) {
    return NextResponse.json(
      { error: "File content does not match its extension" },
      { status: 400 },
    );
  }

  const blob = await put(safeFileName(file.name), buffer, {
    access: "public",
    contentType: file.type || "application/octet-stream",
  });

  return NextResponse.json({
    name: file.name,
    href: blob.url,
    size: file.size,
  });
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const href = request.nextUrl.searchParams.get("href");
  if (!href) {
    return NextResponse.json({ error: "Missing href" }, { status: 400 });
  }

  try {
    await del(href);
  } catch {
    // Already deleted or not found — treat as success
  }
  return NextResponse.json({ ok: true });
}

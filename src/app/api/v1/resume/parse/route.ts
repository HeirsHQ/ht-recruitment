import { NextResponse } from "next/server";

import { isPdfMagicValid, hasAllowedExtension, sanitizeFileName } from "@/lib/sanitize";
import { parseResume } from "@/lib/resume-parser";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "File size exceeds 10 MB limit" }, { status: 413 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No PDF file provided" }, { status: 400 });
    }

    // Validate MIME type
    if (file.type !== "application/pdf") {
      return NextResponse.json({ success: false, error: "File must be a PDF" }, { status: 400 });
    }

    // Validate file extension
    const safeName = sanitizeFileName(file.name);
    if (!hasAllowedExtension(safeName)) {
      return NextResponse.json({ success: false, error: "Only .pdf files are accepted" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "File size exceeds 10 MB limit" }, { status: 413 });
    }

    if (file.size === 0) {
      return NextResponse.json({ success: false, error: "File is empty" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate PDF magic bytes (%PDF)
    if (!isPdfMagicValid(buffer)) {
      return NextResponse.json({ success: false, error: "File does not appear to be a valid PDF" }, { status: 400 });
    }

    const result = await parseResume(buffer);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Resume parse error:", error);
    return NextResponse.json({ success: false, error: "Failed to parse resume" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

import cloudinary from "@/lib/cloudinary";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fileEntry = formData.get("file");
    const folderEntry = formData.get("folder");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        { error: "No valid file uploaded." },
        { status: 400 },
      );
    }

    const file = fileEntry;

    const folder =
      typeof folderEntry === "string" && folderEntry.trim()
        ? folderEntry.trim()
        : "true-sunshine/students";

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The uploaded file is empty." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must not exceed 10 MB." },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: "Unsupported file type. Upload JPG, PNG, WEBP, or PDF.",
        },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      folder?: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          use_filename: true,
          unique_filename: true,
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
            return;
          }

          if (!uploadResult?.secure_url || !uploadResult.public_id) {
            reject(new Error("Cloudinary returned incomplete upload data."));
            return;
          }

          resolve(uploadResult);
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });

    return NextResponse.json({
      originalFileName: file.name,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      folder: result.folder ?? folder,
      mimeType: file.type,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("Document upload error:", error);

    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}

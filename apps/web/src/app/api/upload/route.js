import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const UPLOAD_DIR = path.resolve("uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function generateFilename(ext) {
  return `${crypto.randomUUID()}${ext}`;
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".svg": "image/svg+xml",
  };
  return types[ext] || "application/octet-stream";
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let buffer;
    let ext = ".bin";
    let mimeType = "application/octet-stream";

    if (contentType.includes("multipart/form-data")) {
      // FormData file upload
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file || typeof file === "string") {
        return Response.json({ error: "No file provided" }, { status: 400 });
      }
      buffer = Buffer.from(await file.arrayBuffer());
      const originalName = file.name || "upload";
      ext = path.extname(originalName) || ".bin";
      mimeType = file.type || getMimeType(originalName);
    } else if (contentType.includes("application/json")) {
      // JSON body with base64 or url
      const body = await request.json();

      if (body.base64) {
        // Strip data URL prefix if present: "data:image/png;base64,..."
        let base64Data = body.base64;
        const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
        buffer = Buffer.from(base64Data, "base64");
        const extMap = {
          "image/jpeg": ".jpg",
          "image/png": ".png",
          "image/gif": ".gif",
          "image/webp": ".webp",
          "application/pdf": ".pdf",
        };
        ext = extMap[mimeType] || ".bin";
      } else if (body.url) {
        // Download from URL
        const res = await fetch(body.url);
        if (!res.ok) {
          return Response.json(
            { error: "Failed to fetch URL" },
            { status: 400 },
          );
        }
        buffer = Buffer.from(await res.arrayBuffer());
        mimeType = res.headers.get("content-type") || "application/octet-stream";
        const urlPath = new URL(body.url).pathname;
        ext = path.extname(urlPath) || ".bin";
      } else {
        return Response.json(
          { error: "Provide file, base64, or url" },
          { status: 400 },
        );
      }
    } else if (contentType.includes("application/octet-stream")) {
      // Raw binary upload
      buffer = Buffer.from(await request.arrayBuffer());
    } else {
      return Response.json(
        { error: "Unsupported content type" },
        { status: 400 },
      );
    }

    const filename = generateFilename(ext);
    const filepath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filepath, buffer);

    const url = `/uploads/${filename}`;

    return Response.json({ url, mimeType });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}

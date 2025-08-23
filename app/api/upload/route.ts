import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function POST(request: Request) {
  const data = await request.formData();
  const file = data.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name}`;
  const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
  await fs.writeFile(uploadPath, buffer);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
}

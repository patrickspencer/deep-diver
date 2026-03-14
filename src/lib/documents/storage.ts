import fs from "fs";
import path from "path";
import crypto from "crypto";

const STORAGE_DIR = path.join(process.cwd(), "data", "documents");

export function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

export async function saveFile(
  buffer: Buffer,
  originalName: string
): Promise<string> {
  ensureStorageDir();
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(8).toString("hex");
  const fileName = `${hash}${ext}`;
  const filePath = path.join(STORAGE_DIR, fileName);
  fs.writeFileSync(filePath, buffer);
  return fileName;
}

export function getFilePath(fileName: string): string {
  return path.join(STORAGE_DIR, fileName);
}

export function deleteFile(fileName: string): void {
  const filePath = path.join(STORAGE_DIR, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function readFileContent(fileName: string): string {
  const filePath = path.join(STORAGE_DIR, fileName);
  return fs.readFileSync(filePath, "utf-8");
}

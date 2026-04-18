import path from "path"
import { mkdir, unlink, stat } from "fs/promises"

export const UPLOAD_DIR = path.join(process.cwd(), "uploads", "avatars")

export async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true })
}

export function generateSafeFilename(userId: string, ext: string): string {
  const random = crypto.randomUUID()
  return `${userId}-${random}.${ext}`
}

export async function deleteFileIfExists(filepath: string): Promise<void> {
  try {
    await stat(filepath)
    await unlink(filepath)
  } catch {
    // 文件不存在，忽略
  }
}

export function getExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    default:
      return "jpg"
  }
}

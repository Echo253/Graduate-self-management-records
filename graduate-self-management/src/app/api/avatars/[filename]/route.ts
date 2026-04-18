import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { readFile, stat } from "fs/promises"
import path from "path"
import { UPLOAD_DIR } from "@/lib/upload"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { filename } = await params

  // 安全检查：防止路径遍历
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return new NextResponse("Invalid filename", { status: 400 })
  }

  // 严格访问控制：文件名必须以当前用户ID开头
  if (!filename.startsWith(session.user.id + "-")) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const filePath = path.join(UPLOAD_DIR, filename)

  // 检查文件是否存在
  try {
    await stat(filePath)
  } catch {
    return new NextResponse("Not Found", { status: 404 })
  }

  const fileBuffer = await readFile(filePath)

  // 根据扩展名设置 Content-Type
  const ext = filename.split(".").pop()?.toLowerCase()
  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg"

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=31536000",
    },
  })
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"
import {
  UPLOAD_DIR,
  ensureUploadDir,
  generateSafeFilename,
  deleteFileIfExists,
  getExtension
} from "@/lib/upload"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("avatar") as File | null

    if (!file) {
      return NextResponse.json({ error: "未提供头像文件" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "仅支持 JPG、PNG、WebP 格式" }, { status: 400 })
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "文件大小不能超过 2MB" }, { status: 400 })
    }

    await ensureUploadDir()

    // 获取当前用户的旧头像，删除旧文件
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true }
    })

    if (currentUser?.avatar?.startsWith("/api/avatars/")) {
      const oldFilename = currentUser.avatar.replace("/api/avatars/", "")
      const oldFilePath = path.join(UPLOAD_DIR, oldFilename)
      await deleteFileIfExists(oldFilePath)
    }

    // 生成新文件名并保存
    const ext = getExtension(file.type)
    const filename = generateSafeFilename(session.user.id, ext)
    const filepath = path.join(UPLOAD_DIR, filename)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // 更新数据库
    const avatarUrl = `/api/avatars/${filename}`
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarUrl }
    })

    return NextResponse.json({
      id: user.id,
      avatar: user.avatar
    })
  } catch (error) {
    console.error("头像上传失败:", error)
    return NextResponse.json({ error: "上传失败" }, { status: 500 })
  }
}

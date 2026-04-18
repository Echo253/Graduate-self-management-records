import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 验证时间格式 (HH:mm)
function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
  return timeRegex.test(time)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { time } = body

    // 验证时间格式
    if (!time || typeof time !== "string" || !isValidTimeFormat(time)) {
      return NextResponse.json({ error: "时间格式无效，请使用 HH:mm 格式" }, { status: 400 })
    }

    // 更新记录
    const updated = await prisma.toiletRecord.updateMany({
      where: { id, userId: session.user.id },
      data: { time }
    })

    // 检查是否更新成功
    if (updated.count === 0) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 })
    }

    // 获取更新后的记录
    const record = await prisma.toiletRecord.findUnique({
      where: { id }
    })

    return NextResponse.json({ success: true, record })
  } catch (error) {
    console.error("更新如厕记录失败:", error)
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const { id } = await params

  await prisma.toiletRecord.deleteMany({
    where: { id, userId: session.user.id }
  })

  return NextResponse.json({ success: true })
}

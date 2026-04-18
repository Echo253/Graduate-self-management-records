import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const { type, subtype, startTime, endTime, calories } = body

    // 验证至少有一个字段需要更新
    if (!type && !subtype && !startTime && !endTime && calories === undefined) {
      return NextResponse.json({ error: "没有需要更新的字段" }, { status: 400 })
    }

    // 验证 type 是否有效
    if (type !== undefined) {
      const validTypes = ["running", "cycling", "swimming", "ball", "gym", "yoga", "walking", "other"]
      if (!validTypes.includes(type)) {
        return NextResponse.json({ error: "无效的运动类型" }, { status: 400 })
      }
    }

    // 构建更新数据
    const updateData: Record<string, unknown> = {}
    if (type !== undefined) updateData.type = type
    if (subtype !== undefined) updateData.subtype = subtype
    if (startTime !== undefined) updateData.startTime = startTime || null
    if (endTime !== undefined) updateData.endTime = endTime || null
    if (calories !== undefined) updateData.calories = calories || null

    const updatedRecord = await prisma.exerciseRecord.updateMany({
      where: { id, userId: session.user.id },
      data: updateData
    })

    if (updatedRecord.count === 0) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 })
    }

    // 获取更新后的记录
    const record = await prisma.exerciseRecord.findFirst({
      where: { id, userId: session.user.id }
    })

    return NextResponse.json({ success: true, record })
  } catch (error) {
    console.error("更新运动记录失败:", error)
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

  await prisma.exerciseRecord.deleteMany({
    where: { id, userId: session.user.id }
  })

  return NextResponse.json({ success: true })
}

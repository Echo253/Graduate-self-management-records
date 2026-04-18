import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 验证时间格式 HH:mm
function isValidTimeFormat(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
}

// 将 HH:mm 时间转换为今天的 Date 对象
function parseTimeToDate(time: string, baseDate: Date): Date {
  const [hours, minutes] = time.split(":").map(Number)
  const date = new Date(baseDate)
  date.setHours(hours, minutes, 0, 0)
  return date
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const { id } = await params

  // 获取现有记录
  const restSession = await prisma.restSession.findFirst({
    where: { id, userId: session.user.id }
  })

  if (!restSession) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 })
  }

  try {
    const body = await request.json().catch(() => ({}))

    // 结束时段模式 (空 body)
    if (!body || Object.keys(body).length === 0) {
      if (restSession.endTime) {
        return NextResponse.json({ error: "该时段已结束" }, { status: 400 })
      }

      const now = new Date()
      const time = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })
      const duration = Math.floor((now.getTime() - restSession.startTimestamp.getTime()) / 60000)

      const updated = await prisma.restSession.update({
        where: { id },
        data: {
          endTime: time,
          endTimestamp: now,
          duration
        }
      })

      return NextResponse.json(updated)
    }

    // 编辑时间模式
    const { startTime, endTime } = body

    // 构建更新数据
    const updateData: {
      startTime?: string
      startTimestamp?: Date
      endTime?: string
      endTimestamp?: Date
      duration?: number
    } = {}

    // 获取日期基准（使用原始记录的日期）
    const baseDate = new Date(restSession.startTimestamp)

    if (startTime !== undefined) {
      if (!isValidTimeFormat(startTime)) {
        return NextResponse.json({ error: "开始时间格式无效，请使用 HH:mm 格式" }, { status: 400 })
      }
      updateData.startTime = startTime
      updateData.startTimestamp = parseTimeToDate(startTime, baseDate)
    }

    if (endTime !== undefined) {
      if (!isValidTimeFormat(endTime)) {
        return NextResponse.json({ error: "结束时间格式无效，请使用 HH:mm 格式" }, { status: 400 })
      }
      updateData.endTime = endTime
      updateData.endTimestamp = parseTimeToDate(endTime, baseDate)
    }

    // 如果两个时间都提供了，计算 duration
    const finalStartTimestamp = updateData.startTimestamp || restSession.startTimestamp
    const finalEndTimestamp = updateData.endTimestamp || restSession.endTimestamp

    if (finalStartTimestamp && finalEndTimestamp) {
      const durationMs = finalEndTimestamp.getTime() - finalStartTimestamp.getTime()
      if (durationMs < 0) {
        return NextResponse.json({ error: "结束时间不能早于开始时间" }, { status: 400 })
      }
      updateData.duration = Math.floor(durationMs / 60000)
    }

    const updated = await prisma.restSession.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("更新休息时段失败:", error)
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

  await prisma.restSession.deleteMany({
    where: { id, userId: session.user.id }
  })

  return NextResponse.json({ success: true })
}

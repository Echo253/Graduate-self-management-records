import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const { id } = await params
  const now = new Date()
  const time = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })

  const restSession = await prisma.restSession.findFirst({
    where: { id, userId: session.user.id }
  })

  if (!restSession) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 })
  }

  if (restSession.endTime) {
    return NextResponse.json({ error: "该时段已结束" }, { status: 400 })
  }

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

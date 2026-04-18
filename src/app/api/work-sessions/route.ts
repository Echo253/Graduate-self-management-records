import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const date = request.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0]

  const workSessions = await prisma.workSession.findMany({
    where: { userId: session.user.id, date },
    orderBy: { startTimestamp: "asc" }
  })

  const restSessions = await prisma.restSession.findMany({
    where: { userId: session.user.id, date },
    orderBy: { startTimestamp: "asc" }
  })

  const activeWorkSession = workSessions.find(s => !s.endTime) || null
  const activeRestSession = restSessions.find(s => !s.endTime) || null

  const totalWork = workSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
  const totalRest = restSessions.reduce((sum, s) => sum + (s.duration || 0), 0)

  return NextResponse.json({
    workSessions: workSessions.map(s => ({
      ...s,
      startTimestamp: s.startTimestamp.toISOString(),
      endTimestamp: s.endTimestamp?.toISOString() || null
    })),
    restSessions: restSessions.map(s => ({
      ...s,
      startTimestamp: s.startTimestamp.toISOString(),
      endTimestamp: s.endTimestamp?.toISOString() || null
    })),
    totalWork,
    totalRest,
    activeWorkSession: activeWorkSession ? {
      ...activeWorkSession,
      startTimestamp: activeWorkSession.startTimestamp.toISOString(),
      endTimestamp: activeWorkSession.endTimestamp?.toISOString() || null
    } : null,
    activeRestSession: activeRestSession ? {
      ...activeRestSession,
      startTimestamp: activeRestSession.startTimestamp.toISOString(),
      endTimestamp: activeRestSession.endTimestamp?.toISOString() || null
    } : null
  })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const body = await request.json()
  const { type } = body
  const now = new Date()
  const date = now.toISOString().split("T")[0]
  const time = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })

  if (type === "work") {
    // 检查是否有未结束的工作时段
    const activeWork = await prisma.workSession.findFirst({
      where: { userId: session.user.id, endTime: null }
    })
    if (activeWork) {
      return NextResponse.json({ error: "已有进行中的工作时段" }, { status: 400 })
    }

    const workSession = await prisma.workSession.create({
      data: {
        userId: session.user.id,
        date,
        startTime: time,
        startTimestamp: now
      }
    })
    return NextResponse.json(workSession)
  } else if (type === "rest") {
    // 检查是否有未结束的休息时段
    const activeRest = await prisma.restSession.findFirst({
      where: { userId: session.user.id, endTime: null }
    })
    if (activeRest) {
      return NextResponse.json({ error: "已有进行中的休息时段" }, { status: 400 })
    }

    const restSession = await prisma.restSession.create({
      data: {
        userId: session.user.id,
        date,
        startTime: time,
        startTimestamp: now
      }
    })
    return NextResponse.json(restSession)
  }

  return NextResponse.json({ error: "无效的类型" }, { status: 400 })
}

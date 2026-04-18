import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function getDateRange(period: string, startDateStr?: string | null, endDateStr?: string | null) {
  if (startDateStr && endDateStr) {
    return {
      startDate: new Date(startDateStr + "T00:00:00"),
      endDate: new Date(endDateStr + "T23:59:59")
    }
  }

  const now = new Date()

  if (period === "week") {
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - 6)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)
    return { startDate, endDate }
  } else if (period === "month") {
    // 本月第一天 00:00:00 本地时间
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    // 今天 23:59:59 本地时间
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    return { startDate, endDate }
  } else {
    // 年度：过去12个月
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0)
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    return { startDate, endDate }
  }
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const period = request.nextUrl.searchParams.get("period") || "week"
  const startDateParam = request.nextUrl.searchParams.get("startDate")
  const endDateParam = request.nextUrl.searchParams.get("endDate")
  const { startDate, endDate } = getDateRange(period, startDateParam, endDateParam)

  // 获取工作时段
  const workSessions = await prisma.workSession.findMany({
    where: {
      userId: session.user.id,
      startTimestamp: { gte: startDate, lte: endDate }
    }
  })

  // 获取休息时段
  const restSessions = await prisma.restSession.findMany({
    where: {
      userId: session.user.id,
      startTimestamp: { gte: startDate, lte: endDate }
    }
  })

  // 获取咖啡记录
  const coffeeRecords = await prisma.coffeeRecord.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: startDate, lte: endDate }
    }
  })

  // 获取饮水记录
  const waterRecords = await prisma.waterRecord.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: startDate, lte: endDate }
    }
  })

  // 获取运动记录
  const exerciseRecords = await prisma.exerciseRecord.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: startDate, lte: endDate }
    }
  })

  // 按日期聚合
  const aggregateByDate = <T extends { date: string }>(records: T[]) => {
    const map = new Map<string, T[]>()
    records.forEach(r => {
      const list = map.get(r.date) || []
      list.push(r)
      map.set(r.date, list)
    })
    return map
  }

  const workByDate = aggregateByDate(workSessions)
  const coffeeByDate = aggregateByDate(coffeeRecords)
  const waterByDate = aggregateByDate(waterRecords)
  const exerciseByDate = aggregateByDate(exerciseRecords)

  // 生成日期列表（使用本地日期）
  const dates: string[] = []
  const d = new Date(startDate)
  while (d <= endDate) {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    dates.push(`${year}-${month}-${day}`)
    d.setDate(d.getDate() + 1)
  }

  return NextResponse.json({
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    },
    workSessions: dates.map(date => ({
      date,
      duration: (workByDate.get(date) || []).reduce((sum, s) => sum + (s.duration || 0), 0)
    })),
    restSessions: dates.map(date => ({
      date,
      duration: 0 // 简化处理
    })),
    coffeeRecords: dates.map(date => {
      const records = coffeeByDate.get(date) || []
      return {
        date,
        count: records.length,
        caffeine: records.reduce((sum, r) => sum + r.caffeine, 0)
      }
    }),
    waterRecords: dates.map(date => ({
      date,
      amount: (waterByDate.get(date) || []).reduce((sum, r) => sum + r.amount, 0)
    })),
    exerciseRecords: dates.map(date => {
      const records = exerciseByDate.get(date) || []
      return {
        date,
        count: records.length,
        calories: records.reduce((sum, r) => sum + (r.calories || 0), 0)
      }
    })
  })
}

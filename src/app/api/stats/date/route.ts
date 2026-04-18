import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const date = request.nextUrl.searchParams.get("date")
  if (!date) {
    return NextResponse.json({ error: "请提供日期" }, { status: 400 })
  }

  // 工作时长
  const workSessions = await prisma.workSession.findMany({
    where: { userId: session.user.id, date }
  })
  const workMinutes = workSessions.reduce((sum, s) => sum + (s.duration || 0), 0)

  // 咖啡
  const coffeeRecords = await prisma.coffeeRecord.findMany({
    where: { userId: session.user.id, date }
  })
  const coffeeCount = coffeeRecords.length
  const totalCaffeine = coffeeRecords.reduce((sum, r) => sum + r.caffeine, 0)

  // 饮水
  const waterRecords = await prisma.waterRecord.findMany({
    where: { userId: session.user.id, date }
  })
  const waterAmount = waterRecords.reduce((sum, r) => sum + r.amount, 0)

  // 如厕
  const toiletRecords = await prisma.toiletRecord.findMany({
    where: { userId: session.user.id, date }
  })

  // 运动
  const exerciseRecords = await prisma.exerciseRecord.findMany({
    where: { userId: session.user.id, date }
  })
  const exerciseCount = exerciseRecords.length
  const exerciseCalories = exerciseRecords.reduce((sum, r) => sum + (r.calories || 0), 0)

  return NextResponse.json({
    workMinutes,
    coffeeCount,
    totalCaffeine,
    waterAmount,
    toiletCount: toiletRecords.length,
    exerciseCount,
    exerciseCalories
  })
}

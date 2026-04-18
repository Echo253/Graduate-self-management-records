import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const date = request.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0]

  const coffeeRecords = await prisma.coffeeRecord.findMany({
    where: { userId: session.user.id, date },
    orderBy: { createdAt: "desc" }
  })

  const waterRecords = await prisma.waterRecord.findMany({
    where: { userId: session.user.id, date },
    orderBy: { createdAt: "desc" }
  })

  const totalCoffee = coffeeRecords.length
  const totalCaffeine = coffeeRecords.reduce((sum, r) => sum + r.caffeine, 0)
  const totalWater = waterRecords.reduce((sum, r) => sum + r.amount, 0)

  return NextResponse.json({
    coffeeRecords,
    waterRecords,
    totalCoffee,
    totalCaffeine,
    totalWater
  })
}

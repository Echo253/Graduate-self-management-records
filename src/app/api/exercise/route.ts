import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const date = request.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0]

  const records = await prisma.exerciseRecord.findMany({
    where: { userId: session.user.id, date },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json({ records })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const body = await request.json()
  const { type, subtype, startTime, endTime, calories } = body

  const now = new Date()
  const date = now.toISOString().split("T")[0]

  const record = await prisma.exerciseRecord.create({
    data: {
      userId: session.user.id,
      date,
      type,
      subtype: subtype || null,
      startTime: startTime || null,
      endTime: endTime || null,
      calories: calories || null
    }
  })

  return NextResponse.json(record)
}

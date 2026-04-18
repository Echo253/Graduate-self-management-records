import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const date = request.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0]

  const records = await prisma.toiletRecord.findMany({
    where: { userId: session.user.id, date },
    orderBy: { createdAt: "asc" }
  })

  return NextResponse.json({ records })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const now = new Date()
  const date = now.toISOString().split("T")[0]
  const time = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })

  const record = await prisma.toiletRecord.create({
    data: {
      userId: session.user.id,
      date,
      time
    }
  })

  return NextResponse.json(record)
}

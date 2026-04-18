import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const body = await request.json()
  const { brand, type, caffeine, customName } = body

  const now = new Date()
  const date = now.toISOString().split("T")[0]
  const time = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })

  const record = await prisma.coffeeRecord.create({
    data: {
      userId: session.user.id,
      date,
      brand,
      type,
      caffeine,
      customName,
      time
    }
  })

  return NextResponse.json(record)
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

  await prisma.coffeeRecord.deleteMany({
    where: { id, userId: session.user.id }
  })

  return NextResponse.json({ success: true })
}

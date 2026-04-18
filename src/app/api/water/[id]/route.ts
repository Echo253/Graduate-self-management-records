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

  try {
    const body = await request.json()
    const { amount } = body

    // Input validation
    if (typeof amount !== 'number' || amount < 1 || amount > 10000) {
      return NextResponse.json({ error: "水量无效，请输入 1-10000 之间的数值" }, { status: 400 })
    }

    const updated = await prisma.waterRecord.updateMany({
      where: { id, userId: session.user.id },
      data: { amount }
    })

    if (updated.count === 0) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 })
    }

    // Return the updated record
    const record = await prisma.waterRecord.findUnique({
      where: { id }
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error("更新饮水记录失败:", error)
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

  await prisma.waterRecord.deleteMany({
    where: { id, userId: session.user.id }
  })

  return NextResponse.json({ success: true })
}

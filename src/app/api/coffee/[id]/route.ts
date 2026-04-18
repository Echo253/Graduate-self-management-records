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
    const { brand, type, caffeine, customName } = body

    // Input validation
    if (!brand || typeof brand !== 'string') {
      return NextResponse.json({ error: "品牌不能为空" }, { status: 400 })
    }
    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: "品类不能为空" }, { status: 400 })
    }
    if (typeof caffeine !== 'number' || caffeine < 0 || caffeine > 1000) {
      return NextResponse.json({ error: "咖啡因含量无效" }, { status: 400 })
    }

    const updated = await prisma.coffeeRecord.updateMany({
      where: { id, userId: session.user.id },
      data: {
        brand,
        type,
        caffeine,
        customName: customName || null
      }
    })

    if (updated.count === 0) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 })
    }

    // Return the updated record
    const record = await prisma.coffeeRecord.findUnique({
      where: { id }
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error("更新咖啡记录失败:", error)
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

  await prisma.coffeeRecord.deleteMany({
    where: { id, userId: session.user.id }
  })

  return NextResponse.json({ success: true })
}

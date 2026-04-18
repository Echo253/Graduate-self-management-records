import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { completed, content } = body

    // 构建更新数据
    const updateData: { completed?: boolean; content?: string } = {}

    if (completed !== undefined) {
      updateData.completed = completed
    }

    if (content !== undefined) {
      if (typeof content !== "string" || !content.trim()) {
        return NextResponse.json({ error: "内容不能为空" }, { status: 400 })
      }
      updateData.content = content.trim()
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "没有要更新的内容" }, { status: 400 })
    }

    const todo = await prisma.todo.updateMany({
      where: { id, userId: session.user.id },
      data: updateData
    })

    return NextResponse.json(todo)
  } catch (error) {
    console.error("更新待办事项失败:", error)
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

  await prisma.todo.deleteMany({
    where: { id, userId: session.user.id }
  })

  return NextResponse.json({ success: true })
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const todos = await prisma.todo.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { completed: "asc" },
      { createdAt: "desc" }
    ]
  })

  return NextResponse.json({ todos })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const body = await request.json()
  const { content } = body

  const todo = await prisma.todo.create({
    data: {
      userId: session.user.id,
      content
    }
  })

  return NextResponse.json(todo)
}

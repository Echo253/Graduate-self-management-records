import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const body = await request.json()
  const { name } = body

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name }
  })

  return NextResponse.json({
    id: user.id,
    name: user.name
  })
}

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6个字符"),
  name: z.string().min(1, "请输入姓名"),
  studentId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, studentId } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        studentId: studentId || null
      }
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      studentId: user.studentId
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "注册失败" },
      { status: 500 }
    )
  }
}

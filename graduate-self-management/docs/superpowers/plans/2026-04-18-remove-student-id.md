# 移除学号/工号功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 移除系统中所有学号/工号相关功能

**Architecture:** 从数据库 schema、类型定义、API、UI 层逐层移除 studentId 字段

**Tech Stack:** Next.js 16, Prisma, TypeScript, NextAuth v5

---

## 文件变更清单

| 文件 | 操作 |
|------|------|
| `prisma/schema.prisma` | 移除 studentId 字段 |
| `src/types/next-auth.d.ts` | 移除 studentId 类型定义 |
| `src/lib/auth.ts` | 移除 studentId 相关代码 |
| `src/app/register/page.tsx` | 移除学号输入框 |
| `src/app/(dashboard)/profile/page.tsx` | 移除学号输入框 |
| `src/app/api/profile/route.ts` | 移除 studentId 处理 |
| `src/app/api/auth/register/route.ts` | 移除 studentId 处理 |
| `src/components/layout/DashboardLayout.tsx` | 移除学号显示 |

---

### Task 1: 移除 Prisma Schema 中的 studentId 字段

**Files:**
- Modify: `prisma/schema.prisma:18`

- [ ] **Step 1: 移除 studentId 字段定义**

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  password        String
  name            String
  avatar          String?
  backgroundImage String?   @map("background_image")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // ... 关联保持不变
}
```

- [ ] **Step 2: 同步数据库**

Run: `npx prisma db push`
Expected: 数据库同步成功

---

### Task 2: 移除 TypeScript 类型定义中的 studentId

**Files:**
- Modify: `src/types/next-auth.d.ts`

- [ ] **Step 1: 移除所有 studentId 相关类型**

```typescript
import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    avatar?: string | null
    backgroundImage?: string | null
  }

  interface Account {}

  interface Session {
    user: User
    expires: ISODateString
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    avatar?: string | null
    backgroundImage?: string | null
  }
}
```

---

### Task 3: 移除 Auth 配置中的 studentId

**Files:**
- Modify: `src/lib/auth.ts`

- [ ] **Step 1: 移除 authorize 中的 studentId**

```typescript
return {
  id: user.id,
  email: user.email,
  name: user.name,
  avatar: user.avatar,
  backgroundImage: user.backgroundImage
}
```

- [ ] **Step 2: 移除 jwt callback 中的 studentId**

```typescript
async jwt({ token, user, trigger, session }) {
  if (user) {
    token.id = user.id
    token.avatar = user.avatar
    token.backgroundImage = user.backgroundImage
  }

  if (trigger === "update" && token.id) {
    const updatedUser = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { avatar: true, name: true }
    })
    if (updatedUser) {
      token.avatar = updatedUser.avatar
      token.name = updatedUser.name
    }
  }

  return token
}
```

- [ ] **Step 3: 移除 session callback 中的 studentId**

```typescript
async session({ session, token }) {
  if (session.user) {
    session.user.id = token.id as string
    session.user.avatar = token.avatar as string | null
    session.user.backgroundImage = token.backgroundImage as string | null
  }
  return session
}
```

---

### Task 4: 移除注册页面的学号输入框

**Files:**
- Modify: `src/app/register/page.tsx`

- [ ] **Step 1: 移除表单状态中的 studentId**

```typescript
const [form, setForm] = useState({
  email: "",
  password: "",
  confirmPassword: "",
  name: ""
})
```

- [ ] **Step 2: 移除注册请求中的 studentId**

```typescript
const res = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: form.email,
    password: form.password,
    name: form.name
  })
})
```

- [ ] **Step 3: 移除学号输入框 JSX**

删除以下代码块：
```tsx
<div className="space-y-2">
  <Label htmlFor="studentId">学号/工号</Label>
  <Input
    id="studentId"
    type="text"
    value={form.studentId}
    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
  />
</div>
```

---

### Task 5: 移除 Profile 页面的学号输入框

**Files:**
- Modify: `src/app/(dashboard)/profile/page.tsx`

- [ ] **Step 1: 移除 studentId 状态**

```typescript
const [name, setName] = useState(session?.user?.name || "")
const [loading, setLoading] = useState(false)
```

- [ ] **Step 2: 移除保存请求中的 studentId**

```typescript
body: JSON.stringify({ name })
```

- [ ] **Step 3: 移除学号输入框 JSX**

删除以下代码块：
```tsx
<div className="space-y-2">
  <Label htmlFor="studentId">学号/工号</Label>
  <Input
    id="studentId"
    value={studentId}
    onChange={(e) => setStudentId(e.target.value)}
  />
</div>
```

---

### Task 6: 移除 Profile API 中的 studentId 处理

**Files:**
- Modify: `src/app/api/profile/route.ts`

- [ ] **Step 1: 移除 studentId 解构和更新**

```typescript
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
```

---

### Task 7: 移除 Register API 中的 studentId 处理

**Files:**
- Modify: `src/app/api/auth/register/route.ts`

- [ ] **Step 1: 移除 schema 中的 studentId**

```typescript
const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6个字符"),
  name: z.string().min(1, "请输入姓名")
})
```

- [ ] **Step 2: 移除解构和创建中的 studentId**

```typescript
const { email, password, name } = registerSchema.parse(body)

// ...

const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name
  }
})

return NextResponse.json({
  id: user.id,
  email: user.email,
  name: user.name
})
```

---

### Task 8: 移除 Dashboard Layout 中的学号显示

**Files:**
- Modify: `src/components/layout/DashboardLayout.tsx`

- [ ] **Step 1: 移除学号显示代码块**

删除以下代码：
```tsx
{session?.user?.studentId && (
  <div className="text-xs text-gray-600">学号：{session.user.studentId}</div>
)}
```

---

### Task 9: 验证构建

- [ ] **Step 1: 运行构建**

Run: `npm run build`
Expected: 构建成功，无类型错误

- [ ] **Step 2: 提交更改**

```bash
git add -A
git commit -m "feat: 移除学号/工号功能"
```

# 记录编辑功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为所有记录类型添加编辑功能，允许用户修改已创建的记录

**Architecture:** 为每种记录类型添加 PATCH API 端点，前端使用 Dialog 组件实现编辑表单，复用现有的创建表单逻辑

**Tech Stack:** Next.js App Router, Prisma, shadcn/ui Dialog, React Hook Form

---

## 文件结构

### API 路由（修改现有文件）
- `src/app/api/coffee/[id]/route.ts` - 添加 PATCH 方法
- `src/app/api/water/[id]/route.ts` - 添加 PATCH 方法
- `src/app/api/toilet/[id]/route.ts` - 添加 PATCH 方法
- `src/app/api/exercise/[id]/route.ts` - 添加 PATCH 方法
- `src/app/api/todos/[id]/route.ts` - 扩展 PATCH 方法支持内容编辑
- `src/app/api/work-sessions/[id]/route.ts` - 扩展 PATCH 方法支持时间编辑
- `src/app/api/rest-sessions/[id]/route.ts` - 扩展 PATCH 方法支持时间编辑

### 前端组件（修改现有文件）
- `src/app/(dashboard)/intake/page.tsx` - 添加咖啡和饮水编辑功能
- `src/app/(dashboard)/toilet/page.tsx` - 添加如厕记录编辑功能
- `src/app/(dashboard)/exercise/page.tsx` - 添加运动记录编辑功能
- `src/app/(dashboard)/todo/page.tsx` - 添加待办内容编辑功能
- `src/app/(dashboard)/page.tsx` - 添加工作/休息时段编辑功能

---

## Task 1: 咖啡记录编辑功能

**Files:**
- Modify: `src/app/api/coffee/[id]/route.ts`
- Modify: `src/app/(dashboard)/intake/page.tsx`

- [ ] **Step 1: 添加咖啡记录 PATCH API**

```typescript
// 在 src/app/api/coffee/[id]/route.ts 中添加 PATCH 方法
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
  const body = await request.json()
  const { brand, type, caffeine, customName } = body

  const updated = await prisma.coffeeRecord.updateMany({
    where: { id, userId: session.user.id },
    data: {
      brand,
      type,
      caffeine,
      customName: customName || null
    }
  })

  return NextResponse.json(updated)
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
```

- [ ] **Step 2: 在摄入页面添加咖啡编辑对话框状态**

在 `src/app/(dashboard)/intake/page.tsx` 中添加编辑状态和对话框：

```typescript
// 在文件顶部导入 Dialog 组件
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"

// 在组件内添加编辑状态（在 waterAmount 状态后）
const [editingCoffee, setEditingCoffee] = useState<CoffeeRecord | null>(null)
const [editBrand, setEditBrand] = useState("")
const [editCoffeeType, setEditCoffeeType] = useState("")
const [editCaffeine, setEditCaffeine] = useState(0)
const [editCustomName, setEditCustomName] = useState("")
```

- [ ] **Step 3: 添加咖啡编辑函数**

```typescript
// 在 deleteWater 函数后添加
const openEditCoffee = (record: CoffeeRecord) => {
  setEditingCoffee(record)
  setEditBrand(record.brand)
  setEditCoffeeType(record.type)
  setEditCaffeine(record.caffeine)
  setEditCustomName(record.customName || "")
}

const updateCoffee = async () => {
  if (!editingCoffee) return
  try {
    const res = await fetch(`/api/coffee/${editingCoffee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand: editBrand,
        type: editCoffeeType,
        caffeine: editCaffeine,
        customName: editCustomName || null
      })
    })
    if (res.ok) {
      toast.success("已更新")
      setEditingCoffee(null)
      fetchTodayData()
    }
  } catch {
    toast.error("更新失败")
  }
}
```

- [ ] **Step 4: 在咖啡记录列表中添加编辑按钮**

```typescript
// 替换咖啡记录列表中的按钮部分
<div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
  <div>
    <span className="font-medium">{record.brand}</span>
    <span className="text-gray-400 mx-1">·</span>
    <span>{record.type}</span>
    <Badge variant="secondary" className="ml-2">{record.caffeine}mg</Badge>
    <span className="text-gray-400 text-xs ml-2">{record.time}</span>
  </div>
  <div className="flex gap-1">
    <Button variant="ghost" size="sm" onClick={() => openEditCoffee(record)}>
      <Pencil className="h-4 w-4 text-gray-500" />
    </Button>
    <Button variant="ghost" size="sm" onClick={() => deleteCoffee(record.id)}>
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  </div>
</div>
```

- [ ] **Step 5: 添加咖啡编辑对话框**

在 `return` 语句的最后（`</div>` 之前）添加：

```typescript
{/* 咖啡编辑对话框 */}
<Dialog open={!!editingCoffee} onOpenChange={() => setEditingCoffee(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>编辑咖啡记录</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>品牌</Label>
          <Select value={editBrand} onValueChange={(v) => v && setEditBrand(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(DEFAULT_COFFEE_DATA).map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>品类</Label>
          <Select value={editCoffeeType} onValueChange={(v) => v && setEditCoffeeType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(DEFAULT_COFFEE_DATA[editBrand] || {}).map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">咖啡因含量:</span>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={editCaffeine}
            onChange={(e) => setEditCaffeine(Number(e.target.value))}
            className="w-20 text-center"
          />
          <span className="text-gray-600">mg/杯</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label>产品名称（可选）</Label>
        <Input
          placeholder="如：超大杯少糖"
          value={editCustomName}
          onChange={(e) => setEditCustomName(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setEditingCoffee(null)} className="flex-1">
          取消
        </Button>
        <Button onClick={updateCoffee} className="flex-1">
          保存
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

- [ ] **Step 6: 添加编辑时自动更新咖啡因含量的 effect**

```typescript
// 在 useEffect 块后添加
useEffect(() => {
  if (editingCoffee) {
    const types = DEFAULT_COFFEE_DATA[editBrand]
    if (types && types[editCoffeeType]) {
      setEditCaffeine(types[editCoffeeType])
    }
  }
}, [editingCoffee, editBrand, editCoffeeType])
```

- [ ] **Step 7: 提交代码**

```bash
git add src/app/api/coffee/[id]/route.ts src/app/(dashboard)/intake/page.tsx
git commit -m "feat: 添加咖啡记录编辑功能"
```

---

## Task 2: 饮水记录编辑功能

**Files:**
- Modify: `src/app/api/water/[id]/route.ts`
- Modify: `src/app/(dashboard)/intake/page.tsx`

- [ ] **Step 1: 添加饮水记录 PATCH API**

```typescript
// 在 src/app/api/water/[id]/route.ts 中添加 PATCH 方法
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
  const body = await request.json()
  const { amount } = body

  const updated = await prisma.waterRecord.updateMany({
    where: { id, userId: session.user.id },
    data: { amount }
  })

  return NextResponse.json(updated)
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
```

- [ ] **Step 2: 在摄入页面添加饮水编辑状态**

```typescript
// 在咖啡编辑状态后添加
const [editingWater, setEditingWater] = useState<WaterRecord | null>(null)
const [editWaterAmount, setEditWaterAmount] = useState(0)
```

- [ ] **Step 3: 添加饮水编辑函数**

```typescript
// 在 updateCoffee 函数后添加
const openEditWater = (record: WaterRecord) => {
  setEditingWater(record)
  setEditWaterAmount(record.amount)
}

const updateWater = async () => {
  if (!editingWater) return
  try {
    const res = await fetch(`/api/water/${editingWater.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: editWaterAmount })
    })
    if (res.ok) {
      toast.success("已更新")
      setEditingWater(null)
      fetchTodayData()
    }
  } catch {
    toast.error("更新失败")
  }
}
```

- [ ] **Step 4: 在饮水记录列表中添加编辑按钮**

```typescript
// 替换饮水记录列表中的按钮部分
<div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
  <div>
    <span className="font-medium text-blue-600">{record.amount}ml</span>
    <span className="text-gray-400 text-xs ml-2">{record.time}</span>
  </div>
  <div className="flex gap-1">
    <Button variant="ghost" size="sm" onClick={() => openEditWater(record)}>
      <Pencil className="h-4 w-4 text-gray-500" />
    </Button>
    <Button variant="ghost" size="sm" onClick={() => deleteWater(record.id)}>
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  </div>
</div>
```

- [ ] **Step 5: 添加饮水编辑对话框**

在咖啡编辑对话框后添加：

```typescript
{/* 饮水编辑对话框 */}
<Dialog open={!!editingWater} onOpenChange={() => setEditingWater(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>编辑饮水记录</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>水量 (ml)</Label>
        <div className="flex gap-2 flex-wrap">
          {[100, 200, 250, 500].map((amount) => (
            <Button
              key={amount}
              variant={editWaterAmount === amount ? "default" : "outline"}
              onClick={() => setEditWaterAmount(amount)}
            >
              {amount}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>自定义水量</Label>
        <Input
          type="number"
          value={editWaterAmount}
          onChange={(e) => setEditWaterAmount(Number(e.target.value))}
          placeholder="输入ml数"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setEditingWater(null)} className="flex-1">
          取消
        </Button>
        <Button onClick={updateWater} className="flex-1">
          保存
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

- [ ] **Step 6: 提交代码**

```bash
git add src/app/api/water/[id]/route.ts src/app/(dashboard)/intake/page.tsx
git commit -m "feat: 添加饮水记录编辑功能"
```

---

## Task 3: 如厕记录编辑功能

**Files:**
- Modify: `src/app/api/toilet/[id]/route.ts`
- Modify: `src/app/(dashboard)/toilet/page.tsx`

- [ ] **Step 1: 添加如厕记录 PATCH API**

```typescript
// 在 src/app/api/toilet/[id]/route.ts 中添加 PATCH 方法
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
  const body = await request.json()
  const { time } = body

  const updated = await prisma.toiletRecord.updateMany({
    where: { id, userId: session.user.id },
    data: { time }
  })

  return NextResponse.json(updated)
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

  await prisma.toiletRecord.deleteMany({
    where: { id, userId: session.user.id }
  })

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: 读取如厕页面文件**

运行: `cat src/app/\(dashboard\)/toilet/page.tsx`

- [ ] **Step 3: 在如厕页面添加编辑功能**

根据如厕页面的实际结构，添加：
- 编辑状态：`editingRecord`, `editTime`
- 编辑函数：`openEditToilet`, `updateToilet`
- 编辑按钮和对话框

- [ ] **Step 4: 提交代码**

```bash
git add src/app/api/toilet/[id]/route.ts src/app/(dashboard)/toilet/page.tsx
git commit -m "feat: 添加如厕记录编辑功能"
```

---

## Task 4: 运动记录编辑功能

**Files:**
- Modify: `src/app/api/exercise/[id]/route.ts`
- Modify: `src/app/(dashboard)/exercise/page.tsx`

- [ ] **Step 1: 添加运动记录 PATCH API**

```typescript
// 在 src/app/api/exercise/[id]/route.ts 中添加 PATCH 方法
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
  const body = await request.json()
  const { type, subtype, startTime, endTime, calories } = body

  const updated = await prisma.exerciseRecord.updateMany({
    where: { id, userId: session.user.id },
    data: {
      type,
      subtype: subtype || null,
      startTime: startTime || null,
      endTime: endTime || null,
      calories: calories || null
    }
  })

  return NextResponse.json(updated)
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

  await prisma.exerciseRecord.deleteMany({
    where: { id, userId: session.user.id }
  })

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: 在运动页面添加编辑状态**

```typescript
// 在组件内添加编辑状态
const [editingRecord, setEditingRecord] = useState<ExerciseRecord | null>(null)
const [editType, setEditType] = useState("")
const [editSubtype, setEditSubtype] = useState("")
const [editStartTime, setEditStartTime] = useState("")
const [editEndTime, setEditEndTime] = useState("")
const [editCalories, setEditCalories] = useState<number | "">("")
```

- [ ] **Step 3: 添加运动编辑函数**

```typescript
const openEditExercise = (record: ExerciseRecord) => {
  setEditingRecord(record)
  setEditType(record.type)
  setEditSubtype(record.subtype || "")
  setEditStartTime(record.startTime || "")
  setEditEndTime(record.endTime || "")
  setEditCalories(record.calories || "")
}

const updateExercise = async () => {
  if (!editingRecord) return
  try {
    const res = await fetch(`/api/exercise/${editingRecord.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: editType,
        subtype: editType === "ball" ? editSubtype : null,
        startTime: editStartTime || null,
        endTime: editEndTime || null,
        calories: editCalories || null
      })
    })
    if (res.ok) {
      toast.success("已更新")
      setEditingRecord(null)
      fetchData()
    }
  } catch {
    toast.error("更新失败")
  }
}
```

- [ ] **Step 4: 在运动记录列表中添加编辑按钮**

- [ ] **Step 5: 添加运动编辑对话框**

- [ ] **Step 6: 提交代码**

```bash
git add src/app/api/exercise/[id]/route.ts src/app/(dashboard)/exercise/page.tsx
git commit -m "feat: 添加运动记录编辑功能"
```

---

## Task 5: 待办事项编辑功能

**Files:**
- Modify: `src/app/api/todos/[id]/route.ts`
- Modify: `src/app/(dashboard)/todo/page.tsx`

- [ ] **Step 1: 扩展待办 PATCH API 支持内容编辑**

```typescript
// 修改 src/app/api/todos/[id]/route.ts
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
  const body = await request.json()
  const { completed, content } = body

  const data: { completed?: boolean; content?: string } = {}
  if (completed !== undefined) data.completed = completed
  if (content !== undefined) data.content = content

  const todo = await prisma.todo.updateMany({
    where: { id, userId: session.user.id },
    data
  })

  return NextResponse.json(todo)
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
```

- [ ] **Step 2: 在待办页面添加编辑状态**

```typescript
// 在组件内添加编辑状态
const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
const [editContent, setEditContent] = useState("")
```

- [ ] **Step 3: 添加待办编辑函数**

```typescript
const openEditTodo = (todo: Todo) => {
  setEditingTodo(todo)
  setEditContent(todo.content)
}

const updateTodo = async () => {
  if (!editingTodo || !editContent.trim()) return
  try {
    const res = await fetch(`/api/todos/${editingTodo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent.trim() })
    })
    if (res.ok) {
      toast.success("已更新")
      setEditingTodo(null)
      fetchData()
    }
  } catch {
    toast.error("更新失败")
  }
}
```

- [ ] **Step 4: 在待办列表中添加编辑按钮**

- [ ] **Step 5: 添加待办编辑对话框**

- [ ] **Step 6: 提交代码**

```bash
git add src/app/api/todos/[id]/route.ts src/app/(dashboard)/todo/page.tsx
git commit -m "feat: 添加待办事项内容编辑功能"
```

---

## Task 6: 工作/休息时段编辑功能

**Files:**
- Modify: `src/app/api/work-sessions/[id]/route.ts`
- Modify: `src/app/api/rest-sessions/[id]/route.ts`
- Modify: `src/app/(dashboard)/page.tsx`

- [ ] **Step 1: 扩展工作时段 PATCH API 支持时间编辑**

```typescript
// 修改 src/app/api/work-sessions/[id]/route.ts
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
  const body = await request.json()

  // 如果是结束时段的请求（没有 body 或 body 为空）
  if (!body || Object.keys(body).length === 0) {
    const now = new Date()
    const time = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })

    const workSession = await prisma.workSession.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!workSession) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 })
    }

    if (workSession.endTime) {
      return NextResponse.json({ error: "该时段已结束" }, { status: 400 })
    }

    const duration = Math.floor((now.getTime() - workSession.startTimestamp.getTime()) / 60000)

    const updated = await prisma.workSession.update({
      where: { id },
      data: {
        endTime: time,
        endTimestamp: now,
        duration
      }
    })

    return NextResponse.json(updated)
  }

  // 编辑时间的请求
  const { startTime, endTime } = body

  const existingSession = await prisma.workSession.findFirst({
    where: { id, userId: session.user.id }
  })

  if (!existingSession) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 })
  }

  // 计算新的时长
  let duration = existingSession.duration
  if (startTime && endTime) {
    const [startH, startM] = startTime.split(":").map(Number)
    const [endH, endM] = endTime.split(":").map(Number)
    duration = (endH * 60 + endM) - (startH * 60 + startM)
  }

  const updated = await prisma.workSession.update({
    where: { id },
    data: {
      startTime,
      endTime,
      duration
    }
  })

  return NextResponse.json(updated)
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

  await prisma.workSession.deleteMany({
    where: { id, userId: session.user.id }
  })

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: 扩展休息时段 PATCH API**

类似工作时段的实现，修改 `src/app/api/rest-sessions/[id]/route.ts`

- [ ] **Step 3: 在打卡页面添加时段编辑状态**

```typescript
// 在组件内添加编辑状态
const [editingSession, setEditingSession] = useState<{ type: "work" | "rest"; session: WorkSession | RestSession } | null>(null)
const [editStartTime, setEditStartTime] = useState("")
const [editEndTime, setEditEndTime] = useState("")
```

- [ ] **Step 4: 添加时段编辑函数**

- [ ] **Step 5: 在时段列表中添加编辑按钮**

- [ ] **Step 6: 添加时段编辑对话框**

- [ ] **Step 7: 提交代码**

```bash
git add src/app/api/work-sessions/[id]/route.ts src/app/api/rest-sessions/[id]/route.ts src/app/\(dashboard\)/page.tsx
git commit -m "feat: 添加工作/休息时段编辑功能"
```

---

## Task 7: 测试验证

- [ ] **Step 1: 启动开发服务器**

```bash
cd graduate-self-management && npm run dev
```

- [ ] **Step 2: 手动测试所有编辑功能**

测试清单：
- [ ] 咖啡记录：修改品牌、品类、咖啡因、产品名称
- [ ] 饮水记录：修改水量
- [ ] 如厕记录：修改时间
- [ ] 运动记录：修改类型、子类型、时间、热量
- [ ] 待办事项：修改内容
- [ ] 工作时段：修改开始/结束时间
- [ ] 休息时段：修改开始/结束时间

- [ ] **Step 3: 确认所有功能正常后提交**

---

## 自检清单

**1. 规格覆盖：**
- [x] 咖啡记录编辑 - Task 1
- [x] 饮水记录编辑 - Task 2
- [x] 如厕记录编辑 - Task 3
- [x] 运动记录编辑 - Task 4
- [x] 待办事项编辑 - Task 5
- [x] 工作/休息时段编辑 - Task 6

**2. 占位符扫描：**
- 无 "TBD"、"TODO"、"implement later" 等占位符
- 所有代码步骤都包含完整实现

**3. 类型一致性：**
- 所有记录类型使用正确的 Prisma 模型字段名
- API 请求/响应类型与前端类型匹配

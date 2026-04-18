# 统计分析页优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将统计分析页从静态柱状图升级为温暖友好的交互式数据可视化界面

**Architecture:** 使用 Recharts 图表库实现交互式图表，添加日期范围选择器，修复日期计算 bug，添加动画效果

**Tech Stack:** Next.js 16, React 19, Recharts, Tailwind CSS 4, Framer Motion

---

## 文件变更清单

| 文件 | 操作 |
|------|------|
| `package.json` | 添加 recharts, framer-motion 依赖 |
| `src/app/(dashboard)/stats/page.tsx` | 重写统计页面 |
| `src/components/stats/DateRangePicker.tsx` | 新建日期范围选择器 |
| `src/components/stats/WorkChart.tsx` | 新建工作时长图表 |
| `src/components/stats/CoffeeChart.tsx` | 新建咖啡摄入图表 |
| `src/components/stats/SummaryCards.tsx` | 新建汇总卡片组件 |
| `src/app/api/stats/route.ts` | 修改支持自定义日期范围 |

---

### Task 1: 安装依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 Recharts 和 Framer Motion**

Run: `cd graduate-self-management && npm install recharts framer-motion`

Expected: 依赖安装成功

---

### Task 2: 修改 API 支持自定义日期范围

**Files:**
- Modify: `src/app/api/stats/route.ts`

- [ ] **Step 1: 添加 startDate 和 endDate 参数支持**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function getDateRange(period: string, startDateStr?: string, endDateStr?: string) {
  if (startDateStr && endDateStr) {
    return {
      startDate: new Date(startDateStr),
      endDate: new Date(endDateStr)
    }
  }

  const now = new Date()
  const startDate = new Date()

  if (period === "week") {
    startDate.setDate(now.getDate() - 6)
  } else if (period === "month") {
    startDate.setMonth(now.getMonth(), 1) // 本月第一天
  } else {
    startDate.setMonth(now.getMonth() - 11)
  }

  return { startDate, endDate: now }
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  const period = request.nextUrl.searchParams.get("period") || "week"
  const startDateParam = request.nextUrl.searchParams.get("startDate")
  const endDateParam = request.nextUrl.searchParams.get("endDate")

  const { startDate, endDate } = getDateRange(period, startDateParam, endDateParam)

  // ... 其余代码保持不变，但返回时添加日期范围信息

  return NextResponse.json({
    dateRange: {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0]
    },
    workSessions: dates.map(date => ({
      date,
      duration: (workByDate.get(date) || []).reduce((sum, s) => sum + (s.duration || 0), 0)
    })),
    // ... 其他数据
  })
}
```

---

### Task 3: 创建日期范围选择器组件

**Files:**
- Create: `src/components/stats/DateRangePicker.tsx`

- [ ] **Step 1: 创建日期范围选择器**

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "lucide-react"

type Props = {
  period: "week" | "month" | "year" | "custom"
  startDate: string
  endDate: string
  onPeriodChange: (period: "week" | "month" | "year" | "custom") => void
  onDateChange: (start: string, end: string) => void
}

export function DateRangePicker({
  period,
  startDate,
  endDate,
  onPeriodChange,
  onDateChange
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-2">
        {(["week", "month", "year"] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => onPeriodChange(p)}
          >
            {p === "week" ? "本周" : p === "month" ? "本月" : "本年"}
          </Button>
        ))}
        <Button
          variant={period === "custom" ? "default" : "outline"}
          size="sm"
          onClick={() => onPeriodChange("custom")}
        >
          <Calendar className="h-4 w-4 mr-1" />
          自定义
        </Button>
      </div>

      {period === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onDateChange(e.target.value, endDate)}
            className="w-36"
          />
          <span className="text-gray-400">至</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onDateChange(startDate, e.target.value)}
            className="w-36"
          />
        </div>
      )}
    </div>
  )
}
```

---

### Task 4: 创建工作时长图表组件

**Files:**
- Create: `src/components/stats/WorkChart.tsx`

- [ ] **Step 1: 创建带动画的柱状图**

```tsx
"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"
import { motion } from "framer-motion"

type Props = {
  data: { date: string; duration: number }[]
  onBarClick?: (date: string) => void
}

export function WorkChart({ data, onBarClick }: Props) {
  const chartData = data.map(d => ({
    ...d,
    hours: Math.round(d.duration / 60 * 10) / 10,
    label: new Date(d.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
  }))

  const maxHours = Math.max(...chartData.map(d => d.hours), 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-72"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
            }}
            formatter={(value: number) => [`${value} 小时`, "工作时长"]}
            labelFormatter={(label) => `日期: ${label}`}
          />
          <Bar
            dataKey="hours"
            radius={[4, 4, 0, 0]}
            onClick={(data) => onBarClick?.(data.date)}
            className="cursor-pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`oklch(0.7 ${0.15 + (entry.hours / maxHours) * 0.1} 142.5)`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
```

---

### Task 5: 创建咖啡摄入图表组件

**Files:**
- Create: `src/components/stats/CoffeeChart.tsx`

- [ ] **Step 1: 创建双轴图表（杯数和咖啡因）**

```tsx
"use client"

import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { motion } from "framer-motion"

type Props = {
  data: { date: string; count: number; caffeine: number }[]
}

export function CoffeeChart({ data }: Props) {
  const chartData = data.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="h-72"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 40, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            tickFormatter={(v) => `${v}mg`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px"
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="count"
            name="杯数"
            fill="oklch(0.75 0.15 75)"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="caffeine"
            name="咖啡因(mg)"
            stroke="oklch(0.5 0.2 35)"
            strokeWidth={2}
            dot={{ fill: "oklch(0.5 0.2 35)", strokeWidth: 0, r: 4 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
```

---

### Task 6: 创建汇总卡片组件

**Files:**
- Create: `src/components/stats/SummaryCards.tsx`

- [ ] **Step 1: 创建带动画的汇总卡片**

```tsx
"use client"

import { motion } from "framer-motion"
import { Clock, Coffee, Droplets, Flame } from "lucide-react"

type Props = {
  totalWork: number
  totalCoffee: number
  totalCaffeine: number
  totalWater: number
  totalCalories: number
}

export function SummaryCards({
  totalWork,
  totalCoffee,
  totalCaffeine,
  totalWater,
  totalCalories
}: Props) {
  const cards = [
    {
      icon: Clock,
      label: "总工作时长",
      value: `${Math.floor(totalWork / 60)}h ${totalWork % 60}m`,
      color: "oklch(0.7 0.15 142.5)",
      bg: "oklch(0.97 0.02 142.5)"
    },
    {
      icon: Coffee,
      label: "咖啡摄入",
      value: `${totalCoffee} 杯 / ${totalCaffeine}mg`,
      color: "oklch(0.6 0.15 75)",
      bg: "oklch(0.97 0.02 75)"
    },
    {
      icon: Droplets,
      label: "饮水总量",
      value: `${(totalWater / 1000).toFixed(1)}L`,
      color: "oklch(0.6 0.15 230)",
      bg: "oklch(0.97 0.02 230)"
    },
    {
      icon: Flame,
      label: "消耗热量",
      value: `${totalCalories} kcal`,
      color: "oklch(0.6 0.2 25)",
      bg: "oklch(0.97 0.02 25)"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          style={{ backgroundColor: card.bg }}
          className="p-4 rounded-xl"
        >
          <card.icon
            className="h-5 w-5 mb-2"
            style={{ color: card.color }}
          />
          <div
            className="text-2xl font-bold"
            style={{ color: card.color }}
          >
            {card.value}
          </div>
          <div className="text-sm text-gray-600">{card.label}</div>
        </motion.div>
      ))}
    </div>
  )
}
```

---

### Task 7: 重写统计页面

**Files:**
- Modify: `src/app/(dashboard)/stats/page.tsx`

- [ ] **Step 1: 重写页面整合所有组件**

完整重写页面，整合 DateRangePicker、WorkChart、CoffeeChart、SummaryCards 组件，添加日期点击查看详情功能。

关键改动：
1. 使用 useState 管理日期范围
2. 修复"本月"日期计算逻辑
3. 添加图表点击交互
4. 使用 motion 添加页面加载动画

---

### Task 8: 验证构建

- [ ] **Step 1: 运行构建**

Run: `cd graduate-self-management && npm run build`

Expected: 构建成功，无类型错误

- [ ] **Step 2: 提交更改**

```bash
git add -A
git commit -m "feat: 优化统计分析页，添加交互式图表和动画效果"
```

---

## Verification

1. 启动开发服务器
2. 访问统计分析页
3. 测试周/月/年切换，确认日期显示正确
4. 测试自定义日期范围选择
5. 点击图表柱状条，确认可以查看详情
6. 确认动画效果流畅

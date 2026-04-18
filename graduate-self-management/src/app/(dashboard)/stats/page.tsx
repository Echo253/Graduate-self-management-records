"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Calendar } from "lucide-react"
import { toast } from "sonner"

type StatsData = {
  workSessions: { date: string; duration: number }[]
  restSessions: { date: string; duration: number }[]
  coffeeRecords: { date: string; count: number; caffeine: number }[]
  waterRecords: { date: string; amount: number }[]
  exerciseRecords: { date: string; count: number; calories: number }[]
}

export default function StatsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week")
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")
  const [dateSummary, setDateSummary] = useState<any>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/stats?period=${period}`)
      const data = await res.json()
      setStats(data)
    } catch {
      toast.error("获取统计数据失败")
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const viewDate = async () => {
    if (!selectedDate) return
    try {
      const res = await fetch(`/api/stats/date?date=${selectedDate}`)
      const data = await res.json()
      setDateSummary(data)
    } catch {
      toast.error("获取数据失败")
    }
  }

  const getLabels = () => {
    const labels: string[] = []
    const now = new Date()

    if (period === "week") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        labels.push(d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }))
      }
    } else if (period === "month") {
      for (let i = 29; i >= 0; i -= 3) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        labels.push(d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }))
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now)
        d.setMonth(d.getMonth() - i)
        labels.push(d.toLocaleDateString("zh-CN", { month: "short" }))
      }
    }
    return labels
  }

  const getWorkData = () => {
    if (!stats) return []
    const labels = getLabels()
    return labels.map((_, i) => {
      const idx = period === "week" ? i : period === "month" ? Math.floor(i / 3) : i
      return stats.workSessions[idx]?.duration || 0
    })
  }

  const getCoffeeData = () => {
    if (!stats) return { counts: [], caffeine: [] }
    const labels = getLabels()
    const counts = labels.map((_, i) => stats.coffeeRecords[i]?.count || 0)
    const caffeine = labels.map((_, i) => stats.coffeeRecords[i]?.caffeine || 0)
    return { counts, caffeine }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  const labels = getLabels()
  const workData = getWorkData()
  const coffeeData = getCoffeeData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">统计分析</h1>

      {/* 日期查看 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            查看指定日期
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-center">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
            <Button onClick={viewDate}>查看</Button>
          </div>

          {dateSummary && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{dateSummary.workMinutes}分钟</div>
                <div className="text-xs text-gray-600">工作时长</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-amber-600">{dateSummary.coffeeCount}杯</div>
                <div className="text-xs text-gray-600">咖啡</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{dateSummary.waterAmount}ml</div>
                <div className="text-xs text-gray-600">饮水</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-rose-600">{dateSummary.exerciseCount}次</div>
                <div className="text-xs text-gray-600">运动</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 周期选择 */}
      <div className="flex gap-3">
        {(["week", "month", "year"] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            onClick={() => setPeriod(p)}
          >
            {p === "week" ? "本周" : p === "month" ? "本月" : "本年"}
          </Button>
        ))}
      </div>

      {/* 图表 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">每日工作时长（小时）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {labels.map((label, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${Math.max((workData[i] / 60) * 10, 4)}px` }}
                  />
                  <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">咖啡摄入</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {labels.map((label, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-amber-500 rounded-t"
                    style={{ height: `${Math.max(coffeeData.counts[i] * 20, 4)}px` }}
                  />
                  <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 汇总 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            汇总统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats?.workSessions.reduce((sum, s) => sum + s.duration, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">总工作分钟</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {stats?.coffeeRecords.reduce((sum, s) => sum + s.count, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">总咖啡杯数</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.waterRecords.reduce((sum, s) => sum + s.amount, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">总饮水量(ml)</div>
            </div>
            <div className="text-center p-4 bg-rose-50 rounded-lg">
              <div className="text-2xl font-bold text-rose-600">
                {stats?.exerciseRecords.reduce((sum, s) => sum + s.calories, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">总消耗(kcal)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

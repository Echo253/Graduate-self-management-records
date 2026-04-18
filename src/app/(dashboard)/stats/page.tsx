"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import { DateRangePicker } from "@/components/stats/DateRangePicker"
import { WorkChart } from "@/components/stats/WorkChart"
import { CoffeeChart } from "@/components/stats/CoffeeChart"
import { SummaryCards } from "@/components/stats/SummaryCards"

type StatsData = {
  dateRange: {
    startDate: string
    endDate: string
  }
  workSessions: { date: string; duration: number }[]
  coffeeRecords: { date: string; count: number; caffeine: number }[]
  waterRecords: { date: string; amount: number }[]
  exerciseRecords: { date: string; count: number; calories: number }[]
}

export default function StatsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year" | "custom">("week")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (period === "custom" && startDate && endDate) {
        params.set("startDate", startDate)
        params.set("endDate", endDate)
      } else {
        params.set("period", period)
      }
      const res = await fetch(`/api/stats?${params}`)
      const data = await res.json()
      setStats(data)
    } catch {
      toast.error("获取统计数据失败")
    } finally {
      setLoading(false)
    }
  }, [period, startDate, endDate])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handlePeriodChange = (newPeriod: "week" | "month" | "year" | "custom") => {
    setPeriod(newPeriod)
    if (newPeriod !== "custom") {
      setStartDate("")
      setEndDate("")
    }
  }

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  const handleBarClick = async (date: string) => {
    try {
      const res = await fetch(`/api/stats/date?date=${date}`)
      const data = await res.json()
      toast.success(
        `${date}: 工作${data.workMinutes}分钟, 咖啡${data.coffeeCount}杯, 饮水${data.waterAmount}ml`
      )
    } catch {
      toast.error("获取详情失败")
    }
  }

  const formatDateRange = () => {
    if (!stats?.dateRange) return ""
    const start = new Date(stats.dateRange.startDate).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric"
    })
    const end = new Date(stats.dateRange.endDate).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric"
    })
    return `${start} - ${end}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          加载中...
        </motion.div>
      </div>
    )
  }

  const totalWork = stats?.workSessions.reduce((sum, s) => sum + s.duration, 0) || 0
  const totalCoffee = stats?.coffeeRecords.reduce((sum, s) => sum + s.count, 0) || 0
  const totalCaffeine = stats?.coffeeRecords.reduce((sum, s) => sum + s.caffeine, 0) || 0
  const totalWater = stats?.waterRecords.reduce((sum, s) => sum + s.amount, 0) || 0
  const totalCalories = stats?.exerciseRecords.reduce((sum, s) => sum + s.calories, 0) || 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">统计分析</h1>
        <DateRangePicker
          period={period}
          startDate={startDate}
          endDate={endDate}
          onPeriodChange={handlePeriodChange}
          onDateChange={handleDateChange}
        />
      </div>

      {stats?.dateRange && (
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {formatDateRange()}
        </p>
      )}

      <SummaryCards
        totalWork={totalWork}
        totalCoffee={totalCoffee}
        totalCaffeine={totalCaffeine}
        totalWater={totalWater}
        totalCalories={totalCalories}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">工作时长</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkChart
              data={stats?.workSessions || []}
              onBarClick={handleBarClick}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">咖啡摄入</CardTitle>
          </CardHeader>
          <CardContent>
            <CoffeeChart data={stats?.coffeeRecords || []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            详细数据
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats?.workSessions.length || 0}
              </div>
              <div className="text-sm text-gray-600">记录天数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {totalCoffee}
              </div>
              <div className="text-sm text-gray-600">总咖啡杯数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {(totalWater / 1000).toFixed(1)}L
              </div>
              <div className="text-sm text-gray-600">总饮水量</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-600">
                {totalCalories}
              </div>
              <div className="text-sm text-gray-600">总消耗热量</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

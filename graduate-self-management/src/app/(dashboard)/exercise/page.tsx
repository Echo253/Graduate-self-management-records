"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Activity, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

const EXERCISE_TYPES = [
  { type: "running", label: "跑步", emoji: "🏃", caloriesPerMin: 10 },
  { type: "cycling", label: "骑行", emoji: "🚴", caloriesPerMin: 8 },
  { type: "swimming", label: "游泳", emoji: "🏊", caloriesPerMin: 12 },
  { type: "ball", label: "球类", emoji: "⚽", caloriesPerMin: 7 },
  { type: "gym", label: "健身", emoji: "🏋️", caloriesPerMin: 6 },
  { type: "yoga", label: "瑜伽", emoji: "🧘", caloriesPerMin: 4 },
  { type: "walking", label: "散步", emoji: "🚶", caloriesPerMin: 3 },
  { type: "other", label: "其他", emoji: "💪", caloriesPerMin: 5 }
]

const BALL_TYPES = ["篮球", "足球", "羽毛球", "网球", "乒乓球", "排球"]

type ExerciseRecord = {
  id: string
  type: string
  subtype: string | null
  startTime: string | null
  endTime: string | null
  calories: number | null
}

export default function ExercisePage() {
  const [records, setRecords] = useState<ExerciseRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedType, setSelectedType] = useState("running")
  const [subtype, setSubtype] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [calories, setCalories] = useState<number | "">("")

  const today = new Date().toISOString().split("T")[0]

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/exercise?date=${today}`)
      const data = await res.json()
      setRecords(data.records)
    } catch {
      toast.error("获取数据失败")
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getExerciseMeta = (type: string) => {
    return EXERCISE_TYPES.find(e => e.type === type) || EXERCISE_TYPES[EXERCISE_TYPES.length - 1]
  }

  const addExercise = async () => {
    try {
      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          subtype: selectedType === "ball" ? subtype : null,
          startTime: startTime || null,
          endTime: endTime || null,
          calories: calories || null
        })
      })
      if (res.ok) {
        toast.success("已记录运动")
        setSubtype("")
        setStartTime("")
        setEndTime("")
        setCalories("")
        fetchData()
      }
    } catch {
      toast.error("操作失败")
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/exercise/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("已删除")
        fetchData()
      }
    } catch {
      toast.error("删除失败")
    }
  }

  const totalCalories = records.reduce((sum, r) => sum + (r.calories || 0), 0)

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">运动记录</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-rose-600" />
            选择运动类型
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EXERCISE_TYPES.map((item) => (
              <Button
                key={item.type}
                variant={selectedType === item.type ? "default" : "outline"}
                onClick={() => setSelectedType(item.type)}
                className="h-auto py-3"
              >
                <span className="text-xl mr-2">{item.emoji}</span>
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">记录运动</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">当前运动：</span>
              <span className="font-medium ml-2">
                {getExerciseMeta(selectedType).emoji} {getExerciseMeta(selectedType).label}
              </span>
            </div>

            {selectedType === "ball" && (
              <div className="space-y-2">
                <Label>球类运动</Label>
                <Select value={subtype} onValueChange={setSubtype}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择球类" />
                  </SelectTrigger>
                  <SelectContent>
                    {BALL_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>开始时间</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>结束时间</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>热量消耗 (kcal，可不填)</Label>
              <Input
                type="number"
                placeholder="例如 320"
                value={calories}
                onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : "")}
              />
            </div>

            <Button onClick={addExercise} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              记录运动
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">今日运动汇总</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 text-center border">
                <div className="text-2xl font-bold text-rose-500">{records.length}</div>
                <div className="text-xs text-gray-500">记录次数</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border">
                <div className="text-2xl font-bold text-orange-500">{totalCalories}</div>
                <div className="text-xs text-gray-500">总消耗(kcal)</div>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {records.length === 0 ? (
                <p className="text-gray-500 text-sm">暂无运动记录</p>
              ) : (
                records.map((record) => {
                  const meta = getExerciseMeta(record.type)
                  const name = record.type === "ball" && record.subtype
                    ? `${meta.label}-${record.subtype}`
                    : meta.label
                  return (
                    <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <span className="mr-1">{meta.emoji}</span>
                        <span className="font-medium">{name}</span>
                        {record.calories && (
                          <Badge variant="secondary" className="ml-2">{record.calories}kcal</Badge>
                        )}
                        {(record.startTime || record.endTime) && (
                          <span className="text-gray-400 text-xs ml-2">
                            {record.startTime || "--:--"}-{record.endTime || "--:--"}
                          </span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteRecord(record.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

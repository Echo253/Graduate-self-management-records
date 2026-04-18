"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Undo, Trash2 } from "lucide-react"
import { toast } from "sonner"

type ToiletRecord = {
  id: string
  time: string
}

export default function ToiletPage() {
  const [records, setRecords] = useState<ToiletRecord[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split("T")[0]

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/toilet?date=${today}`)
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

  const addToilet = async () => {
    try {
      const res = await fetch("/api/toilet", { method: "POST" })
      if (res.ok) {
        toast.success("已记录")
        fetchData()
      }
    } catch {
      toast.error("操作失败")
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/toilet/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("已删除")
        fetchData()
      }
    } catch {
      toast.error("删除失败")
    }
  }

  const undoLast = async () => {
    if (records.length === 0) {
      toast.error("没有可撤销的记录")
      return
    }
    const lastRecord = records[records.length - 1]
    await deleteRecord(lastRecord.id)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">如厕记录</h1>

      <Card>
        <CardHeader>
          <CardTitle>今日入厕次数</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-2">{records.length}</div>
            <p className="text-gray-600">次</p>
          </div>

          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={addToilet} className="gap-2">
              <Plus className="h-5 w-5" />
              入厕记录
            </Button>
            <Button size="lg" variant="secondary" onClick={undoLast} className="gap-2">
              <Undo className="h-5 w-5" />
              撤销
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">今日入厕记录</CardTitle>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <p className="text-gray-500 text-sm">暂无记录</p>
                ) : (
                  <div className="space-y-2">
                    {records.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span>{record.time}</span>
                        <Button variant="ghost" size="sm" onClick={() => deleteRecord(record.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">说明</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 点击"入厕记录"按钮记录</li>
                  <li>• 如记录错误，可点击"撤销"按钮</li>
                  <li>• 数据已保存到云端</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

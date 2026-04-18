"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton"
import { Play, Pause, Square, RotateCcw, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

type WorkSession = {
  id: string
  startTime: string
  endTime: string | null
  startTimestamp: string
  endTimestamp: string | null
  duration: number | null
}

type RestSession = {
  id: string
  startTime: string
  endTime: string | null
  startTimestamp: string
  endTimestamp: string | null
  duration: number | null
}

type TodayData = {
  workSessions: WorkSession[]
  restSessions: RestSession[]
  totalWork: number
  totalRest: number
  activeWorkSession: WorkSession | null
  activeRestSession: RestSession | null
}

type EditingSession = {
  type: "work" | "rest"
  session: WorkSession | RestSession
}

export default function CheckinPage() {
  const { data: session } = useSession()
  const [todayData, setTodayData] = useState<TodayData>({
    workSessions: [],
    restSessions: [],
    totalWork: 0,
    totalRest: 0,
    activeWorkSession: null,
    activeRestSession: null
  })
  const [loading, setLoading] = useState(true)
  const [timer, setTimer] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [editingSession, setEditingSession] = useState<EditingSession | null>(null)
  const [editStartTime, setEditStartTime] = useState("")
  const [editEndTime, setEditEndTime] = useState("")

  const today = new Date().toISOString().split("T")[0]

  const fetchTodayData = useCallback(async () => {
    try {
      const res = await fetch(`/api/work-sessions?date=${today}`)
      const data = await res.json()
      setTodayData(data)
    } catch {
      toast.error("获取数据失败")
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    fetchTodayData()
  }, [fetchTodayData])

  // 工作计时器
  useEffect(() => {
    if (todayData.activeWorkSession) {
      const start = new Date(todayData.activeWorkSession.startTimestamp).getTime()
      const interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - start) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setTimer(0)
    }
  }, [todayData.activeWorkSession])

  // 休息计时器
  useEffect(() => {
    if (todayData.activeRestSession) {
      const start = new Date(todayData.activeRestSession.startTimestamp).getTime()
      const interval = setInterval(() => {
        setRestTimer(Math.floor((Date.now() - start) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setRestTimer(0)
    }
  }, [todayData.activeRestSession])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const startWork = async () => {
    try {
      const res = await fetch("/api/work-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "work" })
      })
      if (res.ok) {
        toast.success("开始工作")
        fetchTodayData()
      }
    } catch {
      toast.error("操作失败")
    }
  }

  const startRest = async () => {
    try {
      const res = await fetch("/api/work-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rest" })
      })
      if (res.ok) {
        toast.success("开始休息")
        fetchTodayData()
      }
    } catch {
      toast.error("操作失败")
    }
  }

  const endWork = async () => {
    if (!todayData.activeWorkSession) return
    try {
      const res = await fetch(`/api/work-sessions/${todayData.activeWorkSession.id}`, {
        method: "PATCH"
      })
      if (res.ok) {
        toast.success("工作结束")
        fetchTodayData()
      }
    } catch {
      toast.error("操作失败")
    }
  }

  const endRest = async () => {
    if (!todayData.activeRestSession) return
    try {
      const res = await fetch(`/api/rest-sessions/${todayData.activeRestSession.id}`, {
        method: "PATCH"
      })
      if (res.ok) {
        toast.success("休息结束")
        fetchTodayData()
      }
    } catch {
      toast.error("操作失败")
    }
  }

  const deleteSession = async (type: "work" | "rest", id: string) => {
    try {
      const res = await fetch(`/api/${type === "work" ? "work-sessions" : "rest-sessions"}/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success("已删除")
        fetchTodayData()
      }
    } catch {
      toast.error("删除失败")
    }
  }

  const openEditSession = (type: "work" | "rest", session: WorkSession | RestSession) => {
    setEditingSession({ type, session })
    setEditStartTime(session.startTime)
    setEditEndTime(session.endTime || "")
  }

  const updateSession = async () => {
    if (!editingSession) return

    const body: { startTime?: string; endTime?: string } = {}
    if (editStartTime) body.startTime = editStartTime
    if (editEndTime) body.endTime = editEndTime

    try {
      const endpoint = editingSession.type === "work" ? "work-sessions" : "rest-sessions"
      const res = await fetch(`/api/${endpoint}/${editingSession.session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        toast.success("更新成功")
        setEditingSession(null)
        fetchTodayData()
      } else {
        const data = await res.json()
        toast.error(data.error || "更新失败")
      }
    } catch {
      toast.error("更新失败")
    }
  }

  const isWorking = !!todayData.activeWorkSession
  const isResting = !!todayData.activeRestSession

  if (loading) {
    return <LoadingSkeleton type="page" />
  }

  return (
    <div className="space-y-6">
      {/* 计时器卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            打卡记录
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 状态显示 */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">
              {isWorking ? "工作中" : isResting ? "休息中" : "空闲中"}
            </div>
            <div className="text-2xl text-muted-foreground">{formatTime(timer)}</div>
            {isResting && (
              <div className="text-lg text-muted-foreground">休息: {formatTime(restTimer)}</div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center gap-4 flex-wrap">
            {!isWorking && !isResting && (
              <Button size="lg" onClick={startWork} className="gap-2">
                <Play className="h-5 w-5" />
                开始上班
              </Button>
            )}
            {isWorking && !isResting && (
              <>
                <Button size="lg" variant="secondary" onClick={startRest} className="gap-2">
                  <Pause className="h-5 w-5" />
                  休息一下
                </Button>
                <Button size="lg" variant="destructive" onClick={endWork} className="gap-2">
                  <Square className="h-5 w-5" />
                  下班
                </Button>
              </>
            )}
            {isResting && (
              <Button size="lg" onClick={endRest} className="gap-2">
                <RotateCcw className="h-5 w-5" />
                继续上班
              </Button>
            )}
          </div>

          {/* 今日统计 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[oklch(0.95_0.05_250)] dark:bg-[oklch(0.25_0.05_250)] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[var(--color-work)]">{todayData.totalWork}</div>
              <div className="text-xs text-muted-foreground">工作(分钟)</div>
            </div>
            <div className="bg-[oklch(0.95_0.05_142)] dark:bg-[oklch(0.25_0.05_142)] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[var(--color-rest)]">{todayData.totalRest}</div>
              <div className="text-xs text-muted-foreground">休息(分钟)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 时段记录 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">今日工作时段</CardTitle>
          </CardHeader>
          <CardContent>
            {todayData.workSessions.length === 0 ? (
              <p className="text-muted-foreground text-sm">暂无工作记录</p>
            ) : (
              <div className="space-y-2">
                {todayData.workSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div>
                      <span className="font-medium">{session.startTime}</span>
                      <span className="text-muted-foreground mx-1">-</span>
                      <span>{session.endTime || "进行中"}</span>
                      {session.duration != null && (
                        <Badge variant="secondary" className="ml-2">{session.duration}分钟</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditSession("work", session)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSession("work", session.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">今日休息时段</CardTitle>
          </CardHeader>
          <CardContent>
            {todayData.restSessions.length === 0 ? (
              <p className="text-muted-foreground text-sm">暂无休息记录</p>
            ) : (
              <div className="space-y-2">
                {todayData.restSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div>
                      <span className="font-medium">{session.startTime}</span>
                      <span className="text-muted-foreground mx-1">-</span>
                      <span>{session.endTime || "进行中"}</span>
                      {session.duration != null && (
                        <Badge variant="secondary" className="ml-2">{session.duration}分钟</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditSession("rest", session)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSession("rest", session.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 编辑时段对话框 */}
      <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑{editingSession?.type === "work" ? "工作" : "休息"}时段</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">开始时间</Label>
              <Input
                id="startTime"
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                placeholder="HH:mm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">结束时间</Label>
              <Input
                id="endTime"
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                placeholder="HH:mm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingSession(null)}>
                取消
              </Button>
              <Button onClick={updateSession}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

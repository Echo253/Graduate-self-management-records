"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Coffee, Droplets, Plus, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"

const DEFAULT_COFFEE_DATA: Record<string, Record<string, number>> = {
  "星巴克": { "美式": 150, "奶咖": 75, "手冲": 170 },
  "瑞幸": { "美式": 120, "奶咖": 70, "手冲": 140 },
  "库迪": { "美式": 110, "奶咖": 65, "手冲": 130 },
  "Manner": { "美式": 120, "奶咖": 70, "手冲": 140 },
  "雀巢": { "美式": 60, "奶咖": 50 },
  "Tims": { "美式": 140, "奶咖": 80, "手冲": 160 },
  "便利店": { "美式": 100, "奶咖": 60 },
  "其他": { "美式": 100, "奶咖": 80, "手冲": 120 }
}

type CoffeeRecord = {
  id: string
  brand: string
  type: string
  caffeine: number
  customName: string | null
  time: string
}

type WaterRecord = {
  id: string
  amount: number
  time: string
}

type TodayData = {
  coffeeRecords: CoffeeRecord[]
  waterRecords: WaterRecord[]
  totalCoffee: number
  totalCaffeine: number
  totalWater: number
}

export default function IntakePage() {
  const [todayData, setTodayData] = useState<TodayData>({
    coffeeRecords: [],
    waterRecords: [],
    totalCoffee: 0,
    totalCaffeine: 0,
    totalWater: 0
  })
  const [loading, setLoading] = useState(true)

  // 咖啡表单
  const [brand, setBrand] = useState("瑞幸")
  const [coffeeType, setCoffeeType] = useState("美式")
  const [caffeine, setCaffeine] = useState(120)
  const [customName, setCustomName] = useState("")

  // 饮水表单
  const [waterAmount, setWaterAmount] = useState(200)

  // 咖啡编辑状态
  const [editingCoffee, setEditingCoffee] = useState<CoffeeRecord | null>(null)
  const [editBrand, setEditBrand] = useState("")
  const [editCoffeeType, setEditCoffeeType] = useState("")
  const [editCaffeine, setEditCaffeine] = useState(0)
  const [editCustomName, setEditCustomName] = useState("")

  const today = new Date().toISOString().split("T")[0]

  const fetchTodayData = useCallback(async () => {
    try {
      const res = await fetch(`/api/intake?date=${today}`)
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

  // 更新咖啡因含量
  useEffect(() => {
    const types = DEFAULT_COFFEE_DATA[brand]
    if (types && types[coffeeType]) {
      setCaffeine(types[coffeeType])
    }
  }, [brand, coffeeType])

  // 编辑时自动更新咖啡因含量
  useEffect(() => {
    if (editingCoffee) {
      const types = DEFAULT_COFFEE_DATA[editBrand]
      if (types && types[editCoffeeType]) {
        setEditCaffeine(types[editCoffeeType])
      }
    }
  }, [editingCoffee, editBrand, editCoffeeType])

  const addCoffee = async () => {
    try {
      const res = await fetch("/api/coffee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, type: coffeeType, caffeine, customName: customName || null })
      })
      if (res.ok) {
        toast.success("已记录咖啡")
        setCustomName("")
        fetchTodayData()
      }
    } catch {
      toast.error("操作失败")
    }
  }

  const addWater = async () => {
    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: waterAmount })
      })
      if (res.ok) {
        toast.success("已记录饮水")
        fetchTodayData()
      }
    } catch {
      toast.error("操作失败")
    }
  }

  const deleteCoffee = async (id: string) => {
    try {
      const res = await fetch(`/api/coffee/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("已删除")
        fetchTodayData()
      }
    } catch {
      toast.error("删除失败")
    }
  }

  const deleteWater = async (id: string) => {
    try {
      const res = await fetch(`/api/water/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("已删除")
        fetchTodayData()
      }
    } catch {
      toast.error("删除失败")
    }
  }

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
      } else {
        const data = await res.json()
        toast.error(data.error || "更新失败")
      }
    } catch {
      toast.error("更新失败")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">摄入记录</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 咖啡记录 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-amber-600" />
              咖啡
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 统计 */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-lg p-2 border">
                <div className="text-2xl font-bold text-amber-600">{todayData.totalCoffee}</div>
                <div className="text-xs text-gray-600">杯数</div>
              </div>
              <div className="bg-white rounded-lg p-2 border">
                <div className="text-2xl font-bold text-red-600">{todayData.totalCaffeine}</div>
                <div className="text-xs text-gray-600">咖啡因(mg)</div>
              </div>
              <div className="bg-white rounded-lg p-2 border">
                <div className="text-2xl font-bold text-green-600">400</div>
                <div className="text-xs text-gray-600">日限(mg)</div>
              </div>
            </div>

            {/* 表单 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>品牌</Label>
                <Select value={brand} onValueChange={(v) => v && setBrand(v)}>
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
                <Select value={coffeeType} onValueChange={(v) => v && setCoffeeType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(DEFAULT_COFFEE_DATA[brand] || {}).map((t) => (
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
                  value={caffeine}
                  onChange={(e) => setCaffeine(Number(e.target.value))}
                  className="w-20 text-center"
                />
                <span className="text-gray-600">mg/杯</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>产品名称（可选）</Label>
              <Input
                placeholder="如：超大杯少糖"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>

            <Button onClick={addCoffee} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              记录咖啡
            </Button>

            {/* 今日记录 */}
            <div className="space-y-2">
              <Label>今日咖啡记录</Label>
              {todayData.coffeeRecords.length === 0 ? (
                <p className="text-gray-500 text-sm">暂无记录</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {todayData.coffeeRecords.map((record) => (
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
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 饮水记录 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-600" />
              饮水
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 统计 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-white rounded-lg p-3 border">
                <div className="text-3xl font-bold text-blue-600">{todayData.totalWater}</div>
                <p className="text-sm text-gray-600">今日已喝 (ml)</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border">
                <div className="text-3xl font-bold text-blue-600">2000</div>
                <p className="text-sm text-gray-600">每日目标 (ml)</p>
              </div>
            </div>

            {/* 快捷按钮 */}
            <div className="space-y-2">
              <Label>水量 (ml)</Label>
              <div className="flex gap-2 flex-wrap">
                {[100, 200, 250, 500].map((amount) => (
                  <Button
                    key={amount}
                    variant={waterAmount === amount ? "default" : "outline"}
                    onClick={() => setWaterAmount(amount)}
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
                value={waterAmount}
                onChange={(e) => setWaterAmount(Number(e.target.value))}
                placeholder="输入ml数"
              />
            </div>

            <Button onClick={addWater} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              记录饮水
            </Button>

            {/* 今日记录 */}
            <div className="space-y-2">
              <Label>今日饮水记录</Label>
              {todayData.waterRecords.length === 0 ? (
                <p className="text-gray-500 text-sm">暂无记录</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {todayData.waterRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-blue-600">{record.amount}ml</span>
                        <span className="text-gray-400 text-xs ml-2">{record.time}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteWater(record.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  )
}

"use client"

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

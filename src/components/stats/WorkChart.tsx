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
            formatter={(value) => [`${value} 小时`, "工作时长"]}
            labelFormatter={(label) => `日期: ${label}`}
          />
          <Bar
            dataKey="hours"
            radius={[4, 4, 0, 0]}
            className="cursor-pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`oklch(0.7 ${0.15 + (entry.hours / maxHours) * 0.1} 142.5)`}
                onClick={() => onBarClick?.(entry.date)}
                className="cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

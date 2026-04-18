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

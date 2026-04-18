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

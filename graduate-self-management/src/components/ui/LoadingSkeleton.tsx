"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

interface LoadingSkeletonProps {
  type?: "page" | "card" | "list" | "stats"
  count?: number
}

export function LoadingSkeleton({ type = "page", count = 3 }: LoadingSkeletonProps) {
  const shimmer = {
    initial: { opacity: 0.5 },
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  }

  const SkeletonItem = ({ className }: { className: string }) => (
    <motion.div
      className={`bg-muted rounded-lg ${className}`}
      initial="initial"
      animate="animate"
      variants={shimmer}
    />
  )

  if (type === "page") {
    return (
      <div className="space-y-6">
        <SkeletonItem className="h-8 w-48" />
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <SkeletonItem className="h-6 w-32" />
            <SkeletonItem className="h-24 w-full" />
            <SkeletonItem className="h-10 w-full" />
          </Card>
          <Card className="p-6 space-y-4">
            <SkeletonItem className="h-6 w-32" />
            <SkeletonItem className="h-24 w-full" />
            <SkeletonItem className="h-10 w-full" />
          </Card>
        </div>
      </div>
    )
  }

  if (type === "card") {
    return (
      <Card className="p-6 space-y-4">
        <SkeletonItem className="h-6 w-32" />
        <SkeletonItem className="h-20 w-full" />
        <SkeletonItem className="h-10 w-full" />
      </Card>
    )
  }

  if (type === "list") {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-between p-3 bg-muted rounded-lg"
            initial="initial"
            animate="animate"
            variants={shimmer}
          >
            <div className="space-y-2 flex-1">
              <div className="h-4 w-24 bg-background/50 rounded" />
              <div className="h-3 w-16 bg-background/50 rounded" />
            </div>
            <div className="h-8 w-8 bg-background/50 rounded" />
          </motion.div>
        ))}
      </div>
    )
  }

  if (type === "stats") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 text-center">
            <motion.div
              className="h-8 w-16 mx-auto bg-muted rounded"
              initial="initial"
              animate="animate"
              variants={shimmer}
            />
            <motion.div
              className="h-4 w-12 mx-auto mt-2 bg-muted rounded"
              initial="initial"
              animate="animate"
              variants={shimmer}
            />
          </Card>
        ))}
      </div>
    )
  }

  return null
}

'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PrivateRecord } from '@/lib/private-db'
import { BarChart3, Clock, Heart, TrendingUp, Calendar, Users } from 'lucide-react'

interface StatsViewProps {
  records: PrivateRecord[]
}

export function StatsView({ records }: StatsViewProps) {
  const stats = useMemo(() => {
    if (records.length === 0) return null

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // 频率统计
    const weeklyCount = records.filter(r => new Date(r.timestamp) >= startOfWeek).length
    const monthlyCount = records.filter(r => new Date(r.timestamp) >= startOfMonth).length
    const totalCount = records.length

    // 平均满意度
    const avgSatisfaction = records.reduce((sum, r) => sum + r.satisfaction, 0) / records.length

    // 平均时长（过滤掉 null 值）
    const recordsWithDuration = records.filter(r => r.duration !== null)
    const avgDuration = recordsWithDuration.length > 0
      ? recordsWithDuration.reduce((sum, r) => sum + (r.duration || 0), 0) / recordsWithDuration.length
      : 0

    // 平均心情变化
    const avgMoodChange = records.reduce((sum, r) => sum + (r.afterMood.score - r.beforeMood.score), 0) / records.length

    // 方式分布
    const methodDistribution = {
      solo: records.filter(r => r.method === 'solo').length,
      partner: records.filter(r => r.method === 'partner').length,
      other: records.filter(r => r.method === 'other').length,
    }

    // 满意度分布
    const satisfactionDistribution = {
      1: records.filter(r => r.satisfaction === 1).length,
      2: records.filter(r => r.satisfaction === 2).length,
      3: records.filter(r => r.satisfaction === 3).length,
      4: records.filter(r => r.satisfaction === 4).length,
      5: records.filter(r => r.satisfaction === 5).length,
    }

    return {
      weeklyCount,
      monthlyCount,
      totalCount,
      avgSatisfaction,
      avgDuration,
      avgMoodChange,
      methodDistribution,
      satisfactionDistribution,
    }
  }, [records])

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground">
        至少需要一条记录才能显示统计
      </div>
    )
  }

  const maxSatisfactionCount = Math.max(...Object.values(stats.satisfactionDistribution), 1)

  return (
    <div className="space-y-6">
      {/* 频率统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            频率统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{stats.weeklyCount}</div>
              <div className="text-sm text-muted-foreground">本周记录</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{stats.monthlyCount}</div>
              <div className="text-sm text-muted-foreground">本月记录</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{stats.totalCount}</div>
              <div className="text-sm text-muted-foreground">总记录</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 平均值统计 */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <Heart className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.avgSatisfaction.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">平均满意度</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.avgDuration.toFixed(0)} 分钟</div>
                <div className="text-sm text-muted-foreground">平均时长</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.avgMoodChange >= 0 ? '+' : ''}{stats.avgMoodChange.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">平均心情变化</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 方式分布 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            方式分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="text-base px-4 py-1">
              独自: {stats.methodDistribution.solo}
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-1">
              伴侣: {stats.methodDistribution.partner}
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-1">
              其他: {stats.methodDistribution.other}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 满意度分布 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            满意度分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {([1, 2, 3, 4, 5] as const).map((score) => {
              const count = stats.satisfactionDistribution[score]
              const percentage = (count / stats.totalCount) * 100
              const barWidth = (count / maxSatisfactionCount) * 100

              return (
                <div key={score} className="flex items-center gap-3">
                  <div className="w-8 text-center font-medium">{score}分</div>
                  <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                    {count > 0 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

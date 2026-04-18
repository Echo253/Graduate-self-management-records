'use client'

import { useState } from 'react'
import { PrivateRecord } from '@/lib/private-db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, ChevronDown, ChevronUp, Star } from 'lucide-react'

interface RecordListProps {
  records: PrivateRecord[]
  onDelete: (id: string) => void
}

const methodLabels: Record<PrivateRecord['method'], string> = {
  solo: '独自',
  partner: '伴侣',
  other: '其他',
}

const methodBadgeVariants: Record<PrivateRecord['method'], 'default' | 'secondary' | 'outline'> = {
  solo: 'default',
  partner: 'secondary',
  other: 'outline',
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function renderStars(satisfaction: number): React.ReactNode {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-4 ${
            star <= satisfaction
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

function MoodDetails({
  label,
  mood,
}: {
  label: string
  mood: { score: number; tags: string[]; note: string }
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`size-3 ${
                star <= mood.score
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
      {mood.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {mood.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      {mood.note && (
        <p className="text-sm text-muted-foreground">{mood.note}</p>
      )}
    </div>
  )
}

export function RecordList({ records, onDelete }: RecordListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Sort records by timestamp (newest first)
  const sortedRecords = [...records].sort((a, b) => b.timestamp - a.timestamp)

  if (sortedRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">暂无记录</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedRecords.map((record) => {
        const isExpanded = expandedId === record.id

        return (
          <Card key={record.id} size="sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatDate(record.timestamp)}
                    </span>
                    <Badge variant={methodBadgeVariants[record.method]}>
                      {methodLabels[record.method]}
                    </Badge>
                    {record.duration !== null && record.duration > 0 && (
                      <Badge variant="outline">
                        {record.duration} 分钟
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">满意度</span>
                    {renderStars(record.satisfaction)}
                  </div>
                  {record.note && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {record.note}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    aria-label={isExpanded ? '收起详情' : '展开详情'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(record.id)}
                    aria-label="删除记录"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-4 border-t pt-4">
                  <MoodDetails label="事前心情" mood={record.beforeMood} />
                  <MoodDetails label="事后心情" mood={record.afterMood} />
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

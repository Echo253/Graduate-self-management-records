'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { PrivateRecord } from '@/lib/private-db'
import { Plus, X } from 'lucide-react'

const MOOD_TAGS = [
  '放松', '焦虑', '疲惫', '兴奋', '空虚',
  '满足', '压力', '无聊', '期待', '平静'
] as const

type MoodTag = typeof MOOD_TAGS[number]

interface MoodInputProps {
  label: string
  score: number
  tags: string[]
  note: string
  onScoreChange: (score: number) => void
  onTagsChange: (tags: string[]) => void
  onNoteChange: (note: string) => void
}

function MoodInput({
  label,
  score,
  tags,
  note,
  onScoreChange,
  onTagsChange,
  onNoteChange
}: MoodInputProps) {
  const toggleTag = (tag: MoodTag) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter(t => t !== tag))
    } else {
      onTagsChange([...tags, tag])
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">{label}</Label>

      {/* 心情分数 */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">心情分数</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <Button
              key={value}
              type="button"
              variant={score === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onScoreChange(value)}
              className="w-10 h-10"
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      {/* 心情标签 */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">心情标签</Label>
        <div className="flex flex-wrap gap-2">
          {MOOD_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={tags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer select-none"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              {tags.includes(tag) && (
                <X className="ml-1 h-3 w-3" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* 备注 */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">备注</Label>
        <Textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="记录此刻的心情..."
          rows={2}
        />
      </div>
    </div>
  )
}

interface RecordFormProps {
  onSubmit: (record: Omit<PrivateRecord, 'id' | 'timestamp'>) => Promise<void>
  onCancel?: () => void
}

export function RecordForm({ onSubmit, onCancel }: RecordFormProps) {
  const [duration, setDuration] = useState<string>('')
  const [method, setMethod] = useState<'solo' | 'partner' | 'other'>('solo')
  const [satisfaction, setSatisfaction] = useState(3)
  const [beforeMood, setBeforeMood] = useState({
    score: 3,
    tags: [] as string[],
    note: ''
  })
  const [afterMood, setAfterMood] = useState({
    score: 3,
    tags: [] as string[],
    note: ''
  })
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onSubmit({
        duration: duration ? parseInt(duration, 10) : null,
        method,
        satisfaction,
        beforeMood,
        afterMood,
        note
      })
      // 重置表单
      setDuration('')
      setMethod('solo')
      setSatisfaction(3)
      setBeforeMood({ score: 3, tags: [], note: '' })
      setAfterMood({ score: 3, tags: [], note: '' })
      setNote('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          添加记录
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基本信息区域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 时长 */}
          <div className="space-y-2">
            <Label htmlFor="duration">时长（分钟，可选）</Label>
            <Input
              id="duration"
              type="number"
              min="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="输入时长"
            />
          </div>

          {/* 方式 */}
          <div className="space-y-2">
            <Label>方式</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as 'solo' | 'partner' | 'other')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">独自</SelectItem>
                <SelectItem value="partner">伴侣</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 满意度 */}
          <div className="space-y-2">
            <Label>满意度</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={satisfaction === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSatisfaction(value)}
                  className="w-10 h-8"
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 活动前心情 */}
        <div className="p-4 rounded-lg bg-muted/50">
          <MoodInput
            label="活动前心情"
            score={beforeMood.score}
            tags={beforeMood.tags}
            note={beforeMood.note}
            onScoreChange={(score) => setBeforeMood(prev => ({ ...prev, score }))}
            onTagsChange={(tags) => setBeforeMood(prev => ({ ...prev, tags }))}
            onNoteChange={(note) => setBeforeMood(prev => ({ ...prev, note }))}
          />
        </div>

        {/* 活动后心情 */}
        <div className="p-4 rounded-lg bg-muted/50">
          <MoodInput
            label="活动后心情"
            score={afterMood.score}
            tags={afterMood.tags}
            note={afterMood.note}
            onScoreChange={(score) => setAfterMood(prev => ({ ...prev, score }))}
            onTagsChange={(tags) => setAfterMood(prev => ({ ...prev, tags }))}
            onNoteChange={(note) => setAfterMood(prev => ({ ...prev, note }))}
          />
        </div>

        {/* 备注 */}
        <div className="space-y-2">
          <Label htmlFor="note">备注（可选）</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加其他备注..."
            rows={3}
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '保存中...' : '保存记录'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

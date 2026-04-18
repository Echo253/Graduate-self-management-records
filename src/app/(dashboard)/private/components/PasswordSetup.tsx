// src/app/(dashboard)/private/components/PasswordSetup.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface PasswordSetupProps {
  onComplete: (password: string, entryMode: 'hidden' | 'visible', entryName: string, gracePeriod: number) => void
}

export function PasswordSetup({ onComplete }: PasswordSetupProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [entryMode, setEntryMode] = useState<'hidden' | 'visible'>('visible')
  const [entryName, setEntryName] = useState('私密空间')
  const [gracePeriod, setGracePeriod] = useState(0)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    setError('')

    if (password.length < 4) {
      setError('密码至少需要 4 个字符')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    onComplete(password, entryMode, entryName, gracePeriod)
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>设置私密空间密码</CardTitle>
          <CardDescription>
            此密码用于加密您的私密数据，请务必牢记
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入密码"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
            />
          </div>

          <div className="space-y-2">
            <Label>入口方式</Label>
            <Select value={entryMode} onValueChange={(v) => setEntryMode(v as 'hidden' | 'visible')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visible">显示在导航中</SelectItem>
                <SelectItem value="hidden">隐藏入口（需输入URL）</SelectItem>
              </SelectContent>
            </Select>
            {entryMode === 'hidden' && (
              <p className="text-xs text-muted-foreground">
                隐藏后需通过 /private 路径访问
              </p>
            )}
          </div>

          {entryMode === 'visible' && (
            <div className="space-y-2">
              <Label htmlFor="entryName">导航显示名称</Label>
              <Input
                id="entryName"
                value={entryName}
                onChange={(e) => setEntryName(e.target.value)}
                placeholder="私密空间"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>免验证时长</Label>
            <Select value={gracePeriod.toString()} onValueChange={(v) => v && setGracePeriod(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">每次都需验证</SelectItem>
                <SelectItem value="5">5 分钟内免验证</SelectItem>
                <SelectItem value="15">15 分钟内免验证</SelectItem>
                <SelectItem value="30">30 分钟内免验证</SelectItem>
                <SelectItem value="60">1 小时内免验证</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button onClick={handleSubmit} className="w-full">
            完成设置
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

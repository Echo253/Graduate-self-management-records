'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface PasswordVerifyProps {
  onVerify: (password: string) => Promise<boolean>
}

export function PasswordVerify({ onVerify }: PasswordVerifyProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    const success = await onVerify(password)

    setLoading(false)
    if (!success) {
      setError('密码错误')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>验证密码</CardTitle>
          <CardDescription>
            请输入私密空间密码
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative space-y-2">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? '验证中...' : '进入'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

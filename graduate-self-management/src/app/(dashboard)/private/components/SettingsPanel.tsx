'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lock, Eye, EyeOff, Save } from 'lucide-react'
import { toast } from 'sonner'

interface SettingsPanelProps {
  config: {
    entryMode: 'hidden' | 'visible'
    entryName: string
    gracePeriod: number
  }
  onUpdateConfig: (updates: {
    entryMode?: 'hidden' | 'visible'
    entryName?: string
    gracePeriod?: number
  }) => Promise<void>
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
}

export function SettingsPanel({ config, onUpdateConfig, onChangePassword }: SettingsPanelProps) {
  const [entryMode, setEntryMode] = useState<'hidden' | 'visible'>(config.entryMode)
  const [entryName, setEntryName] = useState(config.entryName)
  const [gracePeriod, setGracePeriod] = useState(config.gracePeriod)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      await onUpdateConfig({
        entryMode,
        entryName,
        gracePeriod
      })
      // 同步更新 localStorage
      localStorage.setItem('private-space-entry', JSON.stringify({
        mode: entryMode,
        name: entryName
      }))
      toast.success('设置已保存')
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 4) {
      toast.error('新密码至少需要 4 个字符')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次输入的新密码不一致')
      return
    }
    if (oldPassword === newPassword) {
      toast.error('新密码不能与原密码相同')
      return
    }

    setChangingPassword(true)
    try {
      const success = await onChangePassword(oldPassword, newPassword)
      if (success) {
        toast.success('密码已修改，请使用新密码登录')
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error('原密码错误')
      }
    } catch {
      toast.error('修改失败')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 入口设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">入口设置</CardTitle>
          <CardDescription>配置私密空间在导航中的显示方式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <Button onClick={handleSaveConfig} disabled={saving} className="w-full gap-2">
            <Save className="h-4 w-4" />
            {saving ? '保存中...' : '保存设置'}
          </Button>
        </CardContent>
      </Card>

      {/* 修改密码 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            修改密码
          </CardTitle>
          <CardDescription>更改私密空间的访问密码</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">原密码</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="输入原密码"
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
            <Label htmlFor="newPassword">新密码</Label>
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="输入新密码"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认新密码</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入新密码"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={changingPassword || !oldPassword || !newPassword || !confirmPassword}
            className="w-full"
          >
            {changingPassword ? '修改中...' : '修改密码'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

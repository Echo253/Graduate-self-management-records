'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface ExportImportProps {
  onExport: () => Promise<string>
  onImport: (data: string) => Promise<boolean>
  onClear: () => Promise<void>
}

export function ExportImport({ onExport, onImport, onClear }: ExportImportProps) {
  const [importData, setImportData] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  // 导出数据
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const base64Data = await onExport()

      // 创建下载链接
      const blob = new Blob([base64Data], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `private-space-backup-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('导出成功', {
        description: '数据已保存到文件'
      })
    } catch {
      toast.error('导出失败', {
        description: '请稍后重试'
      })
    } finally {
      setIsExporting(false)
    }
  }

  // 导入数据
  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error('请输入数据', {
        description: '导入数据不能为空'
      })
      return
    }

    setIsImporting(true)
    try {
      const success = await onImport(importData.trim())
      if (success) {
        toast.success('导入成功', {
          description: '数据已恢复'
        })
        setImportData('')
      } else {
        toast.error('导入失败', {
          description: '数据格式错误或已损坏'
        })
      }
    } catch {
      toast.error('导入失败', {
        description: '请检查数据格式'
      })
    } finally {
      setIsImporting(false)
    }
  }

  // 清除所有数据
  const handleClear = async () => {
    setIsClearing(true)
    try {
      await onClear()
      toast.success('清除成功', {
        description: '所有数据已被删除'
      })
      setClearDialogOpen(false)
    } catch {
      toast.error('清除失败', {
        description: '请稍后重试'
      })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 导出卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            导出数据
          </CardTitle>
          <CardDescription>
            将私密空间数据导出为文件，可用于备份或迁移
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? '导出中...' : '导出为文件'}
          </Button>
        </CardContent>
      </Card>

      {/* 导入卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            导入数据
          </CardTitle>
          <CardDescription>
            粘贴之前导出的 Base64 数据来恢复记录
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder="粘贴导出的数据..."
            className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            onClick={handleImport}
            disabled={isImporting || !importData.trim()}
            className="w-full"
          >
            {isImporting ? '导入中...' : '导入数据'}
          </Button>
        </CardContent>
      </Card>

      {/* 清除数据卡片 */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            清除数据
          </CardTitle>
          <CardDescription>
            删除所有私密空间数据，此操作不可撤销
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
            <DialogTrigger render={<Button variant="destructive" className="w-full" />}>
              清除所有数据
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  确认清除
                </DialogTitle>
                <DialogDescription>
                  此操作将永久删除所有私密空间数据，包括配置和所有记录。
                  此操作无法撤销，请确认是否继续。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setClearDialogOpen(false)}
                  disabled={isClearing}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClear}
                  disabled={isClearing}
                >
                  {isClearing ? '清除中...' : '确认清除'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}

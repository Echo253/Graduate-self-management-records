// src/app/(dashboard)/private/page.tsx
'use client'

import { usePrivateSpace } from '@/hooks/usePrivateSpace'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { PasswordSetup } from './components/PasswordSetup'
import { PasswordVerify } from './components/PasswordVerify'
import { RecordForm } from './components/RecordForm'
import { RecordList } from './components/RecordList'
import { StatsView } from './components/StatsView'
import { ExportImport } from './components/ExportImport'
import { SettingsPanel } from './components/SettingsPanel'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

export default function PrivateSpacePage() {
  const {
    loading,
    isInitialized,
    isAuthenticated,
    config,
    records,
    setupPassword,
    authenticate,
    logout,
    addRecord,
    deleteRecord,
    updateConfig,
    exportData,
    importData,
    clearAllData,
    changePassword
  } = usePrivateSpace()

  const [activeTab, setActiveTab] = useState('record')

  // 修改密码功能
  const handleChangePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    const result = await changePassword(oldPassword, newPassword)
    if (!result.success && result.error) {
      toast.error(result.error)
    }
    return result.success
  }

  if (loading) {
    return <LoadingSkeleton type="page" />
  }

  // 未初始化：显示密码设置
  if (!isInitialized) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">私密空间</h1>
        <PasswordSetup
          onComplete={(password, entryMode, entryName, gracePeriod) => {
            setupPassword(password, entryMode, entryName, gracePeriod)
            toast.success('私密空间已创建')
          }}
        />
      </div>
    )
  }

  // 未验证：显示密码输入
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">私密空间</h1>
        <PasswordVerify
          onVerify={async (password) => {
            const success = await authenticate(password)
            if (success) {
              toast.success('验证成功')
            }
            return success
          }}
        />
      </div>
    )
  }

  // 已验证：显示主界面
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{config?.entryName || '私密空间'}</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="record">记录</TabsTrigger>
          <TabsTrigger value="history">历史</TabsTrigger>
          <TabsTrigger value="stats">统计</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="mt-4">
          <RecordForm
            onSubmit={async (record) => {
              await addRecord(record)
              toast.success('记录已保存')
            }}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <RecordList
            records={records}
            onDelete={async (id) => {
              await deleteRecord(id)
              toast.success('记录已删除')
            }}
          />
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <StatsView records={records} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <SettingsPanel
            config={{
              entryMode: config?.entryMode || 'visible',
              entryName: config?.entryName || '私密空间'
            }}
            onUpdateConfig={updateConfig}
            onChangePassword={handleChangePassword}
          />
          <ExportImport
            onExport={exportData}
            onImport={importData}
            onClear={clearAllData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

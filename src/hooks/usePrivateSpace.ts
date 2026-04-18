// src/hooks/usePrivateSpace.ts
'use client'

import { useState, useCallback, useEffect } from 'react'
import { encrypt, decrypt } from '@/lib/encryption'
import {
  PrivateRecord,
  PrivateSpaceConfig,
  getConfig,
  saveConfig,
  getRecords,
  saveRecords,
  clearAll
} from '@/lib/private-db'

const ENTRY_CONFIG_KEY = 'private-space-entry'

export function usePrivateSpace() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [config, setConfig] = useState<PrivateSpaceConfig | null>(null)
  const [records, setRecords] = useState<PrivateRecord[]>([])
  const [password, setPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // 初始化：检查是否已设置密码
  const initialize = useCallback(async () => {
    try {
      const encryptedConfig = await getConfig()
      if (!encryptedConfig) {
        setIsInitialized(false)
        setLoading(false)
        return
      }

      // 每次都需要重新验证密码，不使用 session 缓存
      setIsInitialized(true)
      setIsAuthenticated(false)
      setLoading(false)
    } catch {
      setIsInitialized(false)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    initialize()
  }, [initialize])

  // 设置密码（首次使用）
  const setupPassword = useCallback(async (newPassword: string, entryMode: 'hidden' | 'visible', entryName: string, gracePeriod: number) => {
    const testValue = 'test'
    const passwordHash = await encrypt(testValue, newPassword)

    const newConfig: PrivateSpaceConfig = {
      passwordHash,
      entryMode,
      entryName,
      gracePeriod
    }

    const encryptedConfig = await encrypt(newConfig, newPassword)
    await saveConfig(encryptedConfig)

    // 初始化空记录
    const encryptedRecords = await encrypt([], newPassword)
    await saveRecords(encryptedRecords)

    // 保存入口配置到 localStorage（非加密，用于导航显示）
    localStorage.setItem(ENTRY_CONFIG_KEY, JSON.stringify({
      mode: entryMode,
      name: entryName
    }))

    setConfig(newConfig)
    setRecords([])
    setPassword(newPassword)
    setIsInitialized(true)
    setIsAuthenticated(true)
  }, [])

  // 验证密码
  const authenticate = useCallback(async (inputPassword: string): Promise<boolean> => {
    try {
      const encryptedConfig = await getConfig()
      if (!encryptedConfig) return false

      const cfg = await decrypt<PrivateSpaceConfig>(encryptedConfig, inputPassword)
      setConfig(cfg)
      setPassword(inputPassword)

      // 加载记录
      const encryptedRecords = await getRecords()
      if (encryptedRecords) {
        const recs = await decrypt<PrivateRecord[]>(encryptedRecords, inputPassword)
        setRecords(recs)
      }

      setIsAuthenticated(true)
      return true
    } catch {
      return false
    }
  }, [])

  // 登出
  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setPassword(null)
    setRecords([])
  }, [])

  // 添加记录
  const addRecord = useCallback(async (record: Omit<PrivateRecord, 'id' | 'timestamp'>) => {
    if (!password) return

    const newRecord: PrivateRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }

    const newRecords = [...records, newRecord]
    const encryptedRecords = await encrypt(newRecords, password)
    await saveRecords(encryptedRecords)
    setRecords(newRecords)
  }, [password, records])

  // 更新记录
  const updateRecord = useCallback(async (id: string, updates: Partial<PrivateRecord>) => {
    if (!password) return

    const newRecords = records.map(r => r.id === id ? { ...r, ...updates } : r)
    const encryptedRecords = await encrypt(newRecords, password)
    await saveRecords(encryptedRecords)
    setRecords(newRecords)
  }, [password, records])

  // 删除记录
  const deleteRecord = useCallback(async (id: string) => {
    if (!password) return

    const newRecords = records.filter(r => r.id !== id)
    const encryptedRecords = await encrypt(newRecords, password)
    await saveRecords(encryptedRecords)
    setRecords(newRecords)
  }, [password, records])

  // 更新配置
  const updateConfig = useCallback(async (updates: Partial<PrivateSpaceConfig>) => {
    if (!password || !config) return

    const newConfig = { ...config, ...updates }
    const encryptedConfig = await encrypt(newConfig, password)
    await saveConfig(encryptedConfig)
    setConfig(newConfig)
  }, [password, config])

  // 修改密码
  const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    // 0. 验证新密码
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: '新密码长度至少为4位' }
    }

    // 1. 验证原密码
    try {
      const encryptedConfig = await getConfig()
      if (!encryptedConfig) {
        return { success: false, error: '未找到配置数据' }
      }

      // 尝试用原密码解密配置，验证密码是否正确
      const testConfig = await decrypt<PrivateSpaceConfig>(encryptedConfig, oldPassword)

      // 2. 获取并解密所有数据
      const encryptedRecords = await getRecords()
      let decryptedRecords: PrivateRecord[] = []
      if (encryptedRecords) {
        decryptedRecords = await decrypt<PrivateRecord[]>(encryptedRecords, oldPassword)
      }

      // 3. 用新密码重新加密所有数据
      const newTestValue = 'test'
      const newPasswordHash = await encrypt(newTestValue, newPassword)

      const newConfig: PrivateSpaceConfig = {
        ...testConfig,
        passwordHash: newPasswordHash
      }

      const newEncryptedConfig = await encrypt(newConfig, newPassword)
      const newEncryptedRecords = await encrypt(decryptedRecords, newPassword)

      // 4. 原子性保存（先保存记录，再保存配置）
      // 如果记录保存失败，配置仍使用旧密码，用户可以重试
      await saveRecords(newEncryptedRecords)
      await saveConfig(newEncryptedConfig)

      // 5. 更新内存状态
      setConfig(newConfig)
      setPassword(newPassword)
      setRecords(decryptedRecords)

      return { success: true }
    } catch (error) {
      // 解密失败说明原密码错误
      if (error instanceof Error && error.message.includes('decrypt')) {
        return { success: false, error: '原密码错误' }
      }
      return { success: false, error: '修改密码失败，请重试' }
    }
  }, [])

  // 导出数据（解密后 Base64 编码，明文 JSON）
  const exportData = useCallback(async (): Promise<string> => {
    // 直接返回解密后的明文数据
    const exportPayload = {
      config,
      records,
      exportedAt: Date.now()
    }
    return btoa(unescape(encodeURIComponent(JSON.stringify(exportPayload))))
  }, [config, records])

  // 导入数据（明文 JSON，用当前密码加密）
  const importData = useCallback(async (base64String: string): Promise<boolean> => {
    try {
      const jsonString = decodeURIComponent(escape(atob(base64String)))
      const data = JSON.parse(jsonString)

      if (!password) return false

      // 用当前密码加密导入的数据
      if (data.config) {
        const encryptedConfig = await encrypt(data.config, password)
        await saveConfig(encryptedConfig)
        setConfig(data.config)
      }
      if (data.records && Array.isArray(data.records)) {
        const encryptedRecords = await encrypt(data.records, password)
        await saveRecords(encryptedRecords)
        setRecords(data.records)
      }
      return true
    } catch {
      return false
    }
  }, [password])

  // 清除所有数据
  const clearAllData = useCallback(async () => {
    await clearAll()
    setConfig(null)
    setRecords([])
    setPassword(null)
    setIsInitialized(false)
    setIsAuthenticated(false)
    localStorage.removeItem(ENTRY_CONFIG_KEY)
  }, [])

  return {
    loading,
    isInitialized,
    isAuthenticated,
    config,
    records,
    setupPassword,
    authenticate,
    logout,
    addRecord,
    updateRecord,
    deleteRecord,
    updateConfig,
    changePassword,
    exportData,
    importData,
    clearAllData
  }
}

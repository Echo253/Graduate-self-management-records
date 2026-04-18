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

const GRACE_STORAGE_KEY = 'private-space-last-auth'
const SESSION_PASSWORD_KEY = 'private-space-password'

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

      // 检查 session 中是否有密码（已验证过）
      const sessionPassword = sessionStorage.getItem(SESSION_PASSWORD_KEY)
      if (sessionPassword) {
        const cfg = await decrypt<PrivateSpaceConfig>(encryptedConfig, sessionPassword)
        setConfig(cfg)
        setPassword(sessionPassword)

        // 加载记录
        const encryptedRecords = await getRecords()
        if (encryptedRecords) {
          const recs = await decrypt<PrivateRecord[]>(encryptedRecords, sessionPassword)
          setRecords(recs)
        }

        setIsInitialized(true)
        setIsAuthenticated(true)
        setLoading(false)
        return
      }

      // 检查免验证期
      const cfg = await decrypt<PrivateSpaceConfig>(encryptedConfig, '')
      // 这里无法解密，需要用户输入密码
      setConfig(null)
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

    setConfig(newConfig)
    setRecords([])
    setPassword(newPassword)
    setIsInitialized(true)
    setIsAuthenticated(true)
    sessionStorage.setItem(SESSION_PASSWORD_KEY, newPassword)
    sessionStorage.setItem(GRACE_STORAGE_KEY, Date.now().toString())
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
      sessionStorage.setItem(SESSION_PASSWORD_KEY, inputPassword)
      sessionStorage.setItem(GRACE_STORAGE_KEY, Date.now().toString())
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
    sessionStorage.removeItem(SESSION_PASSWORD_KEY)
    sessionStorage.removeItem(GRACE_STORAGE_KEY)
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
    sessionStorage.removeItem(SESSION_PASSWORD_KEY)
    sessionStorage.removeItem(GRACE_STORAGE_KEY)
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
    exportData,
    importData,
    clearAllData
  }
}

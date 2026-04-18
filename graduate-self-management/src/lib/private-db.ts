// src/lib/private-db.ts

const DB_NAME = 'private-space'
const DB_VERSION = 1

export interface PrivateRecord {
  id: string
  timestamp: number
  duration: number | null
  method: 'solo' | 'partner' | 'other'
  satisfaction: number // 1-5
  beforeMood: {
    score: number // 1-5
    tags: string[]
    note: string
  }
  afterMood: {
    score: number // 1-5
    tags: string[]
    note: string
  }
  note: string
}

export interface PrivateSpaceConfig {
  passwordHash: string // 加密的测试数据，用于验证密码
  entryMode: 'hidden' | 'visible'
  entryName: string // 导航显示名称
  gracePeriod: number // 免验证时长（分钟），0表示每次都需验证
}

export interface PrivateSpaceData {
  config: PrivateSpaceConfig | null
  records: PrivateRecord[]
}

let db: IDBDatabase | null = null

async function getDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // 存储加密的配置
      if (!database.objectStoreNames.contains('config')) {
        database.createObjectStore('config')
      }

      // 存储加密的记录
      if (!database.objectStoreNames.contains('records')) {
        const store = database.createObjectStore('records', { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp')
      }
    }
  })
}

/**
 * 保存加密的配置
 */
export async function saveConfig(encryptedConfig: string): Promise<void> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction('config', 'readwrite')
    const store = tx.objectStore('config')
    const request = store.put(encryptedConfig, 'main')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * 获取加密的配置
 */
export async function getConfig(): Promise<string | null> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction('config', 'readonly')
    const store = tx.objectStore('config')
    const request = store.get('main')
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}

/**
 * 保存加密的记录列表
 */
export async function saveRecords(encryptedRecords: string): Promise<void> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction('config', 'readwrite')
    const store = tx.objectStore('config')
    const request = store.put(encryptedRecords, 'records')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * 获取加密的记录列表
 */
export async function getRecords(): Promise<string | null> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction('config', 'readonly')
    const store = tx.objectStore('config')
    const request = store.get('records')
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}

/**
 * 清除所有数据
 */
export async function clearAll(): Promise<void> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['config', 'records'], 'readwrite')
    tx.objectStore('config').clear()
    tx.objectStore('records').clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * 导出所有加密数据
 */
export async function exportAllData(): Promise<{ config: string | null; records: string | null }> {
  return {
    config: await getConfig(),
    records: await getRecords()
  }
}

/**
 * 导入所有加密数据
 */
export async function importAllData(data: { config: string; records: string }): Promise<void> {
  await saveConfig(data.config)
  await saveRecords(data.records)
}

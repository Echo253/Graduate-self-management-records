// src/lib/encryption.ts

// 加密相关常量
const SALT_LENGTH = 16  // bytes
const IV_LENGTH = 12    // bytes (optimal for GCM)
const PBKDF2_ITERATIONS = 100000

/**
 * 使用 PBKDF2 从密码派生密钥
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * 加密数据
 */
export async function encrypt(data: unknown, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(password, salt)

  const encoder = new TextEncoder()
  const encoded = encoder.encode(JSON.stringify(data))

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  )

  // 组合: salt + iv + encrypted
  const combined = new Uint8Array(SALT_LENGTH + IV_LENGTH + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, SALT_LENGTH)
  combined.set(new Uint8Array(encrypted), SALT_LENGTH + IV_LENGTH)

  return btoa(String.fromCharCode(...Array.from(combined)))
}

/**
 * 解密数据
 */
export async function decrypt<T>(encryptedString: string, password: string): Promise<T> {
  const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0))

  const salt = combined.slice(0, SALT_LENGTH)
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH)

  const key = await deriveKey(password, salt)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  )

  const decoder = new TextDecoder()
  return JSON.parse(decoder.decode(decrypted))
}

/**
 * 验证密码是否正确（通过尝试解密测试数据）
 */
export async function verifyPassword(encryptedString: string, password: string): Promise<boolean> {
  try {
    await decrypt(encryptedString, password)
    return true
  } catch {
    return false
  }
}

/**
 * 生成随机密码（用于测试）
 * 使用拒绝采样法消除模运算偏差，确保均匀分布
 */
export function generateRandomPassword(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  const maxValid = Math.floor(256 / chars.length) * chars.length
  let result = ''
  while (result.length < length) {
    const array = crypto.getRandomValues(new Uint8Array(length * 2))
    for (const x of array) {
      if (x < maxValid && result.length < length) {
        result += chars[x % chars.length]
      }
    }
  }
  return result
}

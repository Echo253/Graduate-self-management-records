// src/lib/encryption.ts

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
      iterations: 100000,
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
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)

  const encoder = new TextEncoder()
  const encoded = encoder.encode(JSON.stringify(data))

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  )

  // 组合: salt(16) + iv(12) + encrypted
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encrypted), salt.length + iv.length)

  return btoa(String.fromCharCode(...Array.from(combined)))
}

/**
 * 解密数据
 */
export async function decrypt<T>(encryptedString: string, password: string): Promise<T> {
  const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0))

  const salt = combined.slice(0, 16)
  const iv = combined.slice(16, 28)
  const encrypted = combined.slice(28)

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
 */
export function generateRandomPassword(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  const array = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(array, x => chars[x % chars.length]).join('')
}

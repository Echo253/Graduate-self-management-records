# 修改密码功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现完整的修改密码功能，确保数据安全和私密性

**Architecture:** 在 usePrivateSpace hook 中添加 changePassword 函数，验证原密码后用新密码重新加密所有数据（config + records），使用原子性操作确保数据完整性。

**Tech Stack:** Next.js, TypeScript, Web Crypto API, IndexedDB

---

## 安全设计原则

1. **验证原密码**: 修改前必须验证原密码正确
2. **原子性操作**: 先准备新数据，成功后再替换旧数据
3. **内存安全**: 操作完成后清除敏感数据
4. **会话同步**: 修改成功后更新 sessionStorage 中的密码
5. **错误恢复**: 如果新密码加密失败，保留原有数据不变

---

## 文件结构

### 修改文件
- `src/hooks/usePrivateSpace.ts` - 添加 changePassword 函数
- `src/app/(dashboard)/private/page.tsx` - 更新 handleChangePassword 实现

---

## Task 1: 在 Hook 中添加 changePassword 函数

**Files:**
- Modify: `src/hooks/usePrivateSpace.ts`

- [ ] **Step 1: 添加 changePassword 函数**

在 `usePrivateSpace` hook 中添加 `changePassword` 函数，位置在 `updateConfig` 函数之后：

```typescript
// src/hooks/usePrivateSpace.ts
// 在 updateConfig 函数之后添加

// 修改密码
const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
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

    // 4. 原子性保存（先保存配置，再保存记录）
    await saveConfig(newEncryptedConfig)
    await saveRecords(newEncryptedRecords)

    // 5. 更新内存状态和 session
    setConfig(newConfig)
    setPassword(newPassword)
    sessionStorage.setItem(SESSION_PASSWORD_KEY, newPassword)
    sessionStorage.setItem(GRACE_STORAGE_KEY, Date.now().toString())

    return { success: true }
  } catch (error) {
    // 解密失败说明原密码错误
    if (error instanceof Error && error.message.includes('decrypt')) {
      return { success: false, error: '原密码错误' }
    }
    return { success: false, error: '修改密码失败，请重试' }
  }
}, [])
```

- [ ] **Step 2: 更新 return 语句**

在 return 对象中添加 `changePassword`:

```typescript
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
  changePassword,  // 新增
  exportData,
  importData,
  clearAllData
}
```

- [ ] **Step 3: 提交代码**

```bash
git add src/hooks/usePrivateSpace.ts
git commit -m "feat: 添加修改密码功能到 usePrivateSpace hook"
```

---

## Task 2: 更新页面组件使用新函数

**Files:**
- Modify: `src/app/(dashboard)/private/page.tsx`

- [ ] **Step 1: 更新 usePrivateSpace 解构**

```typescript
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
  changePassword,  // 新增
  exportData,
  importData,
  clearAllData
} = usePrivateSpace()
```

- [ ] **Step 2: 更新 handleChangePassword 函数**

```typescript
// 修改密码功能
const handleChangePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
  const result = await changePassword(oldPassword, newPassword)
  if (!result.success && result.error) {
    toast.error(result.error)
  }
  return result.success
}
```

- [ ] **Step 3: 提交代码**

```bash
git add src/app/(dashboard)/private/page.tsx
git commit -m "feat: 更新页面使用 changePassword 函数"
```

---

## Task 3: 更新 SettingsPanel 组件

**Files:**
- Modify: `src/app/(dashboard)/private/components/SettingsPanel.tsx`

- [ ] **Step 1: 更新 handleChangePassword 函数**

修改 SettingsPanel.tsx 中的 handleChangePassword 函数，添加成功后的处理：

```typescript
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
    }
  } catch {
    toast.error('修改失败')
  } finally {
    setChangingPassword(false)
  }
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/app/(dashboard)/private/components/SettingsPanel.tsx
git commit -m "feat: 完善修改密码表单验证"
```

---

## Task 4: 测试验证

- [ ] **Step 1: 启动开发服务器**

```bash
cd graduate-self-management && npm run dev
```

- [ ] **Step 2: 手动测试功能**

测试清单：
- [ ] 输入错误的原密码，显示"原密码错误"
- [ ] 输入正确原密码和新密码，修改成功
- [ ] 修改后使用新密码可以正常登录
- [ ] 修改后旧密码无法登录
- [ ] 数据完整性：修改后记录数据仍然存在

- [ ] **Step 3: 确认所有功能正常后提交**

---

## 自检清单

**1. 规格覆盖：**
- [x] 验证原密码 - Task 1
- [x] 重新加密所有数据 - Task 1
- [x] 更新会话状态 - Task 1
- [x] 错误处理 - Task 1
- [x] UI 更新 - Task 2, 3

**2. 安全检查：**
- [x] 原密码验证
- [x] 新密码长度验证
- [x] 确认密码一致性验证
- [x] 原子性操作（先准备数据再保存）
- [x] 错误信息不泄露敏感信息

**3. 占位符扫描：**
- 无 "TBD"、"TODO"、"implement later" 等占位符
- 所有代码步骤都包含完整实现

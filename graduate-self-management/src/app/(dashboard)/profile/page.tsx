"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name || "")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })
      if (res.ok) {
        toast.success("保存成功")
        await update({})  // 传递空对象触发 POST 请求
      } else {
        toast.error("保存失败")
      }
    } catch {
      toast.error("保存失败")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("avatar", file)

    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData
      })
      if (res.ok) {
        toast.success("头像已更新")
        await update({})  // 传递空对象触发 POST 请求
      } else {
        toast.error("上传失败")
      }
    } catch {
      toast.error("上传失败")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">个人设置</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            基本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 头像 */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user?.avatar || ""} />
              <AvatarFallback className="text-2xl">{session?.user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <Button variant="outline" render={<span />} nativeButton={false}>
                  更换头像
                </Button>
              </Label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式</p>
            </div>
          </div>

          {/* 表单 */}
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                value={session?.user?.email || ""}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <Button onClick={handleSave} disabled={loading}>
              {loading ? "保存中..." : "保存修改"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

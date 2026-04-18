"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Clock,
  Coffee,
  Droplets,
  Activity,
  CheckSquare,
  BarChart3,
  User,
  LogOut,
  Menu
} from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { href: "/", label: "打卡记录", icon: Clock },
  { href: "/intake", label: "摄入记录", icon: Coffee },
  { href: "/toilet", label: "如厕记录", icon: Droplets },
  { href: "/exercise", label: "运动记录", icon: Activity },
  { href: "/todo", label: "待办清单", icon: CheckSquare },
  { href: "/stats", label: "统计分析", icon: BarChart3 },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = () => (
    <>
      <div className="p-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100 border border-blue-200">
          <Avatar className="h-12 w-12 border-2 border-white shadow">
            <AvatarImage src={session?.user?.avatar || ""} />
            <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wide text-blue-500">当前用户</div>
            <div className="font-bold text-gray-800 truncate">{session?.user?.name}</div>
          </div>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <Separator />

      <div className="p-4 space-y-2">
        <Link href="/profile">
          <Button variant="outline" className="w-full justify-start gap-2">
            <User className="h-4 w-4" />
            个人设置
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r shadow-sm">
        <NavContent />
      </aside>

      {/* Mobile Header & Sheet */}
      <div className="flex flex-col flex-1">
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" />
              }
            >
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavContent />
            </SheetContent>
          </Sheet>
          <h1 className="font-bold text-lg">研究生自我管理系统</h1>
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.avatar || ""} />
            <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

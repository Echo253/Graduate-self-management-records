"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
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
  Menu,
  Sun,
  Moon,
  Monitor,
  Lock
} from "lucide-react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { PageTransition } from "@/components/ui/PageTransition"

const navItems = [
  { href: "/", label: "打卡记录", icon: Clock },
  { href: "/intake", label: "摄入记录", icon: Coffee },
  { href: "/toilet", label: "如厕记录", icon: Droplets },
  { href: "/exercise", label: "运动记录", icon: Activity },
  { href: "/todo", label: "待办清单", icon: CheckSquare },
  { href: "/stats", label: "统计分析", icon: BarChart3 },
]

interface PrivateSpaceEntry {
  mode: 'hidden' | 'visible'
  name: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [privateSpaceEntry, setPrivateSpaceEntry] = useState<PrivateSpaceEntry | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // 从 localStorage 读取私密空间入口配置
    try {
      const entryConfig = localStorage.getItem('private-space-entry')
      if (entryConfig) {
        setPrivateSpaceEntry(JSON.parse(entryConfig))
      }
    } catch {
      setPrivateSpaceEntry(null)
    }
  }, [])

  const ThemeToggle = () => {
    if (!mounted) return null

    return (
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        <Button
          variant={theme === 'light' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('light')}
          className="h-8 w-8 p-0"
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('dark')}
          className="h-8 w-8 p-0"
        >
          <Moon className="h-4 w-4" />
        </Button>
        <Button
          variant={theme === 'system' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('system')}
          className="h-8 w-8 p-0"
        >
          <Monitor className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const NavContent = () => (
    <>
      <div className="p-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-accent border border-border">
          <Avatar className="h-12 w-12 border-2 border-background shadow">
            <AvatarImage src={session?.user?.avatar || ""} />
            <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">当前用户</div>
            <div className="font-bold text-foreground truncate">{session?.user?.name}</div>
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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
        {/* 私密空间入口：默认显示，用户可设置隐藏 */}
        {(privateSpaceEntry?.mode === 'visible' || privateSpaceEntry === null) && (
          <Link
            href="/private"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              pathname === "/private"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-accent text-foreground"
            }`}
          >
            <Lock className="h-5 w-5" />
            <span className="font-medium">{privateSpaceEntry?.name || "私密空间"}</span>
          </Link>
        )}
      </nav>

      <Separator />

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">主题</span>
          <ThemeToggle />
        </div>
      </div>

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
          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r">
        <NavContent />
      </aside>

      {/* Mobile Header & Sheet */}
      <div className="flex flex-col flex-1">
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b">
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
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}

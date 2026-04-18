import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/layout/DashboardLayout"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return <DashboardLayout>{children}</DashboardLayout>
}

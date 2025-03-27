import { Metadata } from "next"
import { getSession, getDashboardStats } from "@/lib/supabase/server"
import AdminDashboard from "@/components/admin/dashboard"
import AdminLayout from "@/components/admin/admin-layout"

export const metadata: Metadata = {
  title: "Dashboard - JITC Admin",
  description: "Josephite IT Club Admin Dashboard",
}

// Force the page to be dynamic and not cached
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  // Log that we're entering the dashboard page
  // console.log("Rendering Admin Dashboard page")
  
  // Instead of blocking with a server-side redirect, we'll render the
  // layout which has client-side auth checking built in
  const session = await getSession()
  // console.log("Dashboard: Session status:", session ? "Found" : "Not found")
  
  // Fetch dashboard stats
  const stats = await getDashboardStats()
  
  // Calculate total count
  const statsWithTotal = {
    ...stats,
    totalCount: stats.events +
                (stats.executives ?? 0) +
                (stats.moderators ?? 0) +
                stats.developers +
                stats.contactSubmissions +
                stats.joinSubmissions,
    executives: stats.executives ?? 0,
    moderators: stats.moderators ?? 0
  }

  // Return the dashboard
  return (
    <AdminLayout title="Dashboard">
      <AdminDashboard stats={statsWithTotal} />
    </AdminLayout>
  )
} 
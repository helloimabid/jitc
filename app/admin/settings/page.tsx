import { Metadata } from "next"
import { getSession } from "@/lib/supabase/server"
import AdminLayout from "@/components/admin/admin-layout"
import AdminSettings from "@/components/admin/settings-admin"

export const metadata: Metadata = {
  title: "Settings - JITC Admin",
  description: "Josephite IT Club Admin Settings",
}

// Force the page to be dynamic and not cached
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SettingsPage() {
  // Log that we're entering the settings page
  console.log("Rendering Admin Settings page")
  
  // Get session for potential user information
  const session = await getSession()
  
  return (
    <AdminLayout title="Settings">
      <AdminSettings userEmail={session?.user?.email} />
    </AdminLayout>
  )
} 
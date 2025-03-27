import { getDevelopers } from "@/lib/supabase/server"
import AdminLayout from "@/components/admin/admin-layout"
import DevelopersAdmin from "@/components/admin/developers-admin"

export default async function DevelopersPage() {
  try {
    const developers = await getDevelopers()

    return (
      <AdminLayout>
        <DevelopersAdmin initialDevelopers={developers} />
      </AdminLayout>
    )
  } catch (error) {
    // console.error("Error loading developers page:", error)
    return (
      <AdminLayout> 
        <DevelopersAdmin initialDevelopers={[]} />
      </AdminLayout>
    )
  }
}


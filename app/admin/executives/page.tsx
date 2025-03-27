import { getExecutives } from "@/lib/supabase/server"
import AdminLayout from "@/components/admin/admin-layout"
import ExecutivesAdmin from "@/components/admin/executives-admin"
import { ExecutivesProvider } from "@/context/executives-context"

export default async function ExecutivesPage() {
  const executives = await getExecutives()

  return (
    <AdminLayout>
      <ExecutivesProvider initialExecutives={executives}>
        <ExecutivesAdmin initialExecutives={executives} />
      </ExecutivesProvider>
    </AdminLayout>
  )
}


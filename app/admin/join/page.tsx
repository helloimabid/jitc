import { getJoinSubmissions } from "@/lib/supabase/server"
import AdminLayout from "@/components/admin/admin-layout"
import JoinAdmin from "@/components/admin/join-admin"

export default async function JoinPage() {
  const submissions = await getJoinSubmissions()

  return (
    <AdminLayout>
      <JoinAdmin initialSubmissions={submissions} />
    </AdminLayout>
  )
}


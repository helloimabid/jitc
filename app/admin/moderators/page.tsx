import { getModerators } from "@/lib/supabase/server"
import AdminLayout from "@/components/admin/admin-layout"
import ModeratorsAdmin from "@/components/admin/moderators-admin"
import {ModeratorsProvider} from "@/context/moderators-context"

export default async function ModeratorsPage() {
  const moderators = await getModerators()

  return (
    <AdminLayout>
      <ModeratorsProvider initialModerators={moderators}>
        <ModeratorsAdmin initialModerators={moderators} />
      </ModeratorsProvider>
    </AdminLayout>
  )
}


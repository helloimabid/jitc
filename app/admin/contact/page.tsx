import { getContactSubmissions } from "@/lib/supabase/server"
import AdminLayout from "@/components/admin/admin-layout"
import ContactAdmin from "@/components/admin/contact-admin"

export default async function ContactPage() {
  const submissions = await getContactSubmissions()

  return (
    <AdminLayout>
      <ContactAdmin initialSubmissions={submissions} />
    </AdminLayout>
  )
}


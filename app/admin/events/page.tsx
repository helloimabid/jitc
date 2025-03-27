import { getEvents } from "@/lib/supabase/server"
import AdminLayout from "@/components/admin/admin-layout"
import EventsAdmin from "@/components/admin/events-admin"
import { EventsProvider } from "@/context/events-context"

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <AdminLayout>
      <EventsProvider initialEvents={events}>
        <EventsAdmin initialEvents={events} />
      </EventsProvider>
    </AdminLayout>
  )
}


import { redirect } from "next/navigation"
import { getSession } from "@/lib/supabase/server"

export default async function AdminPage() {
  // Check if user is authenticated
  const session = await getSession()

  // Redirect based on authentication status
  if (!session) {
    return redirect("/login")
  } else {
    return redirect("/admin/dashboard")
  }
} 
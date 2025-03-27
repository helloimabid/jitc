import { createServerClient, type CookieOptions } from "@supabase/ssr"
// import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"
import { cookies } from "next/headers"

// Create a single instance of the Supabase client for server components
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )
}

// Auth functions
export async function getSession() {
  const supabase = await createClient()
  try {
    const { data } = await supabase.auth.getSession()
    return data.session
  } catch (error) {
    // console.error("Error getting session:", error)
    return null
  }
}

// Data fetching functions
export async function getEvents() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    // console.error("Error fetching events:", error)
    return []
  }
}

export async function getExecutives() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("executives")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    // console.error("Error fetching executives:", error)
    return []
  }
}

export async function getModerators() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("moderators")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    // console.error("Error fetching executives:", error)
    return []
  }
}

export async function getDevelopers() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("developers")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    // console.error("Error fetching developers:", error)
    return []
  }
}

export async function getContactSubmissions() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    // console.error("Error fetching contact submissions:", error)
    return []
  }
}

export async function getJoinSubmissions() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("join_submissions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    // console.error("Error fetching join submissions:", error)
    return []
  }
}

// Dashboard stats
export async function getDashboardStats() {
  const supabase = await createClient()
  try {
    // Fetch all counts in parallel
    const [
      eventsCount,
      executivesCount,
      moderatorsCount,
      developersCount,
      contactCount,
      joinCount,
      unreadContactCount,
      pendingJoinCount
    ] = await Promise.all([
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("executives").select("id", { count: "exact", head: true }),
      supabase.from("developers").select("id", { count: "exact", head: true }),
      supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
      supabase.from("join_submissions").select("id", { count: "exact", head: true }),
      supabase
        .from("contact_submissions")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false),
      supabase
        .from("join_submissions")
        .select("id", { count: "exact", head: true })
        .eq("is_approved", false),
      supabase
        .from("join_submissions")
        .select("id", { count: "exact", head: true })
        .eq("is_approved", false)
    ])

    return {
      events: eventsCount.count || 0,
      unreadContactSubmissions: unreadContactCount.count || 0,
      pendingJoinSubmissions: pendingJoinCount.count || 0,
      developers: developersCount.count || 0,
      contactSubmissions: contactCount.count || 0,
      joinSubmissions: joinCount.count || 0,
      
    }
  } catch (error) {
    // console.error("Error fetching dashboard stats:", error)
    return {
      events: 0,
      executives: 0,
      moderators: 0,
      developers: 0,
      contactSubmissions: 0,
      joinSubmissions: 0,
      unreadContactSubmissions: 0,
      pendingJoinSubmissions: 0
    }
  }
}

// Data mutation functions
export async function createEvent(eventData: any) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("events")
      .insert([eventData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    // console.error("Error creating event:", error)
    throw error
  }
}

export async function updateEvent(id: string, eventData: any) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    // console.error("Error updating event:", error)
    throw error
  }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)

    if (error) throw error
  } catch (error) {
    // console.error("Error deleting event:", error)
    throw error
  }
}

// Similar mutation functions for other tables
export async function createExecutive(executiveData: any) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("executives")
      .insert([executiveData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    // console.error("Error creating executive:", error)
    throw error
  }
}

export async function updateExecutive(id: string, executiveData: any) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("executives")
      .update(executiveData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    // console.error("Error updating executive:", error)
    throw error
  }
}

export async function deleteExecutive(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from("executives")
      .delete()
      .eq("id", id)

    if (error) throw error
  } catch (error) {
    // console.error("Error deleting executive:", error)
    throw error
  }
}

// Contact submission functions
export async function markContactAsRead(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ is_read: true })
      .eq("id", id)

    if (error) throw error
  } catch (error) {
    // console.error("Error marking contact as read:", error)  
    throw error
  }
}

// Join submission functions
export async function approveJoinSubmission(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from("join_submissions")
      .update({ is_approved: true })
      .eq("id", id)

    if (error) throw error
  } catch (error) {
    // console.error("Error approving join submission:", error)
    throw error
  }
} 
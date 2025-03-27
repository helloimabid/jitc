import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

export const createClient = () => {
  // Make sure environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables")
  }

  return createBrowserClient<Database>(
    supabaseUrl!,
    supabaseKey!
  )
}

// Auth functions
export async function signIn(email: string, password: string) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  } catch (error) {
    // console.error("Error signing in:", error)
    throw error
  }
}

export async function signOut() {
  const supabase = createClient()
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    // console.error("Error signing out:", error)
    throw error
  }
}

// Data mutation functions for client components
export async function submitContactForm(formData: any) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.from("contact_submissions").insert([formData]).select().single()

    if (error) throw error
    return data
  } catch (error) {
    // console.error("Error submitting contact form:", error)
    throw error
  }
}

export async function submitJoinForm(formData: any) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.from("join_submissions").insert([formData]).select().single()

    if (error) throw error
    return data
  } catch (error) {
    // console.error("Error submitting join form:", error)
    throw error
  }
}

// Real-time subscriptions
export function subscribeToEvents(callback: (payload: any) => void) {
  const supabase = createClient()
  return supabase
    .channel("events")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "events",
      },
      callback,
    )
    .subscribe()
}

export function subscribeToExecutives(callback: (payload: any) => void) {
  const supabase = createClient()
  return supabase
    .channel("executives")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "executives",
      },
      callback,
    )
    .subscribe()
}
export function subscribeToModerators(callback: (payload: any) => void) {
  const supabase = createClient()
  return supabase
    .channel("executives")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "executives",
      },
      callback,
    )
    .subscribe()
}

export function subscribeToDevelopers(callback: (payload: any) => void) {
  const supabase = createClient()
  return supabase
    .channel("developers")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "developers",
      },
      callback,
    )
    .subscribe()
}

export async function getEvents() {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    // console.error("Error fetching events:", error)
    return []
  }
}

export async function createEvent(eventData: any) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.from("events").insert([eventData]).select().single()

    if (error) throw error
    return data
  } catch (error) {
    //  console.error("Error creating event:", error)
    throw error
  }
}

export async function updateEvent(id: string, eventData: any) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.from("events").update(eventData).eq("id", id).select().single()

    if (error) throw error
    return data
  } catch (error) {
    // console.error("Error updating event:", error)
    throw error
  }
}

export async function deleteEvent(id: string) {
  const supabase = createClient()
  try {
    const { error } = await supabase.from("events").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    // console.error("Error deleting event:", error)
    throw error
  }
}


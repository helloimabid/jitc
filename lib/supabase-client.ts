"use client"

import type { Database } from "@/types/supabase"
import { createBrowserClient } from "@supabase/ssr"

export const createClientSupabaseClient = () => {
  // Make sure environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // console.error("Missing Supabase environment variables")
  }

  return createBrowserClient<Database>(supabaseUrl!, supabaseKey!)
}

// Auth functions
export async function signIn(email: string, password: string) {
  // console.log("Starting sign in process...")
  const supabase = createClientSupabaseClient()
  
  try {
    // Check for any existing session first
    const { data: existingSession } = await supabase.auth.getSession()
    // console.log("Existing session check:", existingSession?.session ? "Session exists" : "No session")
    
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // console.error("Supabase auth error:", error)
      return { data: null, error }
    }

    // console.log("Sign in successful:", data.session ? "Session created" : "No session")
    
    // Verify session was created
    const { data: verifySession } = await supabase.auth.getSession()
    // console.log("Verify session after login:", verifySession?.session ? "Session exists" : "No session")
    
    return { data, error: null }
  } catch (err) {
    //  console.error("Exception during sign in:", err)
    return { 
      data: null, 
      error: {
        message: "An unexpected error occurred during sign in",
        status: 500
      } 
    }
  }
}

export async function signOut() {
  const supabase = createClientSupabaseClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Events CRUD
export async function createEvent(eventData: any) {
  const supabase = createClientSupabaseClient()
  const { data, error } = await supabase.from("events").insert(eventData).select().single()

  return { data, error }
}

export async function updateEvent(id: string, eventData: any) {
  const supabase = createClientSupabaseClient()
  const { data, error } = await supabase.from("events").update(eventData).eq("id", id).select().single()

  return { data, error }
}

export async function deleteEvent(id: string) {
  const supabase = createClientSupabaseClient()
  const { error } = await supabase.from("events").delete().eq("id", id)

  return { error }
}

// Executives CRUD
export async function createExecutive(executiveData: any) {
  const supabase = createClientSupabaseClient()
  const { data, error } = await supabase.from("executives").insert(executiveData).select().single()

  return { data, error }
}

export async function updateExecutive(id: string, executiveData: any) {
  const supabase = createClientSupabaseClient()
  const { data, error } = await supabase.from("executives").update(executiveData).eq("id", id).select().single()

  return { data, error }
}

export async function deleteExecutive(id: string) {
  const supabase = createClientSupabaseClient()
  const { error } = await supabase.from("executives").delete().eq("id", id)

  return { error }
}

// Moderatorss CRUD
export async function createModerators(moderatorData: any) {
  const supabase = createClientSupabaseClient()
  const { data, error } = await supabase.from("moderators").insert(moderatorData).select().single()

  return { data, error }
}

export async function updateModerator(id: string, moderatorData: any) {
  const supabase = createClientSupabaseClient()
  const { data, error } = await supabase.from("moderators").update(moderatorData).eq("id", id).select().single()
  return { data, error }
}

export async function deleteModerator(id: string) {
  const supabase = createClientSupabaseClient()
  const { error } = await supabase.from("moderators").delete().eq("id", id)

  return { error }
}

// Developers CRUD
export async function createDeveloper(developerData: any) {
  const supabase = createClientSupabaseClient()
  const { data, error } = await supabase.from("developers").insert(developerData).select().single()

  return { data, error }
}

export async function updateDeveloper(id: string, developerData: any) {
  const supabase = createClientSupabaseClient()
  const { data, error } = await supabase.from("developers").update(developerData).eq("id", id).select().single()

  return { data, error }
}

export async function deleteDeveloper(id: string) {
  const supabase = createClientSupabaseClient()
  const { error } = await supabase.from("developers").delete().eq("id", id)

  return { error }
}

// Contact submissions
export async function markContactAsRead(id: string) {
  const supabase = createClientSupabaseClient()
  const { data, error } = await supabase
    .from("contact_submissions")
    .update({ is_read: true })
    .eq("id", id)
    .select()
    .single()

  return { data, error }
}

export async function deleteContactSubmission(id: string) {
  const supabase = createClientSupabaseClient()
  const { error } = await supabase.from("contact_submissions").delete().eq("id", id)

  return { error }
}

// Join submissions
export async function approveJoinSubmission(id: string) {
  const supabase = createClientSupabaseClient()
  const { data, error } = await supabase
    .from("join_submissions")
    .update({ is_approved: true })
    .eq("id", id)
    .select()
    .single()

  return { data, error }
}

export async function deleteJoinSubmission(id: string) {
  const supabase = createClientSupabaseClient()
  const { error } = await supabase.from("join_submissions").delete().eq("id", id)

  return { error }
}

// File upload
export async function uploadFile(bucket: string, path: string, file: File) {
  const supabase = createClientSupabaseClient()
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  })

  if (error) {
    return { data: null, error }
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path)

  return { data: { publicUrl: publicUrlData.publicUrl }, error: null }
}

export async function getContactSubmissions() {
  const supabase = createClientSupabaseClient()
  const { data, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false })

  return data || []
}

export async function getJoinSubmissions() {
  const supabase = createClientSupabaseClient()
  const { data, error } = await supabase.from("join_submissions").select("*").order("created_at", { ascending: false })

  return data || []
}

export async function getDashboardStats() {
  const supabase = createClientSupabaseClient()

  // Get counts from each table
  const [eventsCount, executivesCount, developersCount, contactCount, joinCount, moderatorsCount] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("executives").select("id", { count: "exact", head: true }),
    supabase.from("developers").select("id", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
    supabase.from("join_submissions").select("id", { count: "exact", head: true }),
    supabase.from("moderators").select("id", { count: "exact", head: true }),
  ])

  // Get unread contact submissions
  const { count: unreadContactCount } = await supabase
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false)

  // Get pending join submissions
  const { count: pendingJoinCount } = await supabase
    .from("join_submissions")
    .select("id", { count: "exact", head: true })
    .eq("is_approved", false)

  // Calculate total counts
  const totalCount = (eventsCount.count || 0) + 
                    (executivesCount.count || 0) + 
                    (developersCount.count || 0) + 
                    (contactCount.count || 0) + 
                    (joinCount.count || 0) +
                    (moderatorsCount.count || 0) 

  return {
    events: eventsCount.count || 0,
    executives: executivesCount.count || 0,
    moderators: moderatorsCount.count || 0,
    developers: developersCount.count || 0,
    contactSubmissions: contactCount.count || 0,
    joinSubmissions: joinCount.count || 0,
    unreadContactSubmissions: unreadContactCount || 0,
    pendingJoinSubmissions: pendingJoinCount || 0,
    totalCount
  }
}


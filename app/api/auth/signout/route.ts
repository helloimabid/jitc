import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Sign out server-side to clear cookies
    await supabase.auth.signOut()
    
    return NextResponse.json({ 
      success: true 
    })
  } catch (error) {
    console.error('Signout API error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Signout error'
    }, { status: 500 })
  }
} 
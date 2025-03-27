import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data } = await supabase.auth.getSession()
    
    return NextResponse.json({ 
      authenticated: !!data.session,
      user: data.session?.user || null
    })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ 
      authenticated: false,
      error: 'Session error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // Create a new Supabase client for this request
    const supabase = await createClient()
    
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Verify the session was created
    const { data: sessionData } = await supabase.auth.getSession()
    
    return NextResponse.json({ 
      authenticated: true,
      user: data.user
    })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', authenticated: false }, 
      { status: 500 }
    )
  }
} 
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase"

export async function middleware(req: NextRequest) {
  // Skip auth for non-admin routes
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  // Create a response with the appropriate headers
  const res = NextResponse.next()
  
  // Create a Supabase client using SSR package
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          // This is for client-side cookies
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          // This is for client-side cookies
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )
  
  // Get the user's session
  const { data } = await supabase.auth.getSession()
  
  // If no session, redirect to login
  if (!data.session) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  return res
}

// Specify which routes should be protected
export const config = {
  matcher: [
    "/admin/:path*",
  ],
}


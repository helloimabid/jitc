"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase"

interface Developer {
  id: string
  name: string
  role: string
  skills: string[]
  image_url: string
  github_url: string
  portfolio: string
  projects: number
  contributions: number
  bio: string
  linkedin_url: string
  created_at: string
  updated_at: string
}

interface DevelopersContextType {
  developers: Developer[]
  loading: boolean
  error: string | null
  refreshDevelopers: () => Promise<void>
}

const DevelopersContext = createContext<DevelopersContextType | undefined>(undefined)

export function DevelopersProvider({ children }: { children: ReactNode }) {
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchDevelopers = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("developers")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setDevelopers(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevelopers()
  }, [])

  return (
    <DevelopersContext.Provider
      value={{
        developers,
        loading,
        error,
        refreshDevelopers: fetchDevelopers,
      }}
    >
      {children}
    </DevelopersContext.Provider>
  )
}

export function useDevelopers() {
  const context = useContext(DevelopersContext)
  if (context === undefined) {
    throw new Error("useDevelopers must be used within a DevelopersProvider")
  }
  return context
} 
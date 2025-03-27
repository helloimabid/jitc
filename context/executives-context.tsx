"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase"

type Executive = {
  id: string
  name: string
  position: string
  bio: string
  image_url: string
  email: string
  github_url: string
  linkedin_url: string
  created_at: string
  updated_at: string
}

interface ExecutivesContextType {
  executives: Executive[]
  refreshExecutives: () => Promise<void>
}

const ExecutivesContext = createContext<ExecutivesContextType>({
  executives: [],
  refreshExecutives: async () => {},
})

interface ExecutivesProviderProps {
  children: ReactNode
  initialExecutives: Executive[]
}

export function ExecutivesProvider({ children, initialExecutives }: ExecutivesProviderProps) {
  const [executives, setExecutives] = useState<Executive[]>(initialExecutives)

  const refreshExecutives = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("executives").select("*").order("created_at", { ascending: false })

      if (error) {
        // console.error("Error fetching executives:", error)
        return
      }

      if (data) {
        setExecutives(data)
      }
    } catch (error) {
      // console.error("Error in refreshExecutives:", error)
    }
  }

  useEffect(() => {
    refreshExecutives()
  }, [])

  return <ExecutivesContext.Provider value={{ executives, refreshExecutives }}>{children}</ExecutivesContext.Provider>
}

export const useExecutives = () => useContext(ExecutivesContext)


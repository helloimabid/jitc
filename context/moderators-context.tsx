"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase"

type Moderator = {
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

interface ModeratorsContextType {
  moderators: Moderator[]
  refreshModerators: () => Promise<void>
}

const ModeratorsContext = createContext<ModeratorsContextType>({
  moderators: [],
  refreshModerators: async () => {},
})

interface ModeratorsProviderProps {
  children: ReactNode
  initialModerators: Moderator[]
}

export function ModeratorsProvider({ children, initialModerators }: ModeratorsProviderProps) {
  const [moderators, setModerators] = useState<Moderator[]>(initialModerators)

  const refreshModerators = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("moderators").select("*").order("created_at", { ascending: false })

      if (error) {
        // console.error("Error fetching moderators:", error)
        return
      }

      if (data) {
        setModerators(data)
      }
    } catch (error) {
      // console.error("Error in refreshModerators:", error)
    }
  }

  useEffect(() => {
    refreshModerators()
  }, [])

  return <ModeratorsContext.Provider value={{ moderators, refreshModerators }}>{children}</ModeratorsContext.Provider>
}

export const useModerators = () => useContext(ModeratorsContext)


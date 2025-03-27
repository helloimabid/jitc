"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  image_url: string
  created_at: string
  updated_at: string
  registration_link: string
  event_type: string
}

interface EventsContextType {
  events: Event[]
  loading: boolean
  error: string | null
  refreshEvents: () => Promise<void>
}

const EventsContext = createContext<EventsContextType | undefined>(undefined)

interface EventsProviderProps {
  children: ReactNode
  initialEvents?: Event[]
}

export function EventsProvider({ children, initialEvents = [] }: EventsProviderProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [loading, setLoading] = useState(!initialEvents.length)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialEvents.length) {
      fetchEvents()
    }
  }, [initialEvents])

  return (
    <EventsContext.Provider
      value={{
        events,
        loading,
        error,
        refreshEvents: fetchEvents,
      }}
    >
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider")
  }
  return context
} 
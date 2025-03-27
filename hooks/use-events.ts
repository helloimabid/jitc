import { useState, useEffect } from "react"
import { getEvents } from "@/lib/supabase/client"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string | null
  location: string
  image: string | null
  category: string
  upcoming: boolean
  registration_link: string | null
  created_at: string | null
  updated_at: string | null
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshEvents = async () => {
    try {
      setLoading(true)
      const data = await getEvents()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch events"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshEvents()
  }, [])

  return { events, loading, error, refreshEvents }
} 
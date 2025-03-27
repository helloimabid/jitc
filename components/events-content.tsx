"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Calendar, MapPin, Tag, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/supabase"

type Event = Database["public"]["Tables"]["events"]["Row"]

export default function EventsContent() {
  const [filter, setFilter] = useState("all")
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient()

      const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching events:", error)
        return
      }

      if (data) {
        setEvents(data)
      }

      setLoading(false)
    }

    fetchEvents()
  }, [])

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true
    if (filter === "upcoming") return new Date(event.date) > new Date()
    if (filter === "past") return new Date(event.date) < new Date()
    if (filter === "Workshop") return event.event_type === "Workshop"
    if (filter === "Competition") return event.event_type === "Competition"
    if (filter === "Fest") return event.event_type === "Fest"
    return true
  })

  return (
    <section className="relative pt-20 pb-16">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-primary">Events</span> & Activities
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover our upcoming and past events, workshops, competitions, and tech talks.
          </p>
        </motion.div>

        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-primary text-black" : "text-primary border-primary/50"}
            >
              All Events
            </Button>
            <Button
              variant={filter === "upcoming" ? "default" : "outline"}
              onClick={() => setFilter("upcoming")}
              className={filter === "upcoming" ? "bg-primary text-black" : "text-primary border-primary/50"}
            >
              Upcoming
            </Button>
            <Button
              variant={filter === "past" ? "default" : "outline"}
              onClick={() => setFilter("past")}
              className={filter === "past" ? "bg-primary text-black" : "text-primary border-primary/50"}
            >
              Past Events
            </Button>
            <Button
              variant={filter === "Workshop" ? "default" : "outline"}
              onClick={() => setFilter("Workshop")}
              className={filter === "Workshop" ? "bg-primary text-black" : "text-primary border-primary/50"}
            >
              Workshops
            </Button>
            <Button
              variant={filter === "Competition" ? "default" : "outline"}
              onClick={() => setFilter("Competition")}
              className={filter === "Competition" ? "bg-primary text-black" : "text-primary border-primary/50"}
            >
              Competitions
            </Button>
            <Button
              variant={filter === "Fest" ? "default" : "outline"}
              onClick={() => setFilter("Fest")}
              className={filter === "Fest" ? "bg-primary text-black" : "text-primary border-primary/50"}
            >
              Fests
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-400">Loading events...</p>
          </div>
        ) : (
          <>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No events found matching your filter.</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass rounded-lg overflow-hidden group hover:transform hover:scale-[1.02] transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-[9/10] w-full overflow-hidden">
                      <Image
                        src={event.image_url || "/placeholder.svg?height=400&width=600"}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        priority={index < 3}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20"></div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{event.title}</h3>

                      <div className="flex flex-col space-y-2 mb-4">
                        <div className="flex items-center text-gray-400">
                          <Calendar className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                          <span className="text-sm truncate">{event.date}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <MapPin className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                          <span className="text-sm truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Tag className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                          <span className="text-sm truncate capitalize">{event.event_type}</span>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">{event.description}</p>

                      <div className="flex flex-col space-y-4 mt-auto">
                        {event.registration_link && (
                          <Button 
                            variant="default" 
                            className="w-full bg-primary text-black hover:bg-primary/90 flex items-center justify-center"
                            onClick={() => event.registration_link && window.open(event.registration_link, '_blank')}
                          >
                            <span>Register</span>
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                        {event.details_link && (
                          <Button 
                            variant="outline" 
                            className="w-full border-primary/50 text-primary hover:bg-primary/10 flex items-center justify-center"
                            onClick={() => event.details_link && window.open(event.details_link, '_blank')}
                          >
                            <span>View Details</span>
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Want to propose an event?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Have an idea for a tech event, workshop, or competition? We're always open to new ideas and collaborations.
          </p>
          <Button className="bg-primary text-black hover:bg-primary/90"><a href="/contact">Submit Event Proposal</a></Button>
        </motion.div>
      </div>
    </section>
  )
}
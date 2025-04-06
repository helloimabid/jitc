"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Calendar, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/supabase"

type Event = Database["public"]["Tables"]["events"]["Row"]

export default function UpcomingEvents() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        // Get upcoming events (where date is greater than or equal to today)
        const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .gte("date", today) // Only get events on or after today
          .order("date", { ascending: true }) // Sort by date, nearest first
          .limit(4); // Only get maximum 4 events for slider
        
        if (error) {
          console.error("Error fetching events:", error);
          setEvents([]);
        } else {
          setEvents(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  const nextSlide = () => {
    if (events.length <= 1) return;
    setCurrentSlide((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (events.length <= 1) return;
    setCurrentSlide((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Format date string to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  // If loading or no events, don't render anything
  if (loading || events.length === 0) {
    return null;
  }

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
          Upcoming <span className="text-primary">Events</span>
        </h2>
        
        <div className="relative max-w-5xl mx-auto">
          <div 
            ref={sliderRef}
            className="overflow-hidden rounded-xl glass shadow-2xl"
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="w-full flex-shrink-0"
                  style={{ minWidth: "100%" }}
                >
                  <div className="grid md:grid-cols-5 overflow-hidden">
                    {/* Event Image - 2/5 width on desktop */}
                    <div className="md:col-span-2 h-64 md:h-auto relative">
                      <div 
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${event.image_url || "/placeholder.svg?height=400&width=600"})` }}
                      >
                        <div className="absolute inset-0 bg-black/50"></div>
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-black px-3 py-1 rounded-full text-xs font-medium">
                          {event.event_type || "Event"}
                        </span>
                      </div>
                    </div>

                    {/* Event Content - 3/5 width on desktop */}
                    <div className="md:col-span-3 p-6 bg-gray-900/80 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-3">{event.title}</h3>
                        <p className="text-gray-400 mb-6">{event.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-start">
                            <Calendar className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-white font-medium">{formatDate(event.date)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                            <p className="text-sm text-gray-300">{event.location}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        {event.registration_link ? (
                          <a href={event.registration_link} target="_blank" rel="noopener noreferrer">
                            <Button 
                              variant="outline" 
                              className="border-primary/50 text-primary hover:bg-primary/10 group"
                            >
                              Register
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </a>
                        ) : (
                          <Link href={`/events`}>
                            <Button 
                              variant="outline" 
                              className="border-primary/50 text-primary hover:bg-primary/10 group"
                            >
                              Learn More
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Slider controls - only show if there are multiple events */}
          {events.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -mt-6 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -mt-6 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              
              {/* Slider indicators */}
              <div className="flex justify-center mt-6 gap-2">
                {events.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full ${
                      currentSlide === index ? "bg-primary" : "bg-gray-600"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          
          <div className="text-center mt-8">
            <Link href="/events">
              <Button className="bg-primary hover:bg-primary/90 text-black px-6">
                View All Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

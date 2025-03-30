"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Facebook, Instagram, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/supabase"

type Moderator = Database["public"]["Tables"]["moderators"]["Row"]

export default function ModeratorsContent() {
  const [moderators, setModerators] = useState<Moderator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchModerators = async () => {
      const supabase = createClient()

      const { data, error } = await supabase.from("moderators").select("*").order("created_at", { ascending: false })

      if (data) {
        setModerators(data)
      }

      setLoading(false)
    }

    fetchModerators()
  }, [])

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
            Our honourable <span className="text-primary">Moderators</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Meet our honourable Moderators who leads us toward a future of innovation and excellence.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-400">Loading moderators...</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {moderators.map((moderator, index) => (
              <motion.div
                key={moderator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-lg overflow-hidden group hover:transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="relative aspect-[9/10] w-full overflow-hidden">
                  <Image
                    src={moderator.image_url || "/placeholder.svg?height=400&width=400"}
                    alt={moderator.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white">{moderator.name}</h3>
                    <p className="text-primary">{moderator.position}</p>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-400 text-sm mb-4">{moderator.bio}</p>

                  <div className="flex space-x-4">
                    {moderator.facebook_url && (
                      <a
                        href={moderator.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary transition-colors"
                        title="GitHub"
                      >
                        <Facebook size={18} />
                      </a>
                    )}
                    {moderator.instagram_url && (
                      <a
                        href={moderator.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary transition-colors"
                        title="Linkedin"
                      >
                        <Instagram size={18} />
                      </a>
                    )}
                    <a
                      href={`mailto:${moderator.email}`}
                      className="text-gray-400 hover:text-primary transition-colors"
                      title="Email"
                    >
                      <Mail size={18} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}


"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Facebook, Instagram, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/supabase"

type Executive = Database["public"]["Tables"]["executives"]["Row"]

export default function ExecutivesContent() {
  const [executives, setExecutives] = useState<Executive[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExecutives = async () => {
      const supabase = createClient()

      const { data, error } = await supabase.from("executives").select("*").order("created_at", { ascending: false })

      if (data) {
        setExecutives(data)
      }

      setLoading(false)
    }

    fetchExecutives()
  }, [])

  return (
    <section className="relative pt-20 pb-16">
      <div
        className="container mx-auto px-4 py-16 md:
 py-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our <span className="text-primary">Executive</span> Team
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Meet the dedicated team of students leading the Josephite IT Club and driving our mission forward.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-400">Loading executives...</p>
          </div>
        ) : (
          <div className="grid gap-8 xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {executives.map((executive, index) => (
              <motion.div
                key={executive.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-lg overflow-hidden group hover:transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="relative aspect-[9/10] w-full overflow-hidden">
                  <Image
                    src={executive.image_url || "/placeholder.svg?height=400&width=400"}
                    alt={executive.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white">{executive.name}</h3>
                    <p className="text-primary">{executive.position}</p>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-400 text-sm mb-4">{executive.bio}</p>

                  <div className="flex space-x-4">
                    {executive.github_url && (
                      <a
                        href={executive.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary transition-colors"
                        title="GitHub"
                      >
                        <Facebook size={18} />
                      </a>
                    )}
                    {executive.linkedin_url && (
                      <a
                        href={executive.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary transition-colors"
                        title="LinkedIn"

                      >
                        <Instagram size={18} />
                      </a>
                    )}
                    <a
                      href={`mailto:${executive.email}`}
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


"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Github, ExternalLink, Code, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Database } from "@/types/supabase"
import { createClient } from "@/lib/supabase"

type Developer = Database["public"]["Tables"]["developers"]["Row"]
type Project = Database["public"]["Tables"]["projects"]["Row"]

export default function DevelopersContent() {
  const [activeTab, setActiveTab] = useState("developers")
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const [developersResponse, projectsResponse] = await Promise.all([
          supabase.from("developers").select("*").order("created_at", { ascending: false }),
          supabase.from("projects").select("*").order("created_at", { ascending: false }),
        ])

        if (developersResponse.data) {
          setDevelopers(developersResponse.data)
        }

        if (projectsResponse.data) {
          setProjects(projectsResponse.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
            Our <span className="text-primary">Developers</span> & Projects
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Meet our talented student developers and explore the innovative projects they've created.
          </p>
        </motion.div>

        <div className="flex justify-center mb-12">
          <div className="glass rounded-full p-1">
            <div className="flex">
              <button
                onClick={() => setActiveTab("developers")}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeTab === "developers" ? "bg-primary text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                Developers
              </button>
              <button
                onClick={() => setActiveTab("projects")}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeTab === "projects" ? "bg-primary text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                Projects
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-400">Loading {activeTab}...</p>
          </div>
        ) : (
          <>
            {activeTab === "developers" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              >
                {developers.map((developer, index) => (
                  <motion.div
                    key={developer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass rounded-lg overflow-hidden group hover:transform hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="relative aspect-[9/10] w-full overflow-hidden">
                      <Image
                        src={developer.image_url || "/placeholder.svg?height=400&width=400"}
                        alt={developer.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-bold text-white">{developer.name}</h3>
                        <p className="text-primary">{developer.role}</p>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(developer.skills || []).map((skill, i) => (
                          <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between text-sm text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Code className="h-4 w-4 mr-1 text-primary" />
                          <span>{developer.projects || 0} Projects</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-primary" />
                          <span>{developer.contributions || 0} Contributions</span>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        {developer.github_url && (
                          <a
                            href={developer.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex justify-center items-center gap-2 text-gray-400 hover:text-primary transition-colors py-2 border border-gray-700 rounded-md hover:border-primary"
                          >
                            <Github size={16} />
                            <span>GitHub</span>
                          </a>
                        )}
                        {developer.portfolio && (
                          <a
                            href={developer.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex justify-center items-center gap-2 text-gray-400 hover:text-primary transition-colors py-2 border border-gray-700 rounded-md hover:border-primary"
                          >
                            <ExternalLink size={16} />
                            <span>Portfolio</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "projects" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid gap-8 md:grid-cols-2"
              >
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass rounded-lg overflow-hidden group hover:transform hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={project.image || "/placeholder.svg?height=400&width=600"}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {project.featured && (
                        <div className="absolute top-0 right-0 bg-primary text-black px-3 py-1 text-sm font-medium">
                          Featured
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {(project.technologies || []).map((tech, i) => (
                          <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex space-x-4">
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex justify-center items-center gap-2 text-gray-400 hover:text-primary transition-colors py-2 border border-gray-700 rounded-md hover:border-primary"
                          >
                            <Github size={16} />
                            <span>Code</span>
                          </a>
                        )}
                        {project.demo && (
                          <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex justify-center items-center gap-2 text-primary bg-primary/10 py-2 rounded-md hover:bg-primary/20 transition-colors"
                          >
                            <ExternalLink size={16} />
                            <span>Live Demo</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Want to contribute?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            We're always looking for passionate developers to join our team and contribute to our projects. Whether
            you're a beginner or experienced coder, there's a place for you in our community.
          </p>
          <Button className="bg-primary text-black hover:bg-primary/90">Join Our Developer Team</Button>
        </motion.div>
      </div>
    </section>
  )
}


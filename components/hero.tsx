"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight, Zap } from "lucide-react"
import { TypeAnimation } from "react-type-animation"

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const { left, top, width, height } = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - left) / width
      const y = (e.clientY - top) / height

      containerRef.current.style.setProperty("--x", `${x}`)
      containerRef.current.style.setProperty("--y", `${y}`)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen pt-20 pb-16 flex flex-col justify-center items-center overflow-hidden circuit-pattern"
      style={
        {
          "--x": "0.5",
          "--y": "0.5",
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 bg-gradient-radial from-blue-900/20 to-transparent opacity-70"
        style={{
          background: `radial-gradient(circle at calc(var(--x) * 100%) calc(var(--y) * 100%), rgba(10, 25, 47, 0.8), rgba(0, 0, 0, 0.95))`,
        }}
      ></div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col space-y-4"
          >
            <div className="inline-block">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                <Zap size={14} className="mr-1" />
                Innovate. Create. Evolve.
              </motion.span>
            </div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white glow-text"
            >
              JOSEPHITE <br />
              <span className="text-primary">IT CLUB</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 h-16"
            >
              <TypeAnimation
                sequence={[
                  "Evolve through tech",
                  2000,
                  "Build the future",
                  2000,
                  "Code with passion",
                  2000,
                  "Innovate together",
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Number.POSITIVE_INFINITY}
                className="terminal-text"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="max-w-[600px] text-gray-400 md:text-lg"
            >
              Join the premier technology club at St. Joseph Higher Secondary School. Explore cutting-edge technologies,
              participate in workshops, hackathons, and build amazing projects with fellow tech enthusiasts.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link href="/join">
                <Button className="bg-primary hover:bg-primary/90 text-black font-medium px-8 py-6 text-lg relative overflow-hidden group">
                  <span className="relative z-10 flex items-center">
                    Join Now
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/10 px-8 py-6 text-lg"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary to-blue-500 opacity-75 blur-lg"></div>
              <div className="glass relative rounded-lg overflow-hidden">
                <div className="bg-black/90 p-2 border-b border-gray-700 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-xs text-gray-400">JITC Terminal</div>
                </div>

                <div className="p-4 font-mono text-sm h-[350px] overflow-y-auto bg-black/80" id="terminal-output">
                  <div className="text-white mb-2">Microsoft Windows [Version 10.0.19045.3803]</div>
                  <div className="text-white mb-4">(c) Microsoft Corporation. All rights reserved.</div>

                  {/* <div className="text-white mb-2">C:\Users\JITC&gt;</div> */}

                  <div className="mt-4 flex items-center">
                    <span className="text-white">C:\Users\JITC&gt;</span>
                    <input
                      type="text"
                      id="cmd-input"
                      className="flex-1 bg-transparent border-none outline-none text-green-400 ml-2 focus:ring-0"
                      placeholder="Type a command... Type 'help' for more info"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const input = e.currentTarget.value.trim().toLowerCase()
                          const output = document.getElementById("terminal-output")

                          if (output) {
                            // Add the command to the terminal
                            const commandDiv = document.createElement("div")
                            commandDiv.className = "text-white mt-2"
                            commandDiv.textContent = `C:\\Users\\JITC>${input}`
                            output.appendChild(commandDiv)

                            // Generate response based on command
                            const responseDiv = document.createElement("div")
                            responseDiv.className = "text-green-400 mt-1"

                            if (input === "help") {
                              responseDiv.innerHTML = `
                                Available commands:<br>
                                - help: Show this help message<br>
                                - dir: List files in current directory<br>
                                - whoami: Display current user<br>
                                - date: Display current date<br>
                                - time: Display current time<br>
                                - ver: Display Windows version<br>
                                - about: About JITC<br>
                                - cls: Clear the screen<br>
                              `
                            } else if (input === "dir") {
                              responseDiv.innerHTML = `
                                Directory of C:\\Users\\JITC<br><br>
                                04/24/2025  09:15 AM    &lt;DIR&gt;          Projects<br>
                                04/24/2025  10:22 AM    &lt;DIR&gt;          Documents<br>
                                04/24/2025  11:30 AM             4,096 README.md<br>
                                04/24/2025  01:45 PM             8,192 events.json<br>
                                04/24/2025  03:20 PM    &lt;DIR&gt;          Members<br>
                                04/24/2025  05:10 PM            12,288 club_charter.pdf<br>
                                04/24/2025  06:30 PM    &lt;DIR&gt;          Resources<br>
                              `
                            } else if (input === "whoami") {
                              responseDiv.textContent = "JITC\\Guest"
                            } else if (input === "date") {
                              responseDiv.textContent = new Date().toLocaleDateString()
                            } else if (input === "time") {
                              responseDiv.textContent = new Date().toLocaleTimeString()
                            } else if (input === "ver") {
                              responseDiv.textContent = "Microsoft Windows [Version 10.0.19045.3803]"
                            } else if (input === "about") {
                              responseDiv.innerHTML = `
                                Josephite IT Club (JITC)<br>
                                Version: 1.0.1<br>
                                Founded: 2017<br>
                                Mission: Evolve Through Tech<br>
                                Members: 150+<br>
                                Projects: 45+<br>
                                Events: 20+ per year<br>
                              `
                            } else if (input === "cls") {
                              // Clear all content except the initial header
                              while (output.childNodes.length > 4) {
                                output.removeChild(output.lastChild)
                              }
                              e.currentTarget.value = ""
                              return
                            } else {
                              responseDiv.textContent = `'${input}' is not recognized as an internal or external command, operable program or batch file. Type 'help' for available commands.`
                            }

                            output.appendChild(responseDiv)

                            // Auto scroll to bottom
                            output.scrollTop = output.scrollHeight

                            // Clear input
                            e.currentTarget.value = ""
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="flex items-center justify-center"
        >
          <div className="text-white text-sm flex flex-col items-center">
            <span className="text-gray-400">Scroll Down</span>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}>
              <ChevronRight size={20} className="rotate-90 text-primary mt-2" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


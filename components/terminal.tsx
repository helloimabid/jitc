"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

const commands = [
  "npm install @jitc/tech-innovation",
  "git clone https://github.com/jitc/projects.git",
  "cd ./projects && npm run dev",
  "python3 ai_model.py --train",
  "docker-compose up -d",
  "ssh user@jitc-server.edu",
  "sudo apt update && sudo apt upgrade",
  "flutter build ios --release",
  "aws s3 sync ./build s3://jitc-website",
  "kubectl get pods --all-namespaces",
]

export default function Terminal() {
  const [currentCommand, setCurrentCommand] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [cursorVisible, setCursorVisible] = useState(true)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    const typeCommand = () => {
      const randomCommand = commands[Math.floor(Math.random() * commands.length)]
      let i = 0

      const typeInterval = setInterval(() => {
        if (i <= randomCommand.length) {
          setCurrentCommand(randomCommand.substring(0, i))
          i++
        } else {
          clearInterval(typeInterval)

          // After typing is complete, add to history and clear current
          setTimeout(() => {
            setCommandHistory((prev) => {
              // Keep only the last 8 commands
              const newHistory = [...prev, randomCommand]
              if (newHistory.length > 8) {
                return newHistory.slice(newHistory.length - 8)
              }
              return newHistory
            })
            setCurrentCommand("")

            // Start typing a new command after a delay
            setTimeout(typeCommand, 2000)
          }, 1000)
        }
      }, 100)
    }

    typeCommand()
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute inset-0 flex items-center justify-center p-4 md:p-10"
      >
        <div
          ref={terminalRef}
          className="w-full max-w-4xl h-full max-h-[80vh] glass rounded-lg border border-gray-700 overflow-hidden"
        >
          <div className="bg-black/70 p-2 border-b border-gray-700 flex items-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="mx-auto text-xs text-gray-400">JITC Terminal</div>
          </div>

          <div className="p-4 font-mono text-sm md:text-base overflow-hidden h-full">
            <div className="text-green-400 mb-2">Welcome to JITC Terminal v1.0.0</div>
            <div className="text-gray-400 mb-4">Type 'help' for available commands</div>

            {commandHistory.map((cmd, index) => (
              <div key={index} className="mb-2">
                <span className="text-blue-400">jitc@tech-club:~$</span> <span className="text-green-300">{cmd}</span>
              </div>
            ))}

            <div className="flex">
              <span className="text-blue-400">jitc@tech-club:~$</span>{" "}
              <span className="text-green-300 ml-1">{currentCommand}</span>
              {cursorVisible && <span className="text-white ml-0.5">▋</span>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}


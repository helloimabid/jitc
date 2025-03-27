"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useLoading } from "@/context/loading-context"

const commands = {
  home: "Go to home page",
  about: "Go to about page",
  events: "Go to events page",
  developers: "Go to developers page",
  executives: "Go to executives page",
  contact: "Go to contact page",
  join: "Go to join page",
  help: "Show available commands",
  clear: "Clear the terminal",
}

export default function TerminalNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<{ command: string; output: string }[]>([])
  const [cursorVisible, setCursorVisible] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { isLoading } = useLoading()

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleCommand = (command: string) => {
    const cmd = command.toLowerCase().trim()
    let output = ""

    switch (cmd) {
      case "home":
        router.push("/")
        output = "Navigating to home page..."
        break
      case "about":
        router.push("/about")
        output = "Navigating to about page..."
        break
      case "events":
        router.push("/events")
        output = "Navigating to events page..."
        break
      case "developers":
        router.push("/developers")
        output = "Navigating to developers page..."
        break
      case "executives":
        router.push("/executives")
        output = "Navigating to executives page..."
        break
      case "contact":
        router.push("/contact")
        output = "Navigating to contact page..."
        break
      case "join":
        router.push("/join")
        output = "Navigating to join page..."
        break
      case "help":
        output = "Available commands:\n" + Object.entries(commands).map(([cmd, desc]) => `${cmd}: ${desc}`).join("\n")
        break
      case "clear":
        setHistory([])
        output = "Terminal cleared"
        break
      default:
        output = `Command not found: ${cmd}. Type 'help' for available commands.`
    }

    setHistory((prev) => [...prev, { command, output }])
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(input)
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  // Hide the terminal navigation when the site is loading
  if (isLoading) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-black/80 text-green-400 px-4 py-2 rounded-lg border border-green-400/30 hover:bg-green-400/10 transition-colors z-50"
      >
        Open Terminal
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl glass rounded-lg border border-gray-700 overflow-hidden"
          >
            <div className="bg-black/70 p-2 border-b border-gray-700 flex items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="mx-auto text-xs text-gray-400">JITC Navigation Terminal</div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 font-mono text-sm h-[60vh] overflow-y-auto">
              <div className="text-green-400 mb-2">Welcome to JITC Navigation Terminal v1.0.0</div>
              <div className="text-gray-400 mb-4">Type 'help' for available commands</div>

              {history.map((item, index) => (
                <div key={index} className="mb-2">
                  <div>
                    <span className="text-blue-400">jitc@nav:~$</span>{" "}
                    <span className="text-green-300">{item.command}</span>
                  </div>
                  <div className="text-gray-300 whitespace-pre-line">{item.output}</div>
                </div>
              ))}

              <div className="flex items-center">
                <span className="text-blue-400">jitc@nav:~$</span>{" "}
                <div className="flex-1 flex items-center relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent border-none outline-none text-green-300 focus:ring-0"
                    autoFocus
                  />
                  {cursorVisible && (
                    <span className="absolute left-0 text-white" style={{ left: `${input.length * 0.6}em` }}>
                      ▋
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
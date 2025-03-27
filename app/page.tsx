"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Terminal from "@/components/terminal"
import Footer from "@/components/footer"
import { TerminalLoader } from "@/components/ui/TerminalLoader"
import { useLoading } from "@/context/loading-context"


export default function Home() {
  const { isLoading, setIsLoading } = useLoading()

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  if (isLoading) {
    return <TerminalLoader onLoadingComplete={handleLoadingComplete} />
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-slate-900 to-black">
      <Terminal />
      <Navbar />
      <Hero />
      <Footer />
    </main>
  )
}

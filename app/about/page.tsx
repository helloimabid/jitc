import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Terminal from "@/components/terminal"
import AboutContent from "@/components/about-content"

export default function About() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-slate-900 to-black">
      <Terminal />
      <Navbar />
      <AboutContent />
      <Footer />
    </main>
  )
}

// Compare this snippet from app/events/page.tsx:
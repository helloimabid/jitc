import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Terminal from "@/components/terminal"
import DevelopersContent from "@/components/developers-content"

export default function Developers() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-slate-900 to-black">
      <Terminal />
      <Navbar />
      <DevelopersContent />
      <Footer />
    </main>
  )
}


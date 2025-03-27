import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Terminal from "@/components/terminal"
import ExecutivesContent from "@/components/executives-content"

export default function Executives() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-slate-900 to-black">
      <Terminal />
      <Navbar />
      <ExecutivesContent />
      <Footer />
    </main>
  )
}


import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Terminal from "@/components/terminal"
import ModeratorsContent from "@/components/moderators-content"

export default function Moderators() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-slate-900 to-black">
      <Terminal />
      <Navbar />
      <ModeratorsContent />
      <Footer />
    </main>
  )
}


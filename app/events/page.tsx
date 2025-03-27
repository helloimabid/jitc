import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Terminal from "@/components/terminal"
import EventsContent from "@/components/events-content"

export default function Events() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-slate-900 to-black">
      <Terminal />
      <Navbar />
      <EventsContent />
      <Footer />
    </main>
  )
}


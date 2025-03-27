import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Terminal from "@/components/terminal"
import ContactContent from "@/components/contact-content"

export default function Contact() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-slate-900 to-black">
      <Terminal />
      <Navbar />
      <ContactContent />
      <Footer />
    </main>
  )
}


"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Code, Users, Calendar, Award, Cpu, Lightbulb } from "lucide-react"

export default function AboutContent() {
  return (
    <section className="relative pt-20 pb-16">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About <span className="text-primary">JITC</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Learn about our mission, vision, and the team behind the Josephite IT Club.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-gray-400 mb-6">
              The Josephite IT Club (JITC) is dedicated to fostering technological innovation and digital literacy among
              students. We aim to create a collaborative environment where technology enthusiasts can learn, create, and
              grow together.
            </p>
            <p className="text-gray-400">
              Through workshops, hackathons, projects, and mentorship programs, we empower students to develop technical
              skills and prepare them for the rapidly evolving digital landscape.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass rounded-lg p-1"
          >
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <Image
                src="https://scontent.fdac24-1.fna.fbcdn.net/v/t39.30808-6/482253741_1180242530185567_7242508943495363133_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEbrocrObgAPKas6f-QxY02Oki3RQ-UaaA6SLdFD5RpoMTbgv7ez9dPNOWLlkI4OLy1sXeAeaYeSQ3n9C1HJRWv&_nc_ohc=u8vfRneD1O4Q7kNvgHo2ypF&_nc_oc=AdlvuLgkRH5rSWLfEYHuQsqjBZNxfr7XSEFR7SaX-Fl-v7L7doObbfMyOQA-qfO5juk&_nc_zt=23&_nc_ht=scontent.fdac24-1.fna&_nc_gid=pKzE2nZT35R8YcqxJ0iTPg&oh=00_AYFKa5lorsd8i3Jk4eB4PuQhlILQWEOfkVZs6MFdvyawSg&oe=67E78ABC"
                alt="JITC Team"
                width={600}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-10 text-center">What We Do</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass rounded-lg p-6 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-primary/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Code className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Coding Workshops</h3>
              <p className="text-gray-400">
                Regular hands-on sessions on programming languages, web development, app development, and more.
              </p>
            </div>

            <div className="glass rounded-lg p-6 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-primary/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Cpu className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Tech Projects</h3>
              <p className="text-gray-400">
                Collaborative projects that solve real-world problems and showcase student innovation.
              </p>
            </div>

            <div className="glass rounded-lg p-6 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-primary/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Calendar className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Tech Events</h3>
              <p className="text-gray-400">
                Hackathons, coding competitions, tech talks, and industry visits to expand horizons.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Our Values</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-primary/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Innovation</h3>
              <p className="text-gray-400 text-sm">Encouraging creative thinking and novel solutions</p>
            </div>

            <div className="text-center">
              <div className="bg-primary/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Users className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Collaboration</h3>
              <p className="text-gray-400 text-sm">Working together to achieve greater results</p>
            </div>

            <div className="text-center">
              <div className="bg-primary/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Award className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Excellence</h3>
              <p className="text-gray-400 text-sm">Striving for the highest quality in everything we do</p>
            </div>

            <div className="text-center">
              <div className="bg-primary/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Code className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Learning</h3>
              <p className="text-gray-400 text-sm">Continuous growth and knowledge sharing</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Our History</h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-8">
            Founded in 2015, the Josephite IT Club has grown from a small group of tech enthusiasts to one of the most
            active and innovative student organizations at St. Joseph Higher Secondary School. Over the years, we've
            organized numerous successful events, launched impactful projects, and helped hundreds of students discover
            their passion for technology.
          </p>

          <div className="glass rounded-lg p-8 max-w-3xl mx-auto">
            <blockquote className="text-gray-300 italic">
              "The Josephite IT Club has been instrumental in fostering a culture of innovation and technological
              curiosity among our students. Their initiatives have significantly contributed to the digital literacy of
              our student body."
            </blockquote>
            <div className="mt-4 flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-3">
                <Image 
                  src="https://scontent.fdac24-4.fna.fbcdn.net/v/t39.30808-6/485622989_1189158269293993_4588019602640346849_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeF71NDbUQM-8mPFxCIJEHtiN3onYGviuBU3eidga-K4FYM1qMU87HlW1aTjVL-N3ixwFxjhbWqPwvZemHWcN-MA&_nc_ohc=x9d0ZMqPQ5IQ7kNvgGTNgCZ&_nc_oc=Adko6VkfrWtuNj2CXGGuSoLalCK3LOsITShXDjOd-JINsrAD0KscXRYN3-_tEq_CjGo&_nc_zt=23&_nc_ht=scontent.fdac24-4.fna&_nc_gid=EHCf98Yjjo1G2EciksfZfQ&oh=00_AYG6EInUVhGzltUrEyfDlnC8Fhs5Cy1kkoK74Y9qsBLvAw&oe=67EB56DC" 
                  alt="School Principal" 
                  width={140} 
                  height={140} 
                  className="object-cover"
                />
              </div>
              <p className="text-primary font-medium">- Principal</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

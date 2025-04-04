"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Code, Users, Calendar, Award, Cpu, Lightbulb } from "lucide-react"
import { createClient } from "@/lib/supabase"

type InterestKey = "web-dev" | "mobile-dev" | "ai-ml" | "cybersecurity" | "game-dev" | "data-science" | "iot" | "ui-ux" | "logistics" | "equity" | "finance" | "human-resources"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  class: string
  section: string
  roll: string
  membershipType: string
  transactionId: string
  interests: Record<InterestKey, boolean>
  experience: string
  motivation: string
  agreeToTerms: boolean
}

export default function JoinContent() {
  const [membershipType, setMembershipType] = useState("general")
  const [membershipFee, setMembershipFee] = useState(250)

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    class: "",
    section: "",
    roll: "",
    membershipType: "general",
    transactionId: "",
    interests: {
      "web-dev": false,
      "mobile-dev": false,
      "ai-ml": false,
      "cybersecurity": false,
      "game-dev": false,
      "Media-and-Visuals": false,
      "iot": false,
      "ui-ux": false,
      "logistics": false,
      "equity": false,
      "finance": false,
      "human-resources": false,
    },
    experience: "",
    motivation: "",
    agreeToTerms: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleInterestChange = (name: InterestKey, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      interests: { ...prev.interests, [name]: checked },
    }))
  }

  const handleTermsChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      agreeToTerms: checked,
    }))
  }

  const handleMembershipTypeChange = (value: string) => {
    setMembershipType(value)
    setMembershipFee(value === "general" ? 250 : 350)
    handleSelectChange("membershipType", value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Check if email already exists
      const { data: emailCheck, error: emailCheckError } = await supabase
        .from("join_submissions")
        .select("id")
        .eq("email", formData.email)
      
      if (emailCheckError) {
        console.error("Email check error:", emailCheckError)
        throw emailCheckError
      }
      
      if (emailCheck && emailCheck.length > 0) {
        setError("An application with this email already exists. Please use a different email or contact us if you need to update your existing application.")
        setIsSubmitting(false)
        return
      }
      
      // Check if roll number already exists
      const { data: rollCheck, error: rollCheckError } = await supabase
        .from("join_submissions")
        .select("id")
        .eq("roll", formData.roll)
      
      if (rollCheckError) {
        console.error("Roll check error:", rollCheckError)
        throw rollCheckError
      }
      
      if (rollCheck && rollCheck.length > 0) {
        setError("A student with this roll number has already applied. Please verify your roll number or contact us if you need assistance.")
        setIsSubmitting(false)
        return
      }
      
      // If no duplicates, proceed with submission
      const { error } = await supabase.from("join_submissions").insert([
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          class: formData.class,
          section: formData.section,
          roll: formData.roll,
          membership_type: formData.membershipType,
          transaction_id: formData.transactionId,
          interests: Object.entries(formData.interests)
            .filter(([_, value]) => value)
            .map(([key]) => key),
          experience: formData.experience,
          motivation: formData.motivation,
          status: "pending",
        },
      ])

      if (error) {
        console.error("Submission error:", error)
        if (error.code === "23505") {
          if (error.message.includes("unique_roll")) {
            throw new Error("A student with this roll number has already applied. Please verify your roll number.")
          } else {
            throw new Error("An application with this email already exists. Please use a different email.")
          }
        }
        throw error
      }

      setIsSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      console.error("Form submission error:", err)
      setError(err.message || "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  const benefits = [
    {
      icon: <Code className="h-10 w-10 text-primary" />,
      title: "Skill Development",
      description: "Enhance your technical skills through workshops, projects, and mentorship from experienced peers.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Networking",
      description: "Connect with like-minded individuals, industry professionals, and potential employers.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "Events & Competitions",
      description: "Participate in hackathons, coding competitions, and tech conferences to challenge yourself.",
    },
    {
      icon: <Award className="h-10 w-10 text-primary" />,
      title: "Recognition",
      description: "Showcase your projects and achievements, earning recognition for your technical abilities.",
    },
    {
      icon: <Cpu className="h-10 w-10 text-primary" />,
      title: "Access to Resources",
      description: "Get access to cutting-edge technology, software, and learning resources.",
    },
    {
      icon: <Lightbulb className="h-10 w-10 text-primary" />,
      title: "Innovation",
      description: "Work on innovative projects that solve real-world problems and make a difference.",
    },
  ]

  return (
    <section className="relative pt-20 pb-16">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center glass rounded-lg p-12"
          >
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Application Submitted Successfully!</h1>
            <p className="text-gray-400 mb-8">
              Thank you for your interest in joining the Josephite IT Club. We've received your application and will
              review it shortly. You can expect to hear back from us within 5-7 business days.
            </p>
            <div className="glass rounded-lg p-6 mb-8 text-left">
              <h3 className="text-white font-medium mb-4">What's Next?</h3>
              <ol className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                    1
                  </span>
                  <span>Our team will review your application</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                    2
                  </span>
                  <span>You'll receive an email with the status of your application</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                    3
                  </span>
                  <span>If accepted, you'll be invited to our next orientation session</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                    4
                  </span>
                  <span>Welcome to the JITC family!</span>
                </li>
              </ol>
            </div>
            <Button onClick={() => (window.location.href = "/")} className="bg-primary text-black hover:bg-primary/90">
              Return to Homepage
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Join <span className="text-primary">JITC</span>
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Become a part of our vibrant community of tech enthusiasts and innovators. Fill out the application form
                below to start your journey with us.
              </p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-900/30 border-l-4 border-red-500 text-red-400 p-4 rounded-lg max-w-3xl mx-auto"
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </motion.div>
            )}

            <div className="grid gap-12 lg:grid-cols-2 items-start">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-white mb-8">Why Join Us?</h2>

                <div className="grid gap-6 sm:grid-cols-2">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="glass rounded-lg p-6 hover:border-primary/30 hover:transform hover:scale-[1.02] transition-all duration-300"
                    >
                      <div className="mb-4">{benefit.icon}</div>
                      <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                      <p className="text-gray-400 text-sm">{benefit.description}</p>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="glass rounded-lg p-6 mt-8"
                >
                  <h3 className="text-white font-medium mb-4">Membership Requirements</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary mr-2 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Currently enrolled student at St. Joseph Higher Secondary School</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary mr-2 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Interest in technology, programming, or digital innovation</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary mr-2 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Commitment to attend regular meetings and participate in club activities</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary mr-2 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Willingness to learn and collaborate with fellow members</span>
                    </li>
                  </ul>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="glass rounded-lg p-8 sticky top-24">
                  <h2 className="text-2xl font-bold text-white mb-6">Application Form</h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                          First Name *
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="bg-gray-900/50 border-gray-700 text-white focus:border-primary"
                        />
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                          Last Name *
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="bg-gray-900/50 border-gray-700 text-white focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-gray-900/50 border-gray-700 text-white focus:border-primary"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                        Phone Number *
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-gray-900/50 border-gray-700 text-white focus:border-primary"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="class" className="block text-sm font-medium text-gray-300 mb-1">
                          Class *
                        </label>
                        <Input
                          id="class"
                          name="class"
                          value={formData.class}
                          onChange={handleChange}
                          required
                          className="bg-gray-900/50 border-gray-700 text-white focus:border-primary"
                          placeholder="e.g. 12"
                        />
                      </div>

                      <div>
                        <label htmlFor="section" className="block text-sm font-medium text-gray-300 mb-1">
                          Section *
                        </label>
                        <Input
                          id="section"
                          name="section"
                          value={formData.section}
                          onChange={handleChange}
                          required
                          className="bg-gray-900/50 border-gray-700 text-white focus:border-primary"
                          placeholder="e.g. pluto"
                        />
                      </div>

                      <div>
                        <label htmlFor="roll" className="block text-sm font-medium text-gray-300 mb-1">
                          Roll Number *
                        </label>
                        <Input
                          id="roll"
                          name="roll"
                          value={formData.roll}
                          onChange={handleChange}
                          required
                          className="bg-gray-900/50 border-gray-700 text-white focus:border-primary"
                          placeholder="e.g. 123"
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Membership Type *</label>
                      <Select defaultValue="general" onValueChange={handleMembershipTypeChange} required>
                        <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-primary">
                          <SelectValue placeholder="Select membership type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Member (250 BDT)</SelectItem>
                          <SelectItem value="executive">Executive Member (350 BDT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="glass rounded-lg p-4 mt-4 mb-2">
                      <h4 className="text-white font-medium mb-2">Payment Instructions</h4>
                      <p className="text-gray-400 text-sm mb-2">
                        Please send {membershipFee} BDT to the following Bkash number:
                      </p>
                      <div className="flex items-center bg-primary/10 p-2 rounded-md mb-3">
                        <span className="text-primary font-medium">01533357068</span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        1. Open your Bkash app
                        <br />
                        2. Select "Send Money"
                        <br />
                        3. Enter the number: 01533357068
                        <br />
                        4. Enter amount: {membershipFee} BDT
                        <br />
                        5. Add reference: Your Name
                        <br />
                        6. Complete the transaction
                        <br />
                        7. Enter the Transaction ID below
                      </p>
                    </div>

                    <div>
                      <label htmlFor="transactionId" className="block text-sm font-medium text-gray-300 mb-1">
                        Bkash Transaction ID *
                      </label>
                      <Input
                        id="transactionId"
                        name="transactionId"
                        value={formData.transactionId || ""}
                        onChange={handleChange}
                        required
                        className="bg-gray-900/50 border-gray-700 text-white focus:border-primary"
                        placeholder="e.g. 8N7DX5TV"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Enter the Transaction ID you received from Bkash after payment
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">Areas of Interest (Or in Department your interested in) *</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="web-dev"
                            name="web-dev"
                            checked={formData.interests["web-dev"] || false}
                            onCheckedChange={(checked) => handleInterestChange("web-dev", checked as boolean)}
                          />
                          <label htmlFor="web-dev" className="text-sm text-gray-300">
                            Web Development
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mobile-dev"
                            name="mobile-dev"
                            checked={formData.interests["mobile-dev"] || false}
                            onCheckedChange={(checked) => handleInterestChange("mobile-dev", checked as boolean)}
                          />
                          <label htmlFor="mobile-dev" className="text-sm text-gray-300">
                            Mobile Development
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="ai-ml"
                            name="ai-ml"
                            checked={formData.interests["ai-ml"] || false}
                            onCheckedChange={(checked) => handleInterestChange("ai-ml", checked as boolean)}
                          />
                          <label htmlFor="ai-ml" className="text-sm text-gray-300">
                            AI & Machine Learning
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="cybersecurity"
                            name="cybersecurity"
                            checked={formData.interests["cybersecurity"] || false}
                            onCheckedChange={(checked) => handleInterestChange("cybersecurity", checked as boolean)}
                          />
                          <label htmlFor="cybersecurity" className="text-sm text-gray-300">
                            Cybersecurity
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="game-dev"
                            name="game-dev"
                            checked={formData.interests["game-dev"] || false}
                            onCheckedChange={(checked) => handleInterestChange("game-dev", checked as boolean)}
                          />
                          <label htmlFor="game-dev" className="text-sm text-gray-300">
                            Game Development
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="data-science"
                            name="data-science"
                            checked={formData.interests["data-science"] || false}
                            onCheckedChange={(checked) => handleInterestChange("data-science", checked as boolean)}
                          />
                          <label htmlFor="Media-and-Visuals" className="text-sm text-gray-300">
                            Media and Visuals
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="iot"
                            name="iot"
                            checked={formData.interests["iot"] || false}
                            onCheckedChange={(checked) => handleInterestChange("iot", checked as boolean)}
                          />
                          <label htmlFor="iot" className="text-sm text-gray-300">
                            IoT & Hardware
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="ui-ux"
                            name="ui-ux"
                            checked={formData.interests["ui-ux"] || false}
                            onCheckedChange={(checked) => handleInterestChange("ui-ux", checked as boolean)}
                          />
                          <label htmlFor="ui-ux" className="text-sm text-gray-300">
                            UI/UX Design
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="logistics"
                            name="logistics"
                            checked={formData.interests["logistics"] || false}
                            onCheckedChange={(checked) => handleInterestChange("logistics", checked as boolean)}
                          />
                          <label htmlFor="logistics" className="text-sm text-gray-300">
                            Logistics
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="equity"
                            name="equity"
                            checked={formData.interests["equity"] || false}
                            onCheckedChange={(checked) => handleInterestChange("equity", checked as boolean)}
                          />
                          <label htmlFor="equity" className="text-sm text-gray-300">
                            Equity
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="finance"
                            name="finance"
                            checked={formData.interests["finance"] || false}
                            onCheckedChange={(checked) => handleInterestChange("finance", checked as boolean)}
                          />
                          <label htmlFor="finance" className="text-sm text-gray-300">
                            Finance
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="human-resources"
                            name="human-resources"
                            checked={formData.interests["human-resources"] || false}
                            onCheckedChange={(checked) => handleInterestChange("human-resources", checked as boolean)}
                          />
                          <label htmlFor="human-resources" className="text-sm text-gray-300">
                            Human Resources
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-1">
                        Technical Experience
                      </label>
                      <Textarea
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="bg-gray-900/50 border-gray-700 text-white focus:border-primary min-h-[100px]"
                        placeholder="Briefly describe your technical skills and experience (if any). No prior experience is required."
                      />
                    </div>

                    <div>
                      <label htmlFor="motivation" className="block text-sm font-medium text-gray-300 mb-1">
                        Why do you want to join JITC? *
                      </label>
                      <Textarea
                        id="motivation"
                        name="motivation"
                        value={formData.motivation}
                        onChange={handleChange}
                        required
                        className="bg-gray-900/50 border-gray-700 text-white focus:border-primary min-h-[100px]"
                        placeholder="Tell us why you're interested in joining the IT Club and what you hope to gain from the experience."
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleTermsChange(checked as boolean)}
                        required
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm text-gray-300 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the club&apos;s code of conduct and terms
                        </label>
                        <p className="text-sm text-gray-400">
                          By submitting this form, you agree to abide by the club&apos;s rules and participate actively.
                        </p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary text-black hover:bg-primary/90 flex items-center justify-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}


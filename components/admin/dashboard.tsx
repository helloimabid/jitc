"use client"

import { useState, useEffect } from "react"
import { getDashboardStats } from "@/lib/supabase-client"
import { Calendar, Users, Code, MessageSquare, UserPlus, Bell, Activity } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase"
// import {unreadCount, pendingCount} from "@/components/admin/admin-sidebar"
interface AdminDashboardProps {
  stats: {
    events: number
    executives: number
    moderators: number
    developers: number
    contactSubmissions: number
    joinSubmissions: number
    unreadContactSubmissions: number
    pendingJoinSubmissions: number
    totalCount: number
  }
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dashboardStats, setDashboardStats] = useState(stats)

  // Refresh stats from the database
  const refreshStats = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Get counts from all relevant tables
      const [executivesRes, moderatorsRes, developersRes, contactRes, unreadContactRes, joinRes, pendingJoinRes, eventsRes] = await Promise.all([
        supabase.from('executives').select('id', { count: 'exact', head: true }),
        supabase.from('moderators').select('id', { count: 'exact', head: true }),
        supabase.from('developers').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('join_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('join_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('events').select('id', { count: 'exact', head: true })
      ])
      
      const updatedStats = {
        executives: executivesRes.count || 0,
        moderators: moderatorsRes.count || 0,
        developers: developersRes.count || 0,
        contactSubmissions: contactRes.count || 0,
        joinSubmissions: joinRes.count || 0,
        unreadContactSubmissions: unreadContactRes.count || 0,
        pendingJoinSubmissions: pendingJoinRes.count || 0,
        events: eventsRes.count || 0,
        totalCount: 0
      }
      
      // Calculate total
      updatedStats.totalCount = updatedStats.executives + updatedStats.moderators + 
        updatedStats.developers + updatedStats.contactSubmissions + 
        updatedStats.joinSubmissions + updatedStats.events
        
      setDashboardStats(updatedStats)
    } catch (e: any) {
      console.error("Error fetching dashboard stats:", e)
      setError("Failed to refresh dashboard statistics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    // Refresh stats on load and every 60 seconds
    refreshStats()
    const statsTimer = setInterval(refreshStats, 60000)

    return () => {
      clearInterval(timer)
      clearInterval(statsTimer)
    }
  }, [])

  const statCards = [
    {
      title: "Events",
      value: dashboardStats.events,
      icon: Calendar,
      link: "/admin/events",
      color: "from-blue-500 to-blue-600",
      hoverColor: "from-blue-600 to-blue-700",
    },
    {
      title: "Executives",
      value: dashboardStats.executives,
      icon: Users,
      link: "/admin/executives",
      color: "from-emerald-500 to-emerald-600",
      hoverColor: "from-emerald-600 to-emerald-700",
    },
    {
      title: "Moderators",
      value: dashboardStats.moderators,
      icon: Users,
      link: "/admin/moderators",
      color: "from-cyan-500 to-cyan-600",
      hoverColor: "from-cyan-600 to-cyan-700",
    },
    {
      title: "Developers",
      value: dashboardStats.developers,
      icon: Code,
      link: "/admin/developers",
      color: "from-purple-500 to-purple-600",
      hoverColor: "from-purple-600 to-purple-700",
    },
    {
      title: "Contact Submissions",
      value: dashboardStats.contactSubmissions,
      icon: MessageSquare,
      link: "/admin/contact",
      color: "from-amber-500 to-amber-600",
      hoverColor: "from-amber-600 to-amber-700",
      badge: dashboardStats.unreadContactSubmissions > 0 ? dashboardStats.unreadContactSubmissions : null,
    },
    {
      title: "Join Submissions",
      value: dashboardStats.joinSubmissions,
      icon: UserPlus,
      link: "/admin/join",
      color: "from-pink-500 to-pink-600",
      hoverColor: "from-pink-600 to-pink-700",
      badge: dashboardStats.pendingJoinSubmissions > 0 ? dashboardStats.pendingJoinSubmissions : null,
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div className="w-full max-w-full">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Welcome to JITC Admin</h2>
          <p className="text-gray-500 dark:text-gray-400 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
          <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium">
            Total Items: {dashboardStats.totalCount}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded dark:bg-red-900/20 dark:text-red-400">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {statCards.map((card) => (
            <motion.div key={card.title} variants={item}>
              <Link href={card.link} className="block h-full">
                <div 
                  className={`relative h-full rounded-xl shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-md bg-gradient-to-br ${card.color} hover:${card.hoverColor}`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <card.icon className="h-16 w-16 text-white" />
                  </div>
                  <div className="relative p-6 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-white">{card.title}</h3>
                      {card.badge && (
                        <span className="bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded-full">
                          {card.badge} new
                        </span>
                      )}
                    </div>
                    <p className="text-4xl font-bold text-white mt-2">{card.value}</p>
                    <div className="mt-auto pt-4">
                      <span className="text-white/80 text-sm group-hover:text-white transition-colors duration-200">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

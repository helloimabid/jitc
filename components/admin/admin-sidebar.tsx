"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Calendar,
  Users,
  Code,
  MessageSquare,
  UserPlus,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Settings,
  LogOut,
} from "lucide-react"
import { createClient } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

interface AdminSidebarProps {
  onToggle?: (isOpen: boolean) => void
}

export default function AdminSidebar({ onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadContacts, setUnreadContacts] = useState(0)
  const [pendingJoins, setPendingJoins] = useState(0)
  const [totalNotifications, setTotalNotifications] = useState(0)

  // Handle sidebar preferences
  useEffect(() => {
    // Fetch notifications count (unread messages, pending approvals, etc.)
    const fetchNotifications = async () => {
      try {
        const supabase = createClient()

        // Get unread contact submissions count
        const { data: contactData, error: contactError } = await supabase
          .from("contact_submissions")
          .select("id")
          .eq("is_read", false)

        if (contactError) {
          console.error("Contact data fetch error:", contactError)
          throw contactError
        }

        const unreadCount = contactData?.length || 0
        setUnreadContacts(unreadCount)

        // Get pending join submissions count
        const { data: joinData, error: joinError } = await supabase
          .from("join_submissions")
          .select("id")
          .eq("status", "pending")

        if (joinError) {
          console.error("Join data fetch error:", joinError)
          throw joinError
        }

        const pendingCount = joinData?.length || 0
        setPendingJoins(pendingCount)

        // Set total notifications
        setTotalNotifications(unreadCount + pendingCount)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    // Check if sidebar preference is stored
    const savedCollapsed = localStorage.getItem("adminSidebarCollapsed")
    if (savedCollapsed) {
      setCollapsed(savedCollapsed === "true")
    }

    // Handle window resize
    const handleResize = () => {
      // Lower breakpoint to 1020px for more responsive behavior
      const isMobileView = window.innerWidth < 1024
      setIsMobile(isMobileView)

      if (isMobileView) {
        setCollapsed(true)
        setMobileOpen(false)
      }
    }

    // Initial check
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      clearInterval(interval)
    }
  }, [])

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("adminSidebarCollapsed", JSON.stringify(collapsed))
  }, [collapsed])

  // Notify parent component about sidebar state changes
  useEffect(() => {
    if (onToggle) {
      onToggle(isMobile ? mobileOpen : !collapsed)
    }
  }, [mobileOpen, collapsed, isMobile, onToggle])

  const sidebarLinks = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: Home,
    },
    {
      name: "Events",
      href: "/admin/events",
      icon: Calendar,
    },
    {
      name: "Executives",
      href: "/admin/executives",
      icon: Users,
    },
    {
      name: "moderators",
      href: "/admin/moderators",
      icon: Users,
    },
    {
      name: "Developers",
      href: "/admin/developers",
      icon: Code,
    },
    {
      name: "Contact",
      href: "/admin/contact",
      icon: MessageSquare,
      notification: unreadContacts,
    },
    {
      name: "Join",
      href: "/admin/join",
      icon: UserPlus,
      notification: pendingJoins,
    },
    {
      href: "/admin/settings",
      icon: Settings,
      name: "Settings",
    },
  ]

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setCollapsed(!collapsed)
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient()

      await supabase.auth.signOut()

      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      })

      router.push("/login")

      setTimeout(() => {
        window.location.href = "/login"
      }, 100)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <>
      {/* Mobile/Tablet menu button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 ${
          isMobile ? "block" : "hidden"
        } bg-primary text-white p-2 rounded-lg shadow-md hover:bg-primary/90 transition-colors`}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile/Tablet overlay */}
      {isMobile && (
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
          )}
        </AnimatePresence>
      )}

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        <motion.div
          initial={false}
          animate={{
            width: isMobile ? (mobileOpen ? "240px" : "0px") : collapsed ? "70px" : "240px",
            x: isMobile && !mobileOpen ? "-100%" : 0,
          }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm transition-transform duration-300 transform ${
            isMobile
              ? mobileOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : collapsed
                ? "translate-x-0"
                : "translate-x-0"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
              {!collapsed && (
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xl font-bold text-gray-800 dark:text-gray-200"
                >
                  JITC Admin
                </motion.h1>
              )}
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 ml-auto"
              >
                {collapsed ? (
                  <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
                ) : (
                  <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 py-4 overflow-y-auto">
              <ul className="space-y-1 px-2">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors 
                          ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                          }`}
                      >
                        <link.icon
                          size={20}
                          className={isActive ? "text-primary-foreground" : "text-gray-500 dark:text-gray-400"}
                        />
                        {(!collapsed || isMobile) && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="ml-3"
                          >
                            {link.name}
                            {link.notification ? (
                              <span className="ml-2 bg-primary text-primary-foreground text-xs py-0.5 px-1.5 rounded-full">
                                {link.notification}
                              </span>
                            ) : null}
                          </motion.span>
                        )}
                        {collapsed && !isMobile && link.notification ? (
                          <span className="ml-2 bg-primary text-primary-foreground text-xs py-0.5 px-1.5 rounded-full">
                            {link.notification}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Sidebar footer */}
            <div
              className={`p-4 border-t border-gray-200 dark:border-gray-800 ${collapsed && !isMobile ? "hidden" : "block"}`}
            >
              {/* <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 w-full group"
              >
                <LogOut className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                {(!collapsed || isMobile) && <span>Sign Out</span>}
              </button> */}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main content wrapper - adds margin to prevent content from going under sidebar */}
      <div
        className={`transition-all duration-200 ${isMobile ? "ml-0" : collapsed ? "lg:ml-[70px]" : "lg:ml-[240px]"}`}
      />
    </>
  )
}


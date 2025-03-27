"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Eye, Trash2, Search, Check, X, Clock, AlertCircle, Mail } from "lucide-react"
import type { ContactSubmission } from "@/types/contact"
import { motion, AnimatePresence } from "framer-motion"

interface ContactAdminProps {
  initialSubmissions: any[]
}

export default function ContactAdmin({ initialSubmissions }: ContactAdminProps) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>(initialSubmissions)
  const [filteredSubmissions, setFilteredSubmissions] = useState<ContactSubmission[]>(initialSubmissions)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true)
      setError(null)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("contact_submissions")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        console.log("Fetched contact submissions:", data)
        setSubmissions(data || [])
        setFilteredSubmissions(data || [])
      } catch (err: any) {
        console.error("Failed to fetch submissions:", err)
        setError(err.message || "Failed to load contact submissions")
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()

    // Set up an interval to refresh data periodically
    const interval = setInterval(fetchSubmissions, 60000)

    // Clean up on unmount
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSubmissions(submissions)
    } else {
      const filtered = submissions.filter(
        (submission) =>
          submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.message.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredSubmissions(filtered)
    }
  }, [searchTerm, submissions])

  const handleView = async (submission: ContactSubmission) => {
    setSelectedSubmission(submission)
    setIsViewModalOpen(true)

    // Mark as read if not already
    if (!submission.is_read) {
      try {
        setLoading(true)
        console.log("Attempting to mark submission as read:", submission.id)

        const supabase = createClient()

        // First verify the current state in the database
        const { data: checkData, error: checkError } = await supabase
          .from("contact_submissions")
          .select("is_read")
          .eq("id", submission.id)
          .single()

        if (checkError) {
          console.error("Error checking submission state:", checkError)
          throw checkError
        }

        console.log("Current submission state:", checkData)

        // Only update if it's still unread
        if (!checkData.is_read) {
          const { data, error } = await supabase
            .from("contact_submissions")
            .update({ is_read: true })
            .eq("id", submission.id)
            .select()

          if (error) {
            console.error("Error updating is_read status:", error)
            throw error
          }

          console.log("Update response:", data)

          // Update UI state to reflect the change
          setSubmissions((prevSubmissions) =>
            prevSubmissions.map((sub) => (sub.id === submission.id ? { ...sub, is_read: true } : sub)),
          )
          setFilteredSubmissions((prevSubmissions) =>
            prevSubmissions.map((sub) => (sub.id === submission.id ? { ...sub, is_read: true } : sub)),
          )
          setSelectedSubmission({ ...submission, is_read: true })

          // Notify user of success
          setSuccessMessage("Submission marked as read!")

          // Refresh the router to update any UI components
          router.refresh()
        }

        // Auto-dismiss success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      } catch (err: any) {
        console.error("Failed to mark as read:", err)
        setError(err.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCloseView = () => {
    setIsViewModalOpen(false)
    setSelectedSubmission(null)
    setError(null)
    setSuccessMessage(null)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const supabase = createClient()
        const { error } = await supabase.from("contact_submissions").delete().eq("id", id)

        if (error) throw error

        setSuccessMessage("Submission deleted successfully!")
        setSubmissions((prevSubmissions) => prevSubmissions.filter((sub) => sub.id !== id))
        setFilteredSubmissions((prevSubmissions) => prevSubmissions.filter((sub) => sub.id !== id))

        // Auto-dismiss success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)

        router.refresh()
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleOpenModal = async (submission: ContactSubmission) => {
    setSelectedSubmission(submission)
    setIsViewModalOpen(true)

    // Mark as read if it's unread
    if (!submission.is_read) {
      try {
        setLoading(true)
        console.log(
          "Attempting to mark submission as read:",
          submission.id,
          "Current is_read value:",
          submission.is_read,
        )

        // First, check the actual value in the database
        const supabase = createClient()
        const { data: checkData, error: checkError } = await supabase
          .from("contact_submissions")
          .select("*")
          .eq("id", submission.id)
          .single()

        if (checkError) {
          console.error("Check error:", checkError)
          throw checkError
        }

        console.log("Database record before update:", checkData)

        // Now update the record
        const { data, error } = await supabase
          .from("contact_submissions")
          .update({
            is_read: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", submission.id)
          .select()

        if (error) {
          console.error("Supabase update error:", error)
          throw error
        }

        console.log("Update response from handleOpenModal:", data)
        router.refresh() // Force a refresh to update sidebar

        // Update local state
        setSubmissions((prevSubmissions) =>
          prevSubmissions.map((sub) => (sub.id === submission.id ? { ...sub, is_read: true } : sub)),
        )
        setFilteredSubmissions((prevSubmissions) =>
          prevSubmissions.map((sub) => (sub.id === submission.id ? { ...sub, is_read: true } : sub)),
        )
        setSelectedSubmission({ ...submission, is_read: true })
        setSuccessMessage("Submission marked as read!")

        // Auto-dismiss success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      } catch (err: any) {
        console.error("Error marking submission as read:", err)
        setError(err.message || "Failed to mark submission as read")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="w-full max-w-full">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Contact Submissions</h2>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded dark:bg-red-900/20 dark:text-red-400 flex items-center justify-between"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-700 dark:text-red-400 hover:text-red-900">
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded dark:bg-green-900/20 dark:text-green-400 flex items-center justify-between"
          >
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-700 dark:text-green-400 hover:text-green-900"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading && filteredSubmissions.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-4">
              <Mail className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No submissions found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {searchTerm ? "Try adjusting your search terms" : "No contact submissions available yet"}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <div className="sm:overflow-x-auto -mx-4 sm:mx-0">
              {/* Mobile card view */}
              <div className="block sm:hidden">
                <div className="space-y-3 px-4">
                  {filteredSubmissions.map((submission) => (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`${!submission.is_read ? "bg-blue-50 dark:bg-blue-900/10" : ""} bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{submission.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{submission.email}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">{submission.subject}</p>
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                submission.is_read
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              }`}
                            >
                              {submission.is_read ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" /> Read
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" /> Unread
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenModal(submission)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </button>
                          <button
                            onClick={() => handleDelete(submission.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Delete submission"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Desktop table view */}
              <div className="hidden sm:block">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Subject
                      </th>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSubmissions.map((submission) => (
                      <motion.tr
                        key={submission.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`${!submission.is_read ? "bg-blue-50 dark:bg-blue-900/10" : ""} hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150`}
                      >
                        <td className="px-3 sm:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{submission.name}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{submission.email}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{submission.subject}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              submission.is_read
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            }`}
                          >
                            {submission.is_read ? (
                              <>
                                <Check className="w-3 h-3 mr-1" /> Read
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" /> Unread
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleOpenModal(submission)}
                              className="inline-flex items-center text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </button>
                            <button
                              onClick={() => handleDelete(submission.id)}
                              className="inline-flex items-center text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="Delete submission"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Submission Modal */}
      <AnimatePresence>
        {selectedSubmission && isViewModalOpen && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 backdrop-blur-sm transition-opacity pointer-events-auto"
                aria-hidden="true"
                onClick={handleCloseView}
              ></motion.div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle w-full sm:max-w-lg max-w-[calc(100%-2rem)] pointer-events-auto relative z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    Contact Message
                  </h3>
                  <button
                    type="button"
                    className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    onClick={handleCloseView}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{selectedSubmission.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{selectedSubmission.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{selectedSubmission.subject}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Message</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {selectedSubmission.message}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sent On</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {new Date(selectedSubmission.created_at).toLocaleString()}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 sm:mt-6 border-t border-gray-200 dark:border-gray-700 pt-5 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={() => {
                        handleDelete(selectedSubmission.id)
                        handleCloseView()
                      }}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseView}
                      className="mt-3 sm:mt-0 sm:ml-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:w-auto sm:text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

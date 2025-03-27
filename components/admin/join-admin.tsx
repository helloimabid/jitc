"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Eye, Trash2, Search, Check, X, Clock, AlertCircle, CheckSquare, Filter, UserPlus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface JoinAdminProps {
  initialSubmissions: any[]
}

export default function JoinAdmin({ initialSubmissions }: JoinAdminProps) {
  const [submissions, setSubmissions] = useState<any[]>(initialSubmissions)
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>(initialSubmissions)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true)
      setError(null)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("join_submissions")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setSubmissions(data || [])
        setFilteredSubmissions(data || [])
      } catch (err: any) {
        setError(err.message || "Failed to load join submissions")
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [])

  useEffect(() => {
    let filtered = submissions

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (submission) =>
          `${submission.first_name} ${submission.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.roll?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((submission) => submission.status === statusFilter)
    }

    setFilteredSubmissions(filtered)
  }, [searchTerm, statusFilter, submissions])

  const handleView = (submission: any) => {
    setSelectedSubmission(submission)
    setIsViewModalOpen(true)
  }

  const handleCloseView = () => {
    setIsViewModalOpen(false)
    setSelectedSubmission(null)
    setError(null)
    setSuccessMessage(null)
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      console.log("Attempting to approve join submission:", id)

      const supabase = createClient()
      const { data, error } = await supabase
        .from("join_submissions")
        .update({ status: "approved" })
        .eq("id", id)
        .select()

      if (error) {
        console.error("Supabase update error:", error)
        throw error
      }

      console.log("Update response:", data)

      setSuccessMessage("Submission approved successfully!")
      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((sub) => (sub.id === id ? { ...sub, status: "approved" } : sub)),
      )
      setFilteredSubmissions((prevSubmissions) =>
        prevSubmissions.map((sub) => (sub.id === id ? { ...sub, status: "approved" } : sub)),
      )

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

      router.refresh()
    } catch (err: any) {
      console.error("Error approving submission:", err)
      setError(err.message || "Failed to approve submission")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const supabase = createClient()
        const { error } = await supabase.from("join_submissions").delete().eq("id", id)

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="w-3 h-3 mr-1" />
      case "rejected":
        return <X className="w-3 h-3 mr-1" />
      default:
        return <Clock className="w-3 h-3 mr-1" />
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter(null)
  }

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Join Submissions</h2>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          {(searchTerm || statusFilter) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          )}
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden w-full">
        {loading && filteredSubmissions.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-4">
              <UserPlus className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No submissions found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {searchTerm || statusFilter
                ? "Try adjusting your search or filters"
                : "No join submissions available yet"}
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
                      className={`${submission.status === "pending" ? "bg-yellow-50 dark:bg-yellow-900/10" : ""} bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {submission.first_name} {submission.last_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{submission.email}</p>
                          <div className="mt-2 flex items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}
                            >
                              {getStatusIcon(submission.status)}
                              {submission.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(submission)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </button>
                          <button
                            onClick={() => handleApprove(submission.id)}
                            className={`${
                              submission.status === "approved"
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            } transition-colors`}
                            disabled={submission.status === "approved"}
                            title="Approve submission"
                          >
                            <CheckSquare className="h-4 w-4" />
                            <span className="sr-only">Approve</span>
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
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <p>Class: {submission.class}</p>
                        <p>Section: {submission.section}</p>
                        <p>Roll: {submission.roll}</p>
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
                        Class
                      </th>
                      <th
                        scope="col"
                        className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Section
                      </th>
                      <th
                        scope="col"
                        className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Roll Number
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
                        className={`${submission.status === "pending" ? "bg-yellow-50 dark:bg-yellow-900/10" : ""} hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150`}
                      >
                        <td className="px-3 sm:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {submission.first_name} {submission.last_name}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{submission.email}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{submission.class}</div>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{submission.section}</div>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{submission.roll}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}
                          >
                            {getStatusIcon(submission.status)}
                            {submission.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleView(submission)}
                              className="inline-flex items-center text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </button>
                            <button
                              onClick={() => handleApprove(submission.id)}
                              className={`inline-flex items-center ${
                                submission.status === "approved"
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              } transition-colors`}
                              disabled={submission.status === "approved"}
                              title="Approve submission"
                            >
                              <CheckSquare className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
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
                    Join Submission Details
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
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Name
                      </div>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                        {selectedSubmission.first_name} {selectedSubmission.last_name}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Email
                      </div>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                        {selectedSubmission.email}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Phone
                      </div>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                        {selectedSubmission.phone || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Class
                      </div>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                        {selectedSubmission.class}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Section
                      </div>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                        {selectedSubmission.section}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Roll Number
                      </div>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                        {selectedSubmission.roll}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Membership Type
                      </div>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                        {selectedSubmission.membership_type}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Transaction ID
                      </div>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                        {selectedSubmission.transaction_id}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Interests
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSubmission.interests.map((interest: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Experience
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedSubmission.experience || "No experience provided"}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Motivation
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedSubmission.motivation}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Status
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}
                      >
                        {getStatusIcon(selectedSubmission.status)}
                        {selectedSubmission.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Submitted On
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(selectedSubmission.created_at).toLocaleString()}
                      </p>
                    </div>
                  </dl>

                  <div className="mt-5 sm:mt-6 border-t border-gray-200 dark:border-gray-700 pt-5 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={handleCloseView}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Close
                    </button>
                    {selectedSubmission.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(selectedSubmission.id)}
                          disabled={loading}
                          className="mt-3 sm:mt-0 sm:ml-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(selectedSubmission.id)}
                          disabled={loading}
                          className="mt-3 sm:mt-0 sm:ml-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
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


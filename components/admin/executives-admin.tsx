"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Pencil, Trash2, Plus, X, AlertCircle, Upload, Search, User, GripVertical } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { motion, AnimatePresence } from "framer-motion"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Executive {
  id: string
  name: string
  position: string
  bio: string
  image_url: string | null
  email: string
  github_url: string | null
  linkedin_url: string | null
  display_order?: number
  created_at: string
  updated_at: string
}

interface ExecutivesAdminProps {
  initialExecutives: Executive[]
}

// Sortable item component for both desktop and mobile
function SortableExecutiveRow({
  executive,
  onEdit,
  onDelete,
  index,
  isMobile = false,
}: {
  executive: Executive
  onEdit: (executive: Executive) => void
  onDelete: (id: string) => void
  index: number
  isMobile?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: executive.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative" as const,
  }

  if (isMobile) {
    return (
      <tr
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 cursor-grab active:cursor-grabbing border-b border-gray-200 dark:border-gray-700"
      >
        <td className="px-2 py-3 whitespace-nowrap">
          <div className="flex items-center">
            <GripVertical className="h-5 w-5 text-gray-400 mr-1 flex-shrink-0" />
            <span className="text-sm text-gray-500 dark:text-gray-400">{index + 1}</span>
          </div>
        </td>
        <td className="px-2 py-3">
          <div className="flex items-center">
            {executive.image_url && (
              <div className="flex-shrink-0 h-8 w-8 mr-2">
                <img
                  src={executive.image_url || "/placeholder.svg"}
                  alt={executive.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                {executive.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                {executive.position}
              </div>
            </div>
          </div>
        </td>
        <td className="px-2 py-3 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex space-x-2 justify-end">
            <button
              onClick={() => onEdit(executive)}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
              title="Edit executive"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </button>
            <button
              onClick={() => onDelete(executive.id)}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
              title="Delete executive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 cursor-grab active:cursor-grabbing"
    >
      <td className="px-3 sm:px-6 py-4">
        <div className="flex items-center">
          <GripVertical className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-500 dark:text-gray-400">{index + 1}</span>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="flex items-center">
          {executive.image_url && (
            <div className="flex-shrink-0 h-10 w-10 mr-3">
              <img
                src={executive.image_url || "/placeholder.svg"}
                alt={executive.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            </div>
          )}
          <div className="text-sm font-medium text-gray-900 dark:text-white">{executive.name}</div>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">{executive.position}</div>
      </td>
      <td className="hidden md:table-cell px-3 sm:px-6 py-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">{executive.email}</div>
      </td>
      <td className="px-3 sm:px-6 py-4 text-sm font-medium" onClick={(e) => e.stopPropagation()}>
        <div className="flex space-x-3">
          <button
            onClick={() => onEdit(executive)}
            className="inline-flex items-center text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
            title="Edit executive"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </button>
          <button
            onClick={() => onDelete(executive.id)}
            className="inline-flex items-center text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
            title="Delete executive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function ExecutivesAdmin({ initialExecutives }: ExecutivesAdminProps) {
  const [executives, setExecutives] = useState<Executive[]>(initialExecutives)
  const [filteredExecutives, setFilteredExecutives] = useState<Executive[]>(initialExecutives)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [reorderMode, setReorderMode] = useState(false)
  const [currentExecutive, setCurrentExecutive] = useState<Executive>({
    id: "",
    name: "",
    position: "",
    bio: "",
    image_url: null,
    email: "",
    github_url: null,
    linkedin_url: null,
    display_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Improved sensors configuration for better mobile touch handling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Reduced activation constraints for better mobile experience
      activationConstraint: {
        distance: 1, // Very small distance to activate
        tolerance: 5, // Added tolerance for better touch interaction
        delay: 0, // No delay for immediate response
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    // Fetch executives with order on initial load
    refreshExecutives()
  }, [])

  // Add/remove a class to disable text selection during reorder mode
  useEffect(() => {
    if (reorderMode) {
      document.body.classList.add("no-text-select")
    } else {
      document.body.classList.remove("no-text-select")
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("no-text-select")
    }
  }, [reorderMode])

  const refreshExecutives = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("executives").select("*").order("display_order", { ascending: true })

      if (error) throw error

      setExecutives(data || [])
      setFilteredExecutives(data || [])
    } catch (err: any) {
      console.error("Error loading executives:", err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = executives.filter(
      (executive) =>
        executive.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        executive.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        executive.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredExecutives(filtered)
  }, [searchTerm, executives])

  const handleOpenModal = () => {
    setCurrentExecutive({
      id: "",
      name: "",
      position: "",
      bio: "",
      image_url: null,
      email: "",
      github_url: null,
      linkedin_url: null,
      display_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    setImageFile(null)
    setIsModalOpen(true)
    setError(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentExecutive({
      id: "",
      name: "",
      position: "",
      bio: "",
      image_url: null,
      email: "",
      github_url: null,
      linkedin_url: null,
      display_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    setImageFile(null)
    setError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentExecutive({
      ...currentExecutive,
      [name]: value,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const supabase = createClient()
      let imageUrl = currentExecutive.image_url

      // Upload image if a new one is selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const { error: uploadError, data } = await supabase.storage.from("executive-images").upload(fileName, imageFile)

        if (uploadError) throw uploadError

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/executive-images/${fileName}`
      }

      const updatedExecutive = {
        ...currentExecutive,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      }

      if (currentExecutive.id) {
        // Update existing executive
        const { error } = await supabase.from("executives").update(updatedExecutive).eq("id", currentExecutive.id)

        if (error) throw error

        setSuccessMessage("Executive updated successfully!")
        setExecutives(executives.map((exec) => (exec.id === currentExecutive.id ? updatedExecutive : exec)))
        setFilteredExecutives(
          filteredExecutives.map((exec) => (exec.id === currentExecutive.id ? updatedExecutive : exec)),
        )
      } else {
        // Get the highest display_order
        const maxOrderExec = executives.reduce(
          (prev, current) => {
            return (prev.display_order || 0) > (current.display_order || 0) ? prev : current
          },
          { display_order: 0 } as Executive,
        )

        const nextOrder = (maxOrderExec.display_order || 0) + 1

        // Create new executive
        const newExecutive = {
          ...updatedExecutive,
          id: uuidv4(),
          display_order: nextOrder,
          created_at: new Date().toISOString(),
        }

        const { error } = await supabase.from("executives").insert([newExecutive])

        if (error) throw error

        setSuccessMessage("Executive added successfully!")
        setExecutives([...executives, newExecutive])
        setFilteredExecutives([...filteredExecutives, newExecutive])
      }

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

      handleCloseModal()
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this executive?")) {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const supabase = createClient()
        const { error } = await supabase.from("executives").delete().eq("id", id)

        if (error) throw error

        setSuccessMessage("Executive deleted successfully!")
        setExecutives(executives.filter((exec) => exec.id !== id))
        setFilteredExecutives(filteredExecutives.filter((exec) => exec.id !== id))

        // Auto-dismiss success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      } catch (err: any) {
        setError(err.message || "Failed to delete executive")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setExecutives((items) => {
        // Find the indices of the items
        const activeIndex = items.findIndex((item) => item.id === active.id)
        const overIndex = items.findIndex((item) => item.id === over.id)

        // Create a new array with the updated order
        const newItems = arrayMove(items, activeIndex, overIndex)

        // Update the display_order property for all items
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          display_order: index,
        }))

        // Update filtered executives if search is active
        if (searchTerm) {
          setFilteredExecutives((filtered) => {
            const filteredOldIndex = filtered.findIndex((item) => item.id === active.id)
            const filteredNewIndex = filtered.findIndex((item) => item.id === over.id)
            const newFiltered = arrayMove(filtered, filteredOldIndex, filteredNewIndex)

            // Update display_order in filtered list
            return newFiltered.map((item) => {
              const fullItem = updatedItems.find((exec) => exec.id === item.id)
              return fullItem ? { ...item, display_order: fullItem.display_order } : item
            })
          })
        }

        return updatedItems
      })
    }
  }

  const saveOrderChanges = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()

      // Update each executive with their new display_order
      const updates = executives.map((executive, index) => ({
        id: executive.id,
        display_order: index,
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from("executives")
          .update({ display_order: update.display_order })
          .eq("id", update.id)

        if (error) throw error
      }

      setSuccessMessage("Display order saved successfully!")
      setReorderMode(false)

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update display order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-full">
      {/* Add a style tag to disable text selection during reorder mode */}
      <style jsx global>{`
        .no-text-select {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Executives</h2>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search executives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {reorderMode ? (
            <div className="flex gap-2">
              <button
                onClick={saveOrderChanges}
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                {loading ? "Saving..." : "Save Order"}
              </button>
              <button
                onClick={() => setReorderMode(false)}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Executive
              </button>
              <button
                onClick={() => setReorderMode(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
              >
                Reorder
              </button>
            </div>
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
            <button
              onClick={() => setError(null)}
              className="text-red-700 dark:text-red-400 hover:text-red-900"
              title="Dismiss error"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-100 dark:bg-green-900/20 p-4 rounded-md mb-4 text-green-800 dark:text-green-200"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {reorderMode && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
          <div className="flex items-center text-blue-700 dark:text-blue-300">
            <div className="mr-3 flex-shrink-0">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm">
              <strong>Reorder Mode:</strong> Drag the executives to change their display order. Click "Save Order" when
              you're done.(if you can't drag and drop in your device change the display order manually by the edit option.)
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        {loading && filteredExecutives.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredExecutives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-4">
              <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No executives found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {searchTerm ? "Try adjusting your search terms" : "Add an executive to get started"}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            {/* Mobile table view */}
            <div className="block sm:hidden">
              <div className="overflow-x-auto">
                {reorderMode ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                      items={filteredExecutives.map((exec) => exec.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th
                              scope="col"
                              className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                              Order
                            </th>
                            <th
                              scope="col"
                              className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                              Executive
                            </th>
                            <th
                              scope="col"
                              className="px-2 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredExecutives.map((executive, index) => (
                            <SortableExecutiveRow
                              key={executive.id}
                              executive={executive}
                              onEdit={(exec) => {
                                setCurrentExecutive(exec)
                                setIsModalOpen(true)
                              }}
                              onDelete={handleDelete}
                              index={index}
                              isMobile={true}
                            />
                          ))}
                        </tbody>
                      </table>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th
                          scope="col"
                          className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Executive
                        </th>
                        <th
                          scope="col"
                          className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Position
                        </th>
                        <th
                          scope="col"
                          className="px-2 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredExecutives.map((executive) => (
                        <tr key={executive.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-2 py-3">
                            <div className="flex items-center">
                              {executive.image_url && (
                                <div className="flex-shrink-0 h-8 w-8 mr-2">
                                  <img
                                    src={executive.image_url || "/placeholder.svg"}
                                    alt={executive.name}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                                {executive.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                                {executive.position}
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[80px]">
                              {executive.position}
                            </div>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <div className="flex space-x-2 justify-end">
                              <button
                                onClick={() => {
                                  setCurrentExecutive(executive)
                                  setIsModalOpen(true)
                                }}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                title="Edit executive"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(executive.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="Delete executive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {reorderMode && (
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Order
                      </th>
                    )}
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
                      Position
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Email
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
                  {reorderMode ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext
                        items={filteredExecutives.map((exec) => exec.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {filteredExecutives.map((executive, index) => (
                          <SortableExecutiveRow
                            key={executive.id}
                            executive={executive}
                            onEdit={(exec) => {
                              setCurrentExecutive(exec)
                              setIsModalOpen(true)
                            }}
                            onDelete={handleDelete}
                            index={index}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    filteredExecutives.map((executive, index) => (
                      <motion.tr
                        key={executive.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                      >
                        <td className="px-3 sm:px-6 py-4">
                          <div className="flex items-center">
                            {executive.image_url && (
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <img
                                  src={executive.image_url || "/placeholder.svg"}
                                  alt={executive.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              </div>
                            )}
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{executive.name}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{executive.position}</div>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{executive.email}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setCurrentExecutive(executive)
                                setIsModalOpen(true)
                              }}
                              className="inline-flex items-center text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              title="Edit executive"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(executive.id)}
                              className="inline-flex items-center text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="Delete executive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
                onClick={handleCloseModal}
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
                    {currentExecutive.id ? "Edit Executive" : "Add Executive"}
                  </h3>
                  <button
                    type="button"
                    className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    onClick={handleCloseModal}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={currentExecutive.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Position
                      </label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={currentExecutive.position}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                      />
                    </div>
                     <div>
                      <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Position
                      </label>
                      <input
                        type="number"
                        id="display_order"
                        name="display_order"
                        value={currentExecutive.display_order}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={currentExecutive.bio}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={currentExecutive.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Image
                      </label>
                      <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {(imageFile || currentExecutive.image_url) && (
                          <div className="flex-shrink-0">
                            <img
                              src={imageFile ? URL.createObjectURL(imageFile) : currentExecutive.image_url || ""}
                              alt="Preview"
                              className="h-16 w-16 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                            />
                          </div>
                        )}
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                          <Upload className="mr-2 h-4 w-4" />
                          Choose File
                          <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="github_url"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        id="github_url"
                        name="github_url"
                        value={currentExecutive.github_url || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                        placeholder="eg: https://www.facebook.com/username"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="linkedin_url"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        id="linkedin_url"
                        name="linkedin_url"
                        value={currentExecutive.linkedin_url || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                        placeholder="eg: https://www.instagram.com/username"
                      />
                    </div>

                    <div className="mt-5 sm:mt-6 border-t border-gray-200 dark:border-gray-700 pt-5 flex flex-col-reverse sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                      <button
                        type="button"
                        className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:col-start-1 sm:text-sm"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:col-start-2 sm:text-sm"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            Processing...
                          </>
                        ) : (
                          <>{currentExecutive.id ? "Update" : "Create"}</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}


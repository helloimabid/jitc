"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import {
  Pencil,
  Trash2,
  Plus,
  X,
  AlertCircle,
  Upload,
  Search,
  User,
  GripVertical,
  ChevronUp, // Added
  ChevronDown, // Added
} from "lucide-react"
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
  github_url: string | null // Note: Label says Facebook in form
  linkedin_url: string | null // Note: Label says Instagram in form
  display_order: number // Changed from optional to required for easier sorting
  created_at: string
  updated_at: string
}

interface ExecutivesAdminProps {
  initialExecutives: Executive[]
}

// Helper to ensure display_order is consistent
const assignDisplayOrder = (execs: Executive[]): Executive[] => {
  return execs.map((exec, index) => ({
    ...exec,
    display_order: index,
  }))
}

// Sortable item component (handles both mobile/desktop via props)
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
  index: number // Index within the *currently displayed* list
  isMobile?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: executive.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease", // Ensure transition
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0, // Increase zIndex when dragging
    position: "relative" as const,
  }

  // Common Actions (Edit/Delete) - Separated for clarity
  const renderActions = () => (
    <div className={`flex space-x-2 ${isMobile ? "justify-end" : ""}`}>
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
  )

  if (isMobile) {
    // Mobile Row in Reorder Mode
    return (
      <tr
        ref={setNodeRef}
        style={style}
        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 border-b border-gray-200 dark:border-gray-700"
      >
        <td className="px-2 py-3 whitespace-nowrap">
          {/* Drag Handle Cell */}
          <div {...attributes} {...listeners} className="flex items-center cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-gray-400 mr-1 flex-shrink-0" />
            <span className="text-sm text-gray-500 dark:text-gray-400">{index + 1}</span>
          </div>
        </td>
        <td className="px-2 py-3">
          {/* Info Cell */}
          <div className="flex items-center">
            {executive.image_url && (
              <div className="flex-shrink-0 h-8 w-8 mr-2">
                <img
                  src={executive.image_url || "/placeholder.svg"}
                  alt={executive.name}
                  className="h-8 w-8 rounded-full object-cover"
                  loading="lazy"
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
          {/* Actions Cell */}
          {renderActions()}
        </td>
      </tr>
    )
  }

  // Desktop Row in Reorder Mode
  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
    >
      {/* Drag Handle Cell */}
      <td {...attributes} {...listeners} className="px-3 sm:px-6 py-4 cursor-grab active:cursor-grabbing">
        <div className="flex items-center">
          <GripVertical className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-500 dark:text-gray-400">{index + 1}</span>
        </div>
      </td>
      {/* Info Cells */}
      <td className="px-3 sm:px-6 py-4">
        <div className="flex items-center">
          {executive.image_url && (
            <div className="flex-shrink-0 h-10 w-10 mr-3">
              <img
                src={executive.image_url || "/placeholder.svg"}
                alt={executive.name}
                className="h-10 w-10 rounded-full object-cover"
                loading="lazy"
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
      {/* Actions Cell */}
      <td className="px-3 sm:px-6 py-4 text-sm font-medium" onClick={(e) => e.stopPropagation()}>
        {renderActions()}
      </td>
    </tr>
  )
}

// Main Component
export default function ExecutivesAdmin({ initialExecutives }: ExecutivesAdminProps) {
  // Ensure initial data has correct display_order
  const [executives, setExecutives] = useState<Executive[]>(() => assignDisplayOrder(initialExecutives))
  const [filteredExecutives, setFilteredExecutives] = useState<Executive[]>(() => assignDisplayOrder(initialExecutives))
  const [loading, setLoading] = useState(false) // General loading state
  const [savingOrder, setSavingOrder] = useState(false) // Specific state for saving order
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [reorderMode, setReorderMode] = useState(false)
  const [currentExecutive, setCurrentExecutive] = useState<Omit<Executive, "id" | "created_at" | "updated_at">>({
    name: "",
    position: "",
    bio: "",
    image_url: null,
    email: "",
    github_url: null,
    linkedin_url: null,
    display_order: 0, // Will be recalculated on add
  })
  const [editingExecutiveId, setEditingExecutiveId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Prevent text selection delay, allow quick drags
      activationConstraint: {
        distance: 5, // Pixels mouse/touch must move before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Initial fetch and re-fetch logic
  const refreshExecutives = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from("executives")
        .select("*")
        .order("display_order", { ascending: true })

      if (fetchError) throw fetchError

      const orderedData = assignDisplayOrder(data || [])
      setExecutives(orderedData)
      // Filter will be updated by the useEffect below
    } catch (err: any) {
      console.error("Error loading executives:", err.message)
      setError(`Failed to load executives: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshExecutives()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only on mount

  // Update filtered list when search term or main list changes
  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase()
    const filtered = executives.filter(
      (executive) =>
        executive.name.toLowerCase().includes(lowerSearchTerm) ||
        executive.position.toLowerCase().includes(lowerSearchTerm) ||
        executive.email.toLowerCase().includes(lowerSearchTerm),
    )
    // No need to re-sort here, inherit order from `executives`
    setFilteredExecutives(filtered)
  }, [searchTerm, executives])

  // Body class for text selection prevention during drag
  useEffect(() => {
    if (reorderMode) {
      document.body.classList.add("no-text-select")
    } else {
      document.body.classList.remove("no-text-select")
    }
    return () => {
      document.body.classList.remove("no-text-select")
    }
  }, [reorderMode])

  // --- Modal Handling ---
  const handleOpenModal = (executiveToEdit: Executive | null = null) => {
    setError(null) // Clear previous errors
    if (executiveToEdit) {
      setCurrentExecutive({
        name: executiveToEdit.name,
        position: executiveToEdit.position,
        bio: executiveToEdit.bio,
        image_url: executiveToEdit.image_url,
        email: executiveToEdit.email,
        github_url: executiveToEdit.github_url,
        linkedin_url: executiveToEdit.linkedin_url,
        display_order: executiveToEdit.display_order, // Keep track of original order if needed
      })
      setEditingExecutiveId(executiveToEdit.id)
      setImagePreviewUrl(executiveToEdit.image_url) // Show current image
    } else {
      // Reset for new executive
      setCurrentExecutive({
        name: "",
        position: "",
        bio: "",
        image_url: null,
        email: "",
        github_url: null,
        linkedin_url: null,
        display_order: executives.length, // Tentative order, will be confirmed on save
      })
      setEditingExecutiveId(null)
      setImagePreviewUrl(null)
    }
    setImageFile(null) // Clear any previous file selection
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Reset states after modal closes ( slight delay for animation )
    setTimeout(() => {
        setCurrentExecutive({ name: "", position: "", bio: "", image_url: null, email: "", github_url: null, linkedin_url: null, display_order: 0 })
        setEditingExecutiveId(null)
        setImageFile(null)
        setImagePreviewUrl(null)
        setError(null) // Clear modal-specific errors
    }, 300); // Match animation duration if needed
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentExecutive((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setImageFile(file)
      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // If file selection is cancelled, reset
      setImageFile(null)
      // Revert preview to original image if editing, or null if adding
      setImagePreviewUrl(editingExecutiveId ? currentExecutive.image_url : null)
    }
  }

  // --- CRUD Operations ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true) // Use general loading for form submission
    setError(null)
    setSuccessMessage(null)
    const supabase = createClient()

    try {
      let imageUrl = editingExecutiveId ? currentExecutive.image_url : null

      // 1. Upload image if a new one is selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `public/${uuidv4()}.${fileExt}` // Store in 'public' folder within bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("executive-images")
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: true, // Overwrite if file with same name exists (unlikely with UUID)
          })

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

        // Construct the public URL correctly
        const { data: urlData } = supabase.storage.from("executive-images").getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }

      // 2. Prepare data for Supabase
      const executiveData = {
        ...currentExecutive, // Contains name, position, bio, links, email
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      }

      // 3. Update or Insert
      if (editingExecutiveId) {
        // UPDATE
        const { error: updateError } = await supabase
          .from("executives")
          .update(executiveData)
          .eq("id", editingExecutiveId)
          .select() // Select to get the updated record back if needed

        if (updateError) throw updateError

        // Update local state optimistically (or re-fetch)
        setExecutives((prev) =>
          prev.map((exec) =>
            exec.id === editingExecutiveId ? { ...exec, ...executiveData, id: editingExecutiveId, created_at: exec.created_at } : exec,
          ),
        )
        setSuccessMessage("Executive updated successfully!")

      } else {
        // INSERT (New Executive)
        const newExecutivePayload = {
            ...executiveData,
            id: uuidv4(),
            display_order: executives.length, // Add to the end initially
            created_at: new Date().toISOString(),
        };
        // Remove display_order from the payload if your DB auto-increments or handles it
        // delete newExecutivePayload.display_order;

        const { data: insertData, error: insertError } = await supabase
          .from("executives")
          .insert([newExecutivePayload])
          .select() // Select to get the inserted record back

        if (insertError) throw insertError
        if (!insertData || insertData.length === 0) throw new Error("Failed to insert executive data.")

        // Add to local state
        // Ensure the display order is correctly assigned after adding
        setExecutives((prev) => assignDisplayOrder([...prev, insertData[0] as Executive]));
        setSuccessMessage("Executive added successfully!")
      }

      handleCloseModal()
       // Optionally refresh all data after add/edit to ensure consistency
       // await refreshExecutives();

    } catch (err: any) {
        console.error("Form submission error:", err);
        setError(err.message || "An error occurred. Please try again.")
    } finally {
        setLoading(false);
         // Auto-dismiss success message
        if (successMessage) {
            setTimeout(() => setSuccessMessage(null), 3000)
        }
    }
  }

  const handleDelete = async (id: string) => {
    const executiveToDelete = executives.find(exec => exec.id === id);
    if (!executiveToDelete) return;

    if (window.confirm(`Are you sure you want to delete ${executiveToDelete.name}?`)) {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const supabase = createClient()
        // Optional: Delete image from storage first
        if (executiveToDelete.image_url) {
            try {
                 // Extract the file path from the URL
                 const urlParts = executiveToDelete.image_url.split('/public/');
                 if (urlParts.length > 1) {
                     const filePath = `public/${urlParts[1]}`;
                    await supabase.storage.from('executive-images').remove([filePath]);
                 }
            } catch (storageError: any) {
                console.warn("Could not delete image from storage, proceeding with DB delete:", storageError.message);
                // Don't block deletion if storage removal fails, but log it
            }
        }

        // Delete from database
        const { error: deleteError } = await supabase.from("executives").delete().eq("id", id)

        if (deleteError) throw deleteError

        // Update local state and re-assign display_order
        setExecutives((prev) => assignDisplayOrder(prev.filter((exec) => exec.id !== id)))
        setSuccessMessage("Executive deleted successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)

      } catch (err: any) {
        setError(err.message || "Failed to delete executive")
      } finally {
        setLoading(false)
      }
    }
  }

  // --- Reordering Logic ---

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // Find indices in the *main* executives list
      const oldIndexInFullList = executives.findIndex((item) => item.id === active.id)
      const newIndexInFullList = executives.findIndex((item) => item.id === over.id)

      if (oldIndexInFullList === -1 || newIndexInFullList === -1) {
          console.error("Could not find dragged items in the main list.");
          return; // Should not happen if IDs are correct
      }

      // Perform move on the main list and re-assign display_order
      const newOrderedFullList = assignDisplayOrder(
          arrayMove(executives, oldIndexInFullList, newIndexInFullList)
      )

      // Update the main state. The useEffect will update filteredExecutives.
      setExecutives(newOrderedFullList)
      // Note: No immediate save here, user clicks "Save Order" button
    }
  }

  // Function to save order changes triggered by DnD
  const saveOrderChanges = async () => {
    setSavingOrder(true) // Use specific loading state
    setError(null)
    setSuccessMessage(null)
    const supabase = createClient()

    try {
      // Prepare updates based on the current order in `executives` state
      const updates = executives.map((executive) => ({
        id: executive.id,
        display_order: executive.display_order, // Already updated in state by assignDisplayOrder
      }))

      // Send updates to Supabase (consider batching if performance is an issue)
      // Using Promise.all for parallel updates (faster but harder error handling per item)
      const updatePromises = updates.map(update =>
        supabase
          .from('executives')
          .update({ display_order: update.display_order, updated_at: new Date().toISOString() })
          .eq('id', update.id)
      );

      const results = await Promise.allSettled(updatePromises);

      // Check for errors
      const failedUpdates = results.filter(result => result.status === 'rejected');
      if (failedUpdates.length > 0) {
        console.error("Some order updates failed:", failedUpdates);
        // Attempt to derive a more specific error message if possible
        const firstError = (failedUpdates[0] as PromiseRejectedResult).reason;
        throw new Error(`Failed to update order for ${failedUpdates.length} executive(s). Error: ${firstError?.message || 'Unknown error'}`);
      }


      setSuccessMessage("Display order saved successfully!")
      setReorderMode(false) // Exit reorder mode on successful save
      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (err: any) {
      setError(err.message || "Failed to update display order")
      // Keep reorder mode active if save fails? Or exit? User preference. Let's keep it active.
    } finally {
      setSavingOrder(false)
    }
  }

  // Function to save order immediately after arrow move
  const saveOrderAfterMove = async (updatedExecutives: Executive[]) => {
    setSavingOrder(true) // Use specific loading state for visual feedback
    setError(null); // Clear previous errors
    const supabase = createClient();

    try {
        const updates = updatedExecutives.map(exec => ({
            id: exec.id,
            display_order: exec.display_order,
            updated_at: new Date().toISOString(),
        }));

        // Similar update logic as saveOrderChanges
        const updatePromises = updates.map(update =>
            supabase
            .from('executives')
            .update({ display_order: update.display_order, updated_at: update.updated_at })
            .eq('id', update.id)
        );
        const results = await Promise.allSettled(updatePromises);
        const failedUpdates = results.filter(result => result.status === 'rejected');

        if (failedUpdates.length > 0) {
            console.error("Some order updates failed after arrow move:", failedUpdates);
            const firstError = (failedUpdates[0] as PromiseRejectedResult).reason;
            // Show error, but the state is already updated locally
            setError(`Failed to save new order: ${firstError?.message || 'Unknown error'}`);
        } else {
             // Optional: brief success message for arrow moves
             // setSuccessMessage("Order updated.");
             // setTimeout(() => setSuccessMessage(null), 1500);
        }

    } catch (err: any) {
         setError(err.message || "Failed to save updated order");
    } finally {
         setSavingOrder(false);
    }
};

  // Arrow button handlers
  const handleMove = (id: string, direction: 'up' | 'down') => {
      const currentIndex = executives.findIndex(exec => exec.id === id);
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      // Boundary checks (should not be strictly necessary if buttons are disabled, but good practice)
      if (newIndex < 0 || newIndex >= executives.length) return;

      // Perform move and re-assign order
      const newOrderedList = assignDisplayOrder(
          arrayMove(executives, currentIndex, newIndex)
      );

      // Update state immediately
      setExecutives(newOrderedList);

      // Trigger save
      saveOrderAfterMove(newOrderedList);
  };

  const handleMoveUp = (id: string) => handleMove(id, 'up');
  const handleMoveDown = (id: string) => handleMove(id, 'down');


  // --- Rendering ---

  return (
    <div className="w-full max-w-full">
      <style jsx global>{`
        .no-text-select {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          -webkit-touch-callout: none;
        }
        /* Style for disabled arrow buttons */
        .arrow-button:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }
      `}</style>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Executives</h2>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search executives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={reorderMode} // Disable search in reorder mode to avoid confusion
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            />
          </div>

          {/* Action Buttons */}
          {reorderMode ? (
            <div className="flex gap-2">
              <button
                onClick={saveOrderChanges}
                disabled={savingOrder || loading} // Disable if saving or general loading
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingOrder ? "Saving..." : "Save Order"}
              </button>
              <button
                onClick={() => { setReorderMode(false); refreshExecutives(); }} // Optionally refresh on cancel
                disabled={savingOrder}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenModal()}
                disabled={loading || savingOrder}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Executive
              </button>
              <button
                onClick={() => setReorderMode(true)}
                 disabled={loading || savingOrder || executives.length < 2} // Disable if loading or less than 2 items
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reorder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded dark:bg-red-900/20 dark:text-red-400 flex items-center justify-between"
          >
             <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="ml-4 text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100">
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
             className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded dark:bg-green-900/20 dark:text-green-300 flex items-center justify-between"
          >
             <span className="text-sm">{successMessage}</span>
              <button onClick={() => setSuccessMessage(null)} className="ml-4 text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-100">
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reorder Mode Instructions */}
      {reorderMode && (
         <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
            <p>
                <strong>Reorder Mode:</strong> Drag rows using the handle (<GripVertical className="inline-block h-4 w-4 -mt-1 mx-1" />) to change display order. Click "Save Order" when done. Search is disabled while reordering.
            </p>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        {loading && filteredExecutives.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            Loading executives...
          </div>
        ) : !loading && filteredExecutives.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-4">
              <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No executives found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
              {searchTerm ? `No results for "${searchTerm}". Try adjusting your search.` : "Click 'Add Executive' to get started."}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto"> {/* Ensure horizontal scroll if needed */}
            {/* Mobile Table (Conditional Rendering) */}
            <div className="block sm:hidden">
               <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                 <SortableContext
                    items={filteredExecutives.map((exec) => exec.id)}
                    strategy={verticalListSortingStrategy}
                    disabled={!reorderMode} // Disable sorting context if not in reorder mode
                  >
                   <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                     <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          {reorderMode && (
                             <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Order</th>
                          )}
                          <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Executive</th>
                           {!reorderMode && ( <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>)}
                          <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                       {filteredExecutives.map((executive, index) => (
                         reorderMode ? (
                           <SortableExecutiveRow
                             key={executive.id}
                             executive={executive}
                             onEdit={(exec) => handleOpenModal(exec)}
                             onDelete={handleDelete}
                             index={index}
                             isMobile={true}
                           />
                         ) : (
                           // Regular Row for Mobile (Not Reorder Mode)
                           <tr key={executive.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                             <td className="px-2 py-3">
                                <div className="flex items-center">
                                  {executive.image_url && (
                                    <div className="flex-shrink-0 h-8 w-8 mr-2">
                                      <img src={executive.image_url} alt={executive.name} className="h-8 w-8 rounded-full object-cover" loading="lazy"/>
                                    </div>
                                  )}
                                  <div>
                                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{executive.name}</div>
                                       {/* Position moved below name for clarity */}
                                      {/* <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{executive.position}</div> */}
                                  </div>
                                </div>
                              </td>
                               <td className="px-2 py-3">
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[80px]">{executive.position}</div>
                              </td>
                              <td className="px-2 py-3 text-right">
                                <div className="flex space-x-1 justify-end items-center">
                                    {/* Arrow Buttons */}
                                     <button
                                        onClick={() => handleMoveUp(executive.id)}
                                        disabled={index === 0 || savingOrder}
                                        title="Move Up"
                                        className="arrow-button p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:text-gray-300 dark:disabled:text-gray-600"
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleMoveDown(executive.id)}
                                        disabled={index === filteredExecutives.length - 1 || savingOrder}
                                        title="Move Down"
                                        className="arrow-button p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:text-gray-300 dark:disabled:text-gray-600"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                    {/* Edit/Delete Buttons */}
                                    <button onClick={() => handleOpenModal(executive)} className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Edit"><Pencil className="h-4 w-4" /></button>
                                    <button onClick={() => handleDelete(executive.id)} className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                </div>
                              </td>
                           </tr>
                         )
                       ))}
                     </tbody>
                   </table>
                 </SortableContext>
               </DndContext>
            </div>

            {/* Desktop Table (Conditional Rendering) */}
            <div className="hidden sm:block">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                 <SortableContext
                    items={filteredExecutives.map((exec) => exec.id)}
                    strategy={verticalListSortingStrategy}
                    disabled={!reorderMode}
                  >
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        {reorderMode && (
                          <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">Order</th>
                        )}
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
                        <th scope="col" className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredExecutives.map((executive, index) => (
                        reorderMode ? (
                          <SortableExecutiveRow
                            key={executive.id}
                            executive={executive}
                            onEdit={(exec) => handleOpenModal(exec)}
                            onDelete={handleDelete}
                            index={index}
                            isMobile={false} // Explicitly set for desktop
                          />
                        ) : (
                          // Regular Row for Desktop (Not Reorder Mode)
                           <motion.tr
                                key={executive.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                layout // Add layout animation for smooth reordering with arrows
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                            >
                            <td className="px-3 sm:px-6 py-4">
                              <div className="flex items-center">
                                {executive.image_url && (
                                  <div className="flex-shrink-0 h-10 w-10 mr-3">
                                    <img src={executive.image_url} alt={executive.name} className="h-10 w-10 rounded-full object-cover" loading="lazy"/>
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
                              <div className="flex space-x-2 items-center">
                                 {/* Arrow Buttons */}
                                <button
                                    onClick={() => handleMoveUp(executive.id)}
                                    disabled={index === 0 || savingOrder}
                                    title="Move Up"
                                    className="arrow-button p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:text-gray-300 dark:disabled:text-gray-600"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleMoveDown(executive.id)}
                                    disabled={index === filteredExecutives.length - 1 || savingOrder}
                                    title="Move Down"
                                    className="arrow-button p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:text-gray-300 dark:disabled:text-gray-600"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {/* Edit/Delete Buttons */}
                                <button onClick={() => handleOpenModal(executive)} className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Edit"><Pencil className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(executive.id)} className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      ))}
                    </tbody>
                  </table>
                 </SortableContext>
                </DndContext>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
       <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 backdrop-blur-sm transition-opacity"
                aria-hidden="true"
                onClick={handleCloseModal} // Close modal on overlay click
              />

              {/* Modal panel */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span>
               <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle w-full sm:max-w-lg max-w-[calc(100%-2rem)] mx-auto relative"
              >
                 <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    {editingExecutiveId ? "Edit Executive" : "Add New Executive"}
                  </h3>
                  <button
                    type="button"
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
                    onClick={handleCloseModal}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form Content */}
                 <form onSubmit={handleSubmit}>
                    <div className="px-4 sm:px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                        {/* Modal Error Display */}
                        {error && (
                           <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/30 dark:border-red-600 dark:text-red-300" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        {/* Form Fields */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span className="text-red-500">*</span></label>
                            <input type="text" id="name" name="name" value={currentExecutive.name} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"/>
                        </div>
                        <div>
                            <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position <span className="text-red-500">*</span></label>
                            <input type="text" id="position" name="position" value={currentExecutive.position} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"/>
                        </div>
                         {/* Removed display_order input field */}
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio <span className="text-red-500">*</span></label>
                            <textarea id="bio" name="bio" rows={3} value={currentExecutive.bio} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span className="text-red-500">*</span></label>
                            <input type="email" id="email" name="email" value={currentExecutive.email} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"/>
                        </div>
                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
                             <div className="mt-1 flex items-center gap-4">
                                {imagePreviewUrl && (
                                <img src={imagePreviewUrl} alt="Preview" className="h-16 w-16 rounded-full object-cover border border-gray-300 dark:border-gray-600"/>
                                )}
                                {!imagePreviewUrl && (
                                    <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-300 dark:border-gray-600">
                                        <User className="h-8 w-8 text-gray-400"/>
                                    </div>
                                )}
                                <label className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                    <Upload className="mr-2 h-4 w-4" />
                                    {imageFile ? "Change File" : "Choose File"}
                                    <input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} className="sr-only"/>
                                </label>
                                {imageFile && (
                                    <button type="button" onClick={() => { setImageFile(null); setImagePreviewUrl(editingExecutiveId ? currentExecutive.image_url : null); }} className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Remove</button>
                                )}
                             </div>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Recommended: Square image (e.g., 200x200px).</p>
                        </div>
                        <div>
                            <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook URL</label>
                            <input type="url" id="github_url" name="github_url" value={currentExecutive.github_url || ""} onChange={handleInputChange} placeholder="https://facebook.com/..." className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"/>
                        </div>
                        <div>
                            <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram URL</label>
                            <input type="url" id="linkedin_url" name="linkedin_url" value={currentExecutive.linkedin_url || ""} onChange={handleInputChange} placeholder="https://instagram.com/..." className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"/>
                        </div>
                    </div>

                    {/* Modal Footer / Actions */}
                     <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                             {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing...
                                </>
                            ) : (editingExecutiveId ? 'Update Executive' : 'Create Executive')}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={handleCloseModal}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

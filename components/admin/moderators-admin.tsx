"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Pencil, Trash2, Plus, Check, X, AlertCircle, Upload, Search, User } from 'lucide-react'
import { v4 as uuidv4 } from "uuid"
import { motion, AnimatePresence } from "framer-motion"

interface Moderators {
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

interface ModeratorsAdminProps {
  initialModerators: Moderators[]
}

export default function ModeratorsAdmin({ initialModerators }: ModeratorsAdminProps) {
  const [moderators, setModerators] = useState<Moderators[]>(initialModerators)
  const [filteredModerators, setFilteredModerators] = useState<Moderators[]>(initialModerators)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [reorderMode, setReorderMode] = useState(false)
  const [currentModerator, setCurrentModerator] = useState<Moderators>({
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

  useEffect(() => {
    const filtered = moderators.filter(
      (moderator) =>
        moderator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        moderator.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        moderator.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredModerators(filtered);
  }, [searchTerm, moderators]);

  useEffect(() => {
    // Fetch moderators with order on initial load
    refreshModerators()
  }, [])

  const refreshModerators = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("moderators")
        .select("*")
        .order('display_order', { ascending: true })
      
      if (error) throw error
      
      setModerators(data || [])
      setFilteredModerators(data || [])
    } catch (err: any) {
      console.error("Error loading moderators:", err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = () => {
    setCurrentModerator({
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
    setCurrentModerator({
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
    setCurrentModerator({
      ...currentModerator,
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
      let imageUrl = currentModerator.image_url

      // Upload image if a new one is selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const { error: uploadError, data } = await supabase.storage
          .from("moderator-images")
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/moderator-images/${fileName}`
      }

      const updatedModerator = {
        ...currentModerator,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      }

      if (currentModerator.id) {
        // Update existing moderator
        const { error } = await supabase
          .from("moderators")
          .update(updatedModerator)
          .eq("id", currentModerator.id)

        if (error) throw error

        setSuccessMessage("Moderator updated successfully!")
        setModerators(
          moderators.map((mod) => (mod.id === currentModerator.id ? updatedModerator : mod))
        )
        setFilteredModerators(
          filteredModerators.map((mod) => (mod.id === currentModerator.id ? updatedModerator : mod))
        )
      } else {
        // Get the highest display_order
        const maxOrderMod = moderators.reduce((prev, current) => {
          return (prev.display_order || 0) > (current.display_order || 0) ? prev : current;
        }, { display_order: 0 } as Moderators);
        
        const nextOrder = (maxOrderMod.display_order || 0) + 1;
        
        // Create new moderator
        const newModerator = {
          ...updatedModerator,
          id: uuidv4(),
          display_order: nextOrder,
          created_at: new Date().toISOString(),
        }

        const { error } = await supabase.from("moderators").insert([newModerator])

        if (error) throw error

        setSuccessMessage("Moderator added successfully!")
        setModerators([...moderators, newModerator])
        setFilteredModerators([...filteredModerators, newModerator])
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
    if (window.confirm("Are you sure you want to delete this moderator?")) {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const supabase = createClient()
        const { error } = await supabase.from("moderators").delete().eq("id", id)

        if (error) throw error

        setSuccessMessage("Moderator deleted successfully!")
        setModerators(moderators.filter((mod) => mod.id !== id))
        setFilteredModerators(filteredModerators.filter((mod) => mod.id !== id))
        
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      } catch (err: any) {
        setError(err.message || "Failed to delete moderator")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleOrderChange = async (moderatorId: string, direction: 'up' | 'down') => {
    const moderatorIndex = moderators.findIndex(mod => mod.id === moderatorId);
    if (
      (direction === 'up' && moderatorIndex === 0) || 
      (direction === 'down' && moderatorIndex === moderators.length - 1)
    ) {
      return; // Can't move first item up or last item down
    }

    const newModerators = [...moderators];
    const swapIndex = direction === 'up' ? moderatorIndex - 1 : moderatorIndex + 1;
    
    // Swap the display_order of the two moderators
    const tempOrder = newModerators[moderatorIndex].display_order;
    newModerators[moderatorIndex].display_order = newModerators[swapIndex].display_order;
    newModerators[swapIndex].display_order = tempOrder;
    
    // Swap the positions in the array
    [newModerators[moderatorIndex], newModerators[swapIndex]] = 
    [newModerators[swapIndex], newModerators[moderatorIndex]];
    
    setModerators(newModerators);
    setFilteredModerators(newModerators.filter(
      (moderator) =>
        moderator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        moderator.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        moderator.email.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  }

  const saveOrderChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      
      // Update each moderator with their new display_order
      const updates = moderators.map((moderator, index) => ({
        id: moderator.id,
        display_order: index
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('moderators')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
          
        if (error) throw error;
      }
      
      setSuccessMessage("Display order saved successfully!")
      setReorderMode(false);
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || "Failed to update display order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-full">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Moderators</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search moderators..." 
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
                <Plus className="mr-2 h-4 w-4" /> Add Moderator
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
            <button onClick={() => setError(null)} className="text-red-700 dark:text-red-400 hover:text-red-900" title="Dismiss error">
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        {loading && filteredModerators.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredModerators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-4">
              <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No moderators found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {searchTerm ? "Try adjusting your search terms" : "Add a moderator to get started"}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <div className="sm:overflow-x-auto -mx-4 sm:mx-0">
              {/* Mobile card view */}
              <div className="block sm:hidden">
                <div className="space-y-3 px-4">
                  {filteredModerators.map((moderator) => (
                    <motion.div
                      key={moderator.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          {moderator.image_url && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img 
                                src={moderator.image_url || "/placeholder.svg"} 
                                alt={moderator.name} 
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{moderator.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{moderator.position}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setCurrentModerator(moderator)
                              setIsModalOpen(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Edit moderator"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(moderator.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Delete moderator"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <p className="truncate">{moderator.email}</p>
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
                      {reorderMode && (
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                      )}
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
                      <th scope="col" className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredModerators.map((moderator, index) => (
                      <motion.tr 
                        key={moderator.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                      >
                        {reorderMode && (
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleOrderChange(moderator.id, 'up')}
                                disabled={index === 0}
                                className={`p-1 rounded ${index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleOrderChange(moderator.id, 'down')}
                                disabled={index === filteredModerators.length - 1}
                                className={`p-1 rounded ${index === filteredModerators.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{index + 1}</span>
                            </div>
                          </td>
                        )}
                        <td className="px-3 sm:px-6 py-4">
                          <div className="flex items-center">
                            {moderator.image_url && (
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <img 
                                  src={moderator.image_url || "/placeholder.svg"} 
                                  alt={moderator.name} 
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              </div>
                            )}
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{moderator.name}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{moderator.position}</div>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{moderator.email}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setCurrentModerator(moderator)
                                setIsModalOpen(true)
                              }}
                              className="inline-flex items-center text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              title="Edit moderator"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(moderator.id)}
                              className="inline-flex items-center text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="Delete moderator"
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

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" onClick={(e) => e.stopPropagation()}>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 backdrop-blur-sm transition-opacity pointer-events-auto"
                aria-hidden="true"
                onClick={handleCloseModal}
              ></motion.div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle w-full sm:max-w-lg max-w-[calc(100%-2rem)] pointer-events-auto relative z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    {currentModerator.id ? "Edit Moderator" : "Add Moderator"}
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
                        value={currentModerator.name}
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
                        value={currentModerator.position}
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
                        value={currentModerator.bio}
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
                        value={currentModerator.email}
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
                        {(imageFile || currentModerator.image_url) && (
                          <div className="flex-shrink-0">
                            <img
                              src={imageFile ? URL.createObjectURL(imageFile) : currentModerator.image_url || ''}
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
                      <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        id="github_url"
                        name="github_url"
                        value={currentModerator.github_url || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                        placeholder="eg: https://www.facebook.com/username"
                      />
                    </div>

                    <div>
                      <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        id="linkedin_url"
                        name="linkedin_url"
                        value={currentModerator.linkedin_url || ''}
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
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>{currentModerator.id ? "Update" : "Create"}</>
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

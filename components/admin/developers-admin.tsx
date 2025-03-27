"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Pencil, Trash2, Code, Plus, Check, X, AlertCircle, Search } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { Upload } from 'lucide-react'
import { v4 as uuidv4 } from "uuid"

interface Developer {
  id: string
  name: string
  role: string
  skills: string[]
  image_url: string | null
  github_url: string | null
  portfolio: string | null
  projects: number
  contributions: number
  bio: string | null
  linkedin_url: string | null
  display_order?: number
  created_at?: string
  updated_at?: string
}

interface DevelopersAdminProps {
  initialDevelopers: Developer[]
}

export default function DevelopersAdmin({ initialDevelopers = [] }: DevelopersAdminProps) {
  const [developers, setDevelopers] = useState<Developer[]>(initialDevelopers)
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>(initialDevelopers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDeveloper, setCurrentDeveloper] = useState<Developer>({
    id: "",
    name: "",
    role: "",
    skills: [],
    image_url: "",
    github_url: "",
    portfolio: "",
    projects: 0,
    contributions: 0,
    bio: "",
    linkedin_url: "",
    display_order: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [skillInput, setSkillInput] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [reorderMode, setReorderMode] = useState(false)

  useEffect(() => {
    refreshDevelopers()
  }, [])

  useEffect(() => {
    const filtered = developers.filter(
      (developer) =>
        developer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        developer.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (developer.bio && developer.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
        developer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredDevelopers(filtered)
  }, [searchTerm, developers])

  const handleOpenModal = () => {
    setCurrentDeveloper({
      id: "",
      name: "",
      role: "",
      skills: [],
      image_url: "",
      github_url: "",
      portfolio: "",
      projects: 0,
      contributions: 0,
      bio: "",
      linkedin_url: "",
      display_order: 0
    })
    setSkillInput("")
    setImageFile(null)
    setIsModalOpen(true)
    setError(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentDeveloper({
      id: "",
      name: "",
      role: "",
      skills: [],
      image_url: "",
      github_url: "",
      portfolio: "",
      projects: 0,
      contributions: 0,
      bio: "",
      linkedin_url: "",
      display_order: 0
    })
    setSkillInput("")
    setImageFile(null)
    setError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'projects' || name === 'contributions') {
      setCurrentDeveloper({
        ...currentDeveloper,
        [name]: parseInt(value) || 0,
      })
    } else {
      setCurrentDeveloper({
        ...currentDeveloper,
        [name]: value,
      })
    }
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !currentDeveloper.skills.includes(skillInput.trim())) {
      setCurrentDeveloper({
        ...currentDeveloper,
        skills: [...currentDeveloper.skills, skillInput.trim()]
      })
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setCurrentDeveloper({
      ...currentDeveloper,
      skills: currentDeveloper.skills.filter(s => s !== skill)
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
      const now = new Date().toISOString()
      let imageUrl = currentDeveloper.image_url

      // Upload image if a new one is selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const { error: uploadError, data } = await supabase.storage
          .from("developer-images")
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/developer-images/${fileName}`
      }

      if (currentDeveloper.id) {
        // Update existing developer
        const { error } = await supabase
          .from("developers")
          .update({
            ...currentDeveloper,
            image_url: imageUrl,
            updated_at: now,
          })
          .eq("id", currentDeveloper.id)

        if (error) throw error

        setSuccessMessage("Developer updated successfully!")
        setDevelopers(
          developers.map((dev) => (dev.id === currentDeveloper.id ? { ...currentDeveloper, image_url: imageUrl, updated_at: now } : dev))
        )
        setFilteredDevelopers(
          filteredDevelopers.map((dev) => (dev.id === currentDeveloper.id ? { ...currentDeveloper, image_url: imageUrl, updated_at: now } : dev))
        )
      } else {
        // Get the highest display_order
        const maxOrderDev = developers.reduce((prev, current) => {
          return (prev.display_order || 0) > (current.display_order || 0) ? prev : current;
        }, { display_order: 0 } as Developer);
        
        const nextOrder = (maxOrderDev.display_order || 0) + 1;
        
        // Create new developer
        const { data, error } = await supabase.from("developers").insert([
          {
            ...currentDeveloper,
            image_url: imageUrl,
            id: uuidv4(),
            display_order: nextOrder,
            created_at: now,
            updated_at: now,
          },
        ]).select()

        if (error) throw error

        setSuccessMessage("Developer added successfully!")
        const newDeveloper = data[0] as Developer
        setDevelopers([...developers, newDeveloper])
        setFilteredDevelopers([...filteredDevelopers, newDeveloper])
      }

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

      handleCloseModal()
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the developer.")
    } finally {
      setLoading(false)
      setImageFile(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this developer?")) {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const supabase = createClient()
        const { error } = await supabase.from("developers").delete().eq("id", id)

        if (error) throw error

        setSuccessMessage("Developer deleted successfully!")
        setDevelopers(developers.filter((dev) => dev.id !== id))
        setFilteredDevelopers(filteredDevelopers.filter((dev) => dev.id !== id))
        
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      } catch (err: any) {
        setError(err.message || "An error occurred while deleting the developer.")
      } finally {
        setLoading(false)
      }
    }
  }

  const refreshDevelopers = async () => {
    setLoading(true)
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("developers")
        .select("*")
        .order('display_order', { ascending: true })
      
      if (error) throw error
      
      setDevelopers(data || [])
      setFilteredDevelopers(data || [])
    } catch (err: any) {
      console.error("Error loading developers:", err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderChange = async (developerId: string, direction: 'up' | 'down') => {
    const developerIndex = developers.findIndex(dev => dev.id === developerId);
    if (
      (direction === 'up' && developerIndex === 0) || 
      (direction === 'down' && developerIndex === developers.length - 1)
    ) {
      return; // Can't move first item up or last item down
    }

    const newDevelopers = [...developers];
    const swapIndex = direction === 'up' ? developerIndex - 1 : developerIndex + 1;
    
    // Swap the display_order of the two developers
    const tempOrder = newDevelopers[developerIndex].display_order;
    newDevelopers[developerIndex].display_order = newDevelopers[swapIndex].display_order;
    newDevelopers[swapIndex].display_order = tempOrder;
    
    // Swap the positions in the array
    [newDevelopers[developerIndex], newDevelopers[swapIndex]] = 
    [newDevelopers[swapIndex], newDevelopers[developerIndex]];
    
    setDevelopers(newDevelopers);
    setFilteredDevelopers(newDevelopers.filter(
      (developer) =>
        developer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        developer.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (developer.bio && developer.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
        developer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    ));
  }

  const saveOrderChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      
      // Update each developer with their new display_order
      const updates = developers.map((developer, index) => ({
        id: developer.id,
        display_order: index
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('developers')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
          
        if (error) throw error;
      }
      
      setSuccessMessage("Display order saved successfully!");
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
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Developers</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search developers..." 
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
                <Plus className="mr-2 h-4 w-4" /> Add Developer
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
            <button onClick={() => setError(null)} className="text-red-700 dark:text-red-400 hover:text-red-900">
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
        {loading && filteredDevelopers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredDevelopers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-4">
              <Code className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No developers found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {searchTerm ? "Try adjusting your search terms" : "Add a developer to get started"}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <div className="sm:overflow-x-auto -mx-4 sm:mx-0">
              {/* Mobile card view */}
              <div className="block sm:hidden">
                <div className="space-y-3 px-4">
                  {filteredDevelopers.map((developer) => (
                    <motion.div
                      key={developer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          {developer.image_url && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img 
                                className="h-10 w-10 rounded-full object-cover"
                                src={developer.image_url || "/placeholder.svg"}
                                alt={developer.name}
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{developer.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{developer.role}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setCurrentDeveloper(developer)
                              setIsModalOpen(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Edit developer"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(developer.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Delete developer"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1 mt-2">
                          {developer.skills.slice(0, 3).map((skill) => (
                            <span 
                              key={skill} 
                              className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            >
                              {skill}
                            </span>
                          ))}
                          {developer.skills.length > 3 && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              +{developer.skills.length - 3}
                            </span>
                          )}
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
                      {reorderMode && (
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                      )}
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                      <th scope="col" className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Skills</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDevelopers.map((developer, index) => (
                      <motion.tr 
                        key={developer.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                      >
                        {reorderMode && (
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleOrderChange(developer.id, 'up')}
                                disabled={index === 0}
                                className={`p-1 rounded ${index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleOrderChange(developer.id, 'down')}
                                disabled={index === filteredDevelopers.length - 1}
                                className={`p-1 rounded ${index === filteredDevelopers.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
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
                            {developer.image_url && (
                              <div className="flex-shrink-0 h-10 w-10 mr-4">
                                <img 
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={developer.image_url || "/placeholder.svg"}
                                  alt={developer.name}
                                />
                              </div>
                            )}
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{developer.name}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{developer.role}</div>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {developer.skills.slice(0, 3).map((skill) => (
                              <span 
                                key={skill} 
                                className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                              >
                                {skill}
                              </span>
                            ))}
                            {developer.skills.length > 3 && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                +{developer.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setCurrentDeveloper(developer)
                                setIsModalOpen(true)
                              }}
                              className="inline-flex items-center text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              title="Edit developer"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(developer.id)}
                              className="inline-flex items-center text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="Delete developer"
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
                    {currentDeveloper.id ? "Edit Developer" : "Add Developer"}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={currentDeveloper.name || ""}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                        />
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Role
                        </label>
                        <input
                          type="text"
                          id="role"
                          name="role"
                          value={currentDeveloper.role || ""}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Skills
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          id="skills"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                          placeholder="Add skill and press Enter"
                          className="flex-1 min-w-0 block w-full rounded-none rounded-l-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-700 text-sm font-medium rounded-r-md text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          Add
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {currentDeveloper.skills.map((skill) => (
                          <span 
                            key={skill} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          >
                            {skill}
                            <button
                              type="button"
                              className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-100 focus:outline-none"
                              onClick={() => handleRemoveSkill(skill)}
                            >
                              <X size={10} />
                              <span className="sr-only">Remove {skill}</span>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Profile Image
                      </label>
                      <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {(imageFile || currentDeveloper.image_url) && (
                          <div className="flex-shrink-0">
                            <img
                              src={imageFile ? URL.createObjectURL(imageFile) : currentDeveloper.image_url || ''}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          GitHub URL
                        </label>
                        <input
                          type="text"
                          id="github_url"
                          name="github_url"
                          value={currentDeveloper.github_url || ""}
                          onChange={handleInputChange}
                          placeholder="eg: https://github.com/username"
                          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                        />
                      </div>

                      <div>
                        <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          LinkedIn URL
                        </label>
                        <input
                          type="text"
                          id="linkedin_url"
                          name="linkedin_url"
                          value={currentDeveloper.linkedin_url || ""}
                          onChange={handleInputChange}
                          placeholder="eg: https://linkedin.com/in/username"
                          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Portfolio URL
                      </label>
                      <input
                        type="text"
                        id="portfolio"
                        name="portfolio"
                        value={currentDeveloper.portfolio || ""}
                        onChange={handleInputChange}
                        placeholder="eg: https://portfolio.com"
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="projects" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Projects
                        </label>
                        <input
                          type="number"
                          id="projects"
                          name="projects"
                          value={currentDeveloper.projects}
                          onChange={handleInputChange}
                          min="0"
                          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="contributions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Contributions
                        </label>
                        <input
                          type="number"
                          id="contributions"
                          name="contributions"
                          value={currentDeveloper.contributions}
                          onChange={handleInputChange}
                          min="0"
                          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={currentDeveloper.bio || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                      ></textarea>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mt-5 flex flex-col-reverse sm:grid sm:grid-cols-2 sm:gap-3">
                      <button
                        type="button"
                        className="mt-3 sm:mt-0 inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
                          <>{currentDeveloper.id ? "Update" : "Create"}</>
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

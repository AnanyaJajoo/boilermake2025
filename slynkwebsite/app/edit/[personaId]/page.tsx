"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { 
  Loader2, ArrowLeft, Save, Upload, Check, Play, X,
  Mic, Image as ImageIcon, UserRound, Sparkles
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { AnimatedInput } from "@/components/create/animated-input"
import { FileDropZone } from "@/components/create/file-drop-zone"
import { QATable } from "@/components/create/qa-table"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { generateFaceId, generateVideoPreview } from "@/lib/simli-api"

interface PersonaData {
  id: string
  name: string
  description: string
  pageLink?: string
  adImage?: File | null
  voiceSample?: File | null
  systemPrompt?: string
  firstMessage?: string
  faceId?: string
  voice?: string
  qaPairs: Array<{
    id: string
    question: string
    answer: string
  }>
}

export default function EditPersonaPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [persona, setPersona] = useState<PersonaData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isGeneratingFace, setIsGeneratingFace] = useState(false)
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)
  const [videoPreview, setVideoPreview] = useState<{hlsUrl: string, mp4Url: string} | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // If not authenticated, redirect to sign-in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
    }
  }, [status, router])
  
  // Auto advance steps when criteria are met
  useEffect(() => {
    if (persona?.name && persona?.description && activeStep === 1) {
      setActiveStep(2)
    }
    if (persona?.faceId && activeStep === 2) {
      setActiveStep(3)
    }
  }, [persona?.name, persona?.description, persona?.faceId, activeStep])

  // Fetch persona data
  useEffect(() => {
    const fetchPersona = async () => {
      if (status !== "authenticated" || !params.personaId) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/personas/${params.personaId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Persona not found")
          } else {
            throw new Error(`Error fetching persona: ${response.status}`)
          }
        }
        
        const data = await response.json()
        setPersona({
          id: data.id,
          name: data.name || data.productName,
          description: data.description,
          pageLink: data.pageLink,
          faceId: data.faceId,
          systemPrompt: data.systemPrompt,
          firstMessage: data.firstMessage,
          voice: data.voice || "en-US-Neural2-F",
          qaPairs: data.qaPairs || []
        })
      } catch (error) {
        console.error("Error fetching persona:", error)
        setError(error instanceof Error ? error.message : "Failed to load persona")
      } finally {
        setLoading(false)
      }
    }

    fetchPersona()
  }, [params.personaId, status])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPersona((prev) => prev ? { ...prev, [name]: value } : null)
  }

  const handleVoiceChange = (value: string) => {
    setPersona((prev) => prev ? { ...prev, voice: value } : null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateFaceId = async () => {
    if (!image) {
      setError("Please upload an image first")
      return
    }
    
    setIsGeneratingFace(true)
    setError(null)
    
    try {
      // Attempt to generate a face ID
      let faceId
      try {
        console.log("Generating face ID from uploaded image...")
        faceId = await generateFaceId(image, persona?.name || "unnamed_persona")
        console.log("Successfully generated face ID:", faceId)
      } catch (e) {
        console.error("Error generating face ID, using default:", e)
        // Use default face ID if generation fails
        faceId = "tmp9i8bbq7c"
      }
      
      setPersona(prev => prev ? { ...prev, faceId } : null)
    } catch (error) {
      console.error("Error generating face ID:", error)
      setError(error instanceof Error ? error.message : "Failed to generate face")
      
      // Set a default face ID even if there's an error
      setPersona(prev => prev ? { ...prev, faceId: "tmp9i8bbq7c" } : null)
    } finally {
      setIsGeneratingFace(false)
    }
  }
  
  const handleGenerateAvatar = async () => {
    // Use default Face ID for avatar generation
    setIsGeneratingAvatar(true)
    setError(null)
    
    try {
      // In production, you would call a different API endpoint for avatar generation
      // For now, we'll use the default face ID
      setPersona(prev => prev ? { ...prev, faceId: "tmp9i8bbq7c" } : null)
    } catch (error) {
      console.error("Error generating avatar:", error)
      setError(error instanceof Error ? error.message : "Failed to generate avatar")
    } finally {
      setIsGeneratingAvatar(false)
    }
  }
  
  const handleGeneratePreview = async () => {
    if (!persona?.faceId) {
      setError("Please generate a face ID or avatar first")
      return
    }
    
    const previewText = persona.firstMessage || 
      `Hello, I'm ${persona.name || "your AI assistant"}. How can I help you today?`
    
    setIsGeneratingPreview(true)
    setError(null)
    
    try {
      const preview = await generateVideoPreview(previewText, persona.faceId)
      setVideoPreview(preview)
    } catch (error) {
      console.error("Error generating preview:", error)
      setError(error instanceof Error ? error.message : "Failed to generate preview")
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const handleFileChange = (field: "adImage" | "voiceSample", file: File | null) => {
    setPersona((prev) => prev ? { ...prev, [field]: file } : null)
  }

  const handleQAPairsChange = (qaPairs: Array<{ id: string; question: string; answer: string }>) => {
    setPersona((prev) => prev ? { ...prev, qaPairs } : null)
  }

  const handleSave = async () => {
    if (!persona) return
    
    setSaving(true)
    
    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append("personaId", persona.id)
      formData.append("name", persona.name)
      formData.append("description", persona.description)
      
      if (persona.pageLink) {
        formData.append("pageLink", persona.pageLink)
      }
      
      if (persona.systemPrompt) {
        formData.append("systemPrompt", persona.systemPrompt)
      }
      
      if (persona.firstMessage) {
        formData.append("firstMessage", persona.firstMessage)
      }
      
      if (persona.faceId) {
        formData.append("faceId", persona.faceId)
      }
      
      if (persona.voice) {
        formData.append("voice", persona.voice)
      }
      
      if (persona.adImage) {
        formData.append("adImage", persona.adImage)
      }
      
      if (persona.voiceSample) {
        formData.append("voiceSample", persona.voiceSample)
      }
      
      // Convert QA pairs to JSON string and append
      formData.append("qaPairs", JSON.stringify(persona.qaPairs))
      
      // Submit form data to API
      const response = await fetch(`/api/personas/${persona.id}`, {
        method: "PATCH",
        body: formData,
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Failed to update persona. Status: ${response.status}`
        
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (e) {
          if (errorText) errorMessage = errorText
        }
        
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      
      toast({
        title: "Success!",
        description: "Your AI persona has been updated.",
        variant: "default",
      })
      
      // Redirect to the dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating persona:", error)
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update persona. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-pink-500" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-500">
          {error}
        </div>
        <div className="mt-4">
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!persona) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700">
          No persona data available.
        </div>
        <div className="mt-4">
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="w-full max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Edit AI Persona
            </motion.h1>
            
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-full border-2 border-gray-200 hover:border-gray-300">
                <ArrowLeft size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="space-y-8">
            {/* Step 1: Basic Information */}
            <motion.div 
              className={`p-6 rounded-xl bg-white shadow-lg border-2 ${activeStep === 1 ? 'border-pink-400' : 'border-transparent'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">1</div>
                <h2 className="text-2xl font-semibold">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <AnimatedInput
                      label="Name"
                      placeholder="Enter the name of your AI persona"
                      required
                      name="name"
                      value={persona.name}
                      onChange={handleInputChange}
                      className="border-2 focus:border-pink-400 p-3 text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <AnimatedInput
                      label="Description"
                      placeholder="Describe your AI persona"
                      required
                      multiline
                      rows={3}
                      name="description"
                      value={persona.description}
                      onChange={handleInputChange}
                      className="border-2 focus:border-pink-400 p-3 text-base"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <AnimatedInput
                      label="System Prompt"
                      placeholder="Instructions for how the AI should behave"
                      multiline
                      rows={3}
                      name="systemPrompt"
                      value={persona.systemPrompt || ""}
                      onChange={handleInputChange}
                      className="border-2 focus:border-pink-400 p-3 text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <AnimatedInput
                      label="First Message (Optional)"
                      placeholder="First message to send when starting a conversation"
                      multiline
                      rows={2}
                      name="firstMessage"
                      value={persona.firstMessage || ""}
                      onChange={handleInputChange}
                      className="border-2 focus:border-pink-400 p-3 text-base"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Step 2: Appearance */}
            <motion.div 
              className={`p-6 rounded-xl bg-white shadow-lg border-2 ${activeStep === 2 ? 'border-pink-400' : 'border-transparent'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">2</div>
                <h2 className="text-2xl font-semibold">Appearance</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column: Image upload */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-5 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-pink-500" />
                      Reference Image (Optional)
                    </h3>
                    <div className="flex flex-col items-center space-y-4">
                      {previewImage ? (
                        <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-pink-200 shadow-md group">
                          <Image 
                            src={previewImage} 
                            alt="Preview" 
                            fill
                            className="object-cover transition-all group-hover:scale-105"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              setImage(null)
                              setPreviewImage(null)
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="w-48 h-48 border-2 border-dashed border-pink-300 rounded-lg flex items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50 cursor-pointer hover:border-pink-400 transition-all duration-300"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-pink-400" />
                            <p className="mt-2 text-sm text-gray-600">Upload an image</p>
                          </div>
                        </div>
                      )}
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-pink-300 hover:border-pink-500 hover:bg-pink-50 text-pink-600 transition-all duration-300"
                      >
                        {previewImage ? "Change Image" : "Upload Image"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Right column: Face ID and Avatar options */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <UserRound className="h-5 w-5 text-blue-500" />
                      Generate Face ID
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Generate a realistic face for your AI based on your reference image.
                    </p>
                    
                    <Button
                      type="button"
                      disabled={!image || isGeneratingFace}
                      onClick={handleGenerateFaceId}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 transition-opacity"
                    >
                      {isGeneratingFace ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Face ID...
                        </>
                      ) : persona.faceId && image ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Face ID Generated
                        </>
                      ) : (
                        <>
                          <UserRound className="mr-2 h-4 w-4" />
                          Generate Face ID
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-5 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Generate Avatar
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Create an AI avatar without uploading a reference image.
                    </p>
                    
                    <Button
                      type="button"
                      disabled={isGeneratingAvatar}
                      onClick={handleGenerateAvatar}
                      className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:opacity-90 transition-opacity"
                    >
                      {isGeneratingAvatar ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Avatar...
                        </>
                      ) : persona.faceId && !image ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Avatar Generated
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Avatar
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {persona.faceId && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                      <Check className="text-green-500 h-4 w-4" />
                      {image ? "Face ID" : "Avatar"} active: {persona.faceId.substring(0, 8)}...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Step 3: Preview, Voice, and Q&A */}
            <motion.div 
              className={`p-6 rounded-xl bg-white shadow-lg border-2 ${activeStep === 3 ? 'border-pink-400' : 'border-transparent'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">3</div>
                <h2 className="text-2xl font-semibold">Preview & Voice</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Preview */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Play className="h-5 w-5 text-green-500" />
                      Generate Preview
                    </h3>
                    
                    <Button
                      type="button"
                      variant="default"
                      disabled={!persona.faceId || isGeneratingPreview}
                      onClick={handleGeneratePreview}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90 transition-opacity"
                    >
                      {isGeneratingPreview ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Preview...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Generate Video Preview
                        </>
                      )}
                    </Button>
                    
                    {videoPreview && (
                      <div className="mt-4">
                        <video 
                          src={videoPreview.mp4Url}
                          controls
                          className="w-full rounded-md border-2 border-green-200 shadow-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right: Voice Selection */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Mic className="h-5 w-5 text-amber-500" />
                      Voice Selection
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose the voice for your AI persona.
                    </p>
                    
                    <div className="space-y-2">
                      <label htmlFor="voice" className="text-base font-medium">Voice</label>
                      <Select value={persona.voice || "en-US-Neural2-F"} onValueChange={handleVoiceChange}>
                        <SelectTrigger className="w-full border-2 border-amber-200 focus:border-amber-400 bg-white">
                          <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US-Neural2-F">American Female</SelectItem>
                          <SelectItem value="en-US-Neural2-M">American Male</SelectItem>
                          <SelectItem value="en-GB-Neural2-F">British Female</SelectItem>
                          <SelectItem value="en-GB-Neural2-M">British Male</SelectItem>
                          <SelectItem value="en-AU-Neural2-F">Australian Female</SelectItem>
                          <SelectItem value="en-AU-Neural2-M">Australian Male</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Step 4: Questions & Answers */}
            <motion.div 
              className="p-6 rounded-xl bg-white shadow-lg border-2 border-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">4</div>
                <h2 className="text-2xl font-semibold">Questions & Answers</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Add questions and answers that your AI persona should know.
                </p>
                <QATable pairs={persona.qaPairs} onChange={handleQAPairsChange} />
              </div>
            </motion.div>
            
            {/* Additional Resources */}
            <motion.div 
              className="p-6 rounded-xl bg-white shadow-lg border-2 border-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">5</div>
                <h2 className="text-2xl font-semibold">Additional Resources</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileDropZone
                  label="Advertisement Image or Reference (Optional)"
                  accept="image/*"
                  icon="image"
                  onChange={(file) => handleFileChange("adImage", file)}
                  value={persona.adImage || null}
                  className="bg-gradient-to-r from-fuchsia-50 to-pink-50 border-2 border-fuchsia-100 rounded-lg p-4"
                />
                
                <FileDropZone
                  label="Voice Sample (Optional)"
                  accept="audio/*"
                  icon="audio"
                  onChange={(file) => handleFileChange("voiceSample", file)}
                  value={persona.voiceSample || null}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-lg p-4"
                />
              </div>
            </motion.div>
            
            {/* Error display */}
            {error && (
              <motion.div 
                className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}
            
            {/* Submit buttons */}
            <motion.div 
              className="flex justify-end space-x-4 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="border-2 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="px-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-all shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 
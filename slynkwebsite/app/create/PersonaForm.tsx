"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Loader2, Upload, Check, Play, X, 
  Mic, Image as ImageIcon, UserRound, Sparkles
} from "lucide-react"
import Image from "next/image"
import { 
  generateFaceId, 
  generateVideoPreview, 
  DEFAULT_FACE_ID,
  checkFaceGenerationStatus 
} from "@/lib/simli-api"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PersonaForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    firstMessage: "",
    faceId: "",
    voice: "en-US-Neural2-F", // Default voice
  })
  const [image, setImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isGeneratingFace, setIsGeneratingFace] = useState(false)
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)
  const [videoPreview, setVideoPreview] = useState<{hlsUrl: string, mp4Url: string} | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPreviewGenerated, setIsPreviewGenerated] = useState(false)
  const [isCustomFaceInQueue, setIsCustomFaceInQueue] = useState(false)
  const [originalFaceResponse, setOriginalFaceResponse] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto advance steps when criteria are met
  useEffect(() => {
    if (formData.name && formData.description && activeStep === 1) {
      setActiveStep(2)
    }
    if (formData.faceId && activeStep === 2) {
      setActiveStep(3)
    }
  }, [formData.name, formData.description, formData.faceId, activeStep])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleVoiceChange = (value: string) => {
    setFormData({
      ...formData,
      voice: value
    })
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
    
    // Check image size before attempting generation
    if (image.size > 10 * 1024 * 1024) { // 10MB limit
      setError("Image size exceeds 10MB limit. Please upload a smaller image.")
      return
    }
    
    setIsGeneratingFace(true)
    setError(null)
    setSuccessMessage(null)
    setIsCustomFaceInQueue(false)
    setOriginalFaceResponse(null)
    
    try {
      // Attempt to generate a face ID using Simli's API
      console.log("Generating face ID from uploaded image...")
      const result = await generateFaceId(image, formData.name || "unnamed_persona")
      console.log("Successfully generated face ID:", result)
      
      if (!result || !result.faceId) {
        throw new Error("No face ID was returned from the API")
      }
      
      setFormData({
        ...formData,
        faceId: result.faceId
      })
      
      // Set additional state for queue status
      setIsCustomFaceInQueue(result.isInQueue)
      if (result.originalResponse) {
        setOriginalFaceResponse(result.originalResponse)
      }
      
      if (result.isInQueue) {
        // Handle queued face ID scenario
        setSuccessMessage(
          "Your custom face has been added to the processing queue! " +
          "We're using a temporary face for now, but your character will be available for future sessions. " +
          "Please proceed to generate a preview."
        )
        
        // Set up periodic checking if needed
        if (result.originalResponse?.character_uid) {
          // Here we could implement a polling mechanism to check status
          // For now we just notify the user their face is in queue
          console.log("Face generation queued with character_uid:", result.originalResponse.character_uid)
        }
      } else {
        setSuccessMessage("Face ID generated successfully! Now proceed to Step 3 to generate a preview.")
      }
    } catch (error) {
      console.error("Error generating face ID:", error)
      
      // Extract error details for better messages
      let errorMsg = error instanceof Error ? error.message : "Failed to generate face"
      
      // Handle specific errors with better messages
      if (errorMsg.includes("512x512")) {
        errorMsg = "Image must be at least 512x512 pixels. Please upload a larger image."
      } else if (errorMsg.includes("502")) {
        errorMsg = "Server error when processing image. Please try again with a different image."
      }
      
      setError(errorMsg)
    } finally {
      setIsGeneratingFace(false)
    }
  }
  
  const handleGenerateAvatar = async () => {
    setIsGeneratingAvatar(true)
    setError(null)
    setSuccessMessage(null)
    setIsCustomFaceInQueue(false)
    setOriginalFaceResponse(null)
    
    try {
      // For demo/MVP purposes, we use a default face ID
      // In production, you would call an API to generate a custom avatar
      setFormData({
        ...formData,
        faceId: DEFAULT_FACE_ID // Use imported constant from simli-api.ts
      })
      
      setSuccessMessage("Pre-built avatar selected! Now proceed to Step 3 to generate a preview.")
    } catch (error) {
      console.error("Error generating avatar:", error)
      setError(error instanceof Error ? error.message : "Failed to generate avatar")
    } finally {
      setIsGeneratingAvatar(false)
    }
  }
  
  const handleGeneratePreview = async () => {
    if (!formData.faceId) {
      setError("Please generate a face ID or avatar first")
      return
    }
    
    const previewText = formData.firstMessage || 
      `Hello, I'm ${formData.name || "your new AI assistant"}. How can I help you today?`
    
    setIsGeneratingPreview(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const preview = await generateVideoPreview(previewText, formData.faceId)
      setVideoPreview(preview)
      setIsPreviewGenerated(true)
      setSuccessMessage("Video preview generated! You can now create your persona.")
    } catch (error) {
      console.error("Error generating preview:", error)
      setError(error instanceof Error ? error.message : "Failed to generate preview")
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Check if we have a face ID
      if (!formData.faceId) {
        // Set default face ID if none exists
        setFormData(prev => ({
          ...prev,
          faceId: DEFAULT_FACE_ID
        }))
      }
      
      // Prepare prompt and first message
      const systemPrompt = formData.systemPrompt || 
        `You are a virtual assistant named ${formData.name}. ${formData.description} Keep your responses helpful, concise, and friendly.`
      
      const firstMessage = formData.firstMessage || 
        `Hello, I'm ${formData.name}. How can I help you today?`
      
      console.log("Creating persona with settings:", {
        name: formData.name,
        description: formData.description,
        faceId: formData.faceId,
        originalCharacterId: isCustomFaceInQueue ? originalFaceResponse?.character_uid : undefined,
        voice: formData.voice,
        systemPrompt: systemPrompt.substring(0, 50) + "...",
        firstMessage: firstMessage
      })
      
      // Create the persona - our backend will handle Simli agent creation
      const response = await fetch("/api/personas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          systemPrompt: systemPrompt,
          firstMessage: firstMessage,
          faceId: formData.faceId || DEFAULT_FACE_ID, // Include the Simli face ID with fallback
          originalCharacterId: isCustomFaceInQueue ? originalFaceResponse?.character_uid : undefined,
          voice: formData.voice,
          isCustomFaceInQueue: isCustomFaceInQueue
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create persona")
      }
      
      const data = await response.json()
      console.log("Persona created with ID:", data.id)
      
      // Navigate to the persona chat
      router.push(`/chat/${data.id}`)
    } catch (error) {
      console.error("Error submitting form:", error)
      setError(error instanceof Error ? error.message : "Failed to create persona")
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <motion.h1 
        className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Create Your AI Persona
      </motion.h1>
      
      {/* Add instructions card */}
      <motion.div
        className="mb-8 p-5 rounded-xl bg-blue-50 border border-blue-200 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-3">How to create your AI persona:</h2>
        <ol className="space-y-2 text-blue-700 ml-5 list-decimal">
          <li><strong>Basic Information:</strong> Enter a name and description for your AI persona.</li>
          <li>
            <strong>Choose appearance:</strong> Either upload your own photo (must be at least 512x512 pixels) and generate a Face ID, 
            <em>OR</em> use a pre-made avatar.
            <span className="block text-sm mt-1 text-indigo-600">
              <strong>Note:</strong> Custom face generation takes time to process. Your persona will initially use a temporary face.
            </span>
          </li>
          <li><strong>Generate preview:</strong> Create a video preview to see how your AI looks and sounds.</li>
          <li><strong>Create:</strong> Click the "Create Persona" button at the bottom of the form.</li>
        </ol>
      </motion.div>
      
      {/* Add this component below the instructions card: */}
      {isCustomFaceInQueue && (
        <motion.div
          className="mb-6 p-4 rounded-lg bg-indigo-50 border border-indigo-200 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-100 p-2 flex-shrink-0">
              <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-indigo-800">Custom Face Processing</h3>
              <p className="text-indigo-700">
                Your custom face is being processed. We're using a temporary face for now.
                <span className="block mt-1 text-sm">Character ID: {originalFaceResponse?.character_uid || "Unknown"}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit}>
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
                  <Label htmlFor="name" className="text-base">Name</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="E.g., Business Advisor Bob"
                    className="p-3 text-base border-2 focus:border-pink-400 focus:ring-pink-400 transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">Description</Label>
                  <Textarea 
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the persona's background, expertise, and personality"
                    className="p-3 text-base border-2 focus:border-pink-400 focus:ring-pink-400 transition-all"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt" className="text-base">System Prompt</Label>
                  <Textarea 
                    id="systemPrompt"
                    name="systemPrompt"
                    value={formData.systemPrompt}
                    onChange={handleChange}
                    placeholder="Instructions for how the AI should behave (auto-generated if left empty)"
                    className="p-3 text-base border-2 focus:border-pink-400 focus:ring-pink-400 transition-all"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="firstMessage" className="text-base">First Message (Optional)</Label>
                  <Textarea 
                    id="firstMessage"
                    name="firstMessage"
                    value={formData.firstMessage}
                    onChange={handleChange}
                    placeholder="First message to send when starting a conversation (auto-generated if left empty)"
                    className="p-3 text-base border-2 focus:border-pink-400 focus:ring-pink-400 transition-all"
                    rows={2}
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
                    Reference Image
                  </h3>
                  <div className="text-sm text-gray-700 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p><strong>Image requirements:</strong></p>
                    <ul className="list-disc ml-4 space-y-1 mt-1">
                      <li>Clear, front-facing photo of a face</li>
                      <li>Minimum resolution: 512x512 pixels</li>
                      <li>Maximum file size: 10MB</li>
                      <li>Formats: JPG, PNG</li>
                    </ul>
                  </div>
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
                  
                  {isCustomFaceInQueue ? (
                    <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
                      <p className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                        <span><strong>Face processing:</strong> Your custom face is being processed.</span>
                      </p>
                      <p className="mt-1">A temporary face will be used for now.</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Step 1:</strong> Upload a reference image and generate a face ID using your image.
                      <span className="block mt-1 text-xs italic">
                        Note: Face generation may take time to process in the background.
                      </span>
                    </p>
                  )}
                  
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
                    ) : formData.faceId && image ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {isCustomFaceInQueue ? "Face ID Queued" : "Face ID Generated"}
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
                    <strong>Alternative to Step 1:</strong> Skip image upload and use a pre-made AI avatar instead.
                  </p>
                  
                  <Button
                    type="button"
                    disabled={isGeneratingAvatar || Boolean(image && formData.faceId)}
                    onClick={handleGenerateAvatar}
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:opacity-90 transition-opacity"
                  >
                    {isGeneratingAvatar ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Avatar...
                      </>
                    ) : formData.faceId && !image ? (
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
              </div>
            </div>
          </motion.div>
          
          {/* Step 3: Preview & Voice */}
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
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Step 2:</strong> After generating a Face ID or Avatar, create a video preview to see how your AI looks and sounds.
                  </p>
                  
                  {isGeneratingPreview ? (
                    <Button 
                      type="button"
                      variant="default"
                      disabled={true}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90 transition-opacity"
                    >
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Preview...
                    </Button>
                  ) : isPreviewGenerated ? (
                    <Button 
                      type="button"
                      variant="default"
                      disabled={!formData.faceId}
                      onClick={handleGeneratePreview}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90 transition-opacity"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Regenerate Preview
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      variant="default"
                      disabled={!formData.faceId}
                      onClick={handleGeneratePreview}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90 transition-opacity"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Generate Video Preview
                    </Button>
                  )}
                  
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
                    <Label htmlFor="voice" className="text-base">Voice</Label>
                    <Select value={formData.voice} onValueChange={handleVoiceChange}>
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
          
          {/* Error display with better visibility */}
          {error && (
            <motion.div 
              className="bg-red-50 border-2 border-red-300 text-red-700 p-5 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-red-100 p-2 mt-0.5">
                  <X className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Error</h3>
                  <p>{error}</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Success message display */}
          {successMessage && !error && (
            <motion.div 
              className="bg-green-50 border-2 border-green-200 text-green-700 p-5 rounded-lg shadow-sm mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 p-2 mt-0.5">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Success</h3>
                  <p>{successMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Add this component after the error and success message components */}
          {isCustomFaceInQueue && originalFaceResponse && (
            <motion.div 
              className="bg-blue-50 border-2 border-blue-200 text-blue-700 p-5 rounded-lg shadow-sm mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 p-2 mt-0.5">
                  <Loader2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Face Processing Status</h3>
                  <p>Your custom face is in the processing queue. Queue position: {originalFaceResponse?.position || "unknown"}</p>
                  <p className="mt-2 text-sm">Character ID: {originalFaceResponse?.character_uid}</p>
                  <p className="mt-3 text-sm font-medium">We're using a temporary face for preview purposes. Your custom face will be available for future sessions.</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Submit buttons */}
          <motion.div 
            className="flex justify-end space-x-4 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
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
              type="submit"
              disabled={loading}
              className="px-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-all shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Persona"
              )}
            </Button>
          </motion.div>
        </div>
      </form>
    </div>
  )
} 
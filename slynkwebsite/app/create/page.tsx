"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AnimatedProgressBar } from "@/components/create/animated-progress-bar"
import { AnimatedInput } from "@/components/create/animated-input"
import { FileDropZone } from "@/components/create/file-drop-zone"
import { QATable } from "@/components/create/qa-table"
import { ArrowLeft, ArrowRight, Check, Sparkles, Home } from "lucide-react"
import { CreateSidebar } from "@/components/create/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import Link from "next/link"

interface FormData {
  email: string
  productName: string
  description: string
  pageLink: string
  adImage: File | null
  voiceSample: File | null
  qaPairs: Array<{
    id: string
    question: string
    answer: string
  }>
}

const STEPS = [
  { name: "Basic Info", description: "Contact and product details" },
  { name: "Content", description: "Description and reference materials" },
  { name: "Q&A", description: "Questions and answers for your AI" },
  { name: "Voice", description: "Optional voice customization" },
  { name: "Review", description: "Review and submit" },
]

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    productName: "",
    description: "",
    pageLink: "",
    adImage: null,
    voiceSample: null,
    qaPairs: [
      {
        id: "qa-1",
        question: "",
        answer: "",
      },
    ],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (field: "adImage" | "voiceSample", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  const handleQAPairsChange = (qaPairs: Array<{ id: string; question: string; answer: string }>) => {
    setFormData((prev) => ({ ...prev, qaPairs }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
    // Redirect or show success message
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
            <AnimatedInput
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              required
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <AnimatedInput
              label="Product or Event Name"
              placeholder="Enter the name of your product or event"
              required
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
            />
          </div>
        )
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Content Details</h2>
            <AnimatedInput
              label="Description"
              placeholder="Describe your product or event"
              required
              multiline
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
            <AnimatedInput
              label="Link to Page"
              type="url"
              placeholder="https://example.com"
              name="pageLink"
              value={formData.pageLink}
              onChange={handleInputChange}
            />
            <FileDropZone
              label="Advertisement Image or Reference"
              accept="image/*"
              icon="image"
              onChange={(file) => handleFileChange("adImage", file)}
              value={formData.adImage}
            />
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Questions & Answers</h2>
            <p className="text-sm text-gray-600">
              Add questions and answers that your AI persona should know. This helps create a more accurate and helpful
              virtual spokesperson.
            </p>
            <QATable pairs={formData.qaPairs} onChange={handleQAPairsChange} />
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Voice Customization</h2>
            <p className="text-sm text-gray-600">
              Upload a voice sample to customize how your AI persona sounds. This is optional but recommended for a more
              personalized experience.
            </p>
            <FileDropZone
              label="Voice Sample (Optional)"
              accept="audio/*"
              icon="audio"
              onChange={(file) => handleFileChange("voiceSample", file)}
              value={formData.voiceSample}
            />
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
                <Sparkles size={16} />
                Pro Tip
              </h3>
              <p className="text-sm text-blue-600">
                For best results, upload a clear audio recording of 30-60 seconds in a quiet environment. The AI will
                analyze the voice characteristics to create a similar sounding virtual spokesperson.
              </p>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Review Your Information</h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">Basic Information</h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-2">
                    <span className="font-medium">Email:</span> {formData.email}
                  </p>
                  <p>
                    <span className="font-medium">Product/Event:</span> {formData.productName}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">Content Details</h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-2">
                    <span className="font-medium">Description:</span> {formData.description}
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Page Link:</span>{" "}
                    {formData.pageLink ? (
                      <a href={formData.pageLink} target="_blank" rel="noopener noreferrer" className="text-pink-500">
                        {formData.pageLink}
                      </a>
                    ) : (
                      "None provided"
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Ad Image:</span>{" "}
                    {formData.adImage ? formData.adImage.name : "None provided"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">Q&A Content</h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  {formData.qaPairs.length > 0 ? (
                    <div className="space-y-3">
                      {formData.qaPairs.map((pair, index) => (
                        <div key={pair.id} className="border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                          <p className="font-medium">Q: {pair.question || "No question provided"}</p>
                          <p className="text-gray-600">A: {pair.answer || "No answer provided"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No Q&A pairs provided</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">Voice Sample</h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p>
                    <span className="font-medium">Voice Sample:</span>{" "}
                    {formData.voiceSample ? formData.voiceSample.name : "None provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <SidebarProvider>
        <CreateSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b border-gray-200 bg-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">Create AI Persona</h1>
              <Link href="/" className="hidden sm:flex">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                  <Home size={14} />
                  <span>Home</span>
                </Button>
              </Link>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              Save Draft
            </Button>
          </header>

          {/* Main content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-3xl mx-auto">
              {/* Progress bar */}
              <div className="mb-8">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Step {currentStep + 1} of {STEPS.length}
                  </p>
                </div>
                <AnimatedProgressBar currentStep={currentStep + 1} totalSteps={STEPS.length} />
                <div className="mt-4 flex justify-between">
                  {STEPS.map((step, index) => (
                    <div
                      key={step.name}
                      className={`text-center ${
                        index <= currentStep ? "text-pink-600" : "text-gray-400"
                      } transition-colors duration-300`}
                    >
                      <p className="text-xs font-medium">{step.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step content */}
              <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                {renderStepContent()}

                {/* Navigation buttons */}
                <div className="mt-8 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="gap-2 rounded-full"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </Button>

                  {currentStep < STEPS.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="gap-2 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90"
                    >
                      Next
                      <ArrowRight size={16} />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="gap-2 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90"
                    >
                      <Check size={16} />
                      Create AI Persona
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}

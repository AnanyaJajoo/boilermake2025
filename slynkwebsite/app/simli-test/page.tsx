"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function SimliTestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [apiStatus, setApiStatus] = useState<{
    status: 'success' | 'error' | 'loading',
    message: string,
    configured: boolean,
    availableFaces?: string[],
    error?: string
  }>({
    status: 'loading',
    message: 'Checking Simli API configuration...',
    configured: false
  })
  const { data: session, status } = useSession()

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/signin?callbackUrl=/simli-test`)
    }
  }, [status, router])

  useEffect(() => {
    // Test the Simli API configuration
    const testSimliApi = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/simli/test')
        
        if (response.status === 401) {
          setApiStatus({
            status: 'error',
            message: "You need to be signed in to test the Simli API.",
            configured: false
          })
          return
        }
        
        if (!response.ok) {
          throw new Error(`API test failed: ${response.status}`)
        }
        
        const data = await response.json()
        setApiStatus(data)
      } catch (error) {
        console.error("Error testing Simli API:", error)
        setApiStatus({
          status: 'error',
          message: "Failed to test Simli API configuration.",
          configured: false,
          error: error instanceof Error ? error.message : "Unknown error"
        })
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      testSimliApi()
    }
  }, [status])

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-pink-500" />
          <p className="mt-2 text-gray-600">Testing Simli API configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white p-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="rounded-full">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <span className="text-sm font-medium">Back to Dashboard</span>
      </div>
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="max-w-lg w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">Simli API Configuration Test</h1>
          
          <div className={`p-6 rounded-lg ${apiStatus.status === 'success' ? 'bg-green-50' : 'bg-red-50'} mb-8`}>
            <div className="flex items-center mb-4">
              {apiStatus.status === 'success' ? (
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              )}
              <h2 className="text-xl font-semibold">{apiStatus.message}</h2>
            </div>
            
            {apiStatus.error && (
              <div className="bg-red-100 p-3 rounded text-red-800 mb-4">
                <p className="font-medium">Error details:</p>
                <p className="font-mono text-sm whitespace-pre-wrap overflow-auto">{apiStatus.error}</p>
              </div>
            )}
            
            {apiStatus.availableFaces && apiStatus.availableFaces.length > 0 && (
              <div className="mt-4">
                <p className="font-medium mb-2">Available Simli Faces:</p>
                <ul className="bg-white p-3 rounded border border-green-200">
                  {apiStatus.availableFaces.map((face, index) => (
                    <li key={index} className="font-mono text-sm mb-1">{face}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Configuration Status:</h3>
              {apiStatus.status === 'success' ? (
                <p>Your Simli API key is properly configured and working. You can now use the avatar features.</p>
              ) : (
                <div>
                  <p className="mb-4">To fix this issue:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Make sure you have a valid Simli API key</li>
                    <li>Create or edit your <code className="bg-gray-200 px-1 py-0.5 rounded">slynkwebsite/.env.local</code> file</li>
                    <li>Add your Simli API key: <code className="bg-gray-200 px-1 py-0.5 rounded">SIMLI_API_KEY="your-api-key-here"</code></li>
                    <li>Restart your development server</li>
                    <li>Refresh this page to test again</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="gap-2 rounded-full"
            >
              Test Again
            </Button>
            <Link href="/dashboard">
              <Button className="gap-2 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 
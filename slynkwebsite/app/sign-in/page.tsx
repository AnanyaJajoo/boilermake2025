"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SignInRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  
  useEffect(() => {
    // Redirect to /signin, preserving any callbackUrl
    const redirectUrl = callbackUrl 
      ? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/signin"
    
    router.push(redirectUrl)
  }, [router, callbackUrl])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
        <p className="mt-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Redirecting...</p>
      </div>
    </div>
  )
}

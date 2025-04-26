"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft } from "lucide-react"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="relative w-full max-w-md space-y-8">
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 opacity-75 blur-sm"></div>
        <div className="relative rounded-lg bg-white p-8 shadow-md">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-pink-100">
              <Mail className="h-8 w-8 text-pink-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Check your email</h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              A sign in link has been sent to your email address.
            </p>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please check your inbox and click the link to sign in.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    The email might take a few minutes to arrive. Be sure to check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                >
                  <ArrowLeft size={16} />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
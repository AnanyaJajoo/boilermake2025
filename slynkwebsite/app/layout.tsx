import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import type React from "react"
import ScrollBehavior from "@/components/scroll-behavior"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Voxen - Interactive Virtual Spokespersons",
  description: "Transform static advertisements into engaging, conversational experiences with AI-driven avatars",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        {children}
        {/* Client component for scroll behavior management */}
        <ScrollBehavior />
      </body>
    </html>
  )
}
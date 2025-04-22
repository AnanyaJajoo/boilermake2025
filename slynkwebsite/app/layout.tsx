import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "slynk - Interactive Virtual Spokespersons",
  description: "Transform static advertisements into engaging, conversational experiences with AI-driven avatars",
  generator: 'v0.dev',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>{children}</body>
    </html>
  )
}


import './globals.css'
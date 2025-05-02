import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import type React from "react"
import { Providers } from "./providers"
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "slynk",
  description: "reinventing ads with live interaction",
  icons: {
    icon: [
      { url: "/slynkicon.svg", type: "image/x-icon" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <Providers>
          <DynamicNavbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}


import './globals.css'
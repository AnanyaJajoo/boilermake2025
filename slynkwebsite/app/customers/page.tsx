"use client"

import { CustomersBackground } from "@/components/customers-background"
import { FeaturesSection } from "@/components/features-section"
import { StorySection } from "@/components/story-section"
import { ValuesSection } from "@/components/values-section"

export default function CustomersPage() {
  return (
    <main className="relative min-h-screen bg-white">
      <CustomersBackground />
      <section className="relative z-10 pt-32">
        <div className="container mx-auto px-4 text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-gray-900">
            Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">Customers</span> Success
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover how businesses are using Slynk to create meaningful connections with their audience 
            through AI-powered virtual spokespersons.
          </p>
        </div>
        <FeaturesSection />
        <StorySection />
        <ValuesSection />
      </section>
    </main>
  )
}
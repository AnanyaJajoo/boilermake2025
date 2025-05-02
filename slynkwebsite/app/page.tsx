"use client"

import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { StorySection } from "@/components/story-section"
import { ValuesSection } from "@/components/values-section"

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <StorySection />
      <ValuesSection />
    </>
  )
}

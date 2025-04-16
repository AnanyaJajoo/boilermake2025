"use client"

import { useState } from "react"
import { TopHeader } from "@/components/top-header"
import { FloatingNavbar } from "@/components/floating-navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { MissionSection } from "@/components/mission-section"
import { StorySection } from "@/components/story-section"
import { ValuesSection } from "@/components/values-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { ParallaxBackground } from "@/components/parallax-background"
//import { AnimatedBackground } from "@/components/animated-background"
import { AnimatedScrollIndicator } from "@/components/animated-scroll-indicator"
import { SignInPopup } from "@/components/sign-in-popup"

export default function Home() {
  const [isSignInOpen, setIsSignInOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      {/*<AnimatedBackground />*/}
      <ParallaxBackground />
      <TopHeader onSignInClick={() => setIsSignInOpen(true)} />
      <FloatingNavbar />
      <HeroSection />
      <AnimatedScrollIndicator />
      <FeaturesSection />
      <MissionSection />
      <StorySection />
      <ValuesSection />
      <ContactSection />
      <Footer />
      <SignInPopup isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </main>
  )
}

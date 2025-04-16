"use client"

import { Button } from "@/components/ui/button"
import { InteractiveGrid } from "@/components/ui/interactive-grid"
import { ShineBorder } from "@/components/ui/shine-border"
import { Play } from "lucide-react"
import Image from "next/image"
import { AnimatedText } from "@/components/animated-text"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const router = useRouter()

  const navigateToCreate = () => {
    router.push("/create")
  }

  return (
    <section className="relative min-h-screen pt-32 pb-16 overflow-hidden bg-white">
      <InteractiveGrid containerClassName="absolute inset-0" className="opacity-30" points={40} />

      <ShineBorder className="relative z-10 max-w-6xl mx-auto px-6" borderClassName="rounded-xl overflow-hidden">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-gray-900">
            Bring Your{" "}
            <span className="relative">
              <span className="animate-pulse-glow bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-600">
                <AnimatedText words={["Brand", "Ads", "Conference"]} typingSpeed={120} deletingSpeed={80} />
              </span>
              <span className="absolute -inset-1 bg-pink-400/20 blur-lg rounded-lg animate-pulse-slow"></span>
            </span>{" "}
            to Life
            <br />
            with AI personas
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Transform static advertisements into engaging, conversational experiences. Upload your content and let our
            AI-driven avatars tell your story.
          </p>
          <div className="flex gap-4 justify-center relative z-50">
            <Button 
              variant="outline" 
              className="gap-2 border-pink-200 hover:bg-pink-50 text-pink-600 !rounded-xl"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </Button>
            <a 
              href="/create"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap !rounded-xl text-sm font-medium bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90 hover:scale-105 active:scale-95 transition-all cursor-pointer h-10 px-4 py-2"
            >
              Get Started
            </a>
          </div>
        </div>

        <ShineBorder className="relative mx-auto" borderClassName="rounded-xl overflow-hidden pink-glow">
          <div className="relative">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hero%20image.jpg-mE5vAT4d864MlVhdkcrk1Vn2WcNONq.jpeg"
              alt="Background Gradient"
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
            <div className="absolute inset-0 flex items-end justify-center pb-16">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl w-[90%] h-[70%] flex shadow-lg">
                <div className="flex-1 pr-2">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Browser-HZNDOssbyLixIa4lABR27yelWXveQ0.png"
                    alt="Browser Preview"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover rounded-lg"
                    priority
                  />
                </div>
                <div className="flex-1 pl-2">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Editor%20Window-sJ4sXlXpgDhv7gLvQylqH5VTb3L0rc.png"
                    alt="Code Editor"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover rounded-lg"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </ShineBorder>
      </ShineBorder>
    </section>
  )
}

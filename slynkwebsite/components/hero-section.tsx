"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShineBorder } from "@/components/ui/shine-border"
import { Mail, Sparkles, ArrowRight, MousePointer2 } from "lucide-react"
import Image from "next/image"
import { AnimatedText } from "@/components/animated-text"
import { toast } from "@/components/ui/use-toast"
import { AnimatedEmojiBackground } from "@/components/animated-emoji-background"
import { motion, AnimatePresence } from "framer-motion"

export function HeroSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Submit to our API endpoint
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit')
      }
      
      toast({
        title: "Success!",
        description: "You've been added to our waitlist. We'll notify you when we launch!",
        variant: "default",
      })
      
      setEmail("")
    } catch (error) {
      console.error("Error submitting to waitlist:", error)
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "There was an error adding you to the waitlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative min-h-screen pt-32 pb-16 overflow-hidden bg-gradient-to-b from-white to-pink-50/30">
      <AnimatedEmojiBackground />

      <ShineBorder className="relative z-10 max-w-6xl mx-auto px-6" borderClassName="rounded-2xl overflow-hidden">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-gray-900">
              Bring Your{" "}
              <span className="relative inline-block">
                <span className="animate-pulse-glow bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-600">
                  <AnimatedText words={["Brand", "Ads", "Conference"]} typingSpeed={120} deletingSpeed={80} />
                </span>
                <motion.span 
                  className="absolute -inset-1 bg-pink-400/20 blur-lg rounded-lg"
                  animate={{ 
                    opacity: [0.3, 0.7, 0.3],
                    scale: [0.95, 1.05, 0.95], 
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                ></motion.span>
              </span>{" "}
              to Life
              <br />
              with AI personas
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Transform static advertisements into engaging, conversational experiences. Upload your content and let our
            AI-driven avatars tell your story.
          </motion.p>
          
          {/* Animated Waitlist Form */}
          <motion.div 
            className="relative max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Attention-grabbing floating elements */}
            <motion.div
              className="absolute -top-8 -right-8 text-pink-500 hidden md:block pointer-events-none"
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <MousePointer2 className="h-6 w-6" />
              <motion.div 
                className="absolute h-12 w-12 border-2 border-dashed border-pink-300 rounded-full -inset-3"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <motion.div
              className="absolute -top-10 left-10 hidden md:block pointer-events-none"
              animate={{ 
                y: [0, -5, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <Sparkles className="h-6 w-6 text-purple-500" />
            </motion.div>
            
            {/* Animated gradient border - now with pointer-events-none */}
            <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 opacity-75 blur-sm animate-border-flow pointer-events-none"></div>
            
            {/* Spotlight effect on hover - also with pointer-events-none */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-pink-300/0 via-white/50 to-purple-300/0 rounded-2xl opacity-0 pointer-events-none"
              animate={isInputFocused ? { opacity: 0.5, x: ["-100%", "100%"] } : { opacity: 0 }}
              transition={isInputFocused ? { 
                x: { duration: 1.5, repeat: Infinity, ease: "linear" },
                opacity: { duration: 0.3 }
              } : { opacity: { duration: 0.3 } }}
            />
            
            {/* Waitlist Form */}
            <form onSubmit={handleWaitlistSubmit} className="relative flex flex-col sm:flex-row gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-1.5 shadow-xl">
              <div className="relative flex-grow">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-12 h-14 text-base rounded-xl border-none shadow-inner bg-gray-50/80 focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="h-14 px-8 text-base font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 rounded-xl transition-all shadow-md hover:shadow-pink-400/20 hover:shadow-lg flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <span>Join Waitlist</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </form>
            
            {/* Subtle pulse animation around the form - with pointer-events-none */}
            <motion.div 
              className="absolute -inset-4 rounded-3xl border border-pink-200/40 pointer-events-none"
              animate={{ 
                scale: [1, 1.01, 1],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
          </motion.div>
          
          {/* Original buttons (commented out) */}
          {/*
          <div className="flex gap-4 justify-center relative z-20">
            <Button
              variant="outline"
              className="gap-2 border-pink-200 hover:bg-pink-50 text-pink-600"
              onClick={() => window.open("#demo", "_self")}
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </Button>
            <Link href="/create" className="z-20">
              <Button className="bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
          */}
        </div>

        <ShineBorder className="relative mx-auto" borderClassName="rounded-2xl overflow-hidden pink-glow">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hero%20image.jpg-mE5vAT4d864MlVhdkcrk1Vn2WcNONq.jpeg"
              alt="Background Gradient"
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
            <div className="absolute inset-0 flex items-end justify-center pb-16">
              <motion.div 
                className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl w-[90%] h-[70%] flex shadow-xl"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.div 
                  className="flex-1 pr-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Browser-HZNDOssbyLixIa4lABR27yelWXveQ0.png"
                    alt="Browser Preview"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover rounded-xl shadow-md"
                    priority
                  />
                </motion.div>
                <motion.div 
                  className="flex-1 pl-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Editor%20Window-sJ4sXlXpgDhv7gLvQylqH5VTb3L0rc.png"
                    alt="Code Editor"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover rounded-xl shadow-md"
                    priority
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </ShineBorder>
      </ShineBorder>
    </section>
  )
}

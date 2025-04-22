"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ShineBorder } from "@/components/ui/shine-border"
import { Mail, Phone, MapPin } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"

export function ContactSection() {
  const [isVisible, setIsVisible] = useState(false)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  useEffect(() => {
    if (inView) {
      setIsVisible(true)
    }
  }, [inView])

  return (
    <section id="contact" className="py-16 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto" ref={ref}>
        <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-600">
          Get In Touch
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <ShineBorder
            className={`p-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
            borderClassName="border border-pink-100 rounded-xl overflow-hidden"
          >
            <div className="teal-gradient absolute inset-0 rounded-xl"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-pink-500" />
                  <span className="text-gray-700">slynkinfo@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-pink-500" />
                  <span className="text-gray-700">123 Innovation Drive, San Francisco, CA</span>
                </div>
              </div>
            </div>
          </ShineBorder>

          <ShineBorder
            className={`p-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
            borderClassName="border border-pink-100 rounded-xl overflow-hidden"
          >
            <div className="amber-gradient absolute inset-0 rounded-xl"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Send us a message</h3>
              <form className="space-y-4">
                <div>
                  <Input placeholder="Your name" className="border-pink-100 focus:border-pink-300 bg-white/80" />
                </div>
                <div>
                  <Input
                    placeholder="Your email"
                    type="email"
                    className="border-pink-100 focus:border-pink-300 bg-white/80"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your message"
                    className="border-pink-100 focus:border-pink-300 bg-white/80"
                    rows={4}
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90">
                  Send Message
                </Button>
              </form>
            </div>
          </ShineBorder>
        </div>
      </div>
    </section>
  )
}

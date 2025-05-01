"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ShineBorder } from "@/components/ui/shine-border"
import { Mail, Phone, MapPin } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"
import { saveToSheet } from "./save-to-sheet";

export function ContactSection() {
  const [isVisible, setIsVisible] = useState(false)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (inView) {
      setIsVisible(true)
    }
  }, [inView])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
  
    try {
      const result = await saveToSheet(formData);
  
      if (result.success) {
        setSuccessMessage("Your message has been sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSuccessMessage("Failed to send your message. Please try again.");
      }
    } catch (error) {
      setSuccessMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <span className="text-gray-700">infoslynk@gmail.com</span>
                </div>
                {/*
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-pink-500" />
                  <span className="text-gray-700">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-pink-500" />
                  <span className="text-gray-700">123 Innovation Drive, San Francisco, CA</span>
                </div>
                */}
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
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Input
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="border-pink-100 focus:border-pink-300 bg-white/80"
                    required
                  />
                </div>
                <div>
                  <Input
                    name="email"
                    placeholder="Your email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="border-pink-100 focus:border-pink-300 bg-white/80"
                    required
                  />
                </div>
                <div>
                  <Textarea
                    name="message"
                    placeholder="Your message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="border-pink-100 focus:border-pink-300 bg-white/80"
                    rows={4}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
                {successMessage && <p className="text-center text-sm mt-4">{successMessage}</p>}
              </form>
            </div>
          </ShineBorder>
        </div>
      </div>
    </section>
  )
}
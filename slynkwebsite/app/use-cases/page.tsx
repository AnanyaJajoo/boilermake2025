"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ShineCard } from '@/components/ui/shine-border'
import { CheckCircle, ArrowRight, Monitor, Building, PenSquare, VideoIcon, MessageSquare, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default function UseCasesPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-pink-50/30 pt-32 pb-20 px-6">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute w-[500px] h-[500px] rounded-full bg-pink-400/10 blur-[100px]"
          style={{ top: '10%', left: '5%' }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full bg-purple-400/10 blur-[100px]"
          style={{ bottom: '5%', right: '5%' }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-gray-900">
            How Slynk{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
              Transforms
            </span>{" "}
            Your Marketing
          </h1>
          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            Discover how AI-powered interactive personas can revolutionize your customer engagement 
            across multiple channels and use cases.
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            },
            hidden: {}
          }}
        >
          {useCases.map((useCase, index) => (
            <UseCaseCard key={index} {...useCase} index={index} />
          ))}
        </motion.div>

        {/* CTA Section */}
        <ShineCard className="mt-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-4">
            <div className="max-w-lg">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your marketing?</h2>
              <p className="text-gray-600 mb-6">
                Start creating engaging AI personas today and see how Slynk can elevate your customer interactions.
              </p>
              <div className="flex gap-4">
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl">
                    Create Your First Ad
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/customers">
                  <Button variant="outline" className="border-gray-200 rounded-xl">
                    See Customer Success Stories
                  </Button>
                </Link>
              </div>
            </div>
            <motion.div 
              className="relative w-64 h-64 md:w-80 md:h-80"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400/30 to-purple-500/30 rounded-full blur-xl animate-pulse-slow" />
              <div className="absolute inset-2 bg-white rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hero%20image.jpg-mE5vAT4d864MlVhdkcrk1Vn2WcNONq.jpeg"
                  alt="Marketing Transformation"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </ShineCard>
      </div>
    </div>
  )
}

// Use Case Card Component
function UseCaseCard({ title, description, icon: Icon, benefits, index }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25,
            delay: index * 0.1
          }
        }
      }}
    >
      <ShineCard>
        <div className="p-6">
          <div className="bg-pink-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4 text-pink-500">
            <Icon size={28} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
          <p className="text-gray-600 mb-6">{description}</p>
          <div className="space-y-2">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </ShineCard>
    </motion.div>
  )
}

// Use cases data
const useCases = [
  {
    title: "Digital Advertising",
    description: "Transform static ads into interactive AI-driven experiences that engage customers directly.",
    icon: Monitor,
    benefits: [
      "Higher conversion rates than traditional ads",
      "Measurable engagement metrics",
      "Personalized experiences based on customer input"
    ]
  },
  {
    title: "Corporate Training",
    description: "Create interactive AI trainers for onboarding new employees and ongoing skill development.",
    icon: Building,
    benefits: [
      "Available 24/7 for self-paced learning",
      "Consistent training delivery across teams",
      "Interactive Q&A capability to address questions"
    ]
  },
  {
    title: "Content Marketing",
    description: "Bring your blog content and guides to life with conversational AI that helps users.",
    icon: PenSquare,
    benefits: [
      "Increased time spent on content",
      "Better information retention through interaction",
      "Personalized content recommendations"
    ]
  },
  {
    title: "Product Demos",
    description: "Let AI personas showcase your products with interactive features rather than static videos.",
    icon: VideoIcon,
    benefits: [
      "Allows prospects to ask questions about features",
      "Guides users through product capabilities",
      "Reduces sales team workload for initial demos"
    ]
  },
  {
    title: "Customer Support",
    description: "Deploy AI personas trained on your FAQs and support documentation to handle common questions.",
    icon: MessageSquare,
    benefits: [
      "24/7 availability for customer inquiries",
      "Reduced support ticket volume",
      "Consistent customer experience"
    ]
  },
  {
    title: "Event Marketing",
    description: "Create interactive AI hosts and assistants for virtual events, conferences and webinars.",
    icon: Users,
    benefits: [
      "Engaging virtual event experiences",
      "Personalized event navigation for attendees",
      "Post-event followup and engagement"
    ]
  }
] 
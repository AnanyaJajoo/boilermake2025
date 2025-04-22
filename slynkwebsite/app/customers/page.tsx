"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { FloatingNavbar } from "@/components/floating-navbar"
import { Footer } from "@/components/footer"
import { ArrowRight, Upload, Brain, Smartphone, Users } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { CustomersBackground } from "@/components/customers-background"
import { SignInPopup } from "@/components/sign-in-popup"
import { PersistentSignInButton } from "@/components/persistent-sign-in-button"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"
import { ScrollingInfographic } from "@/components/scrolling-infographic"
import { AnimatedStats } from "@/components/animated-stats"
import Link from "next/link"

export default function CustomersPage() {
  const [showNavbar, setShowNavbar] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)

  useEffect(() => {
    // Show navbar immediately on this page
    setShowNavbar(true)

    // Scroll to top when page loads
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <AnimatedGradientBackground />
      <CustomersBackground />
      {showNavbar && <FloatingNavbar alwaysShow />}

      {/* Hero Section */}
      <HeroSection />

      {/* Process Section */}
      <ProcessSection />

      {/* Scrolling Infographic */}
      <ScrollingInfographic />
      <AnimatedStats />

      {/* Case Studies */}
      {/*<CaseStudiesSection />*/}

      {/* Testimonials */}
      {/*<TestimonialsSection />*/}

      <Footer />
      <PersistentSignInButton onSignInClick={() => setIsSignInOpen(true)} />
      <SignInPopup isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </main>
  )
}

function HeroSection() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 0.3], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 to-white py-24 pt-32">
      <motion.div className="absolute inset-0 z-0" style={{ y, opacity }}>
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-pink-200/20 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />
      </motion.div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Transform Your <span className="text-pink-500">Customer Experience</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600">
            See how businesses are using slynk to create meaningful connections with their audience through AI-powered
            virtual spokespersons.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/create">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 px-6 py-3 font-medium text-white shadow-md transition-all hover:shadow-lg"
              >
                Get Started
                <ArrowRight size={16} />
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function ProcessSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const steps = [
    {
      title: "Data Collection",
      description:
        "Upload your content, brand guidelines, and reference materials to create the foundation for your AI persona.",
      icon: Upload,
      color: "text-blue-500",
      gradient: "from-blue-400/20 to-blue-600/20",
    },
    {
      title: "Context Analysis",
      description: "Our AI analyzes your data to understand your brand voice, messaging, and target audience.",
      icon: Brain,
      color: "text-purple-500",
      gradient: "from-purple-400/20 to-purple-600/20",
    },
    {
      title: "Persona Generation",
      description: "We create interactive AI personas that embody your brand and can engage in natural conversations.",
      icon: Users,
      color: "text-pink-500",
      gradient: "from-pink-400/20 to-pink-600/20",
    },
    {
      title: "Mobile Integration",
      description:
        "Access your AI personas through our mobile app, making them available whenever and wherever you need them.",
      icon: Smartphone,
      color: "text-teal-500",
      gradient: "from-teal-400/20 to-teal-600/20",
    },
  ]

  return (
    <section ref={ref} className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-gray-600"
          >
            Our streamlined process takes your content and transforms it into interactive AI personas that engage your
            audience.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 md:hidden" />

          <div className="relative z-10 space-y-8 md:space-y-0">
            {steps.map((step, index) => (
              <ProcessStep
                key={step.title}
                step={step}
                index={index}
                inView={inView}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProcessStep({ step, index, inView, isLast }: {
  step: any;
  index: number;
  inView: boolean;
  isLast: boolean;
}) {
  const isEven = index % 2 === 0
  const delay = 0.2 + index * 0.2

  return (
    <div className="md:flex md:items-center">
      <motion.div
        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay }}
        className={`md:w-1/2 ${isEven ? "md:pr-12 md:text-right" : "md:order-1 md:pl-12"}`}
      >
        <h3 className="mb-2 flex items-center text-xl font-bold text-gray-900 md:block">
          {!isEven && <div className="mr-3 md:hidden">{index + 1}.</div>}
          {step.title}
          {isEven && <div className="ml-3 md:hidden">{index + 1}.</div>}
        </h3>
        <p className="text-gray-600">{step.description}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, delay: delay + 0.1 }}
        className={`relative flex items-center justify-center md:w-1/2 ${
          isEven ? "md:justify-start" : "md:justify-end"
        }`}
      >
        <div className="my-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg md:my-0">
          <div className={`rounded-full bg-gradient-to-br ${step.gradient} p-5`}>
            <step.icon className={`h-10 w-10 ${step.color}`} />
          </div>
        </div>

        {!isLast && (
          <motion.div
            initial={{ height: 0 }}
            animate={inView ? { height: "100%" } : {}}
            transition={{ duration: 1, delay: delay + 0.3 }}
            className="absolute bottom-0 left-1/2 hidden h-full w-1 -translate-x-1/2 bg-gradient-to-b from-transparent via-gray-200 to-gray-200 md:block"
          />
        )}
      </motion.div>
    </div>
  )
}
{/*
function CaseStudiesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const caseStudies = [
    {
      company: "TechCorp",
      title: "Increasing Engagement by 300%",
      description:
        "TechCorp used slynk to create an interactive product specialist that helped customers find the right solutions.",
      stats: [
        { label: "Engagement", value: "+300%" },
        { label: "Conversion", value: "+45%" },
        { label: "Support Tickets", value: "-60%" },
      ],
      gradient: "from-blue-400 to-blue-600",
    },
  ]

  return (
    <section ref={ref} className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            Success Stories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-gray-600"
          >
            See how businesses across industries are using Voxen to transform their customer interactions.
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.company}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
              className="overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg"
            >
              <div className={`bg-gradient-to-r ${study.gradient} p-6 text-white`}>
                <h3 className="mb-1 text-lg font-medium">{study.company}</h3>
                <h4 className="text-xl font-bold">{study.title}</h4>
              </div>
              <div className="p-6">
                <p className="mb-6 text-gray-600">{study.description}</p>
                <div className="grid grid-cols-3 gap-4">
                  {study.stats?.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p
                        className={`text-xl font-bold bg-gradient-to-r ${study.gradient} bg-clip-text text-transparent`}
                      >
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
  */}
{/*
function TestimonialsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const testimonials = [
    {
      quote:
        "Voxen has completely transformed how we interact with our customers. Our AI persona has become the face of our brand online.",
      author: "Sarah Johnson",
      role: "CMO, TechCorp",
      image: "/placeholder.svg?height=64&width=64",
    },
    {
      quote:
        "The level of engagement we've seen since implementing Voxen is incredible. Our customers love the personalized experience.",
      author: "Michael Chen",
      role: "Digital Director, Fashion Forward",
      image: "/placeholder.svg?height=64&width=64",
    },
    {
      quote:
        "Our students now have access to help 24/7. The AI personas are so natural that many don't realize they're not talking to a human.",
      author: "Dr. Lisa Patel",
      role: "CEO, EduLearn",
      image: "/placeholder.svg?height=64&width=64",
    },
  ]

  return (
    <section ref={ref} className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            What Our Customers Say
          </motion.h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
              className="rounded-xl bg-white p-6 shadow-md"
            >
              <div className="mb-4 text-pink-500">
                <svg width="45" height="36" className="fill-current">
                  <path d="M13.415.001C6.07 5.185.887 13.681.887 23.041c0 7.632 4.608 12.096 9.936 12.096 5.04 0 8.784-4.032 8.784-8.784 0-4.752-3.312-8.208-7.632-8.208-.864 0-2.016.144-2.304.288.72-4.896 5.328-10.656 9.936-13.536L13.415.001zm24.768 0c-7.2 5.184-12.384 13.68-12.384 23.04 0 7.632 4.608 12.096 9.936 12.096 4.896 0 8.784-4.032 8.784-8.784 0-4.752-3.456-8.208-7.776-8.208-.864 0-1.872.144-2.16.288.72-4.896 5.184-10.656 9.792-13.536L38.183.001z"></path>
                </svg>
              </div>
              <p className="mb-6 text-gray-600">{testimonial.quote}</p>
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.author}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
*/}

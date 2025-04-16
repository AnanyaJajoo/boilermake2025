"use client"

import { Upload, Users, Eye, BarChart2, ArrowRight } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AnimatedIcon } from "@/components/animated-icon"

export function FeaturesSection() {
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

  const features = [
    {
      title: "Seamless Media Integration",
      description: "Upload once, deploy everywhere. Our platform handles all the technical complexities.",
      icon: Upload,
      color: "text-blue-500",
      gradient: "from-blue-500/20 to-blue-500/5",
      align: "left",
    },
    {
      title: "AI-Generated Personas",
      description:
        "Our advanced AI creates realistic, emotionally intelligent virtual spokespersons tailored to your brand voice.",
      icon: Users,
      color: "text-purple-500",
      gradient: "from-purple-500/20 to-purple-500/5",
      align: "right",
    },
    {
      title: "Interactive Experiences",
      description: "Transform passive content into dynamic conversations that adapt to user behavior in real-time.",
      icon: Eye,
      color: "text-teal-500",
      gradient: "from-teal-500/20 to-teal-500/5",
      align: "left",
    },
    {
      title: "Engagement Analytics",
      description:
        "Gain deep insights into how users interact with your virtual personas to continuously optimize performance.",
      icon: BarChart2,
      color: "text-amber-500",
      gradient: "from-amber-500/20 to-amber-500/5",
      align: "right",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <section id="paradigm" className="py-16 px-6 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />

      <div className="max-w-4xl mx-auto relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-600">
            A new paradigm for digital interaction
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Move beyond static content with AI-powered personas that create meaningful connections with your audience.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={`relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300 group`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
              />

              <div
                className={`relative z-10 p-5 flex ${feature.align === "left" ? "flex-row" : "flex-row-reverse"} items-start gap-4`}
              >
                <div className="flex-shrink-0">
                  <AnimatedIcon icon={feature.icon} color={feature.color} size={28} />
                </div>

                <div className={`flex-grow ${feature.align === "left" ? "text-left" : "text-right"}`}>
                  <h3 className="text-lg font-semibold mb-1.5 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{feature.description}</p>

                  <motion.div
                    className={`flex items-center gap-1.5 text-xs font-medium ${feature.color} ${feature.align === "left" ? "" : "justify-end"}`}
                    whileHover={{ x: feature.align === "left" ? 5 : -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {feature.align === "right" && <ArrowRight size={14} />}
                    <span>Learn more</span>
                    {feature.align === "left" && <ArrowRight size={14} />}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

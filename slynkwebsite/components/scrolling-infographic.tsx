"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { InfoWidget } from "@/components/info-widget"
import { Users, TrendingUp, Clock, Award } from "lucide-react"

export function ScrollingInfographic() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100])

  const stats = [
    {
      title: "Active Users",
      value: "10k+",
      description: "Growing user base across industries",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-500",
    },
    {
      title: "Engagement Rate",
      value: "+45%",
      description: "Higher than traditional advertising",
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      color: "bg-green-500",
    },
    {
      title: "Time Saved",
      value: "12hrs",
      description: "Average weekly time saved per team",
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      color: "bg-amber-500",
    },
    {
      title: "Customer Satisfaction",
      value: "96%",
      description: "Positive feedback from users",
      icon: <Award className="h-5 w-5 text-pink-500" />,
      color: "bg-pink-500",
    },
  ]

  return (
    <div ref={containerRef} className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white" />

      <motion.div className="container mx-auto px-4 relative z-10" style={{ opacity, y }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-600">
            The Impact of AI Personas
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our AI-driven virtual spokespersons are transforming how businesses connect with their audience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <InfoWidget
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              color={stat.color}
              index={index}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

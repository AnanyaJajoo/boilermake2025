"use client"

import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Lightbulb, Heart, Users } from "lucide-react"
import { AnimatedIcon } from "@/components/animated-icon"

export function ValuesSection() {
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

  const values = [
    {
      title: "Innovation",
      description: "Continuously pushing the boundaries of what's possible in digital advertising.",
      icon: Lightbulb,
      color: "text-pink-500",
      gradient: "from-pink-500/20 to-pink-500/5",
    },
    {
      title: "Authenticity",
      description: "Ensuring that every virtual spokesperson genuinely represents the brand's voice and message.",
      icon: Heart,
      color: "text-purple-500",
      gradient: "from-purple-500/20 to-purple-500/5",
    },
    {
      title: "User-Centric Design",
      description: "Creating intuitive tools that empower businesses to craft compelling narratives effortlessly.",
      icon: Users,
      color: "text-teal-500",
      gradient: "from-teal-500/20 to-teal-500/5",
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
    <section id="values" className="py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />

      <div className="max-w-4xl mx-auto relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-600">
            Our Values
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-6"
        >
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              variants={itemVariants}
              className="relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300 group"
              whileHover={{ y: -5 }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
              />

              <div className="relative z-10 p-5">
                <div className="mb-4 flex justify-center">
                  <AnimatedIcon icon={value.icon} color={value.color} size={32} />
                </div>

                <h3 className="text-lg font-semibold mb-2 text-center">{value.title}</h3>

                <div className="h-0.5 w-10 mx-auto mb-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-400" />

                <p className="text-gray-600 text-center text-sm">{value.description}</p>
              </div>

              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-pink-400 transform scale-x-0 origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

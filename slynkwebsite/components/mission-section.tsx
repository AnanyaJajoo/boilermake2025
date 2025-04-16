"use client"

import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Target, ArrowRight } from "lucide-react"
import { AnimatedIcon } from "@/components/animated-icon"

export function MissionSection() {
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

  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2,
        ease: "easeInOut",
      },
    },
  }

  return (
    <section id="mission" className="py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />

      <div className="max-w-4xl mx-auto relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-600">
            Our Mission
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative rounded-xl overflow-hidden bg-white shadow-md"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 opacity-50" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="md:w-1/4 flex justify-center">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isVisible ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                  className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center"
                >
                  <AnimatedIcon icon={Target} color="text-blue-500" size={36} />
                </motion.div>

                <motion.svg
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="55"
                    stroke="rgba(59, 130, 246, 0.2)"
                    strokeWidth="2"
                    strokeDasharray="345.6"
                    variants={pathVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                  />
                </motion.svg>
              </div>
            </div>

            <div className="md:w-3/4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-gray-700 text-lg leading-relaxed"
              >
                To revolutionize digital advertising by transforming traditional ads into interactive experiences that
                foster genuine connections between brands and consumers. We're building a future where every digital
                interaction is meaningful, personalized, and memorable.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-4"
              >
                <motion.a
                  href="#"
                  className="inline-flex items-center gap-2 text-blue-500 font-medium text-sm"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <span>Learn about our approach</span>
                  <ArrowRight size={14} />
                </motion.a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

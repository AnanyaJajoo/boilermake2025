"use client"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, ArrowRight } from "lucide-react"
import { AnimatedIcon } from "@/components/animated-icon"

export function StorySection() {
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

  const timelineItems = [
    {
      year: "2020",
      title: "The Beginning",
      description: "Founded by a team passionate about storytelling and technology.",
    },
    { year: "2021", title: "First Prototype", description: "Developed our first AI-driven virtual spokesperson." },
    { year: "2022", title: "Market Launch", description: "Released our platform to select partners." },
    { year: "2023", title: "Global Expansion", description: "Expanded our services worldwide." },
  ]

  return (
    <section id="story" className="py-16 px-6 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />

      <div className="max-w-4xl mx-auto relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-600">
            Our Story
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative rounded-xl overflow-hidden bg-white shadow-md"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-500/5 opacity-50" />

          <div className="relative z-10 flex flex-col md:flex-row items-start gap-6 p-6">
            <div className="md:w-1/3">
              <div className="sticky top-24">
                <div className="flex justify-center mb-4">
                  <AnimatedIcon icon={BookOpen} color="text-purple-500" size={36} />
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-gray-700 mb-4 text-sm"
                >
                  We recognized the limitations of static advertisements in capturing audience attention and developed a
                  platform that combines AI and media to create virtual spokespersons that truly represent your brand.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <motion.a
                    href="#"
                    className="inline-flex items-center gap-2 text-purple-500 font-medium text-sm"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span>Read our full story</span>
                    <ArrowRight size={14} />
                  </motion.a>
                </motion.div>
              </div>
            </div>

            <div className="md:w-2/3">
              <div className="relative pl-6 border-l border-purple-200">
                {timelineItems.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                    className="mb-8 last:mb-0 relative"
                  >
                    <div className="absolute -left-[31px] w-6 h-6 rounded-full bg-purple-100 border-4 border-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-purple-500 font-bold mb-1 text-sm">{item.year}</div>
                      <h3 className="text-base font-semibold mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

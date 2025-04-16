"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

interface ParallaxBackgroundProps {
  className?: string
}

export function ParallaxBackground({ className = "" }: ParallaxBackgroundProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const shapes = [
    {
      type: "circle",
      color: "bg-pink-500/10",
      size: "w-64 h-64",
      left: "10%",
      top: "15%",
      speed: 0.2,
    },
    {
      type: "square",
      color: "bg-blue-500/10",
      size: "w-48 h-48",
      left: "70%",
      top: "25%",
      speed: -0.1,
      rotation: 45,
    },
    {
      type: "triangle",
      color: "border-l-transparent border-r-transparent border-b-purple-500/10",
      size: "w-0 h-0 border-l-[50px] border-r-[50px] border-b-[86px]",
      left: "20%",
      top: "60%",
      speed: 0.15,
    },
    {
      type: "donut",
      color: "border-teal-500/10",
      size: "w-40 h-40",
      left: "75%",
      top: "70%",
      speed: -0.25,
      borderWidth: "border-[15px]",
    },
    {
      type: "plus",
      color: "bg-amber-500/10",
      size: "w-32 h-32",
      left: "15%",
      top: "85%",
      speed: 0.3,
    },
  ]

  const yValues = shapes.map((shape) => useTransform(scrollYProgress, [0, 1], [0, shape.speed * 1000]))
  const springYValues = yValues.map((y) => useSpring(y, { stiffness: 100, damping: 30 }))

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapes.map((shape, index) => {
        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              left: shape.left,
              top: shape.top,
              y: springYValues[index],
              rotate: shape.rotation || 0,
            }}
          >
            {shape.type === "circle" && (
              <div className={`rounded-full ${shape.color} ${shape.size} backdrop-blur-3xl`} />
            )}
            {shape.type === "square" && <div className={`rounded-lg ${shape.color} ${shape.size} backdrop-blur-3xl`} />}
            {shape.type === "triangle" && <div className={`${shape.color} ${shape.size} backdrop-blur-3xl`} />}
            {shape.type === "donut" && (
              <div className={`rounded-full ${shape.color} ${shape.size} ${shape.borderWidth} backdrop-blur-3xl`} />
            )}
            {shape.type === "plus" && (
              <div className="relative">
                <div
                  className={`absolute left-1/2 -translate-x-1/2 h-full w-8 ${shape.color} rounded-md backdrop-blur-3xl`}
                />
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-full h-8 ${shape.color} rounded-md backdrop-blur-3xl`}
                />
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

"use client"

import { useRef, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export function CustomersBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

  // Transform values based on scroll
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -80])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 30])
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -20])
  const scale1 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 0.9])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3])

  // Create animated gradient background
  useEffect(() => {
    if (!containerRef.current) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const container = containerRef.current
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight

    container.appendChild(canvas)
    canvas.style.position = "absolute"
    canvas.style.top = "0"
    canvas.style.left = "0"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.opacity = "0.1"
    canvas.style.pointerEvents = "none"

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#f9a8d4")
    gradient.addColorStop(0.5, "#93c5fd")
    gradient.addColorStop(1, "#c4b5fd")

    let animationFrame: number
    let angle = 0

    const animate = () => {
      angle += 0.002
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw flowing lines
      ctx.strokeStyle = gradient
      ctx.lineWidth = 1

      for (let i = 0; i < 10; i++) {
        ctx.beginPath()
        for (let x = 0; x < canvas.width; x += 20) {
          const y = Math.sin(x * 0.01 + angle + i * 0.5) * 50 + (i * canvas.height) / 10
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
      if (container.contains(canvas)) {
        container.removeChild(canvas)
      }
    }
  }, [])

  // Floating elements
  const elements = [
    {
      type: "circle",
      className: "bg-gradient-to-br from-pink-200/20 to-pink-300/20 blur-2xl",
      style: {
        width: "20rem",
        height: "20rem",
        left: "5%",
        top: "20%",
        y: y1,
        scale: scale1,
        opacity,
      },
    },
    {
      type: "circle",
      className: "bg-gradient-to-br from-blue-200/20 to-blue-300/20 blur-2xl",
      style: {
        width: "25rem",
        height: "25rem",
        right: "10%",
        top: "15%",
        y: y2,
        scale: scale1,
        opacity,
      },
    },
    {
      type: "square",
      className: "bg-gradient-to-br from-purple-200/20 to-purple-300/20 blur-2xl rounded-3xl",
      style: {
        width: "18rem",
        height: "18rem",
        left: "15%",
        top: "60%",
        y: y3,
        rotate: rotate1,
        opacity,
      },
    },
    {
      type: "square",
      className: "bg-gradient-to-br from-teal-200/20 to-teal-300/20 blur-2xl rounded-3xl",
      style: {
        width: "15rem",
        height: "15rem",
        right: "20%",
        top: "70%",
        y: y2,
        rotate: rotate2,
        opacity,
      },
    },
  ]

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute ${element.className}`}
          style={element.style}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: index * 0.2 }}
        />
      ))}

      {/* Grid pattern */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] opacity-20"
        style={{ backgroundSize: "24px 24px" }}
      />
    </div>
  )
}

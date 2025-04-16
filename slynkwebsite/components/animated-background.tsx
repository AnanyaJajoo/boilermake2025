"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

export function AnimatedBackground() {
  const { scrollYProgress } = useScroll()
  const containerRef = useRef<HTMLDivElement>(null)

  // Transform values based on scroll
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300])
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -150])
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 45])
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -45])
  const scale1 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 0.8])
  const scale2 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 1.2])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [0.8, 0.2])

  // Spring physics for smoother animations
  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 })
  const springY2 = useSpring(y2, { stiffness: 80, damping: 30 })
  const springY3 = useSpring(y3, { stiffness: 60, damping: 30 })
  const springY4 = useSpring(y4, { stiffness: 90, damping: 30 })
  const springRotate1 = useSpring(rotate1, { stiffness: 50, damping: 30 })
  const springRotate2 = useSpring(rotate2, { stiffness: 70, damping: 30 })
  const springScale1 = useSpring(scale1, { stiffness: 100, damping: 30 })
  const springScale2 = useSpring(scale2, { stiffness: 100, damping: 30 })

  // Elements to render
  const elements = [
    {
      type: "circle",
      className: "bg-pink-200/30 blur-3xl",
      style: {
        width: "30rem",
        height: "30rem",
        left: "10%",
        top: "15%",
        y: springY1,
        scale: springScale1,
        opacity,
      },
    },
    {
      type: "circle",
      className: "bg-blue-200/20 blur-3xl",
      style: {
        width: "25rem",
        height: "25rem",
        right: "5%",
        top: "30%",
        y: springY2,
        scale: springScale2,
        opacity,
      },
    },
    {
      type: "square",
      className: "bg-purple-200/20 blur-2xl",
      style: {
        width: "20rem",
        height: "20rem",
        left: "20%",
        top: "60%",
        y: springY3,
        rotate: springRotate1,
        opacity,
      },
    },
    {
      type: "square",
      className: "bg-teal-200/20 blur-2xl",
      style: {
        width: "15rem",
        height: "15rem",
        right: "15%",
        top: "70%",
        y: springY4,
        rotate: springRotate2,
        opacity,
      },
    },
    {
      type: "triangle",
      className: "border-transparent border-b-purple-200/20 blur-xl",
      style: {
        borderWidth: "0 100px 173.2px 100px",
        left: "60%",
        top: "40%",
        y: springY2,
        rotate: springRotate1,
        opacity,
      },
    },
    {
      type: "donut",
      className: "border-pink-200/20 rounded-full blur-xl",
      style: {
        width: "18rem",
        height: "18rem",
        borderWidth: "2rem",
        left: "30%",
        top: "20%",
        y: springY3,
        rotate: springRotate2,
        opacity,
      },
    },
  ]

  // Create animated particles
  const [particles, setParticles] = useState([])
  
  useEffect(() => {
    if (!containerRef.current) return
    
    const { width, height } = containerRef.current.getBoundingClientRect()
    const newParticles = Array.from({ length: 20 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1,
      color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
    }))
    
    setParticles(newParticles)
    
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => {
        const newX = particle.x + particle.speedX
        const newY = particle.y + particle.speedY
        
        // Bounce off edges
        if (newX < 0 || newX > width) particle.speedX *= -1
        if (newY < 0 || newY > height) particle.speedY *= -1
        
        return {
          ...particle,
          x: newX < 0 ? 0 : newX > width ? width : newX,
          y: newY < 0 ? 0 : newY > height ? height : newY,
        }
      }))
      
      animationRef.current = requestAnimationFrame(animateParticles)
    }
    
    const animationRef = { current: requestAnimationFrame(animateParticles) }
    
    return () => cancelAnimationFrame(animationRef.current)
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute ${element.className}`}
          style={element.style}
          

      
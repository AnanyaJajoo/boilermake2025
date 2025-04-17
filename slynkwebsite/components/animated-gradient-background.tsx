"use client"

import { useEffect, useRef } from "react"

export function AnimatedGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const { innerWidth: width, innerHeight: height } = window
      const dpr = window.devicePixelRatio || 1

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)

      return { width, height }
    }

    const { width, height } = resizeCanvas()

    // Create gradient points
    const gradientPoints = [
      { x: width * 0.2, y: height * 0.3, color: "rgba(255, 107, 157, 0.15)", radius: 300 },
      { x: width * 0.8, y: height * 0.7, color: "rgba(111, 134, 245, 0.15)", radius: 250 },
      { x: width * 0.5, y: height * 0.5, color: "rgba(255, 204, 112, 0.1)", radius: 350 },
    ]

    // Animation variables
    let animationFrameId: number
    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw each gradient point
      gradientPoints.forEach((point) => {
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius)

        gradient.addColorStop(0, point.color)
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        ctx.fill()

        // Animate position
        point.x += Math.sin(Date.now() * 0.0005) * 0.5
        point.y += Math.cos(Date.now() * 0.0005) * 0.5
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      const { width, height } = resizeCanvas()

      // Update gradient points positions
      gradientPoints[0].x = width * 0.2
      gradientPoints[0].y = height * 0.3
      gradientPoints[1].x = width * 0.8
      gradientPoints[1].y = height * 0.7
      gradientPoints[2].x = width * 0.5
      gradientPoints[2].y = height * 0.5
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-70" />
}

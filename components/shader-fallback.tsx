"use client"

import { useEffect, useRef } from "react"

export function ShaderFallback() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Normalized mouse position (0-1)
  const mouseX = useRef(0.5)
  const mouseY = useRef(0.5)
  
  // Smoothed position for animation
  const currentX = useRef(0.5)
  const currentY = useRef(0.5)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to 0-1 range
      mouseX.current = e.clientX / window.innerWidth
      mouseY.current = e.clientY / window.innerHeight
    }

    window.addEventListener("mousemove", handleMouseMove)

    const animate = () => {
      // Smooth interpolation (0.05 factor for slower, smoother movement)
      currentX.current += (mouseX.current - currentX.current) * 0.05
      currentY.current += (mouseY.current - currentY.current) * 0.05

      if (containerRef.current) {
        const revealLayer = containerRef.current.querySelector(".reveal-layer") as HTMLDivElement
        if (revealLayer) {
          const x = currentX.current * 100
          const y = currentY.current * 100

          // Create radial gradient mask that follows cursor
          // Transparent at cursor position, black (visible) around it
          revealLayer.style.maskImage = `radial-gradient(circle at ${x}% ${y}%, transparent 0%, transparent 5%, black 15%)`
          revealLayer.style.webkitMaskImage = `radial-gradient(circle at ${x}% ${y}%, transparent 0%, transparent 5%, black 15%)`
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-[60]" style={{ mixBlendMode: "screen" }}>
      {/* Base layer - revealed at cursor position */}
      <div className="absolute inset-0 bg-slate-600" />

      {/* Masked layer - hidden at cursor position */}
      <div
        className="reveal-layer absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
          maskImage: "radial-gradient(circle at 50% 50%, transparent 0%, transparent 5%, black 15%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent 0%, transparent 5%, black 15%)",
        }}
      />

      {/* Accent slash */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: "linear-gradient(135deg, transparent 0%, transparent 45%, #8B0000 48%, #DC143C 50%, #8B0000 52%, transparent 55%, transparent 100%)",
        }}
      />

      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  )
}

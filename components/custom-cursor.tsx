"use client"

import { useEffect, useRef } from "react"

export function CustomCursor() {
  // References to the two cursor elements
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  
  // Current rendered position (smoothed)
  const positionRef = useRef({ x: 0, y: 0 })
  // Target position (actual mouse location)
  const targetPositionRef = useRef({ x: 0, y: 0 })
  // Whether hovering an interactive element
  const isPointerRef = useRef(false)

  useEffect(() => {
    let animationFrameId: number

    // Linear interpolation for smooth movement
    // factor controls the "lag" - lower = smoother/slower
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor
    }

    // Animation loop - runs every frame
    const updateCursor = () => {
      // Smoothly interpolate toward target position
      // 0.15 factor creates a subtle lag effect
      positionRef.current.x = lerp(positionRef.current.x, targetPositionRef.current.x, 0.15)
      positionRef.current.y = lerp(positionRef.current.y, targetPositionRef.current.y, 0.15)

      if (outerRef.current && innerRef.current) {
        // Scale up outer ring and shrink inner dot when hovering interactive elements
        const scale = isPointerRef.current ? 1.5 : 1
        const innerScale = isPointerRef.current ? 0.5 : 1

        // Use translate3d for GPU acceleration
        outerRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) translate(-50%, -50%) scale(${scale})`
        innerRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) translate(-50%, -50%) scale(${innerScale})`
      }

      animationFrameId = requestAnimationFrame(updateCursor)
    }

    // Mouse move handler - updates target position
    const handleMouseMove = (e: MouseEvent) => {
      targetPositionRef.current = { x: e.clientX, y: e.clientY }

      // Detect if hovering an interactive element
      const target = e.target as HTMLElement
      isPointerRef.current =
        window.getComputedStyle(target).cursor === "pointer" || 
        target.tagName === "BUTTON" || 
        target.tagName === "A"
    }

    // Passive listener for better scroll performance
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    animationFrameId = requestAnimationFrame(updateCursor)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      {/* Outer ring - 16px hollow circle */}
      <div
        ref={outerRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference will-change-transform"
        style={{ contain: "layout style paint" }}
      >
        <div className="h-4 w-4 rounded-full border-2 border-white" />
      </div>
      
      {/* Inner dot - 8px solid circle */}
      <div
        ref={innerRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference will-change-transform"
        style={{ contain: "layout style paint" }}
      >
        <div className="h-2 w-2 rounded-full bg-white" />
      </div>
    </>
  )
}

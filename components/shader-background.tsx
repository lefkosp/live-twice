"use client"

import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { useIsMobile } from "@/hooks/use-mobile"

export function ShaderBackground() {
  const isMobile = useIsMobile()
  
  // Reduce quality and intensity on mobile for performance
  const detail = isMobile ? 0.5 : 0.8
  const coarse = isMobile ? 30 : 40
  const medium = isMobile ? 30 : 40
  const fine = isMobile ? 30 : 40
  const intensity = isMobile ? 0.7 : 1.0
  const radius = isMobile ? 1.8 : 2.2
  const speed = isMobile ? 0.3 : 0.4
  
  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" style={{ mixBlendMode: "screen" }}>
      <Shader className="h-full w-full">
        {/* Layer 1: Animated noise base */}
        <Swirl
          colorA="#1a1a1a"
          colorB="#2a2a2a"
          speed={speed}
          detail={detail}
          blend={50}
          coarseX={coarse}
          coarseY={coarse}
          mediumX={medium}
          mediumY={medium}
          fineX={fine}
          fineY={fine}
        />
        
        {/* Layer 2: Cursor-reactive color bloom */}
        <ChromaFlow
          baseColor="#FF1744"
          upColor="#C62828"
          downColor="#424242"
          leftColor="#FF1744"
          rightColor="#C62828"
          intensity={intensity}
          radius={radius}
          momentum={25}
          maskType="alpha"
          opacity={1.0}
        />
      </Shader>
      
      {/* Overlay for contrast - reduced opacity for brighter colors */}
      <div className="absolute inset-0 bg-black/15" />
    </div>
  )
}

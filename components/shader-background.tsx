"use client"

import { Shader, ChromaFlow, Swirl } from "shaders/react"

export function ShaderBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Shader className="h-full w-full">
        {/* Layer 1: Animated noise base */}
        <Swirl
          colorA="#1a1a1a"
          colorB="#2a2a2a"
          speed={0.4}
          detail={0.8}
          blend={50}
          coarseX={40}
          coarseY={40}
          mediumX={40}
          mediumY={40}
          fineX={40}
          fineY={40}
        />
        
        {/* Layer 2: Cursor-reactive color bloom */}
        <ChromaFlow
          baseColor="#FF1744"
          upColor="#C62828"
          downColor="#424242"
          leftColor="#FF1744"
          rightColor="#C62828"
          intensity={1.0}
          radius={2.2}
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

"use client"

import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import { MagneticButton } from "@/components/magnetic-button"
import { ShaderBackground } from "@/components/shader-background"
import { ShaderFallback } from "@/components/shader-fallback"
import { useRef, useEffect, useState } from "react"

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const scrollThrottleRef = useRef<number>()

  // WebGL detection
  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement("canvas")
        const gl = canvas.getContext("webgl") || 
                   canvas.getContext("webgl2") || 
                   canvas.getContext("experimental-webgl")
        setWebglSupported(!!gl)
      } catch (e) {
        setWebglSupported(false)
      }
    }
    checkWebGLSupport()
  }, [])

  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const sectionWidth = scrollContainerRef.current.offsetWidth
      scrollContainerRef.current.scrollTo({
        left: sectionWidth * index,
        behavior: "smooth",
      })
      setCurrentSection(index)
    }
  }

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (Math.abs(e.touches[0].clientY - touchStartY.current) > 10) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY
      const touchEndX = e.changedTouches[0].clientX
      const deltaY = touchStartY.current - touchEndY
      const deltaX = touchStartX.current - touchEndX

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && currentSection < 3) {
          scrollToSection(currentSection + 1)
        } else if (deltaY < 0 && currentSection > 0) {
          scrollToSection(currentSection - 1)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true })
      container.addEventListener("touchmove", handleTouchMove, { passive: false })
      container.addEventListener("touchend", handleTouchEnd, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [currentSection])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()

        if (!scrollContainerRef.current) return

        scrollContainerRef.current.scrollBy({
          left: e.deltaY,
          behavior: "instant",
        })

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const newSection = Math.round(scrollContainerRef.current.scrollLeft / sectionWidth)
        if (newSection !== currentSection) {
          setCurrentSection(newSection)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
    }
  }, [currentSection])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = undefined
          return
        }

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const scrollLeft = scrollContainerRef.current.scrollLeft
        const newSection = Math.round(scrollLeft / sectionWidth)
        const progress = (scrollLeft / (sectionWidth * 3)) * 100

        setScrollProgress(progress)

        if (newSection !== currentSection && newSection >= 0 && newSection <= 3) {
          setCurrentSection(newSection)
        }

        scrollThrottleRef.current = undefined
      })
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll)
      }
      if (scrollThrottleRef.current) {
        cancelAnimationFrame(scrollThrottleRef.current)
      }
    }
  }, [currentSection])

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      {/* Custom cursor - always visible */}
      <CustomCursor />
      
      {/* Grain overlay for texture */}
      <GrainOverlay />
      
      {/* Shader background with WebGL detection fallback */}
      {webglSupported === false ? (
        <ShaderFallback />
      ) : webglSupported === true ? (
        <ShaderBackground />
      ) : null}

      <div
        ref={scrollContainerRef}
        className="flex h-full w-full overflow-x-scroll scroll-smooth"
        data-scroll-container
      >
        <section className="relative z-10 flex h-full w-full flex-shrink-0 items-center justify-center px-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="relative w-full h-full">
              <img
                src="/luxury-recording-studio-with-microphone-in-dramati.jpg"
                alt=""
                className="w-full h-full object-cover grayscale opacity-20 red-pop-image"
                style={{
                  transform: `scale(${1.1 - currentSection * 0.02})`,
                  transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
          </div>

          <div className="max-w-6xl text-center relative z-10">
            <div
              className="mb-8 overflow-hidden"
              style={{
                opacity: currentSection === 0 ? 1 : 0,
                transform: currentSection === 0 ? "translateY(0)" : "translateY(50px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <h1 className="font-sans text-[clamp(3rem,12vw,10rem)] font-bold leading-none tracking-tighter text-foreground">
                LIVE TWICE
              </h1>
            </div>
            <div
              className="h-1 w-32 bg-accent mx-auto mb-8"
              style={{
                opacity: currentSection === 0 ? 1 : 0,
                transform: currentSection === 0 ? "scaleX(1)" : "scaleX(0)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
              }}
            />
            <p
              className="font-sans text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              style={{
                opacity: currentSection === 0 ? 1 : 0,
                transform: currentSection === 0 ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s",
              }}
            >
              {"We don't need social media."}
              <br />
              {"Our work speaks louder."}
            </p>
          </div>
        </section>

        <section className="relative z-10 flex h-full w-full flex-shrink-0 items-center justify-center px-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="relative w-full h-full">
              <img
                src="/professional-music-producer-at-mixing-console-with.jpg"
                alt=""
                className="w-full h-full object-cover grayscale opacity-15 red-pop-image"
                style={{
                  transform: `translateX(${(1 - currentSection) * 20}%)`,
                  transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          </div>

          <div
            className="max-w-5xl w-full relative z-10"
            style={{
              opacity: currentSection === 1 ? 1 : 0.3,
              transform: currentSection === 1 ? "translateX(0)" : "translateX(-50px)",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <h2 className="font-sans text-5xl md:text-7xl font-bold mb-16 text-foreground">What We Do</h2>
            <div className="grid md:grid-cols-2 gap-12">
              {[
                {
                  title: "Viral Strategy",
                  desc: "We engineer moments. Every track we touch is strategically positioned to dominate streaming platforms and cut through the noise.",
                },
                {
                  title: "Data-Driven Growth",
                  desc: "Behind every viral hit is meticulous analysis. We leverage real-time data to maximize reach, engagement, and conversion at every touchpoint.",
                },
                {
                  title: "Artist Positioning",
                  desc: "We build brands, not just campaigns. Your identity becomes unmissable, undeniable, and unforgettable across all platforms.",
                },
                {
                  title: "Full-Spectrum Execution",
                  desc: "From playlist pitching to influencer seeding, PR coordination to algorithm optimization—we handle everything behind the scenes.",
                },
              ].map((service, i) => (
                <div
                  key={i}
                  className="group"
                  style={{
                    opacity: currentSection === 1 ? 1 : 0,
                    transform: currentSection === 1 ? "translateY(0)" : "translateY(30px)",
                    transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s`,
                  }}
                >
                  <div className="h-1 w-16 bg-accent mb-4 transition-all duration-300 group-hover:w-24" />
                  <h3 className="font-sans text-2xl font-bold mb-4 text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 flex h-full w-full flex-shrink-0 items-center justify-center px-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="relative w-full h-full">
              <img
                src="/massive-concert-crowd-at-music-festival-with-red-s.jpg"
                alt=""
                className="w-full h-full object-cover grayscale opacity-20 red-pop-image"
                style={{
                  transform: `scale(${1 + (2 - currentSection) * 0.05})`,
                  transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/70 to-black" />
          </div>

          <div
            className="max-w-5xl w-full relative z-10"
            style={{
              opacity: currentSection === 2 ? 1 : 0.3,
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <h2
              className="font-sans text-5xl md:text-7xl font-bold mb-16 text-foreground"
              style={{
                transform: currentSection === 2 ? "translateX(0)" : "translateX(-30px)",
                transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              By The Numbers
            </h2>
            <div className="grid md:grid-cols-3 gap-12 mb-20">
              {[
                { num: "2.4B+", label: "Total Streams Generated" },
                { num: "157", label: "Viral Campaigns" },
                { num: "43", label: "Chart-Topping Artists" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-center"
                  style={{
                    opacity: currentSection === 2 ? 1 : 0,
                    transform: currentSection === 2 ? "translateY(0)" : "translateY(50px)",
                    transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.15}s`,
                  }}
                >
                  <div className="font-sans text-6xl md:text-8xl font-bold text-accent mb-4">{stat.num}</div>
                  <div className="text-xl text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            <div
              className="border-t border-border pt-12"
              style={{
                opacity: currentSection === 2 ? 1 : 0,
                transform: currentSection === 2 ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s",
              }}
            >
              <h3 className="font-sans text-3xl font-bold mb-8 text-foreground">Recognition</h3>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="h-1 w-8 bg-accent" />
                  <p className="text-lg">{'Featured in Billboard\'s "Marketing Innovators to Watch" 2025'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-1 w-8 bg-accent" />
                  <p className="text-lg">{'Music Business Worldwide: "The Agency Operating in the Shadows"'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-1 w-8 bg-accent" />
                  <p className="text-lg">{"Partnered with major labels including Universal, Warner, and Sony"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 flex h-full w-full flex-shrink-0 items-center justify-center px-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="relative w-full h-full">
              <img
                src="/silhouette-of-musician-with-red-neon-lighting-in-d.jpg"
                alt=""
                className="w-full h-full object-cover grayscale opacity-25 red-pop-image"
                style={{
                  transform: `translateX(${(3 - currentSection) * -20}%)`,
                  transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>

          <div
            className="max-w-3xl text-center relative z-10"
            style={{
              opacity: currentSection === 3 ? 1 : 0.3,
              transform: currentSection === 3 ? "scale(1)" : "scale(0.9)",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <h2 className="font-sans text-5xl md:text-7xl font-bold mb-8 text-foreground">Get In Touch</h2>
            <div className="h-1 w-32 bg-accent mx-auto mb-12" />
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
              {"We're selective about who we work with."}
              <br />
              {"If you're serious about making an impact, let's talk."}
            </p>
            <a
              href="mailto:hello@livetwice.co"
              className="inline-block font-sans text-xl md:text-2xl font-bold text-foreground hover:text-accent transition-colors duration-300 border-b-2 border-accent pb-2"
            >
              hello@livetwice.co
            </a>
            <div className="mt-16 text-sm text-muted-foreground">
              <p>LIVE TWICE</p>
              <p className="mt-2">We operate in the shadows, but our results shine bright.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20">
        {[0, 1, 2, 3].map((index) => (
          <MagneticButton key={index} onClick={() => scrollToSection(index)} isActive={index === currentSection} />
        ))}
      </div>
    </main>
  )
}

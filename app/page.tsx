"use client"

import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import { MagneticButton } from "@/components/magnetic-button"
import { ShaderBackground } from "@/components/shader-background"
import { ShaderFallback } from "@/components/shader-fallback"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRef, useEffect, useState } from "react"

export default function Home() {
  const isMobile = useIsMobile()
  const totalSections = 4
  const sectionLabels = ["Home", "About", "Artists", "Contact"]
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)
  const [hoveredArtist, setHoveredArtist] = useState<string | null>(null)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const scrollThrottleRef = useRef<number | null>(null)
  const isScrollingRef = useRef(false)
  const lastScrollTimeRef = useRef(0)

  const artists = [
    {
      name: "MK",
      logo: "/MK Split Logo 2015.webp",
      image: "/mk.jpg",
    },
    {
      name: "Michael Bibi",
      logo: "/Michael Bibi logo.png",
      image: "/Bibi Pics 29.jpg",
    },
    {
      name: "Danny Howard",
      logo: "/Danny Howard Logo.png",
      image: "/DH Silverworks 66.jpg",
    },
  ]

  // WebGL detection
  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement("canvas")
        const gl =
          canvas.getContext("webgl") ||
          canvas.getContext("webgl2") ||
          canvas.getContext("experimental-webgl")
        setWebglSupported(!!gl)
      } catch (e) {
        setWebglSupported(false)
      }
    }
    checkWebGLSupport()
  }, [])

  const scrollToSection = (index: number, allowJump: boolean = false) => {
    if (index < 0 || index >= totalSections) {
      return
    }
    if (scrollContainerRef.current && !isScrollingRef.current) {
      const sectionDiff = Math.abs(index - currentSection)
      if (!allowJump && sectionDiff > 1) {
        return
      }

      const sectionWidth = scrollContainerRef.current.offsetWidth
      isScrollingRef.current = true
      lastScrollTimeRef.current = Date.now()

      scrollContainerRef.current.scrollTo({
        left: sectionWidth * index,
        behavior: "smooth",
      })
      setCurrentSection(index)

      setTimeout(() => {
        isScrollingRef.current = false
      }, 600)
    }
  }

  useEffect(() => {
    if (isMobile) return

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
      if (isScrollingRef.current) {
        return
      }

      const touchEndY = e.changedTouches[0].clientY
      const touchEndX = e.changedTouches[0].clientX
      const deltaY = touchStartY.current - touchEndY
      const deltaX = touchStartX.current - touchEndX

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && currentSection < totalSections - 1) {
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
  }, [currentSection, isMobile])

  useEffect(() => {
    if (isMobile) return

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()

        if (!scrollContainerRef.current) return

        const now = Date.now()
        if (isScrollingRef.current || now - lastScrollTimeRef.current < 500) {
          return
        }

        const container = scrollContainerRef.current
        const sectionWidth = container.offsetWidth
        const currentScrollLeft = container.scrollLeft
        const currentSectionIndex = Math.round(currentScrollLeft / sectionWidth)

        const scrollDirection = e.deltaY > 0 ? 1 : -1
        const targetSection = Math.max(
          0,
          Math.min(totalSections - 1, currentSectionIndex + scrollDirection)
        )

        if (targetSection === currentSectionIndex) {
          return
        }

        isScrollingRef.current = true
        lastScrollTimeRef.current = now

        container.scrollTo({
          left: targetSection * sectionWidth,
          behavior: "smooth",
        })

        if (targetSection !== currentSection) {
          setCurrentSection(targetSection)
        }

        setTimeout(() => {
          isScrollingRef.current = false
        }, 600)
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
  }, [currentSection, isMobile])

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null

    const handleScroll = () => {
      if (scrollThrottleRef.current !== null) return

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = null
          return
        }

        const container = scrollContainerRef.current

        if (isMobile) {
          const sections = container.querySelectorAll("section")
          let mostVisibleSection = 0
          let maxVisibility = 0

          sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect()
            const containerRect = container.getBoundingClientRect()

            const visibleTop = Math.max(rect.top, containerRect.top)
            const visibleBottom = Math.min(rect.bottom, containerRect.bottom)
            const visibleHeight = Math.max(0, visibleBottom - visibleTop)

            const visibility = visibleHeight / rect.height

            if (visibility > maxVisibility) {
              maxVisibility = visibility
              mostVisibleSection = index
            }
          })

          if (mostVisibleSection !== currentSection) {
            setCurrentSection(mostVisibleSection)
          }

          scrollThrottleRef.current = null
          return
        }

        const sectionWidth = container.offsetWidth
        const scrollLeft = container.scrollLeft

        const newSection = Math.round(scrollLeft / sectionWidth)

        if (newSection !== currentSection && newSection >= 0 && newSection <= totalSections - 1) {
          setCurrentSection(newSection)
        }

        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }

        scrollTimeout = setTimeout(() => {
          const sections = container.querySelectorAll("section")
          let mostVisibleSection = 0
          let maxVisibility = 0

          sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect()
            const containerRect = container.getBoundingClientRect()

            const visibleLeft = Math.max(rect.left, containerRect.left)
            const visibleRight = Math.min(rect.right, containerRect.right)
            const visibleWidth = Math.max(0, visibleRight - visibleLeft)

            const visibility = visibleWidth / sectionWidth

            if (visibility > maxVisibility) {
              maxVisibility = visibility
              mostVisibleSection = index
            }
          })

          const sectionDiff = Math.abs(mostVisibleSection - currentSection)
          if (maxVisibility > 0.3 && sectionDiff <= 1) {
            const targetScrollLeft = mostVisibleSection * sectionWidth
            const currentScrollLeft = container.scrollLeft
            const distance = Math.abs(targetScrollLeft - currentScrollLeft)

            if (distance > sectionWidth * 0.05) {
              isScrollingRef.current = true
              lastScrollTimeRef.current = Date.now()

              container.scrollTo({
                left: targetScrollLeft,
                behavior: "smooth",
              })

              setTimeout(() => {
                isScrollingRef.current = false
              }, 600)
            }
          }
        }, 150)

        scrollThrottleRef.current = null
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
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [currentSection, isMobile])

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      {!isMobile && <CustomCursor />}
      <GrainOverlay />
      {webglSupported === false ? (
        <ShaderFallback />
      ) : webglSupported === true ? (
        <ShaderBackground />
      ) : null}

      {/* Header with LT Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="group cursor-pointer" onClick={() => scrollToSection(0, true)}>
            <div className="relative">
              <span className="font-sans text-2xl md:text-3xl font-bold text-foreground tracking-tighter transition-all duration-300 group-hover:text-accent">
                LT
              </span>
              <div className="absolute -inset-2 bg-accent/0 group-hover:bg-accent/10 transition-all duration-300 -z-10 rounded"></div>
            </div>
          </div>
          <MagneticButton onClick={() => scrollToSection(3, true)} variant="secondary" size="default">
            Get in Touch
          </MagneticButton>
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        className={`flex h-full w-full scroll-smooth ${
          isMobile ? "flex-col overflow-y-auto overflow-x-hidden" : "overflow-x-scroll overflow-y-hidden"
        }`}
        data-scroll-container
      >
        {/* Section 1: Hero */}
        <section
          className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-8 overflow-hidden ${
            isMobile ? "min-h-screen py-16" : "h-full flex-shrink-0"
          }`}
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
          </div>
          <div className="max-w-4xl text-center relative z-10">
            <div
              className="mb-8 overflow-hidden"
              style={{
                opacity: currentSection === 0 ? 1 : 0,
                transform: currentSection === 0 ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <h1 className="font-sans text-[clamp(4rem,15vw,12rem)] font-bold leading-[0.9] tracking-tighter text-foreground">
                LIVE
                <br />
                TWICE
              </h1>
            </div>
            <p
              className="font-sans text-lg md:text-xl text-muted-foreground max-w-xl mx-auto"
              style={{
                opacity: currentSection === 0 ? 1 : 0,
                transform: currentSection === 0 ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
              }}
            >
              Bespoke social growth for electronic music artists.
            </p>
            <div
              className="mt-12"
              style={{
                opacity: currentSection === 0 ? 1 : 0,
                transform: currentSection === 0 ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s",
              }}
            >
              <MagneticButton onClick={() => scrollToSection(3, true)} variant="primary" size="lg">
                Get in Touch
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* Section 2: About */}
        <section
          className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-8 overflow-hidden ${
            isMobile ? "min-h-screen py-16" : "h-full flex-shrink-0"
          }`}
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
          </div>
          <div className="max-w-3xl text-center relative z-10">
            <h2
              className="font-sans text-4xl md:text-6xl lg:text-7xl font-light mb-8 text-foreground tracking-tight"
              style={{
                opacity: currentSection === 1 ? 1 : 0,
                transform: currentSection === 1 ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              About
            </h2>
            <p
              className="text-muted-foreground text-lg md:text-2xl leading-relaxed max-w-2xl mx-auto"
              style={{
                opacity: currentSection === 1 ? 1 : 0,
                transform: currentSection === 1 ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
              }}
            >
              We work with a select group of artists. Our methods are proven, but we keep them close. If you
              know, you know.
            </p>
            <div
              className="mt-12"
              style={{
                opacity: currentSection === 1 ? 1 : 0,
                transform: currentSection === 1 ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s",
              }}
            >
              <MagneticButton onClick={() => scrollToSection(3, true)} variant="secondary" size="lg">
                Get in Touch
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* Section 3: Artists */}
        <section
          className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-8 overflow-hidden ${
            isMobile ? "min-h-screen py-16" : "h-full flex-shrink-0"
          }`}
        >
          {/* Preloaded background images - all stay in DOM, controlled via opacity */}
          <div className="absolute inset-0 z-0">
            {artists.map((artist) => (
              <div
                key={artist.name}
                className="absolute inset-0"
                style={{
                  opacity: hoveredArtist === artist.name ? 1 : 0,
                  transition: "opacity 0.5s ease-out",
                  willChange: "opacity",
                }}
              >
                <img
                  src={artist.image}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover grayscale opacity-30"
                  style={{
                    transform: hoveredArtist === artist.name ? "scale(1.05)" : "scale(1.1)",
                    transition: "transform 0.7s ease-out",
                    willChange: "transform",
                  }}
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
          </div>

          <div
            className="max-w-5xl w-full relative z-10 text-center"
            style={{
              opacity: currentSection === 2 ? 1 : 0.3,
              transform: currentSection === 2 ? "scale(1)" : "scale(0.95)",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <h2 className="font-sans text-4xl md:text-6xl lg:text-7xl font-light mb-16 text-foreground tracking-tight">
              Artists
            </h2>
            <div className="space-y-8">
              {artists.map((artist) => (
                <div
                  key={artist.name}
                  className="group relative cursor-pointer"
                  onMouseEnter={() => !isMobile && setHoveredArtist(artist.name)}
                  onMouseLeave={() => !isMobile && setHoveredArtist(null)}
                >
                  <div
                    className="flex items-center justify-center gap-6 py-8"
                    style={{
                      opacity: hoveredArtist && hoveredArtist !== artist.name ? 0.2 : 1,
                      transform: hoveredArtist === artist.name ? "scale(1.05)" : "scale(1)",
                      transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
                      willChange: "opacity, transform",
                    }}
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center overflow-hidden">
                      <img
                        src={artist.logo}
                        alt={`${artist.name} logo`}
                        className={`w-full h-full object-contain transition-opacity duration-300 ${
                          hoveredArtist === artist.name ? "opacity-100" : "opacity-80"
                        } ${artist.name !== "Danny Howard" ? "filter brightness-0 invert" : ""}`}
                      />
                    </div>
                    <h3 
                      className="font-sans text-3xl md:text-5xl lg:text-6xl font-light transition-colors duration-300"
                      style={{ color: hoveredArtist === artist.name ? "var(--accent)" : "var(--foreground)" }}
                    >
                      {artist.name}
                    </h3>
                  </div>
                  <div 
                    className="absolute inset-x-0 bottom-0 h-px transition-colors duration-300"
                    style={{ backgroundColor: hoveredArtist === artist.name ? "rgba(255, 77, 77, 0.5)" : "rgba(255, 255, 255, 0.1)" }}
                  ></div>
                </div>
              ))}
            </div>
            <div
              className="mt-16"
              style={{
                opacity: hoveredArtist ? 0.3 : 1,
                transition: "all 0.5s ease",
              }}
            >
              <MagneticButton onClick={() => scrollToSection(3, true)} variant="secondary" size="lg">
                Get in Touch
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* Section 4: Contact */}
        <section
          className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-8 overflow-hidden ${
            isMobile ? "min-h-screen py-16" : "h-full flex-shrink-0"
          }`}
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
          </div>
          <div
            className="max-w-4xl text-center relative z-10"
            style={{
              opacity: currentSection === 3 ? 1 : 0.3,
              transform: currentSection === 3 ? "scale(1)" : "scale(0.95)",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <h2 className="font-sans text-4xl md:text-5xl lg:text-7xl font-light mb-8 text-foreground tracking-tight">
              Let's talk.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
              We work with a limited number of artists.
              <br />
              If you're serious about growth, get in touch.
            </p>
            <div className="flex flex-col items-center gap-6">
              <MagneticButton
                onClick={() => {
                  window.location.href = "mailto:business@livetwice.co.uk?subject=Inquiry"
                }}
                variant="primary"
                size="lg"
              >
                Get in Touch
              </MagneticButton>
              <div className="text-sm uppercase tracking-[0.2em] text-foreground/70">
                <a
                  href="mailto:business@livetwice.co.uk"
                  className="inline-flex items-center border-b border-accent/70 text-foreground hover:text-accent transition-colors duration-300"
                >
                  business@livetwice.co.uk
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {!isMobile && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center space-x-3 rounded-full border border-foreground/10 bg-black/40 px-4 py-2 backdrop-blur">
            {Array.from({ length: totalSections }).map((_, index) => {
              const isActive = index === currentSection
              return (
                <MagneticButton
                  key={index}
                  onClick={() => scrollToSection(index, true)}
                  className="group relative px-2 py-2"
                  variant="ghost"
                  size="default"
                  aria-label={`Navigate to ${sectionLabels[index]} section`}
                >
                  <span
                    className={`block h-2.5 w-2.5 rounded-full border transition-all duration-300 ${
                      isActive
                        ? "border-accent/80 bg-accent/80 shadow-[0_0_12px_rgba(255,77,77,0.6)]"
                        : "border-foreground/30 bg-foreground/10 group-hover:border-foreground/60 group-hover:bg-foreground/20"
                    }`}
                  />
                  {isActive && (
                    <span className="pointer-events-none absolute -inset-1 rounded-full border border-accent/40 opacity-70 animate-pulse" />
                  )}
                </MagneticButton>
              )
            })}
          </div>
          <div className="mt-3 text-center text-[10px] uppercase tracking-[0.3em] text-foreground/50">
            {sectionLabels[currentSection]}
          </div>
        </div>
      )}
    </main>
  )
}

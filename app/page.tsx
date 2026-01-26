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
  const totalSections = 9
  const sectionLabels = [
    "Hero",
    "About",
    "Services",
    "Framework",
    "Clients",
    "Fan Accounts",
    "Ads",
    "Engagement",
    "Contact",
  ]
  const sectionImages = [
    "/luxury-recording-studio-with-microphone-in-dramati.jpg",
    "/professional-music-producer-at-mixing-console-with.jpg",
    "/massive-concert-crowd-at-music-festival-with-red-s.jpg",
    "/silhouette-of-musician-with-red-neon-lighting-in-d.jpg",
  ]
  const overlayClasses = [
    "bg-gradient-to-b from-transparent via-black/60 to-black",
    "bg-gradient-to-r from-black via-black/70 to-transparent",
    "bg-gradient-radial from-transparent via-black/70 to-black",
    "bg-gradient-to-t from-black via-black/70 to-transparent",
  ]
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const scrollThrottleRef = useRef<number | null>(null)
  const isScrollingRef = useRef(false)
  const lastScrollTimeRef = useRef(0)

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

  const scrollToSection = (index: number, allowJump: boolean = false) => {
    if (index < 0 || index >= totalSections) {
      return
    }
    if (scrollContainerRef.current && !isScrollingRef.current) {
      // Only allow scrolling to adjacent sections (max 1 section away) unless explicitly allowed (e.g., button click)
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
      
      // Reset scrolling flag after animation completes
      setTimeout(() => {
        isScrollingRef.current = false
      }, 600)
    }
  }

  useEffect(() => {
    // Only enable horizontal touch paging on desktop
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
      // Prevent touch scrolling if already scrolling
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
    // Only enable horizontal wheel paging on desktop
    if (isMobile) return

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()

        if (!scrollContainerRef.current) return
        
        // Prevent scrolling if already scrolling or too soon after last scroll
        const now = Date.now()
        if (isScrollingRef.current || now - lastScrollTimeRef.current < 500) {
          return
        }

        const container = scrollContainerRef.current
        const sectionWidth = container.offsetWidth
        const currentScrollLeft = container.scrollLeft
        const currentSectionIndex = Math.round(currentScrollLeft / sectionWidth)
        
        // Determine scroll direction - only allow 1 section change
        const scrollDirection = e.deltaY > 0 ? 1 : -1
        const targetSection = Math.max(0, Math.min(totalSections - 1, currentSectionIndex + scrollDirection))
        
        // Only scroll if target is different from current
        if (targetSection === currentSectionIndex) {
          return
        }
        
        // Mark as scrolling
        isScrollingRef.current = true
        lastScrollTimeRef.current = now
        
        // Scroll to target section with smooth behavior
        container.scrollTo({
          left: targetSection * sectionWidth,
          behavior: "smooth",
        })

        if (targetSection !== currentSection) {
          setCurrentSection(targetSection)
        }
        
        // Reset scrolling flag after animation completes
        setTimeout(() => {
          isScrollingRef.current = false
        }, 600) // Slightly longer than smooth scroll duration
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
    let isScrolling = false

    const handleScroll = () => {
      if (scrollThrottleRef.current !== null) return

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = null
          return
        }

        const container = scrollContainerRef.current
        
        // On mobile, track scroll position for vertical scroll
        if (isMobile) {
          const scrollTop = container.scrollTop
          const sections = container.querySelectorAll("section")
          
          // Find which section is most visible
          let mostVisibleSection = 0
          let maxVisibility = 0

          sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect()
            const containerRect = container.getBoundingClientRect()
            
            // Calculate visible height
            const visibleTop = Math.max(rect.top, containerRect.top)
            const visibleBottom = Math.min(rect.bottom, containerRect.bottom)
            const visibleHeight = Math.max(0, visibleBottom - visibleTop)
            
            // Calculate visibility percentage
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

        // Desktop horizontal scroll logic
        const sectionWidth = container.offsetWidth
        const scrollLeft = container.scrollLeft
        const sections = container.querySelectorAll("section")
        
        // Update progress and current section
        const newSection = Math.round(scrollLeft / sectionWidth)
        const progress = (scrollLeft / (sectionWidth * (totalSections - 1))) * 100

        setScrollProgress(progress)

        if (newSection !== currentSection && newSection >= 0 && newSection <= totalSections - 1) {
          setCurrentSection(newSection)
        }

        // Mark that scrolling is happening
        isScrolling = true
        
        // Clear existing timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }

        // After scrolling stops, check for 30% threshold snapping
        scrollTimeout = setTimeout(() => {
          isScrolling = false
          
          // Find which section is most visible
          let mostVisibleSection = 0
          let maxVisibility = 0

          sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect()
            const containerRect = container.getBoundingClientRect()
            
            // Calculate visible width
            const visibleLeft = Math.max(rect.left, containerRect.left)
            const visibleRight = Math.min(rect.right, containerRect.right)
            const visibleWidth = Math.max(0, visibleRight - visibleLeft)
            
            // Calculate visibility percentage
            const visibility = visibleWidth / sectionWidth
            
            if (visibility > maxVisibility) {
              maxVisibility = visibility
              mostVisibleSection = index
            }
          })

          // Only snap if section is more than 30% visible AND it's adjacent to current section (max 1 section away)
          const sectionDiff = Math.abs(mostVisibleSection - currentSection)
          if (maxVisibility > 0.3 && sectionDiff <= 1) {
            const targetScrollLeft = mostVisibleSection * sectionWidth
            const currentScrollLeft = container.scrollLeft
            const distance = Math.abs(targetScrollLeft - currentScrollLeft)
            
            // Only snap if we're not already at the target (within 5% tolerance)
            if (distance > sectionWidth * 0.05) {
              isScrollingRef.current = true
              lastScrollTimeRef.current = Date.now()
              
              container.scrollTo({
                left: targetScrollLeft,
                behavior: "smooth",
              })
              
              // Reset scrolling flag after animation completes
              setTimeout(() => {
                isScrollingRef.current = false
              }, 600)
            }
          }
        }, 150) // Wait 150ms after scrolling stops

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

  const renderBackground = (index: number) => (
    <div className="absolute inset-0 z-0">
      <div className="relative w-full h-full">
        <img
          src={sectionImages[index % sectionImages.length]}
          alt=""
          className="w-full h-full object-cover grayscale opacity-20 red-pop-image"
          style={{
            transform: `scale(${currentSection === index ? 1.05 : 1.12})`,
            transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
      <div className={`absolute inset-0 ${overlayClasses[index % overlayClasses.length]}`} />
    </div>
  )

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      {/* Custom cursor - hidden on mobile */}
      {!isMobile && <CustomCursor />}
      
      {/* Grain overlay for texture - reduced intensity on mobile */}
      <GrainOverlay />
      
      {/* Shader background with WebGL detection fallback - reduced quality on mobile */}
      {webglSupported === false ? (
        <ShaderFallback />
      ) : webglSupported === true ? (
        <ShaderBackground />
      ) : null}

      <div
        ref={scrollContainerRef}
        className={`flex h-full w-full scroll-smooth ${
          isMobile 
            ? "flex-col overflow-y-auto overflow-x-hidden" 
            : "overflow-x-scroll overflow-y-hidden"
        }`}
        data-scroll-container
      >
        <section className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-8 overflow-hidden ${
          isMobile ? "min-h-screen py-16" : "h-full flex-shrink-0"
        }`}>
          {renderBackground(0)}
          <div className="max-w-6xl text-center relative z-10">
            <div
              className="mb-4 overflow-hidden"
              style={{
                opacity: currentSection === 0 ? 1 : 0,
                transform: currentSection === 0 ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <span className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">Live Twice</span>
            </div>
            <h1
              className="font-sans text-[clamp(2rem,8vw,7rem)] font-bold leading-[0.95] tracking-tight text-foreground mb-6 px-4"
              style={{
                opacity: currentSection === 0 ? 1 : 0,
                transform: currentSection === 0 ? "translateY(0)" : "translateY(50px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s",
              }}
            >
              We turn music into moments.
            </h1>
            <p
              className="font-sans text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              style={{
                opacity: currentSection === 0 ? 1 : 0,
                transform: currentSection === 0 ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
              }}
            >
              Bespoke social growth for electronic music artists.
            </p>
            <p
              className="mt-6 text-sm md:text-base text-foreground/70 max-w-2xl mx-auto"
              style={{
                opacity: currentSection === 0 ? 1 : 0,
                transform: currentSection === 0 ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.35s",
              }}
            >
              Content, strategy, fan accounts and paid amplification, all built around releases and live shows.
            </p>
            <div
              className="mt-10 text-sm uppercase tracking-[0.2em] text-foreground/70"
              style={{
                opacity: currentSection === 0 ? 1 : 0,
                transform: currentSection === 0 ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.45s",
              }}
            >
              For representation and projects:
              <a
                href="mailto:business@livetwice.co.uk"
                className="ml-3 inline-flex items-center border-b border-accent/70 text-foreground hover:text-accent transition-colors duration-300"
              >
                business@livetwice.co.uk
              </a>
            </div>
          </div>
        </section>

        <section className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-8 overflow-hidden ${
          isMobile ? "min-h-screen py-16" : "h-full flex-shrink-0"
        }`}>
          {renderBackground(1)}
          <div
            className="max-w-6xl w-full relative z-10 grid gap-10 md:grid-cols-2"
            style={{
              opacity: currentSection === 1 ? 1 : 0.3,
              transform: currentSection === 1 ? "translateX(0)" : "translateX(-40px)",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div>
              <h2 className="font-sans text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-foreground">About</h2>
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                Live Twice is a boutique social agency working exclusively with electronic music artists. We build
                social-first campaigns that don’t just promote music. They create cultural moments.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-6 text-muted-foreground text-base md:text-lg leading-relaxed">
              <p>
                We work closely with a limited roster, embedding ourselves into releases, tours, and live shows to
                deliver consistent, high-impact growth.
              </p>
              <div className="h-px w-20 bg-accent/70" />
              <p className="text-foreground/80">Focused, embedded, and built for real momentum.</p>
            </div>
          </div>
        </section>

        <section className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-8 overflow-hidden ${
          isMobile ? "min-h-screen py-16" : "h-full flex-shrink-0"
        }`}>
          {renderBackground(2)}
          <div
            className="max-w-6xl w-full relative z-10"
            style={{
              opacity: currentSection === 2 ? 1 : 0.3,
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <h2 className="font-sans text-4xl md:text-5xl lg:text-7xl font-bold mb-12 text-foreground">What We Do</h2>
            <div className="grid md:grid-cols-2 gap-10">
              {[
                "Viral campaign strategy",
                "TikTok / short-form seeding",
                "Playlist placement",
                "Artist development",
                "Data analysis & optimisation",
                "Full campaign execution",
              ].map((service, i) => (
                <div
                  key={service}
                  className="group"
                  style={{
                    opacity: currentSection === 2 ? 1 : 0,
                    transform: currentSection === 2 ? "translateY(0)" : "translateY(30px)",
                    transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.08}s`,
                  }}
                >
                  <div className="h-1 w-16 bg-accent mb-4 transition-all duration-300 group-hover:w-24" />
                  <h3 className="font-sans text-xl md:text-2xl font-semibold text-foreground">{service}</h3>
                </div>
              ))}
            </div>
            <p className="mt-10 text-sm md:text-base text-foreground/70">
              Every campaign is tailored. No templates. No filler.
            </p>
            <p className="mt-4 text-xs md:text-sm uppercase tracking-[0.2em] text-foreground/50">
              TikTok • Spotify • Apple Music • Instagram
            </p>
          </div>
        </section>

        <section className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-8 overflow-hidden ${
          isMobile ? "min-h-screen py-16" : "h-full flex-shrink-0"
        }`}>
          {renderBackground(3)}
          <div
            className="max-w-6xl w-full relative z-10"
            style={{
              opacity: currentSection === 3 ? 1 : 0.3,
              transform: currentSection === 3 ? "translateY(0)" : "translateY(40px)",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <h2 className="font-sans text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-foreground">Built for the release cycle.</h2>
            <div className="grid md:grid-cols-3 gap-8 mt-10">
              {[
                {
                  title: "Pre-Release",
                  desc: "Build hype. Seed the sound. Drive anticipation.",
                },
                {
                  title: "Release Week",
                  desc: "Flood platforms with high-impact content and influencer activity.",
                },
                {
                  title: "Post-Release",
                  desc: "Sustain momentum through fan content, challenges and remixes.",
                },
              ].map((step, i) => (
                <div
                  key={step.title}
                  className="border border-foreground/10 bg-black/30 p-6"
                  style={{
                    opacity: currentSection === 3 ? 1 : 0,
                    transform: currentSection === 3 ? "translateY(0)" : "translateY(40px)",
                    transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.12}s`,
                  }}
                >
                  <h3 className="font-sans text-2xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-sm md:text-base text-foreground/70">This is how tracks live far beyond release day.</p>
          </div>
        </section>

        <section className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-8 overflow-hidden ${
          isMobile ? "min-h-screen py-16" : "h-full flex-shrink-0"
        }`}>
          {renderBackground(4)}
          <div
            className="max-w-5xl w-full relative z-10 text-center"
            style={{
              opacity: currentSection === 4 ? 1 : 0.3,
              transform: currentSection === 4 ? "scale(1)" : "scale(0.95)",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <h2 className="font-sans text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-foreground">Artists we’ve worked with</h2>
            <div className="flex flex-wrap justify-center gap-6 text-2xl md:text-4xl font-semibold text-foreground/90">
              {["MK", "Michael Bibi", "Danny Howard"].map((artist) => (
                <span key={artist} className="px-3 py-1 border border-foreground/10 bg-black/30">
                  {artist}
                </span>
              ))}
            </div>
            <p className="mt-8 text-sm md:text-base text-foreground/70">From chart-topping legends to underground leaders.</p>
          </div>
        </section>

        <section className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-8 overflow-hidden ${
          isMobile ? "min-h-screen py-16" : "h-full flex-shrink-0"
        }`}>
          {renderBackground(5)}
          <div
            className="max-w-6xl w-full relative z-10 grid gap-10 md:grid-cols-2"
            style={{
              opacity: currentSection === 5 ? 1 : 0.3,
              transform: currentSection === 5 ? "translateX(0)" : "translateX(-30px)",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div>
              <h2 className="font-sans text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-foreground">
                Fan accounts that fuel virality
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Beyond main artist profiles, we build and manage high-volume fan accounts designed to push reach at
                scale.
              </p>
            </div>
            <div className="flex items-center">
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                By posting up to five times per day using live footage, archives and fresh edits, we dramatically
                increase the chances of breakout moments.
              </p>
            </div>
          </div>
        </section>

        <section className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-8 overflow-hidden ${
          isMobile ? "min-h-screen py-16" : "h-full flex-shrink-0"
        }`}>
          {renderBackground(6)}
          <div
            className="max-w-6xl w-full relative z-10 grid gap-10 md:grid-cols-2"
            style={{
              opacity: currentSection === 6 ? 1 : 0.3,
              transform: currentSection === 6 ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div>
              <h2 className="font-sans text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-foreground">
                Paid, but never wasteful
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We create and manage ad creatives across TikTok, Meta and Shorts, optimised per platform and deployed
                with intent.
              </p>
            </div>
            <div className="flex items-center">
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                Influencer campaigns are curated, not sprayed. We target creators that move culture, not just numbers.
              </p>
            </div>
          </div>
        </section>

        <section className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-8 overflow-hidden ${
          isMobile ? "min-h-screen py-16" : "h-full flex-shrink-0"
        }`}>
          {renderBackground(7)}
          <div
            className="max-w-6xl w-full relative z-10"
            style={{
              opacity: currentSection === 7 ? 1 : 0.3,
              transform: currentSection === 7 ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <h2 className="font-sans text-4xl md:text-5xl lg:text-7xl font-bold mb-8 text-foreground">How we work with artists</h2>
            <ul className="grid md:grid-cols-2 gap-6 text-muted-foreground text-lg">
              {[
                "Bespoke monthly retainers",
                "Campaign-based engagements",
                "Limited client roster",
                "Scope tailored per release and tour",
              ].map((item) => (
                <li key={item} className="border border-foreground/10 bg-black/30 px-5 py-4">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-10 text-sm md:text-base text-foreground/70">If we work together, we’re all in.</p>
          </div>
        </section>

        <section className={`relative z-10 flex w-full items-center justify-center px-4 sm:px-8 overflow-hidden ${
          isMobile ? "min-h-screen py-16" : "h-full flex-shrink-0"
        }`}>
          {renderBackground(8)}
          <div
            className="max-w-4xl text-center relative z-10"
            style={{
              opacity: currentSection === 8 ? 1 : 0.3,
              transform: currentSection === 8 ? "scale(1)" : "scale(0.95)",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <h2 className="font-sans text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-foreground">
              Let’s build something that cuts through.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
              We work with a limited number of artists each quarter. Discreet, focused, and built for results.
            </p>
            <div className="text-sm uppercase tracking-[0.2em] text-foreground/70">
              For representation and projects:
              <a
                href="mailto:business@livetwice.co.uk"
                className="ml-3 inline-flex items-center border-b border-accent/70 text-foreground hover:text-accent transition-colors duration-300"
              >
                business@livetwice.co.uk
              </a>
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

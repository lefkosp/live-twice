"use client";

import { CustomCursor } from "@/components/custom-cursor";
import { GrainOverlay } from "@/components/grain-overlay";
import { MagneticButton } from "@/components/magnetic-button";
import { ShaderBackground } from "@/components/shader-background";
import { ShaderFallback } from "@/components/shader-fallback";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useEffect, useState } from "react";

export default function Home() {
  const isMobile = useIsMobile();
  const totalSections = 4;
  const sectionLabels = ["Home", "About", "Representation", "Contact"];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [heroRevealed, setHeroRevealed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const representationSectionRef = useRef<HTMLElement | null>(null);
  const representationVideoRef = useRef<HTMLVideoElement>(null);
  const scrollThrottleRef = useRef<number | null>(null);

  // Hero opening animation: run once on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setHeroRevealed(true));
    });
    return () => cancelAnimationFrame(t);
  }, []);

  // Representation: auto-start/pause video when section scrolls into view
  useEffect(() => {
    const section = representationSectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [e] = entries;
        if (!e) return;
        const video = representationVideoRef.current;
        if (!video) return;
        if (e.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25, root: scrollContainerRef.current },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // WebGL detection
  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl") ||
          canvas.getContext("webgl2") ||
          canvas.getContext("experimental-webgl");
        setWebglSupported(!!gl);
      } catch (e) {
        setWebglSupported(false);
      }
    };
    checkWebGLSupport();
  }, []);

  const scrollToSection = (index: number) => {
    if (index < 0 || index >= totalSections) return;
    const el = sectionRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Update current section based on scroll position (for nav highlight)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (scrollThrottleRef.current !== null) return;
      scrollThrottleRef.current = requestAnimationFrame(() => {
        const sections = sectionRefs.current.filter(Boolean) as HTMLElement[];
        if (sections.length === 0) {
          scrollThrottleRef.current = null;
          return;
        }
        const containerRect = container.getBoundingClientRect();
        const centerY = containerRect.top + containerRect.height / 2;
        let mostVisibleSection = 0;
        let minDistance = Infinity;
        sections.forEach((section, index) => {
          const rect = section.getBoundingClientRect();
          const sectionCenterY = rect.top + rect.height / 2;
          const distance = Math.abs(sectionCenterY - centerY);
          if (distance < minDistance) {
            minDistance = distance;
            mostVisibleSection = index;
          }
        });
        setCurrentSection(mostVisibleSection);
        scrollThrottleRef.current = null;
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollThrottleRef.current)
        cancelAnimationFrame(scrollThrottleRef.current);
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-background">
      {!isMobile && <CustomCursor />}
      <GrainOverlay />
      {webglSupported === false ? (
        <ShaderFallback />
      ) : webglSupported === true ? (
        <ShaderBackground />
      ) : null}

      {/* Header — desktop: inline nav / mobile: burger menu */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-foreground/10 bg-black/60 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 py-3 md:px-8 md:py-5">
          {/* Logo */}
          <div
            className="group cursor-pointer"
            onClick={() => {
              scrollToSection(0);
              setMenuOpen(false);
            }}
          >
            <span className="font-sans text-2xl md:text-3xl font-bold text-foreground tracking-tighter transition-all duration-300 group-hover:text-accent">
              LT
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Main">
            {sectionLabels.map((label, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(index)}
                className={`font-sans text-sm uppercase tracking-[0.15em] transition-colors duration-200 hover:text-accent ${
                  currentSection === index
                    ? "text-accent"
                    : "text-foreground/80"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <MagneticButton
              onClick={() => scrollToSection(3)}
              variant="secondary"
              size="default"
            >
              Get in Touch
            </MagneticButton>
          </div>

          {/* Mobile burger button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden relative z-[60] flex flex-col items-center justify-center w-10 h-10 gap-[5px]"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className="block h-[2px] w-6 bg-foreground transition-all duration-300 origin-center"
              style={{
                transform: menuOpen
                  ? "translateY(3.5px) rotate(45deg)"
                  : "none",
              }}
            />
            <span
              className="block h-[2px] w-6 bg-foreground transition-all duration-300 origin-center"
              style={{
                transform: menuOpen
                  ? "translateY(-3.5px) rotate(-45deg)"
                  : "none",
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile full-screen nav overlay */}
      <div
        className={`fixed inset-0 z-[55] flex flex-col items-center justify-center bg-black/95 backdrop-blur-lg transition-all duration-300 md:hidden ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col items-center gap-8" aria-label="Mobile">
          {sectionLabels.map((label, index) => (
            <button
              key={index}
              onClick={() => {
                scrollToSection(index);
                setMenuOpen(false);
              }}
              className={`font-sans text-2xl uppercase tracking-[0.2em] transition-colors duration-200 ${
                currentSection === index ? "text-accent" : "text-foreground/80"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-12">
          <a
            href="mailto:business@livetwice.co.uk?subject=Enquiry"
            className="font-sans text-sm uppercase tracking-[0.2em] text-foreground/60 underline underline-offset-4"
          >
            business@livetwice.co.uk
          </a>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex flex-col w-full overflow-y-auto overflow-x-hidden scroll-smooth h-screen"
        data-scroll-container
      >
        {/* Section 1: Hero */}
        <section
          ref={(el) => {
            sectionRefs.current[0] = el;
          }}
          className="relative z-10 flex w-full min-h-[100svh] flex-shrink-0 items-center justify-center overflow-hidden px-5 py-20"
        >
          <div className="absolute inset-0 z-0">
            <video
              className="absolute inset-0 h-full w-full object-cover object-center"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
              src="/WEBSITE.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/90" />
          </div>
          <div className="w-full text-center relative z-10">
            {/* Placeholder logo (font) — new logo in progress */}
            <div
              className="mb-8 overflow-hidden"
              style={{
                opacity: currentSection === 0 ? 1 : 0,
                transform:
                  currentSection === 0 ? "translateY(0)" : "translateY(30px)",
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
              className="font-sans text-base sm:text-lg md:text-xl text-muted-foreground max-w-md sm:max-w-xl mx-auto"
              style={{
                opacity: heroRevealed ? 1 : 0,
                transform: heroRevealed ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.25s, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.25s",
              }}
            >
              Life happens once, what you create lets you live again.
            </p>
            <div
              className="mt-8 sm:mt-12"
              style={{
                opacity: heroRevealed ? 1 : 0,
                transform: heroRevealed ? "translateY(0)" : "translateY(16px)",
                transition:
                  "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.45s, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.45s",
              }}
            >
              <MagneticButton
                onClick={() => scrollToSection(3)}
                variant="primary"
                size="lg"
              >
                Get in Touch
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* Section 2: About — Ushuaïa crowd shot */}
        <section
          ref={(el) => {
            sectionRefs.current[1] = el;
          }}
          className="relative z-10 flex w-full min-h-[100svh] flex-shrink-0 items-center justify-center overflow-hidden px-5 py-20 sm:px-8"
        >
          <div className="absolute inset-0 z-0">
            <img
              src="/%27ABOUT%27%20PICS/20250620_Ushuaia_Calvin_Harris_0006_5000x4000px_.jpg"
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/85" />
          </div>
          <div className="max-w-3xl text-center relative z-10">
            <h2
              className="font-sans text-[clamp(4rem,15vw,12rem)] font-bold leading-[0.9] tracking-tighter text-foreground"
              style={{
                opacity: currentSection === 1 ? 1 : 0,
                transform:
                  currentSection === 1 ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              ABOUT
            </h2>
            <p
              className="text-muted-foreground text-base sm:text-lg md:text-2xl leading-relaxed max-w-2xl mx-auto"
              style={{
                opacity: currentSection === 1 ? 1 : 0,
                transform:
                  currentSection === 1 ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
              }}
            >
              Live Twice is a creative group focused on capturing moments,
              generating attention and ensuring longevity in social media. A
              presence built for what lasts.
            </p>
            <div
              className="mt-8 sm:mt-12"
              style={{
                opacity: currentSection === 1 ? 1 : 0,
                transform:
                  currentSection === 1 ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s",
              }}
            >
              <MagneticButton
                onClick={() => scrollToSection(3)}
                variant="secondary"
                size="lg"
              >
                Get in Touch
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* Section 3: Representation — B&W slideshow video, editorial. No logos, no names. */}
        <section
          ref={(el) => {
            sectionRefs.current[2] = el;
            representationSectionRef.current = el;
          }}
          className="relative z-10 flex w-full min-h-[100svh] flex-shrink-0 items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <video
              ref={representationVideoRef}
              className="absolute inset-0 h-full w-full object-cover object-center"
              src="/REPRESENTING/Website%20slide%20show%2016x9%20BW.mp4"
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Centre copy only: "Representing" */}
          <div className="relative z-10 flex items-center justify-center text-center px-5">
            <h2
              className="font-sans text-[clamp(4rem,15vw,12rem)] font-bold leading-[0.9] tracking-tighter text-foreground"
              style={{ textShadow: "0 0 80px rgba(0,0,0,0.8)" }}
            >
              REPRESENTING
            </h2>
          </div>
        </section>

        {/* Section 4: Contact — minimal: heading + email only. No forms, phone, socials. */}
        <section
          ref={(el) => {
            sectionRefs.current[3] = el;
          }}
          className="relative z-10 flex w-full min-h-[100svh] flex-shrink-0 items-center justify-center overflow-hidden px-5 py-20 sm:px-8"
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
          </div>
          <div
            className="max-w-2xl text-center relative z-10"
            style={{
              opacity: currentSection === 3 ? 1 : 0,
              transform:
                currentSection === 3 ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
            }}
          >
            <h2 className="font-sans text-[clamp(4rem,15vw,12rem)] font-bold leading-[0.9] tracking-tighter text-foreground mb-8 sm:mb-10 md:mb-12">
              LET'S TALK
            </h2>
            <a
              href="mailto:business@livetwice.co.uk?subject=Enquiry"
              className="font-sans text-base sm:text-lg md:text-xl text-foreground/90 underline underline-offset-4 decoration-foreground/40 hover:decoration-foreground/80 transition-colors duration-200 py-3 inline-block"
            >
              business@livetwice.co.uk
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

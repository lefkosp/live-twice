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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [introActive, setIntroActive] = useState(true);
  const [introFlash, setIntroFlash] = useState(false);
  const [introFading, setIntroFading] = useState(false);
  const [touchFeedback, setTouchFeedback] = useState({
    x: 0,
    y: 0,
    visible: false,
    burst: 0,
  });
  const contactHeadingDefault = "LET'S TALK";
  const contactHeadingAlt = "LIVE TWICE";
  const [contactHeadingText, setContactHeadingText] = useState(
    contactHeadingDefault,
  );
  const [contactHeadingTick, setContactHeadingTick] = useState(0);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const representationSectionRef = useRef<HTMLElement | null>(null);
  const representationVideoRef = useRef<HTMLVideoElement>(null);
  const [representationVideoSrc, setRepresentationVideoSrc] = useState<
    string | null
  >(null);
  const scrollThrottleRef = useRef<number | null>(null);
  const introTimersRef = useRef<number[]>([]);
  const touchRafRef = useRef<number | null>(null);
  const touchFadeRef = useRef<number | null>(null);
  const touchPointRef = useRef({ x: 0, y: 0 });
  const contactTimersRef = useRef<number[]>([]);
  const contactAnimatingRef = useRef(false);
  const contactTextRef = useRef("LET'S TALK");

  // Detect reduced motion preference.
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Opening animation: brief negative-style flash, then reveal hero.
  useEffect(() => {
    introTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    introTimersRef.current = [];

    if (prefersReducedMotion) {
      setIntroActive(false);
      setIntroFlash(false);
      setIntroFading(false);
      setHeroRevealed(true);
      return;
    }

    setIntroActive(true);
    setIntroFlash(false);
    setIntroFading(false);
    setHeroRevealed(false);

    introTimersRef.current.push(
      window.setTimeout(() => setIntroFlash(true), 120),
    );
    introTimersRef.current.push(
      window.setTimeout(() => setHeroRevealed(true), 420),
    );
    introTimersRef.current.push(
      window.setTimeout(() => setIntroFading(true), 840),
    );
    introTimersRef.current.push(
      window.setTimeout(() => setIntroActive(false), 1260),
    );

    return () => {
      introTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      introTimersRef.current = [];
    };
  }, [prefersReducedMotion]);

  // Hero: force play on mount and on canplay (Chrome mobile often ignores autoplay attribute)
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    const play = () => video.play().catch(() => {});
    play();
    video.addEventListener("canplay", play);
    return () => video.removeEventListener("canplay", play);
  }, []);

  // Representation: lazy-load src when section is slightly in view, play/pause by visibility
  useEffect(() => {
    const section = representationSectionRef.current;
    const container = scrollContainerRef.current;
    if (!section || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [e] = entries;
        if (!e) return;
        const video = representationVideoRef.current;
        if (e.isIntersecting) {
          setRepresentationVideoSrc((prev) =>
            prev === null ? "/REPRESENTING/REPRESENTING.mp4" : prev,
          );
          video?.play().catch(() => {});
        } else {
          video?.pause();
        }
      },
      { root: container, threshold: 0.05, rootMargin: "0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Start representation video when src is set (after lazy load)
  useEffect(() => {
    if (!representationVideoSrc) return;
    const video = representationVideoRef.current;
    video?.play().catch(() => {});
  }, [representationVideoSrc]);

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

  // iPhone/mobile alternative to cursor: touch glow feedback.
  useEffect(() => {
    if (!isMobile) {
      setTouchFeedback((prev) => ({ ...prev, visible: false }));
      return;
    }

    const hideTouchFeedback = () => {
      if (touchFadeRef.current) window.clearTimeout(touchFadeRef.current);
      touchFadeRef.current = window.setTimeout(() => {
        setTouchFeedback((prev) => ({ ...prev, visible: false }));
      }, 220);
    };

    const showTouchFeedback = (x: number, y: number, burst: boolean) => {
      setTouchFeedback((prev) => ({
        x,
        y,
        visible: true,
        burst: burst ? prev.burst + 1 : prev.burst,
      }));
      hideTouchFeedback();
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      showTouchFeedback(touch.clientX, touch.clientY, true);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchPointRef.current = { x: touch.clientX, y: touch.clientY };
      if (touchRafRef.current !== null) return;
      touchRafRef.current = requestAnimationFrame(() => {
        touchRafRef.current = null;
        showTouchFeedback(
          touchPointRef.current.x,
          touchPointRef.current.y,
          false,
        );
      });
    };

    const onTouchEnd = () => {
      hideTouchFeedback();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      if (touchRafRef.current) cancelAnimationFrame(touchRafRef.current);
      if (touchFadeRef.current) window.clearTimeout(touchFadeRef.current);
      touchRafRef.current = null;
      touchFadeRef.current = null;
    };
  }, [isMobile]);

  const clearContactTimers = () => {
    contactTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    contactTimersRef.current = [];
  };

  const updateContactHeading = (text: string) => {
    if (contactTextRef.current === text) return;
    contactTextRef.current = text;
    setContactHeadingText(text);
    setContactHeadingTick((tick) => tick + 1);
  };

  const handleContactHeadingEnter = () => {
    if (contactAnimatingRef.current) return;
    contactAnimatingRef.current = true;
    clearContactTimers();
    updateContactHeading(contactHeadingAlt);
    contactTimersRef.current.push(
      window.setTimeout(() => {
        updateContactHeading(contactHeadingDefault);
        contactAnimatingRef.current = false;
      }, 520),
    );
  };

  const handleContactHeadingLeave = () => {
    clearContactTimers();
    contactAnimatingRef.current = false;
    updateContactHeading(contactHeadingDefault);
  };

  useEffect(() => {
    return () => {
      clearContactTimers();
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-background">
      {!isMobile && <CustomCursor />}
      {isMobile && (
        <div
          className={`mobile-touch-feedback ${
            touchFeedback.visible ? "mobile-touch-feedback-visible" : ""
          }`}
          style={{
            left: touchFeedback.x,
            top: touchFeedback.y,
          }}
          aria-hidden
        >
          <span
            key={touchFeedback.burst}
            className="mobile-touch-feedback-ring"
          />
          <span className="mobile-touch-feedback-core" />
        </div>
      )}
      {introActive && (
        <div
          className={`intro-overlay ${introFlash ? "intro-overlay-flash" : ""} ${
            introFading ? "intro-overlay-fade" : ""
          }`}
          aria-hidden
        >
          <div className="intro-word-wrap">
            <h2 className="intro-word">LIVE TWICE</h2>
            <div
              className={`intro-highlight ${introFlash ? "intro-highlight-active" : ""}`}
            />
          </div>
        </div>
      )}
      <GrainOverlay />
      {webglSupported === false ? (
        <ShaderFallback />
      ) : webglSupported === true ? (
        <ShaderBackground />
      ) : null}

      {/* Header — desktop: inline nav / mobile: burger menu */}
      <header className="fixed top-0 left-0 right-0 z-[60] border-b border-foreground/10 bg-black/60 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 py-3 md:px-8 md:py-5">
          {/* Logo */}
          <div
            className="cursor-pointer flex items-center"
            onClick={() => {
              scrollToSection(0);
              setMenuOpen(false);
            }}
          >
            <img
              src="/LT%20LOGO%20SHORT%20WHITE.svg"
              alt="Live Twice"
              className="h-5 md:h-7 w-auto"
            />
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
              ref={heroVideoRef}
              className="absolute inset-0 h-full w-full object-cover object-center will-change-transform"
              style={{ transform: "translateZ(0)", contain: "strict" }}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden
              src="/WEBSITE.mp4"
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/90"
              style={{ transform: "translateZ(0)" }}
            />
          </div>
          <div className="w-full text-center relative z-10">
            <div
              className="mb-8 overflow-hidden flex justify-center"
              style={{
                opacity: currentSection === 0 ? 1 : 0,
                transform:
                  currentSection === 0
                    ? "translateY(0) scale(1)"
                    : `translateY(${isMobile ? 56 : 30}px) scale(${isMobile ? 0.93 : 0.98})`,
                transition: isMobile
                  ? "all 0.95s cubic-bezier(0.22, 1, 0.36, 1)"
                  : "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <img
                src="/LT%20LOGO%20WHITE.svg"
                alt="Live Twice"
                className="w-[min(95vw,60rem)] h-auto max-h-[clamp(10rem,32vw,24rem)] object-contain"
              />
            </div>
            <p
              className="font-sans text-base sm:text-lg md:text-xl text-muted-foreground max-w-md sm:max-w-xl mx-auto"
              style={{
                opacity: heroRevealed ? 1 : 0,
                transform: heroRevealed
                  ? "translateY(0) scale(1)"
                  : `translateY(${isMobile ? 38 : 20}px) scale(${isMobile ? 0.96 : 1})`,
                transition: isMobile
                  ? "opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.2s, transform 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.2s"
                  : "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.25s, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.25s",
              }}
            >
              Life happens once, what you create lets you live again.
            </p>
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
            {/* Mobile: original Ushuaia photo */}
            <img
              src="/%27ABOUT%27%20PICS/20250620_Ushuaia_Calvin_Harris_0006.jpg"
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover object-center md:hidden"
            />
            {/* Desktop: ushuaia 1 */}
            <img
              src="/%27ABOUT%27%20PICS/ushuaia%201.jpg"
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover object-center hidden md:block"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/85" />
          </div>
          <div className="max-w-3xl text-center relative z-10">
            <h2
              className="font-sans text-[clamp(4rem,15vw,12rem)] font-bold leading-[0.9] tracking-tighter text-foreground"
              style={{
                opacity: currentSection === 1 ? 1 : 0,
                transform:
                  currentSection === 1
                    ? "translateY(0) scale(1)"
                    : `translateY(${isMobile ? 52 : 30}px) scale(${isMobile ? 0.94 : 0.98})`,
                transition: isMobile
                  ? "all 0.95s cubic-bezier(0.22, 1, 0.36, 1)"
                  : "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              ABOUT
            </h2>
            <p
              className="text-muted-foreground text-base sm:text-lg md:text-2xl leading-relaxed max-w-2xl mx-auto"
              style={{
                opacity: currentSection === 1 ? 1 : 0,
                transform:
                  currentSection === 1
                    ? "translateY(0)"
                    : `translateY(${isMobile ? 34 : 30}px)`,
                transition: isMobile
                  ? "all 1s cubic-bezier(0.22, 1, 0.36, 1) 0.16s"
                  : "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
              }}
            >
              Live Twice is a creative group focused on capturing moments,
              generating attention and ensuring longevity in social media. A
              presence built for what lasts.
            </p>
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
              className="absolute inset-0 h-full w-full object-cover object-center will-change-transform"
              style={{ transform: "translateZ(0)", contain: "strict" }}
              src={representationVideoSrc ?? undefined}
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
              onCanPlay={() => representationVideoRef.current?.play().catch(() => {})}
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Centre copy only: "Representing" */}
          <div className="relative z-10 flex items-center justify-center text-center px-5">
            <h2
              className="font-sans text-[clamp(2.25rem,8vw,12rem)] sm:text-[clamp(4rem,15vw,12rem)] font-bold leading-[0.9] tracking-tighter text-foreground"
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
                currentSection === 3
                  ? "translateY(0) scale(1)"
                  : `translateY(${isMobile ? 34 : 20}px) scale(${isMobile ? 0.96 : 1})`,
              transition: isMobile
                ? "opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)"
                : "opacity 0.6s ease-out, transform 0.6s ease-out",
            }}
          >
            <h2
              className="font-sans text-[clamp(4rem,15vw,12rem)] font-bold leading-[0.9] tracking-tighter text-foreground mb-8 sm:mb-10 md:mb-12"
              onMouseEnter={handleContactHeadingEnter}
              onMouseLeave={handleContactHeadingLeave}
            >
              <span
                key={`${contactHeadingText}-${contactHeadingTick}`}
                className={`contact-heading-swap ${
                  contactHeadingText === contactHeadingAlt
                    ? "contact-heading-live-twice"
                    : "contact-heading-lets-talk"
                }`}
              >
                {contactHeadingText}
              </span>
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

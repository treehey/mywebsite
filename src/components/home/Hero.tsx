"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence, useTransform } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { DICT } from "@/lib/data";
import { DanmakuSystem } from "@/components/DanmakuSystem";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ════════════════════════════════════════════════════════
   ELEGANT HTML5 PARTICLE CANVAS
   ════════════════════════════════════════════════════════ */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const numParticles = Math.min(80, Math.floor((width * height) / 15000));

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.8,
      });
    }

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const isLight = document.documentElement.classList.contains("light");
      const color = isLight ? "rgba(17, 17, 17, " : "rgba(242, 242, 242, ";

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        if (mouse.x > 0) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 1500;
            p.x += (dx / dist) * force * 4;
            p.y += (dy / dist) * force * 4;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${color}0.12)`;
        ctx.fill();
      });




      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[-1]"
    />
  );
}

export default function Hero({ 
  lang, 
  theme = "dark",
  slothMode, 
  heroClickedSet = new Set(), 
  heroExploding = new Set(), 
  heroVectors = {}, 
  onCharClick,
  onSlothDismiss
}: { 
  lang: "EN" | "简" | "繁";
  theme?: string;
  slothMode?: boolean;
  heroClickedSet?: Set<string>;
  heroExploding?: Set<string>;
  heroVectors?: Record<string, { x: number; y: number; rotate: number }>;
  onCharClick?: (wIdx: number, charIdx: number) => void;
  onSlothDismiss?: () => void;
}) {
  const t = DICT[lang].hero;
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const handlePanel = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setIsPanelOpen(!!detail?.open);
    };
    window.addEventListener("guestbook:panel", handlePanel);
    return () => window.removeEventListener("guestbook:panel", handlePanel);
  }, []);
  
  // GSAP Refs
  const containerRef = useRef<HTMLElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const uiElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Sloth Mode Refs
  const slothBgRef = useRef<HTMLDivElement>(null);
  const slothMascotRef = useRef<HTMLDivElement>(null);
  const slothTitleRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const activeUI = uiElementsRef.current.filter(Boolean);
    const activeLetters = letterRefs.current.filter(Boolean);

    // 1. Clear any previous inline styles to avoid stale state from React-GSAP fighting
    gsap.set([
      textContainerRef.current,
      slothTitleRef.current,
      slothMascotRef.current,
      slothBgRef.current,
      backgroundRef.current,
      ...activeUI
    ], { clearProps: "all" });

    if (activeLetters.length > 0) {
      gsap.set(activeLetters, { clearProps: "all" });
    }

    // 2. Establish starting states based on mode (zero race condition with React rendering)
    if (slothMode) {
      gsap.set(textContainerRef.current, { opacity: 0, scale: 0.85, visibility: "hidden" });
      gsap.set(slothTitleRef.current, { opacity: 1, scale: 1, visibility: "visible" });
      gsap.set(slothMascotRef.current, { opacity: 1, scale: 1, y: 0, visibility: "visible" });
      gsap.set(slothBgRef.current, { opacity: 1, visibility: "visible" });
    } else {
      gsap.set(textContainerRef.current, { opacity: 1, scale: 1, visibility: "visible" });
      gsap.set(slothTitleRef.current, { opacity: 0, scale: 0.85, visibility: "hidden" });
      gsap.set(slothMascotRef.current, { opacity: 0, scale: 0.8, y: -100, visibility: "hidden" });
      gsap.set(slothBgRef.current, { opacity: 0, visibility: "hidden" });
    }

    // Timeline that controls the entire Hero animation triggered using absolute scroll positions
    // This bypasses any pinnedContainer offset calculation bugs during dynamic layout changes.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero-about-wrapper",
        start: 0,
        end: 300, 
        scrub: true,
      }
    });

    // Fade out the dark background completely to reveal the About section underneath
    tl.to(backgroundRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: "none"
    }, 0.75);

    // Animate out the UI elements gradually, synced to stick around MUCH longer
    tl.to(uiElementsRef.current, {
      autoAlpha: 0,
      y: -40,
      duration: 0.4,
      ease: "power2.inOut"
    }, 0.2);

    if (slothMode) {
      // Sloth Title zoom-out transition on scroll
      if (slothTitleRef.current) {
        tl.fromTo(slothTitleRef.current,
          { scale: 1, opacity: 1 },
          {
            scale: 25,
            opacity: 0,
            force3D: true,
            duration: 0.9,
            transformOrigin: "50% 50%",
            ease: "power2.in"
          },
          0.0
        );
      }

      // Sloth Mascot transition on scroll
      if (slothMascotRef.current) {
        tl.fromTo(slothMascotRef.current,
          { opacity: 1, scale: 1, y: 0 },
          {
            opacity: 0,
            scale: 0.8,
            y: -100,
            duration: 0.6,
            ease: "power2.in"
          },
          0.1
        );
      }

      // Sloth Backdrop transition on scroll
      if (slothBgRef.current) {
        tl.fromTo(slothBgRef.current,
          { opacity: 1 },
          {
            opacity: 0,
            duration: 0.25,
            ease: "none"
          },
          0.75
        );
      }
    } else {
      // Center hole penetration - widen the words and scatter the letters immensely
      letterRefs.current.forEach((el, i) => {
        if (!el) return;
        const isLeft = i < 4;
        const moveX = isLeft ? -800 - Math.random() * 400 : 800 + Math.random() * 400;
        const moveY = (Math.random() - 0.5) * 500;
        
        tl.fromTo(el,
          { x: 0, y: 0, z: 0, rotationZ: 0, rotationX: 0, rotationY: 0, filter: "blur(0px)" },
          {
            x: moveX,
            y: moveY,
            z: 800 + Math.random() * 400,
            rotationZ: (Math.random() - 0.5) * 120,
            rotationX: (Math.random() - 0.5) * 120,
            rotationY: (Math.random() - 0.5) * 120,
            filter: "blur(12px)",
            duration: 0.9,
            ease: "power2.in"
          },
          0.1
        );
      });

      // Center hole penetration
      if (textContainerRef.current) {
        tl.fromTo(textContainerRef.current,
          { scale: 1, opacity: 1 },
          {
            scale: 25,
            opacity: 0,
            force3D: true,
            duration: 0.9,
            transformOrigin: "50% 50%",
            ease: "power2.in" 
          },
          0.0
        );
      }
    }

    // Force a full refresh to ensure ScrollTrigger measures correctly
    ScrollTrigger.refresh();

  }, { scope: containerRef, dependencies: [slothMode] });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 25, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 25, mass: 0.5 });

  const slothX1 = useTransform(springX, (val) => val * -1.2);
  const slothY1 = useTransform(springY, (val) => val * -1.2);
  const slothX2 = useTransform(springX, (val) => val * -0.8);
  const slothY2 = useTransform(springY, (val) => val * -0.8);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      mouseX.set(x * 30);
      mouseY.set(y * 30);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section ref={containerRef} className="relative w-full h-[100svh] z-[100]">
      <div 
        className="w-full h-[100svh] overflow-hidden flex flex-col justify-end pb-12 md:pb-24 px-6 md:px-12 selection:bg-white/30 pointer-events-auto"
      >
        <div ref={backgroundRef} className="absolute inset-0 bg-background z-[-2]"></div>
        <ParticleCanvas />

        <div className="absolute inset-0 pointer-events-none z-[60]" ref={(el) => { if(el) uiElementsRef.current[0] = el; }}>
          <DanmakuSystem lang={lang} />
        </div>

      {/* Sloth Cinematic Backdrop (GSAP Wrapper) */}
      <div
        ref={slothBgRef}
        className="absolute inset-0 z-40 pointer-events-none"
      >
        <AnimatePresence>
          {slothMode && (
            <motion.div
              className="absolute inset-0 bg-[#030305] flex items-center justify-center overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
              <motion.div
                className="absolute font-syne font-black text-[45vw] tracking-tighter leading-none opacity-5 whitespace-nowrap text-foreground will-change-transform"
                style={{ x: slothX1, y: slothY1 }}
              >
                SLOTH
              </motion.div>
              <motion.div
                className="absolute font-syne font-black text-[35vw] tracking-tighter leading-none opacity-[0.02] whitespace-nowrap text-foreground scale-y-[-1] mt-[30vw] will-change-transform"
                style={{ x: slothX2, y: slothY2 }}
              >
                SLOTH
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-12 relative z-50">
        
        <motion.div 
          style={{ x: springX, y: springY }}
          className={`flex flex-col font-syne font-black text-[15vw] leading-[0.85] uppercase whitespace-nowrap z-50 relative ${
            theme === "light" ? "tracking-[-0.075em]" : "tracking-tighter"
          }`}
        >
          {/* SLOTH Easter Egg Title Overlay (GSAP Wrapper) */}
          <div 
            ref={slothTitleRef}
            className="pointer-events-none absolute left-0 top-0 w-full h-full z-10"
          >
            <AnimatePresence>
              {slothMode && (
                <motion.div
                  className="flex w-full h-full"
                  initial={{ scale: 1.1, opacity: 0, filter: "blur(15px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  exit={{ scale: 0.9, opacity: 0, filter: "blur(15px)" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {"SLOTH".split("").map((ch, i) => {
                    const v = heroVectors[`sloth-${i}`] ?? { x: 0, y: -200, rotate: 0 };
                    return (
                      <motion.div
                        key={`sloth-${i}`}
                        className="relative inline-block overflow-visible will-change-transform"
                        initial={{ x: v.x, y: v.y, rotate: v.rotate, opacity: 0, scale: 0.4 }}
                        animate={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 + i * 0.08 }}
                      >
                        <span className="relative z-10 text-[#fafafa] drop-shadow-[0_0_40px_rgba(255,255,255,0.6)]">
                          {ch}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TREE HEY. Original Title (Always Mounted to Preserve GSAP Refs) */}
          <div 
            ref={textContainerRef}
            style={{ perspective: "1000px" }} 
            className="flex flex-col transform-origin-fly-through"
          >
            <div
              className={`flex flex-col transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                slothMode 
                  ? "opacity-0 pointer-events-none scale-[0.85] blur-xl" 
                  : "opacity-100 scale-100 blur-none"
              }`}
            >
              {["TREE", "HEY."].map((word, wIdx) => {
                const startIdx = wIdx === 0 ? 0 : 4;
                return (
                  <div 
                    key={word} 
                    className={`relative overflow-visible flex items-center ${wIdx === 0 ? "pt-4 -mt-4" : ""}`}
                  >
                    {word.split("").map((ch, i) => {
                      const isLetter = /[A-Z.]/.test(ch);
                      const key = `${wIdx}-${i}`;
                      const isExploding = heroExploding.has(key);
                      const isClicked = heroClickedSet.has(key);
                      const v = heroVectors[key] ?? { x: (Math.random() - 0.5) * 400, y: -200, rotate: 45 };

                      return (
                        <div
                          key={i}
                          className="inline-block"
                          ref={(el) => { if(el) letterRefs.current[startIdx + i] = el; }}
                          style={{ transformOrigin: "center center" }}
                        >
                          <motion.span
                            onClick={() => isLetter && onCharClick && onCharClick(wIdx, i)}
                            animate={isExploding ? { x: v.x, y: v.y, rotate: v.rotate, opacity: 0, scale: 1.5 } : { x: 0, y: 0, rotateZ: 0, opacity: isClicked ? 0.3 : 1, rotateX: 0, scale: 1 }}
                            whileHover={isExploding ? {} : { y: -22, scale: 1.15, rotate: (i % 2 === 0 ? -6 : 6), transition: { type: "spring", stiffness: 350, damping: 10 } }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            style={{ display: "inline-block", transformOrigin: "center center" }}
                            className={`text-foreground ${isLetter ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                          >
                            {ch}
                          </motion.span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div ref={(el) => { if(el) uiElementsRef.current[1] = el; }}>
        <motion.div 
          className="max-w-md space-y-4 md:text-right pb-4 will-change-transform"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          {slothMode ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="space-y-4 font-geist text-[#a8a8a8]"
              >
                <div className="flex flex-col md:items-end uppercase tracking-[0.2em] text-[10px] md:text-xs font-medium space-y-1 mt-12 opacity-70">
                  <span className="block border-b border-white/20 pb-1">Sloth Dimension</span>
                  <span className="block">Time Dilated</span>
                </div>
                <p className="text-sm md:text-base leading-relaxed text-white/60 font-light">
                  "Take a breath. The world can wait."
                </p>
                <button 
                  className="mt-6 border border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-all duration-500 px-8 py-4 uppercase tracking-[0.3em] text-[10px] font-medium group relative overflow-hidden rounded-full"
                  onClick={onSlothDismiss}
                >
                  <span className="relative z-10">RETURN</span>
                  <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                </button>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div 
              className="max-w-sm flex flex-col gap-6 md:pb-8 relative z-20 bg-[var(--card-bg)] backdrop-blur-2xl border border-[var(--card-border)] shadow-[var(--card-shadow)] p-8 rounded-[2rem]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: isPanelOpen ? 0 : 1, 
                y: isPanelOpen ? 20 : 0,
                scale: isPanelOpen ? 0.95 : 1,
                pointerEvents: isPanelOpen ? "none" : "auto"
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-grotesk text-sm md:text-base text-foreground/70 leading-relaxed font-light">
                {t.desc}
              </p>
              
              <div className="flex items-center gap-6 font-grotesk text-[11px] md:text-xs">
                <div className="flex flex-col gap-1.5">
                  <span className="text-foreground/45 uppercase tracking-widest">{t.loc}</span>
                  <span className="text-foreground font-medium">{t.locVal}</span>
                </div>
                <div className="w-[1px] h-8 bg-foreground/10" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-foreground/45 uppercase tracking-widest">{t.foc}</span>
                  <span className="text-foreground font-medium">{t.focVal}</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
        </div>
      </div>

      {/* Sloth Mascot (GSAP Wrapper) */}
      <div
        ref={slothMascotRef}
        className="absolute top-[18%] md:top-[22%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-45 pointer-events-none"
      >
        <AnimatePresence>
          {slothMode && (
            <motion.div
              className="select-none cursor-pointer group pointer-events-auto"
              initial={{ scale: 0.8, y: -50, opacity: 0, filter: "blur(20px)" }}
              animate={{ scale: 1, y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.9, y: 50, opacity: 0, filter: "blur(20px)" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              onClick={onSlothDismiss}
            >
              <motion.img
                src={process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/sloth_color.png` : "/sloth_color.png"}
                alt="sloth mascot"
                className="w-36 md:w-56 lg:w-72 brightness-110 contrast-125 drop-shadow-[0_0_80px_rgba(255,255,255,0.25)] group-hover:drop-shadow-[0_0_120px_rgba(255,255,255,0.6)] group-hover:brightness-125 transition-all duration-700 hover:scale-[1.03]"
                animate={{ 
                  y: [-12, 12, -12],
                  rotate: [-2, 2, -2]
                }}
                transition={{ 
                  y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                  rotate: { repeat: Infinity, duration: 8, ease: "easeInOut" }
                }}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-xs md:text-sm text-white/0 group-hover:text-white/80 tracking-[0.4em] uppercase transition-colors duration-500 whitespace-nowrap pointer-events-none drop-shadow-lg font-bold">
                [ Disconnect ]
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div ref={(el) => { if (el) uiElementsRef.current[2] = el; }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div 
          className="flex items-center gap-3 backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] px-5 py-2.5 rounded-full shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-3.5 h-6 rounded-full border border-white/40 flex items-start justify-center p-[2px]">
            <motion.div 
              animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }} 
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} 
              className="w-1 h-1.5 bg-white rounded-full" 
            />
          </div>
          <span className="font-grotesk text-[10px] text-white/70 uppercase tracking-widest whitespace-nowrap">Scroll</span>
        </motion.div>
      </div>

      <div 
        ref={(el) => { if (el) uiElementsRef.current[3] = el; }} 
        className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden" 
      >
        <motion.div 
          className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full"
          style={{ 
            background: "radial-gradient(circle, var(--glow-color-1) 0%, rgba(0,0,0,0) 70%)", 
            filter: "blur(90px)",
            mixBlendMode: "var(--glow-blend)" as any,
            opacity: "var(--glow-opacity)" as any
          }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full"
          style={{ 
            background: "radial-gradient(circle, var(--glow-color-2) 0%, rgba(0,0,0,0) 70%)", 
            filter: "blur(100px)",
            mixBlendMode: "var(--glow-blend)" as any,
            opacity: "var(--glow-opacity)" as any
          }}
          animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      </div>
    </section>
  );
}

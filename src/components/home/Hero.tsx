"use client";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { DICT } from "@/lib/data";
import { DanmakuSystem } from "@/components/DanmakuSystem";

const maskVariants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as any } }
};

export default function Hero({ 
  lang, 
  slothMode, 
  heroClickedSet = new Set(), 
  heroExploding = new Set(), 
  heroVectors = {}, 
  onCharClick,
  onSlothDismiss
}: { 
  lang: "EN" | "简" | "繁";
  slothMode?: boolean;
  heroClickedSet?: Set<string>;
  heroExploding?: Set<string>;
  heroVectors?: Record<string, { x: number; y: number; rotate: number }>;
  onCharClick?: (wIdx: number, charIdx: number) => void;
  onSlothDismiss?: () => void;
}) {
  const t = DICT[lang].hero;
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  
  // Parallax effects
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 600]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Magnetic Title mouse interaction
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
    <motion.section ref={containerRef}
      style={{ y: yParallax, opacity: opacityFade }}
      className="relative w-full h-[100svh] overflow-hidden flex flex-col justify-end pb-12 md:pb-24 px-6 md:px-12 z-10 selection:bg-white/30"
    >
      <DanmakuSystem lang={lang} />

      {/* ── Awwwards Sloth Easter Egg Cinematic Takeover ── */}
      <AnimatePresence>
        {slothMode && (
          <motion.div
            key="sloth-cinematic-bg"
            className="fixed inset-0 z-40 bg-background/90 backdrop-blur-3xl flex items-center justify-center overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Spotlight Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] mix-blend-screen" />

            {/* Giant Drifting Background Typography */}
            <motion.div
              className="absolute font-syne font-black text-[45vw] tracking-tighter leading-none opacity-5 whitespace-nowrap text-foreground mix-blend-overlay"
              style={{
                x: slothX1,
                y: slothY1
              }}
            >
              SLOTH
            </motion.div>
            <motion.div
              className="absolute font-syne font-black text-[35vw] tracking-tighter leading-none opacity-[0.02] whitespace-nowrap text-foreground mix-blend-overlay scale-y-[-1] mt-[30vw]"
              style={{
                x: slothX2,
                y: slothY2
              }}
            >
              SLOTH
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-12 relative z-50">
        
        {/* Main Title with subtle 3D / Magnetic Follow */}
        <motion.div 
          style={{ x: springX, y: springY }}
          className="flex flex-col font-syne font-black text-[15vw] leading-[0.85] tracking-tighter uppercase whitespace-nowrap z-50"
        >
          {slothMode ? (
            <motion.div 
              className="flex pointer-events-none"
              initial={{ scale: 1.1, opacity: 0, filter: "blur(15px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {"SLOTH".split("").map((ch, i) => {
                const v = heroVectors[`sloth-${i}`] ?? { x: 0, y: -200, rotate: 0 };
                return (
                  <motion.div
                    key={`sloth-${i}`}
                    className="relative inline-block overflow-visible mix-blend-difference"
                    initial={{ x: v.x, y: v.y, rotate: v.rotate, opacity: 0, scale: 0.4 }}
                    animate={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.3 + i * 0.08 }}
                  >
                    <span className="relative z-10 text-[#fafafa] drop-shadow-[0_0_40px_rgba(255,255,255,0.6)]">
                      {ch}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <>
              {['TREE', 'HEY.'].map((word, wIdx) => (
                <div key={word} className={`reveal-mask overflow-hidden ${wIdx === 0 ? 'pt-4 -mt-4' : ''}`}>
                  <motion.div variants={maskVariants} initial="hidden" animate="visible" transition={{ delay: wIdx * 0.1 }} className="flex items-center">
                    {word.split("").map((ch, i) => {
                      const isLetter = /[A-Z]/.test(ch);
                      const key = `${wIdx}-${i}`;
                      const isExploding = heroExploding.has(key);
                      const isClicked = heroClickedSet.has(key);
                      const v = heroVectors[key] ?? { x: (Math.random() - 0.5) * 400, y: -200, rotate: 45 };

                      return (
                        <motion.span
                          key={i}
                          onClick={() => isLetter && onCharClick && onCharClick(wIdx, i)}
                          animate={isExploding ? { x: v.x, y: v.y, rotate: v.rotate, opacity: 0, scale: 1.5 } : { x: 0, y: 0, rotate: 0, opacity: isClicked ? 0.3 : 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          className={`inline-block text-foreground ${isLetter ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
                        >
                          {ch}
                        </motion.span>
                      );
                    })}
                  </motion.div>
                </div>
              ))}
            </>
          )}
        </motion.div>

        {/* Subtitle & Awwwards Meta Info */}
        <motion.div 
          className="max-w-md space-y-4 md:text-right mix-blend-difference pb-4"
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
                <div className="flex flex-col md:items-end uppercase tracking-[0.2em] text-[10px] md:text-xs font-medium space-y-1 mt-12">
                  <span className="block border-b border-[#333] pb-1">Hidden System: 0xSLOTH</span>
                  <span className="block">Status: OVERRIDDEN</span>
                </div>
                <p className="text-sm md:text-base leading-relaxed text-[#c0c0c0] font-light italic">
                  "You found the secret frequency."
                </p>
                <button 
                  className="mt-6 border border-[#fafafa] bg-transparent text-[#fafafa] hover:bg-[#fafafa] hover:text-black transition-colors duration-300 px-6 py-4 uppercase tracking-widest text-[10px] font-mono group relative overflow-hidden"
                  onClick={onSlothDismiss}
                >
                  <span className="relative z-10">RESTORE SYSTEM</span>
                  <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                </button>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div 
              className="max-w-sm flex flex-col gap-6 md:pb-8 relative z-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-grotesk text-sm md:text-base text-neutral-400 leading-relaxed font-light mix-blend-difference">
                {t.desc}
              </p>
              
              <div className="grid grid-cols-2 gap-4 font-mono text-[10px] md:text-xs uppercase tracking-widest text-neutral-500">
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-600 border-b border-white/10 pb-2 mb-1">{t.loc}</span>
                  <span className="text-white/90">{t.locVal}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-600 border-b border-white/10 pb-2 mb-1">{t.foc}</span>
                  <span className="text-white/90">{t.focVal}</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Sloth Easter Egg Mascot ── */}
      <AnimatePresence>
        {slothMode && (
          <motion.div
            key="sloth-mascot"
            className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] select-none cursor-pointer group"
            initial={{ scale: 0.8, y: -50, opacity: 0, filter: "blur(20px)" }}
            animate={{ scale: 1, y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.9, y: 50, opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            onClick={onSlothDismiss}
          >
            <motion.img
              src={process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/sloth_color.png` : "/sloth_color.png"}
              alt="sloth mascot"
              className="w-48 md:w-64 lg:w-80 brightness-110 contrast-125 drop-shadow-[0_0_80px_rgba(255,255,255,0.25)] group-hover:drop-shadow-[0_0_120px_rgba(255,255,255,0.6)] group-hover:brightness-125 transition-all duration-700 hover:scale-[1.03]"
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

      {/* Decorative Grid / Scroll hint */}
      <motion.div 
        className="w-full flex justify-between items-center border-t border-white/10 pt-6 font-mono text-[10px] text-neutral-500 uppercase tracking-[0.2em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
          <span>SCROLL TO EXPLORE</span>
        </div>
        <span>PORTFOLIO v3.1</span>
      </motion.div>

      {/* Video / Gradient Abstract blob in background */}
      <div className="absolute right-[10%] top-[30%] w-[40vw] h-[40vw] rounded-full mix-blend-screen filter blur-[100px] opacity-30 pointer-events-none -z-10" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(0,0,0,0) 70%)" }} />
    </motion.section>
  );
}





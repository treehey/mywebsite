"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { DICT } from "@/lib/data";
import { DanmakuSystem } from "@/components/DanmakuSystem";

const maskVariants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as any } }
};

export default function Hero({ lang }: { lang: "EN" | "简" | "繁" }) {
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

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-12 relative z-10">
        
        {/* Main Title with subtle 3D / Magnetic Follow */}
        <motion.div 
          style={{ x: springX, y: springY }}
          className="flex flex-col font-syne font-black text-[15vw] leading-[0.85] tracking-tighter uppercase whitespace-nowrap"
        >
          <div className="reveal-mask overflow-hidden pt-4 -mt-4">
            <motion.div variants={maskVariants} initial="hidden" animate="visible" className="flex items-center gap-4">
              TREE
            </motion.div>
          </div>
          <div className="reveal-mask overflow-hidden">
            <motion.div variants={maskVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              HEY.
            </motion.div>
          </div>
        </motion.div>

        {/* Info Box */}
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
      </div>

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





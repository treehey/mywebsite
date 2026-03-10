"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [done, setDone]           = useState(false);
  const [progress, setProgress]   = useState(0);
  const [glitch, setGlitch]       = useState(false);

  useEffect(() => {
    const TOTAL = 2800;
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const p = Math.min(100, ((Date.now() - start) / TOTAL) * 100);
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Random glitch bursts
    const gInterval = setInterval(() => {
      if (Math.random() > 0.55) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 80 + Math.random() * 140);
      }
    }, 1400);

    const minWait  = new Promise<void>(r => setTimeout(r, TOTAL + 200));
    const pageLoad = new Promise<void>(r => {
      if (document.readyState === "complete") r();
      else window.addEventListener("load", () => r(), { once: true });
    });
    Promise.all([minWait, pageLoad]).then(() => setDone(true));
    return () => { cancelAnimationFrame(raf); clearInterval(gInterval); };
  }, []);

  const B = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden"
          style={{ background: "#07070F", fontFamily: "var(--font-mono, monospace)" }}
        >
          {/* ── Grid bg ── */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }} />

          {/* ── Radial glow center ── */}
          <div className="absolute pointer-events-none" style={{
            width: 640, height: 640,
            background: "radial-gradient(circle, rgba(0,245,255,0.055) 0%, transparent 65%)",
            top: "50%", left: "50%", transform: "translate(-50%,-54%)",
          }} />
          <div className="absolute pointer-events-none" style={{
            width: 360, height: 360,
            background: "radial-gradient(circle, rgba(255,45,120,0.04) 0%, transparent 70%)",
            top: "55%", left: "52%", transform: "translate(-50%,-50%)",
          }} />

          {/* ── Top bar ── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute top-7 left-8 right-8 flex items-center justify-between"
          >
            <span className="text-[8px] tracking-[0.55em] text-[#00F5FF]/30 uppercase">SYS.BOOT // v2.0</span>
            <motion.span
              className="text-[8px] tracking-[0.3em]"
              style={{ color: glitch ? "#FF2D78" : "rgba(226,226,236,0.18)" }}
            >
              {Math.round(progress).toString().padStart(3, "0")}%
            </motion.span>
          </motion.div>

          {/* ── Main sloth block ── */}
          <div className="relative flex flex-col items-center gap-7">

            {/* Rotating outer rings */}
            <div className="absolute" style={{ width: 260, height: 260, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "1px solid rgba(0,245,255,0.12)" }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
              >
                {/* tick marks */}
                {[0, 90, 180, 270].map(deg => (
                  <div key={deg} className="absolute" style={{
                    width: 6, height: 1,
                    background: "#00F5FF",
                    top: "50%", left: 0,
                    transformOrigin: "130px 0",
                    transform: `rotate(${deg}deg) translateY(-50%)`,
                    opacity: 0.6,
                  }} />
                ))}
              </motion.div>
              <motion.div
                className="absolute rounded-full"
                style={{ inset: 14, border: "1px dashed rgba(255,45,120,0.1)" }}
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
              />
            </div>

            {/* Sloth + scan line + ZZZ */}
            <div className="relative" style={{ width: 140, height: 140 }}>

              {/* Scan line sweeping down */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 3 }}>
                <motion.div
                  className="absolute left-0 right-0"
                  style={{
                    height: 2,
                    background: "linear-gradient(90deg, transparent 0%, #00F5FF 40%, #00F5FF 60%, transparent 100%)",
                    opacity: 0.55,
                    boxShadow: "0 0 10px #00F5FF",
                  }}
                  animate={{ top: ["-2%", "102%"] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "linear", repeatDelay: 0.4 }}
                />
              </div>

              {/* Sloth — inverted to white, neon glow */}
              <motion.img
                src={`${B}/sloth.svg`}
                alt="sloth"
                width={140}
                height={140}
                style={{
                  position: "relative", zIndex: 1,
                  filter: glitch
                    ? "brightness(0) invert(1) drop-shadow(3px 0 #FF2D78) drop-shadow(-3px 0 #39FF14) drop-shadow(0 0 20px rgba(0,245,255,0.8))"
                    : "brightness(0) invert(1) drop-shadow(0 0 16px rgba(0,245,255,0.75)) drop-shadow(0 0 40px rgba(0,245,255,0.25))",
                  transition: "filter 0.05s",
                }}
                animate={{ y: [0, -7, 0] }}
                transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
              />

              {/* ZZZ */}
              {[
                { ch: "z", sz: 12, x: 96,  y: 22,  delay: 0   },
                { ch: "z", sz: 15, x: 113, y: 6,   delay: 0.75 },
                { ch: "Z", sz: 19, x: 133, y: -11, delay: 1.5  },
              ].map((z, i) => (
                <motion.span
                  key={i}
                  className="absolute italic pointer-events-none"
                  style={{
                    fontSize: z.sz, left: z.x, top: z.y, zIndex: 4,
                    color: "#00F5FF",
                    textShadow: "0 0 12px #00F5FF, 0 0 24px #00F5FF80",
                  }}
                  animate={{ y: [0, -15, -30], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2.1, delay: z.delay, ease: "easeOut" }}
                >
                  {z.ch}
                </motion.span>
              ))}
            </div>

            {/* Tagline with glitch */}
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className="text-[11px] uppercase tracking-[0.55em]"
                style={{
                  color: "#00F5FF",
                  textShadow: glitch
                    ? "3px 0 #FF2D78, -3px 0 #39FF14, 0 0 14px #00F5FF"
                    : "0 0 14px rgba(0,245,255,0.55)",
                  display: "inline-block",
                  transform: glitch ? `translateX(${Math.random() > 0.5 ? 3 : -3}px)` : "none",
                  transition: "text-shadow 0.05s, transform 0.05s",
                }}
              >
                SLOW AND STEADY
              </span>
              <span className="text-[8px] tracking-[0.4em] text-[#E2E2EC]/20 uppercase">
                TREE HEY // SIGNAL & NOISE
              </span>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="relative w-60 overflow-visible" style={{ height: 1 }}>
                {/* Track */}
                <div className="absolute inset-0 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                {/* Fill */}
                <div className="absolute inset-y-0 left-0 rounded-full" style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #00F5FF, #B200FF, #FF2D78)",
                  boxShadow: "0 0 10px rgba(0,245,255,0.5)",
                  transition: "width 80ms linear",
                }} />
                {/* Tip dot */}
                <div className="absolute rounded-full" style={{
                  width: 5, height: 5,
                  background: "#00F5FF",
                  boxShadow: "0 0 8px #00F5FF, 0 0 16px #00F5FF",
                  left: `calc(${progress}% - 2.5px)`,
                  top: -2,
                  transition: "left 80ms linear",
                }} />
              </div>

              {/* Segment ticks */}
              <div className="flex items-center gap-1 w-60 justify-between px-0.5">
                {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
                  <div key={i} className="rounded-full transition-all duration-200" style={{
                    width: i % 5 === 0 ? 2 : 1,
                    height: i % 5 === 0 ? 4 : 3,
                    background: progress >= i * 10
                      ? (i % 5 === 0 ? "#00F5FF" : "rgba(0,245,255,0.5)")
                      : "rgba(255,255,255,0.1)",
                    boxShadow: progress >= i * 10 && i % 5 === 0 ? "0 0 6px #00F5FF" : "none",
                  }} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Bottom status ── */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="absolute bottom-7 left-8 right-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <motion.span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#00F5FF", boxShadow: "0 0 6px #00F5FF" }}
                animate={{ opacity: [1, 0.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.1 }}
              />
              <span className="text-[8px] tracking-[0.4em] text-[#E2E2EC]/18 uppercase">INITIALIZING</span>
            </div>
            <span className="text-[8px] tracking-[0.3em] text-[#E2E2EC]/14">TH // 2026</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

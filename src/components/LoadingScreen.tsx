"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Phase 1: 指数缓动趋近 P1_CAP，等待页面加载
// Phase 2: window.load 触发后，快速填满至 100%
// 到达 100% 后等 SETTLE_MS 再隐藏
const MIN_MS    = 1000; // 最短展示时间，防止快速网络下闪退
const P1_CAP    = 88;   // phase 1 最大进度
const P1_TAU    = 1400; // 指数时间常数（ms），控制 phase 1 速度
const P2_DUR    = 500;  // phase 2 从当前→100% 的动画时长（ms）
const SETTLE_MS = 350;  // 停在 100% 后等待再隐藏（ms）

export default function LoadingScreen() {
  const [done, setDone]         = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    let raf: number;
    let phase       = 1 as 1 | 2;
    let phase2Start = 0;
    let phase2From  = 0;
    let settling    = false;

    const enterPhase2 = () => {
      if (phase === 2) return;
      const elapsed = Date.now() - startTime;
      phase2From  = Math.min(P1_CAP, P1_CAP * (1 - Math.exp(-elapsed / P1_TAU)));
      phase2Start = Date.now();
      phase       = 2;
    };

    const onPageLoad = () => {
      const remaining = MIN_MS - (Date.now() - startTime);
      if (remaining > 0) {
        setTimeout(enterPhase2, remaining);
      } else {
        enterPhase2();
      }
    };

    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad, { once: true });
    }

    const tick = () => {
      let p: number;

      if (phase === 1) {
        const elapsed = Date.now() - startTime;
        p = P1_CAP * (1 - Math.exp(-elapsed / P1_TAU));
        p = Math.min(p, P1_CAP);
      } else {
        const t     = Math.min(1, (Date.now() - phase2Start) / P2_DUR);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        p = phase2From + (100 - phase2From) * eased;
      }

      setProgress(p);

      if (p >= 100 && !settling) {
        settling = true;
        setTimeout(() => setDone(true), SETTLE_MS);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onPageLoad);
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1, y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col justify-end p-8 md:p-16 select-none bg-[#070707] text-[#E2E2EC] overflow-hidden"
          style={{ fontFamily: "var(--font-mono, monospace)" }}
        >
          {/* ====== 1. Massive Sloth Watermark (Background Texture) ====== */}
          <div className="absolute right-[-20vw] sm:right-[-10vw] top-1/2 -translate-y-1/2 opacity-[0.15] md:opacity-[0.25] pointer-events-none w-[150vw] sm:w-[80vw] md:w-[70vw] max-w-[1200px] mix-blend-screen invert">
            <motion.img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/sloth.svg`}
              alt="Sloth Protocol"
              className="w-full h-auto object-contain"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* ====== 2. Lower Core Content (Awwwards Style Layering) ====== */}
          <div className="relative w-full flex flex-col md:flex-row justify-between items-end gap-12 border-b border-white/10 pb-8 z-10 max-w-[1800px] mx-auto">
            {/* Tech Assembly Text & Progress Bar */}
            <div className="flex flex-col gap-6 w-full md:w-1/3">
              <span className="text-[10px] text-white/50 tracking-[0.4em] uppercase">
                {progress < 40 ? "STATUS: WAKING_UP..." : progress < 80 ? "STATUS: CLIMBING_TREE..." : "STATUS: REACHED_TOP."}
              </span>
              
              <div className="relative w-full h-[1px] bg-white/10 overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-white"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-[#E2E2EC]/40 uppercase">
                <span>SLOTH.SYSTEM // INK.</span>
                <span>[ {Math.round(progress)}/100 ]</span>
              </div>
            </div>

            {/* Giant Pure Number */}
            <div className="relative font-syne font-black text-white leading-[0.8] mb-[-1.5rem]" style={{ fontSize: "clamp(6rem, 20vw, 18rem)" }}>
              {Math.round(progress)}
              <span className="text-[0.4em] align-top text-white/20 ml-2">%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

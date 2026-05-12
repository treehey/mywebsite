"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export let globalLenis: Lenis | null = null;

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 2.5, // 增加触摸滑动补偿，使手机端滑动更省力、更丝滑
    });
    globalLenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const id = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      globalLenis = null;
    };
  }, []);

  return <>{children}</>;
}
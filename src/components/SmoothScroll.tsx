"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export let globalLenis: Lenis | null = null;

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.07,
      smoothWheel: true,
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
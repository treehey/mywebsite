"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export let globalLenis: Lenis | null = null;

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 2.5,
      wheelMultiplier: 0.92,
    });
    globalLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const syncLenisSize = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", syncLenisSize);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      ScrollTrigger.removeEventListener("refresh", syncLenisSize);
      lenis.destroy();
      globalLenis = null;
    };
  }, []);

  return <>{children}</>;
}

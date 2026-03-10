"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";

export const SlothScrollIndicator = () => {
  const { scrollYProgress } = useScroll();
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Smooth out the scroll to prevent jitter
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate top offset based on scroll progress
  // We map 0-1 progress to 0-85vh so it stays within viewport
  const yPosition = useTransform(smoothProgress, [0, 1], ["0vh", "80vh"]);

  // Detect scrolling for animation states
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsScrolling(false), 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed right-2 md:right-6 top-0 h-screen w-12 z-50 pointer-events-none">
      {/* The Vine (Line) */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] opacity-100 mix-blend-screen"
        style={{ 
          height: yPosition,
          background: "linear-gradient(to bottom, transparent 0%, rgba(0, 245, 255, 0.4) 50%, rgba(0, 245, 255, 1) 100%)",
          boxShadow: "0 0 15px rgba(0, 245, 255, 0.8), 0 0 0px rgba(0, 245, 255, 0)"
        }}
      />
      
      {/* The Sloth */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 cursor-pointer pointer-events-auto flex flex-col items-center p-2 mt-[-5px]"
        style={{ top: yPosition }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={isScrolling ? { rotate: [-5, 5, -5] } : { rotate: 0 }}
        transition={{ repeat: isScrolling ? Infinity : 0, duration: 2 }}
        title="I'm lazy... click to climb up!"
      >
        <div className="relative w-12 h-12 md:w-14 md:h-14 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">
            <motion.img
              key={isHovered ? "hover" : "normal"}
              src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/sloth_${isHovered ? "2" : "1"}.png`}
              alt="Sloth Scroll"
              className="w-full h-full object-contain filter"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

"use client";

import { useRef, useEffect } from "react";

export function InteractiveString() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return;

    let width = svg.clientWidth || 800;
    const height = 40;
    const centerY = height / 2;

    // Physics variables
    let targetY = centerY;
    let currentY = centerY;
    let velocity = 0;
    const stiffness = 0.12;
    const damping = 0.80;
    
    let mouseX = width / 2;
    let isHovered = false;

    const updateSize = () => {
      if (svg) {
        width = svg.clientWidth || 800;
      }
    };
    window.addEventListener("resize", updateSize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      mouseX = x;
      // If mouse is near the string vertically
      if (Math.abs(y - centerY) < 20) {
        targetY = y;
        // Add velocity based on mouse movement
        velocity += (y - currentY) * 0.12;
      }
    };

    const handleMouseEnter = () => {
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
      targetY = centerY;
    };

    svg.addEventListener("mousemove", handleMouseMove);
    svg.addEventListener("mouseenter", handleMouseEnter);
    svg.addEventListener("mouseleave", handleMouseLeave);

    let animationId: number;

    const animate = () => {
      // Spring physics
      const force = (targetY - currentY) * stiffness;
      velocity += force;
      velocity *= damping;
      currentY += velocity;

      if (!isHovered) {
        targetY = centerY;
      }

      // Draw quadratic curve M 0 centerY Q mouseX currentY width centerY
      path.setAttribute("d", `M 0 ${centerY} Q ${mouseX} ${currentY} ${width} ${centerY}`);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateSize);
      if (svg) {
        svg.removeEventListener("mousemove", handleMouseMove);
        svg.removeEventListener("mouseenter", handleMouseEnter);
        svg.removeEventListener("mouseleave", handleMouseLeave);
      }
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="w-full py-2 pointer-events-auto select-none mt-4">
      <svg ref={svgRef} className="w-full h-10 overflow-visible cursor-ns-resize">
        <path
          ref={pathRef}
          d="M 0 20 L 800 20"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          className="text-foreground/20 hover:text-foreground/50 transition-colors duration-300"
        />
      </svg>
    </div>
  );
}

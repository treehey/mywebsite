"use client";

import { useRef, useState, useEffect } from "react";
import { type GuestEntry } from "@/lib/supabase";

const ACCENT_COLORS = [
  "#FFFFFF",
  "#E5E7EB",
  "#9CA3AF",
  "#D1D5DB",
  "#F3F4F6",
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

interface GuestbookEntry {
  id: number;
  entry: GuestEntry;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  width: number;
  height: number;
  zIndex: number;
  element: HTMLDivElement | null;
}

interface DragHistoryItem {
  x: number;
  y: number;
  t: number;
}

interface TactileDeskProps {
  entries: GuestEntry[];
  tr: Record<string, string>;
  setCursorBig: (v: boolean) => void;
}

export function TactileDesk({ entries, tr, setCursorBig }: TactileDeskProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [notesState, setNotesState] = useState<GuestEntry[]>(entries);
  const [topZ, setTopZ] = useState(entries.length + 10);

  const notesRef = useRef<GuestbookEntry[]>([]);
  const draggedIdRef = useRef<number | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const mousePosRef = useRef({ x: 0, y: 0 });
  const containerSizeRef = useRef({ w: 800, h: 800 });
  
  // Track dragging history to compute precise throw velocity
  const dragHistoryRef = useRef<DragHistoryItem[]>([]);

  // 1. Sync entries state
  useEffect(() => {
    setNotesState(entries);
  }, [entries]);

  // 2. Measure container size on mount and resize (prevents 60fps layout reflows!)
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        containerSizeRef.current = {
          w: rect.width,
          h: rect.height
        };
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 3. Position initialization on load / entries updates
  useEffect(() => {
    if (!containerRef.current) return;
    const w = containerSizeRef.current.w;
    const h = containerSizeRef.current.h;

    const existing = new Map(notesRef.current.map(n => [n.id, n]));

    const cols = w < 600 ? 1 : w < 900 ? 2 : w < 1300 ? 3 : 4;
    const rows = Math.max(2, Math.ceil(entries.length / cols));

    const marginX = w < 600 ? 15 : 40;
    const marginY = 50;

    const cellW = (w - marginX * 2) / cols;
    const cellH = (h - marginY * 2) / rows;

    notesRef.current = entries.map((entry, i) => {
      const exist = existing.get(entry.id);
      if (exist) return exist;

      const colIdx = i % cols;
      const rowIdx = Math.floor(i / cols);

      const cellCenterX = marginX + colIdx * cellW + cellW / 2;
      const cellCenterY = marginY + rowIdx * cellH + cellH / 2;

      const noteWidth = 260;
      const noteHeight = 180; 

      let x = cellCenterX - noteWidth / 2;
      let y = cellCenterY - noteHeight / 2;

      const seed = entry.id;
      const jitterX = ((seed * 79 + 13) % 30) - 15;
      const jitterY = ((seed * 43 + 29) % 30) - 15;
      const r = ((seed * 73 + 17) % 12) - 6;

      x += jitterX;
      y += jitterY;

      const maxValX = w - noteWidth - marginX;
      const maxValY = h - noteHeight - marginY - 20;

      x = Math.max(marginX, Math.min(x, maxValX));
      y = Math.max(marginY, Math.min(y, maxValY));

      return {
        id: entry.id,
        entry,
        x,
        y,
        vx: 0,
        vy: 0,
        r,
        width: noteWidth,
        height: noteHeight,
        zIndex: entries.length - i + 10,
        element: null
      };
    });
  }, [entries]);

  // 4. Registering note DOM elements & dynamic unrotated size measurement
  const registerNote = (id: number, el: HTMLDivElement | null) => {
    const note = notesRef.current.find(n => n.id === id);
    if (note && el) {
      note.element = el;
      
      // Temporarily clear transform to measure the true unrotated dimensions accurately
      const origTransform = el.style.transform;
      el.style.transform = "none";
      
      const rect = el.getBoundingClientRect();
      note.width = rect.width;
      note.height = Math.max(120, rect.height); // Safe minimum height

      // Restore transform
      el.style.transform = origTransform || `translate3d(${note.x}px, ${note.y}px, 0) rotate(${note.r}deg)`;
      el.style.zIndex = String(note.zIndex);
    }
  };

  // 5. Physics animation loop using direct DOM writes (bypassing React re-renders for buttery 60fps)
  useEffect(() => {
    let animationId: number;

    const updatePhysics = () => {
      const w = containerSizeRef.current.w;
      const h = containerSizeRef.current.h;

      const nextNotes = notesRef.current;
      const draggedId = draggedIdRef.current;

      // 5a. Update dragged note coordinates smoothly (inside loop to prevent input render mismatches!)
      if (draggedId !== null) {
        const draggedNote = nextNotes.find(n => n.id === draggedId);
        if (draggedNote) {
          const targetX = mousePosRef.current.x - dragOffsetRef.current.x;
          const targetY = mousePosRef.current.y - dragOffsetRef.current.y;

          // Clamping limits to keep the dragged note completely inside borders
          const margin = 2;
          const maxX = w - draggedNote.width - margin;
          const maxY = h - draggedNote.height - margin;

          const clampedX = Math.max(margin, Math.min(targetX, maxX));
          const clampedY = Math.max(margin, Math.min(targetY, maxY));

          draggedNote.vx = (clampedX - draggedNote.x) * 0.45;
          draggedNote.vy = (clampedY - draggedNote.y) * 0.45;

          draggedNote.x = clampedX;
          draggedNote.y = clampedY;
        }
      }

      // 5b. Apply velocity inertia & friction damping (sliding physics)
      const friction = 0.94; // lowered friction for longer, realistic glide
      nextNotes.forEach(n => {
        if (n.id !== draggedId) {
          n.x += n.vx;
          n.y += n.vy;
          n.vx *= friction;
          n.vy *= friction;
        }
      });

      // 5c. Container boundary collision (Uses exact edge margins = 2px)
      const marginX = 2;
      const marginY = 2;
      const restitution = -0.4; // bouncy feel

      nextNotes.forEach(n => {
        const maxX = w - n.width - marginX;
        const maxY = h - n.height - marginY;

        if (n.x < marginX) {
          n.x = marginX;
          n.vx *= restitution;
        }
        if (n.x > maxX) {
          n.x = maxX;
          n.vx *= restitution;
        }
        if (n.y < marginY) {
          n.y = marginY;
          n.vy *= restitution;
        }
        if (n.y > maxY) {
          n.y = maxY;
          n.vy *= restitution;
        }
      });

      // 5d. Dynamic card-to-card collisions (push & slide impulse)
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < nextNotes.length; i++) {
          for (let j = i + 1; j < nextNotes.length; j++) {
            const n1 = nextNotes[i];
            const n2 = nextNotes[j];

            const c1x = n1.x + n1.width / 2;
            const c1y = n1.y + n1.height / 2;
            const c2x = n2.x + n2.width / 2;
            const c2y = n2.y + n2.height / 2;

            const dx = c2x - c1x;
            const dy = c2y - c1y;
            const distSq = dx * dx + dy * dy;

            // Collision radius based on the average width of the two cards
            const collisionRadius = (n1.width + n2.width) / 4.2;
            const minDistance = collisionRadius * 2;
            const minDistanceSq = minDistance * minDistance;

            if (distSq < minDistanceSq && distSq > 0.01) {
              const dist = Math.sqrt(distSq);
              const overlap = minDistance - dist;

              const nx = dx / dist;
              const ny = dy / dist;

              if (n1.id === draggedId) {
                n2.x += nx * overlap;
                n2.y += ny * overlap;
                n2.vx += nx * overlap * 0.25;
                n2.vy += ny * overlap * 0.25;
              } else if (n2.id === draggedId) {
                n1.x -= nx * overlap;
                n1.y -= ny * overlap;
                n1.vx -= nx * overlap * 0.25;
                n1.vy -= ny * overlap * 0.25;
              } else {
                n1.x -= nx * overlap * 0.5;
                n1.y -= ny * overlap * 0.5;
                n2.x += nx * overlap * 0.5;
                n2.y += ny * overlap * 0.5;

                n1.vx -= nx * overlap * 0.15;
                n1.vy -= ny * overlap * 0.15;
                n2.vx += nx * overlap * 0.15;
                n2.vy += ny * overlap * 0.15;
              }
            }
          }
        }
      }

      // 5e. Direct DOM Updates (bypasses React virtual DOM rendering overhead completely!)
      nextNotes.forEach(n => {
        if (n.element) {
          const isDragged = draggedId === n.id;
          const currentRotation = isDragged ? 0 : n.r;
          n.element.style.transform = `translate3d(${n.x}px, ${n.y}px, 0) rotate(${currentRotation}deg)`;
        }
      });

      animationId = requestAnimationFrame(updatePhysics);
    };

    animationId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const onStartDrag = (id: number, offset: { x: number; y: number }, mouse: { x: number; y: number }) => {
    draggedIdRef.current = id;
    dragOffsetRef.current = offset;
    mousePosRef.current = mouse;
    
    // Clear history and push initial pointer coordinate
    dragHistoryRef.current = [{ x: mouse.x, y: mouse.y, t: performance.now() }];
    
    setTopZ(prev => {
      const nextZ = prev + 1;
      const note = notesRef.current.find(n => n.id === id);
      if (note) {
        note.zIndex = nextZ;
        if (note.element) {
          note.element.style.zIndex = String(nextZ);
          // Visual feedback style: scale up and shadow glow applied directly in DOM
          note.element.style.scale = "1.08";
          note.element.style.boxShadow = "0 40px 90px -10px rgba(0,0,0,0.6), inset 0 2px 3px rgba(255,255,255,0.15)";
        }
      }
      return nextZ;
    });
  };

  const onMoveDrag = (mouse: { x: number; y: number }) => {
    mousePosRef.current = mouse;
    // Push coordinate history
    dragHistoryRef.current = [
      ...dragHistoryRef.current.slice(-3),
      { x: mouse.x, y: mouse.y, t: performance.now() }
    ];
  };

  const onEndDrag = () => {
    const id = draggedIdRef.current;
    if (id !== null) {
      const note = notesRef.current.find(n => n.id === id);
      if (note && note.element) {
        // Reset scale and shadow directly in DOM
        note.element.style.scale = "1.0";
        note.element.style.boxShadow = "0 15px 35px -10px rgba(0,0,0,0.4), inset 0 2px 2px rgba(255,255,255,0.08)";

        // Compute throwing inertia based on pointer gesture history
        const history = dragHistoryRef.current;
        if (history.length >= 2) {
          const first = history[0];
          const last = history[history.length - 1];
          const dt = last.t - first.t; // time span in ms
          if (dt > 10) {
            // Convert pixels/ms to pixels/frame (at 60fps, 1 frame is 16.67ms)
            const vx = ((last.x - first.x) / dt) * 16.67;
            const vy = ((last.y - first.y) / dt) * 16.67;

            // Cap the maximum throwing speed to prevent notes from flying off like rockets
            const maxV = 28;
            note.vx = Math.max(-maxV, Math.min(vx * 0.9, maxV));
            note.vy = Math.max(-maxV, Math.min(vy * 0.9, maxV));
          }
        }
      }
    }
    draggedIdRef.current = null;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[650px] md:h-[800px] bg-foreground/[0.015] border border-foreground/5 rounded-[2.5rem] overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.03) 1px, transparent 0)",
        backgroundSize: "24px 24px"
      }}
    >
      <div className="absolute top-4 left-6 pointer-events-none select-none font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/25">
        TACTILE WORKSPACE // DRAG & COLLIDE NOTES
      </div>

      {notesState.map((entry) => (
        <TactileNote 
          key={entry.id} 
          entry={entry} 
          containerRef={containerRef} 
          setCursorBig={setCursorBig} 
          tr={tr} 
          onStartDrag={onStartDrag}
          onMoveDrag={onMoveDrag}
          onEndDrag={onEndDrag}
          registerNote={registerNote}
        />
      ))}
      
      {entries.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <p className="font-mono text-foreground/20 text-sm">{tr.empty}</p>
        </div>
      )}
    </div>
  );
}

interface TactileNoteProps {
  entry: GuestEntry;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setCursorBig: (v: boolean) => void;
  tr: Record<string, string>;
  onStartDrag: (id: number, offset: { x: number; y: number }, mouse: { x: number; y: number }) => void;
  onMoveDrag: (mouse: { x: number; y: number }) => void;
  onEndDrag: () => void;
  registerNote: (id: number, el: HTMLDivElement | null) => void;
}

function TactileNote({ 
  entry, 
  containerRef, 
  setCursorBig, 
  tr,
  onStartDrag,
  onMoveDrag,
  onEndDrag,
  registerNote 
}: TactileNoteProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const accentColor = entry.color || ACCENT_COLORS[entry.id % ACCENT_COLORS.length];
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setCursorBig(true);
    isDraggingRef.current = true;

    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find current position from DOM transform matrix directly
    const el = e.currentTarget;
    const transform = window.getComputedStyle(el).transform;
    let currentX = 0;
    let currentY = 0;
    if (transform && transform !== "none") {
      const matrix = new DOMMatrix(transform);
      currentX = matrix.m41;
      currentY = matrix.m42;
    }

    const offset = {
      x: mouseX - currentX,
      y: mouseY - currentY
    };
    dragOffsetRef.current = offset;
    onStartDrag(entry.id, offset, { x: mouseX, y: mouseY });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      onMoveDrag({ x: mouseX, y: mouseY });
    }

    if (cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - cardRect.left;
      const y = e.clientY - cardRect.top;
      const cx = cardRect.width / 2;
      const cy = cardRect.height / 2;
      const deg = Math.atan2(cx - x, y - cy) * (180 / Math.PI);
      cardRef.current.style.setProperty("--card-x", `${x}px`);
      cardRef.current.style.setProperty("--card-y", `${y}px`);
      cardRef.current.style.setProperty("--card-deg", `${deg}deg`);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setCursorBig(false);
    isDraggingRef.current = false;
    onEndDrag();
  };

  return (
    <div
      ref={(el) => {
        registerNote(entry.id, el as HTMLDivElement | null);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        touchAction: "none",
        scale: 1.0,
        boxShadow: "0 15px 35px -10px rgba(0,0,0,0.4), inset 0 2px 2px rgba(255,255,255,0.08)",
        transition: "scale 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
      className="cursor-grab active:cursor-grabbing w-[260px] select-none group rounded-[2.5rem]"
    >
      <div
        ref={cardRef}
        className="relative p-6 rounded-[2.5rem] overflow-hidden transition-all duration-700 ease-out border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-md"
        style={{
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), inset 0 -1px 2px rgba(0,0,0,0.3)",
        }}
      >
        <div 
          className="absolute inset-x-6 top-0 h-[1.5px] opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${accentColor}80 45%, transparent 100%)` }}
        />

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 mix-blend-screen" 
             style={{ 
               background: `
                 radial-gradient(280px circle at var(--card-x, 50%) var(--card-y, 50%), rgba(255,255,255,0.12) 0%, transparent 42%),
                 linear-gradient(var(--card-deg, 135deg), rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 22%, transparent 52%)
               ` 
             }} />

        <div
          className="absolute inset-0 opacity-[0.006] pointer-events-none z-0 mix-blend-overlay"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 240 240%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.45%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')" }}
        />

        <p className="relative z-10 font-grotesk text-sm text-foreground/80 group-hover:text-foreground transition-colors duration-500 leading-relaxed tracking-wide mb-5 break-words">
          {entry.message}
        </p>

        <div className="relative z-10 flex items-center justify-between pt-3.5 border-t border-white/5 mt-auto">
          <span className="font-mono text-[10px] tracking-widest text-foreground/45 group-hover:text-foreground/75 transition-colors duration-500 uppercase truncate max-w-[130px]">
            {entry.nickname ?? tr.anon}
          </span>
          <span className="font-mono text-[9px] tracking-wider text-foreground/30 group-hover:text-foreground/50 transition-colors duration-500">
            {formatDate(entry.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

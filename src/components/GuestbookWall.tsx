"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase, type GuestEntry } from "@/lib/supabase";

/* ── Demo entries shown when Supabase is not configured ── */
const DEMO_ENTRIES: GuestEntry[] = [
  { id: 1,  danmaku_title: "Cool portfolio! 🔥",       message: "The animations and typography are absolutely insane. Bookmark-worthy.",                          nickname: "Alex",      color: "#00F5FF", created_at: "2025-03-01T10:00:00Z" },
  { id: 2,  danmaku_title: "这个网站也太帅了吧",          message: "完全没想到会看到这么精致的个人作品集，感觉比很多商业网站都好看。",                                 nickname: "小明",      color: "#FF2D78", created_at: "2025-03-02T12:00:00Z" },
  { id: 3,  danmaku_title: "Found via GitHub ✦",        message: "Stumbled across your repo while browsing. Really impressive stuff here.",                        nickname: "dev.ray",   color: "#39FF14", created_at: "2025-03-03T14:00:00Z" },
  { id: 4,  danmaku_title: "NJU软工 牛啊",               message: "同是南大人，看到这网站真的骄傲 haha，加油！",                                                     nickname: "NJU er",    color: "#F5C542", created_at: "2025-03-04T16:00:00Z" },
  { id: 5,  danmaku_title: "Love the cyberpunk vibe",   message: "The neon + dark palette hits different. Already inspired me to redo my own site.",              nickname: "hustle",    color: "#B200FF", created_at: "2025-03-05T18:00:00Z" },
  { id: 6,  danmaku_title: "TREE HEY's website 🎮",     message: "Minecraft → Software Eng journey is actually peak origin story. Respect the grind.",            nickname: "retro",     color: "#FF2D78", created_at: "2025-03-06T10:00:00Z" },
  { id: 7,  danmaku_title: "Full-stack dev 💪",          message: "React, Next.js, Spring Boot, Supabase all in one portfolio. That's the combo.",                 nickname: null,        color: "#00F5FF", created_at: "2025-03-07T11:00:00Z" },
  { id: 8,  danmaku_title: "Respect the grind",         message: "Macau comp top 5, office competition 3rd, web 2nd... and still shipping. Insane.",               nickname: null,        color: "#39FF14", created_at: "2025-03-08T09:00:00Z" },
];

/* Random rotation between -6° and +6° using id as seed (deterministic) */
function getRotation(id: number) {
  const base = ((id * 137 + 31) % 120) - 60; // -60 to +60
  return (base / 10).toFixed(1);              // -6 to +6
}

/* Format date to friendly string */
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

export function GuestbookWall() {
  const [entries, setEntries] = useState<GuestEntry[]>(DEMO_ENTRIES);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("guestbook")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(80)
      .then(({ data, error }) => {
        if (!error && data?.length) setEntries(data as GuestEntry[]);
      });

    const channel = supabase
      .channel("guestbook-wall")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guestbook" }, (payload) => {
        setEntries(prev => [payload.new as GuestEntry, ...prev].slice(0, 80));
      })
      .subscribe();

    return () => { supabase?.removeChannel(channel); };
  }, []);

  return (
    <section id="guestbook" className="relative min-h-screen py-28 px-6 md:px-12 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient glow blobs */}
      <div className="absolute top-40 left-1/4 w-96 h-96 rounded-full opacity-[0.04] blur-[120px] pointer-events-none" style={{ background: "#FF2D78" }} />
      <div className="absolute bottom-40 right-1/4 w-80 h-80 rounded-full opacity-[0.04] blur-[100px] pointer-events-none" style={{ background: "#00F5FF" }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#FF2D78] mb-4">
            GUESTBOOK
          </p>
          <h2 className="font-grotesk font-black text-5xl md:text-7xl text-[#E2E2EC] leading-[1] mb-4">
            留言墙
          </h2>
          <p className="font-grotesk text-[#E2E2EC]/40 text-base max-w-sm">
            每一张便利贴都是来自互联网的问候 · 点击「留下足迹」写下你的留言
          </p>
        </motion.div>

        {/* Sticky note masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
          {entries.map((entry, i) => (
            <StickyNote key={entry.id} entry={entry} index={i} />
          ))}
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <div className="text-center py-32">
            <p className="font-mono text-[#E2E2EC]/20 text-sm">还没有留言，成为第一个！</p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Individual sticky note ── */
function StickyNote({ entry, index }: { entry: GuestEntry; index: number }) {
  const rotation = getRotation(entry.id);
  const delay = (index % 12) * 0.06;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: Number(rotation) }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="sticky-note break-inside-avoid inline-block w-full cursor-default"
      style={{
        "--note-color": entry.color,
      } as React.CSSProperties}
    >
      <div
        className="relative p-5 rounded-2xl overflow-hidden"
        style={{
          background: "rgba(12,12,22,0.85)",
          border: `1px solid ${entry.color}30`,
          backdropFilter: "blur(10px)",
          boxShadow: `0 0 28px ${entry.color}12, 0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 ${entry.color}20`,
        }}
      >
        {/* Color accent bar on top */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, ${entry.color}, transparent)` }}
        />

        {/* Title */}
        <p
          className="font-mono font-bold text-sm leading-snug mb-3"
          style={{ color: entry.color, textShadow: `0 0 16px ${entry.color}60` }}
        >
          {entry.danmaku_title}
        </p>

        {/* Message body */}
        {entry.message && (
          <p className="font-grotesk text-[#E2E2EC]/65 text-xs leading-relaxed mb-4">
            {entry.message}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#E2E2EC]/8">
          <span className="font-mono text-[10px]" style={{ color: `${entry.color}90` }}>
            {entry.nickname ?? "匿名访客"}
          </span>
          <span className="font-mono text-[9px] text-[#E2E2EC]/20">
            {formatDate(entry.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

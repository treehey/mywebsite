"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, type GuestEntry } from "@/lib/supabase";

/* ── Demo entries shown when Supabase not configured ── */
const DEMO_ENTRIES: Omit<GuestEntry, "created_at">[] = [
  { id: -1, danmaku_title: "Cool portfolio! 🔥",         message: "The animations and typography are absolutely insane.",   nickname: "Alex",     color: "#00F5FF" },
  { id: -2, danmaku_title: "这个网站也太帅了吧",            message: "完全没想到会看到这么精致的个人作品集，感觉比很多商业网站都好看。", nickname: "小明",     color: "#FF2D78" },
  { id: -3, danmaku_title: "Found via GitHub ✦",         message: null,                                                      nickname: null,       color: "#39FF14" },
  { id: -4, danmaku_title: "NJU软工 牛啊",                 message: "同是南大人，看到这网站真的骄傲，加油！",                    nickname: "NJU er",   color: "#F5C542" },
  { id: -5, danmaku_title: "Love the cyberpunk vibe",    message: "The neon + dark palette hits different.",                 nickname: "dev.ray",  color: "#B200FF" },
  { id: -6, danmaku_title: "Full-stack dev 💪",           message: null,                                                      nickname: null,       color: "#00F5FF" },
  { id: -7, danmaku_title: "TREE HEY's website 🎮",       message: "Minecraft → Software Eng is peak origin story.",         nickname: "retro",    color: "#FF2D78" },
  { id: -8, danmaku_title: "Respect the grind",          message: "Macau comp top 5, web 2nd... still cooking.",             nickname: "hustle",   color: "#39FF14" },
];

const ACCENT_COLORS = [
  "#00F5FF", "#FF2D78", "#39FF14", "#F5C542",
  "#B200FF", "#FF7700", "#00F5FF", "#FF2D78",
];

interface DanmakuTrack {
  id: number;
  text: string;
  color: string;
  top: number;
  duration: number;
  delay: number;
  fontSize: number;
}

let trackIdCounter = 0;

/* ─────────────────────────────────────────────────── */
export function DanmakuSystem({ containerRef }: { containerRef?: React.RefObject<HTMLElement | null> }) {
  const [tracks, setTracks]           = useState<DanmakuTrack[]>([]);
  const [showInput, setShowInput]     = useState(false);
  const [titleText, setTitleText]     = useState("");
  const [messageText, setMessageText] = useState("");
  const [nickname, setNickname]       = useState("");
  const [status, setStatus]           = useState<"idle" | "sending" | "done" | "err">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  /* Convert DB row → animation track */
  const toTrack = useCallback((e: Pick<GuestEntry, "id" | "danmaku_title" | "color">): DanmakuTrack => ({
    id: ++trackIdCounter,
    text: e.danmaku_title.slice(0, 30),
    color: e.color,
    top: 5 + Math.random() * 83,
    duration: 10 + Math.random() * 12,
    delay: Math.random() * 4,
    fontSize: 14 + Math.floor(Math.random() * 6),
  }), []);

  /* ── Seed demo entries + load from Supabase ── */
  useEffect(() => {
    setTracks(DEMO_ENTRIES.map(toTrack));

    if (!supabase) return;

    supabase
      .from("guestbook")
      .select("id, danmaku_title, color, created_at")
      .order("created_at", { ascending: false })
      .limit(60)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTracks(prev => [...prev, ...data.map(r => toTrack(r as GuestEntry))]);
        }
      });

    const channel = supabase
      .channel("guestbook-danmaku")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guestbook" }, (payload) => {
        const row = payload.new as GuestEntry;
        setTracks(prev => [...prev.slice(-60), toTrack(row)]);
      })
      .subscribe();

    return () => { supabase?.removeChannel(channel); };
  }, [toTrack]);

  /* ── Submit ── */
  const handleSubmit = async () => {
    const title = titleText.trim().slice(0, 30);
    if (!title) return;

    const color = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
    setStatus("sending");

    if (supabase) {
      const { error } = await supabase.from("guestbook").insert({
        danmaku_title: title,
        message: messageText.trim() || null,
        nickname: nickname.trim() || null,
        color,
      });
      if (error) { setStatus("err"); return; }
    } else {
      setTracks(prev => [...prev, toTrack({ id: Date.now(), danmaku_title: title, color })]);
    }

    setStatus("done");
    setTitleText(""); setMessageText(""); setNickname("");
    setTimeout(() => { setShowInput(false); setStatus("idle"); }, 1500);
  };

  const resetPanel = () => { setTitleText(""); setMessageText(""); setNickname(""); setStatus("idle"); };

  return (
    <>
      {/* ── Danmaku rendering layer ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]" aria-hidden="true">
        {tracks.map(track => (
          <DanmakuItem key={track.id} track={track} />
        ))}
      </div>

      {/* ── Trigger button ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
        onClick={() => { setShowInput(v => !v); resetPanel(); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="absolute bottom-24 right-6 md:right-12 z-[15] flex items-center gap-2 px-4 py-2.5 rounded-full font-mono text-xs uppercase tracking-widest border transition-all duration-300 pointer-events-auto hover:scale-105"
        style={{
          background: "rgba(14,14,28,0.88)",
          borderColor: "rgba(0,245,255,0.35)",
          color: "#00F5FF",
          backdropFilter: "blur(14px)",
          boxShadow: "0 0 24px rgba(0,245,255,0.15)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] animate-pulse" />
        留下足迹
      </motion.button>

      {/* ── Input panel ── */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-40 right-6 md:right-12 z-[15] pointer-events-auto w-[min(380px,90vw)] rounded-[1.5rem] overflow-hidden"
            style={{
              background: "rgba(7,7,15,0.94)",
              border: "1px solid rgba(0,245,255,0.2)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 0 50px rgba(0,245,255,0.08), 0 24px 64px rgba(0,0,0,0.7)",
            }}
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-[#E2E2EC]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D78] animate-pulse" />
                <span className="font-mono text-xs text-[#E2E2EC]/60 uppercase tracking-widest">留下足迹</span>
              </div>
              <button onClick={() => setShowInput(false)} className="text-[#E2E2EC]/30 hover:text-[#E2E2EC] transition-colors text-lg leading-none">×</button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5">
              {/* Danmaku title */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#00F5FF]">弹幕标题 *</label>
                  <span className="font-mono text-[10px] text-[#E2E2EC]/30">{titleText.length}/30</span>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={titleText}
                  onChange={e => setTitleText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  maxLength={30}
                  placeholder="一句话，就这样飞过屏幕…"
                  className="w-full bg-transparent font-grotesk text-sm text-[#E2E2EC] placeholder-[#E2E2EC]/25 outline-none border-b border-[#E2E2EC]/20 focus:border-[#00F5FF] pb-2 transition-colors duration-300"
                />
                <p className="font-mono text-[9px] text-[#E2E2EC]/30 mt-1.5">将显示在 Hero 页弹幕中</p>
              </div>

              {/* Message */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FF2D78]">
                    详细留言 <span className="text-[#E2E2EC]/30">可选</span>
                  </label>
                  <span className="font-mono text-[10px] text-[#E2E2EC]/30">{messageText.length}/150</span>
                </div>
                <textarea
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  maxLength={150}
                  rows={3}
                  placeholder="更多想说的话、评价、祝福…"
                  className="w-full bg-transparent font-grotesk text-sm text-[#E2E2EC] placeholder-[#E2E2EC]/25 outline-none border border-[#E2E2EC]/10 focus:border-[#FF2D78] rounded-lg p-3 resize-none transition-colors duration-300"
                />
                <p className="font-mono text-[9px] text-[#E2E2EC]/30 mt-1.5">将展示在留言墙便利贴中</p>
              </div>

              {/* Nickname */}
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#39FF14] mb-2 block">
                  昵称 <span className="text-[#E2E2EC]/30">可选</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  maxLength={20}
                  placeholder="匿名访客"
                  className="w-full bg-transparent font-grotesk text-sm text-[#E2E2EC] placeholder-[#E2E2EC]/25 outline-none border-b border-[#E2E2EC]/10 focus:border-[#39FF14] pb-2 transition-colors duration-300"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-[9px] text-[#E2E2EC]/25">
                  {supabase ? "永久保存" : "演示模式"}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!titleText.trim() || status === "sending"}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-40 active:scale-95"
                  style={{
                    background: status === "done" ? "rgba(57,255,20,0.15)" : "rgba(0,245,255,0.12)",
                    border: `1px solid ${status === "done" ? "rgba(57,255,20,0.5)" : "rgba(0,245,255,0.4)"}`,
                    color: status === "done" ? "#39FF14" : "#00F5FF",
                  }}
                >
                  {status === "sending" && (
                    <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  {status === "done" ? "已发射 ✓" : status === "err" ? "失败 ✗" : "发射 →"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Single danmaku item ── */
function DanmakuItem({ track }: { track: DanmakuTrack }) {
  return (
    <div
      className="danmaku-item absolute whitespace-nowrap font-mono font-bold select-none"
      style={{
        top: `${track.top}%`,
        color: track.color,
        fontSize: `${track.fontSize}px`,
        textShadow: `0 0 10px ${track.color}80, 0 0 24px ${track.color}40`,
        animationDuration: `${track.duration}s`,
        animationDelay: `${track.delay}s`,
        opacity: 0,
      }}
    >
      {track.text}
    </div>
  );
}

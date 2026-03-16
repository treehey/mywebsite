"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, type GuestEntry } from "@/lib/supabase";

const AWWWARDS_COLORS = [
  "#FFFFFF", "#F3F4F6", "#E5E7EB", "#D1D5DB",
];

interface DanmakuTrack {
  id: number;
  text: string;
  color: string;
  top: number;
  duration: number;
  delay: number;
  fontSize: number;
  laneIdx: number;
}

const TL_DM: Record<string, Record<string, string>> = {
  EN:  { btn: "Leave a Trace", panelTitle: "Leave a Trace", danmakuLabel: "Danmaku Title", optional: "optional", danmakuPlaceholder: "A line to fly across the screen", danmakuHint: "Will fly through Hero  or skip for message only", messageLabel: "Message", messagePlaceholder: "Greetings, feedback, wishes", messageHint: "Will appear on the Guestbook Wall", nicknameLabel: "Nickname", nicknamePlaceholder: "Anonymous", persist: "Saved forever", demo: "Demo mode", send: "Publish ", done: "Published ", err: "Failed " },
  "简": { btn: "留下足迹", panelTitle: "留言板", danmakuLabel: "屏幕弹幕", optional: "可选", danmakuPlaceholder: "一句话，就这样滑动过屏幕", danmakuHint: "填写后文字将划过首页背景", messageLabel: "详细留言", messagePlaceholder: "分享你的见解、灵感或简单的问候", messageHint: "将展示在下方的信息流中", nicknameLabel: "署名", nicknamePlaceholder: "匿名访客", persist: "永久保存", demo: "演示模式", send: "发布 ", done: "已发布 ", err: "发布失败 " },
  "繁": { btn: "留下足跡", panelTitle: "留言板", danmakuLabel: "屏幕彈幕", optional: "可選", danmakuPlaceholder: "一句話，就這樣滑動過屏幕", danmakuHint: "填寫後文字將劃過首頁背景", messageLabel: "詳細留言", messagePlaceholder: "分享你的見解、靈感或簡單的問候", messageHint: "將展示在下方的信息流中", nicknameLabel: "署名", nicknamePlaceholder: "匿名訪客", persist: "永久保存", demo: "演示模式", send: "發佈 ", done: "已發佈 ", err: "發佈失敗 " },
};

let trackIdCounter = 0;
const LANE_COUNT = 15;
const LANE_DURATIONS = [35, 45, 30, 40, 38, 42, 33, 36, 48, 39, 41, 34, 46, 37, 43];

/*  */
export function DanmakuSystem({ containerRef, lang = "简" }: { containerRef?: React.RefObject<HTMLElement | null>; lang?: string }) {
  const tr = TL_DM[lang] ?? TL_DM["简"];
  const [tracks, setTracks]           = useState<DanmakuTrack[]>([]);
  const [showInput, setShowInput]     = useState(false);
  const [titleText, setTitleText]     = useState("");
  const [messageText, setMessageText] = useState("");
  const [nickname, setNickname]       = useState("");
  const [status, setStatus]           = useState<"idle" | "sending" | "done" | "err">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const toTrack = useCallback((
    e: Pick<GuestEntry, "id" | "danmaku_title" | "color">,
    batchIndex?: number
  ): DanmakuTrack => {
    const uid = ++trackIdCounter;
    const laneIdx = uid % LANE_COUNT;
    const duration = LANE_DURATIONS[laneIdx] * 1.5; // slow down for elegance

    const phase = batchIndex !== undefined
      ? (batchIndex * 0.618033) % 1.0
      : Math.random();
    const delay = -(phase * duration);

    return {
      id: uid,
      text: (e.danmaku_title ?? "").slice(0, 30),
      color: AWWWARDS_COLORS[laneIdx % AWWWARDS_COLORS.length],
      top: 2 + laneIdx * 6.5,
      duration,
      delay,
      fontSize: 24 + (laneIdx % 4) * 12, // larger text sizes: 24 to 60px
      laneIdx
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase
      .from("guestbook")
      .select("id, danmaku_title, color, created_at")
      .not("danmaku_title", "is", null)
      .order("created_at", { ascending: false })
      .limit(80)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTracks(prev => [...prev, ...data.map((r, i) => toTrack(r as GuestEntry, i))]);
        }
      });

    const channel = supabase
      .channel("guestbook-danmaku")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guestbook" }, (payload) => {
        const row = payload.new as GuestEntry;
        if (row.danmaku_title) setTracks(prev => [...prev.slice(-80), toTrack(row)]);
      })
      .subscribe();

    return () => { supabase?.removeChannel(channel); };
  }, [toTrack]);

  const handleSubmit = async () => {
    const title = titleText.trim().slice(0, 30);
    const msg   = messageText.trim();
    if (!title && !msg) return;

    const color = AWWWARDS_COLORS[Math.floor(Math.random() * AWWWARDS_COLORS.length)];
    setStatus("sending");

    if (supabase) {
      const { data, error } = await supabase.from("guestbook").insert({
        danmaku_title: title || null,
        message: msg || null,
        nickname: nickname.trim() || null,
        color,
      }).select("id, danmaku_title, message, nickname, color, created_at").single();
      if (error) { setStatus("err"); return; }
      if (data?.danmaku_title) setTracks(prev => [...prev, toTrack(data as GuestEntry)]);
      if (data?.message) window.dispatchEvent(new CustomEvent("guestbook:new", { detail: data }));
    } else {
      if (title) setTracks(prev => [...prev, toTrack({ id: Date.now(), danmaku_title: title, color })]);
    }

    setStatus("done");
    setTitleText(""); setMessageText(""); setNickname("");
    setTimeout(() => { setShowInput(false); setStatus("idle"); }, 1500);
  };

  const resetPanel = () => { setTitleText(""); setMessageText(""); setNickname(""); setStatus("idle"); };

  return (
    <>
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[0] opacity-[0.15] select-none" aria-hidden="true">
        {tracks.map(track => (
          <DanmakuItem key={track.id} track={track} />
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => { setShowInput(v => !v); resetPanel(); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="absolute bottom-12 right-6 md:right-12 z-[25] flex items-center gap-3 px-6 py-3 rounded-full font-mono text-xs uppercase tracking-widest transition-all duration-500 pointer-events-auto group bg-white/5 backdrop-blur-md border border-white/10 text-white/80 hover:bg-white hover:text-black hover:scale-105 shadow-2xl"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white group-hover:bg-black transition-colors" />
        {tr.btn}
      </motion.button>

      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-28 right-6 md:right-12 z-[30] pointer-events-auto w-[min(400px,90vw)] rounded-2xl overflow-hidden"
            style={{
              background: "rgba(10,10,10,0.85)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(40px)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.8), 0 0 1px rgba(255,255,255,0.4)",
            }}
          >
            <div className="px-8 pt-6 pb-4 border-b border-white/5 flex items-center justify-between">
              <span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">{tr.panelTitle}</span>
              <button onClick={() => setShowInput(false)} className="text-white/30 hover:text-white transition-colors text-xl font-light leading-none"></button>
            </div>

            <div className="px-8 py-6 flex flex-col gap-6">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/70">{tr.danmakuLabel} <span className="text-white/30 lowercase">{tr.optional}</span></label>
                  <span className="font-mono text-[10px] text-white/30">{titleText.length}/30</span>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={titleText}
                  onChange={e => setTitleText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  maxLength={30}
                  placeholder={tr.danmakuPlaceholder}
                  className="w-full bg-transparent font-grotesk text-sm text-white placeholder-white/20 outline-none border-b border-white/10 focus:border-white/60 pb-2 transition-colors duration-300"
                />
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/70">
                    {tr.messageLabel} <span className="text-white/30 lowercase">{tr.optional}</span>
                  </label>
                  <span className="font-mono text-[10px] text-white/30">{messageText.length}/150</span>
                </div>
                <textarea
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  maxLength={150}
                  rows={3}
                  placeholder={tr.messagePlaceholder}
                  className="w-full bg-transparent font-grotesk text-sm text-white placeholder-white/20 outline-none border border-white/10 focus:border-white/40 hover:border-white/20 rounded-xl p-4 resize-none transition-colors duration-300"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/70 mb-3 block">
                  {tr.nicknameLabel} <span className="text-white/30 lowercase">{tr.optional}</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  maxLength={20}
                  placeholder={tr.nicknamePlaceholder}
                  className="w-full bg-transparent font-grotesk text-sm text-white placeholder-white/20 outline-none border-b border-white/10 focus:border-white/60 pb-2 transition-colors duration-300"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                  {supabase ? tr.persist : tr.demo}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={(!titleText.trim() && !messageText.trim()) || status === "sending"}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-[0.15em] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-white text-black hover:bg-white/90"
                >
                  {status === "sending" && (
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  {status === "done" ? tr.done : status === "err" ? tr.err : tr.send}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DanmakuItem({ track }: { track: DanmakuTrack }) {
  // Alternate styles based on track lane for visual variety
  const isOutline = track.laneIdx % 3 === 0;
  
  return (
    <div
      className="danmaku-item absolute whitespace-nowrap flex items-center select-none"
      style={{
        top: `${track.top}%`,
        animationDuration: `${track.duration}s`,
        animationDelay: `${track.delay}s`,
      }}
    >
      <span 
        className="font-grotesk font-bold tracking-widest transition-opacity duration-700 hover:opacity-100 uppercase"
        style={{ 
          fontSize: `${track.fontSize}px`,
          color: isOutline ? "transparent" : (track.laneIdx % 2 === 0 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)"),
          WebkitTextStroke: isOutline ? "1px rgba(255,255,255,0.8)" : "none",
        }}
      >
        {track.text}
      </span>
    </div>
  );
}



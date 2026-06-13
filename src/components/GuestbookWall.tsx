"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, type GuestEntry } from "@/lib/supabase";

const TL_GW: Record<string, Record<string, string>> = {
  EN: {
    title: "GUESTBOOK",
    subtitle: "Every sticky note is a greeting from the internet.",
    writeBtn: "WRITE",
    closeBtn: "CLOSE",
    msgLabel: "Message *",
    msgPlaceholder: "Greetings, feedback, wishes...",
    dmkLabel: "Danmaku Title",
    optional: "Optional",
    dmkPlaceholder: "Will also fly across the Hero page...",
    nickLabel: "Nickname",
    nickPlaceholder: "Anonymous",
    send: "Launch →",
    done: "Launched ✓",
    err: "Failed ✗",
    empty: "No messages yet, be the first!",
    anon: "Anonymous"
  },
  "简": {
    title: "留言墙",
    subtitle: "每一张便利贴都是来自互联网的问候",
    writeBtn: "写留言",
    closeBtn: "收起",
    msgLabel: "详细留言 *",
    msgPlaceholder: "留下你的问候、评价、祝福…",
    dmkLabel: "弹幕标题",
    optional: "可选",
    dmkPlaceholder: "填写则同时以弹幕飞过 Hero 页…",
    nickLabel: "昵称",
    nickPlaceholder: "匿名访客",
    send: "发送 →",
    done: "已发送 ✓",
    err: "失败 ✗",
    empty: "还没有留言，成为第一个！",
    anon: "匿名访客"
  },
  "繁": {
    title: "留言牆",
    subtitle: "每一張便利貼都是來自互聯網的問候",
    writeBtn: "寫留言",
    closeBtn: "收起",
    msgLabel: "詳細留言 *",
    msgPlaceholder: "留下你的問候、評價、祝福…",
    dmkLabel: "彈幕標題",
    optional: "可選",
    dmkPlaceholder: "填寫則同時以彈幕飛過 Hero 頁…",
    nickLabel: "暱稱",
    nickPlaceholder: "匿名訪客",
    send: "發送 →",
    done: "已發送 ✓",
    err: "失敗 ✗",
    empty: "還沒有留言，成為第一個！",
    anon: "匿名訪客"
  }
};

const ACCENT_COLORS = [
  "#FFFFFF",    // Pure White
  "#E5E7EB",    // Light Gray
  "#9CA3AF",    // Medium Gray
  "#D1D5DB",    // Slate Gray
  "#F3F4F6",    // Off White
];

/* Random transforms using id as seed (deterministic) */
function getTransform(id: number) {
  const rotBase = ((id * 137 + 31) % 120) - 60; // -60 to +60
  const x = ((id * 193 + 71) % 160) - 80;        // -80 to +80 spread
  const y = ((id * 257 + 39) % 120) - 60;        // -60 to +60 spread
  const zIndex = id % 100;
  return {
    rotate: Number((rotBase / 6).toFixed(1)),
    x, y, zIndex
  };
}

/* Format date to friendly string */
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

export function GuestbookWall({ lang = "简" }: { lang?: string }) {
  const tr = TL_GW[lang] ?? TL_GW["简"];
  const [entries, setEntries] = useState<GuestEntry[]>([]);
  const [showForm, setShowForm]     = useState(false);
  const [messageText, setMessageText] = useState("");
  const [titleText, setTitleText]   = useState("");
  const [nickname, setNickname]     = useState("");
  const [status, setStatus]         = useState<"idle" | "sending" | "done" | "err">("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // 监听鼠标创建全局动态打光角度与位置
    const handlePointerMove = (e: PointerEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        
        // 计算从鼠标指向屏幕中心的角度，用于模拟光的投射方向
        // atan2(dx, dy) 其中 CSS 的 0deg 是朝上，顺时针递增
        const lightDeg = Math.atan2(cx - x, y - cy) * (180 / Math.PI);
        
        sectionRef.current.style.setProperty("--mx", `${x}px`);
        sectionRef.current.style.setProperty("--my", `${y}px`);
        sectionRef.current.style.setProperty("--light-deg", `${lightDeg}deg`);
      }
    };
    window.addEventListener("pointermove", handlePointerMove);

    // 监听来自 DanmakuSystem 表单提交后的即时通知
    const onNew = (e: Event) => {
      const entry = (e as CustomEvent<GuestEntry>).detail;
      if (entry?.message) setEntries(prev => [entry, ...prev].slice(0, 80));
    };
    window.addEventListener("guestbook:new", onNew);

    if (!supabase) {
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("guestbook:new", onNew);
      };
    }

    supabase
      .from("guestbook")
      .select("*")
      .not("message", "is", null)
      .order("created_at", { ascending: false })
      .limit(80)
      .then(({ data, error }) => {
        if (!error && data?.length) setEntries(data as GuestEntry[]);
      });

    const channel = supabase
      .channel("guestbook-wall")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guestbook" }, (payload) => {
        const newEntry = payload.new as GuestEntry;
        if (newEntry.message) setEntries(prev => [newEntry, ...prev].slice(0, 80));
      })
      .subscribe();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("guestbook:new", onNew);
      supabase?.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async () => {
    const msg   = messageText.trim();
    const title = titleText.trim().slice(0, 30);
    if (!msg) return;
    const color = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
    setStatus("sending");
    if (supabase) {
      const { data, error } = await supabase.from("guestbook").insert({
        danmaku_title: title || null,
        message: msg,
        nickname: nickname.trim() || null,
        color,
      }).select("id, danmaku_title, message, nickname, color, created_at").single();
      if (error) { setStatus("err"); return; }
      if (data) {
        setEntries(prev => [data as GuestEntry, ...prev].slice(0, 80));
        if (data.danmaku_title)
          window.dispatchEvent(new CustomEvent("guestbook:new", { detail: data }));
      }
    } else {
      const fake: GuestEntry = {
        id: Date.now(), danmaku_title: title || null, message: msg,
        nickname: nickname.trim() || null, color,
        created_at: new Date().toISOString(),
      };
      setEntries(prev => [fake, ...prev]);
    }
    setStatus("done");
    setMessageText(""); setTitleText(""); setNickname("");
    setTimeout(() => { setShowForm(false); setStatus("idle"); }, 1500);
  };

  const [cols, setCols] = useState(3);
  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w < 640) setCols(1);
      else if (w < 1024) setCols(Math.max(1, Math.min(2, entries.length)));
      else setCols(entries.length === 0 ? 3 : entries.length <= 2 ? entries.length : Math.max(2, Math.min(5, Math.ceil(Math.sqrt(entries.length * 1.4)))));
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, [entries.length]);

  const wallHeight = Math.max(520, Math.ceil(entries.length / cols) * 320 + 180);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen py-20 md:py-24 px-5 md:px-10 overflow-hidden"
    >
      {/* Soft clipped ambience */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div 
          className="absolute inset-0 transition-opacity duration-500 ease-out"
          style={{
            background: `radial-gradient(62rem 42rem at var(--mx, 50%) var(--my, 28%), rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 36%, transparent 72%)`,
          }}
        />
        <div 
          className="absolute inset-0 transition-transform duration-[800ms] ease-out mix-blend-screen pointer-events-none"
          style={{
            background: `linear-gradient(var(--light-deg, 135deg), rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 24%, transparent 58%)`,
            transform: "translateZ(0)",
          }}
        />
      </div>

      {/* Background texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="hidden md:block absolute top-32 left-[16%] w-80 h-80 rounded-full opacity-[0.045] blur-[72px] pointer-events-none" style={{ background: "#FFFFFF" }} />
      <div className="hidden md:block absolute bottom-32 right-[18%] w-72 h-72 rounded-full opacity-[0.035] blur-[72px] pointer-events-none" style={{ background: "#FFFFFF" }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-14"
        >
          <div className="mb-5 flex items-center gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/45">GUESTBOOK</p>
            <span className="h-px w-10 bg-foreground/12" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/30">{String(entries.length).padStart(2, "0")} NOTES</span>
          </div>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="font-grotesk font-black text-4xl sm:text-5xl md:text-7xl text-foreground leading-[0.95] mb-4 tracking-tight">
                {tr.title}
              </h2>
              <p className="font-grotesk text-foreground/40 text-base max-w-sm leading-relaxed">
                {tr.subtitle}
              </p>
            </div>
            {/* Write button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setShowForm(v => !v); setTimeout(() => textareaRef.current?.focus(), 80); }}
              className="flex items-center gap-2 px-5 py-3 rounded-full font-mono text-xs uppercase tracking-widest border transition-all duration-300 shrink-0"
              style={{
                background: showForm ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.055)",
                borderColor: showForm ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.12)",
                color: showForm ? "#FFFFFF" : "#FFFFFF",
                backdropFilter: "blur(12px) saturate(130%)",
                boxShadow: showForm ? "0 12px 32px rgba(0,0,0,0.28)" : "0 10px 28px rgba(0,0,0,0.2)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: showForm ? "#FFFFFF" : "rgba(255,255,255,0.55)" }} />
              {showForm ? tr.closeBtn : tr.writeBtn}
            </motion.button>
          </div>
        </motion.div>

        {/* Inline write form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -16, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden mb-12"
            >
              <div
                className="rounded-[1.5rem] p-6 md:p-8 max-w-xl"
                style={{
                  background: "rgba(12,12,12,0.78)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(18px) saturate(135%)",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.42), inset 0 1px 1px rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex flex-col gap-5">
                  {/* Message (required) */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground">{tr.msgLabel}</label>
                      <span className="font-mono text-[10px] text-foreground/30">{messageText.length}/150</span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      maxLength={150}
                      rows={3}
                      placeholder={tr.msgPlaceholder}
                      className="w-full bg-transparent font-grotesk text-base md:text-sm text-foreground placeholder-foreground/25 outline-none border border-foreground/10 focus:border-foreground rounded-lg p-3 resize-none transition-colors duration-300"
                    />
                  </div>
                  {/* Danmaku title (optional) */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground">{tr.dmkLabel} <span className="text-foreground/30">{tr.optional}</span></label>
                      <span className="font-mono text-[10px] text-foreground/30">{titleText.length}/30</span>
                    </div>
                    <input
                      type="text"
                      value={titleText}
                      onChange={e => setTitleText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      maxLength={30}
                      placeholder={tr.dmkPlaceholder}
                      className="w-full bg-transparent font-grotesk text-base md:text-sm text-foreground placeholder-foreground/25 outline-none border-b border-foreground/20 focus:border-foreground pb-2 transition-colors duration-300"
                    />
                  </div>
                  {/* Nickname + submit */}
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground mb-2 block">{tr.nickLabel} <span className="text-foreground/30">{tr.optional}</span></label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={e => setNickname(e.target.value)}
                        maxLength={20}
                        placeholder={tr.nickPlaceholder}
                        className="w-full bg-transparent font-grotesk text-base md:text-sm text-foreground placeholder-foreground/25 outline-none border-b border-foreground/10 focus:border-foreground pb-2 transition-colors duration-300"
                      />
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={!messageText.trim() || status === "sending"}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-40 active:scale-95 shrink-0"
                      style={{
                        background: status === "done" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                        border: `1px solid ${status === "done" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.4)"}`,
                        color: status === "done" ? "#FFFFFF" : "#FFFFFF",
                      }}
                    >
                      {status === "sending" && <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />}
                      {status === "done" ? tr.done : status === "err" ? tr.err : tr.send}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky note freeform wall */}
        <div className="relative w-full" style={{ minHeight: `${wallHeight}px` }}>
          {entries.map((entry, i) => (
            <StickyNote key={entry.id} entry={entry} index={i} total={entries.length} cols={cols} tr={tr} />
          ))}
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <div className="text-center py-32">
            <p className="font-mono text-foreground/20 text-sm">{tr.empty}</p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Individual sticky note ── */
function StickyNote({ entry, index, total, cols, tr }: { entry: GuestEntry; index: number; total: number; cols: number; tr: Record<string, string> }) {
  const id = entry.id;

  // Use the color saved in the database, fallback to a derived one just in case
  const accentColor = entry.color || ACCENT_COLORS[id % ACCENT_COLORS.length];

  // Grid zone base position, with heavy multi-prime jitter for organic chaos
  const col = index % cols;
  const row = Math.floor(index / cols);
  const cellW = 100 / cols; // percent

  // Jitter inside the cell using different primes per axis
  const jitterX = cols === 1 
    ? ((id * 317 + 43) % 10) - 5 // -5 to +5 pct for single column center
    : ((id * 317 + col * 89 + 43) % Math.round(cellW * 6)) / 10; // 0 to ~60% of cellW
  const jitterY = cols === 1 
    ? ((id * 251 + row * 73 + 17) % 60) - 30 // ±30px vertical chaos on mobile
    : ((id * 251 + row * 73 + 17) % 100) - 50;  // ±50px vertical chaos

  // Stagger odd cols downward for a more organic staircase feel
  const colStagger = cols === 1 ? 0 : (col % 2) * 70 + (col % 3) * 30;

  const leftPct = cols === 1 ? 50 + jitterX : cellW * col + cellW * 0.05 + jitterX;
  const topPx   = row * 350 + 40 + jitterY + colStagger;

  // Rotation: more variance with secondary harmonic
  const rotBase = ((id * 137 + 31) % 120) - 60;
  const rotHarm = ((id * 79 + 13) % 40) - 20;
  const rotate  = Number(((rotBase + rotHarm * 0.3) / 7).toFixed(1)); // ±12deg

  const delay  = (index % 12) * 0.06;
  const initialZIndex = (total - index) + (id % 30);

  const isFew   = total <= 3;
  const isMedium = total > 3 && total <= 8;
  const noteW   = isFew ? 340 : isMedium ? 290 : 230;
  const textSize = isFew ? "text-base" : "text-sm";

  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate angle from center of the card to the mouse
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const deg = Math.atan2(cx - x, y - cy) * (180 / Math.PI);
    
    cardRef.current.style.setProperty("--card-x", `${x}px`);
    cardRef.current.style.setProperty("--card-y", `${y}px`);
    cardRef.current.style.setProperty("--card-deg", `${deg}deg`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, rotate: 0, y: -36, x: cols === 1 ? "-50%" : 0 }}
      whileInView={{
        opacity: 1,
        scale: isFocused ? 1.04 : 1,
        rotate: isFocused ? 0 : rotate,
        y: 0,
        x: cols === 1 ? "-50%" : 0
      }}
      whileHover={{ scale: 1.035, rotate: 0, x: cols === 1 ? "-50%" : 0 }}
      whileTap={{ scale: 1.01, rotate: 0, x: cols === 1 ? "-50%" : 0 }}
      onPointerEnter={() => setHasInteracted(true)}
      onMouseMove={handleMouseMove}
      onClick={() => {
        setHasInteracted(true);
        setIsFocused(!isFocused);
      }}
      viewport={{ once: true, margin: "80px" }}
      transition={{ type: 'spring', stiffness: 360, damping: 28, delay: hasInteracted ? 0 : delay }}
      className="absolute cursor-pointer group"
      style={{
        left: cols === 1 ? `${leftPct}%` : `clamp(10px, ${leftPct}%, calc(100% - ${noteW}px - 10px))`,
        top: `${topPx}px`,
        width: "90vw",
        maxWidth: `${noteW}px`,
        zIndex: isFocused ? 1000 : initialZIndex,
      }}
    >
      <div
        ref={cardRef}
        className="relative p-6 md:p-7 rounded-[26px] overflow-hidden transition-all duration-700 ease-out"
        style={{
          background: `linear-gradient(145deg, rgba(255,255,255,0.105) 0%, rgba(255,255,255,0.045) 100%)`,
          border: `1px solid rgba(255, 255, 255, 0.12)`,
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
          boxShadow: `
            0 24px 52px -26px rgba(0,0,0,0.78),
            inset 0 1px 1px rgba(255,255,255,0.14),
            inset 0 -1px 1px rgba(0,0,0,0.18)
          `,
        }}
      >
        {/* Internal soft sheen */}
        <div 
          className="absolute inset-x-6 top-0 h-px opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${accentColor}80 45%, transparent 100%)` }}
        />

        {/* Pointer-following highlight, clipped by the note itself */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 mix-blend-screen" 
             style={{ 
               background: `
                 radial-gradient(360px circle at var(--card-x, 50%) var(--card-y, 50%), rgba(255,255,255,0.16) 0%, transparent 42%),
                 linear-gradient(var(--card-deg, var(--light-deg, 135deg)), rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 22%, transparent 52%)
               ` 
             }} />

        {/* Subtle paper grain */}
        <div
          className="absolute inset-0 opacity-[0.008] pointer-events-none z-0 mix-blend-overlay"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 240 240%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.45%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')" }}
        />

        {/* Highlight inner border on hover */}
        <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-colors duration-500 rounded-[26px] pointer-events-none z-10" />

        {/* Content */}
        <p
          className={`relative z-10 font-grotesk text-foreground/80 group-hover:text-foreground transition-colors duration-500 leading-[1.85] tracking-wide mb-6 break-words ${textSize}`}
        >
          {entry.message}
        </p>

        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] tracking-[0.2em] text-foreground/40 group-hover:text-foreground/70 transition-colors duration-500 uppercase">
              {entry.nickname ?? tr.anon}
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-wider text-foreground/30 group-hover:text-foreground/50 transition-colors duration-500">
            {formatDate(entry.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}



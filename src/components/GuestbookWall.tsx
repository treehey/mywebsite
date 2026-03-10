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
  "#00F5FF", // Cyan
  "#FF2D78", // Pink
  "#9D4EDD", // Purple 
  "#39FF14", // Neon Green
  "#48CAE4", // Soft Tech Blue
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

  useEffect(() => {
    // 监听来自 DanmakuSystem 表单提交后的即时通知
    const onNew = (e: Event) => {
      const entry = (e as CustomEvent<GuestEntry>).detail;
      if (entry?.message) setEntries(prev => [entry, ...prev].slice(0, 80));
    };
    window.addEventListener("guestbook:new", onNew);

    if (!supabase) return () => window.removeEventListener("guestbook:new", onNew);

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

  const cols = entries.length === 0 ? 3
    : entries.length <= 2 ? entries.length
    : Math.max(2, Math.min(5, Math.ceil(Math.sqrt(entries.length * 1.4))));
  const wallHeight = Math.ceil(entries.length / cols) * 280 + 220;

  return (
    <section className="relative min-h-screen py-28 px-6 md:px-12 overflow-hidden">
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
          className="mb-10"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#FF2D78] mb-4">
            GUESTBOOK
          </p>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="font-grotesk font-black text-5xl md:text-7xl text-[#E2E2EC] leading-[1] mb-4">
                {tr.title}
              </h2>
              <p className="font-grotesk text-[#E2E2EC]/40 text-base max-w-sm">
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
                background: showForm ? "rgba(255,45,120,0.12)" : "rgba(14,14,28,0.88)",
                borderColor: showForm ? "rgba(255,45,120,0.5)" : "rgba(0,245,255,0.35)",
                color: showForm ? "#FF2D78" : "#00F5FF",
                backdropFilter: "blur(14px)",
                boxShadow: showForm ? "0 0 24px rgba(255,45,120,0.15)" : "0 0 24px rgba(0,245,255,0.1)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: showForm ? "#FF2D78" : "#00F5FF" }} />
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
                  background: "rgba(7,7,15,0.94)",
                  border: "1px solid rgba(255,45,120,0.2)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 0 50px rgba(255,45,120,0.06), 0 24px 64px rgba(0,0,0,0.7)",
                }}
              >
                <div className="flex flex-col gap-5">
                  {/* Message (required) */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FF2D78]">{tr.msgLabel}</label>
                      <span className="font-mono text-[10px] text-[#E2E2EC]/30">{messageText.length}/150</span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      maxLength={150}
                      rows={3}
                      placeholder={tr.msgPlaceholder}
                      className="w-full bg-transparent font-grotesk text-sm text-[#E2E2EC] placeholder-[#E2E2EC]/25 outline-none border border-[#E2E2EC]/10 focus:border-[#FF2D78] rounded-lg p-3 resize-none transition-colors duration-300"
                    />
                  </div>
                  {/* Danmaku title (optional) */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#00F5FF]">{tr.dmkLabel} <span className="text-[#E2E2EC]/30">{tr.optional}</span></label>
                      <span className="font-mono text-[10px] text-[#E2E2EC]/30">{titleText.length}/30</span>
                    </div>
                    <input
                      type="text"
                      value={titleText}
                      onChange={e => setTitleText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      maxLength={30}
                      placeholder={tr.dmkPlaceholder}
                      className="w-full bg-transparent font-grotesk text-sm text-[#E2E2EC] placeholder-[#E2E2EC]/25 outline-none border-b border-[#E2E2EC]/20 focus:border-[#00F5FF] pb-2 transition-colors duration-300"
                    />
                  </div>
                  {/* Nickname + submit */}
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#39FF14] mb-2 block">{tr.nickLabel} <span className="text-[#E2E2EC]/30">{tr.optional}</span></label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={e => setNickname(e.target.value)}
                        maxLength={20}
                        placeholder={tr.nickPlaceholder}
                        className="w-full bg-transparent font-grotesk text-sm text-[#E2E2EC] placeholder-[#E2E2EC]/25 outline-none border-b border-[#E2E2EC]/10 focus:border-[#39FF14] pb-2 transition-colors duration-300"
                      />
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={!messageText.trim() || status === "sending"}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-40 active:scale-95 shrink-0"
                      style={{
                        background: status === "done" ? "rgba(57,255,20,0.15)" : "rgba(255,45,120,0.12)",
                        border: `1px solid ${status === "done" ? "rgba(57,255,20,0.5)" : "rgba(255,45,120,0.4)"}`,
                        color: status === "done" ? "#39FF14" : "#FF2D78",
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
            <p className="font-mono text-[#E2E2EC]/20 text-sm">{tr.empty}</p>
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

  // Jitter inside the cell using different primes per axis — up to 60% of cell width
  const jitterX = ((id * 317 + col * 89 + 43) % Math.round(cellW * 6)) / 10; // 0 to ~60% of cellW
  const jitterY = ((id * 251 + row * 73 + 17) % 100) - 50;  // ±50px vertical chaos

  // Stagger odd cols downward for a more organic staircase feel
  const colStagger = (col % 2) * 70 + (col % 3) * 30;

  const leftPct = cellW * col + cellW * 0.05 + jitterX;
  const topPx   = row * 310 + 40 + jitterY + colStagger;

  // Rotation: more variance with secondary harmonic
  const rotBase = ((id * 137 + 31) % 120) - 60;
  const rotHarm = ((id * 79 + 13) % 40) - 20;
  const rotate  = Number(((rotBase + rotHarm * 0.3) / 7).toFixed(1)); // ±12deg

  const delay  = (index % 12) * 0.06;
  const zIndex = (total - index) + (id % 30);

  const isFew   = total <= 3;
  const isMedium = total > 3 && total <= 8;
  const noteW   = isFew ? 340 : isMedium ? 290 : 230;
  const textSize = isFew ? "text-base" : "text-sm";

  // Tape angle varies per note
  const tapeAngle = ((id * 41 + 13) % 14) - 7;
  const tapeOffX  = ((id * 53 + 7) % 60) - 30; // tape can be off-center

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, rotate: rotate - 15, y: -30 }}
      whileInView={{ opacity: 1, scale: 1, rotate: rotate, y: 0 }}
      whileHover={{ scale: 1.07, rotate: 0, zIndex: 1000 }}
      whileTap={{ scale: 1.03, rotate: 0, zIndex: 1000 }}
      viewport={{ once: true, margin: "80px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className="absolute cursor-pointer"
      style={{
        left: `calc(${leftPct}% + 0px)`,
        top: `${topPx}px`,
        width: `${noteW}px`,
        zIndex,
      }}
    >
      {/* Tape strip — positioned off-center with rotation */}
      <div
        className="absolute -top-4 z-10 w-14 h-6"
        style={{
          left: `calc(50% + ${tapeOffX}px)`,
          transform: `translateX(-50%) rotate(${tapeAngle}deg)`,
          background: "linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08), rgba(255,255,255,0.18))",
          backdropFilter: "blur(4px)",
          borderRadius: "1px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)",
        }}
      />

      <div
        className="relative p-5 rounded-md overflow-hidden"
        style={{
          // More visible, slightly warm dark card bg — clearly distinct from page bg
          background: `linear-gradient(145deg, rgba(32,28,52,0.97) 0%, rgba(18,16,36,0.99) 100%)`,
          borderTop: `3px solid ${accentColor}`,
          border: `1.5px solid ${accentColor}44`,
          backdropFilter: "blur(16px)",
          boxShadow: `
            0 16px 40px rgba(0,0,0,0.7),
            0 4px 12px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.04),
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 0 30px ${accentColor}22
          `,
        }}
      >
        {/* Subtle paper noise */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')" }}
        />

        {/* Accent tint wash */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none rounded-md"
          style={{ background: `radial-gradient(ellipse at top left, ${accentColor}, transparent 70%)` }}
        />

        <p
          className={`relative z-10 font-grotesk text-[#E8E8F0] leading-relaxed tracking-wide mb-4 break-words ${textSize}`}
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
        >
          {entry.message}
        </p>

        <div className="relative z-10 flex items-center justify-between pt-3 border-t" style={{ borderColor: `${accentColor}30` }}>
          <span className="font-mono text-xs font-semibold tracking-wider" style={{ color: accentColor }}>
            {entry.nickname ?? tr.anon}
          </span>
          <span className="font-mono text-[10px] text-[#E2E2EC]/50">
            {formatDate(entry.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}


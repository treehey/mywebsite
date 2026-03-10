"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, type GuestEntry } from "@/lib/supabase";

const ACCENT_COLORS = [
  "#00F5FF", "#FF2D78", "#39FF14", "#F5C542",
  "#B200FF", "#FF7700",
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
          className="mb-10"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#FF2D78] mb-4">
            GUESTBOOK
          </p>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="font-grotesk font-black text-5xl md:text-7xl text-[#E2E2EC] leading-[1] mb-4">
                留言墙
              </h2>
              <p className="font-grotesk text-[#E2E2EC]/40 text-base max-w-sm">
                每一张便利贴都是来自互联网的问候
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
              {showForm ? "收起" : "写留言"}
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
                      <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FF2D78]">详细留言 *</label>
                      <span className="font-mono text-[10px] text-[#E2E2EC]/30">{messageText.length}/150</span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      maxLength={150}
                      rows={3}
                      placeholder="留下你的问候、评价、祝福…"
                      className="w-full bg-transparent font-grotesk text-sm text-[#E2E2EC] placeholder-[#E2E2EC]/25 outline-none border border-[#E2E2EC]/10 focus:border-[#FF2D78] rounded-lg p-3 resize-none transition-colors duration-300"
                    />
                  </div>
                  {/* Danmaku title (optional) */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#00F5FF]">弹幕标题 <span className="text-[#E2E2EC]/30">可选</span></label>
                      <span className="font-mono text-[10px] text-[#E2E2EC]/30">{titleText.length}/30</span>
                    </div>
                    <input
                      type="text"
                      value={titleText}
                      onChange={e => setTitleText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      maxLength={30}
                      placeholder="填写则同时以弹幕飞过 Hero 页…"
                      className="w-full bg-transparent font-grotesk text-sm text-[#E2E2EC] placeholder-[#E2E2EC]/25 outline-none border-b border-[#E2E2EC]/20 focus:border-[#00F5FF] pb-2 transition-colors duration-300"
                    />
                  </div>
                  {/* Nickname + submit */}
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#39FF14] mb-2 block">昵称 <span className="text-[#E2E2EC]/30">可选</span></label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={e => setNickname(e.target.value)}
                        maxLength={20}
                        placeholder="匿名访客"
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
                      {status === "done" ? "已发送 ✓" : status === "err" ? "失败 ✗" : "发送 →"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Message body */}
        <p className="font-grotesk text-[#E2E2EC]/75 text-sm leading-relaxed mb-4">
          {entry.message}
        </p>

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

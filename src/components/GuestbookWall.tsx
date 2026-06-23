"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, type GuestEntry } from "@/lib/supabase";
import { TactileDesk } from "@/components/guestbook/TactileDesk";

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

export function GuestbookWall({ 
  lang = "简",
  setCursorBig = () => {}
}: { 
  lang?: string;
  setCursorBig?: (v: boolean) => void;
}) {
  const tr = TL_GW[lang] ?? TL_GW["简"];
  const [entries, setEntries] = useState<GuestEntry[]>([]);
  const [showForm, setShowForm]     = useState(false);
  const [messageText, setMessageText] = useState("");
  const [titleText, setTitleText]   = useState("");
  const [nickname, setNickname]     = useState("");
  const [status, setStatus]         = useState<"idle" | "sending" | "done" | "err">("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setIsLight(document.documentElement.classList.contains("light"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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
              className="flex items-center gap-2 px-5 py-3 rounded-full font-mono text-xs uppercase tracking-widest border transition-all duration-300 shrink-0 cursor-pointer"
              style={{
                background: isLight
                  ? (showForm ? "rgba(34, 32, 28, 0.08)" : "rgba(34, 32, 28, 0.04)")
                  : (showForm ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.055)"),
                borderColor: isLight
                  ? (showForm ? "rgba(34, 32, 28, 0.22)" : "rgba(34, 32, 28, 0.08)")
                  : (showForm ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.12)"),
                color: isLight ? "var(--foreground)" : "#FFFFFF",
                backdropFilter: "blur(12px) saturate(130%)",
                boxShadow: isLight
                  ? (showForm ? "0 12px 32px rgba(34,32,28,0.05)" : "0 10px 28px rgba(34,32,28,0.02)")
                  : (showForm ? "0 12px 32px rgba(0,0,0,0.28)" : "0 10px 28px rgba(0,0,0,0.2)"),
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: isLight ? (showForm ? "var(--foreground)" : "rgba(34, 32, 28, 0.45)") : (showForm ? "#FFFFFF" : "rgba(255,255,255,0.55)") }} />
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
                  background: isLight ? "rgba(255, 255, 255, 0.78)" : "rgba(12,12,12,0.78)",
                  border: isLight ? "1px solid rgba(34, 32, 28, 0.12)" : "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(18px) saturate(135%)",
                  boxShadow: isLight
                    ? "0 24px 64px rgba(34,32,28,0.06), inset 0 1px 1px rgba(255,255,255,0.6)"
                    : "0 24px 64px rgba(0,0,0,0.42), inset 0 1px 1px rgba(255,255,255,0.08)",
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
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-40 active:scale-95 shrink-0 cursor-pointer"
                      style={{
                        background: isLight
                          ? (status === "done" ? "rgba(34, 32, 28, 0.15)" : "rgba(34, 32, 28, 0.08)")
                          : (status === "done" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"),
                        border: `1px solid ${isLight
                          ? (status === "done" ? "rgba(34, 32, 28, 0.4)" : "rgba(34, 32, 28, 0.2)")
                          : (status === "done" ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.4)")}`,
                        color: isLight ? "var(--foreground)" : "#FFFFFF",
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

        {/* Tactile Workspace Desk */}
        <TactileDesk entries={entries} tr={tr} setCursorBig={setCursorBig} />

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





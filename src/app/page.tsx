"use client";

import { useEffect, useRef, useState } from "react";

const B = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
import { DanmakuSystem } from "@/components/DanmakuSystem";
import dynamic from "next/dynamic";
const GuestbookWall = dynamic(() => import("@/components/GuestbookWall").then(m => ({ default: m.GuestbookWall })), { ssr: false });
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  AnimatePresence,
  type Variants,
} from "framer-motion";

/* ════════════════════════════════════════════════════════
   TEXT SCRAMBLE HOOK
════════════════════════════════════════════════════════ */
function useScramble(text: string, trigger: boolean) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!trigger) {
      setDisplay(text);
      return;
    }
    const CHARS = "0123456789ABCDEFabcdef#@%!?/|\\[]{}~<>^*";
    let frame = 0;
    let rafCount = 0;
    const SPEED = 4; // advance logic frame every N RAF calls
    const total = 60; // fixed total logic frames so all texts animate at same duration
    let raf: number;
    const update = () => {
      rafCount++;
      if (rafCount % SPEED === 0) frame++;
      setDisplay(
        text.split("").map((ch, i) => {
          if (ch === " ") return " ";
          const resolveAt = Math.floor((i / text.length) * total);
          if (frame >= resolveAt) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("")
      );
      if (frame <= total) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [trigger, text]);
  return display;
}

function ScrambleText({ text, className, margin = "-100px", trigger: externalTrigger }: { text: string; className?: string; margin?: string; trigger?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  // @ts-ignore
  const inView = useInView(ref, { once: false, margin: "-20%" });
  const trigger = externalTrigger !== undefined ? externalTrigger : inView;
  const display = useScramble(text, trigger);
  return <span ref={ref} className={className}>{display}</span>;
}

/* ════════════════════════════════════════════════════════
   MAGNETIC BUTTON HOOK
════════════════════════════════════════════════════════ */
function MagneticButton({ children, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const mouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current!.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x, y });
  };

  const mouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref as any}
      onMouseMove={mouseMove as any}
      onMouseLeave={mouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}   
      className={className}
    >
      <a {...props} className="w-full h-full block">    
        {children}
      </a>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════
   DATA & DICTIONARY
════════════════════════════════════════════════════════ */
const DICT = {
  'EN': {
    nav: { about: 'About', works: 'Works', gallery: 'Gallery', skills: 'Skills', timeline: 'Timeline', guestbook: 'Guestbook', contact: 'Contact' },
    hero: { desc: "Operating from NJU. Engineering robust software architectures and crafting immersive digital experiences.", loc: "Location", locVal: "Macau → Nanjing", foc: "Focus", focVal: "Full-Stack / Creative Dev" },
    about: { sub: "About.exe", title1: "Behind the", title2: "Screen.", p1: "My journey into software engineering didn't start with standard syntax—it began with Redstone in Minecraft. Building virtual logic arrays slowly evolved into writing robust backend frameworks, ultimately leading to architecting expansive modern internet systems.", p2: "Currently operating out of NJU, I thrive at the intersection of logical engineering and raw aesthetic emotion. Photography teaches me about composition and light, while code gives me the tools to build and manipulate entire digital worlds.", tags: ["FULL-STACK WEB", "SYSTEM ARCH", "PHOTOGRAPHY"] },
    works: { title1: "SELECTED", title2: "WORKS.", archive: "v2.0 // Archive", view: "VIEW PROJECT", items: [ { title: "Wide Research Finance", desc: "An AI-powered financial intelligence terminal. Automates 17+ global news sources via DeepSeek LLM for real-time sentiment and event analysis.", tag: "AI / AUTOMATION", link: "https://finai.org.cn" }, { title: "Enzyme Explorer", desc: "An immersive science education website exploring enzyme biochemistry across bread, wine, and cheese — built with pure HTML/CSS/JS featuring rich interactive labs.", tag: "SCIENCE / CREATIVE WEB", link: "https://treehey.github.io/Enzyme/" } ] },
    gallery: { m1: "I DON'T JUST", m2: "WRITE CODE.", m3: "I ENGINEER", m4: "EMOTIONS.", photos: [ "Mong Kok · Neon & Dust", "Lujiazui · Urban Spine", "Love Post Office · Letter", "Panda · Gentle Power" ] },
    skills: { title1: "SYSTEM", title2: "OVERVIEW", items: [ "Computer Sys. · Hardware & Software", "Front-End · Website Design", "Python · Proficiency", "Office Suite · Advanced Mastery", "Photography · Foodie / Life" ] },
    timeline: { title: "Runtime Logs", items: [ { label: "Minecraft", detail: "Redstone & Logical Gates" }, { label: "Python/Algos", detail: "Macau Python Competition Top 5" }, { label: "Office Master", detail: "Macau Office Software Competition 3rd" }, { label: "STEAM & IoT", detail: "STEAM & IoT Competition 2nd Place" }, { label: "Web Tech", detail: "Macau Web Design Competition 2nd" }, { label: "NJU", detail: "Nanjing University Software Eng." } ] },
    contact: { sub: "Connect.exe", t1: "INITIATE", t2: "HANDSHAKE." },
    marquee: "SOFTWARE ENGINEERING — CREATIVE CODING — SLOTH — "
  },
  '简': {
    nav: { about: '关于', works: '项目', gallery: '画廊', skills: '技能', timeline: '日志', guestbook: '留言墙', contact: '联系' },
    hero: { desc: "坐标南京大学（NJU）。致力于构建可靠的软件架构与沉浸式的现代数字交互体验。", loc: "位置", locVal: "澳门 → 南京", foc: "专注", focVal: "软件工程 / 创意编程" },
    about: { sub: "关于.exe", title1: "屏幕", title2: "背后。", p1: "我的软件工程之旅并非始于标准语法——而是从 Minecraft 的红石电路开始。搭建早期的虚拟逻辑门逐渐演变为编写稳健的后端框架，最终将我引向了构建广阔的现代全栈架构与互联网系统。", p2: "目前坐标南京大学，我游走于严谨的系统抽象与纯粹的视觉交互交汇处。摄影教会我何为构图与光影，而代码则赋予我构筑世界、操控数据的纯粹力量。", tags: ["全栈架构设计", "现代前端工程", "摄影与视觉表达"] },
    works: { title1: "精选", title2: "项目。", archive: "v2.0 // 归档", view: "查看项目", items: [ { title: "Wide Research 金融智库", desc: "基于大语言模型（DeepSeek V3）的自动化财经情报系统。全天候聚合17+全球信源，实现深度热点提取与市场情感分析网。", tag: "AI智能分析 / 自动化", link: "https://finai.org.cn" }, { title: "酶学探索平台", desc: "沉浸式生物科学教育展示网站，以面包发酵、葡萄酿酒、奶酪制作为载体，生动呈现酶在食品工业中的奥秘，纯 HTML/CSS/JS 精心打造。", tag: "科学教育 / 创意展示", link: "https://treehey.github.io/Enzyme/" } ] },
    gallery: { m1: "我不仅仅", m2: "编写代码。", m3: "我更在", m4: "编织情绪。", photos: [ "旺角 · 霓虹与尘埃", "陆家嘴 · 城市脊梁", "爱情邮局 · 一纸情书", "大熊猫 · 温柔力量" ] },
    skills: { title1: "系统", title2: "概览", items: [ "计算机系统 · 软硬件与Linux", "前端开发 · 现代网站设计", "Python · 代码与运行熟练", "Office 套件 · 深度精通", "人文纪实 · 摄影与干饭热爱" ] },
    timeline: { title: "运行日志", items: [ { label: "逻辑启蒙", detail: "Minecraft 红石机械与指令实验" }, { label: "初试代码", detail: "Python解难赛全澳 Top 5" }, { label: "效率先锋", detail: "Office技能比赛全澳季军" }, { label: "硬核创客", detail: "STEAM及IoT创意解难赛全澳亚军" }, { label: "前端构建", detail: "手机网页技术比赛亚军及独立程序开发" }, { label: "南京大学", detail: "软件工程本科深造新篇章" } ] },
    contact: { sub: "连接.exe", t1: "传输", t2: "信号。" },
    marquee: "现代软件工程 — 创意编程与体验架构 — 树懒 — "
  },
  '繁': {
    nav: { about: '關於', works: '項目', gallery: '畫廊', skills: '技能', timeline: '日誌', guestbook: '留言牆', contact: '聯繫' },
    hero: { desc: "座標南京大學（NJU）。致力於構建可靠的軟件架構與沉浸式的現代數字交互體驗。", loc: "位置", locVal: "澳門 → 南京", foc: "專注", focVal: "軟件工程 / 創意編程" },
    about: { sub: "關於.exe", title1: "屏幕", title2: "背後。", p1: "我的軟件工程之旅並非始於標準語法——而是從 Minecraft 的紅石電路開始。搭建早期的虛擬邏輯門逐漸演變為編寫穩健的後端框架，最終將我引向了構建廣闊的現代全棧架構與互聯網系統。", p2: "目前座標南京大學，我遊走於嚴謹的系統抽象與純粹的視覺交互交匯處。攝影教會我何為構圖與光影，而代碼則賦予我構築世界、操控數據的純粹力量。", tags: ["全棧架構設計", "現代前端工程", "攝影與視覺表達"] },
    works: { title1: "精選", title2: "項目。", archive: "v2.0 // 歸檔", view: "查看項目", items: [ { title: "Wide Research 金融智庫", desc: "基於大語言模型（DeepSeek V3）的自動化財經情報系統。全天候聚合17+全球信源，實現深度熱點提取與市場情感分析網。", tag: "AI智能分析 / 自動化", link: "https://finai.org.cn" }, { title: "酶學探索平台", desc: "沉浸式生物科學教育展示網站，以麵包發酵、葡萄釀酒、奶酪製作為載體，生動呈現酶在食品工業中的奧秘，純 HTML/CSS/JS 精心打造。", tag: "科學教育 / 創意展示", link: "https://treehey.github.io/Enzyme/" } ] },
    gallery: { m1: "我不僅僅", m2: "編寫代碼。", m3: "我更在", m4: "編織情緒。", photos: [ "旺角 · 霓虹與塵埃", "陸家嘴 · 城市脊梁", "愛情郵局 · 一紙情書", "大熊貓 · 溫柔力量" ] },
    skills: { title1: "系統", title2: "概覽", items: [ "計算機系統 · 軟硬件與Linux", "前端開發 · 現代網站設計", "Python · 代碼與運行熟練", "Office 套件 · 深度精通", "人文紀實 · 攝影與乾飯熱愛" ] },
    timeline: { title: "運行日誌", items: [ { label: "邏輯啟蒙", detail: "Minecraft 紅石機械與指令實驗" }, { label: "初試代碼", detail: "Python解難賽全澳 Top 5" }, { label: "效率先鋒", detail: "Office技能比賽全澳季軍" }, { label: "硬核創客", detail: "STEAM及IoT創意解難賽全澳亞軍" }, { label: "前端構建", detail: "手機網頁技術比賽亞軍及獨立程序開發" }, { label: "南京大學", detail: "軟件工程本科深造新篇章" } ] },
    contact: { sub: "連接.exe", t1: "傳輸", t2: "信號。" },
    marquee: "現代軟件工程 — 創意編程與體驗架構 — 樹懶 — "
  }
};

const PHOTOS = [
  { src: `${B}/images/HK.jpg`,       title: "HONG KONG", num: "01" },
  { src: `${B}/images/shanghai.jpg`, title: "SHANGHAI",   num: "02" },
  { src: `${B}/images/zhuhai.jpg`,   title: "ZHUHAI",     num: "03" },
  { src: `${B}/images/panda.jpg`,    title: "SICHUAN",    num: "04" },
];

const SKILLS = [
  { name: "Computer",     accent: "#00F5FF", bg: `${B}/images/about/computer-room.jpg` },
  { name: "Front-End",    accent: "#FF2D78", bg: `${B}/images/about/information-technology.jpg` },
  { name: "Python",       accent: "#39FF14", bg: `${B}/images/about/python.jpeg` },
  { name: "Office",       accent: "#F5C542", bg: `${B}/images/about/ppt.jpg` },
  { name: "Photography",  accent: "#B200FF", bg: `${B}/images/zhuhai.jpg` },
];

const TIMELINE = [
    { year: "2012", img: `${B}/images/about/Minecraft.jfif` },
    { year: "2021", img: `${B}/images/about/python.jpeg` },
    { year: "2022", img: `${B}/images/about/ppt.jpg` },
    { year: "2022", img: `${B}/images/about/steam&iot.jpg` },
    { year: "2023", img: `${B}/images/about/information-technology.jpg` },
    { year: "2024", img: `${B}/images/about/nju.jpg` },
  ];

function VerticalTimeline({ t, setCursorBig, TIMELINE }: { t: any, setCursorBig: (v: boolean) => void, TIMELINE: any[] }) {
  return (
    <section id="timeline" className="relative bg-[#07070F] py-24 md:py-32 overflow-hidden">
      
      {/* Section Header */}
      <div className="w-full border-b border-[#E2E2EC]/10 px-6 md:px-12 py-5 flex items-center justify-between mb-0">
        <span className="font-mono text-xs text-[#39FF14] tracking-[0.5em] uppercase" style={{ textShadow: "0 0 10px rgba(57,255,20,0.5)" }}>
          {t.timeline.title}
        </span>
        <span className="font-mono text-xs text-[#E2E2EC]/30 tracking-widest">§ 00{TIMELINE.length} ENTRIES</span>
      </div>

      {/* Background large year ghost */}
      <div className="absolute top-1/2 right-[-5vw] -translate-y-1/2 font-syne font-black text-[35vw] text-[#E2E2EC]/[0.02] pointer-events-none select-none leading-none" style={{ fontFamily: "var(--font-syne)" }}>
        LOG
      </div>

      <div className="relative px-6 md:px-12 lg:px-24 pt-16 pb-8">
        {/* Vertical Glow Line */}
        <div className="absolute left-[calc(1.5rem+16px)] md:left-[calc(3rem+16px)] lg:left-[calc(6rem+16px)] top-16 bottom-8 w-[1px] bg-gradient-to-b from-[#00F5FF]/10 via-[#FF2D78]/30 to-[#39FF14]/10" />

        <div className="flex flex-col gap-0">
          {TIMELINE.map((node, i) => {
            const accent = i % 3 === 0 ? '#00F5FF' : i % 3 === 1 ? '#FF2D78' : '#39FF14';
            const item = t.timeline.items[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-6 md:gap-10 group border-b border-[#E2E2EC]/5 py-8 md:py-12 relative"
                onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
              >
                {/* Dot + connector */}
                <div className="relative flex-shrink-0 flex flex-col items-center pt-1">
                  <div 
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 group-hover:scale-110 bg-[#07070F] z-10 relative"
                    style={{ borderColor: accent, boxShadow: `0 0 12px ${accent}60` }}
                  >
                    <div className="w-2 h-2 rounded-full transition-all duration-300 group-hover:scale-150" style={{ backgroundColor: accent }} />
                  </div>
                </div>

                {/* Year */}
                <div className="flex-shrink-0 w-16 md:w-24 pt-1.5">
                  <span 
                    className="font-mono text-lg md:text-2xl font-bold transition-all duration-300"
                    style={{ color: accent, textShadow: `0 0 20px ${accent}40` }}
                  >
                    {node.year}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0">
                  <div className="flex-1">
                    <h3 
                      className="font-syne font-black text-2xl md:text-4xl text-[#E2E2EC] leading-none mb-2 group-hover:translate-x-2 transition-transform duration-500"
                      style={{ fontFamily: "var(--font-syne)" }}
                    >
                      {item.label}
                    </h3>
                    <p className="font-mono text-sm text-[#E2E2EC]/50 tracking-wide">
                      {item.detail}
                    </p>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-24 h-16 md:w-40 md:h-28 rounded-lg overflow-hidden flex-shrink-0 border border-[#E2E2EC]/10 group-hover:border-opacity-50 transition-all duration-500 md:ml-auto relative"
                    style={{ borderColor: `${accent}30` }}>
                    <img src={node.img} alt={item.label} loading="lazy" decoding="async" className="w-full h-full object-cover grayscale-[70%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#07070F]/60" />
                  </div>
                </div>

                {/* Milestone badge */}
                <div 
                  className="hidden lg:flex items-center gap-2 flex-shrink-0 font-mono text-[10px] tracking-[0.3em] uppercase border px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0"
                  style={{ color: accent, borderColor: `${accent}40`, backgroundColor: `${accent}0D` }}
                >
                  <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
                  MILESTONE_{String(i + 1).padStart(2, '0')}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  
  const [cursorBig, setCursorBig] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("简");
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const t = DICT[lang as keyof typeof DICT];

  // Scroll Spy Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { rootMargin: "-30% 0px -50% 0px" });

    const sections = document.querySelectorAll('section[id], div[id="timeline"]');
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (theme === "light") document.documentElement.classList.add("light");
    else document.documentElement.classList.remove("light");
  }, [theme]);

  /* Mouse tracking */
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const cx = useSpring(mouseX, { stiffness: 400, damping: 30 });
  const cy = useSpring(mouseY, { stiffness: 400, damping: 30 });

  /* Mouse delta for parallax */
  const [mDelta, setMDelta] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const fn = (e: MouseEvent) => { 
      mouseX.set(e.clientX); 
      mouseY.set(e.clientY);
      setMDelta({ x: (e.clientX - cx) / cx, y: (e.clientY - cy) / cy });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [mouseX, mouseY]);

  /* Scroll setup */
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  /* Horizontal scroll mapping */
  const { scrollYProgress: horizontalProgress } = useScroll({ target: horizontalRef, offset: ["start start", "end end"] });
  const xTransform = useTransform(horizontalProgress, [0, 1], ["0%", "-80%"]); // 5 panels = -80%

  /* Panel 1 (manifesto) visible when horizontal progress < 0.15 */
  const [panel1Visible, setPanel1Visible] = useState(false);
  useMotionValueEvent(horizontalProgress, "change", (v) => {
    setPanel1Visible(v > 0.02 && v < 0.15);
  });

  const HERO_CHARS = "TREE HEY".split("");

  return (
    <main ref={containerRef} className="relative w-full bg-[#07070F] text-[#E2E2EC]">
      <div id="top" className="absolute top-0" />
      
      {/* ───── NAV PILL ───── */}
      <header className="fixed bottom-6 md:bottom-auto md:top-6 left-1/2 -translate-x-1/2 z-[990] flex items-center px-4 md:px-7 py-3 rounded-full bg-[#0E0E1C]/80 backdrop-blur-2xl border border-[#00F5FF]/15 transition-all w-[90vw] md:w-auto justify-between md:justify-center overflow-visible">
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)} className="shrink-0 font-syne font-bold text-lg text-[#00F5FF] glow-cyan tracking-widest hover:scale-110 transition-transform cursor-pointer" style={{ fontFamily: "var(--font-syne)" }}>TH</a>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 font-grotesk text-[11px] uppercase tracking-widest text-[#E2E2EC]/45 flex-1 md:flex-none justify-center md:ml-6 md:mr-2">
          {[
            { id: 'about', label: t.nav.about },
            { id: 'works', label: t.nav.works },
            { id: 'gallery', label: t.nav.gallery },
            { id: 'skills', label: t.nav.skills },
            { id: 'timeline', label: t.nav.timeline },
            { id: 'guestbook', label: t.nav.guestbook },
            { id: 'contact', label: t.nav.contact },
          ].map(item => (
            <a key={item.id} href={`#${item.id}`}
              onClick={(e) => { 
                e.preventDefault(); 
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }); 
              }}
              className={`shrink-0 transition-colors duration-300 ${activeSection === item.id ? 'text-[#00F5FF] font-bold drop-shadow-[0_0_8px_rgba(0,245,255,0.8)] scale-110' : 'hover:text-[#00F5FF]'}`}
              onMouseEnter={() => setCursorBig(true)}
              onMouseLeave={() => setCursorBig(false)}
            >{item.label}</a>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex flex-1 justify-center md:hidden transition-all duration-300">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`font-mono text-[10px] tracking-[0.2em] uppercase transition-colors px-4 py-1 flex items-center gap-2 rounded-full border ${mobileMenuOpen ? 'text-[#00F5FF] border-[#00F5FF]/30 bg-[#00F5FF]/10' : 'text-[#E2E2EC]/70 border-transparent hover:text-[#E2E2EC]'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: mobileMenuOpen ? '#00F5FF' : '#E2E2EC', opacity: mobileMenuOpen ? 1 : 0.4 }}></span>
            {mobileMenuOpen ? 'CLOSE' : 'MENU'}
          </button>
        </div>

        {/* TOGGLES */}
        <div className="shrink-0 flex items-center gap-3 md:gap-4 border-l border-[#E2E2EC]/20 pl-4 md:pl-6">
          <button aria-label="Toggle Theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-[#E2E2EC]/50 hover:text-[#00F5FF] text-xs md:text-sm transition-colors" onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}>
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <div className="relative flex items-center">
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className={`p-1 transition-colors ${langOpen ? 'text-[#00F5FF]' : 'text-[#E2E2EC]/50 hover:text-[#00F5FF]'}`}
              onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
              aria-label="Toggle Language"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </button>
            
            {/* Dropdown Options */}
            <AnimatePresence>
              {langOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute right-0 md:right-1/2 md:translate-x-1/2 bottom-[140%] md:bottom-auto md:top-[140%] flex flex-col bg-[#0E0E1C]/95 backdrop-blur-2xl border border-[#00F5FF]/20 rounded-xl p-2 min-w-[110px] shadow-[0_0_30px_rgba(0,245,255,0.1)] origin-bottom-right md:origin-top z-[1000]"
                >
                  {['EN', '简', '繁'].map(l => (
                    <button 
                      key={l} 
                      onClick={() => { setLang(l); setLangOpen(false); }} 
                      className={`text-[11px] md:text-xs font-mono px-3 py-2.5 rounded-lg text-left transition-all flex items-center gap-2 ${lang === l ? 'bg-[#00F5FF]/15 text-[#00F5FF] font-bold shadow-[inset_0_0_10px_rgba(0,245,255,0.2)]' : 'text-[#E2E2EC]/60 hover:bg-[#E2E2EC]/10 hover:text-[#E2E2EC]'}`} 
                      onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
                    >
                      {lang === l && <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] box-glow-cyan"></span>}
                      {l === 'EN' ? 'English' : l === '简' ? '简体中文' : '繁體中文'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ───── MOBILE EXPANDABLE MENU ───── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-[980] w-[85vw] max-w-sm rounded-[1.5rem] bg-[#0E0E1C]/95 backdrop-blur-3xl border border-[#00F5FF]/20 shadow-[0_10px_40px_rgba(0,0,0,0.5),_0_0_20px_rgba(0,245,255,0.1)] overflow-hidden"
          >
            <div className="flex flex-col py-4">
              {[
                { id: 'about', label: t.nav.about },
                { id: 'works', label: t.nav.works },
                { id: 'gallery', label: t.nav.gallery },
                { id: 'skills', label: t.nav.skills },
                { id: 'timeline', label: t.nav.timeline },
                { id: 'guestbook', label: t.nav.guestbook },
                { id: 'contact', label: t.nav.contact },
              ].map((item, i) => (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    setTimeout(() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }), 300);
                  }}
                  className={`w-full px-6 py-3.5 flex items-center justify-between text-left transition-colors border-b border-[#E2E2EC]/5 last:border-0 ${activeSection === item.id ? 'bg-[#00F5FF]/10 text-[#00F5FF]' : 'text-[#E2E2EC]/70 hover:bg-[#E2E2EC]/5 hover:text-[#E2E2EC]'}`}
                >
                  <span className="font-syne font-bold tracking-widest text-sm uppercase">{item.label}</span>
                  {activeSection === item.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] box-glow-cyan animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── CUSTOM CURSOR ───── */}
      <motion.div
        className="hidden md:block fixed top-0 left-0 z-[999] pointer-events-none rounded-full mix-blend-screen"
        style={{ x: cx, y: cy, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: cursorBig ? 90 : 16,
          height: cursorBig ? 90 : 16,
          backgroundColor: cursorBig ? "rgba(0,245,255,0.15)" : "rgba(0,245,255,0.9)",
          border: cursorBig ? "1px solid rgba(0,245,255,0.8)" : "none",
          boxShadow: cursorBig ? "0 0 30px rgba(0,245,255,0.4)" : "0 0 10px rgba(0,245,255,0.8)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />

      {/* ───── BACKGROUND NOISE & FLUID ───── */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#00F5FF]/5 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#FF2D78]/5 blur-[150px]" />
      </div>

      {/* ════════════════════════════════════
          1. HERO (Asymmetric & Interactive)
      ════════════════════════════════════ */}
      <section className="relative z-10 w-full h-screen flex flex-col items-center justify-center overflow-hidden scanlines" id="hero">
        {/* Animated Cyber Grid with 3D Mouse Parallax */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none" style={{ perspective: "1000px" }}>
          <motion.div 
            className="w-full h-full relative"
            animate={{ 
              rotateX: mDelta.y * -15, 
              rotateY: mDelta.x * 15,
              z: mDelta.y * 20, /* Add slight depth pull */
              scale: 1.4 /* Increased scale to prevent edge clipping during extreme parallax */
            }}
            transition={{ type: "spring", stiffness: 45, damping: 15, mass: 0.8 }}
            style={{ transformStyle: "preserve-3d" }}
          >
             <div className="cyber-grid" />
             <div className="cyber-grid-overlay" />
          </motion.div>
        </div>

        <motion.div 
          className="absolute z-0 w-full h-full flex items-center justify-center opacity-[0.05]"
          animate={{ x: mDelta.x * -60, y: mDelta.y * -60 }}
          transition={{ type: "tween", ease: "easeOut", duration: 1 }}
        >
           <div className="font-mono text-[25vw] font-bold text-[#E2E2EC] select-none tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>
             SYS.DEV
           </div>
        </motion.div>

        <div className="relative z-10 max-w-[90vw] w-full flex flex-col items-center px-4 md:px-12 mt-12 md:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
            className="flex flex-col items-center text-center"
          >
            <div className="flex items-center gap-4 mb-6">
               <div className="w-8 h-[2px] bg-[#FF2D78] shadow-[0_0_10px_#FF2D78]" />
               <span className="font-mono text-xs md:text-sm uppercase tracking-[0.5em] text-[#00F5FF] shadow-[0_0_10px_rgba(0,245,255,0.5)]" style={{ fontFamily: "var(--font-mono)" }}>System.init( )_</span>
               <div className="w-8 h-[2px] bg-[#39FF14] shadow-[0_0_10px_#39FF14]" />
            </div>
            
            {/* Split Title with mouse parallax */}
            <motion.div 
              className="flex flex-wrap lg:flex-nowrap gap-x-[4vw] lg:gap-x-0 relative leading-[0.85] justify-center"
              animate={{ x: mDelta.x * 30, y: mDelta.y * 30 }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.5 }}
              onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
            >
              {['TREE', 'HEY'].map((word, wIdx) => (
                <div key={wIdx} className="flex">
                  {word.split("").map((ch, i) => (
                    <div key={`${wIdx}-${i}`} className="relative inline-block overflow-visible group">
                      <motion.span className="rgb-r font-syne font-black select-none text-[18vw] md:text-[14vw] lg:text-[11rem] z-0 group-hover:text-[#00F5FF] transition-colors" 
                        style={{ fontFamily: "var(--font-syne)", transform: `translate(${mDelta.x * -15}px, ${mDelta.y * -15}px)` }}>
                        {ch}
                      </motion.span>
                      <motion.span className="rgb-b font-syne font-black select-none text-[18vw] md:text-[14vw] lg:text-[11rem] z-0 group-hover:text-[#FF2D78] transition-colors" 
                        style={{ fontFamily: "var(--font-syne)", transform: `translate(${mDelta.x * 15}px, ${mDelta.y * 15}px)` }}>
                        {ch}
                      </motion.span>
                      <span className="relative z-10 font-syne font-black text-[18vw] md:text-[14vw] lg:text-[11rem] text-[#E2E2EC] group-hover:opacity-0 transition-opacity duration-300 drop-shadow-[0_0_20px_rgba(226,226,236,0.3)]" 
                        style={{ fontFamily: "var(--font-syne)" }}>
                        {ch}
                      </span>
                    </div>
                  ))}
                  {wIdx === 0 && <div className="w-[4vw] lg:w-[6vw] inline-block" />} {/* Space between words on desktop */}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1.2 }}
            className="mt-16 md:mt-24 flex flex-col md:flex-row gap-6 md:gap-24 w-full max-w-4xl border-t border-[#FF2D78]/20 pt-8 relative before:absolute before:top-[-2px] before:left-0 before:w-16 before:h-[2px] before:bg-[#FF2D78] before:shadow-[0_0_10px_#FF2D78]"
          >
            <p className="font-grotesk text-base md:text-lg text-[#E2E2EC]/70 max-w-md leading-relaxed" style={{ fontFamily: "var(--font-grotesk)" }}>
              {t.hero.desc}
            </p>
            <div className="flex gap-8 md:ml-auto">
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] text-[#00F5FF] tracking-[0.2em] uppercase">{t.hero.loc}</span>
                <span className="font-syne text-lg md:text-xl text-[#E2E2EC]">{t.hero.locVal}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] text-[#FF2D78] tracking-[0.2em] uppercase">{t.hero.foc}</span>
                <span className="font-syne text-lg md:text-xl text-[#E2E2EC]">{t.hero.focVal}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Danmaku Layer ── */}
        <DanmakuSystem lang={lang} />

      </section>

      {/* ════════════════════════════════════
          1.5 ABOUT / EDITORIAL LAYOUT
      ════════════════════════════════════ */}
      <section id="about" className="relative z-10 w-full bg-[#07070F] overflow-hidden">
        
        {/* Row 1 — Full-bleed chapter label */}
        <div className="w-full border-b border-[#E2E2EC]/10 px-6 md:px-12 py-5 flex items-center justify-between">
          <span className="font-mono text-xs text-[#00F5FF] tracking-[0.5em] uppercase glow-cyan">{t.about.sub}</span>
          <span className="font-mono text-xs text-[#E2E2EC]/30 tracking-widest">§ 001 — IDENTITY</span>
        </div>
        
        {/* Row 2 — Oversized editorial heading split */}
        <div className="w-full px-6 md:px-12 pt-16 md:pt-24 pb-4 md:pb-0 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-0">
            <motion.h2 
              initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="font-syne font-black text-[18vw] md:text-[9vw] leading-[1] md:leading-[0.85] text-[#E2E2EC] uppercase"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {t.about.title1}
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
              className="md:mb-4 flex flex-col items-start md:items-end gap-2"
            >
              <p className="font-grotesk text-sm md:text-base text-[#E2E2EC]/50 max-w-[240px] text-left md:text-right leading-relaxed">{t.about.p1.split('.')[0]}.</p>
            </motion.div>
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-syne font-black text-[18vw] md:text-[9vw] leading-[1] md:leading-[0.85] text-transparent uppercase" 
            style={{ fontFamily: "var(--font-syne)", WebkitTextStroke: "2px rgba(0,245,255,0.6)" }}
          >
            {t.about.title2}
          </motion.h2>
        </div>

        {/* Row 3 — Three column editorial grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-0 border-t border-[#E2E2EC]/10 mt-12 md:mt-16">
          
          {/* Col A — Stat blocks */}
          <div className="border-r border-[#E2E2EC]/10 p-6 md:p-10 flex flex-col justify-between gap-8">
            {[
              { label: "BASE", val: "Macau → NJU" },
              { label: "FOCUS", val: "Full-Stack" },
              { label: "ORIGIN", val: "Minecraft" },
            ].map(stat => (
              <motion.div key={stat.label} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p className="font-mono text-[10px] text-[#E2E2EC]/40 uppercase tracking-[0.4em] mb-2">{stat.label}</p>
                <p className="font-syne font-bold text-xl md:text-2xl text-[#E2E2EC]">{stat.val}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Col B — Large featured image with text overlay */}
          <div className="relative overflow-hidden aspect-[4/3] md:aspect-auto md:min-h-[500px]" onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}>
            <motion.div 
              className="absolute inset-0"
              initial={{ scale: 1.1 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <img src={`${B}/images/about/nju.jpg`} alt="NJU" loading="lazy" decoding="async" className="w-full h-full object-cover grayscale-[30%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] via-transparent to-[#07070F]/50" />
            </motion.div>
            {/* Floating label badge */}
            <div className="absolute top-6 left-6 z-10 font-mono text-xs text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/30 px-3 py-1.5 uppercase tracking-[0.3em]">PRESENT // NJU</div>
            <motion.div 
              initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute bottom-8 left-8 right-8 z-10"
            >
              <p className="font-grotesk text-base text-[#E2E2EC]/80 leading-relaxed">{t.about.p2}</p>
            </motion.div>
          </div>
          
          {/* Col C — Tag stack + secondary images */}
          <div className="border-l border-[#E2E2EC]/10 flex flex-col">
            <div className="relative overflow-hidden aspect-square border-b border-[#E2E2EC]/10" onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}>
              <img src={`${B}/images/about/Minecraft.jfif`} alt="Origin" loading="lazy" decoding="async" className="w-full h-full object-cover grayscale-[60%] hover:grayscale-0 transition-all duration-700 hover:scale-105" />
              <div className="absolute bottom-4 left-4 font-mono text-[10px] text-[#FF2D78] bg-[#FF2D78]/10 border border-[#FF2D78]/30 px-2 py-1 uppercase tracking-widest">Origin</div>
            </div>
            <div className="p-6 md:p-8 flex flex-col gap-4 flex-1 justify-end">
              <p className="font-mono text-[10px] text-[#E2E2EC]/40 uppercase tracking-[0.4em]">Modules</p>
              <div className="flex flex-col gap-2">
                {t.about.tags.map((tag, i) => (
                  <motion.div 
                    key={tag} initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 group cursor-default"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]/50 group-hover:bg-[#00F5FF] transition-colors" />
                    <span className="font-mono text-xs text-[#E2E2EC]/50 group-hover:text-[#00F5FF] transition-colors uppercase tracking-widest">{tag}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          1.8 WORKS / CINEMATIC FULL-WIDTH
      ════════════════════════════════════ */}
      <section id="works" className="relative z-10 w-full bg-[#0A0A14]">
        
        {/* Section Header Row */}
        <div className="w-full border-b border-[#E2E2EC]/10 px-6 md:px-12 py-5 flex items-center justify-between">
          <h2 className="font-syne font-black text-xs md:text-sm uppercase tracking-[0.5em] text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #FF2D78, #00F5FF)", fontFamily: "var(--font-syne)" }}>
            {t.works.title1} {t.works.title2}
          </h2>
          <span className="font-mono text-xs text-[#E2E2EC]/30 tracking-widest hidden md:block">{t.works.archive}</span>
        </div>

        {/* Projects — Full-Width Cinematic Rows */}
        {[
          { ...t.works.items[0], img: `${B}/images/wide-research.png` },
          { ...t.works.items[1], img: `${B}/images/enzyme.png` },
        ].map((work, i) => (
          <motion.a 
            href={work.link}
            target={work.link !== "#" ? "_blank" : undefined}
            rel="noopener noreferrer"
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 0.6 }}
            className="group relative flex w-full border-b border-[#E2E2EC]/10 overflow-hidden cursor-pointer block"
            style={{ minHeight: "min(70vh, 600px)" }}
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
          >
            {/* Full-bleed image with parallax-like scale */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.img 
                src={work.img} alt={work.title} 
                className="w-full h-full object-cover grayscale-[60%] group-hover:grayscale-0 transition-[filter] duration-[1.2s]"
                initial={{ scale: 1.05 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A14] via-[#0A0A14]/80 to-transparent" />
              <div className="absolute inset-0 bg-[#0A0A14]/30 group-hover:bg-[#0A0A14]/10 transition-colors duration-700" />
            </div>

            {/* Diagonal accent line */}
            <div className="absolute bottom-0 right-0 w-[30vw] h-[1px] bg-gradient-to-l from-transparent via-[#00F5FF]/40 to-transparent group-hover:via-[#00F5FF]/80 transition-all duration-700" />

            {/* Content overlay */}
            <div className="relative z-10 w-full flex flex-col justify-between p-8 md:p-16 lg:p-20">
              <div className="flex items-start justify-between">
                {/* Index */}
                <span 
                  className="font-syne font-black text-[20vw] md:text-[16vw] lg:text-[12vw] leading-none text-transparent pointer-events-none select-none"
                  style={{ WebkitTextStroke: "1px rgba(255,255,255,0.06)", fontFamily: "var(--font-syne)" }}
                >
                  0{i + 1}
                </span>
                {/* Tag */}
                <span className="font-mono text-xs text-[#FF2D78] border border-[#FF2D78]/40 bg-[#FF2D78]/10 px-3 py-1.5 tracking-widest uppercase mt-2">
                  {work.tag}
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mt-auto">
                <div>
                  <motion.h3 
                    className="font-syne font-black text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-[#E2E2EC] leading-[1.1] pb-2 mb-4"
                    style={{ fontFamily: "var(--font-syne)" }}
                  >
                    {work.title.split(' ').map((word, wi) => (
                      <span key={wi} className="block overflow-visible relative pt-2 -mt-2">
                        <motion.span 
                          className="block group-hover:translate-x-2 transition-transform duration-500"
                          style={{ transitionDelay: `${wi * 60}ms` }}
                        >
                          {word}
                        </motion.span>
                      </span>
                    ))}
                  </motion.h3>
                  <p className="font-grotesk text-sm md:text-base text-[#E2E2EC]/50 max-w-lg leading-relaxed group-hover:text-[#E2E2EC]/70 transition-colors duration-500">
                    {work.desc}
                  </p>
                </div>
                
                {/* View CTA */}
                <div className="flex items-center gap-4 text-[#E2E2EC]/60 group-hover:text-[#00F5FF] transition-colors duration-500 shrink-0">
                  <span className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase">{t.works.view}</span>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-current flex items-center justify-center transform group-hover:rotate-[-45deg] group-hover:bg-[#00F5FF] group-hover:text-[#07070F] group-hover:border-[#00F5FF] transition-all duration-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </section>

      {/* ════════════════════════════════════
          2. HORIZONTAL SCROLL (Manifesto + Gallery)
      ════════════════════════════════════ */}
      <section id="gallery" ref={horizontalRef} className="relative z-10 h-[500vh] bg-[#0A0A14]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
          
          <motion.div style={{ x: xTransform }} className="flex h-full w-[500vw]">
            
            {/* Panel 1: Huge Manifesto */}
            <div className="w-[100vw] h-full flex items-center justify-center px-6 md:px-24 shrink-0">
              <div className="max-w-6xl w-full">
                <h2 className="font-syne font-black text-[12vw] md:text-[5.5vw] leading-[1.1] pb-2 text-[#E2E2EC]" style={{ fontFamily: "var(--font-syne)" }}>
                  <ScrambleText text={t.gallery.m1} className="block" trigger={panel1Visible} />
                  <span className="block text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#00F5FF,#FF2D78)" }}>
                    <ScrambleText text={t.gallery.m2} trigger={panel1Visible} />
                  </span>
                  <ScrambleText text={t.gallery.m3} className="block" trigger={panel1Visible} />
                  <ScrambleText text={t.gallery.m4} className="block text-[#39FF14]" trigger={panel1Visible} />
                </h2>
              </div>
            </div>

            {/* Panels 2-4: Gallery Cards overlapping */}
            {PHOTOS.map((photo, i) => (
              <div key={i} className="w-[100vw] h-full flex items-center justify-center p-6 md:p-24 shrink-0 relative">
                {/* Background ghost text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-syne font-black text-[40vw] md:text-[30vw] text-[#E2E2EC]/[0.03] select-none whitespace-nowrap" style={{ fontFamily: "var(--font-syne)" }}>
                  {photo.num}
                </div>
                
                <a 
                  href={photo.src} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="relative block w-full max-w-5xl aspect-[4/5] md:aspect-[21/9] rounded-sm overflow-hidden neon-card group cursor-pointer"
                  onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
                >
                  <img src={photo.src} alt={photo.title} loading="lazy" decoding="async" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" />
                  
                  {/* Overlay gradients & Data */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] via-transparent to-transparent opacity-90" />
                  
                  <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 flex flex-col">
                    <div className="overflow-hidden">
                      <motion.h3 
                        initial={{ y: "100%" }} whileInView={{ y: 0 }} transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                        className="font-syne font-black text-3xl sm:text-4xl md:text-7xl text-[#E2E2EC] leading-none mb-2" style={{ fontFamily: "var(--font-syne)" }}>
                        {t.gallery.photos[i]}
                      </motion.h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs md:text-sm text-[#00F5FF] tracking-widest uppercase border border-[#00F5FF]/30 px-3 py-1 bg-[#00F5FF]/10">{photo.num}</span>
                      <span className="font-mono text-sm text-[#E2E2EC]/60 tracking-widest uppercase">{photo.title}</span>
                    </div>
                  </div>
                  
                  {/* Scanline strictly on image */}
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] pointer-events-none" />
                </a>
              </div>
            ))}
            
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE BAND ── */}
      <div className="relative z-10 py-5 overflow-hidden border-y border-[#39FF14]/20 bg-[#07070F]">
        <div className="flex whitespace-nowrap marquee-track">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="font-mono text-sm md:text-xl text-[#39FF14] tracking-[0.2em] mr-8" style={{ fontFamily: "var(--font-mono)", textShadow: "0 0 10px rgba(57,255,20,0.5)" }}>
              {t.marquee}
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════
          3. BENTO SYSTEM (Skills + Timeline fusion)
      ════════════════════════════════════ */}
      <section id="skills" className="relative z-10 py-32 px-4 md:px-12 bg-[#07070F] flex flex-col items-center">
        <div className="w-full max-w-7xl mb-10 md:mb-16">
          <h2 className="font-syne font-black text-4xl sm:text-5xl md:text-8xl text-[#E2E2EC]" style={{ fontFamily: "var(--font-syne)" }}>{t.skills.title1}<br/><span className="text-[#00F5FF]">{t.skills.title2}</span></h2>
        </div>

<div className="w-full max-w-7xl flex flex-col gap-16">
          
          {/* Awwwards Style Expandable Accordion */}
          <div className="w-full h-[70vh] min-h-[500px] flex flex-col md:flex-row gap-2 md:gap-4 group/accordion">
            {SKILLS.map((skill, i) => (
              <div 
                key={i}
                className="relative flex-1 md:flex-[1] md:hover:flex-[4] transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] rounded-2xl overflow-hidden group/card cursor-pointer border border-[#E2E2EC]/10 hover:border-[#00F5FF]/50"
                onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
              >
                <img src={skill.bg} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover grayscale-[80%] group-hover/card:grayscale-0 group-hover/card:scale-110 transition-all duration-1000" alt={skill.name} />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] via-[#07070F]/50 to-transparent opacity-90 group-hover/card:opacity-60 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-[#07070F]/40 group-hover/card:bg-transparent transition-colors duration-700" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 p-6 md:p-8 flex flex-col w-full h-full justify-end">
                  <span className="font-mono text-xs tracking-[0.3em] uppercase mb-4 opacity-100 md:opacity-0 group-hover/card:opacity-100 transform translate-y-0 md:translate-y-4 group-hover/card:translate-y-0 transition-all duration-500 delay-100 box-glow-cyan inline-block px-3 py-1 bg-[#00F5FF]/10 border border-[#00F5FF]/20 self-start w-auto whitespace-nowrap" style={{ color: skill.accent, borderColor: skill.accent }}>
                    MODULE_{String(i + 1).padStart(2, '0')}
                  </span>
                  
                  <h3 className="font-syne font-bold text-3xl md:text-5xl leading-none transition-all duration-700 whitespace-nowrap lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:bottom-24 lg:-rotate-90 lg:origin-center lg:mb-0 group-hover/card:!relative group-hover/card:!left-0 group-hover/card:!translate-x-0 group-hover/card:!bottom-0 group-hover/card:!rotate-0 group-hover/card:!mb-0" style={{ fontFamily: "var(--font-syne)", color: "#E2E2EC" }}>
                    {t.skills.items[i].split('·')[0]?.trim()}
                  </h3>
                  
                  <div className="overflow-hidden h-auto md:h-0 group-hover/card:h-[40px] md:group-hover/card:h-[60px] transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]">
                    <p className="font-mono text-sm md:text-base mt-2 md:mt-4 opacity-100 md:opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-200 whitespace-normal" style={{ fontFamily: "var(--font-mono)", color: skill.accent }}>
                      {t.skills.items[i].split('·')[1]?.trim() || t.skills.items[i]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 
          TIMELINE (Horizontal Parallax Scroll)
       */}
      <VerticalTimeline t={t} setCursorBig={setCursorBig} TIMELINE={TIMELINE} />

      {/* ════════════════════════════════════
          GUESTBOOK — Sticky Note Wall
      ════════════════════════════════════ */}
        <section id="guestbook" className="relative min-h-screen">
          <GuestbookWall lang={lang} />
        </section>

      {/* ════════════════════════════════════
          4. CONTACT — Immersive Terminal
      ════════════════════════════════════ */}
      <section id="contact" className="relative z-10 min-h-screen flex flex-col bg-[#07070F] border-t border-[#E2E2EC]/10 overflow-hidden">
        
        {/* Section label row */}
        <div className="w-full border-b border-[#E2E2EC]/10 px-6 md:px-12 py-5 flex items-center justify-between">
          <span className="font-mono text-xs text-[#FF2D78] tracking-[0.5em] uppercase glow-pink">{t.contact.sub}</span>
          <span className="font-mono text-xs text-[#E2E2EC]/30 tracking-widest">§ FIN — HANDSHAKE</span>
        </div>

        {/* Giant headline */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-20 md:py-28 relative">
          
          {/* Ambient blobs */}
          <div className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full bg-[#FF2D78]/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full bg-[#00F5FF]/5 blur-[100px] pointer-events-none" />

          <motion.h2
            initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
            className="font-syne font-black leading-[0.85] text-[#E2E2EC] mb-16 relative z-10"
            style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(3rem, 12vw, 10rem)" }}
          >
            {t.contact.t1}<br />
            <span
              className="text-transparent hover:text-[#FF2D78] transition-colors duration-700"
              style={{ WebkitTextStroke: "2px rgba(255,45,120,0.7)" }}
            >
              {t.contact.t2}
            </span>
          </motion.h2>

          {/* Grid divider */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-0 border-t border-[#E2E2EC]/10 pt-10">
            
            {/* Email CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="flex flex-col gap-3"
            >
              <span className="font-mono text-xs text-[#E2E2EC]/40 tracking-[0.4em] uppercase">Primary Channel</span>
              <MagneticButton
                href="mailto:123kevinlio@gmail.com"
                className="group inline-flex items-center gap-4 font-mono text-base md:text-xl text-[#00F5FF] hover:text-[#07070F] hover:bg-[#00F5FF] px-5 py-3 border border-[#00F5FF]/40 transition-all duration-300 self-start"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <span>123KEVINLIO@GMAIL.COM</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </MagneticButton>
            </motion.div>

            {/* Divider vertical */}
            <div className="hidden md:block w-[1px] bg-[#E2E2EC]/10 mx-12" />

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
              className="flex flex-col gap-3"
            >
              <span className="font-mono text-xs text-[#E2E2EC]/40 tracking-[0.4em] uppercase">Networks</span>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Github',    url: 'https://github.com/treehey',                      accent: '#39FF14' },
                  { name: 'Instagram', url: 'https://www.instagram.com/tree_hey/',              accent: '#FF2D78' },
                  { name: 'Facebook',  url: 'https://www.facebook.com/chihei.lio',              accent: '#00F5FF' },
                ].map((link, li) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    transition={{ delay: 0.2 + li * 0.08 }}
                  >
                    <MagneticButton
                      href={link.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-widest border px-4 py-2.5 transition-all duration-300 hover:text-[#07070F]"
                      style={{
                        color: link.accent,
                        borderColor: `${link.accent}40`,
                        backgroundColor: `${link.accent}0D`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: link.accent }} />
                      {link.name}
                    </MagneticButton>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer strip */}
        <div className="relative w-full border-t border-[#E2E2EC]/10 px-6 md:px-12 py-4 flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#E2E2EC]/25 tracking-widest relative z-10">© 2026 TREEHEY — ALL RIGHTS RESERVED</span>
          <span className="font-mono text-[10px] text-[#E2E2EC]/25 tracking-widest relative z-10">BUILT WITH NEXT.JS + FRAMER MOTION</span>
        </div>
      </section>

    </main>
  );
}



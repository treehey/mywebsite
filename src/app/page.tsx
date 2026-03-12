"use client";

import { useEffect, useRef, useState } from "react";

const B = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
import { DanmakuSystem } from "@/components/DanmakuSystem";
import { globalLenis } from "@/components/SmoothScroll";
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
function useScramble(text: string, trigger: boolean, speed = 4, total = 60) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!trigger) { setDisplay(text); return; }
    const CHARS = "0123456789ABCDEFabcdef#@%!?/|\\[]{}~<>^*";
    let frame = 0; let rafCount = 0; let raf: number;
    const update = () => {
      rafCount++;
      if (rafCount % speed === 0) frame++;
      setDisplay(text.split("").map((ch, i) => {
        if (ch === " ") return " ";
        const resolveAt = Math.floor((i / text.length) * total);
        if (frame >= resolveAt) return ch;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join(""));
      if (frame <= total) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [trigger, text, speed, total]);
  return display;
}

function ScrambleText({ text, className, trigger: externalTrigger, fast }: { text: string; className?: string; margin?: string; trigger?: boolean; fast?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  // @ts-ignore
  const inView = useInView(ref, { once: false, margin: "-20%" });
  const trigger = externalTrigger !== undefined ? externalTrigger : inView;
  const display = useScramble(text, trigger, fast ? 1 : 4, fast ? 8 : 60);
  return <span ref={ref} className={className}>{display}</span>;
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let cur = 0;
    const step = 16;
    const inc = to / (1400 / step);
    const t = setInterval(() => {
      cur += inc;
      if (cur >= to) { setVal(to); clearInterval(t); }
      else setVal(Math.floor(cur));
    }, step);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ════════════════════════════════════════════════════════
   DARKROOM DEVELOP IMAGE
════════════════════════════════════════════════════════ */
function DarkroomImage({ src, alt, className, finalFilter, delay = 0 }: {
  src: string; alt: string; className?: string; finalFilter: string; delay?: number;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });
  const [hovered, setHovered] = useState(false);
  const startF = 'brightness(0.08) contrast(1.5) grayscale(0) sepia(1) saturate(3) hue-rotate(-15deg) blur(0px)';
  const hoverF = 'brightness(1.05) contrast(1.05) grayscale(0) sepia(0) saturate(1) hue-rotate(0deg) blur(0px)';
  const activeFilter = !inView ? startF : hovered ? hoverF : finalFilter;
  return (
    <img
      ref={ref}
      src={src} alt={alt} loading="lazy" decoding="async"
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        filter: activeFilter,
        transitionProperty: 'filter',
        transitionDuration: hovered ? '0.4s' : '2.2s',
        transitionTimingFunction: 'cubic-bezier(0.15, 0, 0.3, 1)',
        transitionDelay: (!inView || hovered) ? '0s' : `${delay}s`,
      }}
    />
  );
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

const WORKS_META = [
  { img: `${B}/images/wide-research.png`, accent: "#00F5FF" },
  { img: `${B}/images/enzyme.png`,        accent: "#39FF14" },
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

/* ════════════════════════════════════════════════════════
   FLIP TEXT — whole-word slot-machine hover (CSS group-hover)
════════════════════════════════════════════════════════ */
function FlipText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block overflow-hidden leading-none ${className ?? ""}`}>
      <span className="block transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
        {text}
      </span>
      <span className="absolute inset-0 block translate-y-full transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
        {text}
      </span>
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   ROLLING NUMBER — mechanical counter digit roll
════════════════════════════════════════════════════════ */
function RollingNumber({ value, digits = 2 }: { value: number; digits?: number }) {
  const str = String(value).padStart(digits, "0");
  return (
    <span className="inline-flex leading-none">
      {str.split("").map((d, i) => (
        <span key={i} className="inline-block overflow-hidden" style={{ height: "1.1em" }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${i}-${d}`}
              className="block"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-110%" }}
              transition={{ duration: 0.13, ease: [0.16, 1, 0.3, 1] }}
            >
              {d}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
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
  const [themeWipe, setThemeWipe] = useState<{
    startX: number; startY: number;
    currentX: number; currentY: number;
    completing: boolean;
    frozen: boolean;
  } | null>(null);
  const wipeCompletingRef = useRef(false); // ref to prevent stale-closure multi-fire
  const aboutRef = useRef<HTMLElement>(null);
  const [aboutMouse, setAboutMouse] = useState({ x: 0, y: 0 });
  const [aboutImgMouse, setAboutImgMouse] = useState({ x: 0, y: 0 });
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

  /* Works Theater scroll */
  const worksRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: worksSP } = useScroll({ target: worksRef, offset: ["start start", "end end"] });
  const [activeWork, setActiveWork] = useState(0);

  /* Works Theater — wheel snap */
  const worksSnapRef = useRef(false);
  const worksDeltaAccum = useRef(0);
  const worksDeltaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const el = worksRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top > 2 || rect.bottom < window.innerHeight - 2) return;
      const progress = worksSP.get();
      const dir = e.deltaY > 0 ? 1 : -1;
      // Allow natural exit at section boundaries
      if (dir < 0 && progress <= 0.02) return;
      if (dir > 0 && progress >= 0.95) return;
      // Always block default inside section to prevent scroll fighting
      e.preventDefault();
      if (worksSnapRef.current) return;
      // Accumulate deltaY; reset after 200ms of inactivity
      worksDeltaAccum.current += e.deltaY;
      if (worksDeltaTimer.current) clearTimeout(worksDeltaTimer.current);
      worksDeltaTimer.current = setTimeout(() => { worksDeltaAccum.current = 0; }, 200);
      // Only snap after meaningful intentional scroll (trackpad bounce is usually <10px total)
      if (Math.abs(worksDeltaAccum.current) < 60) return;
      const snapDir = worksDeltaAccum.current > 0 ? 1 : -1;
      worksDeltaAccum.current = 0;
      const snapTargets = [0.02, 0.65];
      const currentIdx = progress < 0.45 ? 0 : 1;
      const nextIdx = Math.max(0, Math.min(snapTargets.length - 1, currentIdx + snapDir));
      if (nextIdx === currentIdx) return;
      const sectionDocTop = rect.top + window.scrollY;
      const sectionScrollable = el.offsetHeight - window.innerHeight;
      const targetY = sectionDocTop + snapTargets[nextIdx] * sectionScrollable;
      worksSnapRef.current = true;
      worksDeltaAccum.current = 0;
      const lenis = globalLenis;
      if (lenis) {
        lenis.scrollTo(targetY, {
          duration: 0.9,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
          lock: true,
          onComplete: () => { worksSnapRef.current = false; worksDeltaAccum.current = 0; },
        });
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [worksSP]);
  useMotionValueEvent(worksSP, "change", (v) => { setActiveWork(v < 0.55 ? 0 : 1); });
  const card1Y        = useTransform(worksSP, [0.40, 0.65], ["100%", "0%"]);
  const card0Scale    = useTransform(worksSP, [0.40, 0.72], [1, 0.93]);
  const card0Opacity  = useTransform(worksSP, [0.50, 0.75], [1, 0]);
  const tintOpacity0  = useTransform(worksSP, [0, 0.45, 0.65, 1], [0.06, 0.06, 0, 0]);
  const tintOpacity1  = useTransform(worksSP, [0, 0.45, 0.65, 1], [0, 0, 0.06, 0.06]);

  const navItems = [
    { id: 'about',     label: t.nav.about },
    { id: 'works',     label: t.nav.works },
    { id: 'gallery',   label: t.nav.gallery },
    { id: 'skills',    label: t.nav.skills },
    { id: 'timeline',  label: t.nav.timeline },
    { id: 'guestbook', label: t.nav.guestbook },
    { id: 'contact',   label: t.nav.contact },
  ];
  const activeIdx = navItems.findIndex(n => n.id === activeSection);

  const HERO_CHARS = "TREE HEY".split("");

  // ── Hero letter explosion & SLOTH easter egg ────────────────────────────
  const [heroClickedSet, setHeroClickedSet] = useState<Set<string>>(new Set());
  const [heroExploding, setHeroExploding] = useState<Set<string>>(new Set());
  const [slothMode, setSlothMode] = useState(false);
  const heroVectorsRef = useRef<Record<string, { x: number; y: number; rotate: number }>>({});
  const slothPendingRef = useRef(false);

  useEffect(() => {
    const r = heroVectorsRef.current;
    ['TREE', 'HEY'].forEach((word, wIdx) => {
      word.split('').forEach((_, i) => {
        r[`${wIdx}-${i}`] = {
          x: (Math.random() - 0.5) * 400,
          y: (Math.random() - 0.5) * 280,
          rotate: (Math.random() - 0.5) * 360,
        };
      });
    });
    'SLOTH'.split('').forEach((_, i) => {
      r[`sloth-${i}`] = {
        x: (Math.random() - 0.5) * 200,
        y: -(Math.random() * 300 + 150),
        rotate: (Math.random() - 0.5) * 200,
      };
    });
  }, []);

  function handleHeroCharClick(wIdx: number, charIdx: number) {
    if (slothMode || slothPendingRef.current) return;
    const key = `${wIdx}-${charIdx}`;
    const newClicked = new Set([...heroClickedSet, key]);
    setHeroClickedSet(newClicked);
    if (newClicked.size >= 7) {
      // All 7 chars clicked — scatter ALL then transform to SLOTH
      slothPendingRef.current = true;
      setHeroExploding(new Set(['0-0','0-1','0-2','0-3','1-0','1-1','1-2']));
      setTimeout(() => { setSlothMode(true); slothPendingRef.current = false; }, 700);
    } else {
      setHeroExploding(prev => new Set([...prev, key]));
      setTimeout(() => {
        if (!slothPendingRef.current)
          setHeroExploding(prev => { const n = new Set(prev); n.delete(key); return n; });
      }, 580);
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ── Theme wipe (Lightroom-style linear mask) ─────────────────────────────
  function getWipeProps(wipe: { startX: number; startY: number; currentX: number; currentY: number }) {
    const dx = wipe.currentX - wipe.startX, dy = wipe.currentY - wipe.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 3) return null;
    const udx = dx / dist, udy = dy / dist;
    const W = window.innerWidth, H = window.innerHeight;
    const corners: [number, number][] = [[0, 0], [W, 0], [0, H], [W, H]];
    const projs = corners.map(([x, y]) => x * udx + y * udy);
    const dMin = Math.min(...projs), dMax = Math.max(...projs);
    const dCur = wipe.currentX * udx + wipe.currentY * udy;
    const cPct = ((dCur - dMin) / (dMax - dMin)) * 100;
    const soft = 7;
    const ang = Math.atan2(udx, -udy) * (180 / Math.PI);
    const mask = `linear-gradient(${ang.toFixed(2)}deg, black, black ${cPct.toFixed(1)}%, transparent ${Math.min(cPct + soft, 100).toFixed(1)}%, transparent)`;
    const coverage = (dCur - dMin) / (dMax - dMin);
    const pLen = Math.max(W, H) * 2;
    const lineAt = (px: number, py: number) => ({
      x1: px - udy * pLen, y1: py + udx * pLen,
      x2: px + udy * pLen, y2: py - udx * pLen,
    });
    return { mask, coverage, line1: lineAt(wipe.currentX, wipe.currentY), line2: lineAt(wipe.currentX - udx * 60, wipe.currentY - udy * 60) };
  }

  function handleThemePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    wipeCompletingRef.current = false;
    setThemeWipe({ startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY, completing: false, frozen: false });
  }

  function handleThemePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (wipeCompletingRef.current || !themeWipe || themeWipe.frozen) return;
    const next = { ...themeWipe, currentX: e.clientX, currentY: e.clientY };
    const props = getWipeProps(next);
    if (props && props.coverage > 0.80) {
      wipeCompletingRef.current = true;
      setThemeWipe({ ...next, completing: true, frozen: false });
      setTimeout(() => {
        setTheme(t => t === 'dark' ? 'light' : 'dark');
        setThemeWipe(null);
        wipeCompletingRef.current = false;
      }, 280);
      return;
    }
    setThemeWipe(next);
  }

  function handleThemePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    if (wipeCompletingRef.current || !themeWipe || themeWipe.frozen) return;
    const dx = themeWipe.currentX - themeWipe.startX, dy = themeWipe.currentY - themeWipe.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) {
      setTheme(t => t === 'dark' ? 'light' : 'dark');
      setThemeWipe(null);
    } else {
      setThemeWipe({ ...themeWipe, frozen: true });
    }
  }

  // Dismiss frozen wipe: click anywhere to confirm (>50%) or cancel (<50%)
  useEffect(() => {
    if (!themeWipe?.frozen) return;
    const coverage = getWipeProps(themeWipe)?.coverage ?? 0;
    const dismiss = (ev: PointerEvent) => {
      if ((ev.target as Element).closest('[data-theme-btn="true"]')) return;
      if (coverage > 0.5) setTheme(t => t === 'dark' ? 'light' : 'dark');
      setThemeWipe(null);
    };
    const id = setTimeout(() => document.addEventListener('pointerdown', dismiss), 100);
    return () => { clearTimeout(id); document.removeEventListener('pointerdown', dismiss); };
  }, [themeWipe?.frozen]);
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <main ref={containerRef} className="relative w-full bg-[#07070F] text-[#E2E2EC]">
      <div id="top" className="absolute top-0" />

      {/* ───── Theme Wipe Overlay ───── */}
      <AnimatePresence>
        {themeWipe && (() => {
          const props = themeWipe.completing ? null : getWipeProps(themeWipe);
          const maskImg = themeWipe.completing ? undefined : props?.mask;
          if (!maskImg && !themeWipe.completing) return null;
          return (
            <motion.div
              key="theme-wipe"
              initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 pointer-events-none"
              style={{ zIndex: 988 }}
            >
              <div style={{
                position: 'absolute', inset: 0,
                backdropFilter: 'invert(1) hue-rotate(180deg)',
                WebkitBackdropFilter: 'invert(1) hue-rotate(180deg)',
                ...(maskImg ? { WebkitMaskImage: maskImg, maskImage: maskImg } : {}),
              }} />
              {props && !themeWipe.frozen && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  {/* Shadow layer for dark backgrounds */}
                  <line x1={props.line1.x1} y1={props.line1.y1} x2={props.line1.x2} y2={props.line1.y2}
                    stroke="rgba(0,0,0,0.55)" strokeWidth="4" />
                  <line x1={props.line2.x1} y1={props.line2.y1} x2={props.line2.x2} y2={props.line2.y2}
                    stroke="rgba(0,0,0,0.4)" strokeWidth="3.5" strokeDasharray="10 6" />
                  {/* White line on top */}
                  <line x1={props.line1.x1} y1={props.line1.y1} x2={props.line1.x2} y2={props.line1.y2}
                    stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" />
                  <line x1={props.line2.x1} y1={props.line2.y1} x2={props.line2.x2} y2={props.line2.y2}
                    stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeDasharray="10 6" />
                </svg>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>
      
      {/* ───── NAV ───── */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        className="fixed bottom-6 md:bottom-auto md:top-6 left-1/2 -translate-x-1/2 z-[990] flex items-center px-5 md:px-6 py-2.5 rounded-full bg-[#0E0E1C]/85 backdrop-blur-2xl ring-1 ring-inset ring-white/10 w-[90vw] md:w-auto justify-between md:justify-center overflow-visible"
      >
        {/* Logo + active section index */}
        <div className="shrink-0 flex items-end gap-1.5">
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onMouseEnter={() => setCursorBig(true)}
            onMouseLeave={() => setCursorBig(false)}
            className="font-syne font-bold text-lg text-white tracking-widest hover:opacity-60 transition-opacity cursor-pointer"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            TH
          </a>
          <span className="font-mono text-[9px] text-white/20 mb-[3px] leading-none tabular-nums">
            {activeIdx >= 0 ? <RollingNumber value={activeIdx + 1} /> : "·"}
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 ml-7 mr-3">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              onMouseEnter={() => setCursorBig(true)}
              onMouseLeave={() => setCursorBig(false)}
              className="relative group py-1"
            >
              <FlipText
                text={item.label}
                className={`${lang === 'EN' ? 'font-mono text-[11px] tracking-widest' : 'font-syne font-semibold text-[12px] tracking-[0.08em]'} uppercase transition-opacity duration-300 ${
                  activeSection === item.id ? 'text-white' : 'text-white/40'
                }`}
              />
              {activeSection === item.id && (
                <motion.div
                  layoutId="nav-line"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </a>
          ))}
        </nav>

        {/* Mobile: menu toggle */}
        <div className="flex flex-1 justify-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/40 hover:text-white transition-colors px-3 py-1"
          >
            {mobileMenuOpen ? 'CLOSE' : 'MENU'}
          </button>
        </div>

        {/* Toggles */}
        <div className="shrink-0 flex items-center gap-3 md:gap-4 border-l border-white/10 pl-4 md:pl-5">
          <button
            aria-label="Toggle Theme"
            data-theme-btn="true"
            onPointerDown={handleThemePointerDown}
            onPointerMove={handleThemePointerMove}
            onPointerUp={handleThemePointerUp}
            className="text-white/50 hover:text-white text-xs md:text-sm transition-colors touch-none select-none cursor-grab active:cursor-grabbing"
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <div className="relative flex items-center">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className={`p-1 transition-colors ${langOpen ? 'text-white' : 'text-white/35 hover:text-white'}`}
              onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
              aria-label="Toggle Language"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute right-0 md:right-1/2 md:translate-x-1/2 bottom-[140%] md:bottom-auto md:top-[140%] flex flex-col bg-[#0E0E1C]/95 backdrop-blur-2xl border border-white/10 rounded-xl p-2 min-w-[120px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] origin-bottom-right md:origin-top z-[1000]"
                >
                  {['EN', '简', '繁'].map(l => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangOpen(false); }}
                      className={`text-[11px] font-mono px-3 py-2.5 rounded-lg text-left transition-all flex items-center gap-2 ${
                        lang === l ? 'bg-white/10 text-white font-bold' : 'text-white/50 hover:bg-white/5 hover:text-white'
                      }`}
                      onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
                    >
                      {lang === l && <span className="w-1 h-1 rounded-full bg-white inline-block shrink-0" />}
                      {l === 'EN' ? 'English' : l === '简' ? '简体中文' : '繁體中文'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* ───── MOBILE FULL-SCREEN MENU ───── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden fixed inset-0 z-[975] bg-[#07070F]/97 backdrop-blur-sm flex flex-col px-8 pt-20 pb-28"
          >
            <nav className="flex flex-col flex-1 justify-center">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 + 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTimeout(() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }), 400);
                  }}
                  className={`group w-full py-4 flex items-center gap-4 border-b text-left transition-colors ${
                    activeSection === item.id ? 'border-white/15' : 'border-white/[0.06]'
                  }`}
                >
                  <span className="font-mono text-[11px] text-white/20 tabular-nums w-5 shrink-0 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`font-syne font-black text-3xl uppercase tracking-tight transition-all duration-300 group-hover:translate-x-2 leading-none ${
                      activeSection === item.id ? 'text-white' : 'text-white/45'
                    }`}
                    style={{ fontFamily: "var(--font-syne)" }}
                  >
                    {item.label}
                  </span>
                  {activeSection === item.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  )}
                </motion.button>
              ))}
            </nav>
            <p className="font-mono text-[10px] text-white/15 tracking-[0.3em] uppercase">
              TH // SIGNAL & NOISE
            </p>
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
              {slothMode ? (
                // ── SLOTH easter egg ──
                <div className="flex">
                  {"SLOTH".split("").map((ch, i) => {
                    const v = heroVectorsRef.current[`sloth-${i}`] ?? { x: 0, y: -200, rotate: 0 };
                    return (
                      <motion.div
                        key={`sloth-${i}`}
                        className="relative inline-block overflow-visible"
                        initial={{ x: v.x, y: v.y, rotate: v.rotate, opacity: 0, scale: 0.4 }}
                        animate={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 190, damping: 16, delay: i * 0.08 }}
                      >
                        <span className="rgb-r font-syne font-black select-none text-[18vw] md:text-[14vw] lg:text-[11rem] z-0"
                          style={{ fontFamily: "var(--font-syne)", color: '#00F5FF', transform: `translate(${mDelta.x * -15}px, ${mDelta.y * -15}px)` }}>{ch}</span>
                        <span className="rgb-b font-syne font-black select-none text-[18vw] md:text-[14vw] lg:text-[11rem] z-0"
                          style={{ fontFamily: "var(--font-syne)", color: '#FF2D78', transform: `translate(${mDelta.x * 15}px, ${mDelta.y * 15}px)` }}>{ch}</span>
                        <span className="relative z-10 font-syne font-black text-[18vw] md:text-[14vw] lg:text-[11rem] text-[#E2E2EC] drop-shadow-[0_0_20px_rgba(226,226,236,0.3)]"
                          style={{ fontFamily: "var(--font-syne)" }}>{ch}</span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                // ── Normal TREE HEY with click explosion ──
                ['TREE', 'HEY'].map((word, wIdx) => (
                  <div key={wIdx} className="flex">
                    {word.split("").map((ch, i) => {
                      const key = `${wIdx}-${i}`;
                      const isExploding = heroExploding.has(key);
                      const v = heroVectorsRef.current[key];
                      const wasClicked = heroClickedSet.has(key);
                      return (
                        <motion.div
                          key={key}
                          className="relative inline-block overflow-visible group cursor-pointer"
                          animate={isExploding
                            ? { x: v?.x ?? 0, y: v?.y ?? 0, rotate: v?.rotate ?? 0, scale: 0.25, opacity: 0.45 }
                            : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                          onClick={() => handleHeroCharClick(wIdx, i)}
                          title={wasClicked ? undefined : "click me"}
                        >
                          <motion.span className="rgb-r font-syne font-black select-none text-[18vw] md:text-[14vw] lg:text-[11rem] z-0 group-hover:text-[#00F5FF] transition-colors"
                            style={{ fontFamily: "var(--font-syne)", transform: `translate(${mDelta.x * -15}px, ${mDelta.y * -15}px)` }}>{ch}</motion.span>
                          <motion.span className="rgb-b font-syne font-black select-none text-[18vw] md:text-[14vw] lg:text-[11rem] z-0 group-hover:text-[#FF2D78] transition-colors"
                            style={{ fontFamily: "var(--font-syne)", transform: `translate(${mDelta.x * 15}px, ${mDelta.y * 15}px)` }}>{ch}</motion.span>
                          <span className={`relative z-10 font-syne font-black text-[18vw] md:text-[14vw] lg:text-[11rem] group-hover:opacity-0 transition-opacity duration-300 drop-shadow-[0_0_20px_rgba(226,226,236,0.3)] ${wasClicked ? 'text-white/40' : 'text-[#E2E2EC]'}`}
                            style={{ fontFamily: "var(--font-syne)" }}>{ch}</span>
                        </motion.div>
                      );
                    })}
                    {wIdx === 0 && <div className="w-[4vw] lg:w-[6vw] inline-block" />}
                  </div>
                ))
              )}
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

        {/* ── Sloth Easter Egg Mascot ── */}
        <AnimatePresence>
          {slothMode && (
            <motion.div
              key="sloth-mascot"
              className="absolute bottom-0 right-0 z-20 select-none cursor-pointer group"
              initial={{ y: 280, x: 40, rotate: 12, opacity: 0 }}
              animate={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
              exit={{ y: 280, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 40, damping: 12, delay: 0.55 }}
              onClick={() => {
                setSlothMode(false);
                setHeroClickedSet(new Set());
                setHeroExploding(new Set());
              }}
            >
              <motion.img
                src={`${B}/sloth_2.png`}
                alt="sloth"
                className="w-40 md:w-60 lg:w-72 drop-shadow-[0_0_30px_rgba(0,245,255,0.25)] group-hover:drop-shadow-[0_0_50px_rgba(0,245,255,0.5)] transition-filter duration-300"
                animate={{ rotate: [0, -3, 2, -1, 0] }}
                transition={{ rotate: { repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1.2 } }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 font-mono text-[9px] text-white/0 group-hover:text-white/50 tracking-widest transition-colors duration-300 whitespace-nowrap pointer-events-none">
                click to dismiss
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Danmaku Layer ── */}
        <DanmakuSystem lang={lang} />

      </section>

      {/* ════════════════════════════════════
          1.5 ABOUT / INTERACTIVE IDENTITY
      ════════════════════════════════════ */}
      <section
        id="about"
        ref={aboutRef}
        className="relative z-10 w-full bg-[#07070F] overflow-hidden"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          setAboutMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
      >
        {/* Mouse spotlight */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(700px circle at ${aboutMouse.x}px ${aboutMouse.y}px, rgba(0,245,255,0.05), transparent 65%)` }}
        />

        {/* Row 1 — Section header with animated line */}
        <div className="relative w-full border-b border-[#E2E2EC]/10 px-6 md:px-12 py-5 flex items-center justify-between">
          <span className="font-mono text-xs text-[#00F5FF] tracking-[0.5em] uppercase glow-cyan">{t.about.sub}</span>
          <div className="flex items-center gap-4">
            <motion.div
              className="h-[1px] bg-gradient-to-r from-transparent to-[#00F5FF]/60 origin-left"
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              style={{ width: "80px" }}
            />
            <span className="font-mono text-xs text-[#E2E2EC]/30 tracking-widest">§ 001 — IDENTITY</span>
          </div>
        </div>

        {/* Row 2 — Oversized heading with glitch on hover */}
        <div className="relative w-full px-6 md:px-12 pt-16 md:pt-24 pb-4 md:pb-0 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-0">
            <motion.h2
              initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="font-syne font-black text-[18vw] md:text-[9vw] leading-[1] md:leading-[0.85] text-[#E2E2EC] uppercase cursor-default select-none"
              style={{ fontFamily: "var(--font-syne)" }}
              whileHover={{ x: [0, -5, 5, -3, 3, 0], transition: { duration: 0.35, ease: "easeInOut" } }}
            >
              {t.about.title1}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="md:mb-4 flex flex-col items-start md:items-end gap-2"
            >
              <p className="font-grotesk text-sm md:text-base text-[#E2E2EC]/50 max-w-[240px] text-left md:text-right leading-relaxed">{t.about.p1.split(".")[0]}.</p>
            </motion.div>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-syne font-black text-[18vw] md:text-[9vw] leading-[1] md:leading-[0.85] text-transparent uppercase cursor-default select-none"
            style={{ fontFamily: "var(--font-syne)", WebkitTextStroke: "2px rgba(0,245,255,0.6)" }}
            whileHover={{ x: [0, 5, -5, 3, -3, 0], transition: { duration: 0.35 } }}
          >
            {t.about.title2}
          </motion.h2>
        </div>

        {/* ── BENTO PHOTO GRID ── */}
        {/* Desktop: 3-col × 2-row asymmetric  [ NJU(tall) | MC | Assoc ]
                                               [           | mbot | steam ] */}
        <div className="relative w-full grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] border-t border-[#E2E2EC]/10 overflow-hidden"
          style={{ gridTemplateRows: "minmax(260px,35vh) minmax(260px,35vh)" }}>

          {/* Cell A — NJU, spans 2 rows */}
          <div
            className="relative md:row-span-2 overflow-hidden aspect-[4/3] md:aspect-auto border-b md:border-b-0 md:border-r border-[#E2E2EC]/10 group"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setAboutImgMouse({ x: ((e.clientX - r.left) / r.width - 0.5) * 22, y: ((e.clientY - r.top) / r.height - 0.5) * 22 });
            }}
            onMouseLeave={() => { setAboutImgMouse({ x: 0, y: 0 }); setCursorBig(false); }}
            onMouseEnter={() => setCursorBig(true)}
          >
            <motion.div
              className="absolute inset-[-4%]"
              animate={{ x: aboutImgMouse.x, y: aboutImgMouse.y }}
              transition={{ type: "spring", stiffness: 70, damping: 18 }}
            >
              <DarkroomImage src={`${B}/images/about/nju.jpg`} alt="NJU"
                className="w-full h-full object-cover"
                finalFilter="brightness(1) contrast(1) grayscale(0.15) sepia(0) saturate(1) hue-rotate(0deg) blur(0px)"
                delay={0.1}
              />
              <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
                style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,#fff 2px,#fff 3px)", backgroundSize: "100% 3px" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07070F]/90 via-[#07070F]/20 to-transparent pointer-events-none" />
            </motion.div>
            {/* Badge */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 font-mono text-[10px] text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/30 px-3 py-1 uppercase tracking-[0.3em] whitespace-nowrap">PRESENT // NJU</div>
            {/* Text overlay at bottom */}
            <motion.div
              initial={{ y: 24, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.45 }}
              className="absolute bottom-6 left-6 right-6 z-10"
            >
              <p className="font-grotesk text-sm text-[#E2E2EC]/75 leading-[1.75]">{t.about.p2}</p>
            </motion.div>
          </div>

          {/* Cell B — Minecraft, top col 2 */}
          <div
            className="relative overflow-hidden aspect-[4/3] md:aspect-auto border-b border-r border-[#E2E2EC]/10 group cursor-default"
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
          >
            <DarkroomImage src={`${B}/images/about/Minecraft.jfif`} alt="Origin"
              className="w-full h-full object-cover object-center transition-transform duration-700 scale-100 group-hover:scale-[1.08]"
              finalFilter="brightness(1) contrast(1) grayscale(0.65) sepia(0) saturate(1) hue-rotate(0deg) blur(0px)"
              delay={0.15}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07070F]/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] text-[#FF2D78] bg-[#FF2D78]/10 border border-[#FF2D78]/30 px-2 py-1 uppercase tracking-widest pointer-events-none">Origin · 2012</div>
          </div>

          {/* Cell C — Student Association, top col 3 */}
          <div
            className="relative overflow-hidden aspect-[4/3] md:aspect-auto border-b border-[#E2E2EC]/10 group cursor-default"
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
          >
            <DarkroomImage src={`${B}/images/about/student-association.jpg`} alt="Student Association"
              className="w-full h-full object-cover transition-transform duration-700 scale-100 group-hover:scale-[1.08]"
              finalFilter="brightness(1) contrast(1) grayscale(0.40) sepia(0) saturate(1) hue-rotate(0deg) blur(0px)"
              delay={0.22}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07070F]/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] text-[#00F5FF] bg-[#00F5FF]/10 border border-[#00F5FF]/30 px-2 py-1 uppercase tracking-widest pointer-events-none">Association</div>
          </div>

          {/* Cell D — mbot robotics, bottom col 2 */}
          <div
            className="relative overflow-hidden aspect-[4/3] md:aspect-auto border-b md:border-b-0 border-r border-[#E2E2EC]/10 group cursor-default"
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
          >
            <DarkroomImage src={`${B}/images/about/mbot.jpg`} alt="Robotics"
              className="w-full h-full object-cover transition-transform duration-700 scale-100 group-hover:scale-[1.08]"
              finalFilter="brightness(1) contrast(1) grayscale(0.40) sepia(0) saturate(1) hue-rotate(0deg) blur(0px)"
              delay={0.1}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07070F]/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/30 px-2 py-1 uppercase tracking-widest pointer-events-none">Robotics</div>
          </div>

          {/* Cell E — STEAM & IoT, bottom col 3 */}
          <div
            className="relative overflow-hidden aspect-[4/3] md:aspect-auto group cursor-default"
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
          >
            <DarkroomImage src={`${B}/images/about/steam&iot.jpg`} alt="STEAM"
              className="w-full h-full object-cover transition-transform duration-700 scale-100 group-hover:scale-[1.08]"
              finalFilter="brightness(1) contrast(1) grayscale(0.40) sepia(0) saturate(1) hue-rotate(0deg) blur(0px)"
              delay={0.18}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07070F]/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] text-[#F5C542] bg-[#F5C542]/10 border border-[#F5C542]/30 px-2 py-1 uppercase tracking-widest pointer-events-none">STEAM · IoT</div>
          </div>
        </div>

        {/* ── Info band: p1 text | stat cards | tags ── */}
        <div className="relative w-full grid grid-cols-1 md:grid-cols-[2fr_1fr_1.5fr] border-t border-[#E2E2EC]/10">

          {/* p1 paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-[#E2E2EC]/10 flex flex-col justify-center gap-5"
          >
            <p className="font-grotesk text-sm md:text-[15px] text-[#E2E2EC]/58 leading-[1.9]">{t.about.p1}</p>
          </motion.div>

          {/* Stat cards */}
          <div className="border-b md:border-b-0 md:border-r border-[#E2E2EC]/10 p-6 md:p-8 flex flex-col justify-between gap-4">
            {[
              { label: "BASE",   val: "Macau → NJU", sub: "澳门 · 南京大学" },
              { label: "FOCUS",  val: "Full-Stack",  sub: "Architecture + UX" },
              { label: "ORIGIN", val: "Minecraft",   sub: "Redstone → Code" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group relative border border-transparent hover:border-[#00F5FF]/20 p-3 -mx-3 rounded-sm transition-all duration-300 hover:bg-[#00F5FF]/[0.03] cursor-default overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00F5FF] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom" />
                <div className="flex items-center gap-2 mb-1">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]/40"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                  />
                  <p className="font-mono text-[10px] text-[#E2E2EC]/35 uppercase tracking-[0.4em]">{stat.label}</p>
                </div>
                <p className="font-syne font-bold text-lg md:text-xl text-[#E2E2EC] group-hover:text-[#00F5FF] transition-colors duration-300 pl-1" style={{ fontFamily: "var(--font-syne)" }}>{stat.val}</p>
                <p className="font-mono text-[10px] text-[#00F5FF]/0 group-hover:text-[#00F5FF]/55 transition-all duration-300 mt-1 pl-1 tracking-widest">→ {stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Tags with animated progress bars */}
          <div className="p-6 md:p-8 flex flex-col justify-center gap-5">
            <p className="font-mono text-[10px] text-[#E2E2EC]/40 uppercase tracking-[0.4em]">Modules</p>
            <div className="flex flex-col gap-5">
              {t.about.tags.map((tag, i) => (
                <motion.div
                  key={tag}
                  initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="group cursor-default"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]/50 group-hover:bg-[#00F5FF] flex-shrink-0 transition-colors"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7 }}
                    />
                    <span className="font-mono text-xs text-[#E2E2EC]/50 group-hover:text-[#00F5FF] transition-colors uppercase tracking-widest">{tag}</span>
                  </div>
                  <div className="ml-4 h-[1px] bg-[#E2E2EC]/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#00F5FF]/60 to-[#FF2D78]/40"
                      initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                      transition={{ duration: 1.1, delay: 0.4 + i * 0.15, ease: "easeOut" }}
                      style={{ transformOrigin: "left", width: `${[88, 92, 78][i]}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── System metrics ── */}
        <div className="relative w-full border-t border-[#E2E2EC]/10 grid grid-cols-3">
          {[
            { num: 50, suffix: "K+", label: lang === "EN" ? "LINES OF CODE" : "代码行数" },
            { num: 4,  suffix: "+",  label: lang === "EN" ? "YEARS BUILDING" : "年开发经验" },
            { num: 10, suffix: "+",  label: lang === "EN" ? "PROJECTS SHIPPED" : "项目上线" },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group px-6 md:px-10 py-6 md:py-8 flex flex-col gap-1 cursor-default${i < 2 ? " border-r border-[#E2E2EC]/10" : ""}`}
            >
              <span
                className="font-syne font-black text-3xl md:text-4xl text-[#E2E2EC] group-hover:text-[#00F5FF] transition-colors duration-300"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                <CountUp to={m.num} suffix={m.suffix} />
              </span>
              <span className="font-mono text-[10px] text-[#E2E2EC]/35 group-hover:text-[#E2E2EC]/60 transition-colors uppercase tracking-[0.3em]">{m.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          1.8 WORKS / CINEMATIC FULL-WIDTH
      ════════════════════════════════════ */}
      <section id="works" className="relative z-10 w-full bg-[#0A0A14]">

        {/* Section Header */}
        <div className="w-full border-b border-[#E2E2EC]/10 px-6 md:px-12 py-5 flex items-center justify-between">
          <h2 className="font-syne font-black text-xs md:text-sm uppercase tracking-[0.5em] text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #FF2D78, #00F5FF)", fontFamily: "var(--font-syne)" }}>
            {t.works.title1} {t.works.title2}
          </h2>
          <span className="font-mono text-xs text-[#E2E2EC]/30 tracking-widest hidden md:block">{t.works.archive}</span>
        </div>

        {/* ── Project Theater ── */}
        <div ref={worksRef} className="relative h-[300vh]">
          <div className="sticky top-0 h-screen overflow-hidden bg-[#0A0A14]">

            {/* Accent environment tints */}
            <motion.div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundColor: WORKS_META[0].accent, opacity: tintOpacity0 }} />
            <motion.div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundColor: WORKS_META[1].accent, opacity: tintOpacity1 }} />

            {/* Card 0 — scales down as Card 1 rises */}
            <motion.div className="absolute inset-0 z-10" style={{ scale: card0Scale, opacity: card0Opacity }}>
              {(() => {
                const wm = WORKS_META[0]; const wi = t.works.items[0]; const active = activeWork === 0;
                return (
                  <a href={wi.link} target="_blank" rel="noopener noreferrer"
                    className="relative w-full h-full flex flex-col md:flex-row"
                    onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}>
                    {/* Image — LEFT on even */}
                    <div className="relative md:w-1/2 h-[38vh] md:h-full overflow-hidden md:order-1">
                      <motion.img src={wm.img} alt={wi.title} className="w-full h-full object-cover"
                        animate={{ scale: active ? 1.06 : 1.0 }}
                        transition={{ duration: active ? 7 : 1.2, ease: active ? "linear" : "easeOut" }} />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0A0A14]" />
                      <div className="absolute inset-0 bg-[#0A0A14]/10" />
                      <span className="absolute bottom-5 left-6 font-mono text-[10px] tracking-widest text-white/30 uppercase hidden md:block">01 / 0{WORKS_META.length}</span>
                    </div>
                    {/* Text — RIGHT on even */}
                    <div className="relative md:w-1/2 h-[62vh] md:h-full flex flex-col justify-center px-8 md:px-14 lg:px-20 overflow-hidden md:order-2">
                      <span className="absolute font-syne font-black text-[28vw] md:text-[16vw] text-transparent leading-none pointer-events-none select-none"
                        style={{ WebkitTextStroke: "1px rgba(255,255,255,0.04)", fontFamily: "var(--font-syne)", right: "-1vw", bottom: "-3vw" }}>
                        <RollingNumber value={1} />
                      </span>
                      <span className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase mb-5 w-fit px-3 py-1.5 border"
                        style={{ color: wm.accent, borderColor: `${wm.accent}50`, backgroundColor: `${wm.accent}15` }}>{wi.tag}</span>
                      <h3 className="font-syne font-black text-3xl md:text-5xl lg:text-6xl text-[#E2E2EC] leading-[1.05] mb-5" style={{ fontFamily: "var(--font-syne)" }}>
                        <ScrambleText text={wi.title} trigger={active} fast />
                      </h3>
                      <motion.p className="font-grotesk text-sm md:text-base text-[#E2E2EC]/55 max-w-md leading-relaxed mb-8"
                        animate={{ opacity: active ? 1 : 0.25, y: active ? 0 : 14 }}
                        transition={{ duration: 0.7, delay: active ? 0.35 : 0 }}>{wi.desc}</motion.p>
                      <motion.div className="flex items-center gap-4 group/cta w-fit"
                        animate={{ opacity: active ? 1 : 0, x: active ? 0 : -18 }}
                        transition={{ duration: 0.55, delay: active ? 0.55 : 0 }}>
                        <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#E2E2EC]/60 group-hover/cta:text-white transition-colors duration-300">{t.works.view}</span>
                        <div className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center transition-all duration-300 group-hover/cta:bg-white group-hover/cta:border-white group-hover/cta:-rotate-45 group-hover/cta:text-[#07070F]">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </div>
                      </motion.div>
                      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${wm.accent}35, transparent)` }} />
                    </div>
                  </a>
                );
              })()}
            </motion.div>

            {/* Card 1 — slides up from below */}
            <motion.div className="absolute inset-0 z-20" style={{ y: card1Y }}>
              {(() => {
                const wm = WORKS_META[1]; const wi = t.works.items[1]; const active = activeWork === 1;
                return (
                  <a href={wi.link} target="_blank" rel="noopener noreferrer"
                    className="relative w-full h-full flex flex-col md:flex-row bg-[#0A0A14]"
                    onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}>
                    {/* Text — LEFT on odd */}
                    <div className="relative md:w-1/2 h-[62vh] md:h-full flex flex-col justify-center px-8 md:px-14 lg:px-20 overflow-hidden md:order-1">
                      <span className="absolute font-syne font-black text-[28vw] md:text-[16vw] text-transparent leading-none pointer-events-none select-none"
                        style={{ WebkitTextStroke: "1px rgba(255,255,255,0.04)", fontFamily: "var(--font-syne)", left: "-1vw", bottom: "-3vw" }}>
                        <RollingNumber value={2} />
                      </span>
                      <span className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase mb-5 w-fit px-3 py-1.5 border"
                        style={{ color: wm.accent, borderColor: `${wm.accent}50`, backgroundColor: `${wm.accent}15` }}>{wi.tag}</span>
                      <h3 className="font-syne font-black text-3xl md:text-5xl lg:text-6xl text-[#E2E2EC] leading-[1.05] mb-5" style={{ fontFamily: "var(--font-syne)" }}>
                        <ScrambleText text={wi.title} trigger={active} fast />
                      </h3>
                      <motion.p className="font-grotesk text-sm md:text-base text-[#E2E2EC]/55 max-w-md leading-relaxed mb-8"
                        animate={{ opacity: active ? 1 : 0.25, y: active ? 0 : 14 }}
                        transition={{ duration: 0.7, delay: active ? 0.35 : 0 }}>{wi.desc}</motion.p>
                      <motion.div className="flex items-center gap-4 group/cta w-fit"
                        animate={{ opacity: active ? 1 : 0, x: active ? 0 : -18 }}
                        transition={{ duration: 0.55, delay: active ? 0.55 : 0 }}>
                        <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#E2E2EC]/60 group-hover/cta:text-white transition-colors duration-300">{t.works.view}</span>
                        <div className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center transition-all duration-300 group-hover/cta:bg-white group-hover/cta:border-white group-hover/cta:-rotate-45 group-hover/cta:text-[#07070F]">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </div>
                      </motion.div>
                      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${wm.accent}35, transparent)` }} />
                    </div>
                    {/* Image — RIGHT on odd */}
                    <div className="relative md:w-1/2 h-[38vh] md:h-full overflow-hidden md:order-2">
                      <motion.img src={wm.img} alt={wi.title} className="w-full h-full object-cover"
                        animate={{ scale: active ? 1.06 : 1.0 }}
                        transition={{ duration: active ? 7 : 1.2, ease: active ? "linear" : "easeOut" }} />
                      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0A0A14]" />
                      <div className="absolute inset-0 bg-[#0A0A14]/10" />
                      <span className="absolute bottom-5 right-6 font-mono text-[10px] tracking-widest text-white/30 uppercase hidden md:block">02 / 0{WORKS_META.length}</span>
                    </div>
                  </a>
                );
              })()}
            </motion.div>

            {/* Progress indicator */}
            <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2 z-30 pointer-events-none">
              {WORKS_META.map((wm, i) => (
                <div key={i} className="h-[2px] rounded-full transition-all duration-500"
                  style={{ width: i === activeWork ? 28 : 8, backgroundColor: i === activeWork ? wm.accent : "rgba(255,255,255,0.2)" }} />
              ))}
            </div>

          </div>
        </div>
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



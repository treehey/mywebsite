"use client";

import { useEffect, useRef, useState } from "react";

const B = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
import { DanmakuSystem } from "@/components/DanmakuSystem";
import Hero from "@/components/home/Hero";
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
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });
  const [hovered, setHovered] = useState(false);
  
  const startF = 'grayscale(0.8) brightness(0.2) contrast(1.2) blur(8px)';
  const idleF = 'grayscale(0.2) brightness(0.85) contrast(1.05) blur(0px)';
  const hoverF = 'grayscale(0) brightness(1.1) contrast(1.05) blur(0px)';
  
  const activeFilter = !inView ? startF : hovered ? hoverF : idleF;
  
  return (
    <div 
      ref={ref}
      className={`relative overflow-hidden ${className || ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.img
        src={src} alt={alt} loading="lazy" decoding="async"
        className="w-full h-full object-cover darkroom-img"
        initial={{ scale: 1.15 }}
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ duration: hovered ? 0.8 : 1.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          filter: activeFilter,
          transitionProperty: 'filter',
          transitionDuration: hovered ? '0.6s' : '1.8s',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDelay: (!inView || hovered) ? '0s' : `${delay}s`,
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MINECRAFT HUD
════════════════════════════════════════════════════════ */
const MC = `${B}/minecraft`;

function MinecraftHUD({ onExit }: { onExit: () => void }) {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-[998] flex flex-col items-center pb-6 select-none mc-exempt"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      {/* Hearts + Food row */}
      <div className="flex items-center gap-6 mb-[3px]">
        <div className="flex gap-[1px]">
          {Array.from({ length: 10 }).map((_, i) => (
            <img key={i} src={`${MC}/Heart_Full.png`} alt="" width={18} height={18} style={{ imageRendering: 'pixelated' }} />
          ))}
        </div>
        <div className="flex gap-[1px]">
          {Array.from({ length: 10 }).map((_, i) => (
            <img key={i} src={`${MC}/Food_Full.png`} alt="" width={18} height={18} style={{ imageRendering: 'pixelated' }} />
          ))}
        </div>
      </div>

      {/* XP Bar */}
      <div className="relative mb-[3px] mc-xp-bar" style={{ width: 364, height: 10 }}>
        <img src={`${MC}/Experience_bar_background.png`} alt=""
          style={{ width: '100%', height: '100%', imageRendering: 'pixelated', objectFit: 'fill', display: 'block' }} />
        <img src={`${MC}/Experience_bar_progress.png`} alt=""
          style={{ position: 'absolute', top: 0, left: 0, width: '72%', height: '100%', imageRendering: 'pixelated', objectFit: 'fill', objectPosition: 'left' }} />
      </div>

      {/* Hotbar — crop widgets.png to first row (182×22 at 1x → 273×33 at 1.5x) */}
      <div style={{
        width: 297, height: 44,
        backgroundImage: `url(${MC}/widgets.png)`,
        backgroundPosition: '0 0',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '384px auto',
        imageRendering: 'pixelated',
      }} />

      {/* ESC hint */}
      <button
        onClick={onExit}
        className="mt-1 text-[7px] text-foreground/50 hover:text-foreground/90 tracking-widest transition-colors mc-exempt"
        style={{ fontFamily: 'var(--font-minecraft), "Zpix", monospace' }}
      >
        [ ESC ] EXIT MINECRAFT MODE
      </button>
    </motion.div>
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
    const x = (clientX - (left + width / 2)) * 0.15; // 降低移动强度系数，不要让它“飞出去”
    const y = (clientY - (top + height / 2)) * 0.15;
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
      transition={{ type: "spring", stiffness: 100, damping: 10, mass: 0.5 }} // 更柔和的弹性物理阻尼
      className={className}
      {...(props.style ? { style: props.style } : {})}
    >
      <a {...props} className="w-full h-full flex items-center justify-between pointer-events-auto" style={{...props.style}}>    
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
    hero: { desc: "Operating from Nanjing University. Engineering robust software architectures and crafting immersive digital experiences.", loc: "Location", locVal: "Macau → Nanjing", foc: "Focus", focVal: "Full-Stack / Creative Dev" },
    about: { sub: "About.exe", title1: "Behind the", title2: "Screen.", p1: "My journey into software engineering didn't start with standard syntax—it began with Redstone in Minecraft. Building virtual logic arrays slowly evolved into writing robust backend frameworks, ultimately leading to architecting expansive modern internet systems.", p2: "Currently studying in Nanjing University, I thrive at the intersection of logical engineering and raw aesthetic emotion. Photography teaches me about composition and light, while code gives me the tools to build and manipulate entire digital worlds.", tags: ["FULL-STACK WEB", "SYSTEM ARCH", "PHOTOGRAPHY", "COMPETITIVE DEBATE"] },
    works: { title1: "SELECTED", title2: "WORKS.", archive: "v2.0 // Archive", view: "VIEW PROJECT", items: [ { title: "NJUMatch", desc: "An exclusive campus dating and social matching platform designed for Nanjing University students. Features smart matching algorithms and verified student profiles for secure networking.", tag: "SOCIAL / FULL-STACK", link: "https://njumatch.com" }, { title: "Fimel Studio", desc: "An immersive landing page for a creative Minecraft studio. Features cutting-edge interactive web design and smooth scrolling experiences to showcase voxel arts.", tag: "CREATIVE WEB", link: "https://treehey.github.io/Fimel/" }, { title: "Wide Research Finance", desc: "An AI-powered financial intelligence terminal. Automates 17+ global news sources via DeepSeek LLM for real-time sentiment and event analysis.", tag: "AI / AUTOMATION", link: "https://finai.org.cn" }, { title: "Enzyme Explorer", desc: "An immersive science education website exploring enzyme biochemistry across bread, wine, and cheese — built with pure HTML/CSS/JS featuring rich interactive labs.", tag: "SCIENCE / CREATIVE WEB", link: "https://treehey.github.io/Enzyme/" } ] },
    gallery: { m1: "I DON'T JUST", m2: "WRITE CODE.", m3: "I ENGINEER", m4: "EMOTIONS.", photos: [ "Mong Kok · Neon & Dust", "Lujiazui · Urban Spine", "Love Post Office · Letter", "Panda · Gentle Power" ] },
    skills: { title1: "SYSTEM", title2: "OVERVIEW", items: [ "Computer Sys. · Hardware & Software", "Front-End · Website Design", "Python · Proficiency", "Office Suite · Advanced Mastery", "Photography · Foodie / Life" ] },
    timeline: { title: "Runtime Logs", items: [ { label: "Minecraft", detail: "Redstone & Logical Gates" }, { label: "Python/Algos", detail: "Macau Python Competition Top 5" }, { label: "Office Master", detail: "Macau Office Software Competition 3rd" }, { label: "STEAM & IoT", detail: "STEAM & IoT Competition 2nd Place" }, { label: "Web Tech", detail: "Macau Web Design Competition 2nd" }, { label: "Debate", detail: "Debater since high school, now in SE Debate Team" }, { label: "NJU", detail: "Nanjing University Software Eng." } ] },
    contact: { sub: "COLLABORATION", t1: "LET'S CREATE", t2: "TOGETHER.", channel: "PRIMARY CHANNEL", networks: "NETWORKS" },
    marquee: "SOFTWARE ENGINEERING — CREATIVE CODING — SLOTH — "
  },
  '简': {
    nav: { about: '关于', works: '项目', gallery: '画廊', skills: '技能', timeline: '日志', guestbook: '留言墙', contact: '联系' },
    hero: { desc: "坐标南京大学。致力于构建可靠的软件架构与沉浸式的现代数字交互体验。", loc: "位置", locVal: "澳门 → 南京", foc: "专注", focVal: "软件工程 / 创意编程" },
    about: { sub: "关于.exe", title1: "屏幕", title2: "背后。", p1: "我的软件工程之旅并非始于标准语法——而是从 Minecraft 的红石电路开始。搭建早期的虚拟逻辑门逐渐演变为编写稳健的后端框架，最终将我引向了构建广阔的现代全栈架构与互联网系统。", p2: "目前就读于南京大学，我游走于严谨的系统抽象与纯粹的视觉交互交汇处。摄影教会我何为构图与光影，而代码则赋予我构筑世界、操控数据的纯粹力量。", tags: ["全栈架构设计", "现代前端工程", "摄影与视觉表达", "逻辑思辨与辩论"] },
    works: { title1: "精选", title2: "项目。", archive: "v2.0 // 归档", view: "查看项目", items: [ { title: "NJUMatch 南大扩列", desc: "专为南京大学学生打造的校园交友与恋爱匹配平台。集成校园专属匹配算法与严格的学生身份认证，构建安全、真诚的南大专属社交网络。", tag: "社交平台 / 全栈开发", link: "https://njumatch.com" }, { title: "Fimel 繁梦工作室", desc: "创意 Minecraft 游戏工作室展示官网。融合前沿的网页交互设计与视差滚动体验，完美呈现沉浸式的体素艺术项目与团队风采。", tag: "创意展示 / 品牌设计", link: "https://treehey.github.io/Fimel/" }, { title: "Wide Research 金融智库", desc: "基于大语言模型（DeepSeek V3）的自动化财经情报系统。全天候聚合17+全球信源，实现深度热点提取与市场情感分析网。", tag: "AI智能分析 / 自动化", link: "https://finai.org.cn" }, { title: "酶学探索平台", desc: "沉浸式生物科学教育展示网站，以面包发酵、葡萄酿酒、奶酪制作为载体，生动呈现酶在食品工业中的奥秘，纯 HTML/CSS/JS 精心打造。", tag: "科学教育 / 创意展示", link: "https://treehey.github.io/Enzyme/" } ] },
    gallery: { m1: "我不仅仅", m2: "编写代码。", m3: "我更在", m4: "编织情绪。", photos: [ "旺角 · 霓虹与尘埃", "陆家嘴 · 城市脊梁", "爱情邮局 · 一纸情书", "大熊猫 · 温柔力量" ] },
    skills: { title1: "系统", title2: "概览", items: [ "计算机系统 · 软硬件与Linux", "前端开发 · 现代网站设计", "Python · 代码与运行熟练", "Office 套件 · 深度精通", "人文纪实 · 摄影与干饭热爱" ] },
    timeline: { title: "运行日志", items: [ { label: "逻辑启蒙", detail: "Minecraft 红石机械与指令实验" }, { label: "初试代码", detail: "Python解难赛全澳 Top 5" }, { label: "效率先锋", detail: "Office技能比赛全澳季军" }, { label: "硬核创客", detail: "STEAM及IoT创意解难赛全澳亚军" }, { label: "前端构建", detail: "手机网页技术比赛亚军及独立程序开发" }, { label: "言语思辨", detail: "高三起步辩论，现任软院辩论队成员" }, { label: "南京大学", detail: "软件工程本科深造新篇章" } ] },
    contact: { sub: "合作与联系", t1: "探索未知，", t2: "共同创造。", channel: "主要通道", networks: "社交网络" },
    marquee: "现代软件工程 — 创意编程与体验架构 — 树懒 — "
  },
  '繁': {
    nav: { about: '關於', works: '項目', gallery: '畫廊', skills: '技能', timeline: '日誌', guestbook: '留言牆', contact: '聯繫' },
    hero: { desc: "座標南大蘇州校區。致力於構建可靠的軟件架構與沉浸式的現代數字交互體驗。", loc: "位置", locVal: "澳門 → 蘇州", foc: "專注", focVal: "軟件工程 / 創意編程" },
    about: { sub: "關於.exe", title1: "屏幕", title2: "背後。", p1: "我的軟件工程之旅並非始於標準語法——而是從 Minecraft 的紅石電路開始。搭建早期的虛擬邏輯門逐漸演變為編寫穩健的後端框架，最終將我引向了構建廣闊的現代全棧架構與互聯網系統。", p2: "目前就讀於南京大學，我遊走於嚴謹的系統抽象與純粹的視覺交互交匯處。攝影教會我何為構圖與光影，而代碼則賦予我構築世界、操控數據的純粹力量。", tags: ["全棧架構設計", "現代前端工程", "攝影與視覺表達", "邏輯思辨與辯論"] },
    works: { title1: "精選", title2: "項目。", archive: "v2.0 // 歸檔", view: "查看項目", items: [ { title: "NJUMatch 南大擴列", desc: "專為南京大學學生打造的校園交友與戀愛匹配平台。集成校園專屬匹配算法與嚴格的學生身份認證，構建安全、真誠的專屬社交網絡。", tag: "社交平台 / 全棧開發", link: "https://njumatch.com" }, { title: "Fimel 繁夢工作室", desc: "創意 Minecraft 遊戲工作室官網。融合前沿的網頁交互設計與視差滾動體驗，沉浸式呈現體素藝術項目與團隊風采。", tag: "創意展示 / 品牌視覺", link: "https://treehey.github.io/Fimel/" }, { title: "Wide Research 金融智庫", desc: "基於大語言模型（DeepSeek V3）的自動化財經情報系統。全天候聚合17+全球信源，實現深度熱點提取與市場情感分析網。", tag: "AI智能分析 / 自動化", link: "https://finai.org.cn" }, { title: "酶學探索平台", desc: "沉浸式生物科學教育展示網站，以麵包發酵、葡萄釀酒、奶酪製作為載體，生動呈現酶在食品工業中的奧秘，純 HTML/CSS/JS 精心打造。", tag: "科學教育 / 創意展示", link: "https://treehey.github.io/Enzyme/" } ] },
    gallery: { m1: "我不僅僅", m2: "編寫代碼。", m3: "我更在", m4: "編織情緒。", photos: [ "旺角 · 霓虹與塵埃", "陸家嘴 · 城市脊梁", "愛情郵局 · 一紙情書", "大熊貓 · 溫柔力量" ] },
    skills: { title1: "系統", title2: "概覽", items: [ "計算機系統 · 軟硬件與Linux", "前端開發 · 現代網站設計", "Python · 代碼與運行熟練", "Office 套件 · 深度精通", "人文紀實 · 攝影與乾飯熱愛" ] },
    timeline: { title: "運行日誌", items: [ { label: "邏輯啟蒙", detail: "Minecraft 紅石機械與指令實驗" }, { label: "初試代碼", detail: "Python解難賽全澳 Top 5" }, { label: "效率先鋒", detail: "Office技能比賽全澳季軍" }, { label: "硬核創客", detail: "STEAM及IoT創意解難賽全澳亞軍" }, { label: "前端構建", detail: "手機網頁技術比賽亞軍及獨立程序開發" }, { label: "言語思辨", detail: "高三起步辯論，現任軟院辯論隊成員" }, { label: "南京大學", detail: "軟件工程本科深造新篇章" } ] },
    contact: { sub: "合作與聯繫", t1: "探索未知，", t2: "共同創造。", channel: "主要通道", networks: "社交網絡" },
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
  { img: `${B}/images/njumatch.png`,      accent: "#E11D48", objPos: "center" }, // Elegant Rose
  { img: `${B}/images/fimel.png`,         accent: "#2563EB", objPos: "20% center" }, // Shifted right for better frame
  { img: `${B}/images/wide-research.png`, accent: "#4F46E5", objPos: "center" }, // Elegant Indigo
  { img: `${B}/images/enzyme.png`,        accent: "#10B981", objPos: "center" }, // Elegant Emerald
];

const SKILLS = [
  { name: "Computer",     accent: "#3B82F6", bg: `${B}/images/about/computer-room.jpg` }, // Blue
  { name: "Front-End",    accent: "#EC4899", bg: `${B}/images/about/information-technology.jpg` }, // Pink
  { name: "Python",       accent: "#10B981", bg: `${B}/images/about/python.jpeg` }, // Emerald
  { name: "Office",       accent: "#F59E0B", bg: `${B}/images/about/ppt.jpg` }, // Amber
  { name: "Photography",  accent: "#8B5CF6", bg: `${B}/images/zhuhai.jpg` }, // Violet
];

const TIMELINE = [
    { year: "2012", img: `${B}/images/about/Minecraft.jfif` },
    { year: "2021", img: `${B}/images/about/python.jpeg` },
    { year: "2022", img: `${B}/images/about/ppt.jpg` },
    { year: "2022", img: `${B}/images/about/steam&iot.jpg` },
    { year: "2023", img: `${B}/images/about/information-technology.jpg` },
    { year: "2023", img: `${B}/images/about/sp-school.jpg` },
    { year: "2024", img: `${B}/images/about/nju.jpg` },
  ];

function VerticalTimeline({ t, setCursorBig, TIMELINE }: { t: any, setCursorBig: (v: boolean) => void, TIMELINE: any[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);
  // Track ahead of center to complete the curve earlier!
  const { scrollYProgress } = useScroll({ target: lineRef, offset: ['start 60%', 'end 95%'] });

  /* Signal particle y-position (imperative, no re-renders) */
  const particleY = useMotionValue(0);
  /* Per-item reveal */
  const [visible, setVisible] = useState<boolean[]>(TIMELINE.map(() => false));

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    /* Move particle */
    const height = lineRef.current?.offsetHeight ?? 0;
    const p = Math.max(0, Math.min(1, (v - 0.04) / 0.92));
    particleY.set(p * height);
    /* Reveal items as signal passes each threshold */
    setVisible(prev => {
      const next = [...prev];
      let changed = false;
      TIMELINE.forEach((_, i) => {
        const thr = 0.04 + (i / TIMELINE.length) * 0.88;
        if (v >= thr && !prev[i]) { next[i] = true; changed = true; }
      });
      return changed ? next : prev;
    });
  });

  // (No longer using Framer Motion exit parallax for this section)

  return (
    <section ref={sectionRef} id="timeline" className="awwwards-card relative z-10 w-full min-h-[90vh] bg-background text-foreground overflow-hidden py-16">
      <div className="awwwards-card-inner py-24 md:py-32 w-[96%] max-w-[1920px] mx-auto bg-foreground/[0.02] backdrop-blur-[40px] border border-foreground/[0.05] rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.2)] overflow-hidden relative">
      {/* High-end ambient inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent pointer-events-none rounded-[3rem]" />

      {/* Section Header */}
      <div className="w-[96%] max-w-7xl mx-auto border border-foreground/10 bg-foreground/[0.02] backdrop-blur-3xl rounded-[2rem] px-6 md:px-12 py-5 flex items-center justify-between mb-20 shadow-2xl relative z-10">
        <h2 className="font-syne font-black text-xs md:text-sm uppercase tracking-[0.5em] text-foreground/50" style={{ fontFamily: "var(--font-syne)" }}>
          {t.timeline.title}
        </h2>
        <span className="font-mono text-xs text-foreground/30 tracking-widest hidden md:block">§ 00{TIMELINE.length} ENTRIES</span>
      </div>

      {/* Background large year ghost */}
      <div className="absolute top-1/2 right-[-5vw] -translate-y-1/2 font-syne font-black text-[35vw] text-foreground pointer-events-none select-none leading-none" style={{ fontFamily: "var(--font-syne)", opacity: 0.03 }}>
        LOG
      </div>

      <div className="relative px-6 md:px-12 lg:px-24 pt-16 pb-8">
                  {/* Straight Precision Line Drawing */}
          <div ref={lineRef} className="absolute left-[calc(1.5rem+14.5px)] md:left-[calc(3rem+14.5px)] lg:left-[calc(6rem+14.5px)] top-[6.5rem] bottom-16 w-[2px] pointer-events-none z-0">
            <div className="absolute inset-0 bg-foreground/10 h-full w-full" />
            <motion.div 
              className="absolute top-0 left-0 w-full bg-foreground shadow-[0_0_10px_color-mix(in_srgb,var(--foreground)_60%,transparent)] origin-top"
              style={{ scaleY: scrollYProgress, height: "100%" }} 
            />
          </div>

        <div className="flex flex-col gap-0 border-t border-foreground/[0.03]">
          {TIMELINE.map((node, i) => {
            const item = t.timeline.items[i];
            const isActive = visible[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-6 md:gap-14 group border-b border-foreground/[0.03] py-8 md:py-14 relative transition-colors duration-700"
                onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
              >
                {/* Organic Breathing Node */}
                <div className="relative flex-shrink-0 flex flex-col items-center pt-2 md:pt-3 z-10 pl-[8.5px]">
                  <motion.div 
                    animate={isActive ? { scale: [1, 1.5, 1.2], opacity: [0.5, 1, 1] } : { scale: 1, opacity: 0.2 }}
                    transition={isActive ? { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } : { duration: 0.3 }}
                    className={`w-3 h-3 rounded-full bg-foreground shadow-[0_0_15px_color-mix(in_srgb,var(--foreground)_60%,transparent)]`} 
                  />
                </div>

                {/* Year */}
                <div className="flex-shrink-0 w-16 md:w-24 pt-1">
                  <span className="font-mono text-lg md:text-2xl text-foreground/50 group-hover:text-foreground transition-colors duration-500">
                    {node.year}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-0">
                  <div className="flex-1">
                    <h3 
                      className="font-syne font-black text-2xl md:text-4xl leading-none mb-3 text-foreground/80 group-hover:text-foreground group-hover:translate-x-3 transition-all duration-500"
                      style={{ fontFamily: "var(--font-syne)" }}
                    >
                      {item.label}
                    </h3>
                    <p className="font-mono text-sm text-foreground/40 group-hover:text-foreground/60 tracking-wider transition-colors duration-500 max-w-sm">
                      {item.detail}
                    </p>
                  </div>

                  {/* Thumbnail Container */}
                  <div className="w-28 h-18 md:w-48 md:h-32 rounded flex-shrink-0 overflow-hidden border border-foreground/5 group-hover:border-foreground/20 transition-all duration-700 md:ml-auto relative shadow-lg group-hover:shadow-2xl">
                    <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-700" />
                    <img 
                      src={node.img} 
                      alt={item.label} 
                      loading="lazy" 
                      decoding="async" 
                      className="w-full h-full object-cover grayscale-[40%] opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" 
                    />
                  </div>
                </div>

                {/* Milestone badge */}
                <div 
                  className="hidden lg:flex items-center gap-2 flex-shrink-0 font-mono text-[10px] tracking-[0.3em] uppercase border border-foreground/10 bg-foreground/5 px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 text-foreground/50 group-hover:text-foreground/80"
                >
                  <span className="w-1 h-1 rounded-full bg-foreground/60 animate-pulse" />
                  MILESTONE_{String(i + 1).padStart(2, '0')}
                </div>
              </motion.div>
            );
          })}
        </div>
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
   BLUR FOCUS TEXT — Cinematic typographic reveal
════════════════════════════════════════════════════════ */
const blurTextVariants: Variants = {
  hidden: { filter: "blur(10px)", opacity: 0, scale: 1.05 },
  visible: { filter: "blur(0px)", opacity: 1, scale: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as any } }
};
const blurWordVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

function BlurFocusText({ text, trigger, className }: { text: string; trigger: boolean; className?: string }) {
  const words = text.split(" ");
  return (
    <motion.span 
      className={`inline-block ${className || ""}`}
      variants={blurWordVariants}
      initial="hidden"
      animate={trigger ? "visible" : "hidden"}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split("").map((char, j) => (
            <motion.span key={j} variants={blurTextVariants} className="inline-block">
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
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
  const worksContainerRef = useRef<HTMLElement>(null);
  const skillsRef = useRef<HTMLElement>(null);
  const guestbookRef = useRef<HTMLElement>(null);
  const contactSectionRef = useRef<HTMLElement>(null);
  const [aboutMouse, setAboutMouse] = useState({ x: 0, y: 0 });

  /* ── Scroll-driven transforms ── */
  // Hero scroll-out
  
  
  
  
   // grid moves slower

  // About headings horizontal parallax
  const { scrollYProgress: aboutProgress } = useScroll({ target: aboutRef, offset: ['start end', 'end start'] });
  const aboutH1X = useTransform(aboutProgress, [0, 1], [60, -60]);
  const aboutH2X = useTransform(aboutProgress, [0, 1], [-60, 60]);

  // Contact headline scrub reveal
  const { scrollYProgress: contactProgress } = useScroll({ target: contactSectionRef, offset: ['start 90%', 'center 50%'] });
  const contactHeadX       = useTransform(contactProgress, [0, 1], [300, 0]); // 原来只有100太短了，放大到300
  const contactHeadY       = useTransform(contactProgress, [0, 1], [150, 0]); // 加上一点Y轴的上浮配合
  const contactHeadOpacity = useTransform(contactProgress, [0, 0.3], [0, 1]);

  useGSAP(() => {
    // ----------------------------------------------------
    // 1. FLYTHROUGH PIN
    // ----------------------------------------------------
    // Pin Hero and About together. Hero.tsx uses this wrapper for its ScrollTrigger scrub.
    ScrollTrigger.create({
      trigger: "#hero-about-wrapper",
      start: "top top",
      end: "+=1500", 
      pin: true,
      // pinSpacing: true allows the subsequent content to be pushed down
    });

    // ----------------------------------------------------
    // 2. ABOUT LIQUID REVEAL (液体磁吸与文字解构) - TRIGGERED LATE!
    // ----------------------------------------------------
    // Since About is pinned alongside Hero, its physical location doesn't change for 1500px.
    // Use the wrapper as the trigger, and start exactly at 1200px (when the black veil fades)!
    gsap.fromTo(".about-reveal-text", 
      { y: 120, opacity: 0, rotateZ: 5, transformPerspective: 800, rotationX: -60 },
      { 
        y: 0, opacity: 1, rotateZ: 0, rotationX: 0, 
        duration: 1.8, stagger: 0.1, ease: "power4.out",
        scrollTrigger: { 
          trigger: "#hero-about-wrapper", 
          start: "top -1200px",  // Triggers exactly 300px before the pin drops!
        }
      }
    );

    // ----------------------------------------------------
    // 3. WORKS DECK DEALING (作品集发牌式层叠)
    // ----------------------------------------------------
    // Pin the works section temporarily to throw the cards up
    const worksDeck = gsap.utils.toArray('.work-deck-card') as HTMLElement[];
    if (worksDeck.length > 1) {
      const totalTransitions = worksDeck.length - 1;
      const tlDeck = gsap.timeline({
        scrollTrigger: {
          trigger: "#works-pin-container",
          start: "top top",
          // 控制总吸附滑动距离为：每张卡片平均占用 1.2 倍一屏的滚动区域
          end: () => `+=${window.innerHeight * totalTransitions * 1.2}`, 
          pin: true,
          scrub: 1,
          snap: {
            snapTo: 1 / totalTransitions,  // 关键！开启轻微磁吸：依据卡片数量等分进行吸附
            duration: { min: 0.2, max: 0.6 },
            delay: 0.05,                   // 手指停下 0.05 秒后立刻轻微吸过去
            ease: "circ.out"
          }
        }
      });
      
      worksDeck.forEach((card, i) => {
        if (i !== 0) {
          // 精准锁帧：让下一张卡在 0.05 秒稍微停顿后立马爽快飞出 (power3.out)，解决“滑半天没反应”
          tlDeck.fromTo(card,
            { y: window.innerHeight + 100, rotation: i % 2 === 0 ? 8 : -8, scale: 0.9, opacity: 0 },
            { 
              y: 0,
              rotation: 0,
              scale: 1,
              opacity: 1, 
              ease: "power3.out",  // 改掉"慢起"逻辑，变为先快后慢（一开始立刻冲出大半截，快到位时慢慢贴合）
              duration: 0.95       // 占用 95% 时间比例
            },
            i - 0.95               // 把落位时刻完美钉死在整数秒！1.0, 2.0, 3.0，配合 snap 百分比吸附
          );
        }
      });
      
      // 尾部镇场桩：强行锁定总时间轴长度，让百分比算法绝对精准切割每个卡片的节点
      tlDeck.to({}, { duration: 0.01 }, totalTransitions);
    }

    // ----------------------------------------------------
    // 4. GALLERY VELOCITY SKEW (画廊速度感应倾斜) & 横向滚动
    // ----------------------------------------------------
    // We already have a horizontal scroll for Gallery using Framer Motion (`xTransform`), 
    // but GSAP ScrollTrigger manages the velocity skew effect.
    let proxy = { skew: 0 };
    let skewSetter = gsap.quickSetter(".gallery-skew-item", "skewX", "deg");
    let clamp = gsap.utils.clamp(-25, 25); // Max skew 25 degrees
    ScrollTrigger.create({
      onUpdate: (self) => {
        let skew = clamp(self.getVelocity() / -80); 
        if (Math.abs(skew) > Math.abs(proxy.skew)) {
          proxy.skew = skew;
          gsap.to(proxy, {skew: 0, duration: 0.8, ease: "elastic.out(1, 0.4)", overwrite: true, onUpdate: () => skewSetter(proxy.skew)});
        }
      }
    });

    // ----------------------------------------------------
    // 5. SKILLS 3D ASSEMBLE (3D碎片组装) - 随着滚动进行！
    // ----------------------------------------------------
    const skillsItems = gsap.utils.toArray('.skill-bento-piece') as HTMLElement[];
    gsap.fromTo(skillsItems,
      // 打碎分布：深度 Z，随机倾斜
      { z: () => Math.random() * 1200 - 600, opacity: 0, rotationY: () => Math.random() * 180 - 90, rotationX: () => Math.random() * 90 - 45, x: () => Math.random() * 800 - 400, y: () => Math.random() * 800 - 400 },
      { 
        z: 0, opacity: 1, rotationY: 0, rotationX: 0, x: 0, y: 0, 
        stagger: 0.1, ease: "power2.out",
        scrollTrigger: { 
          trigger: "#skills", 
          start: "top 90%",
          end: "center center", 
          scrub: 1.5 // 关键！开启 scrub 1.5 让整个组装过程完全跟着你的滚轮进行
        }
      }
    );

  }, { scope: containerRef });

  const [aboutImgMouse, setAboutImgMouse] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState("");
  const t = DICT[lang as keyof typeof DICT];

  // Scroll Spy Observer
  useEffect(() => {
    const isContactRevealed = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      return window.scrollY >= maxScroll - Math.min(window.innerHeight * 0.35, 320);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isContactRevealed()) {
          setActiveSection(entry.target.id);
        }
      });
    }, { rootMargin: "-30% 0px -50% 0px" });

    const handleScroll = () => {
      if (isContactRevealed()) setActiveSection("contact");
    };

    const sections = document.querySelectorAll('main section[id], main div[id="timeline"]');
    sections.forEach(s => observer.observe(s));
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
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
  
  // Use a spring to make the scroll incredibly silky on mobile devices
  const smoothHorizontalProgress = useSpring(horizontalProgress, {
    stiffness: 150,
    damping: 25,
    mass: 0.5,
    restDelta: 0.001
  });
  
  // 恢复平滑流畅的线性映射
  const xTransform = useTransform(smoothHorizontalProgress, [0, 1], ["0%", "-80%"]); // 5 panels = -80%

  /* Gallery 轻微吸附中心 (Magnetic Snap) */
  useEffect(() => {
    let timeoutId: any;
    const handleScroll = () => {
      if (typeof window === "undefined" || !globalLenis) return;
      clearTimeout(timeoutId);
      
      // 停止滚动 150ms 后触发检测
      timeoutId = setTimeout(() => {
        if (!horizontalRef.current) return;
        const rect = horizontalRef.current.getBoundingClientRect();
        const progress = -rect.top / (rect.height - window.innerHeight);
        
        // 仅在画廊范围内时进行吸附
        if (progress > 0.02 && progress < 0.98) {
          const nearest = Math.round(progress * 4) / 4; // 计算最近的卡片 (0, 0.25, 0.5, 0.75, 1)
          const dist = Math.abs(progress - nearest);
          
          // "轻微吸附"：只有在离某张卡片较近时（例如偏差 15% 以内）才吸附过去，
          // 防止用户想停在两张卡片中间时被强行拽走，保证手感绝对自由又自带磁吸
          if (dist > 0.005 && dist < 0.12) {
            const targetY = window.scrollY + rect.top + nearest * (rect.height - window.innerHeight);
            globalLenis?.scrollTo(targetY, { lerp: 0.08 });
          }
        }
      }, 150);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  /* Panel 1 (manifesto) visible when horizontal progress < 0.15 */
  const [panel1Visible, setPanel1Visible] = useState(false);
  useMotionValueEvent(smoothHorizontalProgress, "change", (v) => {
    setPanel1Visible(v > 0.02 && v < 0.15);
  });

  const navItems = [
    { id: 'about',     label: t.nav.about },
    { id: 'works-pin-container', label: t.nav.works }, // Maps perfectly to the actual id now
    { id: 'gallery',   label: t.nav.gallery },
    { id: 'skills',    label: t.nav.skills },
    { id: 'timeline',  label: t.nav.timeline },
    { id: 'guestbook', label: t.nav.guestbook },
    { id: 'contact',   label: t.nav.contact },
  ];
  const activeIdx = navItems.findIndex(n => n.id === activeSection);

  const scrollToNavItem = (id: string) => {
    if (id === "contact") {
      const target = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      setActiveSection("contact");
      if (globalLenis) globalLenis.scrollTo(target, { duration: 1.2 });
      else window.scrollTo({ top: target, behavior: "smooth" });
      return;
    }

    const el = document.getElementById(id);
    if (!el) return;
    setActiveSection(id);
    const target = window.scrollY + el.getBoundingClientRect().top;
    if (globalLenis) globalLenis.scrollTo(target, { duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const HERO_CHARS = "TREE HEY".split("");

  // ── Hero letter explosion & SLOTH easter egg ────────────────────────────
  const [heroClickedSet, setHeroClickedSet] = useState<Set<string>>(new Set());
  const [heroExploding, setHeroExploding] = useState<Set<string>>(new Set());
  const [slothMode, setSlothMode] = useState(false);
  const heroVectorsRef = useRef<Record<string, { x: number; y: number; rotate: number }>>({});
  const slothPendingRef = useRef(false);

  /* ── Minecraft mode ── */
  const [minecraftMode, setMinecraftMode] = useState(false);
  const [mcPortal, setMcPortal] = useState(false);
  const minecraftModeRef = useRef(false);
  useEffect(() => { minecraftModeRef.current = minecraftMode; }, [minecraftMode]);

  /* sync html class */
  useEffect(() => {
    document.documentElement.classList.toggle('minecraft-mode', minecraftMode);
  }, [minecraftMode]);

  const enterMinecraft = () => {
    setMcPortal(true);
    setTimeout(() => setMinecraftMode(true), 480);
    setTimeout(() => setMcPortal(false), 1100);
  };
  const exitMinecraft = () => {
    setMcPortal(true);
    setTimeout(() => setMinecraftMode(false), 380);
    setTimeout(() => setMcPortal(false), 780);
  };

  /* ── Global keyboard easter eggs ── */
  useEffect(() => {
    let buf = '';
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape') { if (minecraftModeRef.current) exitMinecraft(); return; }
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-5);
      if (buf === 'sloth') {
        buf = '';
        setSlothMode(true);
        globalLenis?.scrollTo(0, { duration: 1.5 });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ── Scroll velocity blur overlay (DOM-direct, zero re-renders) ── */
  const blurOverlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const vel = globalLenis?.velocity ?? 0;
      const blur = Math.min(Math.max(Math.abs(vel) - 2, 0) * 0.05, 0.85);
      if (blurOverlayRef.current)
        blurOverlayRef.current.style.backdropFilter = `blur(${blur.toFixed(2)}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

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

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full">
      {/* Main Content Wrapper (Covers the Footer) */}
      <main ref={containerRef} className="relative z-10 w-full bg-background pb-12 md:pb-24 shadow-[0_40px_120px_rgba(0,0,0,0.6)]" style={{ marginBottom: "100vh", borderBottomLeftRadius: "60px", borderBottomRightRadius: "60px" }}>
        <div id="top" className="absolute top-0" />

      {/* ───── Theme Wipe Overlay ───── */}
      <div className="pointer-events-none" style={{ zIndex: 988 }}>
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
                      stroke="color-mix(in srgb, var(--foreground) 55%, transparent)" strokeWidth="4" />
                    <line x1={props.line2.x1} y1={props.line2.y1} x2={props.line2.x2} y2={props.line2.y2}
                      stroke="color-mix(in srgb, var(--foreground) 40%, transparent)" strokeWidth="3.5" strokeDasharray="10 6" />
                    {/* Line on top */}
                    <line x1={props.line1.x1} y1={props.line1.y1} x2={props.line1.x2} y2={props.line1.y2}
                      stroke="color-mix(in srgb, var(--background) 95%, transparent)" strokeWidth="1.5" />
                    <line x1={props.line2.x1} y1={props.line2.y1} x2={props.line2.x2} y2={props.line2.y2}
                      stroke="color-mix(in srgb, var(--background) 70%, transparent)" strokeWidth="1.5" strokeDasharray="10 6" />
                  </svg>
                )}
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
      
      {/* ───── NAV ───── */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        className="fixed bottom-6 md:bottom-auto md:top-6 left-1/2 -translate-x-1/2 z-[990] flex items-center px-5 md:px-6 py-2.5 rounded-full w-[90vw] md:w-auto justify-between md:justify-center overflow-visible"
      >
        <div className="absolute inset-0 bg-foreground/5 backdrop-blur-2xl rounded-full z-[-1] border border-foreground/[0.05]" />
        
        {/* Logo + active section index */}
        <div className="shrink-0 flex items-end gap-1.5">
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onMouseEnter={() => setCursorBig(true)}
            onMouseLeave={() => setCursorBig(false)}
            className="font-syne font-bold text-lg text-foreground tracking-widest hover:opacity-60 transition-opacity cursor-pointer"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            TH
          </a>
          <span className="font-mono text-[9px] text-foreground/20 mb-[3px] leading-none tabular-nums">
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
                scrollToNavItem(item.id);
              }}
              onMouseEnter={() => setCursorBig(true)}
              onMouseLeave={() => setCursorBig(false)}
              className="relative group py-1"
            >
              <FlipText
                text={item.label}
                className={`${lang === 'EN' ? 'font-mono text-[11px] tracking-widest' : 'font-syne font-semibold text-[12px] tracking-[0.08em]'} uppercase transition-opacity duration-300 ${
                  activeSection === item.id ? 'text-foreground' : 'text-foreground/40'
                }`}
              />
              {activeSection === item.id && (
                <motion.div
                  layoutId="nav-line"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-foreground"
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
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 hover:text-foreground transition-colors px-3 py-1"
          >
            {mobileMenuOpen ? 'CLOSE' : 'MENU'}
          </button>
        </div>

        {/* Toggles */}
        <div className="shrink-0 flex items-center gap-3 md:gap-4 border-l border-foreground/10 pl-4 md:pl-5">
          <button
            aria-label="Toggle Theme"
            data-theme-btn="true"
            onPointerDown={handleThemePointerDown}
            onPointerMove={handleThemePointerMove}
            onPointerUp={handleThemePointerUp}
            className="text-foreground/50 hover:text-foreground text-xs md:text-sm transition-colors touch-none select-none cursor-grab active:cursor-grabbing"
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
              className={`p-1 transition-colors ${langOpen ? 'text-foreground' : 'text-foreground/35 hover:text-foreground'}`}
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
                  className="absolute right-0 md:right-1/2 md:translate-x-1/2 bottom-[140%] md:bottom-auto md:top-[140%] flex flex-col rounded-2xl p-2 min-w-[120px] origin-bottom-right md:origin-top z-[1000] border border-foreground/10 shadow-xl text-foreground bg-foreground/5 backdrop-blur-2xl"
                >
                  {['EN', '简', '繁'].map(l => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangOpen(false); }}
                      className={`text-[11px] font-mono px-3 py-2.5 rounded-lg text-left transition-all flex items-center gap-2 ${
                        lang === l
                          ? (theme === 'dark' ? 'bg-foreground/15 text-foreground font-bold' : 'bg-background/10 text-foreground font-bold')
                          : (theme === 'dark' ? 'text-foreground/60 hover:bg-foreground/10 hover:text-foreground' : 'text-foreground/60 hover:bg-background/5 hover:text-foreground')
                      }`}
                      onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
                    >
                      {lang === l && <span className={`w-1 h-1 rounded-full inline-block shrink-0 ${theme === 'dark' ? 'bg-foreground' : 'bg-foreground'}`} />}
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
      <div className="md:hidden z-[975]">
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col px-8 pt-20 pb-28"
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
                    setTimeout(() => scrollToNavItem(item.id), 400);
                  }}
                  className={`group w-full py-4 flex items-center gap-4 border-b text-left transition-colors ${
                    activeSection === item.id ? 'border-foreground/15' : 'border-foreground/[0.06]'
                  }`}
                >
                  <span className="font-mono text-[11px] text-foreground/20 tabular-nums w-5 shrink-0 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`font-syne font-black text-3xl uppercase tracking-tight transition-all duration-300 group-hover:translate-x-2 leading-none ${
                      activeSection === item.id ? 'text-foreground' : 'text-foreground/45'
                    }`}
                    style={{ fontFamily: "var(--font-syne)" }}
                  >
                    {item.label}
                  </span>
                  {activeSection === item.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                  )}
                </motion.button>
              ))}
            </nav>
            <p className="font-mono text-[10px] text-foreground/15 tracking-[0.3em] uppercase">
              TH // CREATIVE DEV
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* ───── CUSTOM CURSOR ───── */}
      <motion.div
        className="hidden md:block fixed top-0 left-0 z-[999] pointer-events-none rounded-full mix-blend-screen"
        style={{ x: cx, y: cy, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: cursorBig ? 90 : 16,
          height: cursorBig ? 90 : 16,
          backgroundColor: cursorBig ? "color-mix(in srgb, var(--foreground) 5%, transparent)" : "var(--foreground)",
          border: cursorBig ? "1px solid color-mix(in srgb, var(--foreground) 50%, transparent)" : "none",
          mixBlendMode: "difference" as const,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />

      {/* ───── BACKGROUND NOISE & AMBIENT AURORA ───── */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.008] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.42' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* ───── DYNAMIC GLASSMORPHISM AURORA BACKGROUND ───── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden mix-blend-screen opacity-40">
        <motion.div 
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-20 will-change-transform"
          style={{ backgroundColor: "var(--foreground)", transform: "translateZ(0)" }}
          animate={{
            x: [0, 50, -20, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[160px] opacity-10 will-change-transform"
          style={{ backgroundColor: "var(--foreground)", transform: "translateZ(0)" }}
          animate={{
            x: [0, -60, 30, 0],
            y: [0, 50, -50, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
        />
        <motion.div 
          className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-15 will-change-transform"
          style={{ backgroundColor: "var(--foreground)", transform: "translateZ(0)" }}
          animate={{
            x: [0, 40, -40, 0],
            y: [0, 30, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 4 }}
        />
      </div>

      <div id="hero-about-wrapper" className="relative w-full">
        {/* HERO */}
        {/* Placed absolutely on top of About */}
        <div className="absolute top-0 left-0 w-full h-[100svh] z-50 pointer-events-none">
          <div className="w-full h-full pointer-events-auto">
            <Hero
              lang={lang as any}
              slothMode={slothMode}
              heroClickedSet={heroClickedSet}
              heroExploding={heroExploding}
              heroVectors={heroVectorsRef.current}
              onCharClick={handleHeroCharClick}
              onSlothDismiss={() => {
                setSlothMode(false);
                setHeroClickedSet(new Set());
                setHeroExploding(new Set());
              }}
            />
          </div>
        </div>

        {/* ════════════════════════════════════
            1.5 ABOUT / INTERACTIVE IDENTITY
        ════════════════════════════════════ */}
        <section id="about" ref={aboutRef} className="relative z-10 w-full min-h-screen bg-background text-foreground overflow-hidden">

        <div className="w-full h-full relative" 
          onMouseMove={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setAboutMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
        >
          {/* High-end ambient inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent pointer-events-none" />
          {/* Mouse spotlight */}
          <div
            className="pointer-events-none absolute inset-0 mix-blend-overlay"
            style={{ background: `radial-gradient(800px circle at ${aboutMouse.x}px ${aboutMouse.y}px, color-mix(in srgb, var(--foreground) 8%, transparent), transparent 50%)` }}
          />

          <div className="w-[96%] max-w-[1920px] mx-auto mt-8 border border-foreground/10 bg-foreground/[0.02] backdrop-blur-3xl rounded-[2rem] px-6 md:px-12 py-5 flex items-center justify-between shadow-2xl z-20">
          <span className="font-mono text-xs tracking-[0.5em] uppercase text-foreground/80">{t.about.sub}</span>
          <div className="flex items-center gap-4">
            <motion.div
              className="h-[1px] bg-gradient-to-r from-transparent to-foreground/50 origin-left"
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              style={{ width: "80px" }}
            />
            <span className="font-mono text-xs text-foreground/50 tracking-widest">§ 001 — IDENTITY</span>
          </div>
        </div>

        {/* Row 2 — Oversized heading with staggered cinematic reveal */}
        <div className="relative w-full px-6 md:px-12 pt-16 md:pt-24 pb-12 flex flex-col gap-2 md:gap-0 overflow-visible">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-0">
            <motion.h2
              initial={{ y: 80, opacity: 0, rotate: 3, filter: "blur(12px)" }}
              whileInView={{ y: 0, opacity: 1, rotate: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className={`font-syne font-black leading-[0.85] uppercase cursor-default select-none whitespace-nowrap origin-bottom-left will-change-transform ${lang==="EN"?"text-[13vw] md:text-[11vw] lg:text-[11vw] tracking-tighter":"text-[22vw] md:text-[18vw] lg:text-[18vw] tracking-widest pl-4"}`}
              style={{ fontFamily: "var(--font-syne)", x: aboutH1X, transform: "translateZ(0)" }}
            >
              {t.about.title1}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="md:mb-12 hidden md:flex flex-col items-end gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/40 mix-blend-difference"
            >
              <div className="flex items-center gap-3 border-b border-foreground/10 pb-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground/50 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground/80"></span>
                </span>
                <span>SYSTEM STATUS // ACTIVE</span>
              </div>
              <span>FULL-STACK DEVELOPMENT</span>
              <span>CREATIVE ARCHITECTURE</span>
            </motion.div>
          </div>
          <motion.h2
            initial={{ y: 80, opacity: 0, rotate: -3, filter: "blur(12px)" }}
            whileInView={{ y: 0, opacity: 1, rotate: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`font-syne font-black leading-[0.85] text-transparent uppercase cursor-default select-none whitespace-nowrap origin-bottom-right will-change-transform ${lang==="EN"?"text-[16vw] md:text-[13vw] lg:text-[13vw] tracking-tighter":"text-[22vw] md:text-[18vw] lg:text-[18vw] tracking-[0.2em] pl-4"}`}
            style={{ fontFamily: "var(--font-syne)", WebkitTextStroke: "1.5px color-mix(in srgb, var(--color-white) 40%, transparent)", x: aboutH2X, transform: "translateZ(0)" }}
          >
            {t.about.title2}
          </motion.h2>
        </div>

        {/* ── BENTO PHOTO GRID ── */}
        {/* Desktop: 3-col × 2-row asymmetric  [ NJU(tall) | MC | Assoc ]
                                               [           | mbot | steam ] */}
        <div className="relative w-full grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] border-t border-[var(--color-white)]/10 overflow-hidden text-foreground"
          style={{ gridTemplateRows: "minmax(260px,35vh) minmax(260px,35vh)" }}>

          {/* Cell A — NJU, spans 2 rows */}
          <div
            className="relative md:row-span-2 overflow-hidden aspect-[4/3] md:aspect-auto border-b md:border-b-0 md:border-r border-foreground/10 group"
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
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none" />
            </motion.div>
            {/* Badge */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 font-mono text-[10px] text-foreground/50 bg-foreground/5 border border-foreground/10 px-3 py-1 uppercase tracking-[0.3em] whitespace-nowrap">PRESENT // NJU</div>
            {/* Text overlay at bottom */}
            <motion.div
              initial={{ y: 24, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.45 }}
              className="absolute bottom-6 left-6 right-6 z-10"
            >
              <p className="about-reveal-text origin-bottom font-grotesk text-sm text-foreground/75 leading-[1.75]">{t.about.p2}</p>
            </motion.div>
          </div>

          {/* Cell B — Minecraft, top col 2 */}
          <div
            className="relative overflow-hidden aspect-[4/3] md:aspect-auto border-b border-r border-foreground/10 group cursor-pointer"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
            }}
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
            onClick={() => minecraftMode ? exitMinecraft() : enterMinecraft()}
            title={minecraftMode ? "点击退出 Minecraft 模式" : "点击进入 Minecraft 模式"}
          >
            <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none pointer-events-none mix-blend-overlay"
                 style={{ background: 'radial-gradient(400px circle at var(--x) var(--y), rgba(255,255,255,0.4), transparent 40%)' }} />
            <DarkroomImage src={`${B}/images/about/Minecraft.jfif`} alt="Origin"
              className="w-full h-full object-cover object-center transition-transform duration-700 scale-100 group-hover:scale-[1.08]"
              finalFilter="brightness(1) contrast(1) grayscale(0.65) sepia(0) saturate(1) hue-rotate(0deg) blur(0px)"
              delay={0.15}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] text-foreground/50 bg-foreground/5 border border-foreground/10 px-2 py-1 uppercase tracking-widest pointer-events-none">Origin · 2012</div>
          </div>

          {/* Cell C — Student Association, top col 3 */}
          <div
            className="relative overflow-hidden aspect-[4/3] md:aspect-auto border-b border-foreground/10 group cursor-default"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
            }}
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
          >
            <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"
                 style={{ background: 'radial-gradient(400px circle at var(--x) var(--y), rgba(255,255,255,0.4), transparent 40%)' }} />
            <DarkroomImage src={`${B}/images/about/student-association.jpg`} alt="Student Association"
              className="w-full h-full object-cover transition-transform duration-700 scale-100 group-hover:scale-[1.08]"
              finalFilter="brightness(1) contrast(1) grayscale(0.40) sepia(0) saturate(1) hue-rotate(0deg) blur(0px)"
              delay={0.22}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] text-foreground bg-foreground/5 border border-foreground/10 px-2 py-1 uppercase tracking-widest pointer-events-none">Association</div>
          </div>

          {/* Cell D — mbot robotics, bottom col 2 */}
          <div
            className="relative overflow-hidden aspect-[4/3] md:aspect-auto border-b md:border-b-0 border-r border-foreground/10 group cursor-default"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
            }}
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
          >
            <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"
                 style={{ background: 'radial-gradient(400px circle at var(--x) var(--y), rgba(255,255,255,0.4), transparent 40%)' }} />
            <DarkroomImage src={`${B}/images/about/mbot.jpg`} alt="Robotics"
              className="w-full h-full object-cover transition-transform duration-700 scale-100 group-hover:scale-[1.08]"
              finalFilter="brightness(1) contrast(1) grayscale(0.40) sepia(0) saturate(1) hue-rotate(0deg) blur(0px)"
              delay={0.1}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] text-foreground/50 bg-foreground/5 border border-foreground/10 px-2 py-1 uppercase tracking-widest pointer-events-none">Robotics</div>
          </div>

          {/* Cell E — STEAM & IoT, bottom col 3 */}
          <div
            className="relative overflow-hidden aspect-[4/3] md:aspect-auto group cursor-default"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
            }}
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
          >
            <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"
                 style={{ background: 'radial-gradient(400px circle at var(--x) var(--y), rgba(255,255,255,0.4), transparent 40%)' }} />
            <DarkroomImage src={`${B}/images/about/steam&iot.jpg`} alt="STEAM"
              className="w-full h-full object-cover transition-transform duration-700 scale-100 group-hover:scale-[1.08]"
              finalFilter="brightness(1) contrast(1) grayscale(0.40) sepia(0) saturate(1) hue-rotate(0deg) blur(0px)"
              delay={0.18}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] text-foreground/50 bg-foreground/5 border border-foreground/10 px-2 py-1 uppercase tracking-widest pointer-events-none">STEAM · IoT</div>
          </div>
        </div>

        {/* ── Info band: p1 text | stat cards | tags ── */}
        <div className="relative w-full grid grid-cols-1 md:grid-cols-[2fr_1fr_1.5fr] border-t border-foreground/10">

          {/* p1 paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-foreground/10 flex flex-col justify-center gap-5"
          >
            <p className="about-reveal-text origin-bottom font-grotesk text-sm md:text-[15px] text-foreground/60 leading-[1.9]">{t.about.p1}</p>
          </motion.div>

          {/* Stat cards */}
          <div className="border-b md:border-b-0 md:border-r border-foreground/10 p-6 md:p-8 flex flex-col justify-between gap-4">
            {[
              { label: "BASE",   val: "Macau → Nanjing", sub: "澳门 · 南京大学", accent: "bg-foreground", grad: "from-foreground/10 to-transparent" },
              { label: "FOCUS",  val: "Full-Stack",  sub: "Architecture + UX", accent: "bg-foreground/70", grad: "from-foreground/5 to-transparent" },
              { label: "ORIGIN", val: "Minecraft",   sub: "Redstone → Code", accent: "bg-foreground/50", grad: "from-foreground/5 to-transparent" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group relative border border-transparent hover:border-foreground/10 p-3 -mx-3 rounded-sm transition-all duration-500 hover:bg-foreground/5 cursor-default overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${stat.accent} scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-bottom`} />
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                <div className="flex items-center gap-2 mb-1 relative z-10">
                  <motion.div className={`w-1.5 h-1.5 rounded-full ${stat.accent}`}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
                  />
                  <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-[0.4em]">{stat.label}</p>
                </div>
                <p className="font-syne font-bold text-lg md:text-xl text-foreground/80 group-hover:text-foreground transition-colors duration-300 pl-1 relative z-10" style={{ fontFamily: "var(--font-syne)" }}>{stat.val}</p>
                <p className="font-mono text-[10px] text-transparent group-hover:text-foreground/40 transition-colors duration-300 mt-1 pl-1 tracking-widest relative z-10">→ {stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Tags with animated progress bars */}
          <div className="p-6 md:p-8 flex flex-col justify-center gap-5">
            <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-[0.4em]">Modules</p>
            <div className="flex flex-col gap-5">
              {t.about.tags.map((tag, i) => {
                return (
                <motion.div
                  key={tag}
                  initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="group cursor-default"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <motion.span
                      className={`w-1.5 h-1.5 rounded-full bg-foreground/40 group-hover:bg-foreground flex-shrink-0 transition-colors duration-500`}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7 }}
                    />
                    <span className="font-mono text-xs text-foreground/70 group-hover:text-foreground transition-colors duration-500 uppercase tracking-widest">{tag}</span>
                  </div>
                  <div className="ml-4 h-[1px] bg-foreground/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-foreground/60 group-hover:bg-foreground transition-colors duration-500`}
                      initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                      transition={{ duration: 1.1, delay: 0.4 + i * 0.15, ease: "easeOut" }}
                      style={{ transformOrigin: "left", width: `${[88, 92, 78][i]}%` }}
                    />
                  </div>
                </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── System metrics ── */}
        <div className="relative w-full border-t border-foreground/10 grid grid-cols-3">
          {[
            { num: 50, suffix: "K+", label: lang === "EN" ? "LINES OF CODE" : "代码行数" },
            { num: 4,  suffix: "+",  label: lang === "EN" ? "YEARS BUILDING" : "年开发经验" },
            { num: 10, suffix: "+",  label: lang === "EN" ? "PROJECTS SHIPPED" : "项目上线" },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group px-6 md:px-10 py-6 md:py-8 flex flex-col gap-1 cursor-default${i < 2 ? " border-r border-foreground/10" : ""}`}
            >
              <span
                className="font-syne font-black text-3xl md:text-4xl text-foreground/80 group-hover:text-foreground transition-colors duration-500"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                <CountUp to={m.num} suffix={m.suffix} />
              </span>
              <span className="font-mono text-[10px] text-foreground/30 group-hover:text-foreground/60 transition-colors duration-500 uppercase tracking-[0.3em]">{m.label}</span>
            </motion.div>
          ))}
        </div>
        </div>
      </section>
      </div> {/* END hero-about-wrapper */}

      {/* ════════════════════════════════════
          1.8 WORKS / CINEMATIC FULL-WIDTH
      ════════════════════════════════════ */}
      <section id="works-pin-container" ref={worksContainerRef} className="relative z-10 w-full h-[100svh] overflow-hidden bg-background text-foreground">
        
        <div className="w-full h-full relative flex flex-col pt-24 md:pt-28 pb-8 md:pb-10">
          {/* Section Header */}
          <div className="w-[96%] max-w-[1920px] mx-auto mb-5 md:mb-7 flex items-center justify-between z-20 shrink-0">
            <h2 className="font-syne font-black text-xs md:text-sm uppercase tracking-[0.5em] text-foreground/50" style={{ fontFamily: "var(--font-syne)" }}>
              {t.works.title1} {t.works.title2}
            </h2>
            <span className="font-mono text-xs text-foreground/30 tracking-widest hidden md:block">{t.works.archive}</span>
          </div>

        {/* ── Project Theater (GSAP Deck Dealing) ── */}
        <div className="relative w-[96%] max-w-[1600px] flex-1 min-h-0 mx-auto perspective-[2000px]">
        
          {WORKS_META.map((wm, i) => {
            const wi = t.works.items[i];
            const isEven = i % 2 === 0;

            return (
              <div
                key={`card-${i}`}
                className="work-deck-card absolute inset-0 bg-background/95 backdrop-blur-xl border border-foreground/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] overflow-hidden"
                style={{ zIndex: 10 + i }}
              >
                {/* 顶部高光玻璃反射边缘 */}
                <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent pointer-events-none z-50 mix-blend-overlay" />
                <div className="relative w-full h-full min-h-0 flex flex-col md:flex-row group"
                  onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}>
                  
                  {/* Image Panel */}
                  <div className={`relative md:w-[56%] h-[38%] md:h-full min-h-0 overflow-hidden ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                    {/* Minimalist image presentation without heavy neon/gradient overlays */}
                    <img src={wm.img} alt={wi.title} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ objectPosition: wm.objPos || "center" }}
                    />
                    {/* Very subtle inner vignette for text legibility if needed, but keeping it clean */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20 pointer-events-none" />
                  </div>

                  {/* Text Panel */}
                  <div className={`relative md:w-[44%] flex-1 md:h-full min-h-0 flex flex-col justify-center px-7 sm:px-10 md:px-10 lg:px-12 xl:px-14 py-14 md:py-12 overflow-hidden ${isEven ? 'md:order-2' : 'md:order-1'} bg-transparent`}>
                    
                    {/* Refined minimalistic indexing */}
                    <div className="absolute top-10 flex items-center gap-4 text-foreground/40 font-mono text-[10px] tracking-[0.2em]">
                      <span>0{i + 1}</span>
                      <span className="w-8 h-[1px] bg-foreground/10" />
                      <span>0{WORKS_META.length}</span>
                    </div>

                    <span className="font-mono text-[9px] md:text-[10px] tracking-[0.18em] uppercase mb-4 md:mb-5 w-fit max-w-full px-3 py-1.5 border rounded-full text-foreground/60 border-foreground/10 break-words">
                      {wi.tag}
                    </span>
                    
                    <h3 className="font-syne font-black text-[clamp(2.15rem,5.6vw,3.75rem)] md:text-[clamp(2.3rem,3.15vw,3.55rem)] xl:text-[clamp(2.45rem,3vw,3.7rem)] leading-[1.02] mb-5 tracking-normal max-w-full whitespace-normal break-normal [overflow-wrap:normal] [word-break:keep-all] [text-wrap:balance]" style={{ fontFamily: "var(--font-syne)" }}>
                      {wi.title}
                    </h3>
                    
                    <p className="font-grotesk text-sm md:text-[15px] text-foreground/50 max-w-[38ch] leading-[1.65] mb-8 md:mb-10 break-words [overflow-wrap:anywhere]">
                      {wi.desc}
                    </p>
                    
                    {/* Modern thin-line CTA */}
                    <a href={wi.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-fit group/cta pb-1 border-b border-foreground/20 hover:border-foreground transition-colors duration-300">
                      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground/80 group-hover/cta:text-foreground transition-colors">{t.works.view}</span>
                      <svg className="transform transition-transform duration-300 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
          
        </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          2. HORIZONTAL SCROLL (Manifesto + Gallery)
      ════════════════════════════════════ */}
      <section id="gallery" ref={horizontalRef} className="relative z-10 w-full min-h-screen bg-background text-foreground">
        <div className="w-full relative" style={{ height: "500vh" }}>
          <div className="sticky top-[2vh] h-[96vh] w-[96%] left-[2%] max-w-[1920px] mx-auto overflow-hidden flex items-center bg-foreground/[0.02] backdrop-blur-[40px] border border-foreground/[0.05] rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
          
          {/* Main Horizontal Track */}
          <motion.div style={{ x: xTransform }} className="flex h-full w-[500vw] will-change-transform">
            
            {/* Panel 1: Huge Manifesto */}
            <div className="w-[100vw] h-full flex items-center justify-center px-6 md:px-24 shrink-0 relative overflow-hidden gallery-skew-item">

              {/* Parallax background geometric accent & Ambient Glow */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ scale: 0.8 }} whileInView={{ scale: 1.1 }} transition={{ duration: 3, ease: 'easeOut' }}
              >
                {/* Advanced Ambient Glow (Emotional Colors: Sapphire -> Amethyst -> Amber) */}
                <motion.div 
                  className="absolute w-[80vw] h-[40vw] md:w-[40vw] md:h-[20vw] bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FFCC70] rounded-full blur-[100px] md:blur-[140px] opacity-[0.25] mix-blend-screen will-change-transform"
                  style={{ transform: "translateZ(0)" }}
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Geometric Circle */}
                <div className="w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] border border-foreground/10 rounded-full z-10" />
              </motion.div>

              <div className="max-w-6xl w-full relative z-10">
                <h2 className="font-syne font-black text-[12vw] md:text-[5.5vw] leading-[1.1] pb-2 drop-shadow-lg" style={{ fontFamily: "var(--font-syne)" }}>
                  <ScrambleText text={t.gallery.m1} className="block text-foreground" trigger={panel1Visible} />
                  <span className="block text-foreground/30">
                    <ScrambleText text={t.gallery.m2} trigger={panel1Visible} />
                  </span>
                  <ScrambleText text={t.gallery.m3} className="block text-foreground/90 md:mt-2" trigger={panel1Visible} />
                  
                  {/* Highlight core keyword "EMOTIONS" with a high-end texture */}
                  <div className="block w-fit bg-clip-text text-transparent bg-gradient-to-r from-[#A0B0FF] via-[#D0A0FF] to-[#FFCF90] drop-shadow-sm filter brightness-125">
                    <ScrambleText text={t.gallery.m4} trigger={panel1Visible} />
                  </div>
                </h2>
              </div>
            </div>

            {/* Panels 2-5: Gallery Cards overlapping */}
            {PHOTOS.map((photo, i) => (
              <div key={i} className="gallery-skew-item w-[100vw] h-full flex items-center justify-center p-6 md:p-24 shrink-0 relative group/photo">
                {/* Background ghost text moving slightly against scroll */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ root: horizontalRef, margin: "0px", amount: "some" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-syne font-black text-[40vw] md:text-[30vw] text-foreground opacity-[0.03] select-none whitespace-nowrap z-0 pointer-events-none" 
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  {photo.num}
                </motion.div>
                
                <a 
                  href={photo.src} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="relative block w-full max-w-5xl aspect-[4/5] md:aspect-[21/9] rounded-[2rem] overflow-hidden cursor-pointer z-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-1000 hover:shadow-[0_30px_90px_rgba(0,0,0,0.6)] border border-white/10 hover:border-white/30"
                  onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
                >
                  <motion.img 
                    src={photo.src} 
                    alt={photo.title} 
                    loading="lazy" 
                    decoding="async" 
                    initial={{ scale: 1.1, filter: 'blur(10px)' }}
                    whileInView={{ scale: 1.05, filter: 'blur(0px)' }}
                    viewport={{ root: horizontalRef }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="w-full h-full object-cover grayscale-[30%] opacity-80 group-hover/photo:opacity-100 group-hover/photo:grayscale-0 transition-all duration-[1.5s] group-hover/photo:scale-100 will-change-transform" 
                  />
                  
                  {/* Overlay gradients & Data */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent transition-opacity duration-700 group-hover/photo:opacity-70 pointer-events-none" />
                  
                  <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 flex flex-col pointer-events-none">
                    <div className="overflow-hidden">
                      <motion.h3 
                        initial={{ y: "100%", opacity: 0 }} 
                        whileInView={{ y: 0, opacity: 1 }} 
                        viewport={{ root: horizontalRef, margin: "0px" }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
                        className="font-syne font-black text-3xl sm:text-4xl md:text-7xl leading-none mb-4 text-[#fafafa]/80 group-hover/photo:text-[#fafafa] transition-colors duration-500" style={{ fontFamily: "var(--font-syne)" }}>
                        {t.gallery.photos[i]}
                      </motion.h3>
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ root: horizontalRef }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="flex items-center gap-4"
                    >
                      <span className="font-mono text-xs md:text-sm text-[#fafafa]/70 group-hover/photo:text-[#fafafa] tracking-widest uppercase border border-[#fafafa]/10 px-3 py-1 bg-[#fafafa]/5 transition-colors duration-500">{photo.num}</span>
                      <span className="font-mono text-sm text-[#fafafa]/40 group-hover/photo:text-[#fafafa]/80 tracking-widest uppercase transition-colors duration-500">{photo.title}</span>
                    </motion.div>
                  </div>
                  
                  {/* Subtle Scanline strictly on image */}
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)] pointer-events-none opacity-50" />
                </a>
              </div>
            ))}
            
          </motion.div>
        </div>
        </div>
      </section>

      {/* ── MARQUEE BAND ── */}
      <div 
        className="relative z-10 py-6 overflow-hidden border-y border-foreground/10 bg-foreground/[0.01] backdrop-blur-3xl"
        style={{ 
          maskImage: 'none',
          WebkitMaskImage: 'none' 
        }}
      >
        <div className="flex whitespace-nowrap marquee-track items-center">
          {[...Array(6)].map((_, i) => (
            <span 
              key={i} 
              className="font-syne font-black text-2xl md:text-3xl tracking-[0.1em] mr-12 text-transparent uppercase select-none" 
              style={{ 
                fontFamily: "var(--font-syne)",
                WebkitTextStroke: "1px color-mix(in srgb, var(--foreground) 30%, transparent)",
                textShadow: i % 2 === 0 ? "none" : "0 0 20px color-mix(in srgb, var(--foreground) 15%, transparent)"
              }}
            >
              {i % 2 === 0 ? t.marquee : <span style={{ color: "color-mix(in srgb, var(--foreground) 80%, transparent)", WebkitTextStroke: "0px" }}>{t.marquee}</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════
          3. BENTO SYSTEM (Skills + Timeline fusion)
      ════════════════════════════════════ */}
      <section id="skills" ref={skillsRef} className="relative z-10 w-full min-h-screen bg-background text-foreground overflow-hidden py-16" style={{ perspective: "1500px" }}>
        <div id="skills-bento-grid" className="w-[96%] max-w-[1920px] mx-auto bg-foreground/[0.02] backdrop-blur-[40px] border border-foreground/[0.05] rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.2)] flex flex-col items-center py-24 px-6 md:px-12" style={{ transformStyle: "preserve-3d" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent pointer-events-none rounded-[3rem]" />
        
        <div className="w-full max-w-7xl mb-10 md:mb-16 relative z-10">
          <h2 className="font-syne font-black text-4xl sm:text-5xl md:text-8xl " style={{ fontFamily: "var(--font-syne)" }}>{t.skills.title1}<br/><span className="text-foreground">{t.skills.title2}</span></h2>
        </div>

<div className="w-full max-w-7xl flex flex-col gap-16">
          
          {/* Awwwards Style Expandable Accordion */}
          <div className="w-full h-[70vh] min-h-[500px] flex flex-col md:flex-row gap-2 md:gap-4 group/accordion">
            {SKILLS.map((skill, i) => (
              <div 
                key={i}
                className="skill-bento-piece relative flex-1 md:flex-[1] md:hover:flex-[4] transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] rounded-2xl overflow-hidden group/card cursor-pointer border border-foreground/10 hover:border-foreground/30"
                onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
              >
                <img src={skill.bg} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover grayscale-[30%] opacity-70 group-hover/card:grayscale-0 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-1000" alt={skill.name} />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-90 group-hover/card:opacity-80 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-background/40 group-hover/card:bg-transparent transition-colors duration-700" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 p-6 md:p-8 flex flex-col w-full h-full justify-end">
                  <span className="font-mono text-xs tracking-[0.3em] uppercase mb-4 opacity-100 md:opacity-0 group-hover/card:opacity-100 transform translate-y-0 md:translate-y-4 group-hover/card:translate-y-0 transition-all duration-500 delay-100 inline-block px-3 py-1 bg-foreground/5 border border-foreground/20 self-start w-auto whitespace-nowrap text-foreground/70">
                    MODULE_{String(i + 1).padStart(2, '0')}
                  </span>
                  
                  <h3 className="font-syne font-bold text-3xl md:text-5xl leading-none transition-all duration-700 whitespace-nowrap lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:bottom-24 lg:-rotate-90 lg:origin-center lg:mb-0 group-hover/card:!relative group-hover/card:!left-0 group-hover/card:!translate-x-0 group-hover/card:!bottom-0 group-hover/card:!rotate-0 group-hover/card:!mb-0" style={{ fontFamily: "var(--font-syne)", color: "var(--foreground)" }}>
                    {t.skills.items[i].split('·')[0]?.trim()}
                  </h3>
                  
                  <div className="overflow-hidden h-auto md:h-0 group-hover/card:h-[40px] md:group-hover/card:h-[60px] transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]">
                    <p className="font-mono text-sm md:text-base mt-2 md:mt-4 opacity-100 md:opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-200 whitespace-normal text-foreground/50" style={{ fontFamily: "var(--font-mono)" }}>
                      {t.skills.items[i].split('·')[1]?.trim() || t.skills.items[i]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
      <section id="guestbook" ref={guestbookRef} className="relative z-10 w-full min-h-screen bg-background text-foreground overflow-hidden py-16">
        <div className="relative w-[96%] max-w-[1920px] mx-auto bg-foreground/[0.018] backdrop-blur-xl border border-foreground/[0.07] rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.18)] overflow-hidden isolate">
          <GuestbookWall lang={lang} />
        </div>
      </section>
      </main>

      {/* ════════════════════════════════════
          4. CONTACT — Immersive Glass Hub (Curtain Reveal Footer)
      ════════════════════════════════════ */}
      <footer className="fixed bottom-0 left-0 w-full h-screen z-0 bg-background pointer-events-auto">
        <section ref={contactSectionRef} id="contact" className="relative w-full h-full flex items-center justify-center overflow-hidden">
          
          <div className="w-[98%] max-w-[1920px] mx-auto h-[92vh] rounded-[3.5rem] flex flex-col bg-background/90 backdrop-blur-xl border border-foreground/[0.08] shadow-[0_-18px_70px_rgba(0,0,0,0.25)] text-foreground relative z-10 mix-blend-normal transform-style-3d overflow-hidden">
        
        {/* Soft immersive top separator */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--foreground)]/20 to-transparent" />
        
        {/* Environmental Deep Space Lighting at bottom center - Amped up visibility & width */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vw] h-[38vh] mix-blend-screen pointer-events-none z-0 will-change-transform" 
             style={{ background: 'radial-gradient(ellipse at bottom, color-mix(in srgb, var(--foreground) 5%, transparent) 0%, color-mix(in srgb, var(--foreground) 1.5%, transparent) 45%, transparent 72%)', filter: 'blur(34px)', transform: "translateZ(0)" }} />

        {/* Section label row */}
        <div className="w-full px-6 md:px-12 py-5 flex items-center justify-between relative z-10">
          <span className="font-mono text-[10px] text-neutral-500 tracking-[0.6em] uppercase">{t.contact.sub}</span>
          <span className="font-mono text-[10px] text-foreground/20 tracking-widest">§ FIN</span>
        </div>

        {/* Giant headline & HUB */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 lg:px-20 py-16 relative z-10">
          
          <motion.h2
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
            className="font-syne font-black leading-[0.9] text-center mb-24 cursor-default group relative overflow-hidden"
            style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(3.5rem, 12vw, 11rem)", x: contactHeadX, y: contactHeadY, opacity: contactHeadOpacity }}
          >
            <span className="text-foreground block tracking-tighter transition-colors duration-700 group-hover:text-foreground relative z-10">{t.contact.t1}</span>
            <span className="relative block tracking-tighter z-10">
              <span className="text-transparent bg-clip-text transition-all duration-700 block"
                    style={{ 
                      backgroundImage: "linear-gradient(135deg, var(--foreground) 0%, color-mix(in srgb, var(--foreground) 40%, transparent) 50%, color-mix(in srgb, var(--foreground) 10%, transparent) 100%)",
                      WebkitTextFillColor: "transparent",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text"
                    }}>
                {t.contact.t2}
              </span>
              <span className="absolute inset-0 z-20 text-transparent bg-clip-text pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[length:200%_100%] animate-shimmer block"
                    style={{
                      backgroundImage: "linear-gradient(90deg, transparent 0%, transparent 40%, color-mix(in srgb, var(--foreground) 90%, transparent) 50%, transparent 60%, transparent 100%)",
                      WebkitTextFillColor: "transparent",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text"
                    }}>
                {t.contact.t2}
              </span>
            </span>
          </motion.h2>

          {/* Liquid Glass Contact Container */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--background) 82%, transparent) 0%, color-mix(in srgb, var(--foreground) 4%, transparent) 100%)`,
              border: `1px solid color-mix(in srgb, var(--foreground) 10%, transparent)`,
              backdropFilter: "blur(18px) saturate(130%)",
              WebkitBackdropFilter: "blur(18px) saturate(130%)",
              boxShadow: `0 24px 54px -18px color-mix(in srgb, var(--foreground) 24%, transparent), inset 0 1px 1px color-mix(in srgb, var(--foreground) 14%, transparent)`,
            }}
          >
            {/* Inner top highlight line for glass thickness */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center">
              
              {/* Left: Email Primary */}
              <div className="flex flex-col gap-6 min-w-0">
                <span className="font-mono text-[10px] text-foreground/30 tracking-[0.3em] uppercase block">{t.contact.channel}</span>
                <MagneticButton
                  href="mailto:123kevinlio@gmail.com"
                  className="group flex flex-nowrap items-center gap-3 sm:gap-4 text-sm sm:text-lg lg:text-xl text-foreground/90 hover:text-foreground transition-all duration-300 w-full whitespace-nowrap"
                  style={{ fontFamily: "var(--font-mono)", flexWrap: "nowrap" }}
                >
                  <span className="border-b border-foreground/20 group-hover:border-foreground/60 pb-1 transition-colors duration-500 truncate inline-block flex-1 min-w-0">123KEVINLIO@GMAIL.COM</span>
                  <div className="relative shrink-0 w-8 h-8 rounded-full border border-foreground/10 flex items-center justify-center bg-foreground/5 group-hover:scale-110 group-hover:bg-foreground transition-all duration-500">
                    <svg className="w-4 h-4 text-foreground group-hover:text-background transition-colors duration-500 rotate-45 group-hover:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </div>
                </MagneticButton>
              </div>

              {/* Right: Socials */}
              <div className="flex flex-col gap-6 md:pl-12 md:border-l md:border-foreground/5">
                <span className="font-mono text-[10px] text-foreground/30 tracking-[0.3em] uppercase block">{t.contact.networks}</span>
                <div className="flex flex-col gap-4">
                  {[
                    { name: 'Github',    url: 'https://github.com/treehey' },
                    { name: 'Instagram', url: 'https://www.instagram.com/tree_hey/' },
                    { name: 'Facebook',  url: 'https://www.facebook.com/chihei.lio' },
                  ].map((link, li) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                      transition={{ delay: 0.2 + li * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <MagneticButton
                        href={link.url} target="_blank" rel="noopener noreferrer"
                        className="group flex items-center justify-between py-2 text-foreground/50 hover:text-foreground transition-colors duration-500"
                      >
                        <span className="font-syne font-semibold text-lg tracking-wide">{link.name}</span>
                        <span className="font-mono text-[10px] tracking-widest opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">↗ OPEN</span>
                      </MagneticButton>
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        </div>

        {/* Footer strip - Cleaned up to max minimalism */}
        <div className="w-full mt-auto border-t border-foreground/5 px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 text-center">
          <span className="font-mono text-[9px] text-foreground/20 tracking-[0.2em] uppercase">© 2026 TREE HEY. ALL RIGHTS RESERVED.</span>
          <span className="font-mono text-[9px] text-foreground/20 tracking-[0.2em] uppercase">CRAFTED WITH NEXT.JS & FRAMER MOTION.</span>
        </div>
        </div>
        </section>
      </footer>

      {/* ── Scroll velocity motion blur overlay ── */}
      <div ref={blurOverlayRef} className="fixed inset-0 z-[3] pointer-events-none"
        style={{ backdropFilter: 'blur(0px)', transition: 'backdrop-filter 0.14s ease-out' }} />

      {/* ── Minecraft dirt background overlay ── */}
      {minecraftMode && (
        <div className="fixed inset-0 z-0 pointer-events-none mc-exempt" style={{
          backgroundImage: `url(${MC}/dirt.png)`,
          backgroundRepeat: 'repeat',
          backgroundSize: '64px 64px',
          imageRendering: 'pixelated',
          opacity: 0.18,
        }} />
      )}

      {/* ── Minecraft HUD ── */}
      <AnimatePresence>
        {minecraftMode && <MinecraftHUD key="mc-hud" onExit={exitMinecraft} />}
      </AnimatePresence>

      {/* ── Nether Portal Transition ── */}
      <AnimatePresence>
        {mcPortal && (
          <motion.div
            key="mc-portal"
            className="fixed inset-0 z-[999] pointer-events-none mc-exempt"
            style={{
              backgroundImage: `url(${MC}/nether-portal.png)`,
              backgroundRepeat: 'repeat',
              backgroundSize: '64px 64px',
              imageRendering: 'pixelated',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.92, 0.65, 0.92, 0] }}
            transition={{ duration: 1.0, times: [0, 0.2, 0.5, 0.8, 1], ease: 'linear' }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}





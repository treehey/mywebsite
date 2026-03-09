"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  AnimatePresence,
  type Variants,
} from "framer-motion";

/* ════════════════════════════════════════════════════════
   TEXT SCRAMBLE HOOK
════════════════════════════════════════════════════════ */
function useScramble(text: string, trigger: boolean) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!trigger) return;
    const CHARS = "0123456789ABCDEFabcdef#@%!?/|\\[]{}~<>^*";
    let frame = 0;
    const total = text.length * 3;
    let raf: number;
    const update = () => {
      setDisplay(
        text.split("").map((ch, i) => {
          if (ch === " ") return " ";
          if (frame >= i * 3) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("")
      );
      frame++;
      if (frame <= total) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [trigger, text]);
  return display;
}

function ScrambleText({ text, className, margin = "-100px" }: { text: string; className?: string; margin?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // @ts-ignore
  const inView = useInView(ref, { once: true, margin });
  const display = useScramble(text, inView);
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
    nav: { about: 'About', works: 'Works', gallery: 'Gallery', skills: 'Skills', timeline: 'Timeline', contact: 'Contact' },
    hero: { desc: "Operating from NJU. Engineering robust software architectures and crafting immersive digital experiences.", loc: "Location", locVal: "Macau → Nanjing", foc: "Focus", focVal: "Full-Stack / Creative Dev" },
    about: { sub: "About.exe", title1: "Behind the", title2: "Screen.", p1: "My journey into software engineering didn't start with standard syntax—it began with Redstone in Minecraft. Building virtual logic arrays slowly evolved into writing robust backend frameworks, ultimately leading to architecting expansive modern internet systems.", p2: "Currently operating out of NJU, I thrive at the intersection of logical engineering and raw aesthetic emotion. Photography teaches me about composition and light, while code gives me the tools to build and manipulate entire digital worlds.", tags: ["FULL-STACK WEB", "SYSTEM ARCH", "PHOTOGRAPHY"] },
    works: { title1: "SELECTED", title2: "WORKS.", archive: "v2.0 // Archive", view: "VIEW PROJECT", items: [ { title: "DaysMatter", desc: "A modern, minimalist countdown dashboard built with React components and dynamic themes.", tag: "WEB APP" }, { title: "Random Draw Core", desc: "Interactive probability visualization module with custom animation physics.", tag: "ALGORITHM / UX" } ] },
    gallery: { m1: "I DON'T JUST", m2: "WRITE CODE.", m3: "I ENGINEER", m4: "EMOTIONS.", photos: [ "Mong Kok · Neon & Dust", "Lujiazui · Urban Spine", "Love Post Office · Letter", "Panda · Gentle Power" ] },
    skills: { title1: "SYSTEM", title2: "OVERVIEW", items: [ "Algorithms · Automation", "Full-Stack · Motion", "Database · Cloud", "Photography · Post", "Server · CLI / Linux" ] },
    timeline: { title: "Runtime Logs", items: [ { label: "Minecraft", detail: "Redstone & Logical Gates" }, { label: "Python/Algos", detail: "Macau Python Competition Top 5" }, { label: "Office Master", detail: "Macau Office Software Competition 3rd" }, { label: "STEAM & IoT", detail: "STEAM & IoT Competition 2nd Place" }, { label: "Web Tech", detail: "Macau Web Design Competition 2nd" }, { label: "NJU", detail: "Nanjing University Software Eng." } ] },
    contact: { sub: "Connect.exe", t1: "INITIATE", t2: "HANDSHAKE." },
    marquee: "SOFTWARE ENGINEERING — CREATIVE CODING — SIGNAL & NOISE — "
  },
  '简': {
    nav: { about: '关于', works: '项目', gallery: '画廊', skills: '技能', timeline: '日志', contact: '联系' },
    hero: { desc: "坐标南京大学（NJU）。致力于构建可靠的软件架构与沉浸式的现代数字交互体验。", loc: "位置", locVal: "澳门 → 南京", foc: "专注", focVal: "软件工程 / 创意编程" },
    about: { sub: "关于.exe", title1: "屏幕", title2: "背后。", p1: "我的软件工程之旅并非始于标准语法——而是从 Minecraft 的红石电路开始。搭建早期的虚拟逻辑门逐渐演变为编写稳健的后端框架，最终将我引向了构建广阔的现代全栈架构与互联网系统。", p2: "目前坐标南京大学，我游走于严谨的系统抽象与纯粹的视觉交互交汇处。摄影教会我何为构图与光影，而代码则赋予我构筑世界、操控数据的纯粹力量。", tags: ["全栈架构设计", "现代前端工程", "摄影与视觉表达"] },
    works: { title1: "精选", title2: "项目。", archive: "v2.0 // 归档", view: "查看项目", items: [ { title: "倒数日 DaysMatter", desc: "使用React组件与动态主题构建的现代极简倒数仪表盘面板。", tag: "WEB 应用 / 交互" }, { title: "随机抽签核心", desc: "具备自定义动画物理效果的交互式概率可视化模块。", tag: "算法 / 体验架构" } ] },
    gallery: { m1: "我不仅仅", m2: "编写代码。", m3: "我更在", m4: "编织情绪。", photos: [ "旺角 · 霓虹与尘埃", "陆家嘴 · 城市脊梁", "爱情邮局 · 一纸情书", "大熊猫 · 温柔力量" ] },
    skills: { title1: "系统", title2: "概览", items: [ "算法构建 · 自动化", "全栈框架 · 现代流", "数据库 · 云端服务", "纪实摄影 · 后期色感", "Linux 服务器 · 终端" ] },
    timeline: { title: "运行日志", items: [ { label: "逻辑启蒙", detail: "Minecraft 红石机械与指令实验" }, { label: "初试代码", detail: "Python解难赛全澳 Top 5" }, { label: "效率先锋", detail: "Office技能比赛全澳季军" }, { label: "硬核创客", detail: "STEAM及IoT创意解难赛全澳亚军" }, { label: "前端构建", detail: "手机网页技术比赛亚军及独立程序开发" }, { label: "南京大学", detail: "软件工程本科深造新篇章" } ] },
    contact: { sub: "连接.exe", t1: "传输", t2: "信号。" },
    marquee: "现代软件工程 — 创意编程与体验架构 — 信号与噪声 — "
  },
  '繁': {
    nav: { about: '關於', works: '項目', gallery: '畫廊', skills: '技能', timeline: '日誌', contact: '聯繫' },
    hero: { desc: "座標南京大學（NJU）。致力於構建可靠的軟件架構與沉浸式的現代數字交互體驗。", loc: "位置", locVal: "澳門 → 南京", foc: "專注", focVal: "軟件工程 / 創意編程" },
    about: { sub: "關於.exe", title1: "屏幕", title2: "背後。", p1: "我的軟件工程之旅並非始於標準語法——而是從 Minecraft 的紅石電路開始。搭建早期的虛擬邏輯門逐漸演變為編寫穩健的後端框架，最終將我引向了構建廣闊的現代全棧架構與互聯網系統。", p2: "目前座標南京大學，我遊走於嚴謹的系統抽象與純粹的視覺交互交匯處。攝影教會我何為構圖與光影，而代碼則賦予我構築世界、操控數據的純粹力量。", tags: ["全棧架構設計", "現代前端工程", "攝影與視覺表達"] },
    works: { title1: "精選", title2: "項目。", archive: "v2.0 // 歸檔", view: "查看項目", items: [ { title: "倒數日 DaysMatter", desc: "使用React組件與動態主題構建的現代極簡倒數儀表盤面板。", tag: "WEB 應用 / 交互" }, { title: "隨機抽籤核心", desc: "具備自定義動畫物理效果的交互式概率可視化模塊。", tag: "算法 / 體驗架構" } ] },
    gallery: { m1: "我不僅僅", m2: "編寫代碼。", m3: "我更在", m4: "編織情緒。", photos: [ "旺角 · 霓虹與塵埃", "陸家嘴 · 城市脊梁", "愛情郵局 · 一紙情書", "大熊貓 · 溫柔力量" ] },
    skills: { title1: "系統", title2: "概覽", items: [ "算法構建 · 自動化", "全棧框架 · 現代流", "數據庫 · 雲端服務", "紀實攝影 · 後期色感", "Linux 服務器 · 終端" ] },
    timeline: { title: "運行日誌", items: [ { label: "邏輯啟蒙", detail: "Minecraft 紅石機械與指令實驗" }, { label: "初試代碼", detail: "Python解難賽全澳 Top 5" }, { label: "效率先鋒", detail: "Office技能比賽全澳季軍" }, { label: "硬核創客", detail: "STEAM及IoT創意解難賽全澳亞軍" }, { label: "前端構建", detail: "手機網頁技術比賽亞軍及獨立程序開發" }, { label: "南京大學", detail: "軟件工程本科深造新篇章" } ] },
    contact: { sub: "連接.exe", t1: "傳輸", t2: "信號。" },
    marquee: "現代軟件工程 — 創意編程與體驗架構 — 信號與噪聲 — "
  }
};

const PHOTOS = [
  { src: "/images/HK.jpg",       title: "HONG KONG", num: "01" },
  { src: "/images/shanghai.jpg", title: "SHANGHAI",   num: "02" },
  { src: "/images/zhuhai.jpg",   title: "ZHUHAI",     num: "03" },
  { src: "/images/panda.jpg",    title: "SICHUAN",    num: "04" },
];

const SKILLS = [
  { name: "Algorithms",   accent: "#00F5FF", bg: "/images/1.jpg" },
  { name: "Web Dev",      accent: "#FF2D78", bg: "/images/2.jpg" },
  { name: "Architecture", accent: "#39FF14", bg: "/images/3.jpg" },
  { name: "Photography",  accent: "#F5C542", bg: "/images/HK.jpg" },
  { name: "Sys/Linux",    accent: "#B200FF", bg: "/images/shanghai.jpg" },
];

const TIMELINE = [
    { year: "2012", img: "/images/about/Minecraft.jfif" },
    { year: "2021", img: "/images/about/python.jpeg" },
    { year: "2022", img: "/images/about/ppt.jpg" },
    { year: "2022", img: "/images/about/steam&iot.jpg" },
    { year: "2023", img: "/images/about/information-technology.jpg" },
    { year: "2024", img: "/images/about/nju.jpg" },
  ];

function HorizontalTimeline({ t, setCursorBig, TIMELINE }: { t: any, setCursorBig: (v: boolean) => void, TIMELINE: any[] }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  // Mobile layout adjustment handling can be added, but for simple robust implementation, 
  // horizontal sticky scroll effect is great for desktop. On mobile, we might just stack them.
  // For supreme smoothness, let's keep horizontal scroll for all.
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(TIMELINE.length - 1) * 100}vw`]);

  return (
    <section id="timeline" ref={targetRef} className="relative bg-[#07070F]" style={{ height: `${TIMELINE.length * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex h-full">
          {TIMELINE.map((node, i) => (
            <div key={i} className="w-screen h-screen flex items-center justify-center p-6 md:p-24 flex-shrink-0 relative">
              
              {/* Background Ambient Image */}
              <div className="absolute inset-0 w-full h-full opacity-[0.10]">
                <img src={node.img} className="w-full h-full object-cover blur-[8px]" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#07070F] via-transparent to-[#07070F]" />
                <div className="absolute inset-0 bg-[#07070F]/80" />
              </div>
              
              <div className="relative z-10 w-full max-w-7xl flex flex-col-reverse md:flex-row items-center gap-10 md:gap-20">
                {/* Text Content */}
                <div className="flex-1 flex flex-col items-start w-full z-10">
                  <motion.span 
                    initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    className="font-mono text-[60px] md:text-[140px] lg:text-[180px] font-black text-transparent leading-none" 
                    style={{ WebkitTextStroke: "2px rgba(0, 245, 255, 0.4)" }}
                  >
                    {node.year}
                  </motion.span>
                  <motion.h3 
                    initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-syne text-3xl md:text-5xl lg:text-7xl text-[#E2E2EC] font-bold mt-[-1rem] md:mt-[-3rem] mb-4 md:mb-6"
                    style={{ fontFamily: "var(--font-syne)" }}
                  >
                    {t.timeline.items[i].label}
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
                    className="font-mono text-sm md:text-xl lg:text-2xl text-[#E2E2EC]/70 max-w-lg leading-relaxed mix-blend-difference md:mix-blend-normal"
                  >
                    {t.timeline.items[i].detail}
                  </motion.p>
                  
                  <motion.div 
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-6 md:mt-8 font-mono text-[#00F5FF] text-[10px] md:text-sm tracking-[0.3em] uppercase border border-[#00F5FF]/30 bg-[#00F5FF]/10 px-4 py-2 rounded-full box-glow-cyan"
                  >
                    Milestone_{String(i + 1).padStart(2, '0')} // Logging
                  </motion.div>
                </div>
                
                {/* Floating Image Gallery */}
                <div className="flex-1 w-[80%] md:w-full flex justify-center items-center">
                   <div 
                     className="w-full max-w-[300px] md:max-w-[450px] lg:max-w-[550px] aspect-[4/5] object-cover rounded-2xl overflow-hidden relative group/timeline-img border border-[#E2E2EC]/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                     onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
                   >
                     <img src={node.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover/timeline-img:scale-110 grayscale-[60%] group-hover/timeline-img:grayscale-0" alt="" />
                     
                     {/* Cyberpunk Scanline */}
                     <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,245,255,0.05)_50%)] bg-[length:100%_4px] pointer-events-none" />
                     
                     <div className="absolute inset-0 bg-[#00F5FF]/10 mix-blend-overlay opacity-0 group-hover/timeline-img:opacity-100 transition-opacity duration-700 pointer-events-none" />
                   </div>
                </div>
              </div>

            </div>
          ))}
        </motion.div>
        
        {/* Global Progress Bar */}
        <div className="absolute bottom-6 md:bottom-12 left-6 right-6 md:left-24 md:right-24 h-1 bg-[#E2E2EC]/10 rounded-full overflow-hidden z-20">
           <motion.div className="h-full bg-[#00F5FF] box-glow-cyan" style={{ scaleX: scrollYProgress, transformOrigin: "0% 50%" }} />
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

  const HERO_CHARS = "TREE HEY".split("");

  return (
    <main ref={containerRef} className="relative w-full bg-[#07070F] text-[#E2E2EC]">
      <div id="top" className="absolute top-0" />
      
      {/* ───── NAV PILL ───── */}
      <header className="fixed bottom-6 md:bottom-auto md:top-6 left-1/2 -translate-x-1/2 z-[990] flex items-center px-4 md:px-7 py-3 rounded-full bg-[#0E0E1C]/80 backdrop-blur-2xl border border-[#00F5FF]/15 transition-all w-[90vw] md:w-auto justify-between md:justify-center">
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)} className="font-syne font-bold text-lg text-[#00F5FF] glow-cyan tracking-widest md:mr-6 hover:scale-110 transition-transform cursor-pointer" style={{ fontFamily: "var(--font-syne)" }}>TH</a>
        
        {/* Mobile Navigation hidden under a toggle, or just show icons? Let's just show text links but smaller on mobile */}
        <nav className="flex gap-3 md:gap-7 font-grotesk text-[9px] md:text-[11px] uppercase tracking-widest text-[#E2E2EC]/45">
          {[
            { id: 'about', label: t.nav.about },
            { id: 'works', label: t.nav.works },
            { id: 'gallery', label: t.nav.gallery },
            { id: 'skills', label: t.nav.skills },
            { id: 'timeline', label: t.nav.timeline },
            { id: 'contact', label: t.nav.contact },
          ].map(item => (
            <a key={item.id} href={`#${item.id}`}
              onClick={(e) => { 
                e.preventDefault(); 
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }); 
              }}
              className={`transition-colors duration-300 ${activeSection === item.id ? 'text-[#00F5FF] font-bold drop-shadow-[0_0_8px_rgba(0,245,255,0.8)] scale-110' : 'hover:text-[#00F5FF]'}`}
              onMouseEnter={() => setCursorBig(true)}
              onMouseLeave={() => setCursorBig(false)}
            >{item.label}</a>
          ))}
        </nav>

        {/* TOGGLES */}
        <div className="flex items-center gap-2 md:gap-4 border-l border-[#E2E2EC]/20 pl-3 md:pl-6 ml-3 md:ml-6">
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
                  className="absolute right-0 md:right-1/2 md:translate-x-1/2 bottom-[140%] md:bottom-auto md:top-[140%] flex flex-col bg-[#0E0E1C]/95 backdrop-blur-2xl border border-[#00F5FF]/20 rounded-xl p-2 min-w-[110px] shadow-[0_0_30px_rgba(0,245,255,0.1)] origin-bottom-right md:origin-top"
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
      <section className="relative z-10 w-full h-screen flex flex-col items-center justify-center overflow-hidden scanlines">
        {/* Animated Cyber Grid */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="cyber-grid" />
           <div className="cyber-grid-overlay" />
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
              className="flex flex-wrap gap-0 relative leading-[0.85] justify-center"
              animate={{ x: mDelta.x * 30, y: mDelta.y * 30 }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.5 }}
              onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
            >
              {HERO_CHARS.map((ch, i) => (
                <div key={i} className="relative inline-block overflow-visible group">
                  <motion.span className="rgb-r font-syne font-black select-none text-[15vw] md:text-[13rem] z-0 group-hover:text-[#00F5FF] transition-colors" 
                    style={{ fontFamily: "var(--font-syne)", transform: `translate(${mDelta.x * -15}px, ${mDelta.y * -15}px)` }}>
                    {ch === " " ? "\u00A0" : ch}
                  </motion.span>
                  <motion.span className="rgb-b font-syne font-black select-none text-[15vw] md:text-[13rem] z-0 group-hover:text-[#FF2D78] transition-colors" 
                    style={{ fontFamily: "var(--font-syne)", transform: `translate(${mDelta.x * 15}px, ${mDelta.y * 15}px)` }}>
                    {ch === " " ? "\u00A0" : ch}
                  </motion.span>
                  <span className="relative z-10 font-syne font-black text-[15vw] md:text-[13rem] text-[#E2E2EC] group-hover:opacity-0 transition-opacity duration-300 drop-shadow-[0_0_20px_rgba(226,226,236,0.3)]" 
                    style={{ fontFamily: "var(--font-syne)" }}>
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1.2 }}
            className="mt-16 md:mt-24 flex flex-col md:flex-row gap-6 md:gap-24 w-full max-w-4xl border-t border-[#00F5FF]/20 pt-8 relative before:absolute before:top-[-2px] before:left-0 before:w-16 before:h-[2px] before:bg-[#00F5FF] before:shadow-[0_0_10px_#00F5FF]"
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
      </section>

      {/* ════════════════════════════════════
          1.5 ABOUT / GENESIS
      ════════════════════════════════════ */}
      <section id="about" className="relative z-10 w-full py-24 md:py-32 px-6 md:px-12 bg-[#07070F] overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-[#00F5FF]/5 blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2 relative"
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
          >
            {/* Holographic Collage */}
            <div className="relative w-full aspect-[4/5] md:aspect-square flex items-center justify-center pointer-events-none md:pointer-events-auto">
              
              {/* Main prominent image */}
              <motion.div 
                className="absolute w-[65%] h-[75%] z-20 left-[15%] top-[10%] rounded-2xl overflow-hidden border border-[#00F5FF]/30 shadow-[0_0_50px_rgba(0,245,255,0.15)] group"
                whileHover={{ scale: 1.05, zIndex: 30 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                 <img src="/images/about/Minecraft.jfif" alt="Minecraft Origin" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] to-transparent opacity-60 pointer-events-none" />
                 <div className="absolute bottom-4 left-4">
                    <p className="font-mono text-[#00F5FF] text-[10px] uppercase tracking-[0.3em] bg-[#00F5FF]/10 px-2 py-1 rounded backdrop-blur-md border border-[#00F5FF]/20">Origin</p>
                 </div>
              </motion.div>
              
              {/* Secondary image top right */}
              <motion.div 
                className="absolute w-[45%] h-[45%] z-10 right-[5%] top-0 rounded-2xl overflow-hidden border border-[#39FF14]/30 shadow-[0_0_30px_rgba(57,255,20,0.1)] group"
                whileHover={{ scale: 1.1, zIndex: 30 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                 <img src="/images/about/nju.jpg" alt="NJU" className="w-full h-full object-cover grayscale-[70%] group-hover:grayscale-0 transition-all duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] to-transparent opacity-50 pointer-events-none" />
                 <div className="absolute top-4 right-4">
                    <p className="font-mono text-[#39FF14] text-[10px] uppercase tracking-[0.3em] bg-[#39FF14]/10 px-2 py-1 rounded backdrop-blur-md border border-[#39FF14]/20">Present</p>
                 </div>
              </motion.div>
              
              {/* Tertiary image bottom left */}
              <motion.div 
                className="absolute w-[50%] h-[40%] z-10 left-[5%] bottom-[5%] rounded-2xl overflow-hidden border border-[#FF2D78]/30 shadow-[0_0_30px_rgba(255,45,120,0.1)] group"
                whileHover={{ scale: 1.1, zIndex: 30 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                 <img src="/images/about/steam&iot.jpg" alt="Steam" className="w-full h-full object-cover grayscale-[80%] group-hover:grayscale-0 transition-all duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] to-transparent opacity-60 pointer-events-none" />
                 <div className="absolute bottom-4 left-4">
                    <p className="font-mono text-[#FF2D78] text-[10px] uppercase tracking-[0.3em] bg-[#FF2D78]/10 px-2 py-1 rounded backdrop-blur-md border border-[#FF2D78]/20">Journey</p>
                 </div>
              </motion.div>

            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-1/2 flex flex-col gap-8 relative z-10"
          >
            <div className="flex items-center gap-4 mb-4">
               <div className="w-8 h-[1px] bg-[#39FF14]" />
               <span className="font-mono text-xs uppercase tracking-[0.4em] text-[#39FF14]">{t.about.sub}</span>
            </div>

            <h2 className="font-syne font-black text-4xl md:text-6xl uppercase leading-[1.1]">
              {t.about.title1} <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5FF] to-[#39FF14]">{t.about.title2}</span>
            </h2>
            
            <div className="flex flex-col gap-6 font-grotesk text-[#E2E2EC]/60 text-base md:text-lg leading-relaxed">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4">
              {t.about.tags.map(tag => (
                <div key={tag} className="px-4 py-2 border border-[#E2E2EC]/10 rounded-full font-mono text-xs text-[#E2E2EC]/50 hover:border-[#00F5FF] hover:text-[#00F5FF] transition-colors cursor-default bg-[#E2E2EC]/[0.02]">
                  {tag}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════
          1.8 WORKS / PROJECTS
      ════════════════════════════════════ */}
      <section id="works" className="relative z-10 w-full py-24 md:py-32 px-6 md:px-12 bg-[#0A0A14] border-t border-[#E2E2EC]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12 md:mb-20">
            <h2 className="font-syne font-black text-5xl md:text-7xl leading-[0.9]">
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#FF2D78,#00F5FF)" }}>{t.works.title1}</span><br/>{t.works.title2}
            </h2>
            <span className="font-mono text-sm text-[#E2E2EC]/30 tracking-widest hidden md:block border-b border-[#E2E2EC]/20 pb-2">{t.works.archive}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {[
              { ...t.works.items[0], img: "/images/daysmatter.png" },
              { ...t.works.items[1], img: "/images/random-draw.png" },
            ].map((work, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 50 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ duration: 0.6, delay: i * 0.2 }}
                 className="group cursor-pointer"
                 onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
               >
                 <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative neon-card mb-6">
                   <img src={work.img} alt={work.title} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 origin-center" />
                   {/* Tech Overlay */}
                   <div className="absolute inset-0 bg-[#07070F]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm">
                     <span className="font-mono text-[#00F5FF] text-sm tracking-widest uppercase border border-[#00F5FF]/50 px-6 py-3 rounded-full translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                       {t.works.view}
                     </span>
                   </div>
                   <div className="absolute top-4 left-4">
                     <span className="font-mono text-[10px] bg-[#07070F]/80 text-[#E2E2EC]/80 px-3 py-1 rounded backdrop-blur-md border border-[#E2E2EC]/10">
                       {work.tag}
                     </span>
                   </div>
                 </div>
                 
                 <div className="flex justify-between items-start">
                   <div className="max-w-[80%]">
                     <h3 className="font-syne font-bold text-2xl md:text-3xl text-[#E2E2EC] group-hover:text-[#00F5FF] transition-colors">{work.title}</h3>
                     <p className="font-grotesk text-sm md:text-base text-[#E2E2EC]/50 mt-3">{work.desc}</p>
                   </div>
                   <div className="w-12 h-12 rounded-full border border-[#E2E2EC]/20 flex items-center justify-center group-hover:bg-[#00F5FF] group-hover:border-[#00F5FF] group-hover:text-[#07070F] transition-all shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                   </div>
                 </div>
               </motion.div>
            ))}
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
                <h2 className="font-syne font-black text-[12vw] md:text-[7vw] leading-[0.9] text-[#E2E2EC]" style={{ fontFamily: "var(--font-syne)" }}>
                  <ScrambleText text={t.gallery.m1} className="block" />
                  <span className="block text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#00F5FF,#FF2D78)" }}>
                    <ScrambleText text={t.gallery.m2} margin="0px" />
                  </span>
                  <ScrambleText text={t.gallery.m3} className="block" margin="0px" />
                  <ScrambleText text={t.gallery.m4} className="block text-[#39FF14]" margin="0px" />
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
                  <img src={photo.src} alt={photo.title} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" />
                  
                  {/* Overlay gradients & Data */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] via-transparent to-transparent opacity-90" />
                  
                  <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 flex flex-col">
                    <div className="overflow-hidden">
                      <motion.h3 
                        initial={{ y: "100%" }} whileInView={{ y: 0 }} transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                        className="font-syne font-black text-4xl md:text-7xl text-[#E2E2EC] leading-none mb-2" style={{ fontFamily: "var(--font-syne)" }}>
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
          <h2 className="font-syne font-black text-5xl md:text-8xl text-[#E2E2EC]" style={{ fontFamily: "var(--font-syne)" }}>{t.skills.title1}<br/><span className="text-[#00F5FF]">{t.skills.title2}</span></h2>
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
                <img src={skill.bg} className="absolute inset-0 w-full h-full object-cover grayscale-[80%] group-hover/card:grayscale-0 group-hover/card:scale-110 transition-all duration-1000" alt={skill.name} />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] via-[#07070F]/50 to-transparent opacity-90 group-hover/card:opacity-60 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-[#07070F]/40 group-hover/card:bg-transparent transition-colors duration-700" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 p-6 md:p-8 flex flex-col w-full h-full justify-end">
                  <span className="font-mono text-xs tracking-[0.3em] uppercase mb-4 opacity-100 md:opacity-0 group-hover/card:opacity-100 transform translate-y-0 md:translate-y-4 group-hover/card:translate-y-0 transition-all duration-500 delay-100 box-glow-cyan inline-block px-3 py-1 bg-[#00F5FF]/10 border border-[#00F5FF]/20 self-start w-auto whitespace-nowrap" style={{ color: skill.accent, borderColor: skill.accent }}>
                    MODULE_{String(i + 1).padStart(2, '0')}
                  </span>
                  
                  <h3 className="font-syne font-bold text-3xl md:text-5xl leading-none transition-all duration-700 whitespace-nowrap lg:absolute md:bottom-8 lg:-rotate-90 lg:origin-left group-hover/card:rotate-0 lg:translate-x-4 lg:mb-8 group-hover/card:translate-x-0 group-hover/card:mb-0 lg:translate-y-[-50px] group-hover/card:relative group-hover/card:translate-y-0" style={{ fontFamily: "var(--font-syne)", color: "#E2E2EC" }}>
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
      <HorizontalTimeline t={t} setCursorBig={setCursorBig} TIMELINE={TIMELINE} />

      {/* ════════════════════════════════════
          4. CONTACT (Massive Input Terminal)
      ════════════════════════════════════ */}
      <section id="contact" className="relative z-10 min-h-screen flex flex-col justify-end py-20 px-6 md:px-12 bg-[#0A0A14] border-t border-[#E2E2EC]/10">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
          <div className="font-mono text-sm text-[#00F5FF] tracking-[0.4em] uppercase">{t.contact.sub}</div>
          
          <h2 
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
            className="font-syne font-black text-[12vw] leading-[0.8] text-[#E2E2EC] w-full break-words hover:text-[#00F5FF] transition-colors duration-500 cursor-pointer" 
            style={{ fontFamily: "var(--font-syne)" }}>
            {t.contact.t1}
            <br />
            <span className="text-transparent" style={{ WebkitTextStroke: "2px #E2E2EC" }}>{t.contact.t2}</span>
          </h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-20 gap-8">
            <MagneticButton 
              href="mailto:treehey@example.com" 
              className="font-mono text-lg md:text-2xl border-b border-[#00F5FF] pb-2 text-[#00F5FF] hover:bg-[#00F5FF] hover:text-[#07070F] transition-all inline-block px-4 pt-4" 
              style={{ fontFamily: "var(--font-mono)" }}
            >
              TREEHEY@NJU.EDU.CN {`->`}
            </MagneticButton>

            <div className="flex flex-wrap gap-4 md:gap-8 font-mono text-sm uppercase tracking-widest text-[#E2E2EC]/50">
              {['Github', 'Instagram', 'WeChat'].map(link => (
                <MagneticButton key={link} href="#" className="hover:text-[#39FF14] transition-colors p-2">{link}</MagneticButton>
              ))}
            </div>
          </div>
        </div>
      </section>
      
    </main>
  );
}



"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Copy,
  Globe2,
  Menu,
  Send,
  Shuffle,
  X,
} from "lucide-react";
import {
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import styles from "./FieldNotebook.module.css";
import { supabase, type GuestEntry } from "@/lib/supabase";
import { globalLenis } from "../SmoothScroll";

const B = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Language = "简" | "繁" | "EN";

const navItems = ["fragments", "experiments", "lens", "playground", "guestbook"] as const;
const chapterItems = ["poster", ...navItems, "index", "last-page"] as const;

const COPY = {
  "简": {
    nav: {
      fragments: ["Fragments", "碎片"],
      experiments: ["Experiments", "实验"],
      lens: ["Lens", "镜头"],
      playground: ["Playground", "游乐场"],
      guestbook: ["Guestbook", "留言簿"],
    },
    poster: {
      title: "生活现场笔记",
      intro: "用好奇心，构建有趣的东西。",
      sub: "设计与构建\n好玩又有用的东西。",
      note: "构建\n玩耍\n观察\n分享",
      scroll: "向下探索",
    },
    fragments: {
      eyebrow: "碎片、实验、与视角",
      title: ["碎片，", "实验，", "与镜头。"],
      copy: "这里是我捕捉思绪、记录实验、探索视角，并打造小世界的地方。",
      link: "探索笔记",
    },
    experiments: {
      kicker: "Experiments",
      title: "实验现场",
      copy: "想法的展墙，视觉的实验场。每一件都从真实的问题开始。",
      notes: [
        "让一次相遇，从真实校园里发生。",
        "为创作者搭一座可以漫游的入口。",
        "让研究更宽，也让噪声更少。",
        "从食物出发，摸到看不见的反应。",
      ],
    },
    lens: {
      title: "镜头记录",
      copy: "生活里的光与影，构成另一种结构练习。",
      link: "查看全部",
    },
    playground: {
      title: "移动碎片。\n找到新的秩序。",
      copy: "拖动这些碎片。好的想法，常从重新排列开始。",
      shuffle: "重新排列",
    },
    guestbook: {
      title: "留下一点痕迹。",
      copy: "写下一句话，让它留在这本不断生长的册子里。",
      name: "名字",
      message: "留言",
      namePlaceholder: "匿名访客",
      messagePlaceholder: "写点以后再次发现时，仍值得读的话……",
      send: "留下纸条",
      sending: "发送中",
      done: "已贴上",
      error: "再试一次",
    },
    index: ["工具", "地点", "日期", "灵感"],
    last: {
      pre: "总还能再做一件\n真正有用的东西。",
      title: "让我们留下\n一点好痕迹。",
      back: "回到海报",
      caption: "澳门，2026 / 屏幕外见。",
    },
  },
  "繁": {
    nav: {
      fragments: ["Fragments", "碎片"],
      experiments: ["Experiments", "實驗"],
      lens: ["Lens", "鏡頭"],
      playground: ["Playground", "遊樂場"],
      guestbook: ["Guestbook", "留言簿"],
    },
    poster: {
      title: "生活現場筆記",
      intro: "用好奇心，構建有趣的東西。",
      sub: "設計與構建\n好玩又有用的東西。",
      note: "構建\n玩耍\n觀察\n分享",
      scroll: "向下探索",
    },
    fragments: {
      eyebrow: "碎片、實驗、與視角",
      title: ["碎片，", "實驗，", "與鏡頭。"],
      copy: "這裡是我捕捉思緒、記錄實驗、探索視角，並打造小世界的地方。",
      link: "探索筆記",
    },
    experiments: {
      kicker: "Experiments",
      title: "實驗現場",
      copy: "想法的展牆，視覺的實驗場。每一件都從真實的問題開始。",
      notes: [
        "讓一次相遇，從真實校園裡發生。",
        "為創作者搭一座可以漫遊的入口。",
        "讓研究更寬，也讓噪聲更少。",
        "從食物出發，摸到看不見的反應。",
      ],
    },
    lens: {
      title: "鏡頭記錄",
      copy: "生活裡的光與影，構成另一種結構練習。",
      link: "查看全部",
    },
    playground: {
      title: "移動碎片。\n找到新的秩序。",
      copy: "拖動這些碎片。好的想法，常從重新排列開始。",
      shuffle: "重新排列",
    },
    guestbook: {
      title: "留下一點痕跡。",
      copy: "寫下一句話，讓它留在這本不斷生長的冊子裡。",
      name: "名字",
      message: "留言",
      namePlaceholder: "匿名訪客",
      messagePlaceholder: "寫點以後再次發現時，仍值得讀的話……",
      send: "留下紙條",
      sending: "傳送中",
      done: "已貼上",
      error: "再試一次",
    },
    index: ["工具", "地點", "日期", "靈感"],
    last: {
      pre: "總還能再做一件\n真正有用的東西。",
      title: "讓我們留下\n一點好痕跡。",
      back: "回到海報",
      caption: "澳門，2026 / 屏幕外見。",
    },
  },
  EN: {
    nav: {
      fragments: ["Fragments", "Notes"],
      experiments: ["Experiments", "Making"],
      lens: ["Lens", "Images"],
      playground: ["Playground", "Play"],
      guestbook: ["Guestbook", "Messages"],
    },
    poster: {
      title: "Living Field Notebook",
      intro: "Build interesting things with curiosity.",
      sub: "Design and build\nplayful, useful things.",
      note: "Build\nPlay\nObserve\nShare",
      scroll: "Scroll to explore",
    },
    fragments: {
      eyebrow: "Fragments, experiments, and points of view",
      title: ["Fragments,", "Experiments,", "& Lens."],
      copy: "A place to catch thoughts, document experiments, explore perspectives, and make small worlds.",
      link: "Explore notebook",
    },
    experiments: {
      kicker: "Experiments",
      title: "The making wall",
      copy: "A wall of ideas and a field of visual tests. Each one begins with a real question.",
      notes: [
        "Let one real meeting begin on campus.",
        "A place for creators to wander into.",
        "Wider research, with less noise.",
        "Start with food and touch an invisible reaction.",
      ],
    },
    lens: {
      title: "Through the lens",
      copy: "Light and shadow from ordinary days become another exercise in structure.",
      link: "View all",
    },
    playground: {
      title: "Move things.\nFind a new order.",
      copy: "Drag the fragments. Good ideas often begin with rearranging what is already here.",
      shuffle: "Shuffle field",
    },
    guestbook: {
      title: "Leave a trace.",
      copy: "Write a line and leave it inside this notebook as it keeps growing.",
      name: "Name",
      message: "Message",
      namePlaceholder: "Anonymous",
      messagePlaceholder: "Write something worth finding again later...",
      send: "Leave a note",
      sending: "Sending",
      done: "Pinned",
      error: "Try again",
    },
    index: ["Tools", "Places", "Dates", "Influences"],
    last: {
      pre: "There is always room for\none more useful thing.",
      title: "Let's leave\na good trace.",
      back: "Back to poster",
      caption: "Macau, 2026 / See you outside the screen.",
    },
  },
} as const;

const fragments = [
  {
    src: `${B}/images/about/nju.jpg`,
    alt: "Nanjing University campus",
    caption: "2026.04.02 / 阳光很好",
    className: styles.campus,
  },
  {
    src: `${B}/images/2.jpg`,
    alt: "Books and a warm lamp",
    caption: "Books. Ideas. Quiet time.",
    className: styles.books,
  },
  {
    src: `${B}/images/zhuhai.jpg`,
    alt: "Sea under a muted sky",
    caption: "Collecting horizons",
    className: styles.sea,
  },
  {
    src: `${B}/images/about/computer-room.jpg`,
    alt: "A desk and computer",
    caption: "Make, test, keep the useful parts.",
    className: styles.desk,
  },
] as const;

const experiments = [
  {
    number: "01",
    title: "NJU Match",
    zh: "南得一见",
    src: `${B}/images/njumatch.png`,
    href: "https://njumatch.com",
    tags: "Campus product / Full-stack",
    className: styles.projectNju,
  },
  {
    number: "02",
    title: "Fimel",
    zh: "繁梦工作室",
    src: `${B}/images/fimel.png`,
    href: "https://treehey.github.io/Fimel/",
    tags: "Minecraft / Creative web",
    className: styles.projectFimel,
  },
  {
    number: "03",
    title: "Wide Research",
    zh: "宽研",
    src: `${B}/images/wide-research.png`,
    href: "https://finai.org.cn",
    tags: "AI / Information design",
    className: styles.projectWide,
  },
  {
    number: "04",
    title: "Enzyme Explorer",
    zh: "酶学探索",
    src: `${B}/images/enzyme.png`,
    href: "https://treehey.github.io/Enzyme/",
    tags: "Science / Interactive web",
    className: styles.projectEnzyme,
  },
] as const;

const lensPhotos = [
  { src: `${B}/images/HK.jpg`, place: "Hong Kong", number: "42" },
  { src: `${B}/images/shanghai.jpg`, place: "Shanghai", number: "43" },
  { src: `${B}/images/zhuhai.jpg`, place: "Zhuhai", number: "44" },
  { src: `${B}/images/panda.jpg`, place: "Sichuan", number: "45" },
] as const;

const fallbackEntries: GuestEntry[] = [
  {
    id: 101,
    danmaku_title: null,
    message: "Love your sense of calm and detail.",
    nickname: "Alice",
    color: "#e75638",
    created_at: "2026-04-10",
  },
  {
    id: 102,
    danmaku_title: null,
    message: "The tiny things make the whole page feel alive.",
    nickname: "Yifan",
    color: "#59633a",
    created_at: "2026-04-21",
  },
  {
    id: 103,
    danmaku_title: null,
    message: "Keep building strange and useful things.",
    nickname: "M.",
    color: "#9eb9c5",
    created_at: "2026-05-05",
  },
  {
    id: 104,
    danmaku_title: null,
    message: "Flowvale is so soothing!",
    nickname: "Ken",
    color: "#f1eee5",
    created_at: "2026-05-17",
  },
  {
    id: 105,
    danmaku_title: null,
    message: "Every scroll feels like opening another drawer.",
    nickname: "Rin",
    color: "#e8e3d8",
    created_at: "2026-05-29",
  },
  {
    id: 106,
    danmaku_title: null,
    message: "The project wall makes the work feel collected, not listed.",
    nickname: "Jia",
    color: "#f8f5ed",
    created_at: "2026-06-02",
  },
  {
    id: 107,
    danmaku_title: null,
    message: "Tiny hidden jokes are a design system too.",
    nickname: "Noah",
    color: "#e75638",
    created_at: "2026-06-11",
  },
  {
    id: 108,
    danmaku_title: null,
    message: "The field notebook idea fits you.",
    nickname: "L.",
    color: "#59633a",
    created_at: "2026-06-18",
  },
];

function SectionLabel({
  index,
  en,
  zh,
}: {
  index: string;
  en: string;
  zh: string;
}) {
  return (
    <div className={styles.sectionLabel}>
      <span>{index}</span>
      <span>{en}</span>
      <span>{zh}</span>
    </div>
  );
}

export default function FieldNotebook() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("简");
  const [activeSection, setActiveSection] = useState<(typeof chapterItems)[number]>("poster");
  const [activeProject, setActiveProject] = useState(0);
  const [playgroundKey, setPlaygroundKey] = useState(0);
  const [guestEntries, setGuestEntries] = useState<GuestEntry[]>(fallbackEntries);
  const [guestStatus, setGuestStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const siteRef = useRef<HTMLElement>(null);
  const playgroundRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const cursorX = useMotionValue(-120);
  const cursorY = useMotionValue(-120);
  const cursorSpringX = useSpring(cursorX, { stiffness: 210, damping: 28, mass: 0.45 });
  const cursorSpringY = useSpring(cursorY, { stiffness: 210, damping: 28, mass: 0.45 });
  const t = COPY[language];
  const runningTitle =
    activeSection === "poster"
      ? "ONE LONG TAKE"
      : activeSection === "index"
        ? "INDEX"
        : activeSection === "last-page"
          ? "LAST PAGE"
          : t.nav[activeSection][0];

  useEffect(() => {
    document.documentElement.classList.add("field-notebook-theme");
    return () => document.documentElement.classList.remove("field-notebook-theme");
  }, []);

  useEffect(() => {
    if (reduceMotion || !siteRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: `.${styles.poster}`,
          start: "top top",
          end: "+=140%",
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      heroTimeline
        .to(`.${styles.tree}`, { xPercent: -18, yPercent: -9, scale: 0.96, ease: "none" }, 0)
        .to(`.${styles.hey}`, { xPercent: 20, yPercent: 8, scale: 0.96, ease: "none" }, 0)
        .to(`.${styles.posterIntro}`, { yPercent: -45, opacity: 0.18, ease: "none" }, 0)
        .to(`.${styles.posterMicrogrid}`, { xPercent: -45, yPercent: -25, ease: "none" }, 0)
        .to(`.${styles.redNote}`, { xPercent: 22, yPercent: 35, rotate: -10, ease: "none" }, 0)
        .to(`.${styles.posterCircle}`, { scale: 5.4, rotate: 220, opacity: 0, ease: "none" }, 0)
        .to(`.${styles.archiveTab}`, { yPercent: -65, ease: "none" }, 0)
        .to(`.${styles.posterType}`, { opacity: 0.08, ease: "none" }, 0.72);

      const ribbonTween = gsap.to(`.${styles.motionRibbon} > div`, {
        xPercent: -50,
        ease: "none",
        repeat: -1,
        duration: 22,
      });
      let ribbonDirection = 1;

      ScrollTrigger.create({
        trigger: siteRef.current,
        start: "top top",
        end: "max",
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          if (Math.abs(velocity) > 20) ribbonDirection = velocity < 0 ? -1 : 1;
          const speed = gsap.utils.clamp(0.65, 4, Math.abs(velocity) / 650);
          gsap.to(ribbonTween, {
            timeScale: speed * ribbonDirection,
            duration: 0.35,
            ease: "power2.out",
            overwrite: true,
          });
        },
      });

      gsap.utils.toArray<HTMLElement>(`.${styles.caseBridge}`).forEach((bridge) => {
        const track = bridge.querySelector(`.${styles.bridgeTrack}`);
        gsap.fromTo(
          track,
          { xPercent: 8, rotate: -1.5 },
          {
            xPercent: -28,
            rotate: 1.2,
            ease: "none",
            scrollTrigger: {
              trigger: bridge,
              start: "top top",
              end: "+=150%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(`.${styles.lensBridge}`).forEach((bridge) => {
        const film = bridge.querySelector(`.${styles.bridgeFilm}`);
        gsap.fromTo(
          film,
          { xPercent: 5, filter: "grayscale(1) contrast(1.24)", opacity: 0.45 },
          {
            xPercent: -34,
            filter: "grayscale(0.15) contrast(1.04)",
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: bridge,
              start: "top top",
              end: "+=140%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(`.${styles.playBridge}`).forEach((bridge) => {
        const objects = bridge.querySelectorAll("img");
        gsap.fromTo(
          objects,
          { y: 90, scale: 0.72, rotate: 0, opacity: 0.36 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            stagger: 0.08,
            ease: "none",
            scrollTrigger: {
              trigger: bridge,
              start: "top top",
              end: "+=130%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(`.${styles.noteBridge}`).forEach((bridge) => {
        const notes = bridge.querySelectorAll("blockquote");
        gsap.fromTo(
          notes,
          { y: 110, scale: 0.8, opacity: 0, rotate: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            stagger: 0.045,
            ease: "none",
            scrollTrigger: {
              trigger: bridge,
              start: "top top",
              end: "+=135%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            },
          },
        );
      });
    }, siteRef);

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 350);

    return () => {
      window.clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(frame);
  }, [guestEntries.length, reduceMotion]);

  useEffect(() => {
    const saved = window.localStorage.getItem("treehey-language") as Language | null;
    const browserLocale = navigator.languages?.[0]?.toLowerCase() ?? navigator.language.toLowerCase();
    const detected: Language = /^zh-(hk|mo|tw)/.test(browserLocale)
      ? "繁"
      : browserLocale.startsWith("en")
        ? "EN"
        : "简";
    const frame = window.requestAnimationFrame(() => {
      setLanguage(saved && saved in COPY ? saved : detected);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "简" ? "zh-CN" : language === "繁" ? "zh-Hant" : "en";
  }, [language]);

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      const target = document.getElementById(decodeURIComponent(id));
      if (!target) return;
      if (chapterItems.includes(id as (typeof chapterItems)[number])) {
        setActiveSection(id as (typeof chapterItems)[number]);
      }
      const shouldReduceMotion = reduceMotion === true;
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      if (globalLenis) {
        globalLenis.scrollTo(top, { immediate: true });
      }
      window.scrollTo({ top, behavior: shouldReduceMotion ? "auto" : "smooth" });
    };

    const frame = window.requestAnimationFrame(scrollToHash);
    const timers = [120, 420, 760, 1280, 2200].map((delay) => window.setTimeout(scrollToHash, delay));
    window.addEventListener("hashchange", scrollToHash);
    window.addEventListener("resize", scrollToHash);
    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("hashchange", scrollToHash);
      window.removeEventListener("resize", scrollToHash);
    };
  }, [reduceMotion]);

  useEffect(() => {
    let ticking = false;
    const updateFromViewport = () => {
      ticking = false;
      const probeY = window.innerHeight * 0.42;
      const current = chapterItems.find((id) => {
        const section = document.getElementById(id);
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        return rect.top <= probeY && rect.bottom > probeY;
      });
      if (current) setActiveSection(current);
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateFromViewport);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id && chapterItems.includes(visible.target.id as (typeof chapterItems)[number])) {
          setActiveSection(visible.target.id as (typeof chapterItems)[number]);
        }
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.12, 0.32, 0.52, 0.72],
      },
    );

    chapterItems.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    updateFromViewport();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const selectLanguage = (next: Language) => {
    setLanguage(next);
    window.localStorage.setItem("treehey-language", next);
  };

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("guestbook")
      .select("*")
      .not("message", "is", null)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        const liveEntries = data?.length ? (data as GuestEntry[]) : [];
        const liveIds = new Set(liveEntries.map((entry) => entry.id));
        const merged = [
          ...liveEntries,
          ...fallbackEntries.filter((entry) => !liveIds.has(entry.id)),
        ].slice(0, 12);
        setGuestEntries(merged);
      });
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const submitGuestbook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const nickname = String(form.get("nickname") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    if (!message) return;

    setGuestStatus("sending");
    const entry: Omit<GuestEntry, "id" | "created_at"> = {
      danmaku_title: null,
      message,
      nickname: nickname || "Anonymous",
      color: "#e75638",
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("guestbook")
        .insert(entry)
        .select("*")
        .single();
      if (error) {
        setGuestStatus("error");
        return;
      }
      setGuestEntries((current) => [data as GuestEntry, ...current].slice(0, 12));
    } else {
      setGuestEntries((current) => [
        { ...entry, id: Date.now(), created_at: new Date().toISOString() },
        ...current,
      ].slice(0, 12));
    }

    formElement.reset();
    setGuestStatus("done");
    window.setTimeout(() => setGuestStatus("idle"), 1800);
  };

  const copyEmail = async () => {
    await navigator.clipboard.writeText("123kevinlio@gmail.com");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <MotionConfig reducedMotion="user">
    <main
      ref={siteRef}
      className={styles.site}
      onPointerMove={(event) => {
        cursorX.set(event.clientX);
        cursorY.set(event.clientY);
      }}
      onPointerLeave={() => {
        cursorX.set(-120);
        cursorY.set(-120);
      }}
    >
      <motion.div
        className={styles.cursorHalo}
        style={reduceMotion ? undefined : { x: cursorSpringX, y: cursorSpringY }}
        aria-hidden="true"
      />

      <motion.div
        className={styles.scrollProgress}
        style={reduceMotion ? undefined : { scaleX: scrollYProgress }}
        aria-hidden="true"
      />

      <header
        className={`${styles.header} ${
          activeSection === "poster" ? styles.headerHero : styles.headerScrolled
        }`}
      >
        <a className={styles.brand} href="#poster" onClick={closeMenu}>
          TREE HEY
        </a>
        <span className={styles.runningTitle}>{runningTitle}</span>
        <nav className={styles.desktopNav} aria-label="Primary navigation">
          {navItems.map((id, index) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeSection === id ? styles.activeNavLink : undefined}
            >
              <span>0{index + 1}</span>
              {t.nav[id][0]}
            </a>
          ))}
        </nav>
        <label className={styles.languageSelect}>
          <Globe2 aria-hidden="true" />
          <span className="sr-only">Language</span>
          <select
            value={language}
            onChange={(event) => selectLanguage(event.target.value as Language)}
          >
            <option value="简">简</option>
            <option value="繁">繁</option>
            <option value="EN">EN</option>
          </select>
        </label>
        <button
          className={styles.menuButton}
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {menuOpen && (
        <motion.nav
          className={styles.mobileNav}
          aria-label="Mobile navigation"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {navItems.map((id, index) => (
            <a key={id} href={`#${id}`} onClick={closeMenu}>
              <span>0{index + 1}</span>
              <strong>{t.nav[id][0]}</strong>
              <small>{t.nav[id][1]}</small>
            </a>
          ))}
        </motion.nav>
      )}

      <aside
        className={`${styles.chapterRail} ${activeSection === "poster" ? styles.chapterRailHidden : ""}`}
        aria-label="Page chapters"
      >
        {chapterItems.map((id, index) => (
          <a
            key={id}
            href={`#${id}`}
            className={activeSection === id ? styles.activeChapter : undefined}
            aria-label={`Go to ${id}`}
          >
            <span>{String(index).padStart(2, "0")}</span>
          </a>
        ))}
      </aside>

      <section id="poster" className={styles.poster}>
        <div className={styles.posterType}>
          <span className={styles.tree}>TREE</span>
          <span className={styles.hey}>HEY</span>
        </div>

        <div className={styles.posterCircle} aria-hidden="true" />

        <div className={styles.posterMicrogrid} aria-hidden="true">
          <span>Macau</span>
          <span>Nanjing</span>
          <span>Useful</span>
          <span>Playful</span>
        </div>

        <div className={styles.archiveTab}>
          <span>2026</span>
          <span>FIELD NOTES</span>
        </div>

        <div className={styles.posterIntro}>
          <p className={styles.introChinese}>{t.poster.intro}</p>
          <p>{t.poster.sub.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</p>
        </div>

        <aside className={styles.redNote}>
          {t.poster.note.split("\n").map((line) => <span key={line}>{line}<br /></span>)}
        </aside>

        <a className={styles.scrollCue} href="#fragments">
          <ArrowDown aria-hidden="true" />
          <span>{t.poster.scroll}</span>
        </a>
      </section>

      <div className={styles.motionRibbon} aria-hidden="true">
        <div>
          <span>Scroll to collect fragments</span>
          <span>Drag the field</span>
          <span>Open the work</span>
          <span>Leave a trace</span>
          <span>Scroll to collect fragments</span>
          <span>Drag the field</span>
          <span>Open the work</span>
          <span>Leave a trace</span>
        </div>
      </div>

      <section id="fragments" className={styles.fragments}>
        <SectionLabel index="01" en={t.nav.fragments[0]} zh={t.nav.fragments[1]} />
        <div className={styles.fragmentsIntro}>
          <p>{t.fragments.eyebrow}</p>
          <h1>
            {t.fragments.title[0]}<br />
            {t.fragments.title[1]}<br />
            <span>{t.fragments.title[2]}</span>
          </h1>
          <p className={styles.fragmentsCopy}>
            {t.fragments.copy}
          </p>
          <a href="#experiments" className={styles.textLink}>
            {t.fragments.link} <ArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <div className={styles.fragmentBoard}>
          {fragments.map((fragment, index) => (
            <motion.figure
              key={fragment.src}
              className={`${styles.fragmentPhoto} ${fragment.className}`}
              initial={{ opacity: 0, y: 54, rotate: index % 2 ? 3 : -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: index % 2 ? 1.5 : -1.5 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ duration: 0.8, delay: index * 0.08 }}
            >
              <Image
                src={fragment.src}
                alt={fragment.alt}
                fill
                sizes="(max-width: 720px) 80vw, 30vw"
              />
              <figcaption>{fragment.caption}</figcaption>
            </motion.figure>
          ))}

          <motion.blockquote
            className={styles.blueNote}
            initial={{ opacity: 0, scale: 0.9, rotate: 6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
            viewport={{ once: true }}
          >
            Make something people love to use. Then keep it simple.
          </motion.blockquote>

          <motion.blockquote
            className={styles.blackNote}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span>设计让复杂变得可感知。</span>
            Design makes complexity perceivable.
          </motion.blockquote>

          <div className={styles.fieldList}>
            <span>Observe</span>
            <span>Capture</span>
            <span>Prototype</span>
            <span>Share</span>
          </div>
        </div>
      </section>

      <div className={`${styles.scrollBridge} ${styles.caseBridge}`} aria-hidden="true">
        <div className={styles.bridgeTrack}>
          {experiments.map((project) => (
            <figure key={`bridge-${project.number}`}>
              <Image src={project.src} alt="" fill sizes="28vw" />
              <figcaption>{project.number}</figcaption>
            </figure>
          ))}
        </div>
        <span>02 / work opens from the pile</span>
      </div>

      <section id="experiments" className={styles.experiments}>
        <div className={styles.experimentsHeading}>
          <SectionLabel index="02" en={t.nav.experiments[0]} zh={t.nav.experiments[1]} />
          <div>
            <p>{t.experiments.kicker}</p>
            <h2>{t.experiments.title}</h2>
            <p>{t.experiments.copy}</p>
          </div>
          <span className={styles.projectCount}>01 — 04</span>
        </div>

        <div className={styles.projectWall}>
          {experiments.map((project, index) => (
            <motion.article
              key={project.number}
              className={`${styles.project} ${project.className} ${activeProject === index ? styles.projectActive : ""}`}
              onMouseEnter={() => setActiveProject(index)}
              onFocus={() => setActiveProject(index)}
              initial={{ opacity: 0, y: 70 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.8, delay: index * 0.06 }}
            >
              <a href={project.href} target="_blank" rel="noreferrer">
                <div className={styles.projectMeta}>
                  <span className={styles.projectNumber}>{project.number}</span>
                  <div>
                    <h3>{project.title}</h3>
                    <p>{project.zh}</p>
                  </div>
                  <ArrowUpRight aria-hidden="true" />
                </div>
                <div className={styles.projectImage}>
                  <Image
                    src={project.src}
                    alt={`${project.title} project interface`}
                    fill
                    sizes="(max-width: 760px) 94vw, 48vw"
                  />
                </div>
                <div className={styles.projectCaption}>
                  <span>{project.tags}</span>
                  <p>{t.experiments.notes[index]}</p>
                </div>
              </a>
            </motion.article>
          ))}
        </div>

        <div className={styles.projectTicker} aria-live="polite">
          <span>{experiments[activeProject].number}</span>
          <strong>{experiments[activeProject].title}</strong>
          <small>{experiments[activeProject].tags}</small>
        </div>
      </section>

      <div className={`${styles.scrollBridge} ${styles.lensBridge}`} aria-hidden="true">
        <div className={styles.bridgeFilm}>
          {lensPhotos.map((photo) => (
            <figure key={`lens-bridge-${photo.number}`}>
              <Image src={photo.src} alt="" fill sizes="22vw" />
            </figure>
          ))}
        </div>
        <span>03 / light develops into contact sheets</span>
      </div>

      <section id="lens" className={styles.lens}>
        <div className={styles.lensIntro}>
          <SectionLabel index="03" en={t.nav.lens[0]} zh={t.nav.lens[1]} />
          <h2>{t.lens.title}</h2>
          <p>{t.lens.copy}</p>
          <a href={`${B}/images/HK.jpg`} target="_blank" className={styles.lensLink}>
            {t.lens.link} <ArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <div className={styles.filmViewport}>
          <motion.div
            className={styles.filmStrip}
            initial={{ x: "10%" }}
            whileInView={{ x: "-8%" }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {[...lensPhotos, ...lensPhotos].map((photo, index) => (
              <a
                href={photo.src}
                target="_blank"
                rel="noreferrer"
                className={styles.filmFrame}
                key={`${photo.number}-${index}`}
              >
                <span>{photo.number}</span>
                <div>
                  <Image
                    src={photo.src}
                    alt={`${photo.place} photography`}
                    fill
                    sizes="(max-width: 760px) 70vw, 24vw"
                  />
                </div>
                <small>{photo.place}</small>
              </a>
            ))}
          </motion.div>
        </div>

        <motion.figure
          className={styles.lensPolaroid}
          initial={{ opacity: 0, rotate: 9, y: 40 }}
          whileInView={{ opacity: 1, rotate: 4, y: 0 }}
          viewport={{ once: true }}
        >
          <Image
            src={`${B}/images/3.jpg`}
            alt="A quiet personal photograph"
            fill
            sizes="200px"
          />
          <figcaption>2026.05</figcaption>
        </motion.figure>
      </section>

      <div className={`${styles.scrollBridge} ${styles.playBridge}`} aria-hidden="true">
        <Image src={`${B}/images/about/Minecraft.png`} alt="" width={320} height={210} />
        <Image src={`${B}/images/about/computer-room.jpg`} alt="" width={320} height={210} />
        <Image src={`${B}/sloth_color.png`} alt="" width={180} height={180} />
        <span>04 / rearrange the desk</span>
      </div>

      <section id="playground" className={styles.playground}>
        <div className={styles.playgroundHeading}>
          <SectionLabel index="04" en={t.nav.playground[0]} zh={t.nav.playground[1]} />
          <div>
            <h2>{t.playground.title.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h2>
            <p>{t.playground.copy}</p>
          </div>
          <button
            type="button"
            className={styles.shuffleButton}
            onClick={() => setPlaygroundKey((key) => key + 1)}
          >
            <Shuffle aria-hidden="true" />
            <span>{t.playground.shuffle}</span>
          </button>
        </div>

        <div className={styles.playgroundField} ref={playgroundRef}>
          <motion.figure
            key={`camera-${playgroundKey}`}
            className={`${styles.playObject} ${styles.playCamera}`}
            drag
            dragConstraints={playgroundRef}
            dragElastic={0.12}
            whileDrag={{ scale: 1.04, rotate: 0, zIndex: 8 }}
            initial={{ x: playgroundKey % 2 ? 30 : 0, rotate: -5 }}
            animate={{ x: 0, rotate: -3 }}
          >
            <Image
              src={`${B}/images/about/computer-room.jpg`}
              alt="A creative desk"
              fill
              sizes="320px"
            />
            <figcaption>FIELD DESK / 03:17</figcaption>
          </motion.figure>

          <motion.figure
            key={`block-${playgroundKey}`}
            className={`${styles.playObject} ${styles.playBlock}`}
            drag
            dragConstraints={playgroundRef}
            dragElastic={0.12}
            whileDrag={{ scale: 1.04, rotate: 0, zIndex: 8 }}
            initial={{ x: playgroundKey % 2 ? -35 : 0, rotate: 5 }}
            animate={{ x: 0, rotate: 2 }}
          >
            <Image
              src={`${B}/images/about/Minecraft.png`}
              alt="Minecraft experiment"
              fill
              sizes="300px"
            />
            <figcaption>BUILD A SMALL WORLD</figcaption>
          </motion.figure>

          <motion.figure
            key={`sloth-${playgroundKey}`}
            className={`${styles.playObject} ${styles.playSloth}`}
            drag
            dragConstraints={playgroundRef}
            dragElastic={0.12}
            whileDrag={{ scale: 1.05, rotate: 0, zIndex: 8 }}
            initial={{ y: playgroundKey % 2 ? -28 : 0, rotate: -2 }}
            animate={{ y: 0, rotate: 3 }}
          >
            <Image
              src={`${B}/sloth_color.png`}
              alt="Tree Hey sloth mascot"
              fill
              loading="eager"
              sizes="260px"
            />
            <figcaption>SLOW IS A VALID SPEED.</figcaption>
          </motion.figure>

          <motion.blockquote
            key={`note-${playgroundKey}`}
            className={styles.playNote}
            drag
            dragConstraints={playgroundRef}
            whileDrag={{ scale: 1.04, rotate: 0, zIndex: 8 }}
            initial={{ opacity: 0, rotate: 8 }}
            animate={{ opacity: 1, rotate: -2 }}
          >
            Curiosity is a tool.<br />Use it until the edges wear out.
          </motion.blockquote>
        </div>
      </section>

      <div className={`${styles.scrollBridge} ${styles.noteBridge}`} aria-hidden="true">
        {guestEntries.slice(0, 6).map((entry, index) => (
          <blockquote key={`note-bridge-${entry.id}`} style={{ ["--i" as string]: index }}>
            {entry.message}
          </blockquote>
        ))}
        <span>05 / notes gather on the wall</span>
      </div>

      <section id="guestbook" className={styles.guestbook}>
        <div className={styles.guestbookHeading}>
          <SectionLabel index="05" en={t.nav.guestbook[0]} zh={t.nav.guestbook[1]} />
          <h2>{t.guestbook.title}</h2>
          <p>{t.guestbook.copy}</p>
        </div>

        <div className={styles.openBook}>
          <div className={styles.bookMessages}>
            {guestEntries.map((entry, index) => (
              <motion.blockquote
                key={entry.id}
                className={styles.guestEntry}
                style={{ ["--note-color" as string]: entry.color || "#f8f5ed" }}
                initial={{ opacity: 0, y: 24, rotate: index % 2 ? 1.5 : -1.5 }}
                whileInView={{ opacity: 1, y: 0, rotate: index % 2 ? 0.6 : -0.6 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <time>
                  {new Date(entry.created_at).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </time>
                <p>{entry.message}</p>
                <cite>— {entry.nickname || "Anonymous"}</cite>
              </motion.blockquote>
            ))}
          </div>

          <form className={styles.guestForm} onSubmit={submitGuestbook}>
            <label>
              <span>{t.guestbook.name}</span>
              <input name="nickname" maxLength={24} placeholder={t.guestbook.namePlaceholder} />
            </label>
            <label>
              <span>{t.guestbook.message}</span>
              <textarea
                name="message"
                required
                maxLength={240}
                rows={5}
                placeholder={t.guestbook.messagePlaceholder}
              />
            </label>
            <button type="submit" disabled={guestStatus === "sending"}>
              <Send aria-hidden="true" />
              <span>
                {guestStatus === "sending"
                  ? t.guestbook.sending
                  : guestStatus === "done"
                    ? t.guestbook.done
                    : guestStatus === "error"
                      ? t.guestbook.error
                      : t.guestbook.send}
              </span>
            </button>
          </form>
        </div>
      </section>

      <section id="index" className={styles.index}>
        <SectionLabel index="06" en="Index" zh={language === "繁" ? "索引" : language === "EN" ? "Archive" : "索引"} />
        <div className={styles.indexGrid}>
          <div>
            <h3>{t.index[0]}</h3>
            <p>Figma</p><p>VS Code</p><p>React</p><p>TypeScript</p><p>Blender</p>
          </div>
          <div>
            <h3>{t.index[1]}</h3>
            <p>Macau</p><p>Nanjing</p><p>Suzhou</p><p>Zhuhai</p><p>Hong Kong</p>
          </div>
          <div>
            <h3>{t.index[2]}</h3>
            <p>2024.09 / New map</p><p>2026.01 / NJU Match</p><p>2026.03 / Fimel</p><p>2026.06 / Field notes</p>
          </div>
          <div>
            <h3>{t.index[3]}</h3>
            <p>Field recordings</p><p>Japanese posters</p><p>Quiet interfaces</p><p>Useful accidents</p>
          </div>
        </div>
      </section>

      <footer id="last-page" className={styles.lastPage}>
        <SectionLabel index="07" en="Last Page" zh={language === "繁" ? "最後一頁" : language === "EN" ? "Closing" : "最后一页"} />
        <div className={styles.lastGrid}>
          <div className={styles.lastCopy}>
            <p>{t.last.pre.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</p>
            <h2>{t.last.title.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h2>
            <div className={styles.emailRow}>
              <a href="mailto:123kevinlio@gmail.com">123kevinlio@gmail.com</a>
              <button type="button" onClick={copyEmail} aria-label="Copy email address">
                {copied ? <Check /> : <Copy />}
              </button>
            </div>
            <div className={styles.socialRow}>
              <a href="https://github.com/treehey" target="_blank" rel="noreferrer">
                GitHub <ArrowUpRight aria-hidden="true" />
              </a>
              <a href="https://www.instagram.com/tree_hey/" target="_blank" rel="noreferrer">
                Instagram <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
          <figure className={styles.lastPhoto}>
            <Image
              src={`${B}/images/1.jpg`}
              alt="Macau rooftops collected along the way"
              fill
              sizes="(max-width: 760px) 92vw, 52vw"
            />
            <figcaption>{t.last.caption}</figcaption>
          </figure>
        </div>
        <div className={styles.footerLine}>
          <span>© 2026 TREE HEY</span>
          <a href="#poster">{t.last.back} <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </footer>
    </main>
    </MotionConfig>
  );
}

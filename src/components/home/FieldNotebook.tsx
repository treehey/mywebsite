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
  Send,
  Shuffle,
} from "lucide-react";
import {
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";
import styles from "./FieldNotebook.module.css";
import { supabase, type GuestEntry } from "@/lib/supabase";
import { globalLenis } from "../SmoothScroll";
import { SharedFieldObjects } from "./motion/SharedFieldObjects";
import { SpineNavigation } from "./motion/SpineNavigation";
import { sceneIds as chapterItems, type SceneId } from "./motion/sceneRegistry";
import { useMotionDirector } from "./motion/useMotionDirector";

const B = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Language = "简" | "繁" | "EN";

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

type TearRenderer = {
  render: (progress: number) => void;
  destroy: () => void;
};

const tearNoise = (value: number) =>
  Math.abs(Math.sin(value * 12.9898 + 78.233) * 43758.5453) % 1;

function createTearRenderer(
  canvas: HTMLCanvasElement,
  revealLayer: HTMLElement,
  paintPaper = true,
): TearRenderer {
  const context = canvas.getContext("2d");
  let targetProgress = 0;
  let currentProgress = 0;
  let scrollEnergy = 0;
  let lastFrame = performance.now();
  let frameId = 0;
  let isVisible = false;
  let texture: HTMLCanvasElement | null = null;

  const buildTexture = () => {
    const nextTexture = document.createElement("canvas");
    nextTexture.width = 320;
    nextTexture.height = 320;
    const textureContext = nextTexture.getContext("2d");
    if (!textureContext) return nextTexture;

    textureContext.fillStyle = "#e8e3d8";
    textureContext.fillRect(0, 0, 320, 320);

    for (let index = 0; index < 1100; index += 1) {
      const x = tearNoise(index * 3.11) * 320;
      const y = tearNoise(index * 7.37 + 11) * 320;
      const alpha = 0.018 + tearNoise(index * 4.91) * 0.045;
      textureContext.fillStyle =
        index % 3 === 0
          ? `rgba(255,255,255,${alpha})`
          : `rgba(36,34,28,${alpha})`;
      textureContext.fillRect(x, y, 0.5 + tearNoise(index) * 1.4, 0.5);
    }

    textureContext.strokeStyle = "rgba(255,255,255,0.09)";
    textureContext.lineWidth = 0.6;
    for (let index = 0; index < 75; index += 1) {
      const x = tearNoise(index * 8.41) * 320;
      const y = tearNoise(index * 5.27 + 3) * 320;
      textureContext.beginPath();
      textureContext.moveTo(x, y);
      textureContext.lineTo(x + 9 + tearNoise(index) * 15, y + 1.5);
      textureContext.stroke();
    }

    return nextTexture;
  };

  const draw = (time: number) => {
    if (!context) return;
    const deltaTime = Math.min(40, Math.max(1, time - lastFrame));
    lastFrame = time;
    currentProgress += (targetProgress - currentProgress) * Math.min(1, deltaTime * 0.018);
    scrollEnergy *= Math.pow(0.92, deltaTime / 16.67);

    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const targetWidth = Math.round(width * pixelRatio);
    const targetHeight = Math.round(height * pixelRatio);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      texture = paintPaper ? buildTexture() : null;
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    const eased = currentProgress * currentProgress * (3 - 2 * currentProgress);
    const baseY = height + 90 - eased * (height + 180);
    const segmentCount = Math.max(100, Math.round(width / 10));
    const points: Array<{ x: number; y: number }> = [];
    const drift = time * 0.00018;
    const motionAmplitude = 1 + Math.min(1, scrollEnergy) * 1.25;

    for (let index = 0; index <= segmentCount; index += 1) {
      const ratio = index / segmentCount;
      const x = ratio * width;
      const broadWave =
        Math.sin(ratio * Math.PI * 3.7 + 0.8 + drift) * 21 +
        Math.sin(ratio * Math.PI * 7.6 - drift * 0.72) * 10;
      const liveRipple =
        Math.sin(ratio * Math.PI * 14.5 + drift * 2.8) *
        (2.8 + scrollEnergy * 8);
      const deckle =
        (tearNoise(index * 1.73) - 0.5) * 7 +
        (tearNoise(index * 4.37 + Math.floor(time / 180)) - 0.5) *
          1.8 *
          motionAmplitude;
      points.push({ x, y: baseY + broadWave + liveRipple + deckle });
    }

    if (paintPaper) {
      const paperPath = new Path2D();
      paperPath.moveTo(0, -2);
      paperPath.lineTo(width, -2);
      paperPath.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      points
        .slice()
        .reverse()
        .forEach((point) => paperPath.lineTo(point.x, point.y));
      paperPath.closePath();

      context.save();
      context.shadowColor = `rgba(24,22,18,${0.16 + Math.min(0.1, scrollEnergy * 0.08)})`;
      context.shadowBlur = 30 + Math.min(18, scrollEnergy * 14);
      context.shadowOffsetY = 10;
      context.fillStyle = "#e8e3d8";
      context.fill(paperPath);
      context.restore();

      context.save();
      context.clip(paperPath);
      const pattern = texture ? context.createPattern(texture, "repeat") : null;
      context.fillStyle = pattern ?? "#e8e3d8";
      context.fillRect(0, -120, width, Math.min(height + 240, baseY + 240));
      context.restore();
    }

    const edgePath = new Path2D();
    edgePath.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => edgePath.lineTo(point.x, point.y));

    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.shadowColor = "rgba(255,253,244,0.66)";
    context.shadowBlur = 9 + scrollEnergy * 7;
    context.strokeStyle = "rgba(252,250,242,0.9)";
    context.lineWidth = 6.5;
    context.stroke(edgePath);
    context.shadowBlur = 0;
    context.strokeStyle = "rgba(63,58,48,0.12)";
    context.lineWidth = 0.8;
    context.stroke(edgePath);

    points.forEach((point, index) => {
      const strandCount =
        tearNoise(index * 9.7) > 0.34
          ? 1 + Math.floor(tearNoise(index * 3.9) * 3)
          : 0;
      for (let strand = 0; strand < strandCount; strand += 1) {
        const seed = index * 8.3 + strand * 19.1;
        const tremor = Math.sin(time * 0.0022 + seed) * (0.8 + scrollEnergy * 2.4);
        const offsetX = (tearNoise(seed * 0.53) - 0.5) * 13;
        const direction = tearNoise(seed * 1.31) > 0.28 ? -1 : 1;
        const length = (2 + tearNoise(seed * 0.87) * 15) * direction;
        context.beginPath();
        context.moveTo(point.x + offsetX, point.y + tremor);
        context.quadraticCurveTo(
          point.x + offsetX + (tearNoise(seed * 1.7) - 0.5) * 8,
          point.y + length * 0.48,
          point.x + offsetX + (tearNoise(seed * 2.3) - 0.5) * 10,
          point.y + length,
        );
        context.strokeStyle = `rgba(248,246,238,${
          0.2 + tearNoise(seed * 3.1) * 0.58
        })`;
        context.lineWidth = 0.35 + tearNoise(seed * 4.1) * 1.05;
        context.stroke();
      }

      const dustCount =
        7 + (index % 3 === 0 ? 2 : 0) + Math.round(Math.min(4, scrollEnergy * 3));
      for (let dust = 0; dust < dustCount; dust += 1) {
        const dustSeed = index * 11.1 + dust * 29.7;
        const pulse = Math.sin(time * 0.0018 + dustSeed) * (1.4 + scrollEnergy * 2.8);
        const spread = 32 + Math.min(34, scrollEnergy * 25);
        const dustX = point.x + (tearNoise(dustSeed) - 0.5) * 46 + pulse;
        const dustY =
          point.y +
          (tearNoise(dustSeed * 1.19) - 0.5) * spread +
          pulse * 0.45;
        const isPaperSide = dustY < point.y;
        const radius =
          0.22 +
          tearNoise(dustSeed * 1.57) *
            (isPaperSide ? 1.45 : 1.9 + scrollEnergy * 0.55);
        context.fillStyle = isPaperSide
          ? `rgba(49,46,39,${0.06 + tearNoise(dustSeed * 1.73) * 0.24})`
          : `rgba(250,247,237,${0.18 + tearNoise(dustSeed * 1.73) * 0.62})`;
        if (dust % 2 === 0) {
          context.fillRect(
            dustX,
            dustY,
            radius * (0.8 + tearNoise(dustSeed * 2.19)),
            radius,
          );
        } else {
          context.beginPath();
          context.ellipse(
            dustX,
            dustY,
            radius * (0.75 + tearNoise(dustSeed * 2.19)),
            radius,
            tearNoise(dustSeed * 2.83) * Math.PI,
            0,
            Math.PI * 2,
          );
          context.fill();
        }
      }
    });

    const atmosphereCount = Math.round(180 + scrollEnergy * 90);
    for (let index = 0; index < atmosphereCount; index += 1) {
      const seed = index * 17.37;
      const x = tearNoise(seed) * width;
      const pointIndex = Math.min(
        points.length - 1,
        Math.floor((x / width) * points.length),
      );
      const edgeY = points[pointIndex].y;
      const depth = tearNoise(seed * 1.91);
      const driftY = Math.sin(time * 0.00045 + seed) * 8;
      const y = edgeY + 12 + depth * Math.max(0, height - edgeY) + driftY;
      if (y < edgeY || y > height) continue;
      const size = 0.25 + tearNoise(seed * 2.73) * 1.15;
      context.fillStyle = `rgba(244,241,232,${
        0.025 + tearNoise(seed * 3.31) * (0.055 + scrollEnergy * 0.025)
      })`;
      context.fillRect(x, y, size, size);
    }
    context.restore();

    const revealRect = revealLayer.getBoundingClientRect();
    const revealOffsetX = rect.left - revealRect.left;
    const revealOffsetY = rect.top - revealRect.top;
    const polygon = [
      ...points.map(
        (point) =>
          `${(point.x + revealOffsetX).toFixed(1)}px ${(point.y + revealOffsetY).toFixed(1)}px`,
      ),
      `${(width + revealOffsetX).toFixed(1)}px ${revealLayer.offsetHeight + 2}px`,
      `${revealOffsetX.toFixed(1)}px ${revealLayer.offsetHeight + 2}px`,
    ].join(", ");
    revealLayer.style.clipPath = `polygon(${polygon})`;
    revealLayer.style.setProperty("--tear-progress", currentProgress.toFixed(3));
  };

  const tick = (time: number) => {
    if (isVisible) draw(time);
    frameId = window.requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) draw(performance.now());
    },
    { rootMargin: "20% 0px" },
  );
  const render = (progress: number) => {
    const nextProgress = gsap.utils.clamp(0, 1, progress);
    scrollEnergy = Math.min(
      1.6,
      scrollEnergy + Math.abs(nextProgress - targetProgress) * 20,
    );
    targetProgress = nextProgress;
    if (!isVisible) {
      currentProgress = nextProgress;
      draw(performance.now());
    }
  };
  const handleResize = () => draw(performance.now());
  window.addEventListener("resize", handleResize);
  observer.observe(canvas);
  frameId = window.requestAnimationFrame(tick);
  render(0);

  return {
    render,
    destroy: () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      revealLayer.style.removeProperty("clip-path");
      revealLayer.style.removeProperty("--tear-progress");
    },
  };
}

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
  const [language, setLanguage] = useState<Language>("简");
  const [activeSection, setActiveSection] = useState<SceneId>("poster");
  const [activeProject, setActiveProject] = useState(0);
  const [playgroundKey, setPlaygroundKey] = useState(0);
  const [guestEntries, setGuestEntries] = useState<GuestEntry[]>(fallbackEntries);
  const [guestStatus, setGuestStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const siteRef = useRef<HTMLElement>(null);
  const playgroundRef = useRef<HTMLDivElement>(null);
  const parallaxTargetRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const t = COPY[language];
  const sceneLabels: Record<SceneId, string> = {
    poster: language === "EN" ? "Cover" : "封面",
    fragments: t.nav.fragments[0],
    experiments: t.nav.experiments[0],
    lens: t.nav.lens[0],
    playground: t.nav.playground[0],
    guestbook: t.nav.guestbook[0],
    "last-page": language === "EN" ? "Last page" : "末页",
  };
  const { navigateTo } = useMotionDirector({
    rootRef: siteRef,
    activeScene: activeSection,
    onSceneChange: setActiveSection,
    reduceMotion: reduceMotion === true,
  });

  useEffect(() => {
    document.documentElement.classList.add("field-notebook-theme");
    return () => document.documentElement.classList.remove("field-notebook-theme");
  }, []);

  useEffect(() => {
    if (reduceMotion || !siteRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    let tearRenderer: TearRenderer | null = null;
    const ctx = gsap.context(() => {
      const noteGateScene = siteRef.current?.querySelector<HTMLElement>(
        `.${styles.noteGate}`,
      );
      const noteGateStage = noteGateScene?.closest<HTMLElement>(
        `.${styles.playgroundStage}`,
      );
      const noteTearCanvas = noteGateScene?.querySelector<HTMLCanvasElement>(
        `.${styles.noteTearCanvas}`,
      );
      const noteTearReveal = noteGateScene?.querySelector<HTMLElement>(
        `.${styles.noteGateReveal}`,
      );
      const tearState = { progress: 0 };

      if (noteTearCanvas && noteTearReveal) {
        tearRenderer = createTearRenderer(noteTearCanvas, noteTearReveal, false);
      }

      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: `.${styles.poster}`,
          start: "top top",
          end: "+=140%",
          scrub: 1.1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      heroTimeline
        .to(
          `.${styles.posterType}`,
          { scale: 1.13, yPercent: -3, transformOrigin: "54% 46%", ease: "none" },
          0,
        )
        .to(`.${styles.posterIntro}`, { yPercent: -18, opacity: 0.22, ease: "none" }, 0.12)
        .to(`.${styles.posterCoverMeta}`, { yPercent: -55, opacity: 0.2, ease: "none" }, 0.08)
        .to(`.${styles.scrollCue}`, { y: -24, opacity: 0, ease: "none" }, 0.56)
        .to(`.${styles.posterType}`, { opacity: 0.12, ease: "none" }, 0.76);

      media.add("(min-width: 901px)", () => {
        const fragmentScene = siteRef.current?.querySelector<HTMLElement>(
          `.${styles.fragments}`,
        );
        if (!fragmentScene) return;

        const fragmentHandoff = gsap.timeline({
          scrollTrigger: {
            id: "poster-fragments-handoff",
            trigger: fragmentScene,
            start: "top bottom",
            end: "top top",
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });

        fragmentHandoff.fromTo(
          fragmentScene,
          {
            clipPath:
              "polygon(0 94%, 24% 94%, 24% 86%, 49% 86%, 49% 91%, 75% 91%, 75% 82%, 100% 82%, 100% 100%, 0 100%)",
          },
          {
            clipPath:
              "polygon(0 0%, 24% 0%, 24% 0%, 49% 0%, 49% 0%, 75% 0%, 75% 0%, 100% 0%, 100% 100%, 0 100%)",
            ease: "none",
          },
          0,
        );

        const cards = gsap.utils.toArray<HTMLElement>(
          fragmentScene.querySelectorAll(`.${styles.fragmentPhoto}`),
        );
        const originalImages = gsap.utils.toArray<HTMLElement>(fragmentScene.querySelectorAll(
          `.${styles.fragmentOriginalImage}`,
        ));
        const projectImages = gsap.utils.toArray<HTMLElement>(fragmentScene.querySelectorAll(
          `.${styles.fragmentProjectImage}`,
        ));
        const projectMeta = gsap.utils.toArray<HTMLElement>(fragmentScene.querySelectorAll(
          `.${styles.fragmentProjectMeta}`,
        ));
        const captions = fragmentScene.querySelectorAll(
          `.${styles.fragmentCaption}`,
        );
        const supportingNotes = fragmentScene.querySelectorAll(
          `.${styles.blueNote}, .${styles.blackNote}, .${styles.fieldList}`,
        );
        gsap.set(projectImages, { autoAlpha: 0 });
        gsap.set(projectMeta, { autoAlpha: 0 });

        const fragmentTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: fragmentScene,
            start: "top top",
            end: "+=175%",
            scrub: 0.92,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        fragmentTimeline
          .from(
            cards,
            {
              y: 90,
              opacity: 0.18,
              rotate: (index) => (index % 2 === 0 ? -5 : 5),
              stagger: 0.07,
              ease: "none",
            },
            0,
          )
          .from(
            `.${styles.fragmentsIntro}`,
            { x: -42, opacity: 0, ease: "none" },
            0,
          )
          .to(`.${styles.fragmentBoard}`, { xPercent: -4, ease: "none" }, 0.2)
          .to(cards.slice(1), {
            xPercent: (index) => [8, -5, 11][index] ?? 0,
            yPercent: (index) => [-5, 8, -2][index] ?? 0,
            scale: 0.78,
            opacity: 0.34,
            filter: "saturate(0.62) contrast(0.92)",
            stagger: 0.035,
            ease: "none",
          }, 0.42)
          .to(cards[0], {
            top: "43%",
            left: "57%",
            right: "auto",
            bottom: "auto",
            width: "22%",
            aspectRatio: "4 / 3",
            rotate: -2,
            opacity: 0.08,
            zIndex: 6,
            ease: "none",
          }, 0.42)
          .to(originalImages.slice(0, 1), { opacity: 0, ease: "none" }, 0.48)
          .to(supportingNotes, { y: 34, opacity: 0.3, stagger: 0.04, ease: "none" }, 0.46)
          .to(captions, { opacity: 0.22, ease: "none" }, 0.46)
          .to(
            `.${styles.fragmentsCopy}, .${styles.textLink}`,
            { opacity: 0.42, y: 8, ease: "none" },
            0.52,
          );

        fragmentTimeline
          .to(cards[0], { scale: 1.035, transformOrigin: "center", ease: "none" }, 0.7)
          .to(
            `.${styles.fragmentsIntro} > p:first-child`,
            { color: "#e75638", ease: "none" },
            0.68,
          );

        ScrollTrigger.create({
          id: "fragment-photo-snap",
          trigger: fragmentScene,
          start: "top+=62% top",
          onEnter: () => siteRef.current?.setAttribute("data-motion-event", "photo-pin"),
          onEnterBack: () => siteRef.current?.setAttribute("data-motion-event", "photo-pin"),
          onLeaveBack: () => siteRef.current?.removeAttribute("data-motion-event"),
        });

        const experimentsScene = siteRef.current?.querySelector<HTMLElement>(
          `.${styles.experiments}`,
        );
        if (!experimentsScene) return;

        const fragmentsIntro = fragmentScene.querySelector(
          `.${styles.fragmentsIntro}`,
        );
        const fragmentBoard = fragmentScene.querySelector(
          `.${styles.fragmentBoard}`,
        );

        const projectScenes = gsap.utils.toArray<HTMLElement>(
          experimentsScene.querySelectorAll(`.${styles.projectScene}`),
        );
        const experimentsIntro = experimentsScene.querySelector(
          `.${styles.experimentsIntro}`,
        );

        gsap.set(projectScenes, { autoAlpha: 0 });
        gsap.set(projectScenes[0], { autoAlpha: 1 });

        const experimentsHandoff = gsap.timeline({
          scrollTrigger: {
            id: "fragments-experiments-handoff",
            trigger: experimentsScene,
            start: "top bottom",
            end: "top top",
            scrub: 0.95,
            invalidateOnRefresh: true,
          },
        });

        experimentsHandoff.fromTo(
          experimentsScene,
          {
            clipPath:
              "polygon(0 100%, 0 92%, 7% 94%, 14% 89%, 23% 93%, 31% 88%, 42% 92%, 53% 87%, 65% 93%, 74% 89%, 86% 94%, 94% 90%, 100% 92%, 100% 100%)",
            yPercent: 8,
          },
          {
            clipPath:
              "polygon(0 0%, 0 0%, 7% 0%, 14% 0%, 23% 0%, 31% 0%, 42% 0%, 53% 0%, 65% 0%, 74% 0%, 86% 0%, 94% 0%, 100% 0%, 100% 100%)",
            yPercent: 0,
            ease: "none",
          },
          0,
        );

        if (fragmentsIntro) {
          experimentsHandoff.to(
            fragmentsIntro,
            {
              yPercent: -24,
              xPercent: -12,
              opacity: 0.18,
              transformOrigin: "left top",
              ease: "none",
            },
            0.06,
          );
        }

        if (fragmentBoard) {
          experimentsHandoff.to(
            fragmentBoard,
            {
              yPercent: -10,
              xPercent: -8,
              opacity: 0.3,
              transformOrigin: "center top",
              ease: "none",
            },
            0.08,
          );
        }

        const experimentsTimeline = gsap.timeline({
          scrollTrigger: {
            id: "experiments-stage",
            trigger: experimentsScene,
            start: "top top",
            end: "+=410%",
            scrub: 1.15,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const index = Math.min(
                projectScenes.length - 1,
                Math.floor(self.progress * projectScenes.length),
              );
              setActiveProject(index);
            },
          },
        });

        if (experimentsIntro) {
          experimentsTimeline.to(
            experimentsIntro,
            { opacity: 0.2, y: -18, ease: "none" },
            0.52,
          );
        }

        const sceneReveals = [
          { clipPath: "inset(0 100% 0 0)", xPercent: 7, yPercent: 0 },
          { clipPath: "inset(100% 0 0 0)", xPercent: 0, yPercent: 8 },
          { clipPath: "circle(0% at 72% 52%)", xPercent: 0, yPercent: 0 },
        ];

        for (let index = 1; index < projectScenes.length; index += 1) {
          const previous = projectScenes[index - 1];
          const current = projectScenes[index];
          const reveal = sceneReveals[index - 1];
          const at = 0.72 + (index - 1) * 1.08;

          experimentsTimeline
            .to(
              previous,
              {
                autoAlpha: 0,
                scale: 0.9,
                xPercent: index % 2 === 0 ? 6 : -6,
                ease: "none",
                duration: 0.34,
              },
              at,
            )
            .fromTo(
              current,
              {
                autoAlpha: 0,
                clipPath: reveal.clipPath,
                xPercent: reveal.xPercent,
                yPercent: reveal.yPercent,
                scale: index === 3 ? 1.08 : 1,
              },
              {
                autoAlpha: 1,
                clipPath: index === 3 ? "circle(150% at 72% 52%)" : "inset(0% 0% 0% 0%)",
                xPercent: 0,
                yPercent: 0,
                scale: 1,
                ease: "none",
                duration: 0.66,
              },
              at + 0.1,
            )
            .from(
              current.querySelector(`.${styles.projectSceneCopy}`),
              { y: 64, opacity: 0, ease: "none", duration: 0.46 },
              at + 0.25,
            )
            .from(
              current.querySelector(`.${styles.projectSceneMedia}`),
              { scale: 1.08, ease: "none", duration: 0.68 },
              at + 0.1,
            );
        }

        const filmGate = experimentsScene.querySelector(`.${styles.filmGate}`);
        const filmGateFrames = filmGate?.querySelectorAll("figure");
        const filmGateTrack = filmGate?.querySelector(`.${styles.filmGateTrack}`);
        const lastProject = projectScenes.at(-1);

        if (filmGate && filmGateFrames && filmGateTrack && lastProject) {
          experimentsTimeline
            .to(
              lastProject,
              { scale: 0.88, opacity: 0.16, ease: "none", duration: 0.46 },
              3.72,
            )
            .to(
              filmGate,
              { autoAlpha: 1, ease: "none", duration: 0.36 },
              3.78,
            )
            .from(
              filmGateFrames,
              {
                y: 120,
                rotate: (index) => (index % 2 === 0 ? -4 : 4),
                opacity: 0,
                stagger: 0.06,
                ease: "none",
                duration: 0.42,
              },
              3.84,
            )
            .to(
              filmGateTrack,
              { xPercent: -9, ease: "none", duration: 0.55 },
              4.05,
            );
        }

        const lensScene = siteRef.current?.querySelector<HTMLElement>(`.${styles.lens}`);
        if (!lensScene) return;
        const filmStrip = lensScene.querySelector(`.${styles.filmStrip}`);
        const filmFrames = gsap.utils.toArray<HTMLElement>(
          lensScene.querySelectorAll(`.${styles.filmFrame}`),
        );
        const filmImages = lensScene.querySelectorAll(`.${styles.filmFrame} img`);
        const lensIntro = lensScene.querySelector(`.${styles.lensIntro}`);
        const lensViewport = lensScene.querySelector(`.${styles.filmViewport}`);
        const lensPolaroid = lensScene.querySelector(`.${styles.lensPolaroid}`);
        const playObjects = lensScene.querySelectorAll(`.${styles.lensPlayObjects} img`);
        const playObjectsLayer = lensScene.querySelector(`.${styles.lensPlayObjects}`);
        const lensStage = lensScene.querySelector(`.${styles.lensStage}`);

        const lensHandoff = gsap.timeline({
          scrollTrigger: {
            id: "experiments-lens-handoff",
            trigger: lensScene,
            start: "top bottom",
            end: "top top",
            scrub: 0.95,
            invalidateOnRefresh: true,
          },
        });

        lensHandoff.fromTo(
          lensScene,
          { clipPath: "inset(48% 0% 48% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
          0,
        );

        if (lensStage) {
          lensHandoff.fromTo(
            lensStage,
            { filter: "brightness(0.34) contrast(1.32)" },
            { filter: "brightness(1) contrast(1)", ease: "none" },
            0.08,
          );
        }

        if (filmGateTrack) {
          lensHandoff.to(
            filmGateTrack,
            {
              yPercent: -38,
              scale: 0.92,
              opacity: 0.12,
              ease: "none",
            },
            0.08,
          );
        }

        if (filmGateFrames) {
          lensHandoff.to(
            filmGateFrames,
            {
              yPercent: (index) => (index % 2 === 0 ? -24 : 28),
              rotate: (index) => (index % 2 === 0 ? -5 : 5),
              opacity: 0,
              stagger: 0.025,
              ease: "none",
            },
            0.34,
          );
        }

        const lensTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: lensScene,
            start: "top top",
            end: "+=250%",
            scrub: 1.15,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        lensTimeline
          .fromTo(
            filmStrip,
            { xPercent: 6 },
            { xPercent: -34, ease: "none", duration: 1 },
            0,
          )
          .fromTo(
            filmImages,
            { filter: "grayscale(1) contrast(1.18)", opacity: 0.58 },
            {
              filter: "grayscale(0) contrast(1)",
              opacity: 1,
              stagger: 0.035,
              ease: "none",
              duration: 0.72,
            },
            0.05,
          );

        if (lensPolaroid) {
          lensTimeline.fromTo(
            lensPolaroid,
            { y: 80, rotate: 9, opacity: 0 },
            { y: 0, rotate: 4, opacity: 1, ease: "none", duration: 0.38 },
            0.18,
          );
        }

        lensTimeline
          .to(
            lensIntro,
            { y: -68, opacity: 0, ease: "none", duration: 0.38 },
            0.58,
          )
          .to(
            filmFrames,
            {
              y: (index) => (index % 2 === 0 ? -80 : 95),
              rotate: (index) => (index % 2 === 0 ? -5 : 6),
              scale: 0.86,
              stagger: 0.025,
              ease: "none",
              duration: 0.45,
            },
            0.62,
          )
          .to(
            lensScene,
            { backgroundColor: "#f1eee5", color: "#111210", ease: "none", duration: 0.4 },
            0.68,
          )
          .to(
            lensViewport,
            { opacity: 0.16, scale: 0.84, ease: "none", duration: 0.42 },
            0.7,
          )
          .fromTo(
            playObjects,
            {
              y: 120,
              scale: 0.72,
              rotate: 0,
              opacity: 0,
            },
            {
              y: 0,
              scale: 1,
              opacity: 1,
              stagger: 0.07,
              ease: "none",
              duration: 0.45,
            },
            0.7,
          );

        if (lensPolaroid) {
          lensTimeline.to(
            lensPolaroid,
            { y: 70, rotate: -7, opacity: 0, ease: "none", duration: 0.3 },
            0.72,
          );
        }

        const playgroundScene = siteRef.current?.querySelector<HTMLElement>(
          `.${styles.playground}`,
        );
        const playgroundHeading = playgroundScene?.querySelector(
          `.${styles.playgroundHeading}`,
        );
        const playgroundStage = playgroundScene?.querySelector(
          `.${styles.playgroundStage}`,
        );

        if (playgroundScene) {
          const playgroundHandoff = gsap.timeline({
            scrollTrigger: {
              id: "lens-playground-handoff",
              trigger: playgroundScene,
              start: "top bottom",
              end: "top top",
              scrub: 0.95,
              invalidateOnRefresh: true,
            },
          });

          playgroundHandoff.fromTo(
            playgroundScene,
            {
              clipPath:
                "polygon(0 20%, 27% 8%, 69% 16%, 100% 2%, 100% 100%, 0 100%)",
            },
            {
              clipPath:
                "polygon(0 0%, 27% 0%, 69% 0%, 100% 0%, 100% 100%, 0 100%)",
              ease: "none",
            },
            0,
          );

          if (playObjectsLayer) {
            playgroundHandoff.to(
              playObjectsLayer,
              {
                yPercent: -14,
                scale: 1.08,
                opacity: 0,
                filter: "blur(5px)",
                transformOrigin: "center",
                ease: "none",
              },
              0.16,
            );
          }

          if (playgroundHeading) {
            playgroundHandoff.fromTo(
              playgroundHeading,
              { y: 110, opacity: 0 },
              { y: 0, opacity: 1, ease: "none" },
              0.18,
            );
          }

          if (playgroundStage) {
            playgroundHandoff.fromTo(
              playgroundStage,
              { y: 150, scale: 0.97 },
              { y: 0, scale: 1, ease: "none" },
              0.25,
            );
          }
        }

        if (!playgroundScene || !noteGateScene || !noteGateStage || !tearRenderer) return;
        const noteCards = noteGateScene.querySelectorAll(
          `.${styles.noteGateWall} blockquote`,
        );
        const outgoingField = noteGateStage.querySelector(`.${styles.playgroundField}`);
        const noteGateCarry = noteGateScene.querySelector(`.${styles.noteGateCarry}`);
        const noteGateLabel = noteGateScene.querySelector(`.${styles.noteGateLabel}`);
        const noteGateWorldFar = noteGateScene.querySelector(
          `.${styles.noteGateWorldFar}`,
        );
        const noteGateWorldMid = noteGateScene.querySelector(
          `.${styles.noteGateWorldMid}`,
        );
        const noteGateWorldNear = noteGateScene.querySelector(
          `.${styles.noteGateWorldNear}`,
        );
        const noteGateCaption = noteGateScene.querySelector(`.${styles.noteGateCaption}`);

        const noteTimeline = gsap.timeline({
          scrollTrigger: {
            id: "playground-tear",
            trigger: noteGateStage,
            start: "top top",
            end: "+=240%",
            scrub: 1.15,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        noteTimeline
          .to(
            tearState,
            {
              progress: 1,
              ease: "none",
              duration: 1.5,
              onUpdate: () => tearRenderer?.render(tearState.progress),
            },
            0,
          )
          .to(
            outgoingField,
            {
              scale: 1.035,
              filter: "saturate(0.78) brightness(0.92)",
              ease: "none",
              duration: 1.2,
            },
            0,
          )
          .fromTo(
            noteGateWorldFar,
            { yPercent: -4, scale: 1.16, opacity: 0.72 },
            {
              yPercent: 5,
              scale: 1.05,
              opacity: 0.52,
              ease: "none",
              duration: 1.5,
            },
            0,
          )
          .fromTo(
            noteGateWorldMid,
            { yPercent: -15, scale: 1.2, opacity: 0.96 },
            {
              yPercent: 16,
              scale: 1,
              opacity: 0.78,
              ease: "none",
              duration: 1.5,
            },
            0,
          )
          .fromTo(
            noteGateWorldNear,
            {
              xPercent: -5,
              yPercent: -20,
              scale: 1.14,
              opacity: 1,
            },
            {
              xPercent: 8,
              yPercent: 18,
              scale: 1,
              opacity: 0.84,
              ease: "none",
              duration: 1.5,
            },
            0,
          )
          .fromTo(
            noteGateCaption,
            { y: 120, opacity: 0 },
            { y: -20, opacity: 1, ease: "none", duration: 0.72 },
            0.4,
          )
          .fromTo(
            noteCards,
            {
              y: 180,
              scale: 0.58,
              rotate: (index) => (index % 2 === 0 ? -5 : 4),
              opacity: 0,
            },
            {
              y: 0,
              scale: 1,
              rotate: (index) => [-2, 1.5, -1, 2, -1.5, 1, -2.2, 1.8][index] ?? 0,
              opacity: 1,
              stagger: 0.08,
              ease: "none",
              duration: 0.62,
            },
            0.72,
          )
          .fromTo(
            noteGateLabel,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, ease: "none", duration: 0.28 },
            0.88,
          )
          .to(
            noteGateLabel,
            { y: -18, opacity: 0, ease: "none", duration: 0.18 },
            1.3,
          )
          .to(
            outgoingField,
            {
              yPercent: -112,
              scale: 0.94,
              opacity: 0,
              filter: "blur(7px) saturate(0.55)",
              ease: "none",
              duration: 0.32,
            },
            1.02,
          )
          .to(
            noteGateScene,
            {
              yPercent: -100,
              ease: "none",
              duration: 0.52,
            },
            1.36,
          )
          .to(
            playgroundScene,
            {
              autoAlpha: 0,
              ease: "none",
              duration: 0.2,
            },
            1.72,
          );

        if (noteGateCarry) {
          noteTimeline
            .fromTo(
              noteGateCarry,
              { xPercent: 46, yPercent: 65, rotate: 8, scale: 0.56, opacity: 0 },
              {
                xPercent: 0,
                yPercent: 0,
                rotate: -3,
                scale: 0.92,
                opacity: 1,
                ease: "none",
                duration: 0.62,
              },
              0.52,
            )
            .to(
              noteGateCarry,
              { yPercent: -35, rotate: -8, opacity: 0, ease: "none", duration: 0.22 },
              1.28,
            );
        }

        const depthLayers = [
          noteGateWorldFar,
          noteGateWorldMid,
          noteGateWorldNear,
        ].filter((layer): layer is Element => Boolean(layer));
        const depthStrength = [10, 28, 52];
        const depthX = depthLayers.map((layer) =>
          gsap.quickTo(layer, "x", { duration: 0.9, ease: "power3.out" }),
        );
        const depthY = depthLayers.map((layer) =>
          gsap.quickTo(layer, "y", { duration: 1.1, ease: "power3.out" }),
        );
        const noteDepth = Array.from(noteCards).map((card) =>
          gsap.quickTo(card, "x", { duration: 0.82, ease: "power3.out" }),
        );
        const noteStrength = [18, -22, 26, -16];
        const moveDepth = (event: PointerEvent) => {
          const bounds = noteGateStage.getBoundingClientRect();
          const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
          const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;
          depthLayers.forEach((_, index) => {
            depthX[index](normalizedX * depthStrength[index]);
            depthY[index](normalizedY * depthStrength[index] * 0.55);
          });
          noteDepth.forEach((setX, index) => {
            setX(normalizedX * (noteStrength[index] ?? 14));
          });
        };
        const resetDepth = () => {
          depthLayers.forEach((_, index) => {
            depthX[index](0);
            depthY[index](0);
          });
          noteDepth.forEach((setX) => setX(0));
        };

        const guestbookScene = siteRef.current?.querySelector<HTMLElement>(
          `.${styles.guestbook}`,
        );
        const lastPageScene = siteRef.current?.querySelector<HTMLElement>(
          `.${styles.lastPage}`,
        );

        if (guestbookScene && lastPageScene) {
          const guestbookHeading = guestbookScene.querySelector(
            `.${styles.guestbookHeading}`,
          );
          const bookMessages = guestbookScene.querySelector(
            `.${styles.bookMessages}`,
          );
          const guestForm = guestbookScene.querySelector(`.${styles.guestForm}`);
          const lastCopy = lastPageScene.querySelector(`.${styles.lastCopy}`);
          const lastPhoto = lastPageScene.querySelector(`.${styles.lastPhoto}`);
          const lastPageHandoff = gsap.timeline({
            scrollTrigger: {
              id: "guestbook-last-page-handoff",
              trigger: lastPageScene,
              start: "top bottom",
              end: "top top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });

          lastPageHandoff.fromTo(
            lastPageScene,
            {
              clipPath: "polygon(58% 100%, 100% 68%, 100% 100%, 58% 100%)",
            },
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              ease: "none",
            },
            0,
          );

          if (guestbookHeading) {
            lastPageHandoff.to(
              guestbookHeading,
              { y: -90, opacity: 0.08, ease: "none" },
              0,
            );
          }

          if (bookMessages) {
            lastPageHandoff.to(
              bookMessages,
              {
                xPercent: -10,
                y: -130,
                scale: 0.9,
                opacity: 0.12,
                filter: "blur(5px)",
                transformOrigin: "left center",
                ease: "none",
              },
              0.04,
            );
          }

          if (guestForm) {
            lastPageHandoff.to(
              guestForm,
              {
                xPercent: 16,
                y: -150,
                rotate: 4,
                scale: 0.82,
                opacity: 0.1,
                transformOrigin: "right top",
                ease: "none",
              },
              0.08,
            );
          }

          if (lastPhoto) {
            lastPageHandoff.fromTo(
              lastPhoto,
              { yPercent: 18, scale: 1.16, filter: "saturate(0.55)" },
              { yPercent: 0, scale: 1, filter: "saturate(1)", ease: "none" },
              0.2,
            );
          }

          if (lastCopy) {
            lastPageHandoff.fromTo(
              lastCopy,
              { y: 100, opacity: 0 },
              { y: 0, opacity: 1, ease: "none" },
              0.34,
            );
          }
        }

        noteGateStage.addEventListener("pointermove", moveDepth);
        noteGateStage.addEventListener("pointerleave", resetDepth);

        return () => {
          noteGateStage.removeEventListener("pointermove", moveDepth);
          noteGateStage.removeEventListener("pointerleave", resetDepth);
        };
      });

      media.add("(max-width: 900px)", () => {
        const fragmentScene = siteRef.current?.querySelector<HTMLElement>(
          `.${styles.fragments}`,
        );
        if (!fragmentScene) return;
        const cards = fragmentScene.querySelectorAll(`.${styles.fragmentPhoto}`);
        gsap.from(cards, {
          y: 54,
          opacity: 0,
          stagger: 0.08,
          duration: 0.72,
          ease: "power3.out",
          scrollTrigger: {
            trigger: fragmentScene,
            start: "top 72%",
          },
        });

        if (!noteGateScene || !tearRenderer) return;
        const mobileNotes = noteGateScene.querySelectorAll(
          `.${styles.noteGateWall} blockquote`,
        );
        const mobileCarry = noteGateScene.querySelector(`.${styles.noteGateCarry}`);
        const mobileTear = { progress: 0 };

        gsap.to(mobileTear, {
          progress: 1,
          ease: "none",
          onUpdate: () => tearRenderer?.render(mobileTear.progress),
          scrollTrigger: {
            trigger: noteGateScene,
            start: "top 88%",
            end: "bottom 18%",
            scrub: 0.8,
          },
        });

        gsap.fromTo(
          mobileNotes,
          { y: 34, opacity: 0.35 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.035,
            ease: "none",
            scrollTrigger: {
              trigger: noteGateScene,
              start: "top 78%",
              end: "bottom 28%",
              scrub: 0.8,
            },
          },
        );

        if (mobileCarry) {
          gsap.fromTo(
            mobileCarry,
            { yPercent: 24, rotate: 8 },
            {
              yPercent: -42,
              rotate: -7,
              ease: "none",
              scrollTrigger: {
                trigger: noteGateScene,
                start: "top 90%",
                end: "bottom 20%",
                scrub: 0.8,
              },
            },
          );
        }
      });

    }, siteRef);

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 350);

    return () => {
      window.clearTimeout(refreshTimer);
      media.revert();
      ctx.revert();
      tearRenderer?.destroy();
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
      if (chapterItems.includes(id as SceneId)) {
        setActiveSection(id as SceneId);
      }
      const shouldReduceMotion = reduceMotion === true;
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      if (globalLenis) {
        globalLenis.scrollTo(top, { immediate: true });
      } else {
        window.scrollTo({ top, behavior: shouldReduceMotion ? "auto" : "smooth" });
      }
    };

    const refreshAndScroll = () => {
      ScrollTrigger.refresh();
      window.requestAnimationFrame(scrollToHash);
    };
    const frame = window.requestAnimationFrame(refreshAndScroll);
    const timers = [180, 620, 1400, 2600].map((delay) =>
      window.setTimeout(refreshAndScroll, delay),
    );
    window.addEventListener("hashchange", refreshAndScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("hashchange", refreshAndScroll);
    };
  }, [reduceMotion]);

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

  const jumpToProject = (index: number) => {
    const trigger = ScrollTrigger.getById("experiments-stage");
    if (trigger) {
      const projectStops = [0.06, 0.34, 0.6, 0.9];
      const progress = projectStops[index];
      const target = trigger.start + (trigger.end - trigger.start) * progress;
      if (globalLenis) {
        globalLenis.scrollTo(target, { duration: 1.1 });
      } else {
        window.scrollTo({ top: target, behavior: "smooth" });
      }
      return;
    }

    document
      .getElementById(`project-${experiments[index].number}`)
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <MotionConfig reducedMotion="user">
    <main
      ref={siteRef}
      className={styles.site}
      onPointerMove={(event) => {
        const target = event.target as HTMLElement;
        const parallaxTarget = target.closest<HTMLElement>("[data-parallax]");
        if (parallaxTargetRef.current !== parallaxTarget) {
          parallaxTargetRef.current?.style.setProperty("--parallax-x", "0px");
          parallaxTargetRef.current?.style.setProperty("--parallax-y", "0px");
          parallaxTargetRef.current = parallaxTarget;
        }
        if (parallaxTarget) {
          const bounds = parallaxTarget.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          parallaxTarget.style.setProperty("--parallax-x", `${x * 18}px`);
          parallaxTarget.style.setProperty("--parallax-y", `${y * 12}px`);
        }
      }}
      onPointerLeave={() => {
        parallaxTargetRef.current?.style.setProperty("--parallax-x", "0px");
        parallaxTargetRef.current?.style.setProperty("--parallax-y", "0px");
        parallaxTargetRef.current = null;
      }}
    >
      <SpineNavigation
        activeScene={activeSection}
        labels={sceneLabels}
        language={language}
        onLanguageChange={selectLanguage}
        onNavigate={navigateTo}
      />
      <SharedFieldObjects
        activeScene={activeSection}
        activeProject={activeProject}
        photoSrc={`${B}/images/about/nju.jpg`}
        projectSrc={`${B}/images/njumatch.png`}
        reduceMotion={reduceMotion === true}
      />

      <section id="poster" className={styles.poster}>
        <div className={styles.posterCoverMeta} aria-hidden="true">
          <span>THE IMPOSSIBLE FIELD NOTEBOOK</span>
          <span>MACAU / NANJING</span>
          <span>EDITION 2026</span>
        </div>
        <div className={styles.posterType}>
          <span className={styles.tree}>TREE</span>
          <span className={styles.hey}>HEY</span>
        </div>

        <div className={styles.posterIntro}>
          <p className={styles.introChinese}>{t.poster.intro}</p>
          <p>{t.poster.sub.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</p>
        </div>

        <a
          className={styles.scrollCue}
          href="#fragments"
          onClick={(event) => {
            event.preventDefault();
            navigateTo("fragments");
          }}
        >
          <ArrowDown aria-hidden="true" />
          <span>{t.poster.scroll}</span>
        </a>
      </section>

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
          <a href="#experiments" className={styles.textLink} data-cursor="NEXT">
            {t.fragments.link} <ArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <div className={styles.fragmentBoard}>
          {fragments.map((fragment, index) => (
            <figure
              key={fragment.src}
              className={`${styles.fragmentPhoto} ${fragment.className}`}
            >
              <Image
                src={fragment.src}
                alt={fragment.alt}
                fill
                sizes="(max-width: 720px) 80vw, 30vw"
                className={styles.fragmentOriginalImage}
              />
              <Image
                src={experiments[index].src}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 720px) 80vw, 46vw"
                className={styles.fragmentProjectImage}
              />
              <figcaption className={styles.fragmentCaption}>{fragment.caption}</figcaption>
              <div className={styles.fragmentProjectMeta}>
                <span>{experiments[index].number}</span>
                <strong>{experiments[index].title}</strong>
                <small>{experiments[index].tags}</small>
              </div>
            </figure>
          ))}

          <blockquote className={styles.blueNote}>
            Make something people love to use. Then keep it simple.
          </blockquote>

          <blockquote className={styles.blackNote}>
            <span>设计让复杂变得可感知。</span>
            Design makes complexity perceivable.
          </blockquote>

          <div className={styles.fieldList}>
            <span>Observe</span>
            <span>Capture</span>
            <span>Prototype</span>
            <span>Share</span>
          </div>
        </div>
      </section>

      <section id="experiments" className={styles.experiments}>
        <div
          className={`${styles.experimentsStage} ${
            activeProject === 2 ? styles.projectStageDark : ""
          }`}
        >
          <div className={styles.experimentsHeading}>
            <SectionLabel index="02" en={t.nav.experiments[0]} zh={t.nav.experiments[1]} />
            <div className={styles.experimentsIntro}>
              <p>{t.experiments.kicker}</p>
              <h2>{t.experiments.title}</h2>
              <p>{t.experiments.copy}</p>
            </div>
          </div>

          <div className={styles.projectScenes}>
            {experiments.map((project, index) => (
              <article
                id={`project-${project.number}`}
                key={project.number}
                className={`${styles.projectScene} ${project.className}`}
              >
                <a href={project.href} target="_blank" rel="noreferrer" data-cursor="OPEN">
                  <div className={styles.projectSceneNumber}>
                    <span>{project.number}</span>
                    <small>0{index + 1} / 04</small>
                  </div>

                  <div className={styles.projectSceneCopy}>
                    <span>{project.tags}</span>
                    <h3>{project.title}</h3>
                    <p>{project.zh}</p>
                    <blockquote>{t.experiments.notes[index]}</blockquote>
                  </div>

                  <div className={styles.projectSceneMedia} data-parallax>
                    <Image
                      src={project.src}
                      alt={`${project.title} project interface`}
                      fill
                      sizes="(max-width: 900px) 92vw, 66vw"
                    />
                  </div>

                  <div className={styles.projectSceneAction}>
                    <span>Open project</span>
                    <ArrowUpRight aria-hidden="true" />
                  </div>
                </a>
              </article>
            ))}
          </div>

          <nav className={styles.projectIndex} aria-label="Project index">
            {experiments.map((project, index) => (
              <button
                type="button"
                key={`index-${project.number}`}
                className={activeProject === index ? styles.projectIndexActive : undefined}
                onClick={() => jumpToProject(index)}
                aria-label={`Go to ${project.title}`}
              >
                <span>{project.number}</span>
                <strong>{project.title}</strong>
              </button>
            ))}
          </nav>

          <div className={styles.projectCounter} aria-live="polite">
            <span>{experiments[activeProject].number}</span>
            <small>{experiments[activeProject].tags}</small>
          </div>

          <div className={styles.filmGate} aria-hidden="true">
            <div className={styles.filmGateTrack}>
              {lensPhotos.map((photo) => (
                <figure key={`film-gate-${photo.number}`}>
                  <Image src={photo.src} alt="" fill sizes="25vw" />
                  <figcaption>{photo.number}</figcaption>
                </figure>
              ))}
            </div>
            <span>03 / light develops into contact sheets</span>
          </div>
        </div>
      </section>

      <section id="lens" className={styles.lens}>
        <div className={styles.lensStage}>
          <div className={styles.lensIntro}>
            <SectionLabel index="03" en={t.nav.lens[0]} zh={t.nav.lens[1]} />
            <h2>{t.lens.title}</h2>
            <p>{t.lens.copy}</p>
            <a
              href={`${B}/images/HK.jpg`}
              target="_blank"
              className={styles.lensLink}
              data-cursor="VIEW"
            >
              {t.lens.link} <ArrowUpRight aria-hidden="true" />
            </a>
          </div>

          <div className={styles.filmViewport}>
            <div className={styles.filmStrip}>
              {[...lensPhotos, ...lensPhotos].map((photo, index) => (
                <a
                  href={photo.src}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.filmFrame}
                  key={`${photo.number}-${index}`}
                  data-cursor="VIEW"
                >
                  <span>{photo.number}</span>
                  <div data-parallax>
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
            </div>
          </div>

          <figure className={styles.lensPolaroid}>
            <Image
              src={`${B}/images/3.jpg`}
              alt="A quiet personal photograph"
              fill
              sizes="200px"
            />
            <figcaption>2026.05</figcaption>
          </figure>

          <div className={styles.lensPlayObjects} aria-hidden="true">
            <Image src={`${B}/images/about/computer-room.jpg`} alt="" width={420} height={300} />
            <Image
              src={`${B}/images/about/Minecraft.jfif`}
              alt=""
              width={480}
              height={300}
              style={{ height: "auto" }}
            />
            <Image src={`${B}/sloth_color.png`} alt="" width={210} height={210} />
          </div>
        </div>
      </section>

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
            data-cursor="SHUFFLE"
          >
            <Shuffle aria-hidden="true" />
            <span>{t.playground.shuffle}</span>
          </button>
        </div>

        <div className={styles.playgroundStage}>
          <div className={styles.playgroundField} ref={playgroundRef}>
          <motion.figure
            key={`camera-${playgroundKey}`}
            className={`${styles.playObject} ${styles.playCamera}`}
            drag
            dragConstraints={playgroundRef}
            dragElastic={0.12}
            whileDrag={{ scale: 1.04, rotate: 0, zIndex: 8 }}
            data-cursor="DRAG"
            initial={{ x: playgroundKey % 2 ? 30 : 0, rotate: -5 }}
            animate={{ x: 0, rotate: -3 }}
          >
            <Image
              src={`${B}/images/about/computer-room.jpg`}
              alt="A creative desk"
              fill
              loading="eager"
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
            data-cursor="DRAG"
            initial={{ x: playgroundKey % 2 ? -35 : 0, rotate: 5 }}
            animate={{ x: 0, rotate: 2 }}
          >
            <Image
              src={`${B}/images/about/Minecraft.png`}
              alt="Minecraft experiment"
              fill
              loading="eager"
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
            data-cursor="DRAG"
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
            data-cursor="DRAG"
            initial={{ opacity: 0, rotate: 8 }}
            animate={{ opacity: 1, rotate: -2 }}
          >
            Curiosity is a tool.<br />Use it until the edges wear out.
          </motion.blockquote>
          </div>

          <div className={styles.noteGate} aria-hidden="true">
            <canvas className={styles.noteTearCanvas} aria-hidden="true" />
            <div className={styles.noteGateReveal}>
              <div className={styles.noteGateWorld}>
                <Image
                  src={`${B}/images/field-notebook-archive-far.png`}
                  alt=""
                  fill
                  sizes="100vw"
                  className={styles.noteGateWorldFar}
                />
                <Image
                  src={`${B}/images/field-notebook-archive-mid.png`}
                  alt=""
                  fill
                  sizes="100vw"
                  className={styles.noteGateWorldMid}
                />
                <Image
                  src={`${B}/images/field-notebook-archive-near.png`}
                  alt=""
                  fill
                  sizes="100vw"
                  className={styles.noteGateWorldNear}
                />
              </div>
              <div className={styles.noteGateDepthGrid} />
              <div className={styles.noteGateCaption}>
                <strong>FIELD NOTES / 生活痕迹</strong>
                <span>MACAU · I</span>
                <span>NANJING · II</span>
                <span>PRODUCTS · III</span>
                <span>PHOTOGRAPHS · IV</span>
                <span>SMALL WORLDS · V</span>
                <span>GUESTBOOK · VI</span>
              </div>
              <div className={styles.noteGateWall}>
                {guestEntries.slice(0, 8).map((entry) => (
                  <blockquote
                    key={`note-gate-${entry.id}`}
                    style={{ ["--note-color" as string]: entry.color || "#f8f5ed" }}
                  >
                    <p>{entry.message}</p>
                    <cite>{entry.nickname || "Anonymous"}</cite>
                  </blockquote>
                ))}
              </div>
              <figure className={styles.noteGateCarry}>
                <Image src={`${B}/sloth_color.png`} alt="" fill sizes="18vw" />
              </figure>
            </div>
            <span className={styles.noteGateLabel}>05 / traces become paper</span>
          </div>
        </div>
      </section>

      <section id="guestbook" className={styles.guestbook}>
        <div className={styles.guestbookHeading}>
          <SectionLabel index="05" en={t.nav.guestbook[0]} zh={t.nav.guestbook[1]} />
          <h2>{t.guestbook.title}</h2>
          <p>{t.guestbook.copy}</p>
        </div>

        <div className={styles.guestbookWall}>
          <div className={styles.bookMessages}>
            {guestEntries.map((entry, index) => (
              <motion.blockquote
                key={entry.id}
                className={styles.guestEntry}
                style={{ ["--note-color" as string]: entry.color || "#f8f5ed" }}
                title={entry.message ?? undefined}
                initial={{ opacity: 0, y: 24, rotate: index % 2 ? 1.5 : -1.5 }}
                whileInView={{ opacity: 1, y: 0, rotate: index % 2 ? 0.6 : -0.6 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(index * 0.04, 0.28) }}
                data-cursor="READ"
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

          <form className={styles.guestForm} onSubmit={submitGuestbook} data-cursor="WRITE">
            <span className={styles.formKicker}>PIN A NEW NOTE / 贴一张新便签</span>
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

      <footer id="last-page" className={styles.lastPage}>
        <SectionLabel index="06" en="Last Page" zh={language === "繁" ? "最後一頁" : language === "EN" ? "Closing" : "最后一页"} />
        <div className={styles.lastGrid}>
          <div className={styles.lastCopy}>
            <p>{t.last.pre.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</p>
            <h2>{t.last.title.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h2>
            <div className={styles.emailRow}>
              <a href="mailto:123kevinlio@gmail.com">123kevinlio@gmail.com</a>
              <button
                type="button"
                onClick={copyEmail}
                aria-label="Copy email address"
                data-cursor="COPY"
              >
                {copied ? <Check /> : <Copy />}
              </button>
            </div>
            <div className={styles.socialRow}>
              <a
                href="https://github.com/treehey"
                target="_blank"
                rel="noreferrer"
                data-cursor="VISIT"
              >
                GitHub <ArrowUpRight aria-hidden="true" />
              </a>
              <a
                href="https://www.instagram.com/tree_hey/"
                target="_blank"
                rel="noreferrer"
                data-cursor="VISIT"
              >
                Instagram <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
            <div className={styles.lastCredits}>
              <span>React · TypeScript · GSAP · Lenis</span>
              <span>Macau · Nanjing · Suzhou · Hong Kong</span>
              <span>Field notes / 2024—2026</span>
            </div>
          </div>
          <figure className={styles.lastPhoto} data-cursor="LOOK" data-parallax>
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

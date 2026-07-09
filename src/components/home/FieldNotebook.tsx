"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, Menu, X } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import styles from "./FieldNotebook.module.css";

const B = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const navItems = [
  ["fragments", "Fragments", "碎片"],
  ["experiments", "Experiments", "实验"],
  ["lens", "Lens", "镜头"],
  ["playground", "Playground", "游乐场"],
  ["guestbook", "Guestbook", "留言簿"],
] as const;

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
    note: "让一次相遇，从真实校园里发生。",
    className: styles.projectNju,
  },
  {
    number: "02",
    title: "Fimel",
    zh: "繁梦工作室",
    src: `${B}/images/fimel.png`,
    href: "https://treehey.github.io/Fimel/",
    tags: "Minecraft / Creative web",
    note: "为创作者搭一座可以漫游的入口。",
    className: styles.projectFimel,
  },
  {
    number: "03",
    title: "Wide Research",
    zh: "宽研",
    src: `${B}/images/wide-research.png`,
    href: "https://finai.org.cn",
    tags: "AI / Information design",
    note: "让研究更宽，也让噪声更少。",
    className: styles.projectWide,
  },
  {
    number: "04",
    title: "Enzyme Explorer",
    zh: "酶学探索",
    src: `${B}/images/enzyme.png`,
    href: "https://treehey.github.io/Enzyme/",
    tags: "Science / Interactive web",
    note: "从食物出发，摸到看不见的反应。",
    className: styles.projectEnzyme,
  },
] as const;

const lensPhotos = [
  { src: `${B}/images/HK.jpg`, place: "Hong Kong", number: "42" },
  { src: `${B}/images/shanghai.jpg`, place: "Shanghai", number: "43" },
  { src: `${B}/images/zhuhai.jpg`, place: "Zhuhai", number: "44" },
  { src: `${B}/images/panda.jpg`, place: "Sichuan", number: "45" },
] as const;

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
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const treeX = useTransform(scrollYProgress, [0, 0.12], ["0%", "-4%"]);
  const heyX = useTransform(scrollYProgress, [0, 0.12], ["0%", "5%"]);
  const posterScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.96]);

  useEffect(() => {
    document.documentElement.classList.add("field-notebook-theme");
    return () => document.documentElement.classList.remove("field-notebook-theme");
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className={styles.site}>
      <header className={styles.header}>
        <a className={styles.brand} href="#poster" onClick={closeMenu}>
          TREE HEY
        </a>
        <span className={styles.runningTitle}>Living Field Notebook</span>
        <nav className={styles.desktopNav} aria-label="Primary navigation">
          {navItems.slice(0, 4).map(([id, en]) => (
            <a key={id} href={`#${id}`}>
              {en}
            </a>
          ))}
        </nav>
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
          {navItems.map(([id, en, zh], index) => (
            <a key={id} href={`#${id}`} onClick={closeMenu}>
              <span>0{index + 1}</span>
              <strong>{en}</strong>
              <small>{zh}</small>
            </a>
          ))}
        </motion.nav>
      )}

      <section id="poster" className={styles.poster}>
        <motion.div
          className={styles.posterType}
          style={reduceMotion ? undefined : { scale: posterScale }}
        >
          <motion.span
            className={styles.tree}
            style={reduceMotion ? undefined : { x: treeX }}
          >
            TREE
          </motion.span>
          <motion.span
            className={styles.hey}
            style={reduceMotion ? undefined : { x: heyX }}
          >
            HEY
          </motion.span>
        </motion.div>

        <div className={styles.archiveTab}>
          <span>2026</span>
          <span>FIELD NOTES</span>
        </div>

        <div className={styles.posterIntro}>
          <p className={styles.introChinese}>用好奇心，构建有趣的东西。</p>
          <p>Design &amp; build<br />playful things<br />with curiosity.</p>
        </div>

        <motion.aside
          className={styles.redNote}
          initial={{ opacity: 0, rotate: -4, y: 18 }}
          animate={{ opacity: 1, rotate: 2, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
        >
          Build<br />Play<br />Observe<br />Share
        </motion.aside>

        <a className={styles.scrollCue} href="#fragments">
          <ArrowDown aria-hidden="true" />
          <span>Scroll to explore</span>
        </a>
      </section>

      <section id="fragments" className={styles.fragments}>
        <SectionLabel index="01" en="Fragments" zh="碎片" />
        <div className={styles.fragmentsIntro}>
          <p>碎片、实验、与视角</p>
          <h1>
            Fragments,<br />
            Experiments,<br />
            <span>&amp; Lens.</span>
          </h1>
          <p className={styles.fragmentsCopy}>
            这里是我捕捉思绪、记录实验、探索视角，并打造小世界的地方。
          </p>
          <a href="#experiments" className={styles.textLink}>
            Explore notebook <ArrowUpRight aria-hidden="true" />
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

      <section id="experiments" className={styles.experiments}>
        <div className={styles.experimentsHeading}>
          <SectionLabel index="02" en="Experiments" zh="实验" />
          <div>
            <p>Experiments</p>
            <h2>实验现场</h2>
            <p>想法的展墙，视觉的实验场。每一件都从真实的问题开始。</p>
          </div>
          <span className={styles.projectCount}>01 — 04</span>
        </div>

        <div className={styles.projectWall}>
          {experiments.map((project, index) => (
            <motion.article
              key={project.number}
              className={`${styles.project} ${project.className}`}
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
                  <p>{project.note}</p>
                </div>
              </a>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="lens" className={styles.lens}>
        <div className={styles.lensIntro}>
          <SectionLabel index="03" en="Lens" zh="镜头" />
          <h2>镜头记录</h2>
          <p>生活里的光与影，构成另一种结构练习。</p>
          <a href={`${B}/images/HK.jpg`} target="_blank" className={styles.lensLink}>
            View all <ArrowUpRight aria-hidden="true" />
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
    </main>
  );
}

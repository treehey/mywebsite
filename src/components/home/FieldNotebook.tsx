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

      <section id="experiments" className={styles.placeholderSection}>
        <SectionLabel index="02" en="Experiments" zh="实验" />
      </section>
    </main>
  );
}

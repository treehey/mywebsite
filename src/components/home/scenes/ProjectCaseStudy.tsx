"use client";

import { useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import styles from "../FieldNotebook.module.css";

export type ProjectStory = {
  number: string;
  title: string;
  zh: string;
  src: string;
  href: string;
  tags: string;
  problem: string;
  process: string;
  outcome: string;
};

type ProjectCaseStudyProps = {
  project: ProjectStory | null;
  onClose: () => void;
};

export function ProjectCaseStudy({ project, onClose }: ProjectCaseStudyProps) {
  useEffect(() => {
    if (!project) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, project]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          className={styles.caseStudyOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} case study`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.article
            className={styles.caseStudy}
            initial={{ y: "8vh" }}
            animate={{ y: 0 }}
            exit={{ y: "6vh" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className={styles.caseStudyHeader}>
              <span>{project.number} / FIELD EXPERIMENT</span>
              <button type="button" onClick={onClose} aria-label="Close project story">
                <X aria-hidden="true" />
              </button>
            </header>

            <div className={styles.caseStudyTitle}>
              <p>{project.tags}</p>
              <h2>{project.title}</h2>
              <strong>{project.zh}</strong>
            </div>

            <motion.figure
              className={styles.caseStudyVisual}
              layoutId={`project-visual-${project.number}`}
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image src={project.src} alt={`${project.title} interface`} fill sizes="92vw" />
            </motion.figure>

            <div className={styles.caseStudyNarrative}>
              <section>
                <span>01 / 问题</span>
                <h3>Problem</h3>
                <p>{project.problem}</p>
              </section>
              <section>
                <span>02 / 过程</span>
                <h3>Process</h3>
                <p>{project.process}</p>
              </section>
              <section>
                <span>03 / 结果</span>
                <h3>Outcome</h3>
                <p>{project.outcome}</p>
              </section>
            </div>

            <a className={styles.caseStudyExit} href={project.href} target="_blank" rel="noreferrer">
              <span>访问正式项目</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

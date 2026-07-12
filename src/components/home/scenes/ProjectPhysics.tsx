"use client";

import type { CSSProperties } from "react";
import styles from "../FieldNotebook.module.css";

export type MotionLanguage = "connect" | "build" | "structure" | "react";

const points = [
  [18, 24], [43, 18], [74, 29], [28, 63], [58, 56], [82, 72],
];

export function ProjectPhysics({ language }: { language: MotionLanguage }) {
  if (language === "connect") {
    return (
      <div className={`${styles.projectPhysics} ${styles.physicsConnect}`} aria-hidden="true">
        <i className={styles.connectionLineA} data-physics-piece />
        <i className={styles.connectionLineB} data-physics-piece />
        <i className={styles.connectionLineC} data-physics-piece />
        {points.map(([x, y], index) => (
          <span
            key={`${x}-${y}`}
            data-physics-piece
            style={{ "--x": `${x}%`, "--y": `${y}%`, "--i": index } as CSSProperties}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        ))}
      </div>
    );
  }

  if (language === "build") {
    return (
      <div className={`${styles.projectPhysics} ${styles.physicsBuild}`} aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => (
          <span
            key={index}
            data-physics-piece
            style={{ "--i": index } as CSSProperties}
          />
        ))}
      </div>
    );
  }

  if (language === "structure") {
    return (
      <div className={`${styles.projectPhysics} ${styles.physicsStructure}`} aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            data-physics-piece
            style={{ "--i": index } as CSSProperties}
          >
            <i />
            <b>{String((index + 2) * 17).padStart(3, "0")}</b>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`${styles.projectPhysics} ${styles.physicsReact}`} aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => (
        <span
          key={index}
          data-physics-piece
          style={{ "--i": index } as CSSProperties}
        />
      ))}
    </div>
  );
}

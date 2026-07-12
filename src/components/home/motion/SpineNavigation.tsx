"use client";

import { Globe2 } from "lucide-react";
import styles from "../FieldNotebook.module.css";
import { sceneIds, sceneIndex, type SceneId } from "./sceneRegistry";

type Language = "简" | "繁" | "EN";

type SpineNavigationProps = {
  activeScene: SceneId;
  labels: Record<SceneId, string>;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onNavigate: (scene: SceneId) => void;
};

export function SpineNavigation({
  activeScene,
  labels,
  language,
  onLanguageChange,
  onNavigate,
}: SpineNavigationProps) {
  return (
    <>
      <button
        type="button"
        className={styles.spineBrand}
        onClick={() => onNavigate("poster")}
      >
        TREE HEY
      </button>

      <nav className={styles.spineNavigation} aria-label="Notebook chapters">
        <span
          className={styles.spineMarker}
          style={{ "--scene-index": sceneIndex(activeScene) } as React.CSSProperties}
          aria-hidden="true"
        />
        {sceneIds.map((id, index) => (
          <button
            type="button"
            key={id}
            className={activeScene === id ? styles.spineActive : undefined}
            onClick={() => onNavigate(id)}
            aria-current={activeScene === id ? "step" : undefined}
          >
            <span>{String(index).padStart(2, "0")}</span>
            <strong>{labels[id]}</strong>
          </button>
        ))}
      </nav>

      <label className={styles.spineLanguage}>
        <Globe2 aria-hidden="true" />
        <span className="sr-only">Language</span>
        <select
          value={language}
          onChange={(event) => onLanguageChange(event.target.value as Language)}
        >
          <option value="简">简</option>
          <option value="繁">繁</option>
          <option value="EN">EN</option>
        </select>
      </label>
    </>
  );
}

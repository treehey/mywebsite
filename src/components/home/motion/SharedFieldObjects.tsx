"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "../FieldNotebook.module.css";
import { motionTokens } from "./motionTokens";
import type { SceneId } from "./sceneRegistry";

const markerStates = {
  poster: { left: "30vw", top: "19vh", width: "8rem", height: "8rem", scale: 1 },
  fragments: { left: "70vw", top: "27vh", width: "1.15rem", height: "1.15rem", scale: 1 },
  experiments: { left: "92vw", top: "48vh", width: "1.4rem", height: "1.4rem", scale: 1 },
  lens: { left: "51vw", top: "48vh", width: "11rem", height: "11rem", scale: 1 },
  playground: { left: "73vw", top: "57vh", width: "1.25rem", height: "1.25rem", scale: 1 },
  guestbook: { left: "76vw", top: "31vh", width: "3.1rem", height: "3.1rem", scale: 1 },
  "last-page": { left: "45vw", top: "42vh", width: "1.15rem", height: "1.15rem", scale: 1 },
} satisfies Record<SceneId, object>;

const photoStates = {
  poster: { left: "73vw", top: "17vh", width: "14vw", height: "19vh", rotate: 4, opacity: 1 },
  fragments: { left: "57vw", top: "43vh", width: "22vw", height: "29vh", rotate: -2, opacity: 0.94 },
  experiments: { left: "34vw", top: "19vh", width: "49vw", height: "55vh", rotate: 0, opacity: 0.12 },
  lens: { left: "19vw", top: "63vh", width: "62vw", height: "18vh", rotate: 0, opacity: 0.16 },
  playground: { left: "66vw", top: "41vh", width: "19vw", height: "27vh", rotate: 4, opacity: 0.32 },
  guestbook: { left: "13vw", top: "66vh", width: "19vw", height: "21vh", rotate: -3, opacity: 0.2 },
  "last-page": { left: "59vw", top: "31vh", width: "32vw", height: "45vh", rotate: 1, opacity: 0.14 },
} satisfies Record<SceneId, object>;

type SharedFieldObjectsProps = {
  activeScene: SceneId;
  photoSrc: string;
  reduceMotion: boolean;
};

export function SharedFieldObjects({
  activeScene,
  photoSrc,
  reduceMotion,
}: SharedFieldObjectsProps) {
  return (
    <div className={styles.sharedFieldObjects} data-scene={activeScene} aria-hidden="true">
      <motion.div
        className={styles.sharedMarker}
        animate={markerStates[activeScene]}
        transition={reduceMotion ? { duration: 0 } : motionTokens.snapSpring}
      />
      <motion.figure
        className={styles.sharedPhoto}
        animate={photoStates[activeScene]}
        transition={reduceMotion ? { duration: 0 } : motionTokens.spring}
      >
        <Image src={photoSrc} alt="" fill sizes="62vw" priority />
        <figcaption>MACAU / OBSERVATION 03</figcaption>
      </motion.figure>
      <div className={styles.sharedPaperEdge} />
    </div>
  );
}

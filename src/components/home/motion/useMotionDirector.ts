"use client";

import { RefObject, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { globalLenis } from "../../SmoothScroll";
import { sceneIds, type SceneId } from "./sceneRegistry";

type MotionDirectorOptions = {
  rootRef: RefObject<HTMLElement | null>;
  activeScene: SceneId;
  onSceneChange: (scene: SceneId) => void;
  reduceMotion: boolean;
};

export function useMotionDirector({
  rootRef,
  activeScene,
  onSceneChange,
  reduceMotion,
}: MotionDirectorOptions) {
  const activeRef = useRef(activeScene);
  const navigationTimer = useRef<number | null>(null);

  useEffect(() => {
    activeRef.current = activeScene;
  }, [activeScene]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    let previousProgress = 0;
    let frame = 0;

    const resolveScene = () => {
      frame = 0;
      const probeY = window.innerHeight * 0.46;
      const scenes = sceneIds
        .map((id) => ({ id, rect: document.getElementById(id)?.getBoundingClientRect() }))
        .filter((scene) => scene.rect);
      const visible = [...scenes]
        .filter((scene) => scene.rect!.top <= probeY && scene.rect!.bottom > probeY)
        .sort((a, b) => b.rect!.top - a.rect!.top)[0];
      const nearest = [...scenes]
        .filter((scene) => scene.rect!.top <= probeY)
        .sort((a, b) => b.rect!.top - a.rect!.top)[0];
      const next = visible?.id ?? nearest?.id ?? "poster";
      if (activeRef.current !== next) {
        activeRef.current = next;
        onSceneChange(next);
      }
    };

    const requestResolve = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(resolveScene);
    };

    const progressTrigger = ScrollTrigger.create({
      id: "field-notebook-director",
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const direction = self.progress >= previousProgress ? 1 : -1;
        previousProgress = self.progress;
        root.style.setProperty("--director-progress", self.progress.toFixed(4));
        root.style.setProperty("--director-direction", String(direction));
        root.style.setProperty(
          "--director-velocity",
          Math.min(Math.abs(self.getVelocity()) / 2400, 1).toFixed(3),
        );
        requestResolve();
      },
    });
    resolveScene();
    const settleTimers = [80, 360, 900].map((delay) =>
      window.setTimeout(requestResolve, delay),
    );
    ScrollTrigger.addEventListener("refresh", requestResolve);
    window.addEventListener("scroll", requestResolve, { passive: true });
    window.addEventListener("resize", requestResolve);

    return () => {
      progressTrigger.kill();
      settleTimers.forEach((timer) => window.clearTimeout(timer));
      window.cancelAnimationFrame(frame);
      ScrollTrigger.removeEventListener("refresh", requestResolve);
      window.removeEventListener("scroll", requestResolve);
      window.removeEventListener("resize", requestResolve);
    };
  }, [onSceneChange, rootRef]);

  const navigateTo = useCallback(
    (id: SceneId) => {
      const target = document.getElementById(id);
      if (!target) return;

      onSceneChange(id);
      if (navigationTimer.current) window.clearTimeout(navigationTimer.current);
      navigationTimer.current = window.setTimeout(() => {
        const top = target.getBoundingClientRect().top + window.scrollY;
        if (globalLenis) {
          globalLenis.scrollTo(top, {
            duration: reduceMotion ? 0 : 1.35,
            immediate: reduceMotion,
          });
        } else {
          window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
        }
      }, reduceMotion ? 0 : 180);
    },
    [onSceneChange, reduceMotion],
  );

  useEffect(
    () => () => {
      if (navigationTimer.current) window.clearTimeout(navigationTimer.current);
    },
    [],
  );

  return { navigateTo };
}

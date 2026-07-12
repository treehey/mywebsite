export const sceneIds = [
  "poster",
  "fragments",
  "experiments",
  "lens",
  "playground",
  "guestbook",
  "last-page",
] as const;

export type SceneId = (typeof sceneIds)[number];

export type CameraMode =
  | "cover-push"
  | "desk-drift"
  | "stage-lock"
  | "film-track"
  | "tabletop"
  | "wall-rise"
  | "cover-close";

export type SharedObjectRole =
  | "observation-photo"
  | "pinned-fragment"
  | "project-screen"
  | "film-frame"
  | "loose-print"
  | "guest-note"
  | "final-memory";

export type MarkerRole =
  | "observation-ring"
  | "photo-pin"
  | "project-index"
  | "focus-ring"
  | "snap-point"
  | "note-stamp"
  | "full-stop";

export type SceneDefinition = {
  id: SceneId;
  camera: CameraMode;
  sharedObject: SharedObjectRole;
  marker: MarkerRole;
  settleAt: number;
};

export const sceneRegistry: readonly SceneDefinition[] = [
  { id: "poster", camera: "cover-push", sharedObject: "observation-photo", marker: "observation-ring", settleAt: 0.62 },
  { id: "fragments", camera: "desk-drift", sharedObject: "pinned-fragment", marker: "photo-pin", settleAt: 0.58 },
  { id: "experiments", camera: "stage-lock", sharedObject: "project-screen", marker: "project-index", settleAt: 0.64 },
  { id: "lens", camera: "film-track", sharedObject: "film-frame", marker: "focus-ring", settleAt: 0.56 },
  { id: "playground", camera: "tabletop", sharedObject: "loose-print", marker: "snap-point", settleAt: 0.6 },
  { id: "guestbook", camera: "wall-rise", sharedObject: "guest-note", marker: "note-stamp", settleAt: 0.62 },
  { id: "last-page", camera: "cover-close", sharedObject: "final-memory", marker: "full-stop", settleAt: 0.68 },
] as const;

export const sceneIndex = (id: SceneId) =>
  sceneRegistry.findIndex((scene) => scene.id === id);

# Winter 2026 Tear Transition Study

Reference: `https://www.shopify.com/editions/winter2026`

## Runtime Evidence

SOURCE:

- The transition is a sticky, viewport-sized canvas scene.
- Lenis is active during the scroll sequence.
- The torn contour moves through the viewport while the next scene already exists behind it.
- High-contrast scene replacement, edge particles, and objects crossing the boundary make the effect read as a physical reveal rather than a divider.

PARTIAL:

- The reference includes paper texture and normal-map assets.
- Several background elements move at different rates, producing a theatrical depth effect.

GUESS:

- The exact shader/noise formula and mask compositing pipeline are not publicly attributable from runtime evidence alone.

## Local Translation

- A custom Canvas 2D renderer draws the live torn edge from deterministic broad waves, time-based ripples, scroll-velocity energy, fibers, paper dust, and shadow.
- The real draggable Playground is the outgoing paper surface; there is no duplicated transition screen.
- One ScrollTrigger pins the full-viewport Playground stage, drives the tear, then lifts the outgoing stage while the real Guestbook takes over from below.
- The torn contour and revealed DOM layer share one generated clip path.
- Image 2 produced an original archive world, then semantically extracted independent middle- and foreground layers.
- The far, middle, and foreground PNGs move at different scroll and pointer rates.
- Playground objects remain above the tear while guest notes and the sloth cross into the revealed world.
- Guest notes add a fourth pointer-parallax plane above the three Image 2 background depths.
- Mobile uses a shorter non-pinned reveal; reduced motion removes the transition gate.

No Shopify source code, textures, or production assets are included.

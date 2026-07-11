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

## Continuous Handoff Grammar

The reference works because the transition is part of the scene choreography, not a separate separator. The local site applies that principle with a different transition designed for each pair of chapters:

- Poster to Fragments: the next paper world opens through a clipped window while the title is still in frame.
- Fragments to Experiments: the selected project image expands as the desk artifacts blur behind it.
- Experiments to Lens: a thin photographic band develops over the final project before taking the viewport.
- Lens to Playground: the contact sheet scatters in depth while an angled paper stage lands above it.
- Playground to Guestbook: the custom live tear exposes the layered archive and real messages underneath.
- Guestbook to Last Page: the dark note wall recedes while the closing page unfolds diagonally into place.

Every desktop handoff keeps the outgoing and incoming chapters visible in the same viewport. Overlapping section geometry removes the blank scroll interval between the end of one timeline and the beginning of the next. CSS view-timeline effects are limited to mobile so they cannot override the desktop GSAP transforms.

Contextual cursor verbs and bounded media parallax provide local interaction depth between the larger scroll beats. These effects use original DOM, Canvas 2D, GSAP ScrollTrigger, Framer Motion, and generated archive imagery.

No Shopify source code, textures, or production assets are included.

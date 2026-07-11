# Design QA

- Implementation URL: `http://localhost:3000`
- Master direction: `ONE LONG TAKE`
- Motion reference studied: `https://www.shopify.com/editions/winter2026`
- Primary evidence: `output/playwright/continuity-audit-phase-11/`
- Desktop viewport: 1440 x 900
- Mobile viewport: 390 x 844
- Modes checked: default motion and `prefers-reduced-motion: reduce`
- Locales checked: Simplified Chinese, Traditional Chinese, and English

## Result

- No remaining P0-P2 visual, interaction, responsive, or accessibility issues found.
- Production build and TypeScript compilation pass.
- Default-motion and reduced-motion sessions report zero console errors.
- Desktop and mobile layouts report zero horizontal overflow.
- Desktop document height is 14,046 px, down from the earlier 18,183 px sequence after removing duplicated transition holds.

## Motion And Transitions

- Hero is a pinned poster scene with scroll-linked type separation, artifact reveals, and velocity-reactive marquee motion.
- Hero and Fragments share the final poster viewport; a four-step clipped paper window expands over the outgoing type.
- Fragments blur and recede behind the NJU project stage instead of ending at a hard section boundary.
- Four project scenes use distinct full-screen compositions and a clickable project index.
- Enzyme remains visible while Lens develops through a narrow central film band.
- Lens photographs scatter as an angled Playground sheet enters the same viewport and lands above them.
- The real Playground stage tears directly into a dark archive world; no standalone transition screen or duplicated outgoing photographs remain.
- The tear contour changes continuously with time, scroll progress, and scroll velocity.
- Far, middle, and foreground archive PNGs use independent ScrollTrigger and pointer parallax.
- Guest notes and the sloth share the live tear mask, so content cannot appear before the paper edge reaches it.
- In the final timeline phase, Playground and the archive lift together while the real Guestbook takes over from below.
- Guestbook notes and form recede while the Last Page unfolds diagonally from the lower-right, with its photograph and copy revealing on separate beats.
- Reduced-motion mode removes pinning and transition gates, then stacks all four project scenes as readable full-screen sections.

## Interaction Depth

- Interactive regions expose contextual cursor verbs such as `OPEN`, `VIEW`, `DRAG`, `WRITE`, and `COPY`.
- Project media, film frames, and the final photograph respond with bounded pointer parallax without changing layout geometry.
- Hover depth is disabled with the custom cursor on coarse/mobile pointers and in reduced-motion mode.
- The Playground retains draggable photographs and notes, plus a shuffle action that re-stages the composition.

## Navigation And Locale

- Header remains fixed and no longer covers the Hero title.
- The chapter rail expands the active scene label and omits the removed Index section.
- Mobile menu opens, exposes all five primary chapters, navigates correctly, and closes after selection.
- Simplified Chinese is the default fallback.
- Browser locales `zh-HK`, `zh-MO`, and `zh-TW` resolve to Traditional Chinese; English locales resolve to English.
- Manual locale selection updates `html lang` and persists through `treehey-language`.

## Guestbook

- Twelve existing messages render in the wall layout.
- Long content is clipped inside its paper note with `overflow: hidden` and does not create an inner scrollbar.
- The form is integrated into the wall and remains usable on desktop and mobile.
- Submission was not invoked during QA because it would write to the live Supabase guestbook.

## Visual Evidence

- Hero to Fragments: `output/playwright/continuity-audit-phase-11/01-fragments-approach.png`
- Fragments to Experiments: `output/playwright/continuity-audit-phase-11/02-experiments-approach.png`
- Experiments to Lens: `output/playwright/continuity-audit-phase-11/03-lens-mid.png`
- Lens to Playground: `output/playwright/continuity-audit-phase-11/04-playground-mid.png`
- Playground to Guestbook: `output/playwright/continuity-audit-phase-11/05-guestbook-approach.png`
- Guestbook to Last Page: `output/playwright/continuity-audit-phase-11/06-last-page-mid.png`
- Context cursor and media parallax: `output/playwright/continuity-audit-phase-11/07-context-cursor-project.png`, `output/playwright/continuity-audit-phase-11/08-context-cursor-last-page.png`
- Mobile Guestbook and Last Page: `output/playwright/continuity-audit-phase-11/09-mobile-guestbook.png`, `output/playwright/continuity-audit-phase-11/09-mobile-last-page.png`
- Reduced-motion Guestbook: `output/playwright/continuity-audit-phase-11/10-reduced-guestbook.png`

final result: passed

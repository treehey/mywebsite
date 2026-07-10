# Design QA

- Implementation URL: `http://localhost:3000`
- Master direction: `ONE LONG TAKE`
- Motion reference studied: `https://www.shopify.com/editions/winter2026`
- Primary evidence: `output/playwright/one-long-take/`
- Desktop viewport: 1440 x 900
- Mobile viewport: 390 x 844
- Modes checked: default motion and `prefers-reduced-motion: reduce`
- Locales checked: Simplified Chinese, Traditional Chinese, and English

## Result

- No remaining P0-P2 visual, interaction, responsive, or accessibility issues found.
- Production build and TypeScript compilation pass.
- Default-motion and reduced-motion sessions report zero console errors.
- Desktop and mobile layouts report zero horizontal overflow.

## Motion And Transitions

- Hero is a pinned poster scene with scroll-linked type separation, artifact reveals, and velocity-reactive marquee motion.
- Fragments transform into the NJU project stage instead of ending at a hard section boundary.
- Four project scenes use distinct full-screen compositions and a clickable project index.
- Enzyme transforms into film; film develops into photography; photography scatters into Playground objects.
- Playground objects compress into visitor notes before the Guestbook wall appears.
- Reduced-motion mode removes pinning and transition gates, then stacks all four project scenes as readable full-screen sections.

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

- Hero impact frame: `output/playwright/one-long-take/phase-06-hero-impact-frame.png`
- Chapter rail: `output/playwright/one-long-take/phase-06-chapter-rail.png`
- Mobile Hero: `output/playwright/one-long-take/phase-06-mobile-hero.png`
- Reduced motion: `output/playwright/one-long-take/phase-07-reduced-motion.png`
- Mobile fragments: `output/playwright/one-long-take/phase-07-mobile-fragments.png`
- Guestbook wall: `output/playwright/one-long-take/phase-05-guestbook-wall.png`
- Last page: `output/playwright/one-long-take/phase-05-last-page.png`

final result: passed

# Design QA

- Source visual truth: `docs/design-target-living-field-notebook.png`
- Implementation URL: `http://localhost:3000`
- Desktop evidence: `screenshots/design-qa/desktop-hero.png`
- Lower-page evidence: `screenshots/design-qa/desktop-lower.png`
- Focused comparison: `screenshots/design-qa/hero-comparison.png`
- Full-view comparison: `screenshots/design-qa/full-comparison.png`
- Tablet evidence: `screenshots/design-qa/tablet-hero.png`
- Mobile evidence: `output/playwright/mobile-hero.png`, `output/playwright/mobile-menu.png`, `output/playwright/mobile-menu-en.png`, `output/playwright/mobile-fragments.png`, `output/playwright/mobile-experiments.png`, `output/playwright/mobile-lens.png`, `output/playwright/mobile-playground.png`, `output/playwright/mobile-guestbook.png`, `output/playwright/mobile-last-page.png`
- Viewports checked: 1699 x 935 desktop, 1133 x 5692 long capture, 755 x 613 tablet, 390 x 844 mobile
- State: simplified Chinese default, English language switch, default motion, guestbook populated

**Findings**

- No remaining P0-P2 visual, interaction, or responsive issues found in the checked viewports.
- Previously blocked mobile QA is now complete with local Playwright evidence at 390 x 844.
- A mobile-only Last Page reveal issue was found and fixed: the photo wrapper no longer depends on a while-in-view clip animation that could stay closed after hash navigation or Lenis scroll restoration.

**Fidelity Review**

- Fonts and typography: Syne and Space Grotesk match the target hierarchy. The poster display type, compact labels, Chinese wrapping, and body weights are coherent across desktop, tablet, and mobile.
- Spacing and layout rhythm: the poster begins below the navigation, leaves a visible hint of the next section, and the mobile sections stack without horizontal overflow.
- Colors and tokens: paper, ink, moss, faded sky, and tomato tokens consistently map to the source direction. No cyber gradients, neon, or glass panels remain.
- Image quality: visible photographs and project images are real repository assets, load at native resolution, and use intentional crops. The final-page Macau image renders on mobile after the reveal fix.
- Copy and content: simplified Chinese is the default. Browser-locale detection and manual Simplified/Traditional/English switching were verified; English menu labels fit the mobile nav.
- Interaction states: mobile menu, language selection, playground shuffle, guestbook inputs, navigation anchors, image links, and reduced-motion CSS are implemented. Form submission was not invoked during QA because it would write to the live guestbook.
- Console and performance: Playwright reported 0 console errors and 0 warnings during the final mobile pass. No horizontal overflow was detected at 390 px.

**Patches Made**

- Raised the poster typography to restore the source's immediate first-view impact.
- Preserved a paper header band so navigation remains readable above the display type.
- Changed tablet and mobile poster heights to reveal the next section.
- Replaced the last-page image with a more personal Macau city observation.
- Restored contact details and completed Simplified/Traditional/English localization.
- Replaced the Last Page photo's scroll-triggered clip reveal with stable static rendering so hash navigation and mobile scroll checks cannot leave the image blank.

**Follow-up Polish**

- P3: Add project-specific generated collage artifacts only when they have a clear narrative role; the current real assets are sufficient and more authentic.

final result: passed

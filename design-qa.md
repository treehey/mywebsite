# Design QA

- Source visual truth: `docs/design-target-living-field-notebook.png`
- Implementation URL: `http://localhost:3000`
- Desktop evidence: `screenshots/design-qa/desktop-hero.png`
- Lower-page evidence: `screenshots/design-qa/desktop-lower.png`
- Focused comparison: `screenshots/design-qa/hero-comparison.png`
- Full-view comparison: `screenshots/design-qa/full-comparison.png`
- Tablet evidence: `screenshots/design-qa/tablet-hero.png`
- Viewports checked: 1699 x 935 desktop, 1133 x 5692 long capture, 755 x 613 tablet
- State: simplified Chinese, default motion, guestbook populated

**Findings**

- [P2] Mobile viewport capture is not yet verified.
  Location: responsive layout at 390 x 844.
  Evidence: desktop and tablet captures are available, but Chrome rejected the isolated
  mobile browsing context required for a true 390 px render.
  Impact: the mobile menu, display-type wrapping, project stacking, draggable field,
  guestbook form, and final-page composition are supported by responsive CSS but do
  not yet have screenshot evidence.
  Fix: run the local site with Playwright viewport emulation after user approval,
  capture 390 x 844 evidence, and resolve any visible P0-P2 issues.

**Fidelity Review**

- Fonts and typography: Syne and Space Grotesk match the target hierarchy. The poster
  display type, compact labels, Chinese wrapping, and body weights are coherent at the
  checked desktop and tablet widths.
- Spacing and layout rhythm: the poster now begins below the navigation and leaves a
  visible hint of Fragments. Section pacing is intentionally longer than the concept
  board to support readable project and interaction states.
- Colors and tokens: paper, ink, moss, faded sky, and tomato tokens consistently map
  to the source direction. No cyber gradients, neon, or glass panels remain.
- Image quality: all visible photographs and project images are real repository assets,
  load at native resolution, and use intentional crops. No placeholder images remain.
- Copy and content: simplified Chinese is the default. Browser-locale detection and
  manual Simplified/Traditional/English switching were verified in Chrome.
- Interaction states: language switching, playground shuffle, form entry, navigation,
  image links, and reduced-motion CSS are implemented. Form submission was not invoked
  during QA because it would write to the live guestbook.

**Patches Made**

- Raised the poster typography to restore the source's immediate first-view impact.
- Preserved a paper header band so navigation remains readable above the display type.
- Changed tablet and mobile poster heights to reveal the next section.
- Replaced the last-page image with a more personal Macau city observation.

**Implementation Checklist**

- Capture the site at 390 x 844.
- Test mobile menu open/close, language selection, drag fallback, and guestbook inputs.
- Fix any visible mobile P0-P2 findings.
- Update this report to `final result: passed`.

**Follow-up Polish**

- P3: Add project-specific generated collage artifacts only when they have a clear
  narrative role; the current real assets are sufficient and more authentic.

final result: blocked

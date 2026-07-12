# Motion V3 QA Report

## Targets

- Desktop: 1440 x 900
- Mobile: 390 x 844
- Reduced motion: desktop and mobile fallback
- Browser: local Chrome through Playwright

## Required Checks

- [x] Slow forward scroll
- [x] Fast forward movement through chapter navigation
- [x] Reverse scroll
- [x] Repeated chapter navigation
- [x] Project Case Study open, close, and Escape
- [x] Playground magnetic snap and discovery
- [x] Guestbook content containment
- [x] Final memory and closing cover
- [x] Desktop and mobile horizontal overflow
- [x] Reduced-motion information completeness
- [x] Console, page, and request errors
- [x] LCP, CLS, and representative frame intervals

## Final Measurements

- Initial LCP: `828 ms`
- Initial CLS: `0`
- Forward scroll frame interval: `5.5 ms` median, `6.2 ms` p95, `11.4 ms` max
- Reverse scroll frame interval: `5.5 ms` median, `6.1 ms` p95, `6.5 ms` max
- Frames over `34 ms`: `0` forward, `0` reverse
- Horizontal overflow: `0 px` desktop, mobile, and reduced motion
- Runtime errors: `0` across desktop, mobile, and reduced motion
- Case Study: open and Escape-close assertions passed
- Reduced motion: shared depth layer and cinematic closing cover are removed; all content remains in document order

These are local synthetic Chrome measurements, useful for regression detection rather than a substitute for production-field Core Web Vitals.

## Evidence

- Director and cover: `output/playwright/motion-v3-phase-01/`
- Shared photograph handoff: `output/playwright/motion-v3-phase-02/`
- Project motion and Case Study: `output/playwright/motion-v3-phase-03/`
- Playground and final closure: `output/playwright/motion-v3-phase-04/`
- Final responsive and performance run: `output/playwright/motion-v3-final-qa/`

Machine-readable results: `output/playwright/motion-v3-final-qa/metrics.json`.

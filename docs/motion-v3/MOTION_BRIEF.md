# Motion V3 Brief

## Motion Thesis

The visitor is not scrolling a portfolio; they are opening, rearranging, developing, and closing a living field notebook.

## World Metaphor

An impossible notebook whose paper can contain physical depth, project interfaces, darkroom film, draggable memories, and a growing public wall.

## Carrier Objects

1. Red marker: observation ring -> pin -> project locator -> focus ring -> magnetic point -> note stamp -> final period.
2. Nanjing photograph: cover artifact -> fragment -> NJU Match screen -> film frame -> loose print -> community note -> final Macau memory.
3. Paper edge: cover depth -> page reveal -> project stage -> torn archive -> final page -> closed cover.

## Motion Verbs

- Observe
- Connect
- Build
- Focus
- Reorganize
- Leave a trace
- Close

## Camera Vocabulary

- Cover push
- Desk drift
- Stage lock
- Film track
- Tabletop view
- Wall rise
- Cover close

## Easing Vocabulary

- Continuous camera: linear values with numeric scrub.
- Heavy paper: `power3.inOut` / `[0.76, 0, 0.24, 1]`.
- Precise interface: `power3.out` / `[0.16, 1, 0.3, 1]`.
- Physical landing: controlled spring around stiffness 175-260 and damping 20-25.

## Silence Rules

- Body copy never animates while the primary object is landing.
- Every pinned scene reserves a readable dwell after its principal motion.
- Navigation and labels do not parallax.
- Mobile removes persistent shared imagery and long desktop handoffs.
- Reduced motion preserves content order and project stories while removing pinning, depth, physics, and cover closure.

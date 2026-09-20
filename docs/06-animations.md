# 06 — Animations, how they work

**Files:** [`components/PlusBanner.tsx`](../components/PlusBanner.tsx) and the animation
blocks in [`app/globals.css`](../app/globals.css).

Every animation in this app is plain **CSS keyframes + transitions**. There is no
animation library. That keeps the bundle tiny and every effect easy to read.

## The core idea: "re-mount to re-play"

CSS entrance animations only play when an element first appears. To make the banner's
text animate **again on every slide change**, `PlusBanner` gives the eyebrow, headline,
and art a React `key` that includes the slide index:

```tsx
<h2 className="plus-title" key={`title-${index}`}>{slide.title}</h2>
```

When `index` changes, React throws away the old element and mounts a new one — so the
`slide-up-fade` keyframe runs fresh each time. This one trick powers the "text
animation" you see on the carousel.

## The Freelancer Plus carousel

`PlusBanner` holds two pieces of state: `index` (current slide) and `paused`.

- A `setInterval` advances `index` every **6000 ms**, wrapping with `% slides.length`.
- The interval is **skipped** if the user paused it *or* if the OS reports
  `prefers-reduced-motion: reduce`.
- The ⏸/▶ button flips `paused`; the interval effect re-runs because `paused` is in its
  dependency array.
- Clicking a progress bar sets `index` directly (jump to that perk).

CSS pieces (all in the `.plus-*` block of `globals.css`):

| Class | Animation | Notes |
|-------|-----------|-------|
| `.plus-eyebrow` / `.plus-title` / `.plus-cta` | `slide-up-fade` | Staggered by `animation-delay` |
| `.plus-art-emoji` | `float` (infinite) + `pop-in` | The gentle bob + swap |
| `.plus-dot.active .plus-dot-fill` | `dot-fill` | Fills 0→100% over the slide's 6 s |

The fill duration is set inline from the component (`animationDuration: 6000ms`) and its
`animationPlayState` is tied to `paused`, so pausing freezes the fill too.

## Everything else (in `globals.css`)

| Element | Effect | Keyframe / property |
|---------|--------|---------------------|
| Job cards | Staggered entrance, hover lift | `rise-in` + `nth-child` delays; `transform` on hover |
| Connects meter | Width transition + sheen sweep | `transition: width`; `::after` runs `shimmer` |
| Bid / record rows | Slide-in from left, hover nudge | `bid-in` + `nth-child` delays |
| Boost leaderboard rows | Sequential fade-in | `bid-in` on `tbody tr` |
| Fit score number | Pop-in | `pop-in` |
| Buttons | Hover lift + shadow | `transition` |
| Success toast | Slide up from corner | `toast-in` |

## Accessibility guard

At the very bottom of `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

This collapses every animation to an instant, still frame for users who ask their OS for
less motion. The carousel *also* stops auto-rotating in that case (checked in JS).

## Where to tweak

- **Rotation speed:** change `SLIDE_MS` in `PlusBanner.tsx` (keep the CSS fill in sync —
  it reads the same value inline, so it stays matched automatically).
- **Add / edit a perk:** edit the `slides` array in `PlusBanner.tsx`.
- **Change a motion curve or distance:** edit the matching `@keyframes` in `globals.css`.

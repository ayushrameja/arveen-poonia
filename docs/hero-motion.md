# Hero rings and atmosphere

This supersedes the earlier static-ring and live-gradient implementation notes.

The existing inner halo and all six outer mantra rings are centred on the portrait
stage at 50% / 50%. The inner halo no longer scales between portrait scenes.
Outer rings keep fixed geometry and stagger opacity on bounded HTML wrappers;
large SVG text paths are no longer scaled every frame. Non-scaling SVG strokes
were also removed because they triggered repeated layout during scrolling.
Mobile shows three rings. Reduced motion uses a still composition.

The atmosphere uses four transparent, 480 × 640 WebP textures with colour,
feathering and fine grain baked in. Two wrappers drift using translation; their
personal/divine textures crossfade with the shared portrait scene. There are no
live atmosphere filters, blend modes, or nested masks. Regenerate the textures:

```sh
node scripts/generate-hero-atmosphere.mjs
```

The shared `data-running` state pauses both the rings and colour drift when the
user pauses, less than 70% of the hero is visible, the document is hidden, or the
introduction is active. Ambient motion also pauses immediately during scrolling
and can resume 180ms after scrolling settles. The homepage header retains its paper colour and has no bottom border;
other pages retain their existing header treatment.

## Verification

```sh
pnpm build
pnpm test
pnpm exec node scripts/check-hero-effects.mjs http://localhost:4321/
pnpm perf:motion http://localhost:4321/ hero-motion 1
```

The browser check verifies concentric geometry at 320, 390, 1440, and 1984px,
no horizontal overflow, the homepage header border, active colour drift, pause,
offscreen suspension, and reduced motion. It saves screenshots in the ignored
`reports/performance/` directory. The profiler samples natural scene changes at
1440 × 1000, DPR 2, with 4× CPU slowdown. Frame intervals are a requestAnimationFrame
proxy, not direct GPU presentation measurements or a guarantee for every device.

On 2026-09-17, one before/after run on this machine measured:

| Metric | Previous effects | Optimized effects |
| --- | ---: | ---: |
| Main-thread work over 19 seconds | 17,182 ms | 2,013 ms |
| 95th-percentile frame interval | 233.4 ms | 16.8 ms |
| Recorded long tasks | 70 | 0 |
| Raster task time (sum across tasks) | 14,628 ms | 18 ms |

These are local diagnostic samples, not a cross-device benchmark. Raw reports
use the `liquid-before` and `liquid-final` labels in `reports/performance/`.

## Native scrolling and chapter boundaries

The site now uses browser-native wheel/touch scrolling. Locomotive/Lenis is no
longer imported into the page bundle; existing dependencies and the lockfile are
retained. Section reveals use one-time IntersectionObserver notifications and
unobserve after appearing. No JavaScript scroll interpolation loop runs at idle.

Chapter palette selection uses expanded IntersectionObserver regions instead of
reading section geometry on every scroll event. The expanded regions cover
instant anchor/history jumps past entire sections. Resizes rebuild the regions.
The same saffron/ivory/evening palettes remain. A subsequent revision restores
700ms background fades using opacity-only layers (see below), rather than
animation of background colour across the document.

`pnpm exec node scripts/profile-scroll.mjs http://localhost:4321/ scroll-check`
profiles repeated trips between the hero and second section, plus idle phases.
The optional final argument scales wheel input: the old scroll interceptor used
about twice the wheel input for the same visible distance on this test machine.
Use `2` for that original implementation, `1` (default) for native scrolling.
No laptop temperature, power draw, or actual GPU presentation rate is measured.

The final production scroll run (`scroll-production-final.json`, 2026-09-17)
covered three trips between scroll positions 0 and 1100px, then idle at 1150px.
At 4× CPU slowdown / DPR 2, scroll p95 was 16.8ms, with no intervals over 50ms
and no recorded long tasks. Main-thread work was 1,716ms over 19.4 seconds;
layout totalled 3.4ms and raster tasks 27ms. The earlier dev-server crossing run
(`scroll-crossing-before.json`) recorded scroll p95 66.7ms and 32 long tasks.
The input scale and dev/production differences mean this is diagnostic evidence,
not a controlled cross-device speedup claim.

## Top-of-page navbar frost

On the homepage, the ring field extends upward to the page edge while keeping
its portrait-centred geometry. A 4px page-top marker controls `data-at-top` on the
header using IntersectionObserver and a pageshow check. At the top, a short
header-only pseudo-element uses an ivory opacity gradient and 4px backdrop blur;
the ring fragments fade out toward the upper edge and navigation text stays crisp.
Away from the top, the pseudo-element is removed entirely and the original solid,
chapter-coloured header surface returns. No filter is animated and no new scroll
loop is introduced. Other pages retain their solid header.

The browser regression check verifies the transparent/blurred top state, that
rings reach behind it, that the blur is absent after scrolling, and that the top
state returns when navigating back up, at desktop and phone widths.

The bounded header frost was profiled in `scroll-frosted-header.json`: scroll
p95 remained 16.8ms with no recorded long tasks under the same 4× CPU slowdown.
The ring field extends only upward; its lower edge and portrait centre are
preserved so the extra navbar coverage does not reach into the hero copy.

## Restored gradual chapter colours

Both saffron and evening backgrounds now crossfade over 700ms. `ToneBackdrop`
provides an ivory base and two solid-colour opacity layers for the page, header,
and mobile dock. Main chapter surfaces are transparent above the shared page
backdrop; card fills are preserved. Header frost still appears only at the top.

`data-paper-tone` starts the fade independently of foreground palette classes.
Light/dark text switches near the halfway point of the green fade, with one
cancellable timeout calculated from the current opacity. This handles fast
direction reversals without a persistent animation loop. Reduced motion skips
the fade and applies foreground colours immediately.

`pnpm exec node scripts/check-tone-fade.mjs http://localhost:4321/` verifies
intermediate opacity values, both directions, synchronized navigation surfaces,
rapid reversals, and reduced motion. To profile the green boundary, pass
`1 evening` after the label to `scripts/profile-scroll.mjs`.

Production scroll checks with the restored fades (`scroll-fade-yellow.json` and
`scroll-fade-green.json`) recorded p95 frame intervals of 16.8ms and 16.7ms,
respectively, with no recorded long tasks at 4× CPU slowdown. Yellow included one
50.1ms frame interval; this remains a local diagnostic sample, not a guarantee
of perfect frame delivery on every device.

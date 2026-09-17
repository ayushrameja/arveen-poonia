# Performance review — 17 September 2026

The reported stutter occurred during portrait changes. The changes retain Locomotive
Scroll, the devotional intro, portrait cycling, pause controls, and scroll reveals.

## What changed

- Moved the side fades from each portrait onto the shared portrait container. Both
  images now crossfade under one static mask instead of animating separate masked layers.
- Give the two portraits and two atmosphere layers an opacity compositing hint only
  while the visible hero is running. Avoid blanket `will-change` on the page.
- Removed the ring's animated border color, which repainted throughout each switch.
  Its scale transition remains; the portrait fade lasts 1.2 seconds.
- Removed animated blur from hero entrances and backdrop blur from fixed navigation.
  The navigation retains its ivory background.
- Batch geometry reads, skip hidden hero elements, and release finished entrance
  animations. Calculate reveal stagger indexes in one pass.
- Added AVIF portraits at 640/768/960/1280 pixels with WebP fallbacks. Image `sizes`
  now matches the actual portrait layout. The hidden second portrait has low fetch
  priority and is still decoded before the automatic cycle begins.

## Portrait-transition measurements

Production build on localhost, headless Chrome, 1440 × 1000 CSS pixels, DPR 2,
4× CPU slowdown. Three fresh-browser runs per version, each sampling 19 seconds
of steady state including two **natural** portrait switches. No forced scene changes.
The baseline is a snapshot of the working tree immediately before this performance work,
including the previously added Locomotive/entrance animations.

| Metric | Before | After | Interpretation |
| --- | ---: | ---: | --- |
| Paint work per 19-second test, median | 124.52 ms | 3.66 ms | 97.1% reduction |
| Style recalculation per test, median | 124.17 ms | 83.65 ms | 32.6% reduction |
| Renderer main-thread task time, median | 919.01 ms | 723.08 ms | 21.3% reduction |
| Renderer main-thread busy share, median | 4.84% | 3.81% | Task time ÷ sampling time; not OS CPU usage |
| Transition frame interval, p95 median | 16.8 ms | 16.7 ms | Consistent with 60 Hz sampling |
| Worst transition frame gap across 3 runs | 166.6 ms | 16.8 ms | Baseline spikes occurred in one run only |
| Transition frame gaps >50 ms, all runs | 2 | 0 | No observed after-change spikes |
| Used JS heap at test end, median | 1.49 MiB | 1.50 MiB | Essentially unchanged |

These are **requestAnimationFrame intervals**, not GPU/presented-frame measurements.
Headless Chrome cannot certify smoothness on every physical device. JS heap excludes
image buffers, compositor textures, browser process memory, and GPU memory. The before
and after median frame cadence was already close to 60 Hz; the largest repeatable gain
is the reduced painting cost, not an invented doubling of FPS. No browser errors or
long main-thread tasks were observed in the transition runs.

## Page-load audit

Lighthouse 13.4.1 on the production build, cold-load defaults, simulated mobile and
desktop presets, local Python static server. One navigation audit per device/version.
Navigation scores and timings are indicative, not statistically stable field results.
The local server does not provide production CDN/network/compression behavior.

| Mobile metric | Before | After | Target |
| --- | ---: | ---: | --- |
| Lighthouse performance | 79/100 | 99/100 | 90+ engineering goal |
| Largest Contentful Paint (LCP) | 5.25 s | 2.10 s | ≤2.5 s |
| First Contentful Paint | 1.33 s | 1.43 s | ≤1.8 s |
| Total Blocking Time | 16 ms | 0.5 ms | ≤200 ms lab budget |
| Cumulative Layout Shift (CLS) | 0 | 0 | ≤0.1 |
| Bytes transferred during audit | 856 KiB | 422 KiB | <500 KiB project budget |
| Non-composited animated elements | 11 | 1 | Avoid continuously repainted effects |

The remaining non-composited animation is the loader's discrete visibility change;
it is not an animated blur or a recurring portrait repaint. Desktop scored 100 before
and after; desktop LCP changed from 0.73 s to 0.46 s. A perfect navigation score did
**not** reveal the portrait issue, hence the separate transition profiling.

The intro intentionally covers the hero for 2.4 seconds. Lighthouse LCP may identify
text in the intro/navigation rather than the fully revealed hero; it is not the time
at which the entire visual introduction has finished. Removing or shortening that
intentional delay is a separate design decision.

Google's [Core Web Vitals targets](https://web.dev/articles/vitals) are LCP ≤2.5 s,
INP ≤200 ms, and CLS ≤0.1 at the **75th percentile of real visits**. This review does
not measure real-user INP; Lighthouse TBT is a separate lab diagnostic, not an INP
replacement. For animation, aim to finish a frame within approximately 16.7 ms at
60 Hz or 8.3 ms at 120 Hz; see [Chrome's frame guidance](https://developer.chrome.com/docs/web-platform/long-animation-frames).
There is no universal acceptable CPU percentage or memory number across devices.

## Reproduce and inspect

```sh
pnpm build
pnpm preview --host 127.0.0.1 --port 4323
```

In another terminal:

```sh
pnpm perf:audit http://127.0.0.1:4323/ current
pnpm perf:motion http://127.0.0.1:4323/ current 3
```

Run one benchmark at a time, keep other applications quiet, and keep the same Chrome
version, viewport, CPU setting, and machine for comparisons. `perf:motion` defaults
to the installed macOS Google Chrome; set `CHROME_PATH` for another Chrome path.
Lighthouse discovers Chrome automatically (and also honors `CHROME_PATH`).

Local artifacts are in `reports/performance/` (gitignored):

- `before-mobile.report.html` and `after-mobile.report.html`: interactive Lighthouse reports.
- `before-desktop.report.html` and `after-desktop.report.html`: desktop reports.
- `before-motion.json` and `after-motion.json`: all three raw transition measurements.
- `*-motion-1.trace.json`: load in Chrome DevTools → Performance to inspect paint events.
- `*-motion-1.png`: screenshot at the end of each run.

The profiling packages and scripts are development-only. No telemetry, monitoring
loop, or performance widget is shipped to visitors. On the affected physical device,
record a Performance trace across two automatic portrait changes to confirm the
improvement under that device's actual GPU/display conditions.

# Homepage video stories

The “A little curiosity. A new perspective.” section uses three silent preview chapters: the routine video, yoga journey, and Snana Yatra. The extra link strip and all eyebrow labels have been removed; all five original videos remain in the Explore library. Watch actions are solid pill buttons, and the main heading uses weight 600.

- Wide screens with at least 680px of height use a sticky section below the existing header. The next video opens upward through a rounded mask while the previous one closes. A 6% vertical image drift within 14% overscan adds parallax without exposing image edges or stretching the footage. Horizontal cards get corresponding horizontal drift. Reduced motion disables both.
- A compact numbered stepper sits above the two closely grouped text blocks. The desktop group is vertically centred alongside a smaller 4:3 video, within a 1160px-wide layout. Each chapter has a stationary reading interval; its button scrolls directly to that interval. Scrolling backward reverses the reveal.
- Edge-masked SVG contours, concentric circles, and petal linework distinguish the three chapters, with a light stippled texture underneath. Decorations crossfade with the active chapter, ignore pointer events, and are hidden from assistive technology. Reduced motion switches them immediately.
- A three-segment left rail tracks scrolling through the chapters, filling each segment across that chapter’s active interval. On smaller screens it follows horizontal card scrolling. The rail exposes an accessible progress value and remains hidden without JavaScript.
- The video section removes the inherited border entirely so the local background fade cannot leave a one-pixel seam at its edge.
- Smaller screens use horizontally scrollable cards with chapter buttons and scroll snapping. Reduced-motion users get this unpinned layout with still posters until they explicitly choose Play previews.
- An observer begins loading the current and next videos before the section enters view. They only play once visible and pause offscreen, on a hidden tab, or with Pause previews. Rejected autoplay keeps the poster and offers manual playback. Reduced-motion users do not prefetch until they explicitly choose playback.
- Yellow (`#f4cd72`) fades in over 700ms when this section crosses 35% of the viewport, and fades out when the following story crosses that line. The header and shared page canvas mirror the fade, so the exposed hero tail has no white band. Reduced motion skips the fade. The following “Devotion, woven into everyday life.” section reveals the same page canvas: it enters on yellow, then fades back to light together with the video section and header as its top crosses the 35% line. Its portrait card retains its own fill. The closing journal's green transition remains independent.
- Inactive desktop copy is inert and hidden from accessibility APIs; all copy and YouTube links remain accessible on mobile and without JavaScript. Keyboard focus in an outgoing caption moves to the new chapter button.

## Files and source cuts

`src/components/HomeVideoStories.astro` owns chapter copy and markup; `src/styles/video-stories.css` owns the responsive layouts; `src/scripts/video-stories.ts` owns playback, scrolling, and lifecycle cleanup. No animation library was added.

`public/videos/previews/manifest.json` records source URLs and cut timestamps. Each preview is 7 seconds, 1280×720, 24fps, with no audio. Featured clips prefer VP9 WebM (1,257,279 bytes total, 52% smaller than the initial MP4s) with H.264 MP4 fallback (1,400,584 bytes, 47% smaller). WebP posters total 71,392 bytes, 66% smaller than the previous JPEGs. Media URLs use a version query to bypass previously cached encodes. Full-length source footage remains in the ignored `assets/video-sources.local` folder.

The previews are visual excerpts, not quotations. Left-hand descriptions describe the full source videos, without claiming to transcribe the silent excerpt.

## Validation

Run `pnpm test` for chapter timeline coverage and the existing hero tests, and `pnpm build` for Astro/TypeScript validation and the production build. Preview the section at `http://localhost:4321/#explore`.

# Personal homepage redesign

## Design context

- Objective: make the homepage unmistakably Arveen Poonia’s personal website while retaining Krishna as the devotional centerpiece.
- Direction: Designly director, composition, typography, and visual QA.
- Copy locks: visible “Arveen Poonia” identity and “Hare Krishna 🙏” welcome screen.
- Composition: oversized centered ASCII portrait on desktop and mobile, with the personal introduction underneath. Ivory, forest green, and the existing Google Sans remain.
- Motion: 1.35-second greeting followed by an upward curtain exit, portrait settle, and staggered content entrance. CSS-only entrance completes even if JavaScript fails. Reduced-motion users skip the greeting and entrances.
- Existing artwork pause, visibility, and reduced-motion behavior remains active.

## Original portrait cycle (superseded)

The user confirmed Krishna ↔ Arveen chanting with a japa bag and authorized a generated illustration without a photo reference. The result is an imagined representation, not a verified likeness. The two-frame source is saved at `assets/arveen-chanting-source.png`; its built-in generation prompt is recorded in `chanting-image-prompt.md`.

`pnpm assets:ascii` regenerates both Krishna and chanting assets. A 20-second CSS cycle alternates portraits, while a four-second crossfade between two aligned chanting poses creates a subtle wrist/bag gesture. Both frames must decode before the cycle starts. On image failure Krishna remains visible. All loops share pause, document visibility, viewport visibility, and reduced-motion controls. The two new frames add approximately 390KB combined on mobile or 1.18MB combined on desktop.

## Validation

- Production Astro build and TypeScript checks pass.
- All four animation lifecycle tests pass, including partial/failed image decoding and cleanup after late decoding.
- Browser visual review completed at desktop and narrow phone sizes (including an effective CSS viewport below 320px due to browser zoom).
- Verified the centered name at mobile width; confirmed no horizontal page overflow and that both actions remain reachable by scrolling.

This direction supersedes the centered layout and old headline copy in hero-artwork.md; the original image source and conversion details there still apply.

## Current profile-photo revision

The homepage now uses Arveen’s current YouTube profile photo, enhanced with the built-in AI image editor. The actual facial identity, smile, tilak, neck beads and lilac kurta replace the imagined chanting figure. See `profile-photo-update.md` for provenance and the exact edit prompt. The 20-second Krishna ↔ Arveen cycle remains; invented japa-bag frames are no longer loaded. `pnpm assets:ascii` now generates Krishna and the enhanced profile assets.

The hero uses `height: 100svh`, an absolute portrait sized from available viewport height, and copy anchored above the navigation. Compact spacing and a single button row keep short phones usable. A 480px minimum preserves readable content on unusually short landscape screens or at extreme zoom; those cases can still scroll intentionally.

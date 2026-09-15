# Hero clarity and interaction polish

- The profile conversion now samples 240 × 200 cells (18,744 foreground glyphs), with 1920px desktop and 1200px mobile output. Smaller, denser characters preserve eyes and the smile; a sampled 18% color bed reduces ivory gaps while keeping the ASCII surface visible. The enhanced source photo is unchanged.
- Navigation starts hidden and becomes visible at `scrollY >= innerHeight * 0.2`. Returning above that threshold hides it again. Hidden navigation is inert and removed from the accessibility tree. Without JavaScript the navigation remains available. Resize, restored-page scroll position, and listener disposal are handled.
- The hero remains one viewport tall. A useful follow-on section links to existing videos, yoga, and store destinations, providing real scrollable content for the navigation reveal.
- CTA labels roll upward as a rounded color fill expands beneath them; an arrow enters on hover. Keyboard focus receives the label/fill treatment too. Reduced-motion preferences disable movement.
- Static dotted ring, small bead accents, short devotional side notes, and a scroll cue fill the hero's negative space. Side notes are omitted on smaller screens and decorative content is hidden from screen readers.
- Browser review covers desktop and mobile, hidden/revealed navigation, return-to-top, keyboard CTA focus, and portrait clarity. Unit tests cover the 20vh boundary, resize, scroll restoration, and cleanup alongside the existing portrait lifecycle tests.

This revision supersedes earlier notes that the entire document has no scroll: the hero still fits the viewport, while the new section intentionally follows below it.

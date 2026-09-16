# Radha–Krishna hero and navigation

The header uses a detailed peacock-feather mark and the Arveen Poonia wordmark. The redundant subtitle, link arrows and inspiration link were removed. Desktop uses a fixed, width-constrained header with navigation aligned right; mobile uses the brand header and one persistent bottom dock with Home, Videos, Yoga and Store. The old scroll-triggered navigation script was removed.

The first scene is Arveen, shown in his original clear chest-up source photo. The second is Radha–Krishna. Both the greeting and title/description change with each image. Copy panels share a CSS grid cell, reserving equal space so the CTAs remain stationary. Equal side columns align the caption labels, text and dividers. Artwork and copy occupy normal document flow. A single pause/resume button lives at the hero’s lower right, beside the scroll cue on mobile, with space reserved for the dock. The manual portrait selector has been removed.

Scenes alternate every 10 seconds. The pause button holds the current scene until resumed. Playback stops outside the viewport, in hidden tabs, and for reduced motion. Reduced-motion visitors see the first portrait without animation controls. Image decoding and fallback behavior are covered by lifecycle tests.

## Artwork

The current hero uses clear responsive WebP encodings of the existing source images, without ASCII or further generative edits. Arveen’s source is `assets/arveen-profile-enhanced.png`; Radha–Krishna’s source is `assets/radha-krishna-source.png`. Run `pnpm assets:portraits` to create 640px and 1280px variants in `public/images/`. The lower fade now preserves shoulders and clothing. The former ASCII assets are retained but no longer loaded by the homepage.

The paired Radha–Krishna source was generated in the earlier iteration with the built-in image generation tool, using `assets/krishna-color-source.png` as its appearance/style reference.

Final generation prompt:

> Use case: stylized-concept. Asset type: square devotional website hero source artwork, a new paired Radha–Krishna portrait. Input image is a style and Krishna appearance reference, not a pixel-preserving edit target. Create a reverent finely detailed temple-murti portrait of Lord Krishna and Radha Rani together, beside each other, waist-up, both complete crowns and heads clearly visible with generous 8% breathing room on the top and sides. Match reference Krishna's rich black stone complexion, gold jeweled crown, peacock feather, tilak, teal and saffron clothing, flower garlands and golden flute. Add Radha Rani with a warm ivory stone complexion, serene smile, ornate crown, rose-pink veil and sari with gold detail, and flower garlands. Both equally present, gently oriented toward each other yet faces visible. The paired silhouette fits comfortably inside a square, faces in upper-middle, crowns not clipped, lower garments softly fade into warm ivory #faf9f5. Clean flat warm ivory background throughout, no scene or temple behind them, no rings, no letters, no labels, no watermark. Soft realistic studio lighting, respectful traditional sacred iconography, detailed polished statue craftsmanship. Not ASCII yet; this will be converted to the website's colored glyph treatment offline. Save a project-usable image.

## Composition

The portrait pair is the single focal group. The name and actions form the secondary anchor. Navigation, side notes, and pale edge textures have lower contrast. The center stays clear of background patterns; the portrait fades before the introduction. Ring sizing is responsive to viewport and scene, with the personal ring at 89% of the divine ring. Decorative textures are local SVG/CSS and carry no accessibility content.

## Verification

Six lifecycle tests cover synchronized image/copy/accessible-title switching, pause/resume, pause persistence, hidden/out-of-view behavior, reduced-motion static rendering, delayed image failure fallback, and disposal. Browser checks cover both scenes, desktop/narrow layouts, navigation, and horizontal overflow.

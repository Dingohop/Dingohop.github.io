# Studio carousel QA — November 18, 2026

final result: passed

## Target and current evidence
- Selected direction: displayed option 2, Electric Identity, refined in `_preview/studio-carousel-2026-11-18/Selected-Carousel-Concept.png` (1084 × 1451).
- Later user instructions supersede the mockup: automatic carousel; smaller type and more spacing; faded carousel edges; a single centered “What I do” heading above a centered service grid.
- Final desktop: `_preview/studio-carousel-2026-11-18/Desktop-Final.jpg` (1265 × 1941), IAB viewport 1280 × 900. Capture excludes the 15px scrollbar, density 1. Root-like route, scroll at top, first three projects, disclosures closed, auto rotation initially enabled.
- Final phone: `_preview/studio-carousel-2026-11-18/Phone-Final.jpg` (375 × 2263), IAB viewport 390 × 844, density 1. Additional browser checks at 320 × 720 and 768 × 900.
- Combined source/implementation comparison: `_preview/studio-carousel-2026-11-18/Concept-vs-Implementation.png`, both page images normalized to 1084px width and top-aligned. Opened together to compare composition, content, typography, colors and imagery. The larger vertical gaps, smaller type and centered services are intentional user-directed differences.
- Focused inspection: carousel end-state and project details checked in the browser; keyboard-focus masking was inspected using the rendered track. Intermediate screenshots with a fixed-position skip-link capture artifact were rejected and replaced by captures at scrollY=0.

## Fidelity and latest edits
- Typography: system sans, 80px/88px desktop headline, 38px phone headline, readable captions and service descriptions, increased line spacing and breathing room. Contact heading balances its two lines.
- Layout: full-width studio introduction, consistent project frames, supporting services, About/contact. All eight carousel cards share dimensions; at 320px each measured 273 × 308.16px before the edge inset refinement. Controls fit the narrow screen and the document has no horizontal overflow.
- Services: “What I do” is one unbroken heading centered above the grid. On desktop the service-content center and page center both measured 640px. Phone heading also centers and the grid becomes one column.
- Edges: 40px alpha fades on both carousel sides with 24px internal padding; controls remain outside the mask. Keyboard focus removes the mask, confirmed computed mask `none`; forced-color mode also removes it.
- Colors: flat charcoal #12191D, warm white #F3EFE6, slate #9BB5C3 and dusty rose #DCA6B0. Calculated contrast: warm white on charcoal 15.48:1; slate on charcoal 8.28:1; rose on charcoal 8.56:1; dark hero text on slate 8.35:1.
- Images: original local project previews. Six real YouTube destinations; High Achieving Women and Weekly Reset retain their images and explicitly state that their video link is to be added. No invented playable links.
- Logo: new studio-color SVG variants preserve original embedded raster bytes and vector paths; prior logo versions remain intact.
- Content: all eight original project records, metadata disclosures, four service families, approved scope limits and email destination retained.

## Functional verification
- Jekyll build succeeded; 26 tests passed; git diff whitespace check clean. New carousel geometry and autoplay tests were observed failing before implementation, then passing.
- Browser observed automatic movement, manual Pause, Play and automatic wrapping. Pause persisted with the pointer/focus outside the carousel for more than six seconds. Home/End reached the limits; the end showed 6–8 of 8 and Next was unavailable. Keyboard focus stayed visible.
- Deterministic timer tests verify the six-second interval, Pause/Play, temporary hover pause, explicit restart after keyboard interaction, reduced-motion initial pause, and no advancement on hidden pages.
- Browser checked desktop/tablet/phone ranges, all project images loaded, project metadata disclosure, mobile Menu and Escape focus return. No console warnings/errors were observed during checked flows.
- Live announcements update only after scrolling settles, and are off during automatic rotation. Mouse-only pointer hover avoids touch-generated compatibility-hover pauses; persistent wheel pause is limited to horizontal gestures.
- Existing CSP, no-referrer video links, local resource loading, no scripted network calls and no browser storage passed their checks. Email destination inspected without sending; external playback not tested.

## Review and limitations
- Independent read-only review completed, with a follow-up for the user-added autoplay requirements. Fixed live-region churn, unnamed generic groups, missing title guard, stale maintenance instructions, touch-hover event handling and vertical-wheel pause handling. No deferred review findings.
- Physical touch devices, spoken screen-reader output and an actual OS Reduce Motion toggle were not tested; their code paths and timing behavior are covered by inspection/unit checks. Native scroll fallback exists without JavaScript, but no separate JS-disabled browser run was performed.
- No actionable P0/P1/P2 findings remain for the checked states. Nothing committed, pushed or published by the agent. Local preview remains available for review.

## Subsequent reel readiness audit
Reviewed the visible twenty-item checklist from Instagram DdqyllFxaba against the current build. Fixed missing social image metadata, an obsolete sharing image and invalid Twitter/X handles; added a recovery-specific meta description. Fresh homepage/carousel/phone/recovery captures and the complete item-by-item results are in `_preview/reel-fixes-2026-11-18/Reel-Review-and-Fixes.md`. Final sharing card is 1200 × 630. All 29 tests passed; no browser console errors in checked flows. Live social previews remain unverified because nothing was published.

## Larger services separator
At the user's request, “What I do” is now 76px on desktop, 64px on intermediate screens and 50px on phones, with more surrounding space. It remains centered on one line. Browser checked at 1280px and 320px; no horizontal overflow. The accepted section screenshot is `_preview/studio-carousel-2026-11-18/Services-Heading-Larger.jpg`. Build succeeded and all 29 tests passed; no publishing performed.

# Homepage implementation QA — November 18, 2026

final result: passed

## Evidence and comparison state
- Approved visual truth: `_preview/editorial-homepage-2026-11-18/Taylors-Design-Homepage-Concept-Chatbox.png` (856 × 1838).
- Browser implementation: `_preview/editorial-homepage-2026-11-18/Implementation-Desktop.jpg` (856 × 1985).
- Combined comparison: `_preview/editorial-homepage-2026-11-18/Mockup-vs-Implementation.png` (1736 × 2025), opened and inspected with both artifacts top-aligned at 856px wide. No image-density scaling was required.
- Desktop capture: IAB viewport override 871 × 900 CSS pixels; the full-page screenshot excludes the browser's 15px scrollbar. Source has no browser chrome. Both disclosures collapsed, menu closed, root route, dark theme, scroll at top.
- Mobile capture: `_preview/editorial-homepage-2026-11-18/Implementation-Mobile.jpg` (375 × 2278), viewport override 390 × 844. The 15px scrollbar is excluded. Separate smallest-width check at 320 × 720 and tablet check at 768 × 900; wider desktop at 1280 × 800.
- Focused browser evidence: `_preview/editorial-homepage-2026-11-18/Keyboard-Focus.jpg`. Header/intro, featured caption, selected tiles, service labels and contact were also read at full size in the desktop/mobile captures. Full comparison is readable; the focus capture separately verifies the expanded-gallery controls.

## Findings and comparison history
1. Initial desktop capture (`Implementation-856-v1.jpg`): original logo export's transparent margins made the visible artwork too small and indented (P2). Fixed by cropping only those transparent margins in the image wrapper; embedded artwork and geometry are unchanged. Recaptured as `Implementation-Desktop.jpg`; visible wordmark now aligns with the content and matches the selected scale.
2. Independent code review found that overflow clipping hid the thumbnail link outline (P2). Added an outer `.player-slot:focus-within` outline. Real Tab navigation from the last filter to the first thumbnail shows the pink outline in `Keyboard-Focus.jpg`; computed outline is solid 2px, RGB(255,107,181).
3. Review identified an unsupported speaker identity in alt text and the pre-existing 404 portfolio link to an absent `/work/` route. Used a neutral speaker description and corrected the recovery destination to `/#work`. A generated-page route check failed on the old 404 destination and passed after correction.

No actionable P0/P1/P2 findings remain.

## Required fidelity surfaces
- **Typography:** Local system sans, white headings, readable body and ordinary blue underlined links. The title/role hierarchy and short captions match the target. No decorative mono labels, extreme tracking, text clipping or cramped service names. Mobile headings and biography reflow naturally.
- **Spacing/layout:** Same compact intro → featured edit → two selected projects → four services → About → email contact. Flat unboxed sections, square images, consistent gutters. The two selected cards are equal height: 559 × 400.98 at wide desktop and 342 × 252.52 at the 390px phone check. No horizontal overflow at 320, 390, 768 or 1280px.
- **Colors/tokens:** Flat #0A0A0B, #FAFAFA text, #4DA3FF links, #FF6BB5 logo/focus accents. No glow, gradients, timeline ornament or background grids. Muted secondary text remains readable.
- **Image quality:** Actual existing project JPGs and approved original SVG logo are used. Rapture Ready, Sermon Clip Editing and The Chatbox are the correct subjects. The generated mockup approximated and recropped the source thumbnails; implementation deliberately preserves the real images, including the sermon thumbnail's portrait layout and Chatbox gameplay. No generated approximations replace portfolio evidence.
- **Copy/content:** Approved introduction, captions, all four service families, About and email call to action are present. Existing service scope/delivery limits and all eight project records remain available. No invented clients, metrics or promises.

## Intentional functional differences from the static mockup
- Native “View all eight projects” disclosure exposes the existing complete portfolio and filters on the same page, without creating a route. It is operable without JavaScript; filtering is hidden until JavaScript runs.
- A secondary service disclosure retains the previously approved client-supplied and delivery boundaries.
- Footer retains copyright and accessibility/email/back-to-top links. These two additions account for extra page length after the services section.
- Mobile uses a Menu button and stacked project/service columns; the source was a desktop concept.

## Verification
- Jekyll build succeeds. Existing informational notices about Bundler's temporary home and optional Faraday retry middleware remain; no dependencies installed.
- Node test suite: 19 passed, 0 failed. New rendered-page checks observed failing before implementation; recovery-link test observed failing before its correction.
- Browser: featured and selected thumbnails load; full disclosure reveals eight projects; YouTube filter shows The Chatbox and Weekly Reset; All restores eight; mobile menu opens/closes, closes on Services navigation and Escape returns focus to Menu; service scope opens and closes.
- Contact `mailto:` destination and generic project subject inspected; no email was sent. YouTube destinations/no-referrer attributes inspected; external video playback was not tested.
- Browser console: no warnings or errors during checked flows. Privacy checks confirm no external page assets, embeds, browser storage or scripted network calls; original CSP remains intact.
- Native no-JavaScript disclosure structure is covered by rendered-output checks; the browser was not separately run with JavaScript disabled. Other browsers and assistive technologies were not tested.
- Independent read-only code review completed; all reported issues addressed. No deferred code-review findings.
- Nothing committed, pushed or published. Work remains on local branch `codex/editorial-homepage`.

## Implementation checklist
- [x] Approved layout and Chatbox selected tile applied.
- [x] Actual source assets, service scope, portfolio records and privacy controls preserved.
- [x] Responsive and primary interaction checks passed.
- [x] Material comparison/review findings fixed and recaptured.
- [x] Final build, tests and whitespace check passed.

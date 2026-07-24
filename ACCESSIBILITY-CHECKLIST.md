# Taylor’s Design Media accessibility checklist

The site code is designed to support WCAG 2.2 Level AA. Accessibility is an ongoing process, especially when portfolio videos or branding assets change.

## Before publishing

- Replace `index.html`, `style.css`, and `script.js` together.
- Add `accessibility.html`.
- Keep the existing `assets` folder, including the logo files and hero video.
- Confirm every YouTube video has accurate captions. Correct automatic captions in YouTube Studio when needed.
- Provide a transcript on request. If important visual information is not explained by the audio, also provide an audio-described version or a text description.
- Check that every new meaningful image has concise alternative text. Keep decorative images at `alt=""`.
- Do not place text inside images unless the same information is available as real text.

## Manual checks after publishing

1. Use only the Tab, Shift+Tab, Enter, Space, and Escape keys to test the site.
2. At 200% browser zoom, confirm text does not overlap or disappear.
3. At 400% zoom or a 320 CSS-pixel viewport, confirm the page reflows without horizontal scrolling.
4. Turn on the operating system’s Reduce Motion setting and confirm the hero video remains paused.
5. Test with a screen reader such as VoiceOver, NVDA, or Narrator.
6. Run an automated scan with Lighthouse or axe, then review all results manually.

Automated tools cannot verify caption accuracy, reading order in every assistive technology, or whether alternative text communicates the right meaning.

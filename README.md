## Michael Taylor — project portfolio

The site uses Jekyll. Edit source files, not the generated `_site` folder.

- `index.html` defines the personal portfolio. The featured section includes OneMessage (in progress), Rapture Ready and The Chatbox. Its `leading_titles` list selects the first three carousel projects; the remaining projects follow their `order` values.
- `_projects/*.md` holds project titles, categories, video links, preview images and editing details.
- `style.css` controls the layout, spacing and studio colors. `script.js` handles the mobile menu and project carousel.
- The carousel contains all projects and shows three at a time on desktop, two on tablets and one on phones. It advances every three seconds with an 800ms eased transition and reverses at the ends. Fading dots select each possible position; Pause/Play and Previous/Next remain available. Hover and keyboard interaction pause it. Reduce Motion starts it paused and skips animated transitions. All projects can still be scrolled without JavaScript, which retains the native scrollbar.
- Project metadata is available under each slide’s “Editing details”. The two featured video stories use `_includes/featured-video.html` and the `portfolio_context` and `summary` fields in their project records.
- The OneMessage preview is a screenshot of the current local welcome page, labeled as a prototype. Replace it as the project develops; keep unfinished work clearly marked and only describe completed functionality.
- `_config.yml` controls the personal portfolio title and sharing description. The original TD mark remains in the footer and favicon; the legal business name and domain are unchanged.

Build before running the checks, because some tests inspect the generated pages:

```sh
bundle exec jekyll build
node --test test/*.test.mjs
git diff --check
```

For a local preview that rebuilds after source edits, run `bundle exec jekyll serve` and open the local address printed in Terminal. This does not publish the site.

Keep preview images under `assets/images/projects/`. Videos open on YouTube only after a visitor clicks; do not replace the local previews with remote image URLs or embedded players.

<!--
**Dingohop/Dingohop** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
-->

Social sharing uses `assets/images/social-card-studio.jpg`, a 1200 × 630 card matching the personal portfolio. `_config.yml` supplies it as a page-image default for the SEO plugin. The current editable card layout is `_preview/project-portfolio-2026-11-19/sharing-card-source.html`; the previous card is preserved beside it. Keep original images when revising the card; verify dimensions and run the build/tests afterward.

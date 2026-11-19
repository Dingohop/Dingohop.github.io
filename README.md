## Taylor’s Design Media

The site uses Jekyll. Edit source files, not the generated `_site` folder.

- `index.html` defines the studio homepage. Its `leading_titles` list selects the first three carousel projects; the remaining projects follow their `order` values.
- `_projects/*.md` holds project titles, categories, video links, preview images and editing details.
- `style.css` controls the layout, spacing and studio colors. `script.js` handles the mobile menu and project carousel.
- The carousel contains all projects and shows three at a time on desktop, two on tablets and one on phones. It advances every six seconds; Pause/Play and Previous/Next are available. Hover and keyboard interaction pause it. Reduce Motion starts it paused. All projects can still be scrolled without JavaScript.
- Project metadata is available under each slide’s “Editing details”; detailed service boundaries appear under “Scope & delivery details”.

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

Social sharing uses `assets/images/social-card-studio.jpg`, a 1200 × 630 card matching the current brand. `_config.yml` supplies it as a page-image default for the SEO plugin. The editable card layout and the reel checklist audit are in `_preview/reel-fixes-2026-11-18/`. Keep original images when revising the card; verify dimensions and run the build/tests afterward.

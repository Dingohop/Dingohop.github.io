## Taylor’s Design Media

The site uses Jekyll. Edit source files, not the generated `_site` folder.

- `index.html` defines the homepage; its first three Liquid assignments select the featured and selected projects by title.
- `_projects/*.md` holds project titles, categories, video links, preview images and editing details.
- `style.css` controls the layout and colors. `script.js` handles the mobile menu and portfolio filters.
- All eight projects appear under “View all eight projects”; detailed service boundaries appear under “Scope & delivery details”.

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

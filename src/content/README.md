# Portfolio content

`projects.json` is the recovered project manifest used by the React content studio and emitted to `dist/api/lite-cards` for the lite portfolio experience.

Each item in `cards` contains:

- `slug` — route segment under `/projects/`
- `name` and `nameInk` — display identity and foreground color
- `image` and `ogImage` — hero and social-preview assets
- `editorial` — title, year, copy, role, technologies, challenges, and live URL
- `gallery` — ordered case-study images with alternative text and aspect ratios

Keep asset paths root-relative, such as `/assets/projects/noctalink/preview-1.webp`. Place replacement assets in `dist/assets/`, update the manifest, and run `npm run build && npm run verify`.

The exact compiled case-study pages remain locked separately. Updating this manifest immediately updates the generated lite data and the React studio; synchronizing changed copy into the full recovered case-study pages is a separate migration step until those pages are rebuilt as native source components.

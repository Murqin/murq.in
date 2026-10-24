# Third-Party Licenses

This file contains notices and licensing information for third-party assets used in this repository. These assets are not covered by the project's primary MIT license.

---

## Assets

### 1. Crystal icon (favicon-crystal-*.png, apple-touch-icon-crystal.png)

- **File Path**: `assets/favicon-crystal-32.png`, `assets/favicon-crystal-192.png`, `assets/apple-touch-icon-crystal.png`
- **Source**: Generated with ChatGPT image generation from the owner's own description; resized for icon use
- **Disclaimer**: Not covered by this repository's MIT License.

### 2. avatar-amethyst.webp

- **File Path**: `assets/avatar-amethyst.webp`
- **Character**: Original character by Icarus Murqin (an amethyst stained-glass artisan)
- **Source**: Generated with ChatGPT image generation from the owner's own character description
- **Usage**: Personal avatar for non-commercial website
- **Disclaimer**: Not covered by this repository's MIT License.

---

## Fonts

### 3. Inter

- **File Path**: `assets/fonts/inter-*.woff2`
- **Author**: Rasmus Andersson
- **Source**: [rsms.me/inter](https://rsms.me/inter/) — files obtained via [Fontsource](https://fontsource.org/)
- **License**: [SIL Open Font License 1.1](https://openfontlicense.org/)

### 4. JetBrains Mono

- **File Path**: `assets/fonts/jetbrains-mono-*.woff2`
- **Author**: JetBrains
- **Source**: [jetbrains.com/lp/mono](https://www.jetbrains.com/lp/mono/) — files obtained via [Fontsource](https://fontsource.org/)
- **License**: [SIL Open Font License 1.1](https://openfontlicense.org/)
The same two fonts are also embedded, as WOFF files from the `@fontsource/inter` and
`@fontsource/jetbrains-mono` packages, in the link preview images generated at build time (`og/**.png`).

---

## Data

### 5. Constellation figures

- **File Path**: `src/data/constellations.ts`
- **Source**: Star positions and line figures from `data/constellations.lines.json` in
  [d3-celestial](https://github.com/ofrohn/d3-celestial), projected and rescaled for this site
- **License**: BSD 3-Clause — Copyright (c) 2015, Olaf Frohn. All rights reserved.
  Redistribution and use in source and binary forms, with or without modification, are permitted
  provided that the conditions of the [BSD 3-Clause license](https://github.com/ofrohn/d3-celestial/blob/master/LICENSE)
  are met; the data is provided "as is", without warranty of any kind.

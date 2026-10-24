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

### 2a. avatar-netrunner.webp

- **File Path**: `assets/avatar-netrunner.webp`
- **Source**: Generated with ChatGPT image generation, steered by reference images the owner supplied
  over several rounds; background removed and resized for use as an avatar
- **Usage**: Personal avatar for non-commercial website; also embedded in the generated link preview images
- **Disclaimer**: Not covered by this repository's MIT License.

---

## Fonts

### 3. IBM Plex Sans

- **File Path**: `assets/fonts/ibm-plex-sans-*.woff2`
- **Author**: IBM Corp.
- **Source**: [github.com/IBM/plex](https://github.com/IBM/plex) — files obtained via [Fontsource](https://fontsource.org/)
- **License**: [SIL Open Font License 1.1](https://openfontlicense.org/)

### 4. IBM Plex Mono

- **File Path**: `assets/fonts/ibm-plex-mono-*.woff2`
- **Author**: IBM Corp.
- **Source**: [github.com/IBM/plex](https://github.com/IBM/plex) — files obtained via [Fontsource](https://fontsource.org/)
- **License**: [SIL Open Font License 1.1](https://openfontlicense.org/)

The same two fonts are also embedded, as WOFF files from the `@fontsource/ibm-plex-sans` and
`@fontsource/ibm-plex-mono` packages, in the link preview images generated at build time (`og/**.png`).

---

## Data

### 5. Constellation figures

- **File Path**: `src/data/constellations.ts`
- **Source**: Star positions and line figures from `data/constellations.lines.json` in
  [d3-celestial](https://github.com/ofrohn/d3-celestial), projected and rescaled for this site
- **License**: BSD 3-Clause, reproduced in full:

  > Copyright (c) 2015, Olaf Frohn
  > All rights reserved.
  >
  > Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
  >
  > 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
  >
  > 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
  >
  > 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
  >
  > THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

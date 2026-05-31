# Design Spec: Background Music & Cloudflare KV Visitor Counter Integration

This document outlines the design, architecture, and implementation details for integrating background music and a serverless visitor counter into the minimalist glassmorphic website (`murq.in`).

## 1. Goals

1.  **Background Music:** Integrate `assets/Before_the_City_Wakes.mp3` as an optional loop track with a sleek, glassmorphic UI controller and a CSS-animated equalizer.
2.  **KV Visitor Counter:** Build a serverless visitor counter using **Cloudflare Pages Functions** and **Cloudflare KV**, displaying it cleanly in the footer without cluttering the aesthetic.

## 2. Requirements & UX Decisions

### Background Music
*   **Zero-Friction Initial Load (Option B):** The site loads instantly without any blocking splash screen.
*   **Smart Autoplay Mitigation:** If `localStorage` indicates music should be enabled, but the browser blocks autoplay, a global click/interaction listener is registered. The moment the user clicks anywhere on the page, the music starts seamlessly, and the listener is destroyed.
*   **Glassmorphic Controller:** Located in the main `.hero` card (below the tagline, above the social media buttons).
*   **CSS Equalizer Visualizer:** 4 vertical animated bars that bounce smoothly using CSS keyframes when music is playing, and gently collapse to their static baseline state when paused.
*   **State Persistence:** Saved in `localStorage` as `music-enabled` (`'true'` or `'false'`).

### KV Visitor Counter
*   **Serverless Edge Function:** Deployed under `/functions/api/visitors.js` to run on Cloudflare's global edge network.
*   **Spam Mitigation (Refresh Prevention):** Uses `sessionStorage` in the client's browser. The API will only be hit with an increment flag once per session. Subsequent page refreshes in the same tab will fetch the current count without incrementing.
*   **Aesthetic UI Integration:** Merged gracefully inside the footer block with a minimalist eye/user icon (`👁️ [count] visits`).

---

## 3. UI/UX Design Spec

### HTML Structure (`index.html`)

*   **Audio Element:**
    ```html
    <audio id="bg-music" src="./assets/Before_the_City_Wakes.mp3" loop preload="auto"></audio>
    ```
*   **Music Player Markup (placed in `.hero`):**
    ```html
    <div class="music-player-container">
        <button id="music-toggle" class="music-btn" aria-label="Müziği oynat veya durdur">
            <svg class="play-icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
            </svg>
            <svg class="pause-icon" viewBox="0 0 24 24" width="16" height="16" style="display: none;">
                <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
        </button>
        <span class="track-title">Before the City Wakes</span>
        <div class="equalizer" aria-hidden="true">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        </div>
    </div>
    ```
*   **Visitor Counter Markup (placed in `<footer>` inside `.footer-box`):**
    ```html
    <div class="footer-content">
        <span class="copyright">&copy; 2026 Icarus Murqin</span>
        <span class="footer-separator" aria-hidden="true">•</span>
        <span id="visitor-count" class="visitor-counter">
            <svg class="eye-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
            <span class="count-value">...</span> visits
        </span>
    </div>
    ```

---

## 4. Technical Architecture

### Cloudflare Pages Function (`functions/api/visitors.js`)

A serverless handler utilizing Cloudflare KV binding named `KV`:
```javascript
export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const shouldIncrement = url.searchParams.get('inc') === 'true';

    try {
        let count = parseInt(await env.KV.get('visitor_count') || '0');

        if (shouldIncrement) {
            count += 1;
            await env.KV.put('visitor_count', count.toString());
        }

        return new Response(JSON.stringify({ count }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
```

### Client-Side State Logic (`script.js`)

1.  **Visitor Count Flow:**
    *   On load, check if `sessionStorage.getItem('visited')` exists.
    *   If `null`, set `sessionStorage.setItem('visited', 'true')` and call `/api/visitors?inc=true`.
    *   If exists, call `/api/visitors` (reads count without incrementing).
    *   Update `#visitor-count .count-value` with the returned count.

2.  **Audio Player Flow:**
    *   Check `localStorage.getItem('music-enabled')`.
    *   If `'true'`, attempt play. If blocked, bind a one-time click/touch listener to `document` to start audio on the first gesture.

---

## 5. Deployment & Binding Instructions

To make the visitor counter work in production, the user must bind their Cloudflare KV namespace to the Pages project:

1.  Create a KV namespace named `murqin-kv` (either in Cloudflare Dashboard -> KV or via Wrangler CLI).
2.  Go to **Cloudflare Pages Dashboard** -> **murq.in project** -> **Settings** -> **Functions** -> **KV namespace bindings**.
3.  Add a binding:
    *   **Variable name:** `KV`
    *   **KV namespace:** Select your created KV namespace (`murqin-kv`).
4.  Redeploy the site.

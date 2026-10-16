/**
 * Murqin - paper, clock, links, ruler. Zero dependencies.
 */
(() => {
    'use strict';

    const $ = (id) => document.getElementById(id);
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Paper stock and theme. The stock is picked by the inline script in <head> before first paint.
    const STOCKS = window.CS_STOCKS;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const ICONS = {
        dark: '<path d="M11.5 8.6A5 5 0 0 1 5.4 2.5a5 5 0 1 0 6.1 6.1z"/>',
        light: '<circle cx="7" cy="7" r="2.6"/><path d="M7 1v1.4M7 11.6V13M1 7h1.4M11.6 7H13M2.8 2.8l1 1M10.2 10.2l1 1M2.8 11.2l1-1M10.2 3.8l1-1"/>'
    };

    function setPaper(theme, stock) {
        const list = STOCKS[theme];
        const pick = stock || list[Math.floor(Math.random() * list.length)];
        root.setAttribute('data-theme', theme);
        root.setAttribute('data-stock', pick[0]);
        root.style.setProperty('--page', pick[1]);
        if (themeColor) themeColor.setAttribute('content', pick[1]);
        $('stock-name').textContent = pick[0];
        $('theme-label').textContent = theme === 'dark' ? 'Dark' : 'Light';
        // The icon shows the current state, like the label: moon for dark, sun for light.
        $('theme-icon').innerHTML = ICONS[theme];
        $('theme-btn').setAttribute('aria-pressed', String(theme === 'dark'));
        $('theme-btn').setAttribute('aria-label', theme === 'dark' ? 'Dark mode on, switch to light' : 'Light mode on, switch to dark');
    }

    const startTheme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    setPaper(startTheme, STOCKS[startTheme].find((s) => s[0] === root.getAttribute('data-stock')));

    $('stock-btn').addEventListener('click', () => {
        const theme = root.getAttribute('data-theme');
        const list = STOCKS[theme];
        let next;
        do { next = list[Math.floor(Math.random() * list.length)]; } while (next[0] === root.getAttribute('data-stock'));
        setPaper(theme, next);
    });

    $('theme-btn').addEventListener('click', () => {
        const theme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('cs-theme', theme); } catch (e) { /* private mode: the choice lasts for this visit only */ }
        setPaper(theme);
    });

    // 2. Local time in Istanbul (zero network)
    const clock = $('clock');
    const timeFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', hour12: false });
    const tick = () => { clock.textContent = timeFormatter.format(new Date()); };
    tick();
    setInterval(tick, 10000);

    // 3. Email copy: the address on the right turns into "Copied"
    const emailBtn = $('email-btn');
    const emailAddr = $('email-addr');
    const email = emailBtn.getAttribute('data-email');
    let copyTimeout;

    function selectAddress() {
        const range = document.createRange();
        range.selectNodeContents(emailAddr);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    emailBtn.addEventListener('click', async () => {
        try {
            if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
            await navigator.clipboard.writeText(email);
            emailBtn.classList.add('copied');
            emailAddr.textContent = 'Copied';
            clearTimeout(copyTimeout);
            copyTimeout = setTimeout(() => {
                emailBtn.classList.remove('copied');
                emailAddr.textContent = email;
            }, 1600);
        } catch (err) {
            // Without clipboard access, leave the address selected so it can be copied by hand.
            selectAddress();
        }
    });

    // 4. Keyboard shortcuts: the row numbers 01-05 are the keys
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable || e.ctrlKey || e.metaKey || e.altKey) {
            return;
        }
        const target = document.querySelector(`.cs-list__name[data-key="${e.key}"]`);
        if (!target) return;
        e.preventDefault();
        // Press the row's key cap for a moment, so the keyboard shortcut shows which row it hit.
        const row = target.closest('li');
        row.classList.add('is-key');
        setTimeout(() => row.classList.remove('is-key'), 220);
        if (target.tagName === 'A') {
            window.open(target.href, '_blank', 'noopener,noreferrer');
        } else {
            target.click();
        }
    });

    // 5. Links list: the five-row scroll only exists once there are more than five links
    const rows = $('rows');
    const count = rows.children.length;
    if (count > 5) {
        const pad = (n) => String(n).padStart(2, '0');
        const updatePos = () => {
            const first = Math.round(rows.scrollTop / rows.children[0].offsetHeight) + 1;
            $('rows-pos').textContent = `${pad(first)}–${pad(Math.min(count, first + 4))} / ${pad(count)}`;
        };
        rows.tabIndex = 0;
        rows.setAttribute('aria-label', 'Links, scroll for more');
        $('rows-foot').hidden = false;
        rows.addEventListener('scroll', updatePos, { passive: true });
        updatePos();
    }

    // 6. Ruler: a major tick and label per page; the marker follows the real scroll position
    const ruler = $('ruler');
    const pages = Array.from(document.querySelectorAll('.cs-leaf'));
    const MINOR = 24;
    const labels = [];
    const axis = document.createElement('span');
    axis.className = 'cs-ruler__axis';
    ruler.appendChild(axis);
    for (let i = 0; i <= MINOR; i++) {
        const t = document.createElement('span');
        t.className = 'cs-ruler__tick';
        t.style.top = `${(i / MINOR) * 100}%`;
        ruler.appendChild(t);
    }
    pages.forEach((page, i) => {
        const pos = pages.length > 1 ? i / (pages.length - 1) : 0;
        const major = document.createElement('span');
        major.className = 'cs-ruler__tick cs-ruler__tick--major';
        major.style.top = `${pos * 100}%`;
        const a = document.createElement('a');
        a.className = 'cs-ruler__label';
        a.href = `#${page.id}`;
        a.textContent = page.id;
        a.style.top = `${pos * 100}%`;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            page.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        });
        ruler.append(major, a);
        labels.push(a);
    });
    const mark = document.createElement('span');
    mark.className = 'cs-ruler__mark';
    ruler.appendChild(mark);

    function updateRuler() {
        const max = root.scrollHeight - window.innerHeight;
        const prog = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        mark.style.top = `${prog * 100}%`;
        const current = Math.round(prog * (pages.length - 1));
        labels.forEach((a, i) => a.setAttribute('aria-current', String(i === current)));
    }
    window.addEventListener('scroll', updateRuler, { passive: true });
    window.addEventListener('resize', updateRuler);
    updateRuler();

    // 7. Entrance: a page settles in when it fills the screen; the first page is still on load
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                if (e.target.id !== 'cover' || e.target.dataset.seen) e.target.classList.add('is-in');
                e.target.dataset.seen = '1';
            } else {
                e.target.classList.remove('is-in');
            }
        });
    }, { threshold: 0.6 });
    pages.forEach((p) => io.observe(p));
})();

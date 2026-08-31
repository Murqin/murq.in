/**
 * Murqin - Ultra-lightweight Micro-interactions (Zero Dependencies)
 */
(() => {
    'use strict';

    // 1. Live Local Time Display (Zero Network, Tabular Numbers)
    const timeEl = document.getElementById('local-time');
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Istanbul',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    function updateClock() {
        if (timeEl) {
            timeEl.textContent = timeFormatter.format(new Date());
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    // 2. Email Copy with Inline Morph (Zero Layout Shift)
    const emailBtn = document.getElementById('email-btn');
    if (emailBtn) {
        let copyTimeout;
        const textSpan = emailBtn.querySelector('.pill-text');
        const email = emailBtn.getAttribute('data-email') || 'murqin@proton.me';

        emailBtn.addEventListener('click', async () => {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(email);
                } else {
                    // Fallback for non-https / direct file protocol
                    const textarea = document.createElement('textarea');
                    textarea.value = email;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                }

                emailBtn.classList.add('copied');
                textSpan.textContent = 'Copied!';

                clearTimeout(copyTimeout);
                copyTimeout = setTimeout(() => {
                    emailBtn.classList.remove('copied');
                    textSpan.textContent = 'Email';
                }, 1800);
            } catch (err) {
                // Fallback to mailto if copy fails
                window.location.href = `mailto:${email}`;
            }
        });
    }

    // 3. Keyboard Shortcuts (1-5) & Tab User Detection
    window.addEventListener('keydown', (e) => {
        // Enable shortcut badges when user presses Tab
        if (e.key === 'Tab') {
            document.body.classList.add('show-shortcuts');
        }

        // Ignore if user is inside an input, textarea, or holding modifier keys
        if (
            e.target.tagName === 'INPUT' ||
            e.target.tagName === 'TEXTAREA' ||
            e.target.isContentEditable ||
            e.ctrlKey ||
            e.metaKey ||
            e.altKey
        ) {
            return;
        }

        if (['1', '2', '3', '4', '5'].includes(e.key)) {
            const targetPill = document.querySelector(`.pill[data-key="${e.key}"]`);
            if (targetPill) {
                e.preventDefault();
                targetPill.classList.add('key-active');
                setTimeout(() => targetPill.classList.remove('key-active'), 180);

                if (targetPill.tagName === 'A') {
                    window.open(targetPill.href, '_blank', 'noopener,noreferrer');
                } else {
                    targetPill.click();
                }
            }
        }
    });
})();

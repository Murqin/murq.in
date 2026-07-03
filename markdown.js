// Mini markdown çevirici — sitenin ihtiyacı kadar sözdizimi, sıfır bağımlılık.
// Desteklenen: #–###### başlık, paragraf, -/* ve 1. listeleri, > alıntı,
// ``` kod bloğu, --- çizgi, **kalın**, *italik*, `satır içi kod`,
// [link](url), ![görsel](url)
// Güvenlik: tüm girdi önce HTML-escape edilir; çıktıya yalnızca burada
// üretilen etiketler girer. Link/görsel adresleri şema beyaz listesinden
// geçer (http, https ve site içi yollar) — javascript: vb. reddedilir.

function mdEscapeHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function mdSafeUrl(url) {
    if (/^https?:\/\//i.test(url)) return url;
    if (/^(\.?\/|#)/.test(url)) return url; // site içi yol veya sayfa içi çapa
    return null;
}

function mdInline(text) {
    // Kod aralıkları önce ayrılır ki içleri vurgu/link kurallarından etkilenmesin
    const codeSpans = [];
    text = text.replace(/`([^`]+)`/g, (m, code) => {
        codeSpans.push('<code>' + code + '</code>');
        return '\u0000' + (codeSpans.length - 1) + '\u0000';
    });

    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => {
        const safe = mdSafeUrl(url);
        return safe
            ? '<img src="' + safe + '" alt="' + alt + '" loading="lazy">'
            : m;
    });

    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
        const safe = mdSafeUrl(url);
        if (!safe) return m;
        const external = /^https?:\/\//i.test(safe)
            ? ' target="_blank" rel="noopener noreferrer"'
            : '';
        return '<a href="' + safe + '"' + external + '>' + label + '</a>';
    });

    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    return text.replace(/\u0000(\d+)\u0000/g, (m, i) => codeSpans[+i]);
}

function markdownToHtml(md) {
    // Girdi bu noktada bütünüyle escape edilir; ">" artık "&gt;" olarak gelir
    const lines = mdEscapeHtml(md.replace(/\r\n?/g, '\n')).split('\n');
    const out = [];
    let i = 0;

    const isBlockStart = (line) =>
        /^(#{1,6}\s|```|[-*]\s|\d+\.\s|&gt;)/.test(line) ||
        /^(---+|\*\*\*+)\s*$/.test(line);

    while (i < lines.length) {
        const line = lines[i];

        if (!line.trim()) { i++; continue; }

        if (/^```/.test(line)) {
            const buf = [];
            i++;
            while (i < lines.length && !/^```/.test(lines[i])) {
                buf.push(lines[i]);
                i++;
            }
            i++; // kapanış çiti
            out.push('<pre><code>' + buf.join('\n') + '</code></pre>');
            continue;
        }

        const heading = line.match(/^(#{1,6})\s+(.*)$/);
        if (heading) {
            const level = heading[1].length;
            out.push('<h' + level + '>' + mdInline(heading[2]) + '</h' + level + '>');
            i++;
            continue;
        }

        if (/^(---+|\*\*\*+)\s*$/.test(line)) {
            out.push('<hr>');
            i++;
            continue;
        }

        if (/^&gt;\s?/.test(line)) {
            const buf = [];
            while (i < lines.length && /^&gt;\s?/.test(lines[i])) {
                buf.push(lines[i].replace(/^&gt;\s?/, ''));
                i++;
            }
            out.push('<blockquote><p>' + mdInline(buf.join(' ')) + '</p></blockquote>');
            continue;
        }

        const listMatch = /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line);
        if (listMatch) {
            const ordered = /^\d+\.\s+/.test(line);
            const marker = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
            const items = [];
            while (i < lines.length && marker.test(lines[i])) {
                items.push('<li>' + mdInline(lines[i].replace(marker, '')) + '</li>');
                i++;
            }
            const tag = ordered ? 'ol' : 'ul';
            out.push('<' + tag + '>' + items.join('') + '</' + tag + '>');
            continue;
        }

        // Paragraf: boş satıra ya da başka bir blok başlangıcına kadar birleştir
        const buf = [line];
        i++;
        while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
            buf.push(lines[i]);
            i++;
        }
        out.push('<p>' + mdInline(buf.join(' ')) + '</p>');
    }

    return out.join('\n');
}

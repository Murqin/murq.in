const ALLOWED_ORIGINS = [
    'https://murq.in',
    'http://localhost:8788', // wrangler pages dev
];

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}

// KV binding yoksa (yerel önizleme / eksik yapılandırma) mock değerle devam et
function kvMissingResponse() {
    return jsonResponse({
        count: 9999,
        warning: "Cloudflare KV Namespace 'KV' binding is missing. Using local fallback.",
    });
}

// GET: yalnızca okuma, yan etkisiz
export async function onRequestGet(context) {
    const kv = context.env.KV;
    if (!kv) return kvMissingResponse();

    try {
        const count = parseInt((await kv.get('visitor_count')) || '0');
        return jsonResponse({ count });
    } catch (err) {
        return jsonResponse({ error: err.message }, 500);
    }
}

// POST: Origin doğrulamalı artırma
export async function onRequestPost(context) {
    const { request, env } = context;

    const origin = request.headers.get('Origin');
    if (!ALLOWED_ORIGINS.includes(origin)) {
        return jsonResponse({ error: 'Forbidden' }, 403);
    }

    const kv = env.KV;
    if (!kv) return kvMissingResponse();

    try {
        // Not: KV get/put atomik değildir; eşzamanlı ziyaretlerde nadiren
        // bir sayım kaybolabilir. Kişisel site ölçeğinde kabul edilebilir.
        const count = parseInt((await kv.get('visitor_count')) || '0') + 1;
        await kv.put('visitor_count', count.toString());
        return jsonResponse({ count });
    } catch (err) {
        return jsonResponse({ error: err.message }, 500);
    }
}

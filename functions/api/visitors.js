const ALLOWED_ORIGINS = [
    'https://murq.in',
    'https://www.murq.in',
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

// No KV binding (local preview / missing config) — continue with a mock value
function kvMissingResponse() {
    return jsonResponse({
        count: 9999,
        warning: "Cloudflare KV Namespace 'KV' binding is missing. Using local fallback.",
    });
}

// GET: read-only, no side effects
export async function onRequestGet(context) {
    const kv = context.env.KV;
    if (!kv) return kvMissingResponse();

    try {
        const stored = parseInt((await kv.get('visitor_count')) || '0');
        const count = Number.isFinite(stored) ? stored : 0;
        return jsonResponse({ count });
    } catch (err) {
        return jsonResponse({ error: err.message }, 500);
    }
}

// POST: origin-checked increment
export async function onRequestPost(context) {
    const { request, env } = context;

    const origin = request.headers.get('Origin');
    if (!ALLOWED_ORIGINS.includes(origin)) {
        return jsonResponse({ error: 'Forbidden' }, 403);
    }

    const kv = env.KV;
    if (!kv) return kvMissingResponse();

    try {
        // Note: KV get/put is not atomic; concurrent visits may rarely lose
        // a count. Acceptable at personal-site scale.
        const stored = parseInt((await kv.get('visitor_count')) || '0');
        const count = (Number.isFinite(stored) ? stored : 0) + 1;
        await kv.put('visitor_count', count.toString());
        return jsonResponse({ count });
    } catch (err) {
        return jsonResponse({ error: err.message }, 500);
    }
}

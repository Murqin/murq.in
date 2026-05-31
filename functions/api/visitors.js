export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const shouldIncrement = url.searchParams.get('inc') === 'true';

    // Access KV Namespace binding named 'KV'
    const kv = env.KV;

    if (!kv) {
        // If no KV binding is set up yet (e.g., local preview or missing configuration), 
        // fall back to a mock count value gracefully to avoid breaking frontend rendering
        return new Response(JSON.stringify({ 
            count: 9999, 
            warning: "Cloudflare KV Namespace 'KV' binding is missing. Using local fallback." 
        }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    try {
        let count = parseInt(await kv.get('visitor_count') || '0');

        if (shouldIncrement) {
            count += 1;
            await kv.put('visitor_count', count.toString());
        }

        return new Response(JSON.stringify({ count }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

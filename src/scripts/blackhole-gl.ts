// Ray-traced black hole for the dice easter egg. Each pixel's ray is bent by the hole's gravity
// (the standard Schwarzschild trick: integrate the photon with acceleration -1.5·h²·r̂/r⁴, h being its
// conserved angular momentum), so the far side of the disk shows up lensed over and under the
// shadow. Units: the event horizon has radius 1. The sky is left transparent: the page's own seeded
// gradient shows through, so the hole opens inside whatever theme is on screen instead of cutting
// to a sky of its own. Written for this site; returns null where WebGL is missing, and
// blackhole.ts then teleports the page out instead.

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uDist;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

const float DISK_IN = 3.0;   // innermost stable circular orbit: 3 horizon radii
const float DISK_OUT = 12.0;
// Rays aimed closer than 3·sqrt(3)/2 horizon radii fall in; this is the shadow's edge as seen from afar.
const float CRITICAL_IMPACT = 2.598076211;

// Emission and opacity of the disk where the ray crosses its plane.
vec4 disk(vec3 hit, vec3 rayDir) {
    float r = length(hit.xz);
    if (r < DISK_IN || r > DISK_OUT) return vec4(0.0);
    float phi = atan(hit.z, hit.x) + uTime * 3.2 * pow(r, -1.5);
    // Circular coordinates keep orbiting filaments continuous across the atan seam.
    vec2 orbit = vec2(cos(phi), sin(phi));
    float eddies = noise(orbit * 5.0 + vec2(r * 1.7));
    float detail = noise(orbit * 17.0 + vec2(r * 6.0));
    // Fade subpixel bands at grazing angles instead of letting them shimmer at half resolution.
    float footprint = uDist / (1.6 * uRes.y)
        / max(0.15, abs(normalize(rayDir).y));
    float bandContrast = 1.0 - smoothstep(0.08, 0.3, footprint);
    float filaments = 0.5 + 0.5 * sin(r * 16.0 + eddies * 8.0) * bandContrast;
    float density = 0.5 + 0.3 * eddies + 0.2 * detail;
    float edge = smoothstep(DISK_IN, DISK_IN + 0.45, r)
        * (1.0 - smoothstep(8.0, DISK_OUT, r));

    // The frequency shift combines gravitational redshift and the local orbital Doppler factor.
    // A backwards-traced photon points opposite the emitted light, hence the plus in the denominator.
    float beta = sqrt(0.5 / (r - 1.0));
    vec3 tangent = vec3(-hit.z, 0.0, hit.x) / r;
    float shift = sqrt(1.0 - 1.0 / r) * sqrt(1.0 - beta * beta)
        / (1.0 + beta * dot(tangent, normalize(rayDir)));
    float heat = pow(DISK_IN / r, 0.75);
    vec3 amber = vec3(1.0, 0.22, 0.035);
    vec3 gold = vec3(1.0, 0.62, 0.22);
    vec3 ivory = vec3(1.0, 0.94, 0.81);
    float temperature = clamp(heat * shift, 0.0, 1.0);
    vec3 color = mix(amber, gold, smoothstep(0.2, 0.65, temperature));
    color = mix(color, ivory, smoothstep(0.6, 1.0, temperature));
    float emission = 5.0 * heat * heat * heat * pow(shift, 3.0)
        * density * (0.65 + 0.7 * filaments);
    // Grazing paths see more gas, without paying for a volume march inside every orbit step.
    float opticalDepth = edge * density * 0.65 / max(0.22, abs(normalize(rayDir).y));
    return vec4(color * emission, 1.0 - exp(-opticalDepth));
}

vec3 acceleration(vec3 p, float h2) {
    float r2 = max(dot(p, p), 0.25);
    return -1.5 * h2 * p / (r2 * r2 * sqrt(r2));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    float approach = smoothstep(0.0, 3.2, uTime);
    vec3 cam = vec3(0.0, uDist * mix(0.16, 0.075, approach), -uDist);
    vec3 fwd = normalize(-cam);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
    vec3 up = cross(fwd, right);
    float roll = mix(-0.24, -0.10, approach);
    vec3 rr = right * cos(roll) + up * sin(roll);
    vec3 uu = up * cos(roll) - right * sin(roll);
    vec3 dir = normalize(fwd * 1.6 + rr * uv.x + uu * uv.y);

    vec3 p = cam;
    // Convert the camera's local direction to affine velocity. Renormalizing it during integration
    // would destroy the conserved angular momentum and shift the photon sphere away from r = 1.5.
    vec3 radial = dot(dir, fwd) * fwd;
    vec3 v = radial + (dir - radial) / sqrt(1.0 - 1.0 / length(cam));
    vec3 angularMomentum = cross(p, v);
    float h2 = dot(angularMomentum, angularMomentum);
    float pixelImpact = length(cam) / (1.6 * uRes.y);
    float shadow = 1.0 - smoothstep(CRITICAL_IMPACT - pixelImpact * 0.65,
        CRITICAL_IMPACT + pixelImpact * 0.65, sqrt(h2));
    vec3 col = vec3(0.0);
    float alpha = 0.0;
    vec3 acc = acceleration(p, h2);

    for (int i = 0; i < 180; i++) {
        float r = length(p);
        if (r < 1.0 || (r > 14.0 && dot(p, v) > 0.0)) break;
        // Spend steps near the photon sphere; long empty approaches do not need the same precision.
        float dt = r * mix(0.035, 0.18, smoothstep(1.5, 6.0, r));
        vec3 np = p + v * dt + 0.5 * acc * dt * dt;
        vec3 nextAcc = acceleration(np, h2);
        vec3 nv = v + 0.5 * (acc + nextAcc) * dt;
        if (p.y * np.y < 0.0) {
            float crossing = p.y / (p.y - np.y);
            vec4 d = disk(mix(p, np, crossing), mix(v, nv, crossing));
            col += (1.0 - alpha) * d.rgb * d.a;
            alpha += (1.0 - alpha) * d.a;
            if (alpha > 0.995) break;
        }
        p = np;
        v = nv;
        acc = nextAcc;
    }
    // Only captured rays cover empty sky. Exhausting the step budget must never paint a black halo.
    // Tone-map straight radiance, then premultiply again so RGB cannot exceed coverage at disk edges.
    float cover = alpha + (1.0 - alpha) * shadow;
    vec3 mapped = 1.0 - exp(-col / max(cover, 0.0001) * 1.2);
    gl_FragColor = vec4(pow(mapped, vec3(0.9)) * cover, cover);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Black hole shader failed:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

/** Starts drawing into `canvas`; returns a stop function, or null when WebGL is unavailable. */
export function startBlackHole(canvas: HTMLCanvasElement): (() => void) | null {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true });
    if (!gl) return null;
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    let frame = 0;
    let stopped = false;
    const stop = () => {
        if (stopped) return;
        stopped = true;
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', resize);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    if (!vs || !fs || !program || !buffer) {
        stop();
        return null;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        stop();
        return null;
    }
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uDist = gl.getUniformLocation(program, 'uDist');

    // Bound work on large displays too; CSS pixels deliberately ignore devicePixelRatio.
    let quality = 1;
    function resize() {
        const width = Math.max(1, window.innerWidth);
        const height = Math.max(1, window.innerHeight);
        const scale = Math.min(0.5, Math.sqrt(360000 / (width * height))) * quality;
        canvas.width = Math.max(1, Math.floor(width * scale));
        canvas.height = Math.max(1, Math.floor(height * scale));
        gl!.viewport(0, 0, canvas.width, canvas.height);
        gl!.uniform2f(uRes, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();
    let previous = start;
    let slowFrames = 0;
    const draw = (now: number) => {
        if (stopped) return;
        if (gl.isContextLost()) {
            stop();
            return;
        }
        const t = (now - start) / 1000;
        // Ignore startup compilation, and only reduce quality: oscillating resolution is distracting.
        slowFrames = t > 0.4 && now - previous > 24 ? slowFrames + 1 : 0;
        previous = now;
        if (slowFrames >= 8 && quality > 0.55) {
            quality = Math.max(0.55, quality * 0.8);
            resize();
            slowFrames = 0;
        }
        const approach = Math.min(1, t / 3.2);
        const ease = approach * approach * (3 - 2 * approach);
        gl.uniform1f(uTime, t);
        gl.uniform1f(uDist, 64 - 34 * ease);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return stop;
}

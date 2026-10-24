// Ray-traced black hole for the dice easter egg. Each pixel's ray is bent by the hole's gravity
// (the standard Schwarzschild trick: integrate the photon with acceleration -1.5·h²·r̂/r⁴, h being its
// conserved angular momentum), so the far side of the disk shows up lensed over and under the
// shadow. Units: the event horizon has radius 1. The sky is left transparent: the page's own seeded
// gradient shows through, so the hole opens inside whatever theme is on screen instead of cutting
// to a sky of its own. Written for this site; returns null where WebGL is missing so the CSS
// version can stand in.

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

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
}

const float DISK_IN = 3.0;   // innermost stable orbit, 3 horizon radii
const float DISK_OUT = 12.0;

// Emission and opacity of the disk where the ray crosses its plane.
vec4 disk(vec3 hit, vec3 rayDir) {
    float r = length(hit.xz);
    if (r < DISK_IN || r > DISK_OUT) return vec4(0.0);
    float phi = atan(hit.z, hit.x);
    // Keplerian shear: inner gas laps the outer gas, which turns the noise into spiral streaks.
    float spin = uTime * 2.2 * pow(r, -1.5);
    float streaks = fbm(vec2(log(r) * 9.0, (phi + spin) * 3.0));
    float fine = fbm(vec2(r * 3.5, (phi + spin) * 12.0));
    // Hotter inside; falls to zero at the inner edge and fades out at the outer one.
    float temp = pow(DISK_IN / r, 2.2) * (1.0 - sqrt(DISK_IN / r) * 0.8);
    float edge = smoothstep(DISK_IN, DISK_IN + 0.6, r) * smoothstep(DISK_OUT, DISK_OUT - 4.0, r);
    // Doppler beaming: gas moving toward the camera is brighter and whiter.
    vec3 vel = normalize(vec3(-hit.z, 0.0, hit.x)) * sqrt(0.5 / r);
    float g = 1.0 / max(0.25, 1.0 + dot(vel, rayDir) * 1.6);
    float intensity = temp * edge * (0.45 + 0.9 * streaks * fine) * g * g * g;
    vec3 hot = vec3(1.0, 0.92, 0.82);
    vec3 warm = vec3(1.0, 0.48, 0.16);
    vec3 col = mix(warm, hot, clamp(temp * 1.4 * g, 0.0, 1.0)) * intensity * 5.0;
    return vec4(col, clamp(edge * (0.55 + 0.5 * streaks), 0.0, 0.95));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    // Camera a few degrees above the disk plane, so the near side of the disk reads as a tilted band.
    vec3 cam = vec3(0.0, uDist * 0.09, -uDist);
    vec3 fwd = normalize(-cam);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
    vec3 up = cross(fwd, right);
    float roll = -0.18;
    vec3 rr = right * cos(roll) + up * sin(roll);
    vec3 uu = up * cos(roll) - right * sin(roll);
    vec3 dir = normalize(fwd * 1.6 + rr * uv.x + uu * uv.y);

    vec3 p = cam;
    vec3 v = dir;
    float h2 = dot(cross(p, v), cross(p, v));
    vec3 col = vec3(0.0);
    float alpha = 0.0;
    bool escaped = false;

    for (int i = 0; i < 220; i++) {
        float r2 = dot(p, p);
        if (r2 < 1.0) break;
        float r = sqrt(r2);
        float dt = clamp(0.06 * r, 0.02, 0.8);
        vec3 acc = -1.5 * h2 * p / (r2 * r2 * r);
        vec3 np = p + v * dt;
        v = normalize(v + acc * dt);
        if (p.y * np.y < 0.0) {
            vec3 hit = mix(p, np, p.y / (p.y - np.y));
            vec4 d = disk(hit, v);
            col += (1.0 - alpha) * d.rgb * d.a;
            alpha += (1.0 - alpha) * d.a;
            if (alpha > 0.98) break;
        }
        p = np;
        if (r2 > 900.0 && dot(p, v) > 0.0) { escaped = true; break; }
    }
    // Escaped rays let the page show through; captured ones, and those that ran out of steps
    // skimming the photon sphere, are the shadow. Colour stays premultiplied by coverage.
    float cover = escaped ? alpha : 1.0;
    col = 1.0 - exp(-col * 1.4);
    gl_FragColor = vec4(pow(col, vec3(0.9)), cover);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Black hole shader failed:', gl.getShaderInfoLog(shader));
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
    if (!vs || !fs || !program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uDist = gl.getUniformLocation(program, 'uDist');

    // Half resolution, upscaled by CSS: ~220 ray steps per pixel is the cost, and the effect only
    // runs for a few seconds, so sharpness is the cheaper thing to give up.
    const scale = 0.5;
    canvas.width = Math.round(window.innerWidth * scale);
    canvas.height = Math.round(window.innerHeight * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);

    const start = performance.now();
    let frame = 0;
    const draw = (now: number) => {
        const t = (now - start) / 1000;
        // Fall in from afar during the first two seconds, then hold.
        const approach = Math.min(1, t / 2);
        gl.uniform1f(uTime, t);
        gl.uniform1f(uDist, 60 - 28 * (1 - Math.pow(1 - approach, 3)));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
        cancelAnimationFrame(frame);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
}

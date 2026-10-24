import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(
    readFileSync(new URL('../src/scripts/blackhole-gl.ts', import.meta.url), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;

function setup({ unavailable = false, compile = true, link = true, buffer = true } = {}) {
    const callbacks = new Map();
    const listeners = new Map();
    const deleted = new Set();
    let nextFrame = 0;
    let releases = 0;
    let draws = 0;
    let lost = false;
    const resource = () => ({});
    const gl = {
        createShader: resource, shaderSource() {}, compileShader() {},
        getShaderParameter: () => compile, getShaderInfoLog: () => 'Compile failed',
        createProgram: resource, attachShader() {}, linkProgram() {},
        getProgramParameter: () => link, useProgram() {},
        createBuffer: () => buffer ? resource() : null, bindBuffer() {}, bufferData() {},
        getAttribLocation: () => 0, enableVertexAttribArray() {}, vertexAttribPointer() {},
        getUniformLocation: resource, viewport() {}, uniform2f() {}, uniform1f() {},
        drawArrays: () => draws++, isContextLost: () => lost,
        deleteShader: value => deleted.add(value), deleteProgram: value => deleted.add(value),
        deleteBuffer: value => deleted.add(value),
        getExtension: () => ({ loseContext: () => releases++ }),
    };
    const canvas = { width: 0, height: 0, getContext: () => unavailable ? null : gl };
    const window = {
        innerWidth: 1920, innerHeight: 1080,
        addEventListener: (name, callback) => listeners.set(name, callback),
        removeEventListener: name => listeners.delete(name),
    };
    const context = vm.createContext({
        exports: {}, window, performance: { now: () => 0 }, console: { warn() {} },
        requestAnimationFrame: callback => { callbacks.set(++nextFrame, callback); return nextFrame; },
        cancelAnimationFrame: id => callbacks.delete(id),
    });
    vm.runInContext(source, context);
    return {
        start: () => context.exports.startBlackHole(canvas), canvas, window, listeners, callbacks, deleted,
        releases: () => releases, draws: () => draws,
        lose: () => { lost = true; },
        tick(now) {
            const [id, callback] = callbacks.entries().next().value;
            callbacks.delete(id);
            callback(now);
        },
    };
}

test('WebGL absence returns null without scheduling a frame', () => {
    const env = setup({ unavailable: true });
    assert.equal(env.start(), null);
    assert.equal(env.callbacks.size, 0);
});

for (const failure of ['compile', 'link', 'buffer']) {
    test(`${failure} failure releases the context and returns null`, () => {
        const env = setup({ [failure]: false });
        assert.equal(env.start(), null);
        assert.equal(env.releases(), 1);
        assert.equal(env.callbacks.size, 0);
        assert.equal(env.listeners.size, 0);
    });
}

test('stop cancels rendering, removes resize listener and releases resources once', () => {
    const env = setup();
    const stop = env.start();
    env.tick(16);
    const staleCallback = env.callbacks.values().next().value;
    stop();
    stop();
    staleCallback(32);
    assert.equal(env.draws(), 1);
    assert.equal(env.callbacks.size, 0);
    assert.equal(env.listeners.size, 0);
    assert.equal(env.deleted.size, 4);
    assert.equal(env.releases(), 1);
});

test('pixel budget survives resizing and slow frames reduce resolution within a floor', () => {
    const env = setup();
    const stop = env.start();
    assert.ok(env.canvas.width * env.canvas.height <= 360000);
    const originalWidth = env.canvas.width;
    for (let i = 0; i < 32; i++) env.tick(500 + i * 32);
    assert.ok(env.canvas.width < originalWidth);
    assert.ok(env.canvas.width >= Math.floor(originalWidth * 0.55));
    const reducedWidth = env.canvas.width;
    for (let i = 0; i < 16; i++) env.tick(1600 + i * 16);
    assert.equal(env.canvas.width, reducedWidth);
    env.window.innerWidth = 7680;
    env.window.innerHeight = 4320;
    env.listeners.get('resize')();
    assert.ok(env.canvas.width * env.canvas.height <= 360000);
    env.window.innerWidth = 0;
    env.window.innerHeight = 0;
    env.listeners.get('resize')();
    assert.equal(env.canvas.width, 1);
    assert.equal(env.canvas.height, 1);
    stop();
});

test('context loss stops the animation before issuing another draw', () => {
    const env = setup();
    env.start();
    env.lose();
    env.tick(16);
    assert.equal(env.draws(), 0);
    assert.equal(env.callbacks.size, 0);
    assert.equal(env.listeners.size, 0);
    assert.equal(env.releases(), 1);
});

#!/usr/bin/env node
// Render a voice of the audio engine offline (an OfflineAudioContext in headless Chromium) to a WAV and
// measure it, so that a voice can be checked without listening: RMS and peak, the spectral centroid
// and the 85 % roll-off of the mean spectrum, the energy in four bands, an envelope (RMS per 0.25 s as
// a row of digits 0-9 scaled to the peak) and the number of onsets (rises of the envelope).
//
// usage: node tools/sound-render.mjs [--sec 10] [--out /tmp/szs] [--sr 32000] 'name=js' ['name2=js2' …]
// To hear a whole scene: set m.scene = (t) => m.place({...}) (called every 0.25 s with the engine's placeEvents).
// The js runs with `m` (a Music on the offline context, its place() made), `ctx`, `at` (set the listener:
// m.at = { x, z, yaw, hour, y }) and may be async; `m.cue` makes its events at once. e.g.
// A job `name=@file.js` reads its code from a file.
//   node tools/sound-render.mjs 'scull=m.scull(0.2, 1)' 'qin=m.qinPhrase(0.2, m.plc.out, 1)'
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { serve } from './serve.mjs';

process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); if (i < 0) return d; return args.splice(i, 2)[1]; };
const sec = +opt('sec', 10), outDir = opt('out', '/tmp/szs'), sr = +opt('sr', 32000);
const jobs = args.map((a) => { const i = a.indexOf('='); const code = a.slice(i + 1); return [a.slice(0, i), code.startsWith('@') ? readFileSync(code.slice(1), 'utf8') : code]; });
mkdirSync(outDir, { recursive: true });
const srv = await serve(0);
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) errors.push(m.text()); });
const map = { imports: { three: '/src/vendor/three/build/three.webgpu.js', 'three/webgpu': '/src/vendor/three/build/three.webgpu.js', 'three/tsl': '/src/vendor/three/build/three.tsl.js' } };
await page.route('**/__h', (r) => r.fulfill({ contentType: 'text/html', body: `<script type="importmap">${JSON.stringify(map)}</script>` }));
await page.goto(`http://127.0.0.1:${srv.address().port}/__h`);
let bad = 0;
for (const [name, code] of jobs) {
  const r = await page.evaluate(async ({ code, sec, sr }) => {
    const { Music } = await import('/src/engine/audio.js');
    const ctx = new OfflineAudioContext(2, Math.floor(sec * sr), sr);
    const m = new Music();
    m.ctx = ctx;
    m.makeup = ctx.createGain(); m.makeup.gain.value = 1; m.makeup.connect(ctx.destination);
    const muffle = ctx.createBiquadFilter(); muffle.type = 'lowpass'; muffle.frequency.value = 18000; muffle.connect(m.makeup);
    m.amb = { muffle }; m.wetIn = ctx.createGain(); m.erIn = ctx.createGain();
    m.place({ water: 0, town: 0, indoors: false });
    m.cue = (w, fn) => fn(w);
    // V(voice, distance m, r50 m, ...args): the listener at the origin facing north, the source `distance` east of it
    const V = (voice, d = 5, r50 = 8, ...a) => { m.plc.at = { x: 0, z: 0, yaw: 0, y: 0, hour: 12 }; const bus = m.src(typeof a[0] === 'function' ? a[0] : [d, 0], r50, { dur: 90 }); return m[voice](0.3, bus, 1, ...a); };
    const run = new Function('m', 'ctx', 'V', 'return (async () => {' + code + '})()');
    await run(m, ctx, V);
    // the engine's tick, every 0.25 s of rendered time: moving sources are re-aimed at the listener
    for (let k = 1; k * 0.25 < sec; k++) ctx.suspend(k * 0.25).then(() => { if (m.scene) { m.scene(ctx.currentTime); m.placeEvents(); } else m.aimAll(ctx.currentTime); ctx.resume(); });
    const buf = await ctx.startRendering();
    const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length;
    const mono = new Float32Array(n);
    for (let i = 0; i < n; i++) mono[i] = (L[i] + R[i]) / 2;
    let peak = 0, sum = 0;
    for (let i = 0; i < n; i++) { const v = Math.abs(mono[i]); if (v > peak) peak = v; sum += mono[i] * mono[i]; }
    const rms = Math.sqrt(sum / n);
    // mean magnitude spectrum, 2048-point FFT, Hann, hop 1024
    const N = 2048, re = new Float64Array(N), im = new Float64Array(N), mag = new Float64Array(N / 2);
    const fft = () => {
      for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
      for (let len = 2; len <= N; len <<= 1) {
        const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
        for (let i = 0; i < N; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const u = i + k, v = i + k + len / 2, tr = re[v] * cr - im[v] * ci, ti = re[v] * ci + im[v] * cr; re[v] = re[u] - tr; im[v] = im[u] - ti; re[u] += tr; im[u] += ti; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } }
      }
    };
    let frames = 0;
    for (let s = 0; s + N <= n; s += 1024) {
      let e = 0; for (let i = 0; i < N; i++) e += mono[s + i] * mono[s + i];
      if (e / N < 1e-9) continue;
      for (let i = 0; i < N; i++) { re[i] = mono[s + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1))); im[i] = 0; }
      fft();
      for (let k = 0; k < N / 2; k++) mag[k] += Math.hypot(re[k], im[k]) ** 2;
      frames++;
    }
    const hz = (k) => k * sr / N;
    let tot = 0, cen = 0; for (let k = 1; k < N / 2; k++) { tot += mag[k]; cen += mag[k] * hz(k); }
    let acc = 0, roll = 0; for (let k = 1; k < N / 2; k++) { acc += mag[k]; if (acc >= 0.85 * tot) { roll = hz(k); break; } }
    const band = (a, b) => { let s = 0; for (let k = 1; k < N / 2; k++) if (hz(k) >= a && hz(k) < b) s += mag[k]; return tot ? +(s / tot).toFixed(3) : 0; };
    let pk = 0, pkHz = 0; for (let k = 1; k < N / 2; k++) if (mag[k] > pk) { pk = mag[k]; pkHz = hz(k); }
    // envelope: RMS per 0.25 s
    const w = Math.floor(sr * 0.25), env = [];
    for (let s = 0; s < n; s += w) { let e = 0, c = 0; for (let i = s; i < Math.min(n, s + w); i++) { e += mono[i] * mono[i]; c++; } env.push(Math.sqrt(e / c)); }
    const em = Math.max(...env, 1e-9);
    const digits = env.map((v) => (v < em * 0.02 ? '.' : String(Math.min(9, Math.floor(v / em * 9.99))))).join('');
    let onsets = 0; for (let i = 1; i < env.length; i++) if (env[i] > em * 0.15 && env[i] > env[i - 1] * 2.2) onsets++;
    // pitch track: normalised autocorrelation of 64 ms frames every 80 ms (70-1400 Hz), the notes (nearest semitone) that hold
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'], W = 2048, lo = Math.floor(sr / 1400), hi = Math.floor(sr / 70), tr = [];
    for (let s0 = 0; s0 + W + hi < n; s0 += Math.floor(sr * 0.08)) {
      let e0 = 0; for (let i = 0; i < W; i++) e0 += mono[s0 + i] ** 2;
      if (e0 / W < peak * peak * 2e-4) { tr.push(null); continue; }
      let best = 0, bl = 0;
      for (let lag = lo; lag < hi; lag++) { let c = 0, e1 = 0; for (let i = 0; i < W; i++) { c += mono[s0 + i] * mono[s0 + i + lag]; e1 += mono[s0 + i + lag] ** 2; } const v = c / Math.sqrt(e0 * e1 + 1e-18); if (v > best) { best = v; bl = lag; } }
      tr.push(best > 0.8 ? 12 * Math.log2(sr / bl / 440) + 69 : null);
    }
    const notes = []; let rn = null;
    tr.forEach((m, i) => { const q = m === null ? null : Math.round(m); if (q !== null && rn && rn.q === q) rn.n++; else { if (rn && rn.n >= 2) notes.push(names[rn.q % 12] + Math.floor(rn.q / 12 - 1) + '@' + (rn.at * 0.08).toFixed(1)); rn = q === null ? null : { q, at: i, n: 1 }; } });
    if (rn && rn.n >= 2) notes.push(names[rn.q % 12] + Math.floor(rn.q / 12 - 1) + '@' + (rn.at * 0.08).toFixed(1));
    // stereo balance (−1 left … +1 right) by energy
    let el = 0, er = 0; for (let i = 0; i < n; i++) { el += L[i] * L[i]; er += R[i] * R[i]; }
    // 16-bit stereo WAV
    const wav = new Int16Array(n * 2);
    const gain = peak > 0 ? 0.9 / peak : 1;
    for (let i = 0; i < n; i++) { wav[2 * i] = Math.max(-1, Math.min(1, L[i] * gain)) * 32767; wav[2 * i + 1] = Math.max(-1, Math.min(1, R[i] * gain)) * 32767; }
    let bin = ''; const u8 = new Uint8Array(wav.buffer); for (let i = 0; i < u8.length; i += 8192) bin += String.fromCharCode(...u8.subarray(i, i + 8192));
    return { rms, peak, centroid: tot ? cen / tot : 0, roll, peakHz: pkHz, bands: [band(0, 300), band(300, 1000), band(1000, 3000), band(3000, 16000)], digits, onsets, bal: (er - el) / (er + el + 1e-12), notes: notes.join(' '), pcm: btoa(bin), nodes: 0 };
  }, { code, sec, sr }).catch((e) => ({ error: e.message }));
  if (r.error) { console.log(`${name}: ERROR ${r.error}`); bad++; continue; }
  const pcm = Buffer.from(r.pcm, 'base64'), hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVEfmt ', 8); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
  hdr.writeUInt32LE(sr, 24); hdr.writeUInt32LE(sr * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
  writeFileSync(`${outDir}/${name}.wav`, Buffer.concat([hdr, pcm]));
  console.log(`${name}: rms ${r.rms.toExponential(2)} peak ${r.peak.toExponential(2)} centroid ${Math.round(r.centroid)} Hz roll85 ${Math.round(r.roll)} Hz peak@${Math.round(r.peakHz)} bands[<300,<1k,<3k,>3k] ${r.bands.join('/')} onsets ${r.onsets} bal ${r.bal.toFixed(2)}`);
  console.log(`  env ${r.digits}`);
  if (r.notes) console.log(`  pitch ${r.notes}`);
  if (!(r.peak > 1e-5)) bad++;
}
for (const e of errors) console.log('  error: ' + e);
await browser.close(); srv.close();
process.exit(bad || errors.length ? 1 : 0);

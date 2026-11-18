#!/usr/bin/env node
// A picture of the country along one road (src/planet/roadside-build.js) without starting the whole viewer:
// the road's chunks near a point and a coarse ground, built here, lit by a sun and a hemisphere in
// headless Chromium (SwiftShader WebGPU).
// usage: node tools/roadside-shot.mjs --road 8 --m 330 [--off 0] [--h 1.7] [--look 80] [--pitch -0.05] [--yaw 0] [--reach 420]
//        [--autumn 0] [--winter 0] [--snow 0] [--detail 1] [--out shots/roadside.png] [--size 1280x720]
//   --look  metres ahead along the road to face; --yaw  degrees turned from that; --h  eye height above the ground
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { serve, ROOT } from './serve.mjs';
import { setLand } from '../src/planet/land.js';
import { initRelief, ROADS, surface, coverAt, PLANET_RADIUS as R } from '../src/planet/relief.js';
import { enuFrame, toLocal, dirToLocal, norm, dot, cross } from '../src/planet/geo.js';
import { roadU, chunkList, buildChunk, SEG } from '../src/planet/roadside-build.js';
import { rgb } from '../src/planet/roadside-kit.js';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const buf = readFileSync(join(ROOT, 'data/planet/land.bin'));
const W = buf.readUInt32LE(8), H = buf.readUInt32LE(12), W2 = buf.readUInt32LE(16), H2 = buf.readUInt32LE(20), sc = buf.readFloatLE(24);
const b = gunzipSync(buf.subarray(32));
setLand({ W, H, W2, H2, scale: sc, sdf: b.subarray(0, W * H), climate: b.subarray(W * H) });
initRelief();
const ri = +opt('road', 8), m = +opt('m', 300), off = +opt('off', 0), eye = +opt('h', 1.7), reach = +opt('reach', 420), detail = +opt('detail', 1);
const [W0, H0] = opt('size', '1280x720').split('x').map(Number);
const rd = ROADS[ri], u0 = roadU(rd, m, off);
const hg = surface(u0).h, F = enuFrame(u0, R + hg);          // local frame at the camera's ground point (y up)
const to = (P) => toLocal(F, P);
// the road's chunks within reach
const parts = { position: [], normal: [], color: [], alt: [], ses: [], idx: [] };
let nv = 0, tris = 0;
for (const c of chunkList()) {
  if (c.ri !== ri || Math.acos(Math.min(1, dot(c.c, u0))) * R > reach + SEG) continue;
  const d = buildChunk(c.ri, c.k, detail);
  if (!d) continue;
  for (let i = 0; i < d.pos.length; i += 3) {
    const p = to([d.pos[i], d.pos[i + 1], d.pos[i + 2]]), n = dirToLocal(F, [d.nrm[i], d.nrm[i + 1], d.nrm[i + 2]]);
    parts.position.push(...p); parts.normal.push(...n);
    parts.color.push(d.col[i], d.col[i + 1], d.col[i + 2]); parts.alt.push(d.alt[i], d.alt[i + 1], d.alt[i + 2]); parts.ses.push(d.ses[i], d.ses[i + 1], d.ses[i + 2]);
  }
  for (const k of d.idx) parts.idx.push(k + nv);
  nv += d.pos.length / 3; tris += d.tris;
}
// a coarse ground (6 m cells) with the open country's colours
const G = { position: [], normal: [], color: [], idx: [] }, step = 6, N = Math.ceil(reach / step), grid = [];
const col = { grass: rgb('#6e8f3c'), soil: rgb('#7a6547'), sand: rgb('#cdb98a'), rock: rgb('#85807a'), road: rgb('#8d7e60'), fields: rgb('#8f9a4e'), forest: rgb('#3a5428'), snow: rgb('#ffffff') };
for (let i = -N; i <= N; i++) { const row = []; for (let j = -N; j <= N; j++) {
  const x = i * step, z = j * step, P = [F.o[0] + F.x[0] * x + F.z[0] * z, F.o[1] + F.x[1] * x + F.z[1] * z, F.o[2] + F.x[2] * x + F.z[2] * z], u = norm(P), g = surface(u);
  const l = Math.hypot(...P), rr = R + g.h, q = to([u[0] * rr, u[1] * rr, u[2] * rr]);
  let c = [0, 0, 0, 0]; const cv = coverAt(g, 1, u), w = { grass: cv.grass, soil: cv.soil, sand: cv.sand, rock: cv.rock, road: cv.road * 3, fields: cv.fields, forest: cv.forest * 0.5, snow: cv.snow }, wt = Object.values(w).reduce((a, v) => a + v, 0) || 1;
  const cc = [0, 0, 0]; for (const k in w) for (let t = 0; t < 3; t++) cc[t] += col[k][t] * w[k] / wt;
  if (g.h < -0.3) { cc[0] = 0.02; cc[1] = 0.08; cc[2] = 0.14; }
  row.push([q, cc]); void l; void c;
} grid.push(row); }
let gi = 0;
for (const row of grid) for (const [q, cc] of row) { G.position.push(...q); G.color.push(...cc); G.normal.push(0, 1, 0); gi++; }
const S = 2 * N + 1;
for (let i = 0; i < S - 1; i++) for (let j = 0; j < S - 1; j++) { const a = i * S + j; G.idx.push(a, a + 1, a + S, a + 1, a + S + 1, a + S); }
// smooth normals
const nrm = new Float32Array(G.position.length);
for (let t = 0; t < G.idx.length; t += 3) {
  const [a, b2, c2] = [G.idx[t], G.idx[t + 1], G.idx[t + 2]], p = (k) => G.position.slice(k * 3, k * 3 + 3), A = p(a), B = p(b2), C = p(c2);
  const n = cross([B[0] - A[0], B[1] - A[1], B[2] - A[2]], [C[0] - A[0], C[1] - A[1], C[2] - A[2]]);
  for (const k of [a, b2, c2]) { nrm[k * 3] += n[0]; nrm[k * 3 + 1] += n[1]; nrm[k * 3 + 2] += n[2]; }
}
for (let k = 0; k < nrm.length; k += 3) { const l = Math.hypot(nrm[k], nrm[k + 1], nrm[k + 2]) || 1; const s = nrm[k + 1] < 0 ? -1 : 1; G.normal[k] = s * nrm[k] / l; G.normal[k + 1] = s * nrm[k + 1] / l; G.normal[k + 2] = s * nrm[k + 2] / l; }
// the camera: at the ground point, looking `look` m ahead along the road
const ahead = to(roadU(rd, m + +opt('look', 80), off).map((v, i) => v * (R + surface(roadU(rd, m + +opt('look', 80), off)).h)));
const yaw = +opt('yaw', 0) * Math.PI / 180, dx = ahead[0], dz = ahead[2], c = Math.cos(yaw), s = Math.sin(yaw);
const fx = dx * c - dz * s, fz = dx * s + dz * c, fl = Math.hypot(fx, fz) || 1, pitch = +opt('pitch', -0.05);
const cam = [0, eye, 0], look = [fx / fl * 50, eye + Math.tan(pitch) * 50, fz / fl * 50];
// the sun, from a morning direction in the local frame
const fw = [fx / fl, fz / fl], sunDir = [-fw[0] * 0.45 + fw[1] * 0.35, 0.65, -fw[1] * 0.45 - fw[0] * 0.35].map((v) => v * 400);
// write
const arrays = []; const L = {};
const put = (name, P, hasAll = true) => { const o = { }; for (const k of Object.keys(P)) { if (k === 'idx') { o.idx = P.idx.length; arrays.push(new Uint32Array(P.idx)); } else { o[k] = P[k].length; arrays.push(new Float32Array(P[k])); } } L[name] = o; };
put('ground', G); put('things', parts);
const total = arrays.reduce((a, x) => a + x.byteLength, 0), out = new Uint8Array(total); let o = 0;
for (const a of arrays) { out.set(new Uint8Array(a.buffer, a.byteOffset, a.byteLength), o); o += a.byteLength; }
writeFileSync(join(ROOT, 'shots/rs-data.bin'), out);
writeFileSync(join(ROOT, 'shots/rs-data.json'), JSON.stringify({ ...L, w: W0, h: H0, cam, look, sun: sunDir, autumn: +opt('autumn', 0), winter: +opt('winter', 0), snow: +opt('snow', 0) }));
console.log(`built ${nv} vertices, ${tris} triangles of road ${ri} within ${reach} m`);
const srv = await serve(0), port = srv.address().port;
const browser = await chromium.launch({ args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--use-webgpu-adapter=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W0, height: H0 } });
page.on('console', (mm) => { if (['error', 'warning', 'log'].includes(mm.type())) console.log(mm.type(), mm.text().slice(0, 300)); });
page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 400)));
await page.route('**/*', async (route) => { const url = route.request().url(); if (/fonts\.(googleapis|gstatic)/.test(url)) return route.abort(); return route.continue(); });
await page.goto(`http://127.0.0.1:${port}/tools/roadside-shot.html${args.includes('--dbg') ? '?dbg=1' : ''}`);
await page.waitForFunction('window.DONE === true', null, { timeout: 540000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: join(ROOT, opt('out', 'shots/roadside.png')) });
await browser.close(); srv.close();
console.log('wrote', opt('out', 'shots/roadside.png'));

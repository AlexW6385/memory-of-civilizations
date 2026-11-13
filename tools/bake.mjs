#!/usr/bin/env node
// Offline light bake: irradiance volumes (L1 spherical harmonics on regular grids) for each
// settlement's landmark, from the same geometry the viewer shows (tools/lib/gi-scene.mjs): sun
// (with shadows, at the settlement's chosen hour), sky, oil lamps and bounced light (two passes),
// in boxes round its indoor rooms. Output: data/gi/<plan id>.gi (format in src/engine/gi.js) and
// its entry in data/gi/index.json (the geometry hash it was baked from, size, probes, time).
//
// usage: node tools/bake.mjs <settlement or plan id ...> [--spacing 1.0] [--rays 128] [--threads N]
//        node tools/bake.mjs --status [ids...]   every landmark: current, stale, unbaked or none
//        node tools/bake.mjs --stale             re-bake every stale bake
//        node tools/bake.mjs --dry <ids...>      the boxes and probe counts only, nothing traced

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BufferGeometry, Float32BufferAttribute, Ray, Vector3, DoubleSide, DataUtils } from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import { sunDirection, skyRadiance as skyRadianceOf } from '../src/world/regions.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MAGIC = 0x4947504D;

// ── worker: trace probes for a range of z slices of one grid ─────────────────

function workerMain() {
  const { pos, alb, tr, lights, rays, climate } = workerData;
  const SUN_DIR = sunDirection(climate), SUN_COLOR = climate.sun.color, SUN_INTENSITY = climate.sun.intensity;
  const skyRadiance = (d) => skyRadianceOf(climate, d);
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(new Float32Array(pos), 3));
  const bvh = new MeshBVH(geo, { targetLeafSize: 8 });
  // the BVH reorders the triangles of the index it makes, and a hit's faceIndex counts in that order:
  // the albedo and transmission are put in the same order (triangle f is the original index[3f] / 3)
  const A0 = new Float32Array(alb), T0 = new Float32Array(tr), A = new Float32Array(A0.length), TR = new Float32Array(T0.length);
  const order = geo.index.array;
  for (let f = 0; f < A.length / 3; f++) { const o = order[3 * f] / 3; for (let k = 0; k < 3; k++) { A[3 * f + k] = A0[3 * o + k]; TR[3 * f + k] = T0[3 * o + k]; } }
  // paper's straight leak over its diffuse transmission (tools/lib/gi-scene.mjs PAPER: 0.04 / 0.55)
  const LEAK_OF_T = 0.04 / 0.55;
  const ray = new Ray(new Vector3(), new Vector3());
  const sray = new Ray(new Vector3(), new Vector3());
  const sun = new Vector3(...SUN_DIR);
  const sunE = SUN_COLOR.map((c) => c * SUN_INTENSITY);
  const ga = [0.4, 0.33, 0.24];
  const sky0 = skyRadiance([0, 1, 0]);
  const groundL = [0, 1, 2].map((k) => ga[k] * (sunE[k] * SUN_DIR[1] + Math.PI * sky0[k]) / Math.PI);
  // fibonacci directions
  const dirs = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < rays; i++) {
    const y = 1 - (2 * (i + 0.5)) / rays, r = Math.sqrt(1 - y * y), th = golden * i;
    dirs.push([Math.cos(th) * r, y, Math.sin(th) * r]);
  }
  const occluded = (o, d, far) => {
    sray.origin.set(o[0], o[1], o[2]); sray.direction.set(d[0], d[1], d[2]);
    return bvh.raycastFirst(sray, DoubleSide, 0, far) !== null;
  };
  /** Light let through along a ray (1 clear, 0 blocked, a colour through stained glass). */
  const transmitted = (o, d, far) => {
    const T = [1, 1, 1];
    let ox = o[0], oy = o[1], oz = o[2], left = far;
    for (let k = 0; k < 6; k++) {
      sray.origin.set(ox, oy, oz); sray.direction.set(d[0], d[1], d[2]);
      const h = bvh.raycastFirst(sray, DoubleSide, 0, left);
      if (!h) return T;
      const f = h.faceIndex;
      if (TR[f * 3] < 0) return null;
      // paper: only its straight leak (the rest it scatters, lighting itself: see firstHit's shading)
      for (let c = 0; c < 3; c++) T[c] *= TR[f * 3 + c] >= 2 ? (TR[f * 3 + c] - 2) * LEAK_OF_T : TR[f * 3 + c];
      ox = h.point.x + d[0] * 0.01; oy = h.point.y + d[1] * 0.01; oz = h.point.z + d[2] * 0.01; left -= h.distance + 0.01;
    }
    return null;
  };
  /** First opaque hit (or paper, which stops a ray) along a ray, and the colour of the glass passed on the way. */
  const firstHit = (o, d, far, T) => {
    let ox = o[0], oy = o[1], oz = o[2], left = far;
    for (let k = 0; k < 6; k++) {
      ray.origin.set(ox, oy, oz); ray.direction.set(d[0], d[1], d[2]);
      const h = bvh.raycastFirst(ray, DoubleSide, 0, left);
      if (!h) return null;
      const f = h.faceIndex;
      if (TR[f * 3] < 0 || TR[f * 3] >= 2) return h;
      for (let c = 0; c < 3; c++) T[c] *= TR[f * 3 + c];
      ox = h.point.x + d[0] * 0.01; oy = h.point.y + d[1] * 0.01; oz = h.point.z + d[2] * 0.01; left -= h.distance + 0.01;
    }
    return null;
  };
  // one job: a range of z slices of one grid, in one pass (the BVH is built once per worker)
  parentPort.on('message', ({ G, zs, prev }) => {
  const prevV = prev ? new Float32Array(prev) : null;
  const [nx, ny, nz] = G.n, s = G.spacing;
  // trilinear SH sample of the previous pass at p with normal n → irradiance rgb
  const sampleE = (p, nrm, out) => {
    const fx = (p[0] - G.min[0]) / s, fy = (p[1] - G.min[1]) / s, fz = (p[2] - G.min[2]) / s;
    if (fx < 0 || fz < 0 || fx > nx - 1 || fz > nz - 1 || fy > ny - 1) { out[0] = out[1] = out[2] = -1; return; }
    const x0 = Math.min(nx - 2, Math.floor(fx)), y0 = Math.max(0, Math.min(ny - 2, Math.floor(fy))), z0 = Math.min(nz - 2, Math.floor(fz));
    const tx = fx - x0, ty = Math.max(0, Math.min(1, fy - y0)), tz = fz - z0;
    out[0] = out[1] = out[2] = 0;
    for (let c = 0; c < 8; c++) {
      const dx = c & 1, dy = (c >> 1) & 1, dz = (c >> 2) & 1;
      const w = (dx ? tx : 1 - tx) * (dy ? ty : 1 - ty) * (dz ? tz : 1 - tz);
      const i = ((z0 + dz) * ny * nx + (y0 + dy) * nx + (x0 + dx)) * 12;
      for (let k = 0; k < 3; k++) {
        const e = prevV[i + k] * 0.282095 + 0.488603 * (prevV[i + 3 + k] * nrm[1] + prevV[i + 6 + k] * nrm[2] + prevV[i + 9 + k] * nrm[0]);
        out[k] += w * Math.max(0, e);
      }
    }
  };
  /** Irradiance at p (just off a surface) for the normal nn: the sun (through what lets it
   *  through), the lamps, and the bounce — the previous pass's probes, or a dim open sky in the first. */
  const irradiance = (p, nn) => {
    const E = [0, 0, 0];
    const ndl = nn[0] * sun.x + nn[1] * sun.y + nn[2] * sun.z;
    if (ndl > 0) { const Ts = transmitted(p, SUN_DIR, 800); if (Ts) for (let k = 0; k < 3; k++) E[k] += sunE[k] * ndl * Ts[k]; }
    for (const l of lights) {
      const lx = l.at[0] - p[0], ly = l.at[1] - p[1], lz = l.at[2] - p[2];
      const dd = Math.hypot(lx, ly, lz);
      if (dd > l.distance) continue;
      const ln = (nn[0] * lx + nn[1] * ly + nn[2] * lz) / dd;
      if (ln <= 0) continue;
      if (occluded(p, [lx / dd, ly / dd, lz / dd], dd - 0.15)) continue;
      const att = Math.pow(Math.max(0, 1 - Math.pow(dd / l.distance, 4)), 2) / Math.max(dd * dd, 0.09);
      const col = hex(l.color);
      for (let k = 0; k < 3; k++) E[k] += col[k] * l.intensity * ln * att;
    }
    if (prevV) {
      sampleE([p[0] + nn[0] * 0.45, p[1] + nn[1] * 0.45, p[2] + nn[2] * 0.45], nn, tmp);
      if (tmp[0] >= 0) for (let k = 0; k < 3; k++) E[k] += tmp[k];
      else for (let k = 0; k < 3; k++) E[k] += Math.PI * sky0[k] * Math.max(0, nn[1] * 0.5 + 0.5);
    } else {
      // first pass: approximate the bounce with a dim open-sky term (refined in pass two)
      for (let k = 0; k < 3; k++) E[k] += Math.PI * sky0[k] * 0.15;
    }
    return E;
  };
  const out = new Float32Array((zs[1] - zs[0]) * ny * nx * 12);
  const valid = new Uint8Array((zs[1] - zs[0]) * ny * nx);
  const tmp = [0, 0, 0];
  let rng = 12345 + zs[0] * 7919;
  const rand = () => ((rng = (rng * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let z = zs[0]; z < zs[1]; z++) {
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const o = [G.min[0] + x * s, G.min[1] + y * s, G.min[2] + z * s];
        const sh = new Float64Array(12);
        let back = 0;
        // random rotation about y plus a small tilt to decorrelate neighbouring probes
        const a = rand() * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        for (let r = 0; r < rays; r++) {
          const d0 = dirs[r];
          const d = [ca * d0[0] - sa * d0[2], d0[1], sa * d0[0] + ca * d0[2]];
          const Tg = [1, 1, 1];
          const hit = firstHit(o, d, 500, Tg);
          let L = [0, 0, 0];
          if (!hit) {
            L = d[1] >= 0 ? skyRadiance(d) : groundL;
          } else {
            const n = hit.face.normal;
            const tri = hit.faceIndex, paper = TR[tri * 3] >= 2;
            let facing = n.x * d[0] + n.y * d[1] + n.z * d[2];
            // (paper panels are wound both ways: the face toward the ray is the one seen)
            if (paper && facing > 0) { n.negate(); facing = -facing; }
            if (facing > 0) { back++; continue; }
            const al = [A[tri * 3], A[tri * 3 + 1], A[tri * 3 + 2]];
            const p = [hit.point.x + n.x * 0.02, hit.point.y + n.y * 0.02, hit.point.z + n.z * 0.02];
            const nn = [n.x, n.y, n.z];
            const E = irradiance(p, nn);
            if (paper) {
              // the paper lit from the far side of its panel (past the panel's thickness) and
              // scattering that light out on this side: T · E_far / π
              const q = [hit.point.x - n.x * 0.16, hit.point.y - n.y * 0.16, hit.point.z - n.z * 0.16], Eb = irradiance(q, [-n.x, -n.y, -n.z]);
              for (let k = 0; k < 3; k++) L[k] = (TR[tri * 3 + k] - 2) * Eb[k] / Math.PI;
            }
            for (let k = 0; k < 3; k++) L[k] += (al[k] / Math.PI) * E[k];
          }
          for (let k = 0; k < 3; k++) L[k] *= Tg[k];
          for (let k = 0; k < 3; k++) {
            sh[k] += L[k] * 0.282095;
            sh[3 + k] += L[k] * 0.488603 * d[1];
            sh[6 + k] += L[k] * 0.488603 * d[2];
            sh[9 + k] += L[k] * 0.488603 * d[0];
          }
        }
        const li = ((z - zs[0]) * ny * nx + y * nx + x);
        const w = (4 * Math.PI) / rays;
        for (let k = 0; k < 3; k++) {
          out[li * 12 + k] = sh[k] * w * Math.PI;
          out[li * 12 + 3 + k] = sh[3 + k] * w * (2 * Math.PI / 3);
          out[li * 12 + 6 + k] = sh[6 + k] * w * (2 * Math.PI / 3);
          out[li * 12 + 9 + k] = sh[9 + k] * w * (2 * Math.PI / 3);
        }
        valid[li] = back / rays < 0.15 ? 1 : 0;
      }
    }
    parentPort.postMessage({ progress: 1 });
  }
  parentPort.postMessage({ done: true, out: out.buffer, valid: valid.buffer }, [out.buffer, valid.buffer]);
  });
}


const hexCache = new Map();
function hex(c) {
  if (hexCache.has(c)) return hexCache.get(c);
  const h = parseInt(c.slice(1), 16);
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const r = [lin((h >> 16) & 255), lin((h >> 8) & 255), lin(h & 255)];
  hexCache.set(c, r);
  return r;
}

// ── main ─────────────────────────────────────────────────────────────────────

const share = (a) => { const s = new Float32Array(new SharedArrayBuffer(a.byteLength)); s.set(a); return s.buffer; };

/** Workers that each hold the scene's BVH and trace jobs (z ranges of a grid) sent to them. */
function pool(S, rays, threads) {
  const workers = Array.from({ length: threads }, () => new Worker(fileURLToPath(import.meta.url), {
    workerData: { pos: S.shared.pos, alb: S.shared.alb, tr: S.shared.tr, lights: S.lights, rays, climate: S.climate },
  }));
  return { workers, close: () => Promise.all(workers.map((w) => w.terminate())) };
}

async function runPass(P, G, prev, pass, label) {
  const [nx, ny, nz] = G.n;
  const vol = new Float32Array(nx * ny * nz * 12);
  const valid = new Uint8Array(nx * ny * nz);
  const chunks = [];
  const per = Math.max(1, Math.ceil(nz / (P.workers.length * 4)));
  for (let z = 0; z < nz; z += per) chunks.push([z, Math.min(nz, z + per)]);
  let doneSlices = 0;
  const t0 = Date.now();
  const prevS = prev ? share(new Float32Array(prev)) : null;
  const runChunk = (w, zs) => new Promise((ok, fail) => {
    const onMsg = (m) => {
      if (m.progress) {
        doneSlices++;
        if (process.stdout.isTTY && (doneSlices % 4 === 0 || doneSlices === nz)) {
          const el = (Date.now() - t0) / 1000;
          process.stdout.write(`\r  ${label} pass ${pass}: ${doneSlices}/${nz} slices, ${el.toFixed(0)}s, eta ${(el / doneSlices * (nz - doneSlices)).toFixed(0)}s   `);
        }
      }
      if (m.done) {
        vol.set(new Float32Array(m.out), zs[0] * ny * nx * 12);
        valid.set(new Uint8Array(m.valid), zs[0] * ny * nx);
        w.off('message', onMsg); w.off('error', fail);
        ok();
      }
    };
    w.on('message', onMsg); w.on('error', fail);
    w.postMessage({ G, zs, prev: prevS, pass });
  });
  const queue = chunks.slice();
  await Promise.all(P.workers.map(async (w) => { while (queue.length) await runChunk(w, queue.shift()); }));
  if (process.stdout.isTTY) process.stdout.write('\n');
  console.log(`  ${label} pass ${pass}: ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  fill(vol, valid, G.n);
  smooth(vol, G.n);
  return vol;
}

/** Replace probes inside solid geometry with the average of valid neighbours (repeated dilation). */
function fill(vol, valid, [nx, ny, nz]) {
  let missing = 0;
  for (let i = 0; i < valid.length; i++) missing += valid[i] ? 0 : 1;
  for (let iter = 0; iter < 64 && missing > 0; iter++) {
    const add = [];
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const i = z * ny * nx + y * nx + x;
      if (valid[i]) continue;
      const acc = new Float64Array(12);
      let c = 0;
      for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
        const X = x + dx, Y = y + dy, Z = z + dz;
        if (X < 0 || Y < 0 || Z < 0 || X >= nx || Y >= ny || Z >= nz) continue;
        const j = Z * ny * nx + Y * nx + X;
        if (!valid[j]) continue;
        for (let k = 0; k < 12; k++) acc[k] += vol[j * 12 + k];
        c++;
      }
      if (c) add.push([i, acc.map((v) => v / c)]);
    }
    for (const [i, v] of add) { vol.set(v, i * 12); valid[i] = 1; missing--; }
    if (!add.length) break;
  }
}

/** One pass of a [1 2 1] filter along each axis to remove sampling noise. */
function smooth(vol, [nx, ny, nz]) {
  const idx = (x, y, z) => (z * ny * nx + y * nx + x) * 12;
  for (const [ax, n] of [[0, nx], [1, ny], [2, nz]]) {
    const src = vol.slice();
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const p = [x, y, z];
      const a = p.slice(), b = p.slice();
      a[ax] = Math.max(0, p[ax] - 1); b[ax] = Math.min(n - 1, p[ax] + 1);
      const i = idx(...p), ia = idx(...a), ib = idx(...b);
      for (let k = 0; k < 12; k++) vol[i + k] = 0.5 * src[i + k] + 0.25 * (src[ia + k] + src[ib + k]);
    }
  }
}

/** One grid as a version-3 volume: a 36-byte header, then the 12 SH planes as half floats,
 * delta-coded along the grid, byte-shuffled and gzipped (GitHub Pages does not compress binary files). */
function encode(G, vol) {
  const [nx, ny, nz] = G.n, N = nx * ny * nz;
  const header = new ArrayBuffer(36);
  new Uint32Array(header, 0, 5).set([MAGIC, 3, nx, ny, nz]);
  new Float32Array(header, 20, 4).set([G.min[0], G.min[1], G.min[2], G.spacing]);
  const planes = new Uint16Array(N * 12);
  for (let c = 0; c < 12; c++) {
    let prev = 0;
    for (let i = 0; i < N; i++) {
      const f = vol[i * 12 + c], h = DataUtils.toHalfFloat(Number.isFinite(f) ? Math.max(-60000, Math.min(60000, f)) : 0);   // (a probe inside a wall or a degenerate ray: no light, never NaN or infinity)
      planes[c * N + i] = (h - prev) & 0xffff;
      prev = h;
    }
  }
  const bytes = new Uint8Array(planes.buffer), M = planes.length;
  const shuffled = Buffer.alloc(bytes.length);
  for (let i = 0; i < M; i++) { shuffled[i] = bytes[2 * i]; shuffled[M + i] = bytes[2 * i + 1]; }
  return Buffer.concat([Buffer.from(header), gzipSync(shuffled, { level: 9 })]);
}

/**
 * Write data/gi/<id>.gi: one volume as version 3; several (one per box of rooms) as version 4 —
 * u32 magic, u32 4, u32 count, then per volume a u32 byte length and its version-3 bytes.
 */
export async function write(id, grids, vols) {
  const parts = grids.map((G, i) => encode(G, vols[i]));
  let buf;
  if (parts.length === 1) buf = parts[0];
  else {
    const head = Buffer.alloc(12);
    head.writeUInt32LE(MAGIC, 0); head.writeUInt32LE(4, 4); head.writeUInt32LE(parts.length, 8);
    buf = Buffer.concat([head, ...parts.flatMap((p) => { const l = Buffer.alloc(4); l.writeUInt32LE(p.length); return [l, p]; })]);
  }
  await mkdir(join(ROOT, 'data/gi'), { recursive: true });
  const file = join(ROOT, 'data/gi', `${id}.gi`);
  await writeFile(file, buf);
  return { file, bytes: buf.length };
}

async function bakeOne(site, plan, { rays, threads, spacing }) {
  const { bakeScene, readIndex, INDEX } = await import('./lib/gi-scene.mjs');
  const t0 = Date.now();
  if (spacing) plan = { ...plan, bakeSpacing: spacing };
  const S = bakeScene(site, plan, { rays });
  if (!S.grids) { console.log(`${plan.id} (${site}): no indoor room to bake`); return null; }
  const probes = S.grids.reduce((a, g) => a + g.n[0] * g.n[1] * g.n[2], 0);
  console.log(`${plan.id} (${site}): ${S.landmarkTris} triangles + ground, ${S.lights.length} lamps, ${S.grids.length} box(es) at ${S.grids[0].spacing} m, ${probes} probes, ${rays} rays, ${threads} threads`);
  S.shared = { pos: share(S.pos), alb: share(S.alb), tr: share(S.tr) };
  S.pos = S.alb = S.tr = null;
  const vols = [], P = pool(S, rays, threads);
  try {
    for (const [i, G] of S.grids.entries()) {
      const label = `[${i + 1}/${S.grids.length} ${G.n.join('x')}]`;
      const v1 = await runPass(P, G, null, 1, label);
      vols.push(await runPass(P, G, v1.buffer, 2, label));
    }
  } finally { await P.close(); }
  const { file, bytes } = await write(plan.id, S.grids, vols);
  const seconds = Math.round((Date.now() - t0) / 1000);
  const index = readIndex();
  index[plan.id] = { site, hash: S.hash, rays, probes, boxes: S.grids.map((g) => ({ min: g.min.map((v) => +v.toFixed(2)), n: g.n, spacing: g.spacing, rooms: g.rooms })), bytes, seconds, baked: new Date().toISOString().slice(0, 10) };
  const sorted = Object.fromEntries(Object.keys(index).sort().map((k) => [k, index[k]]));
  writeFileSync(INDEX, JSON.stringify(sorted, null, 1) + '\n');
  console.log(`  wrote ${file} (${(bytes / 1e6).toFixed(2)} MB) in ${seconds}s`);
  return { bytes, seconds, probes };
}

if (isMainThread) {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
  const valued = new Set(['--spacing', '--rays', '--threads']);
  const ids = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && valued.has(args[i - 1])));
  const rays = +opt('rays', 128), spacing = args.includes('--spacing') ? +opt('spacing', 1) : null;
  const threads = +opt('threads', Math.max(1, availableParallelism()));
  const gi = await import('./lib/gi-scene.mjs');
  if (args.includes('--status') || args.includes('--stale')) {
    const st = await gi.status({ ids: ids.length ? ids : null, onlyBaked: args.includes('--stale') });
    const files = (await readdir(join(ROOT, 'data/gi'))).filter((f) => f.endsWith('.gi')).map((f) => f.slice(0, -3));
    for (const f of files) if (!st.some((s) => s.id === f) && !ids.length) st.push({ id: f, site: '?', state: 'orphan' });
    if (args.includes('--status')) {
      for (const s of st) if (s.state !== 'none') console.log(`${s.state.padEnd(8)} ${s.site.padEnd(18)} ${s.id.padEnd(34)} ${s.probes ? `${s.boxes} box(es), ${s.probes} probes at ${s.spacing} m` : ''}`);
      const c = {}; for (const s of st) c[s.state] = (c[s.state] || 0) + 1;
      console.log(Object.entries(c).map(([k, v]) => `${v} ${k}`).join(', '));
    } else {
      const stale = st.filter((s) => s.state === 'stale');
      console.log(stale.length ? `stale: ${stale.map((s) => s.id).join(', ')}` : 'no stale bakes');
      for (const s of stale) { const [{ plan }] = await gi.resolve([s.id]); await bakeOne(s.site, plan, { rays, threads, spacing }); }
    }
  } else if (args.includes('--dry')) {
    for (const { site, plan } of await gi.resolve(ids)) {
      const S = gi.bakeScene(site, plan, { rays });
      if (!S.grids) { console.log(`${plan.id}: no indoor room`); continue; }
      const probes = S.grids.reduce((a, g) => a + g.n[0] * g.n[1] * g.n[2], 0);
      console.log(`${plan.id} (${site}): ${S.landmarkTris} tris, ${S.grids.length} box(es) at ${S.grids[0].spacing} m, ${probes} probes, hash ${S.hash}`);
      for (const g of S.grids) console.log(`   ${g.n.join('x')} at ${g.min.map((v) => v.toFixed(1)).join(',')}: ${g.rooms.join('; ')}`);
    }
  } else {
    if (!ids.length) { console.log('name the settlements or plans to bake (or --status, --stale)'); process.exit(1); }
    const found = await gi.resolve(ids);
    for (const { site, plan } of found) if (!plan.feature) await bakeOne(site, plan, { rays, threads, spacing });
  }
} else {
  workerMain();
}

// Geometry that hangs in the air or leaves a room open to the sky, for one or more settlements:
//   node tools/float-check.mjs <id>... [--min 4] [--json out.json]
// Every plan is built as the viewer builds it and its triangles are marked in a grid of 0.5 m cells. Cells
// within reach of the ground or the water are grounded, and so is everything joined to them (a gap of one
// cell is still joined: a lantern on its cord, a sign on its bracket). What is left hangs in the air: each
// such cluster is listed with its place, size, height over the ground, and the plans and materials in it.
// Then every room of every plan: the share of its floor with nothing over it (a hall without its roof).
// Then walls of air: places where the walker is stopped (by an obstacle, or by the shell under a top) with
// nothing drawn at the height of the body within 0.75 m, next to a place where it can stand: a doorway that
// looks open and is not.
// A report to read, not a test: birds' perches, kites and smoke are meant to hang; most else is not.
import { buildPlan } from '../src/core/build.js';
import { MODULES, GROUNDS } from '../src/settlements/grounds.js';
import { SITES } from '../src/planet/sites.js';
import { writeFile } from 'node:fs/promises';
import { topField } from '../src/core/collide.js';
import { SiteWorld } from './lib/site.mjs';
import { RADIUS, STEP, HEAD, LOW } from '../src/core/walk.js';

const args = process.argv.slice(2), ids = [], opt = {};
for (let i = 0; i < args.length; i++) { if (args[i].startsWith('--')) opt[args[i].slice(2)] = args[++i]; else ids.push(args[i]); }
const MIN = +(opt.min ?? 4);          // cells: smaller clusters are not listed
const C = 0.5, OX = 2048, OY = 256, NX = 4096, NY = 1024;
const key = (i, j, k) => ((i + OX) * NY + (j + OY)) * NX + (k + OX);
const out = {};

for (const id of ids) {
  const G = GROUNDS[id], radius = SITES.find((s) => s.id === id)?.radius ?? 400;
  const mod = await MODULES[id]();
  const plans = [...(mod.landmarks || []).map((l) => l.plan), ...(mod.town ? await mod.town() : [])];
  const cw = new SiteWorld();
  cw.terrain = (x, z) => G.height(x, z); cw.water = (x, z, y) => G.water(x, z, y); cw.waterLevel = (x, z) => G.waterLevel(x, z);
  const cells = new Map();            // cell → index of the plan/material that first marked it
  const tags = [];                    // [planId, mat]

  const mark = (x, y, z, tag) => { const k = key(Math.floor(x / C), Math.floor(y / C), Math.floor(z / C)); if (!cells.has(k)) cells.set(k, tag); };
  for (const plan of plans) {
    let built;
    try { built = buildPlan(plan, { detail: true }); } catch (e) { console.log(`${id}: ${plan.id} does not build: ${e.message}`); continue; }
    if (!plan.nocollide) {
      for (const o of built.colliders.obstacles) o.plan = plan.id;
      built.colliders.tops = await topField(built.parts);
      if (built.colliders.tops) built.colliders.tops.plan = plan.id;
      cw.add(built.colliders);
    }
    for (const { mat, geometry } of built.parts) {
      const tag = tags.push([plan.id, mat]) - 1;
      const P = geometry.attributes.position.array, I = geometry.index?.array;
      const n = I ? I.length : P.length / 3;
      for (let t = 0; t < n; t += 3) {
        const a = (I ? I[t] : t) * 3, b = (I ? I[t + 1] : t + 1) * 3, c = (I ? I[t + 2] : t + 2) * 3;
        const ax = P[a], ay = P[a + 1], az = P[a + 2], bx = P[b], by = P[b + 1], bz = P[b + 2], cx = P[c], cy = P[c + 1], cz = P[c + 2];
        if (!Number.isFinite(ax + ay + az + bx + by + bz + cx + cy + cz)) continue;
        const L = Math.max(Math.hypot(bx - ax, by - ay, bz - az), Math.hypot(cx - ax, cy - ay, cz - az), Math.hypot(cx - bx, cy - by, cz - bz));
        const m = Math.min(64, Math.max(1, Math.ceil(L / (C * 0.7))));
        for (let u = 0; u <= m; u++) for (let v = 0; v <= m - u; v++) {
          const s = u / m, r = v / m, q = 1 - s - r;
          mark(ax * q + bx * s + cx * r, ay * q + by * s + cy * r, az * q + bz * s + cz * r, tag);
        }
      }
      geometry.dispose();
    }
  }
  // grounded: within 0.8 m of the ground (or under it), or of the water's surface
  const hCache = new Map();
  const groundAt = (i, k) => {
    const kk = i * 8192 + k; let h = hCache.get(kk);
    if (h === undefined) {
      const x = (i + 0.5) * C, z = (k + 0.5) * C;
      let g = -Infinity;
      try { g = G.height(x, z); } catch { /* none */ }
      try { const w = G.waterLevel(x, z); if (Number.isFinite(w) && G.water(x, z, w)) g = Math.max(g, w); } catch { /* none */ }
      if (!Number.isFinite(g)) g = Math.hypot(x, z) > radius ? Infinity : 0;   // beyond the disc: not judged
      hCache.set(kk, h = g);
    }
    return h;
  };
  const un = (k) => { const kz = k % NX - OX; const r = Math.floor(k / NX); return [Math.floor(r / NY) - OX, r % NY - OY, kz]; };
  const seen = new Set(), stack = [];
  for (const k of cells.keys()) { const [i, j, kz] = un(k); if (j * C <= groundAt(i, kz) + 0.8) { seen.add(k); stack.push(k); } }
  const R = 2;   // joined across a gap of one cell
  const flood = (collect) => {
    while (stack.length) {
      const k = stack.pop(); const [i, j, kz] = un(k);
      collect?.push(k);
      for (let a = -R; a <= R; a++) for (let b = -R; b <= R; b++) for (let c = -R; c <= R; c++) {
        const q = key(i + a, j + b, kz + c);
        if (!seen.has(q) && cells.has(q)) { seen.add(q); stack.push(q); }
      }
    }
  };
  flood();
  const floats = [];
  for (const k of cells.keys()) {
    if (seen.has(k)) continue;
    const cl = []; seen.add(k); stack.push(k); flood(cl);
    if (cl.length < MIN) continue;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9; const who = new Map();
    for (const q of cl) {
      const [i, j, kz] = un(q); x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, j); y1 = Math.max(y1, j); z0 = Math.min(z0, kz); z1 = Math.max(z1, kz);
      const t = tags[cells.get(q)].join(':'); who.set(t, (who.get(t) || 0) + 1);
    }
    const cx = (x0 + x1 + 1) / 2 * C, cz = (z0 + z1 + 1) / 2 * C, g = groundAt(Math.round((x0 + x1) / 2), Math.round((z0 + z1) / 2));
    floats.push({ at: [+cx.toFixed(1), +(y0 * C).toFixed(1), +cz.toFixed(1)], size: [(x1 - x0 + 1) * C, (y1 - y0 + 1) * C, (z1 - z0 + 1) * C], over: +(y0 * C - g).toFixed(1), cells: cl.length, of: [...who].sort((a, b) => b[1] - a[1]).slice(0, 3).map((w) => w[0]) });
  }
  floats.sort((a, b) => b.cells - a.cells);
  // rooms open to the sky: floor cells with nothing between 1.5 m and 60 m over the floor
  const open = [];
  for (const plan of plans) for (const r of plan.rooms || []) {
    if (!r.rect || /court|yard|garden|terrace|plaza|square|street|open|roof|deck|quay|field|pit|pool|bath|arena|stage|platform|walk|path|bridge/i.test(`${r.kind} ${r.id}`)) continue;
    const [ox, oz] = plan.origin || [0, 0], a = -(plan.yaw || 0) * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a);
    const fy = (plan.base || 0) + (r.y || 0);
    let n = 0, bare = 0;
    for (let x = r.rect[0] + 0.6; x < r.rect[2] - 0.5; x += 0.5) for (let z = r.rect[1] + 0.6; z < r.rect[3] - 0.5; z += 0.5) {
      const wx = ox + cs * x + sn * z, wz = oz - sn * x + cs * z, i = Math.floor(wx / C), k = Math.floor(wz / C);
      let cov = false;
      for (let j = Math.floor((fy + 1.5) / C); j <= Math.floor((fy + 60) / C) && !cov; j++) cov = cells.has(key(i, j, k));
      n++; if (!cov) bare++;
    }
    if (n >= 6 && bare / n > 0.3) open.push({ plan: plan.id, room: r.id, kind: r.kind, bare: +(bare / n).toFixed(2), rect: r.rect, origin: plan.origin || [0, 0], y: fy });
  }
  // walls of air
  const stand = (x, z) => { const t = G.height(x, z); return Math.max(t, cw.groundAt(x, z, t + 1.5), cw.topAt(x, z, RADIUS, t + STEP)); };
  const why = (x, z, y) => {
    for (const o of cw._near(cw.grid, x, z)) {
      if (o.y1 <= y + LOW || o.y0 >= y + HEAD) continue;
      if (x + RADIUS < o.bb[0] || x - RADIUS > o.bb[2] || z + RADIUS < o.bb[1] || z - RADIUS > o.bb[3]) continue;
      if (cw.blockedAt(x, z, RADIUS, y + LOW, y + HEAD)) return `obstacle ${o.plan} y ${o.y0.toFixed(1)}..${o.y1.toFixed(1)}`;
    }
    if (cw.inShell(x, z, RADIUS * 0.7, y + LOW, y + HEAD, y + STEP)) {
      for (const T of cw.topGrid.get(Math.floor(x / 16) + ',' + Math.floor(z / 16)) || []) {
        const i = Math.floor((x - T.x0) / T.res), j = Math.floor((z - T.z0) / T.res);
        if (i < 0 || j < 0 || i >= T.w || j >= T.h) continue;
        const o = j * T.w + i;
        if (T.data[o] > y + STEP && T.under[o] < y + HEAD) return `shell ${T.plan} top ${T.data[o].toFixed(1)} under ${Number.isFinite(T.under[o]) ? T.under[o].toFixed(1) : 'none'}`;
      }
      return 'shell';
    }
    return null;
  };
  const drawn = (x, z, y) => {
    const i = Math.floor(x / C), k = Math.floor(z / C);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let j = Math.floor((y + 0.3) / C); j <= Math.floor((y + 1.7) / C); j++) if (cells.has(key(i + a, j, k + b))) return true;
    return false;
  };
  const walls = [], free = new Map();
  const isFree = (x, z) => { const kk = Math.round(x * 2) * 8192 + Math.round(z * 2); let f = free.get(kk); if (f === undefined) { const y = stand(x, z); f = Number.isFinite(y) && !G.water(x, z, y) && !why(x, z, y) ? y : null; free.set(kk, f); } return f; };
  const lim = radius - 6;
  for (let x = -lim; x <= lim; x += 0.5) for (let z = -lim; z <= lim; z += 0.5) {
    if (x * x + z * z > lim * lim) continue;
    if (isFree(x, z) !== null) continue;
    const y = stand(x, z);
    if (!Number.isFinite(y) || G.water(x, z, y) || drawn(x, z, y)) continue;
    let nb = false;
    for (const [a, b] of [[0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]]) { const f = isFree(x + a, z + b); if (f !== null && Math.abs(f - y) < 0.5) nb = true; }
    if (nb) walls.push({ at: [x, +y.toFixed(1), z], why: why(x, z, y) });
  }
  // (neighbouring cells are one wall)
  const groups = [];
  for (const wl of walls) {
    const g = groups.find((q) => q.why.split(' ').slice(0, 2).join(' ') === wl.why.split(' ').slice(0, 2).join(' ') && q.cells.some((c) => Math.abs(c[0] - wl.at[0]) <= 1 && Math.abs(c[2] - wl.at[2]) <= 1));
    if (g) g.cells.push(wl.at); else groups.push({ why: wl.why, cells: [wl.at] });
  }
  const air = groups.map((g) => ({ at: g.cells[Math.floor(g.cells.length / 2)], n: g.cells.length, why: g.why })).sort((a, b) => b.n - a.n);
  // walls one walks through: a run of 2 m or more where something is drawn through the whole height of the
  // body and the walker stands freely
  const through = [];
  {
    const solid = (x, z, y) => { const i = Math.floor(x / C), k = Math.floor(z / C); for (let j = Math.floor((y + 0.3) / C); j <= Math.floor((y + 1.7) / C); j++) if (!cells.has(key(i, j, k))) return null; return cells.get(key(i, Math.floor((y + 1) / C), k)); };
    const hit = new Map();
    for (let x = -lim; x <= lim; x += 0.5) for (let z = -lim; z <= lim; z += 0.5) {
      if (x * x + z * z > lim * lim) continue;
      const y = isFree(x + 0.25, z + 0.25); if (y === null) continue;
      const tg = solid(x + 0.25, z + 0.25, y); if (tg == null) continue;
      hit.set(Math.round(x * 2) * 8192 + Math.round(z * 2), [x, y, z, tg]);
    }
    const used = new Set();
    for (const [k, [x, y, z, tg]] of hit) {
      if (used.has(k)) continue;
      const cl = [k]; used.add(k);
      for (let n = 0; n < cl.length; n++) { const cx = Math.floor(cl[n] / 8192 + 0.5), cz = cl[n] - cx * 8192; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = (cx + a) * 8192 + cz + b; if (hit.has(q) && !used.has(q)) { used.add(q); cl.push(q); } } }
      if (cl.length >= 4) through.push({ at: [x, +y.toFixed(1), z], n: cl.length, of: tags[tg].join(':') });
    }
    through.sort((a, b) => b.n - a.n);
  }
  out[id] = { floats, open, air, through };
  console.log(`${id}: ${floats.length} hanging, ${open.length} rooms open to the sky, ${air.length} walls of air (${walls.length} cells)`);
  { const by = new Map(); for (const a of air) { const k = a.why.replace(/[-\d.]+/g, '#').replace(/ \S+ /, ' '); by.set(a.why.split(' ').slice(0, 2).join(' '), (by.get(a.why.split(' ').slice(0, 2).join(' ')) || 0) + a.n); } console.log('  air by cause: ' + [...by].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => `${k} ×${n}`).join(', ')); }
  console.log(`  ${through.length} walls walked through`);
  for (const a of through.slice(0, +(opt.top ?? 25))) console.log(`  thru  at ${a.at}  ${a.n} cells  ${a.of}`);
  for (const a of air.slice(0, +(opt.top ?? 25))) console.log(`  air   at ${a.at}  ${a.n} cells  ${a.why}`);
  for (const f of floats.slice(0, +(opt.top ?? 25))) console.log(`  hang  at ${f.at}  size ${f.size}  ${f.over} m over  ${f.cells} cells  ${f.of.join(' | ')}`);
  for (const o of open.slice(0, +(opt.top ?? 25))) console.log(`  open  ${o.plan} / ${o.room} (${o.kind})  ${Math.round(o.bare * 100)}% bare  rect ${o.rect} origin ${o.origin}`);
}
if (opt.json) await writeFile(opt.json, JSON.stringify(out, null, 1));

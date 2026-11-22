#!/usr/bin/env node
// Makes src/settlements/herds-data.js: which still animals of the settlements' plans become moving critters (src/settlements/herds.js).
// A candidate is a horse, ox, zebu, donkey, sheep or goat element that is not harnessed (no cart, sledge, coach or plough within 7 m), not ridden (no
// figure astride within 2 m), not laden (gear), not in a street-life tile, and not on a walk route. Candidates within 9 m of each other make a group (two or more);
// groups are taken nearest the arrival first until BUDGET critters are placed, each thinned to 8 (the rest are dropped without a critter).
// usage: node tools/herds-gen.mjs [id …] [--write]   (no ids: every settlement; with ids the file is written only with --write, those settlements' rows replaced)
import fs from 'node:fs';
import { MODULES } from '../src/settlements/grounds.js';
import { herds } from '../src/settlements/herds.js';
import { ARRIVALS } from '../src/planet/arrivals.js';
import { toWorld, buildPlan } from '../src/core/build.js';
import { CollisionWorld } from '../src/core/collide.js';
import { BEASTS } from '../src/objects/animals.js';
import { rng } from '../src/objects/kit.js';
herds.on = false;
const only = process.argv.slice(2).filter((a) => !a.startsWith('--')), BUDGET = 56, CAP = 8, LINK = 9;
const KINDS = new Set(['horse', 'ox', 'zebu', 'donkey', 'sheep', 'goat']);
const HARNESS = new Set(['cart', 'sledge', 'stone_sledge', 'fiaker', 'coach', 'carriage', 'song_oxcart', 'qin_sledges', 'peking_cart', 'coffer_cart', 'litter', 'ak_plough', 'plough', 'bj_watercart', 'bj_coalcart', 'handcart']);
// teams that stand without a cart element near them: the two chariots' horses parked in Yinxu's court (town.js)
const TEAMS = { 'shang-yinxu': new Set(['horse']) };
// places the settlements' own layout tests count as inside a building although no collider stands there (found by their critters tests)
// (Karakorum: the animals at the edges of the people plan stay: taking one out moves the plan's top-field grid and a palace gate route's start then sticks on the awning of the stall beside it)
const AVOID = {'mongol-karakorum': [[-22.7, -131.76], [-33.97, 132.1], [-170.4, 4.93], [97.6, 123.6], [97.6, 126.8], [-21.46, -129.8]], 'norse-borgund': [[-80.01, -19.96], [-44.99, -20.81], [-12.24, 37.56], [42.45, -18.85], [-48.47, 44.0], [62.0, -66.21], [-112.27, 37.67], [77.18, -26.06], [-21.47, 92.21], [-57.13, 99.54], [97.04, -66.11], [57.38, 74.57], [-167.28, -55.63], [-197.17, -17.67], [131.54, 28.28], [112.43, 97.37], [-192.38, 75.11], [167.9, 27.37], [148.29, 98.12]], 'petra': [[-33.05, -46.6], [-46.05, -82.6], [-59.05, -58.6], [-85.05, -82.6], [-82.81645635056053, -58.419106078469184], [-111.05, -70.6], [-124.05, -82.6], [-111.05, 59.71], [-189.05, -58.6], [-150.05, 107.56], [-202.05, 47.93]], 'sanchi': [[23.18, 178.2]] };
const PREHISTORIC = new Set(['catalhoyuk', 'stonehenge']);
const tile = (p) => /,-?\d+$/.test(p);
const dseg = (px, pz, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz, t = L ? Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / L)) : 0; return Math.hypot(px - a[0] - t * dx, pz - a[1] - t * dz); };

function model(id, kind, el) {
  const K = BEASTS[kind], r = rng(el.seed)(), m = el.mat ?? K.mats[Math.floor(r * K.mats.length)], h = (el.seed ?? 0) % 5;
  if (kind === 'horse') return { hide_black: 'horse_black', hide_tan: 'horse_chestnut', hide_grey: 'horse_grey' }[m] || 'horse_bay';
  if (kind === 'donkey') return m === 'hide_brown' ? 'donkey_brown' : 'donkey_grey';
  if (kind === 'ox') return { hide_tan: 'ox_dun', hide_white: 'ox_white', hide_black: 'ox_pied' }[m] || 'ox_red';
  if (kind === 'zebu') return m === 'hide_grey' ? 'zebu_grey' : m === 'hide_brown' ? 'zebu_red' : 'zebu_white';
  if (kind === 'sheep') return PREHISTORIC.has(id) ? (m === 'hide_tan' || h === 0 ? 'sheep_dark' : 'sheep_horned') : m === 'hide_tan' || h === 0 ? 'sheep_dark' : 'sheep_white';
  return m === 'hide_black' || m === 'hide_brown' ? 'goat_black' : 'goat_white';
}

const rows = {}, report = [];
for (const [id, load] of Object.entries(MODULES)) {
  if (only.length && !only.includes(id)) continue;
  const mod = await load(), plans = [...(mod.landmarks || []).map((l) => l.plan), ...(mod.town ? await mod.town() : [])];
  const harness = [], riders = [], walks = [], cand = [];
  for (const p of plans) {
    for (const route of p.walks || []) walks.push(route.map(([x, z]) => { const w = toWorld(p, x, z); return [w[0], w[2]]; }));
    for (const e of p.elements || []) {
      if (!e.at) continue;
      const [wx, , wz] = toWorld(p, e.at[0], e.at[1]);
      if (HARNESS.has(e.t)) harness.push([wx, wz]);
      else if (e.t === 'figure' && JSON.stringify(e).includes('astride')) riders.push([wx, wz]);
      else if (e.t === 'animal' && KINDS.has(e.kind) && !e.gear && !e.load && !tile(p.id) && !TEAMS[id]?.has(e.kind)) cand.push({ el: e, p, x: wx, z: wz, y: toWorld(p, e.at[0], e.at[1], e.y ?? 0)[1] });
    }
  }
  const lay = await import(`../src/settlements/${id}/layout.js`).catch(() => null), inB = lay?.inHouse || lay?.inBuilt || (lay?.buildings && lay?.inRect ? (x, z) => lay.buildings().some((b) => lay.inRect(b.rect, x, z, 2.0)) : null);   // (the settlement's own test of what is a building)
  const ok = cand.filter((c) => !(AVOID[id] || []).some(([x, z]) => Math.hypot(x - c.x, z - c.z) < 1.5)).filter((c) => { try { return !(inB && inB(c.x, c.z)); } catch { return true; } }).filter((c) => !harness.some(([x, z]) => Math.hypot(x - c.x, z - c.z) < 7) && !riders.some(([x, z]) => Math.hypot(x - c.x, z - c.z) < 2)
    && !walks.some((w) => w.some((a, i) => i && dseg(c.x, c.z, w[i - 1], a) < 3)));
  // the walls and fences, without any animal's own collision circle: an animal's place and the ring it wanders over must be clear of them
  let cw = null;
  const clear = (c) => {
    if (!cw) { cw = new CollisionWorld(); for (const p of plans) { if (p.nocollide) continue; try { const b = buildPlan({ ...p, elements: (p.elements || []).filter((e) => e.t !== 'animal') }); cw.add(b.colliders); for (const { geometry } of b.parts) geometry.dispose(); } catch (e) { /* a plan that does not build is reported by the other checks */ } } }
    const free = (x, z, r) => !cw.blockedAt(x, z, r, c.y + 0.05, c.y + 1.0);
    if (!free(c.x, c.z, 0.5)) return 0;
    for (const R of [1.8, 1.2, 0.7]) if ([0, 1, 2, 3, 4, 5, 6, 7].every((k) => free(c.x + R * Math.cos(k * Math.PI / 4), c.z + R * Math.sin(k * Math.PI / 4), 0.45))) return R;
    return 0.3;
  };
  for (const c of ok) c.R = ok.length > 1 ? clear(c) : 1.8;
  ok.splice(0, ok.length, ...ok.filter((c) => c.R > 0));
  const par = ok.map((_, i) => i), fd = (i) => (par[i] === i ? i : (par[i] = fd(par[i])));
  for (let i = 0; i < ok.length; i++) for (let j = 0; j < i; j++) if (Math.hypot(ok[i].x - ok[j].x, ok[i].z - ok[j].z) < LINK) par[fd(i)] = fd(j);
  const gs = new Map(); ok.forEach((c, i) => (gs.get(fd(i)) || gs.set(fd(i), []).get(fd(i))).push(c));
  const A = ARRIVALS[id] || [0, 0, 0], groups = [...gs.values()].filter((g) => g.length >= 2);
  for (const g of groups) g.d = Math.min(...g.map((c) => Math.hypot(c.x - A[0], c.z - A[2])));
  groups.sort((a, b) => a.d - b.d);
  const out = []; let placed = 0, taken = 0;
  for (const g of groups) {
    const keep = Math.min(g.length, CAP);
    if (placed + keep > BUDGET) continue;
    const cx = g.reduce((a, c) => a + c.x, 0) / g.length, cz = g.reduce((a, c) => a + c.z, 0) / g.length;
    const order = [...g].sort((a, b) => Math.hypot(a.x - cx, a.z - cz) - Math.hypot(b.x - cx, b.z - cz));
    const kept = new Set(order.slice(0, keep));
    for (const c of g) {
      const kind = c.el.kind, m = kept.has(c) ? model(id, kind, c.el) : '';
      out.push([kind, +c.x.toFixed(2), +c.z.toFixed(2), +c.y.toFixed(2), +(c.el.rot ?? 0).toFixed(2), m, c.R]);
    }
    placed += keep; taken++;
  }
  if (out.length) rows[id] = out;
  const odd = [...new Set(cand.filter((c) => c.p.base || c.p.yaw).map((c) => c.p.id))];
  report.push(`${id}: ${taken}/${groups.length} groups, ${placed} critters, ${out.length - placed} thinned, ${cand.length - ok.length} excluded (harness, rider, route, wall)${odd.length ? ' ODD ' + odd.join(',') : ''}`);
  console.log(report[report.length - 1]);
}
if (!only.length || process.argv.includes('--write')) {
  if (only.length) { const { HERDS } = await import('../src/settlements/herds-data.js'); for (const id of only) delete HERDS[id]; Object.assign(rows, Object.fromEntries(Object.entries(HERDS).filter(([k]) => !(k in rows)))); }
  let s = '// GENERATED by tools/herds-gen.mjs (do not edit): the still animals of the plans that become moving critters, per settlement (src/settlements/herds.js).\n// Rows: [kind, x, z, y, rot, model (\'\' = dropped, no critter), range (m)], in world metres.\nexport const HERDS = {\n';
  for (const [id, r] of Object.entries(rows)) s += `  '${id}': [\n${r.map((x) => '    ' + JSON.stringify(x)).join(',\n')},\n  ],\n`;
  s += '};\n';
  fs.writeFileSync(new URL('../src/settlements/herds-data.js', import.meta.url), s);
}

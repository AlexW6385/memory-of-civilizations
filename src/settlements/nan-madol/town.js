// The islets of Nan Madol, c. 1300 (docs/settlements/nan-madol.md §3, §6–§8): the retaining walls of crib-laid basalt at every islet's
// edge (a gap where a causeway or a landing leaves it), the causeways' kerbs, landing steps and the canoes drawn up at them, the nahs
// in two rows along each islet's path, cook-houses with their earth ovens, the sea wall's columns, the mangroves of the shore; and
// the people and animals: the sakau pounded at the stones of Nandauwas, priests in its courts, the household at every nah, canoe
// builders on Dapahu, food landed by canoe at the Peiniot islet.
import { RADIUS, WATER, ISLETS, ISLET, FORDS, LANDINGS, edges, gaps, village, cooks, height, inland, inRect, SAKAU, TOMB, INNER, OUTER, OUTER_GATE, INNER_GATE, TOMB_COURT, LESSER_TOMB, FORECOURT } from './layout.js';
import '../../objects/index.js';
import { ARRIVALS } from '../../planet/arrivals.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));          // a figure faces −z when rot = 0
const plan = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-10, 80], facing: 'n' } });
const frameW = (c, yaw) => (u, v) => [c[0] + u * Math.cos(yaw) + v * Math.sin(yaw), c[1] - u * Math.sin(yaw) + v * Math.cos(yaw)];

/** The canoes at rest at the landings (the movers keep clear of them, movers.js): [{ at, yaw, len, side, y }] */
export function moored() {
  const out = [], r = rng(77);
  for (const [id, list] of Object.entries(LANDINGS)) {
    const s = ISLET[id];
    for (const [side, u] of list) {
      const [e] = edges(s).filter((q) => q[0] === side), [, a, b, nx, nz] = e, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
      for (const du of [-4.8, 4.8]) {
        if (r() < 0.25) continue;
        const len = 6 + r() * 1.2, off = 1.65 + len * 0.0 + 0.0;
        const p = [a[0] + ux * (u + du) + nx * off, a[1] + uz * (u + du) + nz * off];
        // along the edge, bow toward either end; the float on the water side
        const yaw = Math.atan2(-ux * (du < 0 ? 1 : -1), -uz * (du < 0 ? 1 : -1));
        out.push({ at: p, yaw, len, y: WATER - 0.22, side: nx * -uz + nz * ux > 0 ? 1 : -1, islet: id });
      }
    }
  }
  return out;
}

export async function town() {
  const E = [], P = [], rand = rng(1300), v = village();
  // ── the walls of the islets, steps, causeways ──
  let seed = 100;
  for (const s of ISLETS) {
    const G = gaps(s);
    for (const [side, a, b, nx, nz] of edges(s)) {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
      const cuts = G.filter((g) => g[0] === side).map((g) => [Math.max(0, g[1]), Math.min(L, g[2])]).sort((p, q) => p[0] - q[0]);
      let u = 0;
      const seg = (u0, u1) => {
        if (u1 - u0 < 1.2) return;
        E.push({ t: 'islet_wall', a: [a[0] + ux * u0, a[1] + uz * u0], b: [a[0] + ux * u1, a[1] + uz * u1], out: [nx, nz], seed: seed++, ends: [u0 < 0.01 ? 0.45 : 0, u1 > L - 0.01 ? 0.45 : 0] });
        E.push({ t: 'wall_dress', a: [a[0] + ux * u0, a[1] + uz * u0], b: [a[0] + ux * u1, a[1] + uz * u1], out: [nx, nz], seed: seed + 5000 });
      };
      for (const [c0, c1] of cuts) { seg(u, c0); u = Math.max(u, c1); }
      seg(u, L);
    }
    for (const [side, u] of LANDINGS[s.id] ?? []) {
      const [, a, b, nx, nz] = edges(s).find((q) => q[0] === side), L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
      E.push({ t: 'steps', a: [a[0] + ux * (u - 1.8), a[1] + uz * (u - 1.8)], b: [a[0] + ux * (u + 1.8), a[1] + uz * (u + 1.8)], out: [nx, nz], n: 3 });
    }
  }
  for (const f of FORDS) E.push({ t: 'ford', c: f.c, axis: f.axis, len: f.len, w: f.w });
  // the sea wall: a high wall of columns along the outer edge of the islets that make it (foundations of columnar basalt and boulders [stated: NRHP])
  for (const s of ISLETS.filter((q) => q.kind === 'seawall')) {
    const [x0, z0, x1, z1] = s.rect;
    if (s.id.startsWith('se')) E.push({ t: 'crib_wall', a: [x1 - 1.2, z0 + 1.5], b: [x1 - 1.2, z1 - 1.5], th: 1.6, top: 2.4, seed: seed++, ends: [0, 0], proj: 0, rough: 0.1, cap: true });
    else if (s.id.startsWith('ss')) E.push({ t: 'crib_wall', a: [x0 + 1.5, z1 - 1.2], b: [x1 - 1.5, z1 - 1.2], th: 1.6, top: 2.4, seed: seed++, ends: [0, 0], proj: 0, rough: 0.1, cap: true });
    else { E.push({ t: 'crib_wall', a: [x1 - 1.2, z0 + 1.5], b: [x1 - 1.2, z1 - 1.5], th: 1.6, top: 2.4, seed: seed++, ends: [0, 0], proj: 0, rough: 0.1, cap: true }); E.push({ t: 'crib_wall', a: [x0 + 1.5, z1 - 1.2], b: [x1 - 1.5, z1 - 1.2], th: 1.6, top: 2.4, seed: seed++, ends: [0, 0], proj: 0, rough: 0.1, cap: true }); }
  }
  // ── the nahs and the cook-houses ──
  const taroOf = (h, k) => (h.islet[0] === 'w' || 's2,s3,s5,s6'.includes(h.islet)) && k % 4 === 1 && (h.depth ?? 0) >= 6.5 && !h.back;
  // the nahs nearest the arrival burn a lamp; the commoners' houses differ at the front: open, with a porch, closed with a door (by the house's seed)
  const A0 = ARRIVALS['nan-madol'], dA = (h) => Math.hypot(h.c[0] - A0[0], h.c[1] - A0[2]), litSet = new Set([...v.houses].sort((a, b) => dA(a) - dA(b)).slice(0, 16));
  const designOf = (h) => (h.rank ? 'open' : ['open', 'porch', 'closed', 'porch', 'closed', 'open'][h.seed % 6]);
  v.houses.forEach((h, k) => { const hh = taroOf(h, k) ? { ...h, depth: 2.6 } : h; E.push({ t: 'nah', c: h.c, yaw: h.yaw, w: h.w, l: h.l, rank: h.rank, seed: h.seed, design: designOf(h), ...(litSet.has(h) ? { lit: true } : {}) }); E.push({ t: 'yard', c: h.c, yaw: h.yaw, w: h.w, l: h.l, depth: hh.depth, rank: h.rank, seed: h.seed + 7 }); });
  for (const k of v.works) E.push({ t: 'works', kind: k.kind, c: k.c, yaw: k.yaw, l: k.l, w: k.w, seed: k.seed });
  // the tomb islet (Peinkitel-like): a walled court, a platform with its crypt, tabu markers, offerings in the crypt
  { const [cx0, cz0, cx1, cz1] = TOMB_COURT.rect;
    E.push({ t: 'tomb_court', rect: TOMB_COURT.rect, gate: TOMB_COURT.gate, seed: 61 });
    E.push({ t: 'tomb', ...LESSER_TOMB, seed: 71 });
    const bx = (LESSER_TOMB.pit[0] + LESSER_TOMB.pit[2]) / 2, bz = LESSER_TOMB.pit[1] + 1.3;
    E.push({ t: 'court', kind: 'tombgift', c: [bx, bz], seed: 3 });
    E.push({ t: 'court', kind: 'rake', rect: [cx0 + 1.4, cz0 + 1.4, cx1 - 1.4, cz1 - 1.4], skip: [[LESSER_TOMB.rect[0] - 1.2, LESSER_TOMB.rect[1] - 1.2, LESSER_TOMB.rect[2] + 1.2, LESSER_TOMB.stair[3] + 0.6], [cx0, (TOMB_COURT.gate[0] + TOMB_COURT.gate[1]) / 2 - 2, LESSER_TOMB.rect[0], (TOMB_COURT.gate[0] + TOMB_COURT.gate[1]) / 2 + 2]], step: 1.4, seed: 1 });
    E.push({ t: 'court', kind: 'tabu', c: [cx0 + 2.6, (TOMB_COURT.gate[0] + TOMB_COURT.gate[1]) / 2 - 2.6], yaw: Math.PI / 2 });
    for (const [x, z] of [[cx0 + 2.5, cz0 + 3], [cx1 - 2.5, cz0 + 3], [cx1 - 2.5, cz1 - 3]]) E.push({ t: 'court', kind: 'lamp', c: [x, z] });
    for (const [x, z, yw] of [[cx1 - 4, cz0 + 8, 0.4], [cx1 - 5, cz1 - 9, 2.0], [cx0 + 5, cz1 - 6, 1.2]]) E.push({ t: 'court', kind: 'offering', c: [x, z], yaw: yw, seed: Math.round(x) });
    E.push({ t: 'court', kind: 'topdress', a: [cx0, cz0], b: [cx1, cz0], top: () => 3.3, seed: 21 }); E.push({ t: 'court', kind: 'topdress', a: [cx1, cz0], b: [cx1, cz1], top: () => 3.3, seed: 22 });
  }
  for (const k of cooks()) E.push({ t: 'cookhouse', c: k.c, yaw: k.yaw, seed: k.seed });
  // the forecourt of Idehd, along the way from the crossroads to the causeway: worked ground either side, lamps down the way
  E.push({ t: 'things', list: FORECOURT.things, seed: 16 });
  for (const c of FORECOURT.lamps) E.push({ t: 'court', kind: 'lamp', c });
  for (const [x, z, yw, sd] of [[-13.6, 13.6, 0.3, 21], [-6.4, 14.6, -0.2, 22], [-14.0, 6.9, 0.1, 23]]) E.push({ t: 'court', kind: 'offering', c: [x, z], yaw: yw, seed: sd });
  // ── canoes at the landings; hulls drawn up on Dapahu where they are built ──
  for (const m of moored()) E.push({ t: 'canoe', at: m.at, yaw: m.yaw, len: m.len, y: m.y, side: m.side });
  // ── the posts the canoes are made fast to, the weirs on the reef flat, the plants ──
  for (const [id, list] of Object.entries(LANDINGS)) for (const [side, u] of list) {
    const [, a, b, nx, nz] = edges(ISLET[id]).find((q) => q[0] === side), L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    for (const du of [-2.4, 2.4]) E.push({ t: 'post', at: [a[0] + ux * (u + du) + nx * 0.62, a[1] + uz * (u + du) + nz * 0.62], h: 1.1 });
  }
  { const wr = rng(33); for (let i = 0; i < 6; i++) E.push({ t: 'weir', at: [114 + wr() * 16, -70 + i * 26 + wr() * 8], yaw: Math.PI / 2 + (wr() - 0.5) * 0.5, len: 7 + wr() * 4, y: -1.35, top: -0.75, seed: 40 + i }); }
  const PL = new Map();
  const plant = (id, k, at, s = 1) => { if (!PL.has(id)) PL.set(id, []); PL.get(id).push({ k, at, y: 0, s, yaw: rand() * 6.28, v: Math.floor(rand() * 4) }); };
  const prand = rng(2025);
  v.houses.forEach((h) => {
    const F = frameW(h.c, h.yaw), D = h.depth ?? 0;
    if (D > 1.6) { plant(h.islet, 'banana', F(-h.w / 2 - 0.3, h.l / 2 + 1.3), 0.9 + prand() * 0.3); if (prand() < 0.7) plant(h.islet, 'banana', F(h.w / 2 + 0.2, h.l / 2 + 2.0), 0.9 + prand() * 0.3); }
    if (D > 2.4 && prand() < 0.45) plant(h.islet, 'hibiscus', F((prand() - 0.5) * h.w, h.l / 2 + D - 0.2), 0.9 + prand() * 0.4);
    if (D > 3 && prand() < 0.7) plant(h.islet, 'coconut', F(-h.w * 0.3 + prand() * h.w * 0.6, h.l / 2 + D + 0.1), 0.9 + prand() * 0.3);
    if (D > 6.5 && prand() < 0.5) plant(h.islet, 'breadfruit', F(-h.w / 2 - 0.2, h.l / 2 + D - 1.8), 0.9 + prand() * 0.3);
    if (D > 2.5 && prand() < 0.35) plant(h.islet, 'ivory', F(h.w / 2 + 0.8, h.l / 2 + D - 0.6), 0.9 + prand() * 0.3);
    // in front of the houses of rank: a coconut by the path's side
    if (!h.back && prand() < 0.12) plant(h.islet, 'coconut', F(h.w / 2 + 1.0, -h.l / 2 - 1.2), 1);
  });
  // the palace forecourt's flanks: coconut palms and bananas outside the cleared way, so that the view stays open to the wall
  for (const [x, z, k] of [[-22.4, 9.6, 'coconut'], [1.0, 9.0, 'coconut'], [-21.6, 25.4, 'banana'], [0.6, 25.8, 'banana'], [-22.8, 13.2, 'banana'], [1.2, 15.6, 'coconut']]) plant('s1', k, [x, z], 0.9 + prand() * 0.3);
  // the sea wall's islets: pandanus on prop roots, hibiscus and a few coconuts at the shore's edge, beach litter of driftwood
  for (const s of ISLETS.filter((q) => q.kind === 'seawall')) {
    const [x0, z0, x1, z1] = s.rect, area = (x1 - x0) * (z1 - z0);
    for (let i = 0; i < area / 55; i++) { const at = [x0 + 2 + prand() * (x1 - x0 - 4), z0 + 2 + prand() * (z1 - z0 - 4)]; const r = prand(); plant(s.id, r < 0.45 ? 'pandanus' : r < 0.75 ? 'hibiscus' : 'coconut', at, 0.8 + prand() * 0.5); }
    for (let i = 0; i < area / 90; i++) { const at = [x0 + 2 + prand() * (x1 - x0 - 4), z0 + 2 + prand() * (z1 - z0 - 4)]; E.push({ t: 'works', kind: 'drift', c: at, yaw: prand() * 6.28, seed: i }); }
  }
  for (const [id, list] of PL) for (let i = 0; i < list.length; i += 40) E.push({ t: 'plants', list: list.slice(i, i + 40) });
  // taro beds on the commoners' islets, behind the houses
  v.houses.forEach((h, k) => { if (!taroOf(h, k)) return; const F = frameW(h.c, h.yaw), c = F(0, h.l / 2 + 4.6); E.push({ t: 'taro_bed', c, yaw: h.yaw, w: 2.4, l: 3.2, seed: k }); });
  // ── the mangroves: the mud flat of the shore, their roots in the water ──
  const mud = [];
  for (let x = -RADIUS + 10; x < RADIUS - 10; x += 2.6) for (let z = -RADIUS + 10; z < RADIUS - 10; z += 2.6) {
    const px = x + rand() * 2.4, pz = z + rand() * 2.4, q = inland(px, pz), h = height(px, pz);
    if (q < -17 || q > 0.5 || Math.hypot(px, pz) > RADIUS - 12 || h < -1.28 || h > -0.8) continue;
    if (rand() < 0.3 + 0.4 * Math.max(0, -q - 8) / 10) continue;
    mud.push([px, pz, h]);
  }
  for (const [px, pz, h] of mud.slice(0, 420)) E.push({ t: 'mangrove', at: [px, pz], y: h, h: 3.5 + rand() * 3.5, seed: Math.floor(rand() * 1e6) });

  // ── the people ──
  const skin = () => (rand() < 0.65 ? 'skin_medium' : 'skin_dark');
  const MAT = ['cloth_brown', 'cloth_ochre', 'hide_tan', 'cloth_white', 'cloth_brown'];
  const woman = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: MAT[Math.floor(rand() * 5)], cloth2: 'cloth_ochre', over: 'none', skin: skin(), hat: 'none', feet: 'bare', hair: rand() < 0.5 ? 'long' : 'bun', beard: false, h: 0.93, ...o });
  const man = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'loincloth', cloth: MAT[Math.floor(rand() * 5)], cloth2: 'cloth_brown', over: 'none', skin: skin(), hat: 'none', feet: 'bare', hair: rand() < 0.6 ? 'bun' : 'long', beard: rand() < 0.3, ...o });
  // the sakau stones of Nandauwas: men beside the slab pounding, one seated at its head; the kohlo wrap of hibiscus bark
  for (const [x, z, yaw] of SAKAU) {
    const W = frameW([x, z], yaw);
    for (const [u, s] of [[-1.05, 1], [-0.3, 1], [0.6, 1], [-0.7, -1], [0.2, -1], [1.0, -1]]) { const at = W(u, s * 0.9); man(at, 0, face(at, W(u, 0)), { cloth: 'hide_tan', cloth2: 'hide_tan', pose: 'talk' }); }
    const head = W(2.9, 0); man(head, 0, face(head, W(0, 0)), { pose: 'cross', cloth: 'cloth_white', beard: true, hair: 'bun' });
  }
  // priests in the outer court, at the gate and about the inner court and the tomb's stair
  const standing = [[-15, -13], [-5, -11], [-17, -11], [6, -30], [10, -48], [-27, -56], [-20, -14], [11, -20], [5.5, -12]];
  for (const at of standing) man(at, 0, face(at, [-10, -38]), { cloth: 'cloth_white', cloth2: 'cloth_white', over: 'cloak', pose: rand() < 0.3 ? 'talk' : 'stand' });
  for (const at of [[-14.5, -24.2], [-5.5, -24.2], [-10, -23.8], [-18.5, -38], [1, -38], [-10, -52]]) man(at, 0, face(at, [-10, -38]), { cloth: 'cloth_white', pose: rand() < 0.5 ? 'cross' : 'kneel', beard: rand() < 0.4 });
  // the household at every nah: someone sitting on the platform, work before it, baskets, firewood, pigs and fowls about
  const hrand = rng(404);
  v.houses.forEach((h, k) => {
    const F = frameW(h.c, h.yaw), ph = h.rank ? 0.7 : 0.45, r = hrand();
    if (r < 0.5) { const at = F(hrand() * 1.2 - 0.6, 0.6); (r < 0.2 ? man : woman)(at, ph, face(at, F(0, -h.l)), { pose: hrand() < 0.5 ? 'sit_ground' : 'cross' }); }
    if (r > 0.3 && r < 0.65) { const at = F(h.w / 2 + 1.0, -h.l / 2 - 0.9); woman(at, 0, face(at, F(h.w / 2 + 1.0 - 1.1, -h.l / 2 - 0.5)), { pose: 'kneel' }); }
    if (r > 0.65 && r < 0.85) { const at = F(-0.8, -h.l / 2 - 2.0); man(at, 0, hrand() * 6.28, { carry: 'basket' }); }
    if (hrand() < 0.5) P.push({ t: 'basket', n: 2, at: F(-h.w / 2 - 0.2, -h.l / 2 - 0.5), y: 0, seed: k, goods: 'cloth_ochre' });
    if (hrand() < 0.35) P.push({ t: 'firewood', at: F(h.w / 2 + 0.5, h.l / 2 - 0.8), y: 0, rot: h.yaw + Math.PI / 2, len: 1.4, seed: k });
    if (hrand() < 0.3) P.push({ t: 'animal', kind: 'pig', at: F(hrand() * 4 - 2, -h.l / 2 - 2.8), y: 0, rot: hrand() * 6.28, seed: 300 + k });
    else if (hrand() < 0.3) P.push({ t: 'chickens', n: 3, at: F(hrand() * 3 - 1.5, -h.l / 2 - 2.6), y: 0, rot: hrand() * 6.28, seed: 500 + k });
    else if (hrand() < 0.12) P.push({ t: 'animal', kind: 'dog', at: F(hrand() * 4 - 2, -h.l / 2 - 2.2), y: 0, rot: hrand() * 6.28, seed: 700 + k });
  });
  // the earth ovens: a woman kneeling at each, another bringing leaves
  cooks().forEach((k, i) => {
    const F = frameW(k.c, k.yaw), at = F(0.3, -1.3);
    woman(at, 0, face(at, k.c), { pose: 'kneel' });
    if (i % 2 === 0) { const b = F(-1.2, -1.7); woman(b, 0, face(b, k.c), { carry: 'basket' }); }
    P.push({ t: 'firewood', at: F(-1.3, 1.0), y: 0, rot: k.yaw, len: 1.2, seed: 40 + i });
  });
  // Peiniot, the landing: food brought in baskets from the canoes to the houses of the chief
  const pe = ISLET.s4.rect;
  for (let i = 0; i < 9; i++) { const at = [pe[0] + 6 + rand() * (pe[2] - pe[0] - 12), pe[1] + 6 + rand() * (pe[3] - pe[1] - 12)]; if (v.houses.some((h) => Math.hypot(h.c[0] - at[0], h.c[1] - at[1]) < 4.5) || Math.abs(at[0] + 10) < 3) continue; (i % 3 ? woman : man)(at, 0, rand() * 6.28, { carry: i % 2 ? 'basket' : 'pole' }); }
  for (const [lx, lz] of [[pe[2] - 3, pe[1] + 14], [pe[0] + 18, pe[3] - 3]]) P.push({ t: 'basket', n: 4, at: [lx, lz], y: 0, seed: Math.round(lx), goods: 'cloth_green' });
  // dogs and a few pigs on the larger islets' paths
  for (let i = 0; i < 12; i++) { const s = ISLETS[Math.floor(rand() * 12)], at = [s.rect[0] + 3 + rand() * (s.rect[2] - s.rect[0] - 6), s.rect[1] + 3 + rand() * (s.rect[3] - s.rect[1] - 6)]; if (s.kind === 'landmark' || v.houses.some((h) => Math.hypot(h.c[0] - at[0], h.c[1] - at[1]) < 4)) continue; P.push({ t: 'animal', kind: i % 3 ? 'pig' : 'dog', at, y: 0, rot: rand() * 6.28, seed: 900 + i }); }
  // the works: crews at the shipyard, the oil works, the cook-shed, the chief's hall and the landing's store
  for (const k of v.works) {
    const F = frameW(k.c, k.yaw), at = (u, w) => F(u, w), hr = rng(k.seed + 11);
    if (k.kind === 'shipyard') {
      for (let i = 0; i < 6; i++) { const p0 = at(-k.l / 2 + 2.5 + i * (k.l - 5) / 5, i % 2 ? 0.25 : -2.7), tgt = at(p0 && -k.l / 2 + 2.5 + i * (k.l - 5) / 5, i % 2 ? 1.5 : -1.3); man(p0, 0, face(p0, tgt), { pose: i % 3 === 0 ? 'squat' : i % 3 === 1 ? 'kneel' : 'stand' }); }
      for (let i = 0; i < 2; i++) { const p0 = at(-k.l / 2 + 1 + i * 3, k.w / 2 + 3.2); man(p0, 0, hr() * 6.28, { carry: 'pole' }); }
    } else if (k.kind === 'oilworks') {
      for (let i = 0; i < 3; i++) { const p0 = at(-1.0 + i * 1.0, -k.w / 2 + 1.4); woman(p0, 0, face(p0, at(-1.0 + i * 1.0, -k.w / 2 + 0.65)), { pose: 'kneel' }); }
      for (const x of [-k.l / 4, k.l / 4]) { const p0 = at(x + 0.4, 1.3); man(p0, 0, face(p0, at(x + 0.4, 0)), { pose: 'stand' }); }
      for (const x of [-k.l / 4, k.l / 4]) { const p0 = at(x, k.w / 2 + 3.4); woman(p0, 0, face(p0, at(x, k.w / 2 + 2.0)), { pose: 'kneel' }); }
    } else if (k.kind === 'cookshed') {
      const n = Math.max(3, Math.floor(k.l / 4));
      for (let i = 0; i < n; i++) { const x = -k.l / 2 + (i + 0.5) * k.l / n, p0 = at(x + 0.2, 1.35); woman(p0, 0, face(p0, at(x, 0)), { pose: 'kneel' }); if (i % 2) { const q = at(x - 1.6, -1.5); man(q, 0, face(q, at(x, 0)), { carry: 'basket' }); } }
      for (let i = 0; i < 2; i++) { const p0 = at(-k.l / 2 + 1.2 + i * 2, -k.w / 2 - 1.5); woman(p0, 0, face(p0, at(-k.l / 2 + 1.2 + i * 2, -k.w / 2 - 1.2 + 0.1)), { pose: 'kneel' }); }
    } else if (k.kind === 'hall') {
      for (const [u, w2] of [[-k.l / 4, -1.4], [-k.l / 4, 1.4], [0, -1.4], [0, 1.4], [k.l / 4 - 0.5, 0]]) { const p0 = at(u, w2); man(p0, 0.9, face(p0, at(k.l / 2 - 1.5, 0)), { pose: 'cross', cloth: 'cloth_white', beard: true }); }
      const ch = at(k.l / 2 - 1.1, 0); man(ch, 1.15, face(ch, at(0, 0)), { pose: 'cross', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'cloak', beard: true, hair: 'bun' });
      for (let i = 0; i < 3; i++) { const p0 = at(-k.l / 2 + 2 + i * 2.5, -k.w / 2 - 2.2); (i % 2 ? woman : man)(p0, 0, hr() * 6.28, { carry: 'basket' }); }
    } else if (k.kind === 'landing') {
      for (let i = 0; i < 5; i++) { const p0 = at(-k.l / 2 + 1.0 + i * (k.l - 2) / 4, -k.w / 2 - 1.6 - (i % 2) * 1.2); (i % 2 ? woman : man)(p0, 0, face(p0, at(p0 && 0, 0)), { carry: i % 2 ? 'basket' : 'pole' }); }
    }
  }
  // children about the houses, a few
  v.houses.forEach((h, k) => { if (k % 6 !== 3) return; const F = frameW(h.c, h.yaw); for (let i = 0; i < 2; i++) { const at = F(-1.5 + i * 2.2, -h.l / 2 - 1.5 - i * 0.7); man(at, 0, rand() * 6.28, { h: 0.62, pose: 'stand', beard: false, hair: 'long' }); } });
  // the forecourt of Idehd, which the arrival looks down: women at the pounding boards, men at the canoe hull, someone at every rack and net,
  // porters and priests on the way to the causeway (none nearer than 9 m of the arrival at (−10, 28))
  { const at = (x, z) => [x, z], fc = (a, b, o = {}, f = woman) => f(a, 0, face(a, b), o);
    for (const [bx, bz] of [[-17.2, 15.8], [-5.6, 19.0]]) { const a = at(bx + 0.1, bz + 1.0); woman(a, 0, face(a, [bx, bz]), { pose: 'kneel' }); const b = at(bx + 1.3, bz + 0.5); woman(b, 0, face(b, [bx, bz]), { pose: 'sit_ground' }); }
    for (const [x, z, bx, bz] of [[-17.4, 21.9, -17.4, 20.6], [-16.2, 19.3, -16.6, 20.6], [-19.8, 19.6, -19.0, 20.4]]) man(at(x, z), 0, face([x, z], [bx, bz]), { pose: x < -18.8 ? 'squat' : 'kneel', cloth: 'hide_tan' });
    fc([-16.0, 9.9], [-16.1, 8.8], { pose: 'stand' }, woman); fc([-13.6, 9.7], [-14.6, 8.8], { pose: 'kneel' }, woman);
    fc([-18.4, 12.6], [-19.8, 12.4], { pose: 'stand' }, man); fc([-4.0, 12.8], [-5.1, 13.0], { pose: 'stand' }, woman);
    fc([-3.4, 16.4], [-4.8, 16.2], { pose: 'sit_ground' }, woman);
    // the pen's pig and the children
    P.push({ t: 'animal', kind: 'pig', at: [-4.2, 9.4], y: 0, rot: 1.2, seed: 1601 }, { t: 'animal', kind: 'pig', at: [-4.5, 8.8], y: 0, rot: 3.9, seed: 1602 });
    man([-2.6, 11.2], 0, 2.0, { h: 0.62, pose: 'stand', beard: false, hair: 'long' }); man([-13.0, 15.2], 0, 4.0, { h: 0.66, pose: 'stand', beard: false, hair: 'long' });
    // on the way: porters with poles of baskets to the causeway, two priests with their white mats, an old man with a staff
    man([-7.6, 12.2], 0, Math.PI, { carry: 'pole' }); woman([-12.5, 14.2], 0, Math.PI, { carry: 'basket' }); woman([-12.4, 8.6], 0, 0.3, { carry: 'basket' });
    man([-7.7, 19.4], 0, face([-7.7, 19.4], [-12.3, 19.6]), { cloth: 'cloth_white', cloth2: 'cloth_white', over: 'cloak', pose: 'talk', beard: true, hair: 'bun' }); man([-12.3, 19.6], 0, face([-12.3, 19.6], [-7.7, 19.4]), { cloth: 'cloth_white', cloth2: 'cloth_white', over: 'cloak', pose: 'talk', beard: true });
    for (const [x, z] of [[-14.6, 17.4], [-6.6, 11.4], [-14.2, 21.0]]) P.push({ t: 'basket', n: 2, at: [x, z], y: 0, seed: Math.round(x * 10), goods: 'cloth_ochre' });
    for (const [x, z] of [[-18.2, 17.6], [-2.4, 22.6]]) P.push({ t: 'firewood', at: [x, z], y: 0, rot: 0.4, len: 1.4, seed: Math.round(z) });
    P.push({ t: 'chickens', n: 4, at: [-12.8, 20.8], y: 0, rot: 2, seed: 1603 }, { t: 'animal', kind: 'dog', at: [-8.4, 20.2], y: 0, rot: 4.4, seed: 1604 });
  }
  // on the causeway to Nandauwas (the middle distance of the arrival): a woman wading with a basket-trap, a man with a fish spear on the kerb,
  // two priests at the gate's jambs and others sitting on the seats of columns before it
  woman([-8.7, 1.0], -1.0, 1.57, { pose: 'stand', carry: 'basket' }); man([-11.4, 2.6], -1.0, -1.57, { pose: 'stand', carry: 'staff' });
  for (const x of [-13.4, -6.6]) man([x, -5.2], 0, face([x, -5.2], [-10, 4]), { cloth: 'cloth_white', cloth2: 'cloth_white', over: 'cloak', pose: 'stand', beard: true, hair: 'bun', carry: 'staff' });
  for (const [x, yw] of [[-17.0, 0], [-2.8, 0]]) man([x, -3.2], 0, Math.PI, { cloth: 'cloth_white', pose: 'cross', beard: true });
  // the arrival: families on Peiniot by the cross path and the canoes at its landings, someone aboard half the moored canoes
  for (const [x, z, k] of [[-13.2, 66, 0], [-6.8, 70, 1], [-6.6, 84, 2], [-13.4, 86, 3], [-12.8, 77, 4], [-7.0, 77, 5]]) { const at = [x, z]; (k % 2 ? man : woman)(at, 0, face(at, [-10, z + (k % 3 - 1) * 3]), { pose: k < 2 ? 'talk' : k < 4 ? 'sit_ground' : 'stand' }); }
  moored().forEach((m, i) => { if (i % 2) return; const at = [m.at[0], m.at[1]]; man(at, m.y + 0.18, m.yaw + Math.PI, { pose: 'cross', hat: 'none' }); });
  // and in each of the lit houses someone sits at the lamp, whatever the draw gave (a stream of its own: the households' stay as they were)
  { const lr = rng(1771); [...litSet].forEach((h, i) => { const F = frameW(h.c, h.yaw), ph = h.rank ? 0.7 : 0.45, at = F(-h.w / 2 + 1.5 + lr() * 0.6, 1.9 + lr() * 0.8); (i % 3 === 0 ? man : woman)(at, ph, face(at, F(0, -h.l)), { pose: i % 2 ? 'cross' : 'sit_ground' }); }); }
  void INNER; void OUTER; void OUTER_GATE; void INNER_GATE; void TOMB; void inRect;
  return [plan('nan-madol-islets', 'nanmadol', E), plan('nan-madol-people', 'life', P)];
}

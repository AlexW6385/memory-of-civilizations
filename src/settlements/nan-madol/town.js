// The islets of Nan Madol, c. 1300 (docs/settlements/nan-madol.md §3, §6–§8): the retaining walls of crib-laid basalt at every islet's
// edge (a gap where a causeway or a landing leaves it), the causeways' kerbs, landing steps and the canoes drawn up at them, the nahs
// in two rows along each islet's path, cook-houses with their earth ovens, the sea wall's columns, the mangroves of the shore; and
// the people and animals: the sakau pounded at the stones of Nandauwas, priests in its courts, the household at every nah, canoe
// builders on Dapahu, food landed by canoe at the Peiniot islet.
import { RADIUS, WATER, ISLETS, ISLET, FORDS, LANDINGS, edges, gaps, village, cooks, height, inland, inRect, SAKAU, TOMB, INNER, OUTER, OUTER_GATE, INNER_GATE } from './layout.js';
import '../../objects/index.js';

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
    if (s.id.startsWith('se')) E.push({ t: 'crib_wall', a: [x1 - 1.2, z0 + 1.5], b: [x1 - 1.2, z1 - 1.5], th: 1.6, top: 2.4, seed: seed++, ends: [0, 0], proj: 0 });
    else if (s.id.startsWith('ss')) E.push({ t: 'crib_wall', a: [x0 + 1.5, z1 - 1.2], b: [x1 - 1.5, z1 - 1.2], th: 1.6, top: 2.4, seed: seed++, ends: [0, 0], proj: 0 });
    else { E.push({ t: 'crib_wall', a: [x1 - 1.2, z0 + 1.5], b: [x1 - 1.2, z1 - 1.5], th: 1.6, top: 2.4, seed: seed++, ends: [0, 0], proj: 0 }); E.push({ t: 'crib_wall', a: [x0 + 1.5, z1 - 1.2], b: [x1 - 1.5, z1 - 1.2], th: 1.6, top: 2.4, seed: seed++, ends: [0, 0], proj: 0 }); }
  }
  // ── the nahs and the cook-houses ──
  for (const h of v.houses) E.push({ t: 'nah', c: h.c, yaw: h.yaw, w: h.w, l: h.l, rank: h.rank, seed: h.seed });
  for (const k of cooks()) E.push({ t: 'cookhouse', c: k.c, yaw: k.yaw, seed: k.seed });
  // ── canoes at the landings; hulls drawn up on Dapahu where they are built ──
  for (const m of moored()) E.push({ t: 'canoe', at: m.at, yaw: m.yaw, len: m.len, y: m.y, side: m.side });
  const dap = ISLET.n1.rect;
  for (const [k, [ux, uz, yaw]] of [[0.28, 0.5, Math.PI / 2], [0.7, 0.5, Math.PI / 2 + 0.05]].entries()) E.push({ t: 'canoe', at: [dap[0] + (dap[2] - dap[0]) * ux, dap[1] + (dap[3] - dap[1]) * uz], yaw: yaw - Math.PI / 2 + Math.PI / 2, len: 8 - k, y: 0.35, side: 1 });
  // ── the mangroves: the mud flat of the shore, their roots in the water ──
  const mud = [];
  for (let x = -RADIUS + 10; x < RADIUS - 10; x += 3.2) for (let z = -RADIUS + 10; z < RADIUS - 10; z += 3.2) {
    const px = x + rand() * 2.4, pz = z + rand() * 2.4, q = inland(px, pz), h = height(px, pz);
    if (q < -17 || q > 0.5 || Math.hypot(px, pz) > RADIUS - 12 || h < -1.28 || h > -0.8) continue;
    if (rand() < 0.55 + 0.4 * Math.max(0, -q - 8) / 10) continue;
    mud.push([px, pz, h]);
  }
  for (const [px, pz, h] of mud.slice(0, 260)) E.push({ t: 'mangrove', at: [px, pz], y: h, h: 3.5 + rand() * 3.5, seed: Math.floor(rand() * 1e6) });

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
  // Dapahu: the canoe builders, adzes at the hulls
  const dap2 = ISLET.n1.rect;
  for (let i = 0; i < 6; i++) { const at = [dap2[0] + 10 + i * 6.5, (dap2[1] + dap2[3]) / 2 + (i % 2 ? 2.6 : -2.6)]; man(at, 0, face(at, [at[0], (dap2[1] + dap2[3]) / 2]), { pose: i % 3 === 0 ? 'squat' : 'stand' }); }
  // Peiniot, the landing: food brought in baskets from the canoes to the houses of the chief
  const pe = ISLET.s4.rect;
  for (let i = 0; i < 9; i++) { const at = [pe[0] + 6 + rand() * (pe[2] - pe[0] - 12), pe[1] + 6 + rand() * (pe[3] - pe[1] - 12)]; if (v.houses.some((h) => Math.hypot(h.c[0] - at[0], h.c[1] - at[1]) < 4.5) || Math.abs(at[0] + 10) < 3) continue; (i % 3 ? woman : man)(at, 0, rand() * 6.28, { carry: i % 2 ? 'basket' : 'pole' }); }
  for (const [lx, lz] of [[pe[2] - 3, pe[1] + 14], [pe[0] + 18, pe[3] - 3]]) P.push({ t: 'basket', n: 4, at: [lx, lz], y: 0, seed: Math.round(lx), goods: 'cloth_green' });
  // dogs and a few pigs on the larger islets' paths
  for (let i = 0; i < 12; i++) { const s = ISLETS[Math.floor(rand() * 12)], at = [s.rect[0] + 3 + rand() * (s.rect[2] - s.rect[0] - 6), s.rect[1] + 3 + rand() * (s.rect[3] - s.rect[1] - 6)]; if (s.kind === 'landmark' || v.houses.some((h) => Math.hypot(h.c[0] - at[0], h.c[1] - at[1]) < 4)) continue; P.push({ t: 'animal', kind: i % 3 ? 'pig' : 'dog', at, y: 0, rot: rand() * 6.28, seed: 900 + i }); }
  void INNER; void OUTER; void OUTER_GATE; void INNER_GATE; void TOMB; void inRect;
  return [plan('nan-madol-islets', 'nanmadol', E), plan('nan-madol-people', 'life', P)];
}

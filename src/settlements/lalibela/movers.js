// Zagwe Lalibela c. 1220 — the moving life (docs/settlements/lalibela.md §14): pilgrims wrapped in white
// cotton shawls and carrying staffs, women with water jars and loads, farmers with sacks of grain, priests
// in white robes and turbans (some under the velvet umbrellas of the church), deacons and boys, walking in
// the churches' courts, down the trenches and the Jordan and along the paths to the village. Data for the
// engine's movers (src/engine/movers.js, read in its worker); the ways come from layout.js. No boats.

import { RADIUS, PITS, TRENCHES, EDGE, LINKS, lanes } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 44, night: 4, rain: 0.5, reach: 170, spawnMin: 22, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -40,
};

// ---- the ways
const gc = (p) => [(p.rect[0] + p.rect[2]) / 2, (p.rect[1] + p.rect[3]) / 2];
/** The courts: strips along the inner foot of a pit's walls, in the gaps between the rock and the church's plinth (gap ≥ 3 m). */
function court(pit, foot, only = null) {
  const [x0, z0, x1, z1] = pit.rect, I = [x0 + EDGE, z0 + EDGE, x1 - EDGE, z1 - EDGE], out = [];
  const gaps = { n: foot[1] - I[1], s: I[3] - foot[3], w: foot[0] - I[0], e: I[2] - foot[2] };
  for (const [k, g] of Object.entries(gaps)) {
    if (g < 2.9 || (only && !only.includes(k))) continue;
    const w = Math.min(3.0, g - 0.5), o = 0.25;
    out.push({ n: [I[0], I[1] + o, I[2], I[1] + o + w], s: [I[0], I[3] - o - w, I[2], I[3] - o], w: [I[0] + o, I[1], I[0] + o + w, I[3]], e: [I[2] - o - w, I[1], I[2] - o, I[3]] }[k]);
  }
  return out;
}
export function walkways() {
  const rects = [], links = [], R = (r, weight, kind = 'street') => rects.push({ r, weight, market: 0, kind });
  const G = PITS.giyorgis, M = PITS.medhane, Mm = PITS.maryam, Go = PITS.golgotha, A = PITS.amanuel, Ga = PITS.gabriel;
  const [gx, gz] = gc(G), [mx, mz] = gc(M);
  // the courts
  for (const r of court(G, [gx - 12.8, gz - 12.8, gx + 12.8, gz + 12.8])) R(r, 1.0);
  for (const r of court(M, [mx - 17.25, mz - 12.25, mx + 17.25, mz + 12.25])) R(r, 1.4);
  for (const r of court(Go, [-64.2, -98.2, -39.8, -83.8])) R(r, 0.7);
  for (const r of court(A, [31, 54, 49, 66])) R(r, 1.0);
  for (const r of court(Ga, [111.4, 34.4, 128.6, 45.6])) R(r, 0.9);
  // Bete Maryam: its porches close the west, its pools the corners of the east
  R([58.4, -100.4, 78.6, -97.6], 1.0); R([58.4, -82.4, 78.6, -79.6], 0.8); R([57.6, -99.4, 59.6, -80.6], 0.8);
  R([-67, -100.6, -37, -98.6], 0.7);                                 // Golgotha's north gap
  // the trenches (their floors between the rock walls) and the Jordan, joined to the courts, and the paths beyond
  R([-150, -19, 212, -9], 2.0);                                      // the Jordan with its two ramps
  R([-340, -17, -150, -11], 0.9); R([212, -17, 340, -11], 0.9);       // the paths out west and east
  R([-340, 126, -211, 130], 1.2);                                    // down to Bete Giyorgis and the way to it
  R([7, -252, 13, -106], 1.5);                                       // to Medhane Alem from the north
  R([-55, -252, -49, -99.5], 0.8); R([-252, -252, 10, -248], 0.7);                                   // to Golgotha
  R([29, -93, 58.6, -87], 1.0);                                        // Medhane Alem to Maryam
  R([37, -19, 43, 49], 1.0); R([117, -19, 123, 33], 0.9);            // the Jordan to Amanuel and to Gabriel-Rufael
  // the village: footpaths from the Jordan's roads out over the slopes, and the lanes of the hamlets to their compounds' gates
  for (const l of LINKS) links.push({ a: l.a, b: l.b, w: l.w, kind: 'street', weight: 0.5 });
  for (const l of lanes()) links.push({ a: l.a, b: l.b, w: l.w, kind: 'street', weight: l.w > 1.6 ? 0.45 : 0.2 });
  void TRENCHES;
  return { rects, links, clip: RADIUS - 12 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

// ---- who walks: white cotton (the netela and the gabi) over a long shirt, bare feet or sandals, the priests in turbans
const CL = { white: 'cloth_white', ochre: 'cloth_ochre', brown: 'cloth_brown', red: 'cloth_red', maroon: 'cloth_maroon', indigo: 'cloth_indigo', green: 'cloth_green', blue: 'cloth_blue', grey: 'cloth_grey', black: 'cloth_black' };
export const WALKERS = [
  { id: 'pilgrim', weight: 3.0, market: 1, el: { dress: 'robe', over: 'shawl', hat: 'veil', arms: 'hang', hair: 'short', beard: 0.4, feet: 'bare' },
    c1: [CL.white, CL.white, CL.white, CL.grey], c2: [CL.white, CL.white, CL.ochre], c3: [CL.white], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'wayfarer', weight: 1.4, market: 1, el: { dress: 'robe', over: 'cloak', hat: 'none', arms: 'staff', carry: 'staff', hair: 'short', beard: 0.6, feet: 'bare' },
    c1: [CL.white, CL.white, CL.brown], c2: [CL.white, CL.grey, CL.ochre], c3: [CL.white], speed: [0.85, 1.15], stride: 1.4 },
  { id: 'woman', weight: 1.5, market: 1, el: { dress: 'robe', over: 'shawl', hat: 'veil', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.7,
    c1: [CL.white, CL.white, CL.ochre, CL.indigo], c2: [CL.white, CL.ochre, CL.red], c3: [CL.white], speed: [0.8, 1.0], stride: 1.2, h: [0.9, 0.97] },
  { id: 'jar', weight: 1.0, market: 1, el: { dress: 'robe', over: 'shawl', hat: 'veil', carry: 'pot', arms: 'head', hair: 'bun', feet: 'bare' }, swing: 0.5,
    c1: [CL.white, CL.ochre, CL.brown], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  { id: 'farmer', weight: 1.2, market: 1, el: { dress: 'trousers', over: 'cape', hat: 'none', carry: 'sack', arms: 'sack', hair: 'short', beard: 0.4, feet: 'bare' },
    c1: [CL.white, CL.grey, CL.brown], c2: [CL.white, CL.grey, CL.white], c3: [CL.white], speed: [0.85, 1.15], stride: 1.3 },
  { id: 'basket', weight: 0.9, market: 1, el: { dress: 'robe', over: 'shawl', hat: 'veil', carry: 'basket', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.5,
    c1: [CL.white, CL.ochre, CL.brown], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.8, 1.0], stride: 1.2, h: [0.9, 0.97] },
  // the clergy: a white robe and a white turban, a cape over it, ochre or maroon at the hem
  { id: 'priest', weight: 1.1, market: 1, el: { dress: 'robe', over: 'cape', hat: 'turban', arms: 'hang', hair: 'short', beard: 0.8, feet: 'bare' },
    c1: [CL.white], c2: [CL.white, CL.ochre, CL.white, CL.maroon], c3: [CL.white], speed: [0.75, 0.95], stride: 1.35 },
  { id: 'shade', weight: 0.5, market: 1, parasol: true, el: { dress: 'robe', over: 'cape', hat: 'turban', arms: 'staff', hair: 'short', beard: 0.8, feet: 'bare' },
    c1: [CL.white], c2: [CL.white, CL.ochre], c3: [CL.red, CL.blue, CL.green, CL.maroon], speed: [0.7, 0.9], stride: 1.4 },
  { id: 'boy', weight: 0.7, market: 1, el: { dress: 'robe', over: 'none', hat: 'none', arms: 'hang', hair: 'short', feet: 'bare' },
    c1: [CL.white, CL.ochre, CL.brown], c2: [CL.white], c3: [CL.white], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
export const CREW = {};

// ---- the ceremonial umbrella (a gored dome of velvet on a pole held over the head in the right hand)
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
function beam(out, p, q, r, n = 4) {
  const d = norm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]), t1 = norm(cross(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), t2 = cross(d, t1);
  const ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [c[0] + (t1[0] * Math.cos(a) + t2[0] * Math.sin(a)) * r, c[1] + (t1[1] * Math.cos(a) + t2[1] * Math.sin(a)) * r, c[2] + (t1[2] * Math.cos(a) + t2[2] * Math.sin(a)) * r]; });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
  for (let k = 1; k + 1 < n; k++) out.push(...A[0], ...A[k + 1], ...A[k], ...B[0], ...B[k], ...B[k + 1]);
}
function umbrella(add) {
  const R = 0.78, drop = 0.3, N = 16, grip = [0.25, 0.98, -0.25], top = [0.07, 2.02, -0.08];
  const ax = [top[0] - grip[0], top[1] - grip[1], top[2] - grip[2]], la = Math.hypot(...ax), u = ax.map((v) => v / la);
  const t1 = norm(cross(u, [0, 0, 1])), t2 = cross(u, t1);
  const P = (r, th, h) => [top[0] + (t1[0] * Math.cos(th) + t2[0] * Math.sin(th)) * r + u[0] * h, top[1] + (t1[1] * Math.cos(th) + t2[1] * Math.sin(th)) * r + u[1] * h, top[2] + (t1[2] * Math.cos(th) + t2[2] * Math.sin(th)) * r + u[2] * h];
  const dome = [], under = [], wood = [];
  for (let k = 0; k < N; k++) {
    const a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2;
    for (let j = 0; j < 3; j++) {
      const r0 = R * j / 3, r1 = R * (j + 1) / 3, h = (r) => -drop * (r / R) ** 1.6;
      const A = P(r0, a0, h(r0)), B = P(r1, a0, h(r1)), C = P(r1, a1, h(r1)), D = P(r0, a1, h(r0));
      dome.push(...A, ...B, ...C, ...A, ...C, ...D); under.push(...A, ...C, ...B, ...A, ...D, ...C);
    }
  }
  add('cloth', flat(dome), { slot: SLOT.c3, col: [1, 1, 1] });
  add('cloth', flat(under), { slot: SLOT.c3, col: [0.8, 0.7, 0.55] });
  beam(wood, [grip[0] - u[0] * 0.14, grip[1] - u[1] * 0.14, grip[2] - u[2] * 0.14], [top[0] + u[0] * 0.12, top[1] + u[1] * 0.12, top[2] + u[2] * 0.12], 0.012, 6);
  add('wood', flat(wood), { col: factor('wood', 'timber', 0.9) });
}
export function walkerShapes(sb) {
  for (const k of WALKERS) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|dry|${far ? 'far' : 'near'}`), el = { ...k.el };
    addFigure(sb, v, figure, el, { far, cape: null, extra: k.parasol ? umbrella : null });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }

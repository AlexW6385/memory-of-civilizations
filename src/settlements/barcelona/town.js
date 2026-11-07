// The Eixample's blocks (docs/settlements/barcelona.md §5): every block a ring of houses round its
// court; Casa Milà's block keeps its north-west corner for the house, Casa Batlló's block a gap on
// the Passeig for it (both built with the landmark). The street life of 1910 (§5a): the trams on the
// Passeig de Gràcia and on a line that turns off it round the cut corners, east along a cross street
// and up the Carrer de la Marina past the Nativity façade; hackney carriages at the kerbs.
import { RADIUS, PITCH, BLOCK, BATLLO, GRACIA_X, blocks, height, onDiagonal, bancsFanals } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements) => ({ id, style: 'modernisme', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 46], facing: 'n' } });
const Y = (x, z) => height(x, z);

/** A straight run from a to b, sampled every 4 m (the ground's slope followed). */
function straight(a, b) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / 4)), out = []; for (let i = 0; i <= n; i++) { const x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n; out.push([x, z, Y(x, z)]); } return out; }
/** A quarter turn about the centre c, radius r, from angle a0 to a1. */
function arc(c, r, a0, a1) { const n = 12, out = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n, x = c[0] + Math.cos(a) * r, z = c[1] + Math.sin(a) * r; out.push([x, z, Y(x, z)]); } return out; }

/** The tram lines: runs and their curves (each an element, the poles closer round the curves). */
function tramLines() {
  const R = 14, X1 = GRACIA_X, ZS = PITCH / 2, XM = PITCH * 2.5;              // the Passeig, the cross street, the Marina
  const avoid = blocks().map((b) => [b.c[0] - BLOCK / 2, b.c[1] - BLOCK / 2, b.c[0] + BLOCK / 2, b.c[1] + BLOCK / 2]);
  const runs = [
    { pts: straight([X1, -330], [X1, ZS - R]), every: 30 },                                       // the Passeig from Gràcia down to the turn
    { pts: arc([X1 + R, ZS - R], R, Math.PI, Math.PI / 2), every: 6, skipFirst: true },            // round the cut corner, east
    { pts: straight([X1 + R, ZS], [XM - R, ZS]), every: 30, skipFirst: true },                     // along the cross street
    { pts: arc([XM - R, ZS - R], R, Math.PI / 2, 0), every: 6, skipFirst: true },                  // round the corner, north
    { pts: straight([XM, ZS - R], [XM, -220]), every: 36, skipFirst: true },                       // up the Marina past the façade (poles at z -76 and -112, clear of the arrival's view of the portals)
    { pts: straight([X1, ZS - R], [X1, 330]), every: 30, skipFirst: true },                        // the Passeig on toward the old city
  ];
  return runs.map((r) => ({ t: 'tram_line', ...r, avoid }));
}
/** Trams on the lines: on the right-hand track for the line's direction or the left for the other way. */
function trams(lines, rand) {
  const out = [], put = (pts, s, side, kind) => {
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    let i = 0; while (i < pts.length - 2 && cum[i + 1] < s) i++;
    const f = (s - cum[i]) / ((cum[i + 1] - cum[i]) || 1), x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, z = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
    const d = [pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]], l = Math.hypot(...d), o = [-d[1] / l, d[0] / l];
    const px = x + o[0] * side * 1.55, pz = z + o[1] * side * 1.55, dir = side > 0 ? d : [-d[0], -d[1]];
    if (Math.hypot(px, pz) > RADIUS - 40) return;
    out.push({ t: 'tram', at: [px, pz], y: Y(px, pz) + 0.03, rot: Math.atan2(-dir[0], -dir[1]), kind, wire: 5.87, seed: Math.floor(rand() * 1e9) });
  };
  const len = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
  for (const ln of lines) {
    if (ln.every < 10) continue;                                                                  // none standing on the curves
    const L = len(ln.pts);
    for (let s = 20 + rand() * 30; s < L - 12; s += 70 + rand() * 60) put(ln.pts, s, rand() < 0.5 ? 1 : -1, rand() < 0.45 ? 'open' : 'closed');
  }
  return out;
}
/** Hackney carriages at the kerbs (two of them at a rank on the Passeig), clear of the crossings and the tracks. */
function carriages(rand) {
  const out = [], half = (PITCH - BLOCK) / 2;
  const crossing = (x, z) => { const m = (v) => Math.abs(((v % PITCH) + PITCH) % PITCH - PITCH / 2); return m(x) < half + 3 && m(z) < half + 3; };
  const add = (x, z, rot) => { if (Math.hypot(x, z) > RADIUS - 45 || crossing(x, z) || onDiagonal(x, z, 6)) return; out.push({ t: 'carriage', at: [x, z], y: Y(x, z), rot, rect: Math.abs(Math.sin(rot)) > 0.5 ? [x - 2.6, z - 0.9, x + 2.6, z + 0.9] : [x - 0.9, z - 2.6, x + 0.9, z + 2.6], seed: Math.floor(rand() * 1e9) }); };
  // the rank on the Passeig's west side, facing down toward the old city
  for (const z of [-120, -112.5, 120, 127.5]) add(GRACIA_X - 5.6, z, Math.PI);
  // here and there in the cross streets and the streets, kept to the right
  for (let i = -4; i <= 4; i++) for (let k = -4; k <= 4; k++) {
    if (rand() > 0.22) continue;
    const ns = rand() < 0.5, c = (ns ? i : k) * PITCH + PITCH / 2, along = (ns ? k : i) * PITCH + (rand() - 0.5) * 40, dir = rand() < 0.5 ? 1 : -1;
    if (ns) { if (Math.abs(c - GRACIA_X) < 1 || Math.abs(c - PITCH * 2.5) < 1) continue; add(c + dir * 5.5, along, dir > 0 ? 0 : Math.PI); }
    else { if (Math.abs(c - PITCH / 2) < 1) continue; add(along, c - dir * 5.5, dir > 0 ? Math.PI / 2 : -Math.PI / 2); }
  }
  return out;
}

export async function town() {
  const els = blocks().filter((b) => b.special !== 'sagrada').map((b) => ({
    t: 'eixample_block', c: b.c, s: BLOCK, d: 18, ch: 12, y: height(...b.c), dz: (height(b.c[0], b.c[1] + 1) - height(b.c[0], b.c[1] - 1)) / 2, seed: b.seed,
    ...(b.special === 'pedrera' ? { cut: { corner: 3, a: 22, b: 22 } } : {}),
    ...(b.special === 'batllo' ? { gaps: [{ side: 1, s0: BATLLO.s0, s1: BATLLO.s1 }] } : {}),
  }));
  // in plans of a few blocks each, so that the town streams in pieces
  const plans = [];
  for (let i = 0; i < els.length; i += 6) plans.push(base(`barcelona-eixample-${i / 6}`, els.slice(i, i + 6)));
  const rand = rng(1910), lines = tramLines();
  plans.push(base('barcelona-trams', [...lines, ...trams(lines, rand)]));
  plans.push(base('barcelona-carriages', carriages(rand)));
  plans.push(base('barcelona-passeig', bancsFanals().map(([x, z], i) => ({ t: 'banc_fanal', at: [x, z], y: Y(x, z), rect: [x - 0.9, z - 2.3, x + 0.9, z + 2.3], seed: 1906 + i }))));
  return plans;
}

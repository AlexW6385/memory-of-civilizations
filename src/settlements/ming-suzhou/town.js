// The canal quarter round the garden (docs/settlements/ming-suzhou.md §6): streets of bluestone
// slabs beside the canals, houses of one and two storeys in rows — shops on the streets, homes
// with their backs on the water — granite canal walls with steps down to the water, humpbacked
// stone bridges, boats. Several plans (houses in their strips, the canals and streets), so that
// each builds in turn while the visitor already walks.

import { RADIUS, LEVEL, CANALS, STREETS, BRIDGES, lots, onBridge } from './layout.js';
import { northPlans } from './north.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const R = RADIUS - 26;                                  // the town stops where the ground fades out
/** Clip a rectangle to the disc of radius r (keeps the part whose middle line lies inside). */
function clip([x0, z0, x1, z1], r = R) {
  const horiz = x1 - x0 > z1 - z0;
  if (horiz) { const z = Math.max(Math.abs(z0), Math.abs(z1)); if (z >= r) return null; const h = Math.sqrt(r * r - z * z); return [Math.max(x0, -h), z0, Math.min(x1, h), z1]; }
  const x = Math.max(Math.abs(x0), Math.abs(x1)); if (x >= r) return null; const h = Math.sqrt(r * r - x * x); return [x0, Math.max(z0, -h), x1, Math.min(z1, h)];
}
const base = (id, elements) => ({ id, style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 65], facing: 'n' } });

/** The boats tied up at the landings (filled by waterways(), kept clear by the moving boats of riverLife()). */
const MOORED = [];
/** The public landings with no boat at them: { c (the bottom slab's middle), dir (toward the water) } (filled by waterways()). */
const LANDINGS = [];
/** The streets, the canals with their walls and water, the bridges, steps and boats. */
function waterways() {
  const E = [], rand = rng(1606);
  MOORED.length = 0; LANDINGS.length = 0;
  for (const s of STREETS) { const r = clip(s); if (r) E.push({ t: 'paving', rect: r, y: LEVEL.street + 0.04, th: 0.3 }); }
  for (const c of CANALS) {
    const r = clip(c, R - 2);
    if (!r) continue;
    E.push({ t: 'water_rect', rect: r, y: LEVEL.canal });
    const horiz = r[2] - r[0] > r[3] - r[1];
    // the walls along both banks, broken where another canal joins
    const sides = horiz ? [[[r[0], r[1]], [r[2], r[1]]], [[r[0], r[3]], [r[2], r[3]]]] : [[[r[0], r[1]], [r[0], r[3]]], [[r[2], r[1]], [r[2], r[3]]]];
    for (const [a, b] of sides) {
      // pieces of the wall between the openings of the canals that cross this bank
      let pieces = [[horiz ? a[0] : a[1], horiz ? b[0] : b[1]]];
      for (const o of CANALS) {
        if (o === c) continue;
        const [o0, o1] = horiz ? [o[0], o[2]] : [o[1], o[3]];
        const touches = horiz ? (o[1] <= a[1] + 0.5 && o[3] >= a[1] - 0.5) : (o[0] <= a[0] + 0.5 && o[2] >= a[0] - 0.5);
        if (!touches) continue;
        pieces = pieces.flatMap(([p0, p1]) => (o1 <= p0 || o0 >= p1 ? [[p0, p1]] : [[p0, o0], [o1, p1]].filter(([q0, q1]) => q1 - q0 > 0.5)));
      }
      const mid = [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
      for (const [p0, p1] of pieces) E.push({ t: 'canal_wall', a: horiz ? [p0, a[1]] : [a[0], p0], b: horiz ? [p1, a[1]] : [a[0], p1], y: LEVEL.street + 0.05, bed: LEVEL.canalBed, th: 0.7, water: LEVEL.canal, toward: mid, moor: 9 });
    }
    // landings down to the water every 25–40 m on the street side — a single flight along the wall or
    // two flights meeting at a slab, a mooring stone over it — and at some a boat tied up
    const len = horiz ? r[2] - r[0] : r[3] - r[1];
    for (let s = 12 + rand() * 10; s < len - 8; s += 25 + rand() * 15) {
      const at = (horiz ? r[0] : r[1]) + s, double = rand() < 0.45, hl = double ? 2.2 : 1.1;
      const p = horiz ? [at, r[1]] : [r[0] < 0 ? r[2] : r[0], at];
      if (onBridge(p[0], p[1], 3 + hl)) continue;
      const dir = horiz ? [0, 1] : [r[0] < 0 ? -1 : 1, 0], u = horiz ? [1, 0] : [0, 1];
      const face = horiz ? [at, r[1] + 0.35] : [r[0] < 0 ? r[2] - 0.35 : r[0] + 0.35, at];
      E.push({ t: 'water_steps', a: [face[0] - u[0] * hl, face[1] - u[1] * hl], b: [face[0] + u[0] * hl, face[1] + u[1] * hl], dir, y: LEVEL.street, water: LEVEL.canal, double, moor: true });
      if (rand() < 0.5 && Math.hypot(...face) < R - 14) {
        // the boat alongside the landing, its bow by the mooring stone, the rope to the stone's ring
        const bl = 6.5 + rand(), c = [face[0] + u[0] * (bl / 2 - 0.4) + dir[0] * 2.45, face[1] + u[1] * (bl / 2 - 0.4) + dir[1] * 2.45];
        const ring = [face[0] + dir[0] * 0.13, LEVEL.canal + 0.6, face[1] + dir[1] * 0.13];
        E.push({ t: 'boat', at: c, dir: u, len: bl, y: LEVEL.canal, moor: [ring[0], ring[1], ring[2]] });
        MOORED.push(c);
      } else {
        // the bottom slab's middle (a single flight runs down along u and leaves the slab at its far end)
        const m = double ? 0 : 0.6;
        LANDINGS.push({ c: [face[0] + u[0] * m + dir[0] * 0.5, face[1] + u[1] * m + dir[1] * 0.5], dir, u });
      }
    }
  }
  for (const b of BRIDGES) {
    if (Math.hypot(...b.at) > R - 6) continue;
    E.push({ t: 'ming_arch_bridge', at: b.at, across: b.across, span: b.span + 0.4, width: b.width, rise: 3.0, landing: 4.6, y: LEVEL.street + 0.04, water: LEVEL.canal, bed: LEVEL.canalBed });
  }
  return base('ming-suzhou-waterways', E);
}

/** The houses, in plans of a few hundred each (by quadrant). */
function houses() {
  const all = lots(), plans = [];
  // a few houses by the south street can be entered (DESIGN §4.3): the two shops and two homes nearest the way in
  const near = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2 - 60);
  const dry = all.filter((l) => !l.water && (l.front === 's' || l.front === 'n') && l.rect[2] - l.rect[0] > 3.6).sort((a, b) => near(a) - near(b));
  const open = new Set([...dry.filter((l) => l.shop).slice(0, 2), ...dry.filter((l) => !l.shop).slice(0, 2)]);
  const quads = [[], [], [], []];
  for (const l of all) {
    const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2;
    quads[(cx > 0 ? 1 : 0) + (cz > 0 ? 2 : 0)].push(l);
  }
  quads.forEach((q, i) => {
    const E = q.map((l) => ({ t: 'house_jiangnan', rect: l.rect, y: LEVEL.street, front: l.front, storeys: l.storeys, shop: l.shop, water: l.water, seed: l.seed, open: open.has(l) }));
    if (E.length) plans.push(base(`ming-suzhou-houses-${i}`, E));
  });
  return plans;
}

// ── the life of the canals and streets (docs/settlements/ming-suzhou.md §6) ──
const FR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const CLOTH = ['cloth_indigo', 'cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black'];
/** A lot's front: P(t, off) a point at fraction t along it, off out from it (negative: in); rot turns an object's +z outward. */
function frontOf(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, n = FR[f], along = f === 'n' || f === 's';
  const P = (t, off) => (along ? [x0 + (x1 - x0) * t, (f === 'n' ? z0 : z1) + n[1] * off] : [(f === 'e' ? x1 : x0) + n[0] * off, z0 + (z1 - z0) * t]);
  return { P, n, L: along ? x1 - x0 : z1 - z0, rot: Math.atan2(n[0], n[1]) };
}
/**
 * Shops with their banners, lanterns and goods on the counters, shopkeepers and customers; tea
 * tables out in front; washing on bamboo poles out of the upper windows over the water; women
 * washing at the steps; boats with their boatmen at the sculling oar, cargo and passengers; people
 * along the streets with shoulder poles and baskets, knots talking, old men on benches by the water.
 */
function riverLife() {
  const L = [], M = [], rand = rng(1533), pick = (a) => a[Math.floor(rand() * a.length)];
  const person = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.6 ? 'robe' : 'trousers', cloth: pick(CLOTH), cloth2: pick(CLOTH), skin: rand() < 0.7 ? 'skin_light' : 'skin_medium', hat: pick(['none', 'none', 'cap', 'straw']), carry: 'none', ...extra });
  const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  const inDisc = ([x, z], m = 30) => Math.hypot(x, z) < R - m;
  for (const l of lots()) {
    const F = frontOf(l), out = F.n, y = LEVEL.street;
    if (!inDisc(F.P(0.5, 0))) continue;
    if (l.shop) {
      // the banner at one end of the front, a pair of lanterns under the eave
      if (rand() < 0.8) { const t = rand() < 0.5 ? 0.1 : 0.9; L.push({ t: 'shop_sign', at: F.P(t, -0.6), y, rot: F.rot, h: 2.75, len: 1.1 + rand() * 0.6, cloth: pick(['cloth_indigo', 'cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_black']), seed: Math.floor(rand() * 1e9) }); }
      if (rand() < 0.65) for (const t of [0.3, 0.7]) L.push({ t: 'hang_lantern', at: F.P(t, -0.15), y: y + 2.95, rot: F.rot, kind: rand() < 0.8 ? 'paper' : 'white', seed: 1 });
      // goods on the counter: jars, baskets, cloth
      const ware = pick(['jar', 'basket', 'mixed', 'sacks']);
      for (let k = 0; k < 4; k++) { const t = 0.2 + k * 0.2 + (rand() - 0.5) * 0.06; const kind = ware === 'jar' || (ware === 'mixed' && k % 2) ? 'pot' : ware === 'sacks' ? 'sacks' : 'basket'; L.push({ t: kind, at: F.P(t, -0.66), y: y + 1.4, rot: rand() * 6.28, s: 0.6, kind: kind === 'pot' ? pick(['glazed_jar', 'blue_jar', 'water_pot']) : undefined, seed: Math.floor(rand() * 1e9) }); }
      if (rand() < 0.55) person(F.P(0.35 + rand() * 0.3, -1.5), y + 0.45, faceTo(out), { pose: 'stand' });
      if (rand() < 0.45 && !l.water) person(F.P(0.3 + rand() * 0.4, 0.75), y, faceTo([-out[0], -out[1]]), { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' });
      // a tea table out in front (the street is 6 m wide), people sitting at it
      if (!l.water && rand() < 0.22) {
        const c = F.P(0.5, 2.0); L.push({ t: 'tea_table', at: c, c, r: 1.1, y, rot: F.rot, seed: Math.floor(rand() * 1e9) });
        for (const [dx, dz] of [[0.85, 0], [-0.85, 0], [0, 0.85]]) if (rand() < 0.7) { const p = [c[0] + dx, c[1] + dz]; person(p, y, faceTo([-dx, -dz]), { pose: 'sit', dress: 'robe' }); }
      }
    } else if (!l.water) {
      if (rand() < 0.3) L.push({ t: 'drying_tray', at: F.P(0.2 + rand() * 0.6, 0.7), y, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
      if (rand() < 0.2) L.push({ t: 'hang_lantern', at: F.P(0.5, -0.15), y: y + 2.95, rot: F.rot, kind: 'white', seed: 2 });
    }
    // washing out of an upper window: over the water behind the waterside houses, over the lanes on a few others
    if (l.storeys > 1 && rand() < (l.water ? 0.45 : 0.12)) L.push({ t: 'laundry_pole', at: F.P(0.25 + rand() * 0.5, -0.5), y: y + 4.2, rot: F.rot, len: l.water ? 2.2 + rand() * 0.6 : 1.4, prop: false, seed: Math.floor(rand() * 1e9) });
    // the waterside houses: their own steps down to the water, someone washing at the bottom
    if (l.water && rand() < 0.3) {
      const t = 0.5, w = 1.0 / F.L, a = F.P(t - w, 0.35), b = F.P(t + w, 0.35);
      M.push({ t: 'water_steps', a, b, dir: out, y, water: LEVEL.canal });
      if (rand() < 0.7) { const p = F.P(t + (rand() - 0.5) * w, 0.35 + 1.44); person(p, y - 0.6, faceTo(out), { pose: 'squat', dress: 'robe', cloth: pick(['cloth_indigo', 'cloth_white', 'cloth_grey']), hat: 'none' }); L.push({ t: 'basket', at: F.P(t + w * 0.8, 0.35 + 0.8), y: y - 0.3, rot: 0, s: 0.8, seed: Math.floor(rand() * 1e9) }); }
    }
  }
  // the public landings with no boat: women washing at the bottom slab — squatting at the water's
  // edge to rinse, a basket of washing beside, now and then one beating the cloth with a paddle on
  // the stone, a neighbour coming down the steps or waiting at the top with her basket
  for (const g of LANDINGS) {
    if (!inDisc(g.c) || rand() < 0.3) continue;
    const yS = LEVEL.canal + 0.14, n = rand() < 0.45 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const off = (k - (n - 1) / 2) * 0.9, p = [g.c[0] + g.u[0] * off + g.dir[0] * 0.2, g.c[1] + g.u[1] * off + g.dir[1] * 0.2];
      person(p, yS, faceTo(g.dir), { pose: 'squat', dress: 'robe', cloth: pick(['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_indigo']), hat: 'none' });
    }
    L.push({ t: 'basket', at: [g.c[0] - g.u[0] * (n * 0.45 + 0.35) - g.dir[0] * 0.15, g.c[1] - g.u[1] * (n * 0.45 + 0.35) - g.dir[1] * 0.15], y: yS, rot: rand() * 6.28, s: 0.8, seed: Math.floor(rand() * 1e9) });
    if (rand() < 0.35) person([g.c[0] - g.dir[0] * 1.6 + g.u[0] * 1.2, g.c[1] - g.dir[1] * 1.6 + g.u[1] * 1.2], LEVEL.street, faceTo(g.dir), { pose: 'stand', dress: 'robe', carry: 'basket', hat: 'none' });
  }
  // the boats: along each canal, some moving with the boatman at the oar, some moored with cargo
  for (const c of CANALS) {
    const r = clip(c, R - 8);
    if (!r) continue;
    const horiz = r[2] - r[0] > r[3] - r[1], len = horiz ? r[2] - r[0] : r[3] - r[1], mid = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
    for (let s0 = 15 + rand() * 15; s0 < len - 12; s0 += 22 + rand() * 30) {
      const a = (horiz ? r[0] : r[1]) + s0, lane = (rand() < 0.5 ? -1 : 1) * (0.9 + rand() * 0.9), at = horiz ? [a, mid + lane] : [mid + lane, a];
      if (onBridge(at[0], at[1], 6) || MOORED.some((m) => Math.hypot(m[0] - at[0], m[1] - at[1]) < 9)) continue;
      const fwd = rand() < 0.5 ? 1 : -1, rot = horiz ? (fwd > 0 ? Math.PI / 2 : -Math.PI / 2) : (fwd > 0 ? 0 : Math.PI), Lb = 6 + rand() * 1.8, yw = LEVEL.canal - 0.25;
      L.push({ t: 'boat', kind: 'sampan', at, c: at, r: Lb / 2, y: yw, rot, len: Lb, seed: Math.floor(rand() * 1e9) });
      const dir = [Math.sin(rot), Math.cos(rot)], stern = [at[0] + dir[0] * Lb * 0.43, at[1] + dir[1] * Lb * 0.43];
      // the boatman standing at the stern, the oar out behind
      person(stern, yw + 0.28, faceTo([-dir[0], -dir[1]]) + (rand() - 0.5) * 0.6, { dress: 'trousers', hat: rand() < 0.6 ? 'straw' : 'none', cloth: pick(['cloth_indigo', 'cloth_grey', 'cloth_brown']) });
      L.push({ t: 'oar', at: [stern[0] + dir[0] * 0.2, stern[1] + dir[1] * 0.2], y: yw + 0.3, rot: rot + Math.PI, seed: 3 });
      // cargo amidships, or a passenger sitting under the awning
      const k = rand();
      const amid = (f) => [at[0] - dir[0] * Lb * f, at[1] - dir[1] * Lb * f];
      if (k < 0.35) for (let q = 0; q < 3; q++) L.push({ t: 'pot', kind: pick(['glazed_jar', 'water_pot', 'dark_pot']), at: amid(0.05 + q * 0.12), y: yw + 0.15, rot: rand() * 6.28, s: 0.8, seed: Math.floor(rand() * 1e9) });
      else if (k < 0.6) for (let q = 0; q < 2; q++) L.push({ t: 'sacks', at: amid(0.05 + q * 0.18), y: yw + 0.15, rot: rot, seed: Math.floor(rand() * 1e9) });
      else if (k < 0.8) for (let q = 0; q < 3; q++) L.push({ t: 'basket', at: amid(-0.05 + q * 0.12), y: yw + 0.15, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
      else person(amid(0.2), yw + 0.15, faceTo(dir), { pose: 'sit', dress: 'robe', hat: 'cap' });
    }
  }
  // the streets: people walking (some with loads on shoulder poles), knots talking; benches by the water under the willows
  for (const st of STREETS.slice(0, 3)) {
    const r = clip(st);
    if (!r) continue;
    const horiz = r[2] - r[0] > r[3] - r[1], len = horiz ? r[2] - r[0] : r[3] - r[1];
    for (let s0 = 4 + rand() * 4; s0 < len - 4; s0 += 5 + rand() * 7) {
      const a = (horiz ? r[0] : r[1]) + s0, off = (rand() - 0.5) * 3, cen = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2, p = horiz ? [a, cen + off] : [cen + off, a];
      if (!inDisc(p) || onBridge(p[0], p[1], 3)) continue;
      const kind = rand(), along = horiz ? [rand() < 0.5 ? 1 : -1, 0] : [0, rand() < 0.5 ? 1 : -1];
      if (kind < 0.5) person(p, LEVEL.street, faceTo(along), { carry: pick(['pole', 'pole', 'basket', 'none', 'none', 'none']) });
      else if (kind < 0.72) { const a0 = rand() * 6.28; for (let q = 0; q < 2; q++) { const aa = a0 + q * Math.PI, pp = [p[0] + Math.cos(aa) * 0.5, p[1] + Math.sin(aa) * 0.5]; person(pp, LEVEL.street, Math.atan2(pp[0] - p[0], pp[1] - p[1]), { pose: q ? 'stand' : 'talk' }); } }
      else if (kind < 0.8) L.push({ t: 'animal', kind: 'dog', at: p, y: LEVEL.street, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
      else if (kind < 0.86) L.push({ t: 'chickens', at: p, y: LEVEL.street, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
      else if (kind < 0.93) L.push({ t: 'barrow', at: p, y: LEVEL.street, rot: horiz ? Math.PI / 2 : 0, seed: Math.floor(rand() * 1e9) });
    }
    // benches on the canal side of the street, old men sitting
    for (let s0 = 10 + rand() * 10; s0 < len - 6; s0 += 30 + rand() * 25) {
      const a = (horiz ? r[0] : r[1]) + s0, edge = horiz ? r[3] - 0.7 : (r[0] < 0 ? r[0] + 0.7 : r[2] - 0.7), p = horiz ? [a, edge] : [edge, a];
      if (!inDisc(p) || onBridge(p[0], p[1], 4)) continue;
      L.push({ t: 'bench', at: p, y: LEVEL.street, rot: horiz ? 0 : Math.PI / 2, seed: Math.floor(rand() * 1e9) });
      const tow = horiz ? [0, -1] : [r[0] < 0 ? 1 : -1, 0];
      for (const q of [-0.4, 0.4]) if (rand() < 0.75) person(horiz ? [p[0] + q, p[1]] : [p[0], p[1] + q], LEVEL.street, faceTo(tow), { pose: 'sit', dress: 'robe', cloth: pick(['cloth_grey', 'cloth_indigo', 'cloth_black']), hat: pick(['cap', 'none']) });
    }
  }
  const tiles = new Map();
  for (const e of L) { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  const plans = [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`ming-suzhou-riverlife-${k}`, list), style: 'life', center: [i * 100 + 50, j * 100 + 50], near: 230 }; });
  if (M.length) plans.push(base('ming-suzhou-house-steps', M));
  return plans;
}

export async function town() {
  return [waterways(), ...houses(), ...riverLife(), ...northPlans()];
}

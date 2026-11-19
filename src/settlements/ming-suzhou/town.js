// The canal quarter round the garden (docs/settlements/ming-suzhou.md §6): streets of bluestone
// slabs beside the canals, houses of one and two storeys in rows — shops on the streets, homes
// with their backs on the water — granite canal walls with steps down to the water, humpbacked
// stone bridges, boats. Several plans (houses in their strips, the canals and streets), so that
// each builds in turn while the visitor already walks.

import { RADIUS, LEVEL, CANALS, STREETS, BRIDGES, lots, onBridge } from './layout.js';
import { northPlans } from './north.js';
import { upOf, faceOf, frameOf, layoutOf, doorGap, shopkeeperAt } from './uphouses.js';
import './style.js';
import './townwork.js';
import './quaywork.js';
import { bridgeLamps } from './lamps.js';
import { prepareTown, frontOf, HOUSE_TRADE } from './shopprep.js';
import { walkSet, walkElement, analyse } from './openwalk.js';
import './walkfront.js';
import { streetHalos } from './nightlight.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const R = RADIUS - 26;                                  // the street life stops here (the people are drawn near)
// the figure builder on master knows cap 'ming' and hair 'netknot'; this branch's does not yet (set true after the merge)
const CAP_MING = true;
const RS = RADIUS - 8, RC = RADIUS - 15;               // the streets and lanes run on to the rim; the canals, whose bed the fading ground would lift, to RC
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
  // the streets, each cut by those before it (no two pavings lie over each other)
  const done = [];
  const minus = (r, o) => {
    if (o[0] >= r[2] || o[2] <= r[0] || o[1] >= r[3] || o[3] <= r[1]) return [r];
    const out = [];
    if (o[1] > r[1]) out.push([r[0], r[1], r[2], o[1]]);
    if (o[3] < r[3]) out.push([r[0], o[3], r[2], r[3]]);
    const z0 = Math.max(r[1], o[1]), z1 = Math.min(r[3], o[3]);
    if (o[0] > r[0]) out.push([r[0], z0, o[0], z1]);
    if (o[2] < r[2]) out.push([o[2], z0, r[2], z1]);
    return out.filter((q) => q[2] - q[0] > 0.05 && q[3] - q[1] > 0.05);
  };
  for (const s of STREETS) {
    const r = clip(s, RS);
    if (!r) continue;
    let pieces = [r];
    for (const o of done) pieces = pieces.flatMap((q) => minus(q, o));
    for (const q of pieces) { E.push({ t: 'paving', rect: q, y: LEVEL.street + 0.04, th: 0.3 }); if (Math.max(q[2] - q[0], q[3] - q[1]) > 8 && Math.min(q[2] - q[0], q[3] - q[1]) > 1.8) E.push({ t: 'street_wear', rect: q, y: LEVEL.street + 0.04 }); }
    done.push(r);
  }
  for (const c of CANALS) {
    const r = clip(c, RC);
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
      if (rand() < 0.5 && Math.hypot(...face) < RC - 14) {
        // the boat alongside the landing, its bow by the mooring stone, the rope to the stone's ring
        const bl = 6.5 + rand(), c = [face[0] + u[0] * (bl / 2 - 0.4) + dir[0] * 2.45, face[1] + u[1] * (bl / 2 - 0.4) + dir[1] * 2.45];
        const ring = [face[0] + dir[0] * 0.13, LEVEL.canal + 0.6, face[1] + dir[1] * 0.13];
        E.push({ t: 'boat', at: c, dir: u, len: bl, y: LEVEL.canal, moor: [ring[0], ring[1], ring[2]] });
        MOORED.push(Object.assign(c, { u, len: bl }));
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
  return { ...base('ming-suzhou-waterways', E), style: 'suzhou-quarter' };
}

/** The houses, in plans by quadrant and by how rich their detail is (so that the far, cheap ones cull apart from the near). */
function houses() {
  const all = lots(), plans = [];
  // a few houses by the south street can be entered (DESIGN §4.3): the six shops, three homes and the climbable houses (shopprep.js)
  const open = prepareTown(); openLots = open;
  const ups = all.filter((l) => upOf(l));
  const quads = [[], [], [], [], [], [], [], []];
  for (const l of all) {
    if (upOf(l)) continue;
    const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2;
    quads[(cx > 0 ? 1 : 0) + (cz > 0 ? 2 : 0) + (l.detail > 0 ? 0 : 4)].push(l);
  }
  quads.forEach((q, i) => {
    const E = q.map((l) => (walkSet().has(l) ? { ...walkElement(l, walkSet().get(l)), t: 'house_walk' } : { t: 'house_jiangnan', rect: l.rect, y: LEVEL.street, front: l.front, storeys: l.storeys, shop: l.shop, trade: HOUSE_TRADE[l.trade] || l.trade, water: l.water, seed: l.seed, open: open.has(l), kind: l.kind, roof: l.roof, detail: l.detail, overhang: l.overhang, balcony: l.balcony, tone: l.tone }));
    if (E.length) plans.push({ ...base(`ming-suzhou-houses-${i}`, E), style: 'suzhou-quarter' });
  });
  plans.push(...walkPlans());
  // the climbable houses, west and east of the way in, each side one plan with its own bounds (drawn only where they are near):
  // the first sixteen by the south street, and the houses added after them (uphouses.js NEXT) about the quarter
  for (const [name, test] of [['w', (l) => l.rect[0] < 0], ['e', (l) => l.rect[0] > 0]]) {
    const mine = ups.filter(test);
    if (!mine.length) continue;
    const E = mine.map((l) => { const u = upOf(l); return { t: 'house_up', rect: l.rect, y: LEVEL.street, front: faceOf(l, u), use: u.use, Hf: u.Hf, Hu: u.Hu, mir: !!u.mir, water: !!u.flip, seed: l.seed, roof: l.roof, tone: l.tone }; });
    const xs = mine.flatMap((l) => [l.rect[0], l.rect[2]]), zs = mine.flatMap((l) => [l.rect[1], l.rect[3]]);
    plans.push({ ...base(`ming-suzhou-houses-up-${name}`, E), style: 'suzhou-town', bounds: [Math.min(...xs) - 3, Math.min(...zs) - 3, Math.max(...xs) + 3, Math.max(...zs) + 8] });
  }
  return plans;
}

// ── the opened lots of the walk (openwalk.js, walkfront.js) ──
const WALK_CELL = 36, WALK_NEAR = 58;                  // m: the cells the lots are planned in; the interiors and goods exist within this of a cell middle (a lot is near from 33 m)
/** The walk's lots by cell: Map 'i,j' → [[lot, s]]. */
function walkCells() {
  const cells = new Map();
  for (const [l, s] of walkSet()) {
    const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2, k = `${Math.floor(cx / WALK_CELL)},${Math.floor(cz / WALK_CELL)}`;
    if (!cells.has(k)) cells.set(k, []);
    cells.get(k).push([l, s]);
  }
  return cells;
}
/**
 * Per cell, the near plan (the open front, the rooms, their fittings and colliders), the far plan (one dark board where the front is cut: one material) and
 * the shopkeepers (the street life's own figures) behind the counters; the shells themselves are in the houses' plans (house_walk).
 */
function walkPlans() {
  const plans = [];
  for (const [k, list] of walkCells()) {
    const [i, j] = k.split(',').map(Number), center = [i * WALK_CELL + WALK_CELL / 2, j * WALK_CELL + WALK_CELL / 2];
    plans.push({ ...base(`ming-suzhou-walk-${k}`, list.map(([l, s]) => ({ ...walkElement(l, s), t: 'floor_near', keeper: s.type === 'shop' ? walkKeeper(l) : undefined }))), style: 'suzhou-quarter', near: WALK_NEAR, center });
    // (and the doorway lanes: a rectangle each that the street-life pass of src/objects/life.js reads as a footprint, so that none of its people, animals or things is put in one)
    const lanes = laneList().filter((ln) => list.some(([l]) => l === ln.lot)).map((ln) => {
      const c = [[-1.0, -0.2], [1.0, -0.2], [-1.0, 3.4], [1.0, 3.4]].map(([a, o]) => [ln.p[0] + ln.u[0] * a + ln.n[0] * o, ln.p[1] + ln.u[1] * a + ln.n[1] * o]);
      return { t: 'door_clear', rect: [Math.min(...c.map((q) => q[0])), Math.min(...c.map((q) => q[1])), Math.max(...c.map((q) => q[0])), Math.max(...c.map((q) => q[1]))] };
    });
    plans.push({ ...base(`ming-suzhou-walk-${k}-far`, [...list.map(([l, s]) => ({ ...walkElement(l, s), t: 'floor_far' })), ...lanes]), style: 'suzhou-quarter', far: WALK_NEAR, center, nocollide: true });
  }
  return plans;
}
/** The shopkeeper: behind the counter, standing, facing the street (from the lot's own seed). He is built into the shop's near plan with the street life's figure
 *  builder, not placed in the street life: its figures are drawn within 170 m wherever they stand, and these are only wanted inside the shops. */
function walkKeeper(l) {
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const r = rng((l.seed ^ 0x5bd1e995) >>> 0), F = frameOf(l.rect, false, l.front), lay = layoutOf(F.L), cEnd = lay.dc - 0.7;
  const a = Math.max(0.9, cEnd * 0.5), p = F.at(a, 1.15), q = F.at(a, 0.15);
  const e = { t: 'figure', at: p, y: LEVEL.street + 0.45, rot: Math.atan2(-(q[0] - p[0]), -(q[1] - p[1])), seed: Math.floor(r() * 1e9), dress: r() < 0.7 ? 'robe' : 'trousers', cloth: pick(r, CLOTH), cloth2: pick(r, CLOTH), skin: r() < 0.7 ? 'skin_light' : 'skin_medium', hat: pick(r, ['none', 'none', 'cap']), carry: 'none', pose: 'stand' };
  if (CAP_MING && e.hat === 'cap') e.cap = 'ming';
  if (CAP_MING) e.hair = 'netknot';
  return e;
}

/** The doorways of the walk's lots, each { p (on the lot's front line), n (out into the street), u (along the front) }. */
let LANES = null;
function laneList() {
  if (LANES) return LANES;
  const out = [];
  for (const [l, s] of walkSet()) {
    const F = frameOf(l.rect, false, l.front), dc = s.type === 'shop' ? layoutOf(F.L).dc : (analyse(walkElement(l, s)).dc ?? F.L / 2);
    out.push({ p: F.at(dc, 0), n: { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[l.front], u: F.u, lot: l });
  }
  return (LANES = out);
}
const MOVABLE = { figure: 0.4, animal: 0.4, chickens: 0.4, barrow: 0.8, drying_tray: 0.4, hang_lantern: 0.3, suzhou_lamp: 0.35 };    // (what stands or hangs in a door lane, and how far its clear space reaches)
/**
 * Keep the street life out of the doorways of the walk's lots: what stands or hangs in the lane in front of a door (1.3 m either side, out to the middle of the
 * street) moves along the street to its edge (a tea table with its sitters as one). Nothing is dropped and nothing is drawn from the stream.
 */
function clearLanes(L) {
  const lanes = laneList();
  const shift = (at, r) => {
    let q = at;
    for (let pass = 0; pass < 4; pass++) {
      let moved = false;
      for (const ln of lanes) {
        const dx = q[0] - ln.p[0], dz = q[1] - ln.p[1], out = dx * ln.n[0] + dz * ln.n[1], al = dx * ln.u[0] + dz * ln.u[1];
        if (out < -0.3 || out > 3.8 || Math.abs(al) >= 1.3 + r) continue;
        const sg = al > 0.05 ? 1 : al < -0.05 ? -1 : (Math.round(ln.p[0] * 7 + ln.p[1] * 3) & 1 ? 1 : -1), al2 = sg * (1.36 + r);
        q = [ln.p[0] + ln.n[0] * out + ln.u[0] * al2, ln.p[1] + ln.n[1] * out + ln.u[1] * al2]; moved = true;
      }
      if (!moved) break;
    }
    return q;
  };
  const done = new Set();
  for (const e of L) {
    if (e.t !== 'tea_table') continue;
    const q = shift(e.at, 1.1), d = [q[0] - e.at[0], q[1] - e.at[1]];
    if (!d[0] && !d[1]) continue;
    for (const f of L) if (f !== e && f.t === 'figure' && !done.has(f) && Math.hypot(f.at[0] - e.at[0], f.at[1] - e.at[1]) < 1.35) { f.at = [f.at[0] + d[0], f.at[1] + d[1]]; done.add(f); }
    e.at = q; if (e.c) e.c = q;
  }
  for (const e of L) {
    if (!(e.t in MOVABLE) || done.has(e) || (e.t === 'figure' && (e.y ?? 0) > LEVEL.street + 0.2)) continue;
    e.at = shift(e.at, MOVABLE[e.t]);
  }
}

/** The doorways of the walk's lots that fall in a shop's front (the front's own frame: x east of its middle for a south front, as doorGap), each with a 0.95 m reach either side. */
function walkGaps(l, F) {
  const out = [], n = F.n, t = [-n[1], n[0]], m = F.P(0.5, 0);      // (the along axis of the shop element: x = (p − m) rotated by its rot, as doorGap)
  const rot = F.rot, cs = Math.cos(rot), sn = Math.sin(rot);
  for (const ln of laneList()) {
    const dx = ln.p[0] - m[0], dz = ln.p[1] - m[1], o = dx * n[0] + dz * n[1];
    if (Math.abs(o) > 1.5 || ln.n[0] !== n[0] || ln.n[1] !== n[1]) continue;
    const x = dx * cs - dz * sn;
    if (x > -F.L / 2 - 1.2 && x < F.L / 2 + 1.2) out.push([x - 0.95, x + 0.95]);
  }
  void t;
  return out.length ? out : undefined;
}
// ── the life of the canals and streets (docs/settlements/ming-suzhou.md §6) ──
const FR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const CLOTH = ['cloth_indigo', 'cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black'];
/**
 * Shops with their banners, lanterns and goods on the counters, shopkeepers and customers; tea
 * tables out in front; washing on bamboo poles out of the upper windows over the water; women
 * washing at the steps; boats with their boatmen at the sculling oar, cargo and passengers; people
 * along the streets with shoulder poles and baskets, knots talking, old men on benches by the water.
 */
function riverLife() {
  const L = [], M = [], rand = rng(1533), pick = (a) => a[Math.floor(rand() * a.length)];
  const person = (at, y, rot, extra = {}) => {
    const { woman, ...rest } = extra;
    const e = { t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.6 ? 'robe' : 'trousers', cloth: pick(CLOTH), cloth2: pick(CLOTH), skin: rand() < 0.7 ? 'skin_light' : 'skin_medium', hat: pick(['none', 'none', 'cap', 'straw']), carry: 'none', ...rest };
    if (CAP_MING && e.hat === 'cap') e.cap = 'ming';            // the Ming scholar's square cap
    if (CAP_MING && !woman) e.hair = 'netknot';                 // the Ming man's topknot with its net band (women keep their own hair)
    L.push(e);
  };
  const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  const inDisc = ([x, z], m = 30) => Math.hypot(x, z) < R - m;
  for (const l of lots()) {
    const F = frontOf(l), out = F.n, y = LEVEL.street, n0 = L.length, uhouse = upOf(l);
    if (!inDisc(F.P(0.5, 0)) || l.kind === 'yard') continue;
    if (l.shop0) {
      // (the banner, the name board and the goods are the shop front's own: shops.js; the draws stay, so that the life keeps its places)
      if (rand() < 0.8) { rand(); if (!({ cloth: 1, tea: 1, rice: 1, medicine: 1, lacquer: 1, books: 1 })[l.trade0 || l.trade]) rand(); rand(); rand(); rand(); }
      const rail = ['cloth', 'medicine', 'fans', 'food'].includes(l.trade);
      if (rand() < 0.9) for (const t of [0.3, 0.7]) { rand(); if (!rail) L.push({ t: 'hang_lantern', at: F.P(t, -0.15), y: y + 2.95, rot: F.rot, kind: 'paper', seed: 1 }); }
      const ware = ({ tea: 'jar', medicine: 'jar', rice: 'sacks' })[l.trade0 || l.trade] || pick(['jar', 'basket', 'mixed', 'sacks']);
      if (l.detail < 2 || ware === 'sacks') for (let k = 0; k < 4; k++) { rand(); rand(); rand(); rand(); }
      if (rand() < 0.55 && openLots.has(l)) { const sp = F.P(0.35 + rand() * 0.3, -1.5), uh = upOf(l); person(uh ? shopkeeperAt(l, uh) : sp, y + 0.45, faceTo(out), { pose: 'stand' }); }   // (the shopkeeper: seen only in the open shops)
      if (rand() < 0.45 && !l.water) person(F.P(0.3 + rand() * 0.4, 1.5), y, faceTo([-out[0], -out[1]]), { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' });
      // a tea table out in front (the street is 6 m wide), people sitting at it
      if (!l.water && rand() < 0.22) {
        const c = F.P(0.5, 2.4); L.push({ t: 'tea_table', at: c, c, r: 1.1, y, rot: F.rot, seed: Math.floor(rand() * 1e9) });
        for (const [dx, dz] of [[0.85, 0], [-0.85, 0], [0, 0.85]]) if (rand() < 0.7) { const p = [c[0] + dx, c[1] + dz]; person(p, y, faceTo([-dx, -dz]), { pose: 'sit', dress: 'robe' }); }
      }
    } else if (!l.water) {
      if (rand() < 0.3 && !l.shop) L.push({ t: 'drying_tray', at: F.P(0.2 + rand() * 0.6, 0.7), y, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
      if (rand() < 0.5 && !l.shop) L.push({ t: 'hang_lantern', at: F.P(0.5, -0.15), y: y + 2.95, rot: F.rot, kind: 'white', seed: 2 });
    }
    // washing out of an upper window: over the water behind the waterside houses, over the lanes on a few others
    // (the first sixteen's houses draw nothing here; the later ones draw as before, so that the stream keeps its places, and put out the pole)
    if (l.storeys > 1 && rand() < (l.water ? 0.45 : 0.12) && !(uhouse && !uhouse.fresh)) { const pole = { t: 'laundry_pole', at: F.P(0.25 + rand() * 0.5, -0.5), y: y + 4.2, rot: F.rot, len: l.water ? 2.2 + rand() * 0.6 : 1.4, prop: false, seed: Math.floor(rand() * 1e9) }; if (!uhouse) L.push(pole); }
    // the waterside houses: their own steps down to the water, someone washing at the bottom
    if (l.water && rand() < 0.3) {
      const t = 0.5, w = 1.0 / F.L, a = F.P(t - w, 0.35), b = F.P(t + w, 0.35);
      if (!uhouse) M.push({ t: 'water_steps', a, b, dir: out, y, water: LEVEL.canal });     // (a climbable house has its own, from its back door: upstairs.js)
      if (rand() < 0.7) { const p = F.P(t + (rand() - 0.5) * w, 0.35 + 1.44); person(p, y - 0.6, faceTo(out), { pose: 'squat', dress: 'robe', cloth: pick(['cloth_indigo', 'cloth_white', 'cloth_grey']), hat: 'none', woman: true }); L.push({ t: 'basket', at: F.P(t + w * 0.8, 0.35 + 0.8), y: y - 0.3, rot: 0, s: 0.8, seed: Math.floor(rand() * 1e9) }); }
    }
    // (a climbable house keeps its doorway clear: of what the street life put before it only the lanterns and the shopkeeper stay)
    if (uhouse) { const keep = L.splice(n0).filter((e) => e.t === 'hang_lantern' || (e.t === 'figure' && e.y > y + 0.2)); L.push(...keep); }
    // the tall drum lantern over the door of the tea house and inn, and of some tea and wine shops and eating places (by the lot's own seed, no draw of the stream)
    if (l.shop0 && !l.water && (uhouse?.use === 'inn' || (['tea', 'wine', 'food'].includes(l.trade0 || l.trade) && ((l.seed * 2654435761) >>> 0) % 100 < 55))) L.push({ t: 'suzhou_lamp', kind: 'inn', at: F.P(0.5, 0.12), y: y + 3.25, rot: F.rot });
  }
  // the public landings with no boat: women washing at the bottom slab — squatting at the water's
  // edge to rinse, a basket of washing beside, now and then one beating the cloth with a paddle on
  // the stone, a neighbour coming down the steps or waiting at the top with her basket
  for (const g of LANDINGS) {
    if (!inDisc(g.c) || rand() < 0.3) continue;
    const yS = LEVEL.canal + 0.14, n = rand() < 0.45 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const off = (k - (n - 1) / 2) * 0.9, p = [g.c[0] + g.u[0] * off + g.dir[0] * 0.2, g.c[1] + g.u[1] * off + g.dir[1] * 0.2];
      person(p, yS, faceTo(g.dir), { pose: 'squat', dress: 'robe', cloth: pick(['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_indigo']), hat: 'none', woman: true });
    }
    L.push({ t: 'basket', at: [g.c[0] - g.u[0] * (n * 0.45 + 0.35) - g.dir[0] * 0.15, g.c[1] - g.u[1] * (n * 0.45 + 0.35) - g.dir[1] * 0.15], y: yS, rot: rand() * 6.28, s: 0.8, seed: Math.floor(rand() * 1e9) });
    if (rand() < 0.35) person([g.c[0] - g.dir[0] * 1.6 + g.u[0] * 1.2, g.c[1] - g.dir[1] * 1.6 + g.u[1] * 1.2], LEVEL.street, faceTo(g.dir), { pose: 'stand', dress: 'robe', carry: 'basket', hat: 'none', woman: true });
  }
  // quay life that needs no draw of the stream's own (its places come of the landing's and the boat's own place): the load on every moored boat's
  // fore deck and the water pots and a basket aft, the washing hung out beside some landings, and a few wells on the streets
  const hh = (a, b, c = 0) => { let h = (Math.imul(Math.round(a * 31), 374761393) + Math.imul(Math.round(b * 31), 668265263) + Math.imul(c + 1, 2147483647)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  for (const c of MOORED) {
    if (!inDisc(c, 12)) continue;
    const u = c.u, bl = c.len, rot = Math.atan2(u[0], u[1]), deckAt = (f) => LEVEL.canal + 0.5 + 0.32 * Math.pow(Math.abs(f * bl) / (bl / 2), 2.2) - 0.06;
    const pAt = (f, o = 0) => [c[0] + u[0] * f * bl - u[1] * o, c[1] + u[1] * f * bl + u[0] * o];
    const kind = Math.floor(hh(c[0], c[1], 1) * 4), sd = Math.floor(hh(c[0], c[1], 2) * 1e9);
    if (kind === 0) L.push({ t: 'pot', kind: 'dark_pot', n: 5, at: pAt(-0.37), y: deckAt(-0.37), rot, s: 1.1, seed: sd });
    else if (kind === 1) L.push({ t: 'sacks', n: 5, at: pAt(-0.37), y: deckAt(-0.37), rot, seed: sd });
    else if (kind === 2) L.push({ t: 'crates', n: 3, at: pAt(-0.37, 0.4), y: deckAt(-0.37), rot, seed: sd });
    else L.push({ t: 'basket', n: 3, goods: 'cloth_white', at: pAt(-0.37), y: deckAt(-0.37), rot, s: 1.3, seed: sd });
    L.push({ t: 'pot', kind: 'dark_pot', n: 2, at: pAt(0.36, 0.45), y: deckAt(0.36), rot: 0, s: 0.9, seed: sd + 1 });
    L.push({ t: 'basket', n: 1, at: pAt(0.33, -0.5), y: deckAt(0.33), rot: 0, s: 0.9, seed: sd + 2 });
  }
  // the washing hung out on poles along the quay beside the public landings (not over the steps; two in five)
  for (const g of LANDINGS) {
    if (!inDisc(g.c, 20) || hh(g.c[0], g.c[1], 3) > 0.4) continue;
    const side = hh(g.c[0], g.c[1], 4) < 0.5 ? -1 : 1, d = [-g.dir[0], -g.dir[1]], at = [g.c[0] + g.u[0] * side * 4.6 + d[0] * 2.3, g.c[1] + g.u[1] * side * 4.6 + d[1] * 2.3];
    L.push({ t: 'laundry', at, y: LEVEL.street, rot: Math.atan2(g.u[0], g.u[1]) + Math.PI / 2, len: 3, seed: Math.floor(hh(g.c[0], g.c[1], 5) * 1e9) });
  }
  // the boats once posed mid-canal at the oar: now sculled along by src/engine/movers.js, so these
  // are drawn for nothing but kept out of the plan (L cut back after the loop: the draws stay, so
  // the rest of the life keeps its places)
  const before = L.length;
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
  L.length = before;
  // the streets: people walking (some with loads on shoulder poles), knots talking; benches by the water under the willows
  const BENCHES = [];
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
      BENCHES.push(p);
      const tow = horiz ? [0, -1] : [r[0] < 0 ? 1 : -1, 0];
      for (const q of [-0.4, 0.4]) if (rand() < 0.75) person(horiz ? [p[0] + q, p[1]] : [p[0], p[1] + q], LEVEL.street, faceTo(tow), { pose: 'sit', dress: 'robe', cloth: pick(['cloth_grey', 'cloth_indigo', 'cloth_black']), hat: pick(['cap', 'none']) });
    }
  }
  // the wells: a stone curb with its bucket on the canal side of the main streets, every seventy to ninety metres, clear of benches, bridges and landings
  for (const st of STREETS.slice(0, 3)) {
    const r = clip(st);
    if (!r) continue;
    const horiz = r[2] - r[0] > r[3] - r[1], len = horiz ? r[2] - r[0] : r[3] - r[1];
    for (let s0 = 30 + hh(r[0], r[1], 7) * 25; s0 < len - 20; s0 += 70 + hh(r[0] + s0, r[1], 8) * 20) {
      const a = (horiz ? r[0] : r[1]) + s0, edge = horiz ? r[3] - 1.5 : (r[0] < 0 ? r[0] + 1.5 : r[2] - 1.5), p = horiz ? [a, edge] : [edge, a];
      if (!inDisc(p, 14) || onBridge(p[0], p[1], 9) || BENCHES.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 5) || LANDINGS.some((g) => Math.hypot(g.c[0] - p[0], g.c[1] - p[1]) < 9) || MOORED.some((m) => Math.hypot(m[0] - p[0], m[1] - p[1]) < 5)) continue;
      L.push({ t: 'well', kind: 'open', mat: 'granite_grey', at: p, y: LEVEL.street + 0.04, rot: 0, seed: Math.floor(hh(p[0], p[1], 9) * 1e9) });
    }
  }
  clearLanes(L);                                                // (the doorways of the walk's lots are kept clear of the people and their things)
  L.push(...insideFolk());                                      // (after all the rest, so that nothing above shifts)
  const tiles = new Map();
  for (const e of L) { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  const plans = [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`ming-suzhou-riverlife-${k}`, list), style: 'life', center: [i * 100 + 50, j * 100 + 50], near: 230 }; });
  if (M.length) plans.push(base('ming-suzhou-house-steps', M));
  return plans;
}

/**
 * The people at work in the rooms of the houses added after the first sixteen (rooms3.js), each at a seat or a station of its
 * household, from a stream of their own so that the street life's stays where it is. [a, b, toward a, toward b, pose, extra], in
 * the house's frame, the figure facing the direction given; the figures are the street life's own instanced ones (no draws).
 */
const FOLK = {
  boatman: (ib) => [[0.8, 6.0, 0, -1, 'sit', { dress: 'trousers', hat: 'none' }]],
  drawloom: () => [[0.85, 4.4, 0, 1, 'sit', { dress: 'robe', hat: 'none' }]],
  printer: () => [[0.8, 4.6, 0, 1, 'sit', { dress: 'robe', hat: 'cap' }]],
  tinsmith: () => [[2.75, 5.1, -1, 0, 'sit', { dress: 'trousers', hat: 'none' }]],
  jade: () => [[2.2, 5.1, -1, 0, 'sit', { dress: 'robe', hat: 'none' }]],
  grocer: (ib) => [[0.8, ib - 2.3, 0, 1, 'stand', { dress: 'robe', hat: 'none', woman: true }]],
  teahouse: () => [[2.6, 3.0, 1, 0, 'sit', { dress: 'robe', hat: 'cap' }], [4.7, 3.62, 0, -1, 'sit', { dress: 'robe', hat: 'none' }]],
  lodging: (ib) => [[2.9, ib - 1.6, 0, 1, 'stand', { dress: 'robe', hat: 'none', woman: true }]],
  scholar: () => [[5.1, 3.45, 0, -1, 'sit', { dress: 'robe', hat: 'cap' }]],
  dwelling: (ib) => [[6.3, 3.4, 0, -1, 'sit', { dress: 'robe', hat: 'cap' }], [0.9, ib - 1.7, 0, 1, 'stand', { dress: 'robe', hat: 'none', woman: true }]],
};
function insideFolk() {
  const L = [], rand = rng(2207), pick = (a) => a[Math.floor(rand() * a.length)];
  for (const l of lots()) {
    const u = upOf(l);
    if (!u?.fresh || !FOLK[u.use]) continue;
    const F = frameOf(l.rect, !!u.mir, faceOf(l, u));
    for (const [a, b, da, db, pose, ex] of FOLK[u.use](F.D - 0.4)) {
      const p = F.at(a, b), q = F.at(a + da, b + db), { woman, ...rest } = ex;
      const e = { t: 'figure', at: p, y: LEVEL.street + 0.45, rot: Math.atan2(-(q[0] - p[0]), -(q[1] - p[1])), seed: Math.floor(rand() * 1e9), cloth: pick(CLOTH), cloth2: pick(CLOTH), skin: rand() < 0.7 ? 'skin_light' : 'skin_medium', carry: 'none', pose, ...rest };
      if (CAP_MING && e.hat === 'cap') e.cap = 'ming';
      if (CAP_MING && !woman) e.hair = 'netknot';
      L.push(e);
    }
  }
  return L;
}

/** The signs and goods of every shop front (shops.js), in tiles of the street life. */
function shopFronts() {
  const tiles = new Map(), open = openLots;
  for (const l of lots()) {
    const uh = upOf(l);
    if (uh?.fresh ? !uh.trade : !l.shop) continue;               // (a later house is a shop only where its household keeps one: the grocer)
    const F = frontOf(l);
    if (!inDisc(F.P(0.5, 0), 20)) continue;
    const ovh = !!l.overhang && l.storeys > 1 && l.kind !== 'simple' && !open.has(l);
    const at = F.P(0.5, 0), e = { t: 'suzhou_shop', gap: uh ? doorGap(l, uh) : walkSet().get(l)?.type === 'shop' ? doorGap(l, { mir: false }) : undefined, gaps: walkGaps(l, F), at, y: LEVEL.street, rot: F.rot, L: F.L, v0: ovh ? 1.15 : 0.7, trade: uh?.fresh ? uh.trade : l.trade, seed: l.seed + 7, open: open.has(l), detail: l.detail, water: l.water };
    const k = `${Math.floor(at[0] / 100)},${Math.floor(at[1] / 100)}`;
    if (!tiles.has(k)) tiles.set(k, []);
    tiles.get(k).push(e);
  }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`ming-suzhou-shops-${k}`, list), style: 'life', center: [i * 100 + 50, j * 100 + 50], near: 230 }; });
}
function inDisc([x, z], m = 30) { return Math.hypot(x, z) < R - m; }
let openLots = new Set();

/** The lamps on poles at the bridge heads (lamps.js), one plan of the street life. */
function bridgeLampPlans() {
  const list = bridgeLamps(inDisc);
  return list.length ? [{ ...base('ming-suzhou-bridge-lamps', list), style: 'life', center: [0, 0], near: 230 }] : [];
}

export async function town() {
  const hs = houses();
  const plans = [waterways(), ...hs, ...riverLife(), ...bridgeLampPlans(), ...shopFronts(), ...northPlans()];
  // the light of the lanterns, shop fronts and moored boats' stern lamps at night (nightlight.js); the boats' are in the waterways plan, their light goes into the bridge lamps' plan
  const halos = plans.map((p) => streetHalos(p.elements, ([x, z]) => inDisc([x, z], 0)));
  plans.forEach((p, i) => { if (p.style === 'life') p.elements.push(...halos[i]); });
  const lamps = plans.find((p) => p.id === 'ming-suzhou-bridge-lamps');
  if (lamps) plans.forEach((p, i) => { if (p.style !== 'life') lamps.elements.push(...halos[i]); });
  return plans;
}

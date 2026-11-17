// The hanok of Hanyang you can walk into (docs/settlements/joseon-seoul.md §14): a house in its walled lot, by rule of its class —
// gentry (tile, the main range, a men's range on the west and the servants' range on the east, a raised gate with louvred windows
// beside it, the flower terrace), middle (tile, the main range and one wing, a plastered wall and a small gate roof), poor (thatch on
// mud walls, a single range with its kitchen and one or two rooms, a fence of wattle or dry stone, a brushwood gate). Each range is
// house.js's `range` with its rooms, ondol floors, doorways and furniture; the gate stands open; the yard holds its well, the crock
// terrace, the laundry line, the chimney stands behind the kitchen.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, beamTris } from '../ming/index.js';
import { range } from './house.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const C = 2.9, V = 1.0, ST = 0.9;                 // the rooms' depth, the veranda's, the step's: a range's back to the foot of its step is C + V + ST + 0.3

/** The class of a lot by rule: thatch is the poor house's; of the tiled, one in four near the palace is a gentry house. */
export function classOf(l) { return l.thatch ? 'poor' : (l.seed % 4 === 0 && Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2 - 120) < 300 ? 'gentry' : 'middle'); }

/**
 * Where everything of a house stands: { cls, ranges [{ org, face, L, kinds, seed, wall, poor, thatch, role }], gate { x, hw }, yard [x0, z0, x1, z1] (the open yard),
 * well, line, terrace, chimney, flower } — pure data of the lot (`rect`, `seed`, `thatch`), used to draw it and to place its people.
 */
export function homeLayout(el) {
  const [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0, rand = rng((el.seed || 1) ^ 0x4a5b), cls = el.cls || classOf(el), poor = cls === 'poor', thatch = poor;
  const wall = poor ? 'mud_plaster' : 'plaster_white';
  const ranges = [];
  const nA = cls === 'gentry' ? 5 + (rand() < 0.3 ? 1 : 0) : cls === 'middle' ? 4 + (rand() < 0.45 ? 1 : 0) : 3 + (rand() < 0.5 ? 1 : 0);
  const bw = Math.min(2.55 + rand() * 0.3, (W - 7.4) / nA);
  const kindsA = cls === 'gentry' ? (nA === 5 ? [['kitchen', 1], ['anbang', 2], ['daecheong', 1], ['room', 1]] : [['kitchen', 1], ['anbang', 2], ['daecheong', 2], ['room', 1]])
    : cls === 'middle' ? (nA === 4 ? (rand() < 0.5 ? [['kitchen', 1], ['anbang', 1], ['daecheong', 1], ['room', 1]] : [['kitchen', 1], ['room', 1], ['daecheong', 1], ['anbang', 1]]) : [['kitchen', 1], ['anbang', 2], ['daecheong', 1], ['room', 1]])
      : (nA === 3 ? [['kitchen', 1], ['room', 1], ['daecheong', 1]] : [['kitchen', 1], ['room', 2], ['daecheong', 1]]);
  const LA = nA * bw, slack = Math.max(0, W - 3 - 5.6 - LA), ax = x0 + 1.5 + (cls === 'gentry' ? 4.7 : 0) * 0 + slack * rand() * 0.5;
  ranges.push({ org: [ax, z0 + 1.6], face: 's', L: LA, kinds: kindsA, seed: el.seed ^ 11, wall, poor, thatch, role: 'main' });
  const zS = z0 + 1.6 + C + V + 2.2, wl = Math.min(4 * 2.6, D - 1.6 - C - V - 2.2 - 2.2), wn = (n) => Math.min(n, Math.max(1, Math.floor(wl / 2.6)));
  let east = false, west = false;
  if (cls === 'gentry') {
    const n = wn(4); ranges.push({ org: [x0 + 1.4, zS], face: 'e', L: n * 2.6, kinds: [['sarangbang', 2], ['daecheong', 1], ['room', Math.max(1, n - 3)]].filter((k) => k[1] > 0), seed: el.seed ^ 23, wall, poor: false, thatch: false, role: 'men' });
    const m = wn(4); ranges.push({ org: [x1 - 1.4, zS], face: 'w', L: m * 2.6, kinds: [['kitchen', 1], ['room', 2], ['daecheong', Math.max(1, m - 3)]], seed: el.seed ^ 37, wall, poor: true, thatch: false, role: 'servants' });
    west = east = true;
  } else if (cls === 'middle') {
    const side = rand() < 0.5 ? 'e' : 'w', n = wn(3);
    ranges.push({ org: [side === 'e' ? x0 + 1.4 : x1 - 1.4, zS], face: side, L: n * 2.6, kinds: rand() < 0.55 ? [['sarangbang', 2], ['room', Math.max(1, n - 2)]] : [['room', 2], ['daecheong', Math.max(1, n - 2)]], seed: el.seed ^ 29, wall, poor: false, thatch: false, role: 'wing' });
    if (side === 'e') west = true; else east = true;
  } else if (rand() < 0.35) {
    const n = wn(2); ranges.push({ org: [x0 + 1.4, zS], face: 'e', L: n * 2.6, kinds: [['room', n]], seed: el.seed ^ 31, wall, poor: true, thatch: true, role: 'wing' });
    west = true;
  }
  const xc = x0 + W * (cls === 'gentry' ? 0.5 : 0.62) + (rand() - 0.5) * 2, hw = cls === 'gentry' ? 1.35 : poor ? 1.0 : 1.2;
  const sideX = east ? null : x1 - 3.6;                                                    // the free side of the yard, for the well and the laundry
  const wellAt = !west || !east ? [west ? x1 - 3.4 : x0 + 3.4, z0 + 9.6 + rand() * 3] : null;
  const lineAt = !west || !east ? [west ? x1 - 3.4 : x0 + 3.4, z0 + 15.2 + rand() * 1.2] : null;
  return { cls, ranges, gate: { x: xc, hw }, W, D, wall, wellAt, lineAt, sideX, bw };
}

const wallSeg = (bag, col, a, b, h0, h1, rubble, plaster, cap, thick) => {
  const t = []; beamTris(t, [a[0], 0, a[1]], [b[0], 0, b[1]], thick, h0); bag.add(rubble, fromTriangles(t));
  if (plaster) { const u = []; beamTris(u, [a[0], h0, a[1]], [b[0], h0, b[1]], thick - 0.02, h1 - h0); bag.add(plaster, fromTriangles(u)); }
  if (cap) { const c = []; beamTris(c, [a[0], h1, a[1]], [b[0], h1, b[1]], thick + 0.13, 0.25); bag.add(cap, fromTriangles(c)); }
  col.segment(a, b, thick + 0.1, 0, h1 + 0.25);
};

/** The yard's things: the well, the laundry line, the crock terrace, the flower terrace. */
function yardThings(bag, col, el, L, rand) {
  const [x0, z0, x1, z1] = el.rect;
  if (L.wellAt) {
    const [wx, wz] = L.wellAt;
    bag.add('granite_korea', lathe([[0.001, 0.0], [0.56, 0.0], [0.56, 0.52], [0.4, 0.52], [0.4, 0.08], [0.001, 0.08]], 14, null, wx, 0, wz));
    col.circle(wx, wz, 0.58, 0, 0.55);
    for (const s of [-1, 1]) bag.add('timber', box(wx + s * 0.7 - 0.05, 0, wz - 0.05, wx + s * 0.7 + 0.05, 1.75, wz + 0.05));
    bag.add('timber', box(wx - 0.78, 1.7, wz - 0.06, wx + 0.78, 1.8, wz + 0.06));
    bag.add('rope_fibre', box(wx - 0.015, 1.0, wz - 0.015, wx + 0.015, 1.7, wz + 0.015));
    bag.add('timber', lathe([[0.001, 0], [0.11, 0], [0.14, 0.2], [0.1, 0.22], [0.001, 0.2]], 8, null, wx, 0.82, wz));            // the bucket on its rope
  }
  if (L.lineAt) {
    const [lx, lz] = L.lineAt;
    for (const s of [-1, 1]) bag.add('bamboo_culm', box(lx + s * 1.7 - 0.035, 0, lz - 0.035, lx + s * 1.7 + 0.035, 2.3, lz + 0.035));
    bag.add('rope_fibre', box(lx - 1.7, 2.1, lz - 0.01, lx + 1.7, 2.12, lz + 0.01));
    const m = ['cloth_white', 'cloth_white', 'cloth_blue', 'cloth_white', 'linen'];
    for (let k = 0; k < 3; k++) { const a = lx - 1.5 + k * 1.05 + rand() * 0.12; bag.add(m[Math.floor(rand() * m.length)], box(a, 1.0 + rand() * 0.2, lz - 0.012, a + 0.85, 2.1, lz + 0.012)); }
    col.rect([lx - 1.75, lz - 0.06, lx - 1.65, lz + 0.06], 0, 2.3); col.rect([lx + 1.65, lz - 0.06, lx + 1.75, lz + 0.06], 0, 2.3);
  }
  if (L.cls === 'gentry') {
    // the flower terrace (hwagye): three steps of granite with turf on them, by the main range's east end
    const m = L.ranges[0], ex = m.org[0] + m.L + 1.2, fx = Math.min(x1 - 3.4, ex + 0.6);
    if (x1 - 0.8 - ex >= 3.2) for (let k = 0; k < 3; k++) {
      const a = [fx - 0.9 + k * 0.45, z0 + 1.7 + k * 0.5, fx + 1.5 - k * 0.45, z0 + 3.3 + k * 0.1];
      bag.add('granite_korea', box(a[0], 0, a[1], a[2], 0.18 + k * 0.18, a[3])); bag.add('sod', box(a[0] + 0.06, 0.18 + k * 0.18, a[1] + 0.06, a[2] - 0.06, 0.2 + k * 0.18, a[3] - 0.06));
      col.rect(a, 0, 0.2 + k * 0.18);
    }
  }
}

/** The lot's boundary and its open gate: by class. */
function boundary(bag, col, el, L) {
  const [x0, z0, x1, z1] = el.rect, { cls, gate: { x: xc, hw } } = L, poor = cls === 'poor', rand = rng(el.seed ^ 77), stoneFence = rand() < 0.5;
  const pieces = [[[x0, z0], [x1, z0]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]], [[x0, z1], [xc - hw, z1]], [[xc + hw, z1], [x1, z1]]];
  const capMat = poor ? 'thatch' : 'tile_grey';
  if (!poor) for (const [a, b] of pieces) wallSeg(bag, col, a, b, 0.95, 1.9, 'schist_rubble', cls === 'gentry' ? 'plaster_white' : 'plaster_grey', capMat, 0.27);
  else if (stoneFence) for (const [a, b] of pieces) wallSeg(bag, col, a, b, 1.25, 1.25, 'schist_rubble', null, 'thatch', 0.3);          // a dry-stone wall with a straw cap
  else for (const [a, b] of pieces) {
    // a fence of woven brushwood between stakes
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(len / 1.8));
    const t = []; beamTris(t, [a[0], 0.05, a[1]], [b[0], 0.05, b[1]], 0.045, 1.25); bag.add('wicker', fromTriangles(t));
    for (let k = 0; k <= n; k++) { const u = k / n, px = a[0] + (b[0] - a[0]) * u, pz = a[1] + (b[1] - a[1]) * u; bag.add('timber', box(px - 0.05, 0, pz - 0.05, px + 0.05, 1.45, pz + 0.05)); }
    col.segment(a, b, 0.12, 0, 1.4);
  }
  // the gate: two posts, a lintel, a roof — by class; one leaf swung back, the other standing open against the wall's inside; a threshold stone
  const gx0 = xc - hw, gx1 = xc + hw;
  bag.add('granite_korea', box(gx0, 0, z1 - 0.2, gx1, 0.08, z1 + 0.2));
  if (cls === 'gentry') {
    // the raised gate (soseul daemun): tall posts on stone feet, the great lintel, a tiled roof raised over the wall's coping, louvred windows beside it
    for (const s of [gx0, gx1]) { bag.add('granite_korea', box(s - 0.22, 0, z1 - 0.22, s + 0.22, 0.3, z1 + 0.22)); bag.add('timber', box(s - 0.14, 0.3, z1 - 0.14, s + 0.14, 3.5, z1 + 0.14)); }
    bag.add('timber', box(gx0 - 0.25, 3.15, z1 - 0.16, gx1 + 0.25, 3.5, z1 + 0.16)); bag.add('paint_dancheong', box(gx0, 2.8, z1 - 0.08, gx1, 3.15, z1 + 0.08));
    rectRoof({ c: [xc, z1], A: hw + 1.1, B: 1.2, y: 3.45, rise: 1.15, kind: 'xieshan', sweep: 0.5, p: 1.5, alongZ: false, mat: 'tile_grey', soffit: 'timber', curl: false }, bag);
    for (const sx of [-1, 1]) {
      // the wall beside the gate rises into a front with a louvred window of upright bars (salchang) in a wooden frame
      const wa = sx < 0 ? xc - hw - 4.6 : xc + hw + 1.6, wb = wa + 3.0;
      if (wa > x0 + 0.5 && wb < x1 - 0.5) {
        bag.add('timber', box(wa, 1.2, z1 + 0.14, wb, 1.28, z1 + 0.2)); bag.add('timber', box(wa, 1.95, z1 + 0.14, wb, 2.03, z1 + 0.2));
        bag.add('opening', box(wa + 0.05, 1.28, z1 + 0.12, wb - 0.05, 1.95, z1 + 0.15));
        for (let q = 0; q <= 10; q++) { const px = wa + 0.05 + (wb - wa - 0.1) * q / 10; bag.add('timber', box(px - 0.02, 1.28, z1 + 0.14, px + 0.02, 1.95, z1 + 0.19)); }
      }
    }
  } else if (!poor) {
    for (const s of [gx0, gx1]) bag.add('timber', box(s - 0.11, 0, z1 - 0.11, s + 0.11, 2.6, z1 + 0.11));
    bag.add('timber', box(gx0 - 0.15, 2.4, z1 - 0.13, gx1 + 0.15, 2.62, z1 + 0.13));
    rectRoof({ c: [xc, z1], A: hw + 0.9, B: 0.95, y: 2.6, rise: 0.75, kind: 'gable', sweep: 0.5, p: 1.5, alongZ: false, mat: 'tile_grey', soffit: 'timber', curl: false }, bag);
  } else {
    for (const s of [gx0, gx1]) bag.add('timber', box(s - 0.08, 0, z1 - 0.08, s + 0.08, 2.0, z1 + 0.08));
    bag.add('timber', box(gx0 - 0.1, 1.9, z1 - 0.07, gx1 + 0.1, 2.0, z1 + 0.07));
  }
  const leaf = poor ? 'wicker' : 'planks_grey', top = poor ? 1.5 : 2.3;
  bag.add(leaf, box(gx0 - 0.04, 0.1, z1 - 1.0, gx0 + 0.04, top, z1 - 0.1)); bag.add(leaf, box(gx1 - 0.04, 0.1, z1 - 1.0, gx1 + 0.04, top, z1 - 0.1));
  if (!poor) { bag.add('iron', box(gx0 - 0.06, 1.2, z1 - 0.7, gx0 + 0.06, 1.3, z1 - 0.62)); bag.add('iron', box(gx1 - 0.06, 1.2, z1 - 0.7, gx1 + 0.06, 1.3, z1 - 0.62)); }
}

/**
 * hanok_home { rect, seed, thatch, cls? }: the walkable hanok (see homeLayout).
 */
export function hanokHome(el, { bag, col }) {
  const L = homeLayout(el), [x0, z0, x1, z1] = el.rect, rand = rng(el.seed ^ 0x77);
  for (const r of L.ranges) range(bag, col, r);
  // the ondol's chimney (gulttuk) stands apart behind the main range, beside the kitchen's room: an earthen stack on a stone foot with a clay-pot cap
  {
    const m = L.ranges[0], a = L.cls === 'poor' ? m.L * 0.62 : m.L * 0.28, x = m.org[0] + a, z = m.org[1] - 0.95;
    bag.add('granite_korea', box(x - 0.42, 0, z - 0.42, x + 0.42, 0.18, z + 0.42));
    bag.add(m.wall, box(x - 0.34, 0.18, z - 0.34, x + 0.34, 2.9, z + 0.34));
    bag.add('plaster_damp', box(x - 0.345, 0.18, z - 0.345, x + 0.345, 0.55, z + 0.345));
    bag.add('pottery_dark', lathe([[0.3, 0], [0.34, 0.06], [0.2, 0.2], [0.2, 0.5], [0.001, 0.5]], 8, null, x, 2.9, z));
    bag.add(L.cls === 'poor' ? 'thatch' : 'tile_grey', box(x - 0.42, 3.4, z - 0.42, x + 0.42, 3.46, z + 0.42));
    col.rect([x - 0.42, z - 0.42, x + 0.42, z + 0.42], 0, 3.2);
  }
  // the crock terrace: jars in two or three rows by the south-east wall (the poor: a few jars on the ground)
  {
    const jx = x1 - 4.2, jz = z1 - 2.7, rows = L.cls === 'poor' ? 1 : 2, cols = L.cls === 'poor' ? 2 : L.cls === 'gentry' ? 4 : 3;
    if (!L.ranges.some((r) => r.face === 'w' && jx > r.org[0] - 4.4 && jz > r.org[1] - 1)) {
      const y0 = L.cls === 'poor' ? 0.03 : 0.25;
      if (L.cls !== 'poor') { bag.add('granite_korea', box(jx - 0.5 - cols * 0.43, 0, jz - 0.8, jx + 0.5 + cols * 0.43, 0.25, jz + 0.8)); col.floor([jx - 0.5 - cols * 0.43, jz - 0.8, jx + 0.5 + cols * 0.43, jz + 0.8], 0.25); }
      for (let a = 0; a < cols; a++) for (let b = 0; b < rows; b++) {
        if (rand() < 0.15) continue;
        const big = (a + b) % 2 === 0, rr = big ? 0.3 : 0.22, hh = big ? 0.68 : 0.48, x = jx - (cols - 1) * 0.43 + a * 0.86, z = jz - 0.35 + b * 0.7;
        bag.add('pottery_dark', lathe([[rr * 0.55, 0], [rr * 0.95, hh * 0.35], [rr, hh * 0.55], [rr * 0.7, hh * 0.9], [rr * 0.55, hh], [0.001, hh]], 10, null, x, y0, z));
        bag.add('pottery_dark', lathe([[rr * 0.62, 0], [rr * 0.58, 0.05], [0.001, 0.09]], 10, null, x, y0 + hh, z));
        col.circle(x, z, rr, y0, y0 + hh);
      }
    }
  }
  yardThings(bag, col, el, L, rand);
  boundary(bag, col, el, L);
  // the flagstone way from the gate to the main range's step
  const m = L.ranges[0], px = Math.max(m.org[0] + 0.6, Math.min(L.gate.x, m.org[0] + m.L - 0.6));
  bag.add('granite_korea', box(px - 0.6, 0, z0 + 1.6 + C + V + 0.9 + 0.3, px + 0.6, 0.03, el.rect[3] - 0.2));
  if (Math.abs(px - L.gate.x) > 0.3) bag.add('granite_korea', box(Math.min(px, L.gate.x) - 0.6, 0, z1 - 2.2, Math.max(px, L.gate.x) + 0.6, 0.03, z1 - 1.0));
}

// The medina of Granada about 1390 (docs/settlements/granada.md §11–§12): the Darro between its stone quays
// with the bridges over it, the hammam on its bank (El Bañuelo's plan), the mosques of the Albaicín and of
// the town with their brick minarets, and the Alcaicería, the walled silk market of the south town.

import { box, lathe, rod, disc, place, fromTriangles, orientOutward } from '../../core/geom.js';
import { holedWall, face, archHead, archRun, nColumn, plankVault, dbl, dress, tileFloor } from './halls.js';

const q4 = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);
const LW = 'limewash_white';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const rectBox = (bag, mat, r, y0, y1) => bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3]));

/** A lattice of rhombs (sebka) in relief on a darker ground, on face f between u0..u1, v0..v1, framed. */
function sebka(bag, f, u0, u1, v0, v1, d = 0.03) {
  const g = []; q4(g, f.P(u0, v0, d), f.P(u1, v0, d), f.P(u1, v1, d), f.P(u0, v1, d));
  bag.add('stucco_warm', dbl(g));
  const m = 1.5, sp = 0.3, hh = v1 - v0;
  for (const sg of [1, -1]) for (let c = u0 - hh / m; c < u1 + hh / m; c += sp) {
    const ga = Math.max(c, u0), gb = Math.min(c + hh / m, u1);
    if (gb - ga < 0.04) continue;
    const Y = (u) => (sg > 0 ? v0 + m * (u - c) : v1 - m * (u - c));
    bag.add('stucco_cream', rod(f.P(ga, Y(ga), d + 0.012), f.P(gb, Y(gb), d + 0.012), 0.02, 4));
  }
  for (const [a, b] of [[[u0, v0], [u1, v0]], [[u1, v0], [u1, v1]], [[u1, v1], [u0, v1]], [[u0, v1], [u0, v0]]]) bag.add('stucco_cream', rod(f.P(a[0], a[1], d + 0.02), f.P(b[0], b[1], d + 0.02), 0.03, 4));
}

// ——— the Darro and its bridges ———————————————————————————————————————————————

/**
 * darro: { z, w (half the water's width), wl (the water's level), bed, y (the quay street), x0, x1, gaps:
 * [{ x, width }] (where a bridge crosses) } — the river between two stone quay walls with a low parapet
 * along the street, the water a still surface.
 */
function darro(el, { bag, col }) {
  const { z, w, wl, bed, y, x0, x1 } = el, T = 0.7, gaps = [...(el.gaps ?? [])].sort((a, b) => a.x - b.x).map((g) => [g.x - g.width / 2 - 0.35, g.x + g.width / 2 + 0.35]);
  bag.add('water', fromTriangles([x0, wl, z - w, x0, wl, z + w, x1, wl, z + w, x0, wl, z - w, x1, wl, z + w, x1, wl, z - w]));
  // the quays: the wall from the bed up to the parapet's top; at a bridge the wall stops under its deck
  for (const s of [-1, 1]) {
    const za = s < 0 ? z - w - T : z + w, zb = za + T, pieces = [];
    let a = x0;
    for (const [g0, g1] of gaps) { if (g0 > a) pieces.push([a, g0]); a = Math.max(a, g1); }
    if (x1 > a) pieces.push([a, x1]);
    for (const [p, q] of pieces) {
      bag.add('rubble', box(p, bed - 0.4, za, q, y + 0.85, zb)); col.rect([p, za, q, zb], bed - 0.4, y + 0.97);
      bag.add('limestone', box(p, y + 0.85, za - 0.06, q, y + 0.97, zb + 0.06));
    }
    for (const [g0, g1] of gaps) { bag.add('rubble', box(g0, bed - 0.4, za, g1, y - 0.3, zb)); col.rect([g0, za, g1, zb], bed - 0.4, y - 0.3); }
    // the water gates and steps down to the water: none; a row of stone mooring rings on the wall's face
    for (let x = x0 + 14; x < x1 - 8; x += 17) {
      if (gaps.some(([g0, g1]) => x > g0 - 1 && x < g1 + 1)) continue;
      const zf = s < 0 ? z - w : z + w;
      bag.add('iron', box(x - 0.07, wl + 0.55, Math.min(zf, zf - s * 0.05) - (s < 0 ? 0 : 0), x + 0.07, wl + 0.7, Math.max(zf, zf - s * 0.05)));
    }
  }
}

/**
 * darro_bridge: { x, z (the river's axis), width, w (half the water), y (the quay street), wl } — a humpbacked
 * single-arch bridge of stone over the Darro (the Puente del Cadí): the deck rising a metre over the street, a
 * segmental arch over the water with a ring of voussoirs, parapets with a coping, the deck of flags.
 */
function darroBridge(el, { bag, col }) {
  const { x, z: zc, width, w, y, wl } = el, W = width / 2, T = 0.7, half = w + T + 3.2, R = el.rise ?? 1.1;
  const P = (s, o, yy) => [x + o, yy, zc + s];
  const top = (s) => y + 0.03 + R * (1 - (Math.abs(s) / half) ** 2);
  const spring = wl + 0.85, rs = 1.1, Ra = (w * w + rs * rs) / (2 * rs), cY = spring + rs - Ra;
  const under = (s) => (Math.abs(s) < w ? cY + Math.sqrt(Ra * Ra - s * s) : y - 0.3);
  const N = 44, body = [], deck = [], ring = [], pAr = [], cop = [], parts = [];
  const hex = (out, s0, s1, l0, l1, h0, h1, o0, o1, caps) => {
    const t = [];
    q4(t, P(s0, o0, h0), P(s1, o0, h1), P(s1, o1, h1), P(s0, o1, h0));       // top
    q4(t, P(s0, o0, l0), P(s0, o1, l0), P(s1, o1, l1), P(s1, o0, l1));       // bottom
    q4(t, P(s0, o0, l0), P(s1, o0, l1), P(s1, o0, h1), P(s0, o0, h0));       // side −
    q4(t, P(s0, o1, l0), P(s0, o1, h0), P(s1, o1, h1), P(s1, o1, l1));       // side +
    if (caps) { q4(t, P(s0, o0, l0), P(s0, o0, h0), P(s0, o1, h0), P(s0, o1, l0)); q4(t, P(s1, o0, l1), P(s1, o1, l1), P(s1, o1, h1), P(s1, o0, h1)); }
    out.push(...orientOutward(t));
  };
  for (let i = 0; i < N; i++) {
    const s0 = -half + 2 * half * i / N, s1 = -half + 2 * half * (i + 1) / N, t0 = top(s0), t1 = top(s1), u0 = under(s0), u1 = under(s1);
    hex(body, s0, s1, u0, u1, t0 - 0.12, t1 - 0.12, -W, W, i === 0 || i === N - 1);
    hex(deck, s0, s1, t0 - 0.12, t1 - 0.12, t0, t1, -W, W, i === 0 || i === N - 1);
    for (const [o0, o1] of [[-W, -W + 0.34], [W - 0.34, W]]) {
      hex(pAr, s0, s1, t0, t1, t0 + 0.85, t1 + 0.85, o0, o1, i === 0 || i === N - 1);
      hex(cop, s0, s1, t0 + 0.85, t1 + 0.85, t0 + 0.96, t1 + 0.96, o0 - 0.05, o1 + 0.05, i === 0 || i === N - 1);
    }
    // the ring of voussoirs round the arch on both faces
    if (Math.abs(s0) < w && Math.abs(s1) < w) for (const o of [-W - 0.04, W]) hex(ring, s0, s1, u0 - 0.02, u1 - 0.02, u0 + 0.34, u1 + 0.34, o, o + 0.04, false);
  }
  bag.add('rubble', fromTriangles(body)); bag.add('flagstone', fromTriangles(deck)); bag.add('rubble', fromTriangles(pAr)); bag.add('limestone', fromTriangles(cop)); bag.add('limestone', fromTriangles(ring));
  // the colliders: the deck in slices, the parapets in longer pieces
  const NC = 36;
  for (let i = 0; i < NC; i++) {
    const s0 = -half + 2 * half * i / NC, s1 = -half + 2 * half * (i + 1) / NC, t = Math.max(top(s0), top(s1));
    col.rect([x - W, zc + s0, x + W, zc + s1], t - 0.4, t);
    for (const [o0, o1] of [[-W, -W + 0.34], [W - 0.34, W]]) col.rect([x + o0, zc + s0, x + o1, zc + s1], t, t + 0.96);
  }
  void parts;
}

// ——— the mosques —————————————————————————————————————————————————————————————

/** The minaret (alminar) on rect m: a square brick shaft with arched slits, panels of sebka, a cornice, the lantern and a tiled spire topped by three gilt balls. */
function minaret(bag, col, m, y, H) {
  const cx = (m[0] + m[2]) / 2, cz = (m[1] + m[3]) / 2, sz = m[2] - m[0];
  bag.add('limestone', box(m[0] - 0.12, y, m[1] - 0.12, m[2] + 0.12, y + 1.2, m[3] + 0.12));
  bag.add('brick', box(m[0], y + 1.2, m[1], m[2], y + H, m[3])); col.rect(m, y, y + H);
  const fs = [face('z', m[1], 1), face('z', m[3], -1), face('x', m[0], 1), face('x', m[2], -1)], us = [[m[0], m[2]], [m[0], m[2]], [m[1], m[3]], [m[1], m[3]]];
  fs.forEach((f, i) => {
    const [a, b] = us[i], c = (a + b) / 2, h = (b - a);
    // the slit windows in a horseshoe arch, two above one another at the lower part, a pair under the panel
    for (const [v, dv] of [[y + 4.2, 1.0], [y + 7.0, 1.0]]) {
      const g = []; q4(g, f.P(c - 0.22, v, -0.012), f.P(c + 0.22, v, -0.012), f.P(c + 0.22, v + dv, -0.012), f.P(c - 0.22, v + dv, -0.012));
      bag.add('opening', dbl(g));
      bag.add('stucco_cream', rod(f.P(c - 0.3, v - 0.04, -0.03), f.P(c - 0.3, v + dv + 0.1, -0.03), 0.025, 4)); bag.add('stucco_cream', rod(f.P(c + 0.3, v - 0.04, -0.03), f.P(c + 0.3, v + dv + 0.1, -0.03), 0.025, 4));
      bag.add('stucco_cream', rod(f.P(c - 0.3, v + dv + 0.1, -0.03), f.P(c + 0.3, v + dv + 0.1, -0.03), 0.025, 4));
    }
    // the upper third: two tall panels of sebka (the minaret of San José's), blind arches between
    const pw = (h - 1.2) / 2 - 0.25;
    for (const k of [-1, 1]) sebka(bag, f, c + k * (pw / 2 + 0.2) - pw / 2, c + k * (pw / 2 + 0.2) + pw / 2, y + H - 4.6, y + H - 0.9);
    // bands: a stucco string course under the panels and the cornice
    bag.add('stucco_cream', box(...((r) => [r[0], y + H - 5.0, r[1], r[2], y + H - 4.85, r[3]])(i < 2 ? [m[0] - 0.06, (i === 0 ? m[1] - 0.06 : m[3] - 0.02), m[2] + 0.06, (i === 0 ? m[1] + 0.02 : m[3] + 0.06)] : [(i === 2 ? m[0] - 0.06 : m[2] - 0.02), m[1] - 0.06, (i === 2 ? m[0] + 0.02 : m[2] + 0.06), m[3] + 0.06])));
  });
  bag.add('limestone', box(m[0] - 0.3, y + H, m[1] - 0.3, m[2] + 0.3, y + H + 0.3, m[3] + 0.3));
  // the lantern: a smaller square of brick with a horseshoe window on each side, a cornice, the spire
  const L = 0.34 * sz, yl = y + H + 0.3, hl = 2.6;
  bag.add('brick', box(cx - L, yl, cz - L, cx + L, yl + hl, cz + L));
  for (const [ax, at, n] of [['z', cz - L, -1], ['z', cz + L, 1], ['x', cx - L, -1], ['x', cx + L, 1]]) {
    const f = ax === 'z' ? face('z', at, -n) : face('x', at, -n), c = ax === 'z' ? cx : cz;
    const g = []; q4(g, f.P(c - 0.38, yl + 0.55, -0.012), f.P(c + 0.38, yl + 0.55, -0.012), f.P(c + 0.38, yl + 1.85, -0.012), f.P(c - 0.38, yl + 1.85, -0.012));
    bag.add('opening', dbl(g));
    bag.add('stucco_cream', rod(f.P(c - 0.47, yl + 0.5, -0.03), f.P(c - 0.47, yl + 1.95, -0.03), 0.03, 4)); bag.add('stucco_cream', rod(f.P(c + 0.47, yl + 0.5, -0.03), f.P(c + 0.47, yl + 1.95, -0.03), 0.03, 4)); bag.add('stucco_cream', rod(f.P(c - 0.47, yl + 1.95, -0.03), f.P(c + 0.47, yl + 1.95, -0.03), 0.03, 4));
  }
  bag.add('limestone', box(cx - L - 0.2, yl + hl, cz - L - 0.2, cx + L + 0.2, yl + hl + 0.2, cz + L + 0.2));
  const yr = yl + hl + 0.2, e = L + 0.35, tp = [cx, yr + 1.9, cz], t = [];
  const pts = [[cx - e, cz - e], [cx + e, cz - e], [cx + e, cz + e], [cx - e, cz + e]];
  for (let i = 0; i < 4; i++) { const a = pts[i], b = pts[(i + 1) % 4]; t.push(a[0], yr, a[1], ...tp, b[0], yr, b[1]); }
  bag.add('glaze_green', dbl(t));
  bag.add('gilt_bronze', rod([cx, yr + 1.85, cz], [cx, yr + 3.2, cz], 0.03, 5));
  for (const [dy, r] of [[2.15, 0.2], [2.65, 0.15], [3.05, 0.11]]) bag.add('gilt_bronze', lathe([[0.001, -r], [r * 0.9, -r * 0.45], [r, 0], [r * 0.9, r * 0.45], [0.001, r]], 10, null, cx, yr + dy, cz));
}

/**
 * mosque: { rect, y, aisles (5), hall (depth of the prayer hall), minaret: true } — a mosque of the medina, the qibla
 * to the south: the sahn (a court of paving round an ablution pool, orange trees, a riwaq on east and west, the gate in
 * the north wall), the prayer hall of aisles running toward the qibla wall with arcades of horseshoe arches, the aisles
 * under pitched roofs of tile, the mihrab niche in the south wall, the brick minaret at the north-west corner.
 */
function mosque(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, W = x1 - x0, D = z1 - z0, t = 0.7, na = el.aisles ?? 5, Dh = el.hall ?? Math.round(D * 0.5), zh = z1 - Dh, H = 4.5;
  const rand = rng(el.seed ?? 7), Wi = W - 2 * t, aw = Wi / na, xl = (k) => x0 + t + k * aw, mx = (x0 + x1) / 2;
  // the floors: the sahn of brick paving, the hall of reed matting laid over a floor of flags
  rectBox(bag, 'brick_paving', [x0, z0, x1, zh], y - 0.25, y + 0.04); col.floor([x0, z0, x1, zh], y + 0.04);
  rectBox(bag, 'reed_mat', [x0, zh, x1, z1], y - 0.25, y + 0.05); col.floor([x0, zh, x1, z1], y + 0.05);
  // the walls: the north wall with the gate, the east and west walls, the qibla wall with the mihrab
  const gate = [mx - 1.15, mx + 1.15];
  holedWall(bag, col, LW, [x0, z0, x1, z0 + t], y, y + 4.8, [[gate[0], gate[1], y, y + 3.1]], true);
  archHead(bag, face('z', z0, 1), gate[0], gate[1], y + 2.1, y + 3.1, t, 'horseshoe', { both: true });
  bag.add('wood_dark', box(gate[1] - 0.1, y + 0.05, z0 + 0.1, gate[1] - 0.04, y + 2.6, z0 + 1.0));
  for (const r of [[x0, z0 + t, x0 + t, z1], [x1 - t, z0 + t, x1, z1]]) {
    const hx = r[0] < mx ? x0 : x1 - t, wins = [];
    for (let z = zh + 2; z < z1 - 1.5; z += 3.4) wins.push([z - 0.3, z + 0.3, y + 2.8, y + 3.8]);
    holedWall(bag, col, LW, r, y, y + H + 0.3, wins, false); void hx;
  }
  const mi = [mx - 0.85, mx + 0.85];
  holedWall(bag, col, LW, [x0 + t, z1 - t, x1 - t, z1], y, y + H + 0.3, [[mi[0], mi[1], y, y + 3.1]], true);
  archHead(bag, face('z', z1 - t, 1), mi[0], mi[1], y + 2.0, y + 3.1, t, 'horseshoe', { both: false });
  // the mihrab: a niche behind the qibla wall, an eight-sided plan under a half dome, the tile dado, the frame in stucco
  { const nz = [z1, z1 + 1.5], ni = [mx - 1.0, mx + 1.0];
    for (const r of [[ni[0] - 0.3, nz[0], ni[0], nz[1] + 0.3], [ni[1], nz[0], ni[1] + 0.3, nz[1] + 0.3], [ni[0], nz[1], ni[1], nz[1] + 0.3]]) { rectBox(bag, LW, r, y, y + 3.9); col.rect(r, y, y + 3.9); }
    bag.add('tile_cream', box(ni[0], y - 0.2, nz[0], ni[1], y + 0.05, nz[1])); col.floor([ni[0], nz[0], ni[1], nz[1]], y + 0.05);
    bag.add('stucco_cream', box(ni[0], y + 3.0, nz[0], ni[1], y + 3.1, nz[1]));
    bag.add('glaze_white', box(ni[0], y + 0.05, nz[1] - 0.02, ni[1], y + 1.2, nz[1])); bag.add('glaze_lapis', box(ni[0], y + 1.2, nz[1] - 0.025, ni[1], y + 1.3, nz[1]));
    bag.add('stucco_cream', lathe([[1.0, 0], [0.97, 0.12], [0.8, 0.45], [0.5, 0.8], [0.001, 0.95]], 14, null, mx, y + 3.1, nz[0] + 0.0).clone());
    bag.add('stucco_cream', box(ni[0], y + 3.1, nz[1] - 0.04, ni[1], y + 3.9, nz[1]));
    // its roof: a little hipped roof of tile over the projection
    const ee = 0.3, c = [ni[0] - 0.3 - ee, nz[0] - 0, ni[1] + 0.3 + ee, nz[1] + 0.3 + ee], tr = [], tp = (c[0] + c[2]) / 2;
    q4(tr, [c[0], y + H + 0.3, c[1]], [tp, y + H + 1.2, c[1]], [tp, y + H + 1.2, c[3]], [c[0], y + H + 0.3, c[3]]); q4(tr, [tp, y + H + 1.2, c[1]], [c[2], y + H + 0.3, c[1]], [c[2], y + H + 0.3, c[3]], [tp, y + H + 1.2, c[3]]);
    bag.add('roof_tile', dbl(tr)); rectBox(bag, LW, [ni[0] - 0.3, nz[0], ni[1] + 0.3, nz[1] + 0.3], y + 3.9, y + H + 0.3);
  }
  // the north wall of the hall, pierced by an arch for each aisle
  const holes = []; for (let k = 0; k < na; k++) { const c = x0 + t + (k + 0.5) * aw; holes.push([c - 1.1, c + 1.1, y, y + 3.5]); }
  holedWall(bag, col, LW, [x0 + t, zh, x1 - t, zh + t], y, y + H + 0.3, holes, true);
  for (const h of holes) archHead(bag, face('z', zh, 1), h[0], h[1], y + 2.3, y + 3.5, t, 'horseshoe', { both: true });
  // the arcades between the aisles (horseshoe arches over piers), the walls and the beams of the roof on them
  const len = z1 - t - (zh + t), n = Math.max(2, Math.round(len / 3.3));
  for (let k = 1; k < na; k++) {
    const st = []; for (let i = 0; i <= n; i++) st.push({ u: (i === 0 ? 0.28 : i === n ? len - 0.28 : len * i / n), w: i === 0 || i === n ? 0.28 : 0.26 });
    archRun(bag, [xl(k), zh + t], [xl(k), z1 - t], st, y, 2.55, H, { abaci: false });
    for (let i = 1; i < n; i++) col.rect([xl(k) - 0.26, zh + t + st[i].u - 0.26, xl(k) + 0.26, zh + t + st[i].u + 0.26], y, y + H);
  }
  // the roofs over the aisles: gables along z, a ceiling of planks under each slope
  const yE = y + H, rise = 1.25, zA = zh - 0.0, zB = z1 + 0.0;
  for (let k = 0; k < na; k++) {
    const a = x0 + t + k * aw, b = a + aw, c = (a + b) / 2, up = [], dn = [], gb = [];
    const e = k === 0 ? 0.35 : 0, f2 = k === na - 1 ? 0.35 : 0, ov = 0.0;
    q4(up, [a - e, yE + 0.12 - e * 0.45, zA - 0.45], [c, yE + rise + 0.12, zA - 0.45], [c, yE + rise + 0.12, zB + ov], [a - e, yE + 0.12 - e * 0.45, zB + ov]);
    q4(up, [c, yE + rise + 0.12, zA - 0.45], [b + f2, yE + 0.12 - f2 * 0.45, zA - 0.45], [b + f2, yE + 0.12 - f2 * 0.45, zB + ov], [c, yE + rise + 0.12, zB + ov]);
    bag.add('roof_tile', dbl(up));
    q4(dn, [a, yE, zA], [c, yE + rise, zA], [c, yE + rise, zB - t], [a, yE, zB - t]); q4(dn, [c, yE + rise, zA], [b, yE, zA], [b, yE, zB - t], [c, yE + rise, zB - t]);
    bag.add('cedar', dbl(dn));
    // the gable's end over the arch (north) and the qibla wall (south)
    for (const zz of [zh + 0.0, z1 - t]) gb.push(a, yE, zz, c, yE + rise, zz, b, yE, zz);
    bag.add(LW, dbl(gb));
    // planks' beams across the ceiling
    for (let z = zh + 1.0; z < z1 - 0.5; z += 1.1) { bag.add('timber', rod([a + 0.1, yE + 0.04, z], [c, yE + rise - 0.02, z], 0.035, 4)); bag.add('timber', rod([c, yE + rise - 0.02, z], [b - 0.1, yE + 0.04, z], 0.035, 4)); }
  }
  // the sahn: a pool of marble with a jet, four orange trees in the corners of the paving
  const pc = [mx, (z0 + zh) / 2 + 0.6], pr = [pc[0] - 1.5, pc[1] - 0.8, pc[0] + 1.5, pc[1] + 0.8];
  for (const r of [[pr[0], pr[1], pr[2], pr[1] + 0.2], [pr[0], pr[3] - 0.2, pr[2], pr[3]], [pr[0], pr[1] + 0.2, pr[0] + 0.2, pr[3] - 0.2], [pr[2] - 0.2, pr[1] + 0.2, pr[2], pr[3] - 0.2]]) bag.add('marble_smooth', box(r[0], y - 0.4, r[1], r[2], y + 0.32, r[3]));
  bag.add('marble_smooth', box(pr[0] + 0.2, y - 0.4, pr[1] + 0.2, pr[2] - 0.2, y - 0.32, pr[3] - 0.2)); bag.add('water', box(pr[0] + 0.2, y - 0.32, pr[1] + 0.2, pr[2] - 0.2, y + 0.25, pr[3] - 0.2));
  col.rect(pr, y, y + 0.32);
  bag.add('marble_smooth', lathe([[0.18, 0], [0.12, 0.2], [0.08, 0.5], [0.001, 0.55]], 10, null, pc[0], y + 0.2, pc[1])); bag.add('water_jet', rod([pc[0], y + 0.75, pc[1]], [pc[0], y + 1.1, pc[1]], 0.014, 4));
  const rw = el.riwaq ?? 2.4, tx = [[x0 + t + rw + 3.0, z0 + t + 6.2], [x1 - t - rw - 3.0, z0 + t + 6.2], [x0 + t + rw + 3.0, zh - 3.4], [x1 - t - rw - 3.0, zh - 3.4]];
  for (const [ox, oz] of tx) {
    if (Math.hypot(ox - pc[0], oz - pc[1]) < 3.4) continue;
    const hgt = 3.0 + rand() * 0.5;
    bag.add('bark_grey', lathe([[0.14, 0], [0.1, 0.5], [0.08, hgt * 0.5], [0.001, hgt * 0.6]], 8, null, ox, y, oz)); col.circle(ox, oz, 0.14, y, y + 2);
    bag.add('lotus_leaf', lathe([[0.001, hgt * 0.42], [1.2, hgt * 0.55], [1.5, hgt * 0.75], [1.1, hgt * 0.98], [0.001, hgt * 1.12]], 9, (th, i) => 1 + 0.12 * Math.sin(th * 5 + i), ox, y, oz));
  }
  // the riwaq on east and west: an arcade round the court under a lean-to roof
  for (const s of [-1, 1]) {
    const xa = s < 0 ? x0 + t + rw : x1 - t - rw, ra = s < 0 ? [x0 + t, z0 + t, xa, zh] : [xa, z0 + t, x1 - t, zh], L2 = zh - (z0 + t + 0.0), n2 = Math.max(2, Math.round((L2 - 4.4) / 3.0)), st = [];
    for (let i = 0; i <= n2; i++) st.push({ u: 4.4 + (L2 - 4.4) * i / n2 - (i === n2 ? 0.28 : 0), w: 0.26 });
    st[0].u = 4.4 + 0.26;
    archRun(bag, [xa, z0 + t], [xa, zh], st, y, 2.3, 3.5, { abaci: false });
    for (let i = 0; i < st.length; i++) col.rect([xa - 0.26, z0 + t + st[i].u - 0.26, xa + 0.26, z0 + t + st[i].u + 0.26], y, y + 3.5);
    const xo = s < 0 ? x0 + t : x1 - t, ya = y + 3.55, yb = y + 4.1, tr = [];
    q4(tr, [xo, yb, z0 + t + 4.4], [xa, ya, z0 + t + 4.4], [xa, ya, zh], [xo, yb, zh]);
    bag.add('roof_tile', dbl(tr)); bag.add('cedar', box(Math.min(xo, xa), y + 3.45, z0 + t + 4.4, Math.max(xo, xa), y + 3.55, zh)); bag.add('timber', box(xa - 0.2, y + 3.5, z0 + t + 4.4, xa + 0.2, y + 3.62, zh));
    bag.add(LW, box(s < 0 ? xo : xo - 0.0, y + 3.55, z0 + t + 4.4, s < 0 ? xo + 0.0 + 0.01 : xo, yb, zh));
  }
  // the minaret on the north-west corner of the court
  if (el.minaret !== false) minaret(bag, col, [x0 + t, z0 + t, x0 + t + 4.4, z0 + t + 4.4], y, el.minH ?? 14);
}

// ——— the hammam ——————————————————————————————————————————————————————————————

/**
 * hammam: { rect, y } — a bathhouse after El Bañuelo (the 11th-century hammam of the Darro): the entrance on
 * the south, the vestibule with its bench, the cold room with a pool and two arcades of horseshoe arches on columns,
 * the warm room and the hot room each under a barrel vault pierced by star-shaped skylights, the furnace behind.
 */
function hammam(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, t = 0.5, H = 4.1;
  const xs = [x0, x0 + 4.9, x0 + 10.4, x0 + 14.9, x1], z = (z0 + z1) / 2;
  const names = ['vest', 'cold', 'warm', 'hot'];
  // floors and outer walls
  rectBox(bag, 'marble_floor', [x0 + t, z0 + t, x1 - t, z1 - t], y - 0.25, y + 0.05); col.floor([x0 + t, z0 + t, x1 - t, z1 - t], y + 0.05);
  const door = [z - 0.55, z + 0.55], ent = [(xs[0] + xs[1]) / 2 - 0.6, (xs[0] + xs[1]) / 2 + 0.6];
  holedWall(bag, col, LW, [x0, z0, x1, z0 + t], y, y + H + 0.5, [], true);
  holedWall(bag, col, LW, [x0, z1 - t, x1, z1], y, y + H + 0.5, [[ent[0], ent[1], y, y + 2.7]], true);
  holedWall(bag, col, LW, [x0, z0 + t, x0 + t, z1 - t], y, y + H + 0.5, [], false);
  holedWall(bag, col, LW, [x1 - t, z0 + t, x1, z1 - t], y, y + H + 0.5, [], false);
  archHead(bag, face('z', z1 - t, -1), ent[0], ent[1], y + 1.9, y + 2.7, t, 'horseshoe', { both: true });
  bag.add('wood_dark', box(ent[0] + 0.05, y + 0.05, z1 - t - 0.9, ent[0] + 0.11, y + 2.1, z1 - t - 0.05));
  // the partitions with a doorway each
  for (let i = 1; i < 4; i++) holedWall(bag, col, LW, [xs[i] - t / 2, z0 + t, xs[i] + t / 2, z1 - t], y, y + H, [[door[0], door[1], y, y + 2.3]], false);
  for (let i = 1; i < 4; i++) {
    for (const [at, n] of [[xs[i] - t / 2, -1], [xs[i] + t / 2, 1]]) archHead(bag, face('x', at, n), door[0], door[1], y + 1.75, y + 2.3, 0.04, 'horseshoe', { frame: true, alfiz: false, side: n < 0 ? 'near' : 'near' });
  }
  // the rooms' linings: the tile dado and the stucco above on each inner face
  const rooms = names.map((nm, i) => ({ nm, r: [xs[i] + (i === 0 ? t : t / 2), z0 + t, xs[i + 1] - (i === 3 ? t : t / 2), z1 - t] }));
  for (const { nm, r } of rooms) {
    const o = { shields: false, band: false, dadoScript: false, dado: nm === 'hot' ? 1.6 : 1.3 };
    const hs = (x) => [[door[0], door[1], y, y + 2.3]].filter(() => x);
    dress(bag, face('z', r[1], 1), r[0] + 0.05, r[2] - 0.05, y, y + 3.4, [], o);
    dress(bag, face('z', r[3], -1), r[0] + 0.05, r[2] - 0.05, y, y + 3.4, nm === 'vest' ? [[ent[0], ent[1], y, y + 2.7]] : [], o);
    if (nm !== 'vest') dress(bag, face('x', r[0], 1), r[1] + 0.05, r[3] - 0.05, y, y + 3.4, hs(true), o);
    if (nm !== 'hot') dress(bag, face('x', r[2], -1), r[1] + 0.05, r[3] - 0.05, y, y + 3.4, hs(true), o);
    if (nm === 'vest') dress(bag, face('x', r[0], 1), r[1] + 0.05, r[3] - 0.05, y, y + 3.4, [], o);
    if (nm === 'hot') dress(bag, face('x', r[2], -1), r[1] + 0.05, r[3] - 0.05, y, y + 3.4, [], o);
  }
  // each room under a barrel vault along x (planks plastered white), star skylights on its crown
  const vr = (r) => [r[0], r[1], r[2], r[3]];
  const vault = (r, y0, rise) => { plankVault(bag, vr(r), y0, rise, 'plaster_white', null, 'x'); };
  const skylights = (r, y0, rise, n) => {
    for (let i = 0; i < n; i++) {
      const sx = r[0] + (r[2] - r[0]) * (i + 0.5) / n, sy = y0 + rise - 0.015;
      for (const rot of [0, Math.PI / 4]) bag.add('daylight', place(box(-0.17, 0, -0.17, 0.17, 0.02, 0.17), sx, sy - 0.03, z, rot));
    }
  };
  for (const { nm, r } of rooms) {
    const y0 = y + 3.4, rise = 0.95; vault(r, y0, rise);
    skylights(r, y0, rise, nm === 'cold' ? 3 : nm === 'warm' ? 2 : nm === 'hot' ? 1 : 1);
    // the vault's end walls above the doorways, closed by the lining of stucco
    // the outer roof: a low hip of tiles over each room
  }
  const rf = [];
  for (const { r } of rooms) { const tr = [], c = [r[0] - 0.1, z0 - 0.15, r[2] + 0.1, z1 + 0.15], yb = y + H + 0.5, yt = yb + 0.9, a = [c[0] + 1.2, yt, z], b = [c[2] - 1.2, yt, z];
    tr.push(c[0], yb, c[1], ...a, ...b, c[0], yb, c[1], ...b, c[2], yb, c[1]); tr.push(c[2], yb, c[3], ...b, ...a, c[2], yb, c[3], ...a, c[0], yb, c[3]); tr.push(c[0], yb, c[3], ...a, c[0], yb, c[1]); tr.push(c[2], yb, c[1], ...b, c[2], yb, c[3]); rf.push(...tr);
    // a raised skylight drum on the ridge with the star in its cover
    bag.add(LW, box((r[0] + r[2]) / 2 - 0.55, yt - 0.05, z - 0.55, (r[0] + r[2]) / 2 + 0.55, yt + 0.38, z + 0.55));
    bag.add('roof_tile', box((r[0] + r[2]) / 2 - 0.65, yt + 0.38, z - 0.65, (r[0] + r[2]) / 2 + 0.65, yt + 0.5, z + 0.65));
  }
  bag.add('roof_tile', dbl(rf)); rectBox(bag, 'timber', [x0 - 0.15, z0 - 0.15, x1 + 0.15, z1 + 0.15], y + H + 0.38, y + H + 0.5);
  void tileFloor;
  // the vestibule: stone benches along the walls and a small basin
  const vr0 = rooms[0].r;
  for (const r of [[vr0[0] + 0.05, vr0[1] + 0.05, vr0[2] - 0.05, vr0[1] + 0.6], [vr0[0] + 0.05, vr0[1] + 0.6, vr0[0] + 0.6, vr0[3] - 2.2]]) { rectBox(bag, 'marble_smooth', r, y + 0.05, y + 0.48); col.rect(r, y + 0.05, y + 0.48); }
  bag.add('marble_smooth', lathe([[0.4, 0], [0.4, 0.5], [0.3, 0.55], [0.001, 0.55]], 12, null, vr0[2] - 0.8, y + 0.05, vr0[1] + 0.8)); col.circle(vr0[2] - 0.8, vr0[1] + 0.8, 0.4, y, y + 0.55);
  // the cold room: a pool with a marble kerb and the two arcades on columns along it
  const cr = rooms[1].r, cx = (cr[0] + cr[2]) / 2, pool = [cx - 1.15, z - 1.3, cx + 1.15, z + 1.3];
  for (const r of [[pool[0], pool[1], pool[2], pool[1] + 0.22], [pool[0], pool[3] - 0.22, pool[2], pool[3]], [pool[0], pool[1] + 0.22, pool[0] + 0.22, pool[3] - 0.22], [pool[2] - 0.22, pool[1] + 0.22, pool[2], pool[3] - 0.22]]) { rectBox(bag, 'marble_smooth', r, y - 0.5, y + 0.4); col.rect(r, y, y + 0.4); }
  bag.add('marble_smooth', box(pool[0] + 0.22, y - 0.5, pool[1] + 0.22, pool[2] - 0.22, y - 0.4, pool[3] - 0.22)); bag.add('water', box(pool[0] + 0.22, y - 0.4, pool[1] + 0.22, pool[2] - 0.22, y + 0.32, pool[3] - 0.22));
  for (const sz of [-1, 1]) {
    const zl = z + sz * (cr[3] - cr[1]) * 0.5 - sz * 1.45, st = [];
    for (let i = 0; i < 4; i++) { const u = 0.55 + (cr[2] - cr[0] - 1.1) * i / 3; st.push({ u, w: 0.17 }); nColumn(bag, col, cr[0] + u, zl, y + 0.05, 2.1); }
    archRun(bag, [cr[0], zl], [cr[2], zl], st, y + 0.05, 2.1, 3.0, { abaci: false });
    for (const s of st) col.circle(cr[0] + s.u, zl, 0.17, y, y + 3.0);
  }
  // the hot room: a platform of marble along the east end under the heat, a basin, the furnace behind the wall
  const hr = rooms[3].r;
  { const pl = [hr[0] + 0.1, hr[1] + 0.1, hr[2] - 0.1, hr[1] + 1.2]; rectBox(bag, 'marble_smooth', pl, y + 0.05, y + 0.5); col.rect(pl, y + 0.05, y + 0.5); const p2 = [hr[0] + 0.1, hr[3] - 1.2, hr[2] - 0.1, hr[3] - 0.1]; rectBox(bag, 'marble_smooth', p2, y + 0.05, y + 0.5); col.rect(p2, y + 0.05, y + 0.5); }
  // the furnace: a block of brick on the north-east with the stack
  const fb = [x1 - 3.6, z0 - 3.2, x1, z0]; rectBox(bag, 'brick', fb, y, y + 2.6); col.rect(fb, y, y + 2.6);
  bag.add('brick', box(x1 - 2.2, y + 2.6, z0 - 2.2, x1 - 1.0, y + 7.2, z0 - 1.0)); bag.add('limestone', box(x1 - 2.3, y + 7.2, z0 - 2.3, x1 - 0.9, y + 7.4, z0 - 0.9));
  bag.add('roof_tile', box(fb[0] - 0.1, y + 2.6, fb[1] - 0.1, fb[2] + 0.1, y + 2.72, fb[3] + 0.0));
  // a cistern's well and the wood store (stacked firewood) against the furnace
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3 - (i % 2); j++) bag.add('timber', rod([x1 - 6.3 + i * 0.12, y + 0.14 + j * 0.24, z0 - 0.4], [x1 - 6.3 + i * 0.12, y + 0.14 + j * 0.24, z0 - 2.6], 0.1, 5));
}

// ——— the Alcaicería ——————————————————————————————————————————————————————————

const BOLTS = ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_maroon', 'cloth_indigo'];
export const SOUK_KINDS = ['silk', 'silk', 'pottery', 'brass', 'spice', 'leather', 'silk', 'rugs'];
/**
 * The plan of the Alcaicería on rect r: the lanes (rectangles), the booths { rect, front ('n' | 's'), kind } and the
 * gates { at, side }. Rows run along x: a booth row on the north wall, three double blocks and a booth row on the south wall,
 * four lanes between; the cross lanes cut the rows into three segments; the booths 2.5 m wide and 2.4 deep.
 */
export function soukPlan(r) {
  const [x0, z0, x1, z1] = r, t = 0.6, B = 2.4, BW = 2.5, XL = 2.4, W = x1 - x0, D = z1 - z0, blocks = 3;
  const LZ = (D - 2 * t - 2 * B - blocks * (2 * B + 0.3)) / (blocks + 1);
  const rows = [], lanes = [];
  let z = z0 + t;
  rows.push({ z0: z, z1: z + B, front: 's' }); z += B;
  const laneZ = [];
  for (let k = 0; k <= blocks; k++) {
    laneZ.push([z, z + LZ]); z += LZ;
    if (k < blocks) { rows.push({ z0: z, z1: z + B, front: 'n' }); rows.push({ z0: z + B + 0.3, z1: z + 2 * B + 0.3, front: 's' }); z += 2 * B + 0.3; }
  }
  rows.push({ z0: z, z1: z + B, front: 'n' });
  const segW = (W - 2 * t - 2 * XL - 2 * XL) / 3, segs = [], crossX = [];
  let x = x0 + t + XL;
  crossX.push([x0 + t, x]);
  for (let i = 0; i < 3; i++) { segs.push([x, x + segW]); x += segW; crossX.push([x, x + XL]); x += XL; }
  crossX[crossX.length - 1] = [x - XL, x];
  const booths = []; let bi = 0;
  for (const rw of rows) for (const [sx0, sx1] of segs) {
    const n = Math.floor((sx1 - sx0) / BW), w = (sx1 - sx0) / n;
    for (let i = 0; i < n; i++) booths.push({ rect: [sx0 + i * w, rw.z0, sx0 + (i + 1) * w, rw.z1], front: rw.front, kind: SOUK_KINDS[(bi++ * 5 + Math.floor(rw.z0)) % SOUK_KINDS.length], block: rows.indexOf(rw), seg: segs.indexOf([sx0, sx1]) });
  }
  for (const [a, b] of laneZ) lanes.push([x0 + t, a, x1 - t, b]);
  for (const [a, b] of crossX) lanes.push([a, z0 + t, b, z1 - t]);
  const gates = [{ side: 'w', at: (laneZ[1][0] + laneZ[1][1]) / 2 }, { side: 'e', at: (laneZ[2][0] + laneZ[2][1]) / 2 }, { side: 'n', at: (crossX[1][0] + crossX[1][1]) / 2 }, { side: 's', at: (crossX[2][0] + crossX[2][1]) / 2 }];
  return { rows, segs, laneZ, crossX, booths, lanes, gates, t, B, LZ, segW };
}

/** One booth: its counter, awning and goods by kind. f: the lane the front opens on ('n' | 's'). */
function booth(bag, col, b, y, rand) {
  const [x0, z0, x1, z1] = b.rect, s = b.front === 's', fz = s ? z1 : z0, bz = s ? z0 : z1, n = s ? -1 : 1, W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2;
  const Z = (d) => fz + n * d;                    // d metres in from the front (n points into the booth)
  const R = (a, bb, u0, u1) => { const p = Z(a), q = Z(bb); return [u0, Math.min(p, q), u1, Math.max(p, q)]; };
  // the dividing walls and the floor of raised boards
  rectBox(bag, LW, [x0 - 0.09, Math.min(fz, bz), x0 + 0.09, Math.max(fz, bz)], y, y + 3.0); col.rect([x0 - 0.09, Math.min(fz, bz), x0 + 0.09, Math.max(fz, bz)], y, y + 3.0);
  rectBox(bag, 'timber', R(0, D, x0 + 0.09, x1 - 0.09), y, y + 0.38);
  const goods = (kind) => {
    const yb = y + 0.38;
    if (kind === 'silk' || kind === 'rugs') {
      // three shelves along the back wall with bolts of cloth, more bolts piled on the counter
      for (let k = 0; k < 3; k++) { rectBox(bag, 'wood_dark', R(D - 0.5, D - 0.05, x0 + 0.1, x1 - 0.1), yb + 0.55 + k * 0.62, yb + 0.6 + k * 0.62);
        for (let i = 0; i < 4; i++) { const m = BOLTS[Math.floor(rand() * BOLTS.length)], u = x0 + 0.3 + i * (W - 0.6) / 4; bag.add(m, box(u, yb + 0.6 + k * 0.62, Z(D - 0.45) - (s ? -0 : 0), u + (W - 0.6) / 4 - 0.06, yb + 0.6 + k * 0.62 + 0.3, Z(D - 0.1))); } }
      for (let k = 0; k < 4; k++) bag.add(BOLTS[Math.floor(rand() * BOLTS.length)], box(...((r) => [r[0], yb + 0.55 + k * 0.1, r[1], r[2], yb + 0.65 + k * 0.1, r[3]])(R(0.15, 0.6, x1 - 0.65 - (k % 2) * 0.05, x1 - 0.2))));
      if (kind === 'rugs') bag.add('cloth_maroon', box(...((r) => [r[0], yb, r[1], r[2], yb + 0.9, r[3]])(R(0.05, 0.4, x0 + 0.2, x0 + 0.6))));
      // a length of cloth hung from the awning's edge
      const hz = Z(-0.55); bag.add(BOLTS[Math.floor(rand() * BOLTS.length)], box(cx - 0.35, y + 1.6, Math.min(hz, hz - n * 0.03), cx + 0.35, y + 2.75, Math.max(hz, hz - n * 0.03)));
    } else if (kind === 'pottery') {
      for (let k = 0; k < 3; k++) { rectBox(bag, 'wood_dark', R(D - 0.5, D - 0.05, x0 + 0.1, x1 - 0.1), yb + 0.55 + k * 0.6, yb + 0.6 + k * 0.6);
        for (let i = 0; i < 4; i++) { const u = x0 + 0.35 + i * (W - 0.7) / 3, m = ['glaze_blue', 'glaze_white', 'terracotta', 'glaze_green'][(i + k) % 4]; bag.add(m, lathe([[0.001, 0], [0.09, 0.02], [0.14, 0.14], [0.1, 0.26], [0.06, 0.3], [0.08, 0.34], [0.001, 0.34]], 8, null, u, yb + 0.6 + k * 0.6, Z(D - 0.27))); } }
      for (let i = 0; i < 5; i++) bag.add(['glaze_white', 'glaze_blue', 'terracotta'][i % 3], lathe([[0.001, 0], [0.16, 0.02], [0.2, 0.1], [0.001, 0.1]], 8, null, cx - 0.6 + i * 0.3, yb + 0.55 + (i % 2) * 0.0, Z(0.45)));
    } else if (kind === 'brass') {
      for (let i = 0; i < 4; i++) { const u = x0 + 0.35 + i * (W - 0.7) / 3; bag.add('bronze', lathe([[0.001, 0], [0.1, 0.0], [0.12, 0.1], [0.05, 0.2], [0.001, 0.22]], 8, null, u, yb + 1.5, Z(D - 0.3))); bag.add('iron', rod([u, yb + 1.74, Z(D - 0.3)], [u, yb + 1.9, Z(D - 0.3)], 0.01, 4)); bag.add('bronze', lathe([[0.2, 0], [0.22, 0.06], [0.14, 0.2], [0.001, 0.2]], 10, null, u, yb + 0.55 + 0.5, Z(D - 0.35))); }
      rectBox(bag, 'wood_dark', R(D - 0.5, D - 0.05, x0 + 0.1, x1 - 0.1), yb + 1.0, yb + 1.05);
      for (let i = 0; i < 3; i++) bag.add('bronze', lathe([[0.001, 0], [0.24, 0.0], [0.3, 0.1], [0.28, 0.14], [0.001, 0.14]], 10, null, cx - 0.55 + i * 0.5, yb + 0.55, Z(0.5)));
    } else if (kind === 'spice') {
      for (let i = 0; i < 4; i++) { const u = x0 + 0.38 + i * (W - 0.76) / 3, m = ['cloth_red', 'cloth_ochre', 'cloth_brown', 'cloth_green'][i]; bag.add('sacking', lathe([[0.3, 0], [0.32, 0.2], [0.28, 0.4], [0.3, 0.42], [0.001, 0.42]], 10, null, u, yb, Z(0.75))); bag.add(m, lathe([[0.001, 0.3], [0.24, 0.4], [0.001, 0.56]], 8, null, u, yb, Z(0.75))); }
      for (let k = 0; k < 2; k++) rectBox(bag, 'wood_dark', R(D - 0.45, D - 0.05, x0 + 0.1, x1 - 0.1), yb + 0.7 + k * 0.7, yb + 0.75 + k * 0.7);
      for (let i = 0; i < 5; i++) bag.add('wicker', lathe([[0.11, 0], [0.13, 0.12], [0.001, 0.12]], 8, null, x0 + 0.3 + i * (W - 0.6) / 4, yb + 0.75, Z(D - 0.25)));
    } else {
      // leather: slippers and bags hung on pegs, a pile of hides on the counter
      for (let i = 0; i < 5; i++) { const u = x0 + 0.3 + i * (W - 0.6) / 4; bag.add(i % 2 ? 'hide_brown' : 'hide_tan', box(u - 0.08, yb + 0.9, Math.min(Z(D - 0.16), Z(D - 0.22)), u + 0.08, yb + 1.45, Math.max(Z(D - 0.16), Z(D - 0.22)))); }
      for (let k = 0; k < 4; k++) bag.add(['hide_tan', 'hide_brown', 'hide_white', 'hide_black'][k], box(...((r) => [r[0], yb + 0.55 + k * 0.07, r[1], r[2], yb + 0.62 + k * 0.07, r[3]])(R(0.12, 0.62, cx - 0.5 + (k % 2) * 0.03, cx + 0.2))));
    }
  };
  // the counter across the front, the awning of a raised shutter over it, a valance of cloth
  rectBox(bag, 'wood_dark', R(0.0, 0.5, x0 + 0.09, x1 - 0.09), y + 0.38, y + 0.46); rectBox(bag, 'timber', R(0.04, 0.46, x0 + 0.09, x1 - 0.09), y + 0.84, y + 0.9);
  rectBox(bag, 'timber', R(0.04, 0.08, x0 + 0.09, x1 - 0.09), y + 0.38, y + 0.84); col.rect(R(0.0, 0.5, x0 + 0.09, x1 - 0.09), y, y + 0.95);
  const aw = [], zA = Z(0.0), zB = Z(-0.9);
  aw.push(x0 - 0.05, y + 3.05, zA, x1 + 0.05, y + 3.05, zA, x1 + 0.05, y + 2.9, zB, x0 - 0.05, y + 3.05, zA, x1 + 0.05, y + 2.9, zB, x0 - 0.05, y + 2.9, zB);
  bag.add('timber', dbl(aw));
  { const c = BOLTS[Math.floor(rand() * 4)]; bag.add(c, box(x0 + 0.02, y + 2.5, Math.min(zB, zB - n * 0.03), x1 - 0.02, y + 2.9, Math.max(zB, zB - n * 0.03))); }
  goods(b.kind);
  void bz;
}

/**
 * alcaiceria: { rect, y, seed } — the silk market after the Alcaicería (a closed quarter of narrow lanes, its shops of
 * the silk merchants, with gates shut at night): a wall round, gates of horseshoe arches, lanes of flags, the rows of
 * booths under pitched tile roofs with a counter and an awning on the lane, their goods by trade.
 */
function alcaiceria(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed ?? 3), P = soukPlan(el.rect), t = P.t;
  // the lanes
  for (const r of P.lanes) { rectBox(bag, 'flagstone', r, y - 0.25, y + 0.04); col.floor(r, y + 0.04); }
  // the perimeter walls with the gates
  const holes = { n: [], s: [], w: [], e: [] };
  for (const g of P.gates) holes[g.side].push([g.at - 1.1, g.at + 1.1, y, y + 3.4]);
  holedWall(bag, col, LW, [x0, z0, x1, z0 + t], y, y + 4.6, holes.n, true); holedWall(bag, col, LW, [x0, z1 - t, x1, z1], y, y + 4.6, holes.s, true);
  holedWall(bag, col, LW, [x0, z0 + t, x0 + t, z1 - t], y, y + 4.6, holes.w, false); holedWall(bag, col, LW, [x1 - t, z0 + t, x1, z1 - t], y, y + 4.6, holes.e, false);
  for (const g of P.gates) {
    const h = [g.at - 1.1, g.at + 1.1], f = g.side === 'n' ? face('z', z0, 1) : g.side === 's' ? face('z', z1 - t, 1) : g.side === 'w' ? face('x', x0, 1) : face('x', x1 - t, 1);
    archHead(bag, f, h[0], h[1], y + 2.3, y + 3.4, t, 'horseshoe', { both: true });
    const dz = g.side === 'n' ? [h[1] - 0.1, z0 + 0.05, h[1] - 0.04, z0 + 1.0] : g.side === 's' ? [h[1] - 0.1, z1 - 1.0, h[1] - 0.04, z1 - 0.05] : g.side === 'w' ? [x0 + 0.05, h[1] - 0.1, x0 + 1.0, h[1] - 0.04] : [x1 - 1.0, h[1] - 0.1, x1 - 0.05, h[1] - 0.04];
    bag.add('wood_dark', box(dz[0], y + 0.05, dz[1], dz[2], y + 2.8, dz[3]));
  }
  // the booths, and the roofs over the rows: a ridge between the two rows of a block, a lean-to on the walls
  for (const b of P.booths) booth(bag, col, b, y, rand);
  const yE = y + 3.15, tr = [], un = [];
  for (let i = 0; i < P.rows.length;) {
    const r1 = P.rows[i], double = P.rows[i + 1] && Math.abs(P.rows[i + 1].z0 - (r1.z1 + 0.3)) < 0.01 && r1.front === 'n';
    for (const [sx0, sx1] of P.segs) {
      if (double) {
        const r2 = P.rows[i + 1], zm = (r1.z0 + r2.z1) / 2, ex = 0.9, a = sx0 - 0.05, b = sx1 + 0.05, ya = yE, yr = yE + 1.05;
        q4(tr, [a, ya - 0.2, r1.z0 - ex], [a, yr, zm], [b, yr, zm], [b, ya - 0.2, r1.z0 - ex]); q4(tr, [a, yr, zm], [a, ya - 0.2, r2.z1 + ex], [b, ya - 0.2, r2.z1 + ex], [b, yr, zm]);
        q4(un, [a, ya - 0.2 - 0.1, r1.z0 - ex], [a, yr - 0.1, zm], [b, yr - 0.1, zm], [b, ya - 0.2 - 0.1, r1.z0 - ex]); q4(un, [a, yr - 0.1, zm], [a, ya - 0.2 - 0.1, r2.z1 + ex], [b, ya - 0.2 - 0.1, r2.z1 + ex], [b, yr - 0.1, zm]);
        // the gable ends closed over the cross lanes
        for (const xx of [a + 0.0, b - 0.0]) { const g = []; g.push(xx, ya - 0.2 - 0.1, r1.z0 - ex, xx, yr - 0.1, zm, xx, ya - 0.2 - 0.1, r2.z1 + ex); bag.add('timber', dbl(g)); }
        // the dividing wall of the two rows, above the shelves
        rectBox(bag, LW, [sx0, zm - 0.15, sx1, zm + 0.15], y, yE + 0.9); col.rect([sx0, zm - 0.15, sx1, zm + 0.15], y, yE + 0.9);
      } else if (r1.front === 's' && i === 0) {
        // the north wall's row: a lean-to from the wall's top down over the awnings
        const a = sx0 - 0.05, b = sx1 + 0.05, zb = r1.z0, zf = r1.z1 + 0.9;
        q4(tr, [a, y + 4.4, zb], [a, yE - 0.15, zf], [b, yE - 0.15, zf], [b, y + 4.4, zb]); q4(un, [a, y + 4.3, zb], [a, yE - 0.25, zf], [b, yE - 0.25, zf], [b, y + 4.3, zb]);
        rectBox(bag, LW, [sx0, zb - 0.05, sx1, zb + 0.15], y, y + 4.4);
      } else if (r1.front === 'n' && i === P.rows.length - 1) {
        const a = sx0 - 0.05, b = sx1 + 0.05, zb = r1.z1, zf = r1.z0 - 0.9;
        q4(tr, [a, yE - 0.15, zf], [a, y + 4.4, zb], [b, y + 4.4, zb], [b, yE - 0.15, zf]); q4(un, [a, yE - 0.25, zf], [a, y + 4.3, zb], [b, y + 4.3, zb], [b, yE - 0.25, zf]);
        rectBox(bag, LW, [sx0, zb - 0.15, sx1, zb + 0.05], y, y + 4.4);
      }
    }
    // the back walls of the lean-to rows' booths
    i += double ? 2 : 1;
  }
  bag.add('roof_tile', dbl(tr)); bag.add('timber', dbl(un));
  // the lanes' crossings and the gates' porches: a hung lantern at each crossing
  for (const [a, b] of P.crossX) for (const [c, d] of P.laneZ) { const lx = (a + b) / 2, lz = (c + d) / 2; bag.add('iron', rod([lx, y + 3.9, lz], [lx, y + 3.1, lz], 0.01, 4)); bag.add('lamp_paper', lathe([[0.001, 0], [0.14, 0.08], [0.16, 0.22], [0.12, 0.34], [0.001, 0.34]], 8, null, lx, y + 2.78, lz)); void d; void c; }
}

export const MEDINA = { darro, darro_bridge: darroBridge, mosque, hammam, alcaiceria };

// The Nasrid palaces about 1390 (docs/settlements/granada.md §4.2–§4.4): the Comares palace — the Court
// of the Myrtles with its pool, myrtle hedges and fountains, the porticoes of seven arches, the Sala
// de la Barca and the Hall of the Ambassadors inside the Comares Tower — and the halls round the
// Court of the Lions: the Two Sisters with the Sala de los Ajimeces and the Mirador de Lindaraja, the
// Abencerrajes, the Hall of the Kings.

import { box, rod, place } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { holedWall, face, dress, archHead, cupola, starDome, starCeiling, plankVault, hipRoof, tileFloor, floorFountain, crenels, nColumn, archRun, dbl } from './halls.js';

const PL = 'plaster_white', SC = 'stucco_cream', SW = 'stucco_warm', MS = 'marble_smooth', RED = 'tuff_red';
const q4 = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);
/** A sloping slab of tiles over a gallery: from (z = za, y = ya) to (z = zb, y = yb) across x0..x1 (or along x when alongZ is false). */
function slabZ(bag, x0, x1, za, ya, zb, yb) {
  const t = [], e = [];
  q4(t, [x0, ya, za], [x1, ya, za], [x1, yb, zb], [x0, yb, zb]);
  q4(e, [x0, ya - 0.16, za], [x1, ya - 0.16, za], [x1, yb - 0.16, zb], [x0, yb - 0.16, zb]);
  q4(e, [x0, yb - 0.16, zb], [x1, yb - 0.16, zb], [x1, yb, zb], [x0, yb, zb]);
  for (const x of [x0, x1]) q4(e, [x, ya - 0.16, za], [x, yb - 0.16, zb], [x, yb, zb], [x, ya, za]);
  bag.add('roof_tile', dbl(t)); bag.add('timber', dbl(e));
}
/** A threshold of marble in a doorway (the wall's rect, the door's span). */
function sill(bag, col, r, y) { bag.add(MS, box(r[0], y - 0.3, r[1], r[2], y + 0.05, r[3])); col.floor(r, y + 0.05); }
/** Small windows of pierced stucco high in a dressed face: n of them across u0..u1 at y0..y1, light behind. */
function grilles(bag, f, u0, u1, y0, y1, n) {
  for (let i = 0; i < n; i++) {
    const u = u0 + (i + 0.5) * (u1 - u0) / n, r = f.R(0.025, 0.033, u - 0.32, u + 0.32), fr = f.R(0.025, 0.06, u - 0.42, u + 0.42);
    bag.add('daylight', box(r[0], y0, r[1], r[2], y1, r[3]));
    bag.add(SW, box(fr[0], y0 - 0.1, fr[1], fr[2], y0, fr[3])); bag.add(SW, box(fr[0], y1, fr[1], fr[2], y1 + 0.1, fr[3]));
    for (const s of [-1, 1]) { const g = f.R(0.025, 0.06, u + s * 0.32 - (s > 0 ? 0 : 0.1), u + s * 0.32 + (s > 0 ? 0.1 : 0)); bag.add(SW, box(g[0], y0, g[1], g[2], y1, g[3])); }
    for (let k = 1; k < 4; k++) { const g = f.R(0.033, 0.045, u - 0.32 + k * 0.16 - 0.012, u - 0.32 + k * 0.16 + 0.012); bag.add(SC, box(g[0], y0, g[1], g[2], y1, g[3])); }
  }
}
/** A lattice of rhombs (sebka) in relief on a face over u0..u1, v0..v1. */
function sebka(bag, f, u0, u1, v0, v1, sp = 0.5, m = 1.7, d = 0.04) {
  const H = v1 - v0;
  for (const sg of [1, -1]) for (let c = u0 - H / m; c < u1; c += sp) {
    let a = c, b = c + H / m; const ca = Math.max(a, u0), cb = Math.min(b, u1); if (cb - ca < 0.05) continue;
    const Y = (u) => (sg > 0 ? v0 + m * (u - c) : v1 - m * (u - c));
    bag.add(SC, rod(f.P(ca, Y(ca), d), f.P(cb, Y(cb), d), 0.018, 4));
  }
  for (const [a, b] of [[[u0, v0], [u1, v0]], [[u0, v1], [u1, v1]], [[u0, v0], [u0, v1]], [[u1, v0], [u1, v1]]]) bag.add(SC, rod(f.P(a[0], a[1], d), f.P(b[0], b[1], d), 0.03, 4));
}
/** A wooden door leaf closed in a hole of the lining (the wall's face behind), its frame and studs. */
function closedDoor(bag, f, u, y, w = 1.0, h = 2.9) {
  const r = f.R(0.005, 0.05, u - w, u + w); bag.add('wood_dark', box(r[0], y + 0.05, r[1], r[2], y + h, r[3]));
  for (let k = 1; k < 5; k++) { const s = f.R(0.05, 0.065, u - w + 0.08, u + w - 0.08); bag.add('timber', box(s[0], y + k * h / 5 - 0.03, s[1], s[2], y + k * h / 5 + 0.03, s[3])); }
  const m = f.R(0.05, 0.07, u - 0.015, u + 0.015); bag.add('timber', box(m[0], y + 0.05, m[1], m[2], y + h, m[3]));
}
/** The posts of a pier at the end of an arcade, from the floor to the springing. */
function pier(bag, col, r, y, h) { bag.add(SC, box(r[0], y, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h); }

/**
 * comares: { rect (the Court of the Myrtles' open court), y } — the Comares palace (§4.2).
 */
export function comares(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, cx = (x0 + x1) / 2;
  const Wl = (r, y0, y1, holes = [], mat = PL) => holedWall(bag, col, mat, r, y0, y1, holes);
  // ——— the court: the long pool between marble kerbs, brimming; the myrtle hedges; a round fountain at each end
  const pw = 3.55, k = 0.3, pz0 = z0 + 1.6, pz1 = z1 - 5.8, K = [cx - pw - k, pz0 - k, cx + pw + k, pz1 + k];
  for (const r of [[x0, z0, x1, K[1]], [x0, K[3], x1, z1], [x0, K[1], K[0], K[3]], [K[2], K[1], x1, K[3]]]) bag.add('marble', box(r[0], y - 0.3, r[1], r[2], y + 0.05, r[3]));
  col.floor([x0, z0, x1, z1], y + 0.05);
  for (const r of [[K[0], K[1], K[2], pz0], [K[0], pz1, K[2], K[3]], [K[0], pz0, cx - pw, pz1], [cx + pw, pz0, K[2], pz1]]) bag.add(MS, box(r[0], y - 0.9, r[1], r[2], y + 0.12, r[3]));
  bag.add('marble_dark', box(cx - pw, y - 1.0, pz0, cx + pw, y - 0.9, pz1));
  STYLES.qing.elements.water_rect({ rect: [cx - pw, pz0, cx + pw, pz1], y: y + 0.09 }, ctx);
  col.rect(K, y - 1, y + 0.4);
  floorFountain(bag, col, cx, K[1] - 0.6, y + 0.05, 0.3, [0, 1, 0.6]);
  floorFountain(bag, col, cx, K[3] + 0.6, y + 0.05, 0.3, [0, -1, 0.6]);
  for (const s of [-1, 1]) {
    const xa = cx + s * (pw + k + 0.3), xb = cx + s * (pw + k + 1.35), lo = Math.min(xa, xb), hi = Math.max(xa, xb);
    for (let z = pz0 + 0.2; z < pz1 - 0.5; z += 6.9) {
      const zb = Math.min(pz1 - 0.2, z + 6.6);
      bag.add('lotus_leaf', box(lo, y + 0.05, z, hi, y + 0.78, zb));
      bag.add('lotus_leaf', box(lo + 0.08, y + 0.78, z + 0.08, hi - 0.08, y + 0.9, zb - 0.08));
      col.rect([lo, z, hi, zb], y, y + 0.9);
    }
  }
  // ——— the side ranges east and west: rooms behind plain faces (doors, small windows); a passage east to the Court of the Lions
  const zN = z0 - 10.4, zS = z1 + 5.2, pass = [-9.6, -7.4];
  for (const [r, f, doors, holes] of [[[x0 - 7, zN, x0, zS], face('x', x0, 1), [-24, -14, -4], []], [[x1, zN, x1 + 7, zS], face('x', x1, -1), [-24, -16, -2], [[pass[0], pass[1], y, y + 3.4]]]]) {
    Wl(r, y - 0.5, y + 9, holes); hipRoof(bag, r, y + 9, 1.6, 0.3);
    const dh = doors.map((u) => [u - 1.1, u + 1.1, y, y + 3.1]), all = dh.concat(holes);
    dress(bag, f, z0 - 4.5, z1 + 4.4, y, y + 6.2, all);
    for (const u of doors) { closedDoor(bag, f, u, y); for (const [a, b] of [[[u - 1.25, y], [u - 1.25, y + 3.5]], [[u - 1.25, y + 3.5], [u + 1.25, y + 3.5]], [[u + 1.25, y + 3.5], [u + 1.25, y]]]) bag.add(SC, rod(f.P(a[0], a[1], 0.05), f.P(b[0], b[1], 0.05), 0.04, 4)); }
    for (const u of [-28, -20, -10, 0]) { const o = f.R(0.025, 0.03, u - 0.4, u + 0.4); bag.add('opening', box(o[0], y + 4.4, o[1], o[2], y + 5.4, o[3])); }
  }
  tileFloor(bag, col, [x1, pass[0], x1 + 7, pass[1]], y);
  // ——— the porticoes: seven arches on slender columns, the middle one wider; a carved frieze; tiled roofs
  const st = [{ u: 0.5, w: 0.5 }, ...[3.6, 6.4, 9.2, 13.8, 16.6, 19.4].map((u) => ({ u, w: 0.2 })), { u: x1 - x0 - 0.5, w: 0.5 }];
  const portico = (zl, yb, hc, top) => {
    archRun(bag, [x0, zl], [x1, zl], st, yb, hc, top, { sebka: true });
    for (const s of st.slice(1, -1)) nColumn(bag, col, x0 + s.u, zl, yb, hc);
    pier(bag, col, [x0, zl - 0.25, x0 + 1.0, zl + 0.25], yb, hc); pier(bag, col, [x1 - 1.0, zl - 0.25, x1, zl + 0.25], yb, hc);
  };
  // north: the portico, the door to the Barca, the roof sloping to the court
  const nb = [x0, z0 - 5.3, x1, z0 - 4.5], dN = [cx - 1.8, cx + 1.8, y, y + 4.6];
  portico(z0, y, 3.0, 6.2);
  Wl(nb, y - 0.5, y + 8.5, [dN]); sill(bag, col, [dN[0], nb[1], dN[1], nb[3]], y);
  archHead(bag, face('z', nb[3], -1), dN[0], dN[1], y + 3.3, y + 4.6, 0.8, 'lobed', { both: true });
  dress(bag, face('z', nb[3], 1), x0, x1, y, y + 6.2, [dN]);
  tileFloor(bag, col, [x0, nb[3], x1, z0], y);
  bag.add('cedar', box(x0, y + 6.2, nb[3], x1, y + 6.3, z0 + 0.25));
  for (let z = nb[3] + 0.3; z < z0 - 0.2; z += 0.62) bag.add('timber', box(x0, y + 6.08, z - 0.06, x1, y + 6.2, z + 0.06));
  bag.add('timber', box(x0, y + 5.95, z0 + 0.25, x1, y + 6.3, z0 + 0.36));
  slabZ(bag, x0 - 0.3, x1 + 0.3, nb[1] + 0.4, y + 8.5, z0 + 0.9, y + 6.75);
  // south: the portico and the gallery over it, the entrance in the south-west corner
  const sb = [x0, z1 + 4.4, x1, z1 + 5.2], dS = [x0 + 1.6, x0 + 3.6, y, y + 3.4];
  portico(z1, y, 3.0, 6.2);
  Wl(sb, y - 0.5, y + 11, [dS]); sill(bag, col, [dS[0], sb[1], dS[1], sb[3]], y);
  archHead(bag, face('z', sb[1], 1), dS[0], dS[1], y + 2.4, y + 3.4, 0.8, 'round', { both: true });
  dress(bag, face('z', sb[1], -1), x0, x1, y, y + 6.2, [dS]);
  tileFloor(bag, col, [x0, z1, x1, sb[1]], y);
  bag.add('cedar', box(x0, y + 6.2, z1 - 0.25, x1, y + 6.3, sb[1]));
  for (let z = z1 + 0.3; z < sb[1] - 0.2; z += 0.62) bag.add('timber', box(x0, y + 6.08, z - 0.06, x1, y + 6.2, z + 0.06));
  bag.add(PL, box(x0, y + 6.3, z1 - 0.25, x1, y + 6.75, sb[1])); col.floor([x0, z1 - 0.25, x1, sb[1]], y + 6.75);
  bag.add('timber', box(x0, y + 5.95, z1 - 0.36, x1, y + 6.3, z1 - 0.25));
  portico(z1, y + 6.75, 2.0, 3.0);
  dress(bag, face('z', sb[1], -1), x0, x1, y + 6.75, y + 9.75, [], { band: false, dadoScript: false, dado: 1.0 });
  bag.add('cedar', box(x0, y + 9.75, z1 - 0.25, x1, y + 9.85, sb[1]));
  slabZ(bag, x0 - 0.3, x1 + 0.3, sb[3] - 0.4, y + 11, z1 - 0.9, y + 9.95);
  // ——— the Sala de la Barca: a long hall under a rounded vault of wood, the alcoves at its ends behind arches
  const bz0 = z0 - 9.6, bz1 = nb[1], T = [11.5, z0 - 25.6, 27.5, bz0];
  Wl([x0 - 1, bz0 - 0.8, T[0], bz0], y - 0.5, y + 8.5); Wl([T[2], bz0 - 0.8, x1 + 1, bz0], y - 0.5, y + 8.5);
  tileFloor(bag, col, [x0, bz0, x1, bz1], y);
  const pS = [cx - 1.6, cx + 1.6, y, y + 5.3];
  dress(bag, face('z', bz1, -1), x0, x1, y, y + 5.0, [dN]);
  dress(bag, face('z', bz0, 1), x0, x1, y, y + 5.0, [pS]);
  dress(bag, face('x', x0, 1), bz0, bz1, y, y + 5.0); dress(bag, face('x', x1, -1), bz0, bz1, y, y + 5.0);
  for (const [a, b] of [[x0, x0 + 2.3], [x0 + 2.3, x1 - 2.3], [x1 - 2.3, x1]]) plankVault(bag, [a, bz0, b, bz1], y + 5.0, 1.55);
  for (const [xa, n] of [[x0 + 2.3, 1], [x1 - 2.3, -1]]) archHead(bag, face('x', xa - n * 0.25, n), bz0 + 0.03, bz1 - 0.03, y + 3.4, y + 5.0, 0.5, 'lobed', { both: true, alfiz: false });
  slabZ(bag, x0 - 1.3, x1 + 1.3, nb[1] + 0.4, y + 8.5, bz0 - 1.0, y + 9.4);
  // ——— the Comares Tower and the Hall of the Ambassadors inside it
  const [t0, u0, t1, u1] = T, I = [t0 + 2.35, u0 + 2.35, t1 - 2.35, u1 - 2.35], ic = [(I[0] + I[2]) / 2, (I[1] + I[3]) / 2], th = 1.8;
  bag.add(RED, box(t0, y - 12, u0, t1, y - 0.5, u1));
  const al = (c) => [[c - 1.2, c + 1.2], [c - 4.6, c - 2.6], [c + 2.6, c + 4.6]];
  const win = (c) => [[c - 0.8, c - 0.08], [c + 0.08, c + 0.8], [c - 4.05, c - 3.15], [c + 3.15, c + 4.05]];
  const H = (spans, v0, v1) => spans.map(([a, b]) => [a, b, v0, v1]);
  // north, east and west: an inner layer with the three alcoves, an outer one with their windows
  const sides = [
    { inner: [I[0] - th, I[1] - th, I[2] + th, I[1]], outer: [t0, u0, t1, I[1] - th], fi: face('z', I[1], 1), fa: face('z', I[1], -1), fw: face('z', I[1] - th, -1), c: ic[0], u: [I[0], I[2]], col: (a) => [a, (u0 + I[1] - th) / 2] },
    { inner: [I[2], I[1], I[2] + th, I[3]], outer: [I[2] + th, I[1] - th, t1, I[3]], fi: face('x', I[2], -1), fa: face('x', I[2], 1), fw: face('x', I[2] + th, 1), c: ic[1], u: [I[1], I[3]], col: (a) => [(t1 + I[2] + th) / 2, a] },
    { inner: [I[0] - th, I[1], I[0], I[3]], outer: [t0, I[1] - th, I[0] - th, I[3]], fi: face('x', I[0], 1), fa: face('x', I[0], -1), fw: face('x', I[0] - th, -1), c: ic[1], u: [I[1], I[3]], col: (a) => [(t0 + I[0] - th) / 2, a] },
  ];
  for (const s of sides) {
    const ah = H(al(s.c), y, y + 4.3), wh = H(win(s.c), y + 0.9, y + 3.3);
    Wl(s.inner, y - 0.5, y + 18.4, ah); Wl(s.outer, y - 0.5, y + 18.4, wh, RED);
    al(s.c).forEach(([a, b]) => archHead(bag, s.fa, a, b, y + 3.0, y + 4.3, th, 'round', { alfizUp: 0.45 }));
    win(s.c).forEach(([a, b]) => archHead(bag, s.fw, a, b, y + 2.9, y + 3.3, 0.55, 'round', { alfiz: false, mat: PL }));
    const [mx, mz] = s.col(s.c); bag.add('marble', rod([mx, y + 0.9, mz], [mx, y + 2.75, mz], 0.075, 8)); bag.add(MS, box(mx - 0.13, y + 2.75, mz - 0.13, mx + 0.13, y + 2.9, mz + 0.13));
    dress(bag, s.fi, s.u[0], s.u[1], y, y + 12.3, ah);
    // the alcoves lined like the hall: their backs round the windows, their sides
    const fb = face(s.fw.ax, s.fw.at, -s.fw.n);
    al(s.c).forEach(([a, b]) => { dress(bag, fb, a, b, y, y + 4.3, wh.filter((h) => h[0] > a && h[1] < b), { band: false, dadoScript: false }); });
    grilles(bag, s.fi, s.u[0] + 0.6, s.u[1] - 0.6, y + 10.2, y + 11.0, 5);
    sebka(bag, s.fi, s.u[0] + 0.5, s.u[1] - 0.5, y + 4.9, y + 9.7);
  }
  // south: the passage from the Barca through the tower's wall, its arch, the small niches in its jambs
  Wl([t0, I[3], t1, u1], y - 0.5, y + 9.4, [pS]); Wl([t0, I[3], t1, u1], y + 9.4, y + 18.4, [], RED);
  sill(bag, col, [pS[0], I[3], pS[1], u1], y);
  archHead(bag, face('z', u1, -1), pS[0], pS[1], y + 3.7, y + 5.3, 2.35, 'round', { both: true });
  for (const [xj, n] of [[pS[0], 1], [pS[1], -1]]) { const f = face('x', xj, n); const r = f.R(0.0, 0.02, (I[3] + u1) / 2 - 0.35, (I[3] + u1) / 2 + 0.35); bag.add('glaze_white', box(r[0], y + 0.9, r[1], r[2], y + 2.3, r[3])); const o = f.R(0.02, 0.025, (I[3] + u1) / 2 - 0.22, (I[3] + u1) / 2 + 0.22); bag.add('opening', box(o[0], y + 1.0, o[1], o[2], y + 2.1, o[3])); }
  const fS = face('z', I[3], -1);
  dress(bag, fS, I[0], I[2], y, y + 12.3, [pS]);
  grilles(bag, fS, I[0] + 0.6, I[2] - 0.6, y + 10.2, y + 11.0, 5);
  sebka(bag, fS, I[0] + 0.5, I[2] - 0.5, y + 5.6, y + 9.7);
  // the floor of lustre tiles, the sultan's seat in the middle alcove facing the door, the ceiling
  tileFloor(bag, col, [I[0] - th, I[1] - th, I[2] + th, I[3]], y);
  bag.add('cloth_red', box(ic[0] - 1.05, y + 0.05, I[1] - th + 0.08, ic[0] + 1.05, y + 0.25, I[1] - 0.15));
  for (const dx of [-0.6, 0, 0.6]) bag.add('linen', box(ic[0] + dx - 0.26, y + 0.25, I[1] - th + 0.12, ic[0] + dx + 0.26, y + 0.62, I[1] - th + 0.36));
  starCeiling(bag, I, y + 12.3);
  // the small upper windows of the hall seen from outside, in the brick
  for (const f of [face('z', u0, -1), face('z', u1, 1), face('x', t0, -1), face('x', t1, 1)]) {
    const m0 = f.ax === 'z' ? I[0] : I[1], m1 = f.ax === 'z' ? I[2] : I[3];
    for (let i = 0; i < 5; i++) { const m = m0 + 0.6 + (i + 0.5) * (m1 - m0 - 1.2) / 5, o = f.R(-0.02, 0.03, m - 0.3, m + 0.3), fr = f.R(0, 0.08, m - 0.42, m + 0.42); bag.add('opening', box(o[0], y + 10.2, o[1], o[2], y + 11.0, o[3])); bag.add(PL, box(fr[0], y + 11.0, fr[1], fr[2], y + 11.12, fr[3])); bag.add(PL, box(fr[0], y + 10.08, fr[1], fr[2], y + 10.2, fr[3])); }
  }
  // above the hall the tower is built solid; its upper windows, the crenellated top
  bag.add(RED, box(t0, y + 18.4, u0, t1, y + 45, u1)); col.floor(T, y + 45);
  crenels(bag, T, y + 45);
  for (const f of [face('z', u0, -1), face('z', u1, 1), face('x', t0, -1), face('x', t1, 1)]) for (const m of f.ax === 'z' ? [ic[0] - 3, ic[0] + 3] : [ic[1] - 3, ic[1] + 3]) for (const yy of [y + 24, y + 33]) {
    if (f.ax === 'z' && f.at === u1 && yy < y + 26) continue;
    const fr = f.R(0, 0.12, m - 1.1, m + 1.1); bag.add('stucco_cream', box(fr[0], yy - 0.3, fr[1], fr[2], yy + 3.3, fr[3]));
    for (const d of [-0.5, 0.5]) { const o = f.R(0.12, 0.16, m + d - 0.36, m + d + 0.36); bag.add('opening', box(o[0], yy, o[1], o[2], yy + 2.6, o[3])); }
  }
}

/**
 * lions_halls: { rect (the Court of the Lions), y } — the walls round the court with their doors and
 * the halls behind them (§4.3).
 */
export function lionsHalls(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const Wl = (r, y0, y1, holes = [], mat = PL) => holedWall(bag, col, mat, r, y0, y1, holes);
  const solid = (r, h) => { Wl(r, y - 0.5, y + h); hipRoof(bag, r, y + h, 1.2, 0.3); };
  const gTop = y + 5.3;
  // ——— the west range, with the passage from the Myrtles; its face to the court
  const wr = [x0 - 7, z0 - 2.2, x0, z1 + 3], pass = [-9.6, -7.4], pH = [pass[0], pass[1], y, y + 3.4];
  Wl(wr, y - 0.5, y + 9, [pH]); hipRoof(bag, wr, y + 9, 1.6, 0.3); tileFloor(bag, col, [x0 - 7, pass[0], x0, pass[1]], y);
  archHead(bag, face('x', x0, -1), pass[0], pass[1], y + 2.3, y + 3.4, 0.6, 'round', { alfizUp: 0.5 });
  dress(bag, face('x', x0, 1), z0, z1, y, gTop, [pH]);
  // ——— north: the Hall of the Two Sisters, its side chambers, the Sala de los Ajimeces, the Mirador de Lindaraja
  const dN = [cx - 1.2, cx + 1.2, y, y + 4.2], hs = 4, S = [cx - hs, z0 - 1.4 - 2 * hs, cx + hs, z0 - 1.4], tw = 0.8;
  Wl([x0, z0 - 1.4, S[0] - tw, z0], y - 0.5, y + 9); Wl([S[2] + tw, z0 - 1.4, x1, z0], y - 0.5, y + 9);
  Wl([S[0] - tw, z0 - 1.4, S[2] + tw, z0], y - 0.5, y + 15.2, [dN]); sill(bag, col, [dN[0], z0 - 1.4, dN[1], z0], y);
  archHead(bag, face('z', z0, -1), dN[0], dN[1], y + 3.0, y + 4.2, 1.4, 'horseshoe', { both: true });
  dress(bag, face('z', z0, 1), x0, x1, y, gTop, [dN]);
  const chW = 2.6, aH = (a, b) => [a, b, y, y + 4.2], ach = aH(S[3] - 3.9, S[3] - 1.1);
  for (const [xw, n] of [[S[0], -1], [S[2], 1]]) {
    const wr2 = n < 0 ? [xw - tw, S[1], xw, S[3]] : [xw, S[1], xw + tw, S[3]];
    Wl(wr2, y - 0.5, y + 15.2, [ach]);
    archHead(bag, face('x', xw, n), ach[0], ach[1], y + 2.8, y + 4.2, tw, 'lobed', { both: true });
    // the side chamber: its walls, a little vault of wood, the filling of unbuilt rooms behind
    const cx0 = n < 0 ? xw - tw - chW : xw + tw, cx1 = cx0 + chW, cz0 = S[3] - 5.2;
    Wl(n < 0 ? [cx0 - tw, cz0 - tw, cx0, S[3]] : [cx1, cz0 - tw, cx1 + tw, S[3]], y - 0.5, y + 6); Wl([Math.min(cx0, cx1) - (n < 0 ? tw : 0), cz0 - tw, Math.max(cx0, cx1) + (n > 0 ? tw : 0), cz0], y - 0.5, y + 6);
    tileFloor(bag, col, [cx0, cz0, cx1, S[3]], y);
    const fx = face('x', n < 0 ? cx0 : cx1, n < 0 ? 1 : -1); dress(bag, fx, cz0, S[3], y, y + 3.6);
    dress(bag, face('z', cz0, 1), cx0, cx1, y, y + 3.6); dress(bag, face('z', S[3], -1), cx0, cx1, y, y + 3.6);
    dress(bag, face('x', n < 0 ? cx1 : cx0, n < 0 ? -1 : 1), cz0, S[3], y, y + 3.6, [ach]);
    plankVault(bag, [cx0, cz0, cx1, S[3]], y + 3.6, 1.0, 'cedar', 'timber', 'z');
    hipRoof(bag, [Math.min(cx0, cx1) - tw, cz0 - tw, Math.max(cx0, cx1) + tw, z0 - 1.4], y + 6, 0.9, 0.2);
    solid(n < 0 ? [x0, z0 - 15.4, cx0 - tw, z0 - 1.4] : [cx1 + tw, z0 - 15.4, x1 + 0.8, z0 - 1.4], 8);
    solid(n < 0 ? [cx0 - tw, z0 - 15.4, xw - tw, cz0 - tw] : [xw + tw, z0 - 15.4, cx1 + tw, cz0 - tw], 8);
  }
  const fN = [cx - 1.6, cx + 1.6, y, y + 4.4];
  Wl([S[0] - tw, S[1] - tw, S[2] + tw, S[1]], y - 0.5, y + 15.2, [fN]); sill(bag, col, [fN[0], S[1] - tw, fN[1], S[1]], y);
  archHead(bag, face('z', S[1], -1), fN[0], fN[1], y + 3.0, y + 4.4, tw, 'lobed', { both: true });
  tileFloor(bag, col, S, y);
  dress(bag, face('z', S[3], -1), S[0], S[2], y, y + 6.6, [dN]); dress(bag, face('z', S[1], 1), S[0], S[2], y, y + 6.6, [fN]);
  dress(bag, face('x', S[0], 1), S[1], S[3], y, y + 6.6, [ach]); dress(bag, face('x', S[2], -1), S[1], S[3], y, y + 6.6, [ach]);
  cupola(bag, cx, (S[1] + S[3]) / 2, hs, y + 6.6, y + 8.2, y + 10.0, 4.2, [16, 16, 32, 32, 16, 16, 8], 2);
  floorFountain(bag, col, cx, (S[1] + S[3]) / 2, y + 0.05, 0.5, [0, 1, S[3] - (S[1] + S[3]) / 2 + 1.4]);
  hipRoof(bag, [S[0] - tw, S[1] - tw, S[2] + tw, z0], y + 15.2, 2.4, 0.4);
  // the Sala de los Ajimeces: three bays under small muqarnas cupolas between arches
  const ab = 3.04, aw = 0.16, A = [cx - 1.5 * ab - aw, S[1] - tw - ab, cx + 1.5 * ab + aw, S[1] - tw];
  const mH = [cx - 1.0, cx + 1.0, y, y + 3.4];
  Wl([A[0] - tw, A[1], A[0], A[3]], y - 0.5, y + 7); Wl([A[2], A[1], A[2] + tw, A[3]], y - 0.5, y + 7);
  Wl([A[0] - tw, A[1] - tw, A[2] + tw, A[1]], y - 0.5, y + 7, [mH]); sill(bag, col, [mH[0], A[1] - tw, mH[1], A[1]], y);
  archHead(bag, face('z', A[1], -1), mH[0], mH[1], y + 2.4, y + 3.4, tw, 'lobed', { both: true });
  tileFloor(bag, col, A, y);
  for (let i = 0; i < 3; i++) {
    const bx = A[0] + i * (ab + aw), bcx = bx + ab / 2;
    cupola(bag, bcx, (A[1] + A[3]) / 2, ab / 2, y + 3.6, y + 4.4, y + 5.0, 1.4, [8, 8, 8, 4], 1);
    if (i < 2) { const xa = bx + ab; Wl([xa, A[1], xa + aw, A[3]], y + 3.6, y + 7); archHead(bag, face('x', xa, 1), A[1] + 0.02, A[3] - 0.02, y + 2.5, y + 3.6, aw, 'lobed', { both: true, alfiz: false }); }
  }
  dress(bag, face('z', A[3], -1), A[0], A[2], y, y + 3.6, [fN], { bandDrop: 0.55 }); dress(bag, face('z', A[1], 1), A[0], A[2], y, y + 3.6, [mH], { bandDrop: 0.55 });
  dress(bag, face('x', A[0], 1), A[1], A[3], y, y + 3.6, [], { bandDrop: 0.55 }); dress(bag, face('x', A[2], -1), A[1], A[3], y, y + 3.6, [], { bandDrop: 0.55 });
  hipRoof(bag, [A[0] - tw, A[1] - tw, A[2] + tw, A[3]], y + 7, 1.3, 0.3);
  // the Mirador: a small room standing out to the north, paired arched windows on three sides, the lantern of coloured glass
  const mw = 0.5, M = [cx - 1.6, A[1] - tw - 2.76, cx + 1.6, A[1] - tw];
  const pair = (c) => [[c - 0.95, c - 0.08], [c + 0.08, c + 0.95]];
  const mz = (M[1] + M[3]) / 2, mwall = [
    [[M[0] - mw, M[1] - mw, M[2] + mw, M[1]], pair(cx), face('z', M[1], 1), face('z', M[1] - mw, 1), [cx, M[1] - mw / 2], [M[0], M[2]]],
    [[M[0] - mw, M[1], M[0], M[3]], pair(mz), face('x', M[0], 1), face('x', M[0] - mw, 1), [M[0] - mw / 2, mz], [M[1], M[3]]],
    [[M[2], M[1], M[2] + mw, M[3]], pair(mz), face('x', M[2], -1), face('x', M[2] + mw, -1), [M[2] + mw / 2, mz], [M[1], M[3]]],
  ];
  for (const [r, sp, fi, fo, [px, pz], uu] of mwall) {
    const hh = H2(sp, y + 0.75, y + 2.75);
    Wl(r, y - 0.5, y + 5.6, hh);
    sp.forEach(([a, b]) => { archHead(bag, fo, a, b, y + 2.35, y + 2.75, mw, 'lobed', { both: true, alfiz: false }); });
    bag.add('marble', rod([px, y + 0.75, pz], [px, y + 2.2, pz], 0.06, 8)); bag.add(MS, box(px - 0.1, y + 2.2, pz - 0.1, px + 0.1, y + 2.35, pz + 0.1));
    dress(bag, fi, uu[0], uu[1], y, y + 4.4, hh, { band: false, dado: 0.7 });
    // the blind muqarnas arch framing the pair of windows
    archHead(bag, face(fi.ax, fi.at + fi.n * 0.06, -fi.n), (sp[0][0] - 0.25), (sp[1][1] + 0.25), y + 2.9, y + 3.9, 0.005, 'lobed', { frame: true });
  }
  tileFloor(bag, col, M, y);
  const Lt = [cx - 0.9, mz - 0.75, cx + 0.9, mz + 0.75];
  for (const r of [[M[0], M[1], M[2], Lt[1]], [M[0], Lt[3], M[2], M[3]], [M[0], Lt[1], Lt[0], Lt[3]], [Lt[2], Lt[1], M[2], Lt[3]]]) bag.add('cedar', box(r[0], y + 4.4, r[1], r[2], y + 4.55, r[3]));
  for (const [a, b] of [[[Lt[0], Lt[1]], [Lt[2], Lt[1]]], [[Lt[0], Lt[3]], [Lt[2], Lt[3]]], [[Lt[0], Lt[1]], [Lt[0], Lt[3]]], [[Lt[2], Lt[1]], [Lt[2], Lt[3]]]]) bag.add('cedar', box(Math.min(a[0], b[0]) - 0.04, y + 4.55, Math.min(a[1], b[1]) - 0.04, Math.max(a[0], b[0]) + 0.04, y + 5.3, Math.max(a[1], b[1]) + 0.04));
  bag.add('stained_glass', box(Lt[0], y + 5.2, Lt[1], Lt[2], y + 5.25, Lt[3]));
  for (let x = Lt[0] + 0.15; x < Lt[2]; x += 0.3) bag.add('timber', box(x - 0.015, y + 5.12, Lt[1], x + 0.015, y + 5.2, Lt[3]));
  for (let z = Lt[1] + 0.15; z < Lt[3]; z += 0.3) bag.add('timber', box(Lt[0], y + 5.12, z - 0.015, Lt[2], y + 5.2, z + 0.015));
  for (let i = 0; i < 6; i++) { const t = i * Math.PI / 3; bag.add('timber', rod([cx + Math.cos(t) * 0.7, y + 5.1, mz + Math.sin(t) * 0.55], [cx + Math.cos(t + 2.1) * 0.7, y + 5.1, mz + Math.sin(t + 2.1) * 0.55], 0.012, 4)); }
  hipRoof(bag, [M[0] - mw, M[1] - mw, M[2] + mw, M[3]], y + 5.6, 1.0, 0.3);
  // ——— south: the Hall of the Abencerrajes under its star dome, its side chambers behind double arches
  const dS = [cx - 1.2, cx + 1.2, y, y + 4.2], ha = 3.4, B = [cx - ha, z1 + 1.4, cx + ha, z1 + 1.4 + 2 * ha];
  Wl([x0, z1, B[0] - tw, z1 + 1.4], y - 0.5, y + 9); Wl([B[2] + tw, z1, x1, z1 + 1.4], y - 0.5, y + 9);
  Wl([B[0] - tw, z1, B[2] + tw, z1 + 1.4], y - 0.5, y + 12.6, [dS]); sill(bag, col, [dS[0], z1, dS[1], z1 + 1.4], y);
  archHead(bag, face('z', z1, 1), dS[0], dS[1], y + 3.0, y + 4.2, 1.4, 'horseshoe', { both: true });
  dress(bag, face('z', z1, -1), x0, x1, y, gTop, [dS]);
  const dbA = [B[1] + 1.5, B[3] - 1.5];
  for (const [xw, n] of [[B[0], -1], [B[2], 1]]) {
    const hh = [[dbA[0], dbA[1], y, y + 3.8]];
    Wl(n < 0 ? [xw - tw, B[1], xw, B[3] + tw] : [xw, B[1], xw + tw, B[3] + tw], y - 0.5, y + 12.6, hh);
    const fa = face('x', xw, n), mid = (dbA[0] + dbA[1]) / 2;
    archHead(bag, fa, dbA[0], mid - 0.1, y + 3.0, y + 3.8, tw, 'round', { both: true, alfiz: false }); archHead(bag, fa, mid + 0.1, dbA[1], y + 3.0, y + 3.8, tw, 'round', { both: true, alfiz: false });
    const pxx = xw + n * tw / 2; nColumn(bag, col, pxx, mid, y, 3.0);
    const cx0 = n < 0 ? xw - tw - 2.4 : xw + tw, cx1 = cx0 + 2.4, cz1 = B[1] + 5.4;
    Wl(n < 0 ? [cx0 - tw, B[1], cx0, cz1 + tw] : [cx1, B[1], cx1 + tw, cz1 + tw], y - 0.5, y + 6); Wl([Math.min(cx0, cx1) - (n < 0 ? tw : 0), cz1, Math.max(cx0, cx1) + (n > 0 ? tw : 0), cz1 + tw], y - 0.5, y + 6);
    tileFloor(bag, col, [cx0, B[1], cx1, cz1], y);
    dress(bag, face('x', n < 0 ? cx0 : cx1, n < 0 ? 1 : -1), B[1], cz1, y, y + 3.6); dress(bag, face('z', cz1, -1), cx0, cx1, y, y + 3.6);
    dress(bag, face('z', B[1], 1), cx0, cx1, y, y + 3.6); dress(bag, face('x', n < 0 ? cx1 : cx0, n < 0 ? -1 : 1), B[1], cz1, y, y + 3.6, hh);
    plankVault(bag, [cx0, B[1], cx1, cz1], y + 3.6, 1.0, 'cedar', 'timber', 'z');
    hipRoof(bag, [Math.min(cx0, cx1) - tw, z1 + 1.4, Math.max(cx0, cx1) + tw, cz1 + tw], y + 6, 0.9, 0.2);
    solid(n < 0 ? [x0, z1 + 1.4, cx0 - tw, B[3] + tw] : [cx1 + tw, z1 + 1.4, x1 + 0.8, B[3] + tw], 8);
    solid(n < 0 ? [cx0 - tw, cz1 + tw, xw - tw, B[3] + tw] : [xw + tw, cz1 + tw, cx1 + tw, B[3] + tw], 8);
  }
  Wl([B[0] - tw, B[3], B[2] + tw, B[3] + tw], y - 0.5, y + 12.6);
  tileFloor(bag, col, B, y);
  const hA = [[dbA[0], dbA[1], y, y + 3.8]];
  dress(bag, face('z', B[1], 1), B[0], B[2], y, y + 6.6, [dS]); dress(bag, face('z', B[3], -1), B[0], B[2], y, y + 6.6);
  dress(bag, face('x', B[0], 1), B[1], B[3], y, y + 6.6, hA); dress(bag, face('x', B[2], -1), B[1], B[3], y, y + 6.6, hA);
  starDome(bag, cx, (B[1] + B[3]) / 2, ha, 2.4, y + 6.6, y + 8.4, 3.4, [16, 16, 16, 32, 16, 8, 8]);
  floorFountain(bag, col, cx, (B[1] + B[3]) / 2, y + 0.05, 0.55, [0, -1, (B[1] + B[3]) / 2 - z1 + 0.0]);
  hipRoof(bag, [B[0] - tw, z1, B[2] + tw, B[3] + tw], y + 12.6, 2.2, 0.4);
  // ——— east: the Hall of the Kings — seven bays behind triple arches, three under muqarnas cupolas, the painted alcoves behind
  const K0 = x1 + tw, K1 = K0 + 4.8, kz0 = z0 - 2.2, kz1 = z1 + 2.2, sqs = [kz0 + 1.2, kz0 + 7.8, kz0 + 14.4].map((a) => [a, a + 4.8]);
  const triple = sqs.map(([a, b]) => [a + 0.2, b - 0.2, y, y + 3.6]);
  Wl([x1, kz0, K0, kz1], y - 0.5, y + 9.0, triple);
  for (const [a, b] of triple) {
    const fa = face('x', x1, 1), w3 = (b - a - 0.6) / 3;
    for (let i = 0; i < 3; i++) archHead(bag, fa, a + i * (w3 + 0.3), a + i * (w3 + 0.3) + w3, y + 2.9, y + 3.6, tw, 'lobed', { both: true, alfiz: false });
    for (let i = 1; i < 3; i++) { const zc = a + i * (w3 + 0.3) - 0.15; nColumn(bag, col, x1 + tw / 2, zc, y, 2.9); bag.add(SC, box(x1, y + 2.9, zc - 0.15, K0, y + 3.6, zc + 0.15)); }
    sill(bag, col, [x1, a, K0, b], y);
  }
  dress(bag, face('x', x1, -1), z0, z1, y, gTop, triple);
  const alc = sqs.map(([a, b]) => [a + 0.4, b - 0.4, y, y + 3.4]);
  Wl([K1, kz0, K1 + tw, kz1], y - 0.5, y + 9.0, alc);
  Wl([x1, kz0 - tw, K1 + tw + 4.0, kz0], y - 0.5, y + 9.0); Wl([x1, kz1, K1 + tw + 4.0, kz1 + tw], y - 0.5, y + 9.0);
  tileFloor(bag, col, [K0, kz0, K1, kz1], y);
  dress(bag, face('x', K0, 1), kz0, kz1, y, y + 4.6, triple); dress(bag, face('x', K1, -1), kz0, kz1, y, y + 4.6, alc);
  dress(bag, face('z', kz0, 1), K0, K1, y, y + 4.6); dress(bag, face('z', kz1, -1), K0, K1, y, y + 4.6);
  // the bays: the thick muqarnas arches between them (solid above), the cupolas over the three squares
  const cuts = [kz0, ...sqs.flat(), kz1];
  for (let i = 0; i + 1 < cuts.length; i += 2) {
    const a = cuts[i], b = cuts[i + 1]; if (b - a < 0.05) continue;
    bag.add(PL, box(K0, y + 4.2, a, K1, y + 9.0, b));
    const first = i === 0, last = i + 1 === cuts.length - 1;
    archHead(bag, first ? face('z', b, -1) : face('z', a, 1), K0 + 0.02, K1 - 0.02, y + 2.2, y + 4.2, b - a, 'lobed', { both: !first && !last, side: 'near', alfiz: false });
  }
  sqs.forEach(([a, b]) => cupola(bag, (K0 + K1) / 2, (a + b) / 2, 2.4, y + 4.6, y + 5.6, y + 6.6, 1.8, [16, 16, 16, 8, 8], 1));
  // the alcoves behind: walls between them, the vaults of planks covered in painted leather
  for (let i = 0; i + 1 < cuts.length; i += 2) bag.add(PL, box(K1 + tw, y - 0.5, cuts[i], K1 + tw + 3.2, y + 5.4, cuts[i + 1]));
  Wl([K1 + tw + 3.2, kz0, K1 + tw + 4.0, kz1], y - 0.5, y + 5.4);
  sqs.forEach(([a, b], k) => {
    const r = [K1 + tw, a, K1 + tw + 3.2, b];
    tileFloor(bag, col, r, y);
    dress(bag, face('x', r[2], -1), a, b, y, y + 3.0, [], { band: false }); dress(bag, face('z', a, 1), r[0], r[2], y, y + 3.0, [], { band: false }); dress(bag, face('z', b, -1), r[0], r[2], y, y + 3.0, [], { band: false });
    dress(bag, face('x', r[0], 1), a, b, y, y + 3.0, [alc[k]], { band: false });
    plankVault(bag, r, y + 3.0, 1.25, 'ceiling_painted', null, 'z');
    paintedVault(bag, r, y + 3.0, 1.25, k);
    archHead(bag, face('x', K1, 1), alc[k][0], alc[k][1], y + 2.4, y + 3.4, tw, 'round', { both: true });
  });
  hipRoof(bag, [x1, kz0 - tw, K1 + tw, kz1 + tw], y + 9.0, 1.8, 0.4);
  hipRoof(bag, [K1 + tw, kz0 - tw, K1 + tw + 4.0, kz1 + tw], y + 5.4, 0.9, 0.3);
}
const H2 = (spans, v0, v1) => spans.map(([a, b]) => [a, b, v0, v1]);
/**
 * The scenes painted on the leather of an alcove's vault over r (a barrel along z): in the middle
 * alcove (k = 1) ten men in council, seated on cushions; in the side ones riders, a castle and trees.
 */
function paintedVault(bag, r, ys, rise, k) {
  const [x0, z0, x1, z1] = r, c = (x0 + x1) / 2, hw = (x1 - x0) / 2;
  const at = (f, z, e) => { const x = c - Math.cos(f) * hw, yv = ys + Math.sin(f) * rise, nx = Math.cos(f) * rise, ny = -Math.sin(f) * hw, l = Math.hypot(nx, ny); return [x + nx / l * e, yv + ny / l * e, z]; };
  const patch = (mat, f, z, df, dz) => { const t = []; q4(t, at(f - df, z - dz, 0.015), at(f + df, z - dz, 0.015), at(f + df, z + dz, 0.015), at(f - df, z + dz, 0.015)); bag.add(mat, dbl(t)); };
  // a border of gilt and red round the field
  for (const f of [0.35, Math.PI - 0.35]) for (let z = z0 + 0.2; z < z1 - 0.2; z += 0.4) patch(z % 0.8 < 0.4 ? 'gilt_bronze' : 'cloth_red', f, z + 0.2, 0.03, 0.18);
  if (k === 1) {
    for (let i = 0; i < 10; i++) {
      const z = z0 + 0.5 + (i % 5) * (z1 - z0 - 1.0) / 4, f = i < 5 ? 1.15 : Math.PI - 1.15;
      patch(i % 3 ? 'cloth_white' : 'paint_robe', f, z, 0.16, 0.17); patch('skin_medium', f + (i < 5 ? 0.2 : -0.2), z, 0.05, 0.06); patch('cloth_white', f + (i < 5 ? 0.25 : -0.25), z, 0.03, 0.065);
      patch('cloth_red', f - (i < 5 ? 0.2 : -0.2), z, 0.04, 0.2);
    }
  } else {
    for (let i = 0; i < 4; i++) { const z = z0 + 0.8 + i * (z1 - z0 - 1.6) / 3, f = i % 2 ? 1.1 : Math.PI - 1.1; patch('hide_brown', f, z, 0.12, 0.3); patch(i % 2 ? 'paint_robe' : 'cloth_red', f + (i % 2 ? 0.18 : -0.18), z, 0.09, 0.08); }
    for (const z of [z0 + 0.6, z1 - 0.6]) { patch('lotus_leaf', Math.PI / 2, z, 0.22, 0.25); patch('bark_dark', Math.PI / 2 + 0.25, z, 0.08, 0.04); }
    patch('stucco_warm', Math.PI / 2, (z0 + z1) / 2, 0.25, 0.4); patch('roof_tile', Math.PI / 2 - 0.2, (z0 + z1) / 2, 0.05, 0.4);
  }
}

// Nalanda — the houses of the village (docs/settlements/nalanda.md §16): four kinds of house, chosen by the lot's size and the house's own seed — the
// mud-walled house under a hipped thatch, the same under a gabled thatch, the plastered house under a gabled roof of half-round tiles with its verandah,
// and the brick house of the better-off under a flat roof of lime concrete with a parapet, a chhajja over the door and a bench (otla) before it. The front
// varies by rule (the number of bays, the bay of the door, windows or none, a verandah or a platform, a walled front yard or none, the border of
// whitewash round the door); the inside is a hall furnished for its trade (the home, the weaver, the grain merchant, the oil-presser, the garland-maker,
// the lodging of a scribe, the pilgrims' rest) and, where the house is wide enough, a small room behind a partition with the hearth.
// A house { rect, front ('n' | 'w' | 's' | 'e'), y, foot, seed, use, open, simple }: `open` makes it enterable, `simple` the far version.
import { orientedBox } from '../../core/build.js';
import { box, lathe, frustum, fromTriangles, orientOutward } from '../../core/geom.js';

const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
const POT = [[0.001, 0], [0.12, 0.02], [0.2, 0.14], [0.21, 0.26], [0.14, 0.38], [0.1, 0.42], [0.12, 0.46], [0.001, 0.46]];
const scaled = (k, kh = k) => POT.map(([a, b]) => [a * k, b * kh]);

/** The uses a house can have, with the room each needs (width of the hall at least). */
export const USES = ['home', 'weaver', 'grain', 'oil', 'garland', 'scribe', 'rest'];

/** The kind of a house from its lot (area and seed): 'kutcha' (mud and hipped thatch), 'thatch' (gabled), 'tiled', 'brick' (flat roof). */
export function kindOf(rect, seed) {
  const r = rng((seed || 1) + 91), area = (rect[2] - rect[0]) * (rect[3] - rect[1]), w = area / 58 + r() * 0.5;
  if (w < 0.95) return r() < 0.6 ? 'kutcha' : 'thatch';
  if (w < 1.3) return r() < 0.8 ? 'tiled' : 'thatch';
  return r() < 0.65 ? 'brick' : 'tiled';
}

/** An opened house's doorway is 1.6 m wide (the walker needs 1.6 m clear), a shut one's 1.1. */
export const DOOR_OPEN = 1.6;
/**
 * Where the door of a house is, from the house's own numbers (the same draws as the builder below makes: the yard, the wall's material, the door's bay):
 * { du (along the front from the low corner), P(u, v) (the lot's point u along the front, v inward from the front line, in the world), L, D (the hall's width and depth) }.
 */
export function houseDoor(el) {
  const [x0, z0, x1, z1] = el.rect, f = el.front || 'n', r = rng(el.seed || 1), kind = el.kind || kindOf(el.rect, el.seed);
  const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, Dfull = along ? z1 - z0 : x1 - x0;
  const yard = Dfull >= 7 && r() < 0.35 && kind !== 'brick', vo = yard ? 2.0 : 0, D = Dfull - vo;
  if (kind !== 'brick') r();
  const nb = Math.max(2, Math.min(4, Math.floor(L / 3))), kd = nb >= 3 ? 1 + Math.floor(r() * (nb - 2)) : Math.floor(r() * 2), du = (kd + 0.5) * L / nb;
  const P = (u, v) => (f === 'n' ? [x0 + u, z0 + v + vo] : f === 's' ? [x1 - u, z1 - v - vo] : f === 'e' ? [x1 - v - vo, z0 + u] : [x0 + v + vo, z1 - u]);
  return { du, P, L, D, kind, f };
}

export default function make(H) {
  const { votiveStupa } = H;
  void votiveStupa;

  function houseBihar(el, ctx) {
    const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, f = el.front || 'n', y = el.y ?? 0, foot = el.foot ?? -0.2;
    const r = rng(el.seed || 1), simple = !!el.simple, open = !!el.open && !simple, kind = el.kind || kindOf(el.rect, el.seed);
    const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, Dfull = along ? z1 - z0 : x1 - x0;
    const yard = Dfull >= 7 && r() < 0.35 && kind !== 'brick';
    const vo = yard ? 2.0 : 0, D = Dfull - vo;
    const H0 = { kutcha: 2.75, thatch: 2.85, tiled: 3.15, brick: 3.4 }[kind], T = kind === 'brick' ? 0.5 : kind === 'tiled' ? 0.38 : 0.4;
    const fy = y + 0.45;
    // the house's frame: u along the front from its low corner, v inward from the front line (the yard, if any, lies before it)
    const P = (u, v) => (f === 'n' ? [x0 + u, z0 + v + vo] : f === 's' ? [x1 - u, z1 - v - vo] : f === 'e' ? [x1 - v - vo, z0 + u] : [x0 + v + vo, z1 - u]);
    const P0 = (u, v) => (f === 'n' ? [x0 + u, z0 + v] : f === 's' ? [x1 - u, z1 - v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);     // the same, from the lot's front line
    const rect = (u0, v0, u1, v1, p = P) => { const a = p(u0, v0), b = p(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
    const Bx = (m, u0, v0, u1, v1, ya, yb, c = false, p = P) => { const q = rect(u0, v0, u1, v1, p); if (q[2] - q[0] < 1e-4 || q[3] - q[1] < 1e-4) return; bag.add(m, box(q[0], ya, q[1], q[2], yb, q[3])); if (c) col.rect(q, ya - 0.2, yb); };
    const pt = (u, v, yy) => { const p = P(u, v); return [p[0], yy, p[1]]; };
    const pot = (m, u, v, k, yy = fy, kh = k) => { const p = P(u, v); bag.add(m, lathe(scaled(k, kh), 8, null, p[0], yy, p[1])); };
    const heap = (m, u, v, rad, h, yy = fy) => { const p = P(u, v); bag.add(m, lathe([[rad, 0], [rad * 0.8, h * 0.35], [rad * 0.45, h * 0.75], [0.001, h]], 8, null, p[0], yy, p[1])); };

    // the walls' materials
    const wallMat = kind === 'brick' ? 'brick' : ['earth_wall', 'mud_plaster', 'plaster'][Math.floor(r() * 3)];
    const nb = Math.max(2, Math.min(4, Math.floor(L / 3))), kd = nb >= 3 ? 1 + Math.floor(r() * (nb - 2)) : Math.floor(r() * 2), du = (kd + 0.5) * L / nb, dw = open ? DOOR_OPEN : 1.1;
    const footMat = kind === 'brick' ? 'brick_baked' : 'mudbrick';

    // ── the plinth (the lot's whole footing, the yard's too if it has one)
    bag.add(footMat, box(Math.min(...[P(0, 0), P(L, D)].map((p) => p[0])) - 0.1, foot - 0.6, Math.min(...[P(0, 0), P(L, D)].map((p) => p[1])) - 0.1, Math.max(...[P(0, 0), P(L, D)].map((p) => p[0])) + 0.1, fy, Math.max(...[P(0, 0), P(L, D)].map((p) => p[1])) + 0.1));
    if (!open) { const q = rect(0, 0, L, D); col.rect(q, foot - 0.6, y + H0); }

    // ── walls
    if (!open) Bx(wallMat, 0, 0, L, D, fy, y + H0);
    else {
      Bx(wallMat, 0, D - T, L, D, fy, y + H0, true); Bx(wallMat, 0, T, T, D - T, fy, y + H0, true); Bx(wallMat, L - T, T, L, D - T, fy, y + H0, true);
      Bx(wallMat, 0, 0, du - dw / 2, T, fy, y + H0, true); Bx(wallMat, du + dw / 2, 0, L, T, fy, y + H0, true); Bx(wallMat, du - dw / 2, 0, du + dw / 2, T, fy + 2.1, y + H0);
      Bx('timber', du - dw / 2 - 0.02, T, du - dw / 2 + 0.05, T + dw, fy, fy + 2.05);                      // the leaf, standing open inside
      const rr = rect(0, 0, L, D); col.floor(rr, fy); col.rect(rr, y + H0 - 0.1, y + H0 + 0.3);
    }
    // the step before the door
    Bx(footMat, du - 0.7, -0.45, du + 0.7, 0, fy - 0.24, fy - 0.02); col.floor(rect(du - 0.7, -0.45, du + 0.7, 0), fy - 0.24);

    // ── the front: windows, the door's frame, a border of whitewash round it
    const ops = [];
    const win = (face, u, v0, w, h) => {
      // face: 'f' front, 'b' back, 'l' left (u = 0), 'r' right (u = L); u along it from its low corner; patches on the wall
      const o = 0.012, fr = 0.09;
      const place = (m, a0, a1, ya, yb, d0, d1) => {
        if (face === 'f') Bx(m, a0, -d1, a1, -d0, ya, yb, false);
        else if (face === 'b') Bx(m, a0, D + d0, a1, D + d1, ya, yb, false);
        else if (face === 'l') Bx(m, -d1, a0, -d0, a1, ya, yb, false);
        else Bx(m, L + d0, a0, L + d1, a1, ya, yb, false);
      };
      const Lf = face === 'f' || face === 'b' ? L : D, a = u - w / 2, b = u + w / 2;
      if (a - fr < T + 0.1 || b + fr > Lf - T - 0.1) return;
      if (face === 'f' && Math.abs(u - du) < dw / 2 + w / 2 + 0.2) return;
      place('opening', a, b, v0, v0 + h, 0, o);
      place('timber', a - fr, a, v0, v0 + h + fr, 0, 0.06); place('timber', b, b + fr, v0, v0 + h + fr, 0, 0.06); place('timber', a, b, v0 + h, v0 + h + fr, 0, 0.06);
      place(kind === 'brick' ? 'brick_baked' : 'timber', a - fr - 0.04, b + fr + 0.04, v0 - 0.08, v0, 0, 0.11);
      const nbar = kind === 'brick' ? 5 : 4;
      for (let k = 1; k < nbar; k++) place('wood_dark', a + k * w / nbar - 0.018, a + k * w / nbar + 0.018, v0, v0 + h, o, 0.045);
      ops.push([face, u]);
    };
    const wy = kind === 'brick' ? y + 1.35 : y + 1.25, wwid = kind === 'brick' ? 0.85 : 0.75 + r() * 0.15, wh = kind === 'brick' ? 0.95 : 0.8;
    const winRule = r();                                                  // windows on the front bays, or only a lattice-light by the door
    for (let k = 0; k < nb; k++) {
      const u = (k + 0.5) * L / nb;
      if (k === kd) continue;
      if (winRule < 0.25 && k !== kd + 1) continue;
      win('f', u, wy, wwid, wh);
    }
    for (let k = 0; k < nb; k++) if (r() < 0.4) win('b', (k + 0.5) * L / nb, y + 1.6, 0.6, 0.6);
    if (r() < 0.5) win('l', D / 2, y + 1.5, 0.6, 0.6);
    // the door's frame (timber jambs and lintel), the whitewash border (a Bihar custom of the plastered house) round it
    const dj = (a, b, ya, yb, d1) => Bx('timber', a, -d1, b, 0, ya, yb);
    dj(du - dw / 2 - 0.1, du - dw / 2, fy, fy + 2.2, 0.07); dj(du + dw / 2, du + dw / 2 + 0.1, fy, fy + 2.2, 0.07); dj(du - dw / 2 - 0.12, du + dw / 2 + 0.12, fy + 2.1, fy + 2.28, 0.09);
    if (!open) { Bx('timber', du - dw / 2, -0.04, du + dw / 2, 0, fy, fy + 2.1); for (let k = 1; k < 5; k++) Bx('wood_dark', du - dw / 2 + k * dw / 5 - 0.01, -0.07, du - dw / 2 + k * dw / 5 + 0.01, -0.04, fy + 0.02, fy + 2.08); }
    if (kind !== 'brick' && r() < 0.7) {
      const bw = 0.16;
      Bx('lime_plaster', du - dw / 2 - 0.1 - bw, -0.025, du - dw / 2 - 0.1, 0, fy, fy + 2.5); Bx('lime_plaster', du + dw / 2 + 0.1, -0.025, du + dw / 2 + 0.1 + bw, 0, fy, fy + 2.5);
      Bx('lime_plaster', du - dw / 2 - 0.1 - bw, -0.025, du + dw / 2 + 0.1 + bw, 0, fy + 2.28, fy + 2.5);
    }
    // a dado of dark earth along the foot of the mud walls
    if (kind !== 'brick') for (const [u0, v0, u1, v1] of [[0, -0.02, L, 0], [0, D, L, D + 0.02]]) Bx('earth_wall', u0, v0, u1, v1, fy, fy + 0.5);

    // ── the roof, by kind
    const ridgeH = (m, rise) => rise;
    void ridgeH;
    const gable = (th, topMat, underMat, pitch, ov, ovf, vd) => {
      // two slabs from the eaves to the ridge (the front's carried over the verandah), the gables walled up under them
      const vm = D / 2, yR = y + H0 + vm * pitch, u0 = -ov, u1 = L + ov;
      const slab = (q) => {
        const b = q.map((p) => [p[0], p[1] - th, p[2]]), T1 = [...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]], U = [...b[0], ...b[2], ...b[1], ...b[0], ...b[3], ...b[2]];
        for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; U.push(...q[i], ...q[j], ...b[j], ...q[i], ...b[j], ...b[i]); }
        const all = orientOutward([...T1, ...U]);
        bag.add(topMat, fromTriangles(all.slice(0, 18))); bag.add(underMat, fromTriangles(all.slice(18)));
      };
      const vF = -ovf, vB = D + ov;
      slab([pt(u0, vF, y + H0 - ovf * pitch), pt(u1, vF, y + H0 - ovf * pitch), pt(u1, vm, yR), pt(u0, vm, yR)]);
      slab([pt(u1, vB, y + H0 - ov * pitch), pt(u0, vB, y + H0 - ov * pitch), pt(u0, vm, yR), pt(u1, vm, yR)]);
      // the ridge
      Bx(kind === 'tiled' ? 'roof_ridge' : 'thatch', u0 - 0.05, vm - 0.2, u1 + 0.05, vm + 0.2, yR - 0.05, yR + 0.24);
      // the gable ends: a triangle of the wall's stuff flush with the wall, set a little below the slab
      for (const [uu, sg] of [[0, -1], [L, 1]]) {
        const p0 = P(uu, 0), p1 = P(uu + sg, 0), t = (() => { const a = P(uu, 1), b = P(uu, 0); return [a[0] - b[0], a[1] - b[1]]; })(), n = [p1[0] - p0[0], p1[1] - p0[1]];
        const tri = [[0, 0], [D, 0], [vm, yR - th - 0.03 - (y + H0)]];
        const V = (s, h, d) => [p0[0] + t[0] * s + n[0] * d, y + H0 + h, p0[1] + t[1] * s + n[1] * d];
        const Fv = tri.map(([s, h]) => V(s, h, 0)), Kv = tri.map(([s, h]) => V(s, h, -T)), TT = [];
        TT.push(...Fv[0], ...Fv[1], ...Fv[2], ...Kv[0], ...Kv[2], ...Kv[1]);
        for (let i = 0; i < 3; i++) { const j = (i + 1) % 3; TT.push(...Fv[i], ...Kv[i], ...Kv[j], ...Fv[i], ...Kv[j], ...Fv[j]); }
        bag.add(wallMat, fromTriangles(orientOutward(TT)));
      }
      // a clay pot (the finial of the ridge) at each end of a thatched one
      if (kind !== 'tiled') for (const uu of [u0 + 0.35, u1 - 0.35]) pot('terracotta', uu, vm, 0.9, yR + 0.2, 0.8);
      return { yR, vm };
    };
    let ovLeft = 0;
    if (kind === 'kutcha') {
      // a hipped roof of thatch, deep eaves over a front platform
      const ov = 0.95, q = [...rect(-ov, -ov, L + ov, D + ov)], w = Math.min(q[2] - q[0], q[3] - q[1]);
      const ins = w / 2 - 0.15, pit = 0.74, rise = ins * pit;
      const lx = along ? [ins, ins, ins, ins] : [ins, ins, ins, ins];
      bag.add('thatch', frustum(q, y + H0 - ov * 0.55, y + H0 - ov * 0.55 + rise, ...lx));
      bag.add('roof_ridge', box((q[0] + q[2]) / 2 - 0.2, y + H0 - ov * 0.55 + rise - 0.05, (q[1] + q[3]) / 2 - 0.2, (q[0] + q[2]) / 2 + 0.2, y + H0 - ov * 0.55 + rise + 0.2, (q[1] + q[3]) / 2 + 0.2));
      pot('terracotta', L / 2, D / 2, 0.9, y + H0 - ov * 0.55 + rise + 0.1, 0.8);
      // a mud platform along the front, two posts of timber at its corners holding the eave
      const pd = 1.1; Bx(footMat, 0, -pd, L, 0, foot - 0.4, fy, false); col.floor(rect(0, -pd, L, 0), fy);
      ovLeft = pd;
    } else if (kind === 'thatch') {
      const g = gable(0.3, 'thatch', 'timber', 0.78, 0.55, 1.45, 1.2);
      void g;
      verandah(1.45);
    } else if (kind === 'tiled') {
      const g = gable(0.14, 'roof_tile', 'timber', 0.4, 0.5, 1.6, 1.45);
      void g;
      if (r() < 0.8) verandah(1.6);
    } else {
      // the flat roof of lime concrete with its parapet, spouts and a chhajja (a projecting slab) over the door; a brick bench along the front
      const yT = y + H0;
      Bx('lime_plaster', -0.3, -0.3, L + 0.3, D + 0.3, yT, yT + 0.25);
      const par = (u0, v0, u1, v1) => Bx('brick', u0, v0, u1, v1, yT + 0.25, yT + 0.8);
      par(-0.3, -0.3, L + 0.3, -0.12); par(-0.3, D + 0.12, L + 0.3, D + 0.3); par(-0.3, -0.12, -0.12, D + 0.12); par(L + 0.12, -0.12, L + 0.3, D + 0.12);
      Bx('brick_baked', -0.36, -0.36, L + 0.36, D + 0.36, yT + 0.8, yT + 0.9);
      for (const u of [L * 0.3, L * 0.7]) Bx('brick_baked', u - 0.12, D + 0.3, u + 0.12, D + 0.65, yT + 0.12, yT + 0.2);       // spouts
      Bx('lime_plaster', du - 1.0, -0.65, du + 1.0, 0, fy + 2.3, fy + 2.45);                                                  // the chhajja
      for (const s of [-1, 1]) Bx('brick_baked', du + s * 0.85 - 0.06, -0.6, du + s * 0.85 + 0.06, -0.45, fy + 2.0, fy + 2.3);
      Bx('lime_plaster', -0.01, -0.04, L + 0.01, 0, y + H0 - 0.55, y + H0 - 0.35);                                           // a plaster band under the roof
      // the bench of the front, cut where the door is (2.2 m, the door and its frame with room: an unbroken bench 0.5 m over the platform stood
      // across the doorway and shut every opened brick house to the walker, which stopped 1.2 m before it)
      const ob = 0.95, bg = Math.max(dw / 2 + 0.5, 1.1); Bx('brick', 0, -ob, L, 0, fy - 0.2, fy);
      for (const [b0, b1] of [[0, du - bg], [du + bg, L]]) if (b1 - b0 > 0.05) { Bx('brick_baked', b0, -ob, b1, -ob + 0.12, fy, fy + 0.45); Bx('lime_plaster', b0, -ob, b1, 0, fy + 0.45, fy + 0.5); }
      ovLeft = 0;
      if (open) { /* the roof is the ceiling's collision above */ }
      col.floor(rect(0, -ob, L, 0), fy);
    }
    function verandah(vd) {
      // a platform of mud brick along the front and posts of timber under a beam, the roof's front slope carrying over them
      Bx(footMat, 0, -vd, L, 0, foot - 0.4, fy, false); col.floor(rect(0, -vd, L, 0), fy);
      const np = Math.max(2, Math.round(L / 2.4) + 1);
      const pitchF = kind === 'tiled' ? 0.4 : 0.78, eaveY = y + H0 - (vd + 0.0) * pitchF - 0.0;
      for (let k = 0; k < np; k++) { const u = 0.3 + k * (L - 0.6) / (np - 1); Bx('timber', u - 0.08, -vd + 0.15, u + 0.08, -vd + 0.31, fy, eaveY - 0.18, true); }
      Bx('timber', 0.1, -vd + 0.1, L - 0.1, -vd + 0.36, eaveY - 0.18, eaveY - 0.02);
      ovLeft = vd;
      // a lamp niche and a string of marigold over the door (the doorway garland), a pot of tulsi on the platform's end
      const gp = P(du, -0.05); void gp;
      pot('terracotta', 0.35, -vd + 0.5, 0.9, fy, 0.9);
    }
    void ovLeft;

    // ── the front yard: a low mud wall with a gap before the door, a thatched cap
    if (yard) {
      const hy = 1.15, w2 = 0.25, g0 = du - 1.4, g1 = du + 1.4, e = 0.0;
      const wallP = (u0, v0, u1, v1) => { const q = rect(u0, v0, u1, v1, P0); const q2 = q; bag.add('earth_wall', box(q2[0], y, q2[1], q2[2], y + hy, q2[3])); col.rect(q2, y - 0.2, y + hy); bag.add('thatch', box(q2[0] - (q2[2] - q2[0] > q2[3] - q2[1] ? 0.04 : 0.12), y + hy, q2[1] - (q2[2] - q2[0] > q2[3] - q2[1] ? 0.12 : 0.04), q2[2] + (q2[2] - q2[0] > q2[3] - q2[1] ? 0.04 : 0.12), y + hy + 0.14, q2[3] + (q2[2] - q2[0] > q2[3] - q2[1] ? 0.12 : 0.04))); };
      wallP(0, 0, g0, w2); wallP(g1, 0, L, w2); wallP(0, w2, w2, vo - 0.05); wallP(L - w2, w2, L, vo - 0.05);
      void e;
      if (r() < 0.6) { const p = P0(L - 0.9, 1.0); bag.add('earth_wall', lathe([[0.5, 0], [0.62, 0.3], [0.62, 0.7], [0.46, 1.05], [0.001, 1.1]], 9, null, p[0], y + 0.1, p[1])); col.circle(p[0], p[1], 0.62, y, y + 1.2); }
    }
    if (simple || !open) return;

    // ── the inside ─────────────────────────────────────────────────────────────
    const use = el.use || 'home';
    const floorMat = kind === 'brick' ? 'lime_plaster' : 'earth_wall';
    Bx(floorMat, T, T, L - T, D - T, fy - 0.12, fy + 0.012);
    const ceil = kind === 'brick' ? 'lime_plaster' : 'timber';
    Bx(ceil, T, T, L - T, D - T, y + H0 - 0.06, y + H0 - 0.02);
    for (let u = T + 0.6; u < L - T; u += 1.0) Bx('wood_dark', u - 0.08, T, u + 0.08, D - T, y + H0 - 0.24, y + H0 - 0.06);
    // a partition (a mud wall, a doorway at its front end) cuts off a small room for the hearth where the house is wide enough
    const wide = L >= 7.4, pu = du < L / 2 ? L - 3.1 : 3.1, kitchenLeft = pu < L / 2;
    const A = wide ? (kitchenLeft ? [pu + 0.13, L - T] : [T, pu - 0.13]) : [T, L - T], Bk = wide ? (kitchenLeft ? [T, pu - 0.13] : [pu + 0.13, L - T]) : null;
    if (wide) {
      Bx(wallMat, pu - 0.13, T, pu + 0.13, T + 0.4, fy, y + H0, true); Bx(wallMat, pu - 0.13, T + 1.5, pu + 0.13, D - T, fy, y + H0, true);
      Bx('timber', pu - 0.15, T + 0.4, pu + 0.15, T + 1.5, fy + 2.1, fy + 2.28);
    }
    const [a0, a1] = A, v0 = T + 0.05, v1 = D - T - 0.05;
    const dz = (u, vv = 0) => Math.abs(u - du) < 0.95 && vv < T + 1.5;                  // the door's way
    const bed = (u, v, uL, vL, cloth) => {
      // a string bed (charpai): four legs, a frame, a woven top, a cloth, a pillow
      if (u - uL / 2 < a0 || u + uL / 2 > a1 || v - vL / 2 < v0 || v + vL / 2 > v1) return;
      for (const [s, t] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) Bx('timber', u + s * (uL / 2 - 0.05) - 0.04, v + t * (vL / 2 - 0.05) - 0.04, u + s * (uL / 2 - 0.05) + 0.04, v + t * (vL / 2 - 0.05) + 0.04, fy, fy + 0.4);
      Bx('timber', u - uL / 2, v - vL / 2, u + uL / 2, v + vL / 2, fy + 0.38, fy + 0.44);
      Bx(cloth, u - uL / 2 + 0.06, v - vL / 2 + 0.06, u + uL / 2 - 0.06, v + vL / 2 - 0.06, fy + 0.44, fy + 0.475);
      Bx('cloth_white', u + uL / 2 - 0.4, v - vL / 2 + 0.1, u + uL / 2 - 0.1, v + vL / 2 - 0.1, fy + 0.475, fy + 0.55);
      col.rect(rect(u - uL / 2, v - vL / 2, u + uL / 2, v + vL / 2), fy, fy + 0.5);
    };
    const bin = (u, v, k = 1) => { const p = P(u, v); bag.add('earth_wall', lathe([[0.4 * k, 0], [0.52 * k, 0.3 * k], [0.55 * k, 0.7 * k], [0.4 * k, 1.05 * k], [0.28 * k, 1.12 * k], [0.001, 1.12 * k]], 10, null, p[0], fy + 0.1, p[1])); Bx('brick', u - 0.45 * k, v - 0.45 * k, u + 0.45 * k, v + 0.45 * k, fy, fy + 0.12); const c = rect(u - 0.5 * k, v - 0.5 * k, u + 0.5 * k, v + 0.5 * k); col.rect(c, fy, fy + 1.3 * k); };
    const mat = (u, v, w = 1.5, d = 0.8, m = 'reed_mat') => Bx(m, u - w / 2, v - d / 2, u + w / 2, v + d / 2, fy, fy + 0.03);
    const lampAt = (u, v, yy) => { const p = P(u, v); Bx('stucco_warm', u - 0.14, v - 0.14, u + 0.14, v + 0.14, yy - 0.02, yy + 0.02); bag.add('lamp_glass', lathe([[0.001, 0], [0.05, 0.01], [0.07, 0.05], [0.001, 0.09]], 6, null, p[0], yy + 0.02, p[1])); };
    const back = D - T;
    // the hearth room
    if (wide) {
      const [k0, k1] = Bk, kc = (k0 + k1) / 2, ks = kitchenLeft ? 1 : -1;
      void ks;
      Bx('earth_wall', kc - 0.5, back - 0.7, kc + 0.5, back - 0.05, fy, fy + 0.38, true);                                        // the chulha of clay
      pot('pottery_dark', kc - 0.2, back - 0.38, 1.05, fy + 0.38, 1.0); pot('iron', kc + 0.22, back - 0.38, 0.8, fy + 0.38, 0.7);
      Bx('flame', kc - 0.03, back - 0.74, kc + 0.03, back - 0.7, fy + 0.4, fy + 0.5);
      Bx('wood_dark', k0 + 0.1, back - 0.35, k0 + 0.9, back - 0.05, fy, fy + 0.25, true);                                     // firewood
      Bx('wood_dark', k0 + 0.15, back - 0.3, k0 + 0.85, back - 0.1, fy + 0.25, fy + 0.45);
      lampAt(kc - 0.9, back - 0.04, fy + 1.05);
      for (let i = 0; i < 3; i++) pot('terracotta', k1 - 0.35, T + 0.5 + i * 0.5, 1.0, fy, 1.0);
      Bx('limestone', k0 + 0.1, T + 0.55, k0 + 0.85, T + 1.3, fy, fy + 0.22, true);                                           // the grinding stone
      Bx('limestone', k0 + 0.2, T + 0.65, k0 + 0.75, T + 1.2, fy + 0.22, fy + 0.3);
      for (let k = 0; k < 4; k++) pot('terracotta', k0 + 0.1 + k * 0.28, T + 0.1, 0.5, fy + 0.0, 0.5);
    } else {
      bin(a1 - 0.6, back - 0.6, 0.9); Bx('earth_wall', a1 - 1.2, back - 0.5, a1 - 0.4, back - 0.05, fy, fy);
      lampAt(a1 - 0.2, back - 0.5, fy + 1.1);
      for (let i = 0; i < 3; i++) pot('terracotta', a0 + 0.3 + i * 0.4, v0 + 0.3, 1.0, fy, 1.0);
    }
    // the hall by its use
    const hall = (a1 - a0) - 0;
    const placeBeds = (n) => { let u = a0 + 0.55; for (let i = 0; i < n; i++) { const w = 1.9; if (u + w / 2 > a1 - 0.1) break; bed(u + w / 2 - 0.55 + 0.55, back - 0.5, w, 0.95, i % 2 ? 'cloth_red' : 'cloth_indigo'); u += w + 0.25; } };
    if (use === 'weaver') {
      // a frame loom: two posts, a beam above, the warp hanging in a sheet, the cloth rolled below, the weaver's plank before it; yarn baskets, a bench
      const lu = (a0 + a1) / 2 - 0.2, lv = back - 0.9;
      for (const s of [-1, 1]) Bx('timber', lu + s * 0.85 - 0.06, lv - 0.06, lu + s * 0.85 + 0.06, lv + 0.06, fy, fy + 1.9, true);
      Bx('timber', lu - 0.95, lv - 0.06, lu + 0.95, lv + 0.06, fy + 1.9, fy + 2.0);
      Bx('cloth_white', lu - 0.75, lv - 0.012, lu + 0.75, lv + 0.012, fy + 0.65, fy + 1.9);
      Bx(['cloth_indigo', 'cloth_red', 'cloth_ochre'][Math.floor(r() * 3)], lu - 0.75, lv - 0.02, lu + 0.75, lv + 0.02, fy + 0.65, fy + 1.0);
      Bx('timber', lu - 0.9, lv - 0.05, lu + 0.9, lv + 0.05, fy + 0.55, fy + 0.65);
      Bx('timber', lu - 0.7, lv - 0.9, lu + 0.7, lv - 0.55, fy + 0.2, fy + 0.26, true);
      for (const s of [-1, 1]) Bx('timber', lu + s * 0.6 - 0.04, lv - 0.82, lu + s * 0.6 + 0.04, lv - 0.62, fy, fy + 0.2);
      for (let i = 0; i < 3; i++) { const p = P(a0 + 0.5 + i * 0.5, back - 0.4); bag.add('wicker', lathe([[0.2, 0], [0.24, 0.14], [0.2, 0.22], [0.001, 0.22]], 8, null, p[0], fy, p[1])); heap(['cloth_white', 'cloth_ochre', 'cloth_red'][i], a0 + 0.5 + i * 0.5, back - 0.4, 0.17, 0.16, fy + 0.2); }
      col.rect(rect(a0 + 0.2, back - 0.7, a0 + 1.9, back - 0.1), fy, fy + 0.3);
      mat(a1 - 1.1, T + 2.4, 1.4, 0.8); bed(a1 - 1.1, back - 0.5, 1.8, 0.9, 'cloth_indigo');
      for (let i = 0; i < 3; i++) Bx('cloth_' + ['white', 'red', 'ochre'][i], a1 - 2.2 - i * 0.02, T + 0.3, a1 - 1.4, T + 0.6, fy + 0.0 + i * 0.1, fy + 0.1 + i * 0.1);
    } else if (use === 'grain') {
      for (let i = 0; i < 3; i++) { const u = a0 + 0.7 + i * 1.25; if (u + 0.6 < a1) bin(u, back - 0.65, 1.0); }
      for (let i = 0; i < 7; i++) { const u = a1 - 1.0 - (i % 4) * 0.5, v = T + 1.9 + Math.floor(i / 4) * 0.55; const p = P(u, v); bag.add(i % 2 ? 'sacking' : 'cloth_ochre', lathe([[0.26, 0], [0.3, 0.2], [0.22, 0.42], [0.1, 0.48], [0.001, 0.48]], 8, null, p[0], fy, p[1])); }
      col.rect(rect(a1 - 2.2, T + 1.6, a1 - 0.5, T + 2.8), fy, fy + 0.5);
      // the weighing beam on a tripod, baskets in its pans
      const su = (a0 + a1) / 2 - 0.5, sv = T + 2.3;
      Bx('timber', su - 0.04, sv - 0.04, su + 0.04, sv + 0.04, fy, fy + 1.9, true); Bx('timber', su - 0.7, sv - 0.03, su + 0.7, sv + 0.03, fy + 1.85, fy + 1.9);
      for (const s of [-1, 1]) { Bx('wood_dark', su + s * 0.65 - 0.008, sv - 0.008, su + s * 0.65 + 0.008, sv + 0.008, fy + 0.75, fy + 1.85); const p = P(su + s * 0.65, sv); bag.add('wicker', lathe([[0.2, 0], [0.24, 0.05], [0.001, 0.05]], 8, null, p[0], fy + 0.72, p[1])); }
    } else if (use === 'oil') {
      // a wooden mortar sunk in the floor with its tall pestle on a lever beam, jars of oil, sacks of seed
      const mu = (a0 + a1) / 2 - 0.3, mv = back - 1.5;
      const mp = P(mu, mv); bag.add('timber', lathe([[0.001, 0], [0.4, 0], [0.46, 0.2], [0.44, 0.75], [0.3, 0.78], [0.3, 0.55], [0.001, 0.55]], 10, null, mp[0], fy, mp[1])); col.circle(mp[0], mp[1], 0.46, fy, fy + 0.8);
      Bx('wood_dark', mu - 0.06, mv - 0.06, mu + 0.06, mv + 0.06, fy + 0.55, fy + 2.0);
      Bx('timber', mu - 0.1, mv - 0.07, mu + 1.9, mv + 0.07, fy + 1.55, fy + 1.7);
      Bx('timber', mu + 1.8, mv - 0.05, mu + 1.9, mv + 0.05, fy, fy + 1.6, true);
      for (let i = 0; i < 4; i++) pot(i % 2 ? 'pottery_dark' : 'terracotta', a0 + 0.35 + i * 0.5, back - 0.35, 1.5, fy, 1.7);
      col.rect(rect(a0 + 0.1, back - 0.65, a0 + 2.1, back - 0.05), fy, fy + 0.8);
      for (let i = 0; i < 4; i++) { const p = P(a1 - 0.5 - (i % 2) * 0.55, T + 1.9 + Math.floor(i / 2) * 0.55); bag.add('sacking', lathe([[0.26, 0], [0.3, 0.2], [0.22, 0.42], [0.1, 0.48], [0.001, 0.48]], 8, null, p[0], fy, p[1])); }
    } else if (use === 'garland') {
      // heaps of marigold and jasmine on mats, baskets, a low table where the garlands are strung, clay lamps in rows on a shelf
      mat((a0 + a1) / 2, back - 0.9, 2.6, 1.4);
      for (let i = 0; i < 5; i++) heap(['cloth_ochre', 'cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_red'][i], (a0 + a1) / 2 - 1.0 + i * 0.5, back - 0.8 + (i % 2) * 0.25, 0.26, 0.24, fy + 0.03);
      Bx('timber', a1 - 1.4, back - 0.8, a1 - 0.4, back - 0.3, fy + 0.36, fy + 0.42, true);
      for (const [s, t] of [[0.1, 0.1], [0.9, 0.1], [0.1, 0.4], [0.9, 0.4]]) Bx('timber', a1 - 1.4 + s - 0.03, back - 0.8 + t - 0.03, a1 - 1.4 + s + 0.03, back - 0.8 + t + 0.03, fy, fy + 0.36);
      Bx('timber', a0 + 0.2, back - 0.4, a0 + 2.6, back - 0.04, fy + 1.2, fy + 1.26);
      for (let k = 0; k < 9; k++) { const p = P(a0 + 0.35 + k * 0.26, back - 0.22); bag.add('terracotta', lathe([[0.001, 0], [0.07, 0], [0.09, 0.03], [0.001, 0.03]], 6, null, p[0], fy + 1.26, p[1])); }
      for (let i = 0; i < 3; i++) { const p = P(a0 + 0.5 + i * 0.7, T + 0.5); bag.add('wicker', lathe([[0.24, 0], [0.3, 0.14], [0.26, 0.24], [0.001, 0.24]], 8, null, p[0], fy, p[1])); heap('cloth_ochre', a0 + 0.5 + i * 0.7, T + 0.5, 0.2, 0.18, fy + 0.2); }
    } else if (use === 'scribe') {
      // the lodging of a lay student or copyist: a mat with a low desk, bundles of palm-leaf manuscripts between boards, a lamp on a stand, a chest, a water pot
      const du2 = (a0 + a1) / 2;
      mat(du2, back - 1.2, 2.0, 1.5);
      Bx('timber', du2 - 0.5, back - 1.7, du2 + 0.5, back - 1.2, fy + 0.28, fy + 0.34, true);
      for (const [s, t] of [[-0.45, -1.65], [0.45, -1.65], [-0.45, -1.25], [0.45, -1.25]]) Bx('timber', du2 + s - 0.03, back + t - 0.03, du2 + s + 0.03, back + t + 0.03, fy + 0.03, fy + 0.28);
      Bx('cloth_ochre', du2 - 0.3, back - 1.6, du2 + 0.2, back - 1.3, fy + 0.34, fy + 0.4); Bx('timber', du2 - 0.32, back - 1.62, du2 + 0.22, back - 1.28, fy + 0.4, fy + 0.43);
      for (let i = 0; i < 4; i++) { Bx('cloth_red', a0 + 0.2 + i * 0.5, back - 0.55, a0 + 0.62 + i * 0.5, back - 0.15, fy + 0.0, fy + 0.2); Bx('timber', a0 + 0.2 + i * 0.5, back - 0.55, a0 + 0.62 + i * 0.5, back - 0.15, fy + 0.2, fy + 0.24); }
      col.rect(rect(a0 + 0.1, back - 0.6, a0 + 2.2, back - 0.1), fy, fy + 0.3);
      const lp = P(du2 + 1.0, back - 1.5); Bx('timber', du2 + 0.97, back - 1.53, du2 + 1.03, back - 1.47, fy, fy + 0.8); bag.add('terracotta', lathe([[0.001, 0], [0.1, 0], [0.14, 0.05], [0.001, 0.03]], 6, null, lp[0], fy + 0.8, lp[1]));
      Bx('flame', du2 + 0.985, back - 1.515, du2 + 1.015, back - 1.485, fy + 0.84, fy + 0.94);
      bed(a1 - 1.1, back - 0.5, 1.8, 0.9, 'cloth_white');
      Bx('lacquer_chestnut', a1 - 0.8, T + 0.5, a1 - 0.2, T + 1.2, fy, fy + 0.6, true);
    } else if (use === 'rest') {
      // the pilgrims' rest: mats laid out side by side with bundles and staves, a water jar at the door, a lamp
      for (let i = 0; i < 4; i++) { const u = a0 + 0.9 + (i % 3) * 1.7, v = back - 0.9 - Math.floor(i / 3) * 1.4; if (u + 0.8 < a1) { mat(u, v, 1.4, 0.8); heap(['cloth_ochre', 'cloth_white', 'cloth_brown', 'cloth_ochre'][i], u - 0.5, v, 0.28, 0.3, fy + 0.03); Bx('bamboo_culm', u + 0.1, v + 0.45, u + 0.14, v + 0.49, fy, fy + 1.5); } }
      const p = P(a0 + 0.5, T + 0.4); bag.add('terracotta', lathe(scaled(1.8), 10, null, p[0], fy, p[1])); col.circle(p[0], p[1], 0.4, fy, fy + 0.9);
    } else {
      placeBeds(3);
      mat((a0 + a1) / 2, T + 2.2, 1.6, 1.0);
      bin(a0 + 0.55, T + 1.2, 0.8);
      Bx('lacquer_chestnut', a1 - 0.8, T + 0.45, a1 - 0.2, T + 1.1, fy, fy + 0.55, true);
      for (let i = 0; i < 3; i++) pot('terracotta', a1 - 0.5, T + 1.4 + i * 0.4, 1.0, fy, 1.0);
    }
    void hall;
    // a lamp in a niche of the front wall beside the door, and bunches of herbs and a garland over the doorway inside
    lampAt(du + dw / 2 + 0.55, T + 0.02, fy + 1.35);
    // (the hearths' lamps are the lamp_glass pieces above)
    void dz;
  }

  return { house_bihar: houseBihar };
}

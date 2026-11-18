// Café Museum, Friedrichstraße 6 / Operngasse 7 (docs/settlements/vienna.md §5): Loos's plain room of 1899 on the ground floor of
// a corner tenement — big windows in plain walls, the gold lettering on white over them, dark panelling, mirrors, newspapers on
// their holders, marble tables with Thonet chairs, a counter and a billiard table, globe lamps — with the house's upper floors.
// Built on the corner's two street faces (front 's' to Friedrichstraße, side 'e' to the cross street).
import { box, lathe, rod } from '../../core/geom.js';
import { faceFrame, fbox } from '../dutch/facade.js';
import { facade, rng } from './mietshaus.js';
import { FURNITURE } from '../modernisme/furniture.js';

const GH = 4.5, T = 0.5;

export function cafeHouse(el, ctx) {
  const { bag, col, lights } = ctx, y = el.y ?? 0, [x0, z0, x1, z1] = el.rect, n = el.storeys ?? 5, r = rng(el.seed || 5);
  const bx = (m, a0, b0, a1, b1, v0, v1) => { if (a1 - a0 < 1e-4 || b1 - b0 < 1e-4 || v1 - v0 < 1e-4) return; bag.add(m, box(Math.min(a0, a1), y + v0, Math.min(b0, b1), Math.max(a0, a1), y + v1, Math.max(b0, b1))); };
  const solid = (m, a0, b0, a1, b1, v0, v1, collide = true) => { bx(m, a0, b0, a1, b1, v0, v1); if (collide) col.rect([Math.min(a0, a1), Math.min(b0, b1), Math.max(a0, a1), Math.max(b0, b1)], y + v0, y + v1); };
  const mat = el.mat ?? 'stucco_pale';
  const wall = (along, at, s0, s1, th, cuts) => {
    const put = (p0, p1, q0, q1) => { if (p1 - p0 < 1e-3 || q1 - q0 < 1e-3) return; if (along === 'x') solid(mat, p0, at - th / 2, p1, at + th / 2, q0, q1); else solid(mat, at - th / 2, p0, at + th / 2, p1, q0, q1); };
    let s = s0; for (const c of [...cuts].sort((p, q) => p.c - q.c)) { const c0 = c.c - c.w / 2, c1 = c.c + c.w / 2; put(s, c0, -0.5, GH); if (c.v0 > 0.01) put(c0, c1, -0.5, c.v0); put(c0, c1, c.v1, GH); s = c1; } put(s, s1, -0.5, GH);
  };
  const W = x1 - x0, D = z1 - z0, FL = 0.1;
  // the front (south) wall: four big windows and the door; the side (east) wall: two windows and a door
  const front = [], side = [];
  const doorU = W - 4.2; // from the west end
  for (const c of [3.1, 7.6, 12.1, 16.6]) front.push({ c: x0 + c, w: 3.3, v0: 0.85, v1: 3.9 });
  front.push({ c: x0 + doorU, w: 1.9, v0: FL, v1: 3.6 });
  for (const c of [3.6, 8.2]) side.push({ c: z0 + D - c, w: 3.3, v0: 0.85, v1: 3.9 });
  side.push({ c: z0 + 3.2, w: 1.6, v0: FL, v1: 3.5 });
  wall('x', z1 - T / 2, x0, x1, T, front); wall('z', x1 - T / 2, z0, z1, T, side);
  solid(mat, x0, z0, x0 + T, z1, -0.5, GH); solid(mat, x0, z0, x1, z0 + T, -0.5, GH);
  // the upper floors over the room, and the room's ceiling
  const Ff = faceFrame(el.rect, 's'), Fs = faceFrame(el.rect, 'e');
  const info = facade(bag, Ff, y, { n, kind: 'gruender', seed: el.seed || 5, from: 1, lod: 0 });
  facade(bag, Fs, y, { n, kind: 'gruender', seed: (el.seed || 5) + 9, from: 1, lod: 0 });
  const H = info.H;
  bx(mat, x0, z0, x1, z1, GH, H); col.rect(el.rect, y + GH, y + H);
  bx('plaster_white', x0 + T, z0 + T, x1 - T, z1 - T, GH - 0.12, GH);
  bx('wood_ochre', x0 + T, z0 + T, x1 - T, z1 - T, FL - 0.06, FL);
  col.floor([x0 + T, z0 + T, x1 - T, z1 - T], y + FL);
  // the ground floor's face: the white band with the gold lettering, the plinth, the window frames (dark)
  const A = (F, m, ...q) => bag.add(m, fbox(F, y, ...q));
  for (const [F, len, lett] of [[Ff, W, 'CAFEMUSEUM'], [Fs, D, 'CAFEMUSEUM']]) {
    A(F, 'plaster_white', 0.0, len, 4.0, 4.5, 0, 0.08); A(F, 'granite_grey', 0, len, 0, 0.5, 0, 0.06);
    const c = len / 2; for (let k = 0; k < lett.length; k++) { const u = c - lett.length * 0.3 + k * 0.6; A(F, 'gold', u, u + 0.4, 4.1, 4.4, 0.08, 0.12); }
  }
  for (const c of front) if (c.v0 > 0.5) { const F = Ff, u = c.c - x0; A(F, 'wood_dark', u - c.w / 2 - 0.06, u + c.w / 2 + 0.06, c.v0 - 0.08, c.v0, 0, 0.1); A(F, 'wood_dark', u - c.w / 2 - 0.06, u + c.w / 2 + 0.06, c.v1, c.v1 + 0.08, 0, 0.1); A(F, 'opening', u - c.w / 2, u + c.w / 2, c.v0, c.v1, -0.02, 0.03); A(F, 'wood_dark', u - 0.03, u + 0.03, c.v0, c.v1, 0, 0.06); }
  for (const c of side) if (c.v0 > 0.5) { const F = Fs, u = z1 - c.c; A(F, 'wood_dark', u - c.w / 2 - 0.06, u + c.w / 2 + 0.06, c.v0 - 0.08, c.v0, 0, 0.1); A(F, 'wood_dark', u - c.w / 2 - 0.06, u + c.w / 2 + 0.06, c.v1, c.v1 + 0.08, 0, 0.1); A(F, 'opening', u - c.w / 2, u + c.w / 2, c.v0, c.v1, -0.02, 0.03); A(F, 'wood_dark', u - 0.03, u + 0.03, c.v0, c.v1, 0, 0.06); }
  for (const c of [front[4]]) { const u = c.c - x0; A(Ff, 'wood_dark', u - 0.9, u, FL, 3.5, -0.02, 0.05); A(Ff, 'wood_dark', u, u + 0.9, FL, 3.5, -0.02, 0.05); A(Ff, 'opening', u - 0.7, u + 0.7, 1.2, 3.3, 0.05, 0.07); A(Ff, 'gilt_bronze', u + 0.5, u + 0.55, 1.0, 1.5, 0.06, 0.1); }
  // ── inside: panelling, mirrors, the papers, the counter, the billiard table, the tables
  const ix0 = x0 + T, ix1 = x1 - T, iz0 = z0 + T, iz1 = z1 - T;
  bx('wood_dark', ix0, iz0, ix0 + 0.05, iz1, FL, 1.5); bx('wood_dark', ix0, iz0, ix1, iz0 + 0.05, FL, 1.5);
  for (let k = 0; k < 4; k++) { const a = ix0 + 2.2 + k * 5.4; bx('wood_dark', a - 1.15, iz0 + 0.05, a + 1.15, iz0 + 0.1, 1.5, 3.7); bx('mirror_tin', a - 1.05, iz0 + 0.1, a + 1.05, iz0 + 0.12, 1.65, 3.6); }
  for (let k = 0; k < 7; k++) { const a = ix0 + 0.1 + k * 0.0, b = iz0 + 2.0 + k * 1.3; bx('wood_dark', a, b - 0.02, a + 0.03, b + 0.02, 1.2, 2.2); bx('paint_white', a + 0.03, b - 0.28, a + 0.06, b + 0.28, 1.3, 2.0); }       // newspapers on their holders along the west wall
  for (let k = 0; k < 6; k++) { const a = ix0 + 2.2 + k * 3.6; bx('wood_dark', a - 0.02, iz0 + 0.14, a + 0.02, iz0 + 0.17, 1.3, 2.1); bx('paint_white', a - 0.28, iz0 + 0.17, a + 0.28, iz0 + 0.2, 1.4, 2.0); }
  // the counter in the north-west corner (with the back-bar's shelves and bottles)
  { const a0 = ix0 + 0.6, a1 = ix0 + 5.6, b0 = iz0 + 1.9, b1 = iz0 + 2.7; solid('wood_dark', a0, b0, a1, b1, FL, 1.05); bx('marble', a0 - 0.05, b0 - 0.05, a1 + 0.05, b1 + 0.05, 1.05, 1.1);
    for (let k = 0; k < 3; k++) { bx('wood_dark', a0, iz0 + 0.1, a1, iz0 + 0.5, 1.6 + k * 0.5, 1.64 + k * 0.5); for (let q = 0; q < 12; q++) { const a = a0 + 0.3 + q * 0.4; bag.add(['glaze_green', 'glass_lamp', 'cloth_red', 'terracotta'][(q + k) % 4], lathe([[0.001, 0], [0.05, 0], [0.05, 0.2], [0.02, 0.28], [0.001, 0.3]], 6, null, a, y + 1.64 + k * 0.5, iz0 + 0.3)); } }
    bag.add('glass_lamp', lathe([[0.001, 0], [0.22, 0.02], [0.2, 0.2], [0.001, 0.25]], 10, null, a0 + 1.2, y + 1.1, b0 + 0.4));
  }
  // the billiard table
  { const a = ix0 + 15.3, b = iz1 - 3.6; solid('wood_dark', a - 1.5, b - 0.8, a + 1.5, b + 0.8, 0.12, 0.8); bx('cloth_green', a - 1.3, b - 0.62, a + 1.3, b + 0.62, 0.8, 0.84); for (const s of [-1, 1]) for (const t of [-1, 1]) bx('wood_dark', a + s * 1.35 - 0.06, b + t * 0.65 - 0.06, a + s * 1.35 + 0.06, b + t * 0.65 + 0.06, FL, 0.12); lights?.push({ at: [a, y + 2.8, b], color: '#ffe8c0', intensity: 5, distance: 7 }); bx('lamp_white', a - 1.0, b - 0.3, a + 1.0, b + 0.3, 2.6, 2.75); for (const k of [-0.8, 0.8]) bag.add('iron', rod([a + k, y + 2.75, b], [a + k, y + GH - 0.05, b], 0.012, 4)); }
  // the pillars in the middle, clad in dark wood to the capital
  for (const a of [ix0 + 7.5, ix0 + 15.5]) { const b = (iz0 + iz1) / 2; solid('wood_dark', a - 0.3, b - 0.3, a + 0.3, b + 0.3, FL, 3.4); bx('gilt_bronze', a - 0.33, b - 0.33, a + 0.33, b + 0.33, 3.4, 3.5); bx('gilt_bronze', a - 0.33, b - 0.33, a + 0.33, b + 0.33, FL, 0.2); }
  // tables and their chairs in rows
  let k = 0;
  for (let a = ix0 + 2.2; a < ix1 - 1.5; a += 3.2) for (const b of [iz0 + 5.6, iz0 + 8.8]) {
    if (a > ix0 + 13.2 && a < ix0 + 18.0 && b > iz1 - 6.5) continue;
    if (Math.abs(a - (ix0 + 7.5)) < 0.7 || Math.abs(a - (ix0 + 15.5)) < 0.7) continue;
    if (b > iz1 - 1.3) continue;
    FURNITURE.terrace_set({ at: [a, b], y: y + FL, seed: k++ }, ctx);
  }
  // globe lamps hanging in a row
  for (const a of [ix0 + 3, ix0 + 8.5, ix0 + 14, ix0 + 19]) { const b = (iz0 + iz1) / 2; bag.add('iron', rod([a, y + GH - 0.12, b], [a, y + GH - 0.9, b], 0.012, 4)); bag.add('lamp_white', lathe([[0.001, -0.14], [0.14, -0.06], [0.16, 0.05], [0.1, 0.13], [0.001, 0.14]], 10, null, a, y + GH - 1.0, b)); lights?.push({ at: [a, y + GH - 1.1, b], color: '#ffd9a0', intensity: 5, distance: 10 }); }
  void r;
}

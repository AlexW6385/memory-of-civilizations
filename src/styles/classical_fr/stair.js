// The Ambassadors' Staircase (Le Vau and d'Orbay, 1672–74, decorated by Le Brun until 1679; demolished 1752;
// docs/settlements/versailles.md §1c): the entrance to the King's Grand Apartment. A vestibule under a barrel
// vault opens by three arches on the flight; the flight climbs to a platform where a fountain plays — a basin of
// red marble held by two bronze dolphins — under the bust of the King; from it two flights rise left and right
// to the landing and the doors of the Salons of Diana and of Venus. Marbles of France, red, green, white and grey,
// face the walls; above them Le Brun's painted Parts of the World and the King's victories; a roof of glass
// lights it from above.
//
// ambassadors: { rect (the hall inside its walls: the fronts stand outside it), y, h, fy (the landing), py (the platform) }

import { box, lathe, frustum } from '../../core/geom.js';
import { planarWall } from '../byzantine/index.js';
import { gardenFront } from './front.js';
import { frame, painting, wallPainting, cove, marbleFloor, bar, MS, WM, RM, GM, DM, GB, GD } from './rooms.js';
import { bust } from './court.js';

const S = 'sandstone_dressed';

export function ambassadors(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 22, T = y + h, FY = el.fy, PY = el.py, cz = (z0 + z1) / 2;
  const Y0 = y + 0.06;
  // the plan, west (up) to east (down): landing, the side flights and the tongue between them, the platform,
  // the central flight between its cheeks, the arcade wall, the vestibule
  const xL = x0 + 2.2, xP = xL + 6.5, xC = xP + 4.5, xA = xC + 8.0, xV = xA + 0.6;
  const zN = z0 + 3.4, zS = z1 - 3.4;
  const CO = 24.2;                                                    // the cornice: the coved ceiling springs here
  // ── the fronts outside, the south and west walls, the corner pier, the roof with its glazed lantern
  gardenFront(ctx, 'n', el.rect, y, h, { inside: { bays: [0, 1, 2, 3, 4, 5], storeys: 'gp' } });
  gardenFront(ctx, 'e', el.rect, y, h, { door: 1, inside: { bays: [0, 2], storeys: 'g' } });
  bag.add(S, box(x1, y - 0.3, z0 - 0.6, x1 + 0.6, T, z0)); col.rect([x1, z0 - 0.6, x1 + 0.6, z0], y - 0.3, T);
  bag.add(S, box(x0 - 0.6, y - 0.5, z1, x1 + 0.6, T, z1 + 0.6)); col.rect([x0 - 0.6, z1, x1 + 0.6, z1 + 0.6], y - 0.5, T);
  for (const [a, b] of [[0.34, 0.36], [0.78, 0.86], [0.985, 1.0]]) bag.add(S, box(x0, y + h * a, z1 + 0.6, x1 + 0.6, y + h * b, z1 + 0.9));
  const doors = [{ z: cz + 3.5, w: 1.9, hh: 4.06 }, { z: z0 + 2.4, w: 1.9, hh: 4.06 }];
  bag.add(S, planarWall({ o: [x0 - 0.3, (z0 - 0.6 + z1 + 0.6) / 2], u: [0, 1], th: 0.6, u0: -(z1 - z0 + 1.2) / 2, u1: (z1 - z0 + 1.2) / 2, y0: y - 0.5, y1: T, holes: doors.map((d) => ({ u0: d.z - d.w / 2 - (z0 + z1) / 2, u1: d.z + d.w / 2 - (z0 + z1) / 2, y0: FY - 0.06, y1: FY + d.hh })) }));
  { let cur = z0 - 0.6; for (const d of [...doors].sort((p, q) => p.z - q.z)) { col.rect([x0 - 0.6, cur, x0, d.z - d.w / 2], y - 0.5, T); col.rect([x0 - 0.6, d.z - d.w / 2, x0, d.z + d.w / 2], FY + d.hh, T); col.rect([x0 - 0.6, d.z - d.w / 2, x0, d.z + d.w / 2], y - 0.5, FY - 0.06); cur = d.z + d.w / 2; } col.rect([x0 - 0.6, cur, x0, z1 + 0.6], y - 0.5, T); }
  for (const d of doors) { bag.add(MS, box(x0 - 0.6, FY - 0.06, d.z - d.w / 2, x0, FY, d.z + d.w / 2)); col.floor([x0 - 0.6, d.z - d.w / 2, x0, d.z + d.w / 2], FY); for (const s of [-1, 1]) bag.add(MS, box(x0 - 0.6, FY, d.z + s * d.w / 2 - (s > 0 ? 0.03 : 0), x0, FY + d.hh, d.z + s * d.w / 2 + (s > 0 ? 0 : 0.03))); }
  bag.add(S, box(x0, T - 0.5, z0, x1, T, z1)); col.rect(el.rect, T - 0.5, T); col.floor(el.rect, T);
  bag.add('lead', box(x0 + 0.8, T, z0 + 0.8, x1 - 0.8, T + 0.6, z1 - 0.8));
  const SKY = [xL + 1.7, zN + 0.4, xA - 3.8, zS - 0.4];
  bag.add('glass_outer', frustum(SKY, T + 0.6, T + 2.4, 1.6, 1.6, 1.6, 1.6));
  for (let x = SKY[0]; x <= SKY[2] + 1e-6; x += (SKY[2] - SKY[0]) / 8) bag.add('iron', box(x - 0.04, T + 0.6, SKY[1], x + 0.04, T + 0.66, SKY[3]));
  // ── the vestibule: its marble floor, the barrel vault, the three arches toward the stair
  marbleFloor(bag, col, [xV, z0, x1, z1], Y0);
  bag.add(MS, box(x1, y, cz - 1.0, x1 + 0.6, Y0, cz + 1.0)); col.floor([x1, cz - 1.0, x1 + 0.6, cz + 1.0], Y0);
  const VSP = 13.25, VR = (x1 - xV) / 2, vx = (xV + x1) / 2;
  { const g = lathe([[VR, 0], [VR, z1 - z0]], 24); g.rotateX(Math.PI / 2); g.translate(vx, VSP, z0); flipInside(g); keepUpper(g, VSP); bag.add('stucco', g); }
  for (let z = z0 + 1.15; z < z1 - 0.5; z += 2.3) { const g = lathe([[VR - 0.02, 0], [VR - 0.02, 0.3]], 24); g.rotateX(Math.PI / 2); g.translate(vx, VSP, z - 0.15); flipInside(g); keepUpper(g, VSP); bag.add(GD, g); }
  bag.add(S, box(xV, VSP + VR, z0, x1, T - 0.5, z1)); col.rect([xV, z0, x1, z1], VSP + VR, T - 0.5);
  const arches = [{ uc: 0, r: 2.0, spring: 10.26, sill: y }, { uc: -(cz - (z0 + zN) / 2), r: 1.2, spring: 10.26, sill: y }, { uc: (zS + z1) / 2 - cz, r: 1.2, spring: 10.26, sill: y }];
  bag.add(S, planarWall({ o: [(xA + xV) / 2, cz], u: [0, 1], th: xV - xA, u0: z0 - cz, u1: z1 - cz, y0: y - 0.5, y1: T - 0.5, arches }));
  col.rect([xA, z0, xV, cz - 2.0], y - 0.5, T - 0.5); col.rect([xA, cz + 2.0, xV, z1], y - 0.5, T - 0.5); col.rect([xA, cz - 2.0, xV, cz + 2.0], 10.26 + 2.0, T - 0.5);
  bag.add(MS, box(xA, y, cz - 2.0, xV, Y0, cz + 2.0)); col.floor([xA, cz - 2.0, xV, cz + 2.0], Y0);
  { const F = frame(bag, [xV, z1], [1, 0]), L = z1 - z0;
    F.slab(WM, 0, 0.05, 0, L, Y0, VSP, arches.map((a) => ({ ...a, uc: cz - (cz + a.uc) + L / 2, sill: Y0 })));
    for (const a of arches) { const u = L / 2 - a.uc; F.ring(GD, u, a.spring, a.r, a.r + 0.2, 0.05, 0.12, 0, Math.PI, 16); for (const s of [-1, 1]) F.box(RM, u + s * a.r, u + s * (a.r + 0.28), Y0, a.spring, 0.05, 0.14); }
    F.box(DM, 0, L, Y0, Y0 + 0.2, 0.05, 0.09); F.box(MS, 0, L, VSP - 0.4, VSP, 0.05, 0.35); }
  for (const [o, n, L] of [[[x1, z0], [-1, 0], z1 - z0], [[xV, z0], [0, 1], x1 - xV], [[x1, z1], [0, -1], x1 - xV]]) {
    const F = frame(bag, o, n);
    const holes = [];
    if (n[0] < 0) holes.push({ uc: cz - z0, r: 1.0, spring: 12.17, sill: Y0 }, { uc: (z1 - z0) / 6, r: 1.0, spring: 12.17, sill: y + 0.8 }, { uc: (z1 - z0) * 5 / 6, r: 1.0, spring: 12.17, sill: y + 0.8 });
    if (n[1] > 0) { const bwN = (x1 - x0) / 6, uc = x0 + 5.5 * bwN - xV; holes.push({ uc, r: 1.0, spring: 12.17, sill: y + 0.8 }); }
    F.slab(WM, 0, 0.05, 0, L, Y0, VSP, holes);
    F.box(DM, 0, L, Y0, Y0 + 0.2, 0.05, 0.09); F.box(MS, 0, L, VSP - 0.4, VSP, 0.05, 0.35);
    for (const a of holes) F.ring(GD, a.uc, a.spring, a.r, a.r + 0.15, 0.05, 0.1, 0, Math.PI, 12);
  }
  // ── the central flight between its cheeks, the platform, the tongue, the side flights, the landing
  const nC = 24, rC = (PY - Y0) / nC, tC = (xA - xC) / nC;
  for (let i = 0; i < nC; i++) { const xs = xA - (i + 1) * tC; bag.add('marble', box(xs, y, cz - 3.5 + 0.0, xs + tC, Y0 + (i + 1) * rC, cz + 3.5)); bag.add(MS, box(xs - 0.03, Y0 + (i + 1) * rC - 0.04, cz - 3.5, xs + tC, Y0 + (i + 1) * rC, cz + 3.5)); }
  col.ramp([xC, zN, xA, zS], Y0, PY, 'w');
  const pf = (r) => { bag.add(S, box(r[0], y, r[1], r[2], PY - 0.06, r[3])); col.rect(r, y, PY - 0.06); marbleFloor(bag, col, r, PY, 1.1); };
  pf([xC, z0, xA, zN]); pf([xC, zS, xA, z1]); pf([xP, z0, xC, z1]); pf([xL, zN, xP, zS]);
  const nS = 22, rS = (FY - PY) / nS, tS = (xP - xL) / nS;
  for (const [za, zb2] of [[z0, zN], [zS, z1]]) {
    for (let i = 0; i < nS; i++) { const xs = xP - (i + 1) * tS; bag.add('marble', box(xs, y, za, xs + tS, PY + (i + 1) * rS - 0.04, zb2)); bag.add(MS, box(xs - 0.03, PY + (i + 1) * rS - 0.04, za, xs + tS, PY + (i + 1) * rS, zb2)); }
    col.ramp([xL, za, xP, zb2], PY, FY, 'w');
  }
  bag.add(S, box(x0, y, z0, xL, FY - 0.06, z1)); col.rect([x0, z0, xL, z1], y, FY - 0.06); marbleFloor(bag, col, [x0, z0, xL, z1], FY, 1.1);
  // the balustrades: along the landing's edge, down the side flights' inner edges, along the cheeks of the central flight
  const balus = (a, b, ya, yb, n) => {
    for (let k = 0; k <= n; k++) { const t = (k + 0.5) / (n + 1), px = a[0] + (b[0] - a[0]) * t, pz = a[1] + (b[1] - a[1]) * t, py = ya + (yb - ya) * t; bag.add(MS, lathe([[0.07, 0], [0.05, 0.1], [0.1, 0.32], [0.045, 0.62], [0.065, 0.7], [0.065, 0.76]], 8, null, px, py + 0.1, pz)); }
    bag.add(RM, bar([a[0], ya + 0.86, a[1]], [b[0], yb + 0.86, b[1]], 0.2)); bag.add(RM, bar([a[0], ya + 0.05, a[1]], [b[0], yb + 0.05, b[1]], 0.18));
    col.segment(a, b, 0.2, Math.min(ya, yb), Math.max(ya, yb) + 1.0);
  };
  balus([xL, zN + 0.1], [xL, zS - 0.1], FY, FY, 22);
  for (const zz of [zN + 0.1, zS - 0.1]) { balus([xP, zz], [xL + 0.1, zz], PY, FY - 0.1, 20); balus([xA - 0.1, zz], [xC, zz], PY, PY, 24); }
  for (const zz of [zN, zS]) for (const xx of [xL, xP, xC, xA - 0.1]) bag.add(RM, box(xx - 0.2, xx === xL ? FY : PY, zz - 0.2 + (zz === zN ? 0.1 : -0.1), xx + 0.2, (xx === xL ? FY : PY) + 1.05, zz + 0.2 + (zz === zN ? 0.1 : -0.1)));
  // the fountain on the platform, against the landing's wall: the basin of red marble on two bronze dolphins, the bust above
  { const fx = xL + 0.9, by = PY + 0.85;
    bag.add(RM, lathe([[0.001, 0], [0.6, 0.02], [0.85, 0.18], [0.92, 0.3], [0.88, 0.34], [0.6, 0.22], [0.001, 0.22]], 20, null, fx, by, cz));
    bag.add('water', lathe([[0.001, 0], [0.8, 0], [0.8, 0.005], [0.001, 0.005]], 20, null, fx, by + 0.27, cz));
    for (const s of [-1, 1]) {
      const g = lathe([[0.001, -0.55], [0.14, -0.42], [0.2, -0.1], [0.16, 0.25], [0.08, 0.5], [0.001, 0.56]], 10); g.rotateX(s * 0.55); g.translate(fx, PY + 0.5, cz + s * 0.3); bag.add('bronze', g);
      bag.add('bronze', lathe([[0.001, 0], [0.12, 0.03], [0.14, 0.12], [0.001, 0.2]], 8, null, fx, PY, cz + s * 0.55));
    }
    bag.add(RM, lathe([[0.5, 0], [0.45, 0.05], [0.2, 0.15], [0.16, 0.3], [0.001, 0.3]], 14, null, fx, PY, cz));
    col.circle(fx, cz, 0.95, PY, by + 0.34);
    const F = frame(bag, [xL, zS], [1, 0]), L = zS - zN, c = L / 2;
    F.slab(WM, 0, 0.04, 0, L, PY, FY - 0.06);
    for (const s of [-1, 1]) { F.box(GM, c + s * 2.2 - 0.9, c + s * 2.2 + 0.9, PY + 0.4, FY - 0.5, 0.04, 0.06); F.box(RM, c + s * 0.7 - 0.12, c + s * 0.7 + 0.12, PY, FY - 0.06, 0.04, 0.2); }
    F.box(RM, 0, L, FY - 0.36, FY - 0.06, 0.04, 0.16);
    F.ring(GD, c, PY + 2.55, 0.62, 0.74, 0.04, 0.1, 0, Math.PI, 14); for (const s of [-1, 1]) F.box(GD, c + s * 0.62, c + s * 0.74, PY + 1.4, PY + 2.55, 0.04, 0.1);
    F.box(DM, c - 0.62, c + 0.62, PY + 1.4, PY + 2.55, 0.04, 0.05);
    F.box(MS, c - 0.32, c + 0.32, PY + 1.5, PY + 1.62, 0.04, 0.42);
    const p = F.P(c, 0.26); bust(bag, p[0], PY + 1.62, p[1], -Math.PI / 2, 1.3);
    F.add('water_jet', lathe([[0.02, 0], [0.018, 0.35]], 5).rotateZ(Math.PI / 2 - 0.4).translate(c, PY + 1.25, 0.06));
  }
  // ── the walls of the stair: marble below the landing's level, the pilasters and their capitals, the entablature;
  // above, the painted Parts of the World (south) and the victories (west, over the doors; east, over the arcade)
  const bwN = (x1 - x0) / 6;
  { // north: the windows of the front between Rance pilasters
    const F = frame(bag, [x0, z0], [0, 1]), L = xA - x0, holes = [];
    for (let i = 0; i < 6; i++) { const uc = (i + 0.5) * bwN; if (uc > L - 1.0) continue; holes.push({ uc, r: 1.0, spring: 12.17, sill: y + 0.8 }, { uc, r: 1.1, spring: 21.46, sill: 14.47 }); }
    F.slab(WM, 0, 0.05, 0, L, y, CO - 0.8, holes);
    for (const a of holes) F.ring(a.r > 1.05 ? GD : MS, a.uc, a.spring, a.r, a.r + 0.16, 0.05, 0.1, 0, Math.PI, 12);
    for (let i = 0; i <= 6; i++) { const u = i * bwN; if (u > L - 0.3) continue; F.box(RM, u - 0.4, u + 0.4, FY, CO - 1.7, 0.05, 0.2); F.box(GB, u - 0.46, u + 0.46, CO - 1.7, CO - 1.5, 0.05, 0.26); for (const s of [-1, 1]) F.disc(GB, [[0.001, 0], [0.1, 0.02], [0.1, 0.06], [0.001, 0.08]], u + s * 0.36, CO - 1.62, 0.18, 10); F.box(GB, u - 0.5, u + 0.5, CO - 1.5, CO - 1.4, 0.05, 0.3); F.box(MS, u - 0.48, u + 0.48, FY - 0.06, FY + 0.4, 0.05, 0.27); }
    entab(F, L, CO);
  }
  { // south: blind; the four Parts of the World painted between the pilasters, marble panels below
    const F = frame(bag, [xA, z1], [0, -1]), L = xA - x0, n = 4, pw = L / n;
    F.slab(WM, 0, 0.05, 0, L, y, CO - 0.8);
    for (let i = 0; i <= n; i++) { const u = i * pw; F.box(RM, Math.max(0, u - 0.4), Math.min(L, u + 0.4), FY, CO - 1.7, 0.05, 0.2); F.box(GB, Math.max(0, u - 0.46), Math.min(L, u + 0.46), CO - 1.7, CO - 1.4, 0.05, 0.28); F.box(MS, Math.max(0, u - 0.48), Math.min(L, u + 0.48), FY - 0.06, FY + 0.4, 0.05, 0.27); }
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) * pw;
      wallPainting(bag, F, u, (FY + 0.6 + CO - 1.9) / 2, pw - 1.6, CO - 1.9 - FY - 1.2, { seed: 1674 + i, kind: i % 2 ? 'earth' : 'sky', frame: 0, d: 0.05 });
      F.box(GM, u - pw / 2 + 0.6, u + pw / 2 - 0.6, PY + 0.5, FY - 0.6, 0.05, 0.065); F.box(RM, u - pw / 2 + 0.45, u + pw / 2 - 0.45, PY + 0.35, PY + 0.5, 0.05, 0.08); F.box(RM, u - pw / 2 + 0.45, u + pw / 2 - 0.45, FY - 0.6, FY - 0.45, 0.05, 0.08);
    }
    entab(F, L, CO);
  }
  { // west: over the doors of Diana and Venus, a victory of the King in a gilt frame
    const F = frame(bag, [x0, z1], [1, 0]), L = z1 - z0, du = doors.map((d) => z1 - d.z);
    F.slab(WM, 0, 0.05, 0, L, FY, CO - 0.8, [], du.map((u) => ({ u0: u - 0.95, u1: u + 0.95, y0: FY, y1: FY + 4.06 })));
    for (const u of du) { F.box(MS, u - 1.17, u - 0.95, FY, FY + 4.28, 0.05, 0.14); F.box(MS, u + 0.95, u + 1.17, FY, FY + 4.28, 0.05, 0.14); F.box(MS, u - 0.95, u + 0.95, FY + 4.06, FY + 4.28, 0.05, 0.14); F.box(GB, u - 1.25, u + 1.25, FY + 4.28, FY + 4.45, 0.05, 0.22); }
    wallPainting(bag, F, L / 2, FY + 6.3, 6.0, 3.0, { seed: 1677, kind: 'earth', frame: 0, d: 0.05 });
    entab(F, L, CO);
  }
  { // east: the arcade wall's upper face, with the victory over the arches
    const F = frame(bag, [xA, z0], [-1, 0]), L = z1 - z0;
    F.slab(WM, 0, 0.05, 0, L, y, CO - 0.8, [{ uc: cz - z0, r: 2.0, spring: 10.26, sill: y }, { uc: (zN + z0) / 2 - z0, r: 1.2, spring: 10.26, sill: y }, { uc: (zS + z1) / 2 - z0, r: 1.2, spring: 10.26, sill: y }]);
    for (const a of [cz - z0, (zN + z0) / 2 - z0, (zS + z1) / 2 - z0]) F.ring(GD, a, 10.26, a === cz - z0 ? 2.0 : 1.2, (a === cz - z0 ? 2.0 : 1.2) + 0.2, 0.05, 0.12, 0, Math.PI, 14);
    wallPainting(bag, F, L / 2, 17.6, 8.0, 5.6, { seed: 1676, kind: 'earth', frame: 0, d: 0.05 });
    entab(F, L, CO);
  }
  // ── the ceiling: a cove springing from the cornice, the flat middle lit by the glass roof (its panes and iron bars)
  const cv = cove(bag, 'paint_ochre', [x0, z0, xA, z1], CO, 2.0, 2.0);
  for (const f of 'ns') painting(bag, cv.side(f), { s: 0, t: 1.0, ws: 12, wt: 1.1, kind: 'gold', seed: f === 'n' ? 5 : 6, frame: 0.1, off: 0.02 });
  const top = CO + 2.0 - 0.02, [sx0, sz0, sx1, sz1] = SKY;
  bag.add('daylight_plain', box(sx0, top - 0.01, sz0, sx1, top, sz1));
  for (let x = sx0; x <= sx1 + 1e-6; x += (sx1 - sx0) / 8) bag.add('iron', box(x - 0.05, top - 0.07, sz0, x + 0.05, top - 0.01, sz1));
  for (let z = sz0; z <= sz1 + 1e-6; z += (sz1 - sz0) / 4) bag.add('iron', box(sx0, top - 0.07, z - 0.05, sx1, top - 0.01, z + 0.05));
  for (const [a, b, c, d] of [[sx0 - 0.3, sx1 + 0.3, sz0 - 0.3, sz0], [sx0 - 0.3, sx1 + 0.3, sz1, sz1 + 0.3], [sx0 - 0.3, sx0, sz0, sz1], [sx1, sx1 + 0.3, sz0, sz1]]) bag.add(GD, box(a, top - 0.1, c, b, top, d));
}

/** The entablature at the top of a wall (frame F, length L), under the cove springing at co. */
function entab(F, L, co) {
  F.box(MS, 0, L, co - 1.4, co - 1.05, 0.05, 0.28); F.box(GB, 0, L, co - 1.22, co - 1.18, 0.05, 0.29);
  F.box(WM, 0, L, co - 1.05, co - 0.6, 0.05, 0.24);
  F.box(GB, 0, L, co - 0.6, co - 0.54, 0.05, 0.32); F.box(MS, 0, L, co - 0.54, co - 0.38, 0.05, 0.45);
  for (let u = 0.3; u < L - 0.1; u += 0.55) F.box(MS, u - 0.06, u + 0.06, co - 0.38, co - 0.18, 0.4, 0.66);
  F.box(MS, 0, L, co - 0.18, co, 0.05, 0.72);
}

/** A lathe turned to face inward (a vault seen from below). */
function flipInside(g) {
  const p = g.attributes.position.array, n = g.attributes.normal.array;
  for (let i = 0; i < p.length; i += 9) for (let k = 0; k < 3; k++) { const t = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = t; const u = n[i + 3 + k]; n[i + 3 + k] = n[i + 6 + k]; n[i + 6 + k] = u; }
  for (let i = 0; i < n.length; i++) n[i] = -n[i];
}
/** Keep only the triangles of a geometry lying above y (the upper half of a barrel). */
function keepUpper(g, y) {
  const p = g.attributes.position.array, n = g.attributes.normal.array, kp = [], kn = [];
  for (let i = 0; i < p.length; i += 9) {
    if (p[i + 1] < y - 1e-4 || p[i + 4] < y - 1e-4 || p[i + 7] < y - 1e-4) continue;
    for (let k = 0; k < 9; k++) { kp.push(p[i + k]); kn.push(n[i + k]); }
  }
  g.setAttribute('position', new g.attributes.position.constructor(new Float32Array(kp), 3)); g.setAttribute('normal', new g.attributes.normal.constructor(new Float32Array(kn), 3));
}

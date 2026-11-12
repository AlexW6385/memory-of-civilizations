// The church of Santa Maria at the Jerónimos about 1520 (docs/settlements/manueline-lisbon.md §3): a hall church of three aisles of
// one height under net vaults, on six slender octagonal columns carved like rope; the choir gallery over a low vault at the west;
// the raised main chapel with its retable; tall round-headed windows; the south portal with its Navigator on the pier and the arms
// of Manuel; buttresses with pinnacles; rope courses along the walls. Element `jeron_church` { rect, y, portalX }.
import { box, lathe, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import { archWall } from '../gothic/nd-interior.js';
import { tube } from '../../objects/kit.js';
import { furnishChurch } from './furnish.js';
import { ropeColumn, netVault, pinnacle, armillary, orderCross, wallRun, addBox } from './util.js';

const T = 2.5, SPRING = 19.5, CROWN = 25.5, WALL = 26;
const MAT = 'limestone_yellow', CARVED = 'limestone_carved';

/** The church's key dimensions from its rect, shared with the plan (rooms, walks). */
export function churchFrame(rect) {
  const [x0, z0, x1, z1] = rect, xi0 = x0 + T, xi1 = x1 - T, zi0 = z0 + T, zi1 = z1 - T, zc = (z0 + z1) / 2;
  return { xi0, xi1, zi0, zi1, zc, bays: [0, 10, 20, 30, 40, 50].map((d) => xi0 + d), chancel: xi0 + 50, rows: [zc - 4.5, zc + 4.5] };
}
export function jeronChurch(el, ctx) {
  const { bag, col, lights } = ctx, rect = el.rect, y = el.y ?? 0, [x0, z0, x1, z1] = rect, F = churchFrame(rect);
  const { xi0, xi1, zi0, zi1, zc, bays, chancel, rows } = F, px = el.portalX;
  // ── the floor: slabs, the chancel raised on steps
  bag.add('limestone', box(xi0, y - 0.6, zi0, chancel, y, zi1)); col.floor([xi0, zi0, chancel, zi1], y);
  bag.add('limestone', box(chancel, y - 0.6, zi0, xi1, y + 1.2, zi1));
  for (let k = 0; k < 4; k++) { const xs = chancel - 0.9 * (k + 1); bag.add('limestone', box(xs, y - 0.6, zi0 + 4, chancel, y + 0.3 * (k + 1) * 0.8, zi1 - 4)); }
  col.ramp([chancel - 3.6, zi0 + 4, chancel, zi1 - 4], y, y + 0.96, 'e'); col.floor([chancel, zi0, xi1, zi1], y + 1.2);
  col.ramp([chancel - 0.001, zi0, chancel, zi0 + 4], y + 0.96, y + 1.2, 'e');
  // ── the outer walls, with the arched windows; the south wall pierced by the portal, the north by the door to the cloister
  const win = (uc, sill, spring) => ({ uc, r: 2.2, sill, spring, f: 0.5 });
  const nWin = [], sWin = [];
  for (let b = 0; b < 5; b++) {
    const uc = (bays[b] + bays[b + 1]) / 2 - x0;
    if (b !== 3) nWin.push(win(uc, y + 14.6, y + 17.2));
    if (Math.abs(uc + x0 - px) > 6.2) sWin.push(win(uc, y + 8.6, y + 17));
  }
  // north: the door (r 1.5) into the cloister gallery near bay 3, windows high above the gallery roof
  const doorU = (bays[3] + bays[4]) / 2 - x0;
  nWin.push({ uc: doorU, r: 1.5, sill: y, spring: y + 2.7, f: 0.5 });
  nWin.sort((a, b) => a.uc - b.uc);
  const W = [];
  const wallTris = (zA, zB, ops, face) => {
    archWall(W, (u, yy, d) => [x0 + u, yy, zA + (zB - zA) * (d / T)], { u0: 0, u1: x1 - x0, d0: 0, d1: T, y0: y - 0.5, y1: y + WALL - 1, openings: ops, n: 8 });
    void face;
  };
  wallTris(z1 - T, z1, sWin.sort((a, b) => a.uc - b.uc), 's'); bag.add(MAT, fromTriangles(W.splice(0)));
  wallTris(z0, z0 + T, nWin, 'n'); bag.add(MAT, fromTriangles(W.splice(0)));
  // west and east end walls (solid, a big window in the west one)
  bag.add(MAT, box(x0, y - 0.5, z0, xi0, y + WALL - 1, z1)); bag.add(MAT, box(xi1, y - 0.5, z0, x1, y + WALL - 1, z1));
  col.rect([x0, z0, xi0, z1], y - 0.5, y + WALL); col.rect([xi1, z0, x1, z1], y - 0.5, y + WALL);
  // collision of the long walls: the south one but for the portal's two doors, the north but for the cloister door
  const sGaps = [{ at: px - x0, w: 6.2, h: 99 }], nGaps = [{ at: doorU, w: 3.2, h: 99 }];
  wallRun({ bag: { add() {} }, col }, [x0, z1 - T / 2], [x1, z1 - T / 2], T, y - 0.5, y + WALL, MAT, sGaps);
  wallRun({ bag: { add() {} }, col }, [x0, z0 + T / 2], [x1, z0 + T / 2], T, y - 0.5, y + WALL, MAT, nGaps);
  // mullions and transoms in every window: stone bars, the tracery of the Manueline window reduced to a few rods
  for (const [ops, zf, zb] of [[sWin, z1 - T, z1], [nWin.filter((o) => o.r > 2), z0, z0 + T]]) for (const o of ops) {
    const xc = x0 + o.uc, zm = (zf + zb) / 2, top = o.spring + 2.2;
    addBox(bag, CARVED, xc - 0.12, o.sill, zm - 0.18, xc + 0.12, top, zm + 0.18);
    for (const k of [0.4, 0.75]) addBox(bag, CARVED, xc - 2.2, o.sill + (o.spring - o.sill) * k, zm - 0.15, xc + 2.2, o.sill + (o.spring - o.sill) * k + 0.2, zm + 0.15);
  }
  // the west window and the east end
  addBox(bag, 'stained_glass', xi0 - 0.02, y + 9, zc - 3, xi0 + 0.06, y + 19, zc + 3);
  // ── the columns, the wall responds, the vaults
  for (const bx of [bays[2], bays[3], bays[4]]) for (const rz of rows) ropeColumn(ctx, bx, rz, y, SPRING, 0.95, { mat: MAT, carved: CARVED });
  for (const bx of bays.slice(1, 5)) for (const [zw, s] of [[zi0, 1], [zi1, -1]]) {
    addBox(bag, MAT, bx - 0.7, y, Math.min(zw, zw + s * 0.9), bx + 0.7, y + SPRING - 1.2, Math.max(zw, zw + s * 0.9));
    col.rect([bx - 0.7, Math.min(zw, zw + s * 0.9), bx + 0.7, Math.max(zw, zw + s * 0.9)], y, y + SPRING);
  }
  const zedges = [zi0, rows[0], rows[1], zi1];
  for (let b = 1; b < 5; b++) for (let c = 0; c < 3; c++) netVault(bag, [bays[b], zedges[c], bays[b + 1], zedges[c + 1]], y + SPRING, y + (c === 1 ? CROWN : CROWN - 1), { mat: 'limestone', rib: MAT });
  // the chancel: two cells, its own spring a little lower on the raised floor
  for (let c = 0; c < 3; c++) for (const [xa, xb] of [[chancel, chancel + 8.5], [chancel + 8.5, xi1]]) netVault(bag, [xa, zedges[c], xb, zedges[c + 1]], y + SPRING, y + (c === 1 ? CROWN : CROWN - 1), { mat: 'limestone', rib: MAT, rich: true });
  // the choir gallery over the low vault at the west: its floor, a carved parapet, two columns under it
  const gy = y + 8.4;
  bag.add('limestone', box(xi0, gy - 0.5, zi0, bays[1], gy, zi1));
  addBox(bag, CARVED, bays[1] - 0.35, gy, zi0, bays[1], gy + 1.15, zi0 + 0.9); addBox(bag, CARVED, bays[1] - 0.35, gy, zi0 + 3.4, bays[1], gy + 1.15, zi1);
  for (let u = zi0 + 0.6; u < zi1; u += 1.2) if (u < zi0 + 0.9 || u > zi0 + 3.2) addBox(bag, 'limestone', bays[1] - 0.52, gy + 0.2, u, bays[1] - 0.2, gy + 1.0, u + 0.35);
  for (const rz of rows) ropeColumn(ctx, bays[1] - 0.1, rz, y, 8.0, 0.55, { mat: MAT, carved: CARVED, capital: false });
  for (let c = 0; c < 3; c++) netVault(bag, [xi0, zedges[c], bays[1], zedges[c + 1]], y + 6.4, y + 8.0, { mat: 'limestone', rib: MAT, rich: false, n: 4 });
  // the roof: a stone terrace over the vaults with a parapet
  bag.add('limestone', box(x0, y + WALL - 1, z0, x1, y + WALL + 0.3, z1));
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(L / 2.4);
    for (let k = 0; k <= n; k++) { const t = k / n, X = a[0] + (b[0] - a[0]) * t, Z = a[1] + (b[1] - a[1]) * t; pinnacle(bag, CARVED, X, y + WALL + 0.3, Z, 0.4, 2.0, 6); }
    bag.add(MAT, rod([a[0], y + WALL + 0.9, a[1]], [b[0], y + WALL + 0.9, b[1]], 0.14, 5));
  }
  // rope courses along the long walls, outside, at the string levels
  for (const yy of [6.6, 20.8]) for (const [zz] of [[z1 + 0.1], [z0 - 0.1]]) bag.add(CARVED, rod([x0, y + yy, zz], [x1, y + yy, zz], 0.14, 5));
  // buttresses with pinnacles on the south wall (between the windows) and the north above the cloister roof
  for (let b = 1; b < 5; b++) {
    const bx = bays[b];
    if (Math.abs(bx - px) < 8) continue;
    addBox(bag, MAT, bx - 0.7, y - 0.5, z1, bx + 0.7, y + WALL - 0.5, z1 + 1.9); col.rect([bx - 0.7, z1, bx + 0.7, z1 + 1.9], y - 0.5, y + WALL);
    pinnacle(bag, CARVED, bx, y + WALL - 0.5, z1 + 1.0, 0.7, 4.2, 8);
    armillary(bag, CARVED, bx, y + 14, z1 + 2.0, 0.55);
  }
  // the two stair turrets at the west corners, octagonal, with their caps
  for (const zz of [z0 + 1.3, z1 - 1.3]) { bag.add(MAT, lathe([[2.0, 0], [1.9, WALL + 3]], 8, null, x0 + 1.2, y - 0.5, zz)); pinnacle(bag, CARVED, x0 + 1.2, y + WALL + 2.5, zz, 2.2, 5.5, 8); col.circle(x0 + 1.2, zz, 2.0, y, y + WALL + 3); }
  // ── the south portal (Castilho): a deep block with two doors on a pier that carries the Navigator, over it the tier of niches and the gable
  const pz0 = z1, pz1 = z1 + 3.6, Wp = 12, ux = px - Wp / 2;
  const P = [];
  archWall(P, (u, yy, d) => [ux + u, yy, pz0 + d], { u0: 0, u1: Wp, d0: 0, d1: pz1 - pz0, y0: y - 0.5, y1: y + 14, openings: [{ uc: Wp / 2, r: 3, sill: y, spring: y + 4.6, f: 0.5 }], n: 12 });
  bag.add(CARVED, fromTriangles(P));
  addBox(bag, CARVED, px - 0.6, y, pz0, px + 0.6, y + 4.6, pz1 - 0.3);                     // the pier between the doors
  col.rect([px - 0.6, pz0, px + 0.6, pz1 - 0.3], y, y + 4.6);
  col.rect([ux, pz0, px - 3, pz1], y, y + 14); col.rect([px + 3, pz0, ux + Wp, pz1], y, y + 14);
  // the doors (shut leaves set back) and the tympanum of Saint Jerome over them with the arms of Manuel
  for (const s of [-1, 1]) addBox(bag, 'wood_dark', px + s * 1.8 - 1.1, y, pz0 + 0.2, px + s * 1.8 + 1.1, y + 3.3, pz0 + 0.4);
  addBox(bag, 'wood_dark', px - 3, y + 3.3, pz0 + 0.2, px + 3, y + 4.6, pz0 + 0.45);
  addBox(bag, CARVED, px - 2.7, y + 4.6, pz0 + 0.3, px + 2.7, y + 7.2, pz0 + 0.55);
  armillary(bag, CARVED, px - 1.2, y + 6.0, pz0 + 0.7, 0.55); orderCross(bag, 'wall_red', px + 1.2, y + 6.0, pz0 + 0.6, 0.55, 's');
  // archivolts: three rings of rope moulding round the arch; colonnettes at the jambs
  for (const [r, s] of [[3.3, 0.1], [3.8, 0.13], [4.35, 0.1]]) bag.add(CARVED, tube(Array.from({ length: 17 }, (_, k) => { const t = Math.PI - k / 16 * Math.PI; return [px + Math.cos(t) * r, y + 4.6 + Math.sin(t) * r, pz1 + 0.02, s]; }), 4, { capA: false, capB: false }));
  for (const s of [-1, 1]) for (const k of [0, 1]) ropeColumn({ bag, col: { circle() {} } }, px + s * (3.4 + k * 0.5), pz1 - 0.1 + k * 0.0, y, 4.7, 0.16, { mat: CARVED, carved: CARVED, collide: false, strands: 2, turns: 3, capital: false });
  // the Navigator on the pier: a standing figure on a bracket under a canopy
  bag.add(CARVED, lathe([[0.3, 0], [0.34, 0.3], [0.3, 1.3], [0.18, 1.55], [0.2, 1.75], [0.001, 1.8]], 8, null, px, y + 4.7, pz1 - 0.55));
  bag.add(CARVED, lathe([[0.55, 0], [0.5, 0.3], [0.001, 0.8]], 6, null, px, y + 6.6, pz1 - 0.55));
  // the upper tier: a wall of niches with saints, the great window, and the gable with pinnacles and a cross
  addBox(bag, MAT, ux, y + 14, pz0, ux + Wp, y + 27, pz1 - 1.2);
  for (let i = 0; i < 3; i++) for (const k of [0, 1]) {
    const nx = ux + 2 + i * 4, ny = y + 15 + k * 5.4;
    addBox(bag, 'opening', nx - 0.9, ny, pz1 - 1.25, nx + 0.9, ny + 3.2, pz1 - 1.1);
    bag.add(CARVED, lathe([[0.2, 0], [0.26, 0.5], [0.2, 1.4], [0.13, 1.7], [0.001, 1.8]], 8, null, nx, ny, pz1 - 1.5));
    bag.add(CARVED, lathe([[0.9, 0], [0.8, 0.3], [0.001, 1.0]], 6, null, nx, ny + 3.2, pz1 - 1.5));
  }
  bag.add(MAT, frustum2(ux - 0.5, pz0, ux + Wp + 0.5, pz1 - 1.2, y + 27, 5.5));
  for (const dx of [-5.5, 5.5, 0]) pinnacle(bag, CARVED, px + dx, y + 27, pz0 + 1.2, 0.5, dx ? 5 : 7, 8);
  orderCross(bag, 'wall_red', px, y + 29.6, pz1 - 1.15, 0.8, 's');
  for (const s of [-1, 1]) { ropeColumn({ bag, col: { circle() {} } }, px + s * 6.2, pz0 + 0.8, y, 27, 0.5, { mat: MAT, carved: CARVED, collide: false, turns: 8 }); pinnacle(bag, CARVED, px + s * 6.2, y + 27, pz0 + 0.8, 0.7, 6, 8); col.circle(px + s * 6.2, pz0 + 0.8, 0.6, y, y + 27); }
  // ── the main chapel: the altar, its retable of gilt niches, the rood arch, lamps
  const ax = xi1 - 1.0, ay = y + 1.2;
  addBox(bag, CARVED, ax - 1.2, ay, zc - 7, ax, ay + 13, zc + 7);                         // the retable
  col.rect([ax - 1.2, zc - 7, ax, zc + 7], ay, ay + 13);
  for (let i = 0; i < 5; i++) for (let k = 0; k < 3; k++) { addBox(bag, 'gilt_bronze', ax - 1.28, ay + 1.5 + k * 3.6, zc - 6.2 + i * 2.5, ax - 1.2, ay + 4.4 + k * 3.6, zc - 4.4 + i * 2.5); }
  addBox(bag, 'limestone', ax - 4.5, ay, zc - 2, ax - 2.2, ay + 1.1, zc + 2); col.rect([ax - 4.5, zc - 2, ax - 2.2, zc + 2], ay, ay + 1.1);
  addBox(bag, 'cloth_red', ax - 4.55, ay + 1.1, zc - 2.05, ax - 2.15, ay + 1.16, zc + 2.05);
  addBox(bag, 'gilt_bronze', ax - 3.5, ay + 1.16, zc - 0.1, ax - 3.2, ay + 2.0, zc + 0.1);
  // the nave: benches of the monks' choir in the western bays are not here (the choir is in the gallery); a pair of candlesticks and prayer stools
  for (const z of [zc - 7.0, zc + 9.2]) for (const xb of [bays[2] + 5, bays[3] + 5]) { addBox(bag, 'wood_dark', xb - 1.2, y, z - 0.35, xb + 1.2, y + 0.45, z + 0.35); col.rect([xb - 1.2, z - 0.35, xb + 1.2, z + 0.35], y, y + 0.45); }
  for (const [lx, lz] of [[bays[2] + 5, zc], [bays[4] - 5, zc], [chancel + 6, zc - 5], [chancel + 6, zc + 5]]) lights.push({ at: [lx, y + 4.5, lz], color: '#ffc27a', intensity: 7, distance: 16 });
  for (const [lx, lz] of [[bays[2] + 5, zc], [bays[4] - 5, zc]]) { bag.add('iron', rod([lx, y + 9, lz], [lx, y + 4.8, lz], 0.02, 4)); bag.add('gilt_bronze', lathe([[0.4, 0], [0.1, 0.25], [0.3, 0.45]], 8, null, lx, y + 4.4, lz)); }
  furnishChurch(ctx, rect, y, px);
}
function frustum2(xa, za, xb, zb, y0, rise) {
  // the portal's gable: a thin prism, its ridge along x, as a stepped ogee suggestion (a plain triangle)
  const mx = (xa + xb) / 2, zc = (za + zb) / 2, out = [];
  const A = [xa, y0, za], B = [xb, y0, za], C = [mx, y0 + rise, za], A2 = [xa, y0, zb], B2 = [xb, y0, zb], C2 = [mx, y0 + rise, zb];
  out.push(...A, ...C, ...B, ...A2, ...B2, ...C2, ...A, ...A2, ...C2, ...A, ...C2, ...C, ...B, ...C, ...C2, ...B, ...C2, ...B2, ...A, ...B, ...B2, ...A, ...B2, ...A2);
  void zc;
  return fromTriangles(orientOutward(out));
}

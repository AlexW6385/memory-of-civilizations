// The family compounds (docs/settlements/dogon.md §4.2, §5): a ginna with its niched facade on the south side of the pad, the courtyard
// beside it walled in mud with its granaries, a round kitchen, a mortar for the millet, stacks of stalks, firewood; and the one opened
// to walk into (the landmark compound), whose ginna has its entrance hall, central room, storeroom and the kitchen with its ladder.

import { box, lathe, rod, place } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { frontDress, weatherFront, wallDress, roofRack, innerNiches, hangings } from './dress.js';
import { rng, wallRun, WALL, PLASTER, SMOOTH, MUD, STONE, STONE2, DARK, LOG, HOLE, STALK, THATCH, RED, granary, kitchen, nicheFacade, carvedDoor, roofTop, mortar, milletStack, firewood, jar, basket, notchedLadder } from './props.js';

const POOL = 'pottery_dark';

/** The courtyard's walls and furniture inside rect [x0, z0, x1, z1] at y (the ginna occupies the rest). `gate` the side of the lane-wall with a gap. */
function courtyard(bag, col, r, y, rand, o) {
  const [x0, z0, x1, z1] = r, h = 1.5 + rand() * 0.4, t = 0.38;
  const W = (a, b, ops = []) => { wallRun(bag, col, WALL, a, b, t, y - 0.4, y + h, ops); wallRun(bag, { segment() {} }, MUD, [a[0], a[1]], [b[0], b[1]], t + 0.06, y + h, y + h + 0.1, [], { noCol: true }); };
  const gateAt = (len) => (o.gate ? [{ at: len * (0.3 + rand() * 0.4), w: 1.2, h: 1.9 }] : []);
  W([x0, z0], [x1, z0]);                                                   // north: against the next row's cut
  if (o.side === 'w') { W([x1, z0], [x1, z1]); W([x0, z0], [x0, z1 - 4.2]); }
  else { W([x0, z0], [x0, z1]); W([x1, z0], [x1, z1 - 4.2]); }
  W([x0, z1], [x1, z1], o.south ? gateAt(x1 - x0) : []);                    // the south wall (with the gate)
  wallDress(bag, [x0, z1], [x1, z1], y + h + 0.1, rand, [0, 1], t);
  wallDress(bag, o.side === 'w' ? [x0, z0] : [x1, z0], o.side === 'w' ? [x0, z1 - 4.2] : [x1, z1 - 4.2], y + h + 0.1, rand, [o.side === 'w' ? -1 : 1, 0], t);
}

/** Granaries, kitchen and props placed inside the courtyard rect, clear of one another. */
function furnish(bag, col, r, y, rand, o) {
  const [x0, z0, x1, z1] = r, placed = [];
  const free = (x, z, rr) => placed.every(([px, pz, pr]) => Math.hypot(px - x, pz - z) > rr + pr + 0.5);
  const spot = (rr, tries = 40) => {
    for (let k = 0; k < tries; k++) {
      const x = x0 + 0.9 + rr + rand() * (x1 - x0 - 1.8 - 2 * rr), z = z0 + 0.9 + rr + rand() * (z1 - z0 - 1.8 - 2 * rr);
      if (x1 - x0 - 1.8 - 2 * rr > 0 && z1 - z0 - 1.8 - 2 * rr > 0 && free(x, z, rr) && !(o.keep ?? []).some((q) => Math.hypot(x - q[0], z - q[1]) < q[2] + rr)) return [x, z];
    }
    return null;
  };
  const kr = 1.25, ks = spot(kr + 0.2);
  if (ks) { kitchen(bag, col, ks[0], y, ks[1], kr, 2.2, Math.atan2(0, 1) + (rand() < 0.5 ? 0 : Math.PI / 2), rand); placed.push([ks[0], ks[1], kr + 0.2]); }
  const n = 2 + Math.floor(rand() * 3);
  for (let i = 0; i < n; i++) {
    const rr = 0.72 + rand() * 0.3, s = spot(rr + 0.3);
    if (!s) continue;
    const kind = i === 0 ? 'male' : rand() < 0.5 ? 'female' : rand() < 0.3 ? 'low' : 'male';
    granary(bag, col, s[0], y, s[1], rr, 1.7 + rand() * 0.7, { rand, yaw: Math.PI * (0.35 + rand() * 0.3), kind });
    placed.push([s[0], s[1], rr + 0.3]);
  }
  const m = spot(0.45); if (m) { mortar(bag, col, m[0], y, m[1], rand); placed.push([m[0], m[1], 0.5]); }
  for (let i = 0; i < 2; i++) { const s = spot(0.6); if (s) { milletStack(bag, col, s[0], y, s[1], 1.5 + rand() * 0.9, 0.5, Math.floor(rand() * 999)); placed.push([s[0], s[1], 0.6]); } }
  const f = spot(1.0); if (f) { firewood(bag, col, f[0], y, f[1], rand() * 3, 1.6, 3, rand); placed.push([f[0], f[1], 1.0]); }
  for (let i = 0; i < 3; i++) { const s = spot(0.3); if (s) { if (rand() < 0.5) jar(bag, s[0], y, s[1], 1.0 + rand() * 0.4, rand() < 0.5 ? 'terracotta' : POOL); else basket(bag, s[0], y, s[1], 0.25, rand() < 0.5 ? 'cloth_ochre' : null); placed.push([s[0], s[1], 0.35]); } }
}

/** compound: { rect (the pad), y, seed, ginna: 'niche' | 'plain' }: a ginna on the pad's south side, the courtyard beside it. */
export function compound(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 5), [x0, z0, x1, z1] = el.rect, y = el.y, wid = x1 - x0;
  const gw = Math.min(7.6, wid * 0.58) + (rand() - 0.5) * 0.4, dep = 4.2 + rand() * 0.4, west = rand() < 0.5;
  const gx0 = west ? x0 + 0.4 : x1 - 0.4 - gw, gx1 = gx0 + gw, gz1 = z1 - 0.2, gz0 = gz1 - dep;
  const H = 3.0 + rand() * 0.5;
  // the ginna: a solid mass with the niched facade on its south face, a roof with its parapet
  bag.add(WALL, box(gx0, y - 0.5, gz0, gx1, y + H, gz1));
  col.rect([gx0, gz0, gx1, gz1], y - 0.5, y + H + 0.3);
  roofTop(bag, col, [gx0, gz0, gx1, gz1], y + H, rand, { stalks: 1 + Math.floor(rand() * 2), pots: Math.floor(rand() * 3) });
  const doors = [gx0 + gw * 0.3, gx0 + gw * 0.7];
  nicheFacade(bag, gx0 + 0.3, gx1 - 0.3, gz1, y, H, rand, { plain: el.ginna === 'plain', doors });
  for (const u of doors) carvedDoor(bag, u, y, gz1, 0.9, 1.45, rand);
  weatherFront(bag, gx0 + 0.3, gx1 - 0.3, gz1, y, H, rand, doors);
  frontDress(bag, col, { x0: gx0, x1: gx1, zf: gz1, y, doors, seed: el.seed });
  // the other three faces: a band of the smooth plaster at the cornice, the beam-ends of the roof
  for (let i = 0; i < 6; i++) bag.add(LOG, rod([gx0 - 0.15, y + H - 0.12, gz0 + 0.5 + i * dep / 6.5], [gx0, y + H - 0.12, gz0 + 0.5 + i * dep / 6.5], 0.05, 5));
  // the courtyard
  const cr = west ? [gx1 + 0.2, z0, x1, z1] : [x0, z0, gx0 - 0.2, z1];
  courtyard(bag, col, cr, y, rand, { side: west ? 'e' : 'w', gate: true, south: true });
  furnish(bag, col, [cr[0] + 0.4, cr[1] + 0.4, cr[2] - 0.4, cr[3] - 0.4], y, rand, {});
  // the ginna's own end walls' lane side: a granary or two beside it, if the pad has room
}

// ── the landmark compound's ginna, opened ───────────────────────────────────────
/**
 * dogon_house: { rect [x0, z0, x1, z1] (7.4 × 5.4 m), y, seed }. Walls 0.45 m, the interior 6.5 × 4.5 m, 2.1 m under the beams.
 * The facade on the south with two doors: the west leads to the entrance hall, the east to the storeroom; from both a doorway into
 * the central room (hearth, forked post, mats, jars, a small shrine); in its north wall a doorway to the round kitchen, whose ladder
 * (a notched log) climbs through the hatch to the kitchen roof, from which a step leads to the ginna's roof terrace.
 */
export function house(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed || 9), T = 0.45, F = y + 0.05, CH = y + 2.1, ST = y + 2.6, FH = 3.5;
  const ix0 = x0 + T, iz0 = z0 + T, ix1 = x1 - T, iz1 = z1 - T;
  const lx = (u) => ix0 + u, lz = (v) => iz0 + v;
  const DOORW = 1.0, DOORH = 1.95;
  // floor of beaten, smoothed mud
  bag.add(SMOOTH, box(ix0, y - 0.3, iz0, ix1, F, iz1)); col.floor([ix0, iz0, ix1, iz1], F);
  // outer walls: the south with its two door openings, the others plain; north with the kitchen's doorway
  const doorU = [1.5, 4.9];
  wallRun(bag, col, WALL, [x0, z1 - T / 2], [x1, z1 - T / 2], T, y - 0.5, y + FH, doorU.map((u) => ({ at: T + u, w: DOORW, h: DOORH + 0.5 })));
  wallRun(bag, col, WALL, [x0, z0 + T / 2], [x1, z0 + T / 2], T, y - 0.5, y + 2.9, [{ at: T + 5.45, w: 0.95, h: DOORH + 0.5 }]);
  wallRun(bag, col, WALL, [x0 + T / 2, z0], [x0 + T / 2, z1], T, y - 0.5, y + 2.9);
  wallRun(bag, col, WALL, [x1 - T / 2, z0], [x1 - T / 2, z1], T, y - 0.5, y + 2.9);
  // the interior partitions (plastered smooth): the north wall of the hall and store with doorways, the wall between them
  const PT = 0.3;
  wallRun(bag, col, SMOOTH, [ix0, lz(2.6)], [ix1, lz(2.6)], PT, F, CH, [{ at: 1.5, w: DOORW, h: DOORH }, { at: 4.9, w: DOORW, h: DOORH }], { ext: 0 });
  wallRun(bag, col, SMOOTH, [lx(3.1), lz(2.6)], [lx(3.1), iz1], PT, F, CH);
  // the lintels over the doorways: a beam
  for (const u of [1.5, 4.9]) { bag.add(DARK, box(lx(u) - 0.65, F + DOORH, lz(2.6) - 0.2, lx(u) + 0.65, F + DOORH + 0.12, lz(2.6) + 0.2)); }
  // the facade
  nicheFacade(bag, x0 + 0.3, x1 - 0.3, z1, y, FH, rand, { plain: el.plain, doors: doorU.map((u) => x0 + T + u) });
  for (const u of doorU) carvedDoor(bag, x0 + T + u, y, z1, DOORW, DOORH, rand, true);
  weatherFront(bag, x0 + 0.3, x1 - 0.3, z1, y, FH, rand, doorU.map((u) => x0 + T + u));
  // the roof: beams under (logs across, from the south to the north wall), a mat of reeds, the mud over; a parapet; the facade above it
  for (let u = 0.25; u < 6.5; u += 0.5) bag.add(LOG, rod([lx(u), CH - 0.08, iz0 - 0.1], [lx(u) + (rand() - 0.5) * 0.03, CH - 0.08, iz1 + 0.1], 0.08 + rand() * 0.02, 7));
  bag.add(STALK, box(x0, CH, z0, x1, CH + 0.06, z1));
  bag.add(MUD, box(x0, CH + 0.06, z0, x1, ST, z1)); col.floor([x0, z0, x1, z1], ST);
  roofTop(bag, col, [x0, z0, x1, z1], ST - 0.1, rand, { stalks: 2, pots: 2 });
  for (let i = 0; i < 6; i++) bag.add(LOG, rod([x0 - 0.15, ST - 0.18, z0 + 0.5 + i * 0.85], [x0, ST - 0.18, z0 + 0.5 + i * 0.85], 0.05, 5));
  // the forked post in the central room (it holds the main beam): trunk with its fork
  const px = lx(3.25), pz = lz(1.2);
  bag.add(DARK, lathe([[0.17, 0], [0.14, 0.4], [0.13, 1.6], [0.15, 2.0]], 8, null, px, F, pz));
  for (const s of [-1, 1]) bag.add(DARK, rod([px, F + 1.95, pz], [px + s * 0.2, CH - 0.02, pz], 0.06, 6));
  bag.add(DARK, rod([lx(0.1), CH - 0.2, pz], [lx(6.4), CH - 0.2, pz], 0.1, 7));
  col.circle(px, pz, 0.2, F, CH);
  // ---- the central room (v 0…2.45) ----
  const hx = lx(1.9), hz = lz(1.15);
  for (let k = 0; k < 3; k++) { const a = k * 2.09 + 0.5; bag.add(STONE2, lathe([[0.1, 0], [0.09, 0.14], [0.001, 0.2]], 6, null, hx + Math.cos(a) * 0.2, F, hz + Math.sin(a) * 0.2)); }
  bag.add(POOL, lathe([[0.001, 0.2], [0.17, 0.22], [0.25, 0.34], [0.26, 0.5], [0.2, 0.62], [0.21, 0.66], [0.17, 0.66], [0.001, 0.6]], 10, null, hx, F, hz));
  for (let k = 0; k < 4; k++) { const a = k * 1.6; bag.add('bark_dark', rod([hx + Math.cos(a) * 0.22, F + 0.03, hz + Math.sin(a) * 0.22], [hx + Math.cos(a) * 0.04, F + 0.1, hz + Math.sin(a) * 0.04], 0.025, 5)); }
  bag.add('flame', lathe([[0.1, 0], [0.07, 0.07], [0.03, 0.18], [0.001, 0.26]], 8, null, hx, F + 0.04, hz));
  bag.add(POOL, box(hx - 0.5, F, hz - 0.5, hx + 0.5, F + 0.008, hz + 0.5));
  col.circle(hx, hz, 0.4, F, F + 0.7);
  // sleeping mats and blankets in the west and the north-west
  bag.add(STALK, box(lx(0.3), F, lz(0.3), lx(1.1), F + 0.02, lz(2.0)));
  bag.add('cloth_indigo', box(lx(0.35), F + 0.02, lz(0.35), lx(1.05), F + 0.06, lz(0.9)));
  bag.add(STALK, box(lx(4.2), F, lz(0.3), lx(5.0), F + 0.02, lz(2.0)));
  bag.add('cloth_white', box(lx(4.25), F + 0.02, lz(1.2), lx(4.95), F + 0.05, lz(1.9)));
  // the small shrine in the north wall: a niche with a carved figure and the offering bowl
  bag.add(HOLE, box(lx(3.6), F + 0.9, iz0, lx(4.1), F + 1.3, iz0 + 0.012));
  bag.add(DARK, lathe([[0.001, 0], [0.04, 0.02], [0.03, 0.2], [0.06, 0.3], [0.001, 0.34]], 6, null, lx(3.85), F + 0.9, iz0 + 0.1));
  bag.add(POOL, lathe([[0.001, 0], [0.09, 0.0], [0.1, 0.07], [0.001, 0.07]], 8, null, lx(3.85), F + 0.88, iz0 + 0.25));
  // a low mud bench and jars along the north wall's west; the mortar
  bag.add(WALL, box(lx(0.1), F, iz0, lx(0.1) + 0.0, F, iz0));
  jar(bag, lx(2.7), F, lz(0.35), 1.2); jar(bag, lx(2.7), F, lz(0.85), 0.9, POOL); basket(bag, lx(0.5), F, lz(2.25), 0.27, 'cloth_ochre');
  col.circle(lx(2.7), lz(0.35), 0.28, F, F + 0.6); col.circle(lx(2.7), lz(0.85), 0.22, F, F + 0.45);
  mortar(bag, col, lx(6.15), F, lz(1.9), rand);
  for (let k = 0; k < 5; k++) bag.add(THATCH, rod([lx(0.6 + k * 1.1), CH - 0.1, lz(2.2)], [lx(0.62 + k * 1.1), CH - 0.65, lz(2.2)], 0.03, 4));   // bundles of heads hung to dry
  // ---- the entrance hall (west): a bench, jars of water, hanging gourds ----
  bag.add(WALL, box(ix0, F, lz(3.1), ix0 + 0.5, F + 0.42, lz(4.0))); col.rect([ix0, lz(3.1), ix0 + 0.5, lz(4.0)], F, F + 0.42);
  bag.add(SMOOTH, box(ix0, F + 0.42, lz(3.1), ix0 + 0.52, F + 0.46, lz(4.0)));
  jar(bag, lx(0.3), F + 0.46, lz(3.4), 0.8, 'terracotta'); jar(bag, lx(2.6), F, lz(3.0), 1.5); col.circle(lx(2.6), lz(3.0), 0.34, F, F + 0.8);
  bag.add(DARK, lathe([[0.001, 0], [0.12, 0.05], [0.14, 0.18], [0.001, 0.3]], 8, null, lx(2.1), CH - 0.6, lz(3.15)));    // a hanging calabash
  // ---- the storeroom (east): the big grain jars, bins of mud, baskets ----
  for (const [u, v, k] of [[3.8, 3.2, 1.6], [3.8, 4.0, 1.4], [6.0, 3.3, 1.7]]) { jar(bag, lx(u), F, lz(v), k, 'terracotta'); col.circle(lx(u), lz(v), 0.25 * k, F, F + 0.8 * k); }
  bag.add(WALL, box(lx(5.9), F, lz(3.7), ix1, F + 0.8, iz1)); col.rect([lx(5.9), lz(3.7), ix1, iz1], F, F + 0.8);
  bag.add(MUD, lathe([[0.001, 0.8], [0.4, 0.8], [0.28, 0.95], [0.001, 1.05]], 8, null, lx(6.2), F, lz(4.1)));
  basket(bag, lx(4.5), F, lz(3.9), 0.3, 'cloth_ochre'); basket(bag, lx(5.2), F, lz(4.1), 0.24); col.circle(lx(4.5), lz(3.9), 0.3, F, F + 0.4);
  for (let k = 0; k < 6; k++) bag.add(THATCH, rod([lx(3.5 + k * 0.5), CH - 0.1, lz(3.1)], [lx(3.52 + k * 0.5), CH - 0.7, lz(3.1)], 0.03, 4));
  // ---- the kitchen: round, north of the central room, doorway at u 5.45 ----
  const ri = 1.35, rc = ri + 0.2, kx = lx(5.45), kz = z0 - ri - 0.2 + 0.0, KH = y + 2.25;
  const N = 20, skip = Math.PI / 5.5;
  for (let i = 0; i < N; i++) {
    const a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2, am = (a0 + a1) / 2;
    if (Math.abs(Math.atan2(Math.sin(am - Math.PI / 2), Math.cos(am - Math.PI / 2))) < skip) continue;      // the doorway toward +z (south): angle π/2
    const p = [kx + Math.cos(a0) * rc, kz + Math.sin(a0) * rc], q = [kx + Math.cos(a1) * rc, kz + Math.sin(a1) * rc];
    bag.add(WALL, orientedBox(p, q, 0.42, y - 0.5, KH - 0.3, 0.05)); col.segment(p, q, 0.42, y - 0.5, KH - 0.3);
    bag.add(WALL, orientedBox(p, q, 0.42, KH - 0.3, KH + 0.3, 0.05)); col.segment(p, q, 0.42, KH, KH + 0.3);
  }
  // the lintel closing the gap over the doorway
  bag.add(WALL, box(kx - 0.9, y + DOORH + 0.1, kz + rc - 0.3, kx + 0.9, KH - 0.3, kz + rc + 0.2));
  bag.add(SMOOTH, box(kx - ri, y - 0.3, kz - ri, kx + ri, F, kz + ri)); col.floor([kx - ri, kz - ri, kx + ri, kz + ri], F);
  bag.add(MUD, lathe([[rc + 0.2, KH - 0.3], [0.62, KH - 0.3]], 14, null, kx, 0, kz).translate(0, 0, 0));
  bag.add(MUD, lathe([[rc + 0.2, KH], [0.62, KH]], 14, null, kx, 0, kz));
  bag.add(MUD, lathe([[rc + 0.2, KH - 0.3], [rc + 0.2, KH]], 14, null, kx, 0, kz));
  bag.add(MUD, lathe([[0.62, KH], [0.62, KH - 0.3]], 14, null, kx, 0, kz));
  for (const s of [-1, 1]) bag.add(LOG, rod([kx - 1.5, KH - 0.35, kz + s * 0.5], [kx + 1.5, KH - 0.35, kz + s * 0.5], 0.07, 6));
  // the roof's floor: four strips round the hatch, the ramp of the ladder
  for (const r of [[kx - 1.2, kz - 1.2, kx + 1.2, kz - 0.55], [kx - 1.2, kz + 0.55, kx + 1.2, kz + 1.2], [kx - 1.2, kz - 0.55, kx - 0.55, kz + 0.55], [kx + 0.55, kz - 0.55, kx + 1.2, kz + 0.55]]) col.floor(r, KH);
  col.ramp([kx - 0.4, kz - 0.55, kx + 0.4, kz + 1.0], F, KH, 'n');
  notchedLadder(bag, kx, F, kz + 1.0, KH - F - 0.1, 0, -1, 1.0);
  // the hearth: three stones and the pot; the kitchen's smoke blackens the ceiling
  for (let k = 0; k < 3; k++) { const a = k * 2.09 + 1.0; bag.add(STONE2, lathe([[0.11, 0], [0.1, 0.16], [0.001, 0.22]], 6, null, kx - 0.7 + Math.cos(a) * 0.22, F, kz - 0.3 + Math.sin(a) * 0.22)); }
  bag.add(POOL, lathe([[0.001, 0.22], [0.2, 0.26], [0.3, 0.4], [0.3, 0.55], [0.22, 0.66], [0.24, 0.7], [0.19, 0.7], [0.001, 0.64]], 10, null, kx - 0.7, F, kz - 0.3));
  col.circle(kx - 0.7, kz - 0.3, 0.45, F, F + 0.7);
  jar(bag, kx + 0.8, F, kz - 0.7, 1.3); col.circle(kx + 0.8, kz - 0.7, 0.3, F, F + 0.7);
  basket(bag, kx + 0.2, F, kz - 1.05, 0.22);
  bag.add('wicker', box(kx + 0.1, F, kz - 1.0, kx + 1.1, F + 0.01, kz - 0.4));
  // ---- what the house has of its own (by its seed): niches with small pots, pegs with gourds and bundles, the ancestors' shelf, a hung cloth, grain sacks, firewood by the kitchen hearth, a rack on the roof
  const rr = rng((el.seed || 9) * 7 + 3);
  innerNiches(bag, [[lx(0.45), iz0], [lx(1.25), iz0], [lx(2.05), iz0], [lx(3.0), iz0], [lx(4.35), iz0]], 'n', F, rr);
  innerNiches(bag, [[ix1, lz(0.7)], [ix1, lz(1.6)], [ix1, lz(3.1)]], 'e', F, rr);
  innerNiches(bag, [[ix0, lz(3.4)], [ix0, lz(1.2)]], 'w', F, rr);
  hangings(bag, [lx(0.25), lx(2.8), lx(6.25)], iz0, F, rr);
  // the ancestors' shelf: a mud ledge along the north wall of the central room's west with the small vessels of the offerings
  bag.add(WALL, box(lx(0.15), F + 0.55, iz0, lx(2.3), F + 0.66, iz0 + 0.22));
  for (let k = 0; k < 5; k++) { const px2 = lx(0.35 + k * 0.4 + rr() * 0.08); bag.add(k % 2 ? POOL : MUD, lathe([[0.001, 0], [0.05, 0.01], [0.075, 0.07], [0.05, 0.12], [0.001, 0.125]], 8, null, px2, F + 0.66, iz0 + 0.12)); }
  // a cloth hung to dry on a cord under the beams of the central room, grain sacks in its north-east corner
  bag.add(LOG, rod([lx(4.1), CH - 0.3, lz(1.9)], [lx(6.3), CH - 0.3, lz(1.9)], 0.012, 4));
  bag.add(rr() < 0.5 ? 'cloth_indigo' : 'cloth_white', box(lx(4.4), CH - 1.05, lz(1.9) - 0.01, lx(5.3), CH - 0.3, lz(1.9) + 0.01));
  for (const v of [0.4, 1.0]) { bag.add('sacking', lathe([[0.001, 0], [0.22, 0.04], [0.26, 0.28], [0.17, 0.52], [0.09, 0.58], [0.001, 0.56]], 9, (t, i) => 1 + 0.05 * Math.sin(t * 4 + i + v * 3), lx(6.2), F, lz(v))); col.circle(lx(6.2), lz(v), 0.27, F, F + 0.58); }
  // firewood stacked against the kitchen's wall and the day's pounded millet
  for (let k = 0; k < 4; k++) bag.add('bark_dark', rod([kx + 0.55, F + 0.04 + (k >> 1) * 0.08, kz + 0.2 + k * 0.1], [kx + 1.0, F + 0.05 + (k >> 1) * 0.08, kz + 0.2 + k * 0.1], 0.04, 5));
  roofRack(bag, col, [x0 + 0.9, z1 - 1.9, x0 + 3.5, z1 - 0.5], ST + 0.02, rr);
  // light: the fire, the day through the doors, the kitchen
  if (lights && el.lite) {
    lights.push({ at: [hx, F + 0.6, hz], color: '#ff9a4a', intensity: 2.2, distance: 5 });
    lights.push({ at: [lx(3.2), F + 1.8, lz(2.2)], color: '#fff1d6', intensity: 1.5, distance: 6 });
    lights.push({ at: [kx - 0.7, F + 0.7, kz - 0.3], color: '#ff9a4a', intensity: 1.8, distance: 4 });
  } else if (lights) {
    lights.push({ at: [hx, F + 0.6, hz], color: '#ff9a4a', intensity: 2.6, distance: 6 });
    lights.push({ at: [lx(1.5), F + 1.7, lz(3.6)], color: '#fff1d6', intensity: 1.6, distance: 5 });
    lights.push({ at: [lx(4.9), F + 1.7, lz(3.6)], color: '#fff1d6', intensity: 1.4, distance: 5 });
    lights.push({ at: [lx(3.2), F + 1.8, lz(1.4)], color: '#ffe0b0', intensity: 1.1, distance: 5 });
    lights.push({ at: [kx - 0.7, F + 0.7, kz - 0.3], color: '#ff9a4a', intensity: 2.2, distance: 5 });
    lights.push({ at: [kx, KH - 0.6, kz], color: '#fff1d6', intensity: 1.2, distance: 4 });
  }
}

/** The house of an opened compound (c: { rect, y, hw }): its 7.4 × 5.4 m rect, on the pad's west part (hw) or east part, and the courtyard beside it. */
export function houseOf(c) {
  const [x0, z0, x1, z1] = c.rect, hx0 = c.hw ? x0 + 0.5 : x1 - 0.5 - 7.4, hz1 = z1 - 0.2;
  return { rect: [hx0, hz1 - 5.4, hx0 + 7.4, hz1], court: c.hw ? [hx0 + 7.6, z0, x1, z1] : [x0, z0, hx0 - 0.2, z1], side: c.hw ? 'e' : 'w' };
}

/** dogon_landmark / dogon_open: a pad with its ginna opened (the house, its rooms and the round kitchen) and the courtyard beside it, furnished. */
export function landmarkCompound(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 5), y = el.y;
  const h = houseOf({ rect: el.rect, hw: el.hw ?? true });
  house({ rect: h.rect, y, seed: el.seed, plain: el.plain, lite: el.lite }, ctx);
  courtyard(bag, col, h.court, y, rand, { side: h.side, gate: true, south: true });
  furnish(bag, col, [h.court[0] + 0.4, h.court[1] + 0.4, h.court[2] - 0.4, h.court[3] - 0.4], y, rand, {});
  frontDress(bag, col, { x0: h.rect[0], x1: h.rect[2], zf: h.rect[3], y, doors: [h.rect[0] + 0.45 + 1.5, h.rect[0] + 0.45 + 4.9], seed: el.seed });
  return h.rect;
}
export const HOUSE_RECT = (r) => [r[0] + 0.5, r[3] - 0.2 - 5.4, r[0] + 0.5 + 7.4, r[3] - 0.2];

/** The ginna of a plain compound as compound() places it: { rect, H } (the same random sequence). */
export function ginnaOf(el) {
  const rand = rng(el.seed || 5), [x0, , x1, z1] = el.rect, wid = x1 - x0;
  const gw = Math.min(7.6, wid * 0.58) + (rand() - 0.5) * 0.4, dep = 4.2 + rand() * 0.4, west = rand() < 0.5, H = 3.0 + rand() * 0.5;
  const gx0 = west ? x0 + 0.4 : x1 - 0.4 - gw, gz1 = z1 - 0.2;
  return { rect: [gx0, gz1 - dep, gx0 + gw, gz1], H, west };
}

// The fronts of Cahokia's houses (docs/settlements/cahokia.md §5.14): how a house's walls are finished and
// its door is hung, chosen by rule from the house's seed, so that neighbours differ without add-ons.
// Three finishes: the clay-faced wall (the older drawing), the woven-mat wall with its frame of poles
// and lashed rails showing, and the wall banked with earth to the height of a man's hip with the mats
// above [stated: "dirt banked along woven mat walls" — Illinois State Museum, RiverWeb, "Residence";
// mud impressions on the mats show repair]. Doorways "were simple and covered with mats or hides"
// [stated: RiverWeb, "Residence" (res-3)]; a door's hide rolled up above it, let down half way, or a
// mat slid across it are our three readings of that [inferred].
import { box, frustum, rod } from '../../core/geom.js';
import { rng } from './kit.js';

/** The rule: from the seed alone. fin 'plaster' | 'mats' | 'banked'; hw half the doorway; off the door's shift along its wall; curtain 'none' | 'roll' | 'half' | 'mat'. */
export function frontRule(seed, lod = 0, wallLen = 5) {
  const r = rng((seed | 0) + 313), u = r();
  const fin = lod >= 2 ? (u < 0.55 ? 'plaster' : 'mats') : u < 0.34 ? 'plaster' : u < 0.68 ? 'mats' : 'banked';
  const hw = 0.36 + r() * 0.12, off = (r() - 0.5) * 2 * Math.max(0, (wallLen - 2.2) / 2 * 0.75), c = r();
  return { fin, hw, off, curtain: lod >= 2 ? 'none' : c < 0.3 ? 'roll' : c < 0.55 ? 'half' : c < 0.7 ? 'mat' : 'none', tan: r() < 0.5 };
}

/**
 * The earth banked against the foot of the walls, broken at the door. rect the walls, foot the
 * ground below, top the bank's height above y, e how far it spreads, door 'n'|'s', dx the door's x,
 * hw its half width.
 */
export function bankRing(bag, [x0, z0, x1, z1], foot, top, e, door, dx, hw) {
  const g = hw + 0.3, S = 'silt', add = (r, ins) => bag.add(S, frustum(r, foot, top, ...ins));
  add([x0 - e, z0, x0, z1], [e, 0, 0, 0]); add([x1, z0, x1 + e, z1], [0, e, 0, 0]);
  if (door === 's') {
    add([x0 - e, z0 - e, x1 + e, z0], [e, e, e, 0]);
    add([x0 - e, z1, dx - g, z1 + e], [e, 0.3, 0, e]); add([dx + g, z1, x1 + e, z1 + e], [0.3, e, 0, e]);
  } else {
    add([x0 - e, z1, x1 + e, z1 + e], [e, e, 0, e]);
    add([x0 - e, z0 - e, dx - g, z0], [e, 0.3, e, 0]); add([dx + g, z0 - e, x1 + e, z0], [0.3, e, e, 0]);
  }
}

/**
 * The outer skin of mats and the frame of poles over a house's walls. rect the walls, y the floor,
 * y0 the skin's foot above y, wh the wall height, door { wall: 'n'|'s', x, hw, top } (the doorway left
 * clear up to top above y), lod 0 near … 2 far.
 */
export function matWalls(bag, [x0, z0, x1, z1], y, y0, wh, door, lod = 0) {
  const T = 0.025, ya = y + y0, yb = y + wh, dxa = door.x - door.hw, dxb = door.x + door.hw, dt = y + door.top;
  const M = (a, b, c, d, e, f) => { if (d > a + 0.01 && f > c + 0.01 && e > b + 0.01) bag.add('reed_mat', box(a, b, c, d, e, f)); };
  M(x0 - T, ya, z0 - T, x0, yb, z1 + T); M(x1, ya, z0 - T, x1 + T, yb, z1 + T);                  // the end walls, whole
  for (const [wall, za, zb] of [['n', z0 - T, z0], ['s', z1, z1 + T]]) {
    if (door.wall !== wall) { M(x0 - T, ya, za, x1 + T, yb, zb); continue; }
    M(x0 - T, ya, za, dxa, yb, zb); M(dxb, ya, za, x1 + T, yb, zb); M(dxa, dt, za, dxb, yb, zb);   // the door wall, the doorway left clear
  }
  if (lod >= 2) return;
  // the frame: a pole every metre standing proud of the mats, heavier at the corners, two lashed rails along each wall
  const post = (x, z, r, a, b) => bag.add('timber', rod([x, a, z], [x, b, z], r, 5)), side = 0.03;
  const run = (a, b, fixed, alongX, wall) => {
    const L = b - a, n = Math.max(2, Math.round(L / 1.0));
    for (let k = 0; k <= n; k++) {
      const s = a + L * k / n;
      if (k === 0 || k === n) continue;                                                      // the corners are drawn below
      if (wall === door.wall && alongX && Math.abs(s - door.x) < door.hw + 0.2) continue;
      if (alongX) post(s, fixed, 0.04, ya - 0.02, yb - 0.08); else bag.add('timber', rod([fixed, ya - 0.02, s], [fixed, yb - 0.08, s], 0.04, 5));
    }
    for (const ry of [ya + 0.5 + (yb - ya) * 0.12, yb - 0.5]) {
      const seg = (p, q) => { if (q - p > 0.2) bag.add('timber', alongX ? rod([p, ry, fixed], [q, ry, fixed], 0.022, 4) : rod([fixed, ry, p], [fixed, ry, q], 0.022, 4)); };
      if (wall === door.wall && alongX) { seg(a, door.x - door.hw - 0.25); seg(door.x + door.hw + 0.25, b); } else seg(a, b);
    }
  };
  run(x0, x1, z0 - T - side, true, 'n'); run(x0, x1, z1 + T + side, true, 's');
  run(z0, z1, x0 - T - side, false, 'w'); run(z0, z1, x1 + T + side, false, 'e');
  for (const [cx, cz] of [[x0 - T, z0 - T], [x1 + T, z0 - T], [x0 - T, z1 + T], [x1 + T, z1 + T]]) post(cx, cz, 0.065, y - 0.2, yb + 0.05);
}

/** The door's covering of a closed house: a hide rolled up above the opening, let down half way, or a mat slid across it. door { x, hw, f (the wall's z), sg (+1 south) }. */
export function doorCovering(bag, kind, tan, y, { x, hw, f, sg }) {
  const lo = (a, b) => [Math.min(a, b), Math.max(a, b)], hide = tan ? 'hide_tan' : 'hide_brown';
  if (kind === 'roll') {
    const zc = f + sg * 0.23;
    bag.add(hide, rod([x - hw - 0.06, y + 1.4, zc], [x + hw + 0.06, y + 1.4, zc], 0.07, 7));
    for (const s of [-0.6, 0.6]) bag.add('linen', rod([x + s * hw, y + 1.4, zc], [x + s * hw, y + 1.58, zc - sg * 0.03], 0.008, 4));
  } else if (kind === 'half') {
    const [za, zb] = lo(f + sg * 0.055, f + sg * 0.085);
    bag.add(hide, box(x - hw - 0.03, y + 0.75, za, x + hw + 0.03, y + 1.52, zb));
    bag.add('timber', rod([x - hw - 0.05, y + 0.75, f + sg * 0.1], [x + hw + 0.05, y + 0.75, f + sg * 0.1], 0.02, 5));
  } else if (kind === 'mat') {
    const [za, zb] = lo(f + sg * 0.055, f + sg * 0.08);
    bag.add('reed_mat', box(x - hw - 0.02, y + 0.02, za, x + hw * 0.15, y + 1.5, zb));
    bag.add('timber', rod([x + hw * 0.15, y + 0.05, f + sg * 0.095], [x + hw * 0.15, y + 1.45, f + sg * 0.095], 0.022, 5));
  }
}

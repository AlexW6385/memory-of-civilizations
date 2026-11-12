// The courtyard house of Abbasid Baghdad (docs/settlements/abbasid-baghdad.md §3): built to the lot, blind to the street but for a
// bent doorway and small high windows; ranges of rooms on all four sides of a court, the principal range (north, out of the sun) with
// its iwan, usually two storeys with a flat terraced roof and a parapet; a few rich houses carry a wind tower (badhanj) on the roof
// (the archaeology of Samarra shows none: a minority, noted in the dossier). Built to the lot in a local frame, the street to +z.

import { box, fromTriangles, lathe } from '../../core/geom.js';
import { local, wallRun, barrel, archBand, spandrel, polyGeo, rng, archCurve, merlons, stuccoPanel, orientedBox } from './kit.js';
import { archway } from './palace.js';
import { dressFront, furnish, zir, pithos } from './dress.js';

const YAW = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
const WALLS = [['brick_baked', 'plaster_white'], ['brick_buff', 'brick_buff'], ['mudbrick', 'mud_plaster'], ['plaster_white', 'plaster_white'], ['brick_baked', 'brick_baked'], ['mud_plaster', 'mud_plaster']];

/** A badhanj (wind tower): a brick shaft rising over the roof with a tall open face to the windward (north), louvres, a cross-wall inside, a flat cap. At (x, z) on the roof y. */
function windTower(bag, col, x, z, y, mat, h = 4.2, s = 1.5) {
  const t = 0.22, x0 = x - s / 2, x1 = x + s / 2, z0 = z - s / 2, z1 = z + s / 2;
  bag.add(mat, box(x0, y, z0, x0 + t, y + h, z1)); bag.add(mat, box(x1 - t, y, z0, x1, y + h, z1)); bag.add(mat, box(x0 + t, y, z1 - t, x1 - t, y + h, z1));
  bag.add(mat, box(x0 + t, y, z0, x1 - t, y + h * 0.4, z0 + t));                                   // the north face: closed to 40%, open above (to 0.8h), the lintel
  bag.add(mat, box(x0 + t, y + h * 0.86, z0, x1 - t, y + h, z0 + t));
  bag.add('opening', box(x0 + t, y + h * 0.4, z0 + t, x1 - t, y + h * 0.86, z0 + t + 0.02));
  bag.add(mat, box(x0 + t, y + h * 0.4, z0 + 0.5, x0 + t + 0.12, y + h * 0.86, z1 - t)); bag.add(mat, box(x1 - t - 0.12, y + h * 0.4, z0 + 0.5, x1 - t, y + h * 0.86, z1 - t));
  bag.add(mat, box(x0 - 0.06, y + h, z0 - 0.06, x1 + 0.06, y + h + 0.14, z1 + 0.06));
  col.rect([x0, z0, x1, z1], y, y + h + 0.14);
}

/** A potted orange tree or a pomegranate in the court. */
function tree(bag, col, x, z, y, r = 0.9) {
  bag.add('terracotta', lathe([[0.3, 0], [0.34, 0.05], [0.4, 0.5], [0.36, 0.52], [0.001, 0.46]], 10, null, x, y, z));
  bag.add('bark_olive', lathe([[0.06, 0], [0.05, 0.9], [0.001, 0.92]], 6, null, x, y + 0.5, z));
  bag.add('palm_leaf', lathe(Array.from({ length: 7 }, (_, i) => { const t = i / 6 * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r * 0.9]; }), 8, null, x, y + 1.0, z));
  col.circle(x, z, 0.34, y, y + 0.5);
}

/**
 * abbasid_house: { rect, face ('s'|'n'|'e'|'w': the street side), seed, storeys (1|2), tower (a wind tower), open (the north range hollow, furnished),
 * simple (the far version), y }.
 */
function house(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, face = el.face || 's', y = el.y ?? 0, rand = rng(el.seed ?? 1), simple = !!el.simple;
  const sw = x1 - x0, sd = z1 - z0, w = face === 's' || face === 'n' ? sw : sd, d = face === 's' || face === 'n' ? sd : sw;
  const storeys = el.storeys ?? (rand() < 0.45 ? 2 : 1), Hs = 3.5, H = storeys * Hs + 0.2;
  const [lo, up] = WALLS[Math.floor(rand() * WALLS.length)], T = 0.55;
  const hw = w / 2, hd = d / 2;
  const ox = (rand() < 0.5 ? -1 : 1) * Math.min(w / 4, 3.2);       // the doorway's offset from the front's middle
  local(ctx, [cx, cz], YAW[face], (c) => {
    const { bag, col } = c, mat = lo, top = up;
    const roof = (a, b, c2, dd, h) => { bag.add('mud_plaster', box(a, y + h, b, c2, y + h + 0.14, dd)); };
    // the perimeter: the front with the doorway (arch 1.5 × 2.7), the other three plain with small high windows in the upper storey
    const win = (at, yy, n = 1) => ({ at, w: 0.5, h: 0.7, y0: yy, flat: true, n });
    const frontOps = [{ at: hw + ox, w: 1.5, h: 2.7 }];
    wallRun(c, { a: [-hw, hd - T / 2], b: [hw, hd - T / 2], th: T, y0: y, y1: y + H, mat, ops: frontOps });
    if (!simple) archBand(bag, { O: [ox - 0.75, hd - T / 2], U: [1, 0], N: [0, 1] }, 0, y, 1.5, 2.7, 0.3, T / 2, T / 2 + 0.07, ['brick_baked', 'brick_buff']);
    if (!simple) dressFront(c, { hw, hd, T, y, H, ox, mat, top, rand, storeys });
    const sideOps = (L) => (simple ? [] : [0.25, 0.5, 0.75].map((f) => win(L * f, y + 2.3)));
    wallRun(c, { a: [hw - T / 2, hd], b: [hw - T / 2, -hd], th: T, y0: y, y1: y + H, mat });
    wallRun(c, { a: [-hw + T / 2, -hd], b: [-hw + T / 2, hd], th: T, y0: y, y1: y + H, mat });
    wallRun(c, { a: [hw, -hd + T / 2], b: [-hw, -hd + T / 2], th: T, y0: y, y1: y + H, mat, ops: sideOps(w) });
    // an upper-storey band and a parapet round the roof
    if (storeys === 2 && top !== mat) for (const [a, b] of [[[-hw, hd - T / 2], [hw, hd - T / 2]], [[hw - T / 2, hd], [hw - T / 2, -hd]], [[-hw + T / 2, -hd], [-hw + T / 2, hd]], [[hw, -hd + T / 2], [-hw, -hd + T / 2]]]) bag.add(top, orientedBox(a, b, T + 0.04, y + Hs, y + H));
    for (const [a, b] of [[[-hw, hd - T / 2], [hw, hd - T / 2]], [[hw - T / 2, hd], [hw - T / 2, -hd]], [[-hw + T / 2, -hd], [-hw + T / 2, hd]], [[hw, -hd + T / 2], [-hw, -hd + T / 2]]]) { bag.add(top, orientedBox(a, b, T * 0.7, y + H, y + H + 0.5)); }
    // the court: ranges 3.6 (front), 3.4 (sides), 4.8 (north, with the iwan)
    const fd = Math.min(3.6, d * 0.25), sdp = Math.min(3.4, w * 0.22), bd = Math.min(4.8, d * 0.3);
    const hollow = !!el.open;
    const cx0 = -hw + sdp, cx1 = hw - sdp, cz0 = -hd + bd, cz1 = hd - fd;
    if (cx1 - cx0 < 3 || cz1 - cz0 < 3) { bag.add(top, box(-hw + T, y, -hd + T, hw - T, y + H, hd - T)); col.rect([-hw, -hd, hw, hd], y, y + H); roof(-hw, -hd, hw, hd, H); return; }
    // the front range: solid, but a bent passage: from the door at ox to the court at the other side
    const dog = -Math.sign(ox) * Math.min(1.8, (cx1 - cx0) / 4);
    const passX0 = Math.min(ox, dog) - 0.8, passX1 = Math.max(ox, dog) + 0.8;
    for (const [a0, a1] of [[-hw + T, passX0], [passX1, hw - T]]) if (a1 - a0 > 0.05) { bag.add(mat, box(a0, y, cz1, a1, y + H, hd - T)); col.rect([a0, cz1, a1, hd - T], y, y + H); }
    // the passage: a ceiling over it at 3.2 m, a floor of brick, a roof above; its inner arch to the court
    bag.add('brick_buff', box(passX0, y + 3.0, cz1, passX1, y + H, hd - T)); col.rect([passX0, cz1, passX1, hd - T], y + 3.0, y + H);
    // the passage's inner wall (the bend): solid on the entrance's side, the way into the court on the far side
    const bendX = dog > ox ? [passX0, dog - 0.8] : [dog + 0.8, passX1];
    bag.add(mat, box(bendX[0], y, cz1 + 0.6, bendX[1], y + 3.0, cz1 + 0.6 + T)); col.rect([bendX[0], cz1 + 0.6, bendX[1], cz1 + 0.6 + T], y, y + 3.0);
    // the side ranges: solid blocks; their court faces with blind arched recesses and doors
    const faceStuff = (fr, len, hRange, doorAt) => {
      if (simple) return;
      const n = Math.max(1, Math.floor(len / 2.6)), bw = len / n;
      for (let k = 0; k < n; k++) {
        const u0 = k * bw + 0.45, w2 = bw - 0.9, door = doorAt === k;
        bag.add('opening', polyGeo(fr, [[u0, y + (door ? 0 : 0.7)], [u0 + w2, y + (door ? 0 : 0.7)], [u0 + w2, y + (door ? 2.5 : 2.4)], [u0, y + (door ? 2.5 : 2.4)]], 0, 0.05));
        archBand(bag, fr, u0, y + (door ? 0 : 0.7), w2, door ? 2.6 : 1.9, 0.18, 0, 0.09, ['brick_baked', 'brick_buff']);
        if (storeys === 2) { bag.add('opening', polyGeo(fr, [[u0 + 0.2, y + Hs + 0.8], [u0 + w2 - 0.2, y + Hs + 0.8], [u0 + w2 - 0.2, y + Hs + 2.2], [u0 + 0.2, y + Hs + 2.2]], 0, 0.05)); bag.add('lattice', polyGeo(fr, [[u0 + 0.2, y + Hs + 0.8], [u0 + w2 - 0.2, y + Hs + 0.8], [u0 + w2 - 0.2, y + Hs + 2.2], [u0 + 0.2, y + Hs + 2.2]], 0.05, 0.08)); }
        void hRange;
      }
    };
    const KINDS = ['reception', 'bedroom', 'store', 'kitchen', 'bedroom', 'reception'];
    const sideRange = (sgn) => {
      const xa = sgn < 0 ? -hw + T : cx1, xb = sgn < 0 ? cx0 : hw - T, wx = sgn < 0 ? cx0 - 0.25 : cx1 + 0.25, door = sgn < 0 ? '+x' : '-x';
      const zA = -hd + T, zB = cz1, n = Math.max(1, Math.floor((zB - zA) / 4.2)), rl = (zB - zA) / n;
      for (let k = 0; k < n; k++) {
        const z0r = zA + k * rl, z1r = z0r + rl;
        wallRun(c, { a: [wx, z0r], b: [wx, z1r], th: 0.5, y0: y, y1: y + H, mat, ops: [{ at: rl / 2, w: 1.3, h: 2.5 }] });
        if (k > 0) wallRun(c, { a: [xa, z0r], b: [xb, z0r], th: 0.4, y0: y, y1: y + H, mat });
        bag.add('mud_plaster', box(Math.min(xa, xb), y + H, z0r, Math.max(xa, xb), y + H + 0.14, z1r));
        bag.add('timber', box(Math.min(xa, xb), y + 3.2, z0r, Math.max(xa, xb), y + 3.36, z1r)); bag.add('brick_paving', box(Math.min(xa, xb), y - 0.2, z0r, Math.max(xa, xb), y + 0.02, z1r));
        furnish(c, KINDS[(k + (sgn < 0 ? 0 : 3) + Math.floor(rand() * 2)) % KINDS.length], [Math.min(xa, xb) + 0.4, z0r + 0.25, Math.max(xa, xb) - 0.3, z1r - 0.25], door, y + 0.02, 3.2, rand, { light: k === 0 });
      }
      wallRun(c, { a: [xa < xb ? xa : xb, zA], b: [xa < xb ? xb : xa, zA], th: 0.4, y0: y, y1: y + H, mat });
      wallRun(c, { a: [xa < xb ? xa : xb, zB], b: [xa < xb ? xb : xa, zB], th: 0.4, y0: y, y1: y + H, mat });
      wallRun(c, { a: [sgn < 0 ? xa : xb, zA], b: [sgn < 0 ? xa : xb, zB], th: 0.3, y0: y, y1: y + H, mat });
    };
    if (hollow) { sideRange(-1); sideRange(1); }
    else { bag.add(mat, box(-hw + T, y, -hd + T, cx0, y + H, hd - fd - 0.0)); col.rect([-hw + T, -hd + T, cx0, cz1], y, y + H); bag.add(mat, box(cx1, y, -hd + T, hw - T, y + H, hd - fd - 0.0)); col.rect([cx1, -hd + T, hw - T, cz1], y, y + H); }
    faceStuff({ O: [cx0, cz0], U: [0, 1], N: [1, 0] }, cz1 - cz0, H, 1);
    faceStuff({ O: [cx1, cz1], U: [0, -1], N: [-1, 0] }, cz1 - cz0, H, 1);
    // the front range's court face
    faceStuff({ O: [cx1, cz1], U: [-1, 0], N: [0, -1] }, cx1 - cx0, H, -1);
    // the north range: the iwan (3.2 m wide, a vault 4.2 m high for one storey, up to 6.6 for two), rooms either side
    const iw = Math.min(3.4, (cx1 - cx0) * 0.4), iwh = storeys === 2 ? 6.4 : 4.4, spring = archCurve(iw, iwh).spring;
    const nx0 = -hw + T, nx1 = hw - T, nz0 = -hd + T, nz1 = cz0;
    if (hollow) {
      // rooms either side of the iwan, hollow, with a door each on the court; ceilings of timber, a roof over
      for (const sgn of [-1, 1]) {
        const rx0 = sgn < 0 ? nx0 : iw / 2 + 0.3, rx1 = sgn < 0 ? -iw / 2 - 0.3 : nx1;
        wallRun(c, { a: [rx0, nz1], b: [rx1, nz1], th: T, y0: y, y1: y + H, mat, ops: [{ at: (rx1 - rx0) / 2, w: 1.3, h: 2.5 }] });
        wallRun(c, { a: [sgn < 0 ? rx1 : rx0, nz1], b: [sgn < 0 ? rx1 : rx0, nz0], th: T, y0: y, y1: y + H, mat });
        bag.add('timber', box(rx0, y + 3.2, nz0, rx1, y + 3.36, nz1)); bag.add('mud_plaster', box(rx0, y + H, nz0, rx1, y + H + 0.14, nz1));
        bag.add('reed_mat', box(rx0 + 0.3, y + 0.02, nz0 + 0.3, rx1 - 0.3, y + 0.04, nz1 - 0.6));
        furnish(c, sgn < 0 ? 'reception' : 'bedroom', [rx0 + 0.4, nz0 + 0.3, rx1 - 0.4, nz1 - 0.3], '+z', y + 0.02, 3.2, rand);
      }
      bag.add('brick_paving', box(nx0, y - 0.2, nz0, nx1, y + 0.02, nz1));
    } else { bag.add(mat, box(nx0, y, nz0, nx1, y + H, nz1)); col.rect([nx0, nz0, nx1, nz1], y, y + H); }
    // the iwan itself: a vaulted alcove opening onto the court, carved from the range's middle, its floor a step above the court
    bag.add('opening', box(-iw / 2, y, nz0 + 0.02, iw / 2, y + iwh - 0.5, nz0 + 0.05));
    archway(c, { x: 0, w: iw, hh: iwh, z0: nz0 + 0.1, z1: cz0 + 0.15, top: y + H, mat, vault: 'plaster_white', ring: false });
    if (!simple) { archBand(bag, { O: [-iw / 2, cz0 + 0.15], U: [1, 0], N: [0, 1] }, 0, y, iw, iwh, 0.35, -0.2, 0.0, ['brick_baked', 'brick_buff']); stuccoPanel(bag, { O: [-iw / 2 + 0.2, nz0 + 0.12], U: [1, 0], N: [0, 1] }, 0, iw - 0.4, y + 0.3, y + 1.9, 0.03, 'stucco', 0.34); }
    bag.add('brick_paving', box(-iw / 2, y - 0.1, nz0, iw / 2, y + 0.05, cz0 + 0.15));
    // the iwan's floor a carpet and a cushion row, rich houses; lamps in the niche
    bag.add('cloth_maroon', box(-iw / 2 + 0.2, y + 0.05, nz0 + 0.3, iw / 2 - 0.2, y + 0.07, cz0 - 0.1)); bag.add('cloth_indigo', box(-iw / 2 + 0.5, y + 0.07, nz0 + 0.6, iw / 2 - 0.5, y + 0.15, nz0 + 1.2));
    // the roofs of the ranges
    roof(-hw + T, -hd + T, hw - T, cz0, H); roof(-hw + T, cz0, cx0, hd - T, H); roof(cx1, cz0, hw - T, hd - T, H); roof(-hw + T, cz1, hw - T, hd - T, H);
    // the court floor: paved with a pool or a tree
    bag.add('brick_paving', box(cx0, y - 0.2, cz0, cx1, y + 0.02, cz1));
    const mx = (cx0 + cx1) / 2, mz = (cz0 + cz1) / 2;
    if (!simple) {
      if (rand() < 0.65 && cx1 - cx0 > 4.5 && cz1 - cz0 > 4.5) {
        bag.add('limestone', box(mx - 1.0, y, mz - 1.0, mx + 1.0, y + 0.36, mz + 1.0)); bag.add('water', fromTriangles([mx - 0.82, y + 0.28, mz - 0.82, mx - 0.82, y + 0.28, mz + 0.82, mx + 0.82, y + 0.28, mz + 0.82, mx - 0.82, y + 0.28, mz - 0.82, mx + 0.82, y + 0.28, mz + 0.82, mx + 0.82, y + 0.28, mz - 0.82])); col.rect([mx - 1.0, mz - 1.0, mx + 1.0, mz + 1.0], y, y + 0.36);
      } else tree(bag, col, mx, mz, y, 1.0);
      if (cx1 - cx0 > 5) { tree(bag, col, cx0 + 0.8, cz0 + 1.0, y, 0.8); }
      // a water jar (zir) on a stand by the front range, a ladder to the roof against the east range
      bag.add('terracotta', lathe([[0.001, 0], [0.22, 0.02], [0.3, 0.3], [0.2, 0.6], [0.22, 0.66], [0.001, 0.62]], 10, null, cx1 - 0.5, y, cz1 - 0.5)); col.circle(cx1 - 0.5, cz1 - 0.5, 0.3, y, y + 0.66);
      for (const sx of [-0.2, 0.2]) bag.add('cedar', box(cx1 - 0.08 + sx * 0.0 - 0.03, y, cz0 + 1.4 + sx, cx1 - 0.02, y + H + 0.5, cz0 + 1.46 + sx));
      for (let k = 0; k < 9; k++) bag.add('cedar', box(cx1 - 0.1, y + 0.4 + k * 0.38, cz0 + 1.2, cx1 - 0.04, y + 0.44 + k * 0.38, cz0 + 1.7));
    }
    // the wind tower on the roof of the north range, over a rich house's principal room
    if (el.tower ?? (!simple && storeys === 2 && rand() < 0.35)) windTower(bag, col, (rand() < 0.5 ? -1 : 1) * (iw / 2 + 2.0), -hd + 2.6, y + H + 0.14, top === 'brick_baked' ? 'brick_baked' : mat);
    // a few roof things: a pile of reed mats and a water tank of baked clay; terrace
    if (!simple && rand() < 0.5) bag.add('reed_mat', box(hw - 2.4, y + H + 0.14, hd - 2.0, hw - 1.0, y + H + 0.5, hd - 1.0));
  });
}

export const houseElements = { abbasid_house: house };
void merlons; void barrel; void spandrel;

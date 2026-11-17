// The rooms of Lhasa's houses (docs/settlements/lhasa.md §16): in the main range of each courtyard house, on the
// ground floor the stable and the store-room, on the upper floor the main room (kitchen and living room in one:
// stove, cupboard, benches under rugs, low tables) and the shrine room (altar, butter lamps, books). Built as a
// function of the style's own helpers (index.js hands them in) so that this file has no import of its own style.

import { box, lathe, rod } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const RUGS = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_maroon'];

export function makeRooms(H) {
  const { face, thangka } = H;
  const bowl = (bag, mat, x, y, z, r = 0.07) => bag.add(mat, lathe([[0.001, 0], [r * 0.5, 0], [r, r * 1.1], [r * 0.9, r * 1.2], [r * 0.82, r * 1.12], [r * 0.45, r * 0.15], [0.001, 0.01]], 8, null, x, y, z));
  const pot = (bag, mat, x, y, z, r = 0.16) => bag.add(mat, lathe([[0.001, 0], [r * 0.7, 0], [r, r * 0.7], [r * 0.8, r * 1.5], [r * 0.5, r * 1.7], [r * 0.6, r * 1.9], [r * 0.45, r * 1.9]], 8, null, x, y, z));
  const sack = (bag, mat, x, y, z, s = 1) => bag.add(mat, lathe([[0.001, 0], [0.2 * s, 0.01], [0.26 * s, 0.18 * s], [0.23 * s, 0.42 * s], [0.16 * s, 0.58 * s], [0.06 * s, 0.64 * s], [0.001, 0.62 * s]], 7, null, x, y, z));

  /**
   * furnish(ctx, R): one room of a house — R = { kind: 'stable' | 'store' | 'living' | 'shrine', rect: [xa, za, xb, zb] (the
   * floor, plumb walls; the door is in the south wall zb), y (the floor), h (the ceiling over it), door (x of the doorway), seed }.
   */
  function furnish(ctx, R) {
    const { bag, col, lights } = ctx, [xa, za, xb, zb] = R.rect, y = R.y, h = R.h, rand = rng(R.seed || 1), L = xb - xa, D = zb - za, dx = R.door;
    const upper = R.kind === 'living' || R.kind === 'shrine', cx = (xa + xb) / 2;
    const B = (mat, x0, z0, x1, z1, ya, yb, solid) => {
      const r = [Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)];
      bag.add(mat, box(r[0], y + ya, r[1], r[2], y + yb, r[3]));
      if (solid) col.rect(r, y + ya, y + yb);
    };
    const lane = (x0, x1, z1) => x1 > dx - 0.85 && x0 < dx + 0.85 && z1 > zb - 1.35;          // the way in from the door
    const lamp = (x, yy, z, i = 1.3, d = 5) => lights?.push({ at: [x, y + yy, z], color: '#ffb46b', intensity: i, distance: d });
    // the floor: beaten earth below (the ground), planks above; the beams across the room
    if (upper) B('planks_grey', xa, za, xb, zb, 0, 0.03); else B('mud_plaster', xa, za, xb, zb, 0, 0.025);
    for (let x = xa + 0.55; x < xb - 0.3; x += 1.15) B(upper ? 'lacquer_red' : 'timber', x - 0.09, za, x + 0.09, zb, h - 0.22, h - 0.004);
    B(upper ? 'lacquer_red' : 'timber', xa, za, xb, za + 0.18, h - 0.3, h - 0.004);
    // a post under the middle of the long rooms, a beam along the room on it
    const post = (x, z) => {
      if (upper) { bag.add('lacquer_red', lathe([[0.13, 0], [0.12, h - 0.62], [0.14, h - 0.58]], 8, null, x, y + 0.03, z)); B('paint_dancheong', x - 0.22, z - 0.22, x + 0.22, z + 0.22, h - 0.6, h - 0.38); }
      else { bag.add('timber', lathe([[0.15, 0], [0.13, h - 0.6], [0.16, h - 0.55]], 8, null, x, y + 0.02, z)); B('paint_dancheong', x - 0.24, z - 0.24, x + 0.24, z + 0.24, h - 0.55, h - 0.35); }
      B(upper ? 'lacquer_red' : 'timber', x - 0.12, za, x + 0.12, zb, h - 0.38, h - 0.2);
      col.circle(x, z, 0.2, y, y + h);
    };
    const pz = za + D * 0.55;
    if (L > 5.4) post(cx + (rand() - 0.5) * 0.4, pz);
    const wallIn = (side) => (side < 0 ? xa : xb);

    if (R.kind === 'stable') {
      // the manger along the back wall full of hay, the tethering posts before it, the fodder heaped in the far corner
      B('wood_painted', xa + 0.3, za, xb - 0.3, za + 0.6, 0, 0.62, true);
      B('thatch', xa + 0.36, za + 0.06, xb - 0.36, za + 0.54, 0.62, 0.8);
      B('timber', xa + 0.3, za + 0.6, xb - 0.3, za + 0.66, 0.36, 0.42);
      for (const f of [0.28, 0.72]) { const px = xa + L * f; bag.add('timber', rod([px, y, za + 1.15], [px, y + 1.3, za + 1.15], 0.06, 6)); col.circle(px, za + 1.15, 0.08, y, y + 1.3); bag.add('rope_fibre', rod([px, y + 1.1, za + 1.15], [px, y + 0.9, za + 0.7], 0.012, 4)); }
      const far = dx - xa > xb - dx ? -1 : 1, hx = far < 0 ? xa + 0.8 : xb - 0.8;
      B('thatch', hx - 0.7, zb - 1.45, hx + 0.7, zb - 0.1, 0, 0.9, true);
      bag.add('thatch', lathe([[0.62, 0], [0.5, 0.35], [0.001, 0.62]], 7, null, hx, y + 0.9, zb - 0.78));
      if (!lane(cx - 0.4, cx + 0.5, zb)) { B('banco_rough', xa + L * 0.5 - 0.45, zb - 0.62, xa + L * 0.5 + 0.45, zb - 0.1, 0, 0.55, true); for (let r = 1; r < 4; r++) B('mud_plaster', xa + L * 0.5 - 0.46, zb - 0.63, xa + L * 0.5 + 0.46, zb - 0.09, r * 0.14 - 0.01, r * 0.14 + 0.01); }
      // a yak-hair rope coiled on a peg and the wooden plough standing against the end wall
      const wx = far < 0 ? xb : xa, sg = far < 0 ? -1 : 1;
      bag.add('timber', rod([wx + sg * 0.05, y + 0.3, za + 1.4], [wx + sg * 0.5, y + 2.0, za + 1.4], 0.04, 5));
      bag.add('timber', rod([wx + sg * 0.05, y + 0.3, za + 1.6], [wx + sg * 0.5, y + 2.0, za + 1.6], 0.04, 5));
      bag.add('iron', box(wx + sg * 0.05 - 0.04, y, za + 1.35, wx + sg * 0.05 + 0.04, y + 0.3, za + 1.65));
      lamp(cx, h - 0.6, za + D * 0.4, 0.9, 4.5);
    } else if (R.kind === 'store') {
      // big jars of grain and oil along the back wall, a grain bin each side, sacks, fuel, strings of dried meat and cheese from the beams
      const nj = Math.max(2, Math.floor((L - 1.0) / 1.05));
      for (let i = 0; i < nj; i++) { const jx = xa + 0.7 + (L - 1.4) * (i + 0.5) / nj, r = 0.36 + rand() * 0.1; pot(bag, i % 3 === 1 ? 'terracotta' : 'pottery_dark', jx, y, za + 0.55, r); col.circle(jx, za + 0.55, r, y, y + 1.0); }
      const fuelSide = dx > cx ? 1 : -1;                                   // (the dung cakes stand at the end the sacks are not)
      for (const sg of [-1, 1]) {
        const bx0 = sg < 0 ? xa : xb - 0.9, z0b = za + 1.3;
        if (sg === fuelSide || lane(bx0, bx0 + 0.9, z0b + 0.9)) continue;
        B('banco_rough', bx0, z0b, bx0 + 0.9, z0b + 0.9, 0, 1.0, true); B('planks_grey', bx0 - 0.03, z0b - 0.03, bx0 + 0.93, z0b + 0.93, 1.0, 1.06); B('timber', bx0 + 0.3, z0b + 0.3, bx0 + 0.6, z0b + 0.6, 1.06, 1.12);
      }
      const sx = dx > cx ? xa + 0.5 : xb - 0.5, sd = sx < cx ? 1 : -1;
      for (let i = 0; i < 5; i++) {
        const px = sx + sd * (0.42 + (i % 3 - 1) * 0.42 + (i % 3 === 0 ? 0.42 : 0)), pzz = zb - 0.5 - (i % 3 === 1 ? 0.4 : 0), lvl = i >= 3 ? 0.4 : 0;
        if (lane(px - 0.3, px + 0.3, zb)) continue;
        sack(bag, i % 2 ? 'sacking' : 'cloth_white', px, y + lvl, pzz, 0.9); col.circle(px, pzz, 0.27, y, y + 0.6);
      }
      // fuel: dung cakes in courses against the far end wall near the back
      const fx = sx < cx ? xb - 0.35 : xa + 0.35;
      for (let r = 0; r < 5; r++) B(r % 2 ? 'banco_rough' : 'mud_plaster', fx - 0.3, za + 1.1, fx + 0.3, za + 2.7, r * 0.15, r * 0.15 + 0.14);
      col.rect([fx - 0.3, za + 1.1, fx + 0.3, za + 2.7], y, y + 0.75);
      for (let i = 0; i < 4; i++) { const hx = xa + 0.9 + (L - 1.8) * (i + 0.5) / 4, hz = za + 1.8 + (i % 2) * 0.5; if (lane(hx - 0.1, hx + 0.1, hz + 0.1)) continue; bag.add('rope_fibre', rod([hx, y + h - 0.22, hz], [hx, y + h - 0.85, hz], 0.012, 4)); for (let j = 0; j < 3; j++) bag.add(i % 2 ? 'chalk' : 'hide_brown', lathe([[0.001, 0], [0.045, 0.04], [0.04, 0.14], [0.001, 0.2]], 6, null, hx, y + h - 1.05 - j * 0.16, hz)); }
      lamp(cx, h - 0.6, za + D * 0.4, 0.9, 4.5);
    } else if (R.kind === 'living') {
      // the carpet, the clay stove with its pots and flue, the painted cupboard and the shelf of copper, the benches under rugs with low tables, a thangka
      B('cloth_red', cx - L * 0.28, za + 0.9, cx + L * 0.28, zb - 0.55, 0.03, 0.045); B('cloth_indigo', cx - L * 0.28 + 0.1, za + 1.0, cx + L * 0.28 - 0.1, zb - 0.65, 0.045, 0.055); B('cloth_ochre', cx - L * 0.28 + 0.3, za + 1.2, cx + L * 0.28 - 0.3, zb - 0.85, 0.055, 0.062);
      const side = R.v % 2 ? 1 : -1, sxm = side < 0 ? xa + 0.85 : xb - 0.85;
      B('mud_plaster', sxm - 0.48, za + 0.05, sxm + 0.48, za + 0.95, 0, 0.82, true); B('iron', sxm - 0.45, za + 0.08, sxm + 0.45, za + 0.92, 0.82, 0.87);
      pot(bag, 'bronze', sxm - 0.2, y + 0.87, za + 0.5, 0.2); pot(bag, 'pottery_dark', sxm + 0.22, y + 0.87, za + 0.5, 0.16);
      bag.add('iron', rod([sxm, y + 0.87, za + 0.15], [sxm, y + h, za + 0.15], 0.06, 6));
      B('mud_plaster', sxm - 0.4, za + 0.05, sxm + 0.4, za + 0.2, 0.87, 1.5);                                     // the stove's back, blackened
      // the painted cupboard beside the stove, its doors in red and ochre panels; the shelf of copper above the benches
      const cxm = side < 0 ? sxm + 1.45 : sxm - 1.45;
      B('wood_painted', cxm - 0.65, za, cxm + 0.65, za + 0.5, 0, 1.75, true);
      for (const s2 of [-1, 1]) { const u0 = cxm + (s2 < 0 ? -0.6 : 0.05), u1 = cxm + (s2 < 0 ? -0.05 : 0.6); face(bag, 'lacquer_red', [0, 1], [u0, y + 0.1, za + 0.52], [u1, y + 0.1, za + 0.52], [u1, y + 1.0, za + 0.52], [u0, y + 1.0, za + 0.52]); face(bag, 'paint_ochre', [0, 1], [u0 + 0.06, y + 1.1, za + 0.52], [u1 - 0.06, y + 1.1, za + 0.52], [u1 - 0.06, y + 1.68, za + 0.52], [u0 + 0.06, y + 1.68, za + 0.52]); face(bag, 'gilt_bronze', [0, 1], [(u0 + u1) / 2 - 0.03, y + 0.5, za + 0.545], [(u0 + u1) / 2 + 0.03, y + 0.5, za + 0.545], [(u0 + u1) / 2 + 0.03, y + 0.62, za + 0.545], [(u0 + u1) / 2 - 0.03, y + 0.62, za + 0.545]); }
      B('lacquer_red', cxm - 0.7, za, cxm + 0.7, za + 0.54, 1.75, 1.8);
      const ox = side < 0 ? cxm + 1.45 : cxm - 1.45;
      if (Math.abs(ox - cx) < L / 2 - 0.9) {
        B('wood_painted', ox - 0.9, za, ox + 0.9, za + 0.3, 1.45, 1.5);
        for (let i = 0; i < 4; i++) { const px = ox - 0.65 + i * 0.43; pot(bag, 'bronze', px, y + 1.5, za + 0.16, 0.1 + (i % 2) * 0.02); }
        thangka(bag, { at: [ox, za + 0.02], u: [1, 0], n: [0, 1], y: y + 0.52, w: 0.5, h: 0.62, kind: R.seed % 5 });
      }
      // the benches along the side wall(s) with rugs, a low table before each carrying bowls and a teapot
      for (const s2 of L > 5.3 ? [-1, 1] : [side < 0 ? 1 : -1]) {
        const bw = s2 < 0 ? xa : xb, b0 = s2 < 0 ? bw : bw - 0.85, b1 = s2 < 0 ? bw + 0.85 : bw, z0b = za + 1.15, z1b = Math.min(za + 2.55, zb - 0.6);
        if (z1b - z0b < 1.2 || (s2 === side && Math.abs(b0 - sxm) < 1.0 && z0b < za + 1.1)) continue;
        if (lane(b0, b1, z1b)) continue;
        B('wood_painted', b0, z0b, b1, z1b, 0, 0.4, true); B(RUGS[(R.seed + (s2 > 0 ? 1 : 0)) % 5], b0 + 0.02, z0b + 0.02, b1 - 0.02, z1b - 0.02, 0.4, 0.43);
        for (let z = z0b + 0.2; z < z1b - 0.3; z += 0.55) B(z * 3 % 2 < 1 ? 'cloth_white' : 'cloth_ochre', b0 + 0.04, z, b1 - 0.04, z + 0.22, 0.43, 0.45);
        for (let i = 0; i < 3; i++) B(RUGS[(R.seed + i + 2) % 5], s2 < 0 ? b0 + 0.05 : b1 - 0.3, z0b + 0.2 + i * 0.4, s2 < 0 ? b0 + 0.35 : b1 - 0.05, z0b + 0.55 + i * 0.4, 0.45, 0.6);
        const t0 = s2 < 0 ? b1 + 0.08 : b0 - 0.68, t1 = s2 < 0 ? b1 + 0.68 : b0 - 0.08, tz0 = z0b + 0.2, tz1 = z1b - 0.2;
        if (!lane(t0, t1, tz1)) {
          B('lacquer_red', t0, tz0, t1, tz1, 0.3, 0.37, true); B('wood_painted', t0 + 0.04, tz0 + 0.04, t1 - 0.04, tz1 - 0.04, 0, 0.3); B('cloth_ochre', t0 + 0.08, tz0 + 0.08, t1 - 0.08, tz1 - 0.08, 0.37, 0.375);
          const tx = (t0 + t1) / 2; for (const tz of [tz0 + 0.25, tz1 - 0.25]) bowl(bag, rand() < 0.5 ? 'timber' : 'wood_painted', tx + (rand() - 0.5) * 0.1, y + 0.375, tz, 0.065);
          bag.add('bronze', lathe([[0.001, 0], [0.09, 0], [0.1, 0.12], [0.07, 0.2], [0.05, 0.24], [0.001, 0.25]], 8, null, tx, y + 0.375, (tz0 + tz1) / 2));
        }
      }
      // the churn by the stove
      const chx = side < 0 ? sxm + 0.95 : sxm - 0.95;
      if (Math.abs(chx - cxm) > 1.0) { bag.add('timber', lathe([[0.12, 0], [0.11, 0.9], [0.09, 0.92]], 8, null, chx, y + 0.03, za + 0.4)); for (const v of [0.12, 0.45, 0.78]) bag.add('iron', lathe([[0.123, v - 0.02], [0.123, v + 0.02]], 8, null, chx, y + 0.03, za + 0.4)); bag.add('timber', rod([chx, y + 0.9, za + 0.4], [chx, y + 1.45, za + 0.4], 0.018, 5)); col.circle(chx, za + 0.4, 0.14, y, y + 1.4); }
      lamp(sxm, 1.3, za + 1.1, 1.5, 5.5);
    } else if (R.kind === 'shrine') {
      // the altar against the back wall: the lacquered table, a step with the gilt images, the seven bowls of water, the butter lamps; thangkas on the side walls, a shelf of books, a seat and a low table
      const aw = Math.min(1.5, L / 2 - 0.5);
      B('lacquer_red', cx - aw, za, cx + aw, za + 0.55, 0, 0.82, true); B('gilt_bronze', cx - aw - 0.02, za + 0.54, cx + aw + 0.02, za + 0.58, 0.8, 0.84);
      B('wood_painted', cx - aw + 0.1, za, cx + aw - 0.1, za + 0.3, 0.84, 1.12); B('cloth_ochre', cx - aw + 0.14, za + 0.04, cx + aw - 0.14, za + 0.34, 1.12, 1.14);
      face(bag, 'limewash_red', [0, 1], [cx - aw - 0.2, y + 0.04, za + 0.012], [cx + aw + 0.2, y + 0.04, za + 0.012], [cx + aw + 0.2, y + h - 0.1, za + 0.012], [cx - aw - 0.2, y + h - 0.1, za + 0.012]);
      face(bag, 'cloth_ochre', [0, 1], [cx - aw - 0.2, y + 1.52, za + 0.02], [cx + aw + 0.2, y + 1.52, za + 0.02], [cx + aw + 0.2, y + 1.6, za + 0.02], [cx - aw - 0.2, y + 1.6, za + 0.02]);
      const statue = (x, yb, z, s) => {
        bag.add('gilt_bronze', lathe([[0.001, 0], [0.2 * s, 0], [0.23 * s, 0.05 * s], [0.15 * s, 0.1 * s], [0.001, 0.1 * s]], 8, null, x, yb, z));
        bag.add('gilt_bronze', lathe([[0.001, 0.1 * s], [0.2 * s, 0.1 * s], [0.15 * s, 0.28 * s], [0.09 * s, 0.4 * s], [0.06 * s, 0.46 * s], [0.001, 0.46 * s]], 8, null, x, yb, z));
        bag.add('gilt_bronze', lathe([[0.001, 0.46 * s], [0.065 * s, 0.48 * s], [0.07 * s, 0.56 * s], [0.04 * s, 0.63 * s], [0.001, 0.65 * s]], 8, null, x, yb, z));
        face(bag, 'paint_ochre', [0, 1], [x - 0.2 * s, yb + 0.25 * s, z + 0.14], [x + 0.2 * s, yb + 0.25 * s, z + 0.14], [x + 0.2 * s, yb + 0.88 * s, z + 0.14], [x - 0.2 * s, yb + 0.88 * s, z + 0.14]);
      };
      statue(cx, y + 1.14, za + 0.17, 1.0);
      for (const sg of [-1, 1]) { const px = cx + sg * (aw - 0.4); bag.add('gilt_bronze', lathe([[0.001, 0], [0.13, 0], [0.13, 0.06], [0.09, 0.12], [0.1, 0.3], [0.05, 0.36], [0.06, 0.4], [0.001, 0.46]], 8, null, px, y + 1.14, za + 0.17)); }
      for (let i = 0; i < 7; i++) { const px = cx - 0.66 + i * 0.22; bowl(bag, 'bronze', px, y + 0.84, za + 0.43, 0.05); }
      for (let i = 0; i < 5; i++) { const px = cx - aw + 0.18 + i * (2 * aw - 0.36) / 4; bag.add('gilt_bronze', lathe([[0.03, 0], [0.02, 0.05], [0.055, 0.09], [0.001, 0.1]], 8, null, px, y + 0.84, za + 0.5)); bag.add('flame', lathe([[0.001, 0], [0.012, 0.014], [0.001, 0.045]], 5, null, px, y + 0.94, za + 0.5)); }
      lamp(cx, 1.15, za + 0.75, 1.8, 5);
      // the books: a cabinet with the volumes' wrappers showing, on the side wall nearer the back
      const bs = R.v % 2 ? 1 : -1, bwx = bs < 0 ? xa : xb, b0 = bs < 0 ? bwx : bwx - 0.4, b1 = bs < 0 ? bwx + 0.4 : bwx, bz0 = za + 0.9, bz1 = Math.min(zb - 0.9, za + 2.3);
      if (bz1 - bz0 > 0.9 && !lane(b0, b1, bz1)) {
        B('wood_painted', b0, bz0, b1, bz1, 0, 1.7, true);
        const fx = bs < 0 ? b1 + 0.004 : b0 - 0.004, nrm = [bs, 0], nr = Math.max(3, Math.round((bz1 - bz0) / 0.28));
        for (let r = 0; r < 4; r++) for (let c = 0; c < nr; c++) { const zz0 = bz0 + 0.04 + (bz1 - bz0 - 0.08) * c / nr, zz1 = bz0 + 0.04 + (bz1 - bz0 - 0.08) * (c + 0.86) / nr, yy0 = 0.1 + r * 0.4, yy1 = yy0 + 0.3; face(bag, ['cloth_ochre', 'cloth_red', 'cloth_white', 'cloth_indigo'][(r + c) % 4], nrm, [fx, y + yy0, zz0], [fx, y + yy0, zz1], [fx, y + yy1, zz1], [fx, y + yy1, zz0]); }
      }
      // a thangka on the other side wall, a seat with its low table before the altar
      const ts = -bs, twx = ts < 0 ? xa + 0.03 : xb - 0.03;
      if (D > 2.6) thangka(bag, { at: [twx, za + Math.min(D * 0.45, 1.6)], u: [0, ts < 0 ? 1 : -1], n: [ts < 0 ? 1 : -1, 0], y: y + 0.75, w: 0.5, h: 0.6, kind: (R.seed >> 3) % 5 });
      B('cloth_red', cx - 0.55, za + 1.45, cx + 0.55, za + 2.3, 0, 0.12, false); B(RUGS[R.seed % 5], cx - 0.5, za + 1.5, cx + 0.5, za + 2.25, 0.12, 0.15);
      B('lacquer_red', cx - 0.4, za + 1.0, cx + 0.4, za + 1.4, 0.28, 0.34, true); B('wood_painted', cx - 0.36, za + 1.04, cx + 0.36, za + 1.36, 0, 0.28);
      bowl(bag, 'bronze', cx - 0.18, y + 0.34, za + 1.2, 0.05); bag.add('bronze', lathe([[0.001, 0], [0.05, 0], [0.045, 0.12], [0.001, 0.14]], 8, null, cx + 0.2, y + 0.34, za + 1.2));
    }
  }
  return { furnish };
}

// The Zoroastrian fire temple (xian) of Chang'an's West Market quarter, docs/settlements/tang-changan.md §16: a square building of buff brick
// on a low platform, open by an arched doorway in each of its four faces (the Sasanian four-arch plan, chahar taq), a dome on a drum
// over the central chamber, and in it the fire altar: a stepped stone pedestal, a shaft, the bronze bowl and the flame that is kept
// burning. [inferred: the form from the Sasanian fire temples; the Chinese temples' own plan is not recorded.]
// fire_chamber { c, y }: built with its entrances to the four sides; Ho = 6 outer half-side, the doorways 5 m wide, the piers 3.5 m.

import { box, frustum, lathe } from '../../core/geom.js';
import { inFrame } from './kit.js';

export function fireChamber(el, ctx) {
  inFrame(ctx, el.c, 0, (L) => {
    const { bag, col, lights } = L, y0 = el.y ?? 0, PH = 0.3, F = y0 + PH, Ho = 6.0, a = 2.5, T = 3.5, NA = 8, ahS = 3.4;
    const R = (s) => [-s, -s, s, s];
    // the platform, and on each side a short stair of two steps
    bag.add('brick_grey', frustum(R(Ho + 1.0), y0 - 0.05, F, 0, 0, 0, 0, { noBottom: y0 <= 0.01 }));
    col.rect(R(Ho + 1.0), y0 - 0.05, F); col.floor(R(Ho + 1.0), F);
    const sw = 3.6, dp = 0.42, e0 = Ho + 1.0;
    for (const [rect, blk, dir] of [
      [[-sw / 2, e0, sw / 2, e0 + 2 * dp], [-sw / 2, y0 - 0.02, e0, sw / 2, F - PH / 2, e0 + dp], 'n'],
      [[-sw / 2, -e0 - 2 * dp, sw / 2, -e0], [-sw / 2, y0 - 0.02, -e0 - dp, sw / 2, F - PH / 2, -e0], 's'],
      [[e0, -sw / 2, e0 + 2 * dp, sw / 2], [e0, y0 - 0.02, -sw / 2, e0 + dp, F - PH / 2, sw / 2], 'w'],
      [[-e0 - 2 * dp, -sw / 2, -e0, sw / 2], [-e0 - dp, y0 - 0.02, -sw / 2, -e0, F - PH / 2, sw / 2], 'e'],
    ]) { bag.add('granite_block', box(blk[0], blk[1], blk[2], blk[3], blk[4], blk[5])); col.ramp(rect, y0, F, dir); }
    // the corner piers, 3.5 m square, and the four arched faces: a band over the doorways, the arch heads stepped in brick courses
    const wall = 'brick_buff', slab = (r, ya, yb, m = wall) => bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])), solid = (r, ya, yb, m = wall) => { slab(r, ya, yb, m); col.rect(r, ya, yb); };
    const top = F + ahS + a;                                   // the arch crowns
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) solid([sx > 0 ? a : -Ho, sz > 0 ? a : -Ho, sx > 0 ? Ho : -a, sz > 0 ? Ho : -a], F, top + 0.7);
    const hw = (k) => Math.sqrt(Math.max(0, a * a - ((k * a) / NA) ** 2));
    for (const face of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const [fx, fz] = face, along = fz !== 0;
      const P = (u0, u1, ya, yb, m = wall) => { const r = along ? [u0, fz > 0 ? Ho - T : -Ho, u1, fz > 0 ? Ho : -Ho + T] : [fx > 0 ? Ho - T : -Ho, u0, fx > 0 ? Ho : -Ho + T, u1]; solid(r, ya, yb, m); };
      P(-a, a, F + ahS + a, top + 0.7);                                         // the band over the crown
      for (let k = 1; k < NA; k++) { const h = hw(k), ya = F + ahS + (k * a) / NA, yb = ya + a / NA; P(-a, -h, ya, yb); P(h, a, ya, yb); }
      // the arch's frame: a limestone ring of stepped voussoirs on the outer face, 0.3 m wide, 0.08 proud
      const px = fx * (Ho + 0.04), pz = fz * (Ho + 0.04);
      const B = (u0, ya, u1, yb) => along ? bag.add('limestone', box(px + u0, ya, fz > 0 ? pz : pz - 0.08, px + u1, yb, fz > 0 ? pz + 0.08 : pz)) : bag.add('limestone', box(fx > 0 ? px : px - 0.08, ya, pz + u0, fx > 0 ? px + 0.08 : px, yb, pz + u1));
      for (const sg of [-1, 1]) B(sg < 0 ? -a - 0.3 : a, F, sg < 0 ? -a : a + 0.3, F + ahS);
      for (let k = 0; k < NA; k++) { const h = hw(k), ya = F + ahS + (k * a) / NA, yb = ya + a / NA; B(-h - 0.3, ya, -h, yb); B(h, ya, h + 0.3, yb); }
      B(-hw(NA - 1) - 0.3, top, hw(NA - 1) + 0.3, top + 0.3);
      // a panel on each pier, in the plaster, and a plain moulding
      for (const sg of [-1, 1]) { const u = sg * (a + T / 2); bag.add('plaster_white', along ? box(px + u - 1.1, F + 1.0, fz > 0 ? pz : pz - 0.03, px + u + 1.1, F + 5.2, fz > 0 ? pz + 0.03 : pz) : box(fx > 0 ? px : px - 0.03, F + 1.0, pz + u - 1.1, fx > 0 ? px + 0.03 : px, F + 5.2, pz + u + 1.1)); }
    }
    // the ceiling slab over the chamber, the corner turrets and the stepped merlons along the roof's edge
    const yR = top + 0.7;
    solid(R(Ho), yR, yR + 0.5, 'plaster_white'); slab(R(a + 0.8), top - 0.0, yR, 'plaster_white');
    for (let s = -Ho + 0.4; s < Ho - 0.2; s += 1.1) for (const z of [-Ho + 0.3, Ho - 0.3]) slab([s, z - 0.25, s + 0.6, z + 0.25], yR + 0.5, yR + 1.0, 'plaster_white');
    for (let s = -Ho + 1.5; s < Ho - 1.3; s += 1.1) for (const x of [-Ho + 0.3, Ho - 0.3]) slab([x - 0.25, s, x + 0.25, s + 0.6], yR + 0.5, yR + 1.0, 'plaster_white');
    const yD = yR + 0.5;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const c0 = [sx * 4.2, sz * 4.2]; slab([c0[0] - 1.5, c0[1] - 1.5, c0[0] + 1.5, c0[1] + 1.5], yD, yD + 0.7); slab([c0[0] - 1.0, c0[1] - 1.0, c0[0] + 1.0, c0[1] + 1.0], yD + 0.7, yD + 1.1); }
    // the drum and the dome: plaster over the brick, a ring of small windows (dark), a bronze finial
    const pr = [[0.001, yD], [4.6, yD], [4.6, yD + 1.3]]; for (let k = 1; k <= 12; k++) { const t = (k / 12) * Math.PI / 2; pr.push([4.6 * Math.cos(t) + 0.001, yD + 1.3 + 3.2 * Math.sin(t)]); }
    bag.add('plaster_white', lathe(pr, 24));
    for (let k = 0; k < 8; k++) { const t = (k / 8) * Math.PI * 2; bag.add('wood_dark', box(Math.cos(t) * 4.62 - 0.25, yD + 0.45, Math.sin(t) * 4.62 - 0.25, Math.cos(t) * 4.62 + 0.25, yD + 1.05, Math.sin(t) * 4.62 + 0.25)); }
    bag.add('bronze', lathe([[0.001, 0], [0.3, 0.0], [0.34, 0.25], [0.12, 0.5], [0.07, 1.2], [0.001, 1.6]], 10, null, 0, yD + 4.5, 0));
    // the fire altar: two steps of stone, a shaft with moulded foot and capital, the bronze bowl with its flame; ashes before it
    bag.add('granite_block', box(-0.95, F, -0.95, 0.95, F + 0.28, 0.95)); bag.add('granite_block', box(-0.7, F + 0.28, -0.7, 0.7, F + 0.56, 0.7));
    bag.add('limestone', lathe([[0.001, 0], [0.42, 0], [0.42, 0.1], [0.3, 0.16], [0.26, 0.2], [0.24, 0.9], [0.3, 0.96], [0.44, 1.02], [0.44, 1.12], [0.001, 1.12]], 14, null, 0, F + 0.56, 0));
    const fy = F + 0.56 + 1.12;
    bag.add('bronze', lathe([[0.001, 0], [0.3, 0.02], [0.5, 0.14], [0.52, 0.22], [0.44, 0.26], [0.001, 0.2]], 14, null, 0, fy, 0));
    bag.add('flame', lathe([[0.001, 0.2], [0.2, 0.28], [0.14, 0.62], [0.06, 0.9], [0.001, 1.15]], 6, null, 0, fy, 0));
    bag.add('flame', lathe([[0.001, 0.2], [0.3, 0.26], [0.2, 0.42], [0.001, 0.52]], 6, null, 0, fy, 0));
    col.circle(0, 0, 1.0, F, F + 2.4);
    lights.push({ at: [0, fy + 0.7, 0], color: '#ff9c44', intensity: 5.5, distance: 17 });
    bag.add('reed_mat', box(-0.5, F, 1.3, 0.5, F + 0.025, 2.1));        // the priest's mat; a tray of ash and a pair of tongs beside it
    bag.add('slate', box(1.4, F, 1.1, 1.9, F + 0.06, 1.6)); bag.add('iron', box(1.6, F + 0.06, 0.4, 1.64, F + 0.9, 0.44)); bag.add('iron', box(1.7, F + 0.06, 0.4, 1.74, F + 0.9, 0.44));
  });
}
export const FIRE_ELEMENTS = { fire_chamber: fireChamber };

// What a Swahili stone house shows at eye level on its lane, and what its front room holds
// (docs/settlements/kilwa.md §18): the makuti (palm-thatch) awning over the baraza on poles, the barred window
// and its plank shutter, the lamp niche, pegs with coils of coir rope, mangrove poles (boriti) leaning against
// the wall, the roof spout with its rain streak, patches of new limewash over old render, and by trade the goods
// outside the door — cloth on a pole, stacked jars, tusks, nets and fish baskets, copra, rope, a hearth with
// firewood. Inside: the shelves and counter of a shop (duka), the sleeping platform, the chest, the hearth.
// Built into the house's own bag (merged per material); every shape small and cheap.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { face } from './kit.js';

export const TRADES = ['plain', 'plain', 'plain', 'cook', 'water', 'fisher', 'cloth', 'jars', 'ivory', 'rope', 'copra', 'potter', 'carpenter'];
export const DUKA = ['cloth', 'jars', 'ivory', 'rope', 'copra', 'spice', 'beads'];

const GL = ['glaze_green', 'glaze_blue', 'glaze_white'];
const CLOTH = ['cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_red', 'cloth_green', 'cloth_maroon'];

/** A jar (profile scaled to height h), at (x, y, z). */
const jar = (bag, mat, x, y, z, h = 0.5, r = 0.2) => bag.add(mat, lathe([[0.001, 0], [r * 0.6, 0.01], [r, h * 0.35], [r * 0.95, h * 0.6], [r * 0.45, h * 0.9], [r * 0.5, h], [0.001, h]], 8, null, x, y, z));
/** A coil of coir rope: a low ring. */
const coil = (bag, x, y, z, r = 0.22) => bag.add('rope_fibre', lathe([[r * 0.35, 0], [r, 0.02], [r, 0.12], [r * 0.35, 0.14], [r * 0.35, 0]], 9, null, x, y, z));
/** A tusk of ivory leaning: from the foot (x, y, z) to the tip, tapering. */
function tusk(bag, a, b, r = 0.07) { const T = []; beamTris(T, a, b, r * 0.5, r); bag.add('ivory', fromTriangles(T)); }

/** The holes and niches the house's street wall is cut with: [{ window }, niches] (the wall at z0, x from x0 to x1). */
export function frontCuts(o) {
  const { x0, x1, cf, doorX, rand, W } = o, holes = [], rec = [];
  // a barred window beside the door on the wider fronts (into the court: a hole to see through)
  const side = doorX - x0 > x1 - doorX ? -1 : 1, wx = side < 0 ? (x0 + doorX) / 2 : (doorX + x1) / 2, has = W > 7.4 && rand() < 0.65;
  const win = has && Math.abs(wx - doorX) > 1.5 ? { u0: wx - 0.3, u1: wx + 0.3, v0: cf + 1.3, v1: cf + 2.0, frame: 'door' } : null;
  if (win) holes.push(win);
  // the lamp niche over the baraza
  const nx = doorX + (rand() < 0.5 ? -1 : 1) * 1.15;
  if (nx > x0 + 0.7 && nx < x1 - 0.7 && !(win && Math.abs(nx - wx) < 0.8)) rec.push({ u0: nx - 0.16, u1: nx + 0.16, v0: cf + 1.55, v1: cf + 1.95, d: 0.14, side: -1 });
  return { holes, rec, win, lamp: rec[0] };
}

/** The dressing of the street front. */
export function dressFront(ctx, o, cuts) {
  const { bag, col } = ctx, { x0, z0, x1, cf, doorX, rand, W, yC, trade, duka, T } = o;
  const zf = z0 - 0.47;   // the outer edge of the baraza
  // ---- the window's bars and plank shutter
  if (cuts.win) {
    const w = cuts.win, mx = (w.u0 + w.u1) / 2;
    for (let k = 0; k < 5; k++) bag.add('wood_dark', box(w.u0 + 0.05 + k * 0.125, w.v0, z0 + 0.06, w.u0 + 0.09 + k * 0.125, w.v1, z0 + 0.1));
    bag.add('wood_dark', box(w.u0, w.v0 + 0.3, z0 + 0.05, w.u1, w.v0 + 0.34, z0 + 0.11));
    // the shutter leaf standing open against the wall beside it (a plank leaf, studded)
    bag.add('wood_dark', box(w.u1 + 0.02, w.v0, z0 - 0.07, w.u1 + 0.32, w.v1, z0 - 0.03));
    bag.add('iron', box(w.u1 + 0.1, w.v0 + 0.3, z0 - 0.08, w.u1 + 0.14, w.v0 + 0.34, z0 - 0.065));
    void mx;
  }
  // the lamp in its niche, a little glass and the soot above it
  if (cuts.lamp) { const l = cuts.lamp, m = (l.u0 + l.u1) / 2; bag.add('lamp_glass', lathe([[0.001, 0], [0.06, 0.03], [0.07, 0.1], [0.04, 0.17], [0.001, 0.18]], 8, null, m, l.v0 + 0.02, z0 + 0.07)); bag.add('plaster_streak', box(m - 0.1, l.v1 + 0.05, z0 - 0.012, m + 0.1, l.v1 + 0.3, z0)); }
  // ---- the makuti awning over the baraza: two mangrove posts, a tie beam, the thatch sloping up to the wall
  const awn = duka ? rand() < 0.8 : rand() < 0.22;
  const aw = awn ? [Math.max(x0 + 0.2, doorX - 1.9), Math.min(x1 - 0.2, doorX + 1.9)] : null;
  if (aw && aw[1] - aw[0] > 2) {
    const yp = cf + 2.2, th = [];
    for (const px of aw) { const P = []; beamTris(P, [px, cf - 0.05, zf - 0.04], [px, yp + 0.1, zf - 0.04], 0.07, 0.065); bag.add('wood_dark', fromTriangles(P)); col.circle(px, zf - 0.04, 0.08, cf, yp); }
    const B = []; beamTris(B, [aw[0] - 0.1, yp + 0.05, zf - 0.04], [aw[1] + 0.1, yp + 0.05, zf - 0.04], 0.06, 0.06); bag.add('wood_dark', fromTriangles(B));
    const yt = Math.min(yC - 0.1, cf + 2.65), P = (x, y, z) => [x, y, z];
    face(th, [0, 0.7, -1], P(aw[0] - 0.25, yp, zf - 0.25), P(aw[1] + 0.25, yp, zf - 0.25), P(aw[1] + 0.25, yt, z0), P(aw[0] - 0.25, yt, z0));
    face(th, [0, -0.7, 1], P(aw[0] - 0.25, yp - 0.1, zf - 0.25), P(aw[1] + 0.25, yp - 0.1, zf - 0.25), P(aw[1] + 0.25, yt - 0.1, z0), P(aw[0] - 0.25, yt - 0.1, z0));
    face(th, [0, -1, -0.2], P(aw[0] - 0.25, yp, zf - 0.25), P(aw[1] + 0.25, yp, zf - 0.25), P(aw[1] + 0.25, yp - 0.1, zf - 0.25), P(aw[0] - 0.25, yp - 0.1, zf - 0.25));
    bag.add('thatch_palm', fromTriangles(th));
  }
  // ---- pegs on the wall with coils of coir, mangrove poles leaning in a corner, a spout and its streak
  if (rand() < 0.5) { const px = doorX + (rand() < 0.5 ? -1 : 1) * (1.5 + rand() * 0.6); if (px > x0 + 0.5 && px < x1 - 0.5 && !(aw && px > aw[0] && px < aw[1])) { for (const dx of [-0.2, 0.2]) bag.add('wood_dark', box(px + dx - 0.02, cf + 1.6, z0 - 0.12, px + dx + 0.02, cf + 1.64, z0)); coil(bag, px - 0.2, cf + 1.64, z0 - 0.1, 0.12); bag.add('rope_fibre', box(px + 0.12, cf + 1.0, z0 - 0.05, px + 0.28, cf + 1.62, z0 - 0.03)); } }
  if (rand() < 0.4) {
    const cx = rand() < 0.5 ? x0 + 0.55 : x1 - 0.55, s = cx < doorX ? 1 : -1, P = [];
    for (let k = 0; k < 6; k++) beamTris(P, [cx + s * k * 0.1, cf, z0 - 0.4 - (k % 2) * 0.06], [cx + s * k * 0.1 + s * 0.06, cf + 2.2 - k * 0.08, z0 - 0.05], 0.05, 0.04);
    bag.add('wood_dark', fromTriangles(P));
  }
  const sx = x0 + 0.6 + rand() * (W - 1.2);
  if (!(Math.abs(sx - doorX) < 0.9)) { bag.add('wood_dark', box(sx - 0.07, yC - 0.18, z0 - 0.4, sx + 0.07, yC - 0.1, z0)); bag.add('plaster_streak', box(sx - 0.1, cf + 0.7, z0 - 0.012, sx + 0.1, yC - 0.18, z0)); }
  // patches of newer limewash over the old render, a pale square or two
  for (let k = 0; k < 2; k++) {
    if (rand() < 0.4) continue;
    const w = 0.7 + rand() * 1.1, h = 0.6 + rand() * 0.9, xa = x0 + 0.3 + rand() * Math.max(0.1, W - w - 0.6), ya = cf + 0.6 + rand() * Math.max(0.1, yC - cf - 0.6 - h - 0.1);
    if (xa < doorX + 0.7 && xa + w > doorX - 0.7) continue;
    bag.add(rand() < 0.6 ? 'plaster_white' : 'plaster_grey', box(xa, ya, z0 - 0.007, xa + w, ya + h, z0));
  }
  // ---- the goods of the trade outside the door
  const gx = (s, d) => doorX + s * d;
  const side = doorX - x0 > x1 - doorX ? -1 : 1;
  const free = (x, m = 0.5) => x > x0 + m && x < x1 - m && Math.abs(x - doorX) > 0.9;
  switch (trade) {
    case 'cloth': {
      // a pole on two forked posts before the front, bolts and lengths hanging: indigo, ochre, white, red
      const a = Math.max(x0 + 0.3, gx(side, 1.0)), b = Math.min(x1 - 0.3, gx(side, 3.6)), lo = Math.min(a, b), hi = Math.max(a, b);
      if (hi - lo > 1.2) {
        for (const px of [lo, hi]) { bag.add('wood_dark', box(px - 0.04, cf, z0 - 0.14, px + 0.04, cf + 1.8, z0 - 0.06)); }
        bag.add('wood_dark', box(lo, cf + 1.76, z0 - 0.14, hi, cf + 1.84, z0 - 0.06));
        for (let x = lo + 0.15, k = 0; x < hi - 0.2; x += 0.3, k++) bag.add(CLOTH[(k + o.seed) % CLOTH.length], box(x, cf + 0.7 + (k % 3) * 0.12, z0 - 0.12, x + 0.22, cf + 1.76, z0 - 0.1));
      }
      break;
    }
    case 'jars': case 'potter': for (let k = 0; k < 6; k++) { const x = gx(side, 1.0 + (k % 3) * 0.55), tier = Math.floor(k / 3); if (free(x)) jar(bag, k % 2 ? GL[k % 3] : 'pottery_dark', x, cf + tier * 0.4, z0 - 0.15 - tier * 0.05, 0.5, 0.17); } break;
    case 'ivory': for (let k = 0; k < 3; k++) { const x = gx(side, 1.2 + k * 0.28); if (free(x)) tusk(bag, [x, cf, z0 - 0.3], [x + 0.05, cf + 1.6 - k * 0.15, z0 - 0.04]); } break;
    case 'fisher': {
      // a net hung on pegs to dry, fish baskets, an oar
      const a = Math.max(x0 + 0.3, Math.min(gx(side, 1.0), gx(side, 3.2))), b = Math.min(x1 - 0.3, Math.max(gx(side, 1.0), gx(side, 3.2)));
      if (b - a > 1) { bag.add('rope_fibre', box(a, cf + 0.7, z0 - 0.07, b, cf + 1.9, z0 - 0.055)); for (const px of [a, b]) bag.add('wood_dark', box(px - 0.03, cf + 1.8, z0 - 0.12, px + 0.03, cf + 1.86, z0)); for (let x = a + 0.2; x < b - 0.1; x += 0.35) bag.add('wood_dark', box(x, cf + 0.65, z0 - 0.09, x + 0.05, cf + 0.72, z0 - 0.04)); }
      const P = []; beamTris(P, [gx(-side, 1.3), cf, z0 - 0.35], [gx(-side, 1.3), cf + 2.0, z0 - 0.06], 0.025, 0.02); bag.add('timber', fromTriangles(P));
      break;
    }
    case 'copra': for (let k = 0; k < 14; k++) { const x = gx(side, 1.0 + (k % 5) * 0.2), row = Math.floor(k / 5); if (free(x)) bag.add('palm_trunk', lathe([[0.001, 0], [0.08, 0.06], [0.1, 0.12], [0.07, 0.2], [0.001, 0.22]], 6, null, x, cf + row * 0.17, z0 - 0.2 - row * 0.06)); } break;
    case 'rope': for (let k = 0; k < 4; k++) { const x = gx(side, 1.0 + (k % 2) * 0.55); if (free(x)) coil(bag, x, cf + Math.floor(k / 2) * 0.15, z0 - 0.25, 0.28); } break;
    case 'cook': { const x = gx(side, 1.2); if (free(x)) { for (let k = 0; k < 3; k++) { const a = k * 2.094; bag.add('rubble', box(x + Math.cos(a) * 0.15 - 0.06, cf, z0 - 0.3 + Math.sin(a) * 0.15 - 0.06, x + Math.cos(a) * 0.15 + 0.06, cf + 0.12, z0 - 0.3 + Math.sin(a) * 0.15 + 0.06)); } bag.add('pottery_dark', lathe([[0.001, 0.12], [0.14, 0.14], [0.2, 0.26], [0.16, 0.36], [0.17, 0.38], [0.001, 0.38]], 9, null, x, cf, z0 - 0.3)); bag.add('timber', box(x + 0.35, cf, z0 - 0.38, x + 0.9, cf + 0.12, z0 - 0.3)); } break; }
    case 'water': for (let k = 0; k < 3; k++) { const x = gx(side, 1.0 + k * 0.5); if (free(x)) jar(bag, 'terracotta', x, cf, z0 - 0.18, 0.55, 0.2); } break;
    case 'carpenter': { const x = gx(side, 1.0); if (free(x, 1.0)) { for (let k = 0; k < 5; k++) bag.add('timber', box(x + k * 0.01, cf + k * 0.05, z0 - 0.5, x + 1.5, cf + k * 0.05 + 0.04, z0 - 0.5 + 0.2)); bag.add('timber', box(x, cf, z0 - 0.5, x + 0.1, cf + 0.45, z0 - 0.3)); } break; }
    default: if (rand() < 0.6) { const x = gx(rand() < 0.5 ? -1 : 1, 1.2 + rand() * 0.8); if (free(x)) jar(bag, rand() < 0.5 ? 'pottery_dark' : 'terracotta', x, cf, z0 - 0.18, 0.5, 0.18); }
  }
  void T; void yC;
}

/** A shelf on a wall: boards at heights with goods of the trade; wall at z = zw facing +z (the north wall of a room, goods toward +z), between xa and xb. */
function shelf(bag, rand, xa, xb, zw, fl, trade, n = 2) {
  for (let j = 0; j < n; j++) {
    const y = fl + 0.55 + j * 0.62;
    bag.add('wood_dark', box(xa, y, zw, xb, y + 0.04, zw + 0.32));
    for (const px of [xa + 0.1, xb - 0.1]) bag.add('wood_dark', box(px - 0.02, y - 0.25, zw, px + 0.02, y, zw + 0.3));
    for (let x = xa + 0.2; x < xb - 0.2; x += 0.34) {
      switch (trade) {
        case 'cloth': bag.add(CLOTH[Math.floor(rand() * CLOTH.length)], box(x, y + 0.04, zw + 0.03, x + 0.28, y + 0.24, zw + 0.3)); break;
        case 'jars': case 'potter': { const h = 0.3 + rand() * 0.08, m = rand() < 0.4 ? 'pottery_dark' : GL[Math.floor(rand() * 3)]; bag.add(m, box(x + 0.04, y + 0.04, zw + 0.09, x + 0.2, y + 0.04 + h * 0.7, zw + 0.25)); bag.add(m, box(x + 0.08, y + 0.04 + h * 0.7, zw + 0.13, x + 0.16, y + 0.04 + h, zw + 0.21)); break; }
        case 'spice': bag.add(rand() < 0.5 ? 'wicker' : 'sacking', box(x + 0.02, y + 0.04, zw + 0.06, x + 0.24, y + 0.17, zw + 0.28)); break;
        case 'beads': bag.add('wicker', box(x, y + 0.04, zw + 0.05, x + 0.26, y + 0.09, zw + 0.28)); bag.add(GL[Math.floor(rand() * 3)], box(x + 0.03, y + 0.09, zw + 0.08, x + 0.23, y + 0.12, zw + 0.25)); break;
        case 'rope': bag.add('rope_fibre', box(x + 0.03, y + 0.04, zw + 0.07, x + 0.23, y + 0.16, zw + 0.27)); break;
        case 'copra': bag.add('palm_trunk', box(x + 0.04, y + 0.04, zw + 0.09, x + 0.2, y + 0.2, zw + 0.25)); break;
        case 'ivory': bag.add('ivory', box(x + 0.02, y + 0.04, zw + 0.08, x + 0.26, y + 0.12, zw + 0.22)); break;
        default: bag.add('sacking', box(x, y + 0.04, zw + 0.05, x + 0.24, y + 0.2, zw + 0.27));
      }
    }
  }
}

/**
 * The front room's furnishing by trade (R0: the room's rect [x0, z0, x1, z1] from the court's door to the back door; W the house's
 * width). A shop (duka) has a counter across the room's middle with scales; a house has its chest and a hearth; every room has
 * its shelves along the long walls and the lamp.
 */
export function furnishFront(ctx, o, R0) {
  const { bag, col } = ctx, { fl, rand, trade, duka } = o, [rx0, rz0, rx1, rz1] = R0;
  const depth = rz1 - rz0;
  // shelves along the north wall (the court's side) where the door is not, and along the south wall's free stretch
  const doorU = o.frontDoorU;
  const spans = [[rx0 + 0.15, doorU[0] - 0.25], [doorU[1] + 0.25, rx1 - 0.15]].filter((s) => s[1] - s[0] > 0.9);
  for (const s of spans) shelf(bag, rand, s[0], Math.min(s[1], s[0] + 3.4), rz0, fl, duka ? trade : ['cloth', 'jars', 'spice', 'plain'][Math.floor(rand() * 4)], duka ? 3 : 2);
  if (duka) {
    // the counter: a low masonry block across a third of the room with a board top, scales (a beam on a post with two pans) and a coin box
    const cx = (rx0 + rx1) / 2 + (rand() - 0.5) * 2, cw = Math.min(2.6, (rx1 - rx0) * 0.4), cz = rz0 + depth * 0.55;
    bag.add('lime_plaster', box(cx - cw / 2, fl - 0.05, cz, cx + cw / 2, fl + 0.9, cz + 0.45)); col.rect([cx - cw / 2, cz, cx + cw / 2, cz + 0.45], fl, fl + 0.9);
    bag.add('timber', box(cx - cw / 2 - 0.04, fl + 0.9, cz - 0.04, cx + cw / 2 + 0.04, fl + 0.95, cz + 0.49));
    bag.add('iron', box(cx - 0.01, fl + 0.95, cz + 0.2, cx + 0.01, fl + 1.35, cz + 0.22)); bag.add('iron', box(cx - 0.3, fl + 1.34, cz + 0.2, cx + 0.3, fl + 1.36, cz + 0.22));
    for (const s of [-0.28, 0.28]) bag.add('bronze', lathe([[0.001, 0], [0.09, 0.02], [0.1, 0.035], [0.001, 0.02]], 8, null, cx + s, fl + 1.0, cz + 0.21));
    bag.add('wood_dark', box(cx + cw / 2 - 0.4, fl + 0.95, cz + 0.1, cx + cw / 2 - 0.15, fl + 1.08, cz + 0.32));
    // the goods heaped on the floor at the far end: sacks or jars of the trade
    const gx = rand() < 0.5 ? rx0 + 0.6 : rx1 - 0.6;
    for (let k = 0; k < 4; k++) { if (trade === 'jars' || trade === 'potter') jar(bag, GL[k % 3], gx + (k % 2) * 0.4, fl, rz1 - 0.4 - Math.floor(k / 2) * 0.4, 0.6, 0.2); else bag.add(k % 2 ? 'sacking' : 'wicker', box(gx - 0.2 + (k % 2) * 0.1, fl, rz1 - 0.7 + Math.floor(k / 2) * 0.1, gx + 0.35, fl + 0.5 + (k % 2) * 0.1, rz1 - 0.2)); }
  } else {
    // a chest of dark wood with iron bands (sanduku) against the far wall, and a stack of folded mats
    const cx = rand() < 0.5 ? rx0 + 0.9 : rx1 - 0.9;
    bag.add('wood_dark', box(cx - 0.45, fl, rz1 - 0.55, cx + 0.45, fl + 0.5, rz1 - 0.05)); col.rect([cx - 0.45, rz1 - 0.55, cx + 0.45, rz1 - 0.05], fl, fl + 0.5);
    for (const d of [-0.3, 0.3]) bag.add('iron', box(cx + d - 0.02, fl, rz1 - 0.555, cx + d + 0.02, fl + 0.5, rz1 - 0.05));
    bag.add('reed_mat', box(cx + 0.55, fl + 0.012, rz1 - 0.5, cx + 1.0, fl + 0.3, rz1 - 0.1));
  }
}

/** The inner room (ndani): the built sleeping platform (kitanda) with a mat and a cloth along the end wall, a water jar in the corner; its rect B0. */
export function furnishBack(ctx, o, B0) {
  const { bag, col } = ctx, { fl, rand } = o, [bx0, bz0, bx1, bz1] = B0;
  const w = Math.max(0.6, Math.min(1.3, bx1 - bx0 - 0.9)), x = bx1 - 0.05 - w;
  bag.add('lime_plaster', box(x, fl, bz0 + 0.1, x + w, fl + 0.42, bz1 - 0.1)); col.rect([x, bz0 + 0.1, x + w, bz1 - 0.1], fl, fl + 0.42);
  bag.add('reed_mat', box(x + 0.02, fl + 0.43, bz0 + 0.12, x + w - 0.02, fl + 0.45, bz1 - 0.12));
  bag.add(CLOTH[Math.floor(rand() * CLOTH.length)], box(x + 0.05, fl + 0.45, bz0 + 0.2, x + w - 0.05, fl + 0.5, bz0 + (bz1 - bz0) * 0.55));
  bag.add('cloth_white', box(x + 0.1, fl + 0.5, bz1 - 0.6, x + w - 0.1, fl + 0.58, bz1 - 0.25));
  jar(bag, 'terracotta', bx0 + 0.35, fl, bz0 + 0.35, 0.6, 0.2);
}

/** The court: a hearth of three stones with a pot and firewood, a mortar and pestle (kinu) for pounding grain, a coconut-shell heap. Court rect C. */
export function furnishCourt(ctx, o, C) {
  const { bag } = ctx, { cf, rand } = o, [cx0, cz0, cx1, cz1] = C;
  const hx = cx0 + 0.9 + rand() * Math.max(0.2, cx1 - cx0 - 1.8), hz = cz1 - 0.55;
  for (let k = 0; k < 3; k++) { const a = k * 2.094; bag.add('rubble', box(hx + Math.cos(a) * 0.14 - 0.06, cf, hz + Math.sin(a) * 0.14 - 0.06, hx + Math.cos(a) * 0.14 + 0.06, cf + 0.13, hz + Math.sin(a) * 0.14 + 0.06)); }
  bag.add('pottery_dark', lathe([[0.001, 0.13], [0.15, 0.15], [0.21, 0.28], [0.17, 0.4], [0.18, 0.42], [0.001, 0.42]], 9, null, hx, cf, hz));
  for (let k = 0; k < 4; k++) bag.add('wood_dark', box(hx + 0.35, cf + k * 0.045, hz - 0.12 + k * 0.03, hx + 0.95, cf + k * 0.045 + 0.04, hz - 0.08 + k * 0.03));
  const mx = hx + (hx > (cx0 + cx1) / 2 ? -1.6 : 1.6);
  bag.add('timber', lathe([[0.001, 0], [0.16, 0], [0.2, 0.2], [0.14, 0.55], [0.18, 0.6], [0.001, 0.6]], 8, null, mx, cf, hz));
  const P = []; beamTris(P, [mx + 0.05, cf + 0.5, hz], [mx + 0.45, cf + 1.4, hz + 0.1], 0.03, 0.04); bag.add('timber', fromTriangles(P));
}

// Orsanmichele about 1480 (docs/settlements/florence.md §4c): the guild church in the old grain
// loggia — a block of smooth pietraforte about 32.4 × 22.1 m and 40 m high in three storeys; the
// loggia's round arches (two on the short sides, three on the long) closed from 1367 with Gothic
// tracery of three lights over a low wall; above, a great two-light window of marble in every bay
// on both upper floors (the granary halls); the crown of trefoil arches on corbels (1404–06) under
// the low tiled roof. In the fourteen piers, the guilds' tabernacles: a podium, a niche between
// twisted colonnettes under a cusped arch, the gable with its crockets, a rose and a finial,
// pinnacles at the sides; the guild's roundel above (glazed terracotta or fresco). In them the
// patron saints as they stood about 1480 — in bronze Ghiberti's St John the Baptist (Calimala),
// St Matthew (Cambio) and St Stephen (Lana); in marble Donatello's St Mark and St George, Nanni di
// Banco's St Philip, St Eligius and the Four Crowned Saints, Lamberti's St James and St Luke,
// Brunelleschi's St Peter, the Madonna della Rosa — the Mercanzia's classical niche of Donatello
// empty between St Louis's removal and Verrocchio's Christ and St Thomas (set up in 1483), and the
// Arte della Seta's still without its St John (1515).
//
// Faces are built in their own frames and merged per material: Florence has no mesh to spare.

import { box, lathe, frustum, rod } from '../../core/geom.js';
import { faceFrame, Local, ext, archOutline, headPts, wrect, dropBack } from './face.js';
import { human } from '../greek/sculpture.js';
import { ball, limb, T } from '../qing/carving.js';

const PF = 'limestone_yellow', M = 'marble', G = 'verde_antico', PINK = 'marble_pink', O = 'opening', GL = 'stained_glass', R = 'roof_tile', BR = 'bronze', W = 'wood_dark';

// the saints, face by face, left to right seen from outside (docs/settlements/florence.md §4c)
const SAINTS = {
  e: ['john_baptist', 'mercanzia', 'luke'],
  n: ['peter', 'philip', 'four_crowned', 'george'],
  w: ['matthew', 'stephen', 'eligius'],
  s: ['seta', 'madonna', 'james', 'mark'],
};
const BRONZE = new Set(['john_baptist', 'matthew', 'stephen']);

/** A statue for a niche, at the origin facing +z: pieces by material. */
function statue(kind, Lc, x, y, z) {
  const mat = BRONZE.has(kind) ? BR : M, put = (g) => { g.translate(x, y, z); Lc.add(mat, g); };
  const fig = (o) => { const f = human({ n: 5, h: 2.05, ...o }); for (const g of [...f.stone, ...f.metal, ...f.skin]) put(g); };
  const book = (hx, hy) => put(box(hx - 0.14, hy - 0.2, 0.12, hx + 0.14, hy + 0.16, 0.24));
  switch (kind) {
    case 'john_baptist': fig({ pose: 'ease', drape: 'mantle', arms: { r: [[0.17, 0.66, 0.05], [0.12, 0.8, 0.14]] } }); put(rod([-0.33, 0.05, 0.12], [-0.33, 2.3, 0.12], 0.025, 5)); put(box(-0.48, 1.95, 0.1, -0.18, 2.0, 0.14)); break;          // the cross-staff
    case 'luke': fig({ pose: 'stand', drape: 'mantle', arms: { l: [[-0.16, 0.66, 0.06], [-0.08, 0.76, 0.15]] } }); book(-0.12, 1.55); break;
    case 'peter': fig({ pose: 'ease', drape: 'mantle', mirror: true, arms: { l: [[-0.17, 0.65, 0.05], [-0.1, 0.78, 0.14]] } }); for (const d of [-0.04, 0.04]) put(box(0.18 + d, 1.25, 0.24, 0.22 + d, 1.75, 0.28)); break;      // the keys
    case 'philip': fig({ pose: 'ease', drape: 'mantle', lean: 4 }); break;
    case 'george': fig({ pose: 'stand', drape: 'chiton', shield: 'l', arms: { l: [[-0.13, 0.62, 0.1], [-0.05, 0.55, 0.2]] } }); put(box(-0.28, 0.35, 0.33, 0.12, 1.25, 0.38)); break;                                // the long shield before him
    case 'four_crowned': for (const [dx, dz, m, k] of [[-0.75, -0.05, false, 0], [-0.25, 0.08, true, 1], [0.25, 0.08, false, 2], [0.75, -0.05, true, 3]]) { const f = human({ n: 5, h: 1.85, pose: k % 2 ? 'ease' : 'stand', drape: 'mantle', mirror: m, lean: (k - 1.5) * 2 }); for (const g of [...f.stone, ...f.skin]) { g.rotateY(-dx * 0.25); g.translate(dx, 0, dz); put(g); } } break;
    case 'matthew': fig({ pose: 'stand', drape: 'mantle', arms: { r: [[0.15, 0.64, 0.08], [0.06, 0.74, 0.16]] } }); book(0.08, 1.48); break;
    case 'stephen': fig({ pose: 'ease', drape: 'mantle', mirror: true, arms: { l: [[-0.15, 0.64, 0.08], [-0.05, 0.73, 0.16]] } }); book(-0.08, 1.46); break;
    case 'eligius': fig({ pose: 'stand', drape: 'mantle', arms: { r: [[0.16, 0.66, 0.04], [0.2, 0.86, 0.1]] } }); put(rod([0.42, 0.05, 0.2], [0.42, 2.35, 0.2], 0.03, 5)); put(lathe([[0.04, 0], [0.09, 0.08], [0.06, 0.2], [0.001, 0.26]], 6, null, 0.42, 2.35, 0.2)); break;   // the crozier
    case 'madonna': { fig({ pose: 'stand', drape: 'peplos', arms: { l: [[-0.13, 0.64, 0.07], [-0.02, 0.7, 0.16]], r: [[0.14, 0.63, 0.06], [0.1, 0.56, 0.15]] } }); put(limb([-0.12, 1.3, 0.16], [0.05, 1.55, 0.16], 0.09, 0.07, 6)); put(T(ball(0.08, 0.09, 0.08, 6, 4), 0.08, 1.63, 0.16)); put(T(ball(0.05, 0.05, 0.05, 5, 3), 0.18, 1.18, 0.2)); break; }   // the Child on her arm, the rose in her hand
    case 'james': fig({ pose: 'ease', drape: 'mantle', arms: { r: [[0.16, 0.66, 0.04], [0.19, 0.84, 0.1]] } }); put(rod([0.39, 0.05, 0.17], [0.39, 2.0, 0.17], 0.03, 5)); book(-0.2, 1.0); break;               // the pilgrim's staff
    case 'mark': fig({ pose: 'ease', drape: 'mantle', lean: -3, arms: { l: [[-0.16, 0.62, 0.06], [-0.12, 0.6, 0.17]] } }); book(-0.24, 1.22); break;
    default: break;                                                                        // an empty niche
  }
}

/** A Gothic tabernacle on the face at u, its niche floor at yn, w wide: podium, twisted colonnettes, cusped arch, gable, pinnacles, the roundel above. */
function tabernacle(Lc, u, yn, w, kind) {
  const hn = 3.5, d = 0.62, cr = 0.13, ys = yn + hn - 0.15 - w * 0.866;
  // the podium: a block with a moulded top and a framed panel (the guild's relief)
  Lc.box(M, u - w / 2 - 0.35, 0.45, 0, u + w / 2 + 0.35, yn - 0.25, d - 0.05);
  Lc.box(M, u - w / 2 - 0.45, yn - 0.25, 0, u + w / 2 + 0.45, yn, d + 0.1);
  Lc.box(G, u - w / 2, 1.0, d - 0.05, u + w / 2, 1.08, d); Lc.box(G, u - w / 2, yn - 0.8, d - 0.05, u + w / 2, yn - 0.72, d);
  Lc.box(G, u - w / 2, 1.08, d - 0.05, u - w / 2 + 0.08, yn - 0.8, d); Lc.box(G, u + w / 2 - 0.08, 1.08, d - 0.05, u + w / 2, yn - 0.8, d);
  Lc.box(PINK, u - w / 2 + 0.2, 1.25, d - 0.05, u + w / 2 - 0.2, yn - 0.97, d - 0.02);
  // the niche: its back of coloured marble, its sides, its ceiling (the arch is in front of it)
  Lc.box(kind === 'madonna' || kind === 'four_crowned' ? G : PINK, u - w / 2, yn, 0, u + w / 2, yn + hn, 0.02);
  for (const sg of [-1, 1]) Lc.box(M, u + sg * w / 2 - (sg > 0 ? 0 : 0.18), yn, 0, u + sg * w / 2 + (sg > 0 ? 0.18 : 0), yn + hn, d - 0.12);
  Lc.box(M, u - w / 2, yn + hn - 0.05, 0, u + w / 2, yn + hn + 0.15, d - 0.12);
  // the twisted colonnettes and their pinnacles; the cusped (trefoil) arch between them
  for (const sg of [-1, 1]) {
    const cu = u + sg * (w / 2 + 0.12);
    Lc.add(M, lathe([[cr * 1.5, 0], [cr * 1.5, 0.18], [cr, 0.3], ...Array.from({ length: 5 }, (_, j) => [cr, 0.3 + (hn - 0.75) * (j + 1) / 5]), [cr * 1.6, hn - 0.3], [cr * 1.7, hn - 0.2]], 6, (th, j) => (j > 2 && j < 8 ? 1 + 0.22 * Math.cos(th * 2 + j * 1.5) : 1), cu, yn, d - 0.15));
    Lc.box(M, cu - 0.22, yn + hn - 0.2, d - 0.37, cu + 0.22, yn + hn + 1.6, d + 0.07);
    Lc.add(M, lathe([[0.2, 0], [0.001, 1.5]], 4, null, cu, yn + hn + 1.6, d - 0.15));
    for (let k = 0; k < 3; k++) Lc.add(M, lathe([[0.07, 0], [0.001, 0.16]], 4, null, cu + sg * 0.09, yn + hn + 1.75 + k * 0.45, d - 0.15));
  }
  const W2 = w / 2 + 0.18, top = yn + hn + 0.15;
  Lc.add(M, ext([[u + W2, top], [u - W2, top], [u - W2, ys], ...headPts(u, ys, w, 'trefoil', 7).reverse(), [u + W2, ys]], [], d - 0.2, d - 0.04));
  // the gable: its field, a rose of green in it, crockets along the rakes, the finial
  const gy = yn + hn + 0.15, gw = w / 2 + 0.3, gh = gw * 1.25;
  Lc.add(M, ext([[u - gw, gy], [u + gw, gy], [u, gy + gh]], [], d - 0.3, d - 0.08));
  const rose = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, rr = 0.3 * (0.75 + 0.25 * Math.abs(Math.cos(3 * a))); rose.push([u + Math.cos(a) * rr, gy + gh * 0.38 + Math.sin(a) * rr]); }
  Lc.add(G, ext(rose, [], d - 0.08, d - 0.04));
  for (const sg of [-1, 1]) for (let k = 1; k <= 3; k++) { const t = k / 4; Lc.add(M, T(ball(0.09, 0.07, 0.07, 5, 3), u + sg * gw * (1 - t), gy + gh * t + 0.06, d - 0.19)); }
  Lc.add(M, lathe([[0.12, 0], [0.16, 0.2], [0.06, 0.35], [0.11, 0.5], [0.001, 0.75]], 6, null, u, gy + gh - 0.05, d - 0.19));
  // the guild's roundel high on the pier
  const ry = gy + gh + 1.4, ring = []; for (let i = 0; i < 12; i++) { const a = -i / 12 * Math.PI * 2; ring.push([u + Math.cos(a) * 0.62, ry + Math.sin(a) * 0.62]); }
  Lc.add(M, ext(ring.map(([p, q]) => [u + (p - u) * 1.25, ry + (q - ry) * 1.25]).reverse(), [ring], 0, 0.1));
  Lc.add(kind.length % 2 ? G : PINK, ext(ring, [], 0, 0.05));
  Lc.box(M, u - 0.28, ry - 0.06, 0.05, u + 0.28, ry + 0.06, 0.08); Lc.box(M, u - 0.06, ry - 0.28, 0.05, u + 0.06, ry + 0.28, 0.08);
  statue(kind, Lc, u, yn, 0.2);
}
/** Donatello's classical niche (the Mercanzia's, 1423): fluted pilasters, the shell, the architrave and pediment. */
function classicalNiche(Lc, u, yn, w) {
  const hn = 3.5, d = 0.6;
  Lc.box(M, u - w / 2 - 0.4, 0.45, 0, u + w / 2 + 0.4, yn - 0.25, d - 0.05);
  Lc.box(M, u - w / 2 - 0.5, yn - 0.25, 0, u + w / 2 + 0.5, yn, d + 0.08);
  Lc.box(PINK, u - w / 2, yn, 0, u + w / 2, yn + hn, 0.02);
  for (const sg of [-1, 1]) {
    const pu = u + sg * (w / 2 + 0.22);
    Lc.box(M, pu - 0.25, yn, 0, pu + 0.25, yn + hn + 0.2, d - 0.2);
    for (let f = -2; f <= 2; f++) Lc.box(M, pu + f * 0.09 - 0.025, yn + 0.3, d - 0.2, pu + f * 0.09 + 0.025, yn + hn - 0.15, d - 0.16);
    Lc.box(M, pu - 0.3, yn + hn - 0.1, 0, pu + 0.3, yn + hn + 0.2, d - 0.12);
  }
  // the shell in the head of the niche: ribs radiating from below
  const ys = yn + hn - w / 2;
  Lc.add(M, ext(headPts(u, ys, w, 'round', 8).concat([[u - w / 2, yn + hn + 0.2], [u + w / 2, yn + hn + 0.2]]).reverse(), [], 0.02, 0.1));
  for (let k = 0; k < 9; k++) { const a = Math.PI * (k + 0.5) / 9; Lc.add(M, rod([u, ys, 0.12], [u + Math.cos(a) * w * 0.46, ys + Math.sin(a) * w * 0.46, 0.12], 0.04, 4)); }
  for (const sg of [-1, 1]) Lc.box(M, u + sg * w / 2 - (sg > 0 ? 0.1 : 0), yn, 0, u + sg * w / 2 + (sg < 0 ? 0.1 : 0), ys, d - 0.25);
  Lc.box(M, u - w / 2 - 0.55, yn + hn + 0.2, 0, u + w / 2 + 0.55, yn + hn + 0.75, d);
  Lc.add(M, ext([[u - w / 2 - 0.65, yn + hn + 0.75], [u + w / 2 + 0.65, yn + hn + 0.75], [u, yn + hn + 1.75]], [[[u - w / 2 - 0.2, yn + hn + 0.9], [u, yn + hn + 1.5], [u + w / 2 + 0.2, yn + hn + 0.9]]], 0, d));
  Lc.add(G, ext([[u - w / 2 - 0.2, yn + hn + 0.9], [u + w / 2 + 0.2, yn + hn + 0.9], [u, yn + hn + 1.5]], [], 0, 0.1));
}

/** A great two-light window of marble under a round arch, centred at uc, sill at s, light height hl, width w; set in the hole of a wall from d0 to 0. */
function bifora(Lc, uc, s, w, hl, d0) {
  const ys = s + hl, r = w / 2, lw = w / 2 - 0.25;
  Lc.add(O, ext(archOutline(uc, s, w, ys, 'round', 6), [], d0 + 0.01, d0 + 0.04));
  // the tympanum with the two pointed, cusped heads of the lights and a rose
  const rose = []; for (let i = 0; i < 12; i++) { const a = -i / 12 * Math.PI * 2; rose.push([uc + Math.cos(a) * r * 0.27, ys + r * 0.62 + Math.sin(a) * r * 0.27]); }
  Lc.add(M, ext(headPts(uc, ys - 0.05, w, 'round', 6).concat([[uc - r, ys - 0.7], [uc + r, ys - 0.7]]), [archOutline(uc - lw / 2 - 0.1, ys - 0.6, lw, ys - 0.45, 'trefoil', 5), archOutline(uc + lw / 2 + 0.1, ys - 0.6, lw, ys - 0.45, 'trefoil', 5), rose], d0 + 0.2, d0 + 0.38));
  Lc.add(M, lathe([[0.16, 0], [0.12, 0.25], [0.11, hl - 0.85], [0.18, hl - 0.6]], 8, null, uc, s, d0 + 0.29));
  Lc.box(M, uc - r - 0.05, s - 0.18, d0, uc + r + 0.05, s, 0.25);
  for (const sg of [-1, 1]) Lc.box(M, uc + sg * r - (sg > 0 ? 0.22 : 0), s, d0 + 0.2, uc + sg * r + (sg < 0 ? 0.22 : 0), ys - 0.05, d0 + 0.38);
}

/** orsanmichele: { rect, h (to the top of the crown), y } — the long sides north and south. */
export function orsanmichele(el, { bag, col }) {
  const rect = el.rect, [x0, z0, x1, z1] = rect, y = el.y ?? 0, h = el.h ?? 39.5, T0 = 0.8;
  const yG = 14.5, yF = 26.2, yC = h - 2.4;
  bag.add(PF, box(x0 + T0, y - 0.5, z0 + T0, x1 - T0, y + h, z1 - T0)); col.rect(rect, y, y + h);
  bag.add(R, frustum([x0 - 0.9, z0 - 0.9, x1 + 0.9, z1 + 0.9], y + h + 0.35, y + h + 3.6, (x1 - x0) / 2 - 3, (x1 - x0) / 2 - 3, (z1 - z0) / 2 + 0.9 - 0.5, (z1 - z0) / 2 + 0.9 - 0.5));
  for (const f of 'nsew') {
    const { M: FM, L } = faceFrame(rect, f, y), Lc = new Local(), saints = SAINTS[f], nb = saints.length - 1, P = 3.6, bw = (L - P) / nb, aw = bw - P;
    const pierU = (i) => P / 2 + i * bw;
    Lc.noBack = true; Lc.L = L;
    // ── the ground storey: the wall with the loggia's arches, the tracery in them over a low wall
    const ysA = 8.3, holes = [];
    for (let b = 0; b < nb; b++) holes.push(archOutline(P + b * bw + aw / 2, 0, aw, ysA, 'round', 7));
    Lc.add(PF, dropBack(ext([[-0.02, -0.5], [L + 0.02, -0.5], [L + 0.02, yG], [-0.02, yG]], holes, -T0, 0)));
    for (let b = 0; b < nb; b++) {
      const uc = P + b * bw + aw / 2, r = aw / 2, yw = 4.2, door = (f === 'e' && b === 0) || (f === 's' && b === 1);
      Lc.box(PF, uc - r - 0.02, -0.5, -T0, uc + r + 0.02, yw, -0.45);                       // the low wall closing the arch
      if (door) {
        Lc.box(O, uc - 1.0, 0.0, -0.46, uc + 1.0, 3.2, -0.44); Lc.box(W, uc - 0.95, 0.02, -0.44, uc + 0.95, 3.1, -0.38);
        Lc.box(M, uc - 1.25, 0.0, -0.46, uc - 1.0, 3.45, -0.3); Lc.box(M, uc + 1.0, 0.0, -0.46, uc + 1.25, 3.45, -0.3); Lc.box(M, uc - 1.35, 3.2, -0.46, uc + 1.35, 3.6, -0.25);
      }
      Lc.box(M, uc - r - 0.02, yw - 0.12, -0.5, uc + r + 0.02, yw + 0.1, -0.3);              // the sill of the tracery
      // three lights with cusped heads, two mullions, two quatrefoils and an oculus in the head; the glass behind
      Lc.add(GL, ext(archOutline(uc, yw + 0.1, aw, ysA, 'round', 7), [], -0.62, -0.6));
      const lw = (aw - 0.5) / 3, lights = [-1, 0, 1].map((k) => archOutline(uc + k * (lw + 0.15), yw + 0.12, lw, ysA - 0.2 + (k ? 0 : 0.4), 'trefoil', 5));
      const quat = (qu, qy, qr) => { const p = []; for (let i = 0; i < 12; i++) { const a = -i / 12 * Math.PI * 2, rr = qr * (0.72 + 0.28 * Math.abs(Math.cos(2 * a))); p.push([qu + Math.cos(a) * rr, qy + Math.sin(a) * rr]); } return p; };
      Lc.add(M, ext(archOutline(uc, yw + 0.1, aw + 0.02, ysA, 'round', 7), [...lights, quat(uc - r * 0.42, ysA + r * 0.58, r * 0.16), quat(uc + r * 0.42, ysA + r * 0.58, r * 0.16), quat(uc, ysA + r * 0.8, r * 0.13)], -0.6, -0.45));
      for (const k of [-0.5, 0.5]) Lc.add(M, lathe([[0.1, 0], [0.08, 0.15], [0.07, ysA - yw - 0.4], [0.13, ysA - yw - 0.2]], 6, null, uc + k * (lw + 0.15), yw + 0.1, -0.42));
      // the moulded archivolt round the arch
      Lc.add(M, ext(headPts(uc, ysA, aw + 0.5, 'round', 7).concat(headPts(uc, ysA, aw, 'round', 7).reverse()), [], 0, 0.12));
    }
    for (let i = 0; i <= nb; i++) { const u = pierU(i); Lc.box(PF, Math.max(-0.3, u - P / 2 - 0.1), -0.5, 0, Math.min(L + 0.3, u + P / 2 + 0.1), 0.45, 0.3); }   // the plinth of the piers (the bench along the street)
    Lc.box(PF, -0.25, yG - 0.45, 0, L + 0.25, yG, 0.32);                                     // the string course over the loggia
    // ── the tabernacles in the piers
    saints.forEach((kind, i) => {
      const u = pierU(i), wN = kind === 'four_crowned' ? 2.5 : 1.8, yn = 2.9;
      if (kind === 'mercanzia') classicalNiche(Lc, u, yn, wN); else tabernacle(Lc, u, yn, wN, kind);
    });
    // ── the upper storeys: the wall with a great window in every bay, string courses, the crown of trefoil arches
    for (const [s0, s1, hl] of [[yG, yF, 6.2], [yF, yC, 6.0]]) {
      const wh = [];
      for (let b = 0; b < nb; b++) wh.push(archOutline(P + b * bw + aw / 2, s0 + 1.6, 3.4, s0 + 1.6 + hl, 'round', 6));
      Lc.add(PF, dropBack(ext([[-0.02, s0], [L + 0.02, s0], [L + 0.02, s1], [-0.02, s1]], wh, -T0, 0)));
      for (let b = 0; b < nb; b++) bifora(Lc, P + b * bw + aw / 2, s0 + 1.6, 3.4, hl, -T0);
      if (s1 < yC) Lc.box(PF, -0.25, s1 - 0.4, 0, L + 0.25, s1, 0.3);
      // the corner pilasters, a little proud
      for (const cu of [0, L - 0.9]) Lc.box(PF, cu - 0.02, s0, 0, cu + 0.92, s1, 0.12);
    }
    // the crown: corbels, trefoil arches between them, the eaves
    const nc = Math.round(L / 1.35), cs = L / nc;
    Lc.box(PF, -0.3, yC, -T0, L + 0.3, yC + 0.25, 0.25);
    for (let k = 0; k <= nc; k++) { const u = Math.min(L - 0.15, Math.max(0.15, k * cs)); Lc.box(PF, u - 0.16, yC + 0.25, 0, u + 0.16, yC + 1.5, 0.5); }
    const ch = []; for (let k = 0; k < nc; k++) ch.push(archOutline((k + 0.5) * cs, yC + 0.32, cs - 0.42, yC + 1.2, 'round', 3));
    Lc.add(PF, ext([[-0.3, yC + 0.25], [L + 0.3, yC + 0.25], [L + 0.3, h + 0.35], [-0.3, h + 0.35]], ch, 0.35, 0.55));
    Lc.add(O, ext([[0, yC + 0.25], [L, yC + 0.25], [L, yC + 2.0], [0, yC + 2.0]], [], 0.3, 0.32));
    Lc.box(PF, -0.5, h + 0.1, -T0, L + 0.5, h + 0.35, 0.85);
    Lc.emit(bag, FM);
    // the tabernacles stand out of the piers: obstacles
    saints.forEach((_, i) => col.rect(wrect(FM, pierU(i) - 1.6, 0, pierU(i) + 1.6, 0.75), y, y + 2.9));
  }
}

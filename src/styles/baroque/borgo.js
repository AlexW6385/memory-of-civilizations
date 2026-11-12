// The streets of Baroque Rome (docs/settlements/baroque-rome.md §5, "The Borgo's fronts"): rows of
// palazzi and narrow houses on the Borgo Nuovo and Borgo Vecchio. A palazzo: the rusticated base with
// its round portal and the balcony above it on corbels, kneeling windows with iron grilles, the
// mezzanine; the piano nobile's windows under triangular and segmental pediments; the plainer upper
// storeys; the modillion cornice; the roof loggia (altana). A house: the bottega with its folding
// shutters and its counter of goods, the door to the stair, the shuttered windows with their pots,
// the madonnella with its lantern, the hanging sign. A wall fountain in a travertine niche. Laundry
// across the alleys. Some botteghe can be entered. Each row is built in its own face frame (u along,
// y up, d out); the units are listed by layout.js.

import { box, lathe, frustum, clothBox, addCloth } from '../../core/geom.js';
import { faceFrame, Local, ext, archOutline, voussoirs, wrect, toW } from '../renaissance/face.js';

const T = 'travertine';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const WALLS = ['stucco_ochre', 'stucco_rome', 'stucco_rose', 'stucco_cream', 'stucco_siena', 'stucco_ochre', 'stucco_rome'];
const SHUT = ['shutter_green', 'shutter_brown', 'shutter_green', 'shutter_grey'];
const LINEN = ['cloth_white', 'cloth_white', 'cloth_ochre', 'cloth_blue', 'cloth_white', 'cloth_red', 'cloth_grey'];

/** Storey heights of a palazzo and of a house (m), from the ground storey up. */
export const PALAZZO_STOREYS = [5.0, 5.4, 4.6, 3.4];
export const CASA_STOREYS = [3.9, 3.4, 3.2, 2.9];
export const unitHeight = (kind, storeys) => (kind === 'palazzo' ? PALAZZO_STOREYS : CASA_STOREYS).slice(0, storeys).reduce((a, b) => a + b, 0);

/** An arched or rectangular opening's outline for ext(): width w centred at uc from y0 to y1 (the arch springing w/2 below y1 when round). */
const openingPts = (uc, y0, y1, w, round) => (round ? archOutline(uc, y0, w, y1 - w / 2, 'round', 8) : [[uc - w / 2, y0], [uc + w / 2, y0], [uc + w / 2, y1], [uc - w / 2, y1]]);

// ── pieces ───────────────────────────────────────────────────────────────────

/** A window: frame, sill, shutters (open against the wall, or closed), the dark opening; round/pediment heads by `head`. */
function window(L, uc, y0, w, h, o) {
  const { head = 'flat', shut, rand, bracket = false, frame = T, glass = true } = o;
  L.box('opening', uc - w / 2, y0, -0.02, uc + w / 2, y0 + h, 0.03);
  const f = Math.min(0.2, w * 0.18);
  L.box(frame, uc - w / 2 - f, y0 - 0.02, -0.02, uc - w / 2, y0 + h + 0.02, 0.13); L.box(frame, uc + w / 2, y0 - 0.02, -0.02, uc + w / 2 + f, y0 + h + 0.02, 0.13);
  L.box(frame, uc - w / 2 - f, y0 + h, -0.02, uc + w / 2 + f, y0 + h + f, 0.15);
  L.box(frame, uc - w / 2 - f - 0.1, y0 - 0.16, -0.02, uc + w / 2 + f + 0.1, y0 - 0.02, 0.26);   // the sill
  if (rand() < 0.55) { const sl = 0.5 + rand() * 1.0; L.box('plaster_streak', uc - w / 2 - 0.02, y0 - 0.16 - sl, 0.014, uc - w / 2 + 0.12, y0 - 0.16, 0.026); if (rand() < 0.5) L.box('plaster_streak', uc + w / 2 - 0.1, y0 - 0.16 - sl * 0.7, 0.014, uc + w / 2 + 0.03, y0 - 0.16, 0.026); }   // the rain's streaks under the sill
  if (bracket) for (const s of [-1, 1]) { L.box(frame, uc + s * (w / 2 - 0.1) - 0.1, y0 - 0.9, -0.02, uc + s * (w / 2 - 0.1) + 0.1, y0 - 0.16, 0.2); L.box(frame, uc + s * (w / 2 + 0.02) - 0.13, y0 - 0.32, -0.02, uc + s * (w / 2 + 0.02) + 0.13, y0 - 0.16, 0.22); }
  const yh = y0 + h + f;
  if (head === 'tri') {
    L.add(frame, ext([[uc - w / 2 - f - 0.2, yh], [uc + w / 2 + f + 0.2, yh], [uc, yh + (w / 2 + f + 0.2) * 0.42]], [], 0, 0.2, 1));
    L.box(frame, uc - w / 2 - f - 0.25, yh, -0.02, uc + w / 2 + f + 0.25, yh + 0.1, 0.28);
  } else if (head === 'seg') {
    const r = w / 2 + f + 0.2, pts = [[uc - r, yh]]; for (let i = 0; i <= 10; i++) { const a = Math.PI - Math.PI * 0.62 * 0 - i / 10 * Math.PI; pts.push([uc + Math.cos(a) * r, yh + Math.sin(a) * r * 0.36]); }
    L.add(frame, ext(pts, [], 0, 0.2, 1)); L.box(frame, uc - r - 0.05, yh, -0.02, uc + r + 0.05, yh + 0.1, 0.28);
  } else if (head === 'cornice') L.box(frame, uc - w / 2 - f - 0.2, yh, -0.02, uc + w / 2 + f + 0.2, yh + 0.2, 0.3);
  if (!shut) return;
  const sm = shut, ww = w / 2 - 0.03;
  if (o.closed) {
    // closed: the two leaves across the opening with the joint between, a bolt
    L.box(sm, uc - w / 2 + 0.03, y0 + 0.02, 0.02, uc - 0.015, y0 + h - 0.02, 0.07); L.box(sm, uc + 0.015, y0 + 0.02, 0.02, uc + w / 2 - 0.03, y0 + h - 0.02, 0.07);
    for (let k = 1; k < 5; k++) { const yy = y0 + h * k / 5; L.box('opening', uc - w / 2 + 0.05, yy - 0.012, 0.07, uc - 0.04, yy + 0.012, 0.075); L.box('opening', uc + 0.04, yy - 0.012, 0.07, uc + w / 2 - 0.05, yy + 0.012, 0.075); }
  } else {
    // open: a leaf folded back against the wall at each side, a little off the plane
    for (const s of [-1, 1]) { const a = uc + s * (w / 2 + f + 0.03), b = uc + s * (w / 2 + f + 0.03 + ww); L.box(sm, Math.min(a, b), y0, 0.1, Math.max(a, b), y0 + h, 0.15); }
    if (glass && rand() < 0.6) L.box('lamp_white', uc - w / 2 + 0.03, y0 + 0.05, 0.031, uc + w / 2 - 0.03, y0 + h - 0.05, 0.034);
  }
}

/** An iron balcony on two corbels: width w, depth d, floor at y; the balustrade with its bars. */
function balcony(L, uc, y, w, d, h = 0.95) {
  L.box(T, uc - w / 2, y - 0.2, 0, uc + w / 2, y, d);
  for (const s of [-1, 1]) { L.box(T, uc + s * (w / 2 - 0.35) - 0.17, y - 0.9, 0, uc + s * (w / 2 - 0.35) + 0.17, y - 0.2, 0.24); L.box(T, uc + s * (w / 2 - 0.35) - 0.12, y - 0.9, 0.24, uc + s * (w / 2 - 0.35) + 0.12, y - 0.6, 0.5); L.box(T, uc + s * (w / 2 - 0.35) - 0.12, y - 0.6, 0.24, uc + s * (w / 2 - 0.35) + 0.12, y - 0.2, d * 0.8); }
  const x0 = uc - w / 2 + 0.03, x1 = uc + w / 2 - 0.03, d1 = d - 0.04;
  L.box('iron', x0, y + h - 0.04, 0.04, x1, y + h, d1); L.box('iron', x0, y + 0.02, 0.04, x1, y + 0.08, d1);
  const n = Math.max(2, Math.round((x1 - x0) / 0.15));
  for (let i = 0; i <= n; i++) { const u = x0 + (x1 - x0) * i / n; L.box('iron', u - 0.012, y + 0.08, d1 - 0.02, u + 0.012, y + h - 0.04, d1); }
  for (const e of [x0, x1]) { const dn = Math.max(2, Math.round(d1 / 0.15)); L.box('iron', e - 0.015, y + 0.02, 0.04, e + 0.015, y + h, 0.04 + 0.03); L.box('iron', e - 0.012, y + 0.08, 0.04, e + 0.012, y + h - 0.04, d1); void dn; }
}

/** A pot of flowers (terracotta with a leafy head) on a sill or a rail at (u, y, d). */
function pot(L, u, y, d, r = 0.12) { L.add('terracotta', lathe([[r * 0.7, 0], [r, 0.1], [r * 1.05, 0.2], [r * 0.9, 0.22], [0.001, 0.22]], 7, null, u, y, d)); L.add('glaze_green', lathe([[0.001, 0.2], [r * 1.3, 0.3], [r * 1.2, 0.42], [r * 0.6, 0.52], [0.001, 0.55]], 7, null, u, y, d)); }

/** The madonnella: a niche of travertine with a pediment, the painted Virgin in blue and a halo, a shelf of flowers and a lantern on an iron bracket. */
function madonnella(L, uc, y, rand) {
  const w = 0.62, h = 1.0;
  L.box('wood_painted', uc - w / 2 - 0.1, y - 0.12, -0.02, uc + w / 2 + 0.1, y + h + 0.06, 0.12);            // the framed field
  L.box('paint_blue', uc - w / 2, y, 0.12, uc + w / 2, y + h, 0.135);
  L.add('skin_light', lathe([[0.001, 0], [0.05, 0.03], [0.06, 0.08], [0.04, 0.13], [0.001, 0.14]], 8, null, uc, y + 0.58, 0.155));
  L.add('cloth_blue', lathe([[0.17, 0], [0.13, 0.22], [0.08, 0.45], [0.001, 0.5]].map(([r, v]) => [r, v * 0.62]), 8, null, uc, y + 0.1, 0.16));
  const halo = lathe([[0.2, 0], [0.2, 0.012], [0.17, 0.012], [0.17, 0]], 14, null, 0, 0, 0); halo.rotateX(Math.PI / 2); halo.translate(uc, y + 0.66, 0.145); L.add('gilt_bronze', halo);
  L.add(T, ext([[uc - w / 2 - 0.2, y + h + 0.06], [uc + w / 2 + 0.2, y + h + 0.06], [uc, y + h + 0.06 + 0.3]], [], 0, 0.26, 1));
  L.box(T, uc - w / 2 - 0.22, y - 0.2, -0.02, uc + w / 2 + 0.22, y - 0.12, 0.34);                         // the shelf
  pot(L, uc - 0.22, y - 0.12, 0.2, 0.07); pot(L, uc + 0.22, y - 0.12, 0.2, 0.07);
  L.add('flame', lathe([[0.001, 0], [0.025, 0.03], [0.001, 0.09]], 5, null, uc, y - 0.12, 0.2));
  // the lantern on its bracket, over the shelf's side
  const lu = uc + w / 2 + 0.55;
  L.box('iron', uc + w / 2 + 0.2, y + h - 0.1, 0.02, lu + 0.02, y + h - 0.085, 0.06); L.box('iron', lu, y + h - 0.1, 0.02, lu + 0.02, y + h - 0.085, 0.5);
  L.box('iron', lu - 0.08, y + h - 0.55, 0.4, lu + 0.1, y + h - 0.5, 0.58); L.box('lamp_glass', lu - 0.07, y + h - 0.5, 0.41, lu + 0.09, y + h - 0.2, 0.57); L.box('iron', lu - 0.1, y + h - 0.2, 0.38, lu + 0.12, y + h - 0.16, 0.6);
  void rand;
}

/** The goods before a bottega: what the trade sells, on the folded-down counter board and hung above. */
function goods(L, uc, w, y, trade, rand) {
  const row = (n, f) => { for (let i = 0; i < n; i++) f(uc - w / 2 + 0.25 + (w - 0.5) * (i + 0.5) / n, i); };
  if (trade === 'grocer') {
    row(4, (u, i) => L.add('limestone_yellow', lathe([[0.001, 0], [0.17, 0], [0.17, 0.11], [0.001, 0.11]], 10, null, u, y, 0.34)));                       // cheeses
    row(3, (u) => L.add('terracotta', lathe([[0.09, 0], [0.14, 0.15], [0.1, 0.3], [0.07, 0.34], [0.001, 0.34]], 8, null, u, y, 0.6)));
    for (let i = 0; i < 6; i++) { const u = uc - w / 2 + 0.4 + (w - 0.8) * (i + 0.5) / 6; L.add(i % 2 ? 'hide_tan' : 'hide_brown', lathe([[0.001, 0], [0.07, 0.1], [0.08, 0.3], [0.05, 0.46], [0.001, 0.5]], 7, null, u, y + 2.05 - 0.5, 0.2)); L.box('iron', u - 0.005, y + 2.05, 0.19, u + 0.005, y + 2.35, 0.21); }   // hams on their hooks
  } else if (trade === 'baker') {
    row(5, (u) => L.add('hide_tan', lathe([[0.001, 0], [0.13, 0.02], [0.14, 0.08], [0.1, 0.13], [0.001, 0.14]], 8, null, u, y, 0.36)));
    row(4, (u) => { L.box('wicker', u - 0.17, y, 0.55, u + 0.17, y + 0.2, 0.8); });
  } else if (trade === 'cloth') {
    row(5, (u, i) => { const g = lathe([[0.001, 0], [0.09, 0], [0.09, 0.42], [0.001, 0.42]], 8, null, 0, 0, 0); g.rotateZ(Math.PI / 2); g.translate(u - 0.21, y + 0.09, 0.4); L.add(['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_green', 'cloth_white'][i % 5], g); });
    for (let i = 0; i < 3; i++) { const u = uc - w / 2 + 0.5 + (w - 1) * (i + 0.5) / 3; L.box(['cloth_indigo', 'cloth_maroon', 'cloth_ochre'][i], u - 0.2, y + 1.2, 0.04, u + 0.2, y + 2.3, 0.07); }   // lengths hung from the lintel
  } else if (trade === 'wine') {
    row(4, (u) => { const b = lathe([[0.3, 0], [0.34, 0.3], [0.3, 0.6], [0.001, 0.6]], 12, null, 0, 0, 0); b.rotateX(Math.PI / 2); b.translate(u, y + 0.34, 0.5); L.add('timber', b); });
    row(5, (u) => L.add('glaze_green', lathe([[0.07, 0], [0.09, 0.14], [0.04, 0.28], [0.03, 0.4], [0.001, 0.4]], 8, null, u, y, 0.3)));
  } else if (trade === 'apothecary') {
    row(6, (u, i) => L.add(['glaze_white', 'glaze_blue', 'terracotta'][i % 3], lathe([[0.001, 0], [0.08, 0], [0.1, 0.1], [0.08, 0.2], [0.05, 0.24], [0.001, 0.24]], 8, null, u, y, 0.36 + (i % 2) * 0.2)));
    for (let i = 0; i < 7; i++) { const u = uc - w / 2 + 0.3 + (w - 0.6) * (i + 0.5) / 7; L.add('flax_leaf', lathe([[0.001, 0], [0.07, 0.1], [0.05, 0.3], [0.001, 0.36]], 6, null, u, y + 2.0 - 0.36, 0.2)); L.box('iron', u - 0.004, y + 2.0, 0.19, u + 0.004, y + 2.3, 0.21); }   // bunches of herbs hung to dry
  } else if (trade === 'osteria') {
    row(3, (u) => { const b = lathe([[0.3, 0], [0.34, 0.3], [0.3, 0.6], [0.001, 0.6]], 12, null, 0, 0, 0); b.rotateX(Math.PI / 2); b.translate(u, y + 0.34, 0.5); L.add('timber', b); });
    row(4, (u, i) => L.add(i % 2 ? 'glaze_green' : 'terracotta', lathe([[0.07, 0], [0.09, 0.14], [0.04, 0.28], [0.03, 0.4], [0.001, 0.4]], 8, null, u, y, 0.3)));
    L.add('flax_leaf', lathe([[0.001, 0], [0.22, 0.12], [0.2, 0.4], [0.001, 0.5]], 7, null, uc + w / 2 - 0.2, y + 2.0, 0.3)); L.box('iron', uc + w / 2 - 0.21, y + 2.5, 0.29, uc + w / 2 - 0.19, y + 2.8, 0.31);   // the bush hung out: wine here
  } else if (trade === 'cobbler') {
    row(6, (u, i) => { L.box('hide_brown', u - 0.08, y, 0.3 + (i % 2) * 0.25, u + 0.08, y + 0.08, 0.5 + (i % 2) * 0.25); L.box('hide_black', u - 0.08, y + 0.08, 0.3 + (i % 2) * 0.25, u + 0.08, y + 0.2, 0.38 + (i % 2) * 0.25); });
    for (let i = 0; i < 5; i++) { const u = uc - w / 2 + 0.4 + (w - 0.8) * (i + 0.5) / 5; L.box(i % 2 ? 'hide_black' : 'hide_brown', u - 0.07, y + 1.7, 0.2, u + 0.07, y + 2.2, 0.28); L.box('iron', u - 0.004, y + 2.2, 0.22, u + 0.004, y + 2.4, 0.24); }   // boots hung up
  } else {
    row(4, (u, i) => L.add(i % 2 ? 'pottery_dark' : 'terracotta', lathe([[0.1, 0], [0.16, 0.12], [0.1, 0.26], [0.001, 0.26]], 8, null, u, y, 0.4)));
  }
  void rand;
}

/** A bottega's front: the arched opening in its travertine frame, the dark interior, a board folded down as counter with its trade's goods, one leaf of the folding doors against the jamb, a painted board on an iron bracket. */
function bottega(L, uc, w, o, rand, open) {
  const h = 3.4, round = true;
  const outer = openingPts(uc, 0, h + 0.3, w + 0.5, round), inner = openingPts(uc, 0, h, w, round);
  L.add(T, ext(outer, [inner.slice().reverse()], 0, 0.14, 8));
  if (!open) {
    L.add('opening', ext(inner, [], -0.02, 0.03, 8));
    L.box('timber', uc - w / 2, 1.0, 0.02, uc + w / 2, 1.06, 0.75);                          // the counter board folded down
    for (const s of [-1, 1]) L.box('iron', uc + s * (w / 2 - 0.1) - 0.012, 0.6, 0.02, uc + s * (w / 2 - 0.1) + 0.012, 1.0, 0.72);   // its chains
    goods(L, uc, w, 1.06, o.trade, rand);
    L.box('wood_dark', uc - w / 2 - 0.04, 0.0, 0.03, uc - w / 2 + 0.3, 3.0, 0.1);              // a leaf of the folding doors swung back
    L.box('wood_dark', uc - w / 2 - 0.04, 0.0, 0.03, uc + w / 2 + 0.04, 0.95, 0.07);           // the lower leaves, closed
  } else {
    goods(L, uc, w, 1.06, o.trade, rand);
  }
  // the sign: a painted board hung from an iron bracket at the jamb's side
  const su = uc + w / 2 + 0.5;
  L.box('iron', su - 0.02, 3.5, 0.02, su + 0.02, 3.54, 0.9); L.box('iron', su - 0.02, 3.3, 0.88, su + 0.02, 3.5, 0.9);
  L.box('wood_painted', su - 0.02, 2.55, 0.5, su + 0.02, 3.3, 1.3); L.box({ grocer: 'cloth_red', baker: 'cloth_ochre', cloth: 'cloth_blue', wine: 'cloth_green', apothecary: 'cloth_white', osteria: 'cloth_maroon', cobbler: 'cloth_brown' }[o.trade] ?? 'cloth_red', su - 0.03, 2.75, 0.62, su + 0.03, 3.1, 1.18);
}

/** The wall fountain in its niche: a scallop-headed travertine niche, the mascherone spouting into a trough, the water falling. */
function wallFountain(L, uc, w) {
  const nw = Math.min(1.9, w - 1.0), W = nw + 1.0;
  L.box(T, uc - W / 2, 0, -0.02, uc + W / 2, 0.5, 0.22);
  L.add(T, ext(openingPts(uc, 0.5, 4.2, W, true), [], 0, 0.22, 8));
  L.add('marble_smooth', ext(openingPts(uc, 0.5, 3.8, nw, true), [], -0.02, 0.1, 8));        // the niche's field, pale marble
  L.add('opening', ext(openingPts(uc, 0.5, 3.8 - 0.01, nw - 0.5, true), [], 0.1, 0.11, 8));
  // the shell in the head
  for (let k = -3; k <= 3; k++) { const a = Math.PI / 2 + k * 0.2, cy = 3.8 - nw / 2 + 0.2; L.box(T, uc + Math.cos(a) * 0.1 - 0.025, cy, 0.1, uc + Math.cos(a) * 0.1 + 0.025, cy + nw / 2 - 0.05, 0.16); }
  // the mascherone and the spout
  L.add(T, lathe([[0.001, 0], [0.22, 0.02], [0.2, 0.18], [0.001, 0.22]], 10, null, uc, 1.78, 0.14));
  const m = lathe([[0.001, 0], [0.1, 0], [0.1, 0.06], [0.001, 0.06]], 8, null, 0, 0, 0); m.rotateX(Math.PI / 2); m.translate(uc, 1.72, 0.22); L.add('bronze', m);
  L.box('water_jet', uc - 0.03, 0.78, 0.3, uc + 0.03, 1.7, 0.34);
  // the trough
  const tw = W - 0.2, td = 0.85;
  L.box(T, uc - tw / 2, 0.0, 0.05, uc + tw / 2, 0.9, 0.12);
  L.box(T, uc - tw / 2, 0.0, 0.12, uc - tw / 2 + 0.14, 0.9, td); L.box(T, uc + tw / 2 - 0.14, 0.0, 0.12, uc + tw / 2, 0.9, td); L.box(T, uc - tw / 2 + 0.14, 0.0, td - 0.14, uc + tw / 2 - 0.14, 0.9, td);
  L.box('water', uc - tw / 2 + 0.14, 0.78, 0.12, uc + tw / 2 - 0.14, 0.79, td - 0.14);
  L.box(T, uc - tw / 2 - 0.05, 0.9, 0.05, uc + tw / 2 + 0.05, 0.98, td + 0.05);
  L.box('foam', uc - 0.12, 0.78, 0.28, uc + 0.12, 0.8, 0.4);
}

/** The modillion cornice and the eaves: a band, a row of modillions, the soffit, the gutter. */
function cornice(L, u0, u1, y, big, rand) {
  const p = big ? 0.9 : 0.55;
  L.box(T, u0 - 0.1, y - 0.5, -0.02, u1 + 0.1, y - 0.28, 0.12);
  L.box(T, u0 - 0.1, y - 0.28, -0.02, u1 + 0.1, y - 0.18, p * 0.55);
  const step = big ? 0.55 : 0.7;
  for (let u = u0 + 0.2; u < u1 - 0.1; u += step) L.box(T, u - 0.09, y - 0.18 - (big ? 0.22 : 0.12), 0.0, u + 0.09, y - 0.18, p * 0.55);
  L.box(T, u0 - 0.1, y - 0.18, -0.02, u1 + 0.1, y, p);
  L.box(T, u0 - 0.1, y, -0.02, u1 + 0.1, y + 0.16, p * 0.7);
  void rand;
}

/** A roof loggia (altana): four piers, a slab, a small tiled roof; stands on the roof's ridge. */
function altana(bag, M, u0, w, yTop, depth, rand) {
  const uc = u0 + w * (0.3 + rand() * 0.4), aw = 3.4, ad = 3.0, base = yTop - 0.5;
  const L = new Local();
  const dc = -depth * 0.5;
  for (const sx of [-1, 1]) for (const sd of [-1, 1]) L.box('stucco_cream', uc + sx * (aw / 2 - 0.2) - 0.2, base, dc + sd * (ad / 2 - 0.2) - 0.2, uc + sx * (aw / 2 - 0.2) + 0.2, base + 3.4 + 2.4, dc + sd * (ad / 2 - 0.2) + 0.2);
  for (const sx of [-1, 1]) L.box('stucco_cream', uc + sx * (aw / 2 - 0.2) - 0.2, base + 3.4, dc - ad / 2, uc + sx * (aw / 2 - 0.2) + 0.2, base + 3.4 + 2.4, dc + ad / 2);
  L.box('stucco_cream', uc - aw / 2, base + 3.4 + 2.2, dc - ad / 2, uc + aw / 2, base + 3.4 + 2.4, dc + ad / 2);
  L.box('stucco_cream', uc - aw / 2 + 0.4, base + 2.5, dc - ad / 2 + 0.2, uc + aw / 2 - 0.4, base + 3.4 + 0.15, dc - ad / 2 + 0.4);       // the low parapet at the front
  L.emit(bag, M);
  const g = frustum([-aw / 2 - 0.4, -ad / 2 - 0.4, aw / 2 + 0.4, ad / 2 + 0.4], 0, 1.1, 0, 0, ad / 2 + 0.4, ad / 2 + 0.4);
  g.translate(uc, base + 3.4 + 2.4, dc);
  const R = g; R.applyMatrix4(M); bag.add('roof_tile', R);
}


// ── weathering and eye-level dressing ────────────────────────────────────────

/** A paracarro: the travertine post that keeps wheels off a jamb or a corner. */
function paracarro(L, u, d = 0.55) { L.add(T, lathe([[0.2, 0], [0.2, 0.06], [0.16, 0.12], [0.16, 0.72], [0.2, 0.78], [0.13, 0.86], [0.001, 0.92]], 8, null, u, 0, d)); }

/** A notice pasted on the wall (an edict, a pasquinade): the paper, a few lines of print, a torn corner. */
function edict(L, u, y, rand) {
  const w = 0.28 + rand() * 0.2, h = 0.34 + rand() * 0.25;
  L.box('paint_white', u - w / 2, y, 0, u + w / 2, y + h, 0.012);
  for (let k = 0; k < 4 + Math.floor(rand() * 4); k++) L.box('hide_black', u - w / 2 + 0.03, y + h - 0.06 - k * (h - 0.1) / 7, 0.012, u + w / 2 - 0.03 - rand() * 0.1, y + h - 0.045 - k * (h - 0.1) / 7, 0.03);
  if (rand() < 0.5) L.box('plaster_streak', u + w / 2 - 0.08, y - 0.05, 0.014, u + w / 2 + 0.02, y + 0.12, 0.026);
}

/** A hanging cage of wicker on an iron bracket at (u, y). */
function birdcage(L, u, y) {
  L.box('iron', u - 0.012, y + 0.36, 0, u + 0.012, y + 0.39, 0.5);
  L.box('iron', u - 0.004, y + 0.28, 0.48, u + 0.004, y + 0.38, 0.5);
  L.add('wicker', lathe([[0.001, 0], [0.13, 0.02], [0.14, 0.14], [0.11, 0.26], [0.001, 0.3]], 8, null, u, y, 0.49));
  L.add('iron', lathe([[0.135, 0.02], [0.145, 0.14], [0.115, 0.26], [0.1, 0.26], [0.13, 0.14], [0.12, 0.02]], 8, null, u, y, 0.49));
}

/** The canvas awning (tenda) over a bottega: stripes sloping down from the wall to a valance, two poles at the front. */
function tenda(L, uc, w, y, rand) {
  const proj = 1.7, drop = 0.75, n = Math.max(3, Math.round(w / 0.45)), sw = w / n, ang = Math.atan2(drop, proj), len = Math.hypot(proj, drop);
  const cols = rand() < 0.5 ? ['cloth_red', 'cloth_white'] : rand() < 0.5 ? ['cloth_ochre', 'cloth_white'] : ['cloth_indigo', 'cloth_white'];
  for (let i = 0; i < n; i++) { const g = box(uc - w / 2 + i * sw, 0, 0, uc - w / 2 + (i + 1) * sw, 0.025, len); g.rotateX(ang); g.translate(0, y, 0.02); L.add(cols[i % 2], g); }
  for (let i = 0; i < n; i++) L.box(cols[i % 2], uc - w / 2 + i * sw, y - drop - 0.2, proj - 0.02, uc - w / 2 + (i + 1) * sw, y - drop, proj);        // the valance
  for (const s of [-1, 1]) { L.box('timber', uc + s * (w / 2 - 0.05) - 0.03, 0, proj - 0.1, uc + s * (w / 2 - 0.05) + 0.03, y - drop, proj - 0.04); L.box('iron', uc + s * (w / 2 - 0.05) - 0.012, y - drop * 0.6, 0.0, uc + s * (w / 2 - 0.05) + 0.012, y - drop * 0.6 + 0.03, proj - 0.1); }
  L.box('timber', uc - w / 2, y - 0.04, 0, uc + w / 2, y + 0.04, 0.05);
  void rand;
}

/** The ground storey of a house, dressed: the free stretches of wall between the openings take notices, a stone seat, an iron ring, a post, damp at the foot; the upper wall its patches where the plaster has fallen. */
function houseDress(L, o, free, ys) {
  const { u0, w, rand, H } = o;
  for (const [a, b] of free) {
    const g = b - a;
    if (g < 0.55) continue;
    if (g >= 1.7 && rand() < 0.55) { const bl = Math.min(1.7, g - 0.3), bu = (a + b) / 2; L.box(T, bu - bl / 2, 0.42, 0.02, bu + bl / 2, 0.5, 0.52); for (const s of [-1, 1]) L.box(T, bu + s * (bl / 2 - 0.1) - 0.08, 0, 0.04, bu + s * (bl / 2 - 0.1) + 0.08, 0.42, 0.46); }   // the stone seat by the door
    else if (rand() < 0.75) edict(L, a + g * (0.3 + rand() * 0.4), 1.35 + rand() * 0.5, rand);
    if (rand() < 0.5) { const ru = a + g * (0.2 + rand() * 0.6); L.add('iron', lathe([[0.07, 0], [0.07, 0.015], [0.055, 0.015], [0.055, 0]], 8, null, 0, 0, 0).rotateX(Math.PI / 2).translate(ru, 1.05, 0.02)); L.box('iron', ru - 0.012, 1.1, 0, ru + 0.012, 1.2, 0.04); }   // the ring to tie a mule to
    // damp at the foot of the wall and the lime washed thin above it
    const dw = Math.min(g - 0.1, 0.6 + rand() * 0.9), st = a + 0.05 + rand() * Math.max(0, g - dw - 0.1); L.box('plaster_damp', st, 0.45, 0.014, st + dw, 0.8 + rand() * 0.55, 0.026);
  }
  if (rand() < 0.35) paracarro(L, u0 + 0.3); if (rand() < 0.35) paracarro(L, u0 + w - 0.3);
  for (let k = 0, n = 1 + Math.floor(rand() * 3); k < n; k++) {
    const yy = ys[1] + 0.3 + rand() * Math.max(0.5, H - ys[1] - 1.6), pw = 0.3 + rand() * 0.45, au = rand() < 0.5 ? u0 + 0.06 : u0 + w - 0.06 - pw;
    L.box('brick', au, yy, 0.014, au + pw, yy + 0.22 + rand() * 0.3, 0.026);
    L.box('plaster_streak', au + 0.04, yy + 0.2, 0.014, au + pw - 0.04, yy + 0.4 + rand() * 0.25, 0.026);
  }
}

// ── palazzo ──────────────────────────────────────────────────────────────────
function palazzo(bag, col, M, o) {
  const { u0, w, rand, simple } = o, H = o.H, L = new Local(); L.noBack = true;
  const wall = o.mat, S = PALAZZO_STOREYS.slice(0, o.storeys), y1 = S[0], y2 = y1 + S[1], y3 = y2 + (S[2] ?? 0);
  const nb = Math.max(3, Math.min(7, Math.round(w / 4.6) | 1)), bw = w / nb;
  const uc = u0 + w / 2, centre = Math.floor(nb / 2);
  const bayU = (k) => u0 + (k + 0.5) * bw;
  // the portal (centre bay): rusticated surround, voussoirs, the door
  const pw = 2.7, ps = 2.9;
  const blocks = [];                                  // the openings the rustication must avoid: [u0, u1, y0, y1]
  blocks.push([uc - pw / 2 - 0.9, uc + pw / 2 + 0.9, 0, ps + pw / 2 + 0.9]);
  // ground storey: courses of rustication 0.5 m, joints 0.04, blocks 1.1 long staggered; the windows' places left out
  const wIn = [], mezz = [];
  for (let k = 0; k < nb; k++) if (k !== centre) { wIn.push(bayU(k)); }
  for (const u of wIn) blocks.push([u - 0.95, u + 0.95, 0.4, 2.9]);
  for (const u of [...wIn, uc - pw / 2 - 1.65, uc + pw / 2 + 1.65]) blocks.push([u - 0.75, u + 0.75, 3.3, 4.6]);
  const clear = (a, b, ya, yb) => !blocks.some(([p, q, r, s]) => a < q && b > p && ya < s && yb > r);
  if (!simple) for (let c = 0, yy = 0.5; yy < y1 - 0.55; c++, yy += 0.5) {
    const off = c % 2 ? 0.55 : 0;
    for (let u = u0 - off; u < u0 + w; u += 1.1) {
      const a = Math.max(u0, u), b = Math.min(u0 + w, u + 1.1) - 0.04;
      if (b - a < 0.2 || !clear(a, b, yy, yy + 0.46)) continue;
      L.loose(T, box(a, yy, 0, b, yy + 0.46, 0.07));
    }
  } else L.box(T, u0, 0, 0, u0 + w, y1 - 0.5, 0.05);
  L.box(T, u0, 0, -0.02, u0 + w, 0.5, 0.12);                                              // the plinth
  // the portal
  voussoirs(L, T, uc, ps, pw / 2, pw / 2 + 0.62, 0, 0.17, 11, 0.04);
  for (const s of [-1, 1]) for (let k = 0, yy = 0; yy < ps - 0.1; k++, yy += 0.5) L.box(T, uc + s * (pw / 2 + (k % 2 ? 0.62 : 0.5)) - (k % 2 ? 0.0 : 0), yy, 0, uc + s * (pw / 2), Math.min(ps, yy + 0.46), 0.17);
  L.box(T, uc - 0.24, ps + pw / 2 + 0.55, 0.0, uc + 0.24, ps + pw / 2 + 0.85, 0.32);       // the keystone
  L.add('opening', ext(openingPts(uc, 0, ps + pw / 2, pw, true), [], -0.02, 0.02, 8));
  L.add('wood_dark', ext(openingPts(uc, 0, ps + pw / 2 - 0.12, pw - 0.2, true), [], 0.02, 0.09, 8));
  L.box('opening', uc - 0.012, 0, 0.09, uc + 0.012, ps + 0.7, 0.1);                             // the joint of the leaves
  if (!simple) for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) for (const s of [-1, 1]) L.box('iron', uc + s * (0.25 + c * 0.22) - 0.03, 0.5 + r * 0.55 - 0.03, 0.09, uc + s * (0.25 + c * 0.22) + 0.03, 0.5 + r * 0.55 + 0.03, 0.12);  // studs
  col.rect(wrect(M, u0, -0.0001, u0 + w, 0), 0, 0);                                        // (placeholder: the body carries the collider)
  // kneeling windows with grilles; mezzanine windows over them
  for (const u of wIn) {
    window(L, u, 1.0, 1.25, 1.55, { head: 'flat', shut: null, rand, bracket: true });
    if (!simple) for (let i = 1; i < 9; i++) L.box('iron', u - 0.625 + 1.25 * i / 9 - 0.012, 1.0, 0.04, u - 0.625 + 1.25 * i / 9 + 0.012, 2.55, 0.07);
    L.box('iron', u - 0.62, 1.7, 0.04, u + 0.62, 1.73, 0.07);
    window(L, u, 3.55, 0.85, 0.85, { head: 'flat', shut: SHUT[Math.floor(rand() * SHUT.length)], closed: rand() < 0.5, rand });
  }
  window(L, uc - pw / 2 - 1.25 - 0.4, 3.55, 0.85, 0.85, { head: 'flat', shut: null, rand });
  window(L, uc + pw / 2 + 1.25 + 0.4, 3.55, 0.85, 0.85, { head: 'flat', shut: null, rand });
  // stringcourse
  L.box(T, u0, y1 - 0.2, -0.02, u0 + w, y1 + 0.12, 0.16);
  // piano nobile: pedimented windows, the central balcony door
  for (let k = 0; k < nb; k++) {
    const u = bayU(k), c = k === centre, sh = SHUT[Math.floor(rand() * SHUT.length)];
    if (c) { window(L, u, y1 + 0.3, 1.5, 3.6, { head: 'tri', shut: sh, closed: false, rand, glass: true }); balcony(L, u, y1 + 0.3, 3.4, 1.05); }
    else window(L, u, y1 + 1.0, 1.3, 2.7, { head: k % 2 ? 'tri' : 'seg', shut: sh, closed: rand() < 0.35, rand });
  }
  if (S.length > 1) L.box(T, u0, y2 - 0.12, -0.02, u0 + w, y2 + 0.12, 0.14);
  // second floor
  if (S.length > 2) {
    for (let k = 0; k < nb; k++) { const u = bayU(k); window(L, u, y2 + 0.9, 1.2, 2.2, { head: 'cornice', shut: SHUT[Math.floor(rand() * SHUT.length)], closed: rand() < 0.45, rand }); if (k === centre) balcony(L, u, y2 + 0.9, 1.9, 0.55, 0.85); else if (rand() < 0.3) { pot(L, u - 0.35, y2 + 0.74, 0.14); pot(L, u + 0.35, y2 + 0.74, 0.14); } }
    if (S.length > 3) L.box(T, u0, y3 - 0.1, -0.02, u0 + w, y3 + 0.08, 0.12);
  }
  if (S.length > 3) for (let k = 0; k < nb; k++) window(L, bayU(k), y3 + 0.8, 0.9, 1.3, { head: 'flat', shut: SHUT[Math.floor(rand() * SHUT.length)], closed: rand() < 0.5, rand });
  // quoins at the unit's two corners: giant rusticated strips up the full height
  for (const s of [0, 1]) for (let yy = y1, k = 0; yy < H - 0.7; yy += 0.5, k++) { const a = s ? u0 + w - (k % 2 ? 0.7 : 0.5) : u0, b = s ? u0 + w : u0 + (k % 2 ? 0.7 : 0.5); L.box(T, a, yy, -0.02, b, Math.min(H - 0.7, yy + 0.46), 0.06); }
  for (const sg of [-1, 1]) paracarro(L, uc + sg * (pw / 2 + 0.95), 0.6);
  if (!simple) for (let k = 0, n = 2 + Math.floor(rand() * 2); k < n; k++) edict(L, u0 + 0.9 + rand() * (w - 1.8), 1.2 + rand() * 0.4, rand);
  if (!simple) for (const sg of [0, 1]) L.box('plaster_damp', sg ? u0 + w - 1.4 : u0 + 0.4, 0.1, 0.07, sg ? u0 + w - 0.5 : u0 + 1.3, 0.45, 0.085);
  cornice(L, u0, u0 + w, H, true, rand);
  L.emit(bag, M);
  // the roof, behind the cornice; chimneys; an altana now and then
  const rh = 3.0;
  const rf = frustum(roofRect(M, u0, w, o.D, 0.5), H + 0.16, H + 0.16 + rh, 0, 0, o.D / 2 + 0.3, o.D / 2 + 0.3);
  bag.add('roof_tile', rf);
  if (o.altana) altanaOn(bag, M, o, H + 0.16 + rh * 0.55, rand);
  chimney(bag, M, o, H + 0.16 + rh * 0.8, rand);
}
function roofRect(M, u0, w, D, e) { const r = wrect(M, u0 - e, 0.4 * 0, u0 + w + e, -(D + e)); return [r[0], r[1], r[2], r[3]]; }
function chimney(bag, M, o, y, rand) {
  const L = new Local();
  const n = o.kind === 'palazzo' ? 2 : 1;
  for (let k = 0; k < n; k++) {
    const u = o.u0 + o.w * (0.2 + 0.6 * rand()), d = -o.D * (0.35 + rand() * 0.3);
    L.box('brick', u - 0.4, y - 0.8, d - 0.4, u + 0.4, y + 1.4, d + 0.4); L.box(T, u - 0.5, y + 1.4, d - 0.5, u + 0.5, y + 1.55, d + 0.5);
    L.box('brick', u - 0.34, y + 1.55, d - 0.34, u + 0.34, y + 1.75, d + 0.34);
  }
  L.emit(bag, M);
}
function altanaOn(bag, M, o, y, rand) { altana(bag, M, o.u0, o.w, y, o.D, rand); }

// ── casa ─────────────────────────────────────────────────────────────────────
function casa(bag, col, M, o) {
  const { u0, w, rand, simple } = o, H = o.H, L = new Local(); L.noBack = true;
  const S = CASA_STOREYS.slice(0, o.storeys);
  const ys = [0]; for (const s of S) ys.push(ys[ys.length - 1] + s);
  const dw = 1.1, sw = Math.min(2.8, w - dw - 1.6), shopU = u0 + 0.7 + sw / 2 + (o.flip ? dw + 0.4 : 0), doorU = o.flip ? u0 + 0.7 + dw / 2 : u0 + w - 0.7 - dw / 2;
  L.box(T, u0, 0, -0.02, u0 + w, 0.45, 0.1);
  // the ground: a bottega (or a wall fountain) and the door to the stair
  if (o.fountain) wallFountain(L, u0 + w / 2, w);
  else {
    bottega(L, shopU, sw, o, rand, !!o.open);
    // the door: a rectangular opening with a lintel and a stone step; the leaf
    L.box(T, doorU - dw / 2 - 0.18, 0, -0.02, doorU - dw / 2, 2.45, 0.14); L.box(T, doorU + dw / 2, 0, -0.02, doorU + dw / 2 + 0.18, 2.45, 0.14); L.box(T, doorU - dw / 2 - 0.25, 2.4, -0.02, doorU + dw / 2 + 0.25, 2.7, 0.2);
    L.box('opening', doorU - dw / 2, 0, -0.02, doorU + dw / 2, 2.4, 0.03); L.box('wood_dark', doorU - dw / 2 + 0.03, 0, 0.03, doorU + dw / 2 - 0.03, 2.35, 0.08);
    L.box(T, doorU - dw / 2 - 0.2, 0, 0.14, doorU + dw / 2 + 0.2, 0.14, 0.6);
    const mu = o.flip ? u0 + w - 0.9 : u0 + 0.9, nb0 = w < 7.6 ? 2 : 3, bw0 = (w - 0.8) / nb0;
    if (o.madonna && !Array.from({ length: nb0 }, (_, k) => u0 + 0.4 + (k + 0.5) * bw0).some((c) => c > mu - 1.6 && c < mu + 2.1)) madonnella(L, mu, ys[1] + 0.75, rand);
  }
  // the upper storeys: windows on the same axes, with shutters open or closed, pots, balconettes
  const nb = w < 7.6 ? 2 : 3, bw = (w - 0.8) / nb;
  for (let s = 1; s < S.length; s++) {
    const y0 = ys[s];
    L.box(T, u0, y0 - 0.1, -0.02, u0 + w, y0 + 0.09, 0.1);
    for (let k = 0; k < nb; k++) {
      const u = u0 + 0.4 + (k + 0.5) * bw, wh = s === 1 ? 2.0 : 1.7, sh = SHUT[Math.floor(rand() * SHUT.length)];
      window(L, u, y0 + 0.75, 0.9, wh, { head: s === 1 ? 'cornice' : 'flat', shut: sh, closed: rand() < 0.4, rand, frame: T });
      if (s === 1 && rand() < 0.55) { balcony(L, u, y0 + 0.75, 1.5, 0.5, 0.9); }
      else if (rand() < 0.4) { pot(L, u - 0.25, y0 + 0.59, 0.12); pot(L, u + 0.25, y0 + 0.59, 0.12); }
    }
  }
  if (!o.fountain) {
    const sf = [shopU - sw / 2 - 0.25, shopU + sw / 2 + 0.25], df = [doorU - dw / 2 - 0.25, doorU + dw / 2 + 0.25];
    const lo = sf[0] < df[0] ? sf : df, hi = sf[0] < df[0] ? df : sf;
    houseDress(L, o, [[u0, lo[0]], [lo[1], hi[0]], [hi[1], u0 + w]], ys);
    if (o.awning && !o.open) tenda(L, shopU, sw + 0.5, 3.2, rand);
    if (o.birdcage && nb >= 2 && S.length > 2) birdcage(L, u0 + 0.4 + bw, ys[1] + 1.2);
  }
  cornice(L, u0, u0 + w, H, false, rand);
  L.emit(bag, M);
  const rh = 2.4;
  bag.add('roof_tile', frustum(roofRect(M, u0, w, o.D, 0.4), H + 0.16, H + 0.16 + rh, 0, 0, o.D / 2 + 0.3, o.D / 2 + 0.3));
  if (rand() < 0.7) chimney(bag, M, o, H + 0.16 + rh * 0.8, rand);
  void col; void simple;
}

// ── the back and the plain walls ─────────────────────────────────────────────
function plainFace(bag, M, u0, w, H, rand, simple) {
  const L = new Local(); L.noBack = true;
  if (simple) { L.emit(bag, M); return; }
  const n = Math.max(1, Math.round(w / 3.4)), bw = w / n;
  for (let s = 0, y = 0; y < H - 2.5; s++) {
    const sh = s === 0 ? 3.2 : 3.4;
    for (let k = 0; k < n; k++) if (rand() < 0.85) window(L, u0 + (k + 0.5) * bw + (rand() - 0.5) * 0.6, y + (s === 0 ? 1.0 : 0.8), 0.8, s === 0 ? 1.4 : 1.7, { head: 'flat', shut: SHUT[Math.floor(rand() * SHUT.length)], closed: rand() < 0.5, rand });
    y += sh;
  }
  L.emit(bag, M);
}

/** The laundry across the alley (u runs along): ropes between the two walls at height y with linen hanging. */
function laundry(bag, a, b, y, rand) {
  const L = new Local();
  const [ax, az] = a, [bx, bz] = b, len = Math.hypot(bx - ax, bz - az);
  const px = (bz - az) / len, pz = -(bx - ax) / len, tx = (bx - ax) / len, tz = (bz - az) / len;
  const along = Math.abs(tx) > Math.abs(tz);
  const r0 = [Math.min(ax, bx) - (along ? 0 : 0.01), Math.min(az, bz) - (along ? 0.01 : 0), Math.max(ax, bx) + (along ? 0 : 0.01), Math.max(az, bz) + (along ? 0.01 : 0)];
  bag.add('rope_fibre', box(r0[0], y - 0.01, r0[1], r0[2], y + 0.01, r0[3]));
  const n = 3 + Math.floor(rand() * 4);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.7 + rand() * 0.4) / (n + 1.2), cx = ax + tx * len * t, cz = az + tz * len * t, hw = 0.2 + rand() * 0.22, hh = 0.5 + rand() * 0.9;
    const g = along ? clothBox(cx - hw, y - hh, cz - 0.02, cx + hw, y - 0.02, cz + 0.02) : clothBox(cx - 0.02, y - hh, cz - hw, cx + 0.02, y - 0.02, cz + hw);
    addCloth(bag, LINEN[Math.floor(rand() * LINEN.length)], g, y);
  }
  void px; void pz; void L;
}

// ── the row ──────────────────────────────────────────────────────────────────
/**
 * borgo_row: { rect, face ('n'|'s'|'e'|'w': the street side), units: [{ u0, w, kind: 'palazzo' | 'casa' | 'lane', storeys, H, mat, seed, trade, open, fountain, madonna, flip, altana }], back (the face opposite, if it is
 * on a lane: 'plain' draws its windows), laundry: [{ a, b, y }], y, simple }.
 */
export function borgoRow(el, { bag, col }) {
  const y = el.y ?? 0, f = el.face, rect = el.rect, simple = !!el.simple;
  const { M } = faceFrame(rect, f, y);
  const D = f === 'n' || f === 's' ? rect[3] - rect[1] : rect[2] - rect[0];
  const back = { n: 's', s: 'n', e: 'w', w: 'e' }[f], B = faceFrame(rect, back, y).M;
  const LEN = f === 'n' || f === 's' ? rect[2] - rect[0] : rect[3] - rect[1];
  for (const un of el.units) {
    if (un.kind === 'lane') continue;
    const rand = rng(un.seed ?? 1), o = { ...un, rand, D, simple, M };
    // the body: one block of stucco, solid (the open bottega's is hollow below)
    const r = wrect(M, un.u0, -D, un.u0 + un.w, 0);
    const wall = un.mat ?? WALLS[Math.floor(rand() * WALLS.length)];
    o.mat = wall;
    if (un.open) openBody(bag, col, M, o, wall);
    else { bag.add(wall, box(r[0], y - 0.5, r[1], r[2], y + un.H, r[3])); col.rect(r, y, y + un.H); }
    (un.kind === 'palazzo' ? palazzo : casa)(bag, col, M, o);
    // the wall on the other side of the row (on the alley): plain, a few windows
    const ub = LEN - un.u0 - un.w;
    plainFace(bag, B, ub, un.w, un.H, rng((un.seed ?? 1) + 77), simple);
  }
  // the lanes between: nothing built (the sides are the neighbours' own walls)
  if (!simple) for (const l of el.laundry ?? []) laundry(bag, l.a, l.b, y + l.y, rng(Math.floor(l.a[0] * 13 + l.a[1] * 7)));
}

/**
 * The enterable bottega: the walls (the front cut for the wide opening and the stair door), the floor of
 * flags, a barrel vault of plaster over the shop, the mass of the storeys above; behind the shop's back
 * wall solid. Furnished in the style of the trade: the counter with scales, shelves of jars and
 * bottles, barrels, sacks, hams and sausages hung from a rail, a lantern.
 */
function openBody(bag, col, M, o, wall) {
  const { u0, w, D, H, rand } = o, y = 0, T0 = 0.5, SD = Math.min(D - 0.5, 6.2), dw = 1.1;
  const sw = Math.min(2.8, w - dw - 1.6), shopU = u0 + 0.7 + sw / 2 + (o.flip ? dw + 0.4 : 0), doorU = o.flip ? u0 + 0.7 + dw / 2 : u0 + w - 0.7 - dw / 2;
  const Bx = (mat, a0, d0, a1, d1, ya, yb, c = false) => { const r = wrect(M, a0, d0, a1, d1); bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, Math.max(ya, 0) + (ya < 0 ? 0 : 0), yb); };
  // the walls: sides, the back of the shop and the mass behind it, the front on either side of the opening
  Bx(wall, u0, -SD - 0.0, u0 + T0, 0, y - 0.5, H, true); Bx(wall, u0 + w - T0, -SD, u0 + w, 0, y - 0.5, H, true);
  Bx(wall, u0, -D, u0 + w, -SD, y - 0.5, H, true);
  const a = shopU - sw / 2 - 0.25, b = shopU + sw / 2 + 0.25;                       // the opening's frame
  const lo = Math.min(a, doorU - dw / 2 - 0.18), hi = Math.max(b, doorU + dw / 2 + 0.18);
  const segs = o.flip ? [[u0, doorU - dw / 2], [doorU + dw / 2, shopU - sw / 2], [shopU + sw / 2, u0 + w]] : [[u0, shopU - sw / 2], [shopU + sw / 2, doorU - dw / 2], [doorU + dw / 2, u0 + w]];
  for (const [p, q] of segs) { if (q - p > 0.05) Bx(wall, p, -T0, q, 0, y - 0.5, H, true); }
  void lo; void hi;
  // over the opening (the arch's head is the frame's; solid wall to the storeys above), over the door
  Bx(wall, shopU - sw / 2, -T0, shopU + sw / 2, 0, y + 3.4, H); col.rect(wrect(M, shopU - sw / 2, -T0, shopU + sw / 2, 0), y + 2.3, H);
  Bx(wall, doorU - dw / 2, -T0, doorU + dw / 2, 0, y + 2.4, H);
  Bx('wood_dark', doorU - dw / 2, -T0, doorU + dw / 2, -T0 + 0.01, y, y + 2.4, true);          // (the stair door: shut, the way blocked)
  // the floor, the vault, the mass above
  const fr = wrect(M, u0 + T0, -SD, u0 + w - T0, -T0);
  bag.add('cotto_floor', box(fr[0], y - 0.12, fr[1], fr[2], y + 0.05, fr[3])); col.floor(fr, y + 0.05);
  const L = new Local(), wi = w - 2 * T0, vy = 3.4, rise = 0.9;
  const pts = [[u0 + T0, vy]]; for (let i = 0; i <= 14; i++) { const t = i / 14, uu = u0 + T0 + wi * t; pts.push([uu, vy + Math.sin(t * Math.PI) * rise]); }
  pts.push([u0 + w - T0, vy], [u0 + w - T0, vy + rise + 0.1], [u0 + T0, vy + rise + 0.1]);
  // (the vault as an extrusion across the shop's depth)
  const vg = ext(pts.map(([u, yy]) => [u, yy]), [], -SD, -T0, 1); L.add('plaster_white', vg);
  L.box(wall, u0 + T0, vy + rise + 0.1, -SD, u0 + w - T0, H - 0.0, -T0);
  L.emit(bag, M);
  col.floor(fr, y + 0.05);
  furnish(bag, col, M, { u0: u0 + T0, u1: u0 + w - T0, d0: -T0, d1: -SD, y: y + 0.05, trade: o.trade, rand, vy });
}

function furnish(bag, col, M, { u0, u1, d0, d1, y, trade, rand, vy }) {
  const L = new Local(), W = u1 - u0, uc = (u0 + u1) / 2;
  const Bx = (mat, a0, e0, a1, e1, ya, yb, c = false) => { L.box(mat, a0, ya, e0, a1, yb, e1); if (c) { const r = wrect(M, a0, e0, a1, e1); col.rect(r, ya, yb); } };
  const back = d1 + 0.02, cd = d0 - 2.6;                                          // the counter line, 2.6 m in
  // the counter across, a gap at the left for the keeper
  Bx('wood_dark', u0 + 1.3, cd - 0.35, u1, cd + 0.35, y, y + 1.0, true); Bx('timber', u0 + 1.25, cd - 0.4, u1 + 0.02, cd + 0.4, y + 1.0, y + 1.06);
  // scales on the counter: the beam, two pans, the pillar
  const su = uc + 0.2;
  Bx('iron', su - 0.01, cd - 0.01, su + 0.01, cd + 0.01, y + 1.06, y + 1.5); Bx('iron', su - 0.3, cd - 0.01, su + 0.3, cd + 0.01, y + 1.48, y + 1.5);
  for (const s of [-1, 1]) { L.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.04], [0.001, 0.03]], 10, null, su + s * 0.29, y + 1.18, cd)); Bx('iron', su + s * 0.29 - 0.004, cd - 0.004, su + s * 0.29 + 0.004, cd + 0.004, y + 1.2, y + 1.48); }
  // the shelves along the back wall: boards at four heights with their goods
  for (let k = 0; k < 4; k++) {
    const ys = y + 0.55 + k * 0.62;
    Bx('wood_dark', u0 + 0.05, back, u1 - 0.05, back + 0.4, ys, ys + 0.05, true);
    for (let u = u0 + 0.3; u < u1 - 0.3; u += 0.34) {
      const kind = trade === 'cloth' ? 'bolt' : trade === 'apothecary' ? 'jar' : trade === 'cobbler' ? 'shoe' : (k + Math.floor(u * 3)) % 3;
      if (kind === 'jar') L.add(['glaze_white', 'glaze_blue', 'terracotta', 'glaze_white'][Math.floor(u * 5) % 4], lathe([[0.001, 0], [0.07, 0], [0.09, 0.1], [0.07, 0.2], [0.04, 0.24], [0.001, 0.24]], 8, null, u, ys + 0.05, back + 0.2));
      else if (kind === 'shoe') { L.box(k % 2 ? 'hide_brown' : 'hide_black', u - 0.08, ys + 0.05, back + 0.12, u + 0.08, ys + 0.13, back + 0.34); L.box('hide_black', u - 0.08, ys + 0.13, back + 0.12, u + 0.08, ys + 0.26, back + 0.2); }
      else if (kind === 'bolt') { const g = lathe([[0.001, 0], [0.09, 0], [0.09, 0.3], [0.001, 0.3]], 8, null, 0, 0, 0); g.rotateX(Math.PI / 2); g.translate(u, ys + 0.14, back + 0.2); L.add(['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_indigo', 'cloth_maroon'][Math.floor(rand() * 7)], g); }
      else if (kind === 0) L.add('terracotta', lathe([[0.08, 0], [0.12, 0.12], [0.09, 0.24], [0.06, 0.28], [0.001, 0.28]], 8, null, u, ys + 0.05, back + 0.2));
      else if (kind === 1) L.add('glaze_green', lathe([[0.06, 0], [0.085, 0.12], [0.04, 0.24], [0.03, 0.34], [0.001, 0.34]], 8, null, u, ys + 0.05, back + 0.2));
      else L.add('limestone_yellow', lathe([[0.001, 0], [0.15, 0], [0.15, 0.1], [0.001, 0.1]], 10, null, u, ys + 0.05, back + 0.2));
    }
  }
  Bx('wood_dark', u0 + 0.05, back, u0 + 0.1, back + 0.05, y, y + 3.0);
  // barrels and sacks on the floor in the near corners; a stool
  for (const [bu, bd] of [[u1 - 0.55, d0 - 0.7], [u1 - 0.55, d0 - 1.55]]) { const b = lathe([[0.3, 0], [0.36, 0.28], [0.3, 0.56], [0.001, 0.56]], 12, null, bu, y, bd); L.add('timber', b); col.circle(...wrect(M, bu, bd, bu, bd).slice(0, 2), 0.36, y, y + 0.6); }
  L.box('sacking', u0 + 0.3, y, d0 - 0.4, u0 + 1.0, y + 0.55, d0 - 1.0); col.rect(wrect(M, u0 + 0.3, d0 - 0.4, u0 + 1.0, d0 - 1.0), y, y + 0.55);
  L.box('sacking', u0 + 0.3, y + 0.55, d0 - 0.5, u0 + 0.9, y + 0.9, d0 - 0.95);
  // a rail across the shop at 2.9 m with hams, sausages and garlic hung
  if (trade === 'apothecary' || trade === 'cobbler') {
    L.box('iron', u0 + 0.3, vy - 0.4, d1 + 1.4, u1 - 0.3, vy - 0.38, d1 + 1.42);
    for (let u = u0 + 0.6; u < u1 - 0.4; u += 0.38) { if (trade === 'apothecary') L.add('flax_leaf', lathe([[0.001, 0], [0.07, 0.1], [0.05, 0.3], [0.001, 0.38]], 6, null, u, vy - 0.78, d1 + 1.41)); else { L.box(rand() < 0.5 ? 'hide_brown' : 'hide_black', u - 0.07, vy - 0.9, d1 + 1.38, u + 0.07, vy - 0.45, d1 + 1.44); } }
  } else if (trade !== 'cloth' && trade !== 'baker') {
    L.box('iron', u0 + 0.3, vy - 0.4, d1 + 1.4, u1 - 0.3, vy - 0.38, d1 + 1.42);
    for (let u = u0 + 0.6; u < u1 - 0.4; u += 0.42) { const hh = 0.35 + rand() * 0.25; L.add(rand() < 0.5 ? 'hide_brown' : 'hide_tan', lathe([[0.001, 0], [0.06, 0.08], [0.07, 0.25], [0.045, 0.4], [0.001, 0.5]].map(([r, v]) => [r, v * hh / 0.4]), 7, null, u, vy - 0.4 - hh * 1.25, d1 + 1.41)); }
  }
  if (trade === 'baker') {
    // the brick oven at the back: its dome, the mouth with the fire in it, the peel against the wall, a trough for the dough
    const ou = u1 - 1.3, od = back + 1.3;
    L.add('brick', lathe([[1.0, 0], [1.0, 0.55], [0.8, 1.0], [0.4, 1.3], [0.001, 1.38]], 14, null, ou, y, od)); col.circle(...wrect(M, ou, od, ou, od).slice(0, 2), 1.0, y, y + 1.4);
    L.box('opening', ou - 0.34, y + 0.2, od + 0.88, ou + 0.34, y + 0.7, od + 1.0); L.box('flame', ou - 0.2, y + 0.22, od + 0.9, ou + 0.2, y + 0.5, od + 0.93); L.box('iron', ou - 0.4, y + 0.7, od + 0.88, ou + 0.4, y + 0.75, od + 1.02);
    L.box('timber', u0 + 0.12, y, back + 0.1, u0 + 0.16, y + 2.2, back + 0.14); L.box('timber', u0 + 0.08, y + 2.2, back + 0.08, u0 + 0.2, y + 2.7, back + 0.2);
    Bx('wood_dark', u0 + 0.6, back + 0.9, u0 + 1.9, back + 1.5, y + 0.1, y + 0.8, true); L.box('plaster_white', u0 + 0.65, y + 0.8, back + 0.95, u0 + 1.85, y + 0.85, back + 1.45);
  }
  if (trade === 'wine' || trade === 'osteria') {
    // casks lying on their stands along the back, and for an osteria a bench along the wall with a table at it
    for (let u = u0 + 0.9; u < u1 - 0.9; u += 1.05) { const b = lathe([[0.4, 0], [0.45, 0.45], [0.4, 0.9], [0.001, 0.9]], 12, null, 0, 0, 0); b.rotateX(Math.PI / 2); b.translate(u, y + 0.62, back + 1.0); L.add('timber', b); L.box('wood_dark', u - 0.3, y, back + 0.6, u + 0.3, y + 0.2, back + 1.4); L.box('iron', u - 0.46, y + 0.45, back + 0.88, u + 0.46, y + 0.49, back + 0.92); }
    if (trade === 'osteria') { Bx('wood_dark', u0 + 0.06, d0 - 0.85, u0 + 0.5, d0 - 2.4, y, y + 0.46, true); Bx('timber', u0 + 0.06, d0 - 0.85, u0 + 0.5, d0 - 2.4, y + 0.44, y + 0.48); Bx('wood_dark', u0 + 0.6, d0 - 1.0, u0 + 1.05, d0 - 2.2, y + 0.7, y + 0.74, true); for (const dd of [-1.05, -2.15]) Bx('wood_dark', u0 + 0.7, d0 + dd, u0 + 0.74, d0 + dd - 0.04, y, y + 0.7); }
  }
  // the lantern from the vault
  L.add('lamp_glass', lathe([[0.001, 0], [0.1, 0.04], [0.12, 0.18], [0.07, 0.26], [0.001, 0.28]], 8, null, uc, vy + 0.7 - 0.9, (d0 + d1) / 2));
  L.box('iron', uc - 0.005, vy + 0.7 - 0.62, (d0 + d1) / 2 - 0.005, uc + 0.005, vy + 0.95, (d0 + d1) / 2 + 0.005);
  L.emit(bag, M);
  void toW;
}

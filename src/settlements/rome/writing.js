// What Rome's fronts and floors say, and where they are worn (docs/settlements/rome.md §4.21). The Latin is written with
// lettering.js (a complete set of capitals, looked at letter by letter); each text is a word of the language that the trade
// or the place had, never a name, so that nothing here is a made-up person:
//   CAVPONA, FVLLONICA, PISTRINVM  in white over the red sign bands that the inn, the fuller's and the bakery already have
//   SALVE, CAVE CANEM              in black tesserae on the floor of the atrium house's fauces, read by a visitor going in
// Wrapped from this folder around the builders of the styles `rome-town` and `rome-site` (the shared styles are untouched),
// after nightlight.js has wrapped them. Letters are added to the bags of the building, in materials the building already uses
// (no new draw). Far copies (`simple`) are not written on.
import { STYLES } from '../../core/build.js';
import { frame } from '../../styles/roman/street.js';
import { box } from '../../core/geom.js';
import { wallText, floorText, widthOf } from './lettering.js';
import './nightlight.js';

/** The words, by the place that carries each. */
export const WORDS = { inn: 'CAVPONA', fuller: 'FVLLONICA', mill: 'PISTRINVM', salve: 'SALVE', cave: 'CAVE CANEM' };

/**
 * A sign of white letters on a red panel over a door: u0…u1 the panel's width along the front, v0…v1 its height. (The red band that the
 * builders put over their doors lies inside the wall's thickness and cannot be seen; the panel here stands 12 mm proud of the wall.)
 */
const signed = (base, word, [u0, u1, v0, v1]) => (el, ctx) => {
  base(el, ctx);
  if (el.simple || (el.front ?? 's') !== 's') return;
  const F = frame(el.rect, 's'), y = el.y ?? 0, gap = 0.3, P = F.P((u0 + u1) / 2, 0), pr = F.R(u0, u1, 0, 0);
  const h = Math.min((v1 - v0) * 0.66, 0.92 * (u1 - u0) / widthOf(word, gap));
  ctx.bag.add('wall_red', box(pr[0], y + v0, pr[3], pr[2], y + v1, pr[3] + 0.012));
  ctx.bag.add('plaster_white', wallText(word, { at: [P[0], P[1] + 0.012], y: y + v0 + ((v1 - v0) - h) / 2, h, dep: 0.014, gap }));
};

/** The worn lip of the threshold in front of each shop of a row: the walkers' pale polish on the step's front edge. */
const worn = (base) => (el, ctx) => {
  base(el, ctx);
  if (el.simple) return;
  const F = frame(el.rect, el.front ?? 's'), nb = el.n ?? Math.max(2, Math.round(F.W / 4.4)), bw = F.W / nb, ty = el.y ?? 0;
  for (let i = 0; i < nb; i++) {
    const r = F.R(i * bw + 0.65, (i + 1) * bw - 0.65, -0.04, 0.09);
    ctx.bag.add('plaster_damp', fromBox(r, ty + 0.1, ty + 0.104));
  }
};
const fromBox = (r, y0, y1) => box(r[0], y0, r[1], r[2], y1, r[3]);

/** The mosaics on the floor of the fauces of the atrium house: two lines, the nearer (SALVE) first met by the visitor coming in from the street. */
const mosaic = (base) => (el, ctx) => {
  base(el, ctx);
  if (el.simple) return;
  const [X0, , X1, Z1] = el.rect, y = el.y ?? 0, mx = (X0 + X1) / 2, t = 0.6;
  // the fauces runs from the street wall (z = Z1 − t) 5 m to the wall behind the shops; its floor is 2.2 m between the shops' side walls
  const z0 = Z1 - t - 1.2, z1 = Z1 - t - 3.4;
  ctx.bag.add('lacquer_black', floorText(WORDS.salve, { at: [mx, z0], y: y + 0.0, h: 0.2, dep: 0.012, gap: 0.3 }));
  ctx.bag.add('lacquer_black', floorText(WORDS.cave, { at: [mx, z1], y: y + 0.0, h: 0.17, dep: 0.012, gap: 0.3 }));
};

const wrap = (style, name, f) => { const E = STYLES[style].elements; if (E[name]) E[name] = f(E[name]); };
wrap('rome-town', 'caupona_up', (b) => signed(b, WORDS.inn, [2.0, 4.6, 3.5, 3.9]));        // the inns are built with their upper floors (upper-inns.js)
wrap('rome-town', 'fullonica_up', (b) => signed(b, WORDS.fuller, [1.8, 4.6, 3.4, 3.8]));
wrap('rome-town', 'pistrinum', (b) => signed(b, WORDS.mill, [1.8, 4.4, 3.4, 3.8]));
wrap('rome-town', 'taberna_row', worn);
wrap('rome-site', 'domus', mosaic);

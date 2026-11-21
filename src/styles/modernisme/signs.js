// The writing on the Eixample's shop fascias (docs/settlements/barcelona.md §14.5, §15.0): the trade named in Catalan or Castilian and nothing else
// (the first pass's invented house names, "CASA PUIG" and the like, were removed), in block capitals of the victorian style's 5 by 7 alphabet (Latin A–Z and . , & only, so no accents: capitals on the signs of the time often left them off).
// A pure function of the shop's seed, trade and width. [inferred throughout: no sign of these streets is recorded; the words are the two languages' own names of the trades.]
import { write, widthOf } from '../victorian/letters.js';

/** The words of each trade, short to long: Catalan (FORN, VINS, PERRUQUERIA, NOVETATS) and Castilian (PANADERIA, BODEGA, PELUQUERIA, NOVEDADES). */
export const WORDS = {
  colmado: ['QUEVIURES', 'ULTRAMARINOS', 'ULTRAMARINOS Y COLONIALES'],
  forn: ['FORN', 'FORN DE PA', 'PANADERIA', 'FORN I PASTISSERIA'],
  bodega: ['VINS', 'BODEGA', 'VINS I LICORS', 'VINOS Y LICORES'],
  ferreteria: ['FERRETERIA', 'FERRETERIA Y MENAJE'],
  draperia: ['DRAPERIA', 'NOVETATS', 'NOVEDADES', 'TEIXITS I NOVETATS'],
  farmacia: ['FARMACIA', 'FARMACIA Y LABORATORIO'],
  sabater: ['SABATERIA', 'ZAPATERIA', 'CALZADO', 'ZAPATERIA Y CALZADO'],
  perruqueria: ['BARBERIA', 'PERRUQUERIA', 'PELUQUERIA', 'PELUQUERIA Y BARBERIA'],
};
const PX_MIN = 0.036, PX_FULL = 0.054;                          // a letter 0.25 m high at the least, 0.38 m at the most
const hashOf = (seed, k) => { let h = Math.imul((seed | 0) ^ (k * 0x9e3779b9), 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/** The text for a board `width` m wide (the board's own length less its margins): the trade's words only, the longest that stays legible, chosen among the fitting by the seed. */
export function signText(seed, trade, width) {
  const words = WORDS[trade] ?? ['TENDA'];
  const fit = words.filter((t) => width / widthOf(t) >= PX_MIN);
  if (!fit.length) return words[0];
  const best = fit.filter((t) => width / widthOf(t) >= PX_FULL), pool = best.length ? best : fit;
  return pool[Math.floor(hashOf(seed, 2) * pool.length)];
}

/** Write a shop's board on its fascia with the frame's box function `F(u0, u1, d0, d1, y0, y1)` and `add(material, box)`. s increases to the viewer's left, so the writing is mirrored (sg −1). */
export function writeSign({ F, add }, text, s0, s1, ya, yb, d0, d1, mat) {
  return write({ sg: -1, B: (m, ua, ub, y0, y1, a, b) => add(m, F(ua, ub, a, b, y0, y1)) }, text, s0, s1, ya, yb, d0, d1, mat);
}

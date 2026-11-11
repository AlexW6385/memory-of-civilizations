// Brasília style — the cars and buses of about 1970: the Volkswagen Beetle (the Fusca, made in Brazil from 1959), the Willys Aero /
// Itamaraty, the Kombi, the buses of the capital's lines (a rounded Mercedes-Benz monobloco). Placed things: { at, y, rot, mat }.
import { box, lathe, place } from '../../core/geom.js';
import { turnedBox } from './util.js';

const ELL = (a, b) => (th) => 1 / Math.hypot(Math.cos(th) / a, Math.sin(th) / b);
const pod = (hw, hl, hh, y, n = 14) => lathe([[1, 0], [0.97, 0.38], [0.8, 0.82], [0.5, 0.96], [0.001, 1]].map(([r, k]) => [r, k * hh]).map(([r, h]) => [r, h]), n, ELL(hw, hl), 0, y, 0);
const wheel = (x, z, r = 0.3) => { const g = lathe([[r, -0.11], [r, 0.11], [0.001, 0.11]], 10); g.rotateZ(Math.PI / 2); g.translate(x, r, z); return g; };

/** car: { at, y, rot (0: nose toward −z), kind ('beetle' | 'aero' | 'kombi'), mat } */
export function car60(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, kind = el.kind ?? 'beetle', mat = el.mat ?? 'car_cream';
  const P = (g) => place(g, x, y, z, rot);
  const parts = [];
  if (kind === 'kombi') {
    parts.push([mat, box(-0.8, 0.28, -2.1, 0.8, 1.15, 2.1)], ['car_cream', box(-0.78, 1.15, -2.08, 0.78, 1.95, 2.1)], ['glass_outer', box(-0.79, 1.3, -2.1, 0.79, 1.75, -1.9)], ['glass_outer', box(-0.8, 1.35, -1.6, 0.8, 1.7, 1.9)]);
  } else if (kind === 'aero') {
    parts.push([mat, box(-0.9, 0.35, -2.3, 0.9, 1.0, 2.3)], [mat, box(-0.8, 1.0, -0.9, 0.8, 1.45, 1.5)], ['glass_outer', box(-0.82, 1.05, -0.85, 0.82, 1.4, 1.45)]);
  } else {
    parts.push([mat, pod(0.78, 2.0, 0.62, 0.3)], [mat, pod(0.62, 1.05, 0.62, 0.72)], ['glass_outer', pod(0.64, 1.07, 0.5, 0.78)]);
    parts.push(['steel_chrome', box(-0.8, 0.32, -2.05, 0.8, 0.42, -1.95)], ['steel_chrome', box(-0.8, 0.32, 1.95, 0.8, 0.42, 2.05)]);
  }
  for (const sx of [-0.78, 0.78]) for (const zz of kind === 'kombi' ? [-1.3, 1.3] : [-1.25, 1.25]) parts.push(['rubber', wheel(sx, zz)]);
  for (const [m, g] of parts) bag.add(m, P(g));
  col.circle(x, z, 1.4, y, y + 1.6);
}
/** bus: { at, y, rot, mat } — about 11 m long; cream above a coloured skirt, a band of windows, a rounded front, a roof sign. */
export function bus(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, mat = el.mat ?? 'paint_blue';
  const P = (g) => place(g, x, y, z, rot), L = 5.6;
  const parts = [
    [mat, box(-1.25, 0.45, -L, 1.25, 1.35, L)], ['car_cream', box(-1.23, 1.35, -L + 0.3, 1.23, 3.0, L)], ['car_cream', box(-1.0, 3.0, -L + 0.5, 1.0, 3.12, L - 0.1)],
    ['glass_outer', box(-1.25, 1.55, -L + 0.4, 1.25, 2.6, L - 0.3)], ['glass_outer', box(-1.0, 1.4, -L - 0.02, 1.0, 2.7, -L + 0.3)],
    [mat, box(-1.24, 0.9, -L + 0.2, 1.24, 1.0, L)], ['steel_chrome', box(-1.1, 0.5, -L - 0.08, 1.1, 0.62, -L + 0.1)], ['steel_chrome', box(-1.1, 0.5, L, 1.1, 0.62, L + 0.08)],
    ['lamp_white', box(-0.8, 0.85, -L - 0.06, -0.5, 1.05, -L + 0.1)], ['lamp_white', box(0.5, 0.85, -L - 0.06, 0.8, 1.05, -L + 0.1)], ['car_cream', box(-0.7, 3.12, -L + 0.8, 0.7, 3.4, -L + 1.5)],
  ];
  for (const sx of [-1.2, 1.2]) for (const zz of [-3.6, 3.3, 4.5]) parts.push(['rubber', wheel(sx, zz, 0.5)]);
  for (const [m, g] of parts) bag.add(m, P(g));
  if (Math.abs(Math.sin(rot)) > 0.7) col.rect([x - L - 0.2, z - 1.4, x + L + 0.2, z + 1.4], y, y + 3.3);   // axis-aligned approximation (buses are placed along the axes)
  else col.rect([x - 1.4, z - L - 0.2, x + 1.4, z + L + 0.2], y, y + 3.3);
  void turnedBox;
}

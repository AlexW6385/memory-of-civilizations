// The electric tram of Dessau on Kothener Strasse (docs/settlements/bauhaus-dessau.md §15): the track set in the roadway, a two-axle motor car standing
// at its stop, the stop's enamel plate in the block capitals. Dessau had an electric tram from 1894 [stated by memory of the town's history, no page read];
// its line along Kothener Strasse, the metre gauge, the car's size and colours are [inferred].
import { box, rod } from '../../core/geom.js';
import { lettering } from '../viennese/lettering.js';
import { faceFrame } from '../dutch/facade.js';

/** dessau_rails: { x0, x1, tracks: [z...] } — pairs of grooved rails flush with the paving (metre gauge), sleepers' heads as dark strips every 1.2 m. */
export function dessauRails(el, { bag }) {
  for (const zr of el.tracks) {
    for (const d of [-0.5, 0.5]) { bag.add('iron', box(el.x0, 0, zr + d - 0.035, el.x1, 0.045, zr + d + 0.035)); bag.add('iron_galv', box(el.x0, 0.045, zr + d - 0.012, el.x1, 0.05, zr + d + 0.012)); }
  }
}

/** dessau_tram: { at: [x, z], rot (0: along x, heading east), seed } — a two-axle motor car about 8.6 m long, cream over red, with its trolley pole raised. */
export function dessauTram(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot), L = 8.6, Wd = 2.2;
  const P = (p, q) => [cx + p * c + q * s, cz - p * s + q * c];
  const bx = (m, p0, q0, p1, q1, v0, v1) => { const a = P(p0, q0), b = P(p1, q1); bag.add(m, box(Math.min(a[0], b[0]), y + v0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + v1, Math.max(a[1], b[1]))); };
  bx('wood_dark', -L / 2 + 0.3, -Wd / 2 + 0.15, L / 2 - 0.3, Wd / 2 - 0.15, 0.4, 0.8);
  bx('cloth_red', -L / 2, -Wd / 2, L / 2, Wd / 2, 0.8, 1.55);
  bx('stucco_cream', -L / 2, -Wd / 2 - 0.01, L / 2, Wd / 2 + 0.01, 1.55, 1.75);
  // the windows: dark glass between slim posts, a cream waist and a roof band over them
  bx('opening', -L / 2 + 0.25, -Wd / 2 - 0.02, L / 2 - 0.25, Wd / 2 + 0.02, 1.75, 2.55);
  for (let k = 0; k <= 7; k++) { const p = -L / 2 + 0.25 + k * (L - 0.5) / 7; bx('stucco_cream', p - 0.05, -Wd / 2 - 0.03, p + 0.05, Wd / 2 + 0.03, 1.75, 2.55); }
  bx('stucco_cream', -L / 2 + 0.1, -Wd / 2 + 0.02, L / 2 - 0.1, Wd / 2 - 0.02, 2.55, 2.8);
  bx('plaster_grey', -L / 2 + 0.4, -0.55, L / 2 - 0.4, 0.55, 2.8, 2.92);
  // the end platforms' dash, the headlamp, the buffers
  for (const e of [-1, 1]) { bx('iron', e * (L / 2 + 0.05) - 0.05, -0.5, e * (L / 2 + 0.05) + 0.05, 0.5, 0.55, 0.7); bx('lamp_white', e * (L / 2) - 0.07 * e - 0.1, -0.15, e * (L / 2) + 0.1, 0.15, 1.7, 1.95); }
  // wheels: two axles 3.6 m apart, a wheel each side (thick short cylinders) on an axle
  for (const w of [-1.8, 1.8]) {
    { const a = P(w, -0.9), b = P(w, 0.9); bag.add('iron', rod([a[0], y + 0.36, a[1]], [b[0], y + 0.36, b[1]], 0.05, 6)); }
    for (const q of [-0.78, 0.78]) { const a = P(w, q - 0.05), b = P(w, q + 0.05); bag.add('iron', rod([a[0], y + 0.34, a[1]], [b[0], y + 0.34, b[1]], 0.34, 12)); }
  }
  // the trolley pole: from the roof's back, raised up and aft
  { const a = P(-0.5, 0), b = P(-3.6, 0); bag.add('iron', rod([a[0], y + 2.95, a[1]], [b[0], y + 5.3, b[1]], 0.03, 5)); }
  const a = P(-L / 2, -Wd / 2), b = P(L / 2, Wd / 2);
  col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 3);
}

/** dessau_tramstop: { at: [x, z], y } — a post with the stop's enamel plate lettered HALTESTELLE on both faces. */
export function dessauTramStop(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('iron', rod([x, y, z], [x, y + 3.3, z], 0.045, 6));
  bag.add('iron', box(x - 0.08, y, z - 0.08, x + 0.08, y + 0.12, z + 0.08));
  const px0 = x - 0.8, px1 = x + 0.8, v0 = 2.6;
  bag.add('paint_white', box(px0, y + v0, z - 0.03, px1, y + v0 + 0.36, z + 0.03));
  for (const f of ['s', 'n']) {
    const F = faceFrame(f === 's' ? [px0, z - 0.01, px1, z + 0.03] : [px0, z - 0.03, px1, z + 0.01], f);
    lettering(bag, F, y, F.w / 2, v0 + 0.07, 'HALTESTELLE', 0.2, 'iron', 1.5, 0.0);
  }
  col.circle(x, z, 0.06, y, y + 3.3);
}

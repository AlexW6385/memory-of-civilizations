// The dressing of Monks Mound (docs/settlements/cahokia.md §4.4): what stands on and before the
// mound so that its stages read from the plaza — the gates of painted cedar posts at the foot of
// each stair, the standards with their streamers along the terrace lips, the clay braziers that burn
// by the stairs. All [inferred]: the Mississippian chiefs' compounds had poles and painted posts
// (the post socket of about a metre across before the summit building, red-painted cedar at
// Woodhenge are [stated], Wikipedia "Monks Mound", "Cahokia Woodhenge"), and the people of the
// Southeast flew hide and cloth from poles; the arrangement and the effigies are ours.
import { box, lathe, rod, clothBox, addCloth } from '../../core/geom.js';
import { WALL, rng } from './kit.js';

const yAt = (el, x, z) => (typeof el.y === 'function' ? el.y(x, z) : el.y ?? 0);
/** A painted band round a post: a short tube of r, from y0 up hh. */
const band = (bag, mat, x, y0, z, r, hh) => bag.add(mat, lathe([[r, 0], [r, hh]], 10, null, x, y0, z));

/** A clay basin on three poles with a fire in it, a light over it. */
function brazier(bag, col, lights, x, y, z, k = 1) {
  for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.4; bag.add('timber', rod([x + Math.cos(a) * 0.42 * k, y - 0.1, z + Math.sin(a) * 0.42 * k], [x + Math.cos(a) * 0.2 * k, y + 0.95 * k, z + Math.sin(a) * 0.2 * k], 0.05 * k, 6)); }
  bag.add(WALL, lathe([[0.001, 0], [0.26 * k, 0.02], [0.48 * k, 0.2 * k], [0.55 * k, 0.34 * k], [0.5 * k, 0.36 * k], [0.4 * k, 0.2 * k], [0.001, 0.08]], 14, null, x, y + 0.9 * k, z));
  bag.add('opening', lathe([[0.46 * k, 0], [0.001, 0.004]], 12, null, x, y + 0.9 * k + 0.34 * k, z));
  for (let i = 0; i < 4; i++) { const a = i * 1.6 + 0.2; bag.add('bark_dark', rod([x + Math.cos(a) * 0.36 * k, y + 0.9 * k + 0.37 * k, z + Math.sin(a) * 0.36 * k], [x, y + 0.9 * k + 0.43 * k, z], 0.035 * k, 5)); }
  bag.add('flame', lathe([[0.15 * k, 0], [0.12 * k, 0.12 * k], [0.06 * k, 0.34 * k], [0.001, 0.5 * k]], 8, (th) => 1 + 0.25 * Math.sin(th * 3), x, y + 0.9 * k + 0.4 * k, z));
  col.circle(x, z, 0.5 * k, y, y + 1.3 * k);
  if (lights) lights.push({ at: [x, y + 2.0 * k, z], color: '#ff9a4a', intensity: 4, distance: 12 });
}
export { brazier };

/**
 * ramp_gate: { c: [x, z] (the middle of the foot of a stair), y, span (between the posts), h, braziers } — two tall posts of
 * cedar painted red with white bands, a pole across them hung with strips of cloth and hide, a disc
 * of white and ochre above each post; at the foot of each post a brazier.
 */
function rampGate(el, { bag, col, lights }) {
  const [cx, cz] = el.c, span = el.span ?? 14, h = el.h ?? 9, y = yAt(el, cx, cz), rand = rng(el.seed || 9);
  for (const sd of [-1, 1]) {
    const px = cx + sd * span / 2, yy = yAt(el, px, cz);
    bag.add('timber_red', lathe([[0.001, 0], [0.48, 0], [0.43, h * 0.5], [0.36, h], [0.3, h + 0.35], [0.001, h + 0.5]], 10, null, px, yy - 0.8, cz));
    col.circle(px, cz, 0.45, yy - 0.5, yy + h);
    for (const f of [0.18, 0.42, 0.66]) band(bag, 'paint_white', px, yy + h * f, cz, 0.43 - 0.07 * f, 0.34);
    // the disc above: a white face with an ochre boss, turned to the south
    const d1 = lathe([[0.001, 0], [0.95, 0], [0.95, 0.1], [0.001, 0.1]], 16, null, 0, 0, 0); d1.rotateX(Math.PI / 2).translate(px, yy + h + 1.2, cz + 0.1);
    bag.add('paint_white', d1);
    const d2 = lathe([[0.001, 0], [0.45, 0], [0.45, 0.14], [0.001, 0.14]], 14, null, 0, 0, 0); d2.rotateX(Math.PI / 2).translate(px, yy + h + 1.2, cz + 0.12);
    bag.add('paint_ochre', d2);
    bag.add('timber', rod([px, yy + h + 0.3, cz + 0.02], [px, yy + h + 1.2, cz + 0.02], 0.05, 6));
    if (el.braziers !== false) brazier(bag, col, lights, px - sd * 1.6, yy + 0.02, cz + 1.5, 1);
  }
  // the pole across, and the strips hung from it
  const ly = y + h - 1.2;
  bag.add('timber_red', rod([cx - span / 2, ly, cz], [cx + span / 2, ly, cz], 0.17, 8));
  const n = 13;
  for (let k = 0; k < n; k++) {
    const x = cx - span / 2 + 0.7 + (span - 1.4) * k / (n - 1), len = 1.5 + rand() * 1.0, w = 0.2 + rand() * 0.08, mat = k % 3 === 0 ? 'cloth_red' : k % 3 === 1 ? 'cloth_white' : 'hide_tan';
    bag.add('linen', rod([x, ly, cz + 0.02], [x, ly - 0.2, cz + 0.02], 0.01, 4));
    addCloth(bag, mat, clothBox(x - w, ly - 0.2 - len, cz - 0.012, x + w, ly - 0.2, cz + 0.012, 0.25), ly - 0.2);
  }
}

/**
 * standard: { c, y, h, seed } — a tall cedar pole, red, with a white band, a crossbar and three streamers of cloth and hide that stir in the wind, a white disc on a short mast at its head.
 */
function standard(el, { bag, col }) {
  const [x, z] = el.c, y = yAt(el, x, z), h = el.h ?? 10, rand = rng(el.seed || 5);
  bag.add('timber_red', lathe([[0.001, 0], [0.26, 0], [0.22, h], [0.001, h + 0.2]], 8, null, x, y - 0.8, z));
  col.circle(x, z, 0.24, y - 0.5, y + h);
  band(bag, 'paint_white', x, y + h * 0.45, z, 0.235, 0.3); band(bag, 'paint_white', x, y + h * 0.75, z, 0.225, 0.3);
  bag.add('timber', rod([x - 1.2, y + h - 1.0, z], [x + 1.2, y + h - 1.0, z], 0.05, 6));
  const mats = ['cloth_red', 'cloth_white', 'hide_tan', 'cloth_ochre'];
  for (let k = 0; k < 3; k++) {
    const xk = x - 1.0 + k * 1.0, len = 2.0 + rand() * 1.4, w = 0.22 + rand() * 0.06, top = y + h - 1.0;
    addCloth(bag, mats[(k + (el.seed || 0)) % 4], clothBox(xk - w, top - len, z - 0.012, xk + w, top, z + 0.012, 0.25), top);
  }
  const d = lathe([[0.001, 0], [0.5, 0], [0.5, 0.07], [0.001, 0.07]], 14, null, 0, 0, 0); d.rotateX(Math.PI / 2).translate(x, y + h + 0.7, z + 0.05);
  bag.add('paint_white', d);
  bag.add('timber', rod([x, y + h, z], [x, y + h + 0.7, z], 0.04, 6));
}

export const moundElements = { ramp_gate: rampGate, standard, brazier: (el, ctx) => brazier(ctx.bag, ctx.col, ctx.lights, el.c[0], yAt(el, el.c[0], el.c[1]), el.c[1], el.k ?? 1) };
void box;

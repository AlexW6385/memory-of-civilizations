// Water and plaza life of Tenochtitlan (docs/settlements/tenochtitlan.md §15): the washing-stairs on the canals with the
// women at their washing (the Florentine Codex; Cortés: "all the streets have water in them, and canoes"), canoes moored and
// fished from, tule beds in the channels of the chinampas, canoes tied at the plots; and in the Sacred Precinct the things
// of the plaza at eye level — standards at the gates, the temalacatl, the cuauhxicalli, small shrines (momoztli), braziers,
// offerings, sweepers, guards.

import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { carved } from '../maya/meso.js';
import { inst, bigJarKit } from './street.js';
import { mxPeople } from './life.js';
import { skull } from './houses.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** landing { rect, dir, y0, y1, water, seed }: the stair down to the water, women washing on its second step, the wash laid out. */
export function landing(el, ctx) {
  const { bag } = ctx, rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, L = STYLES.life.elements;
  STYLES.aztec.elements.stairs({ rect: el.rect, y0: el.y0, y1: el.y1, dir: el.dir, mat: 'andesite' }, ctx);
  const alongX = el.dir === 'e' || el.dir === 'w', run = alongX ? x1 - x0 : z1 - z0, n = Math.max(1, Math.round((el.y1 - el.y0) / 0.22)), rs = (el.y1 - el.y0) / n;
  const up = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }[el.dir], start = el.dir === 'n' ? [(x0 + x1) / 2, z1] : el.dir === 's' ? [(x0 + x1) / 2, z0] : el.dir === 'w' ? [x1, (z0 + z1) / 2] : [x0, (z0 + z1) / 2];
  const at = (t, side = 0) => [start[0] + up[0] * run * t - up[1] * side, start[1] + up[1] * run * t + up[0] * side], yS = (k) => el.y0 + rs * (k + 1);
  const face = Math.atan2(-up[0], -up[1]);                                 // toward the water
  const people = [];
  const nw = 1 + Math.floor(rand() * 2.4);
  for (let i = 0; i < nw; i++) { const p = at(0.4 + i * 0.04, (i - (nw - 1) / 2) * 0.9); people.push([p[0], p[1], yS(Math.min(n - 1, Math.round(n * 0.4))), face, 'washer', el.seed + i * 3, undefined]); }
  // the wash laid out on the upper step: white cloths and a red one, a basket and jars
  for (let i = 0; i < 3; i++) { const p = at(0.75, (i - 1) * 0.9); const y = yS(Math.min(n - 1, Math.round(n * 0.7))); bag.add(i === 1 ? 'cloth_red' : 'cloth_white', box(p[0] - 0.3, y, p[1] - 0.25, p[0] + 0.3, y + 0.03, p[1] + 0.25)); }
  const pj = at(0.9, 1.2); L.pot({ at: pj, y: yS(n - 1), seed: el.seed, kind: 'water_pot', n: 2 }, ctx);
  const pb = at(0.85, -1.3); L.basket({ at: pb, y: yS(n - 1), seed: el.seed + 1, n: 1 }, ctx);
  if (people.length) mxPeople({ people }, ctx);
}

/** fisher_canoe { at, dir, len, y, seed, kind }: a moored or drifting canoe with its fisher standing in the stern, his net and catch. */
export function fisherCanoe(el, ctx) {
  const E = STYLES.aztec.elements, rand = rng(el.seed || 1);
  E.acalli({ at: el.at, dir: el.dir, len: el.len, y: el.y, seed: el.seed, cargo: el.cargo }, ctx);
  const [dx, dz] = el.dir, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L;
  const p = [el.at[0] - ux * el.len * 0.33, el.at[1] - uz * el.len * 0.33];
  mxPeople({ people: [[p[0], p[1], el.y - 0.22, Math.atan2(ux, uz) + (rand() < 0.5 ? 1.2 : -1.2), el.fisher ?? 'fisher', el.seed + 9, el.fisher === 'seller' ? { pose: 'sit_ground' } : undefined]] }, ctx);
}

const tule = () => carved('mx-tule', (k) => {
  const r = rng(61);
  for (let i = 0; i < 16; i++) { const a = r() * 6.28, d = 0.1 + r() * 0.6, h = 1.8 + r() * 1.2, lean = 0.1 + r() * 0.25; k.seg('raupo', [Math.cos(a) * d, -0.3, Math.sin(a) * d], [Math.cos(a) * (d + lean * h), h, Math.sin(a) * (d + lean * h)], 0.014, 0.014, 0.004, 0.004); }
  for (let i = 0; i < 5; i++) { const a = r() * 6.28, d = 0.1 + r() * 0.5, h = 1.6 + r() * 1.0; k.geo('bark_dark', lathe([[0.001, 0], [0.03, 0.02], [0.02, 0.3], [0.001, 0.35]], 6).translate(Math.cos(a) * (d + 0.15), h, Math.sin(a) * (d + 0.15))); }
});
/** tule_beds { at: [[x, z, s, y]] }: stands of tule (the reed Typha) in the channels, 2–3 m high. */
export function tuleBeds(el, ctx) { for (const [x, z, s, y] of el.at) inst(ctx.bag, tule(), x, y ?? -0.7, z, (x * 3 + z) % 6.28, s ?? 1, 220); }

// ---- the plaza ---------------------------------------------------------------------------------------------------
/** A standard (pantli): a tall pole with a paper banner and a crest of plumes. */
const standard = () => carved('mx-pantli', (k) => {
  k.bx('timber', -0.06, 0.06, 0, 4.2, -0.06, 0.06); k.bx('stucco_pale', -0.3, 0.3, 0, 0.3, -0.3, 0.3);
  k.fz('cloth_white', [-0.02, 0.02, 2.2, 3.7], [-0.02, 0.02, 2.2, 3.7], 0.06, 0.95);
  k.bx('stucco_red', -0.021, 0.021, 2.35, 2.55, 0.06, 0.95); k.bx('maya_blue', -0.021, 0.021, 3.35, 3.55, 0.06, 0.95);
  for (let i = 0; i < 7; i++) { const a = -0.7 + i * 0.23; k.seg(i % 2 ? 'clay_green' : 'maya_blue', [0, 4.2, 0], [0.0, 4.2 + Math.cos(a) * 0.9, Math.sin(a) * 0.55], 0.05, 0.015, 0.02, 0.006); }
});
/** The temalacatl: the round stone of the gladiatorial sacrifice on its platform, the post for the captive's cord at its middle. */
const temalacatl = () => carved('mx-temalacatl', (k) => {
  k.bx('stucco_pale', -2.4, 2.4, 0, 0.5, -2.4, 2.4);
  k.geo('andesite', lathe([[0.001, 0.5], [1.4, 0.5], [1.4, 1.0], [1.2, 1.1], [0.001, 1.1]], 24));
  k.geo('stucco_red', lathe([[1.0, 1.1], [1.05, 1.11], [0.2, 1.11], [0.2, 1.1]], 24));
  k.bx('timber', -0.08, 0.08, 1.1, 1.5, -0.08, 0.08);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; { const cx = Math.cos(a) * 1.9, cz = Math.sin(a) * 1.9; k.bx('stucco_pale', cx - 0.3, cx + 0.3, 0.5, 0.9, cz - 0.3, cz + 0.3); } }
});
/** The cuauhxicalli ("eagle gourd"): a great round stone vessel for the hearts, with the sun disc carved on its rim, on a plinth. */
const cuauhxicalli = () => carved('mx-cuauhxicalli', (k) => {
  k.bx('stucco_pale', -1.3, 1.3, 0, 0.45, -1.3, 1.3);
  k.geo('basalt', lathe([[0.001, 0.45], [0.8, 0.45], [1.0, 0.8], [1.05, 1.1], [0.88, 1.1], [0.001, 0.85]], 20));
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; { const cx = Math.cos(a) * 1.02, cz = Math.sin(a) * 1.02; k.bx('stucco_red', cx - 0.08, cx + 0.08, 0.7, 1.0, cz - 0.08, cz + 0.08); } }
});
/** A momoztli: a small stepped altar platform at a crossing, a stone slab on it, a skull rack of three and a brazier. */
const momoztli = () => carved('mx-momoztli', (k) => {
  k.bx('stucco_pale', -2.0, 2.0, 0, 0.55, -2.0, 2.0); k.bx('plaster_white', -1.5, 1.5, 0.55, 1.1, -1.5, 1.5); k.bx('stucco_red', -1.55, 1.55, 0.95, 1.1, -1.55, 1.55);
  k.bx('basalt', -0.5, 0.5, 1.1, 1.4, -0.35, 0.35);
  k.bx('timber', -0.9, 0.9, 1.1, 1.2, 1.1, 1.14);
  k.geo('pottery_dark', lathe([[0.2, 0], [0.12, 0.2], [0.14, 0.45], [0.3, 0.56], [0.3, 0.65], [0.001, 0.6]], 10).translate(1.0, 1.1, -0.9));
  for (let i = 0; i < 3; i++) { k.bx('stucco_pale', -0.7 + i * 0.7 - 0.05, -0.65 + i * 0.7 + 0.05, 1.1, 1.3, 0.2, 0.3); }
});

const D = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
/** plaza_dress { gates: [[x, z, dir]], pieces: [[kind, x, z, rot]], people: [...] }: the plaza's fixtures. */
export function plazaDress(el, ctx) {
  const { bag, col } = ctx;
  for (const [kind, x, z, rot] of el.pieces) {
    if (kind === 'standard') inst(bag, standard(), x, 0, z, rot ?? 0, 1, 160);
    else if (kind === 'temalacatl') { inst(bag, temalacatl(), x, 0, z, 0, 1, 200); col.rect([x - 2.4, z - 2.4, x + 2.4, z + 2.4], 0, 0.5); col.circle(x, z, 1.4, 0.5, 1.1); }
    else if (kind === 'cuauhxicalli') { inst(bag, cuauhxicalli(), x, 0, z, 0, 1, 200); col.rect([x - 1.3, z - 1.3, x + 1.3, z + 1.3], 0, 0.5); col.circle(x, z, 1.0, 0.5, 1.1); }
    else if (kind === 'momoztli') { inst(bag, momoztli(), x, 0, z, rot ?? 0, 1, 220); col.rect([x - 2, z - 2, x + 2, z + 2], 0, 0.55); col.rect([x - 1.5, z - 1.5, x + 1.5, z + 1.5], 0, 1.1); for (let i = 0; i < 3; i++) inst(bag, skull(), x + (-0.7 + i * 0.7), 1.2, z + 0.25 + 0.05, 0, 1.2, 60); }
    else if (kind === 'jar') inst(bag, bigJarKit(), x, 0, z, rot ?? 0, 1.2, 80);
  }
  if (el.people?.length) mxPeople({ people: el.people }, ctx);
}

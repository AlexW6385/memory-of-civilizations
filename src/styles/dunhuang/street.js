// Street furniture of Shazhou (docs/settlements/dunhuang.md §14): the wayside shrine of rammed earth with its painted Buddha, its lamp and its offerings,
// the iron brazier of the watch at the gate. Both light themselves at night (oilLamp pushes a light, the brazier its own; nightlight.js gives them halos).
import { box, lathe, rod } from '../../core/geom.js';
import { Panel, wallPanel, PAL, buddhaM, apsaraM } from './paint.js';
import { oilLamp } from './caves.js';

/** The frame of a thing that faces `face` ('s' toward +z, 'n', 'e' toward +x, 'w'): u to the right of one looking at its front, v out of the front. */
export function faceFrame(at, face) {
  const en = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] }[face], ex = [en[1], -en[0]], [x, z] = at;
  const P = (u, v) => [x + ex[0] * u + en[0] * v, z + ex[1] * u + en[1] * v];
  const R = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  return { en, ex, P, R };
}

/**
 * dh_wayshrine { at: [x, z], face, y? }: a roadside shrine of the caravans [inferred: the travellers of the Silk Road asked for a safe road at shrines;
 * rammed earth under a small tiled roof, a niche with a Buddha painted in the colours of the caves, a stone lamp stand, a bowl of incense and a jar of offerings].
 * The back wall stands at v = −0.55…0 (at is its front's middle), the plinth runs 2 m out.
 */
function wayshrine(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, F = faceFrame(el.at, el.face ?? 's'), B = (m, u0, v0, u1, v1, y0, y1) => { const r = F.R(u0, v0, u1, v1); bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); };
  const S = (m, u0, v0, u1, v1, y0, y1) => { B(m, u0, v0, u1, v1, y0, y1); col.rect(F.R(u0, v0, u1, v1), y0, y1); };
  B('banco_rough', -1.3, -0.7, 1.3, 2.0, y, y + 0.1);                                  // the plinth, a low step of beaten earth
  S('earth_wall', -1.0, -0.55, -0.55, 0, y + 0.1, y + 2.55); S('earth_wall', 0.55, -0.55, 1.0, 0, y + 0.1, y + 2.55);   // the piers
  S('earth_wall', -1.0, -0.55, 1.0, 0, y + 2.1, y + 2.55);                              // the lintel
  S('earth_wall', -0.55, -0.55, 0.55, -0.35, y + 0.1, y + 2.1);                         // the niche's back
  S('earth_wall', -0.55, -0.35, 0.55, 0, y + 0.1, y + 0.78);                            // the niche's sill, a low altar
  B('lime_plaster', -0.55, -0.37, 0.55, -0.35, y + 0.78, y + 2.1);
  B('lacquer_red', -0.6, -0.04, -0.55, 0.06, y + 0.78, y + 2.16); B('lacquer_red', 0.55, -0.04, 0.6, 0.06, y + 0.78, y + 2.16); B('lacquer_red', -0.6, -0.04, 0.6, 0.06, y + 2.1, y + 2.16);   // the frame of the niche
  // the painted Buddha on the niche's back, seen from the front (the panel's normal is the front's)
  const a = F.P(-0.55, -0.37), b = F.P(0.55, -0.37), P = wallPanel(bag, a, b, y + 0.78, F.en, 0.0);
  P.rect(PAL.green2, 0, 0, 1.1, 1.32, 1); P.rect(PAL.red, 0, 0, 1.1, 0.07, 2);
  buddhaM(P, 0.55, 0.1, 1.15, { robe: PAL.red2 }, 3); apsaraM(P, 0.2, 1.15, 0.5, 1, {}, 3); apsaraM(P, 0.9, 1.15, 0.5, -1, {}, 3);
  P.flush();
  // the roof: a small gable of tile over the wall, its ridge along u; the eave's rafter heads
  B('timber', -1.2, -0.75, 1.2, 0.25, y + 2.55, y + 2.65);
  for (let k = 0; k < 5; k++) { const v0 = -0.75 + k * 0.2; B('tile_grey', -1.2, v0, 1.2, v0 + 0.2, y + 2.65 + 0.07 * Math.min(k, 4 - k) * 1.0, y + 2.72 + 0.07 * Math.min(k, 4 - k)); }
  B('roof_ridge', -1.25, -0.35, 1.25, -0.15, y + 2.88, y + 3.02);
  for (let u = -1.1; u <= 1.11; u += 0.2) B('timber_red', u - 0.04, 0.12, u + 0.04, 0.25, y + 2.5, y + 2.58);
  // the stone lamp stand beside the plinth's edge, an oil lamp on it (a light), an incense bowl before the niche, a jar of offerings
  const [lx, lz] = F.P(0.95, 1.1);
  bag.add('granite_grey', lathe([[0.2, 0], [0.2, 0.08], [0.09, 0.14], [0.08, 0.7], [0.14, 0.76], [0.15, 0.82], [0.001, 0.82]], 9, null, lx, y + 0.1, lz)); col.circle(lx, lz, 0.2, y + 0.1, y + 0.9);
  oilLamp(ctx, lx, y + 0.92, lz, 0.2, 1.6, 6);
  const [bx, bz] = F.P(0, 0.42);
  bag.add('bronze', lathe([[0.001, 0], [0.12, 0], [0.16, 0.08], [0.18, 0.12], [0.001, 0.12]], 10, null, bx, y + 0.78, bz));
  for (let k = 0; k < 5; k++) { const [sx, sz] = F.P(-0.06 + k * 0.03, 0.42); bag.add('wood_dark', rod([sx, y + 0.9, sz], [sx, y + 1.12, sz], 0.005, 4)); }
  const [jx, jz] = F.P(-0.95, 1.1);
  bag.add('pottery_dark', lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.2], [0.16, 0.42], [0.1, 0.5], [0.12, 0.54], [0.001, 0.54]], 9, null, jx, y + 0.1, jz)); col.circle(jx, jz, 0.2, y + 0.1, y + 0.62);
  // a strip of red cloth tied to the pier, the offering of a traveller
  B('cloth_red', 0.99, 0.0, 1.01, 0.2, y + 1.2, y + 1.9);
}

/** dh_brazier { at: [x, z], y? }: an iron bowl of charcoal on three legs (the watch at the gate warms itself by it; the glow of the coals is `flame`). */
function brazier(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, y = el.y ?? 0;
  bag.add('iron', lathe([[0.001, 0.46], [0.3, 0.5], [0.4, 0.72], [0.42, 0.78], [0.38, 0.78], [0.3, 0.6], [0.001, 0.56]], 12, null, x, y, z));
  for (const a of [0.5, 2.6, 4.7]) bag.add('iron', rod([x + Math.cos(a) * 0.3, y + 0.58, z + Math.sin(a) * 0.3], [x + Math.cos(a) * 0.42, y, z + Math.sin(a) * 0.42], 0.025, 5));
  bag.add('flame', lathe([[0.001, 0], [0.32, 0.0], [0.28, 0.07], [0.001, 0.11]], 9, null, x, y + 0.69, z));
  col.circle(x, z, 0.42, y, y + 0.78);
  ctx.lights?.push({ at: [x, y + 0.95, z], color: '#ff8a40', intensity: 3.0, distance: 8 });
}
export const STREET_ELEMENTS = { dh_wayshrine: wayshrine, dh_brazier: brazier };
export { Panel };

// Athens — the buildings of the Acropolis' east terrace that one can walk into (docs/settlements/athens.md §12). The summit had no ordinary houses
// in 410 BC; what stood there beside the temples were the dwellings and offices of the sanctuary's people and the workshops of its works. Eight
// buildings stand on the open ground east of the Parthenon (x 66–126, z −34…−6), all behind the visitor at the arrival (who looks west):
//   · three houses of the walk-in plan (simon_house: shop on the street, andron, court, loom room, kitchen, store), each given its occupants' trade:
//     the house of the Arrephoroi (the girls who began the weaving of Athena's peplos: the loom room; the cloth shop is the sanctuary's wool and
//     linen store), the temple warden's (neokoros: oil, wicks and incense for the lamps and the rites), and the lodging of the commissioners of the
//     Erechtheion (epistatai) with the carpenters' stock (their accounts of 409/8 BC, IG I³ 474–479, name the masons, carpenters and sculptors)
//   · five workshops of the works, open to a lane: two of the stone-cutters, the sculptor's (a panel of the frieze, half carved), the carpenters', the
//     bronze-smith's who cast and mended the dedications
// [stated: the accounts name the trades and the Arrephoroi's service; Pausanias 1.27.3 their dwelling by Athena Polias' temple] [inferred: the places on the terrace].
// All are elements of the greek style (simon_house, the shop fittings of furnishShop) and one of this folder's (acro_works).

import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { rangeRoof } from '../../styles/greek/house-interior.js';
import { furnishShop } from '../../styles/greek/shops.js';
import { ACRO } from './layout.js';

const Y = ACRO.top + 0.04;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export const HOUSES = [
  { id: 'house of the Arrephoroi', rect: [70, -33, 83, -19], trade: 'cloth', seed: 4101 },
  { id: "temple warden's house", rect: [85, -33, 98, -19], trade: 'perfume', seed: 4102 },
  { id: "commissioners' lodging", rect: [100, -33, 113, -19], trade: 'carpenter', seed: 4103 },
];
export const WORKS = [
  { id: 'stone-cutters 1', rect: [66, -13, 75, -6.5], trade: 'mason', seed: 4111 },
  { id: 'stone-cutters 2', rect: [77, -13, 86, -6.5], trade: 'mason', seed: 4112 },
  { id: "sculptor's workshop", rect: [88, -13, 97, -6.5], trade: 'sculptor', seed: 4113 },
  { id: "carpenters' workshop", rect: [99, -13, 108, -6.5], trade: 'carpenter', seed: 4114 },
  { id: "bronze-smith's workshop", rect: [110, -13, 119, -6.5], trade: 'bronze', seed: 4115 },
];

/** acro_works: { rect, trade ('mason' | 'sculptor' | 'carpenter' | 'bronze'), y, seed } — a workshop of one room 9 × 6.5 m, its wide door on the north (z0) side. */
function acroWorks(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? Y, H = 3.0, t = 0.45, rand = rng(el.seed || 1), trade = el.trade, wm = 'mud_plaster';
  const seg = (a, b, c, alongX, y0, y1, m) => { if (b - a < 0.02) return; const r = alongX ? [a, c - t / 2, b, c + t / 2] : [c - t / 2, a, c + t / 2, b]; bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  // the floor: beaten earth over a bed of chips
  bag.add('lime_plaster', box(x0, y - 0.3, z0, x1, y, z1)); col.floor([x0, z0, x1, z1], y);
  // the walls: the north front with its wide door (2.6 m) and a high window; the others plain; a footing of rubble under each
  const door = [x0 + 1.2, x0 + 3.8];
  for (const [a, b, c, ax] of [[x0, x1, z1 - t / 2, true], [z0, z1, x0 + t / 2, false], [z0, z1, x1 - t / 2, false]]) { seg(a, b, c, ax, y - 0.6, y + 0.7, 'rubble'); seg(a, b, c, ax, y + 0.7, y + H, wm); }
  seg(x0, door[0], z0 + t / 2, true, y - 0.6, y + 0.7, 'rubble'); seg(x0, door[0], z0 + t / 2, true, y + 0.7, y + H, wm);
  seg(door[1], x1, z0 + t / 2, true, y - 0.6, y + 0.7, 'rubble'); seg(door[1], x1, z0 + t / 2, true, y + 0.7, y + H - 0.0, wm);
  seg(door[0], door[1], z0 + t / 2, true, y + 2.4, y + H, wm);
  bag.add('timber', box(door[0] - 0.1, y + 2.28, z0, door[1] + 0.1, y + 2.42, z0 + t));                       // the lintel
  bag.add('limestone', box(door[0], y - 0.1, z0, door[1], y + 0.04, z0 + t));                                   // the threshold
  bag.add('timber', box(x1 - 2.4, y + 0.0, z0 - 0.02, x1 - 2.36, y + 2.0, z0 + 0.7));                          // a shutter standing open
  rangeRoof(ctx, [x0, z0, x1, z1], y, H);
  const F = { R: (u0, v0, u1, v1) => [x0 + u0, z0 + v0, x0 + u1, z0 + v1], P: (u, v) => [x0 + u, z0 + v], out: [0, -1] }, W = x1 - x0, D = z1 - z0;
  if (trade === 'mason' || trade === 'sculptor') {
    // the bench of the stone-cutter along the back wall: mallets, pointed chisels, claw chisels, the drill with its bow, a plumb-line; a stone sink of water
    const bz = z1 - t - 0.2;
    bag.add('timber', box(x0 + t + 0.3, y, bz - 0.7, x1 - t - 0.3, y + 0.82, bz)); col.rect([x0 + t + 0.3, bz - 0.7, x1 - t - 0.3, bz], y, y + 0.82);
    for (let k = 0; k < 7; k++) { const u = x0 + t + 0.7 + k * 0.5; bag.add('iron', box(u, y + 0.82, bz - 0.5 + (k % 3) * 0.1, u + 0.03, y + 0.84, bz - 0.3 + (k % 3) * 0.1)); }
    bag.add('wood_dark', lathe([[0.001, 0], [0.06, 0], [0.07, 0.08], [0.001, 0.1]], 8, null, x0 + t + 0.5, y + 0.82, bz - 0.35));
    bag.add('wood_dark', box(x0 + t + 1.6, y + 0.82, bz - 0.55, x0 + t + 2.2, y + 0.88, bz - 0.45));
    bag.add('limestone', box(x1 - t - 1.4, y, z0 + t + 0.4, x1 - t - 0.5, y + 0.4, z0 + t + 1.0)); col.rect([x1 - t - 1.4, z0 + t + 0.4, x1 - t - 0.5, z0 + t + 1.0], y, y + 0.4);
    bag.add('water', box(x1 - t - 1.3, y + 0.3, z0 + t + 0.5, x1 - t - 0.6, y + 0.33, z0 + t + 0.9));
    // the block on its trestles (a marble block roughed out), another squared on the floor, the chips about
    const tx = x0 + 2.2 + (rand() < 0.5 ? 0 : 1.6), tz = z0 + 2.5;
    for (const dx of [-0.8, 0.8]) { bag.add('timber', box(tx + dx - 0.12, y, tz - 0.4, tx + dx + 0.12, y + 0.6, tz + 0.4)); }
    bag.add('marble', box(tx - 1.1, y + 0.6, tz - 0.42, tx + 1.1, y + 1.1, tz + 0.42)); col.rect([tx - 1.2, tz - 0.5, tx + 1.2, tz + 0.5], y, y + 1.1);
    if (trade === 'sculptor') {
      // a panel of the frieze (a figure in relief, half pointed out of the block) leaning on the side wall, a standing figure of Pentelic marble on a pole, the model in clay on a stand
      bag.add('marble', box(x1 - t - 0.4, y + 0.0, z0 + 2.2, x1 - t - 0.05, y + 1.2, z0 + 3.9)); col.rect([x1 - t - 0.5, z0 + 2.2, x1 - t, z0 + 3.9], y, y + 1.2);
      bag.add('marble_smooth', box(x1 - t - 0.46, y + 0.1, z0 + 2.3, x1 - t - 0.4, y + 1.1, z0 + 3.1));
      bag.add('marble_smooth', lathe([[0.001, 0], [0.16, 0.02], [0.2, 0.5], [0.16, 0.9], [0.1, 1.2], [0.1, 1.35], [0.001, 1.5]], 8, null, x0 + 6.4, y + 0.0, z0 + 4.6)); col.circle(x0 + 6.4, z0 + 4.6, 0.25, y, y + 1.5);
      bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.02], [0.08, 0.3], [0.05, 0.4], [0.001, 0.5]], 8, null, x0 + 3.6, y + 0.8, bz - 0.35));
    }
    for (let k = 0; k < 14; k++) bag.add('limestone', box(...(() => { const a = tx - 1.4 + rand() * 2.8, b = tz - 1 + rand() * 2; return [a, y, b, a + 0.1 + rand() * 0.1, y + 0.05, b + 0.1]; })()));
    bag.add('marble', box(x0 + 5.3, y, z0 + 3.4, x0 + 6.6, y + 0.8, z0 + 4.4)); col.rect([x0 + 5.3, z0 + 3.4, x0 + 6.6, z0 + 4.4], y, y + 0.8);
    bag.add('wood_dark', box(x0 + 0.6, y, z0 + 4.5, x0 + 1.9, y + 0.05, z0 + 4.7));
  } else {
    // the fittings of the Agora's shops: the carpenter's bench and half-made couch, the bronze-smith's hearth, anvil and wares
    furnishShop(ctx, F, y, 0.5, W - 0.5, 0.5, D - 0.5, trade, rand);
  }
  // a lamp hung by the back wall (a clay lamp on a bronze stand) lights the room
  ctx.lights.push({ at: [x0 + W * 0.55, y + 2.0, z0 + D * 0.55], color: trade === 'bronze' ? '#ff9a4a' : '#ffb46b', intensity: 2.6, distance: 8 });
  bag.add('bronze', lathe([[0.001, 0], [0.05, 0], [0.06, 0.06], [0.001, 0.07]], 8, null, x0 + W * 0.55, y + 1.93, z0 + D * 0.55));
  bag.add('flame', lathe([[0.001, 0], [0.012, 0.012], [0.001, 0.05]], 6, null, x0 + W * 0.55 + 0.04, y + 1.98, z0 + D * 0.55));
  bag.add('rope_fibre', box(x0 + W * 0.55 - 0.004, y + 2.0, z0 + D * 0.55 - 0.004, x0 + W * 0.55 + 0.004, y + H - 0.12, z0 + D * 0.55 + 0.004));
}
Object.assign(STYLES.greek.elements, { acro_works: acroWorks });

const base = (id, elements, extra) => ({ id, style: 'greek', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-420, -420, 420, 420], entrance: { at: [-300, 70], facing: 'e' }, ...extra });

/** The plans: the three houses (with their rooms, as the walk-in houses of the town) and the five workshops. */
export function acropolisWorks() {
  const plans = [];
  for (const h of HOUSES) {
    const [X0, Z0, X1, Z1] = h.rect, t = 0.5, sz = Z1 - t - 3.1, xl = X0 + t + 4.3, xk = xl + 0.4 + 3.4;
    plans.push(base(`athens-acro-${plans.length}`, [{ t: 'athens_open_house', rect: h.rect, y: Y, seed: h.seed, trade: h.trade }], { rooms: [
      { id: `${h.id}: store`, rect: [X0 + 0.5, Z0 + 0.5, X0 + 5, Z0 + 5.3], y: Y, kind: 'inner', market: false },
      { id: `${h.id}: andron`, rect: [X0 + 7.4, Z0 + 0.5, X1 - 0.5, Z0 + 5.3], y: Y, kind: 'inner' },
      { id: `${h.id}: loom room`, rect: [X0 + 0.5, sz, xl, Z1 - 0.5], y: Y, kind: 'inner' },
      { id: `${h.id}: kitchen`, rect: [xl + 0.4, sz, xk, Z1 - 0.5], y: Y, kind: 'inner' },
      { id: `${h.id}: store room`, rect: [xk + 0.4, sz, X1 - 0.5, Z1 - 0.5], y: Y, kind: 'inner' }] }));
  }
  plans.push(base('athens-acro-works', WORKS.map((w) => ({ t: 'acro_works', rect: w.rect, trade: w.trade, y: Y, seed: w.seed })), { rooms: WORKS.map((w) => ({ id: w.id, rect: [w.rect[0] + 0.5, w.rect[1] + 0.5, w.rect[2] - 0.5, w.rect[3] - 0.5], y: Y, kind: 'inner', market: false })) }));
  return plans;
}

/** The people of the houses and workshops (life elements, y = the summit's paving). */
export function acropolisLife() {
  const R = rng(6001), sd = () => Math.floor(R() * 1e9), L = [], pick = (a) => a[Math.floor(R() * a.length)];
  const man = (at, rot, o = {}) => L.push({ t: 'figure', at, y: Y, rot, seed: sd(), skin: 'skin_medium', dress: 'tunic', legs: 'bare', cloth: pick(['cloth_brown', 'linen', 'cloth_ochre', 'cloth_grey']), over: 'belt', hair: 'short', beard: 0.9, hat: 'none', feet: 'bare', pose: 'stand', ...o });
  const woman = (at, rot, o = {}) => L.push({ t: 'figure', at, y: Y, rot, seed: sd(), skin: 'skin_light', dress: 'robe', cloth: pick(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white']), cloth2: 'cloth_white', over: 'shawl', hair: 'bun', hat: 'none', pose: 'stand', ...o });
  const girl = (at, rot, o = {}) => woman(at, rot, { child: true, h: 1.35, hair: 'long', cloth: 'cloth_white', ...o });
  // the houses (the plan of the open houses, openLife of fronts.js): keeper in the street room, the girls or the women at the loom, a slave at the hearth, the master in the andron
  HOUSES.forEach((h, k) => {
    const [X0, Z0, , Z1] = h.rect;
    if (k === 0) { man([X0 + 3.9, Z0 + 2.5], 0, { cloth: 'cloth_white', cloth2: 'cloth_brown', dress: 'robe', over: 'cloak', beard: 1 }); girl([X0 + 1.42, Z1 - 1.85], Math.PI, { pose: 'stand' }); girl([X0 + 2.5, Z1 - 1.5], Math.PI, { pose: 'stand' }); girl([X0 + 3.3, Z1 - 1.9], Math.PI / 2, { pose: 'sit_low' }); }
    else { man([X0 + 3.9, Z0 + 2.5], 0, {}); woman([X0 + 2.6, Z1 - 1.85], Math.PI, { pose: 'stand' }); }
    woman([X0 + 6.65 + 0.0, Z1 - 1.75], Math.PI / 2, { pose: 'squat', cloth: 'cloth_brown', over: 'none' });
    man([X0 + 9.0, Z0 + 3.6], -Math.PI / 2, { pose: 'sit', dress: 'wrap', top: 'bare', cloth: 'cloth_white', beard: 1 });
  });
  // the workshops: the masters and their men at the bench and the block, a boy sweeping chips, the smith at the hearth
  WORKS.forEach((w, k) => {
    const [x0, z0, , z1] = w.rect, bz = z1 - 0.65;
    if (w.trade === 'mason' || w.trade === 'sculptor') {
      man([x0 + 2.2, z0 + 3.4], Math.PI, { pose: 'squat', dress: 'loincloth', top: 'bare', cloth: 'linen', beard: 0.4 });
      man([x0 + 3.9, bz - 1.0], Math.PI, { pose: 'stand', cloth: 'linen' });
      if (w.trade === 'sculptor') man([x0 + 7.5, z0 + 3.3], -Math.PI / 2, { pose: 'stand', cloth: 'cloth_white', over: 'cloak', beard: 1 });
      else man([x0 + 5.8, z0 + 3.1], Math.PI * 1.5, { pose: 'squat', cloth: 'cloth_brown' });
    } else if (w.trade === 'carpenter') { man([x0 + 5.5, z0 + 2.6], Math.PI, { pose: 'stand' }); man([x0 + 3.2, z0 + 3.3], 0.6, { pose: 'squat' }); }
    else { man([x0 + 6.6, z1 - 1.9], Math.PI * 1.5, { pose: 'stand', dress: 'tunic', over: 'apron', cloth: 'cloth_brown', beard: 0.5 }); man([x0 + 3.6, z0 + 3.0], 0, { pose: 'stand' }); }
    if (k % 2 === 0) L.push({ t: 'figure', at: [x0 + 4.5, z0 - 1.6], y: Y, rot: Math.PI, seed: sd(), skin: 'skin_medium', dress: 'tunic', legs: 'bare', cloth: 'cloth_grey', over: 'belt', hair: 'short', hat: 'none', feet: 'bare', pose: 'stand', child: true, h: 1.15 });
  });
  return L;
}

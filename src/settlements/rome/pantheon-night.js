// The Pantheon's lamps (docs/settlements/rome.md §4.23). By night the porch and the rotunda were dark. No source describes the
// Pantheon's lighting at night; temples kept lamps and bronze lampstands (lychnuchi), and the dossier hangs a light under the
// oculus [inferred, docs/buildings/pantheon.md; rome.md §4.6]. Built here: bronze lampstands between the porch's front columns
// and before the niches' gods, a ring of lamps hung from the oculus' rim on three chains; the light itself (halo glow and
// pools) is street-life halo units placed by `pantheonHalos()` (nightlight.js: `stand`, `hang`, `pool`), so that it costs no draw.
// Wear: the polished strip of the rotunda's floor from the door, and the doorstep.
import { STYLES } from '../../core/build.js';
import { lathe, rod, box } from '../../core/geom.js';
import '../../buildings/pantheon/style.js';

const F = 1.3, R = 21.65, OCULUS_Y = F + 21.7 + 21.19, OCULUS_R = 4.45, RING_Y = 27;
const TAU = Math.PI * 2;
/** Lampstand positions [x, z]: the porch's front, before the door, the rotunda's diagonal niches and the apse's flanks. */
export const STANDS = [
  ...[-13.26, -8.84, -4.42, 4.42, 8.84, 13.26].map((x) => [x, -46.2]),
  [-3.4, -35.2], [3.4, -35.2],
  ...[45, 135, 225, 315].map((b) => { const a = (b - 90) * Math.PI / 180; return [Math.cos(a) * 18.8, Math.sin(a) * 18.8]; }),
  [-6.4, 19.2], [6.4, 19.2],
];
const hz = (a, b, c = 0) => { let h = Math.imul(Math.round(a * 8) ^ 0x9e3779b1, 73856093) ^ Math.imul(Math.round(b * 8) + 17 + c, 19349663); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
// (no flame pieces: unlit by day, and by night the halo carries the glow; each stand differs a little by a hash of its place, so that no run of identical copies is instanced)
const stand = (bag, x, z) => {
  const y = F, v = hz(x, z), v2 = hz(z, x, 3), top = 1.5 + 0.12 * v;
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + 0.4 + v * 2, c = Math.cos(a), s = Math.sin(a), fr = 0.24 + 0.05 * v2; bag.add('bronze', rod([x + c * fr, y, z + s * fr], [x + c * 0.03, y + 1.1 + 0.1 * v, z + s * 0.03], 0.02 + 0.006 * v2, 5)); }
  bag.add('bronze', rod([x, y + 0.2, z], [x, y + top + 0.05, z], 0.028 + 0.005 * v, 6));
  bag.add('bronze', lathe([[0.001, top], [0.19 + 0.02 * v2, top + 0.1], [0.22 + 0.02 * v, top + 0.24], [0.18, top + 0.22], [0.001, top + 0.1]], 10).translate(x, y, z));
};
/** A temple brazier: a bronze tripod and bowl of coals (the glow is a halo unit of the street life, nightlight.js). */
const brazier = (bag, x, z) => {
  for (let k = 0; k < 3; k++) { const q = k * TAU / 3 + 0.5 + x * 0.01, c = Math.cos(q), s = Math.sin(q); bag.add('bronze', rod([x + c * 0.48, F - 1.3, z + s * 0.48], [x + c * 0.2, F - 1.3 + 0.85, z + s * 0.2], 0.03, 5)); }
  bag.add('bronze', lathe([[0.001, 0.8], [0.22, 0.86], [0.46, 1.0], [0.44, 1.04], [0.2, 0.93], [0.001, 0.9]], 10).translate(x, F - 1.3, z));
};
/** rome_pnight: the lampstands and the ring hung from the oculus. */
function pnight(el, { bag, col }) {
  if (el.simple) return;
  for (const [x, z] of STANDS) { stand(bag, x, z); col.circle(x, z, 0.28, F, F + 1.8); }
  for (const x of [-21, 21]) { brazier(bag, x, -54.2); col.circle(x, -54.2, 0.5, 0, 1.2); }   // at the foot of the steps (the forecourt's paving, y = 0)
  // the ring of eight lamps hung on three chains from the oculus' rim
  const n = 16, rr = 1.5;
  for (let k = 0; k < n; k++) { const a0 = k * TAU / n, a1 = (k + 1) * TAU / n; bag.add('bronze', rod([Math.cos(a0) * rr, RING_Y, Math.sin(a0) * rr], [Math.cos(a1) * rr, RING_Y, Math.sin(a1) * rr], 0.04, 5)); }
  for (let k = 0; k < 8; k++) {
    const a = k * TAU / 8, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    bag.add('bronze', lathe([[0.001, 0], [0.09, 0.02], [0.14, 0.1], [0.11, 0.1], [0.001, 0.03]], 8).translate(x, RING_Y + 0.04, z));
  }
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + 0.5, c = Math.cos(a), s = Math.sin(a); bag.add('bronze', rod([c * rr, RING_Y, s * rr], [c * (OCULUS_R - 0.3), OCULUS_Y - 0.1, s * (OCULUS_R - 0.3)], 0.022, 5)); }
}
/** rome_pdetail: the bronze ring round the oculus (stated: original, Wikipedia "Pantheon, Rome"; docs/buildings/pantheon.md §4) and the floor's drains. */
function pdetail(el, { bag }) {
  if (el.simple) return;
  const y = OCULUS_Y;
  bag.add('bronze', lathe([[4.7, y - 0.34], [4.43, y - 0.34], [4.4, y - 0.3], [4.4, y + 0.08], [4.62, y + 0.14]], 48));
  bag.add('bronze', lathe([[4.5, y - 0.34], [4.5, y - 0.4], [4.36, y - 0.4], [4.36, y - 0.34]], 48));
  // [inferred: the number and the place] a ring of 22 bronze-grated drains in the floor under the oculus (the floor slopes some 30 cm to its drains, stated: archeoroma)
  for (let k = 0; k < 22; k++) {
    const a = k * TAU / 22 + 0.1, r = 5.2 + 0.03 * hz(k, 1), x = Math.cos(a) * r, z = Math.sin(a) * r, rad = 0.07 + 0.012 * hz(k, 2);
    bag.add('bronze', lathe([[0.001, 0.012], [rad, 0.012], [rad + 0.012, 0.006], [rad + 0.012, 0.0]], 8).translate(x, F, z));
  }
}
/** rome_pwear: the rotunda's floor polished along the way in from the door, and the doorstep. */
function pwear(el, { bag }) {
  const z0 = -25.4;
  [[1.3, 2.6], [1.0, 3.2], [0.7, 3.6]].reduce((zA, [hw, len], i) => { bag.add('marble', box(-hw, F + 0.0, zA + 0.02, hw, F + 0.006, zA + len - 0.02)); void i; return zA + len; }, z0 + 0.3);
  bag.add('marble', box(-2.0, F, z0 - 0.8, 2.0, F + 0.01, z0 + 0.3));
}
for (const id of ['roman-pantheon']) { const S = STYLES[id]; if (S) { S.elements.rome_pnight = pnight; S.elements.rome_pwear = pwear; S.elements.rome_pdetail = pdetail; } }

export const nightElements = () => [{ t: 'rome_pnight' }, { t: 'rome_pdetail' }];
export const wearElements = () => [{ t: 'rome_pwear' }];
/** The life elements (halo units) of the Pantheon's night. */
export function pantheonHalos() {
  const out = STANDS.map(([x, z]) => ({ t: 'rome_halo', kind: 'stand', at: [x, z], y: F, rot: 0 }));
  out.push({ t: 'rome_halo', kind: 'hang', at: [0, 0], y: RING_Y + 0.5, rot: 0 }, { t: 'rome_halo', kind: 'pool', at: [0, 0], y: F, rot: 0 });
  return out;
}

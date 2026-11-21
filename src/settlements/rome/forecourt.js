// The Pantheon's forecourt as it was lived in (docs/settlements/rome.md §4.23): the long square between its porticoes, which by day
// was a bare paved field here. Built: honorific statues on plinths along both porticoes, stone benches against the back walls,
// stalls of the sellers of offerings, and the idlers (built into small near plans, not as street life, so that the arrival frame
// does not pay for them). Paving: the palette's travertine already has its courses; the only measured source (blocks of
// about 0.8 x 0.9 m, 0.3 m thick, laid aligned) is recorded in the dossier, no joint grid is drawn over the shader's.
import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import './sculpt.js';
import '../../buildings/pantheon/style.js';
import './domus.js';
import { RADIUS } from './layout.js';

const N0 = -150, STEP = 3.8, ZK = (k) => N0 + 10.5 + STEP * k + STEP / 2;   // the middle of the k-th interval between two columns of a long portico
const WALL_X = 43.9;                                                           // the statues' plinths stand against the back wall's pilasters
const STATUE_K = [1, 5, 9, 13, 17], BENCH_K = [3, 11, 19], STALL_E = [7, 15], STALL_W = [3, 7];   // (the west portico's walk down x = -42.5 from z = -100 to -60 stays clear)

/** Elements of the Pantheon's own plan: statues on plinths, benches. */
export function forecourtElements() {
  const out = [];
  for (const s of [-1, 1]) {
    STATUE_K.forEach((k, i) => out.push({ t: 'rome_statue', i: i + (s > 0 ? 2 : 0), at: [s * WALL_X, ZK(k)], y: 0, rot: s > 0 ? Math.PI / 2 : -Math.PI / 2, h: 2.0, base: 1.3, mat: (i + k) % 2 ? 'marble' : 'gilt_bronze' }));
    for (const k of BENCH_K) {
      const z = ZK(k), x0 = s > 0 ? 44.05 : -44.75, x1 = s > 0 ? 44.75 : -44.05;
      out.push({ t: 'block', rect: [x0, z - 1.3, x1, z + 1.3], y0: 0.0, y1: 0.46, mat: 'marble' });
    }
  }
  return out;
}

/** rome_stall: { at, rot, kind } a trestle table of a seller of offerings, goods on it, an awning pole at each end. */
function stall(el, { bag, col }) {
  if (el.simple) return;
  const [x, z] = el.at, y = el.y ?? 0, along = Math.abs(Math.cos(el.rot ?? 0)) > 0.5 ? 'x' : 'z', L = 1.2, D = 0.5;
  const r = along === 'z' ? [x - D, z - L, x + D, z + L] : [x - L, z - D, x + L, z + D];
  bag.add('timber', box(r[0], y + 0.72, r[1], r[2], y + 0.78, r[3]));
  for (const [px, pz] of [[r[0] + 0.06, r[1] + 0.06], [r[2] - 0.06, r[1] + 0.06], [r[0] + 0.06, r[3] - 0.06], [r[2] - 0.06, r[3] - 0.06]]) bag.add('wood_dark', box(px - 0.04, y, pz - 0.04, px + 0.04, y + 0.72, pz + 0.04));
  col.rect(r, y, y + 0.8);
  const h = (a, b) => { const q = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return q - Math.floor(q); };
  const goods = el.kind === 'garlands' ? ['fresco_green', 'cloth_red', 'fresco_green', 'cloth_ochre'] : ['terracotta', 'pottery_dark', 'terracotta', 'cloth_white'];
  for (let k = 0; k < 6; k++) {
    const u = -L + 0.3 + k * 0.38, px = along === 'z' ? x : x + u, pz = along === 'z' ? z + u : z;
    if (el.kind === 'garlands' || k % 3 === 2) bag.add(goods[k % 4], box(px - 0.15, y + 0.78, pz - 0.15 + 0.05 * h(px, pz), px + 0.15, y + 0.9, pz + 0.15));
    else bag.add(goods[k % 4], lathe([[0.001, 0], [0.07, 0.02], [0.1, 0.12], [0.05, 0.22], [0.001, 0.22]], 8).translate(px, y + 0.78, pz));
  }
}
STYLES['rome-site'].elements.rome_stall = stall;

const CLOTH = ['cloth_brown', 'linen', 'cloth_ochre', 'cloth_grey', 'cloth_red'];
const fig = (at, rot, k, o = {}) => ({ t: 'figure', at, y: 0, rot, seed: 9100 + k, skin: k % 3 ? 'skin_light' : 'skin_medium', dress: 'tunic', legs: 'bare', cloth: CLOTH[k % 5], over: 'belt', hair: 'short', beard: k % 2, hat: 'none', pose: 'stand', arms: 'hang', ...o });
const togate = (at, rot, k, o = {}) => fig(at, rot, k, { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', over: 'cloak', skin: 'skin_light', ...o });
const matron = (at, rot, k, o = {}) => fig(at, rot, k, { dress: 'robe', cloth: ['cloth_red', 'cloth_indigo', 'cloth_ochre'][k % 3], cloth2: 'cloth_white', over: 'shawl', hair: 'bun', hat: k % 2 ? 'veil' : 'none', beard: 0, ...o });

/** Two small plans (the west and the east portico) with their sellers and idlers, shown within 36 m of their centres. */
export function forecourtLife() {
  const plans = [];
  for (const s of [-1, 1]) {
    const face = s > 0 ? Math.PI / 2 : -Math.PI / 2, away = face + Math.PI, els = [];     // facing the court / facing the wall
    (s > 0 ? STALL_E : STALL_W).forEach((k, i) => {
      const z = ZK(k), kind = (i + (s > 0 ? 1 : 0)) % 2 ? 'garlands' : 'lamps';
      els.push({ t: 'rome_stall', at: [s * 40.9, z], rot: face, kind });
      els.push(fig([s * 41.9, z], face, 10 + i + (s > 0 ? 5 : 0), { pose: i ? 'talk' : 'stand' }));                  // the seller behind it, facing the court
      els.push((i ? matron : togate)([s * 39.95, z + 0.3], away, 20 + i + (s > 0 ? 5 : 0), { pose: 'stand' }));        // a buyer before it
    });
    BENCH_K.forEach((k, i) => {
      const z = ZK(k), n = 30 + i * 3 + (s > 0 ? 1 : 0);
      if (i < 2) { els.push(fig([s * 44.4, z - 0.6], face, n, { pose: 'sit' })); els.push(togate([s * 44.4, z + 0.6], face, n + 1, { pose: 'sit' })); }
      else els.push(togate([s * 41.5, z], s > 0 ? -Math.PI / 2 : Math.PI / 2, n, { pose: 'talk' }), matron([s * 41.5, z + 1.0], face, n + 1, { pose: 'talk' }));
    });
    plans.push({ id: `rome-forecourt-${s > 0 ? 'e' : 'w'}`, style: 'rome-site', origin: [0, 0], base: 0, yaw: 0, feature: true, near: 36, center: [s * 41, -97], elements: els, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -200], facing: 's' } });
  }
  return plans;
}
/** Register the statue of the forum in the Pantheon's own style (the shared styles are untouched). */
export function registerForecourt() {
  const P = STYLES['roman-pantheon'];
  if (P && !P.elements.rome_statue) P.elements.rome_statue = STYLES.roman.elements.rome_statue;
}
registerForecourt();

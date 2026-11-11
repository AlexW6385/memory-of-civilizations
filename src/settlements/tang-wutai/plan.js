// Foguang Monastery in 857 (docs/settlements/tang-wutai.md §2–§4, §10): the Great East Hall with its
// terraces and courtyard (the full building of the previous design, src/buildings/foguang-east-hall);
// the dhāraṇī pillar of 857 before the hall and the founding master's pagoda south of it, rebuilt in
// detail here (the hall plan's simple stand-ins for them are left out); the monks of the monastery.

import { HALL, RADIUS } from './layout.js';
import { monasteryElements } from './monastery.js';
import { courtElements } from './courts.js';
import hallPlan from '../../buildings/foguang-east-hall/plan.js';

const T = 13;                                   // the upper terrace (hall plan, y above the courtyard)
const at = (x, z) => [HALL.origin[0] + x, HALL.origin[1] + z];   // a point of the hall plan in the settlement
export const PILLAR = at(-22, -8), ZUSHI = at(6, 32);
const F = T + 1.0, H0 = 4.99;                   // the hall's floor; its column height at the centre

/**
 * The bracket-eye panels (gongyan bi) of the hall's inner ring: plastered boards between the bracket sets, from the
 * top of the inner architrave to the first column-head fang; on the front inner architrave of the north secondary bay
 * the Tang painting that survives there (docs/settlements/tang-wutai.md §10).
 */
function innerPanels() {
  const E = [], ZI = [-12.6, -7.56, -2.52, 2.52, 7.56, 12.6], XI = [-4.415, 0, 4.415], y0 = F + H0 - 0.02, y1 = F + H0 + 1.02;
  const panel = (p, q) => {
    const alongZ = Math.abs(p[0] - q[0]) < 0.01, [X0, Z0] = at(...p), [X1, Z1] = at(...q);
    E.push(alongZ ? { t: 'block', rect: [X0 - 0.06, Math.min(Z0, Z1) + 0.34, X0 + 0.06, Math.max(Z0, Z1) - 0.34], y0, y1, mat: 'paint_white', collide: false }
      : { t: 'block', rect: [Math.min(X0, X1) + 0.34, Z0 - 0.06, Math.max(X0, X1) - 0.34, Z0 + 0.06], y0, y1, mat: 'paint_white', collide: false });
  };
  for (const x of [-4.415, 4.415]) for (let i = 0; i < ZI.length - 1; i++) panel([x, ZI[i]], [x, ZI[i + 1]]);
  for (const z of [-12.6, 12.6]) for (let i = 0; i < XI.length - 1; i++) panel([XI[i], z], [XI[i + 1], z]);
  // the painting: 4.5 by 0.66 m on the west face of the north secondary bay's panel ("right" from the hall's own side)
  const xf = -4.415 - 0.06, [ax, az] = at(xf, -2.52 - 0.27), [bx, bz] = at(xf, -7.56 + 0.27);
  E.push({ t: 'tang_mural', a: [ax, az], b: [bx, bz], y0: F + H0 + 0.18, h: 0.66, n: [-1, 0] });
  return E;
}

export const pagoda = {
  id: 'tang-wutai-stones', style: 'song', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [ZUSHI[0] - 6, ZUSHI[1]], facing: 'e' }, bounds: [PILLAR[0] - 2, PILLAR[1] - 2, ZUSHI[0] + 3, ZUSHI[1] + 3], rooms: [],
  elements: [
    { t: 'tang_dharani', at: PILLAR, y: T, h: 3.24 },
    { t: 'zushi_pagoda', at: ZUSHI, y: T, door: 'w' },
    ...innerPanels(),
    // the low lacquered seat of the monk Yuancheng's portrait under the south end bay's window
    { t: 'block', rect: [...at(-8.25, 14.15), ...at(-7.15, 15.45)], y0: F - 0.02, y1: F + 0.3, mat: 'lacquer_red', collide: false },
  ],
};

/**
 * The monks' quarters (sengfang) along the north and south sides of the lower courtyard, facing into it: long halls
 * of seven bays on a low brick-faced platform, red columns and architraves, white walls, a plank door in every other
 * bay and barred windows (zhiling) between, under a hipped roof of grey tiles on rafters with small chiwei
 * (docs/settlements/tang-wutai.md §10) [inferred: the buildings and their places; the forms after the East Hall].
 */
function quarters() {
  const E = [], add = (o) => (E.push(o), o), N = 7, BAY = 3.9, D = 7.2, H = 3.6, P = 0.45;
  for (const s of [-1, 1]) {
    // the range's front line (toward the courtyard's axis) and back line, local to the hall plan
    const zf = s * 35.5, zb = s * (35.5 + D), x0 = -103, x1 = x0 + N * BAY, zc = (zf + zb) / 2, out = -s;   // out: the front faces −s
    const [X0, Z0] = at(x0 - 1.0, Math.min(zf, zb) - 1.0), [X1, Z1] = at(x1 + 1.0, Math.max(zf, zb) + 1.0), [cx, cz] = at((x0 + x1) / 2, zc);
    add({ t: 'block', rect: [X0, Z0, X1, Z1], y0: -0.2, y1: P - 0.04, mat: 'brick_grey', walk: false });
    add({ t: 'floor', rect: [X0, Z0, X1, Z1], y: P, mat: 'limestone', th: 0.05 });
    // steps up to the platform before the middle bay and the end bays
    for (const k of [1, 3, 5]) { const [sx] = at(x0 + (k + 0.5) * BAY, 0), zf0 = at(0, zf + out * 1.0)[1]; add({ t: 'stair', rect: [sx - 1.1, Math.min(zf0, zf0 + out * 1.0), sx + 1.1, Math.max(zf0, zf0 + out * 1.0)], dir: out > 0 ? 'n' : 's', y0: 0, y1: P, riser: 0.15, base: -0.1, mat: 'limestone' }); }
    const cols = [];
    for (let k = 0; k <= N; k++) for (const z of [zf, zb]) cols.push(at(x0 + k * BAY, z));
    for (const c of cols) add({ t: 'column', at: c, y: P, h: H, d: 0.42 });
    // the architraves over the columns, the plaster band above them up to the roof
    for (const z of [zf, zb]) { const [, Z] = at(0, z); add({ t: 'block', rect: [at(x0, 0)[0] - 0.3, Z - 0.17, at(x1, 0)[0] + 0.3, Z + 0.17], y0: P + H - 0.36, y1: P + H, mat: 'timber_red', collide: false }); add({ t: 'block', rect: [at(x0, 0)[0] - 0.1, Z - 0.1, at(x1, 0)[0] + 0.1, Z + 0.1], y0: P + H, y1: P + H + 0.95, mat: 'plaster_white', collide: false }); }
    for (const x of [x0, x1]) { const [X] = at(x, 0); add({ t: 'block', rect: [X - 0.17, Math.min(Z0, Z1) + 1.17, X + 0.17, Math.max(Z0, Z1) - 1.17], y0: P + H - 0.36, y1: P + H - 0.01, mat: 'timber_red', collide: false }); add({ t: 'block', rect: [X - 0.1, Math.min(Z0, Z1) + 1.1, X + 0.1, Math.max(Z0, Z1) - 1.1], y0: P + H, y1: P + H + 0.95, mat: 'plaster_white', collide: false }); }
    // the walls between the columns: closed at the back and the ends; on the front a door or a window in each bay
    const wall = (a, b, openings = []) => add({ t: 'wall', a, b, th: 0.36, y0: P, y1: P + H - 0.36, openings, mat: 'plaster_white' });
    for (let k = 0; k < N; k++) {
      const a = at(x0 + k * BAY + 0.22, 0)[0], b = at(x0 + (k + 1) * BAY - 0.22, 0)[0], [, Zb] = at(0, zb), [, Zf] = at(0, zf), L = b - a, m = (a + b) / 2;
      wall([a, Zb], [b, Zb]);
      const door = k % 2 === 1;
      wall([a, Zf], [b, Zf], door ? [] : [{ at: L / 2, w: 1.8, h: 1.1, y0: P + 1.1 }]);
      const fz = Zf + out * 0.18;                                   // the outer face of the front wall
      if (door) {
        // a plank door of two leaves in its frame, closed; the threshold stone
        add({ t: 'block', rect: [m - 0.75, Math.min(fz - out * 0.02, fz + out * 0.06), m + 0.75, Math.max(fz - out * 0.02, fz + out * 0.06)], y0: P + 0.12, y1: P + 2.3, mat: 'timber_red', collide: false });
        for (const e of [-0.86, 0.86]) add({ t: 'block', rect: [m + e - 0.1, Math.min(fz - out * 0.02, fz + out * 0.1), m + e + 0.1, Math.max(fz - out * 0.02, fz + out * 0.1)], y0: P, y1: P + 2.45, mat: 'timber_red', collide: false });
        add({ t: 'block', rect: [m - 0.96, Math.min(fz - out * 0.02, fz + out * 0.1), m + 0.96, Math.max(fz - out * 0.02, fz + out * 0.1)], y0: P + 2.3, y1: P + 2.5, mat: 'timber_red', collide: false });
        add({ t: 'block', rect: [m - 0.9, Math.min(fz, fz + out * 0.3), m + 0.9, Math.max(fz, fz + out * 0.3)], y0: P - 0.02, y1: P + 0.12, mat: 'limestone', collide: false });
        for (const e of [-0.4, 0.4]) add({ t: 'block', rect: [m + e - 0.03, Math.min(fz + out * 0.06, fz + out * 0.1), m + e + 0.03, Math.max(fz + out * 0.06, fz + out * 0.1)], y0: P + 1.1, y1: P + 1.16, mat: 'iron', collide: false });
      } else {
        // the barred window: paper in the wall's plane, a frame and upright square bars outside it
        add({ t: 'block', rect: [m - 0.9, Zf - 0.02, m + 0.9, Zf + 0.02], y0: P + 1.1, y1: P + 2.2, mat: 'shoji', collide: false });
        add({ t: 'block', rect: [m - 1.0, Math.min(fz - out * 0.04, fz + out * 0.06), m + 1.0, Math.max(fz - out * 0.04, fz + out * 0.06)], y0: P + 1.0, y1: P + 1.1, mat: 'timber_red', collide: false });
        add({ t: 'block', rect: [m - 1.0, Math.min(fz - out * 0.04, fz + out * 0.06), m + 1.0, Math.max(fz - out * 0.04, fz + out * 0.06)], y0: P + 2.2, y1: P + 2.3, mat: 'timber_red', collide: false });
        for (let j = -5; j <= 5; j++) add({ t: 'block', rect: [m + j * 0.16 - 0.03, Math.min(fz - out * 0.04, fz + out * 0.08), m + j * 0.16 + 0.03, Math.max(fz - out * 0.04, fz + out * 0.08)], y0: P + 1.1, y1: P + 2.2, mat: 'timber_red', collide: false });
      }
    }
    for (const x of [x0, x1]) { const X = at(x, 0)[0] + (x === x0 ? 0 : 0); for (const [za, zb2] of [[zf, zb]]) wall([X, at(0, za)[1] + (za < zb2 ? 0.22 : -0.22)], [X, at(0, zb2)[1] + (za < zb2 ? -0.22 : 0.22)]); }
    add({ t: 'hip_roof', c: [cx, cz], A: N * BAY / 2 + 1.7, B: D / 2 + 1.7, y: P + H + 0.45, rise: 2.9, eaveSlope: 0.3, pow: 1.5, lift: 0.35, mat: 'tile_grey', soffit: 'timber_red', rafters: { out: 1.7, sp: 0.3 }, tangChiwei: 1.0 });
  }
  const [bx0, bz0] = at(-105, -44), [bx1, bz1] = at(-74, 44);
  return { id: 'tang-wutai-quarters', style: 'chinese', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: E, rooms: [], bounds: [bx0, bz0, bx1, bz1], entrance: { at: at(-90, 0), facing: 'e' } };
}
export const sengfang = quarters();

/** The monks (dark robes, the reddish-brown kasaya, shaven heads) about the courtyard and terraces, and a few lay pilgrims. */
function monks() {
  const L = [], faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  let seed = 857;
  const monk = (p, y, dir, extra = {}) => L.push({ t: 'figure', at: at(...p), y, rot: faceTo(dir), seed: seed++ * 7919, dress: 'robe', cloth: seed % 3 ? 'cloth_black' : 'cloth_grey', cloth2: 'cloth_brown', skin: 'skin_light', hat: 'cap', hatMat: 'skin_light', carry: 'none', pose: 'stand', ...extra });
  const lay = (p, y, dir, extra = {}) => L.push({ t: 'figure', at: at(...p), y, rot: faceTo(dir), seed: seed++ * 7919, dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_white', skin: 'skin_light', hat: 'brim', carry: 'none', pose: 'stand', ...extra });
  // at the pillar, reading the record of the hall; at the old pagoda, one bowing to the master's tomb, a pilgrim with an offering
  monk([-23.4, -8], T, [1, 0]); monk([-22.2, -6.3], T, [0, -1], { pose: 'talk' });
  monk([3.0, 32.3], T, [1, 0]); lay([3.2, 30.8], T, [1, 0.3], { carry: 'basket' });
  // on the hall's platform at the door, looking out down the valley
  monk([-12.2, 6.2], T + 1, [-1, 0]);
  // on the middle terrace and in the courtyard: monks walking and talking, pilgrims come up from the village
  monk([-50, -9], 6.5, [1, 0], { pose: 'talk' }); monk([-49.2, -8.4], 6.5, [-1, -0.4]);
  monk([-44, 14], 6.5, [0, -1]);
  monk([-96, -14], 0, [0, 1], { pose: 'talk' }); monk([-95.4, -13.2], 0, [-0.6, -1]);
  lay([-100, 6], 0, [1, 0]); lay([-101, 7.2], 0, [1, 0], { cloth: 'cloth_brown', hat: 'none', dress: 'trousers', carry: 'pole' });
  monk([-86, 20], 0, [-1, 0]);
  // pilgrims climbing the stairs from the courtyard to the middle terrace and on to the hall, a monk leading two of them
  const step = (x, x0, y0) => { const n = Math.round(6.5 / 0.171), i = Math.min(n - 1, Math.floor((x - x0) / 12 * n)); return y0 + 6.5 * (i + 1) / n; };
  lay([-70.5, -1.6], step(-70.5, -74, 0), [1, 0]); lay([-68.2, 1.2], step(-68.2, -74, 0), [1, 0], { carry: 'basket', cloth: 'cloth_brown', hat: 'none' });
  monk([-37.5, -1.4], step(-37.5, -42, 6.5), [1, 0]); lay([-39.6, 1.3], step(-39.6, -42, 6.5), [1, 0], { hat: 'none' }); lay([-40.8, -0.6], step(-40.8, -42, 6.5), [1, 0.2], { cloth: 'cloth_white', cloth2: 'cloth_indigo' });
  // before the monks' quarters: one sitting on the platform's edge, one sweeping-still with a pole, one at a door
  monk([-92.3, -35.0], 0.45, [0, 1], { pose: 'talk' }); monk([-85, -33.2], 0, [0, 1], { carry: 'pole' });
  monk([-80.3, 34.9], 0.45, [0, -1]);
  // before the Manjusri hall's stair, a monk and a pilgrim; in the bell pavilion's shade one waiting for the hour; at the censer one lighting incense
  monk([-47.5, -31.5], 6.5, [0, -1]); lay([-45.6, -30.6], 6.5, [0, -1], { carry: 'basket' });
  monk([-46, 33.2], 6.5, [0, 1], { pose: 'talk' }); monk([-45.2, 33.8], 6.5, [-0.4, -1]);
  monk([-19.5, 1.9], T, [1, 0]);
  // the portraits in painted clay of the hall's two founders, life size and seated cross-legged (§10): the donor Ning
  // Gongyu at the altar platform's south end beside the heavenly king, hands in her sleeves, a cloak over her robe;
  // the monk Yuancheng under the south end bay's window, facing the platform
  L.push({ t: 'figure', at: at(-2.5, 10.5), y: F + 0.9, rot: faceTo([-1, 0]), seed: 8571, dress: 'robe', cloth: 'clay_robe', cloth2: 'clay_green', over: 'collar', skin: 'stucco_warm', hair: 'bun', hairMat: 'hide_black', hat: 'none', pose: 'cross', arms: 'clasp', h: 1.58, beard: false });
  L.push({ t: 'figure', at: at(-7.7, 14.8), y: F + 0.3, rot: faceTo([1, -0.45]), seed: 8572, dress: 'robe', cloth: 'clay_robe', cloth2: 'clay_robe', over: 'sash', skin: 'stucco_warm', hair: 'shaven', hat: 'none', pose: 'cross', arms: 'clasp', h: 1.66, beard: false });
  return { id: 'tang-wutai-monks', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: L, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-80, 0], facing: 'e' } };
}
export const people = monks();

// the upper terrace's open room split either side of the axis, so that the street life's people stand beside the way
// up to the hall and not on it (the arrival is on the axis)
const rooms = hallPlan.rooms.flatMap((r) => (r.id === 'upper-terrace' ? [{ ...r, id: 'upper-terrace-north', rect: [r.rect[0], r.rect[1], r.rect[2], -3] }, { ...r, id: 'upper-terrace-south', rect: [r.rect[0], 3, r.rect[2], r.rect[3]] }] : [r]));
export const hall = { ...hallPlan, rooms, elements: hallPlan.elements.filter((e) => !(e.t === 'obj' && (e.kind === 'pagoda' || e.kind === 'dharani_pillar'))), origin: HALL.origin, base: 0, district: undefined, view: [HALL.origin[0] - 14, -20, HALL.origin[0] + 11, 20], viewY: 13 };
export default hall;

/** The Hall of Manjusri, the bell pavilion, the incense burners and the side stairs (monastery.js). */
export const monastery = { id: 'tang-wutai-monastery', style: 'chinese', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: monasteryElements(), rooms: [], bounds: [-16, -52, 32, 52], entrance: { at: [-2, 0], facing: 'e' } };

/** The courts' worn paths, moss and the pines' beds (courts.js). */
export const courts = { id: 'tang-wutai-courts', style: 'chinese', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: courtElements(), rooms: [], bounds: [-60, -50, 96, 50], entrance: { at: [-20, 0], facing: 'e' } };

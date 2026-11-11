// Abu Simbel about 1255 BC (docs/settlements/abu-simbel.md §2): the cliff on the Nile's west bank facing east, the Great Temple cut in it
// (axis east–west, z = 0), the Small Temple of Nefertari 112 m to the north, the paved terrace before the great façade between its mudbrick
// walls with the sun altar and the stone gate, the way to the Small Temple, the ramp down the bank to the quay, the river; the priests'
// houses north of the terrace, the workmen's camp south of it. Pure data. Coordinates: metres, +x east (toward the Nile), +z south.

import { FX, FXS, ZS, cliffFace } from '../../styles/ramesside/dims.js';

export { FX, FXS, ZS, cliffFace };
export const RADIUS = 190;
/** Water level of the Nile and the terrace's level (the bank falls 8.4 m from the terrace to the bed). */
export const WATER = -8.0, TERRACE_Y = 0.04;
export const BANK_X = 12, BED_X = 62;
// the paved terrace before the Great Temple, its mudbrick walls (north and south), the stone gate in the north wall
export const TERRACE = [FX + 0.2, -30, BANK_X, 30];
export const WALL = { z: 30, x0: FX, x1: 8, th: 2.2, h: 3.6 };
export const GATE = { x: -18, w: 3.2, h: 3.4 };
export const ALTAR = { x: -8, z: -24.5 };
// the Small Temple's terrace and the way to it from the north gate
export const SMALL_TERRACE = [FXS + 0.2, ZS - 21, -4, ZS + 21];
export const WAY = [-20, -112 + 21, -16, -30];
// the quay, with its ramp from the terrace, and the landing stair
export const QUAY = [46, -12, 62, 12], QUAY_Y = -6.3;
// the priests' houses (north of the terrace, east of the way) and the workmen's camp (south), as blocks of lots
export const PRIESTS = [-12, -84, 11, -36];
export const CAMP = [-36, 38, 10, 128];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

let LOTS = null;
/**
 * The lots of houses and bakeries: { kind ('house' | 'bakery' | 'granary'), rect, seed, quarter ('priests' | 'camp') }. Houses stand in rows facing south (their doors
 * in the south wall) along lanes 3 m wide; the camp has bakeries at its south end and round granaries at its east.
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1255);
  // the priests' houses: two columns either side of a lane, four rows
  for (let c = 0; c < 2; c++) for (let k = 0; k < 4; k++) {
    const w = 8 + rand() * 2.4, d = 7 + rand() * 2, x0 = PRIESTS[0] + c * 12.2 + (c ? 0 : 0), z0 = PRIESTS[1] + k * 12.2 + 1;
    LOTS.push({ kind: 'house', rect: [x0, z0, x0 + w, z0 + d], seed: Math.floor(rand() * 1e6), quarter: 'priests', furnish: k === 3 && c === 0 });
  }
  // the workmen's camp: four columns, rows of smaller houses, bakeries on the south row
  for (let c = 0; c < 4; c++) for (let k = 0; k < 7; k++) {
    if (rand() < 0.12) continue;
    const w = 6.4 + rand() * 2.2, d = 6 + rand() * 2.2, x0 = CAMP[0] + c * 11.4, z0 = CAMP[1] + k * 12.8 + 1;
    if (Math.hypot(x0 + w, z0 + d) > RADIUS - 30) continue;
    const bakery = k === 6 && c % 2 === 0;
    LOTS.push({ kind: bakery ? 'bakery' : 'house', rect: bakery ? [x0, z0, x0 + 7, z0 + 5.5] : [x0, z0, x0 + w, z0 + d], seed: Math.floor(rand() * 1e6), quarter: 'camp', furnish: k === 2 && c === 1 });
  }
  return LOTS;
}
/** Round granaries of mud in the camp's east yard: [x, z, r, h]. */
export function granaries() {
  const rand = rng(1256), out = [];
  for (let k = 0; k < 7; k++) { const x = 3 + (k % 2) * 3.4, z = 46 + Math.floor(k / 2) * 5.6 + rand() * 0.5; out.push([x, z, 1.1 + rand() * 0.25, 2.2 + rand() * 0.5]); }
  return out;
}

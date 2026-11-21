// The visitor's walk in Teotihuacan (docs/settlements/teotihuacan.md §18): from the arrival on the avenue's plaza to the houses of those who serve the
// avenue — up a temple's stair on the west platform and along its top to the four houses there, east over the open ground to the lane of the barrio —
// each entered by its stair and portico and the doorway of one of its rooms, 1.6 m wide (styles/teotihuacano/doors.js). Pure data and arithmetic (no
// three.js); the routes are walked by tools/walk-check.mjs from the landmark's `walks` (plan.js).
import { lodges, compounds, WEST_STREET } from './layout.js';
import { roomDoors } from '../../styles/teotihuacano/doors.js';

const DIR = { e: [1, 0], w: [-1, 0], s: [0, 1], n: [0, -1] };
/** The geometry of a house of lodges(): its portico's edge, the stair's head, the rooms' doorways, the room it is entered at. */
export function lodgeGeom(l) {
  const [x0, z0, x1, z1] = l.rect, [fx, fz] = DIR[l.face], lodge = l.kind === 'lodge', ph = lodge ? 1.1 : 0.5, pd = lodge ? 2.8 : 2.4;
  const back = fx ? (fx > 0 ? [x0, z0, x1 - pd, z1] : [x0 + pd, z0, x1, z1]) : (fz > 0 ? [x0, z0, x1, z1 - pd] : [x0, z0 + pd, x1, z1]);
  const L = fx ? z1 - z0 : x1 - x0, craft = ['workshop', 'potter', 'weaver'].includes(l.kind), nr = craft ? 2 : L > 11.5 ? 3 : 2, doors = roomDoors(back, [fx, fz], nr);   // (the craft houses have two rooms, the others three when long)
  const edge = fx ? (fx > 0 ? x1 : x0) : (fz > 0 ? z1 : z0), mid = fx ? (z0 + z1) / 2 : (x0 + x1) / 2;
  // the room entered: the workshops at their craft, the others at the kitchen or the shrine (the second of three, the first of two)
  const j = craft ? 0 : nr === 3 ? 1 : 0;
  return { fx, fz, ph, stairLen: ph * 1.6, edge, mid, doors, j, nr, door: doors[j] };
}
const P = (g, d, u) => (g.fx ? [g.edge + g.fx * d, u] : [u, g.edge + g.fz * d]);
/** The way from the point in front of a house's stair, up it, along the portico to the door of room j and into the room. */
export function intoLodge(l) {
  const g = lodgeGeom(l), d = g.door;
  return [P(g, g.stairLen + 1.4, g.mid), P(g, 0.2, g.mid), P(g, -1.0, g.mid), d.at(-1.1), d.at(0.22), d.at(1.7)];
}

/** The west platform's top is 2.4 m over the plaza (x −52…−20); its temples' stairs from the avenue are at z 15, 53 and 91 (x −20…−16.4). */
/** The routes along the west platform to its four houses (lodges() 0…3), each from the avenue's plaza by the stair at z 15. */
export function platformRoutes() {
  const [A, B, C, D] = lodges().slice(0, 4), up = [[-8, 15], [-17.5, 15], [-21.4, 15]];
  return [
    [...up, [-21.4, 32.5], ...intoLodge(B)],                                               // the dwelling, along the strip to its stair
    [...up, [-21.4, 40], [-36.8, 40], [-36.8, 32.5], ...intoLodge(A)],                 // the priest's house: the corridor south of the dwelling, the gap between the two
    [...up, [-21.4, 40], [-21.4, 64.5], [-21.4, 73.5], ...intoLodge(D)],                 // the weaver's
    [...up, [-21.4, 40], [-21.4, 65.75], [-36.8, 65.75], [-36.8, 73.5], ...intoLodge(C)],  // the obsidian workshop
  ];
}

/** The barrio's lane x 79…83 (z 103…143) and the six houses along it, each in a forecourt with a gate (1.8 m) on the lane. */
export function barrioRoutes() {
  const out = [[[0, 70], [30, 74], [60, 84], [81, 92]]];
  for (const l of lodges().slice(4)) {
    const g = lodgeGeom(l), ox = l.face === 'e' ? g.edge + l.yard : g.edge - l.yard, lane = l.face === 'e' ? 81 : 81;
    out.push([[lane, 92], [lane, g.mid], [ox, g.mid], ...intoLodge(l).slice(1)]);
  }
  return out;
}

/**
 * An opened compound (layout.js: open, gate 3 = the east wall's middle): the way in from the street, by the gate (1.8 m) and the entry court (the east block
 * left out) to the main patio, round its altar, up the west block's stair and into the kitchen at its first door.
 */
export function intoCompound(c) {
  const [x0, z0, x1, z1] = c.rect, cw = (x1 - x0 - 2) / 3, cd = (z1 - z0 - 2) / 3, zm = (z0 + z1) / 2, xm = (x0 + x1) / 2;
  const r = [x0 + 1 + 0.6, z0 + 1 + cd + 0.6, x0 + 1 + cw - 0.6, z0 + 1 + 2 * cd - 0.6], pd = 2.6, ph = 0.5;
  const back = [r[0], r[1], r[2] - pd, r[3]], nr = r[3] - r[1] > 11 ? 3 : 2, doors = roomDoors(back, [1, 0], nr);
  const g = { fx: 1, fz: 0, edge: r[2], mid: zm, stairLen: ph * 1.6 }, d = doors[0];
  return [[x1 + 3.5, zm], [x1 - 0.5, zm], [x1 - 4.5, zm + 2.7], [xm - 3.4, zm + 2.7], P(g, g.stairLen + 1.4, zm), P(g, 0.2, zm), P(g, -1.0, zm), d.at(-1.1), d.at(0.22), d.at(1.7)];
}
/** The way down from the west platform to the street along it, at z 40 (between the priest's house and the temple), 3 m wide (plan.js): its foot and top. */
export const WEST_STAIR = { rect: [-55.6, 38.5, -52, 41.5], y0: 0, y1: 2.43 };
/** The routes to the opened compounds: along the platform's corridor, down the stair, along the street. */
export function compoundRoutes() {
  const A = [[-8, 15], [-17.5, 15], [-21.4, 15], [-21.4, 40], [-48, 40], [-52.5, 40], [-55.6, 40], [WEST_STREET[0] - 0.4, 40]];
  return compounds().filter((c) => c.open).map((c) => {
    const zm = (c.rect[1] + c.rect[3]) / 2, x1 = c.rect[2];
    return [...A, [-57.5, zm], ...intoCompound(c)];
  });
}

/** The way down from the west platform at plaza 5 (top 1.5 m) to the market's east gate: z 251, 5 m wide, between the cross platform and the temple (plan.js). */
export const MARKET_STAIR = { rect: [-54.25, 248.5, -52, 253.5], y0: 0, y1: 1.53 };
/** From the arrival down the avenue, up the platform's stair at z 265, along it to the stair, and in by the market's east gate along its lane. */
export function marketRoutes() {
  return [[[0, 70], [2, 73], [2, 82], [0, 85], [0, 166], [8, 172], [8, 186], [0, 190], [0, 255], [-8, 265.25], [-17.5, 265.25], [-21.4, 265.25], [-21.4, 251], [-48, 251], [-52.5, 251], [-56.5, 251], [-62, 255], [-66, 259], [-72, 259], [-90, 259], [-108, 259]]];
}

/**
 * Up the stair of the big temple on the west platform at z (53 in plaza 3, 178 in plaza 4: layout of plan.js, platforms 2.4 m over the plaza), 5 m wide, 8 m
 * to the summit, and in by the door in the front wall (2.4 m) to the chamber: the altar, the censers and the priest are within.
 */
export function templeRoute(z, lv) {
  return [[-8, z + 7], [-13, z + 4], [-17.5, z + 0.5], [-21.4, z], [-26, z], [-29.5, z], [-31.5, z], [-35, z]];
}

/**
 * The Ciudadela (§24): from the avenue's last plaza east up the broad stair at z 252 (30 m, to the west bank, 7 m), along the bank to the foot of one of its four
 * west temples (centres z 210, 238, 282, 310 at x 41) and in by the door of its chamber; and over the bank, down its inner stair into the court and east to the
 * stair of the Adosada (x 89, z 260, 8 m wide), up to its roof 9 m over the court.
 */
export function ciudadelaRoutes() {
  const pre = [[0, 70], [2, 73], [2, 82], [0, 85], [0, 166], [8, 172], [8, 186], [0, 190], [0, 255], [10, 252], [20, 252], [29, 252], [33, 252]];
  const temple = (z) => [...pre, [33, z + (z < 252 ? 7 : -7)], [31, z + (z < 252 ? 2 : -2)], [31, z], [34, z], [37, z], [40, z], [41.2, z]];
  return [temple(238), temple(210), temple(282), temple(310),
    [[0, 70], [2, 73], [2, 82], [0, 85], [0, 166], [8, 172], [8, 186], [0, 190], [0, 255], [10, 260], [20, 260], [30, 260], [45, 260], [55, 260], [62, 257], [75, 257], [84, 260], [86, 260], [92, 260], [100, 260], [110, 260]]];
}

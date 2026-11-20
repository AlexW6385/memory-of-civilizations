// The visitor's walk in Teotihuacan (docs/settlements/teotihuacan.md §18): from the arrival on the avenue's plaza to the houses of those who serve the
// avenue — up a temple's stair on the west platform and along its top to the four houses there, east over the open ground to the lane of the barrio —
// each entered by its stair and portico and the doorway of one of its rooms, 1.6 m wide (styles/teotihuacano/doors.js). Pure data and arithmetic (no
// three.js); the routes are walked by tools/walk-check.mjs from the landmark's `walks` (plan.js).
import { lodges } from './layout.js';
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

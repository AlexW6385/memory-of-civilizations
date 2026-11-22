// Lamps of the great buildings at night (docs/settlements/florence.md §21): the iron torch-holders on the fronts of the Palazzo della Signoria
// and the Palazzo Medici, and the lamp-lit threshold of the cathedral's open west door. Elements of the renaissance style, registered from here
// (as house.js registers casa_f); each plan is near-only, so nothing of it is drawn from afar. Light is the `halo` material (halo.js), world frame.
import { STYLES } from '../../core/build.js';
import '../../styles/renaissance/index.js';
import { box, lathe } from '../../core/geom.js';
import { Halo } from './halo.js';
import { Vector3 } from '../../core/three.js';
import { faceFrame } from '../../styles/renaissance/face.js';
import { DUOMO, PALAZZO, MEDICI, ORSAN, BAPTISTERY, CAMPANILE, RADIUS, lots } from './layout.js';

const IR = 'iron';
/** A torch-holder on a wall at (x, z) facing n = [nx, nz], its lantern y m up: the bracket, the lantern, the glow, the wash on the wall and the pool on the ground. */
function torch(bag, H, x, z, n, y = 3.5) {
  const [nx, nz] = n, ex = (d) => x + nx * d, ez = (d) => z + nz * d;
  const ax = (d0, d1, w, y0, y1) => box(Math.min(ex(d0), ex(d1)) - (nx ? 0 : w), y0, Math.min(ez(d0), ez(d1)) - (nz ? 0 : w), Math.max(ex(d0), ex(d1)) + (nx ? 0 : w), y1, Math.max(ez(d0), ez(d1)) + (nz ? 0 : w));
  bag.add(IR, ax(0, 0.8, 0.02, y - 0.2, y - 0.16));          // the arm
  bag.add(IR, ax(0.02, 0.1, 0.03, y - 0.5, y + 0.3));         // the plate on the wall
  bag.add(IR, ax(0.76, 0.84, 0.02, y - 0.16, y + 0.55));      // the post of the lantern, with the spike above it that the oiled rags were lit on [stated: §17]
  bag.add('lamp_glass', lathe([[0.001, 0], [0.12, 0.06], [0.15, 0.3], [0.12, 0.4], [0.001, 0.44]], 6, null, ex(0.8), y, ez(0.8)));
  H.ball(ex(0.8), y + 0.2, ez(0.8), 0.95);
  H.disc([ex(0.1), y + 0.1, ez(0.1)], [-nz, 0, nx], [0, 1, 0], 2.0, 1.6, [nx, nz], 6, [0.9, 0], [0, 1]);
  H.floor(ex(1.4), 0.04, ez(1.4), 2.6, 2.6, 6, 0.8);
}
/** A lamp hung by a chain from a vault at (x, z), its glass at height y, over a floor at fy: the chain, the glass, the glow, the pool on the floor, and a wash on each wall given ({ at, n }). */
function hung(bag, H, x, z, y, fy, walls) {
  bag.add(IR, box(x - 0.012, y + 0.3, z - 0.012, x + 0.012, y + 1.7, z + 0.012));
  bag.add(IR, box(x - 0.1, y - 0.03, z - 0.1, x + 0.1, y, z + 0.1));
  bag.add('lamp_glass', lathe([[0.001, 0], [0.13, 0.06], [0.17, 0.26], [0.12, 0.4], [0.001, 0.44]], 6, null, x, y, z));
  H.ball(x, y + 0.17, z, 1.1);
  H.floor(x, fy + 0.03, z, 2.7, 2.7, 6, 0.8);
  for (const w of walls ?? []) H.disc([w.at[0], y - 0.6, w.at[1]], [-w.n[1], 0, w.n[0]], [0, 1, 0], 2.7, 2.1, w.n, 6, [0.9, 0], [0, 1]);
}
function lamps(el, { bag }) {
  const H = new Halo();
  for (const l of el.torches ?? []) torch(bag, H, l.at[0], l.at[1], l.n, l.y);
  for (const h of el.hangs ?? []) hung(bag, H, h.at[0], h.at[1], h.y, h.floor ?? 0.04, h.walls);
  // a shop's lit opening on a wall at (x, z) facing n: the door and the counter-window as warm panels (the wall plane is 0.05 out), the pool across the step
  for (const o of el.shops ?? []) {
    const [nx, nz] = o.n, tx = -nz, tz = nx, P = (u, yy, d) => [o.at[0] + tx * u + nx * d, yy, o.at[1] + tz * u + nz * d], w = o.w ?? 1.4;
    H.quad(P(-w / 2, 0.1, 0.05), P(w / 2, 0.1, 0.05), P(w / 2, 2.4, 0.05), P(-w / 2, 2.4, 0.05), o.n, 0.3);
    H.quad(P(w / 2 + 0.5, 0.95, 0.05), P(w / 2 + 1.7, 0.95, 0.05), P(w / 2 + 1.7, 2.2, 0.05), P(w / 2 + 0.5, 2.2, 0.05), o.n, 0.2);
    H.floor(o.at[0] + nx * 1.5 + tx * 0.7, 0.06, o.at[1] + nz * 1.5 + tz * 0.7, 2.6, 2.2, 6, 0.7);
    H.ball(o.at[0] + nx * 0.5, 1.6, o.at[1] + nz * 0.5, 0.8);
  }
  for (const p of el.pools ?? []) { H.floor(p.at[0], p.y ?? 0.06, p.at[1], p.r, p.rz ?? p.r, 6, p.b ?? 0.5); if (p.sheet) H.disc([p.sheet[0], p.sheet[1], p.at[1]], [0, 0, 1], [0, 1, 0], 2.0, 3.6, [-1, 0], 6, [0.8, 0], [0, 1]); }
  const g = H.geometry(); if (g) bag.add('halo', g);
}
if (STYLES.renaissance) STYLES.renaissance.elements.florence_lamps = lamps;

const plan = (id, c, el) => ({ id, style: 'renaissance', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'n' }, center: c, near: 140, nocollide: true, elements: [{ t: 'florence_lamps', ...el }] });

/** The plans of these lamps. [inferred: the torch-holders of the Palazzo Strozzi and Vecchio were the city's; the cathedral's lamps burnt before its altars through the night] */
/** A point of a face of rect (u along it, 0 at the wall) in the world, and the face's outward normal. */
function onFace(rect, f, u) {
  const { M } = faceFrame(rect, f, 0), p = new Vector3(u, 0, 0).applyMatrix4(M), q = new Vector3(0, 0, 1).transformDirection(M);
  return { at: [p.x, p.z], n: [Math.round(q.x), Math.round(q.z)] };
}
/** Orsanmichele: the lamp that burnt by the pier of a guild's tabernacle on each front (the tabernacles of the streets had candles burning at night, §17), on the pier's edge beside the niche. [inferred: which piers] */
function orsanLamps() {
  const L = { e: 22.1, w: 22.1, n: 32.4, s: 32.4 }, nb = { e: 2, w: 2, n: 3, s: 3 }, P = 3.6, out = [];
  for (const [f, i] of [['s', 1], ['n', 2], ['w', 1], ['e', 1]]) {
    const bw = (L[f] - P) / nb[f], q = onFace(ORSAN, f, P / 2 + i * bw + 1.35);
    out.push({ at: q.at, n: q.n, y: 3.7 });
  }
  return out;
}
// The street at the arrival (the cathedral square's north-west corner, docs/settlements/florence.md §21b), in the Baptistery's plan: the torch-holders of the palazzo
// on the square's north side, the tabernacle lamp at its corner, the lantern and the lit opening of the bottega beside it.
const NEAR_TORCHES = [{ at: [-146, -120], n: [0, 1], y: 3.6 }, { at: [-134.5, -120], n: [0, 1], y: 3.6 }, { at: [-151.6, -120], n: [0, 1], y: 2.9 }, { at: [-123.1, -120], n: [0, 1], y: 3.1 }];
const NEAR_POOLS = [{ at: [-146, -116.5], r: 6.5, rz: 5, b: 0.6 }, { at: [-134.5, -116.5], r: 6.5, rz: 5, b: 0.6 }, { at: [-124, -116], r: 6, rz: 4.5, b: 0.6 }];
const NEAR_SHOPS = [{ at: [-125.7, -120], n: [0, 1], w: 1.4 }];

// The street to the cathedral from the north (the flanks of the lots that face it, x -70 to -50, z -215 to -112): a wall lantern at the quarter of each flank, hung at two heights
// (the low ones the tabernacle lamps of the corners). [inferred: the lanterns of the streets were hung by the households and the guilds (§17); which flanks is ours]
function streetLamps() {
  const out = [];
  for (const l of lots()) {
    const [a, b, c, d] = l.rect, ex = l.exposed ?? [];
    if (l.kind === 'torre' || b < -215 || d > -112) continue;
    for (const t of d - b > 14 ? [0.2, 0.78] : [0.27]) {
      const z = b + (d - b) * t;
      if (c > -70 && c < -60 && ex.includes('e')) out.push({ at: [c, z], n: [1, 0] });
      if (a > -58 && a < -50 && ex.includes('w')) out.push({ at: [a, z], n: [-1, 0] });
    }
  }
  return out.map((o, i) => ({ ...o, y: i % 3 === 1 ? 2.4 : 3.2 + (i % 2) * 0.25 }));
}
const VIA = streetLamps();
const VIA_POOLS = VIA.map((t) => ({ at: [t.at[0] + t.n[0] * 1.4, t.at[1]], r: 4.2, rz: 3.4, b: 0.55 }));
// the cathedral's west front (the front's plane at x = nave[0] - 1.9; the corner piers at its ends, the lanterns by the three portals) and the campanile's base
const FRONT_X = DUOMO.c[0] - DUOMO.nave - DUOMO.d / 2 - 1.9 - 0.45, FZ = DUOMO.c[1];
const FRONT = [-19.5, -16.2, -7.8, -4.2, 4.2, 7.8, 16.2, 19.5].map((u) => ({ at: [FRONT_X, FZ + u], n: [-1, 0], y: 3.4 }));
const FRONT_POOLS = [-12, 0, 12].map((u) => ({ at: [FRONT_X - 2.0, FZ + u], r: 5, rz: 4.5, b: 0.7 }));
const CAMP = [{ at: [CAMPANILE[0] - 7.4, CAMPANILE[1] - 3.5], n: [-1, 0], y: 3.2 }, { at: [CAMPANILE[0] - 7.4, CAMPANILE[1] + 3.5], n: [-1, 0], y: 3.2 }, { at: [CAMPANILE[0] - 3.5, CAMPANILE[1] + 7.4], n: [0, 1], y: 3.2 }, { at: [CAMPANILE[0] + 3.5, CAMPANILE[1] + 7.4], n: [0, 1], y: 3.2 }];
const CAMP_POOLS = CAMP.map((t) => ({ at: [t.at[0] + t.n[0] * 1.5, t.at[1] + t.n[1] * 1.5], r: 4.5, rz: 4.5, b: 0.6 }));
export function lampPlans() {
  const nave = [DUOMO.c[0] - DUOMO.nave - DUOMO.d / 2, DUOMO.c[1]];
  return [
    plan('florence-lamps-signoria', [PALAZZO[0], (PALAZZO[1] + PALAZZO[3]) / 2], { torches: [{ at: [PALAZZO[0], PALAZZO[1] + 3], n: [-1, 0], y: 3.6 }, { at: [PALAZZO[0], PALAZZO[3] - 3], n: [-1, 0], y: 3.6 }] }),
    plan('florence-lamps-medici', [MEDICI[2], (MEDICI[1] + MEDICI[3]) / 2], { torches: [{ at: [MEDICI[2], MEDICI[1] + 3], n: [1, 0], y: 3.6 }, { at: [MEDICI[2], MEDICI[1] + 17], n: [1, 0], y: 3.6 }] }),
    plan('florence-lamps-orsanmichele', [(ORSAN[0] + ORSAN[2]) / 2, (ORSAN[1] + ORSAN[3]) / 2], { torches: orsanLamps() }),
    // the Baptistery: lanterns each side of the Gate of Paradise on the east, one beside each of the other two doors. [inferred: the door the city's feasts went to was lit]
    plan('florence-lamps-baptistery', BAPTISTERY, { torches: [...NEAR_TORCHES, { at: [BAPTISTERY[0] + 12.8, BAPTISTERY[1] - 4.9], n: [1, 0], y: 3.8 }, { at: [BAPTISTERY[0] + 12.8, BAPTISTERY[1] + 4.9], n: [1, 0], y: 3.8 }, { at: [BAPTISTERY[0] + 4.4, BAPTISTERY[1] - 12.8], n: [0, -1], y: 3.8 }, { at: [BAPTISTERY[0] - 4.4, BAPTISTERY[1] + 12.8], n: [0, 1], y: 3.8 }], shops: NEAR_SHOPS, pools: NEAR_POOLS }),
    // the Palazzo Medici's corner loggia, open in 1480: a lamp hung from its vault (the loggia is [23, -165.6, 28, -156], its floor at 0.04, the vault at 8.4)
    plan('florence-lamps-medici-loggia', [MEDICI[2] - 2.5, MEDICI[3] - 5], { hangs: [{ at: [MEDICI[2] - 2.6, MEDICI[3] - 4.9], y: 6.2, floor: 0.04, walls: [{ at: [MEDICI[2] - 5 + 0.06, MEDICI[3] - 4.9], n: [1, 0] }, { at: [MEDICI[2] - 2.6, MEDICI[3] - 9.6 + 0.06], n: [0, 1] }] }] }),
    plan('florence-lamps-via-duomo', [-58, -145], { torches: VIA, pools: VIA_POOLS }),
    plan('florence-lamps-duomo-front', [FRONT_X, FZ], { torches: [...FRONT, ...CAMP], pools: [...FRONT_POOLS, ...CAMP_POOLS] }),
    plan('florence-lamps-duomo', [nave[0], nave[1]], { pools: [{ at: [nave[0] - 0.3, nave[1]], r: 4.6, rz: 3.4, b: 0.9, sheet: [nave[0] + 0.4, 3.6] }] }),
  ];
}

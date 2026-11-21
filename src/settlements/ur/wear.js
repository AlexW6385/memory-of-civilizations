// What use and the climate did to Ur's stone and brick (docs/settlements/ur.md §28): the pale polished lane that a thousand years of pilgrims' feet will have made up the middle of
// the ziggurat's central stair (and the dust trodden into its corners), the brick thresholds of the houses polished in the middle and the drift of silt dust against the foot of the wall
// beside each door, the salt-white and damp band on the quay's face at the water's edge. All of it low (4 mm to 7 cm), built of the settlement's own materials in one plan, no collision.
import { box } from '../../core/geom.js';
import { ZIG, TERRACE, HARBOUR } from './layout.js';
import { frame } from '../../styles/sumerian-ur/upper.js';

const hash = (a, b = 0) => { let h = (Math.imul(Math.round(a * 100) | 0, 73856093) ^ Math.imul(Math.round(b * 100) | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/** The central flight's treads (as `stairs` of src/styles/sumerian lays them: n steps of about 0.16 m from the terrace to the first stage's top): [{ z0, z1 (the tread's span), y (its top) }]. */
export function centralTreads() {
  const S = ZIG.stages[0], fz = ZIG.c[1] + (S.dz ?? 0) - S.d / 2, run = S.h, zs = fz - run * 1.9, ze = fz + S.batter + 0.5;
  const n = Math.max(1, Math.round(S.h / 0.16)), tr = (ze - zs) / n, out = [];
  for (let i = 0; i < n; i++) out.push({ z0: zs + i * tr, z1: zs + (i + 1) * tr, y: TERRACE.y + (i + 1) * S.h / n });
  return out;
}

function wear(el, { bag }) {
  const cx = ZIG.c[0];
  // the stair: a polished lane 1.7 m wide up the middle of every tread (its width varied by the tread's own place, so that it is not ruled), dust in the two corners against the parapets
  for (const t of centralTreads()) {
    const z0 = t.z0 + 0.15, z1 = t.z1 - 0.035, w = 0.78 + 0.1 * hash(t.y, 1), dz = 0.05 * hash(t.y, 2);
    bag.add('limestone', box(cx - w, t.y - 0.01, z0 + dz, cx + w, t.y + 0.004, z1));
    for (const s of [-1, 1]) { const wd = 0.18 + 0.2 * hash(t.y, 3 + s); bag.add('silt', box(s > 0 ? cx + 3.97 - wd : cx - 3.97, t.y - 0.01, z0, s > 0 ? cx + 3.97 : cx - 3.97 + wd, t.y + 0.006, z1)); }
  }
  // the houses' thresholds and the dust at the wall's foot beside each door
  for (const d of el.doors || []) {
    const F = frame({ rect: d.rect, door: d.door }), { R } = F, k = hash(d.rect[0], d.rect[1]);
    bag.add('limestone', ((r) => box(r[0], 0.095, r[1], r[2], 0.104, r[3]))(R(0.98, -0.05, 1.57, 0.52)));
    const L = 1.0 + 0.9 * k, side = k < 0.5 ? 1 : -1, u0 = side > 0 ? 1.95 : -0.3 - L * 0.4;
    if (side > 0 || u0 > -0.3) {
      const a = side > 0 ? [u0, u0 + L] : [Math.max(0.05, 0.8 - L * 0.6), 0.76];
      if (a[1] - a[0] > 0.3) {
        bag.add('silt', ((r) => box(r[0], 0, r[1], r[2], 0.03, r[3]))(R(a[0], -0.4, a[1], 0)));
        bag.add('silt', ((r) => box(r[0], 0, r[1], r[2], 0.07, r[3]))(R(a[0] + 0.1, -0.2, a[1] - 0.1, 0)));
      }
    }
  }
  // the quay's face: the salt-white damp band at the water's edge, in the stretches between the flights of steps
  const [, hz0, hx1, hz1] = [HARBOUR.rect[0], HARBOUR.rect[1], HARBOUR.rect[2], HARBOUR.rect[3]], qx = hx1 - 1.5, gaps = [-80, -30, 12].map((z) => [z - 0.2, z + 2.6]);
  let z = hz0 + 6;
  for (const [g0, g1] of [...gaps, [hz1 - 6, hz1 - 6]]) { if (g0 - z > 0.5) bag.add('plaster_damp', box(qx - 0.014, HARBOUR.water - 0.35, z, qx, HARBOUR.water + 0.3, g0)); z = g1; }
}

export const WEAR_ELEMENTS = { ur_wear: wear };

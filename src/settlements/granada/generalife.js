// The Generalife about 1400 (docs/settlements/granada.md §10): the sultans' summer palace across
// the ravine east of the Alhambra — the sultan's walled passage from the postern down into the ravine
// and up to the entrance courts; the Patio de Polo; the Patio de la Acequia with its channel, sunken
// beds and pavilions; the Sultana's walled garden above; the water stairway to the oratory on the
// hill; the orchards and kitchen gardens on their terraces below the palace.
import { GY, ACEQUIA, GEN, TERRACES, LANE, LANE_W, SULTANA_Y, DISMOUNT_Y, escalera, height } from './layout.js';

const E = [];
// ——— the sultan's passage: walls either side of the lane, stepped down the ravine and up again ———
{
  const o = LANE_W / 2 + 0.3, segs = [];
  for (let i = 0; i + 1 < LANE.length; i++) {
    const [ax, az, ay] = LANE[i], [bx, bz, by] = LANE[i + 1], L = Math.hypot(bx - ax, bz - az), d = [(bx - ax) / L, (bz - az) / L];
    segs.push({ A: [ax, az, ay], B: [bx, bz, by], L, d, n: [-d[1], d[0]] });
  }
  const dot = (p, q) => p[0] * q[0] + p[1] * q[1];
  segs.forEach((S, i) => {
    for (const s of [-1, 1]) {
      const off = s * o;
      const u0 = i > 0 ? dot(segs[i - 1].n, S.d) * off - 0.3 : 0, u1 = i + 1 < segs.length ? S.L + dot(segs[i + 1].n, S.d) * off + 0.3 : S.L;
      const n = Math.max(1, Math.round((u1 - u0) / 2));
      for (let k = 0; k < n; k++) {
        const ua = u0 + (u1 - u0) * k / n, ub = u0 + (u1 - u0) * (k + 1) / n, um = (ua + ub) / 2;
        const P = (u, w) => [S.A[0] + S.d[0] * u + S.n[0] * w, S.A[1] + S.d[1] * u + S.n[1] * w];
        const c = [P(ua, off - 0.3), P(ub, off + 0.3)], r = [Math.min(c[0][0], c[1][0]), Math.min(c[0][1], c[1][1]), Math.max(c[0][0], c[1][0]), Math.max(c[0][1], c[1][1])];
        const ly = (u) => S.A[2] + (S.B[2] - S.A[2]) * Math.max(0, Math.min(1, u / S.L));
        const lo = Math.min(ly(ua), ly(ub)), hi = Math.max(ly(ua), ly(ub)), out = height(...P(um, off + s * 1.0), false), out2 = height(...P(um, off + s * 0.35), false);
        E.push({ t: 'gen_wall', rect: r, y0: Math.min(lo, out, out2) - 0.6, y1: Math.min(hi + 6, Math.max(hi + 2.1, out + 0.4, out2 + 0.4)), mat: 'tuff_red' });
      }
    }
  });
  // the brick edges of the steps on the sloping stretches
  const R = [];
  for (const S of segs) {
    if (Math.abs(S.B[2] - S.A[2]) < 1) continue;
    const step = 0.95, n = Math.floor(S.L / step);
    for (let k = 1; k < n; k++) {
      const u = k * S.L / n, x = S.A[0] + S.d[0] * u, z = S.A[1] + S.d[1] * u, y = S.A[2] + (S.B[2] - S.A[2]) * u / S.L, w = LANE_W / 2;
      R.push(Math.abs(S.d[0]) > 0.5 ? [x - 0.06, z - w, x + 0.06, z + w, y] : [x - w, z - 0.06, x + w, z + 0.06, y]);
    }
  }
  E.push({ t: 'gen_risers', list: R });
}
// ——— the palace: the Patio de la Acequia, its pavilions, the courts, the Sultana, the stairway, the oratory ———
const T = Object.fromEntries(TERRACES.map((t) => [t.id, t]));
E.push({ t: 'acequia', court: ACEQUIA, y: GY, west: GEN.west, wMirador: GEN.wMirador, east: GEN.east, orchardY: T.orchard1.y, seed: 1319 });
E.push({ t: 'gen_north', rect: GEN.north, y: GY, mirador: GEN.mirador, passage: GEN.passage, neBlock: GEN.neBlock, court: ACEQUIA, sultanaY: SULTANA_Y });
E.push({ t: 'gen_south', rect: GEN.south, y: GY, court: ACEQUIA });
const STAIR_X = 287.5, GATE_Z = LANE[LANE.length - 1][1], ORCHARD_DOOR = 270;
E.push({ t: 'gen_courts', polo: GEN.polo, dismount: GEN.dismount, y: GY, dy: DISMOUNT_Y, block: [GEN.south[2], GEN.south[1], GEN.east[2], GEN.south[3]], stairX: STAIR_X, gateZ: GATE_Z, orchardDoor: ORCHARD_DOOR, stables: [[268.5, 279], [283.5, 296.4]] });
E.push({ t: 'sultana', rect: GEN.sultana, y: SULTANA_Y, gateZ: GEN.stair.z, gateW: 2.7, seed: 1400 });
const ESC = escalera();
E.push({ t: 'escalera', ...ESC, z: GEN.stair.z, sides: [-50, -24], steps: TERRACES.filter((t) => t.id.startsWith('side') || t.id === 'top').map((t, k, a) => [t.r[0], t.y, k ? a[k - 1].y : SULTANA_Y]) });
E.push({ t: 'gen_oratory', rect: GEN.oratory, y: GEN.stair.y1 });
// the terrace at the stair's head: brick paving round the oratory
E.push({ t: 'floor', rect: [GEN.stair.x1, GEN.stair.z - 3.2, GEN.oratory[0], GEN.stair.z + 3.2], y: GEN.stair.y1 + 0.04, mat: 'brick_paving' });
// ——— the orchards and kitchen gardens (paratas) ———
const [o1, o2, o3] = [T.orchard1, T.orchard2, T.orchard3];
E.push({
  t: 'paratas', seed: 1401,
  walls: [
    [[o1.r[0], o1.r[1], o1.r[0] + 0.7, 28], o2.y - 0.4, o1.y + 0.5], [[o1.r[0], 30, o1.r[0] + 0.7, o1.r[3]], o2.y - 0.4, o1.y + 0.5],
    [[o2.r[0], o2.r[1], o2.r[0] + 0.7, 24], o3.y - 0.4, o2.y + 0.5], [[o2.r[0], 26, o2.r[0] + 0.7, o2.r[3]], o3.y - 0.4, o2.y + 0.5],
    [[o3.r[0], o3.r[1], o3.r[0] + 0.8, o3.r[3]], 20.6, o3.y + 0.5],
    [[o1.r[0] + 0.7, o1.r[1], o1.r[2], o1.r[1] + 0.6], o1.y - 3.0, o1.y + 0.5],
    [[o2.r[0] + 0.7, o2.r[1], o2.r[2], o2.r[1] + 0.6], o2.y - 6.5, o2.y + 0.5],
    [[o3.r[0] + 0.8, o3.r[1], o3.r[2], o3.r[1] + 0.6], o3.y - 7.5, o3.y + 0.5],
    [[o2.r[0] + 0.7, o2.r[3] - 0.6, o2.r[2], o2.r[3]], o2.y - 6, o2.y + 0.5],
    [[o3.r[0] + 0.8, o3.r[3] - 0.6, o3.r[2], o3.r[3]], o3.y - 6.5, o3.y + 0.5],
  ],
  stairs: [
    { rect: [o1.r[0] - 4.4, 28, o1.r[0] + 0.7, 30], y0: o2.y, y1: o1.y, dir: 'e' },
    { rect: [o2.r[0] - 4.4, 24, o2.r[0] + 0.7, 26], y0: o3.y, y1: o2.y, dir: 'e' },
    { rect: [ORCHARD_DOOR - 0.6, 31.2, ORCHARD_DOOR + 0.6, GEN.dismount[1]], y0: o1.y, y1: DISMOUNT_Y, dir: 's' },
  ],
  veg: [
    { r: [o1.r[0] + 1.4, 6, o1.r[0] + 10.4, 18.4], y: o1.y, seed: 0 },
    { r: [o1.r[0] + 1.4, 19.6, o1.r[0] + 10.4, 27.4], y: o1.y, seed: 2 },
    { r: [o1.r[0] + 1.4, -6.4, o1.r[0] + 7.6, 4.6], y: o1.y, seed: 1, along: 'z' },
  ],
  channels: [[o1.r[2] - 3.6, o1.r[1] + 0.6, o1.r[2] - 3.1, 30.6, o1.y], [o2.r[2] - 3.6, o2.r[1] + 0.6, o2.r[2] - 3.1, 22.8, o2.y]],
  baskets: [[o1.r[0] + 11.2, 12.4, o1.y], [o1.r[0] + 11.0, 24.1, o1.y], [o1.r[0] + 8.4, 5.4, o1.y]],
});

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const [a0, az0, a1, az1] = ACEQUIA;
export const generalife = {
  id: 'granada-generalife',
  name: { en: 'The Generalife', zh: '赫内拉利费宫' },
  era: { en: 'Nasrid Granada, about 1400', zh: '纳斯里德王朝格拉纳达，约1400年' },
  style: 'nasrid',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [GEN.dismount[0] + 3, GATE_Z], facing: 'e' },
  bounds: [205, -60, 346, 56],
  view: [a0 - 6, az0 - 18, a1 + 8, az1 + 8],
  viewY: GY,
  bakeTop: 64,
  elements: E,
  rooms: [
    room('patio de la acequia', [a0 + 0.2, az0 + 0.2, a1 - 0.2, az1 - 0.2], GY, 'open'),
    room('sala regia', [a0 + 0.2, GEN.north[1] + 1.0, a1 - 0.2, GEN.north[3] - 4.0], GY, 'hall'),
    room('mirador of ismail', [GEN.mirador[0] + 0.9, GEN.mirador[1] + 0.9, GEN.mirador[2] - 0.9, GEN.mirador[3] - 0.2], GY, 'hall'),
    room('west mirador', [GEN.wMirador[0] + 0.7, GEN.wMirador[1] + 0.7, GEN.wMirador[2], GEN.wMirador[3] - 0.7], GY, 'hall'),
    room('south pavilion', [a0 + 0.2, GEN.south[1] + 3.8, a1 - 0.2, GEN.south[3] - 1.0], GY, 'hall'),
    room('patio de polo', [GEN.polo[0] + 1, GEN.polo[1] + 0.5, GEN.polo[2] - 4, GEN.polo[3] - 1.2], GY, 'open'),
    room('patio del descabalgamiento', [GEN.dismount[0] + 1, GEN.dismount[1] + 1.5, GEN.dismount[2] - 1, GEN.dismount[3] - 6.5], DISMOUNT_Y + 0.04, 'open'),
    room('sultana garden', [GEN.sultana[0] + 0.3, GEN.sultana[1] + 1, GEN.sultana[2] - 1, GEN.sultana[3] - 1], SULTANA_Y + 0.08, 'open'),
    room('oratory', [GEN.oratory[0] + 0.8, GEN.oratory[1] + 0.8, GEN.oratory[2] - 0.8, GEN.oratory[3] - 0.8], GEN.stair.y1, 'hall'),
    room('huerta', [o1.r[0] + 1, -40, o1.r[2] - 4, 4], o1.y, 'open'),
  ],
  walks: [Object.assign([[GEN.gate[0] - 3, 13], [241.5, 13], [241.5, GATE_Z], [GEN.dismount[0] + 3, GATE_Z], [STAIR_X, 41.5], [STAIR_X, 30], [(a0 + a1) / 2 + 2.5, 0], [(a0 + a1) / 2 + 2.5, -30], [GEN.sultana[0] + 3, GEN.stair.z], [GEN.oratory[0] - 1, GEN.stair.z]], { y0: 30 })],
};
export default generalife;

// Pit 1 of the terracotta army, as it was when new (docs/settlements/qin-xianyang.md §4): a trench 230 × 62 m and 5 m deep,
// earth walls, eleven corridors between rammed-earth partitions (posts and sleepers of timber), the brick floor, the roof of
// logs over the partitions, the earth heaped over its western part and not yet over the east, three ramps down the east end
// into the front gallery; the army inside (qin_army): three ranks of archers, the infantry in two files a corridor, the
// chariots with their four horses; torches. The plan's frame is the settlement's.
import { box, fromTriangles, frustum, lathe } from '../../core/geom.js';
import { animal } from '../../objects/animals.js';
import { rng } from '../../objects/kit.js';
import { PIT, CORR, GALLERY, ROOF, RAMP, ARCHERS, FILES, FILE_STEP, CHARIOTS, corrZ, rampZ } from '../../settlements/qin-xianyang/layout.js';
import { soldier } from './warriors.js';

const FL = PIT.floor, PT = FL + 4.3;                                  // floor, partitions' top (−0.7)

/** qin_pit: {} — the trench, walls, partitions, floor, roof, mound, ramps and lamps. */
export function qinPit(el, { bag, col, lights }) {
  const { x0, z0, x1, z1, wall } = PIT;
  const W = (r, y0 = FL, y1 = 0, mat = 'earth_wall') => { bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  // the floor: small grey bricks
  bag.add('brick_grey', box(x0 + wall, FL - 0.12, z0 + wall, x1 - wall, FL + 0.02, z1 - wall));
  col.floor([x0 + wall, z0 + wall, x1 - wall, z1 - wall], FL + 0.02);
  // the outer walls (the east wall has the three openings of the ramps)
  W([x0, z0, x1, z0 + wall]); W([x0, z1 - wall, x1, z1]); W([x0, z0, x0 + wall, z1]);
  const gaps = RAMP.zs.map((_, i) => [rampZ(i) - RAMP.w / 2 - 0.2, rampZ(i) + RAMP.w / 2 + 0.2]);
  let z = z0 + wall;
  for (const [ga, gb] of gaps) { W([x1 - wall, z, x1, ga]); z = gb; }
  W([x1 - wall, z, x1, z1 - wall]);
  // lintels of logs over the openings
  for (const [ga, gb] of gaps) bag.add('brick_grey', box(x1 - wall, FL - 0.12, ga, x1, FL + 0.02, gb));
  for (const [ga, gb] of gaps) bag.add('log_pine', box(x1 - wall + 0.03, -0.7, ga - 0.3, x1 - 0.03, -0.3, gb + 0.3));
  // the partitions with a sleeper along the top, and the timber posts on both faces
  for (let k = 0; k < CORR.n - 1; k++) {
    const pa = corrZ(k) + CORR.w / 2, pb = pa + CORR.part;
    W([CORR.x0, pa, CORR.x1, pb], FL, PT);
    bag.add('timber', box(CORR.x0, PT, pa + 0.25, CORR.x1, PT + 0.08, pb - 0.25));
    for (let x = CORR.x0 + 3; x < CORR.x1; x += 7.0) for (const zz of [pa - 0.16, pb + 0.16]) { bag.add('timber', box(x - 0.15, FL, zz - 0.15, x + 0.15, PT, zz + 0.15)); col.rect([x - 0.15, zz - 0.15, x + 0.15, zz + 0.15], FL, PT); }
  }
  for (let x = CORR.x0 + 3; x < CORR.x1; x += 7.0) for (const zz of [z0 + wall + 0.16, z1 - wall - 0.16]) bag.add('timber', box(x - 0.15, FL, zz - 0.15, x + 0.15, PT, zz + 0.15));
  // the gallery's cross beam at the corridors' mouths
  bag.add('timber', box(GALLERY[0] - 0.2, PT - 0.5, z0 + wall, GALLERY[0] + 0.2, PT, z1 - wall));
  // the roof: one log for each corridor and each 0.42 m, laid across the partitions (a log 5.46 m, from partition middle to middle)
  const span = CORR.w + CORR.part;
  // (a solid core inside the logs, so that the roof reads as one slab to the walker and the earth heaped over it is no shell)
  bag.add('log_pine', box(x0 + wall, ROOF.beamY0 + 0.1, z0 + wall, x1 - wall, ROOF.beamY1 - 0.1, z1 - wall));
  for (let k = 0; k < CORR.n; k++) {
    const zc = corrZ(k);
    for (let x = x0 + 0.21; x < x1 - 0.1; x += 0.42) bag.add('log_pine', box(x - 0.19, ROOF.beamY0, zc - span / 2, x + 0.19, ROOF.beamY1, zc + span / 2));
  }
  col.floor([ROOF.bareX, z0, x1, z1], ROOF.top);                                           // the bare part of the roof can be walked
  // the earth over the western part: heaped to 2.2 m, sloping away at the east end toward the bare logs
  bag.add('earth_wall', frustum([x0 - 6, z0 - 6, ROOF.bareX + 16, z1 + 6], ROOF.top, ROOF.mound, 8, 16, 8, 8, { noBottom: true }));
  col.rect([x0 - 6, z0 - 6, ROOF.bareX + 8, z1 + 6], ROOF.top, ROOF.mound);
  // the east: mats of reed being laid over the logs and baskets of earth waiting
  const r = rng(77);
  for (let i = 0; i < 26; i++) { const x = ROOF.bareX + 20 + r() * 38, zz = z0 + 4 + r() * (z1 - z0 - 8); bag.add('reed_mat', box(x, ROOF.top, zz, x + 2.4 + r() * 1.5, ROOF.top + 0.03, zz + 1.6)); }
  for (let i = 0; i < 6; i++) { const x = ROOF.bareX + 20 + r() * 30, zz = z0 + 6 + r() * (z1 - z0 - 12), s = 1.2 + r() * 0.9; bag.add('earth_wall', frustum([x, zz, x + s * 2.4, zz + s * 2], ROOF.top, ROOF.top + s * 0.8, 0.6, 0.6, 0.5, 0.5, { noBottom: true })); }
  // the ramps: a stair of earth treads down to the floor, retaining walls of rammed earth either side
  RAMP.zs.forEach((_, i) => {
    const zc = rampZ(i), n = Math.round(RAMP.len / 0.5), yAt = (x) => FL * (1 - (x - x1) / RAMP.len);
    for (let s = 0; s < n; s++) { const xa = x1 + s * 0.5; bag.add('mud_plaster', box(xa, FL - 0.3, zc - RAMP.w / 2, xa + 0.5, yAt(xa + 0.25), zc + RAMP.w / 2)); }
    col.ramp([x1, zc - RAMP.w / 2, x1 + RAMP.len, zc + RAMP.w / 2], FL, 0, 'e'); col.floor([x1 - wall, zc - RAMP.w / 2, x1, zc + RAMP.w / 2], FL + 0.02);
    for (const s of [-1, 1]) { const a = zc + s * RAMP.w / 2, b = zc + s * (RAMP.w / 2 + 1.1); W([x1, Math.min(a, b), x1 + RAMP.len, Math.max(a, b)], FL - 0.3, 0); }
    for (let x = x1 + 3; x < x1 + RAMP.len; x += 3.3) bag.add('timber', box(x, yAt(x) + 0.1, zc - RAMP.w / 2, x + 0.14, yAt(x) + 0.3, zc + RAMP.w / 2));  // the cleats
  });
  // the lamps: bronze lamps hung from the roof logs along the aisle corridors and in the front gallery; a stand by each ramp's foot
  const lamp = (x, y, zz, h = 0.9) => {
    bag.add('bronze', lathe([[0.001, y - h], [0.12, y - h + 0.05], [0.14, y - h + 0.14], [0.001, y - h + 0.15]], 10, null, x, 0, zz));
    bag.add('iron', box(x - 0.01, y - h + 0.15, zz - 0.01, x + 0.01, y, zz + 0.01));
    bag.add('flame', lathe([[0.001, y - h + 0.15], [0.04, y - h + 0.2], [0.001, y - h + 0.34]], 6, null, x, 0, zz));
    lights.push({ at: [x, y - h + 0.3, zz], color: '#ffa850', intensity: 2.2, distance: 11 });
  };
  for (const k of RAMP.zs) for (const x of [96, 64, 32, 0, -32, -64, -92]) lamp(x, PT - 0.5, corrZ(k));
  for (const i of [0, 1, 2]) for (const x of [118, 125]) lamp(x, PT - 0.5, rampZ(i) + (i === 1 ? 0 : 0) + (x === 118 ? 2.5 : -2.5));
}

/** One chariot: four horses abreast, the pole, the carriage, its wheels and its crew. */
function chariot(bag, col, ctx, x, zc, seed) {
  const r = rng(seed), y = FL + 0.05;
  const rot = -Math.PI / 2;
  for (let h = 0; h < 4; h++) {
    const z = zc + (h - 1.5) * 0.86;
    animal({ kind: 'horse', at: [x - 1.0, z], y, rot, seed: seed * 7 + h, mat: h === 1 || h === 2 ? 'hide_brown' : 'hide_tan', gear: false, graze: false }, ctx);
  }
  // the yoke across the two middle horses' withers, the pole back to the carriage's body
  bag.add('timber', box(x - 1.0, y + 1.5, zc - 1.0, x - 0.85, y + 1.6, zc + 1.0));
  bag.add('timber', box(x - 5.2, y + 0.82, zc - 0.05, x - 0.9, y + 0.92, zc + 0.05));
  // the carriage: a floor, low rails of lacquered wood on three sides, the axle, two wheels of 1.4 m
  const cx = x - 5.9;
  bag.add('timber_red', box(cx - 0.6, y + 0.78, zc - 0.7, cx + 0.5, y + 0.86, zc + 0.7));
  for (const [a, b, c, d] of [[cx - 0.6, zc - 0.7, cx - 0.55, zc + 0.7], [cx - 0.6, zc - 0.7, cx + 0.5, zc - 0.65], [cx - 0.6, zc + 0.65, cx + 0.5, zc + 0.7]]) bag.add('timber_red', box(a, y + 0.86, b, c, y + 1.3, d));
  bag.add('lacquer_black', box(cx - 0.62, y + 1.3, zc - 0.72, cx - 0.53, y + 1.36, zc + 0.72));
  bag.add('iron', box(cx - 0.05, y + 0.68, zc - 1.25, cx + 0.05, y + 0.76, zc + 1.25));
  for (const s of [-1, 1]) {
    const wz = zc + s * 1.0, R = 0.7;
    bag.add('timber', lathe([[R, -0.07], [R, 0.07], [R - 0.07, 0.07], [R - 0.07, -0.07]], 20, null, 0, 0, 0).rotateX(Math.PI / 2).translate(cx, y + R, wz));
    bag.add('timber', lathe([[0.001, -0.12], [0.12, -0.12], [0.12, 0.12], [0.001, 0.12]], 10).rotateX(Math.PI / 2).translate(cx, y + R, wz));
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI, c = Math.cos(a) * (R - 0.04), sn = Math.sin(a) * (R - 0.04); bag.add('timber', boxAxisSpoke(cx, y + R, wz, c, sn)); }
  }
  col.rect([cx - 0.9, zc - 1.5, x + 0.6, zc + 1.5], FL, FL + 2.2);
  // the crew: a driver and two soldiers
  soldier(bag, { at: [cx - 0.2, zc], y: y + 0.86, rot, kind: 'driver', seed: seed * 3 + 1 });
  soldier(bag, { at: [cx - 0.3, zc - 0.4], y: y + 0.86, rot, kind: 'arm_halberd', seed: seed * 3 + 2 });
  void r;
}
/** A spoke as a thin box through the hub, in the wheel's plane (x fixed), end to end. */
function boxAxisSpoke(cx, cy, cz, dx, dy) {
  const n = Math.hypot(dx, dy), g = box(-0.025, -n, -0.025, 0.025, n, 0.025);
  g.rotateZ(-Math.atan2(dx, dy));
  g.translate(cx, cy, cz);
  return g;
}

/** qin_army: {} — everyone in Pit 1. */
export function qinArmy(el, ctx) {
  const { bag, col } = ctx, rot = -Math.PI / 2, y = FL + 0.02, r = rng(2100);
  const zones = new Map();                                                       // corridor k → [[xa, xb]] kept for the chariots
  for (const c of CHARIOTS) { const l = zones.get(c.k) ?? []; l.push([c.x - 8.0, c.x + 1.0]); zones.set(c.k, l); chariot(bag, col, ctx, c.x, corrZ(c.k), c.k * 31 + Math.round(c.x)); }
  const inZone = (k, x) => (zones.get(k) ?? []).some(([a, b]) => x > a && x < b);
  for (let k = 0; k < CORR.n; k++) for (const f of FILES) {
    const z = corrZ(k) + f;
    let run = null;
    for (let x = CORR.x0 + 1.2, n = 0; x < CORR.x1 - 0.5; x += FILE_STEP, n++) {
      if (inZone(k, x)) { if (run) { col.rect([run, z - 0.3, x - FILE_STEP + 0.3, z + 0.3], FL, FL + 2); run = null; } continue; }
      if (run === null) run = x - 0.3;
      const q = r();
      const kind = n % 17 === 6 && f > 0 ? 'officer' : q < 0.3 ? 'arm' : q < 0.5 ? 'arm_spear' : q < 0.62 ? 'arm_halberd' : q < 0.82 ? 'inf' : 'inf_spear';
      soldier(bag, { at: [x, z], y, rot, kind, seed: k * 4093 + n * 7 + (f > 0 ? 1 : 0) });
    }
    if (run !== null) col.rect([run, z - 0.3, CORR.x1, z + 0.3], FL, FL + 2);
  }
  // the vanguard: three ranks of archers across the front gallery, the corridors' mouths left open
  const open = [2, 5, 8].map((k) => corrZ(k));
  const segs = []; let a = PIT.z0 + PIT.wall;
  for (const zc of open) { segs.push([a, zc - 1.05]); a = zc + 1.05; }
  segs.push([a, PIT.z1 - PIT.wall]);
  ARCHERS.rows.forEach((x, ri) => {
    for (const [za, zb] of segs) {
      for (let z = za + 0.55, n = 0; z < zb - 0.3; z += ARCHERS.spacing, n++) {
        const kind = ri === 1 && n % 2 ? 'kneel' : ri === 2 ? 'archer_light' : 'archer';
        soldier(bag, { at: [x + (kind === 'kneel' ? -0.1 : 0), z], y, rot, kind, seed: 900 + ri * 211 + n * 13 + Math.round(za) });
      }
    }
  });
  for (const [za, zb] of segs) col.rect([ARCHERS.rows[0] - 0.4, za, ARCHERS.rows[2] + 0.4, zb], FL, FL + 2);
  // the generals: three in the front gallery's ends of the corridors' second rank
  for (const k of [3, 7]) soldier(bag, { at: [111, corrZ(k)], y, rot, kind: 'general', seed: 5000 + k });
}

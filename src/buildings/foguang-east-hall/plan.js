// The Great East Hall of Foguang Monastery, Mount Wutai, as completed in 857 — plan data from
// docs/buildings/foguang-east-hall.md (§4). Local coordinates: origin at the centre of the hall,
// +x east (the back of the hall: it faces west, −x), +z south; y = 0 at the monastery's lower
// courtyard. Metres.

import { SITES } from '../../world/regions.js';

const E = [];
const add = (o) => (E.push(o), o);
const floor = (rect, y, mat, extra = {}) => add({ t: 'floor', rect, y, mat, ...extra });
const block = (rect, y0, y1, mat, extra = {}) => add({ t: 'block', rect, y0, y1, mat, ...extra });
const obj = (kind, x, z, y, extra = {}) => add({ t: 'obj', kind, at: [x, z], y, ...extra });

const T = 13;                          // the upper terrace, 13 m above the courtyard
const F = T + 1.0;                     // the hall's floor on its platform
const XS = [-8.83, -4.415, 0, 4.415, 8.83];                           // column lines across (depth)
const ZS = [-17.0, -12.6, -7.56, -2.52, 2.52, 7.56, 12.6, 17.0];       // column lines along (width)
const H0 = 4.99, RISE = 0.05;          // column height at the centre; rise per bay toward the ends
const colH = (z) => H0 + RISE * Math.round(Math.abs(z) / 5.04 + 0.4);

// ── terraces, stairs, platform ───────────────────────────────────────────────
floor([-118, -46, -62, 46], 0, 'travertine', { th: 0.3 });
block([-62, -48, 34, 48], 0, 6.3, 'brick_grey');               // tops sit under the paving: no coplanar faces
floor([-62, -48, -30, 48], 6.5, 'travertine', { th: 0.2 });
block([-30, -48, 34, 48], 6.3, T - 0.2, 'brick_grey');
floor([-30, -48, 34, 48], T, 'travertine', { th: 0.2 });
add({ t: 'stair', rect: [-74, -4, -62, 4], dir: 'e', y0: 0, y1: 6.5, riser: 0.171, base: 0, mat: 'limestone' });
add({ t: 'stair', rect: [-42, -4, -30, 4], dir: 'e', y0: 6.5, y1: T, riser: 0.171, base: 6.5, mat: 'limestone' });
// the terrace walls: a footing of dressed stone, the brick face, a stone coping, and along the
// fronts a low parapet of brick under grey tiles, open where the stairs come up; cheek walls by the stairs
for (const [x, y0, y1] of [[-62, 0, 6.5], [-30, 6.5, T]]) {
  block([x - 0.25, -48.25, x + 0.6, 48.25], y0 - 0.2, y0 + 0.9, 'limestone', { collide: false });
  block([x - 0.15, -48.15, x + 0.4, 48.15], y1 - 0.25, y1 + 0.02, 'limestone', { collide: false });
  for (const [z0, z1] of [[-48, -4.4], [4.4, 48]]) {
    block([x, z0, x + 0.5, z1], y1, y1 + 0.85, 'brick_grey');
    block([x - 0.08, z0 - 0.08, x + 0.58, z1 + 0.08], y1 + 0.85, y1 + 1.0, 'tile_grey', { collide: false });
  }
  for (const sz of [-1, 1]) {
    const run = 12, zc = sz * 4.25;
    for (let i = 0; i < 6; i++) {
      const t0 = i / 6, t1 = (i + 1) / 6;
      block([x - run * (1 - t0), zc - 0.3, x - run * (1 - t1), zc + 0.3], y0, y0 + (y1 - y0) * t1 + 0.6, 'limestone', { collide: false });
    }
  }
}
block([-13.5, -20.0, 11.0, 20.0], T, F - 0.15, 'limestone');
floor([-13.5, -20.0, 11.0, 20.0], F, 'sandstone_floor', { th: 0.15 });
add({ t: 'stair', rect: [-16.0, -3.0, -13.5, 3.0], dir: 'e', y0: T, y1: F, riser: 0.167, base: T, mat: 'limestone' });

// ── columns, outer and inner rings ───────────────────────────────────────────
const outer = [], inner = [];
for (const x of XS) for (const z of ZS) {
  const onOuter = Math.abs(Math.abs(x) - 8.83) < 0.01 || Math.abs(Math.abs(z) - 17.0) < 0.01;
  const onInner = !onOuter && (Math.abs(Math.abs(x) - 4.415) < 0.01 && Math.abs(z) <= 12.61 || Math.abs(Math.abs(z) - 12.6) < 0.01 && Math.abs(x) <= 4.42);
  if (onOuter) outer.push([x, z]);
  else if (onInner) inner.push([x, z]);
}
for (const [x, z] of [...outer, ...inner]) add({ t: 'column', at: [x, z], y: F, h: colH(z), d: 0.54 });

// ── bracket sets on every column and between (seven-puzuo: two flower arms, two cantilevers) ──
const outward = (x, z) => {
  const ex = Math.abs(Math.abs(x) - 8.83) < 0.01, ez = Math.abs(Math.abs(z) - 17.0) < 0.01;
  if (ex && ez) { const l = Math.SQRT2; return [Math.sign(x) / l, Math.sign(z) / l]; }
  return ex ? [Math.sign(x), 0] : [0, Math.sign(z)];
};
const isCorner = (x, z) => Math.abs(Math.abs(x) - 8.83) < 0.01 && Math.abs(Math.abs(z) - 17.0) < 0.01;
const LV = 0.41, lvl = (z, k) => F + colH(z) + 0.24 + k * LV;           // the bottom of tier k of a set
for (const [x, z] of outer) add({ t: 'tang_bracket_set', at: [x, z], y: F + colH(z), dir: outward(x, z), kind: isCorner(x, z) ? 'corner' : 'column' });
for (const [x, z] of inner) {
  const d = Math.abs(Math.abs(x) - 4.415) < 0.01 ? [Math.sign(x), 0] : [0, Math.sign(z)];
  add({ t: 'tang_bracket_set', at: [x, z], y: F + colH(z), dir: d, kind: 'inner' });
}
// the column lines of the two rings, side by side: [[x, z]…] in order
const outerSides = [ZS.map((z) => [-8.83, z]), ZS.map((z) => [8.83, z]), XS.map((x) => [x, -17.0]), XS.map((x) => [x, 17.0])];
const innerZ = ZS.filter((z) => Math.abs(z) <= 12.61), innerX = [-4.415, 0, 4.415];
const innerSides = [innerZ.map((z) => [-4.415, z]), innerZ.map((z) => [4.415, z]), innerX.map((x) => [x, -12.6]), innerX.map((x) => [x, 12.6])];
const fang = (p, q, y0, y1, w, h, mat = 'timber_red', ext = 0) => add({ t: 'tang_fang', a: [p[0], p[1], y0], b: [q[0], q[1], y1], w, h, mat, ext });
// the intercolumnar sets: a short post on the architrave, two flower arms carrying the luohan fang
for (const side of outerSides) for (let i = 0; i < side.length - 1; i++) {
  const [p, q] = [side[i], side[i + 1]], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const yc = (F + colH(p[1]) + F + colH(q[1])) / 2, yb = yc + 0.82, d = outward(m[0], m[1]);
  add({ t: 'tang_bracket_set', at: m, y: yb, dir: d, kind: 'between', post: yb - (F + H0) });
}
// the timbers that tie the sets together, bay by bay, following the columns' rise toward the corners:
// in the wall plane a stack of column-head fang; outside, the luohan fang on the second tier's tips
// and the eave purlin on the bearing blocks of the ling gong
for (const side of outerSides) for (let i = 0; i < side.length - 1; i++) {
  const [p, q] = [side[i], side[i + 1]], n = outward((p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  const off = (pt, r) => [pt[0] + n[0] * r, pt[1] + n[1] * r];
  const endP = i === 0, endQ = i === side.length - 2;
  for (const k of [2, 3, 4, 5, 6]) fang(p, q, lvl(p[1], k), lvl(q[1], k), 0.22, 0.30, 'timber_red', 0.11);
  // outside the line: extended at the corners to meet the other side's
  const ex = (r) => [endP ? r : 0, endQ ? r : 0];
  const lo = (r) => { const [e0, e1] = ex(r), u = [(q[0] - p[0]), (q[1] - p[1])], l = Math.hypot(...u); return [[off(p, r)[0] - u[0] / l * e0, off(p, r)[1] - u[1] / l * e0], [off(q, r)[0] + u[0] / l * e1, off(q, r)[1] + u[1] / l * e1]]; };
  const [l0, l1] = lo(0.96 + 0.11);
  fang(l0, l1, lvl(p[1], 4), lvl(q[1], 4), 0.22, 0.30);
  const [e0, e1] = lo(1.92 + 0.17);
  fang(e0, e1, lvl(p[1], 4) + 0.56, lvl(q[1], 4) + 0.56, 0.34, 0.34);
}
for (const side of innerSides) for (let i = 0; i < side.length - 1; i++) {
  const [p, q] = [side[i], side[i + 1]];
  for (const k of [2, 3]) fang(p, q, lvl(p[1], k), lvl(q[1], k), 0.22, 0.30, 'timber_red', 0.11);
}

// ── architraves ("seven red, eight white"), the plaster between the sets ──
// overhead beams in a rectangle (no colliders: they are above head height and sit on the columns)
const ring = (hx, hz, y, w, h, mat, ext = 0) => {
  block([-hx - ext, -hz - w / 2, hx + ext, -hz + w / 2], y, y + h, mat, { collide: false });
  block([-hx - ext, hz - w / 2, hx + ext, hz + w / 2], y, y + h, mat, { collide: false });
  block([-hx - w / 2, -hz - ext, -hx + w / 2, hz + ext], y, y + h, mat, { collide: false });
  block([hx - w / 2, -hz - ext, hx + w / 2, hz + ext], y, y + h, mat, { collide: false });
};
ring(8.83, 17.0, F + H0 - 0.42, 0.34, 0.42, 'timber_red', 0.3);
ring(4.415, 12.6, F + H0 - 0.42, 0.34, 0.42, 'timber_red', 0.3);
// the white patches of the architrave, eight to a bay, on the outer faces
for (let i = 0; i < ZS.length - 1; i++) for (let k = 0; k < 8; k++) {
  const z0 = ZS[i] + (ZS[i + 1] - ZS[i]) * (k + 0.2) / 8, z1 = ZS[i] + (ZS[i + 1] - ZS[i]) * (k + 0.8) / 8;
  for (const sx of [-1, 1]) block([Math.min(sx * 9.0, sx * 9.02), z0, Math.max(sx * 9.0, sx * 9.02), z1], F + H0 - 0.34, F + H0 - 0.1, 'paint_white', { collide: false });
}
// the plastered panels (gongyan bi) between the sets and the fang, up to the rafters
ring(8.83, 17.0, F + H0, 0.14, 3.45, 'paint_white', 0);

// ── the walls: red earth walls at the sides and back; doors and windows on the front ─
// walls fill the bays between the columns (the posts stand in the wall)
const C = 0.28;
const bayWalls = (fixed, along, axis, openingFor = () => []) => {
  for (let i = 0; i < along.length - 1; i++) {
    const p0 = along[i] + C, p1 = along[i + 1] - C;
    const a = axis === 'z' ? [fixed, p0] : [p0, fixed], b = axis === 'z' ? [fixed, p1] : [p1, fixed];
    add({ t: 'wall', a, b, th: 0.9, y0: F, y1: F + H0 - 0.42, openings: openingFor(i, p1 - p0), mat: 'wall_red' });
  }
};
bayWalls(8.83, ZS, 'z');
bayWalls(-17.0, XS, 'x');
bayWalls(17.0, XS, 'x');
// the front: five plank doors in the central bays; slatted windows over sill walls in the end bays
bayWalls(-8.83, ZS, 'z', (i, L) => (i >= 1 && i <= 5 ? [{ at: L / 2, w: 3.6, h: 3.9, y0: F }] : [{ at: L / 2, w: 2.6, h: 1.8, y0: F + 1.8 }]));
for (let i = 1; i <= 5; i++) {
  const zc = (ZS[i] + ZS[i + 1]) / 2;
  // the two leaves, standing open against the inner face of the wall
  for (const s of [-1, 1]) block([-8.4, Math.min(zc + s * 1.8, zc + s * 1.85), -7.0, Math.max(zc + s * 1.8, zc + s * 1.85)], F, F + 3.9, 'timber_red');
}
for (const i of [0, 6]) {
  const zc = (ZS[i] + ZS[i + 1]) / 2;
  for (let k = -5; k <= 5; k++) block([-8.9, zc + k * 0.22 - 0.035, -8.76, zc + k * 0.22 + 0.035], F + 1.8, F + 3.6, 'timber_red', { collide: false });
}

// ── the interior: ceilings, the altar and its statues ───────────────────────
// the ceilings (ping'an): backing boards over a close grid of square strips, lacquered red without pattern; the
// outer aisle's flat over the crescent beams, the inner zone's higher, its edges slanting up on rafters to the flat
add({ t: 'tang_pingan', rect: [-8.83, -17.0, 8.83, 17.0], y: F + 7.8, holes: [[-4.6, -12.8, 4.6, 12.8]], pitch: 0.3 });
add({ t: 'tang_pingan', rect: [-4.6, -12.8, 4.6, 12.8], y: F + 9.0, pitch: 0.3, border: { w: 1.2, rise: 1.25 } });
// crescent beams linking the rings across the outer aisle
for (const z of ZS.slice(1, -1)) for (const sx of [-1, 1]) block([Math.min(sx * 4.415, sx * 8.83), z - 0.15, Math.max(sx * 4.415, sx * 8.83), z + 0.15], F + 7.2, F + 7.75, 'timber_red', { collide: false });
for (const x of XS.slice(1, -1)) for (const sz of [-1, 1]) block([x - 0.15, Math.min(sz * 12.6, sz * 17.0), x + 0.15, Math.max(sz * 12.6, sz * 17.0)], F + 7.2, F + 7.75, 'timber_red', { collide: false });
// the altar platform in the inner zone, the statues facing west, as Liang Sicheng and Lin Huiyin recorded them
// (1944): Śākyamuni in the central bay touching the earth, an alms bowl in his lap; Maitreya seated with the feet
// down in the bay to his left (north), Amitābha on a hexagonal sumeru seat to the right (south); in the end bays
// Samantabhadra on the elephant (north) and the lion-rider read as Guanyin (south), each with two attendant
// bodhisattvas and the groom leading the animal; Kāśyapa and Ānanda beside Śākyamuni, attendant bodhisattvas at the
// sides of each Buddha and two kneeling offering bodhisattvas on lotuses before them; armoured heavenly kings with
// swords at the front corners of the end bays
const A = F + 0.9, W = [-1, 0];
block([-3.0, -12.2, 3.8, 12.2], F, A, 'limestone', { walk: false });
obj('buddha', 0.8, 0, A, { h: 5.2, dir: W, mudra: 'earth' });
obj('buddha', 0.8, -5.04, A, { h: 5.2, dir: W, pendant: true });
obj('buddha', 0.8, 5.04, A, { h: 5.2, dir: W, hexSeat: true });
const st = (type, x, z, h, extra = {}) => obj('statue', x, z, A, { type, h, dir: W, ...extra });
st('disciple', 0.4, -1.9, 2.6, { robe: 'clay_robe', robe2: 'clay_green' });
st('disciple', 0.4, 1.9, 2.6, { robe: 'clay_robe', robe2: 'clay_robe' });
for (const z0 of [0, -5.04, 5.04]) {
  for (const k of [-1, 1]) st('bodhisattva', -0.9, z0 + k * 2.05, 2.8, { robe: 'clay_robe', robe2: 'clay_green' });
  for (const k of [-1, 1]) st('kneel', -2.2, z0 + k * 0.85, 2.0, { robe: 'clay_green', robe2: 'clay_robe' });
}
obj('mount', 0.7, -10.08, A, { animal: 'elephant', dir: W, rider: 2.9 });
obj('mount', 0.7, 10.08, A, { animal: 'lion', dir: W, rider: 2.9 });
for (const z0 of [-10.08, 10.08]) {
  for (const k of [-1, 1]) st('bodhisattva', 0.6, z0 + k * 1.75, 2.6, { robe: 'clay_green', robe2: 'clay_robe' });
  st('groom', -2.1, z0 - Math.sign(z0) * 0.9, 2.1, { robe: 'clay_robe', robe2: 'clay_green', dir: [-0.6, Math.sign(z0) * 0.8] });
}
for (const sz of [-1, 1]) st('king', -2.35, sz * 11.6, 3.2, { robe: 'clay_green', robe2: 'clay_robe' });
// oil lamps on bronze stands before the three Buddhas, the hall's only light besides the open doors
for (const z0 of [0, -5.04, 5.04]) for (const k of [-1, 1]) add({ t: 'tang_lamp', at: [-3.55, z0 + k * 1.1], y: F, h: 1.25 });

// ── the roof ─────────────────────────────────────────────────────────────────
// eaves 4.0 m past the column line on rafters and flying rafters; the lowest slope about 0.3, steeper toward the ridge
add({ t: 'hip_roof', c: [0, 0], A: 17.0 + 4.0, B: 8.83 + 4.0, alongZ: true, y: F + 7.5, rise: 5.0, eaveSlope: 0.3, pow: 1.6, lift: 0.6, mat: 'tile_grey', soffit: 'timber_red', rafters: { out: 4.0, sp: 0.32 }, tangChiwei: 2.3 });

// ── the monastery: gate, walls, the Tang pillar, the old pagoda ──────────────
{
  const gx = -114;
  for (const z of [-4.5, 4.5, -1.5, 1.5]) add({ t: 'column', at: [gx, z], y: 0, h: 4.2, d: 0.4 });
  for (const z of [-4.5, 4.5]) add({ t: 'column', at: [gx + 4, z], y: 0, h: 4.2, d: 0.4 });
  add({ t: 'gable_roof_c', c: [gx + 2, 0], A: 4.2, B: 7.0, y: 4.6, rise: 2.6 });
  for (const sz of [-1, 1]) add({ t: 'wall', a: [gx + 2, sz * 6.0], b: [gx + 2, sz * 46], th: 0.8, y0: 0, y1: 3.2, openings: [], mat: 'earth_wall' });
  for (const sz of [-1, 1]) add({ t: 'wall', a: [gx + 2, sz * 46], b: [-62, sz * 46], th: 0.8, y0: 0, y1: 3.2, openings: [], mat: 'earth_wall' });
  for (const sz of [-1, 1]) block([gx + 1.8, Math.min(sz * 6.0, sz * 46), gx + 2.2, Math.max(sz * 6.0, sz * 46)], 3.2, 3.5, 'tile_grey', { collide: false });
}
obj('dharani_pillar', -22, -8, T);
obj('pagoda', 6, 32, T);

// ── rooms and walks ──────────────────────────────────────────────────────────
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('courtyard', [-108, -30, -80, 30], 0, 'open'),
  room('middle-terrace', [-58, -20, -46, 20], 6.5, 'open'),
  room('upper-terrace', [-28, -20, -18, 20], T, 'open'),
  room('front-aisle', [-8, -14, -5.5, 14], F, 'hall'),
  room('rear-aisle', [5.5, -14, 8, 14], F, 'hall'),
];
const walks = [
  [[-124, 0], [-111, 0], [-80, 0], [-75, 0], [-61, 0], [-44, 0], [-29, 0], [-17, 0], [-13, 0], [-7.6, 0], [-6.2, 0], [-6.2, 14.8], [6.6, 14.8], [6.6, 0], [6.6, -14.8], [-6.2, -14.8], [-6.2, 0]],
];
walks[0].y0 = 0;

export const foguangEastHall = {
  id: 'foguang-east-hall',
  name: { en: 'The Great East Hall of Foguang Monastery', zh: '佛光寺东大殿' },
  era: { en: 'Tang dynasty, AD 857', zh: '唐，大中十一年（公元857年）' },
  style: 'chinese',
  district: 'tang',
  ...SITES['foguang-east-hall'],
  entrance: { at: [-124, 0], facing: 'e' },
  bounds: [-125, -48, 34, 48],
  bakeBounds: [-30, -24, 16, 24],
  bakeTop: 30,
  bakeSpacing: 1.0,
  elements: E,
  rooms,
  walks,
};

export default foguangEastHall;

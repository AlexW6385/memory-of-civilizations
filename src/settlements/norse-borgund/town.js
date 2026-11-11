// The farms and the life of the valley (docs/settlements/norse-borgund.md §5, §10): the log buildings
// of the eight tun; and as still figures and objects the farm's summer work — hay being made in the
// meadows and stacked, wood cut and stacked by the doors, the sledges of the farm, hens in the yards;
// cattle, sheep, goats and horses at pasture with their herders; at the church the priest at the
// altar and a few people in the churchyard and at its gate.
import { SETERS, LANDING, RADIUS, CHURCH, BELL, YARD, FARMS, RIVER, height, buildings, doorOf, inBuilding, inRiver, riverZ } from './layout.js';

const face = (dx, dz) => Math.atan2(-dx, -dz);
const nearBb = (doorB, B0, B1, d) => (doorB === B0 ? B0 + d : B1 - d);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'n' }, elements });
const CLOTH = ['cloth_brown', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_red', 'cloth_indigo', 'hide_tan'];
const HAIR = ['hide_tan', 'hide_brown', 'hide_tan', 'hide_black'];
/** Open, gentle ground away from buildings, the river and the church's yard. */
const free = (x, z, m = 2) => !inBuilding(x, z, m) && !inRiver(x, z) && Math.abs(z - riverZ(x)) > RIVER.w / 2 + 4 && height(x, z) < 7 && Math.hypot(x, z) < RADIUS - 70
  && !(x > YARD[0] - 3 && x < YARD[2] + 3 && z > YARD[1] - 3 && z < YARD[3] + 3);

export function life() {
  const rand = rng(1251), L = [];
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.55 ? 'tunic' : 'robe', cloth: CLOTH[Math.floor(rand() * CLOTH.length)], cloth2: CLOTH[Math.floor(rand() * CLOTH.length)], skin: 'skin_light', hat: rand() < 0.3 ? 'cap' : 'none', hair: rand() < 0.5 ? 'short' : 'long', hairMat: HAIR[Math.floor(rand() * HAIR.length)], beard: rand() < 0.4 ? 1 : 0, legs: 'hose', feet: 'shod', ...o });
  const beast = (kind, at, rot, y) => L.push({ t: 'animal', kind, at, y: y ?? height(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9) });
  const put = (t, at, o = {}) => L.push({ t, at, y: height(at[0], at[1]), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), ...o });
  const near = (c, r) => { for (let k = 0; k < 30; k++) { const a = rand() * 6.28, d = r * (0.3 + rand() * 0.7), p = [c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d]; if (free(p[0], p[1], 1.5)) return p; } return null; };
  const B = buildings();
  // at each farm: people at their work in the yard, wood stacked by the dwelling, a sledge, hens, a dog
  FARMS.forEach(([fx, fz], i) => {
    for (const b of B.filter((q) => Math.hypot((q.rect[0] + q.rect[2]) / 2 - fx, (q.rect[1] + q.rect[3]) / 2 - fz) < 20)) {
      if (b.kind === 'stue') { const p = [b.rect[0] - 0.9, (b.rect[1] + b.rect[3]) / 2]; if (free(p[0], p[1], 0.3)) put('firewood', p, { rot: Math.PI / 2, len: Math.min(2.4, b.rect[3] - b.rect[1] - 0.6) }); }
      if (b.kind === 'barn' && rand() < 0.6) { const p = [b.rect[2] + 3.4, (b.rect[1] + b.rect[3]) / 2]; if (free(p[0], p[1], 2)) put('haystack', p); }
    }
    let p = near([fx, fz], 9); if (p) fig(p, rand() * 6.28, { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' });
    p = near([fx, fz], 9); if (p) fig(p, rand() * 6.28, { pose: 'squat' });
    p = near([fx, fz], 12); if (p) put('chickens', p, { n: 3 + Math.floor(rand() * 4) });
    p = near([fx, fz], 14); if (p) put('sledge', p, { load: rand() < 0.5 ? 'empty' : 'bales' });
    if (i % 2 === 0) { p = near([fx, fz], 10); if (p) beast('dog', p, rand() * 6.28); }
    if (i % 3 === 0) { p = near([fx, fz], 14); if (p) put('barrel', p, { n: 2 }); }
    // water carried up from the river on the shoulder yoke; wood split at the block by the woodpile
    p = near([fx, fz], 13); if (p) fig(p, rand() * 6.28, { carry: 'yoke', dress: 'robe', hair: 'long', beard: 0 });
    if (i % 2 === 1) { p = near([fx, fz], 10); if (p) { put('firewood', [p[0] + 1.2, p[1]], { rot: 0, len: 1.6 }); fig(p, -Math.PI / 2, { pose: 'squat', dress: 'tunic' }); } }
  });
  // haymaking in the meadows by the farms: the mowers with their scythes (a pole), the rakers, the stacks rising
  for (const [fx, fz] of FARMS.filter((_, i) => i % 2 === 1)) {
    const c = [fx + (fx < 0 ? 34 : -34), fz + 6];
    for (let k = 0; k < 3; k++) { const p = near(c, 12); if (p && free(p[0], p[1], 2.5)) put('haystack', p); }
    for (let k = 0; k < 4; k++) { const p = near(c, 14); if (p) fig(p, rand() * 6.28, { carry: k < 2 ? 'pole' : 'hoe', dress: 'tunic' }); }
  }
  // cattle, sheep and goats at pasture with a herder; the farms' horses
  const herds = [[[-60, -95], 'ox', 5], [[120, -115], 'sheep', 9], [[-185, 10], 'sheep', 8], [[190, 75], 'ox', 4], [[-120, 120], 'goat', 6], [[60, 115], 'horse', 3], [[-20, 60], 'ox', 3], [[150, -10], 'horse', 2]];
  for (const [c, kind, n] of herds) {
    if (!free(c[0], c[1], 3)) continue;
    const dir = rand() * 6.28;
    for (let k = 0; k < n; k++) { const p = near(c, kind === 'sheep' ? 7 : 10); if (p) beast(kind, p, dir + (rand() - 0.5) * 1.6); }
    const h = near(c, 9); if (h) fig(h, dir + Math.PI, { carry: 'pole', dress: 'tunic' });
  }
  // at the church: the priest at the altar; people in the churchyard and at the gate
  const S = 0.85, cy = height(...CHURCH) + 0.35 * S;
  fig([CHURCH[0] + 8.0 * S, CHURCH[1]], Math.PI / 2 + Math.PI, { y: cy, dress: 'robe', cloth: 'linen', cloth2: 'cloth_white', over: 'cape', hat: 'none', hair: 'shaven', beard: 0, pose: 'stand' });
  for (const [x, z, pose] of [[-8, -12, 'talk'], [-6.6, -11.2, 'talk'], [9, -42, 'stand'], [-1.2, -4.5, 'stand'], [1.0, -3.6, 'talk']]) fig([x, z], Math.atan2(-(CHURCH[0] - x), -(CHURCH[1] - z)), { pose });
  // inside the houses: the housewife squatting at the hearth, an old man on the bench of the dwellings; the smith at his anvil;
  // in the barns the beasts in their stalls (the plan of styles/norse/farm.js barnInside); pigs and geese in the yards, cats and dogs at the doors
  B.forEach((b) => {
    const [x0, z0, x1, z1] = b.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, alongX = x1 - x0 >= z1 - z0, fl = b.y + 0.17, wt = 0.19;
    const A0 = alongX ? x0 + wt : z0 + wt, A1 = alongX ? x1 - wt : z1 - wt, B0 = alongX ? z0 + wt : x0 + wt, B1 = alongX ? z1 - wt : x1 - wt, am = alongX ? cx : cz, bm = alongX ? cz : cx;
    const W = (a, bb) => (alongX ? [a, bb] : [bb, a]), doorB = b.front ? B0 : B1, far = doorB === B0 ? B1 : B0, sg = far === B1 ? -1 : 1;
    if (b.kind === 'stue') {
      if (rand() < 0.8) fig(W(am - 0.3, bm + 0.62), face(...(alongX ? [0, -1] : [-1, 0])), { y: fl, pose: 'squat', dress: 'robe', hair: 'long', beard: 0, cloth: 'cloth_red' });
      if (rand() < 0.55) { const bb = far + sg * 0.5; fig(W(am - 2.0, bb), face(...(alongX ? [0, -sg] : [-sg, 0])), { y: fl + 0.01, pose: 'sit', dress: 'tunic', hair: 'short', beard: 1, hat: 'none', cloth: 'cloth_brown' }); }
    } else if (b.kind === 'smithy') {
      fig(W(am + 0.6, bm + 0.8 * sg), face(...(alongX ? [0, -sg] : [-sg, 0])), { y: fl, pose: 'stand', dress: 'tunic', over: 'apron', hair: 'short', beard: 1, hat: 'none', cloth: 'cloth_grey', cloth2: 'hide_brown', carry: 'none' });
      fig(W(am - 0.7, nearBb(doorB, B0, B1, 1.3)), face(...(alongX ? [0, doorB === B0 ? -1 : 1] : [doorB === B0 ? -1 : 1, 0])), { y: fl, pose: 'stand', dress: 'tunic', hair: 'short', beard: 0, cloth: 'cloth_brown' });
    } else if (b.kind === 'barn') {
      const mowSide = (b.seed % 2) ? 1 : -1, y0 = mowSide > 0 ? A0 : am + 1.6, y1 = mowSide > 0 ? am - 1.6 : A1, n = Math.max(2, Math.floor((y1 - y0) / 1.25)), w = (y1 - y0) / n;
      const kind = ['ox', 'sheep', 'goat', 'horse'][b.seed % 4], dir = alongX ? [0, -sg] : [-sg, 0];
      for (let k = 0; k < n; k++) if (rand() < 0.85) beast(kind === 'ox' && k > 1 ? 'goat' : kind, W(y0 + (k + 0.5) * w, far + sg * 1.25), face(...dir), fl);
      if (rand() < 0.5) fig(W(am - 0.5, nearBb(doorB, B0, B1, 1.5)), face(...dir), { y: fl, pose: 'stand', carry: 'pole', dress: 'tunic' });
    }
    if (b.kind === 'stue' || b.kind === 'barn') {
      const { at, n } = doorOf(b);
      if (rand() < 0.45) beast('dog', [at[0] + n[0] * 2.4 - n[1] * 1.2, at[1] + n[1] * 2.4 + n[0] * 1.2], rand() * 6.28);
      if (rand() < 0.4) beast('cat', [at[0] + n[0] * 1.0 + n[1] * 0.9, at[1] + n[1] * 1.0 - n[0] * 0.9], rand() * 6.28);
    }
  });
  FARMS.forEach(([fx, fz], i) => {
    let p = near([fx, fz], 11); if (p) beast('pig', p, rand() * 6.28); p = near([fx, fz], 11); if (p && i % 2) beast('pig', p, rand() * 6.28);
    p = near([fx, fz], 12); if (p) put('chickens', p, { n: 4, kind: 'goose' });
    p = near([fx, fz], 12); if (p) fig(p, rand() * 6.28, { pose: 'stand', carry: 'pole', dress: 'tunic', hat: 'cap' });
    p = near([fx, fz], 9); if (p) fig(p, rand() * 6.28, { pose: 'talk', h: 1.1, dress: 'tunic', hat: 'none' });
    if (i % 3 === 0) { p = near([fx, fz], 12); if (p) put('well', p); }
  });
  // the summer huts: goats and cows round the yard, the milkmaid with her yoke and pails, the cheese-maker at the door
  SETERS.forEach(([sx, sz], i) => {
    for (let k = 0; k < 5; k++) { const p = near([sx, sz + 6], 14); if (p) beast(k < 3 ? 'goat' : 'ox', p, rand() * 6.28); }
    let p = near([sx, sz + 5], 6); if (p) fig(p, rand() * 6.28, { carry: 'yoke', dress: 'robe', hair: 'long', beard: 0, cloth: 'cloth_red' });
    p = near([sx, sz + 3], 5); if (p) fig(p, rand() * 6.28, { pose: 'squat', dress: 'robe', hair: 'long', beard: 0 });
    p = near([sx, sz + 3], 7); if (p) beast('dog', p, rand() * 6.28);
    p = near([sx, sz + 7], 8); if (p && i % 2 === 0) put('firewood', p, { len: 2 });
  });
  // at the river: women washing linen at the bank, boys fishing with lines, a man mending a net at the landing
  for (const x of [-250, -190, -120, -60, 0, 60, 120, 190, 250]) {
    const rz = riverZ(x), z = rz - RIVER.w / 2 - 0.6;
    if (!free(x, z - 2, 1)) continue;
    const dirw = [0, 1];
    if (Math.abs(x) % 120 < 70) { fig([x, z], face(...dirw), { pose: 'squat', dress: 'robe', hair: 'long', beard: 0, cloth: 'cloth_indigo', y: height(x, z) }); put('basket', [x + 0.9, z - 0.4]); }
    else fig([x + 0.5, z], face(...dirw), { pose: 'stand', carry: 'staff', dress: 'tunic', hat: 'cap', beard: 0, h: 1.2, y: height(x + 0.5, z) });
  }
  fig([LANDING.x + 4, LANDING.top - 2.5], face(-1, 0), { pose: 'sit_ground', dress: 'tunic', hat: 'cap', beard: 1 });
  // the churchyard: a woman kneeling at a grave, a man standing by the wall
  fig([-11.5, -17.2], face(1, 0), { pose: 'kneel', dress: 'robe', hair: 'long', beard: 0, cloth: 'cloth_grey', cloth2: 'cloth_white' });
  fig([14.5, -22], face(-1, 0), { pose: 'stand', dress: 'tunic', hat: 'cap', cloth: 'cloth_brown' });
  return L;
}

/** The landing: the quay, the boathouse with a boat drawn up, boats afloat at the quay, and the hay racks of the meadows. */
export function shore() {
  const L = LANDING, E = [], rand = rng(1252), w = RIVER.level;
  E.push({ t: 'quay', at: [L.x, L.top], y: L.y0, yd: L.yd, ramp: 4.6, deck: 11, w: 2.4, bed: height });
  E.push({ t: 'naust', c: L.naust, y: height(...L.naust) + 0.1, w: 5.2, d: 9.5, rot: 0, seed: 7 });
  const ze = L.top + 4.6 + 11;
  E.push({ t: 'nboat', at: [L.x + 2.3, ze - 3.2], y: w + 0.05, rot: Math.PI, len: 8.5, kind: 'sexaering', seed: 3 });
  E.push({ t: 'nboat', at: [L.x - 2.1, ze - 4.2], y: w + 0.05, rot: Math.PI + 0.06, len: 5.6, kind: 'faering', seed: 4 });
  E.push({ t: 'nboat', at: [L.naust[0] + 0.2, L.naust[1] + 9.5 / 2 + 6.5], y: height(L.naust[0], L.naust[1] + 13) + 0.05, rot: 0.08, len: 5.6, kind: 'beached', seed: 5 });
  // the nets hung to dry on two racks by the boathouse
  for (const [dx, dz] of [[-3, -4], [-3, 1]]) { const a = [L.x - 10 + dx, L.naust[1] + dz - 8], b = [a[0] + 5.5, a[1] + 0.3]; if ([a, b].every((p) => free(p[0], p[1], 1))) E.push({ t: 'net_rack', pts: [a, b], y: height, seed: 70 + dz }); }
  // hay racks (hesje) in the meadows by the farms, in rows across the slope
  FARMS.forEach(([fx, fz], i) => {
    if (i % 2 === 0) return;
    const sg = fx < 0 ? 1 : -1, cx = fx + sg * 30, cz = fz - 14;
    for (let r = 0; r < 2; r++) {
      const a = [cx, cz + r * 9], b = [cx + 14, cz + r * 9 + (rand() - 0.5) * 3];
      if ([a, b].every((p) => free(p[0], p[1], 1.5))) E.push({ t: 'hay_rack', pts: [a, b], y: height, h: 2.3, seed: 40 + i * 3 + r });
    }
  });
  return E;
}

const nearFarm = (x, z, except = -1) => FARMS.some(([fx, fz], i) => i !== except && Math.hypot(x - fx, z - fz) < 27);

/** The yards' small things: a doorstep at every door, chopping blocks, benches and tubs by the dwellings, racks, troughs, cairns, ladders. */
export function yardItems() {
  const rand = rng(1260), items = [], B = buildings();
  const ok = (p, m = 0.9) => !inBuilding(p[0], p[1], m) && !inRiver(p[0], p[1]) && height(p[0], p[1]) < 5;
  const add = (k, at, o = {}) => { if (ok(at, o.m ?? 0.9)) items.push({ k, at, y: height(at[0], at[1]), rot: o.rot ?? 0, seed: Math.floor(rand() * 1e6), ...o }); };
  for (const b of B) {
    const { at, n } = doorOf(b), [x0, z0, x1, z1] = b.rect, rot = Math.atan2(-n[0], -n[1]);
    if (b.kind === 'shed') continue;
    if (b.kind !== 'loft') add('step', [at[0] + n[0] * 0.55, at[1] + n[1] * 0.55], { rot, m: 0 });
    const side = (d) => [at[0] - n[1] * d + n[0] * 1.2, at[1] + n[0] * d + n[1] * 1.2];
    if (b.kind === 'stue') {
      add('block', side(2.6 + rand())); add('bench', [at[0] + n[1] * 2.1 + n[0] * 0.55, at[1] - n[0] * 2.1 + n[1] * 0.55], { rot: Math.atan2(n[1], n[0]) + Math.PI / 2 });
      if (rand() < 0.7) add('tub', [at[0] - n[1] * 3.4 + n[0] * 0.9, at[1] + n[0] * 3.4 + n[1] * 0.9]);
      if (rand() < 0.6) add('ladder', [(x0 + x1) / 2 + (rand() - 0.5) * 3, z1 + 0.35], { rot: Math.PI / 2 });
    } else if (b.kind === 'barn') {
      add('trough', [at[0] + n[1] * 3.2 + n[0] * 1.4, at[1] - n[0] * 3.2 + n[1] * 1.4], { rot: Math.atan2(n[1], n[0]) });
      if (rand() < 0.5) add('bark', [at[0] - n[1] * 3.6 + n[0] * 0.8, at[1] + n[0] * 3.6 + n[1] * 0.8]);
    } else if (b.kind === 'smithy') {
      add('grind', side(2.4)); add('tub', side(-2.2)); add('bark', side(3.6));
      for (let k = 0; k < 4; k++) add('block', [at[0] + n[0] * (2 + rand() * 2) + (rand() - 0.5) * 3, at[1] + n[1] * (2 + rand() * 2) + (rand() - 0.5) * 3]);
    }
  }
  FARMS.forEach(([fx, fz], i) => {
    const rot = rand() < 0.5 ? 0 : Math.PI / 2;
    for (let k = 0; k < 14; k++) { const p = [fx + (rand() - 0.5) * 20, fz - 2 + rand() * 10]; if (ok(p, 2.2)) { add('rack', p, { rot, len: 2.6 + rand() * 1.2, m: 2.2 }); break; } }
    for (const [dx, dz] of [[-30, -22], [32, 20], [-33, 24], [30, -24]]) if (rand() < 0.7 && !nearFarm(fx + dx, fz + dz, i)) add('cairn', [fx + dx + (rand() - 0.5) * 4, fz + dz + (rand() - 0.5) * 4], { m: 1 });
  });
  return items;
}
/** The infield walls: a dry-stone wall of cleared stones about each farm's meadow, a gap on each side for the beasts and the cart. */
export function infieldWalls() {
  const walls = [];
  FARMS.forEach(([fx, fz], i) => {
    const x0 = fx - 36, z0 = fz - 32, x1 = fx + 36, z1 = fz + 30, gx = 0.3 + (i % 3) * 0.2, gz = 0.45 + (i % 2) * 0.2;
    const sides = [[[x0, z0], [x1, z0], gx], [[x1, z0], [x1, z1], gz], [[x1, z1], [x0, z1], 1 - gx], [[x0, z1], [x0, z0], 1 - gz]];
    for (const [a, b, g] of sides) {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), at = (u) => [a[0] + (b[0] - a[0]) * u / L, a[1] + (b[1] - a[1]) * u / L];
      let run = [];
      const flush = () => { if (run.length >= 2) walls.push({ pts: run, seed: 3000 + walls.length }); run = []; };
      for (let u = 0; u <= L + 0.01; u += 2.5) {
        const p = at(Math.min(u, L)), gap = Math.abs(u / L - g) * L < 2.6;
        const bad = gap || nearFarm(p[0], p[1], i) || inBuilding(p[0], p[1], 2) || inRiver(p[0], p[1]) || Math.abs(p[1] - riverZ(p[0])) < RIVER.w / 2 + 5 || height(p[0], p[1]) > 4.5 || Math.hypot(p[0], p[1]) > RADIUS - 80
          || (p[0] > YARD[0] - 8 && p[0] < YARD[2] + 8 && p[1] > YARD[1] - 8 && p[1] < YARD[3] + 8);
        if (bad) flush(); else run.push(p);
      }
      flush();
    }
  });
  return walls;
}

export function farms() {
  const B = buildings();
  return [
    base('norse-borgund-farms', 'norse', B.map((b) => ({ t: 'log_house', ...b, open: b.kind === 'stue' || b.kind === 'barn' || b.kind === 'smithy' }))),
    base('norse-borgund-yards', 'norse', [
      { t: 'yard_props', items: yardItems() },
      ...infieldWalls().map((w) => ({ t: 'stone_wall', pts: w.pts, y: height, h: 0.95, th: 0.7, seed: w.seed })),
    ]),
    base('norse-borgund-shore', 'norse', shore()),
    base('norse-borgund-life', 'life', life()),
  ];
}

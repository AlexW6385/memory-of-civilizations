// The village and the way (docs/settlements/borobudur.md §16): the pilgrims' way from the east with its gate, its stalls of food
// and offerings, its halls for the weary and the people at them; the heart of each hamlet (a village hall with its bronze
// instruments, or a shrine), fences of plaited bamboo, rice mortars; the huts and scarecrows of the paddies, the buffalo at the
// plough; the monastery's gate, its shrines and paved ways. Plans in the settlement's frame; the style is `javanese`, the
// people and beasts `life`.

import { RADIUS, MONASTERY, HAMLETS, WAY, houses, inRect, frontVec, coreOf, wellAt, wayStalls, fieldSpots, CELLS, cellRect } from './layout.js';
import { ground } from './ground.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements) => ({ id, style: 'javanese', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [90, 0], facing: 'w' } });
const life = (id, elements, center, near) => ({ ...base(id, elements), style: 'life', center, near });
const pick = (rand, a) => a[Math.floor(rand() * a.length)];
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
const SK = ['skin_medium', 'skin_dark'];

/** A villager in the dress of the reliefs: sarong to the ankle, the men bare to the waist, the women's hair in a bun, children small. */
function person(rand, at, y, rot, o = {}) {
  const man = o.man ?? rand() < 0.5, kid = o.child ?? false;
  return {
    t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: man && !kid ? 'bare' : undefined,
    cloth: pick(rand, ['cloth_white', 'cloth_brown', 'cloth_indigo', 'cloth_red', 'cloth_ochre']), cloth2: pick(rand, ['cloth_white', 'cloth_ochre']),
    skin: pick(rand, SK), hat: man && !kid && rand() < 0.4 ? 'straw' : 'none', hair: kid ? 'short' : man ? 'short' : pick(rand, ['bun', 'bun', 'long']), pose: 'stand', child: kid || undefined, ...o,
  };
}

/** The pilgrims' way: the gate, the stalls and halls, and what stands and is sold along it. */
function way() {
  const E = [], L = [], rand = rng(5150), stalls = wayStalls();
  E.push({ t: 'gapura', at: [WAY.gate, 0], half: 2.6, h: 5.6 });
  for (const s of stalls) {
    const [x, z] = s.at, face = s.side < 0 ? 's' : 'n', toward = [0, -s.side];
    if (s.kind === 'rest') {
      const hw = s.w / 2, hd = 2.2;
      E.push({ t: 'pendopo', rect: [x - hw, z - hd, x + hw, z + hd], steps: [face, 'e'], h: 3.0 });
      // benches along the back, water jars by the stair, pilgrims resting
      for (const k of [-1, 0, 1]) L.push({ t: 'bench', at: [x + k * 2.0, z - s.side * (hd - 0.5)], y: 0.8, rot: s.side > 0 ? 0 : Math.PI, len: 1.7, mat: 'bamboo_culm', seed: s.seed + k });
      L.push({ t: 'pot', kind: 'water_pot', n: 3, at: [x + hw + 0.6, z + toward[1] * 0.9], y: 0.8, seed: s.seed + 3 });
      L.push({ t: 'basket', n: 2, at: [x - 1, z + toward[1] * 1.0], y: 0.8, seed: s.seed + 4, goods: 'cloth_ochre' });
      for (const k of [-1, 0, 1]) if (rand() < 0.8) {
        const bx = x + k * 2.0, bz = z - s.side * (hd - 0.5);
        L.push(person(rand, [bx + (rand() - 0.5) * 0.6, bz + s.side * 0.15], 0.8, faceTo(toward), { pose: 'sit', carry: rand() < 0.5 ? 'basket' : 'none' }));
      }
      L.push(person(rand, [x + 2.2, z + toward[1] * 0.2], 0.8, faceTo([-1, 0]), { pose: 'talk', man: false }), person(rand, [x + 1.2, z + toward[1] * 0.3], 0.8, faceTo([1, 0]), { pose: 'talk', man: true }));
      continue;
    }
    E.push({ t: 'warung', at: s.at, face, w: s.w, kind: s.kind, seed: s.seed });
    // the seller behind the counter (the floor is 0.4 up), buyers and the hens before it
    L.push(person(rand, [x, z - s.side * 0.55], 0.4, faceTo(toward), { pose: 'stand', man: rand() < 0.4, hair: 'bun' }));
    const nb = 1 + (rand() < 0.6 ? 1 : 0) + (rand() < 0.3 ? 1 : 0);
    for (let k = 0; k < nb; k++) L.push(person(rand, [x - 1.2 + k * 1.3 + rand() * 0.4, z + toward[1] * (1.6 + rand() * 0.8)], 0, faceTo([0, s.side]) + (rand() - 0.5) * 0.6, { pose: rand() < 0.4 ? 'talk' : 'stand', carry: rand() < 0.4 ? 'basket' : 'none' }));
    if (rand() < 0.5) L.push({ t: 'chickens', kind: 'hen', n: 3, at: [x + 1.8 * (rand() < 0.5 ? 1 : -1), z + toward[1] * 2.6], y: 0, seed: s.seed + 1 });
    if (rand() < 0.25) L.push({ t: 'animal', kind: 'dog', at: [x - 1.4, z + toward[1] * 2.2], y: 0, rot: rand() * 6.28, seed: s.seed + 2 });
  }
  // by the verge: goods laid on mats, their sellers squatting by them, loaded carts with their buffalo waiting, buffalo tethered in the shade
  for (let x = 84; x < WAY.x1; x += 11 + rand() * 9) {
    const side = rand() < 0.5 ? -1 : 1, z = side * (3.3 + rand() * 0.3);
    if (stalls.some((s) => Math.abs(s.at[0] - x) < 4 && s.side === side)) continue;
    const q = rand();
    if (q < 0.5) {
      L.push({ t: 'goods_mat', at: [x, z], y: 0, rot: side > 0 ? Math.PI : 0, seed: Math.floor(rand() * 1e9), goods: pick(rand, [['baskets', 'heap'], ['greens', 'melons'], ['pottery', 'baskets'], ['heap', 'greens']]) });
      L.push(person(rand, [x + 0.2, z + side * 0.95], 0, faceTo([0, -side]), { pose: 'squat', man: false, hair: 'bun' }));
    } else if (q < 0.8) {
      L.push({ t: 'cart', at: [x, z + side * 0.8], y: 0, rot: Math.PI / 2, seed: Math.floor(rand() * 1e9) });
      L.push({ t: 'animal', kind: 'buffalo', gear: false, at: [x + 3.2, z + side * 0.8], y: 0, rot: Math.PI / 2 + 0.2, seed: Math.floor(rand() * 1e9) });
    } else L.push({ t: 'animal', kind: 'buffalo', gear: false, graze: true, at: [x, z + side * 2.5], y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
  }
  // water in jars on stands at the gate's foot, for the pilgrims to wash hands and feet; the gate's door-keeper
  for (const side of [-1, 1]) {
    L.push({ t: 'pot', kind: 'water_pot', n: 3, at: [WAY.gate + 3.4, side * 3.3], y: 0, seed: 40 + side });
    L.push({ t: 'basket', n: 2, at: [WAY.gate - 3.2, side * 3.3], y: 0, seed: 50 + side, goods: 'cloth_red' });
  }
  L.push(person(rand, [WAY.gate - 2.4, 3.1], 0, faceTo([1, 0]), { pose: 'stand', man: true, hat: 'none' }));
  // people on the way: pairs walking up with offerings (the movers add the rest)
  for (let k = 0; k < 10; k++) L.push(person(rand, [100 + rand() * 120, (rand() < 0.5 ? -1 : 1) * (0.6 + rand() * 0.9)], 0, faceTo([-1, 0]), { carry: pick(rand, ['basket', 'pot', 'pole', 'none']) }));
  return [base('borobudur-way', E), life('borobudur-way-life', L, [170, 0], 230)];
}

/** The fences of the yards, each from the house's back corners round to the front, broken where a neighbour or the way is in the line. */
function fences() {
  const E = [], hs = houses(), rand = rng(77);
  for (const h of hs) {
    if (h.kind === 'lumbung' || rand() < 0.2) continue;
    const [x0, z0, x1, z1] = h.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, [fx, fz] = frontVec(h.front), tx = -fz, tz = fx;
    const half = (h.front === 'e' || h.front === 'w' ? x1 - x0 : z1 - z0) / 2, hw = (h.front === 'e' || h.front === 'w' ? z1 - z0 : x1 - x0) / 2;
    const at = (d, u) => [cx + fx * d + tx * u, cz + fz * d + tz * u];
    // a ring round the house: sides at u = ±(hw + 1.6), the back at d = −(half + 2.2), the front at d = half + 3.4, the front left open in the middle (the gate)
    const U = hw + 1.6 + rand() * 0.8, Bk = -(half + 2.0 + rand()), Fr = half + 3.4 + rand() * 1.4, g = 1.2;
    const segs = [[at(Bk, -U), at(Bk, U)], [at(Bk, -U), at(Fr, -U)], [at(Bk, U), at(Fr, U)], [at(Fr, -U), at(Fr, -g)], [at(Fr, g), at(Fr, U)]];
    for (const [a, b] of segs) {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.ceil(L / 1.2));
      let ok = true;
      for (let i = 0; i <= n && ok; i++) {
        const x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n;
        if (hs.some((q) => inRect(q.rect, x, z, 1.1) && q !== h) || HAMLETS.some(([hx, hz]) => Math.hypot(x - hx, z - hz) < 14) || Math.hypot(x, z) > RADIUS - 34 || (x > 60 && Math.abs(z) < 14 && x < WAY.x1 + 10)) ok = false;
      }
      if (ok) E.push({ t: 'pagarbambu', a, b, h: 1.0 + rand() * 0.2 });
    }
  }
  return E;
}

/** The hamlets' hearts, their rice mortars, the fences; and the figures in the village halls. */
function hamlets() {
  const plans = [], hs = houses();
  HAMLETS.forEach(([hx, hz], hi) => {
    const E = [], L = [], rand = rng(300 + hi), core = coreOf(hi);
    if (core === 'balai') {
      E.push({ t: 'pendopo', rect: [hx - 4.5, hz - 3.5, hx + 4.5, hz + 3.5], steps: ['e', 'w'], h: 3.2 });
      E.push({ t: 'gamelan', at: [hx - 0.5, hz - 2.6], y: 0.8, rot: 0 });
      // men sitting at ease on the mats, talking; a mat spread for guests; water and betel on a tray
      for (let k = 0; k < 4; k++) L.push(person(rand, [hx - 3 + k * 1.5 + rand() * 0.4, hz + 2.1 + rand() * 0.5], 0.8, faceTo([0, -1]) + (rand() - 0.5) * 0.6, { pose: 'cross', man: true, arms: k % 2 ? 'talk' : undefined }));
      L.push(person(rand, [hx + 3.1, hz - 2.4], 0.8, faceTo([-1, 0]), { pose: 'cross', man: true }), { t: 'pot', kind: 'water_pot', n: 2, at: [hx + 3.4, hz - 1.4], y: 0.8, seed: hi + 60 });
    } else {
      E.push({ t: 'cetiya', at: [hx, hz], y: 0, r: 0.95 });
      for (let k = 0; k < 3; k++) L.push(person(rand, [hx + Math.cos(k * 2.1 + 0.6) * 4.2, hz + Math.sin(k * 2.1 + 0.6) * 4.2], 0, rand() * 6.28, { pose: 'kneel', arms: 'pray', man: k === 1, carry: 'none' }));
    }
    // rice pounding in the yard, three of the households' mortars with a woman at each
    for (const h of hs.filter((q) => q.hamlet === hi && q.kind === 'house').slice(0, 24)) {
      if (rand() < 0.75) continue;
      const [x0, z0, x1, z1] = h.rect, [fx, fz] = frontVec(h.front), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, half = (h.front === 'e' || h.front === 'w' ? x1 - x0 : z1 - z0) / 2;
      const p = [cx + fx * (half + 2.2) - fz * 2.4, cz + fz * (half + 2.2) + fx * 2.4];
      if (hs.some((q) => inRect(q.rect, p[0], p[1], 1.3))) continue;
      E.push({ t: 'lesung', at: p, rot: Math.atan2(fz, fx) });
      L.push(person(rand, [p[0] + fx * 0.8, p[1] + fz * 0.8], 0, faceTo([-fx, -fz]), { man: false, hair: 'bun', pose: 'stand', arms: 'pole' }));
    }
    plans.push(base(`borobudur-core-${hi}`, E), life(`borobudur-core-life-${hi}`, L, [hx, hz], 130));
  });
  const F = fences(), half = Math.ceil(F.length / 2);
  plans.push(base('borobudur-fences-a', F.slice(0, half)), base('borobudur-fences-b', F.slice(half)));
  return plans;
}

/** The household's life before each door, on top of the yards': benches, stools, a wash line, a goat or pig, ducks, a heap of straw by the granary, children. */
function households() {
  const out = [];
  HAMLETS.forEach(([hx, hz, hr], hi) => {
    const L = [], rand = rng(1400 + hi), hs = houses();
    for (const h of hs) {
      if (h.hamlet !== hi) continue;
      const [x0, z0, x1, z1] = h.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, [fx, fz] = frontVec(h.front), tx = -fz, tz = fx, half = (h.front === 'e' || h.front === 'w' ? x1 - x0 : z1 - z0) / 2;
      const at = (d, u) => [cx + fx * (half + d) + tx * u, cz + fz * (half + d) + tz * u], rot = Math.atan2(fx, fz);
      const free = ([x, z], m = 0.9) => !hs.some((q) => q !== h && inRect(q.rect, x, z, m)) && !hs.some((q) => q === h && inRect(q.rect, x, z, 0.3));
      const put = (el, p, m) => { if (free(p, m)) L.push({ ...el, at: p, y: 0 }); };
      if (h.kind === 'lumbung') { if (rand() < 0.6) put({ t: 'haystack', seed: h.seed + 8 }, at(2.2, -2.6), 1.6); continue; }
      if (rand() < 0.4) {                                                    // a bench in the yard with someone on it
        const p = at(1.9, -1.0);
        put({ t: 'bench', rot: rot + Math.PI / 2, len: 1.5, mat: 'bamboo_culm', seed: h.seed + 11 }, p, 1.0);
        if (rand() < 0.8 && free(p, 1.0)) L.push(person(rand, [p[0], p[1]], 0, rot + Math.PI / 2 * (rand() < 0.5 ? 1 : -1), { pose: 'sit', man: rand() < 0.5 }));
      }
      if (rand() < 0.35) { const p = at(2.2, 1.6); if (free(p, 1.0)) { L.push({ t: 'stool', at: p, y: 0, rot: rot + Math.PI, seed: h.seed + 12 }); L.push(person(rand, [p[0] + fx * 0.08, p[1] + fz * 0.08], 0, rot + Math.PI, { pose: 'sit_low', man: false, hair: 'bun' })); } }
      if (rand() < 0.3) put({ t: 'wash_line', rot: Math.atan2(-tz, tx), len: 3.5, pole: true, emb: [0.15, 0.15], clear: [0.3, 0.3], seed: h.seed + 13 }, at(4.2, 0.4), 1.8);
      const q = rand();
      if (q < 0.18) put({ t: 'animal', kind: 'goat', graze: true, seed: h.seed + 14, rot: rand() * 6.28 }, at(3.6, 2.2), 1.0);
      else if (q < 0.30) put({ t: 'animal', kind: 'pig', seed: h.seed + 15, rot: rand() * 6.28 }, at(3.4, -2.4), 1.0);
      else if (q < 0.45) put({ t: 'chickens', kind: 'duck', n: 4, seed: h.seed + 16 }, at(3.2, 2.4), 1.2);
      else if (q < 0.55) put({ t: 'animal', kind: 'dog', seed: h.seed + 17, rot: rand() * 6.28 }, at(1.2, 0.2), 0.6);
      if (rand() < 0.3) for (let k = 0; k < 2; k++) { const p = at(3 + k * 0.9, -0.2 + k * 1.1); if (free(p, 0.9)) L.push(person(rand, p, 0, rand() * 6.28, { child: true, pose: 'stand', man: k === 0, carry: 'none' })); }
      if (rand() < 0.2) put({ t: 'rain_tub', seed: h.seed + 18 }, at(0.6, 2.6), 0.7);
      if (rand() < 0.25) put({ t: 'ladder', seed: h.seed + 19, rot }, at(-0.2, 2.9), 0.7);
    }
    out.push(life(`borobudur-households-${hi}`, L, [hx, hz], hr + 150));
  });
  return out;
}

/** The paddies: huts on posts with their clapper lines, scarecrows, the buffalo at the plough with the farmer behind. */
function fields() {
  const E = [], L = [], rand = rng(404), F = fieldSpots();
  for (const q of F.huts) {
    const y = ground.height(...q.at);
    E.push({ t: 'gubuk', at: q.at, y, rot: q.rot, seed: q.seed });
    if (rand() < 0.6) L.push(person(rand, [q.at[0] + 0.3, q.at[1] + 0.3], y + 1.5, rand() * 6.28, { pose: 'cross', man: true, hat: 'straw' }));
    L.push({ t: 'pot', kind: 'water_pot', n: 1, at: [q.at[0] + 1.6, q.at[1] - 1.6], y: y + 1.5, seed: q.seed });
  }
  for (const q of F.scarecrows) E.push({ t: 'orang', at: q.at, y: ground.height(...q.at), rot: q.rot, seed: q.seed });
  for (const q of F.plough) {
    const y = ground.height(...q.at), [dx, dz] = [Math.cos(q.rot), Math.sin(q.rot)];
    L.push({ t: 'animal', kind: 'buffalo', gear: true, at: q.at, y, rot: Math.atan2(-dx, -dz), seed: q.seed });
    L.push(person(rand, [q.at[0] - dx * 3.4, q.at[1] - dz * 3.4], y, Math.atan2(-dx, -dz), { man: true, hat: 'straw', carry: 'staff' }));
  }
  return [base('borobudur-fields', E.map((e) => ({ ...e }))), life('borobudur-fields-life', L, [0, 0], RADIUS + 60)];
}

/** The monastery's gate, its shrines, the paved ways between the gate, the hall and the monks' houses, the water jars before the cells. */
function monasteryExtras() {
  const E = [], L = [], rand = rng(912), [mx0, mz0, mx1, mz1] = MONASTERY, gz = (mz0 + mz1) / 2;
  E.push({ t: 'gapura', at: [mx1, gz], half: 3.0, h: 4.8 });
  for (const [x, z] of [[-190, -142], [-150, -145], [-172, -124]]) E.push({ t: 'cetiya', at: [x, z], y: 0, r: 0.9 });
  E.push({ t: 'lane', rect: [-181.5, gz - 1.6, mx1 - 0.5, gz + 1.6], y: 0.03, mat: 'andesite' });
  E.push({ t: 'lane', rect: [-170, mz0 + 8, -166, gz - 1.6], y: 0.03, mat: 'andesite' });
  E.push({ t: 'lane', rect: [-170, gz + 1.6, -166, mz1 - 8], y: 0.03, mat: 'andesite' });
  for (const c of CELLS) {
    const [x, z, f] = c, r = cellRect(c), fv = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] }[f];
    const px = f === 'e' ? r[2] + 0.9 : f === 'w' ? r[0] - 0.9 : (r[0] + r[2]) / 2 + 3.9, pz = f === 's' ? r[3] + 0.9 : f === 'n' ? r[1] - 0.9 : (r[1] + r[3]) / 2 + 3.9;
    L.push({ t: 'pot', kind: 'water_pot', n: 2, at: [px, pz], y: 0, seed: x * 3 + z });
    if (rand() < 0.5) L.push({ t: 'figure', at: [px + (fv[1] ? 1.1 : 0), pz + (fv[0] ? 1.1 : 0)], y: 0, rot: faceTo([-fv[0], -fv[1]]), seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_ochre', cloth2: 'cloth_ochre', skin: pick(rand, SK), hat: 'none', hair: 'shaven', pose: rand() < 0.5 ? 'squat' : 'stand' });
  }
  // a monk sweeping the yard with a broom of ribs, one carrying water, two at the shrines
  for (const [x, z] of [[-190, -142], [-150, -145]]) L.push({ t: 'figure', at: [x + 1.8, z + 3.3], y: 0, rot: faceTo([-0.4, -1]), seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_ochre', cloth2: 'cloth_ochre', skin: 'skin_medium', hat: 'none', hair: 'shaven', pose: 'kneel', arms: 'pray' });
  return [base('borobudur-monastery-extras', E), life('borobudur-monastery-extras-life', L, [(mx0 + mx1) / 2, (mz0 + mz1) / 2], 260)];
}

export function villagePlans() { return [...way(), ...hamlets(), ...households(), ...fields(), ...monasteryExtras()]; }

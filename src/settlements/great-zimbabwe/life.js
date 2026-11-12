// Great Zimbabwe about 1350 — the life of the valley (docs/settlements/great-zimbabwe.md §14): cattle, the
// wealth of the state, grazing in the open grass and penned in kraals by the homesteads, herd boys with their
// sticks; women grinding and carrying water in the courts of the Valley Ruins; a trader with the goods of the
// coast; a few people in the Great Enclosure. Kept few and quiet. Pure data.

import { ENCLOSURE, VALLEY, WEST, RADIUS, KRAAL_AT, height, huts, compounds, inWalled, inEnclosure, pathDist } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0
const clear = (x, z, m) => !inWalled(x, z, m) && !inEnclosure(x, z, m) && height(x, z) < 4 && Math.hypot(x, z) < RADIUS - 40 && !huts().some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < h.r + 1.5 + m);

/** The cattle kraals by the homesteads: { c, r, gap, y, seed } (zimbabwe style, element `kraal`). */
let KRAALS = null;
export function kraals() {
  if (KRAALS) return KRAALS;
  KRAALS = [];
  for (const [[x, z, r], gap] of KRAAL_AT.map((k, i) => [k, [Math.PI, 0.3, -1.6][i]])) if (clear(x, z, r + 2)) KRAALS.push({ c: [x, z], r, gap, y: height(x, z), seed: Math.round(x * 7 + z) });
  return KRAALS;
}

export function people() {
  const L = [], rand = rng(1351), pick = (a) => a[Math.floor(rand() * a.length)];
  const man = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'loincloth', top: 'bare', cloth: pick(['hide_tan', 'hide_brown']), skin: 'skin_dark', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: 'none', carry: 'none', pose: 'stand', ...o });
  const woman = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, h: 1.56, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: '', cloth: pick(['cloth_ochre', 'hide_tan', 'cloth_brown']), cloth2: 'cloth_ochre', skin: 'skin_dark', hat: 'none', hair: pick(['short', 'bun']), hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: 'none', carry: 'none', pose: 'stand', ...o });
  const cow = (x, z, rot, o = {}) => L.push({ t: 'animal', kind: rand() < 0.75 ? 'ox' : 'zebu', at: [x, z], y: height(x, z), rot, seed: Math.floor(rand() * 1e9), graze: rand() < 0.6, mat: pick(['hide_brown', 'hide_black', 'hide_tan', 'hide_white', 'hide_brown']), ...o });
  // the herds in the open grass, each with its herd boy
  for (const [hx, hz, n] of [[200, -90, 9], [-210, 30, 7], [60, 260, 8], [230, 120, 6]]) {
    let k = 0;
    for (let t = 0; t < 60 && k < n; t++) {
      const x = hx + (rand() - 0.5) * 30, z = hz + (rand() - 0.5) * 22;
      if (!clear(x, z, 2) || L.some((o) => o.t === 'animal' && Math.hypot(o.at[0] - x, o.at[1] - z) < 3.2)) continue;
      cow(x, z, rand() * 6.28); k++;
    }
    const x = hx + 14, z = hz + 9;
    if (clear(x, z, 1)) man([x, z], height(x, z), face([x, z], [hx, hz]), { carry: 'staff', len: 1.5, pose: 'staff', h: 1.4 });
  }
  // cattle in the kraals
  for (const K of kraals()) for (let k = 0; k < 4; k++) { const t = k * 1.6 + 0.4, d = K.r * 0.45; cow(K.c[0] + Math.cos(t) * d, K.c[1] + Math.sin(t) * d, t + 1.6, { graze: false }); }
  // the courts of the Valley Ruins: a woman at the grinding stone, one bringing water, the trader at the goods of the coast
  VALLEY.forEach((V, i) => {
    const [cx, cz] = V.c, y = height(cx, cz) + 0.06, gm = (V.a1 + V.a0 + Math.PI * 2) / 2;
    const g = [cx + Math.cos(gm) * V.r[0] * 0.3, cz + Math.sin(gm) * V.r[1] * 0.3];
    if (i === 0) man([g[0] - Math.sin(gm) * 1.0, g[1] + Math.cos(gm) * 1.0], y, face(g, [cx, cz]) + Math.PI, { pose: 'cross', dress: 'wrap', top: 'bare', cloth: 'cloth_white', over: 'none' });
    else woman([cx + 1.5, cz - 1.2], y, face([cx + 1.5, cz - 1.2], [cx, cz]), { pose: 'kneel' });
    woman([g[0] + Math.cos(gm) * 2.5, g[1] + Math.sin(gm) * 2.5], y, face(g, [cx, cz]), { carry: 'pot' });
  });
  // the smith at his forge, the carver at his column, a woman with water between the courts
  { const a = courtAt(1), b = courtAt(2), c0 = Math.cos(a.gm), s0 = Math.sin(a.gm);
    man([a.at[0] + c0 * 0.3 - s0 * 1.5, a.at[1] + s0 * 0.3 + c0 * 1.5], a.y, face([a.at[0] - s0 * 1.5, a.at[1] + c0 * 1.5], a.at) , { pose: 'cross' });
    man([b.at[0] + Math.cos(b.gm) * 0.1 + Math.sin(b.gm) * 0.1, b.at[1] + Math.sin(b.gm) * 0.1 - Math.cos(b.gm) * 0.1], b.y, face([b.at[0] + Math.cos(b.gm) * 0.1 + Math.sin(b.gm) * 0.1, b.at[1] + Math.sin(b.gm) * 0.1 - Math.cos(b.gm) * 0.1], b.at) + Math.PI, { pose: 'cross', cloth: 'cloth_white', dress: 'wrap' }); }
  // the homesteads nearest the arrival: a woman kneeling at the mortar, a goat or two, a dog, a child; those inside the Great Enclosure too
  {
    const arr = [46, 60], dist = (k) => Math.hypot(k.c[0] - arr[0], k.c[1] - arr[1]);
    const near = [...compounds()].sort((p, q) => dist(p) - dist(q)).slice(0, 16);
    near.forEach((k, i) => {
      const a = ((k.seed ?? 3) % 628) / 100, c = Math.cos(a), sn = Math.sin(a), W = (u, v) => [k.c[0] + c * u - sn * v, k.c[1] + sn * u + c * v], y = k.y + 0.06;
      if (i % 2 === 0) { const p = W(1.5, -1.5); woman(p, y, face(p, W(1.5, -0.8)), { pose: 'kneel' }); }
      if (i % 3 === 0) { const p = W(-0.4, -2.1); L.push({ t: 'animal', kind: 'goat', at: p, y, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), graze: rand() < 0.5 }); }
      if (i % 4 === 1) { const p = W(0.2, 0.3); L.push({ t: 'animal', kind: 'dog', at: p, y, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) }); }
      if (i % 5 === 2) { const p = W(-2.2, 0.2); man(p, y, face(p, k.c), { h: 0.95, pose: 'stand' }); }
    });
  }
  // inside the Great Enclosure's homesteads: women at the mortars and a man at the granary
  compounds().filter((k) => k.inner).forEach((k, i) => {
    const a = ((k.seed ?? 3) % 628) / 100, c = Math.cos(a), sn = Math.sin(a), W = (u, v) => [k.c[0] + c * u - sn * v, k.c[1] + sn * u + c * v];
    const p = W(1.5, -1.5); woman(p, 0.06, face(p, W(1.5, -0.8)), { pose: 'kneel' });
    if (i % 2 === 0) { const q = W(-1.0, 1.9); woman(q, 0.06, face(q, k.c), { carry: 'pot' }); }
    else { const q = W(-2.2, -0.2); L.push({ t: 'animal', kind: 'goat', at: q, y: 0.06, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), graze: true }); }
  });
  // by the path to the Great Enclosure's north entrance, in sight of the arrival: women with pots, a man in his cape, a herd boy with four beasts
  {
    const at = (x, z) => [x, z];
    const walkers = [[at(39, 70), 'jar'], [at(53, 72), 'man'], [at(44, 76), 'basket']];
    for (const [p, kind] of walkers) {
      const y = height(p[0], p[1]), r = face(p, [46, 82]) + (rand() - 0.5) * 0.6;
      if (kind === 'jar') woman(p, y, r, { carry: 'pot' }); else if (kind === 'basket') woman(p, y, r, { carry: 'basket' }); else man(p, y, r, { over: 'cape', cloth: 'hide_tan' });
    }
    // the cattle, the wealth of the state (Met), grazing the grass in sight of the arrival on both sides of the path: a herd of six
    // to the east with its herd boy, a smaller one and a few goats to the west; a dog by the walkers
    const herd = (hx, hz, n, spread, graze = true) => {
      let k = 0;
      for (let t = 0; t < 60 && k < n; t++) {
        const x = hx + (rand() - 0.5) * spread[0], z = hz + (rand() - 0.5) * spread[1];
        if (!clear(x, z, 2) || pathDist(x, z) < 2.5 || L.some((o) => o.t === 'figure' && Math.hypot(o.at[0] - x, o.at[1] - z) < 3) || compounds().some((c) => Math.hypot(c.c[0] - x, c.c[1] - z) < c.r + 3) || L.some((o) => o.t === 'animal' && Math.hypot(o.at[0] - x, o.at[1] - z) < 3.4)) continue;
        cow(x, z, rand() * 6.28, { graze }); k++;
      }
    };
    herd(55, 75, 6, [11, 6]);
    herd(28, 75, 4, [12, 6]);
    for (const [gx, gz] of [[36, 71], [33.5, 73.5], [38.5, 75.5]]) if (clear(gx, gz, 1)) L.push({ t: 'animal', kind: 'goat', at: [gx, gz], y: height(gx, gz), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), graze: rand() < 0.6 });
    L.push({ t: 'animal', kind: 'dog', at: [42, 73.5], y: height(42, 73.5), rot: 2.4, seed: 8113 });
    { const bx = 62, bz = 71; if (clear(bx, bz, 1)) man([bx, bz], height(bx, bz), face([bx, bz], [55, 75]), { carry: 'staff', len: 1.5, pose: 'staff', h: 1.4 }); }
    // two men sitting in the shade of the wall's end by the gate, talking; a woman with a bundle of firewood coming in
    { const y = height(57, 79.5);
      man([57.5, 79.5], y, face([57.5, 79.5], [55.6, 79.9]), { pose: 'cross', over: 'cape', cloth: 'hide_tan' });
      man([55.2, 80.2], y, face([55.2, 80.2], [57.5, 79.5]), { pose: 'cross' });
      const w = [47.8, 77.5]; woman(w, height(w[0], w[1]), face(w, [44, 90]), { carry: 'basket' }); }
  }
  // in the Western Enclosure on the hill and in the Great Enclosure
  man([WEST.c[0] + 2, WEST.c[1] + 9], WEST.y, 0.4, { over: 'cape', cloth: 'hide_brown' });
  woman([WEST.c[0] - 4, WEST.c[1] + 8], WEST.y, -0.6, { carry: 'basket' });
  man([43.5, 112], 0, 1.9, { over: 'cape', cloth: 'hide_tan' });
  man([56, 113], 0, -1.2);
  return L;
}
/** The working place of Valley court i: between the court's entrance and its houses (the goods of the coast in court 0, the smithy in 1, the stone carver in 2). */
export function courtAt(i) {
  const V = VALLEY[i], gm = (V.a1 + V.a0 + Math.PI * 2) / 2;
  return { at: [V.c[0] + Math.cos(gm) * V.r[0] * 0.3, V.c[1] + Math.sin(gm) * V.r[1] * 0.3], y: height(V.c[0], V.c[1]) + 0.06, rot: gm + Math.PI / 2, gm };
}
export function goodsAt() { const { at, y, rot } = courtAt(0); return { at, y, rot }; }

/**
 * The termite mounds of the savanna: { c, r, h, y, seed } — tall red-earth cones standing in the grass, a metre or two high, a
 * few dozen in the open ground of the valley (the hills of Zimbabwe are full of them; inferred), kept clear of the houses, the
 * kraals, the ways, the enclosures and the hill.
 */
let MOUNDS = null;
export function mounds() {
  if (MOUNDS) return MOUNDS;
  MOUNDS = [];
  const rand = rng(1352);
  for (let t = 0; t < 4000 && MOUNDS.length < 46; t++) {
    const x = (rand() * 2 - 1) * 230, z = (rand() * 2 - 1) * 230;
    if (!clear(x, z, 3) || pathDist(x, z) < 4 || compounds().some((c) => Math.hypot(c.c[0] - x, c.c[1] - z) < c.r + 3) || KRAAL_AT.some(([kx, kz, kr]) => Math.hypot(kx - x, kz - z) < kr + 4)) continue;
    if (MOUNDS.some((m) => Math.hypot(m.c[0] - x, m.c[1] - z) < 10)) continue;
    MOUNDS.push({ c: [x, z], r: 0.7 + rand() * 0.9, h: 0.9 + rand() * 1.5, y: height(x, z), seed: Math.floor(rand() * 1e6) });
  }
  return MOUNDS;
}

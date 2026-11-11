// Great Zimbabwe about 1350 — the life of the valley (docs/settlements/great-zimbabwe.md §14): cattle, the
// wealth of the state, grazing in the open grass and penned in kraals by the homesteads, herd boys with their
// sticks; women grinding and carrying water in the courts of the Valley Ruins; a trader with the goods of the
// coast; a few people in the Great Enclosure. Kept few and quiet. Pure data.

import { ENCLOSURE, VALLEY, WEST, RADIUS, KRAAL_AT, height, huts, compounds, inWalled, inEnclosure } from './layout.js';

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
  // in the Western Enclosure on the hill and in the Great Enclosure
  man([WEST.c[0] + 2, WEST.c[1] + 9], WEST.y, 0.4, { over: 'cape', cloth: 'hide_brown' });
  woman([WEST.c[0] - 4, WEST.c[1] + 8], WEST.y, -0.6, { carry: 'basket' });
  man([ENCLOSURE.c[0] + 18, ENCLOSURE.c[1] - 2], 0, 1.9, { over: 'cape', cloth: 'hide_tan' });
  man([ENCLOSURE.c[0] + 20, ENCLOSURE.c[1] - 0.6], 0, -1.2);
  return L;
}
/** Where the goods of the coast are laid out: the first Valley Ruin's court, between its entrance and its houses. */
export function goodsAt() {
  const V = VALLEY[0], gm = (V.a1 + V.a0 + Math.PI * 2) / 2;
  return { at: [V.c[0] + Math.cos(gm) * V.r[0] * 0.3, V.c[1] + Math.sin(gm) * V.r[1] * 0.3], y: height(V.c[0], V.c[1]) + 0.06, rot: gm + Math.PI / 2 };
}

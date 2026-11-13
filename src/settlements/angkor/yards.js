// Angkor — the yards, workshops, moat life, dykes and the temple's offerings (docs/settlements/angkor.md §19–§22).
// Every house gets its yard from its own rectangle and front (fences of woven bamboo at the back and sides, banana and
// areca at the corners, drying racks, a hammock or a backstrap loom under the floor, a bench), people on the deck and in
// the yard, fowl, a dog, washing; the workshops (layout.js shops()) their craftsmen; the moat its lotus, its moored
// canoes with fishermen, women washing at the bank. Plans are tiles of 100 m, drawn within 260 m of the visitor.

import { houseUp, variantOf } from '../../styles/khmer/village.js';
import { RADIUS, LEVEL, MOAT, ROAD, CX, T, ENCLOSURE, ENC_PATHS, BASINS, CAUSEWAY, LIBRARIES, MARKET, houses, ponds, stores, shops, moatLotus, moatLanes, inRect, inMoat, inBasin, inPond, inHouse, inShop, onRoad } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FRONT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const base = (id, elements, style = 'khmer') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-206, 0], facing: 'e' } });
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
/** Elements into 100 m tiles as plans (khmer style or life), each drawn only within `near` of its middle. */
function tiled(list, id, style = 'khmer', near = 260, size = 160) {
  const tiles = new Map();
  for (const e of list) { const p = e.at ?? e.a ?? e.c ?? [e.rect[0], e.rect[1]], k = `${Math.floor(p[0] / size)},${Math.floor(p[1] / size)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, l]) => { const [i, j] = k.split(',').map(Number); return { ...base(`${id}-${k}`, l, style), center: [i * size + size / 2, j * size + size / 2], near }; });
}
const CLOTH = ['cloth_red', 'cloth_ochre', 'cloth_brown', 'cloth_white', 'cloth_indigo'];

/** Each house's yard: the khmer-style pieces (K) and the life of it (L). */
function yards() {
  const K = [], L = [], rand = rng(1301), pick = (a) => a[Math.floor(rand() * a.length)], all = houses();
  const fig = (at, y, dir, o) => L.push({ t: 'figure', at, y, rot: faceTo(dir), seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: pick(CLOTH), cloth2: 'cloth_white', skin: pick(['skin_medium', 'skin_dark']), hat: 'none', feet: 'bare', ...o });
  const woman = (at, y, dir, o = {}) => fig(at, y, dir, { hair: 'bun', over: rand() < 0.4 ? 'shawl' : 'none', h: 1.5 + rand() * 0.06, ...o });
  const man = (at, y, dir, o = {}) => fig(at, y, dir, { hair: rand() < 0.6 ? 'bun' : 'short', ...o });
  const free = (x, z, m = 1.2) => !inHouse(x, z, m) && !inPond(x, z, 1.5) && !inMoat(x, z) && !inRect(T.base.rect, x, z, 4) && !onRoad(x, z) && !inShop(x, z, 1.5) && !ENC_PATHS.some((p) => inRect(p, x, z, 1)) && !BASINS.some((b) => inRect(b, x, z, 2)) && !inRect(MARKET, x, z, 3);
  for (const h of all) {
    const r = rng(h.seed || 1), up = houseUp(h), F = FRONT[h.front], S = [-F[1], F[0]], cx = (h.rect[0] + h.rect[2]) / 2, cz = (h.rect[1] + h.rect[3]) / 2;
    const hF = Math.abs(F[0]) ? (h.rect[2] - h.rect[0]) / 2 : (h.rect[3] - h.rect[1]) / 2, hS = Math.abs(F[0]) ? (h.rect[3] - h.rect[1]) / 2 : (h.rect[2] - h.rect[0]) / 2;
    const W = (u, v) => [cx + F[0] * v + S[0] * u, cz + F[1] * v + S[1] * u], rot = Math.atan2(-F[1], F[0]);
    const near = Math.hypot(cx, cz) < RADIUS - 30;
    if (!near) continue;
    // the fences: back and sides, the front left open (the stair and the yard); only where the neighbours are not
    const back = W(0, -hF - 2.2);
    if (rand() < 0.7 && free(back[0], back[1], 0.6) && free(...W(-hS - 1.3, -hF - 2.2), 0.4) && free(...W(hS + 1.3, -hF - 2.2), 0.4)) {
      const vs = hF + 1.2, seed = h.seed;
      K.push({ t: 'k_fence', a: W(-hS - 1.3, -hF - 2.2), b: W(hS + 1.3, -hF - 2.2), seed }, { t: 'k_fence', a: W(-hS - 1.3, -hF - 2.2), b: W(-hS - 1.3, vs), seed: seed + 1 }, { t: 'k_fence', a: W(hS + 1.3, -hF - 2.2), b: W(hS + 1.3, vs), seed: seed + 2 });
    }
    // banana and areca at the corners and the sides
    for (const [u, v, k] of [[-hS - 0.7, -hF - 1.2, 'b'], [hS + 0.8, -hF - 0.6, 'b'], [hS + 1.2, hF - 1.2, 'a'], [-hS - 1.0, hF * 0.3, 'a'], [-hS - 0.9, -hF * 0.3, 'b']]) {
      if (rand() < (k === 'b' ? 0.7 : 0.45)) continue;
      const p = W(u, v); if (!free(p[0], p[1], 0.6)) continue;
      K.push(k === 'b' ? { t: 'k_banana', at: p, y: 0, s: 0.85 + rand() * 0.35, seed: Math.floor(rand() * 99) } : { t: 'k_areca', at: p, y: 0, s: 0.9 + rand() * 0.25, seed: Math.floor(rand() * 99) });
    }
    // a drying rack by the stair: fish, spread cloth or sheaves of rice
    if (rand() < 0.4) {
      const s = rand() < 0.5 ? -1 : 1, p = W(s * (hS + 2.4), hF + 1.2);
      if (free(p[0], p[1], 0.8)) K.push({ t: 'k_rack', at: p, y: 0, rot, kind: pick(['fish', 'fish', 'cloth', 'rice']), seed: Math.floor(rand() * 99) });
    }
    // under the floor: a hammock between two posts; a weaver at her backstrap loom; a bench of bamboo with someone resting
    const nu = hS > 2.3 ? 3 : 2, nv = hF > 3 ? 4 : 3;
    if (rand() < 0.4 && h.kind !== 'small') {
      const u0 = -hS, u1 = -hS + 2 * hS / nu, v1 = -hF + 2 * hF / nv, a = W(u0 + 0.15, v1), b = W(u1 - 0.15, v1);
      K.push({ t: 'k_hammock', a, b, y: 1.05, cloth: pick(CLOTH) });
      if (rand() < 0.4) woman(W((u0 + u1) / 2, v1), 0.55, [F[0], F[1]], { pose: 'sit', arms: 'hang', cloth: pick(CLOTH) });
    }
    else if (rand() < 0.22 && hF > 3.2) {
      const u = hS > 2.3 ? 0 : hS * 0.5, p = W(u, -hF + 2.4), d = [F[0], F[1]];
      K.push({ t: 'k_loom', at: p, y: 0, rot: Math.atan2(d[1], d[0]), seed: Math.floor(rand() * 99) });
      woman([p[0] + d[0] * 0.38, p[1] + d[1] * 0.38], 0, [-d[0], -d[1]], { pose: 'cross', cloth: pick(CLOTH) });
    }
    else if (rand() < 0.3) {
      const p = W(hS * 0.4, hF - 1.3); L.push({ t: 'bench', at: p, y: 0, rot, seed: Math.floor(rand() * 1e9) });
      if (rand() < 0.7) man(p, 0, [F[0], F[1]], { pose: 'sit', cloth: pick(CLOTH) });
    }
    // inside: someone at home in about two houses in three — a woman crouched at the hearth tray with her pot (the lamp beside the mats), a man or an old woman resting on the sleeping mats, a child; the shop's keeper sitting just inside the door behind her counter
    { const D = (du, dv) => [S[0] * du + F[0] * dv, S[1] * du + F[1] * dv], home = (h.seed % 3) !== 0, v = variantOf(h);
      if (home) {
        woman(W(hS - 1.35, -hF + 0.95), up, D(0.65, -0.25), { pose: 'squat', cloth: pick(CLOTH), over: 'none' });
        if (h.seed % 2) (rand() < 0.5 ? man : woman)(W(-hS + 1.1, -hF + 1.7), up, D(1, 0.3), { pose: 'sit', cloth: pick(CLOTH), arms: 'hang' });
        else fig(W(-hS + 1.2, -hF + 1.6), up, D(0.5, 1), { pose: 'cross', child: true, hair: 'short', cloth: pick(CLOTH) });
      }
      if (v === 'shop' && h.kind !== 'small') woman(W(0.95, hF - 0.8), up, D(0, 1), { pose: 'cross', cloth: pick(CLOTH), over: 'shawl' }); }
    // on the deck at the door: a woman or a man sitting in the shade of the eaves, now and then with a child
    if (h.kind !== 'small' && rand() < 0.5) {
      const p = W((rand() - 0.5) * 1.2, hF + 0.5);
      (rand() < 0.65 ? woman : man)(p, up, [F[0], F[1]], { pose: rand() < 0.6 ? 'cross' : 'sit_ground', cloth: pick(CLOTH) });
      if (rand() < 0.3) fig(W(0.7, hF + 0.55), up, [F[0], F[1]], { pose: 'cross', child: true, hair: 'short', cloth: pick(CLOTH) });
    }
    // the yard: hens and a cock, a dog, a pig on a cord, washing on a line, a woman drawing water, a child at play
    const y1 = W((rand() - 0.5) * 3, hF + 3.4);
    if (free(y1[0], y1[1], 0.8)) {
      if (rand() < 0.5) L.push({ t: 'chickens', at: y1, y: 0, rot: rand() * 6.28, n: 3 + Math.floor(rand() * 4), seed: Math.floor(rand() * 1e9) });
      if (rand() < 0.2) L.push({ t: 'chickens', kind: 'duck', at: W(rand() * 3, hF + 4.8), y: 0, rot: rand() * 6.28, n: 4, seed: Math.floor(rand() * 1e9) });
    }
    if (rand() < 0.3) { const p = W((rand() < 0.5 ? -1 : 1) * (hS + 2.0), hF * 0.2); if (free(p[0], p[1], 0.8)) L.push({ t: 'animal', kind: pick(['dog', 'dog', 'pig']), at: p, y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) }); }
    if (rand() < 0.25) { const s = rand() < 0.5 ? -1 : 1, p = W(s * (hS + 3.6), hF * 0.3); if (free(p[0], p[1], 1.2)) L.push({ t: 'laundry', at: p, y: 0, rot: rot, len: 3.2, seed: Math.floor(rand() * 1e9) }); }
    if (rand() < 0.3) { const p = W((rand() - 0.5) * 2.5, hF + 5.4); if (free(p[0], p[1], 1)) (rand() < 0.5 ? woman : man)(p, 0, [rand() - 0.5, rand() - 0.5], { pose: pick(['stand', 'talk', 'stand']), carry: pick(['pot', 'basket', 'none', 'pole']) }); }
    if (rand() < 0.2) { const p = W((rand() - 0.5) * 3, hF + 4.2); if (free(p[0], p[1], 1)) fig(p, 0, [rand() - 0.5, rand() - 0.5], { child: true, hair: 'short', pose: 'stand' }); }
  }
  // buffalo and oxen at their stakes, and straw stacks, by the granaries
  for (const g of stores().granaries) {
    if (rand() < 0.5 && free(g.at[0] + 4.4, g.at[1], 1)) L.push({ t: 'haystack', at: [g.at[0] + 4.4, g.at[1] + 0.3], y: 0, kind: 'pole', seed: Math.floor(rand() * 1e9) });
    if (rand() < 0.3 && free(g.at[0] - 4, g.at[1] + 2, 1)) L.push({ t: 'animal', kind: pick(['buffalo', 'zebu']), at: [g.at[0] - 4, g.at[1] + 2], y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
  }
  return { K, L };
}

/** The workshops with their craftsmen and customers. */
function workshops() {
  const K = [], L = [], rand = rng(1302), pick = (a) => a[Math.floor(rand() * a.length)];
  const fig = (at, y, dir, o) => L.push({ t: 'figure', at, y, rot: faceTo(dir), seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: pick(CLOTH), cloth2: 'cloth_white', skin: pick(['skin_medium', 'skin_dark']), hat: 'none', feet: 'bare', hair: rand() < 0.6 ? 'bun' : 'short', ...o });
  for (const s of shops()) {
    K.push({ t: 'k_workshop', ...s });
    const F = FRONT[s.front], S = [-F[1], F[0]], [x0, z0, x1, z1] = s.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const hF = Math.abs(F[0]) ? (x1 - x0) / 2 : (z1 - z0) / 2, hS = Math.abs(F[0]) ? (z1 - z0) / 2 : (x1 - x0) / 2, up = 0.55;
    const W = (u, v) => [cx + F[0] * v + S[0] * u, cz + F[1] * v + S[1] * u];
    const face = [-F[0], -F[1]];
    if (s.trade === 'potter') { fig(W(-hS * 0.35 + 0.0, -hF * 0.2 + 0.75), up, [S[0] * -1, S[1] * -1], { pose: 'sit', carry: 'none' }); if (rand() < 0.6) fig(W(hS * 0.5, hF - 0.9), up, F, { pose: 'cross', cloth: 'cloth_white' }); }
    else if (s.trade === 'smith') { fig(W(-hS * 0.3, -hF + 1.9), up, [-F[0], -F[1]], { pose: 'stand', hat: 'none' }); fig(W(hS * 0.3 + 0.75, 0.2), up, [-S[0], -S[1]], { pose: 'squat' }); }
    else if (s.trade === 'sugar') { fig(W(0, -hF + 2.2), up, [-F[0], -F[1]], { pose: 'squat', hair: 'bun' }); if (rand() < 0.5) fig(W(hS * 0.5, 0.5), up, [-S[0], -S[1]], { pose: 'cross' }); }
    else { fig(W(hS * 0.35, 0.9), up, [-S[0], -S[1]], { pose: 'stand', carry: 'staff', len: 1.4 }); fig(W(-hS + 0.9, 0.2), up, F, { pose: 'cross', hair: 'bun' }); }
    // customers at the steps
    if (rand() < 0.7) fig(W(rand() * 1.4 - 0.7, hF + 2.4), 0, face, { pose: 'stand', carry: pick(['basket', 'pot', 'none']) });
    L.push({ t: 'chickens', at: W(hS + 2.2, hF * 0.3), y: 0, rot: rand() * 6.28, n: 3, seed: Math.floor(rand() * 1e9) });
  }
  return { K, L };
}

/** The moat's life: lotus on its water, canoes moored at the banks with fishermen, women washing at the edge, men fishing with the line. */
function moatLife() {
  const K = [], L = [], rand = rng(1303), pick = (a) => a[Math.floor(rand() * a.length)];
  const [a0, b0, a1, b1] = MOAT.outer, yw = LEVEL.moat - 0.1;
  moatLotus().forEach((p, i) => K.push({ t: 'k_lotus', rect: p.rect, y: LEVEL.moat, seed: 400 + i }));
  const fig = (at, y, dir, o) => L.push({ t: 'figure', at, y, rot: faceTo(dir), seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: pick(CLOTH), cloth2: 'cloth_white', skin: pick(['skin_medium', 'skin_dark']), hat: 'none', feet: 'bare', hair: rand() < 0.5 ? 'bun' : 'short', ...o });
  const MOORED = [];
  // along the four outer banks: a spot every 35–60 m, sides in turn: canoe + fisherman, women washing, a man with a rod
  const side = (p0, p1, out, y0) => {
    const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), u = [(p1[0] - p0[0]) / len, (p1[1] - p0[1]) / len];
    for (let s = 14 + rand() * 12; s < len - 14; s += 34 + rand() * 26) {
      const bank = [p0[0] + u[0] * s, p0[1] + u[1] * s];
      if (inRect(CAUSEWAY.outer, bank[0], bank[1], 9) || inRect(MARKET, bank[0], bank[1], 6)) continue;
      const k = rand(), road = [bank[0] + out[0] * 1.2, bank[1] + out[1] * 1.2], water = [-out[0], -out[1]];
      if (k < 0.4) {
        // a dugout canoe alongside the bank, its fisherman sitting in it with the line and a basket
        const at = [bank[0] - out[0] * 1.9, bank[1] - out[1] * 1.9], rot = Math.atan2(u[0], u[1]), len2 = 4.6 + rand() * 1.6;
        L.push({ t: 'boat', kind: 'canoe', at, c: at, r: len2 / 2, y: yw, rot, len: len2, seed: Math.floor(rand() * 1e9) });
        MOORED.push({ c: at, u: [Math.sin(rot), Math.cos(rot)], hl: len2 / 2 + 0.6, hw: 0.7 });
        fig([at[0] + u[0] * 0.4, at[1] + u[1] * 0.4], yw + 0.2, water, { pose: 'sit', hat: 'straw', cloth: pick(CLOTH) });
        L.push({ t: 'basket', at: [at[0] - u[0] * 0.9, at[1] - u[1] * 0.9], y: yw + 0.15, rot: rand() * 6.28, s: 0.8, seed: Math.floor(rand() * 1e9) });
        fig(road, 0.03, water, { pose: 'stand', carry: 'staff', len: 2.2, hat: 'straw' });
      } else if (k < 0.75) {
        // women washing cloth and pots at the edge, a basket beside, one with a pot on her head coming
        const n = 1 + Math.floor(rand() * 3);
        for (let q = 0; q < n; q++) fig([road[0] + u[0] * (q * 0.9 - 0.4), road[1] + u[1] * (q * 0.9 - 0.4)], 0.03, water, { pose: 'squat', hair: 'bun', over: 'none', h: 1.5, cloth: pick(CLOTH) });
        L.push({ t: 'basket', at: [road[0] - u[0] * 1.3 + out[0] * 0.3, road[1] - u[1] * 1.3 + out[1] * 0.3], y: 0.03, rot: rand() * 6.28, s: 0.8, seed: Math.floor(rand() * 1e9) }, { t: 'pot', kind: 'water_pot', at: [road[0] + u[0] * (n * 0.9 + 0.3), road[1] + u[1] * (n * 0.9 + 0.3)], y: 0.03, rot: 0, seed: Math.floor(rand() * 1e9) });
        if (rand() < 0.5) fig([road[0] + out[0] * 2.4 + u[0] * 1.5, road[1] + out[1] * 2.4 + u[1] * 1.5], 0.03, water, { pose: 'stand', carry: 'pot', hair: 'bun', over: 'none', h: 1.5 });
      } else {
        // a man fishing from the bank, a child by him, the catch in a basket
        fig(road, 0.03, water, { pose: 'sit_ground', hat: 'straw' });
        L.push({ t: 'basket', at: [road[0] + u[0] * 0.9, road[1] + u[1] * 0.9], y: 0.03, rot: 0, s: 0.75, seed: Math.floor(rand() * 1e9) });
        if (rand() < 0.6) fig([road[0] - u[0] * 0.9 + out[0] * 0.3, road[1] - u[1] * 0.9 + out[1] * 0.3], 0.03, water, { pose: 'squat', child: true, hair: 'short' });
      }
    }
  };
  side([a0, b0], [a0, b1], [-1, 0], 0);          // the west bank: out is west (−x)
  side([a1, b0], [a1, b1], [1, 0], 0);
  side([a0, b0], [a1, b0], [0, -1], 0);
  side([a0, b1], [a1, b1], [0, 1], 0);
  // the inner bank, at the enclosure's moat edge: a few egret-like stillnesses are the fauna's; here two canoes under the walls
  return { K, L, MOORED };
}

/** The dykes of the dry paddies: along the 26 m lines of the palm grid in the outer country, where it is open field. */
function dykes() {
  const E = [], rand = rng(1304);
  const open = (x, z) => Math.hypot(x, z) > 292 && Math.hypot(x, z) < RADIUS - 24 && !inHouse(x, z, 5) && !inPond(x, z, 3) && !inShop(x, z, 4) && !stores().granaries.some((g) => Math.hypot(g.at[0] - x, g.at[1] - z) < 6) && !stores().salas.some((q) => inRect(q.rect, x, z, 4));
  const step = 52;
  for (let x = -RADIUS; x < RADIUS; x += step) for (let z = -RADIUS; z < RADIUS; z += step) {
    // a dyke east and one south of each point, a stretch of 20–40 m, where the whole stretch is open
    for (const [dx, dz] of [[1, 0], [0, 1]]) {
      const len = 24 + rand() * 20, a = [x + (rand() - 0.5) * 6, z + (rand() - 0.5) * 6], b = [a[0] + dx * len, a[1] + dz * len];
      if (rand() < 0.15) continue;
      let ok = true; for (let t = 0; t <= 1.001; t += 0.125) if (!open(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)) { ok = false; break; }
      if (ok) E.push({ t: 'k_bund', a, b });
    }
  }
  return E;
}

/** The temple's offerings, banners and the people about them. */
function templeExtras() {
  const K = [], L = [], rand = rng(1305), pick = (a) => a[Math.floor(rand() * a.length)];
  // banners along both causeways (inside the naga rails) and on the terrace of honour
  for (let x = CAUSEWAY.outer[0] + 10; x < CAUSEWAY.outer[2] - 6; x += 14) for (const s of [-1, 1]) K.push({ t: 'k_banner', at: [x, s * 3.7], y: 1.0, rot: 0, h: 6.5, cloth: pick(['cloth_red', 'cloth_ochre', 'cloth_white']) });
  for (let x = CAUSEWAY.inner[0] + 16; x < CAUSEWAY.inner[2] - 8; x += 14) for (const s of [-1, 1]) K.push({ t: 'k_banner', at: [x, s * 3.7], y: 1.2, rot: 0, h: 6.5, cloth: pick(['cloth_red', 'cloth_ochre', 'cloth_white']) });
  for (const s of [-1, 1]) for (const x of [CX - 111, CX - 101]) K.push({ t: 'k_banner', at: [x, s * 9.4], y: 1.4, rot: 0, h: 7.5, cloth: 'cloth_red' });
  // offering tables at the foot of the terrace's steps and either side of the inner causeway; pilgrims leaving flowers
  for (const s of [-1, 1]) for (const x of [-136, -118, -100, -88]) {
    const at = [x, s * 7.4];
    if (LIBRARIES.some((b) => inRect(b, at[0], at[1], 3)) || BASINS.some((b) => inRect(b, at[0], at[1], 2))) continue;
    K.push({ t: 'k_offering', at, y: 0, rot: s > 0 ? Math.PI / 2 : -Math.PI / 2 });
  }
  for (const s of [-1, 1]) K.push({ t: 'k_offering', at: [CX - 96.8, s * 7.5], y: T.base.y, rot: s > 0 ? Math.PI / 2 : -Math.PI / 2 });
  return { K, L };
}

export function yardPlans() {
  const Y = yards(), Wk = workshops(), M = moatLife(), TE = templeExtras(), D = dykes();
  const K = [...Y.K, ...Wk.K, ...M.K, ...TE.K, ...D], L = [...Y.L, ...Wk.L, ...M.L, ...TE.L];
  return [...tiled(K, 'angkor-yard', 'khmer', 260), ...tiled(L, 'angkor-yardlife', 'life', 240)];
}
/** The enclosure's paths of laterite, its quarters' own ponds' lotus. */
export function enclosurePlan() {
  const E = ENC_PATHS.map((r) => ({ t: 'lane', rect: r, y: 0.03, mat: 'laterite' }));
  // the axis of the way in kept clear of the street life's strollers (draws nothing; the footprint is read by objects/life.js)
  E.push({ t: 'k_clearway', rect: [-205, -0.8, -8, 0.8] });
  return base('angkor-enclosure', E);
}
/** The boats standing in the moat, as hulls for the moving boats to keep clear of. */
export function mooredBoats() { return moatLife().MOORED; }
void inBasin; void moatLanes;

/** Where the offering tables stand (for the incense smoke): [{ at, y }]. */
export function offeringSpots() { return templeExtras().K.filter((e) => e.t === 'k_offering'); }

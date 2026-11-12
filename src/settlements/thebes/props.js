// Thebes — the street furniture and the cargo, placed from the layout (docs/settlements/thebes.md §6.4): wells, stands of water jars,
// mudbricks drying, straw, tethering posts, roadside chapels and benches along every street (thick near the quay and the temple, thin in
// the outskirts); the cargo on the quay (sacks, logs, a block on its sledge, rope, nets on poles); braziers, offering tables, statues, basins,
// stelae and palms on the avenue and in the forecourt.
import { QUAY, QUAY_STAIRS, AVENUE, ENCL, ENCL_TH, PYLON2, STREET_ZS, LANES_X, TEMPLE_STREETS, WORKSHOP_Z, MARKET, streets, sphinxes, inRect } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const pickW = (rand, list) => { const t = list.reduce((a, [, w]) => a + w, 0); let r = rand() * t; for (const [k, w] of list) { r -= w; if (r <= 0) return k; } return list[0][0]; };
const STREET_KINDS = [['jars', 0.22], ['bricks', 0.13], ['straw', 0.08], ['post', 0.1], ['bench', 0.14], ['well', 0.07], ['stack', 0.09], ['logs', 0.04], ['chapel', 0.03], ['bricks', 0.05], ['jars', 0.05]];
const dist = (x, z) => Math.hypot(x + 120, z);

/** Items along one east–west street rectangle. */
function alongStreet(rect, rand, out, keep) {
  const [x0, z0, x1, z1] = rect, zc = (z0 + z1) / 2;
  let x = x0 + 4 + rand() * 6, lastChapel = -1e9;
  while (x < x1 - 4) {
    const d = dist(x, zc), step = d < 150 ? 8.5 : d < 240 ? 13 : 24;
    x += step * (0.7 + rand() * 0.6);
    if (x > x1 - 4) break;
    if (LANES_X.some((l) => Math.abs(x - l) < 3.2)) continue;
    if (keep && !keep(x, zc)) continue;
    const side = rand() < 0.5 ? -1 : 1;
    let k = pickW(rand, STREET_KINDS);
    if (k === 'chapel' && x - lastChapel < 70) k = 'jars';
    if (k === 'chapel') lastChapel = x;
    // the item stands against the house front on its side, its face to the street's middle
    out.push({ k, at: [x, zc + side * 1.2], yaw: side < 0 ? Math.PI : 0, seed: Math.floor(rand() * 1e6) });
  }
}

export function propPlans() {
  const rand = rng(4242), plans = [];
  const inStreet = (() => { const S = streets(); return (x, z) => S.some((r) => inRect(r, x, z, -0.3)); })();
  // the streets
  const L = [];
  for (const zs of STREET_ZS) {
    const items = [];
    for (const r of streets().filter((q) => Math.abs((q[1] + q[3]) / 2 - zs) < 0.1 && q[2] - q[0] > 12)) alongStreet(r, rand, items, inStreet);
    if (zs === WORKSHOP_Z) for (const it of items) if (it.k === 'straw' || it.k === 'bench') it.k = 'bricks';
    if (items.length) L.push(items);
  }
  for (const r of TEMPLE_STREETS) { const items = []; alongStreet(r, rand, items, null); L.push(items); }
  // the cargo on the quay: piles at the stone edge, between the stairs and the market
  {
    const items = [], X = QUAY.x + 2.6;
    for (let z = QUAY.z0 + 8; z < QUAY.z1 - 6; z += 8 + rand() * 7) {
      if (QUAY_STAIRS.some((s) => Math.abs(s - z) < 9)) continue;
      const k = pickW(rand, [['stack', 0.28], ['logs', 0.16], ['block', 0.1], ['coil', 0.14], ['net', 0.14], ['jars', 0.18]]);
      items.push({ k, at: [X + (k === 'net' ? 0.3 : 0), z], yaw: k === 'jars' ? 0 : Math.PI / 2, seed: Math.floor(rand() * 1e6) });
    }
    L.push(items);
  }
  // the avenue: braziers and offering tables at the edges of the paving, a stela now and then; the gateway's statues
  {
    const items = [], rams = sphinxes().filter((s) => s.side > 0), step = 4;
    rams.forEach((s, i) => {
      if (i % step !== 1) return;
      for (const side of [-1, 1]) items.push({ k: (i / step) % 2 < 1 ? 'brazier' : 'table', at: [s.x + AVENUE.spacing / 2, side * 7.7], yaw: side > 0 ? Math.PI / 2 : -Math.PI / 2, seed: i });
    });
    for (const z of [-9.4, 9.4]) items.push({ k: 'stela', at: [ENCL[0] - 7.5, z], yaw: Math.PI / 2, seed: 1 });
    L.push(items);
  }
  // the forecourt: statues before the colonnades, offering tables and braziers along the way, palms in their rings, basins
  {
    const items = [], x0 = ENCL[0] + ENCL_TH + 6, x1 = PYLON2.x0 - 6;
    let i = 0;
    for (let x = x0 + 3; x < x1; x += 6.2, i++) for (const s of [-1, 1]) {
      if (i % 2 === 0) items.push({ k: 'statue', at: [x, s * 43.4], yaw: s > 0 ? Math.PI : 0, seed: i });
    }
    for (let x = x0 + 9; x < x1 - 4; x += 12.4) for (const s of [-1, 1]) {
      items.push({ k: 'brazier', at: [x, s * 8.2], yaw: 0, seed: 1 });
      items.push({ k: 'palm', at: [x + 6.2, s * 29], h: 6.5 + rand() * 2.5, seed: Math.floor(rand() * 999) });
      items.push({ k: 'table', at: [x + 3, s * 15], yaw: Math.PI / 2, seed: 2 });
    }
    for (const s of [-1, 1]) items.push({ k: 'basin', at: [(x0 + x1) / 2, s * 22], yaw: 0, seed: 3 });
    L.push(items);
  }
  void MARKET;
  // one plan per ~40 items so the lot in view is a modest merge
  let batch = [], n = 0;
  const flush = () => { if (batch.length) plans.push(batch); batch = []; };
  for (const items of L) { for (const it of items) { batch.push(it); if (batch.length >= 60) flush(); } }
  flush();
  return plans.map((items, i) => ({ id: `thebes-props-${i}`, items }));
}

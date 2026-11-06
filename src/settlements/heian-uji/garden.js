// The pond garden's edges (docs/settlements/heian-uji.md §6): the pebble beach (suhama) along the
// shores of the Aji pond and round the small island, set stones at the beach's points, and the two
// bridges joining the small island to the hall's island (arched) and to the north shore (flat).
import '../../buildings/byodo-in-phoenix-hall/style.js';
import { GARDEN, POND_LEVEL, ISLAND, height, pondDistance, islandDistance } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const r = rng(1053), stones = [], rocks = [];
// pebbles from a little above the water's edge to about 0.3 m under it
for (let x = GARDEN[0] - 6; x < GARDEN[2] + 6; x += 0.4) for (let z = GARDEN[1] - 6; z < GARDEN[3] + 6; z += 0.4) {
  const px = x + (r() - 0.5) * 0.36, pz = z + (r() - 0.5) * 0.36;
  if (pondDistance(px, pz) > 6 && islandDistance(px, pz) > 3) continue;
  const h = height(px, pz);
  if (h < POND_LEVEL - 0.3 || h > POND_LEVEL + 0.4) continue;
  // the island bridges' landings left clear
  if (Math.abs(px - ISLAND.c[0]) < 1.6 && Math.abs(pz - ISLAND.c[1]) > ISLAND.r[1] - 1.5 && Math.abs(pz - ISLAND.c[1]) < 17.5) continue;
  stones.push(+px.toFixed(2), +h.toFixed(3), +pz.toFixed(2), +(0.18 + r() * 0.22).toFixed(2), +(r() * 6.28).toFixed(2));
}
// set stones: a few at the points of the beach, a group on the small island
for (const [x, z, s] of [[-58.2, -52.4, 1.0], [-52.6, -53.9, 0.75], [-56, -54.6, 0.55], [-53, -51.6, 0.6], [-22, -64, 1.0], [32, -58, 1.2], [36, 40, 0.9], [-24, 60, 1.0], [-80, 46, 0.8], [-82, -46, 0.9], [8, 62, 1.1], [41, 10, 0.8]]) {
  rocks.push(x, +height(x, z).toFixed(3), z, s, +(r() * 6.28).toFixed(2));
}
const [ix, iz] = ISLAND.c, top = ISLAND.top;
export const garden = {
  id: 'heian-uji-garden', style: 'japanese', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [],
  bounds: [GARDEN[0] - 8, GARDEN[1] - 8, GARDEN[2] + 8, GARDEN[3] + 8], entrance: { at: [-60, 72], facing: 'n' },
  elements: [
    { t: 'suhama', stones, rocks },
    // the arched bridge from the hall's island to the small island, the flat one on to the north shore
    { t: 'bridge', a: [ix, iz + ISLAND.r[1] - 1.6], b: [ix, iz + 15.5], y: top - 0.15, rise: 1.3, w: 2.0 },
    { t: 'bridge', a: [ix, iz - ISLAND.r[1] + 1.6], b: [ix, iz - 16.5], y: top - 0.15, rise: 0.3, w: 2.0 },
  ],
};
/** The bell tower across the pond from the Phoenix Hall, with Byōdō-in's bronze bell (docs/settlements/heian-uji.md §4). */
export const BELL = [50, 46];
export const belfry = {
  id: 'heian-uji-belfry', style: 'japanese-byodo', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [],
  bounds: [BELL[0] - 6, BELL[1] - 6, BELL[0] + 6, BELL[1] + 6], entrance: { at: [BELL[0] - 5, BELL[1]], facing: 'e' },
  elements: [{ t: 'shoro', c: BELL, y: 0, half: 1.8, h: 3.4 }],
};

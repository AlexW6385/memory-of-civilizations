// What lives where in the open country (DESIGN §4.2): the wild animals by biome, read from the same
// climate fields as the plants (src/planet/trees.js: warmth, moisture, the height of the mountains,
// the distance to the coast) and Earth's true latitude and longitude for the continents. Pure: a
// function of the ground at a direction, and of a hash of the ground cell for what is found there.

import { unmapPlanet } from './warp.js';
import { latLon } from './geo.js';

const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const inBox = (la, lo, [a0, a1, o0, o1]) => la >= a0 && la <= a1 && lo >= o0 && lo <= o1;

const AFRICA = [-35, 16, -18, 52], INDIA = [6, 30, 68, 100], SEASIA = [-10, 24, 94, 130], AUSTRALIA = [-40, -10, 112, 155];
const NAMERICA = [25, 70, -170, -52], SAMERICA = [-56, 12, -82, -34], PLAINS = [30, 55, -112, -94], ANDES = [-56, 8, -81, -62];
const EURASIA_STEPPE = [35, 56, 20, 130], EUROPE = [35, 72, -12, 45], ASIA_DRY = [12, 48, -17, 112];

/**
 * A biome at a place: { cls, lat, lon, land (is it land the animals can stand on), wet (a river's water) }.
 * g: surface(u). cls: tundra, taiga, forest, steppe, desert, savanna, rain, mountain.
 */
export function biomeAt(u, g) {
  const n = g.n, [lat, lon] = latLon(unmapPlanet(u));
  const warm = n.warm, moist = n.moist, high = g.h > 60 || n.mount > 55;
  let cls;
  if (warm < 0.3) cls = 'tundra';
  else if (warm < 0.42) cls = 'taiga';
  else if (moist < 0.2) cls = 'desert';
  else if (warm > 0.72 && moist > 0.62) cls = 'rain';
  else if (warm > 0.62 && moist < 0.55) cls = 'savanna';
  else if (moist < 0.45) cls = 'steppe';
  else cls = 'forest';
  if (high && cls !== 'tundra') cls = 'mountain';
  return { cls, lat, lon, warm, moist, land: g.h > 0.9 && n.d > 12 && !(n.river > 0.02), mount: n.mount };
}

/** A weighted pick: [[kind, weight, …extra], …] by a hash value 0…1. */
function pick(list, r) {
  let total = 0;
  for (const e of list) total += e[1];
  let x = r * total;
  for (const e of list) { x -= e[1]; if (x <= 0) return e; }
  return list[list.length - 1];
}

/**
 * What a place may hold, as [[species, weight, herd min, herd max], …] and how thick herds lie there
 * (the chance that a 300 m cell holds one). Species are keys of SPECIES (wild-fauna.js).
 */
export function wildlifeAt(b) {
  const { cls, lat, lon } = b, L = [];
  const africa = inBox(lat, lon, AFRICA), india = inBox(lat, lon, INDIA), seasia = inBox(lat, lon, SEASIA), aus = inBox(lat, lon, AUSTRALIA);
  const namer = inBox(lat, lon, NAMERICA), samer = inBox(lat, lon, SAMERICA), europe = inBox(lat, lon, EUROPE);
  let density = 0.2;
  const andes = inBox(lat, lon, ANDES) && (b.mount > 25 || lat < -38);
  if (andes) { L.push(['guanaco', 1, 4, 9]); density = 0.35; return { list: L, density }; }
  switch (cls) {
    case 'tundra': L.push(['reindeer', 1, 5, 12], ['wolf', 0.25, 2, 4]); density = 0.16; break;
    case 'taiga': L.push(['reindeer', 0.6, 4, 9], ['deer', 0.4, 2, 4], ['wolf', 0.3, 2, 5]); density = 0.18; break;
    case 'forest':
      if (aus) { L.push(['kangaroo', 1, 3, 6]); density = 0.2; break; }
      if (inBox(lat, lon, PLAINS) && b.moist < 0.85) { L.push(['bison', 1, 5, 12], ['deer', 0.4, 2, 4]); density = 0.26; break; }
      if (samer) { L.push(['deer', 1, 2, 5], ['macaque', 0.3, 5, 9]); break; }
      if (india || seasia) { L.push(['deer', 1, 4, 9], ['boar', 0.5, 3, 6], ['elephant', 0.25, 2, 5], ['macaque', 0.4, 5, 9]); density = 0.24; break; }
      L.push(['deer', 1, 3, 7], ['boar', 0.6, 3, 7], ['wolf', 0.12, 2, 4]); density = 0.26;
      break;
    case 'steppe':
      if (aus) { L.push(['kangaroo', 1, 4, 9]); density = 0.26; break; }
      if (namer && lat > 25) { L.push(['bison', 1, 6, 14], ['antelope', 0.6, 4, 9]); density = 0.3; break; }
      if (samer) { L.push(['guanaco', 1, 4, 9]); density = 0.26; break; }
      if (africa) { L.push(['antelope', 1, 5, 11], ['zebra', 0.35, 4, 8]); density = 0.26; break; }
      if (inBox(lat, lon, EURASIA_STEPPE)) { L.push(['horse', 1, 4, 10], ['antelope', 0.9, 6, 14], ['wolf', 0.1, 2, 3]); density = 0.28; break; }
      L.push(['antelope', 1, 4, 9], ['deer', 0.4, 2, 4]); density = 0.2;
      break;
    case 'desert':
      if (aus) { L.push(['kangaroo', 1, 3, 6]); density = 0.1; break; }
      if (inBox(lat, lon, ASIA_DRY)) { L.push(['camel', 0.8, 3, 7], ['oryx', 0.8, 3, 7], ['antelope', 1, 4, 9]); density = 0.15; break; }
      L.push(['antelope', 1, 3, 6]); density = 0.1;
      break;
    case 'savanna':
      if (africa) { L.push(['zebra', 1, 5, 12], ['antelope', 1.2, 6, 14], ['giraffe', 0.7, 2, 5], ['elephant', 0.5, 3, 7], ['oryx', 0.3, 3, 6]); density = 0.4; break; }
      if (aus) { L.push(['kangaroo', 1, 4, 9]); density = 0.28; break; }
      if (india || seasia) { L.push(['deer', 1, 5, 11], ['antelope', 0.8, 4, 9], ['elephant', 0.5, 3, 6]); density = 0.3; break; }
      L.push(['deer', 1, 3, 6], ['antelope', 0.5, 3, 6]); density = 0.2;
      break;
    case 'rain':
      if (africa) { L.push(['elephant', 0.6, 3, 6], ['macaque', 1, 6, 12], ['antelope', 0.4, 2, 4]); density = 0.22; break; }
      if (aus) { L.push(['kangaroo', 1, 2, 4]); density = 0.1; break; }
      L.push(['macaque', 1, 6, 12], ['deer', 0.5, 2, 5], ['boar', 0.4, 3, 6], ['elephant', india || seasia ? 0.4 : 0, 2, 5]); density = 0.24;
      break;
    case 'mountain':
      L.push(['ibex', 1, 4, 9], ['deer', europe ? 0.4 : 0.2, 2, 4]); density = 0.18;
      break;
    default: break;
  }
  return { list: L.filter((e) => e[1] > 0), density };
}

/** One herd of a cell: { species, n } for the hash values r1, r2 (0…1) at the biome, or null. */
export function herdAt(b, r1, r2) {
  const { list, density } = wildlifeAt(b);
  if (!list.length || r1 > density) return null;
  const e = pick(list, r2 * 0.9999);
  return { species: e[0], n: e[2] + Math.floor(((r1 * 977 + r2 * 131) % 1) * (e[3] - e[2] + 1)) };
}

/** Birds of prey over a place: the kind (eagle, hawk, vulture, kite) and how many cells in a hundred circle one. */
export function raptorsAt(b) {
  switch (b.cls) {
    case 'savanna': case 'desert': return { kind: 'vulture', share: 0.22 };
    case 'mountain': case 'tundra': return { kind: 'eagle', share: 0.12 };
    case 'steppe': return { kind: 'eagle', share: 0.18 };
    case 'rain': return { kind: 'hawk', share: 0.07 };
    case 'taiga': return { kind: 'eagle', share: 0.1 };
    default: return { kind: 'kite', share: 0.15 };
  }
}

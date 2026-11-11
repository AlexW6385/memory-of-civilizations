// Modern Sydney, 1973 — the harbour's craft, the arrival's foreground and the places people stop (docs/settlements/sydney.md §12):
// yachts at their moorings in Farm Cove and under sail in the harbour, launches and a tug; Mrs Macquarie's Point with its chair,
// benches, lamps, strollers and anglers on the sea wall; the Garden's paths with their benches; the Opera House's great stair with
// people sitting on it; the traffic on the Harbour Bridge's deck and the Cahill Expressway. Everything derives from layout.js.
import { LEVEL, OPERA, BRIDGE, QUAY, FARM, COVE, MACQUARIE, GARDEN, BENNELONG, RADIUS, shore, height, inRect } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FERRY_LANES = [[-24, -334, 36, -70], [-174, -340, 204, -300]];

/** The small craft: moored in Farm Cove (heads to the wind), under sail and at work in the harbour. */
export function craft() {
  const rand = rng(1788), out = [], taken = [];
  const water = (x, z, m) => shore(x, z) < -m && Math.hypot(x, z) < RADIUS - 70;
  const spot = (r, wall, gap) => {
    for (let k = 0; k < 60; k++) {
      const x = r[0] + rand() * (r[2] - r[0]), z = r[1] + rand() * (r[3] - r[1]);
      if (!water(x, z, wall) || FERRY_LANES.some((q) => inRect(q, x, z, 6)) || taken.some(([a, b, g]) => Math.hypot(a - x, b - z) < gap + g) || (Math.abs(x - BRIDGE.x) < 14 && z < -100)) continue;
      taken.push([x, z, gap]); return [x, z];
    }
    return null;
  };
  const add = (kind, r, wall, gap, o = {}) => { const p = spot(r, wall, gap); if (p) out.push({ t: 'craft', kind, at: p, y: LEVEL, seed: Math.floor(rand() * 1e6), ...o }); };
  // Farm Cove: the moorings, all heading into the wind (the north-easterly in summer)
  for (let i = 0; i < 12; i++) add('yacht', [FARM[0] + 6, FARM[1] + 8, FARM[2] - 6, FARM[3] - 8], 7, 9, { rot: 2.2 + (rand() - 0.5) * 0.4, len: 8 + rand() * 6, sail: 'furled' });
  for (let i = 0; i < 4; i++) add('launch', [FARM[0] + 6, FARM[1] + 8, FARM[2] - 6, FARM[3] - 8], 7, 8, { rot: 2.2 + (rand() - 0.5) * 0.6, len: 7 + rand() * 4 });
  // Sydney Cove's mouth and the harbour: yachts under sail on a reach, a tug, launches
  for (let i = 0; i < 12; i++) { const east = rand() < 0.5; add('yacht', [-260, -330, 260, -110], 30, 22, { rot: east ? -Math.PI / 2 + (rand() - 0.5) * 0.5 : Math.PI / 2 + (rand() - 0.5) * 0.5, len: 9 + rand() * 7, sail: 'up' }); }
  for (let i = 0; i < 2; i++) add('tug', [-120, -300, 120, -120], 30, 26, { rot: rand() * 6, len: 22 + rand() * 4 });
  for (let i = 0; i < 4; i++) add('launch', [-250, -330, 250, -110], 20, 14, { rot: rand() * 6, len: 8 + rand() * 4 });
  return out;
}

/** The point of the Macquarie's rock: the northmost land at x, with the wall's coping 0 m behind. */
function edge(x) { for (let z = -170; z < -60; z += 0.5) if (shore(x, z) > 1.8) return z; return null; }

/** The life of the arrival's foreground, the Garden, the stair, the bridge and the expressway (life style). */
export function sceneLife() {
  const rand = rng(1973), L = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const MEN = [['cloth_white', 'cloth_grey'], ['cloth_blue', 'cloth_brown'], ['cloth_ochre', 'cloth_indigo'], ['cloth_grey', 'cloth_black']], FROCK = ['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_blue', 'cloth_white', 'cloth_maroon'];
  const person = (at, y, rot, o = {}) => {
    const [c1, c2] = pick(MEN);
    L.push(rand() < 0.42
      ? { t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'tunic', hair: rand() < 0.6 ? 'long' : 'bun', cloth: pick(FROCK), cloth2: 'cloth_white', skin: 'skin_light', hat: 'none', ...o }
      : { t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'trousers', hair: 'short', over: 'collar', cloth: c1, cloth2: c2, skin: rand() < 0.92 ? 'skin_light' : 'skin_medium', hat: rand() < 0.15 ? 'brim' : 'none', hatMat: 'cloth_grey', ...o });
  };
  const bench = (at, rot, sit = 0) => {
    const y = height(...at);
    L.push({ t: 'bench', at, y, rot, len: 1.9, back: true, mat: 'timber', seed: Math.floor(rand() * 1e6) });
    // (the bench's front is −z at rot 0: a sitter's seat is 0.46 above its feet)
    const o = (d) => [at[0] + Math.sin(rot) * d, at[1] + Math.cos(rot) * d];
    for (let k = 0; k < sit; k++) person(o(0), y + 0.0, rot, { pose: 'sit' }), null;
  };
  void bench;
  // ── Mrs Macquarie's Point: the wall's walk with benches facing the cove and the Opera House, lamps, anglers on the coping ──
  const walk = [];
  for (let x = 224; x < 334; x += 9) { const z = edge(x); if (z != null) walk.push([x, z + 3.2]); }
  walk.forEach(([x, z], i) => {
    if (i % 3 === 1) { const at = [x, z]; L.push({ t: 'bench', at, y: height(...at), rot: Math.PI, len: 1.9, back: true, mat: 'timber', seed: i }); if (rand() < 0.7) person([x - 0.35, z - 0.12], height(...at), 0, { pose: 'sit' }); if (rand() < 0.45) person([x + 0.35, z - 0.12], height(...at), 0, { pose: 'sit' }); }
    else if (i % 3 === 0) L.push({ t: 'street_lamp', at: [x, z + 0.9], y: height(x, z + 0.9), h: 4.6 });
    else if (rand() < 0.7) person([x + (rand() - 0.5) * 3, z - 1 + rand() * 0.6], height(x, z), rand() < 0.5 ? 0 : Math.PI, rand() < 0.4 ? { pose: 'talk' } : {});
  });
  // anglers standing on the sea wall's walk with their rods (a staff held), a few with the day's catch in a bucket
  for (let i = 0; i < 6; i++) { const x = 230 + rand() * 100, z = edge(x); if (z == null) continue; person([x, z + 1.9], height(x, z + 1.9), 0, { carry: 'staff', len: 2.4, hat: 'brim', hatMat: 'cloth_ochre' }); }
  // strollers and a picnic on the Point's lawn
  for (let i = 0; i < 18; i++) { const x = 226 + rand() * 100, z0 = edge(x); if (z0 == null) continue; const z = z0 + 9 + rand() * 24; if (!inRect(MACQUARIE, x, z)) continue; person([x, z], height(x, z), rand() * 6.28, rand() < 0.5 ? { pose: 'talk' } : {}); }
  for (let i = 0; i < 4; i++) { const x = 240 + rand() * 70, z0 = edge(x); if (z0 == null) continue; const z = z0 + 14 + rand() * 12, c = [x, z]; for (let k = 0; k < 3; k++) person([c[0] + Math.cos(k * 2.1) * 0.9, c[1] + Math.sin(k * 2.1) * 0.9], height(...c), k * 2.1 + Math.PI / 2, { pose: 'sit_ground' }); }
  // ── the Garden: benches and lamps along the paths, people on them (the paths of movers.js, the one across the lawns at z 44, the one down the east side at x 200) ──
  for (let x = 176; x < 400; x += 22) {
    const at = [x, 40.8]; if (!inRect(GARDEN, x, 40)) continue;
    L.push({ t: 'bench', at, y: height(...at), rot: 0, len: 1.9, back: true, mat: 'timber', seed: x }); if (rand() < 0.6) person([x - 0.3, 41.1], height(...at), Math.PI, { pose: 'sit' });
    L.push({ t: 'street_lamp', at: [x + 11, 40.8], y: height(x + 11, 40.8), h: 4.2 });
  }
  for (let z = -20; z < 140; z += 24) { const at = [197.2, z]; L.push({ t: 'bench', at, y: height(...at), rot: -Math.PI / 2, len: 1.9, back: true, mat: 'timber', seed: z + 5 }); if (rand() < 0.6) person([197.0, z - 0.3], height(...at), Math.PI / 2, { pose: 'sit' }); }
  // ── the Opera House: the great stair with people sitting on it, strollers on the forecourt and the broadwalk, lamps on the approach ──
  const [ox0, , ox1, oz1] = OPERA.rect, yS = height(100, -190), n = 18;
  for (let i = 0; i < 46; i++) {
    const k = 1 + Math.floor(rand() * (n - 2)), zz = oz1 + OPERA.stair * (1 - k / n) - OPERA.stair / n * 0.55, yy = yS + OPERA.h * (k + 1) / n, x = ox0 + 10 + rand() * (ox1 - ox0 - 20);
    person([x, zz], yy, Math.PI + (rand() - 0.5) * 0.5, rand() < 0.75 ? { pose: 'sit_low' } : {});
  }
  for (let i = 0; i < 16; i++) { const x = ox0 + 8 + rand() * (ox1 - ox0 - 16), z = oz1 + OPERA.stair + 3 + rand() * 7; person([x, z], height(x, z), rand() * 6.28, rand() < 0.5 ? { pose: 'talk' } : {}); }
  for (let z = -112; z < -100; z += 5) for (const x of [64, 136]) L.push({ t: 'street_lamp', at: [x, z], y: height(x, z), h: 4.6 });
  for (let x = 62; x <= 140; x += 13) L.push({ t: 'street_lamp', at: [x, oz1 + OPERA.stair + 9], y: height(x, oz1 + OPERA.stair + 9), h: 4.6 });
  // ── the traffic on the Harbour Bridge's deck (eight lanes, left-hand: the west four run north) and on the Cahill Expressway ──
  const tw = BRIDGE.truss, lx0 = BRIDGE.x - tw + 1.0, lw = (2 * tw - 2) / 8, cs = 0.82;
  for (let k = 0; k < 8; k++) for (let z = BRIDGE.z0 - 60 + rand() * 12; z < BRIDGE.z1 + 60; z += 9 + rand() * 20) {
    if (rand() < 0.15) continue;
    L.push({ t: 'car', at: [lx0 + (k + 0.5) * lw, z], y: BRIDGE.deck, rot: k < 4 ? 0 : Math.PI, era: 1970, s: cs, seed: Math.floor(rand() * 1e9) });
  }
  for (const [dz, rot] of [[-8.5, -Math.PI / 2], [-4.8, -Math.PI / 2], [4.8, Math.PI / 2], [8.5, Math.PI / 2]]) for (let x = QUAY[0] + 4 + rand() * 6; x < QUAY[2] - 3; x += 9 + rand() * 18) L.push({ t: 'car', at: [x, (QUAY[1] + QUAY[3]) / 2 + dz * 0.6 + 0.0], y: 13, rot, era: 1970, seed: Math.floor(rand() * 1e9) });
  return L;
}

/** The elements in modern style: the chair on the Point's rock. */
export function pointElements() {
  const x = 262, z = edge(x);
  return z == null ? [] : [{ t: 'macquarie_chair', at: [x, z + 1.6], y: height(x, z + 1.6), rot: -Math.PI / 4 }];
}
void COVE; void BENNELONG; void FARM;

// Modern Sydney, 1973 — the streets (docs/settlements/sydney.md §11): the footpaths of concrete flags with their kerbs along every
// shop front and block face the lots leave clear, the Rocks' lanes flagged with sandstone, and on them what stood there — signals
// at the crossings, cobra-head lamps, hydrants, bins, sandwich boards and fruit crates at the shop doors, pillar boxes, bus stops;
// in the roads the traffic of 1973 and the cars at the kerbs, the people standing about at the shops and the bus stops, the washing
// across the lanes. Everything derives from layout.js (the lots and the streets' cells); the tiles are drawn only near the visitor.
import { RADIUS, lots, streetCells, height, shore, inRect, GARDEN, MACQUARIE, BENNELONG, QUAY, AUSTRALIA_SQ, BRIDGE } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TILE = 150;
/** The rectangle d0 … d1 m out from a lot's face f. */
const strip = (r, f, d0, d1) => { const [x0, z0, x1, z1] = r; return f === 'n' ? [x0, z0 - d1, x1, z0 - d0] : f === 's' ? [x0, z1 + d0, x1, z1 + d1] : f === 'w' ? [x0 - d1, z0, x0 - d0, z1] : [x1 + d0, z0, x1 + d1, z1]; };
const hit = (a, b, m = 0) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;
/** The point u along a lot's face f, d out from it. */
function onFace(r, f, u, d) {
  const [x0, z0, x1, z1] = r;
  return f === 'n' ? [x0 + u, z0 - d] : f === 's' ? [x0 + u, z1 + d] : f === 'w' ? [x0 - d, z0 + u] : [x1 + d, z0 + u];
}
// (left-hand traffic: the kerb lane of a road runs west on its south side, east on its north side, south on its east side, north on its west side;
// a car's bow is −z at rot 0, and rot θ turns it toward (−sin θ, −cos θ))
const LEFT = { n: Math.PI / 2, s: -Math.PI / 2, w: Math.PI, e: 0 };
const FACE_LEN = (r, f) => (f === 'n' || f === 's' ? r[2] - r[0] : r[3] - r[1]);
const tileOf = (x, z) => `${Math.floor(x / TILE)},${Math.floor(z / TILE)}`;

let CACHE = null;
/** What the streets hold: footpaths, kerbs and curb items by tile (modern style), the life of the roads by tile (life style). */
export function streets() {
  if (CACHE) return CACHE;
  const L = lots(), rand = rng(1973), { xs, zs } = streetCells();
  const city = L.filter((l) => !l.t || l.t === 'shop_room'), rocks = L.filter((l) => l.t === 'rocks_terrace');
  const tiles = new Map(), life = new Map();
  const T = (k) => { if (!tiles.has(k)) tiles.set(k, { segs: [], flag: [], curbs: [], items: [], kit: [] }); return tiles.get(k); };
  const LT = (k) => { if (!life.has(k)) life.set(k, []); return life.get(k); };
  const wet = (x, z) => shore(x, z) < 3 || Math.hypot(x, z) > RADIUS - 48 || inRect(GARDEN, x, z, 2) || inRect(MACQUARIE, x, z, 2) || inRect(BENNELONG, x, z, 2) || inRect(QUAY, x, z, 8) || Math.hypot(x - AUSTRALIA_SQ[0], z - AUSTRALIA_SQ[1]) < 30 || (Math.abs(x - BRIDGE.x) < 32 && z < -30);
  const clear = (r, self, m = 0) => !L.some((o) => o !== self && hit(o.rect, r, m)) && ![[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].some(([x, z]) => wet(x, z));
  const inCrossing = (x, z, m = 0) => xs.some(([a, b]) => x > a - m && x < b + m) && zs.some(([a, b]) => z > a - m && z < b + m);
  const placed = [];
  const free = (x, z, m) => !placed.some((p) => Math.hypot(p[0] - x, p[1] - z) < m);
  const mark = (x, z) => placed.push([x, z]);
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const SPECIALS = ['MEAT PIES', 'ICE CREAM', 'COLD DRINKS', 'HOT PIES', 'FISH CHIPS', 'MILK SHAKES', 'LUNCH', 'COFFEE', 'SANDWICHES', 'OPEN'];
  const kerbs = [], paths = [];
  // ── the footpaths of the city's shop fronts and block faces, with their kerbs ─────────────────────────────────
  for (const l of city) {
    if (l.t === 'espresso_bar') continue;
    for (const f of 'nsew') {
      if (!clear(strip(l.rect, f, 0, 3), l)) continue;
      const D = 2.6, P = strip(l.rect, f, 0, D), yp = (l.t && f === l.front ? l.gy : l.y) - 0.04;
      const t = T(tileOf((P[0] + P[2]) / 2, (P[1] + P[3]) / 2));
      t.segs.push([P[0], P[1], P[2], P[3], yp, yp]);
      const K = strip(l.rect, f, D, D + 0.2); kerbs.push({ t, K, y: yp - 0.02, P });
      paths.push(P);
      const len = FACE_LEN(l.rect, f), shopped = (l.shops ?? '').includes(f), roadside = clear(strip(l.rect, f, 3, 9), l);
      const rotFace = { n: Math.PI / 2, s: -Math.PI / 2, w: 0, e: Math.PI }[f];
      // what stands at the shop door and the kerb: a sandwich board, a crate of fruit, a bin, a hydrant
      for (let u = 1.6 + rand() * 3; u < len - 1; u += 4.5 + rand() * 7) {
        const roll = rand(), wall = onFace(l.rect, f, u, 0.9), kerb = onFace(l.rect, f, u, D - 0.35), at = shopped && roll < 0.3 ? wall : kerb;
        if (inCrossing(at[0], at[1], 1.2) || !free(at[0], at[1], 1.4)) continue;
        let it;
        if (shopped && roll < 0.2) it = { k: 'asign', text: pick(SPECIALS), rot: rotFace + (rand() - 0.5) * 0.5 };
        else if (shopped && roll < 0.3) it = { k: 'crates', rot: rotFace };
        else if (roll < 0.45) it = { k: 'ashcan' };
        else if (roll < 0.52 && roadside) it = { k: 'hydrant' };
        else if (roll < 0.62 && roadside) it = { kit: 'bin', rot: rotFace };
        else continue;
        mark(at[0], at[1]);
        if (it.kit) t.kit.push({ t: 'street_kit', kind: it.kit, at, y: yp + 0.04, rot: it.rot, seed: Math.floor(rand() * 1e6) });
        else t.items.push({ at, y: yp + 0.04, rot: it.rot ?? 0, seed: Math.floor(rand() * 1e6), ...it });
      }
      // the cobra-head lamps along the kerb of the roads (every ~28 m, the arm reaching over the roadway)
      if (roadside) for (let u = 3 + rand() * 6; u < len - 1; u += 24 + rand() * 10) {
        const at = onFace(l.rect, f, u, D - 0.3);
        if (inCrossing(at[0], at[1], 2) || !free(at[0], at[1], 6)) continue;
        mark(at[0], at[1]); t.kit.push({ t: 'street_kit', kind: 'cobra', at, y: yp + 0.04, rot: { n: Math.PI, s: 0, w: -Math.PI / 2, e: Math.PI / 2 }[f], seed: Math.floor(rand() * 1e6) });
      }
      if (roadside && len > 12 && rand() < 0.12) {
        const at = onFace(l.rect, f, len * (0.3 + rand() * 0.4), D - 0.5);
        if (!inCrossing(at[0], at[1], 2) && free(at[0], at[1], 4)) { mark(at[0], at[1]); t.kit.push({ t: 'street_kit', kind: rand() < 0.5 ? 'pillar' : 'busstop', at, y: yp + 0.04, rot: rotFace + Math.PI, seed: Math.floor(rand() * 1e6) }); }
      }
      // cars at the kerb of the roads, in the way of the traffic
      if (roadside) for (let u = 3 + rand() * 3; u < len - 2.5; u += 5.6 + rand() * 4) {
        if (rand() < 0.5) continue;
        const at = onFace(l.rect, f, u, D + 1.15);
        if (inCrossing(at[0], at[1], 3) || !free(at[0], at[1], 4.6) || !clear([at[0] - 1.3, at[1] - 1.3, at[0] + 1.3, at[1] + 1.3], l)) continue;
        mark(at[0], at[1]); LT(tileOf(at[0], at[1])).push({ t: 'car', at, y: height(...at), rot: LEFT[f], era: 1970, seed: Math.floor(rand() * 1e9) });
      }
    }
  }
  // (a kerb is left out where it would run over another face's footpath at a corner)
  for (const k of kerbs) if (!paths.some((p) => p !== k.P && hit(p, k.K, -0.01))) k.t.curbs.push([k.K[0], k.K[1], k.K[2], k.K[3], k.y]);
  // ── signals at the four corners of every crossing, manholes in the roads, the traffic ────────────────────────
  for (const [ax0, ax1] of xs) for (const [az0, az1] of zs) {
    for (const [px, pz] of [[ax0 - 1.2, az0 - 1.2], [ax1 + 1.2, az0 - 1.2], [ax0 - 1.2, az1 + 1.2], [ax1 + 1.2, az1 + 1.2]]) {
      if (wet(px, pz) || L.some((o) => hit(o.rect, [px - 0.3, pz - 0.3, px + 0.3, pz + 0.3]))) continue;
      T(tileOf(px, pz)).items.push({ k: 'signal', at: [px, pz], y: height(px, pz) + 0.05, rot: 0, seed: 1 });
    }
  }
  const roadAt = (x, z) => !wet(x, z) && !L.some((o) => hit(o.rect, [x - 1.2, z - 1.2, x + 1.2, z + 1.2]));
  const lane = (x, z, rot) => { if (!roadAt(x, z) || placed.some((p) => Math.hypot(p[0] - x, p[1] - z) < 6.5)) return; mark(x, z); LT(tileOf(x, z)).push({ t: 'car', at: [x, z], y: height(x, z), rot, era: 1970, seed: Math.floor(rand() * 1e9) }); };
  for (const [a, b, c] of xs) {
    const k = (b - a) / 16;
    for (const [dx, rot] of [[2.6, Math.PI], [-2.6, 0]]) for (let z = -100 + rand() * 20; z < RADIUS - 30; z += 11 + rand() * 30) lane(c + dx * k, z, rot);
    for (let z = -100; z < RADIUS - 30; z += 37 + rand() * 20) { const x = c + (rand() - 0.5) * 6; if (roadAt(x, z)) T(tileOf(x, z)).items.push({ k: 'manhole', at: [x, z], y: height(x, z) + 0.01, rot: 0, seed: 1 }); }
  }
  for (const [, , c] of zs) for (const [dz, rot] of [[-2.6, -Math.PI / 2], [2.6, Math.PI / 2]]) for (let x = -RADIUS + 40; x < RADIUS - 30; x += 11 + rand() * 30) lane(x, c + dz, rot);
  // ── the Rocks' lanes: sandstone flagging over the lane's floor, gas lamps, bins and crates at the doors, washing across the lane ──
  for (const l of rocks) {
    if (l.enter === 0) continue;
    const f = l.front, near = strip(l.rect, f, 0, 7);
    const opp = rocks.filter((o) => o !== l && hit(o.rect, near)).sort((p, q) => Math.hypot(p.rect[0] - l.rect[0], p.rect[1] - l.rect[1]) - Math.hypot(q.rect[0] - l.rect[0], q.rect[1] - l.rect[1]))[0];
    const gap = opp ? (f === 'n' ? l.rect[1] - opp.rect[3] : f === 's' ? opp.rect[1] - l.rect[3] : f === 'w' ? l.rect[0] - opp.rect[2] : opp.rect[0] - l.rect[2]) : 4;
    const D = Math.max(0.9, Math.min(gap / 2, 3)), P = strip(l.rect, f, 0, D);
    if (!clear(P, l)) continue;
    const yg = Math.min(l.y, height((P[0] + P[2]) / 2, (P[1] + P[3]) / 2) + 0.15), t = T(tileOf((P[0] + P[2]) / 2, (P[1] + P[3]) / 2));
    t.flag.push([P[0], P[1], P[2], P[3], yg, yg]);
    const len = FACE_LEN(l.rect, f);
    for (let u = 1.2 + rand() * 2; u < len - 1; u += 4 + rand() * 5) {
      const roll = rand(), at = onFace(l.rect, f, u, 0.55 + rand() * 0.3);
      if (roll > 0.55 || !free(at[0], at[1], 1.1)) continue;
      mark(at[0], at[1]);
      if (roll < 0.1) t.items.push({ k: 'lampost', at, y: yg + 0.04, rot: 0, seed: 1 });
      else if (roll < 0.28) t.items.push({ k: 'ashcan', at, y: yg + 0.04, rot: 0, seed: 1 });
      else if (roll < 0.4) LT(tileOf(at[0], at[1])).push({ t: 'crates', at, y: yg + 0.04, rot: rand() * 6, seed: Math.floor(rand() * 1e6) });
      else if (roll < 0.5) LT(tileOf(at[0], at[1])).push({ t: 'pot', at, y: yg + 0.04, rot: 0, kind: 'water_pot', seed: Math.floor(rand() * 1e6) });
      else LT(tileOf(at[0], at[1])).push({ t: 'animal', kind: 'cat', at, y: yg + 0.04, rot: rand() * 6, seed: Math.floor(rand() * 1e6) });
    }
    // washing across the lane between the upper floors, where the lane is wide enough for the balconies and a line
    if (opp && gap > 2.4 && l.kind === 'terrace' && rand() < 0.28) {
      const mid = onFace(l.rect, f, len / 2 + (rand() - 0.5) * (len * 0.4), gap / 2);
      LT(tileOf(mid[0], mid[1])).push({ t: 'wash_line', at: mid, y: l.y + 0.5 + 3.5 + 1.0, rot: f === 'n' || f === 's' ? Math.PI / 2 : 0, len: gap + 0.5, emb: [0.2, 0.2], seed: Math.floor(rand() * 1e6) });
    }
  }
  // ── the people at the shops: standing, talking in twos, looking in the windows ──────────────────────────────────────
  const DRESS = [['cloth_white', 'cloth_grey'], ['cloth_blue', 'cloth_grey'], ['cloth_ochre', 'cloth_brown'], ['cloth_white', 'cloth_indigo'], ['cloth_grey', 'cloth_black'], ['cloth_green', 'cloth_brown']];
  const FROCK = ['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_blue', 'cloth_white', 'cloth_maroon', 'cloth_indigo'];
  const person = (at, y, rot, o = {}) => {
    const [c1, c2] = pick(DRESS);
    LT(tileOf(at[0], at[1])).push(rand() < 0.45
      ? { t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'tunic', hair: rand() < 0.6 ? 'long' : 'bun', cloth: pick(FROCK), cloth2: 'cloth_white', skin: 'skin_light', hat: 'none', ...o }
      : { t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'trousers', hair: 'short', over: 'collar', cloth: c1, cloth2: c2, skin: rand() < 0.9 ? 'skin_light' : 'skin_medium', hat: rand() < 0.14 ? 'brim' : 'none', hatMat: 'cloth_grey', ...o });
  };
  for (const l of city) {
    for (const f of 'nsew') {
      if (!(l.shops ?? '').includes(f) || rand() < 0.5) continue;
      const len = FACE_LEN(l.rect, f), u = 2 + rand() * Math.max(1, len - 4), at = onFace(l.rect, f, u, 1.5 + rand() * 0.6);
      if (inCrossing(at[0], at[1], 1.5) || !free(at[0], at[1], 1.1) || !clear([at[0] - 0.4, at[1] - 0.4, at[0] + 0.4, at[1] + 0.4], l)) continue;
      mark(at[0], at[1]);
      const toward = { n: Math.PI, s: 0, w: -Math.PI / 2, e: Math.PI / 2 }[f];       // facing the shop window (a figure faces −z at rot 0)
      if (rand() < 0.4) { person(at, l.y, toward + (rand() - 0.5) * 0.5, { pose: 'talk' }); const b = onFace(l.rect, f, u + 0.8, 1.5); if (free(b[0], b[1], 0.5)) person(b, l.y, toward + Math.PI + (rand() - 0.5) * 0.4, { pose: 'talk' }); }
      else person(at, l.y, toward + (rand() - 0.5) * 0.7);
    }
  }
  CACHE = { tiles, life };
  return CACHE;
}

/** The plans: the footpaths, kerbs, curb items and street furniture (modern) and the life of the roads (life), a tile of 150 m each, drawn within 330 m. */
export function streetPlans(base) {
  const { tiles, life } = streets(), out = [];
  const centre = (k) => { const [i, j] = k.split(',').map(Number); return [i * TILE + TILE / 2, j * TILE + TILE / 2]; };
  for (const [k, t] of tiles) {
    const els = [];
    if (t.segs.length || t.curbs.length) els.push({ t: 'pavement', segs: t.segs, curbs: t.curbs, mat: 'concrete_light' });
    if (t.flag.length) els.push({ t: 'pavement', segs: t.flag, curbs: [], mat: 'flagstone' });
    if (t.items.length) els.push({ t: 'curb', items: t.items });
    els.push(...t.kit);
    if (els.length) out.push({ ...base(`sydney-street-${k}`, els), center: centre(k), near: 330 });
  }
  for (const [k, list] of life) out.push({ ...base(`sydney-streetlife-${k}`, list), style: 'life', center: centre(k), near: 300 });
  return out;
}

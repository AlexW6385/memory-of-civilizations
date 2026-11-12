// Benin City c. 1600 — the layout (docs/settlements/benin-city.md §2): the Oba's palace on the north side of the great street, the
// king's square before it, the cross street to the Oba market, the guild quarters in a block east of the palace, the compounds in
// rows between the streets, and round all the Iya, the rampart and its ditch, broken by the gates. Compressed to this disc.
// Pure data. +x east, +z south.

export const RADIUS = 330;
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export const PALACE = [-140, -125, 10, 0];                 // the compound (its south front on the king's square)
export const GATE_X = -65;                                  // the palace gate, in the middle of the south wall
export const SQUARE = [-150, 0, 20, 40];                    // the king's square
export const GREAT = [-RADIUS, 40, RADIUS, 74];             // the great street, 34 m
export const CROSS = [86, -RADIUS, 110, RADIUS];            // the cross street, 24 m
// the waiting sheds of the king's square (docs/settlements/benin-city.md §11): two gabled sheds of thatch before the gate, and bays of thatch leaning on
// the palace wall either side of the gate's portico, where the petitioners and the idle sit out the sun and the rain
export const SHEDS = [{ rect: [-87, 8, -76.5, 13.5], kind: 'gable', seed: 71, fire: [-89.4, 11.4] }, { rect: [-45.5, 6.5, -35.5, 11.5], kind: 'gable', seed: 72, fire: [-33.2, 9.4] }];
export const BAYS = [-117, -112, -107, -100, -95, -90, -85, -50, -45, -40, -33, -28, -23, -16, -11].map((x, i) => ({ rect: [x, 0.2, x + 5, 3.0], kind: 'lean', seed: 80 + i }));
/** The braziers of the gate's porch (incense, the Oba's offerings [inferred]). */
export const BRAZIERS = [[GATE_X - 4.1, 1.5], [GATE_X + 4.1, 1.5]];
/** The benches of the chiefs in the outer court of audience: two ranks either side of the way, from the gate's vestibule to the great gallery's steps. */
export const AUD = (() => {
  const out = [];
  for (const s of [-1, 1]) for (const rank of [0, 1]) for (let z = -16; z > -60; z -= 6.4) {
    if (Math.abs(z + 36) < 2.5 && rank === 1) continue;                 // the drums stand there
    const x = GATE_X + s * (5.2 + rank * 3.6);
    out.push([x - 0.35, z - 2.2, x + 0.35, z + 2.2]);
  }
  return out;
})();
export const GUILD = [18, -126, 86, 2];                     // the guild quarters
export const LANE = [48, -124, 56, 0];                      // the guild lane
export const MARKET = [114, -100, 214, 36];                 // the Oba market
export const STREETS_Z = [-232, -176, -120, -64, -8, 122, 178, 234];   // the cross streets (10 m)
export const ALLEYS_X = [-262, -210, -160, -62, 22, 230, 270];          // the lanes (8 m)
const BANDS = [[-285, -237], [-227, -181], [-171, -125], [-115, -69], [-59, -13], [-3, 35], [79, 117], [127, 173], [183, 229], [239, 285]];

// ── the Iya: bank and ditch ──
export const BANK = 4.8, DITCH = 3.6;
/** The rampart's crest radius at angle th (an irregular circle). */
export const crest = (th) => 272 + 7 * Math.sin(3 * th + 1) + 4 * Math.sin(7 * th + 2);
/** The point where the ray from (px, pz) along (dx, dz) meets the crest. */
function hit(px, pz, dx, dz) {
  for (let t = 0; t < 400; t += 0.5) { const x = px + dx * t, z = pz + dz * t; if (Math.hypot(x, z) >= crest(Math.atan2(z, x))) return [x, z]; }
  return [px + dx * 300, pz + dz * 300];
}
const L = (x, z) => Math.atan2(z, x);
const gp = (p, dx, dz, name) => { const th = L(p[0], p[1]); return { at: p, dir: [dx, dz], th, name }; };
export const GATES = [
  gp(hit(0, 57, 1, 0), 1, 0, 'east'), gp(hit(0, 57, -1, 0), -1, 0, 'west'),
  gp(hit(98, 0, 0, 1), 0, 1, 'south'), gp(hit(98, 0, 0, -1), 0, -1, 'north'),
  ...[0.785, 2.356, 3.927, 5.498].map((a, i) => { const d = [Math.cos(a), Math.sin(a)]; return gp(hit(0, 0, d[0], d[1]), d[0], d[1], 'diag' + i); }),
];
/** Distance of (x, z) from the line of a gate's road (outward from the gate: positive along). */
const lateral = (g, x, z) => Math.abs((x - g.at[0]) * g.dir[1] - (z - g.at[1]) * g.dir[0]);
export const GATE_W = 5;
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r < 232) return 0;
  const R = crest(Math.atan2(z, x)), d = r - R;
  if (d < -14 || d > 25) return 0;
  let f = 1;
  for (const g of GATES) if ((x - g.at[0]) * g.dir[0] + (z - g.at[1]) * g.dir[1] > -40) f = Math.min(f, smooth(GATE_W - 1, GATE_W + 5, lateral(g, x, z)));
  const bank = BANK * (smooth(-13, -1.5, d) - smooth(1.5, 9, d)), ditch = DITCH * (smooth(9, 12, d) - smooth(21, 25, d));
  return (bank - ditch) * f;
}
/** How far inside the crest (m, positive inside). */
export const depth = (x, z) => crest(Math.atan2(z, x)) - Math.hypot(x, z);

// ── streets ──
export function onStreet(x, z, m = 0) {
  if (inRect(GREAT, x, z, m) || inRect(CROSS, x, z, m) || inRect(SQUARE, x, z, m) || inRect(LANE, x, z, m) || inRect(MARKET, x, z, m)) return true;
  if (depth(x, z) < 12) return false;
  return STREETS_Z.some((s) => Math.abs(z - s) < 5 + m) || ALLEYS_X.some((a) => Math.abs(x - a) < 4 + m);
}
const ZONES = [[PALACE[0] - 3, PALACE[1] - 1.2, PALACE[2] + 3, PALACE[3] + 4], GUILD, SQUARE, GREAT, CROSS, MARKET];
let LOTS = null;
/**
 * The compounds, in rows between the streets, each facing a street: { rect, seed, y, front ('n' | 's'), chief, w, d, row }.
 * Each row is cut by the lanes and the zones (palace, guild, square, market, great streets) into free runs, and each run is filled
 * with compounds of 15–25 m side by side (a run keeps no gap but the party walls), so that the city is built up between its lanes.
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1600), lanes = [...ALLEYS_X].sort((a, b) => a - b);
  for (const [za, zb] of BANDS) {
    const mid = (za + zb) / 2;
    for (const [z0, z1, face] of [[za, mid - 0.5, 'n'], [mid + 0.5, zb, 's']]) {
      // the free runs along x
      let cuts = [[-300, 300]];
      const cut = (a, b) => { const out = []; for (const [p, q] of cuts) { if (b <= p || a >= q) { out.push([p, q]); continue; } if (a > p) out.push([p, a]); if (b < q) out.push([b, q]); } cuts = out; };
      for (const a of lanes) cut(a - 4.6, a + 4.6);
      for (const r of ZONES) if (r[1] < z1 && r[3] > z0) cut(r[0], r[2]);
      for (const [p, q] of cuts) {
        const len = q - p;
        if (len < 14) continue;
        const n = Math.max(1, Math.round(len / 20.5)), w = len / n;
        for (let i = 0; i < n; i++) {
          const x = p + i * w, rect = [x + 0.15, z0, x + w - 0.15, z1], cz = (z0 + z1) / 2;
          if ([[rect[0], z0], [rect[2], z0], [rect[0], z1], [rect[2], z1], [x + w / 2, cz]].some(([a, b]) => depth(a, b) < 17)) continue;
          if (rand() < 0.03) continue;
          const chief = (z1 - z0) > 20 && rand() < 0.2, r = rand();
          // the kind of front: a chief's with an upper storey; a verandah on posts over the street; a trading front (the front room open
          // to the street behind a clay counter); the plain gabled front with its one door
          const onGreat = z1 > GREAT[1] - 12 && z0 < GREAT[3] + 12 && Math.abs(x - 98) > 4;
          const kind = chief ? 'chief' : r < (onGreat ? 0.34 : 0.22) ? 'trade' : r < 0.55 ? 'porch' : 'plain';
          LOTS.push({ rect, seed: Math.floor(rand() * 1e6), y: 0, front: face, chief, kind, w: w - 0.3, d: z1 - z0, row: za, du: chief ? Math.min(w - 0.3 - 3.3, 9.7 + rand() * 1.5) : (w - 0.3) * (0.3 + 0.4 * rand()) });
        }
      }
    }
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
export const inPalace = (x, z, m = 0) => inRect(PALACE, x, z, m);

// ── the guild yards: two columns on the lane, each 17 m along it ──
export const YARDS = (() => {
  const out = [], kinds = ['cast', 'cast', 'carve', 'cast', 'weave', 'cast', 'cast', 'cast', 'carve', 'cast', 'cast', 'weave', 'carve', 'cast'];
  let k = 0;
  for (const side of ['w', 'e']) for (let i = 0; i < 7; i++) {
    const z0 = -124 + i * 17.7, rect = side === 'w' ? [20, z0, 48, z0 + 17] : [56, z0, 84, z0 + 17];
    out.push({ rect, front: side === 'w' ? 'e' : 'w', kind: kinds[k++], seed: 300 + k });
  }
  return out;
})();
export const YARD_ROUTE = LANE;

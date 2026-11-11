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
const ZONES = [[PALACE[0] - 6, PALACE[1] - 6, PALACE[2] + 6, PALACE[3] + 4], GUILD, SQUARE, GREAT, CROSS, MARKET];
let LOTS = null;
/** The compounds, in rows between the streets, each facing a street: { rect, seed, y, front ('n' | 's'), chief, w, d }. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1600);
  for (const [za, zb] of BANDS) {
    const mid = (za + zb) / 2;
    for (const [z0, z1, face] of [[za, mid - 0.5, 'n'], [mid + 0.5, zb, 's']]) {
      for (let x = -300; x < 300;) {
        const w = 16 + Math.floor(rand() * 9), cx = x + w / 2, cz = (z0 + z1) / 2, rect = [x, z0, x + w, z1];
        x += w + (rand() < 0.2 ? 2.5 : 0.8);
        if (ALLEYS_X.some((a) => Math.abs(cx - a) < w / 2 + 4)) continue;
        if (ZONES.some((r) => inRect(r, cx, cz, 0) || (rect[0] < r[2] && rect[2] > r[0] && rect[1] < r[3] && rect[3] > r[1]))) continue;
        if ([[rect[0], z0], [rect[2], z0], [rect[0], z1], [rect[2], z1]].some(([a, b]) => depth(a, b) < 20)) continue;
        if (rand() < 0.06) continue;
        const chief = (z1 - z0) > 20 && rand() < 0.22;
        LOTS.push({ rect, seed: Math.floor(rand() * 1e6), y: 0, front: face, chief, w, d: z1 - z0 });
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

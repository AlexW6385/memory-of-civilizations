// Venice about 1500 — the layout (docs/settlements/venice.md §2): islands in the lagoon. The Piazza
// San Marco with the basilica at its east end, the campanile, the Procuratie along its sides; the
// Piazzetta opening south to the water between the two columns, the Doge's Palace on its east side;
// the Grand Canal curving through the west; smaller canals; houses on every island; the lagoon
// round the disc's edge. Pure data. +x east, +z south (the basin of San Marco to the south).

export const RADIUS = 380;
export const SEA = -2.5, RIM = -10, GROUND = 1.2;
export const PIAZZA = [-150, -40, 25, 30];
export const PIAZZETTA = [25, 30, 76, 118];
export const BASILICA = { c: [62, -5], s: 34, w: 22 };
export const CAMPANILE = [12, 22];
export const CLOCK = [6, -50, 14.5, -40];                      // the Clock Tower (1496–99) over the way into the Merceria
export const MERCERIA = [4, -120, 17, -48];                    // the first stretch of the Merceria behind it, kept clear
export const PALACE = [80, 32, 150, 100];
export const BASIN_Z = 122;
// the Rialto (docs/settlements/venice.md §4): the timber bridge across the Grand Canal where it runs north–south, the
// market (the Erberia and the fish market) on the campo at its west foot, a landing at its east foot
export const RIALTO = { x: -195.83, z: -30, span: 38.94 };
export const MARKET = [-262, -62, -219, -2];
export const RIALTO_CLEAR = [MARKET, [-174, -40, -150, -20]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function segDist(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); }
export const GRAND = [[-120, 125], [-190, 40], [-200, -80], [-140, -190], [-160, -300], [-260, -380]];
export const CANALS = [[[-30, 125], [-40, -60], [-20, -200]], [[100, -40], [160, -160]], [[-300, 60], [-380, -60]], [[-60, -120], [-190, -120]], [[150, -40], [300, -60]]];
const pathD = (x, z, p) => { let d = Infinity; for (let i = 0; i + 1 < p.length; i++) d = Math.min(d, segDist(x, z, p[i], p[i + 1])); return d; };
/** How far into water (negative inside a canal or the basin). */
export function wet(x, z) {
  const d = Math.min(pathD(x, z, GRAND) - 20, ...CANALS.map((p) => pathD(x, z, p) - 5), BASIN_Z - z, RADIUS - 60 - Math.hypot(x, z));
  return inRect(PIAZZA, x, z) || inRect(PIAZZETTA, x, z, 0) && z < BASIN_Z - 2 ? Math.max(d, 1) : d;
}
export function height(x, z) {
  const w = wet(x, z), r = Math.hypot(x, z);
  const h = w > 1.5 ? GROUND : w > -1 ? GROUND + (SEA - 2 - GROUND) * smooth(1.5, -1, w) : SEA - 2;
  return r > RADIUS - 60 ? h + (RIM - h) * smooth(RADIUS - 60, RADIUS - 10, r) : h;
}
export const inWater = (x, z) => wet(x, z) < -0.5;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1500);
  for (let x = -RADIUS + 40; x < RADIUS - 40; x += 11) for (let z = -RADIUS + 40; z < BASIN_Z; z += 11) {
    const w = 8 + rand() * 2, d = 8 + rand() * 2;
    if ([[x, z], [x + w, z], [x, z + d], [x + w, z + d]].some(([a, b]) => wet(a, b) < 2.5)) continue;
    const cx = x + w / 2, cz = z + d / 2;
    if (inRect(PIAZZA, cx, cz, 8) || inRect(PIAZZETTA, cx, cz, 6) || inRect(PALACE, cx, cz, 6) || inRect([BASILICA.c[0] - 50, BASILICA.c[1] - 35, BASILICA.c[0] + 45, BASILICA.c[1] + 35], cx, cz) || Math.abs((cx + 400) % 44 - 22) < 2 || rand() < 0.1) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: GROUND, foot: GROUND - 0.5, storeys: 3 + (rand() < 0.5 ? 1 : 0), front: rand() < 0.5 ? 'n' : 's', plaster: true });
  }
  LOTS = LOTS.filter((l) => !inRect(MERCERIA, (l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2, 4)
    && !RIALTO_CLEAR.some((r) => l.rect[2] > r[0] && l.rect[0] < r[2] && l.rect[3] > r[1] && l.rect[1] < r[3]));   // after the draw: the other lots stay as they were
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

/**
 * The quay walls (docs/settlements/venice.md §6): pieces about 3 m long whose face stands just inside the water (wet = −0.6), their
 * tops covering the bank's slope back to the ground, each [x, z, wx, wz, L] with its face toward the water (wx, wz) — found along every
 * canal's two sides and round its bends, along the basin and round the lagoon's edge, kept only where that line
 * is the true edge (the gradient of wet gives the face's direction).
 */
export function rivePieces() {
  const out = [], seen = new Set(), L = 3, TW = -0.6;
  const tryAt = (x, z) => {
    const w = wet(x, z);
    if (Math.abs(w - TW) > 0.2 || Math.hypot(x, z) > RADIUS - 59) return;
    const e = 0.3, gx = (wet(x + e, z) - wet(x - e, z)) / (2 * e), gz = (wet(x, z + e) - wet(x, z - e)) / (2 * e), g = Math.hypot(gx, gz);
    if (g < 0.6) return;                                                       // a ridge between two waters, or flat
    const wx = -gx / g, wz = -gz / g, px = x + wx * (w - TW), pz = z + wz * (w - TW);
    if (inRect(PIAZZA, px, pz, 1) || RIALTO.x - RIALTO.span / 2 - 1 < px && px < RIALTO.x + RIALTO.span / 2 + 1 && Math.abs(pz - RIALTO.z) < 4.6) return;
    const k = `${Math.round(px / 2.4)},${Math.round(pz / 2.4)}`;
    if (seen.has(k)) return;
    seen.add(k); out.push([+px.toFixed(2), +pz.toFixed(2), +wx.toFixed(4), +wz.toFixed(4), L]);
  };
  const line = (p, d) => {
    for (let i = 0; i + 1 < p.length; i++) {
      const [ax, az] = p[i], [bx, bz] = p[i + 1], len = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / len, tz = (bz - az) / len;
      for (const s of [-1, 1]) for (let t = 0; t <= len; t += L) tryAt(ax + tx * t - tz * d * s, az + tz * t + tx * d * s);
      if (i + 1 < p.length - 1) for (let a = 0; a < Math.PI * 2; a += L / d) tryAt(bx + Math.cos(a) * d, bz + Math.sin(a) * d);
    }
  };
  line(GRAND, 20 + TW);
  for (const c of CANALS) line(c, 5 + TW);
  for (let x = -RADIUS; x <= RADIUS; x += L) tryAt(x, BASIN_Z - TW);
  const rr = RADIUS - 60 - TW;
  for (let a = 0; a < Math.PI * 2; a += L / rr) tryAt(Math.cos(a) * rr, Math.sin(a) * rr);
  return out;
}

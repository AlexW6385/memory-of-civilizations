// The apartment compounds of Teotihuacan (docs/settlements/teotihuacan.md §5, §12), and the maguey and
// nopal grown in the open ground between them (§12).
import { RADIUS, AVENUE, KEEP_CLEAR, PALACE_CLEAR, MARKET, MARKET_PLATFORM, compounds, emptyLots, inCompound, inRect } from './layout.js';
import { ground } from './ground.js';
const base = (id, elements) => ({ id, style: 'teotihuacano', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -80], facing: 'e' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/**
 * Maguey in rows along the compounds' outer walls and in plots between them, a nopal here and there:
 * the open ground of the city kept clear of the avenue, the monuments and the streets' middles.
 */
function plants() {
  const rand = rng(73), P = [], free = (x, z, m) => Math.hypot(x, z) < RADIUS - 12 && !inRect(AVENUE, x, z, 40) && !KEEP_CLEAR.some((k) => inRect(k, x, z, 4)) && !inRect(PALACE_CLEAR, x, z, 4) && !inRect(MARKET, x, z, 4) && !inCompound(x, z, m);
  // rows a metre and a half off the compounds' walls, on one or two sides each
  for (const c of compounds()) {
    const [x0, z0, x1, z1] = c.rect;
    for (const side of [0, 1, 2, 3]) {
      if (rand() < 0.55) continue;
      const along = side < 2, L = along ? x1 - x0 : z1 - z0, n = Math.floor(L / 2.6);
      for (let i = 0; i < n; i++) {
        if (rand() < 0.2) continue;
        const u = (i + 0.5) * L / n + (rand() - 0.5) * 0.5, off = 1.6 + rand() * 0.4;
        const x = along ? x0 + u : side === 2 ? x0 - off : x1 + off, z = along ? (side === 0 ? z0 - off : z1 + off) : z0 + u;
        if (!free(x, z, 0.8)) continue;
        P.push([rand() < 0.08 ? 'nopal' : 'maguey', x, z, ground.height(x, z), 0.65 + rand() * 0.45, rand() * 6.28, Math.floor(rand() * 3)]);
      }
    }
  }
  // plots of maguey in the open ground, a few nopales among them
  for (let k = 0; k < 90; k++) {
    const cx = (rand() * 2 - 1) * RADIUS, cz = (rand() * 2 - 1) * RADIUS;
    if (!free(cx, cz, 6)) continue;
    const nx = 2 + Math.floor(rand() * 3), nz = 2 + Math.floor(rand() * 3), sp = 2.8 + rand() * 0.6, yaw0 = rand() * 6.28;
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const x = cx + (i - nx / 2) * sp + (rand() - 0.5) * 0.6, z = cz + (j - nz / 2) * sp + (rand() - 0.5) * 0.6;
      if (!free(x, z, 2) || rand() < 0.12) continue;
      P.push([rand() < 0.1 ? 'nopal' : 'maguey', x, z, ground.height(x, z), 0.55 + rand() * 0.6, yaw0 + rand() * 6.28, Math.floor(rand() * 3)]);
    }
  }
  // the lots without a compound: a hedge of nopal along two sides, rows of maguey with a path between
  for (const [x0, z0, x1, z1] of emptyLots()) {
    if (!free((x0 + x1) / 2, (z0 + z1) / 2, 0)) continue;
    for (let x = x0 + 1; x < x1 - 1; x += 2.6) for (const z of [z0 + 0.6, z1 - 0.6]) if (rand() < 0.8) P.push(['nopal', x + (rand() - 0.5) * 0.4, z, 0, 0.7 + rand() * 0.4, rand() * 6.28, Math.floor(rand() * 3)]);
    for (let z = z0 + 4; z < z1 - 3; z += 3.2) { if (Math.abs(z - (z0 + z1) / 2) < 2) continue; for (let x = x0 + 3; x < x1 - 2; x += 3) if (rand() < 0.85) P.push(['maguey', x + (rand() - 0.5) * 0.5, z + (rand() - 0.5) * 0.4, 0, 0.8 + rand() * 0.55, rand() * 6.28, Math.floor(rand() * 3)]); }
  }
  for (const p of P) if (p[3] === 0) p[3] = ground.height(p[1], p[2]);
  return P;
}
export async function town() {
  const all = compounds(), plans = [];
  for (let i = 0; i < all.length; i += 40) plans.push(base(`teotihuacan-compounds-${i / 40}`, all.slice(i, i + 40).map((c) => ({ t: 'compound', ...c }))));
  // the Great Compound's market and its central platform with a small temple
  plans.push(base('teotihuacan-market', [{ t: 'tt_market', rect: MARKET, seed: 450, hole: MARKET_PLATFORM },
    { t: 'tt_pyramid', c: [(MARKET_PLATFORM[0] + MARKET_PLATFORM[2]) / 2, (MARKET_PLATFORM[1] + MARKET_PLATFORM[3]) / 2], y: 0.04, w: 24, d: 24, tw: 14, td: 14, h: 3.6, levels: 2, tablero: 0.5, stair: 'n', stairW: 5, talud: 'stucco_red', temple: { w: 6, d: 6, h: 3 } }]));
  plans.push(base('teotihuacan-plants', [{ t: 'meso_plants', plants: plants() }]));
  return plans;
}

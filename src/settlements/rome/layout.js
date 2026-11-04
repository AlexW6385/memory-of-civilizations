// Rome under Hadrian, about AD 128 — the layout (docs/settlements/rome.md §2): the Campus Martius.
// The Pantheon in the middle facing north over its colonnaded forecourt; the Baths of Agrippa
// behind it to the south; the Saepta Julia's long porticoed enclosure to the east, the Via Lata
// beyond; the Stadium of Domitian to the west; the Tiber's bend at the west edge; insulae in the
// blocks between. Pure data. +x east, +z south.

export const RADIUS = 420;
export const PANTHEON = [-48, -165, 48, 32];                  // the plan's bounds (rotunda at the origin, forecourt north)
export const BATHS = [-70, 48, 70, 150];
export const SAEPTA = [78, -230, 138, 90];
export const STADIUM = [-290, -175, -184, 100];
export const VIA_LATA = { x: 175, w: 10 };
export const TIBER = { x: -370, w: 46, level: -5 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const riverX = (z) => TIBER.x + 28 * Math.sin(z / 120);
export const inRiver = (x, z) => Math.abs(x - riverX(z)) < TIBER.w / 2 - 3 && Math.hypot(x, z) < RADIUS - 30;
export function height(x, z) {
  const d = Math.abs(x - riverX(z)), edge = smooth(RADIUS - 70, RADIUS - 25, Math.hypot(x, z));
  const bed = (TIBER.level - 3) * smooth(TIBER.w / 2 + 6, TIBER.w / 2 - 4, d) * (1 - edge);
  return bed;
}
export const onStreet = (x, z, m = 0) => Math.abs(x - VIA_LATA.x) < VIA_LATA.w / 2 + m || (Math.abs(z + 175) < 5 + m && x > -184 && x < 175) || (Math.abs(z - 165) < 5 + m && x > -184);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Insulae in blocks between the streets. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(128);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 26) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 24) {
    const w = 18 + rand() * 5, d = 16 + rand() * 5, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || [PANTHEON, BATHS, SAEPTA, STADIUM].some((r) => inRect(r, cx, cz, 18)) || onStreet(cx, cz, 14)) continue;
    if (Math.abs(cx - riverX(cz)) < TIBER.w / 2 + 22 || rand() < 0.12) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

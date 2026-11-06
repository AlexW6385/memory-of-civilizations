// Ottoman Istanbul about 1560 — the layout (docs/settlements/ottoman-istanbul.md §2): the
// Süleymaniye on the crown of the third hill, its terrace looking north over the Golden Horn; the
// mosque in its outer court, the madrasas east and west, the soup kitchen and hospital to the
// north-west, Süleyman's tomb behind the qibla wall; timber houses down the slopes. Pure data.
// +x east, +z south (the qibla toward +z).

export const RADIUS = 400;
export const TOP = 22;
export const MOSQUE = { c: [0, 20], d: 26.5, h: 53 };
export const PRECINCT = [-75, -95, 75, 90];
// the külliye round the precinct (docs/settlements/ottoman-istanbul.md §4.4–§4.9), on the real plan turned so
// that the qibla is +z: the medreses Sani and Evvel west of the mosque, Salis and Rabi east (on the side
// toward the Horn), each 11 modules of 4.2 m square; the vaulted shops before them along the avenues; the
// hospital at the north-west corner, the soup kitchen at the north-east; the bath and the dar'ül-hadis at
// the south-east end
const MW = 11 * 4.2;
export const MEDRESES = [
  { id: 'sani', rect: [-95.8 - MW, -56, -95.8, -56 + MW], out: 'w' },
  { id: 'evvel', rect: [-95.8 - MW, -6.8, -95.8, -6.8 + MW], out: 'w' },
  { id: 'salis', rect: [95.8, -56, 95.8 + MW, -56 + MW], out: 'e' },
  { id: 'rabi', rect: [95.8, -6.8, 95.8 + MW, -6.8 + MW], out: 'e' },
];
export const ARASTA = { w: -95.8, e: 95.8, z0: -56, z1: -6.8 + MW, d: 4.4 };
export const DARUSSIFA = [-96 - 12 * 4.4, -107, -96, -107 + 10 * 4.4];
export const IMARET = [100, -107, 100 + 10 * 4.4, -107 + 10 * 4.4];
export const HAMAM = [98, 58, 141.6, 74];
export const DARULHADIS = { at: [72, 92], m: 4.0 };
/** The footprints of the külliye's buildings (no trees or houses there). */
export const KULLIYE_RECTS = [
  ...MEDRESES.map((q) => q.out === 'w' ? [q.rect[0] - 4.4, q.rect[1], q.rect[2] + ARASTA.d + 1.5, q.rect[3]] : [q.rect[0] - ARASTA.d - 1.5, q.rect[1], q.rect[2] + 4.4, q.rect[3]]),
  DARUSSIFA, IMARET, [HAMAM[0] - 1, HAMAM[1], HAMAM[2] + 3.5, HAMAM[3]], [DARULHADIS.at[0] - 1, DARULHADIS.at[1] - 1, DARULHADIS.at[0] + 21 * 4 + 0.5, DARULHADIS.at[1] + 16.5],
];
export const inKulliye = (x, z, m = 0) => KULLIYE_RECTS.some((r) => inRect(r, x, z, m));
export const TERRACE = [-160, -110, 160, 110];
// behind the qibla wall: Hürrem Sultan's tomb (1558) in the burial garden; Süleyman's own (1566) is not yet built
export const TOMB = { c: [22, 68], r: 4.4 };
export const CEMETERY = [-62, 54, 64, 86];
/** The graves of the burial garden in 1560 — still few [inferred] — and its rose bushes. */
export const GRAVES = [[-40, 60, 'man'], [-36.5, 60, 'woman'], [-28, 63.5, 'man'], [-44, 70, 'man'], [-31, 72, 'woman'], [-18, 76, 'man'], [-48, 79, 'woman'], [-26, 81, 'man'], [40, 62, 'man'], [44, 74, 'woman'], [50, 80, 'man'], [6, 82, 'man']].map(([x, z, kind]) => ({ at: [x, z], len: kind === 'man' ? 2.1 : 1.9, yaw: 0, kind }));
export const ROSES = [[-34, 66], [-22, 69], [-39, 75], [-12, 63], [-6, 72], [-30, 84], [-52, 66], [8, 62], [10, 74], [34, 70], [37, 81], [56, 68], [-14, 84], [28, 84]];
export const inCemetery = (x, z) => inRect(CEMETERY, x, z);
export const nearGrave = (x, z, m) => Math.hypot(x - TOMB.c[0], z - TOMB.c[1]) < TOMB.r + 2.6 + m || GRAVES.some((g) => Math.abs(x - g.at[0]) < 1.4 + m && Math.abs(z - g.at[1]) < 0.8 + m) || ROSES.some(([a, b]) => Math.hypot(x - a, z - b) < 0.8 + m);
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** The hill: level on its crown (the terrace), falling to the north toward the Golden Horn and on all sides to the rim. */
export function height(x, z) {
  const dx = Math.max(Math.abs(x) - 160, 0), dz = z < 0 ? Math.max(-z - 110, 0) * 1.4 : Math.max(z - 110, 0);
  const d = Math.hypot(dx, dz);
  return TOP * smooth(240, 0, d) * (1 - smooth(RADIUS - 40, RADIUS - 5, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Timber houses on the slopes. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1560);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 13) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 12) {
    const w = 8 + rand() * 3, d = 8 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || inRect(TERRACE, cx, cz, 10) || rand() < 0.3) continue;
    const ys = [[x, z], [x + w, z], [x, z + d], [x + w, z + d]].map(([a, b]) => height(a, b));
    if (Math.max(...ys) - Math.min(...ys) > 3) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: Math.max(...ys), foot: Math.min(...ys), storeys: rand() < 0.6 ? 2 : 3, front: rand() < 0.5 ? 'n' : 's', plaster: rand() < 0.5 });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

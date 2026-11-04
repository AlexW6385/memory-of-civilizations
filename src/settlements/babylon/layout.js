// Babylon about 570 BC — the layout (docs/settlements/babylon.md §2): the inner city of
// Nebuchadnezzar II. The Processional Way runs south from the Ishtar Gate in the double northern
// wall, between glazed walls, past the Southern Palace on its west, to the precinct of Etemenanki —
// the great ziggurat — with Esagila, Marduk's temple, south of it; the Euphrates flows past on the
// west; houses fill the blocks. Compressed (the inner city is about 2.5 km across). Pure data.
// +x east, +z south.

export const RADIUS = 420;
export const WAY = { x: -40, z0: -380, z1: -60, w: 20 };
export const GATE = { c: [-40, -300] };
export const WALL_Z = -300;
export const PALACE = [-200, -290, -70, -170];
export const PRECINCT = [-110, -60, 110, 150];
export const ZIGGURAT = { c: [0, 40] };
export const ESAGILA = [-50, 175, 50, 260];
export const RIVER = { x: -290, w: 70, level: -3, bed: -6 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const riverX = (z) => RIVER.x + 18 * Math.sin(z / 140);
export const inRiver = (x, z) => Math.abs(x - riverX(z)) < RIVER.w / 2 - 3 && Math.hypot(x, z) < RADIUS - 60;
export function height(x, z) {
  const d = Math.abs(x - riverX(z)), edge = smooth(RADIUS - 70, RADIUS - 40, Math.hypot(x, z));
  return RIVER.bed * smooth(RIVER.w / 2 + 8, RIVER.w / 2 - 6, d) * (1 - edge);
}
export const onWay = (x, z, m = 0) => Math.abs(x - WAY.x) < WAY.w / 2 + m && z > WAY.z0 && z < WAY.z1;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(570);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 15) for (let z = WALL_Z + 30; z < RADIUS - 20; z += 14) {
    const w = 10 + rand() * 4, d = 10 + rand() * 3, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || [PALACE, PRECINCT, ESAGILA].some((r) => inRect(r, cx, cz, 14)) || onWay(cx, cz, 10) || Math.abs(cx - riverX(cz)) < RIVER.w / 2 + 16 || Math.abs(cz - 300) < 6 || rand() < 0.15) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

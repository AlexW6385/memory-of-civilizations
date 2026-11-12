// Karakorum — the ground (docs/settlements/mongol-karakorum.md §7): the broad floor of the Orkhon valley, short steppe grass on gravelly soil, the street dust of the town,
// millet fields outside the east gate; willows and poplars at the wells; a continental sky, dry and windy.
import { RADIUS, WALL, GATES, CAMPS, MAIN, CROSS, inTown, inBuilt, inPalace, height, smooth as sm, inRect, PALACE, GREAT_RECT, WELLS, COURTS } from './layout.js';

function cover(x, z) {
  const c = { sand: 0.25, grass: 0.35, rock: 0.05, soil: 0.45, fields: 0, dry: 0.75, warmth: 0.6, red: 0.1, road: 0, snow: 0, forest: 0 };
  if (inTown(x, z, -2)) {
    c.road = 0.55; c.grass = 0.05; c.dry = 0.4; c.soil = 0.7;
    if (Math.abs(z - MAIN.z) < MAIN.w / 2 + 1 || Math.abs(x - CROSS.x) < CROSS.w / 2 + 1) c.road = 1.0;
    if (inPalace(x, z)) {
      // the court: the trodden axis from the gate to the hall's steps, the margins scuffed and patched with dry grass and dung, the foot of the walls and storehouses grassy
      const n = Math.sin(x * 0.91 + z * 0.37) * Math.sin(z * 1.13 - x * 0.29), axis = Math.abs(x - 70) < 5.2 && z > -44;
      c.road = axis ? 0.95 : 0.55 + 0.25 * n; c.soil = 0.6 + 0.2 * n; c.grass = axis ? 0 : 0.12 + 0.12 * Math.max(0, -n); c.dry = 0.55;
      if (!axis && (x < PALACE[0] + 3 || x > PALACE[2] - 3 || z < PALACE[1] + 3)) { c.grass += 0.15; c.road -= 0.2; }
    }
    return c;
  }
  if (x > WALL[2] + 6 && x < RADIUS - 14 && Math.abs(z) < 70 && Math.hypot(x, z) < RADIUS - 24) { c.fields = 0.6; c.grass = 0.2; return c; }      // the millet at the east gate
  // the roads out of the four gates
  for (const [gx, gz] of Object.values(GATES)) { if (Math.hypot(x - gx, z - gz) < 70 && (Math.abs(x - gx) < 6 || Math.abs(z - gz) < 6)) { c.road = 0.6; c.grass = 0.1; } }
  return c;
}
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6) return null;
  // inside the town: a poplar or two and dry grass in the courts of the houses (clear of the gate's way and the walls), willows round the wells
  if (inTown(x, z, -1)) {
    for (const [wx, wz] of WELLS) { const d = Math.hypot(x - wx, z - wz); if (d > 2.2 && d < 5.2) return { willow: 1.6, grass_dry: 4 }; }
    for (const c of COURTS) if (inRect(c.rect, x, z) && Math.abs((x - c.gu)) > 2.6) return { poplar: 0.55, grass_dry: 2 };
    if (inRect([14, -36, 46, -14], x, z)) return { poplar: 0.3, grass_dry: 3 };      // the palace's western court
    // the palace court's margins: poplars along the walls' feet, tufts of dry grass in the corners (clear of the buildings, the gers, the axis)
    if (inPalace(x, z, -1) && !inBuilt(x, z, 2) && Math.abs(x - 70) > 9 && Math.hypot(x - 104, z + 24) > 8 && Math.hypot(x - 36, z + 26) > 6 && (x < PALACE[0] + 7 || x > PALACE[2] - 7 || z < PALACE[1] + 7)) return { poplar: 0.14, grass_dry: 3 };
    return null;
  }
  if (inBuilt(x, z, 2) || (x > WALL[2] && x < WALL[2] + 8 && Math.abs(z) < 14) || Math.abs(x) < 10 && r < 140) return null;
  // the court's ger camps and the markets' pens are kept bare: no plants among the gers
  for (const c of [CAMPS.sw, CAMPS.se]) if (x > c[0] - 36 && x < c[0] + 36 && z > c[1] - 28 && z < c[1] + 32) return null;
  if (z > 104 && z < 150 && Math.abs(x) < 110) return { grass_dry: 14, halfa: 1.5 };
  if (x > WALL[2] + 6 && Math.abs(z) < 70) return { wheat: 20, grass_dry: 6 };
  // the steppe: short dry grass, tufts of feather grass (halfa stands in), a few low shrubs (tamarisk for the saxaul and sagebrush)
  return { grass_dry: 18, halfa: 2.5, tamarisk: 0.12, grass: 8 };
}
export const ground = {
  height,
  cover,
  water: () => false,
  waterLevel: () => -Infinity,
  fromWater: () => 999,
  planting,
  maxDensity: { poplar: 0.55, willow: 1.6, tamarisk: 0.12, halfa: 2.5, grass_dry: 18 },
  climate: {
    sun: { az: 160, el: 38, color: [1.0, 0.96, 0.88], intensity: 3.5, lat: 47.2, dec: 5, hour: 11 },
    sky: { turbidity: 1.8, rayleigh: 1.1, mie: 0.003, mieG: 0.8, zenith: [0.07, 0.15, 0.42], horizon: [0.62, 0.68, 0.76] },
    fog: { color: [0.78, 0.8, 0.84], density: 0.00025, height: 0.01 },
    exposure: 0.5,
    wind: [1.0, 0.25],
    damp: 0.05,
    weather: [
      { id: 'clear', weight: 5, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'steppe-cloud', weight: 2, clouds: 0.5, cloudDensity: 0.55, sun: 0.85, fog: 1.1 },
    ],
  },
};
void sm; void inRect; void PALACE; void GREAT_RECT;

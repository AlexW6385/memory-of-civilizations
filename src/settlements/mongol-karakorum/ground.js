// Karakorum — the ground (docs/settlements/mongol-karakorum.md §7): the broad floor of the Orkhon valley, short steppe grass on gravelly soil, the street dust of the town,
// millet fields outside the east gate; willows and poplars at the wells; a continental sky, dry and windy.
import { RADIUS, WALL, GATES, MAIN, CROSS, inTown, inBuilt, inPalace, height, smooth as sm, inRect, PALACE, GREAT_RECT } from './layout.js';

function cover(x, z) {
  const c = { sand: 0.25, grass: 0.35, rock: 0.05, soil: 0.45, fields: 0, dry: 0.75, warmth: 0.6, red: 0.1, road: 0, snow: 0, forest: 0 };
  if (inTown(x, z, -2)) {
    c.road = 0.55; c.grass = 0.05; c.dry = 0.4; c.soil = 0.7;
    if (Math.abs(z - MAIN.z) < MAIN.w / 2 + 1 || Math.abs(x - CROSS.x) < CROSS.w / 2 + 1) c.road = 1.0;
    if (inPalace(x, z)) { c.road = 0.85; }
    return c;
  }
  if (x > WALL[2] + 6 && x < RADIUS - 14 && Math.abs(z) < 70 && Math.hypot(x, z) < RADIUS - 24) { c.fields = 0.6; c.grass = 0.2; return c; }      // the millet at the east gate
  // the roads out of the four gates
  for (const [gx, gz] of Object.values(GATES)) { if (Math.hypot(x - gx, z - gz) < 70 && (Math.abs(x - gx) < 6 || Math.abs(z - gz) < 6)) { c.road = 0.6; c.grass = 0.1; } }
  return c;
}
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || inTown(x, z, -1) || inBuilt(x, z, 2) || (x > WALL[2] && x < WALL[2] + 8 && Math.abs(z) < 14) || Math.abs(x) < 10 && r < 140) return null;
  // the court's ger camps and the markets' pens are kept bare of anything tall
  if (z > 104 && z < 150 && Math.abs(x) < 110) return { grass_dry: 14 };
  if (x > WALL[2] + 6 && Math.abs(z) < 70) return { wheat: 20, grass_dry: 6 };
  return { grass_dry: 18, maquis: 0.25, grass: 8 };
}
export const ground = {
  height,
  cover,
  water: () => false,
  waterLevel: () => -Infinity,
  fromWater: () => 999,
  planting,
  maxDensity: { maquis: 0.25 },
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

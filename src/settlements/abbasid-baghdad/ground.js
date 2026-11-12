// Abbasid Baghdad — the ground (docs/settlements/abbasid-baghdad.md §10): the flat alluvial plain, beaten earth and brick paving in the
// streets and on the esplanade; the Tigris in its trench with the Isa canal and the moat as water; date palms and tamarisk on the
// banks, orchards and fields beyond the walls; the hot, dusty sky of the middle Tigris.

import { RADIUS, RC, C, RIVER, CANAL, WATER, PALACE, MOSQUE, LIBRARY, SERVICE, AVENUES, ROADS_IN, ROADS_OUT, SUQS, ALL_SUQS, SHOP, riverX, canalEnd, inRiver, inCanal, inMoat, onCauseway, inLot, inRect, rad, smooth as sm } from './layout.js';

const BUILT = [PALACE, MOSQUE, LIBRARY, SHOP, ...SERVICE.map((s) => s.rect), ...ALL_SUQS.map((s) => s.rect)];
const PAVED = [...AVENUES, ...ROADS_IN, ...ROADS_OUT, ...ALL_SUQS.map((s) => s.rect)];

function height(x, z) {
  const r0 = Math.hypot(x, z);
  if (r0 > RADIUS) return 0;
  let h = 0;
  const dr = Math.abs(x - riverX(z));
  h = Math.min(h, RIVER.bed * sm(RIVER.w / 2, RIVER.w / 2 - 6, dr));
  if (x > CANAL.x0 - 4 && x < canalEnd() + 4) h = Math.min(h, CANAL.bed * sm(CANAL.w / 2, CANAL.w / 2 - 2.5, Math.abs(z - CANAL.z)) * sm(CANAL.x0 - 4, CANAL.x0 + 4, x));
  const q = rad(x, z);
  if (q > RC.outer + 1.5 && q < RC.moat1 + 4) {
    const cw = 1 - sm(8, 12, Math.min(Math.abs(x - C[0]), Math.abs(z - C[1])));
    h = Math.min(h, RC.moatBed * sm(RC.outer + 1.5, RC.moat0 + 0.2, q) * (1 - sm(RC.moat1 - 2, RC.moat1 + 4, q)) * (1 - cw));
  }
  return h * (1 - sm(RADIUS - 30, RADIUS, r0));
}
const anyRect = (list, x, z, m = 0) => list.some((r) => inRect(r, x, z, m));
function cover(x, z) {
  const c = { sand: 0.4, grass: 0.05, rock: 0, soil: 0.5, fields: 0, dry: 0.8, warmth: 0.85, red: 0.05, road: 0, snow: 0, forest: 0 };
  const q = rad(x, z);
  if (inRiver(x, z) || inCanal(x, z, 1)) { c.sand = 0.2; c.soil = 0.8; return c; }
  if (anyRect([PALACE, MOSQUE, LIBRARY, SHOP], x, z)) { c.road = 1; c.sand = 0; c.soil = 0; return c; }
  if (anyRect(PAVED, x, z, 0.5)) { c.road = 0.9; c.sand = 0.1; c.soil = 0.1; return c; }
  if (q < RC.outer - 2) { c.road = inLot(x, z, 0.2) ? 0 : 0.75; c.sand = 0.25; c.soil = 0.25; return c; }                 // the Round City: the lanes and the esplanade, packed earth
  if (q < RC.moat1 + 6) { c.sand = 0.45; c.soil = 0.45; c.dry = 0.9; return c; }
  if (Math.abs(z - CANAL.z) < 16 && x > CANAL.x0 && x < canalEnd()) { c.road = 0.7; return c; }                           // the canal's quay streets
  if (z > 313 && z < 500 && Math.abs(x) < 340 && !inLot(x, z, 0.2)) { c.road = 0.7; c.sand = 0.2; c.soil = 0.2; return c; }  // Karkh's lanes
  if (!inLot(x, z, 0.2) && Math.hypot(x, z) < RADIUS - 40 && (inRect([214, -200, 270, 160], x, z) || (x > riverX(z) + 50 && x < 470 && z > -220 && z < 200))) { c.road = 0.6; c.sand = 0.25; return c; }
  if (inLot(x, z, 0.2)) { c.road = 0; return c; }
  const d = Math.abs(x - riverX(z)) - RIVER.w / 2;
  if (d < 40) { c.fields = 0.3; c.grass = 0.3; c.soil = 0.6; c.sand = 0.1; return c; }
  c.fields = 0.35; c.grass = 0.1; return c;
}
const water = (x, z, y) => ((inRiver(x, z) && y < WATER + 0.3) || (inCanal(x, z) && y < CANAL.water + 0.3) || (inMoat(x, z) && y < RC.moatY + 0.3));
const waterLevel = (x, z) => (inRiver(x, z) ? WATER : inCanal(x, z) ? CANAL.water : inMoat(x, z) ? RC.moatY : -Infinity);
const fromWater = (x, z) => Math.max(0, Math.min(Math.abs(x - riverX(z)) - RIVER.w / 2, Math.abs(Math.abs(z - CANAL.z) - CANAL.w / 2), Math.abs(rad(x, z) - (RC.moat0 + RC.moat1) / 2) - 7));
/** Plants per 100 m²: reeds and tamarisk at the water, date palms and fig along the banks and in the orchards beyond the walls, nothing in the city but the courts. */
function planting(x, z) {
  const r0 = Math.hypot(x, z), q = rad(x, z);
  if (q < RC.inner - 6) {                                   // the esplanade: palms in rows along the four roads, gardens of palm and fig in the quarters
    if (anyRect([PALACE, MOSQUE, LIBRARY, ...SERVICE.map((v) => v.rect)], x, z, 5) || anyRect(PAVED, x, z, 1) || inLot(x, z, 3)) return null;
    const dx = Math.abs(x - C[0]), dz = Math.abs(z - C[1]);
    if (((dx > 8.5 && dx < 12 && dz > 58) || (dz > 8.5 && dz < 12 && dx > 58)) && q > 58) return { date_palm: 2.6 };
    if (dx > 60 && dz > 60 && q < RC.inner - 12) return { date_palm: 0.16, fig: 0.12, tamarisk: 0.04, grass_dry: 3 };
    return null;
  }
  if (r0 > RADIUS - 6 || inRiver(x, z) || inCanal(x, z, 1.5) || inMoat(x, z) || q < RC.moat1 + 6) return null;
  if (inLot(x, z, 1.5) || anyRect(PAVED, x, z, 3) || anyRect(BUILT, x, z, 3)) return null;
  const d = Math.abs(x - riverX(z)) - RIVER.w / 2;
  if (d < 3) return { reeds: 5, tamarisk: 0.3 };
  if (d < 26 && z < 290 && z > -330) return { date_palm: 1.3, tamarisk: 0.4, grass_dry: 8 };
  if (z > 313 && Math.abs(x) < 340 && r0 < 500) return { date_palm: 0.12 };                       // Karkh: a palm in a court
  if (x > riverX(z) + 50) return { date_palm: 0.9, fig: 0.3, mulberry: 0.15, grass_dry: 8 };         // the east bank's groves
  if (q < RC.moat1 + 30) return { tamarisk: 0.3, grass_dry: 10 };
  return { date_palm: 0.35, fig: 0.1, grass_dry: 10 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  sea: WATER,
  maxDensity: { date_palm: 2.6, tamarisk: 0.4, reeds: 5, fig: 0.3, mulberry: 0.15 },
  climate: {
    sun: { az: 150, el: 58, color: [1.0, 0.95, 0.85], intensity: 3.6, lat: 33, dec: 10, hour: 10 },
    sky: { turbidity: 4.8, rayleigh: 1.1, mie: 0.008, mieG: 0.8, zenith: [0.11, 0.18, 0.34], horizon: [0.72, 0.68, 0.6] },
    fog: { color: [0.82, 0.77, 0.68], density: 0.0006, height: 0.012 },
    exposure: 0.48,
    damp: 0.06,           // the desert city: no moss or rain streaks; the river's damp stains the walls at the water
    waterline: WATER,
    wind: [0.5, 0.2],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.06, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'dust-haze', weight: 2, clouds: 0.1, cloudDensity: 0.3, sun: 0.75, fog: 3, fogColor: [0.84, 0.74, 0.6] },
    ],
  },
};
void onCauseway;

// Bhaktapur — the ground: brick-paved squares and streets over level ground, the potters' earth, terraced
// rice fields beyond the town rising to the rim (docs/settlements/bhaktapur.md §5); pipals and bamboo in the courts, pine
// on the rim; the clear, hazy light of the valley in the cool dry season, the monsoon's damp on the brick.

import { RADIUS, HOUSE_R, SQ, POT, KEEP, height, inLot, onStreet, inRect, lots } from './layout.js';

function cover(x, z) {
  const r = Math.hypot(x, z);
  const c = { sand: 0.1, grass: 0.35, rock: 0, soil: 0.45, fields: 0, dry: 0.35, warmth: 0.6, red: 0.35, road: 0, snow: 0, forest: 0 };
  if (inRect(SQ, x, z) || inRect(POT, x, z, 0)) { c.road = inRect(POT, x, z) ? 0.2 : 0.6; if (inRect(POT, x, z)) { c.soil = 0.9; c.grass = 0; c.dry = 0.8; } return c; }
  if (r > HOUSE_R + 4) { c.fields = 0.75; c.grass = 0.3; c.soil = 0.3; return c; }
  if (onStreet(x, z, 0.5)) { c.road = 0.5; return c; }
  return c;
}
const water = () => false;
const waterLevel = () => -Infinity;
const fromWater = () => 40;
/** Plants per 100 m²: pipal and bamboo in the courts behind the houses, none on the paving, the houses or the temples' ground; grass and pine on the rim. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || inRect(SQ, x, z, 1) || inRect(POT, x, z, 1) || onStreet(x, z, 1) || KEEP.some((k) => inRect(k, x, z, 2))) return null;
  if (r > HOUSE_R + 4) return { grass: 30, pine: r > RADIUS - 40 ? 0.05 : 0 };
  if (inLot(x, z, 1.2)) return null;
  return { bamboo: 0.12, fig: 0.025, grass: 22 };
}
void lots;
export const ground = { lift: 15,   // the disc stands 15 m above the valley floor at its centre, so the rim meets the rising country without a step
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { bamboo: 0.12, fig: 0.025, pine: 0.05 },
  climate: {
    sun: { az: 150, el: 50, color: [1.0, 0.95, 0.86], intensity: 3.4, lat: 27.7, dec: 5, hour: 9.5 },
    sky: { turbidity: 3.4, rayleigh: 1.2, mie: 0.005, mieG: 0.8, zenith: [0.09, 0.17, 0.38], horizon: [0.66, 0.66, 0.64] },
    fog: { color: [0.78, 0.78, 0.76], density: 0.0004, height: 0.012 },
    exposure: 0.5,
    damp: 0.6,       // the monsoon streaks the brick dark and greens its shaded foot
    wind: [0.3, 0.1],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.2, cloudDensity: 0.4, sun: 1.0, fog: 1.1 },
      { id: 'monsoon-cloud', weight: 1.5, clouds: 0.7, cloudDensity: 0.7, sun: 0.7, fog: 1.4 },
    ],
  },
};

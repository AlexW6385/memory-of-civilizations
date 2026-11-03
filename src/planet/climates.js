// The skies of the open country (DESIGN §4.3): temperate, dry, tropical and cold, blended by the
// place's moisture and warmth (src/planet/land.js). Each settlement has its own sky in its zone
// (its region's climate); beyond, these take over.

import { CITY } from '../world/regions.js';

const base = CITY.climate;
const sun = (color, intensity) => ({ ...base.sun, color, intensity });

export const OPEN_CLIMATES = {
  temperate: { id: 'open-temperate', climate: base },
  dry: {
    id: 'open-dry',
    climate: {
      ...base,
      sun: sun([1.0, 0.86, 0.68], 3.4),
      sky: { turbidity: 4.0, rayleigh: 1.4, mie: 0.0046, mieG: 0.82, zenith: [0.1, 0.14, 0.22], horizon: [0.33, 0.29, 0.23] },
      fog: { color: [0.64, 0.57, 0.46], density: 0.0005, height: 0.01 },
      exposure: 0.54,
      weather: [
        { id: 'clear', weight: 5, clouds: 0.04, cloudDensity: 0.3, sun: 1.0, fog: 1.0 },
        { id: 'high-cloud', weight: 2, clouds: 0.22, cloudDensity: 0.25, sun: 0.94, fog: 1.0 },
        { id: 'dust', weight: 2, clouds: 0.1, cloudDensity: 0.3, sun: 0.65, fog: 4, fogColor: [0.68, 0.55, 0.4] },
      ],
    },
  },
  tropical: {
    id: 'open-tropical',
    climate: {
      ...base,
      sun: sun([1.0, 0.93, 0.82], 3.3),
      sky: { turbidity: 4.4, rayleigh: 1.3, mie: 0.0055, mieG: 0.8, zenith: [0.1, 0.15, 0.27], horizon: [0.32, 0.33, 0.33] },
      fog: { color: [0.62, 0.66, 0.66], density: 0.0007, height: 0.012 },
      exposure: 0.58,
      weather: [
        { id: 'fair', weight: 3, clouds: 0.45, cloudDensity: 0.55, sun: 1.0, fog: 1.2 },
        { id: 'cloudy', weight: 2.5, clouds: 0.7, cloudDensity: 0.65, sun: 0.72, fog: 1.5 },
        { id: 'downpour', weight: 1.5, clouds: 0.96, cloudDensity: 0.9, sun: 0.28, fog: 2.6, rain: 1 },
        { id: 'steam', weight: 1, clouds: 0.5, cloudDensity: 0.45, sun: 0.65, fog: 4, fogColor: [0.72, 0.75, 0.74] },
      ],
    },
  },
  cold: {
    id: 'open-cold',
    climate: {
      ...base,
      sun: sun([1.0, 0.9, 0.8], 3.0),
      sky: { turbidity: 2.6, rayleigh: 1.1, mie: 0.004, mieG: 0.8, zenith: [0.1, 0.15, 0.3], horizon: [0.3, 0.32, 0.35] },
      fog: { color: [0.66, 0.7, 0.75], density: 0.0006, height: 0.012 },
      exposure: 0.5,
      weather: [
        { id: 'clear', weight: 3, clouds: 0.15, cloudDensity: 0.35, sun: 1.0, fog: 1.0 },
        { id: 'overcast', weight: 3, clouds: 0.9, cloudDensity: 0.75, sun: 0.4, fog: 1.8 },
        { id: 'snow-mist', weight: 1.5, clouds: 0.8, cloudDensity: 0.7, sun: 0.45, fog: 3.5, fogColor: [0.78, 0.8, 0.84] },
      ],
    },
  },
};

const sm = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/** The open country's skies at a place, weighted: climate = [mountain, moisture, warmth]. */
export function openClimate([, moist, warm]) {
  const dry = sm(0.36, 0.16, moist) * sm(0.3, 0.5, warm);
  const tropical = sm(0.55, 0.78, moist) * sm(0.72, 0.9, warm) * (1 - dry);
  const cold = sm(0.36, 0.16, warm) * (1 - dry - tropical);
  const temperate = Math.max(0, 1 - dry - tropical - cold);
  return [
    { zone: OPEN_CLIMATES.temperate, w: temperate }, { zone: OPEN_CLIMATES.dry, w: dry },
    { zone: OPEN_CLIMATES.tropical, w: tropical }, { zone: OPEN_CLIMATES.cold, w: cold },
  ].filter((z) => z.w > 1e-3);
}

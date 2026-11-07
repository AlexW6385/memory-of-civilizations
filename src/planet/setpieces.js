// The planet's weather set pieces and seasons (DESIGN §4.3, §11 Planet L3). Each settlement keeps
// its own weather cycle (its ground.js); here some places get their characteristic weather added
// or strengthened, so that it is seen often but not always: monsoon rain over Angkor, snow on
// Borgund, harmattan dust over Djenné, morning mist on West Lake, fog on the Thames, haze and the
// khamsin at Giza, morning mist in the Kedu plain and over the Urubamba. Sources: docs/world.md,
// "Weather".
//
// A weather state may carry, beyond the settlements' fields (clouds, cloudDensity, sun, fog, rain,
// windy, fogColor):
//   snow   0…1  falling snow (flakes round the viewer; the ground and roofs whiten while it falls)
//   dust   0…1  blowing dust (motes round the viewer, driven by the wind)
//   fall   ×    the haze's height falloff: > 1 keeps it low, lying on the ground and the water (mist)
//   hours  [h0, h1]  the local hours it favours (×3 within, ×0.2 outside; a morning mist burns off)
//   months [m…]  the months (1–12) it belongs to: ×1.5 in them, ×0.6 outside (never ruled out)
//
// Seasons: the sun keeps its fixed date (the equinox, §4.3), but the open country follows the
// calendar of the visit (or ?season=winter|spring|summer|autumn): the snow line comes down in a
// hemisphere's winter, the grass yellows and the broadleaf forest turns in autumn and stands bare
// in winter, by latitude (none in the tropics). The settlements' own ground keeps its chosen moment.

const query = () => (typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams());

/** Set pieces by settlement id: `add` states to its cycle, `tweak` existing ones by id. */
export const SET_PIECES = {
  // the south-west monsoon (May–October): a heavy downpour most days, about two hours round noon,
  // the sky clearing after
  angkor: {
    add: [
      { id: 'monsoon', weight: 2.4, clouds: 1, cloudDensity: 0.95, sun: 0.22, fog: 2.8, rain: 1.25, windy: 0.7, fall: 1.4,
        fogColor: [0.6, 0.64, 0.62], hours: [10, 16.5], months: [5, 6, 7, 8, 9, 10] },
    ],
  },
  // Lærdal in winter: snow falling on the valley, the mountains lost in it
  'norse-borgund': {
    add: [
      { id: 'snow', weight: 2.6, clouds: 0.9, cloudDensity: 0.8, sun: 0.42, fog: 3.0, snow: 1, windy: 0.2, fogColor: [0.8, 0.83, 0.88],
        months: [11, 12, 1, 2, 3, 4] },
    ],
  },
  // the harmattan (late November to mid-March): the sun a pale disc in an ochre haze for days
  djenne: {
    tweak: {
      harmattan: { fog: 2.4, sun: 0.66, dust: 0.45, windy: 0.5, fall: 1.3, fogColor: [0.82, 0.64, 0.42], months: [11, 12, 1, 2, 3] },
      dust: { fog: 6, sun: 0.4, dust: 1, windy: 0.9, fall: 1.5, clouds: 0.25, fogColor: [0.8, 0.56, 0.32], months: [12, 1, 2, 3] },
    },
  },
  // West Lake at dawn: mist lying on the water and wreathing the hills, burnt off by mid-morning
  'song-hangzhou': {
    add: [
      { id: 'lake-mist', weight: 2.2, clouds: 0.35, cloudDensity: 0.4, sun: 0.6, fog: 9, fall: 7, fogColor: [0.8, 0.82, 0.83], hours: [4.5, 9.5] },
    ],
    tweak: { 'river-mist': { hours: [4.5, 10] }, drizzle: { months: [3, 4, 5, 6] } },
  },
  // the London particular: a thick yellow-grey coal-smoke fog lying along the Thames, in winter
  london: {
    add: [
      { id: 'fog', weight: 2.2, clouds: 0.85, cloudDensity: 0.7, sun: 0.3, fog: 7, fall: 3.5, fogColor: [0.62, 0.58, 0.44],
        months: [10, 11, 12, 1, 2] },
    ],
  },
  // a summer haze over the plateau; the khamsin (March–May): hot sand-laden wind for a few hours
  giza: {
    tweak: {
      hazy: { weight: 2.5, dust: 0.12 },
      khamsin: { weight: 0.9, fog: 5, sun: 0.5, dust: 1, windy: 1, fall: 1.4, months: [3, 4, 5] },
    },
  },
  // the Kedu plain at sunrise: mist round the monument, the volcanoes standing above it
  borobudur: { tweak: { 'morning-mist': { fog: 6, fall: 4, hours: [4.5, 9] } } },
  // cloud rising out of the Urubamba gorge in the morning, round Huayna Picchu
  'machu-picchu': { tweak: { mist: { fall: 2.5, hours: [5, 11] } } },
  // a rising sun on the lagoon's mist; the snow of the Muscovite winter
  venice: { tweak: { mist: { fall: 4, fog: 4, hours: [5, 10], months: [10, 11, 12, 1, 2] } } },
  muscovy: {
    add: [
      { id: 'snow', weight: 1.6, clouds: 0.9, cloudDensity: 0.8, sun: 0.45, fog: 2.6, snow: 0.8, fogColor: [0.8, 0.82, 0.86], months: [11, 12, 1, 2, 3] },
    ],
  },
};

/** A climate with its set pieces merged into its weather (cached per climate object). */
const merged = new WeakMap();
export function withSetPieces(id, climate) {
  const P = SET_PIECES[id];
  if (!P || !climate?.weather) return climate;
  if (merged.has(climate)) return merged.get(climate);
  const weather = climate.weather.map((w) => (P.tweak?.[w.id] ? { ...w, ...P.tweak[w.id] } : w)).concat(P.add || []);
  const c = { ...climate, weather };
  merged.set(climate, c);
  return c;
}

/**
 * The season now: the month (1–12) of the visit, or as asked (?season=…), and two numbers for the
 * northern hemisphere (the southern has them negated): winter (1 in mid-January … −1 in mid-July)
 * and autumn (1 in mid-October … −1 in mid-April).
 */
export function seasonNow(date = new Date()) {
  const asked = { winter: 1, spring: 4, summer: 7, autumn: 10 }[query().get('season')];
  const doy = asked ? (asked - 1) * 30.4 + 15 : (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(date.getUTCFullYear(), 0, 0)) / 864e5;
  const th = 2 * Math.PI * (doy - 15) / 365.25;
  return { month: asked || date.getUTCMonth() + 1, winter: Math.cos(th), autumn: -Math.sin(th) };
}

/** A state's weight at a local hour and month. */
export function weightNow(w, hour, month) {
  let k = 1;
  if (w.hours) {
    const [a, b] = w.hours, h = ((hour % 24) + 24) % 24;
    k *= (a <= b ? h >= a && h <= b : h >= a || h <= b) ? 3 : 0.2;
  }
  if (w.months && month) {
    k *= w.months.includes(month) ? 1.5 : 0.6;
  }
  return w.weight * k;
}

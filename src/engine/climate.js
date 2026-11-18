// Climate, weather and the time of day on the planet (DESIGN §4.3). One sun: it stands over the
// latitude of its declination (from the date of the visit, see CAL) at the longitude where it is
// noon, and moves west as the day passes (a day lasts DAY_SECONDS) — so it is high at Sanchi and low
// at Paris, evening in Uji while morning in Athens. The moon keeps its own orbit and phase. The time is kept as the hour at the
// prime meridian; the clock shows (and sets) the hour where the visitor is. The sky, haze and
// weather are each settlement's own (its region's climate), blended out over its zone into the
// open country's. Drives the sun and moon light, the sky, the fog, cloud shadows, rain and
// wetness, the strength of the baked light, and gives the base exposure.

import { CITY, sunDirection, skyRadiance } from '../world/regions.js';
import { ENV } from './env.js';
import { unit } from '../planet/geo.js';
import { withSetPieces, seasonNow, weightNow } from '../planet/setpieces.js';

/**
 * The sky's calendar (DESIGN §4.3), fixed for the visit: the sun's place on the ecliptic from the
 * date of the visit (or ?season=), and the moon's phase from the same date (or ?moon=0…1, held:
 * 0 new, 0.25 first quarter, 0.5 full). The planet's axis is tilted TILT (two thirds of the Earth's
 * 23.44°: at the Earth's, Borgund at 66.6° would lie in polar night from November to January and
 * the winter noon sun over London would stand at 10°). The moon runs its own orbit, a synodic month
 * of 29.53 of the planet's days, so it rises later each day; the sun's date does not move.
 */
export const TILT = 16;
const SYNODIC = 29.530588853;
const CAL = (() => {
  const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
  const now = Date.now() / 864e5, d = now - 10957.5;                        // days since J2000
  const R = Math.PI / 180, S = seasonNow();
  // the sun's ecliptic longitude: the real one (mean anomaly and its two terms), or the asked season's
  const g = (357.529 + 0.98560028 * d) * R;
  const lam = q.get('season') ? 360 * (S.doy - 80) / 365.25 : 280.459 + 0.98564736 * d + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
  const mq = parseFloat(q.get('moon'));
  const phase = Number.isFinite(mq) ? ((mq % 1) + 1) % 1 : (((now - 10962.2597) / SYNODIC) % 1 + 1) % 1;   // a new moon: 2000-01-06 18:14 UTC
  return { lam, phase, held: Number.isFinite(mq), node: 125.04 - 0.052954 * d };
})();
/** Equatorial [dec, ra] (degrees) of an ecliptic longitude and latitude, on the planet's tilt. */
function equatorial(lam, beta = 0) {
  const R = Math.PI / 180, l = lam * R, b = beta * R, e = TILT * R;
  const x = Math.cos(b) * Math.cos(l), y = Math.cos(b) * Math.sin(l), z = Math.sin(b);
  const Y = y * Math.cos(e) - z * Math.sin(e), Z = y * Math.sin(e) + z * Math.cos(e);
  return [Math.asin(Z) / R, Math.atan2(Y, x) / R];
}
const SUN_EQ = equatorial(CAL.lam);
/** The sun's declination for the visit (degrees). */
export const SUN_DEC = SUN_EQ[0];
let moonDays = 0;                 // the planet's days run since the visit began (the moon's orbit)
/** The moon's phase now: 0 new … 0.5 full … 1. */
export function moonPhase() { return CAL.held ? CAL.phase : (CAL.phase + moonDays / SYNODIC) % 1; }
/** The moon's equatorial [dec, ra] now (degrees): on the ecliptic at its elongation, tilted 5.1° to it. */
function moonEq() {
  const lm = CAL.lam + 360 * moonPhase();
  return equatorial(lm, 5.14 * Math.sin((lm - CAL.node) * Math.PI / 180));
}
/** How far the stars have turned (degrees, about the pole): the celestial longitude of planet longitude 0. */
export function siderealOffset(utc) { return SUN_EQ[1] - (12 - utc) * 15; }
/** Direction toward the sun in planet coordinates at an hour of the prime meridian (and the moon's). */
export function sunPlanet(utc) { return unit(SUN_DEC, (12 - utc) * 15); }
export function moonPlanet(utc) { const [dec, ra] = moonEq(); return unit(dec, ra - siderealOffset(utc)); }

const params = new URLSearchParams(location.search);
let FORCE = params.get('weather');              // e.g. ?weather=shower (screenshots, tests)
/** Hold every region in one weather state by id (the tools' --weather), or null to let it run. */
export function forceWeather(id) { FORCE = id || null; }
const SEASON = seasonNow();
// A held weather (FORCE) holds every region, also one without a state of that id: there the state
// most like it stands in (for 'clear' the clearest; for a wet, snowy, dusty or misty id the one most so),
// so that ?weather=clear never lets a region wander into its fog or rain set piece.
const clearness = (w) => (w.clouds ?? 0) + Math.max(0, (w.fog ?? 1) - 1) / 3 + (w.rain ?? 0) + (w.snow ?? 0) + (w.dust ?? 0);
const LIKE = [[/rain|shower|monsoon|storm|drizzle/, (w) => w.rain ?? 0], [/snow|blizzard/, (w) => w.snow ?? 0],
  [/dust|harmattan|khamsin|sand/, (w) => w.dust ?? 0], [/fog|mist|haze|smoke/, (w) => w.fog ?? 1]];
/** The index of the held state in a region's states (S), or -1 when nothing is held. */
export function forcedIndex(S, id = FORCE) {
  if (!id || !S?.length) return -1;
  const i = S.findIndex((w) => w.id === id);
  if (i >= 0) return i;
  const like = LIKE.find(([re]) => re.test(id));
  let best = 0;
  for (let k = 1; k < S.length; k++) {
    if (like ? like[1](S[k]) > like[1](S[best]) : clearness(S[k]) < clearness(S[best])) best = k;
  }
  return best;
}
/** Length of a day in real seconds. */
export const DAY_SECONDS = 1800;
const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const MOON = [0.55, 0.64, 0.9];
/**
 * The level of a settlement's still water (its canals' or its pond's, in its own coordinates), for
 * the waterline stain on the walls standing in it (ENV.waterLine): a climate's own `waterline`
 * (src/settlements/<id>/ground.js).
 */

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const lerp = (a, b, t) => a + (b - a) * t;

/** The weather: a slow random walk through its states, each held for minutes. */
class RegionWeather {
  constructor(region, seed, hour = 12) {
    this.r = region; this.rand = rng(seed); this.hour = hour;
    const S = region.climate.weather;
    this.cur = this.pick(); this.next = this.cur; this.t = 1;
    if (FORCE) { const i = forcedIndex(S); if (i >= 0) { this.cur = this.next = i; } }
    this.hold = 120 + this.rand() * 240;
  }
  pick() {
    // (a state's weight follows the hour and the month: a morning mist, a winter fog, src/planet/setpieces.js)
    const S = this.r.climate.weather, W = S.map((w) => weightNow(w, this.hour, SEASON.month)), tot = W.reduce((s, w) => s + w, 0);
    let x = this.rand() * tot;
    for (let i = 0; i < S.length; i++) { x -= W[i]; if (x <= 0) return i; }
    return 0;
  }
  update(dt, hour) {
    if (hour !== undefined) this.hour = hour;
    if (FORCE) { const i = forcedIndex(this.r.climate.weather); if (i >= 0) this.cur = this.next = i, this.t = 1; return; }
    if (this.t < 1) { this.t = Math.min(1, this.t + dt / 75); if (this.t >= 1) this.cur = this.next; return; }
    this.hold -= dt;
    if (this.hold <= 0) { this.next = this.pick(); this.t = this.next === this.cur ? 1 : 0; this.hold = 150 + this.rand() * 330; }
  }
  /** Current blended state values. */
  get() {
    const S = this.r.climate.weather, a = S[this.cur], b = S[this.next], t = this.t < 1 ? this.t * this.t * (3 - 2 * this.t) : 1;
    // rain and snow are light: the falling itself at six tenths, and the haze that comes with it thin
    // enough that the town is still seen through it (a wet state's fog counts for a third of its excess)
    const soft = (w, k, d) => {
      const x = w[k] ?? d;
      if (k === 'rain' || k === 'snow') return x * 0.6;
      if (k === 'fog' && ((w.rain ?? 0) > 0 || (w.snow ?? 0) > 0)) return Math.min(1.45, 1 + (x - 1) * 0.35);
      return x;
    };
    const v = (k, d = 0) => lerp(soft(a, k, d), soft(b, k, d), this.cur === this.next ? 0 : t);
    const fc = a.fogColor || this.r.climate.fog.color, fd = b.fogColor || this.r.climate.fog.color;
    return {
      clouds: v('clouds'), cloudDensity: v('cloudDensity', 0.4), sun: v('sun', 1), fog: v('fog', 1), rain: v('rain'), windy: v('windy'),
      snow: v('snow'), dust: v('dust'), fall: v('fall', 1),
      fogColor: [0, 1, 2].map((i) => lerp(fc[i], fd[i], this.cur === this.next ? 0 : t)),
      id: this.t < 1 ? `${S[this.cur].id}→${S[this.next].id}` : S[this.cur].id,
    };
  }
}

export class Climate {
  constructor(renderer) {
    this.R = renderer;
    this.indoors = 0;              // 0 outdoors … 1 under a roof (set by the frame loop)
    this.weathers = new Map();
    this.hemis = new Map();
    this.state = null;
    this.wet = 0;
    this.snowCover = 0;            // snow lying on the ground and roofs: grows while it snows, melts after
    this.forced = null;
    // the time: 'cycle' (days pass) or an hour held fixed; kept as the hour at the prime meridian
    this.mode = 'cycle';
    this.utc = 12;
    this.lonHours = 0;               // the visitor's longitude, in hours (set by the frame loop)
  }

  /** The hour where the visitor is (local solar time). */
  get hour() { return ((this.utc + this.lonHours) % 24 + 24) % 24; }
  set hour(h) { this.utc = ((h - this.lonHours) % 24 + 24) % 24; }

  weatherOf(zone) {
    if (!this.weathers.has(zone.id)) {
      const z = { ...zone, climate: withSetPieces(zone.id, zone.climate) };
      this.weathers.set(zone.id, new RegionWeather(z, 7919 + zone.id.length * 131 + (Date.now() / 3.6e6 | 0), this.hour));
    }
    return this.weathers.get(zone.id);
  }

  /** Set how time runs: 'cycle', 'baked', or a number (an hour held). */
  setTime(mode, hour) {
    this.mode = mode;
    if (typeof mode === 'number') this.hour = mode;
    else if (hour !== undefined) this.hour = hour;
  }

  /**
   * The sky now, for ctx = { sun, moon (directions in the scene), up (the true up in the scene),
   * zones: [{ zone (an id and a climate), w }] (weights summing to 1) }. Applies it and returns the state.
   */
  update(ctx, dt) {
    if (this.mode === 'cycle') { this.utc = (this.utc + dt * 24 / DAY_SECONDS) % 24; moonDays += dt / DAY_SECONDS; }
    const acc = { sun: [0, 0, 0], sunColor: [0, 0, 0], zen: [0, 0, 0], hor: [0, 0, 0], fogColor: [0, 0, 0], fog: 0, falloff: 0, clouds: 0, density: 0,
      turb: 0, ray: 0, mie: 0, mieG: 0, exposure: 0, wind: [0, 0], rain: 0, sunFactor: 0, sky: [0, 0, 0], ground: [0, 0, 0], windy: 0,
      day: 0, moon: [0, 0, 0], moonLight: 0, sunEl: 0, damp: 0, snow: 0, dust: 0, fall: 0 };
    const up = ctx.up || [0, 1, 0];
    const el = Math.asin(Math.max(-1, Math.min(1, ctx.sun[0] * up[0] + ctx.sun[1] * up[1] + ctx.sun[2] * up[2]))) * 180 / Math.PI;
    const moonEl = Math.asin(Math.max(-1, Math.min(1, ctx.moon[0] * up[0] + ctx.moon[1] * up[1] + ctx.moon[2] * up[2]))) * 180 / Math.PI;
    // the moon's light by its phase: the lit fraction of its face, steeper than linear (a half moon
    // gives about a fifth of the full moon's light on the ground, a thin crescent next to none)
    const cosE = ctx.sun[0] * ctx.moon[0] + ctx.sun[1] * ctx.moon[1] + ctx.sun[2] * ctx.moon[2];
    const lit = (1 - cosE) / 2, phaseLight = Math.pow(lit, 2.2);
    const ids = [];
    let wl = -1e4, wlW = 0;
    for (const { zone, w } of ctx.zones) {
      if (w < 1e-4) continue;
      const line = zone.climate.waterline;
      if (line !== undefined && w > wlW) { wl = line; wlW = w; }
      const W = this.weatherOf(zone);
      W.update(dt, this.hour);
      if (!this.hemis.has(zone.id)) this.hemis.set(zone.id, hemisphere(zone.climate));
      const hemi = this.hemis.get(zone.id);
      const c = zone.climate, wx = W.get();
      ids.push(wx.id);
      // the sun's light reddens and fades as it sinks, and is gone below the horizon
      const day = smooth(-10, 8, el);
      const low = smooth(0, 25, el), upF = smooth(-2, 6, el) * (0.55 + 0.45 * smooth(0, 20, el));
      const sunCol = [1.0, 0.52, 0.28].map((v, k) => lerp(v, c.sun.color[k], low));
      const moonUp = smooth(-2, 10, moonEl) * (1 - smooth(-6, 2, el)) * phaseLight;
      for (let k = 0; k < 3; k++) {
        acc.sunColor[k] += w * sunCol[k] * c.sun.intensity * upF * wx.sun;
        acc.zen[k] += w * lerp(0.004 + k * 0.002, c.sky.zenith[k] * lerp(1, 0.8, wx.clouds), day);
        acc.hor[k] += w * lerp(0.006 + k * 0.003, lerp(c.sky.horizon[k], 0.3, wx.clouds * 0.6), day);
        acc.fogColor[k] += w * wx.fogColor[k] * (0.06 + 0.94 * day) * (k === 2 ? 1 : 0.85 + 0.15 * day);
        acc.sky[k] += w * (hemi.sky[k] * day + 0.012 * MOON[k] * moonUp);
        acc.ground[k] += w * hemi.ground[k] * (0.4 + 0.6 * wx.sun) * day;
      }
      acc.moonLight += w * moonUp * (0.35 + 0.65 * wx.sun);
      acc.day += w * day; acc.sunEl += w * el;
      acc.fog += w * c.fog.density * wx.fog; acc.falloff += w * c.fog.height * wx.fall;
      acc.snow += w * wx.snow; acc.dust += w * wx.dust; acc.fall += w * wx.fall;
      acc.clouds += w * wx.clouds; acc.density += w * wx.cloudDensity;
      acc.turb += w * c.sky.turbidity * (1 + wx.clouds); acc.ray += w * c.sky.rayleigh; acc.mie += w * c.sky.mie * (1 + wx.fog * 0.3); acc.mieG += w * c.sky.mieG;
      acc.exposure += w * c.exposure; acc.wind[0] += w * c.wind[0] * (1 + 2 * wx.windy); acc.wind[1] += w * c.wind[1] * (1 + 2 * wx.windy);
      acc.rain += w * wx.rain; acc.sunFactor += w * wx.sun; acc.windy += w * wx.windy;
      acc.damp += w * dampOf(c);
    }
    acc.sun = ctx.sun.slice();
    acc.moon = ctx.moon.slice();
    acc.moonLit = lit; acc.moonEl = moonEl;
    acc.waterLine = wl;
    // wetness: soaks in under rain within a minute or two (faster the harder it rains), and dries
    // over some twenty minutes after (a time constant of 400 s: 5 % left after 20 min)
    this.wet += (acc.rain > 0.15 ? (1 - this.wet) * dt * Math.min(1, acc.rain * 1.6) / 50 : -this.wet * dt / 400);
    this.wet = Math.min(1, Math.max(0, this.wet));
    // snow: settles over a minute and a half while it falls, melts over some minutes (faster where
    // the place is warm: out of the snowing zone the cover goes)
    this.snowCover += acc.snow > 0.3 ? (Math.min(1, acc.snow) - this.snowCover) * dt / 90 : -this.snowCover * dt / (acc.snow > 0.05 ? 400 : 120);
    this.snowCover = Math.min(1, Math.max(0, this.snowCover));
    // a weather held by the tools is seen as it is after a while: the ground already wet or white
    if (FORCE && this.forced !== FORCE) { this.forced = FORCE; if (acc.rain > 0.3) this.wet = 1; if (acc.snow > 0.3) this.snowCover = Math.min(1, acc.snow); }
    this.apply(acc, dt);
    this.state = { ...acc, wet: this.wet, snowCover: this.snowCover, ids, zone: ctx.zones[0]?.zone.id };
    return this.state;
  }

  apply(a, dt) {
    const R = this.R;
    ENV.sunDir.value.set(...a.sun);
    ENV.sunColor.value.setRGB(...a.sunColor);
    ENV.zenith.value.setRGB(...a.zen);
    ENV.horizon.value.setRGB(...a.hor);
    ENV.fogColor.value.setRGB(...a.fogColor);
    ENV.damp.value = a.damp;
    // under a roof the haze is the room's own dust and smoke, far thinner than the weather outside
    ENV.fogDensity.value = a.fog * (1 - 0.8 * (this.indoors || 0));
    // and the room's dust and smoke in the beams (src/engine/air.js)
    R.indoors = this.indoors || 0;
    ENV.fogFalloff.value = a.falloff;
    ENV.clouds.value = a.clouds;
    ENV.wind.value.set(a.wind[0], a.wind[1]);
    ENV.cloudOffset.value.x -= a.wind[0] * dt * 6;
    ENV.cloudOffset.value.y -= a.wind[1] * dt * 6;
    ENV.wet.value = this.wet;
    ENV.rain.value = a.rain;
    ENV.waterLine.value = a.waterLine ?? -1e4;
    ENV.snow.value = a.snow;
    ENV.dust.value = a.dust;
    ENV.snowCover.value = this.snowCover;
    ENV.seasonWinter.value = SEASON.winter;
    ENV.seasonAutumn.value = SEASON.autumn;
    // one light: the sun by day; when it has set, the moon (fainter, bluer), which casts the shadows
    const sunI = Math.max(...a.sunColor), moonI = 0.32 * a.moonLight;
    if (sunI >= moonI) {
      R.sun.color.setRGB(...a.sunColor.map((v) => v / Math.max(1e-3, sunI)));
      R.sun.intensity = sunI;
      R.sunDir = a.sun;
    } else {
      R.sun.color.setRGB(...MOON);
      R.sun.intensity = moonI;
      R.sunDir = a.moon;
    }
    ENV.night.value = 1 - a.day;
    ENV.moonDir.value.set(...a.moon);
    ENV.moonUp.value = a.moonLight;
    const sky = R.sky;
    sky.turbidity.value = a.turb; sky.rayleigh.value = a.ray; sky.mieCoefficient.value = a.mie * 0.6; sky.mieDirectionalG.value = Math.min(a.mieG, 0.74);   // a softer, smaller halo round the sun
    sky.cloudCoverage.value = a.clouds; sky.cloudDensity.value = a.density;
    // thick haze (a dust storm, a fog, a mist) veils the sky too, less where it lies low (fall)
    sky.haze.value = Math.min(0.95, smooth(0.0015, 0.0075, a.fog) / (1 + 0.12 * Math.max(0, a.fall - 1)) + 0.6 * a.dust);
    sky.cloudSpeed.value = 0.00002 * (1 + 2 * a.windy);
    sky.sunPosition.value.set(a.sun[0], a.sun[1], a.sun[2]).multiplyScalar(1000);
    // the stars' sphere turned with the planet, and the moon's light in the sky (src/engine/sky.js)
    sky.setCelestial?.(ENV.planetM.value, siderealOffset(this.utc));
    if (sky.moonLight) sky.moonLight.value = smooth(-3, 8, a.moonEl) * Math.pow(a.moonLit, 2.2);
    // the outdoor fallback for indirect light, and the strength of the baked light under cloud
    R.gi.setHemisphere(a.sky, a.ground);
    // the baked light (sun and sky at the baked moment) follows the daylight; a little remains at
    // night for the moon and the lamps
    R.gi.uIntensity.value = (0.72 + 0.28 * a.sunFactor) * (0.2 + 0.8 * a.day);
  }
}

/** How damp a climate is (0 desert … 1 wet): its share of rainy weather and its haze. */
function dampOf(c) {
  if (c.damp !== undefined) return c.damp;
  const tot = c.weather.reduce((a, w) => a + w.weight, 0) || 1, rainy = c.weather.reduce((a, w) => a + (w.rain ? w.weight * Math.min(1, w.rain + 0.3) : 0), 0) / tot;
  return Math.max(0, Math.min(1, rainy * 2.4 + c.fog.density * 300));
}
/** Irradiance from the open sky above and the lit ground below, for a climate. */
export function hemisphere(climate) {
  const sky = [0, 0, 0];
  const N = 16;
  let wsum = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N * 2; j++) {
    const th = ((i + 0.5) / N) * Math.PI / 2, ph = ((j + 0.5) / (2 * N)) * Math.PI * 2;
    const d = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)];
    const L = skyRadiance(climate, d), w = Math.cos(th) * Math.sin(th);
    for (let k = 0; k < 3; k++) sky[k] += L[k] * w;
    wsum += w;
  }
  for (let k = 0; k < 3; k++) sky[k] = (sky[k] / wsum) * Math.PI;
  const s = sunDirection(climate), alb = [0.35, 0.3, 0.24];
  const ground = [0, 1, 2].map((k) => alb[k] * (climate.sun.color[k] * climate.sun.intensity * s[1] + sky[k]));
  return { sky, ground };
}

// The planet's ground: the height of the open country from the land map (coasts, hills, mountain
// ranges, the sea floor), the settlements' discs set into it, and what covers the ground. Pure
// functions of a direction from the planet's centre; shared by the viewer (walking, collision),
// the terrain workers and the tools. docs/world.md, "Ground".
//
// A settlement stands on a flat disc of its own (its local ground, at its own level `base` above
// the sea), blended into the open country over BLEND metres beyond the rim. The ten settlements of
// the previous design take their local ground from their district of the old city
// (src/world/regions.js, with its focus set), in the old city's coordinates; the others from their
// own module (src/settlements/<id>/ground.js), in their own coordinates round the disc's centre.

import { PLANET_RADIUS as R, SITES, BLEND } from './sites.js';
import { PLACED } from './layout.js';
import { coastAt, climateAt } from './land.js';
import { fbm3, ridged3, noise3 } from './noise.js';
import { unit, enuFrame, add, sub, scale, dot } from './geo.js';
import { withFocus, terrainHeight, groundCover, inWater as legacyWater, waterLevel as legacyWaterLevel, RIM_FADE } from '../world/regions.js';
import { GROUNDS } from '../settlements/grounds.js';

export { R as PLANET_RADIUS, BLEND };
const sm = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/**
 * The settlements that are built: { id, site, u (centre direction), radius, focus, base (level
 * above the sea, m), enu (frame at the disc's centre), frame (local = old city coordinates) }.
 * Their levels and frames are set by initRelief() once the land map is loaded.
 */
export const BUILT = SITES.filter((s) => s.legacy || GROUNDS[s.id]).map((s) => {
  const S = { id: s.id, site: s, u: unit(...PLACED[s.id]), radius: s.radius, base: 0, enu: null, frame: null, cosMax: Math.cos((s.radius + BLEND + 20) / R) };
  if (s.legacy) {
    // the ten of the previous design: their district of the old city, under a focus
    const focus = S.focus = { region: s.legacy.region, center: s.legacy.center, radius: s.radius };
    S.local = {
      center: s.legacy.center,
      height: (x, z) => withFocus(focus, () => terrainHeight(x, z)),
      cover: (x, z, h, ny) => withFocus(focus, () => groundCover(x, z, h, ny)),
      water: (x, z, y) => withFocus(focus, () => legacyWater(x, z, y)),
      waterLevel: (x, z) => withFocus(focus, () => legacyWaterLevel(x, z)),
    };
  } else {
    // a settlement of its own (src/settlements/<id>/ground.js), in its own coordinates round its centre
    const G = GROUNDS[s.id];
    S.focus = { settlement: s.id, center: [0, 0], radius: s.radius };
    S.ground = G;
    S.local = {
      center: [0, 0],
      height: (x, z) => G.height(x, z),            // (the module fades its ground to 0 at its rim)
      cover: (x, z, h, ny) => G.cover(x, z, h, ny),
      water: (x, z, y) => G.water(x, z, y),
      waterLevel: (x, z) => G.waterLevel(x, z),
    };
  }
  return S;
});
export const BUILT_BY_ID = Object.fromEntries(BUILT.map((b) => [b.id, b]));

/** Set the settlements' levels and frames (after the land map is loaded). */
export function initRelief() {
  for (const S of BUILT) {
    S.base = Math.max(2.5, natural(S.u).h);
    S.enu = enuFrame(S.u, R + S.base);
    const [cx, cz] = S.local.center;
    S.frame = { ...S.enu, o: sub(S.enu.o, add(scale(S.enu.x, cx), scale(S.enu.z, cz))) };
  }
}

/**
 * The open country at direction u: { h (m above the sea), d (to the coast, m), mount (m), moist,
 * warm }. Land rises from the beach to a gently rolling country, with hills and, where Earth has
 * them, mountain ranges; the sea floor shelves down from the coast.
 */
export function natural(u) {
  const d = coastAt(u);
  const [mount, moist, warm] = climateAt(u);
  const px = u[0] * R, py = u[1] * R, pz = u[2] * R;
  const inland = sm(20, 240, d);
  let land = 0.5 + 0.06 * Math.min(Math.max(d, 0), 30) + 5 * inland;
  const rough = 0.3 + 0.7 * sm(-0.25, 0.5, noise3(px / 1700 + 7.1, py / 1700, pz / 1700));
  const hills = fbm3(px / 380, py / 380, pz / 380, 4) * 0.5 + 0.5;
  land += hills * (2.5 + 11 * rough) * sm(5, 120, d);
  if (mount > 0.5) land += mount * (0.3 + 0.7 * ridged3(px / 240, py / 240, pz / 240, 5)) * sm(10, 160, d);
  const sea = -(1.2 + 0.09 * Math.min(-d, 300));
  const t = sm(-4, 4, d);
  return { h: sea + (land - sea) * t, d, mount, moist, warm };
}

/**
 * The ground at direction u: { h (m above the sea), n (the open country there), s (the settlement
 * whose disc or blend this is: { S, x, z (old city coordinates), H (local height), w (1 on the
 * disc, falling to 0 at the end of the blend)} or null) }.
 */
export function surface(u) {
  const n = natural(u);
  for (const S of BUILT) {
    if (!S.enu) break;
    const uy = dot(S.enu.y, u);
    if (uy < S.cosMax) continue;
    const ux = dot(S.enu.x, u), uz = dot(S.enu.z, u), [cx, cz] = S.local.center;
    let k = (R + S.base) / uy, x = ux * k, z = uz * k;
    const r = Math.hypot(x, z);
    if (r > S.radius + BLEND) continue;
    let H = 0;
    if (r < S.radius) {
      // the local ground along the ray: solved twice for the point where the ray meets it
      for (let i = 0; i < 2; i++) {
        H = S.local.height(x + cx, z + cz);
        k = (R + S.base + H) / uy; x = ux * k; z = uz * k;
      }
    }
    const hp = (R + S.base + H) / uy - R;
    const w = 1 - sm(S.radius, S.radius + BLEND, r);
    return { h: n.h + (hp - n.h) * w, n, s: { S, x: x + cx, z: z + cz, H, w } };
  }
  return { h: n.h, n, s: null };
}

/** Height above the sea at u (m). */
export function heightAt(u) { return surface(u).h; }

/**
 * What covers the ground: { sand, grass, rock, soil, fields, dry, warmth, red, road, snow, forest }.
 * g: surface(u); ny: how much the ground faces up (1 flat … 0 vertical); u for the noise.
 */
export function coverAt(g, ny, u) {
  const { n, h } = g;
  const px = u[0] * R, py = u[1] * R, pz = u[2] * R;
  const patch = fbm3(px / 160 + 3, py / 160, pz / 160, 3);
  const steep = sm(0.88, 0.62, ny);
  const beach = (1 - sm(2, 8, n.d + 3 * patch)) * (1 - sm(1.2, 2.4, h));
  const desert = sm(0.36, 0.12, n.moist + 0.08 * patch);
  const high = sm(45 + 10 * patch, 110, h);
  let snow = Math.max(sm(0.24, 0.1, n.warm + 0.05 * patch), sm(105 + 20 * patch, 150, h));
  snow *= 1 - steep * 0.6;
  const rock = Math.min(1, Math.max(steep, high * 0.65) + sm(0.3, 0.7, patch) * 0.15 * desert);
  const sand = Math.max(beach, desert * (1 - rock)) * (1 - snow);
  const forest = sm(0.5, 0.72, n.moist + 0.15 * patch) * sm(0.2, 0.38, n.warm) * (1 - high) * (1 - steep) * (1 - beach) * sm(-0.15, 0.2, patch + 0.1);
  const soil = Math.max(0, 0.12 + 0.15 * patch) * (1 - rock - sand);
  const grass = Math.max(0, 1 - rock - sand - soil);
  const c = {
    sand, grass, rock, soil, fields: 0,
    dry: Math.max(0, Math.min(1, 1.15 - n.moist * 1.5 + 0.2 * patch)),
    warmth: Math.min(1, desert * 0.9 + 0.2), red: sm(0.65, 0.9, n.warm) * sm(0.35, 0.65, n.moist) * 0.6,
    road: 0, snow, forest,
  };
  // on a settlement's disc, its own ground cover (the old city's), blended out with its ground
  const s = g.s;
  if (s && s.w > 0) {
    const L = s.S.local.cover(s.x, s.z, s.H, ny);
    for (const k in c) c[k] = c[k] * (1 - s.w) + (L[k] ?? 0) * s.w;
  }
  return c;
}

/**
 * Height of the ground (y) under scene point (x, z) in a frame (scene coordinates are the frame's
 * local ones: the frame's up is the scene's up). The ground point is found on the frame's vertical
 * through (x, z).
 */
export function groundInFrame(f, x, z) {
  const P0 = [f.o[0] + f.x[0] * x + f.z[0] * z, f.o[1] + f.x[1] * x + f.z[1] * z, f.o[2] + f.x[2] * x + f.z[2] * z];
  const L0 = Math.hypot(P0[0], P0[1], P0[2]);
  let y = 0;
  for (let i = 0; i < 2; i++) {
    const P = [P0[0] + f.y[0] * y, P0[1] + f.y[1] * y, P0[2] + f.y[2] * y], l = Math.hypot(P[0], P[1], P[2]);
    const rs = R + heightAt([P[0] / l, P[1] / l, P[2] / l]);
    const b = dot(P0, f.y);
    y = -b + Math.sqrt(Math.max(0, b * b - L0 * L0 + rs * rs));
  }
  return y;
}

/** The sea's surface (y) under scene point (x, z) in a frame. */
export function seaInFrame(f, x, z) {
  const P0 = [f.o[0] + f.x[0] * x + f.z[0] * z, f.o[1] + f.x[1] * x + f.z[1] * z, f.o[2] + f.x[2] * x + f.z[2] * z];
  const L0 = Math.hypot(P0[0], P0[1], P0[2]), b = dot(P0, f.y);
  return -b + Math.sqrt(Math.max(0, b * b - L0 * L0 + R * R));
}

export { unit };

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
// The planet's sea is drawn over a disc only where the settlement says its water is the sea's
// (G.sea, which sets the disc's level); every other settlement draws its own rivers, canals and
// ponds at their own levels, and the sea is kept under its disc (chunk.js), as in its collision
// (src/engine/world.js).

import { PLANET_RADIUS as R, SITES, BLEND } from './sites.js';
import { PLACED } from './layout.js';
import { coastAt, climateAt } from './land.js';
import { riverAt } from './rivers.js';
import { fbm3, ridged3, noise3 } from './noise.js';
import { unit, enuFrame, add, sub, scale, dot, cross, norm, angle } from './geo.js';
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
      height: (x, z) => G.height(x, z),            // (the module fades its ground to its rim level, 0 or G.rim, at its rim)
      cover: (x, z, h, ny) => G.cover(x, z, h, ny),
      // (on a disc on the sea, wherever its ground is below the sea's level, the sea: G.sea)
      water: G.sea == null ? (x, z, y) => G.water(x, z, y) : (x, z, y) => G.water(x, z, y) || (y < G.sea + 0.3 && G.height(x, z) < G.sea - 0.3),
      waterLevel: G.sea == null ? (x, z) => G.waterLevel(x, z) : (x, z) => { const l = G.waterLevel(x, z); return Number.isFinite(l) ? l : G.height(x, z) < G.sea ? G.sea : -Infinity; },
    };
  }
  return S;
});
export const BUILT_BY_ID = Object.fromEntries(BUILT.map((b) => [b.id, b]));

/**
 * The roads between the settlements of one region (DESIGN §4.1: "no houses or roads outside
 * settlements, except the roads and fields that join settlements of one region"): a spanning tree
 * of each region's settlements, shortest links first, none longer than 2.6 km; each a great-circle
 * arc from centre to centre that wanders a little, a strip of fields either side.
 */
export const ROADS = [];
function layRoads() {
  ROADS.length = 0;
  const by = {};
  for (const S of BUILT) (by[S.site.region] ??= []).push(S);
  for (const list of Object.values(by)) {
    if (list.length < 2) continue;
    const links = [];
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) links.push([angle(list[i].u, list[j].u), i, j]);
    links.sort((p, q) => p[0] - q[0]);
    const root = list.map((_, i) => i), find = (i) => (root[i] === i ? i : (root[i] = find(root[i])));
    for (const [ang, i, j] of links) {
      if (ang * R > 2600 || find(i) === find(j)) continue;
      root[find(i)] = find(j);
      const a = list[i].u, b = list[j].u, n = norm(cross(a, b));
      ROADS.push({ a, n, t: norm(cross(n, a)), ang, seed: ROADS.length * 1.7 + 0.3, ends: [list[i], list[j]] });
    }
  }
}

/** Set the settlements' levels and frames (after the land map is loaded). */
export function initRelief() {
  for (const S of BUILT) {
    // a settlement on a height (G.lift: Machu Picchu on its ridge) stands that much above the open
    // country; its ground then comes down to -lift at its rim (G.rim), so that it meets the country.
    // A settlement on the planet's sea (G.sea: the local level of its sea, lagoon, lake or river —
    // Kilwa, Venice, Rapa Nui) has the planet's sea for its water, drawn over its disc at that level
    // and on across the blend to the open sea or to a shore in the country round it.
    // The disc is flat (its frame's plane) and the sea round, so that plane at the local sea level
    // meets the sea's sphere only along one circle: the disc stands so that it does so at its rim,
    // and over the disc the sea is drawn on the plane (seaHeight).
    S.base = S.ground?.sea != null ? R * Math.cos(S.radius / R) - R - S.ground.sea : Math.max(2.5, natural(S.u).h) + (S.ground?.lift || 0);
    S.enu = enuFrame(S.u, R + S.base);
    const [cx, cz] = S.local.center;
    S.frame = { ...S.enu, o: sub(S.enu.o, add(scale(S.enu.x, cx), scale(S.enu.z, cz))) };
  }
  layRoads();
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
  let h = sea + (land - sea) * t;
  // a great river: its bed below the sea's level (the sea's surface is its water), the banks falling to it
  const rv = d > 0 ? riverAt(u) : null;
  if (rv) { const bed = -1.4, f = sm(rv.half, rv.half + rv.bank, rv.d); h = bed + (Math.max(h, 0.6) - bed) * f; }
  return { h, d, mount, moist, warm, river: rv ? 1 - sm(rv.half, rv.half + rv.bank, rv.d) : 0 };
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
    let H = S.ground?.rim ?? 0;
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

/**
 * The sea's surface at u, from g = surface(u): its height above the sphere of the sea (m), or null
 * where no sea is drawn — on the disc of a settlement whose water is its own (no G.sea). On the disc
 * of a settlement on the sea, the plane of its local sea level (which meets the sphere at the rim);
 * everywhere else the sphere.
 */
export function seaHeight(g, u) {
  const s = g.s;
  if (!s || s.w < 1) return 0;
  const S = s.S, sea = S.ground?.sea;
  if (sea == null) return null;
  return (R + S.base + sea) / dot(S.enu.y, u) - R;
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
  const bank = n.river ?? 0;
  const grass = Math.max(0, 1 - rock - sand - soil);
  const c = {
    sand, grass, rock, soil, fields: 0,
    dry: Math.max(0, Math.min(1, 1.15 - n.moist * 1.5 + 0.2 * patch)),
    warmth: Math.min(1, desert * 0.9 + 0.2), red: sm(0.65, 0.9, n.warm) * sm(0.35, 0.65, n.moist) * 0.6,
    road: 0, snow, forest,
  };
  // a river's banks: mud and sand at the water, no trees
  if (bank > 0) { c.soil = c.soil * (1 - bank) + bank * 0.6; c.sand = c.sand * (1 - bank) + bank * 0.35; c.grass *= 1 - bank; c.forest *= 1 - bank; c.rock *= 1 - bank; c.snow *= 1 - bank; }
  // the roads between a region's settlements, and fields along them (on land, not on steep, high, snowy or desert ground)
  for (const rd of ROADS) {
    const off = dot(u, rd.n) * R;
    if (Math.abs(off) > 90) continue;
    const along = Math.atan2(dot(u, rd.t), dot(u, rd.a));
    if (along < 0 || along > rd.ang) continue;
    const m = along * R, wob = 22 * Math.sin(m / 210 + rd.seed) + 9 * Math.sin(m / 67 + rd.seed * 3.1);
    const d = Math.abs(off - wob * Math.min(1, m / 300, (rd.ang * R - m) / 300));
    const tame = (1 - steep) * (1 - snow) * (1 - high) * (n.d > 6 ? 1 : 0);
    const road = (1 - sm(2.6, 4.2, d + 0.6 * patch)) * tame;
    const fields = (1 - sm(18, 60, d + 15 * patch)) * tame * (1 - sm(0.3, 0.6, desert)) * (1 - road);   // (no fields in the desert)
    if (road > c.road) { const k = road - c.road; c.road = road; c.grass *= 1 - k; c.forest *= 1 - k; }
    if (fields > c.fields) { c.fields = fields; c.forest *= 1 - fields; }
  }
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

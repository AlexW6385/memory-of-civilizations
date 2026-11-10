// Procedural PBR materials (TSL). Masonry is generated from the position in the settlement's own
// coordinates (positionLocal: a settlement's meshes are built in its coordinates, the settlement's
// group places them on the planet) so that courses and joints line up with the real block sizes
// recorded in each dossier (a tiling photo texture cannot follow a wall's coursing). Average colours come from src/core/palette.js,
// which the light baker shares.

import { MeshStandardNodeMaterial, DoubleSide, Color, PhysicalLightingModel } from 'three/webgpu';
import {
  Fn, float, vec2, vec3, vec4, positionWorld, positionLocal, normalWorld, normalLocal, normalView, positionView, abs, floor, fract, min, max,
  mix, smoothstep, hash, mx_noise_float, mx_fractal_noise_float, mx_worley_noise_float, dot, cross, normalize,
  sign, select, time, sin, cos, clamp, length, cameraPosition, uniform, attribute, reflect, pow, fwidth, toneMappingExposure, If,
} from 'three/tsl';
import { ENV, cloudShadow, noiseT } from './env.js';
import { MATERIALS } from '../core/palette.js';
import { GISpecularNode } from './gi.js';
import { waterSky } from './water-reflect.js';

const cache = new Map();
const WIND = '+wind';
/** The colour of oil-lamp light through paper or from a room within (linear): a warm orange. */
const LAMPLIGHT = vec3(1.0, 0.43, 0.13);
const PLAIN = typeof location !== 'undefined' && new URLSearchParams(location.search).get('plain') === '1';
function plainMaterial(spec) {
  const m = new MeshStandardNodeMaterial({ color: new Color(spec.color), roughness: spec.roughness ?? 0.8, metalness: spec.metalness ?? 0 });
  if (spec.side === 'double') { m.side = DoubleSide; m.shadowSide = DoubleSide; }
  if (spec.transparent || spec.opacity !== undefined) { m.transparent = true; m.opacity = spec.opacity ?? 0.5; }
  return m;
}
let GI = null;
/** The baked-light volume used for reflections (set once by the renderer). */
export function useGI(gi) { GI = gi; }

/**
 * Material for a palette key. A key ending in "+wind" is that material on cloth hung in the wind
 * (a shop's banner, washing on a pole): the same look, its vertices swayed (clothSway below).
 */
export function material(key) {
  if (cache.has(key)) return cache.get(key);
  const wind = key.endsWith(WIND), base = wind ? key.slice(0, -WIND.length) : key;
  const spec = MATERIALS[base] || MATERIALS.sandstone;
  // ?plain=1 (benchmark only): flat materials, to measure what the procedural detail costs
  const m = PLAIN ? plainMaterial(spec) : make(spec);
  if (wind) clothSway(m);
  m.name = key;
  if (GI && !m.userData.water) {
    const spec2 = GI.radianceNode();
    m.setupLightMap = () => new GISpecularNode(spec2);
  }
  cache.set(key, m);
  return m;
}

/** Normal perturbed by a world-space height field (surface-gradient bump, view space). */
const bump = (h, strength = 1) => {
  const N = normalView;
  const dpdx = positionView.dFdx(), dpdy = positionView.dFdy();
  const hx = h.dFdx().mul(strength), hy = h.dFdy().mul(strength);
  const r1 = cross(dpdy, N), r2 = cross(N, dpdx);
  const det = dot(dpdx, r1);
  const grad = sign(det).mul(hx.mul(r1).add(hy.mul(r2)));
  return normalize(abs(det).mul(N).sub(grad));
};

/**
 * The moon's glitter on water for a reflected direction r (world): a sharp path of glints and a
 * soft sheen round it, at night, with the moon up and the sky clear (DESIGN §11 Visual L3).
 */
const moonGlint = (r) => {
  const c = max(dot(r, ENV.moonDir), 0);
  const k = ENV.moonUp.mul(smoothstep(0.3, 0.8, ENV.night)).mul(float(1).sub(ENV.clouds.mul(0.85)));
  return vec3(0.78, 0.84, 1.0).mul(pow(c, 400).mul(3.0).add(pow(c, 50).mul(0.04))).mul(k);
};

/** Fade fine detail with distance to avoid shimmering. */
const detailFade = () => clamp(float(1).sub(length(positionWorld.sub(cameraPosition)).div(60)), 0, 1);

/** Planar coordinates for a wall-like surface: u along the wall, v up; horizontal faces use x/z. */
const wallUV = () => {
  const n = abs(normalLocal);
  const isTop = n.y.greaterThan(0.7);
  const alongX = n.z.greaterThan(n.x);
  const u = select(alongX, positionLocal.x, positionLocal.z);
  return { u: select(isTop, positionLocal.x, u), v: select(isTop, positionLocal.z, positionLocal.y), isTop };
};

/** Ashlar / paving / drums / brick pattern: returns { id (block hash), joint (0..1), edge } */
const blocks = (u, v, course, block, stagger = 0.5) => {
  const row = floor(v.div(course));
  const rowH = hash(row.mul(13.17).add(3.1));
  const len = float(block).mul(rowH.mul(0.55).add(0.75));        // block length varies by course
  const uu = u.add(rowH.mul(float(block).mul(7.0))).add(row.mul(float(block).mul(stagger)));
  const col = floor(uu.div(len));
  const fu = fract(uu.div(len)), fv = fract(v.div(course));
  const du = min(fu, float(1).sub(fu)).mul(len), dv = min(fv, float(1).sub(fv)).mul(course);
  const d = min(du, dv);
  const id = hash(col.mul(1.618).add(row.mul(91.7)));
  return { id, d, row };
};

/**
 * Irregular paving: rows of large cells, each cell split once or twice at random into
 * rectangular flags of different sizes, as temple floors were laid with whatever slabs came.
 */
const flags = (u, v, size) => {
  const row = floor(v.div(size));
  const uu = u.add(hash(row.mul(7.31)).mul(size));
  const cell = vec2(floor(uu.div(size)), row);
  const lu = fract(uu.div(size)).mul(size), lv = fract(v.div(size)).mul(size);
  const h1 = hash(cell.x.mul(12.9898).add(cell.y.mul(78.233)));
  const h2 = hash(cell.x.mul(39.346).add(cell.y.mul(11.135)));
  const h3 = hash(cell.x.mul(73.156).add(cell.y.mul(52.235)));
  const vertical = h1.greaterThan(0.5);
  const sp = h2.mul(0.4).add(0.3).mul(size);
  const a = select(vertical, lu, lv), b = select(vertical, lv, lu);
  const side = a.greaterThan(sp);
  // second split, across the first, in about half of the pieces
  const sp2 = h3.mul(0.5).add(0.25).mul(size);
  const split2 = hash(h1.add(select(side, float(0.37), float(0.71)))).greaterThan(0.45);
  const d0 = min(min(lu, float(size).sub(lu)), min(lv, float(size).sub(lv)));
  const d1 = abs(a.sub(sp));
  const d2 = select(split2, abs(b.sub(sp2)), float(9));
  const d = min(d0, min(d1, d2));
  const id = hash(h1.add(select(side, float(0.13), float(0.57))).add(select(split2.and(b.greaterThan(sp2)), float(0.29), float(0))));
  return { id, d };
};

// Weathering (DESIGN §5 "Surfaces"; the Jiangnan sources in docs/settlements/ming-suzhou.md
// "Weathering and rain"). In settlement coordinates (the ground at y ≈ 0, north = −z), by how damp
// the place's climate is (ENV.damp):
// - the foot of a wall: rising damp, darker up to a wavering tide line 0.3–0.7 m up with a thin pale
//   line of salts at its top; the grime of the lower metre (splash and dirt); green-black algae and
//   moss in the damp foot, thickest on the north side and where little sky reaches (a narrow lane);
//   moss higher up the north faces;
// - rain streaks: thin dark-grey runs down the faces where the rain off the copings, eaves and sills
//   has carried the dirt, starting and stopping at random heights, strongest on white lime plaster;
// - a waterline where walls and revetments stand in still water (ENV.waterLine): black-green algae
//   and silt from below the surface up to 0.3–0.6 m above it, and above that a pale band where the
//   water's lime and salts dried out;
// - moss on north-facing roofs, fresh snow lying on the slopes while it snows.
const WEATHERED = new Set(['ashlar', 'mudbrick', 'granite', 'smooth', 'facade', 'wood', 'timberframe', 'veined', 'drums', 'sectile', 'rock', 'mud', 'tukutuku', 'kowhaiwhai']);
const ROOFS = new Set(['tiles', 'plates']);
/** Kinds that stand in water and take its waterline (beyond the weathered walls). */
const WATERLINE = new Set(['paving', 'taihu', 'pebbles']);
/** Kinds that get wet in the rain, and those of them that hold puddles where they lie flat. */
const WETTED = new Set([...WEATHERED, ...ROOFS, ...WATERLINE, 'metal', 'ground', 'bark']);
const PUDDLES = new Set(['paving', 'pebbles', 'ground']);
const LUM = vec3(0.2126, 0.7152, 0.0722);
/** A value computed only while a uniform condition holds (the same for every pixel), else `otherwise`. */
const when = (cond, make, otherwise = 0) => Fn(() => {
  const v = float(otherwise).toVar();
  If(cond, () => { v.assign(make()); });
  return v;
})();
const whenV = (cond, make) => Fn(() => {
  const v = vec3(0).toVar();
  If(cond, () => { v.assign(make()); });
  return v;
})();

/**
 * How open to the sky the fragment is (0 under a roof or deep eaves … 1 in the open): the baked light
 * from straight overhead against the open sky's. The probes' coefficients are read once per pixel
 * and shared with the baked reflections (gi.js), so this costs a few operations. 1 without a bake.
 */
const skyOpen = () => {
  if (!GI) return float(1);
  const up = GI.irradianceNode(vec3(0, 1, 0)), sky = GI.skyE;
  return clamp(dot(up, LUM).div(max(dot(sky, LUM).mul(GI.uIntensity), 1e-4)), 0, 1);
};

function weather(col, roof, open) {
  const P = positionLocal, y = P.y, vertical = float(1).sub(smoothstep(0.5, 0.8, abs(normalLocal.y)));
  // (the noise from the baked field, one lookup each: four 3D Perlin noises on every wall pixel cost
  // Suzhou ~10 ms of the GPU a frame)
  const patch = noiseT(P.mul(0.7)), fine = noiseT(P.mul(3.1));
  const north = smoothstep(0.2, 0.9, normalLocal.z.negate());
  if (roof) {
    const moss = north.mul(smoothstep(0.0, 0.5, patch.add(0.2))).mul(ENV.damp).mul(float(1).sub(vertical));
    // fresh snow lying on the roof's slopes while it snows (ENV.snowCover), thinner on the steep
    const snow = ENV.snowCover.mul(smoothstep(0.35, 0.7, normalLocal.y)).mul(smoothstep(-0.7, -0.2, patch.add(ENV.snowCover.mul(0.5))));
    return mix(mix(col, vec3(0.14, 0.17, 0.08), moss.mul(0.35)), vec3(0.9, 0.92, 0.95), snow.mul(0.92));
  }
  const { u } = wallUV();
  const light = smoothstep(0.2, 0.55, dot(col, LUM));                // white plaster shows dirt the most
  // the foot: grime of the lower metre, rising damp to its tide line, salts at the line
  const foot = smoothstep(1.3, 0.0, y.add(patch.mul(0.35))).mul(vertical);
  const tide = patch.mul(0.2).add(fine.mul(0.05)).add(0.5);
  const dampF = smoothstep(tide, tide.sub(0.14), y).mul(vertical).mul(ENV.damp);
  const salt = float(1).sub(smoothstep(0.0, 0.035, abs(y.sub(tide).sub(0.02)))).mul(vertical).mul(ENV.damp).mul(light).mul(smoothstep(-0.2, 0.3, fine));
  // green-black growth in the damp foot (north and shaded sides), moss higher up the north faces
  const shade = max(north, float(1).sub(open).mul(0.8));
  const algae = shade.mul(smoothstep(0.75, 0.05, y.add(patch.mul(0.3)))).mul(smoothstep(-0.15, 0.35, patch.add(fine.mul(0.35)))).mul(ENV.damp).mul(vertical);
  const moss = north.mul(smoothstep(2.4, 0.2, y.add(patch.mul(0.6)))).mul(smoothstep(0.0, 0.5, patch.add(0.25))).mul(ENV.damp).mul(vertical);
  // rain streaks: narrow runs (~10 cm) down the face, broken into lengths by a second field
  const run = noiseT(vec3(u.mul(9.0), y.mul(0.3), 0.3));
  const len = noiseT(vec3(u.mul(1.3), y.mul(0.9), 1.7));
  const streak = smoothstep(0.2, 0.6, run).mul(smoothstep(-0.05, 0.35, len)).mul(vertical).mul(ENV.damp).mul(open.mul(0.6).add(0.4));
  // the waterline: algae and silt up to 0.3–0.6 m above the still water, a pale dried band above
  const wd = y.sub(ENV.waterLine), band = patch.mul(0.15).add(fine.mul(0.04)).add(0.45);
  const slime = smoothstep(band, band.sub(0.07), wd).mul(smoothstep(-2.5, -1.0, wd));
  const pale = smoothstep(band.sub(0.02), band.add(0.02), wd).mul(smoothstep(band.add(0.32), band.add(0.04), wd));
  let c = col.mul(float(1).sub(foot.mul(0.2).mul(fine.mul(0.35).add(1))));
  c = c.mul(float(1).sub(dampF.mul(0.18)));
  c = mix(c, vec3(dot(c, LUM).mul(1.1).add(0.08)), salt.mul(0.35));
  c = mix(c, c.mul(0.55).add(vec3(0.05, 0.052, 0.05)).mul(run.mul(0.15).add(0.9)), streak.mul(light.mul(0.55).add(0.12)));
  c = mix(c, vec3(0.15, 0.19, 0.09), moss.mul(0.4));
  c = mix(c, vec3(0.045, 0.06, 0.032).mul(fine.mul(0.3).add(1)), algae.mul(0.55));
  c = mix(c, vec3(dot(c, LUM)).mul(1.12).add(0.04), pale.mul(0.28));
  return mix(c, c.mul(0.3).add(vec3(0.03, 0.038, 0.025)), slime.mul(0.85));
}

/** For the kinds that take a waterline but no other weathering (paving, revetment stones): the stained band alone (no noise: a wavering of sines). */
function waterline(col) {
  const P = positionLocal, wd = P.y.sub(ENV.waterLine);
  const band = sin(P.x.mul(1.7).add(P.z.mul(0.6))).mul(0.06).add(sin(P.z.mul(4.3).sub(P.x.mul(2.9))).mul(0.03)).add(0.45);
  const slime = smoothstep(band, band.sub(0.07), wd).mul(smoothstep(-2.5, -1.0, wd));
  const pale = smoothstep(band.sub(0.02), band.add(0.02), wd).mul(smoothstep(band.add(0.32), band.add(0.04), wd));
  const c = mix(col, vec3(dot(col, LUM)).mul(1.12).add(0.04), pale.mul(0.25));
  return mix(c, c.mul(0.3).add(vec3(0.03, 0.038, 0.025)), slime.mul(0.85));
}

/**
 * Rain on still water: each drop a ring spreading from where it fell (to ~12 cm in 0.6 s) and dying
 * away; two staggered layers of cells, a drop per cell and cycle, fewer in lighter rain. Returns
 * vec3(height, its slope along x, along z) per metre of amplitude.
 */
function rainRings(x, z) {
  let out = vec3(0);
  for (const [k, cell, rate] of [[0, 0.55, 1.6], [1, 0.45, 1.9]]) {
    const q = vec2(x, z).div(cell).add(k * 0.37), c = floor(q), f = fract(q);
    const id = hash(c.x.mul(12.9898).add(c.y.mul(78.233)).add(k * 41.3));
    const ctr = vec2(hash(id.mul(7.13).add(1.7)), hash(id.mul(3.71).add(5.3))).mul(0.5).add(0.25);
    const t = time.mul(rate).add(id.mul(17.0)), age = fract(t);
    const on = select(hash(floor(t).add(id.mul(31.0))).lessThan(ENV.rain.mul(1.5).add(0.15)), float(1), float(0));
    const dv = f.sub(ctr).mul(cell), d = max(length(dv), 1e-4);
    const x0 = d.sub(age.mul(0.12));
    const win = float(1).sub(smoothstep(0.0, 0.04, abs(x0))).mul(float(1).sub(age).pow(2)).mul(on);
    const K = Math.PI * 2 / 0.04;
    out = out.add(vec3(sin(x0.mul(K)).mul(win), dv.mul(cos(x0.mul(K)).mul(win).mul(K).div(d))));
  }
  return out;
}

/**
 * The weather on a material's surface, after its own look (m.colorNode, its roughness): weathering
 * and waterline, then the rain — outdoors (by skyOpen) surfaces darker (the porous more) and glossier,
 * flat paving holding puddles in its low spots that mirror the sky, rain rings on them while it rains.
 */
function weatherSurface(m, spec, roughU) {
  const kind = spec.kind ?? 'smooth', roof = ROOFS.has(kind);
  const weathered = !spec.clean && (WEATHERED.has(kind) || roof), lined = !spec.clean && WATERLINE.has(kind);
  if (!m.colorNode || !(weathered || lined || WETTED.has(kind))) return;
  const open = skyOpen();
  let col = m.colorNode;
  if (weathered) col = weather(col, roof, open);
  else if (lined) col = waterline(col);
  if (!WETTED.has(kind)) { m.colorNode = col; return; }
  // the rain's reach: the faces turned to the sky fully, the walls half (driving rain and runs), the
  // undersides not; nothing under a roof
  const ny = normalLocal.y;
  const facing = smoothstep(-0.2, 0.2, ny).mul(0.5).add(smoothstep(0.6, 0.9, ny).mul(0.5));
  const wetK = ENV.wet.mul(smoothstep(0.3, 0.7, open)).mul(facing);
  // the porous (lime plaster, brick, stone, earth) darken most; glazes, lacquer and metal hardly
  const porous = kind === 'metal' ? 0.12 : (spec.roughness ?? 0.8) > 0.6 ? 0.36 : 0.2;
  col = col.mul(float(1).sub(wetK.mul(porous)));
  let rough = (m.roughnessNode ?? roughU);
  rough = mix(rough, mix(float(0.38), float(0.14), smoothstep(0.6, 0.9, ny)), wetK.mul(0.85));
  if (PUDDLES.has(kind)) {
    // puddles: in the hollows of a low-frequency field over the flat, growing with the wetness
    const P = positionLocal, flat = smoothstep(0.93, 0.99, ny).mul(smoothstep(0.4, 0.8, open));
    const pn = when(ENV.wet.greaterThan(0.02), () => noiseT(vec3(P.x.mul(0.28), 0.5, P.z.mul(0.28))).mul(0.8));
    const puddle = smoothstep(0.2, 0.3, pn.negate().add(ENV.wet.mul(0.12))).mul(ENV.wet).mul(flat);
    // rain rings on them while it rains, fading with distance (before they are finer than a pixel)
    const dist = length(positionWorld.sub(cameraPosition));
    const ring = whenV(ENV.rain.greaterThan(0.02).and(ENV.wet.greaterThan(0.02)), () => rainRings(P.x, P.z)).mul(puddle).mul(smoothstep(12, 3, dist)).mul(ENV.rain.mul(0.4).add(0.3));
    col = mix(col, col.mul(0.42), puddle);
    rough = mix(rough, float(0.03), puddle);
    // (the rings' normal and the mirrored sky only while it is wet: dry, every paving pixel paid for both)
    const wetNow = ENV.wet.greaterThan(0.02), base = m.normalNode ?? normalView;
    m.normalNode = Fn(() => {
      const n = vec3(base).toVar();
      If(wetNow, () => { n.assign(normalize(mix(base, bump(ring.x.mul(0.0008), 1), puddle))); });
      return n;
    })();
    // the sky mirrored in the puddle (the same sky as the water's), by Fresnel, the rings bending it
    const sky = whenV(wetNow, () => {
      const v = normalize(positionWorld.sub(cameraPosition));
      const N = normalize(normalWorld.add(vec3(ring.y, 0, ring.z).mul(0.0008)));
      const fres = float(0.02).add(float(0.98).mul(pow(float(1).sub(max(dot(N, v.negate()), 0)), 5)));
      return waterSky(reflect(v, N)).mul(fres).mul(puddle).mul(0.8);
    });
    m.emissiveNode = m.emissiveNode ? m.emissiveNode.add(sky) : sky;
  }
  m.colorNode = col;
  m.roughnessNode = rough;
}

/**
 * Cloth hung in the wind (materials "<key>+wind"): each vertex leans downwind by the angle of the
 * moment's gust about the cloth's attachment and flutters across, by how far below the attachment it
 * hangs — the geometry's `hang` attribute, in metres (0 at the pole or bracket, so the attachment
 * stays put; without the attribute nothing moves). The phase is a smooth field of the position, so
 * that all the vertices of a piece move together and touching pieces stay touching. The shadow is
 * cast from the resting cloth, as the plants' are (src/engine/flora/index.js): the cloth then stays
 * among the static casters of the shadow cache, and its sway is a few centimetres.
 */
function clothSway(m) {
  const hang = attribute('hang', 'float'), P = positionLocal, w = ENV.wind;
  const speed = length(w), dir = vec3(w.x, 0, w.y).div(max(speed, 0.05));
  const ph = mx_noise_float(vec3(P.x.mul(0.3), 0.5, P.z.mul(0.3))).mul(6.0);
  const gust = sin(time.mul(0.41).add(ph)).mul(sin(time.mul(0.17).add(ph.mul(0.5)))).mul(0.5).add(0.5);
  const k = clamp(speed.mul(0.4), 0.2, 1);
  const lean = k.mul(gust.mul(0.75).add(0.25)).mul(0.16);
  const flap = sin(time.mul(2.7).add(ph.mul(3.0)).sub(hang.mul(3.5))).mul(k).mul(gust.add(0.3)).mul(0.035);
  const side = vec3(dir.z.negate(), 0, dir.x);
  const a = lean.add(flap.mul(0.5));
  m.positionNode = P.add(dir.mul(sin(a).mul(hang))).add(vec3(0, float(1).sub(cos(a)).mul(hang), 0)).add(side.mul(flap.mul(hang)));
}

function make(spec) {
  const m = new MeshStandardNodeMaterial();
  // the material's numbers are uniforms, not constants in the shader: materials of the same kind
  // then share one compiled shader (and pipeline), which keeps the start-up short
  const baseNode = uniform(new Color(spec.color));
  const roughU = uniform(spec.roughness ?? 0.8);
  m.roughness = spec.roughness ?? 0.8;
  if (spec.side === 'double') { m.side = DoubleSide; m.shadowSide = DoubleSide; }
  m.metalness = spec.metalness ?? 0;
  const P = positionLocal;

  switch (spec.kind) {
    case 'ashlar':
    case 'paving':
    case 'mudbrick': {
      const course = uniform(spec.course ?? 1), blk = uniform(spec.block ?? 1);
      const { u, v, isTop } = wallUV();
      // floors and tops: flags laid in rows along x
      const b = spec.kind === 'paving' ? flags(u, v, blk.mul(1.5)) : blocks(u, v, course, blk, spec.kind === 'mudbrick' ? 0.5 : 0.37);
      const jointW = spec.kind === 'mudbrick' ? 0.014 : 0.006;
      // far off, where a course is only a few pixels high, the joints and the block-to-block tones
      // fade out (else they shimmer in moiré)
      const far = float(1).sub(smoothstep(0.12, 0.45, max(fwidth(v), fwidth(u)).div(min(course, blk))));
      const joint = float(1).sub(smoothstep(jointW * 0.4, jointW * 2.2, b.d)).mul(far);
      const stain = mx_fractal_noise_float(P.mul(0.11), 4, 2.0, 0.5);
      const streak = mx_noise_float(vec3(P.x.mul(1.3), P.y.mul(0.08), P.z.mul(1.3)));
      const grain = mx_noise_float(P.mul(9.0)).mul(detailFade());
      const fine = mx_noise_float(P.mul(41.0)).mul(detailFade());
      const tone = b.id.sub(0.5).mul(spec.kind === 'paving' ? 0.24 : 0.16).mul(far).add(1);
      const hueShift = vec3(1.02, 1.0, 0.96).mul(b.id).add(vec3(0.98, 1.0, 1.04).mul(float(1).sub(b.id)));
      let col = baseNode.mul(tone).mul(hueShift)
        .mul(stain.mul(0.18).add(1))
        .mul(select(isTop, float(1), streak.mul(0.08).add(1)))
        .mul(grain.mul(0.05).add(fine.mul(0.03)).add(1));
      // where feet pass, the tops of paving and steps are worn smooth: a little lighter (the dirt
      // and the weathered skin rubbed off), glossier, the joints shallower; in patches and paths
      // (the stain field, already computed); not the brick
      const worn = spec.kind === 'mudbrick' ? float(0) : select(isTop, float(1), float(0)).mul(smoothstep(-0.15, 0.3, stain)).mul(smoothstep(0.7, 0.95, normalLocal.y));
      col = mix(col, col.mul(0.5), joint.mul(spec.kind === 'mudbrick' ? 0.85 : 0.55).mul(float(1).sub(worn.mul(0.35))));
      m.colorNode = col.mul(worn.mul(0.07).add(1));
      m.roughnessNode = roughU.add(grain.mul(0.05)).add(joint.mul(0.08)).sub(worn.mul(0.2));
      // chipped arrises: blocks slightly pillowed toward their edges (rounder where worn)
      const pillow = smoothstep(0.0, worn.mul(0.04).add(0.05), b.d).mul(worn.mul(0.002).add(0.0025));
      const h = pillow.add(grain.mul(0.0006)).add(fine.mul(0.0003)).sub(joint.mul(0.004));
      m.normalNode = bump(h, 1);
      break;
    }
    case 'drums': {
      const course = uniform(spec.course ?? 1);
      const fv = fract(P.y.div(course));
      const dv = min(fv, float(1).sub(fv)).mul(course);
      const joint = float(1).sub(smoothstep(0.003, 0.012, dv));
      const row = floor(P.y.div(course));
      const id = hash(row.mul(17.3).add(floor(P.x.mul(0.3)).mul(7.1)).add(floor(P.z.mul(0.3)).mul(3.3)));
      const stain = mx_fractal_noise_float(P.mul(0.18), 3, 2.0, 0.5);
      const grain = mx_noise_float(P.mul(10.0)).mul(detailFade());
      const fine = mx_noise_float(P.mul(45.0)).mul(detailFade());
      let col = baseNode.mul(id.sub(0.5).mul(0.12).add(1)).mul(stain.mul(0.16).add(1)).mul(grain.mul(0.05).add(fine.mul(0.03)).add(1));
      col = mix(col, col.mul(0.6), joint.mul(0.8));
      m.colorNode = col;
      m.roughnessNode = roughU.add(grain.mul(0.05));
      m.normalNode = bump(grain.mul(0.0007).add(fine.mul(0.0003)).sub(joint.mul(0.003)), 1);
      break;
    }
    case 'granite': {
      const w1 = mx_worley_noise_float(P.mul(38.0));
      const w2 = mx_worley_noise_float(P.mul(90.0).add(7.0));
      const speck = smoothstep(0.05, 0.25, w1).mul(0.6).add(smoothstep(0.1, 0.3, w2).mul(0.4));
      const cloud = mx_fractal_noise_float(P.mul(0.6), 3, 2.0, 0.5);
      const col = baseNode.mul(speck.mul(0.55).add(0.7)).mul(cloud.mul(0.15).add(1));
      m.colorNode = col;
      m.roughnessNode = roughU.add(cloud.abs().mul(0.12)).add(float(1).sub(speck).mul(0.06));
      break;
    }
    case 'wood': {
      // cedar boards: grain runs vertically
      const g = mx_noise_float(vec3(P.x.mul(18), P.y.mul(0.9), P.z.mul(18)));
      const rings = fract(g.mul(6.0));
      const col = baseNode.mul(rings.mul(0.16).add(0.92)).mul(mx_noise_float(P.mul(3.0)).mul(0.1).add(1));
      m.colorNode = col;
      m.roughnessNode = roughU.add(rings.mul(0.08));
      m.normalNode = bump(rings.mul(0.0006), 1);
      break;
    }
    case 'metal': {
      const n = mx_fractal_noise_float(P.mul(4.0), 3, 2.0, 0.5);
      m.colorNode = baseNode.mul(n.mul(0.12).add(1));
      m.roughnessNode = roughU.add(n.abs().mul(0.15));
      break;
    }
    case 'ground': {
      const big = mx_fractal_noise_float(P.mul(0.05), 4, 2.0, 0.5);
      const mid = mx_fractal_noise_float(P.mul(0.6), 3, 2.0, 0.5);
      const peb = mx_worley_noise_float(P.mul(6.0));
      const pebbles = float(1).sub(smoothstep(0.0, 0.18, peb)).mul(detailFade());
      const col = baseNode.mul(big.mul(0.22).add(1)).mul(mid.mul(0.12).add(1)).mul(pebbles.mul(-0.18).add(1));
      m.colorNode = col;
      m.normalNode = bump(mid.mul(0.01).add(pebbles.mul(0.006)), 1);
      break;
    }
    case 'sectile': {
      // opus sectile pavement: large squares, alternately with an inscribed circle and plain,
      // in porphyry, grey granite, giallo antico and white marble, framed by bands
      const sz = uniform(spec.block), C = spec.colors.map((c) => uniform(new Color(c)));
      const g = vec2(P.x, P.z).div(sz);
      const cell = floor(g), f = fract(g).sub(0.5);
      const parity = fract(cell.x.add(cell.y).mul(0.5)).mul(2);           // 0 or 1, a checker
      const band = smoothstep(0.455, 0.47, max(abs(f.x), abs(f.y)));
      const rr = length(f);
      const ring = smoothstep(0.36, 0.37, rr).mul(float(1).sub(smoothstep(0.4, 0.41, rr)));
      const disc = float(1).sub(smoothstep(0.36, 0.37, rr));
      const inner = mix(C[1], C[0], parity);                                // circle: porphyry or granite
      const field = mix(C[2], C[3], parity);                                // the square around it
      let col = mix(field, inner, disc.mul(parity.mul(0.6).add(0.4)));
      col = mix(col, C[3], ring);
      col = mix(col, C[1].mul(0.9), band);
      const vein = mx_noise_float(P.mul(3.0)).mul(detailFade());
      m.colorNode = col.mul(vein.mul(0.06).add(1));
      m.roughnessNode = roughU.add(band.mul(0.2));
      m.normalNode = bump(band.mul(-0.002).add(vein.mul(0.0003)), 1);
      break;
    }
    case 'mosaic': {
      // gold (or coloured) glass tesserae about 3.5 cm, each set at its own small angle, so that
      // each catches the light differently; grey grout between them. Faded with distance.
      // (mirror work uses the same: smaller pieces, steeper tilts, all near-perfect mirrors, in white plaster)
      const tess = uniform(spec.tess ?? 0.035), tilt = uniform(spec.tilt ?? 0.004), spread = uniform(spec.spread ?? 0.35);
      const groutCol = uniform(new Color(spec.grout ?? '#524d45'));
      const q = P.div(tess), cell = floor(q), f = fract(q);
      const id = hash(cell.x.mul(12.9898).add(cell.y.mul(78.233)).add(cell.z.mul(37.719)));
      const id2 = hash(cell.x.mul(4.898).add(cell.y.mul(7.23)).add(cell.z.mul(97.71)));
      const fw = fwidth(q.x).add(fwidth(q.y)).add(fwidth(q.z));
      const aa = float(1).sub(smoothstep(0.25, 0.7, fw));
      const e = min(min(min(f.x, float(1).sub(f.x)), min(f.y, float(1).sub(f.y))), min(f.z, float(1).sub(f.z)));
      const grout = float(1).sub(smoothstep(0.05, 0.14, e)).mul(aa);
      const big = mx_fractal_noise_float(P.mul(0.4), 3, 2.0, 0.5);
      const col = baseNode.mul(mix(float(1), id.mul(0.5).add(0.75), aa)).mul(big.mul(0.1).add(1));
      m.colorNode = mix(col, groutCol, grout.mul(0.7));
      m.metalnessNode = uniform(spec.metalness ?? 1).mul(float(1).sub(grout.mul(0.9)));
      m.roughnessNode = mix(roughU, id2.mul(spread).add(roughU.min(0.12)), aa).add(grout.mul(0.5));
      // the tilt of each tessera: a per-cell slope in the bump (in units of the tessera, so the
      // slope does not change with its size)
      m.normalNode = bump(f.x.mul(id.sub(0.5)).add(f.y.mul(id2.sub(0.5))).add(f.z.mul(id.sub(id2))).mul(tilt).mul(tess.div(0.035)).mul(aa).sub(grout.mul(0.0015)), 1);
      break;
    }
    case 'veined': {
      // marble revetment: slabs sawn from one block and opened like a book, so that the veins of
      // each pair mirror each other; the slab's marble varies through the given colours
      const C = (spec.colors ?? [spec.color, spec.color]).map((c) => uniform(new Color(c)));
      const { u, v } = wallUV();
      const bw = uniform(spec.block ?? 1.2), bh = uniform(spec.course ?? 1.2);
      const cu = floor(u.div(bw)), cv = floor(v.div(bh));
      const fu = fract(u.div(bw)), lv = fract(v.div(bh));
      const odd = fract(cu.mul(0.5)).mul(2);
      const lu = mix(fu, float(1).sub(fu), odd);
      const slab = hash(cv.mul(7.13).add(floor(cu.div(2)).mul(3.71)));
      const nb = C.length - 1;
      let body = C[0];
      for (let i = 1; i < nb; i++) body = select(slab.greaterThan(i / nb), C[i], body);
      const w1 = mx_fractal_noise_float(vec3(lu.mul(2.2), lv.mul(1.4), slab.mul(17.0)), 4, 2.0, 0.5);
      const w2 = mx_noise_float(vec3(lu.mul(0.9).add(w1.mul(0.8)), lv.mul(1.5), slab.mul(5.0)));
      const vw = max(fwidth(w2).mul(1.5), 0.018);
      const vein = float(1).sub(smoothstep(0.0, vw, abs(w2))).mul(0.45).mul(smoothstep(-0.2, 0.3, w1));
      const d = min(min(lu, float(1).sub(lu)).mul(bw), min(lv, float(1).sub(lv)).mul(bh));
      const joint = float(1).sub(smoothstep(0.0015, 0.005, d));
      const cloud = mx_fractal_noise_float(vec3(lu.mul(4.0), lv.mul(4.0), slab.mul(3.0)), 3, 2.0, 0.5);
      let col = mix(body.mul(cloud.mul(0.07).add(1)), C[nb], vein.clamp(0, 1).mul(0.6));
      col = mix(col, col.mul(0.55), joint);
      m.colorNode = col;
      m.roughnessNode = roughU.add(joint.mul(0.3));
      m.normalNode = bump(joint.mul(-0.0015), 1);
      break;
    }
    case 'tiles': {
      // roof of curved tiles (imbrex and tegula): channels down the slope, courses across it
      const n = normalLocal;
      const alongX = abs(n.x).lessThan(abs(n.z));
      const u = select(alongX, P.x, P.z);
      const ph = u.mul(Math.PI * 2 / 0.42);
      const row = floor(P.y.div(0.24));
      const lv = fract(P.y.div(0.24));
      const id = hash(floor(u.div(0.42)).mul(3.1).add(row.mul(17.7)));
      const aa = float(1).sub(smoothstep(0.25, 0.9, fwidth(ph)));
      const ch = sin(ph).mul(aa);
      const lap = float(1).sub(smoothstep(0.0, 0.18, lv)).mul(aa);
      const stain = mx_fractal_noise_float(P.mul(0.3), 3, 2.0, 0.5);
      m.colorNode = baseNode.mul(id.sub(0.5).mul(0.3).mul(aa).add(1)).mul(ch.mul(0.1).add(1)).mul(lap.mul(-0.35).add(1)).mul(stain.mul(0.2).add(1));
      m.normalNode = bump(ch.mul(0.02).add(lv.mul(0.012).mul(aa)), 1);
      break;
    }
    case 'glass': {
      // stained glass seen from inside: small panes of deep colour set in lead, laid out in
      // medallions (the scenes) up each lancet on a blue ground with red flecks, each medallion
      // framed by a band of white and gold; lit by the sky and the sun behind (emissive)
      const along = dot(P.xz, vec2(0.7071, 0.7071));
      const q0 = vec2(along, P.y).mul(vec2(11.0, 9.0));
      const rowS = hash(floor(q0.y).mul(3.17)).mul(0.6);
      const q = vec2(q0.x.add(rowS), q0.y);
      const cell = floor(q), fq = fract(q);
      const id = hash(cell.x.mul(17.31).add(cell.y.mul(91.7)));
      const blue = vec3(0.035, 0.08, 0.42), red = vec3(0.5, 0.03, 0.035), green = vec3(0.06, 0.3, 0.1), gold = vec3(0.62, 0.42, 0.06), violet = vec3(0.25, 0.07, 0.32), white = vec3(0.55, 0.55, 0.5);
      const mq = vec2(along.mul(1.05), P.y.mul(0.85));
      const mcell = floor(mq), mf = fract(mq).sub(0.5);
      const mid = hash(mcell.x.mul(5.3).add(mcell.y.mul(11.9)));
      const r0 = length(mf);
      // shapes: circle, quatrefoil, lozenge
      const quat = r0.mul(float(1).add(abs(mf.x.mul(mf.y)).mul(-3.0)));
      const loz = abs(mf.x).add(abs(mf.y)).mul(0.78);
      const md = select(mid.lessThan(0.4), r0, select(mid.lessThan(0.75), quat, loz));
      const medallion = smoothstep(0.34, 0.31, md);
      const border = smoothstep(0.39, 0.36, md).sub(medallion).clamp(0, 1);
      const ground = select(id.lessThan(0.7), blue, select(id.lessThan(0.9), red, select(id.lessThan(0.96), violet, gold)));
      const scene = select(id.lessThan(0.3), red, select(id.lessThan(0.52), blue, select(id.lessThan(0.64), green, select(id.lessThan(0.76), gold, select(id.lessThan(0.88), white, violet)))));
      let col = mix(ground, scene, medallion);
      col = mix(col, select(hash(cell.x.add(cell.y.mul(3.0))).lessThan(0.5), red, gold), border.mul(0.8));
      const fw = fwidth(q.x).add(fwidth(q.y));
      const lead = float(1).sub(smoothstep(0.05, 0.1, min(min(fq.x, float(1).sub(fq.x)), min(fq.y, float(1).sub(fq.y))))).mul(float(1).sub(smoothstep(0.3, 0.8, fw)));
      const light = ENV.horizon.mul(0.2).add(ENV.sunColor.mul(0.011)).add(ENV.zenith.mul(0.1));
      const streak = mx_noise_float(P.mul(11.0)).mul(0.3).add(1);
      m.colorNode = vec3(0.02, 0.02, 0.025);
      m.emissiveNode = col.mul(light).mul(streak).mul(float(1).sub(lead.mul(0.95)));
      // the sun through the glass: its colour, dimmed, and the leads' shadow
      m.castShadowNode = vec4(col.mul(1.1).mul(float(1).sub(lead.mul(0.9))), 1);
      m.roughnessNode = float(0.2);
      break;
    }
    case 'daylight': {
      // a window seen from inside, glazed clear in a plaster grille of round panes (the Ottoman
      // revzen): the panes lit by the sky behind them, the grille dark against it
      const along = dot(P.xz, vec2(0.7071, 0.7071));
      const g = vec2(along, P.y).mul(3.5);
      const f = fract(g).sub(0.5);
      const pane = spec.plain ? float(1) : smoothstep(0.36, 0.3, length(f)).mul(float(1).sub(smoothstep(0.3, 0.8, fwidth(g.x).add(fwidth(g.y)))).mul(0.6).add(0.4));
      const light = ENV.horizon.mul(1.1).add(ENV.zenith.mul(0.8)).add(ENV.sunColor.mul(0.03));
      m.colorNode = spec.plain ? vec3(0.02, 0.02, 0.02) : vec3(0.55, 0.53, 0.48).mul(float(1).sub(pane));
      m.emissiveNode = light.mul(pane).mul(vec3(1.0, 0.97, 0.9));
      m.roughnessNode = float(0.3);
      break;
    }
    case 'fleur': {
      // painted stone: a ground colour with a gilded motif in a diaper (fleurs-de-lis, castles), or stars
      const C = spec.colors.map((c) => uniform(new Color(c)));
      const { u, v } = wallUV();
      if (spec.grid) {
        // a latticed ceiling of small square coffers: dark ribs on a ground
        const gg = vec2(u, v).div(0.42), ff = fract(gg);
        const rib = float(1).sub(smoothstep(0.06, 0.12, min(min(ff.x, float(1).sub(ff.x)), min(ff.y, float(1).sub(ff.y))))).mul(float(1).sub(smoothstep(0.3, 0.9, fwidth(gg.x).add(fwidth(gg.y)))));
        m.colorNode = mix(C[0], C[1], rib);
        m.roughnessNode = roughU;
        break;
      }
      const sz = spec.stars ? 0.55 : 0.32;
      const g = vec2(u, v).div(sz), cell = floor(g), f = fract(g).sub(0.5);
      const off = fract(cell.y.mul(0.5)).mul(2).mul(0.5);
      const f2 = vec2(fract(g.x.add(off)).sub(0.5), f.y);
      const star = spec.stars
        ? float(1).sub(smoothstep(0.035, 0.07, min(length(f2), abs(f2.x).add(abs(f2.y)).mul(0.55))))
        : float(1).sub(smoothstep(0.1, 0.16, max(abs(f2.x).mul(1.6), abs(f2.y).add(abs(f2.x).mul(0.8)).sub(0.05))));
      const aa = float(1).sub(smoothstep(0.3, 0.9, fwidth(g.x).add(fwidth(g.y))));
      const motif = star.mul(aa).mul(spec.stars ? hash(cell.x.mul(3.1).add(cell.y.mul(7.7))).greaterThan(0.25).select(float(1), float(0)) : float(1));
      const n = mx_fractal_noise_float(P.mul(1.5), 3, 2.0, 0.5);
      m.colorNode = mix(C[0].mul(n.mul(0.08).add(1)), C[1], motif);
      m.metalnessNode = motif.mul(0.85);
      m.roughnessNode = roughU.sub(motif.mul(0.25));
      break;
    }
    case 'timberframe': {
      // plaster between dark oak timbers: posts, rails at sill and lintel height, braces
      const { u, v } = wallUV();
      const pu = fract(u.div(1.1)), pv = fract(v.div(3.0));
      const post = smoothstep(0.08, 0.06, min(pu, float(1).sub(pu)).mul(1.1));
      const rail = smoothstep(0.1, 0.07, min(abs(pv.sub(0.05)), abs(pv.sub(0.36)))).add(smoothstep(0.1, 0.07, abs(pv.sub(0.98))));
      const brace = smoothstep(0.07, 0.04, abs(fract(u.div(2.2).add(v.div(3.0))).sub(0.5))).mul(hash(floor(u.div(2.2)).add(floor(v.div(3.0)).mul(7.0))).greaterThan(0.55).select(float(1), float(0)));
      const aa = float(1).sub(smoothstep(0.2, 0.6, fwidth(u).mul(4)));
      const wood = clamp(post.add(rail).add(brace), 0, 1).mul(aa);
      const n = mx_fractal_noise_float(P.mul(0.8), 3, 2.0, 0.5);
      m.colorNode = mix(baseNode.mul(n.mul(0.12).add(1)), vec3(0.17, 0.11, 0.07), wood);
      m.roughnessNode = roughU;
      break;
    }
    case 'opening': {
      // a window or doorway: the dark of the room within, a little lighter toward its bottom (the
      // floor catching the day); at night about one in seven is lit from inside by an oil lamp or a
      // fire: a dim warm orange, each at its own strength (a lamp near the window, or far back)
      const P2 = positionLocal, cell = floor(P2.mul(0.45)), h = hash(cell.x.add(cell.y.mul(17.0)).add(cell.z.mul(131.0)));
      const lit = smoothstep(0.85, 0.87, h).mul(smoothstep(0.35, 0.8, ENV.night)).mul(hash(h.mul(7.3).add(0.4)).mul(0.6).add(0.4));
      const flick = sin(time.mul(3.0).add(h.mul(40.0))).mul(0.06).add(1);
      m.colorNode = baseNode.mul(fract(P2.y.mul(0.3)).mul(0.15).add(0.92));
      m.emissiveNode = LAMPLIGHT.mul(lit).mul(flick).mul(0.34);
      break;
    }
    case 'glow': {
      // a lantern's shade: its own colour by day, lit from within at dusk and night (a slow flicker).
      // Every separate piece of a glow material is also a lamp that the lamps' pool may light
      // with a real light when the eye is near — how to declare lamps: src/engine/air.js (header)
      // The shade is lit from within: brightest where one looks through it square on toward the
      // flame, darker and redder toward its rim, where the light crosses more paper; kept within the
      // tone curve's saturated range (as bright as its light's power, AgX bleached it to a pale pink)
      const flick = sin(time.mul(7.0).add(positionLocal.x.mul(3.1))).mul(0.06).add(sin(time.mul(2.3).add(positionLocal.z)).mul(0.04)).add(1);
      const face = abs(dot(normalView, normalize(positionView).negate()));
      const glowC = uniform(new Color(spec.glow || spec.color));
      m.colorNode = baseNode;
      m.emissiveNode = mix(glowC.mul(vec3(0.8, 0.45, 0.3)), glowC, face).mul(face.mul(0.6).add(0.4)).mul(float((spec.power ?? 3) * 0.4)).mul(smoothstep(0.15, 0.6, ENV.night)).mul(flick);
      break;
    }
    case 'flame': {
      // a naked flame: a yellow core (where one looks into the flame) and deep orange edges; kept
      // within the tone curve's saturated range (brighter, AgX bleaches it to a pale cream cone)
      m.colorNode = vec3(0, 0, 0);
      m.emissiveNode = flameGlow(sin(time.mul(9.0).add(P.x.mul(13.0))).mul(0.08).add(1));
      break;
    }
    case 'bark': {
      const fiss = mx_worley_noise_float(vec3(P.x.mul(6), P.y.mul(spec.plates ? 1.2 : 0.8), P.z.mul(6)));
      const n = mx_noise_float(P.mul(3.0));
      m.colorNode = baseNode.mul(smoothstep(0.0, 0.35, fiss).mul(0.45).add(0.6)).mul(n.mul(0.12).add(1));
      m.normalNode = bump(smoothstep(0.0, 0.35, fiss).mul(0.01), 1);
      break;
    }
    case 'rock': {
      const n = mx_fractal_noise_float(P.mul(1.2), 4, 2.0, 0.5), f = mx_noise_float(P.mul(9.0)).mul(detailFade());
      const lichen = smoothstep(0.25, 0.5, mx_noise_float(P.mul(0.8).add(3))).mul(smoothstep(0.3, 0.9, normalLocal.y));
      m.colorNode = mix(baseNode.mul(n.mul(0.25).add(1)), vec3(0.42, 0.42, 0.33), lichen.mul(0.35)).mul(f.mul(0.08).add(1));
      m.normalNode = bump(n.mul(0.05).add(f.mul(0.004)), 1);
      break;
    }
    case 'facade': {
      // the face of a tall building: rows of windows (dark glass) in bays on the wall's colour; the
      // tops and roofs plain; seen from afar the grid fades to its average (no moire)
      const { u, v, isTop } = wallUV();
      const g = vec2(u.div(spec.bay ?? 1.6), v.div(spec.storey ?? 3.6)), f = fract(g);
      const hw = float((spec.wu ?? 0.55) / 2), hh = float((spec.wv ?? 0.6) / 2);
      const wx = smoothstep(hw.add(0.04), hw.sub(0.04), abs(f.x.sub(0.5))), wy = smoothstep(hh.add(0.04), hh.sub(0.04), abs(f.y.sub(0.55)));
      let d = wx.mul(wy);
      const fw = max(fwidth(g.x), fwidth(g.y));
      d = mix(d, float((spec.wu ?? 0.55) * (spec.wv ?? 0.6)), smoothstep(0.3, 0.8, fw));
      d = select(isTop, float(0), d);
      const glass = uniform(new Color(spec.glass || '#2a3038'));
      m.colorNode = mix(baseNode, glass, d);
      m.roughnessNode = mix(roughU, float(0.18), d);
      break;
    }
    case 'lattice': {
      // a latticed door or window: thin wooden bars over paper, in one of the Jiangnan patterns
      // (spec.pattern: 'grid' the square lattice, 'ice' cracked ice (bing lie), 'bubujin' step by
      // step brocade, 'lantern' the lantern frame (deng long kuang), 'wan' the swastika fret,
      // 'haitang' the crab-apple quatrefoil); the paper behind is lit through (spec.lit: how much)
      // and glows a little more at night
      const { u, v } = wallUV();
      const c = float(spec.cell ?? 0.09);
      const pat = spec.pattern || (spec.ice ? 'ice' : 'grid');
      const q = vec2(u.div(c), v.div(c));
      const f = fract(q);
      // distance in cells from f to the segment a–b (cell coordinates)
      const seg = (ax, ay, bx, by) => {
        const pa = vec2(f.x.sub(ax), f.y.sub(ay)), ba = vec2(bx - ax, by - ay);
        const h = clamp(dot(pa, ba).div((bx - ax) * (bx - ax) + (by - ay) * (by - ay)), 0, 1);
        return length(pa.sub(ba.mul(h)));
      };
      const edge = (t) => min(t, float(1).sub(t));
      let d, avg = 0.62;
      if (pat === 'ice') {
        const w = mx_worley_noise_float(vec3(q.x, q.y, 0.5));
        d = smoothstep(0.03, 0.07, w); avg = 0.82;
      } else {
        let dist;
        if (pat === 'bubujin') {
          // upright bars every cell, rails every third row, and between them a rail stepping up and down a cell per column
          const m = floor(q.x).sub(floor(q.x.div(4)).mul(4)), p = fract(q.y.div(3)).mul(3);
          const lev = float(2.5).sub(abs(m.sub(2)));
          dist = min(min(edge(f.x), min(p, float(3).sub(p))), abs(p.sub(lev)));
          avg = 0.6;
        } else if (pat === 'lantern') {
          // upright bars, and the rails bunched near the top and foot of each five-cell frame
          const p = fract(q.y.div(5)).mul(5);
          dist = min(min(edge(f.x), min(p, float(5).sub(p))), min(abs(p.sub(1)), abs(p.sub(4))));
          avg = 0.7;
        } else if (pat === 'wan') {
          // the swastika that never ends: each tile's arms turn to the corners and meet the next tile's
          dist = min(min(min(seg(0.5, 0, 0.5, 1), seg(0, 0.5, 1, 0.5)), min(seg(0.5, 1, 1, 1), seg(1, 0.5, 1, 0))), min(seg(0.5, 0, 0, 0), seg(0, 0.5, 0, 1)));
          avg = 0.68;
        } else if (pat === 'haitang') {
          // rings of the crab-apple flower: circles on the cells' centres and on their corners overlapping in four-lobed flowers
          const g = fract(q.add(0.5)).sub(0.5);
          dist = min(abs(length(f.sub(0.5)).sub(0.5)), abs(length(g).sub(0.32)));
          avg = 0.7;
        } else {
          dist = min(edge(f.x), edge(f.y));
        }
        d = smoothstep(0.06, 0.14, dist);
      }
      // seen from afar the bars are finer than a pixel: fade to their average (no moiré)
      const fw = max(fwidth(q.x), fwidth(q.y));
      d = mix(d, float(avg), smoothstep(0.25, 0.7, fw));
      const paper = uniform(new Color(spec.paper || '#e9e2cf'));
      m.colorNode = mix(baseNode, paper, d);
      m.roughnessNode = mix(roughU, float(0.95), d);
      m.normalNode = bump(float(1).sub(d).mul(0.006), 1);
      // by day the paper is lit through by the day beyond it (spec.lit); at night by the oil lamps of
      // the rooms behind: about one room in six (cells of a bay by a storey) lit, each at its own
      // strength, a soft warm glow brightest low in the room where its lamp stands and fading toward
      // the room's edges; the bars stand dark against it. The rest stay dark paper in the moonlight.
      const RB = 3.4, RH = 3.0;
      const rc = floor(positionLocal.div(vec3(RB, RH, RB)));
      const hr = hash(rc.x.mul(7.13).add(rc.y.mul(31.7)).add(rc.z.mul(113.1)));
      const room = smoothstep(0.83, 0.85, hr).mul(hash(hr.mul(17.3).add(0.5)).mul(0.6).add(0.4));
      const pool = smoothstep(0.62, 0.05, length(vec2(fract(u.div(RB)).sub(0.5), fract(v.div(RH)).sub(0.38).mul(1.2))));
      const lamp = LAMPLIGHT.mul(room).mul(pool).mul(0.38).mul(sin(time.mul(2.1).add(hr.mul(40.0))).mul(0.05).add(1));
      const night = smoothstep(0.35, 0.8, ENV.night);
      const day = spec.lit ? paper.mul(float(spec.lit).mul(float(1).sub(ENV.night))) : vec3(0);
      m.emissiveNode = day.add(lamp.mul(night)).mul(d);
      break;
    }
    case 'taihu': {
      // Taihu stone: grey limestone eaten by water into hollows and holes, pale on its ridges
      const w1 = mx_worley_noise_float(P.mul(1.3)), w2 = mx_worley_noise_float(P.mul(4.1).add(3));
      const n = mx_fractal_noise_float(P.mul(2.0), 3, 2.0, 0.5), f = mx_noise_float(P.mul(14.0)).mul(detailFade());
      const pit = smoothstep(0.12, 0.0, w1).add(smoothstep(0.1, 0.0, w2).mul(0.5));
      m.colorNode = baseNode.mul(n.mul(0.18).add(1)).mul(float(1).sub(pit.mul(0.55))).mul(f.mul(0.06).add(1));
      m.normalNode = bump(n.mul(0.04).sub(pit.mul(0.05)).add(f.mul(0.003)), 1);
      break;
    }
    case 'pebbles': {
      // a pebble mosaic path (huajie pudi): grey and white pebbles set on edge in a pattern of
      // interlocking coins, bordered by roof tiles laid on edge
      const g = vec2(P.x, P.z);
      const q = g.div(0.6), cell = floor(q), f = fract(q).sub(0.5);
      const ring = abs(length(f).sub(0.36));
      const line = smoothstep(0.035, 0.015, ring);
      const pq = g.div(0.045), pc = floor(pq), pf = fract(pq).sub(0.5);
      const peb = smoothstep(0.5, 0.25, length(pf));
      const shade = hash(pc.x.mul(12.9898).add(pc.y.mul(78.233)));
      const inner = length(f).lessThan(0.36);
      const tone = select(inner, mix(float(0.55), float(0.7), shade), mix(float(0.78), float(0.95), shade));
      const col = mix(vec3(0.32, 0.31, 0.29), vec3(tone, tone, tone.mul(0.97)), peb.mul(0.85).add(0.15));
      m.colorNode = mix(col, vec3(0.27, 0.28, 0.3), line).mul(baseNode.mul(1.6));
      m.roughnessNode = float(0.9);
      m.normalNode = bump(peb.mul(0.006).add(line.mul(0.003)).mul(detailFade().mul(0.7).add(0.3)), 1);
      void cell;
      break;
    }
    case 'terrain': {
      // ground cover comes per vertex from the region's rules (src/world/regions.js)
      const g = attribute('ground', 'vec4'), g2 = attribute('ground2', 'vec4'), rd = attribute('road', 'float');
      const C = (h) => { const c = new Color(h); return vec3(c.r, c.g, c.b); };
      const fade = detailFade();
      const big = mx_fractal_noise_float(P.mul(0.03), 4, 2.0, 0.5);
      const mid = mx_fractal_noise_float(P.mul(0.35), 3, 2.0, 0.5);
      const fine = mx_noise_float(P.mul(6.0)).mul(fade);
      // sand: wind ripples across the wind, streaks along it
      const wdir = normalize(vec2(0.8, 0.6));
      const along = dot(P.xz, wdir), across = dot(P.xz, vec2(wdir.y.negate(), wdir.x));
      const rphase = along.mul(48.0).add(mx_noise_float(vec3(P.x.mul(0.6), 0, P.z.mul(0.6))).mul(5.0));
      // fade fine patterns before they alias (more than about a cycle per pixel)
      const aaFade = (ph) => float(1).sub(smoothstep(0.25, 0.9, fwidth(ph)));
      // ripples come and go in patches, and are strongest where the sand is loose
      const patch = smoothstep(-0.15, 0.45, mx_noise_float(vec3(P.x.mul(0.07), 0, P.z.mul(0.07))));
      const ripple = sin(rphase).mul(aaFade(rphase)).mul(patch);
      const sand = C('#c8aa80').mul(big.mul(0.16).add(1)).mul(mx_noise_float(vec3(across.mul(0.08), 0, along.mul(0.6))).mul(0.06).add(1));
      // grass: green to straw, in clumps
      const clump = mx_worley_noise_float(P.mul(0.9));
      const grass = mix(C('#66733f'), C('#ad9e6b'), clamp(g2.y.add(mid.mul(0.35)), 0, 1)).mul(smoothstep(0.0, 0.5, clump).mul(0.28).add(0.78));
      // rock: grey limestone or buff sandstone, in strata
      const strata = mx_noise_float(vec3(P.x.mul(0.04), P.y.mul(1.1), P.z.mul(0.04)));
      const rock = mix(C('#9e9a91'), C('#b29470'), g2.z).mul(strata.mul(0.16).add(1)).mul(mid.mul(0.14).add(1));
      // soil: brown, red in Attica, dark silt by the river in Egypt
      let soil = mix(mix(C('#6e5845'), C('#94502e'), g2.w), C('#5b4a39'), g2.z.mul(0.7)).mul(mid.mul(0.15).add(1));
      // fields: plots of crops in strips, separated by earth banks
      // roads: pale beaten earth, with wheel ruts and footprints of dust
      const roadCol = mix(C('#a08a6c'), C('#c2a982'), g2.z).mul(mid.mul(0.12).add(1)).mul(mx_noise_float(P.mul(1.7)).mul(0.08).add(1));
      soil = mix(soil, roadCol, rd);
      const fu = P.x.mul(0.98).add(P.z.mul(0.2)), fv = P.z.mul(0.98).sub(P.x.mul(0.2));
      const row = floor(fv.div(38.0));
      const fuS = fu.add(hash(row.mul(3.7)).mul(16.0));
      const col = floor(fuS.div(15.0));
      const id = hash(col.mul(12.9898).add(row.mul(78.233)));
      const lu = fract(fuS.div(15.0)).mul(15.0), lv = fract(fv.div(38.0)).mul(38.0);
      const edge = min(min(lu, float(15.0).sub(lu)), min(lv, float(38.0).sub(lv)));
      const bank = float(1).sub(smoothstep(0.35, 0.9, edge));
      const crop = select(id.lessThan(0.22), C('#b9a75a'), select(id.lessThan(0.44), C('#7d8f3e'), select(id.lessThan(0.62), C('#4c7230'),
        select(id.lessThan(0.76), C('#64805f'), select(id.lessThan(0.88), C('#6f8a39'), C('#7a634a'))))));
      const rph = lu.mul(Math.PI * 2 / 0.45);
      const rows = sin(rph).mul(0.5).add(0.5).mul(aaFade(rph));
      const fieldCol = mix(crop.mul(rows.mul(0.18).add(0.86)).mul(fine.mul(0.08).add(1)), soil, bank);
      const wsum = g.x.add(g.y).add(g.z).add(g.w).add(g2.x).max(0.001);
      let col3 = sand.mul(g.x).add(grass.mul(g.y)).add(rock.mul(g.z)).add(soil.mul(g.w)).add(fieldCol.mul(g2.x)).div(wsum);
      col3 = col3.mul(fine.mul(0.06).add(1));
      // rain: darker and glossier where the ground faces the sky; puddles in the low spots
      const flat = smoothstep(0.75, 0.95, normalLocal.y);
      const puddle = smoothstep(0.55, 0.75, mx_fractal_noise_float(P.mul(0.12), 2, 2.0, 0.5).mul(-1).add(0.5)).mul(ENV.wet).mul(flat).mul(float(1).sub(g.z));
      const wet = ENV.wet.mul(flat.mul(0.6).add(0.4));
      m.colorNode = col3.mul(float(1).sub(wet.mul(0.38))).mul(float(1).sub(puddle.mul(0.5)));
      m.roughnessNode = float(0.95).sub(wet.mul(0.4)).sub(puddle.mul(0.5)).sub(g.z.mul(0.1));
      const h = ripple.mul(0.0035).mul(g.x).add(mid.mul(0.04)).add(strata.mul(g.z).mul(0.08)).add(rows.mul(g2.x).mul(0.02)).add(bank.mul(g2.x).mul(0.05))
        .add(float(1).sub(smoothstep(0.0, 0.5, clump)).mul(g.y).mul(0.015)).mul(float(1).sub(puddle));
      m.normalNode = bump(h, 1);
      break;
    }
    case 'river': {
      // water: the sky mirrored at a grazing angle, the sun's glitter, a silty body beneath
      const t = time.mul(0.6);
      const flow = vec2(0.0, t.mul(0.9));
      const w1 = mx_noise_float(vec3(P.x.mul(0.18).add(flow.x), P.z.mul(0.12).add(flow.y), t.mul(0.15)));
      const w2 = mx_noise_float(vec3(P.x.mul(0.9), P.z.mul(0.7).add(flow.y.mul(2.0)), t.mul(0.4)));
      const w3 = mx_noise_float(vec3(P.x.mul(3.1), P.z.mul(2.6).add(flow.y.mul(4.0)), t)).mul(detailFade());
      const nrm = normalize(vec3(w1.mul(0.06).add(w2.mul(0.04)).add(w3.mul(0.03)), 1, w1.mul(0.05).add(w2.mul(0.035)).add(w3.mul(0.03))));
      const v = normalize(positionWorld.sub(cameraPosition));
      const r = reflect(v, nrm);
      const fres = float(0.02).add(float(0.98).mul(pow(float(1).sub(max(dot(nrm, v.negate()), 0)), 5)));
      const skyCol = mix(ENV.horizon, ENV.zenith, pow(clamp(r.y, 0, 1), 0.5)).mul(4.5);
      const glint = pow(max(dot(r, ENV.sunDir), 0), 600).mul(ENV.sunColor).mul(6).mul(cloudShadow);
      m.colorNode = baseNode.mul(float(1).sub(fres));
      m.roughness = 1.0;
      m.metalness = 0.0;
      m.emissiveNode = skyCol.mul(fres).add(glint).add(moonGlint(r));
      break;
    }
    case 'water': {
      // still water: ripples moving slowly over it; it mirrors the sky (waterSky, the same sky the
      // reflection pass swaps for the buildings and trees it finds on screen on "high":
      // src/engine/water-reflect.js) by Fresnel, from 2 % looking straight down to all of it at a
      // grazing angle, and the body beneath shows through the rest. The sky is dimmed where a
      // baked volume says the sky is hidden over the water (a basin indoors, a pavilion over it).
      // The sun's glint comes from the light itself (a near-mirror's roughness). The material marks
      // its pixels for the reflection pass (userData.water) and takes no baked reflection of its own.
      // In the rain (ENV.rain, where the sky is open over the water) rain rings all over it, and the
      // ripples rougher: rainRings, two cells' hashes and a sine per layer, only while it rains.
      const t = time.mul(0.35);
      const open = skyOpen(), rainK = ENV.rain.mul(open);
      const w = mx_noise_float(vec3(P.x.mul(0.7).add(t), P.z.mul(0.7), t.mul(0.6))).add(mx_noise_float(vec3(P.x.mul(2.3), P.z.mul(2.3).sub(t), t)).mul(rainK.mul(0.6).add(0.4)));
      m.roughness = 0.04;
      m.roughnessNode = float(0.04).add(rainK.mul(0.08));
      m.metalness = 0.0;
      // (the ripples fade out with distance, before they are finer than a pixel and glitter)
      const dist = length(positionWorld.sub(cameraPosition));
      const far = float(1).sub(smoothstep(12, 60, dist));
      const ring = whenV(ENV.rain.greaterThan(0.02), () => rainRings(P.x, P.z)).mul(smoothstep(16, 3, dist)).mul(rainK.mul(0.5).add(0.5)).mul(smoothstep(0.2, 0.5, open));
      m.normalNode = bump(w.mul(float(0.02).add(rainK.mul(0.012))).mul(far).add(ring.x.mul(0.0012)), 1);
      const v = normalize(positionWorld.sub(cameraPosition)), N = normalize(normalWorld.add(vec3(ring.y, 0, ring.z).mul(0.0012)));
      const r = reflect(v, N);
      const fres = float(0.02).add(float(0.98).mul(pow(float(1).sub(max(dot(N, v.negate()), 0)), 5)));
      m.colorNode = baseNode.mul(float(1).sub(fres));
      m.userData.water = true;
      // at night the moon's broken path across the water, toward the eye (its own glints, wider
      // than the one highlight the moon's light gives a still surface)
      const wn = normalize(vec3(w.mul(0.06), 1, mx_noise_float(vec3(P.z.mul(0.9).sub(t), P.x.mul(0.9), t.mul(0.7))).mul(0.06)));
      const rv = reflect(v, wn);
      m.emissiveNode = waterSky(r).mul(fres).mul(open).add(moonGlint(rv).mul(smoothstep(0.6, 0.9, normalLocal.y)));
      break;
    }
    case 'leaf': {
      // palm leaflets: double sided, a little translucent-looking (brighter, yellower toward the tips)
      const n = mx_noise_float(P.mul(2.0));
      m.colorNode = baseNode.mul(n.mul(0.25).add(1)).mul(vec3(1.0, 1.0, 0.85).mul(hash(floor(P.y.mul(3))).mul(0.2).add(0.9)));
      m.side = DoubleSide;
      m.shadowSide = DoubleSide;
      break;
    }
    case 'foam': {
      // water broken into spray (a fountain's jets and their falls): white, scattering, partly
      // translucent — denser where one looks through more of it (the middle of a jet), thin at its
      // edges — streaked along the flow, the streaks running with time
      const V = normalize(cameraPosition.sub(positionWorld));
      const ndv = abs(dot(normalWorld, V));
      const t = time.mul(2.2);
      const streak = mx_noise_float(vec3(P.x.mul(14.0), P.y.mul(2.2).sub(t), P.z.mul(14.0)));
      const bubbles = mx_worley_noise_float(P.mul(36.0).add(vec3(0, t.mul(0.5), 0)));
      m.colorNode = baseNode.mul(streak.mul(0.06).add(0.96)).mul(smoothstep(0.0, 0.45, bubbles).mul(0.07).add(0.94));
      // the light it scatters: a little of the sky's, so it stays white in shade
      m.emissiveNode = ENV.zenith.mul(0.3).add(ENV.horizon.mul(0.2)).mul(baseNode);
      m.opacityNode = uniform(spec.opacity ?? 0.75).mul(pow(ndv, 0.7).mul(0.7).add(0.3)).mul(streak.mul(0.25).add(0.95)).clamp(0.05, 1);
      m.roughnessNode = roughU.add(streak.abs().mul(0.2));
      m.transparent = true;
      m.depthWrite = false;
      break;
    }
    case 'iznik': {
      // Iznik underglaze tiles: on each square a rosette — four turquoise petals on the axes, four
      // cobalt ones on the diagonals, outlined in dark cobalt round a red heart; at each corner,
      // shared by four tiles, a red disc in a cobalt ring; fine grout between the tiles, each tile
      // set at its own slight angle. Seen from afar the pattern fades to the panel's average.
      const C = spec.colors.map((c) => uniform(new Color(c)));
      const { u, v } = wallUV();
      const sz = uniform(spec.block ?? 0.25);
      const g = vec2(u, v).div(sz), cell = floor(g), f = fract(g).sub(0.5);
      const a = abs(f), b = vec2(max(a.x, a.y), min(a.x, a.y));                 // one eighth of the square
      const id = hash(cell.x.mul(12.9898).add(cell.y.mul(78.233)));
      const id2 = hash(cell.x.mul(4.898).add(cell.y.mul(7.23)));
      const ell = (p, c, rx, ry) => length(p.sub(c).div(vec2(rx, ry)));
      const pAx = ell(b, vec2(0.2, 0.0), 0.12, 0.055);                          // petal on the axis
      const d45 = vec2(b.x.add(b.y), b.x.sub(b.y)).mul(0.7071);
      const pDg = ell(d45, vec2(0.21, 0.0), 0.1, 0.05);                          // petal on the diagonal
      const rc = length(a.sub(0.5));                                             // to the tile's corner
      const r0 = length(f);
      const fw = fwidth(g.x).add(fwidth(g.y)), lw = max(fw.mul(0.7), 0.012);
      const inside = (e) => float(1).sub(smoothstep(float(1).sub(lw.mul(4)), float(1), e));
      const line = (e) => float(1).sub(smoothstep(lw, lw.mul(2), abs(e.sub(1)).mul(0.12)));
      let col = C[0];
      col = mix(col, C[2], inside(pAx));
      col = mix(col, C[1], inside(pDg));
      col = mix(col, C[1].mul(0.55), max(line(pAx), line(pDg)));
      const heart = float(1).sub(smoothstep(0.055, float(0.055).add(lw), r0));
      const heartRing = float(1).sub(smoothstep(0.012, float(0.012).add(lw), abs(r0.sub(0.075))));
      col = mix(col, C[1], heartRing);
      col = mix(col, C[3], heart);
      // at the corner, shared by four tiles: a red bud ringed in cobalt, and four cobalt leaves
      // lying along the joints (half a leaf on each tile)
      const cc = vec2(float(0.5).sub(a.x), float(0.5).sub(a.y));               // from the corner
      const leaf = min(ell(cc, vec2(0.0, 0.16), 0.035, 0.1), ell(vec2(cc.y, cc.x), vec2(0.0, 0.16), 0.035, 0.1));
      col = mix(col, C[1], inside(leaf));
      col = mix(col, C[1].mul(0.55), line(leaf));
      const dot2 = float(1).sub(smoothstep(0.05, float(0.05).add(lw), rc));
      const budRing = float(1).sub(smoothstep(0.01, float(0.01).add(lw), abs(rc.sub(0.065))));
      col = mix(col, C[1], budRing);
      col = mix(col, C[3], dot2);
      // grout (in metres) and the far fade
      const dg = min(float(0.5).sub(a.x), float(0.5).sub(a.y)).mul(sz);
      const aa = float(1).sub(smoothstep(0.08, 0.3, fw));
      const grout = float(1).sub(smoothstep(0.0012, 0.003, dg)).mul(aa);
      col = mix(baseNode, col.mul(id.sub(0.5).mul(0.05).add(1)), aa);
      m.colorNode = mix(col, vec3(0.62, 0.6, 0.56), grout);
      m.roughnessNode = roughU.add(grout.mul(0.6)).add(id2.mul(0.04));
      // the bole red stands in low relief; each tile tilted a little
      const relief = max(heart, dot2).mul(0.0004).mul(aa);
      m.normalNode = bump(f.x.mul(id.sub(0.5)).add(f.y.mul(id2.sub(0.5))).mul(0.0012).mul(aa).add(relief).sub(grout.mul(0.001)), 1);
      break;
    }
    case 'shell': {
      // pāua (abalone) shell: nacre whose colour shifts with the angle of view through blues,
      // greens and violets, in wavy growth bands with dark seams
      const V = normalize(cameraPosition.sub(positionWorld));
      const ndv = clamp(dot(normalWorld, V), 0, 1);
      const bands = mx_fractal_noise_float(P.mul(18.0), 3, 2.0, 0.5);
      const t = ndv.mul(1.3).add(bands.mul(0.9)).mul(Math.PI * 2);
      const rainbow = vec3(cos(t).mul(0.5).add(0.5), cos(t.sub(2.1)).mul(0.5).add(0.5), cos(t.sub(4.2)).mul(0.5).add(0.5));
      const seam = smoothstep(0.04, 0.0, abs(mx_noise_float(P.mul(40.0)))).mul(detailFade());
      const col = mix(baseNode, rainbow.mul(vec3(0.4, 0.72, 0.9)), 0.6).mul(float(1).sub(seam.mul(0.5)));
      m.colorNode = col;
      m.metalnessNode = float(0.55);
      m.roughnessNode = roughU.add(seam.mul(0.3));
      m.normalNode = bump(bands.mul(0.0004), 1);
      break;
    }
    case 'tukutuku': {
      // a tukutuku panel: upright reeds (kākaho) behind, dark wooden laths (kaho) across them, and
      // over the laths cross-stitches of pale kiekie and red-dyed flax in the kaokao pattern
      // (chevrons, the ribs of a warrior); 3 cm stitches
      const C = spec.colors.map((c) => uniform(new Color(c)));
      const { u, v } = wallUV();
      const s = 0.03, g = vec2(u, v).div(s), cell = floor(g), f = fract(g);
      const fm = (x, n) => x.sub(floor(x.div(n)).mul(n));
      const mcol = abs(fm(cell.x, 12).sub(5.5));                                 // 0.5 … 5.5 across a chevron
      const k = fm(cell.y.add(floor(mcol)), 6);
      const stitched = k.lessThan(2);
      const red = fm(floor(cell.y.add(floor(mcol)).div(6)), 2).lessThan(1);
      const reed = sin(u.div(0.0125).mul(Math.PI * 2)).mul(0.5).add(0.5);
      const lath = float(1).sub(smoothstep(0.26, 0.3, abs(f.y.sub(0.5))));
      const xs = float(1).sub(smoothstep(0.12, 0.2, min(abs(f.x.sub(f.y)), abs(f.x.add(f.y).sub(1)))));
      const st = select(stitched, xs, float(0));
      let col = C[0].mul(reed.mul(0.25).add(0.8));
      col = mix(col, C[1], lath);
      col = mix(col, select(red, C[3], C[2]), st);
      const aa = float(1).sub(smoothstep(0.25, 0.8, fwidth(g.x).add(fwidth(g.y))));
      m.colorNode = mix(baseNode, col, aa);
      m.roughnessNode = roughU.sub(lath.mul(0.15));
      m.normalNode = bump(lath.mul(0.003).add(st.mul(0.0015)).add(reed.mul(0.0008)).mul(aa), 1);
      break;
    }
    case 'kowhaiwhai': {
      // kōwhaiwhai, the painted scrolls of the rafters: a running wave of white line on red, each
      // crest curling into a black bulb (the koru) ringed in white; the rows mirrored alternately
      const C = spec.colors.map((c) => uniform(new Color(c)));
      const { u, v } = wallUV();
      const L = 0.24, H = 0.07;
      const fu = fract(u.div(L)), cv = floor(v.div(H)), fv0 = fract(v.div(H));
      const fv = select(fract(cv.mul(0.5)).greaterThan(0.25), float(1).sub(fv0), fv0);
      const wave = sin(fu.mul(Math.PI * 2)).mul(0.26).add(0.5);
      const fw = max(fwidth(u.div(L)), fwidth(v.div(H)));
      const lw = max(fw.mul(1.2), 0.04);
      const wline = float(1).sub(smoothstep(lw, lw.mul(1.6), abs(fv.sub(wave)).mul(H / 0.05)));
      // the koru: below each crest and above each trough, a bulb hanging off the line
      const pa = vec2(fu.sub(0.25).mul(L), fv.sub(0.52).mul(H)), pb = vec2(fu.sub(0.75).mul(L), fv.sub(0.48).mul(H));
      const db = min(length(pa), length(pb));
      const bulb = float(1).sub(smoothstep(0.013, 0.015, db));
      const ringW = float(1).sub(smoothstep(0.003, 0.0045, abs(db.sub(0.019))));
      let col = C[0];
      col = mix(col, C[2], max(wline, ringW));
      col = mix(col, C[1], bulb);
      const aa = float(1).sub(smoothstep(0.2, 0.6, fw));
      m.colorNode = mix(baseNode, col, aa);
      m.roughnessNode = roughU;
      break;
    }
    case 'plates': {
      // a metal roof of cast-iron plates: courses lapped down the slope, a rib over each upright
      // joint, each plate a slightly different grey under the paint
      const n = normalLocal;
      const alongX = abs(n.x).lessThan(abs(n.z));
      const u = select(alongX, P.x, P.z);
      const bw = uniform(spec.block ?? 0.6), ch = uniform(spec.course ?? 0.9);
      const fu = fract(u.div(bw)), row = floor(P.y.div(ch.mul(0.6))), lv = fract(P.y.div(ch.mul(0.6)));
      const id = hash(floor(u.div(bw)).mul(3.1).add(row.mul(17.7)));
      const du = min(fu, float(1).sub(fu)).mul(bw);
      const aa = float(1).sub(smoothstep(0.3, 0.9, fwidth(u.div(bw)).mul(8)));
      const rib = float(1).sub(smoothstep(0.012, 0.022, du)).mul(aa);
      const lap = float(1).sub(smoothstep(0.0, 0.06, lv)).mul(aa);
      const stain = mx_fractal_noise_float(P.mul(0.4), 3, 2.0, 0.5);
      m.colorNode = baseNode.mul(id.sub(0.5).mul(0.12).mul(aa).add(1)).mul(rib.mul(0.12).add(1)).mul(lap.mul(-0.3).add(1)).mul(stain.mul(0.15).add(1));
      m.roughnessNode = roughU.add(stain.abs().mul(0.15));
      m.normalNode = bump(rib.mul(0.012).add(lv.mul(0.006).mul(aa)), 1);
      break;
    }
    case 'mud': {
      // mud plaster as laid by hand: broad lumps, the smears of the palms, straw flecks, and the
      // runnels the rains cut down the walls
      const vertical = float(1).sub(smoothstep(0.5, 0.8, abs(normalLocal.y)));
      const lump = mx_fractal_noise_float(P.mul(1.6), 3, 2.0, 0.5);
      const smear = smoothstep(0.0, 0.5, mx_worley_noise_float(vec3(P.x.mul(4.5), P.y.mul(6.5), P.z.mul(4.5))));
      const runnel = smoothstep(0.5, 0.8, mx_noise_float(vec3(P.x.add(P.z).mul(3.5), P.y.mul(0.22), 0.7))).mul(vertical);
      const fade = detailFade();
      const fine = mx_noise_float(P.mul(28.0)).mul(fade);
      const straw = float(1).sub(smoothstep(0.0, 0.06, mx_worley_noise_float(P.mul(55.0)))).mul(fade).mul(uniform(spec.straw ?? 1));   // lime plasters: no straw
      m.colorNode = baseNode.mul(lump.mul(0.14).add(1)).mul(smear.mul(0.08).add(0.94)).mul(float(1).sub(runnel.mul(0.12))).mul(fine.mul(0.05).add(1)).mul(straw.mul(0.18).add(1));
      m.roughnessNode = roughU;
      m.normalNode = bump(lump.mul(0.03).add(smear.mul(0.004)).sub(runnel.mul(0.006)).add(fine.mul(0.0008)), 1);
      break;
    }
    default: {
      const n = mx_fractal_noise_float(P.mul(0.8), 3, 2.0, 0.5);
      const f = mx_noise_float(P.mul(20.0)).mul(detailFade());
      m.colorNode = baseNode.mul(n.mul(0.1).add(1)).mul(f.mul(0.04).add(1));
      m.normalNode = bump(f.mul(0.0005), 1);
    }
  }
  weatherSurface(m, spec, roughU);
  if (spec.kind === 'lattice') paperLight(m, spec, baseNode);
  return m;
}

// ── paper behind a lattice: lit through from the far side ─────────────────────────────────────
// (kept out of the lattice's own case above, which draws its patterns)
//
// Window paper is a diffuser: the sun and sky on its far side come through it scattered, so that
// from inside a hall latticed on four sides the walls glow, brightest where the sun is on them,
// and at night a lamp inside makes the paper glow seen from the garden. What comes through:
// T · E_far / π, E_far the light on the far side — the sun (its shadows included: the paper casts a
// faint shadow, PAPER.leak of the sun, so the far side's own shadow lookup says whether the eaves
// or a wall keep the sun off it), the lamps, and the baked light past the panel (the probes there,
// or the open sky). The light bake treats the paper the same way (tools/lib/gi-scene.mjs PAPER,
// tools/bake.mjs), so the halls are lit from their paper walls. Only light papers (the dark
// "paper" of grilles and koshi is the dark of an opening, left as it was).
// Cost: one more baked-light read (3 texels) and a few operations per light, on lattice pixels only.
const PAPER = { T: 0.55, leak: 0.04 };

class PaperLightingModel extends PhysicalLightingModel {
  constructor(through) { super(); this.through = through; }
  direct(input, builder) {
    super.direct(input, builder);
    const { lightDirection, lightColor, reflectedLight, lightNode } = input;
    const back = normalView.dot(lightDirection).negate().clamp();
    // a light that casts shadows has already passed the panel's own leak (castShadowNode below):
    // undone, but never past the light's own unshadowed colour — where the panel's own shadow does
    // not fall on its face (a single sheet, a thin panel within the shadow's bias) the light was not
    // dimmed, and the 1/leak made the paper blaze (the moon behind a street's windows lit them white)
    let L = lightColor;
    if (lightNode?.light?.castShadow) { L = L.mul(1 / PAPER.leak); if (lightNode.baseColorNode) L = min(L, lightNode.baseColorNode); }
    reflectedLight.directDiffuse.addAssign(L.mul(back).mul(this.through).mul(1 / Math.PI));
  }
}

function paperLight(m, spec, baseNode) {
  const paper = new Color(spec.paper || '#e9e2cf'), base = new Color(spec.color);
  if (0.2126 * paper.r + 0.7152 * paper.g + 0.0722 * paper.b < 0.35) return;
  const mx = Math.max(paper.r, paper.g, paper.b), tint = vec3(paper.r / mx, paper.g / mx, paper.b / mx);
  // where the paper shows between the bars: the lattice's own mask if it gives one, else read back
  // from its colour, a blend of the bars' colour and the paper's
  let d = m.userData.paperNode;
  if (!d) {
    const dv = new Color(paper.r - base.r, paper.g - base.g, paper.b - base.b), dd = dv.r * dv.r + dv.g * dv.g + dv.b * dv.b;
    d = clamp(dot(m.colorNode.rgb.sub(baseNode), vec3(dv.r, dv.g, dv.b)).div(dd), 0, 1);
  }
  const through = tint.mul(d).mul(PAPER.T);
  m.castShadowNode = vec4(tint.mul(d).mul(PAPER.leak), 1);
  m.setupLightingModel = () => new PaperLightingModel(through);
  if (GI) {
    const far = GI.irradianceNode(normalWorld.negate(), -1);
    const glow = far.mul(through).mul(1 / Math.PI);
    m.emissiveNode = m.emissiveNode ? m.emissiveNode.add(glow) : glow;
  }
}

/** Warm emissive flame for oil lamps. */
export function flameMaterial() {
  const m = new MeshStandardNodeMaterial();
  m.colorNode = vec3(0, 0, 0);
  m.emissiveNode = flameGlow(sin(time.mul(9.0)).mul(0.08).add(1));
  return m;
}

/**
 * A flame's light: the core yellow where the view meets the surface square on, the rim deep orange;
 * divided by the exposure, so that it shows as the eye sees a flame by day, at night and in a dark
 * room alike (a fixed radiance came out a dull tan by day and, at a dark room's exposure, bleached
 * by the tone curve to a pale cream cone)
 */
function flameGlow(flick) {
  const core = pow(abs(dot(normalView, normalize(positionView).negate())), 1.5);
  return mix(vec3(0.75, 0.09, 0.004), vec3(1.5, 0.45, 0.03), core).mul(flick).div(max(toneMappingExposure, 0.05));
}

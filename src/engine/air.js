// The air of a room (DESIGN §5 "Light", §11 Visual L3): dust and incense in the beams of the sun,
// the sun's colour through stained glass carried into the air, the halo of the lamps in smoke, and
// the warm, flickering lamps themselves.
//
// Air: one small pass at half resolution. Along each pixel's ray, from the eye out to `reach`
// metres (never farther than the surface it meets), it samples the nearest sun-shadow cascade a
// dozen times: where the air is in the sun it scatters the sun's light toward the eye, where it is
// behind stained glass the glass's colour (the cascade's colour map, shadowMap.transmitted), and
// behind a wall nothing. The lamps' halos are added in closed form (the integral of 1/r² along the
// ray), and the smoke's glow from the room's own ambient light by the length of the ray. Indoors only
// (the climate's `indoors`), denser where incense burned (temples, mosques, orthodox churches; see
// HAZE); the picture is unchanged outdoors (density zero). On the "high" preset only.
//
// Lamps: a fixed pool of point lights (no shadows) given, four times a second, to the nearest
// lamps of the settlement — the plans' own lamps (`lamp` elements, lights[]) at any hour, and the
// shades of the `glow` materials (lanterns) at dusk and night — fading in and out as they are
// handed over, flickering as flames do. The pool's size is fixed per preset (a change in the number
// of lights would recompile every material): high 4, medium 2, low 0 (renderer.js QUALITY).
//
// HOW TO DECLARE A LAMP (for the plans and the objects):
//   - A lantern, lit at dusk and through the night: give its shade (paper, horn, glass) one of the
//     `glow` materials of src/core/palette.js (lamp_paper, lamp_white, lamp_glass; a new one is
//     { kind: 'glow', color, glow: its light's colour, power }). Nothing else is needed: the shade
//     glows by itself (materials.js 'glow', no cost beyond its own pixels), and every separate
//     piece of a glow material (pieces within 0.6 m of each other are one lantern; one per copy
//     when instanced, as the street life's lanterns are) is a lamp that the pool may light. A flat
//     sheet of a glow material (the lit paper behind a window) glows but is not a lamp.
//   - A flame that burns at any hour (an altar lamp, a brazier, a hearth): a `lamp` element
//     { t: 'lamp', at: [x, y, z], color, intensity (6), distance (9 m), stand } (src/core/build.js);
//     the light bake (tools/bake.mjs) also lights the rooms with these.
//   A settlement may have hundreds: what each costs is its share of the choice below (a distance
//   test four times a second) and its glowing pixels. Only the nearest few (within 40 m, the
//   brightest first, those ahead of the eye before those behind it) are real lights, and a slot with no lamp in it costs nothing in the frame:
//   the lights are LampLights, whose shading is skipped while they are dark (LampLightNode), so by
//   day, with no lamp lit, the pool costs no shading at all.

import { Color, Vector3, Matrix4, PointLight, PointLightNode } from 'three/webgpu';
import {
  Fn, uniform, uv, float, vec2, vec3, vec4, length, normalize, dot, max, min, exp, mix, select, sin, atan, sqrt,
  texture, getViewPosition, screenCoordinate, fract, abs, time, pow, If,
} from 'three/tsl';
import { MATERIALS } from '../core/palette.js';

/** What each frame tells the air (src/engine/renderer.js update). */
export const AIR = {
  sigma: uniform(0),                       // the air's density for the sun's beams (1/m): dust, smoke
  gain: uniform(4),                        // how brightly the motes in a beam catch the light (they scatter far more than they dim)
  incense: uniform(0),                     // the glow of smoke in the room's own light (1/m)
  ambient: uniform(new Color(0, 0, 0)),    // the room's light round the eye (radiance)
  sun: uniform(new Color(0, 0, 0)),        // the light that casts the shadows (sun, or the moon), × its intensity
  dir: uniform(new Vector3(0, 1, 0)),      // toward it
  reach: uniform(28),                      // how far the beams are followed (m): inside the first cascade
};

/**
 * Haze of a building's interior by its style: [dust, incense] — dust 1 is a still room's (beams
 * visible but faint), incense 1 a temple's where it burned all day. Unlisted styles: [1, 0.15].
 */
const HAZE = {
  // incense before the images, all day: Buddhist, Hindu, Daoist and Confucian halls; Egypt, Mesopotamia
  chinese: [1.2, 1], song: [1.2, 1], ming: [1.2, 1], qing: [1.2, 0.9], nara: [1.2, 1], japanese: [1.2, 0.9], edo: [1, 0.5],
  joseon: [1.1, 0.8], tibetan: [1.3, 1.2], dravidian: [1.3, 1.2], nagara: [1.3, 1.1], indian: [1.2, 1], khmer: [1.2, 1], javanese: [1.2, 0.9],
  egyptian: [1.3, 0.9], oldkingdom: [1.2, 0.5], babylonian: [1.2, 0.8], sumerian: [1.2, 0.8], achaemenid: [1.1, 0.5],
  // the orthodox rites: censers through the service
  byzantine: [1.2, 0.9], muscovite: [1.2, 1.1], zagwe: [1.2, 1],
  // the Latin churches: incense at the altar, dust in the high windows' beams
  gothic: [1.3, 0.55], romanesque: [1.3, 0.5], renaissance: [1.2, 0.45], baroque: [1.1, 0.45], venetian: [1.2, 0.5], victorian: [1.2, 0.45], norse: [1.1, 0.4],
  // mosques: aloes wood (oud) and amber in braziers, the light through the screens; dust
  ottoman: [1.3, 0.35], mamluk: [1.3, 0.4], safavid: [1.3, 0.35], islamic: [1.2, 0.35], sahel: [1.4, 0.3], swahili: [1.2, 0.3], mughal: [1.2, 0.3], nasrid: [1.1, 0.25],
  // copal in the Mesoamerican temples
  maya: [1.3, 0.9], aztec: [1.3, 0.9], teotihuacano: [1.2, 0.7],
  // modern rooms: almost clean air
  artdeco: [0.5, 0], modern: [0.5, 0], modernisme: [0.9, 0.2],
};
export const hazeOf = (style = '') => HAZE[style] || HAZE[style.split('-')[0]] || [1, 0.15];

/** A stable per-pixel offset of the samples along the ray: a 4×4 ordered (Bayer) pattern, which the 3×3 average below evens out. */
const ign = (p) => {
  const x = p.x.mod(4).floor(), y = p.y.mod(4).floor();
  // index = 4·bayer2(x, y) + bayer2(x/2, y/2), bayer2(a, b) = (2·(a xor b) + b) for bits a, b
  const a0 = x.mod(2), b0 = y.mod(2), a1 = x.div(2).floor(), b1 = y.div(2).floor();
  const x0 = a0.add(b0).mod(2), x1 = a1.add(b1).mod(2);
  const idx = x0.mul(2).add(b0).mul(4).add(x1.mul(2).add(b1));
  return idx.add(0.5).div(16);
};

/**
 * The air's light at half resolution: vec4(light scattered toward the eye, transmittance).
 * depth: the scene pass's depth texture node; shadow: the nearest cascade's LightShadow (its map
 * made); lamps: the lamp pool (its uniforms).
 */
export function airNode({ depth, camera, shadow, reversed, lamps, steps = 16 }) {
  const projInv = uniform(camera.projectionMatrixInverse), camWorld = uniform(camera.matrixWorld);
  const sM = uniform(shadow.matrix), bias = float(Math.abs(shadow.bias || 0.0004) + 0.0002);
  const dTex = shadow.map.depthTexture, cTex = shadow.map.texture;
  return Fn(() => {
    // outdoors (no dust, no smoke) nothing to add: the whole pass skipped, the same for every pixel
    const out = vec4(0, 0, 0, 1).toVar();
    If(AIR.sigma.add(AIR.incense).greaterThan(0), () => {
      const c = uv();
      const vp = getViewPosition(c, depth.sample(c).r, projInv);
      const L = max(length(vp), 1e-3);
      const dist = min(L, AIR.reach);
      const o = camWorld.mul(vec4(0, 0, 0, 1)).xyz;
      const dir = normalize(camWorld.mul(vec4(vp.div(L), 0)).xyz);
      const j = ign(screenCoordinate.xy);
      const dt = dist.div(steps);
      // the beams: the light at each sample (1 in the sun, the glass's colour behind it, 0 in shade),
      // the dust a little uneven (slow drifting folds), each sample dimmed by the air before it
      let beam = vec3(0);
      const tt = time.mul(0.12);
      for (let i = 0; i < steps; i++) {
        const t = dt.mul(j.add(i));
        const p = o.add(dir.mul(t));
        const sc = sM.mul(vec4(p, 1));
        const q = sc.xyz.div(sc.w);
        const su = vec2(q.x, float(1).sub(q.y));
        const z = reversed ? q.z.add(bias) : q.z.sub(bias);
        const vis = texture(dTex, su).compare(z);
        const tc = texture(cTex, su);
        const lit = mix(vec3(1), mix(tc.rgb, vec3(1), vis), tc.a);
        const inMap = abs(su.x.sub(0.5)).lessThan(0.5).and(abs(su.y.sub(0.5)).lessThan(0.5));
        const folds = sin(p.x.mul(0.9).add(sin(p.z.mul(0.53).add(tt)).mul(1.7)).add(p.y.mul(1.3)).sub(tt.mul(2.0))).mul(0.35)
          .add(sin(p.z.mul(1.7).sub(p.y.mul(0.8)).add(tt.mul(3.1))).mul(0.2)).add(1);
        beam = beam.add(select(inMap, lit, vec3(0)).mul(folds).mul(exp(AIR.sigma.mul(t).mul(-0.5))));
      }
      // Henyey–Greenstein, mostly forward (dust and smoke): the beams brightest looking toward the light
      const g = 0.45, cosT = dot(dir, AIR.dir);
      const phase = float((1 - g * g) / (4 * Math.PI)).div(pow(float(1 + g * g).sub(cosT.mul(2 * g)), 1.5)).add(0.03);
      let col = beam.mul(dt).mul(AIR.sigma).mul(AIR.gain).mul(phase).mul(AIR.sun);
      // the lamps' halos in the smoke: ∫ dt / (h² + (t − t0)²) along the ray, from 0 to dist
      const sl = AIR.sigma.mul(AIR.gain).mul(0.15).add(AIR.incense.mul(1.5));
      for (const lp of lamps.uniforms) {
        const d = lp.pos.sub(o), t0 = dot(d, dir), h2 = max(dot(d, d).sub(t0.mul(t0)), 0.0004), h = sqrt(h2);
        const I = atan(dist.sub(t0).div(h)).add(atan(t0.div(h))).div(h);
        col = col.add(lp.col.mul(I).mul(sl).mul(1 / (4 * Math.PI)));
      }
      // the smoke's own glow in the room's light, drifting in layers
      const layer = sin(o.y.add(dir.y.mul(dist.mul(0.5))).mul(1.1).add(tt.mul(1.4))).mul(0.25).add(1);
      col = col.add(AIR.ambient.mul(float(1).sub(exp(AIR.incense.negate().mul(dist)))).mul(layer));
      const T = exp(AIR.sigma.mul(0.35).add(AIR.incense.mul(0.6)).negate().mul(dist));
      out.assign(vec4(col, T));
    });
    return out;
  })();
}

/**
 * The air laid over the picture: the half-resolution air averaged over 3×3 of its texels, each
 * weighted by how near its depth lies to this pixel's (no halo across the edges of columns).
 */
export function airComposite(color, airTex, depth, camera, texel, zk) {
  const dist = (d) => float(1).div(max(zk.x.mul(d).add(zk.y), 1e-6));
  return Fn(() => {
    const out = vec4(color).toVar();
    // outdoors the air is clear (the pass above wrote nothing): the picture as it is
    If(AIR.sigma.add(AIR.incense).greaterThan(0), () => {
      const c = uv(), zc = dist(depth.sample(c).r);
      const tol = zc.mul(0.03).add(0.08);
      let sum = vec4(0), wsum = float(0);
      // two texels apart: the samples along the rays are offset per pixel (a 4×4 noise), so a wider
      // average takes the grain out of the beams' edges
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        const q = c.add(vec2(i, j).mul(texel).mul(1.5));
        const z = dist(depth.sample(q).r);
        const w = max(float(1).sub(abs(z.sub(zc)).div(tol)), 0).add(i === 0 && j === 0 ? 1e-3 : 0).mul(i === 0 && j === 0 ? 2 : 1);
        sum = sum.add(airTex.sample(q).mul(w)); wsum = wsum.add(w);
      }
      const a = sum.div(wsum);
      out.assign(vec4(color.rgb.mul(a.a).add(a.rgb), color.a));
    });
    return out;
  })();
}

// ── lamps ─────────────────────────────────────────────────────────────────────────────────────

/** Lamps are lit within this distance of the eye (m); beyond it they fade out (a canal street's lanterns are seen 30–40 m off). */
const LAMP_REACH = 40;
const _e = new Vector3(), _v = new Vector3(), _inv = new Matrix4();

/**
 * The lamps of a built part, in its settlement's frame: { p: [x, y, z], color: Color, power,
 * night (true: a lantern's shade, lit at dusk and night only), flame (a naked flame) }.
 * From its plan lights and the shades of its glow materials (grouped into lamps by proximity).
 */
export function lampsOf(built, glowMeshes = []) {
  const out = [];
  for (const l of built.lights || []) out.push({ p: l.at.slice(), color: new Color(l.color || '#ffb46b'), power: (l.intensity ?? 6) * 0.55, range: l.distance ?? 9, night: false, flame: true });
  for (const { mat, geometry, matrices } of glowMeshes) {
    const spec = MATERIALS[mat];
    if (spec?.kind !== 'glow') continue;
    // a paper lantern's light: a warm pool some 3 m round on the walls, the paving and the water
    // beneath it, gone by 10 m
    const color = new Color(spec.glow || spec.color), power = (spec.power ?? 3) * 1.1;
    for (const p of spots(geometry, matrices)) out.push({ p, color, power, range: 10, night: true, flame: false });
  }
  return out;
}

/** Centres of the separate pieces of a geometry (lamp shades): 0.6 m cells, those touching taken as one; per copy if instanced. */
/** A cell's key, a small integer (cells within ±614 m across and −19…+57 m up of the settlement's origin). */
const key = (i, j, l) => ((Math.max(0, Math.min(2047, i + 1024)) * 2048 + Math.max(0, Math.min(2047, l + 1024))) * 128) + Math.max(0, Math.min(127, j + 32));

function spots(geometry, matrices) {
  const pos = geometry.attributes.position;
  if (!pos || !pos.count) return [];
  if (matrices && matrices.length >= 16) {
    // instanced: one lamp per copy, at its shape's centre
    if (!geometry.boundingSphere) geometry.computeBoundingSphere();
    const c = geometry.boundingSphere.center, out = [], m = matrices;
    for (let i = 0; i < m.length; i += 16) out.push([m[i] * c.x + m[i + 4] * c.y + m[i + 8] * c.z + m[i + 12], m[i + 1] * c.x + m[i + 5] * c.y + m[i + 9] * c.z + m[i + 13], m[i + 2] * c.x + m[i + 6] * c.y + m[i + 10] * c.z + m[i + 14]]);
    return out;
  }
  const cells = new Map(), S = 0.6;
  const step = Math.max(1, Math.floor(pos.count / 20000));
  for (let i = 0; i < pos.count; i += step) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const k = key(Math.floor(x / S), Math.floor(y / S), Math.floor(z / S));
    const e = cells.get(k) || cells.set(k, [0, 0, 0, 0, x, y, z, x, y, z]).get(k);
    e[0] += x; e[1] += y; e[2] += z; e[3]++;
    if (x < e[4]) e[4] = x; if (y < e[5]) e[5] = y; if (z < e[6]) e[6] = z; if (x > e[7]) e[7] = x; if (y > e[8]) e[8] = y; if (z > e[9]) e[9] = z;
  }
  // the cells of one shade touch: each group of touching cells is one lamp, at its vertices' mean.
  // A flat piece (a few vertices, all in one plane: the glowing paper behind a lit window) is not a
  // lantern: it glows by its material, but a light there would sit inside the lattice in front of it
  // and blaze through the paper (and the windows of a street, hundreds, took every slot of the pool
  // from the lanterns)
  const out = [], seen = new Set();
  for (const [k0] of cells) {
    if (seen.has(k0)) continue;
    seen.add(k0);
    const acc = [0, 0, 0, 0], stack = [k0];
    let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
    while (stack.length) {
      const k = stack.pop(), e = cells.get(k);
      acc[0] += e[0]; acc[1] += e[1]; acc[2] += e[2]; acc[3] += e[3];
      x0 = Math.min(x0, e[4]); y0 = Math.min(y0, e[5]); z0 = Math.min(z0, e[6]); x1 = Math.max(x1, e[7]); y1 = Math.max(y1, e[8]); z1 = Math.max(z1, e[9]);
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) for (let dl = -1; dl <= 1; dl++) {
        const n = k + (di * 2048 + dl) * 128 + dj;
        if (!seen.has(n) && cells.has(n)) { seen.add(n); stack.push(n); }
      }
    }
    if (acc[3] * step < 8 || Math.min(x1 - x0, y1 - y0, z1 - z0) < 0.02) continue;
    out.push([acc[0] / acc[3], acc[1] / acc[3], acc[2] / acc[3]]);
  }
  return out;
}

/** A point light of the lamps' pool (its node, LampLightNode, registered by the renderer). */
export class LampLight extends PointLight {}

/** A point light whose shading is skipped, for every pixel alike, while the light is dark. */
export class LampLightNode extends PointLightNode {
  static get type() { return 'LampLightNode'; }
  setup(builder) {
    const c = this.colorNode;
    If(c.r.add(c.g).add(c.b).greaterThan(0), () => { super.setup(builder); });
  }
}

/** A fixed pool of point lights given to the nearest lamps. */
export class LampPool {
  constructor(scene, n) {
    this.slots = [];
    this.uniforms = [];
    for (let i = 0; i < n; i++) {
      const light = new LampLight(0xffb46b, 0, 8, 2);
      light.castShadow = false;
      light.name = 'lamp' + i;
      scene.add(light);
      const u = { pos: uniform(new Vector3(0, -1e4, 0)), col: uniform(new Color(0, 0, 0)) };
      this.uniforms.push(u);
      this.slots.push({ light, u, cur: null, fading: false, w: 0, phase: i * 1.7 });
    }
    this.night = 0;
  }

  /**
   * Choose the lamps nearest the eye: sources = [{ list (lampsOf entries), matrix (frame → scene) }].
   * Called four times a second. The eye is taken into each source's frame once (its matrix is
   * rigid), so that each lamp costs a squared distance; only those within reach are placed. A lamp
   * behind the eye (more than a few metres off) counts for a third: its pool is not seen, the next
   * lantern ahead along the street is (this.view: the camera, set by the renderer).
   */
  choose(eye, sources, night) {
    this.night = night;
    if (!this.slots.length) return;
    const lit = (l) => (l.night ? smooth(0.15, 0.6, night) : 1);
    const nightOn = lit({ night: true }) >= 0.02, R2 = LAMP_REACH * LAMP_REACH;
    const cand = [];
    let last = null;
    for (const { list, matrix } of sources) {
      if (matrix !== last) {
        _e.copy(eye).applyMatrix4(_inv.copy(matrix).invert()); last = matrix;
        if (this.view) this.view.getWorldDirection(_v).transformDirection(_inv); else _v.set(0, 0, 0);
      }
      for (const l of list) {
        if (l.night && !nightOn) continue;
        const dx = l.p[0] - _e.x, dy = l.p[1] - _e.y, dz = l.p[2] - _e.z, d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > R2) continue;
        const d = Math.sqrt(d2), ahead = d < 5 ? 1 : 0.33 + 0.67 * smooth(-0.35, 0.3, (dx * _v.x + dy * _v.y + dz * _v.z) / d);
        cand.push({ l, d, matrix, score: l.power * lit(l) * ahead / (1 + d2) });
      }
    }
    if (cand.length > this.slots.length) cand.sort((a, b) => b.score - a.score);
    const want = cand.slice(0, this.slots.length), taken = new Set();
    for (const c of want) c.at = new Vector3(c.l.p[0], c.l.p[1], c.l.p[2]).applyMatrix4(c.matrix);
    // a lamp that has a slot keeps it (its place refreshed); a slot whose lamp is no longer wanted fades out
    for (const s of this.slots) {
      if (!s.cur) continue;
      const k = want.find((c) => c.l === s.cur.l);
      if (k) { s.cur = k; s.fading = false; taken.add(k); } else s.fading = true;
    }
    // the others take the free slots (a fading one once it has faded out)
    for (const c of want) {
      if (taken.has(c)) continue;
      const s = this.slots.find((x) => !x.cur) || this.slots.find((x) => x.fading && x.w < 0.02);
      if (!s) break;
      s.cur = c; s.fading = false; s.w = 0;
    }
  }

  /** Every frame: fades and flicker. t: seconds. */
  update(t, dt) {
    for (const s of this.slots) {
      const { light, u } = s;
      const target = s.cur && !s.fading ? 1 : 0;
      s.w += (target - s.w) * Math.min(1, dt / 0.35);
      if (s.fading && s.w < 0.005) { s.cur = null; s.fading = false; s.w = 0; }
      const c = s.cur;
      if (!c || s.w < 0.002) { if (light.intensity !== 0) light.intensity = 0; u.col.value.setRGB(0, 0, 0); continue; }
      const l = c.l, ph = s.phase;
      // a flame: a quick unsteady flicker; a shade: the slow breathing of the glow material
      const flick = l.flame
        ? 1 + 0.09 * Math.sin(t * 9.1 + ph) + 0.06 * Math.sin(t * 23.7 + ph * 2.3) + 0.04 * Math.sin(t * 3.3 + ph * 0.7)
        : 1 + 0.06 * Math.sin(t * 7.0 + c.at.x * 3.1) + 0.04 * Math.sin(t * 2.3 + c.at.z);
      const fade = 1 - smooth(LAMP_REACH * 0.7, LAMP_REACH, c.d);
      const I = l.power * flick * s.w * fade * (l.night ? smooth(0.15, 0.6, this.night) : 1);
      light.position.copy(c.at);
      // a flame sways a little, and its light with it
      if (l.flame) light.position.x += 0.01 * Math.sin(t * 5.3 + ph);
      light.color.copy(l.color);
      light.intensity = I;
      light.distance = l.range;
      u.pos.value.copy(light.position);
      u.col.value.copy(l.color).multiplyScalar(I);
    }
  }

  dispose() { for (const s of this.slots) s.light.removeFromParent(); this.slots = []; this.uniforms = []; }
}

function smooth(e0, e1, x) { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }

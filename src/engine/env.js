// Shared environment uniforms, written by the climate each frame and read by materials, fog,
// cloud shadows and water. One place so that everything agrees about the sky.

import { Color, Vector2, Vector3, Matrix3, Data3DTexture, RedFormat, UnsignedByteType, RepeatWrapping, LinearFilter } from 'three/webgpu';
import {
  uniform, vec2, vec3, float, Fn, positionWorld, cameraPosition, normalize, dot, max, exp, pow, clamp, smoothstep, mix,
  time, length, normalWorld, texture3D, renderGroup,
} from 'three/tsl';
import { PLANET_RADIUS } from '../planet/sites.js';

export const ENV = {
  sunDir: uniform(new Vector3(0, 1, 0)),
  sunColor: uniform(new Color(1, 1, 1)),        // colour × intensity × weather factor
  zenith: uniform(new Color(0.1, 0.15, 0.3)),
  horizon: uniform(new Color(0.27, 0.28, 0.3)),
  fogColor: uniform(new Color(0.7, 0.7, 0.7)),
  fogDensity: uniform(0.001),
  fogFalloff: uniform(0.012),
  clouds: uniform(0.2),                         // cloud cover 0…1
  wind: uniform(new Vector2(1, 0)),             // cloud drift (m/s at ground scale)
  cloudOffset: uniform(new Vector2(0, 0)),      // integrated drift
  wet: uniform(0),                              // 0 dry … 1 soaked
  damp: uniform(0.4),                           // how damp the place's climate is (moss, rain streaks): 0 desert … 1 Atlantic
  rain: uniform(0),
  snow: uniform(0),                             // snow falling 0…1 (src/planet/setpieces.js)
  dust: uniform(0),                             // dust blowing 0…1
  snowCover: uniform(0),                        // fresh snow lying on the ground and roofs 0…1
  // the season of the open country, for the northern hemisphere (the southern negates them):
  // winter 1 mid-January … −1 mid-July, autumn 1 mid-October … −1 mid-April
  seasonWinter: uniform(0),
  seasonAutumn: uniform(0),
  night: uniform(0),                            // 0 day … 1 full night
  moonDir: uniform(new Vector3(0, -1, 0)),
  moonUp: uniform(0),                           // how much the moon lights the night (0…1)
  // the night's fill light (irradiance from the open sky overhead): the moonlit sky and the
  // starlight, deep blue, set each frame by the renderer (renderer.js update); black by day
  nightFill: uniform(new Color(0, 0, 0)),
  // the scene's frame on the planet (DESIGN §4): planet position = planetO + planetM · scene position
  planetO: uniform(new Vector3(0, PLANET_RADIUS, 0)),
  planetM: uniform(new Matrix3()),
  camAlt: uniform(2),                           // the camera's height above the sea (m)
};

// set once a frame for all: in the render's shared uniform group, not the per-object one (each
// object's group is checked and written at each of its draws, several hundred a frame)
for (const u of Object.values(ENV)) u.setGroup(renderGroup);

/** Planet coordinates (metres from the centre) of the current fragment. */
export const planetPosition = Fn(() => ENV.planetO.add(ENV.planetM.mul(positionWorld)))();
/** Height above the sea of the current fragment. */
export const seaHeight = Fn(() => length(planetPosition).sub(PLANET_RADIUS))();

/**
 * A tiling field of smooth noise (three octaves of value noise, CLOUD_CELLS cells across at the
 * coarsest, CLOUD_N texels a side), baked once: the cloud shadows read it with two lookups instead
 * of computing four octaves of 3D Perlin noise at every pixel (a shared cost of every surface).
 * Scaled to the spread of that noise (mean 0.5, deviation ~0.115).
 */
const CLOUD_N = 64, CLOUD_CELLS = 4;
function cloudField() {
  const N = CLOUD_N, out = new Float32Array(N * N * N);
  const hash = (x, y, z, L) => {
    let h = (((x % L) + L) % L) * 374761393 + (((y % L) + L) % L) * 668265263 + (((z % L) + L) % L) * 2147483647;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const fade = (t) => t * t * (3 - 2 * t);
  for (let o = 0, amp = 1, L = CLOUD_CELLS; o < 3; o++, amp *= 0.5, L *= 2) {
    const k = L / N, lat = new Float32Array(L * L * L);
    for (let i = 0; i < lat.length; i++) lat[i] = hash(i % L, Math.floor(i / L) % L, Math.floor(i / (L * L)), L);
    // per axis: the lattice cells either side and the smoothed weight
    const i0 = new Int32Array(N), i1 = new Int32Array(N), wt = new Float32Array(N);
    for (let x = 0; x < N; x++) { const f = x * k, i = Math.floor(f); i0[x] = i % L; i1[x] = (i + 1) % L; wt[x] = fade(f - i); }
    for (let z = 0; z < N; z++) {
      const z0 = i0[z] * L * L, z1 = i1[z] * L * L, w = wt[z];
      for (let y = 0; y < N; y++) {
        const y0 = i0[y] * L, y1 = i1[y] * L, v = wt[y], row = (z * N + y) * N;
        for (let x = 0; x < N; x++) {
          const a = i0[x], b = i1[x], u = wt[x];
          const c000 = lat[z0 + y0 + a], c100 = lat[z0 + y0 + b], c010 = lat[z0 + y1 + a], c110 = lat[z0 + y1 + b];
          const c001 = lat[z1 + y0 + a], c101 = lat[z1 + y0 + b], c011 = lat[z1 + y1 + a], c111 = lat[z1 + y1 + b];
          const x00 = c000 + (c100 - c000) * u, x10 = c010 + (c110 - c010) * u, x01 = c001 + (c101 - c001) * u, x11 = c011 + (c111 - c011) * u;
          const e0 = x00 + (x10 - x00) * v, e1 = x01 + (x11 - x01) * v;
          out[row + x] += amp * (e0 + (e1 - e0) * w - 0.5);
        }
      }
    }
  }
  let m = 0, q = 0;
  for (const a of out) { m += a; q += a * a; }
  m /= out.length; const sd = Math.sqrt(q / out.length - m * m) || 1;
  const data = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) data[i] = Math.max(0, Math.min(255, Math.round((0.5 + (out[i] - m) / sd * 0.115) * 255)));
  const t = new Data3DTexture(data, N, N, N);
  t.format = RedFormat; t.type = UnsignedByteType;
  t.wrapS = t.wrapT = t.wrapR = RepeatWrapping;
  t.magFilter = t.minFilter = LinearFilter;
  t.generateMipmaps = false; t.unpackAlignment = 1;
  t.needsUpdate = true;
  return t;
}
const CLOUD_TEX = cloudField();

/**
 * Shadow of the clouds on the ground: a drifting field matched to the cloud cover. 1 = sun,
 * down to ~0.25 under a cloud. Drawn in planet coordinates, so it lies over buildings and ground alike.
 * (Two lookups of the baked field, at scales 1 and 1/2.7 turned apart, so that its repeat, 1.4 km,
 * does not show.)
 */
export const cloudShadow = Fn(() => {
  const P = planetPosition.mul(0.0028 / CLOUD_CELLS);
  const o = ENV.cloudOffset.mul(0.0028 / CLOUD_CELLS);
  const q = vec3(P.x.add(o.x), P.y.add(time.mul(0.004 / CLOUD_CELLS)), P.z.add(o.y));
  const T = texture3D(CLOUD_TEX).setGroup(renderGroup);
  const a = T.sample(q).r, b = T.sample(vec3(q.z.add(q.x.mul(0.6)), q.y.mul(0.9).add(0.37), q.x.sub(q.z.mul(0.6))).mul(0.37)).r;
  const n = a.mul(0.7).add(b.mul(0.3)).sub(0.5).mul(1.25).add(0.5);
  const cover = ENV.clouds;
  // the more cover, the lower the threshold: patches merge into overcast
  const shade = smoothstep(float(1).sub(cover).sub(0.08), float(1).sub(cover).add(0.12), n);
  return float(1).sub(shade.mul(clamp(cover.mul(1.6), 0, 0.78)));
})();

/**
 * The night's fill at the current fragment (irradiance): the dim blue of the moonlit sky from above,
 * a third of it from below (the pale paving and walls giving some back). Added to every opaque
 * material's indirect light (renderer.js getGI), so that at night walls, streets and water out of the
 * moon's direct light keep their forms instead of going black.
 */
export const nightFillNode = Fn(() => ENV.nightFill.mul(clamp(normalWorld.y.mul(0.35).add(0.65), 0.3, 1)))();

/** Fog: denser near the ground, glowing toward the sun (aerial perspective). */
export const fogFactor = Fn(() => {
  const toP = positionWorld.sub(cameraPosition);
  const d = length(toP);
  // heights above the sea (on a round planet the far ground falls away below the scene's level)
  const y0 = ENV.camAlt, y1 = seaHeight, k = ENV.fogFalloff;
  // integral of exp(-k y) along the ray, divided by its length
  const dy = y1.sub(y0);
  const avg = select4(dy.abs().lessThan(0.5), exp(k.negate().mul(y0)), exp(k.negate().mul(y0)).sub(exp(k.negate().mul(y1))).div(k.mul(dy)));
  return float(1).sub(exp(ENV.fogDensity.negate().mul(d).mul(avg))).clamp(0, 0.97);
})();

export const fogColor = Fn(() => {
  const v = normalize(positionWorld.sub(cameraPosition));
  const glow = pow(max(dot(v, ENV.sunDir), 0), 8);
  return mix(ENV.fogColor, ENV.fogColor.mul(0.8).add(ENV.sunColor.mul(0.03)), glow);
})();

function select4(c, a, b) { return c.select(a, b); }

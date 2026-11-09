// Reflections in still water (DESIGN §5 "Light": reflections on water): a screen-space reflection
// limited to the water's pixels, at half resolution, on the "high" preset.
//
// The water's materials (materials.js, kind 'water') mark their pixels in the scene pass's normal
// target: the packed normal plus 2 (the target is half float, so the normal keeps its precision);
// every other surface writes its normal in 0…1. This pass reads that mark, so that for the rest of
// the picture it costs one texture read and a branch that is the same for every pixel of a tile.
// For a water pixel it follows the ray reflected about the water's own normal (the ripples
// included) through the depth buffer, 20 steps spaced ever wider out to 90 m and four halvings
// at the first crossing, and returns the colour of the scene where the ray meets it, weighted
// down toward the screen's edges, toward the end of the ray and where the ray passes behind
// something thin. Where it meets nothing (the sky, or what lies outside the picture) the water
// keeps the sky its material already reflects (waterSky below, the same in both places), so the
// composite swaps the material's sky for what the ray found: colour + F · w · (found − sky).
//
// Cost (half resolution, per water pixel): ≤ 24 depth reads, 1 colour read, ~600 ALU; per other
// pixel: 1 read. At the author's 2880×1800 with the pond filling a third of the view, about
// 0.4 M water pixels × 25 reads ≈ 10 M reads a frame: well under a millisecond on the M2.

import { Vector2 } from 'three/webgpu';
import {
  Fn, uniform, uv, float, vec2, vec3, vec4, If, Loop, Break, int, normalize, reflect, dot, max, min, pow, mix, clamp, smoothstep,
  getViewPosition, interleavedGradientNoise, screenCoordinate, unpackRGBToNormal, step,
} from 'three/tsl';
import { ENV } from './env.js';

/**
 * The sky the water mirrors along r (world): the same in the material and in the composite. Low
 * over the water the far shore stands in the way (the banks, walls and trees round a pond or a
 * canal): there, a dim stand-in for them rather than the bright horizon, which made the water a
 * white sheet where nothing was traced (medium and low, and the misses on high). (ENV's horizon
 * and zenith are the climate's sky radiance in the baker's units; × 1.6 matches the sky drawn.)
 */
export const waterSky = (r) => mix(ENV.horizon.mul(0.3), mix(ENV.horizon, ENV.zenith, pow(clamp(r.y, 0, 1), 0.5)), smoothstep(0.03, 0.22, r.y)).mul(1.6);

/** What the water's mark adds to its packed normal in the normal target. */
export const WATER_MARK = 2;

/** The packed normal of the normal target with the water's mark taken off: a view-space direction. */
export const unpackSceneNormal = (n) => unpackRGBToNormal(n.rgb.sub(step(1.5, n.r).mul(WATER_MARK)));

/**
 * The reflection pass: vec4(the scene's colour where the reflected ray meets it, its weight).
 * depth, normal, color: the scene pass's texture nodes; zk: uniform vec2 (a, b) with
 * 1 / distance = a · depth + b (Renderer.update sets it from the projection).
 */
export function waterReflection({ depth, normal, color, camera, zk, steps = 20, reach = 90 }) {
  const proj = uniform(camera.projectionMatrix), projInv = uniform(camera.projectionMatrixInverse), view = uniform(camera.matrixWorldInverse);
  const dist = (d) => float(1).div(max(zk.x.mul(d).add(zk.y), 1e-6));      // depth → distance along −z
  return Fn(() => {
    const c = uv();
    const n4 = normal.sample(c);
    const out = vec4(0, 0, 0, 0).toVar();
    If(n4.r.greaterThan(1.5), () => {
      // the ripples bend the reflection by half as much as they bend the light of the sun's glint:
      // the reflected scene wavers, without breaking up into speckle on a still pond
      const up = normalize(view.mul(vec4(0, 1, 0, 0)).xyz);
      const N = normalize(mix(up, unpackSceneNormal(n4), 0.5)).toVar();
      const P = getViewPosition(c, depth.sample(c).r, projInv).toVar();
      const V = normalize(P);
      const R = reflect(V, N).toVar();
      const jit = interleavedGradientNoise(screenCoordinate.xy);
      const tPrev = float(0).toVar(), tHit = float(-1).toVar();
      Loop({ start: int(0), end: int(steps), type: 'int', condition: '<' }, ({ i }) => {
        const s = float(i).add(jit).add(1).div(steps);
        const t = s.mul(s).mul(reach);
        const Q = P.add(R.mul(t));
        If(Q.z.greaterThan(-0.1), () => { Break(); });
        const clip = proj.mul(vec4(Q, 1));
        const q = clip.xy.div(clip.w).mul(0.5).add(0.5);
        const su = vec2(q.x, float(1).sub(q.y));
        If(su.x.lessThan(0).or(su.x.greaterThan(1)).or(su.y.lessThan(0)).or(su.y.greaterThan(1)), () => { Break(); });
        const dz = Q.z.negate().sub(dist(depth.sample(su).r));
        // crossed behind a surface, and not far behind it (else it passed behind something thin)
        const thick = t.sub(tPrev).mul(1.5).add(Q.z.negate().mul(0.03)).add(0.15);
        If(dz.greaterThan(0).and(dz.lessThan(thick)), () => { tHit.assign(t); Break(); });
        tPrev.assign(t);
      });
      If(tHit.greaterThan(0), () => {
        // the crossing found more closely between the last step in front and the first behind
        const a = tPrev.toVar(), b = tHit.toVar();
        for (let k = 0; k < 4; k++) {
          const m = a.add(b).mul(0.5);
          const Q = P.add(R.mul(m));
          const clip = proj.mul(vec4(Q, 1));
          const q = clip.xy.div(clip.w).mul(0.5).add(0.5);
          const dz = Q.z.negate().sub(dist(depth.sample(vec2(q.x, float(1).sub(q.y))).r));
          If(dz.greaterThan(0), () => { b.assign(m); }).Else(() => { a.assign(m); });
        }
        const Q = P.add(R.mul(b));
        const clip = proj.mul(vec4(Q, 1));
        const q = clip.xy.div(clip.w).mul(0.5).add(0.5);
        const su = vec2(q.x, float(1).sub(q.y));
        const edge = min(min(su.x, float(1).sub(su.x)), min(su.y, float(1).sub(su.y)));
        const w = smoothstep(0.0, 0.06, edge).mul(float(1).sub(smoothstep(0.6, 1.0, b.div(reach))))
          // rays turned back toward the eye find mostly the water's own near shore: let them fade
          .mul(smoothstep(-0.2, 0.15, R.z.negate()));
        out.assign(vec4(min(color.sample(su).level(0).rgb, vec3(6)), w));
      });
    });
    return out;
  })();
}

/**
 * The reflection laid into the picture (before the occlusion and the bloom): on the water's
 * pixels, the material's sky swapped for what the ray found, by Fresnel and the ray's weight.
 * camWorld: the camera's matrixWorld (uniform), for the reflected direction in the world.
 */
export function waterComposite(color, refl, normal, depth, camera, texel) {
  const projInv = uniform(camera.projectionMatrixInverse), camWorld = uniform(camera.matrixWorld);
  return Fn(() => {
    const c = uv();
    const n4 = normal.sample(c);
    const isWater = n4.r.greaterThan(1.5);
    const N = unpackSceneNormal(n4);
    const P = getViewPosition(c, depth.sample(c).r, projInv);
    const V = normalize(P);
    const F = float(0.02).add(float(0.98).mul(pow(float(1).sub(max(dot(N, V.negate()), 0)), 5)));
    const Rw = normalize(camWorld.mul(vec4(reflect(V, N), 0)).xyz);
    // the half-resolution reflection averaged over five of its texels, each by its weight (the
    // rays jitter per pixel, and a thin branch is met by one and missed by the next)
    let sum = vec4(0), wsum = float(1e-4);
    for (const [i, j, k] of [[0, 0, 2], [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1]]) {
      const t = refl.sample(c.add(vec2(i, j).mul(texel)));
      sum = sum.add(vec4(t.rgb.mul(t.a), t.a).mul(k)); wsum = wsum.add(k);
    }
    const r = vec4(sum.rgb.div(max(sum.a, 1e-4)), sum.a.div(wsum));
    const swap = r.rgb.sub(waterSky(Rw)).mul(F.mul(r.a));
    return vec4(color.rgb.add(isWater.select(swap, vec3(0))), color.a);
  })();
}

/** 1 / distance = a · depth + b for a perspective projection (WebGPU depth, plain or reversed). */
export function depthToDistance(camera, out = new Vector2()) {
  const e = camera.projectionMatrix.elements;
  return out.set(1 / e[14], e[10] / e[14]);
}

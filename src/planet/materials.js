// Materials of the planet's ground and sea (TSL). The ground is the settlements' terrain material
// carried onto the sphere: what covers the ground comes per vertex (src/planet/relief.js) — sand,
// grass, rock, soil, fields, roads, and on the open country snow and forest — and the pattern of
// each is drawn in coordinates of the planet's surface (metres east and south, and the height above
// the sea), so that it looks the same everywhere and joins the settlements' ground without a seam.

import { MeshStandardNodeMaterial, Color } from 'three/webgpu';
import {
  Fn, float, vec2, vec3, positionLocal, normalLocal, normalView, positionView, positionWorld, cameraPosition, abs, floor, fract, min, max,
  mix, smoothstep, hash, mx_noise_float, mx_fractal_noise_float, mx_worley_noise_float, dot, cross, normalize, sign, select, time, sin,
  clamp, length, attribute, pow, fwidth, atan, asin, mod, reflect, uniform, If,
} from 'three/tsl';
import { ENV } from '../engine/env.js';
import { PLANET_RADIUS as R } from './sites.js';

const C = (h) => { const c = new Color(h); return vec3(c.r, c.g, c.b); };

/** Normal perturbed by a height field (surface-gradient bump, view space). */
const bump = (h, strength = 1) => {
  const N = normalView;
  const dpdx = positionView.dFdx(), dpdy = positionView.dFdy();
  const hx = h.dFdx().mul(strength), hy = h.dFdy().mul(strength);
  const r1 = cross(dpdy, N), r2 = cross(N, dpdx);
  const det = dot(dpdx, r1);
  const grad = sign(det).mul(hx.mul(r1).add(hy.mul(r2)));
  return normalize(abs(det).mul(N).sub(grad));
};
const detailFade = () => clamp(float(1).sub(length(positionWorld.sub(cameraPosition)).div(60)), 0, 1);

/**
 * Surface coordinates of the current fragment: x east and z south along the parallels and
 * meridians (metres), y the height above the sea; the fine ones wrapped every 2 km so that the
 * noise keeps its precision (the wrap falls in the open country, where fine detail is not seen).
 */
const surfaceCoords = () => {
  const p = positionLocal, r = length(p);
  const lat = asin(p.y.div(r)), lon = atan(p.x, p.z);
  const x = lon.mul(R).mul(lat.cos()), z = lat.mul(-R), y = r.sub(R);
  return { big: vec3(x, y, z), fine: vec3(mod(x, 2048.0), y, mod(z, 2048.0)), up: p.div(r) };
};

/**
 * A value computed only where it is needed: `make` (the expensive noise) runs inside an `if` on
 * `cond`, so a pixel of desert never pays for the grass's Worley noise, the rock's strata, the
 * forest canopy or the puddles; elsewhere the value is `otherwise`. Where a cover's weight is under
 * the threshold its value barely shows. (Derivatives stay outside the branches.)
 */
const when = (cond, make, otherwise = 0) => Fn(() => {
  const v = float(otherwise).toVar();
  If(cond, () => { v.assign(make()); });
  return v;
})();
const ON = 0.004;

export function groundMaterial() {
  const m = new MeshStandardNodeMaterial();
  const g = attribute('ground', 'vec4'), g2 = attribute('ground2', 'vec4'), g3 = attribute('ground3', 'vec4');
  const S = surfaceCoords(), P = S.fine, Pb = S.big;
  const fade = detailFade();
  const big = mx_fractal_noise_float(Pb.mul(0.03), 4, 2.0, 0.5);
  const huge = mx_fractal_noise_float(Pb.mul(0.004), 3, 2.0, 0.5);
  const mid = mx_fractal_noise_float(P.mul(0.35), 3, 2.0, 0.5);
  const fine = when(fade.greaterThan(0), () => mx_noise_float(P.mul(6.0)).mul(fade));
  const aaFade = (w) => float(1).sub(smoothstep(0.25, 0.9, w));
  // sand: wind ripples across the wind, in patches
  const along = P.x.mul(0.8).add(P.z.mul(0.6)), across = P.z.mul(0.8).sub(P.x.mul(0.6));
  const sandOn = g.x.greaterThan(ON);
  // (what feeds the bump's height — ripples, strata, the grass's relief — is computed everywhere:
  // derivatives of values computed in only some pixels of a 2×2 quad are undefined on the GPU and
  // showed as black specks)
  const rnoise = mx_noise_float(vec3(P.x.mul(0.6), 0, P.z.mul(0.6)));
  const rphase = along.mul(48.0).add(rnoise.mul(5.0));
  const patch = smoothstep(-0.15, 0.45, mx_noise_float(vec3(P.x.mul(0.07), 0, P.z.mul(0.07))));
  const ripple = sin(rphase).mul(aaFade(fwidth(along.mul(48.0)))).mul(patch);
  const sandN = when(sandOn, () => mx_noise_float(vec3(across.mul(0.08), 0, along.mul(0.6))));
  const sand = C('#c8aa80').mul(big.mul(0.16).add(1)).mul(huge.mul(0.12).add(1)).mul(sandN.mul(0.06).add(1));
  // grass: green to straw, in clumps; tropical grass richer
  const clump = when(g.y.greaterThan(ON), () => mx_worley_noise_float(P.mul(0.9)), 0.5);
  const grassBase = mix(mix(C('#66733f'), C('#5d7a34'), g2.w), C('#ad9e6b'), clamp(g2.y.add(mid.mul(0.35)).add(huge.mul(0.2)), 0, 1));
  const grass = grassBase.mul(smoothstep(0.0, 0.5, clump).mul(0.28).add(0.78));
  // rock: grey or buff, in strata
  const rockOn = g.z.greaterThan(ON);
  const strata = mx_noise_float(vec3(P.x.mul(0.04), P.y.mul(1.1), P.z.mul(0.04)));
  // red sandstone (Petra, Rajasthan) where the ground is red: rose to ochre in wavy bands
  const bands = when(rockOn.and(g2.w.greaterThan(0.3)), () => sin(P.y.mul(1.7).add(mx_noise_float(vec3(P.x.mul(0.05), P.y.mul(0.2), P.z.mul(0.05))).mul(4.0))));
  const sandstone = mix(C('#8e4433'), C('#b56f47'), bands.mul(0.5).add(0.5)).mul(strata.mul(0.12).add(1));
  const rock = mix(mix(C('#9e9a91'), C('#b29470'), g2.z), sandstone, smoothstep(0.35, 0.75, g2.w)).mul(strata.mul(0.16).add(1)).mul(mid.mul(0.14).add(1));
  let soil = mix(mix(C('#6e5845'), C('#94502e'), g2.w), C('#5b4a39'), g2.z.mul(0.7)).mul(mid.mul(0.15).add(1));
  const roadN = when(g3.x.greaterThan(ON), () => mx_noise_float(P.mul(1.7)));
  const roadCol = mix(C('#a08a6c'), C('#c2a982'), g2.z).mul(mid.mul(0.12).add(1)).mul(roadN.mul(0.08).add(1));
  soil = mix(soil, roadCol, g3.x);
  // fields in strips separated by banks
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
  const rows = sin(rph).mul(0.5).add(0.5).mul(aaFade(fwidth(rph)));
  const fieldCol = mix(crop.mul(rows.mul(0.18).add(0.86)).mul(fine.mul(0.08).add(1)), soil, bank);
  const wsum = g.x.add(g.y).add(g.z).add(g.w).add(g2.x).max(0.001);
  let col3 = sand.mul(g.x).add(grass.mul(g.y)).add(rock.mul(g.z)).add(soil.mul(g.w)).add(fieldCol.mul(g2.x)).div(wsum);
  // the seasons of the open country (src/planet/setpieces.js), outside the tropics and off the
  // settlements' discs (g3.w), which keep their own moment: grass straw in autumn, dun in winter,
  // fresh in spring; the broadleaf belt's canopy turning and then bare; the snow line lower in winter
  const sl = abs(S.up.y), hemi = sign(S.up.y);
  const temperate = smoothstep(0.42, 0.8, sl).mul(float(1).sub(g3.w));
  const autumnK = clamp(ENV.seasonAutumn.mul(hemi), 0, 1).mul(temperate);
  const winterK = clamp(ENV.seasonWinter.mul(hemi), 0, 1).mul(temperate);
  const springK = clamp(ENV.seasonAutumn.mul(hemi).negate(), 0, 1).mul(clamp(float(1).sub(ENV.seasonWinter.mul(hemi).abs()), 0, 1)).mul(temperate);
  const grassShare = g.y.add(g2.x.mul(0.5)).div(wsum);
  let seasonal = mix(col3, col3.mul(vec3(1.22, 1.04, 0.66)), autumnK.mul(0.6));
  seasonal = mix(seasonal, vec3(dot(col3, vec3(0.33, 0.34, 0.33))).mul(vec3(1.08, 0.97, 0.78)), winterK.mul(0.55));
  seasonal = mix(seasonal, col3.mul(vec3(0.9, 1.12, 0.84)), springK.mul(0.4));
  col3 = mix(col3, seasonal, grassShare);
  // forest seen from afar: the dark mottled green of a canopy (trees themselves stand near settlements)
  const canopyN = when(g3.z.greaterThan(ON), () => mx_fractal_noise_float(Pb.mul(0.09), 3, 2.0, 0.5));
  let canopy = mix(C('#2f4224'), C('#46592c'), canopyN.mul(0.5).add(0.5)).mul(mix(float(1), float(0.82), g2.y.mul(0.5)));
  // (broadleaf from ~25° to ~55°; the boreal forest beyond stays dark; conifers mixed in by the noise)
  const broadleaf = smoothstep(0.42, 0.6, sl).mul(smoothstep(0.86, 0.76, sl)).mul(smoothstep(-0.25, 0.15, mid));
  const turned = mix(C('#7d4a1f'), C('#a8782e'), smoothstep(-0.4, 0.5, canopyN.add(mid.mul(0.6))));
  canopy = mix(canopy, turned, autumnK.mul(broadleaf).mul(0.75));
  canopy = mix(canopy, C('#5b5045').mul(canopyN.mul(0.15).add(1)), winterK.mul(broadleaf).mul(0.7));
  col3 = mix(col3, canopy, g3.z.mul(smoothstep(-0.35, 0.1, canopyN)));
  // snow: white with blue shade, thinner where steep; in winter a lower snow line (and the north's
  // lowlands white); and fresh snow lying wherever it has been snowing (ENV.snowCover, on the
  // settlements too)
  const slopeUp = dot(normalLocal, S.up);
  const line = mix(float(165), mix(float(78), float(22), smoothstep(0.66, 0.9, sl)), winterK);
  const winterSnow = max(smoothstep(line, line.add(18), Pb.y), smoothstep(0.82, 0.92, sl).mul(smoothstep(0.35, 0.85, ENV.seasonWinter.mul(hemi))).mul(float(1).sub(g3.w)))
    .mul(winterK.greaterThan(0.001).select(float(1), float(0))).mul(smoothstep(-0.35, 0.05, big.add(huge.mul(0.5))));
  const freshSnow = ENV.snowCover.mul(smoothstep(0.55, 0.85, slopeUp)).mul(smoothstep(-0.55, -0.1, big.add(mid.mul(0.5)).add(ENV.snowCover.mul(0.6))));
  const snowA = max(max(g3.y, winterSnow.mul(0.95)).mul(smoothstep(0.45, 0.75, slopeUp).mul(0.7).add(0.3)), freshSnow);
  col3 = mix(col3, C('#eef1f5').mul(big.mul(0.05).add(0.97)), snowA);
  col3 = col3.mul(fine.mul(0.06).add(1));
  // rain: darker and glossier where the ground faces the sky; puddles in the low spots (the noise
  // only while it is wet: ENV.wet is the same for every pixel)
  const flat = smoothstep(0.75, 0.95, slopeUp);
  const pn = when(ENV.wet.greaterThan(0.001), () => mx_fractal_noise_float(P.mul(0.12), 2, 2.0, 0.5));
  const puddle = smoothstep(0.55, 0.75, pn.mul(-1).add(0.5)).mul(ENV.wet).mul(flat).mul(float(1).sub(g.z)).mul(float(1).sub(g3.y));
  const wet = ENV.wet.mul(flat.mul(0.6).add(0.4));
  m.colorNode = col3.mul(float(1).sub(wet.mul(0.38))).mul(float(1).sub(puddle.mul(0.5)));
  m.roughnessNode = float(0.95).sub(wet.mul(0.4)).sub(puddle.mul(0.5)).sub(g.z.mul(0.1)).sub(snowA.mul(0.25));
  const h = ripple.mul(0.0035).mul(g.x).add(mid.mul(0.04)).add(strata.mul(g.z).mul(0.08)).add(rows.mul(g2.x).mul(0.02)).add(bank.mul(g2.x).mul(0.05))
    .add(float(1).sub(smoothstep(-0.3, 0.3, mx_noise_float(P.mul(0.9)))).mul(g.y).mul(0.015)).mul(float(1).sub(puddle)).mul(float(1).sub(snowA.mul(0.7)));
  m.normalNode = bump(h, 1);
  m.name = 'planet-ground';
  return m;
}

/** The sea: sky mirrored at a grazing angle, the sun's glitter, the shelf showing through near the shore, foam at the beach. */
export function seaMaterial() {
  const m = new MeshStandardNodeMaterial();
  const S = surfaceCoords(), P = S.fine;
  const depth = attribute('depth', 'float');
  const t = time.mul(0.5);
  const w1 = mx_noise_float(vec3(P.x.mul(0.05).add(t.mul(0.3)), t.mul(0.1), P.z.mul(0.05)));
  const w2 = mx_noise_float(vec3(P.x.mul(0.31), t.mul(0.35), P.z.mul(0.27).sub(t.mul(0.6))));
  const w3 = mx_noise_float(vec3(P.x.mul(1.7), t.mul(0.9), P.z.mul(1.5))).mul(detailFade());
  const hgt = w1.mul(0.35).add(w2.mul(0.12)).add(w3.mul(0.03));
  // the surface normal in world space: the planet's up at this point, tilted by the waves
  const nrm = bump(hgt, 1);
  m.normalNode = nrm;
  const shallow = smoothstep(6.0, 0.0, depth);
  const foam = smoothstep(0.6, 0.0, depth).mul(smoothstep(-0.2, 0.5, mx_noise_float(vec3(P.x.mul(0.8), t.mul(1.5), P.z.mul(0.8)))));
  const deep = mix(C('#0d2a3a'), C('#123b44'), mx_fractal_noise_float(S.big.mul(0.002), 2, 2, 0.5).mul(0.5).add(0.5));
  const body = mix(deep, C('#2f6f6a'), shallow.mul(0.8));
  m.colorNode = mix(body, C('#e8ecec'), foam.mul(0.8));
  m.roughnessNode = mix(float(0.04), float(0.6), foam);
  m.metalness = 0;
  m.name = 'planet-sea';
  return m;
}

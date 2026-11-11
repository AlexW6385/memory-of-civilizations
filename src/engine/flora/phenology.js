// The seasons in the leaves: a phenology per species (when it leafs out, flowers, turns, drops
// its leaves) as days of the year (northern hemisphere; 1 Jan = 1, 1 Apr = 91, 1 Jul = 182,
// 1 Oct = 274, 1 Nov = 305, 1 Dec = 335), applied in the foliage material (colour and leaf cover
// of the cards by day, a per-plant random for staggered timing), so no extra geometry and no
// extra draw calls. A species without an entry is evergreen and keeps its plain material.
//
// The day is read from the climate's season numbers (ENV.seasonWinter = cos, ENV.seasonAutumn =
// −sin of the year's angle: src/planet/setpieces.js seasonNow), so ?season=winter|spring|summer|
// autumn (months 1, 4, 7, 10) and the real date both drive it. For a finer test, ?day=N (1…365)
// overrides the day of the year here.
//
// Jiangnan calendar for Ming Suzhou (docs/settlements/ming-suzhou.md "Seasons"): plum blossom
// mid-Feb to mid-Mar (plants stand bare, then flower before the leaves), peach and cherry in
// March–April, willow leafs out early March, catkins in April–May, maple red in November.

import * as THREE from 'three/webgpu';
import { uniform, float, vec3, smoothstep, mix, dot, floor, fract, sin, positionGeometry, instanceColor, step, max, clamp } from 'three/tsl';
import { ENV } from '../env.js';

/**
 * Per species: out [a, b] leaf-out (cover 0 → 1), drop [a, b] leaf fall, turn [a, b] the autumn colour
 * coming on, autumn: [hex, hex] (a leaf's colour between the two by chance), fresh: [r, g, b] colour
 * multiplier of the new leaves (early spring), bloom: { col: [hex, hex], on: [a, b], off: [a, b], share }
 * petals in place of leaves (share: the part of the crown in flower), twig: cover kept in winter (a
 * willow's hanging threads), twigCol: their colour, jitter: days of spread between plants.
 */
export const PHEN = {
  // plum / peach / cherry stand-in (a plant of the Jiangnan gardens flowers before it leafs)
  apple: { out: [88, 118], drop: [318, 350], turn: [292, 322], autumn: ['#c9a13a', '#b9772a'], fresh: [1.25, 1.3, 0.8], bloom: { col: ['#eeb3c4', '#f9e6e8'], on: [35, 52], off: [100, 124], share: 0.9 }, jitter: 12 },
  willow: { out: [58, 88], drop: [338, 362], turn: [312, 338], autumn: ['#c8b04a', '#a8963c'], fresh: [1.5, 1.45, 0.7], twig: 0.42, twigCol: '#8f8445', jitter: 10 },
  maple: { out: [84, 112], drop: [334, 360], turn: [296, 324], autumn: ['#b3261a', '#d1561b'], fresh: [1.2, 1.1, 0.75], jitter: 9 },
  mulberry: { out: [86, 112], drop: [322, 352], turn: [302, 326], autumn: ['#c9b03a', '#b89030'], fresh: [1.3, 1.3, 0.8], jitter: 10 },
  elm: { out: [88, 116], drop: [320, 352], turn: [296, 322], autumn: ['#c8a63a', '#b07a28'], fresh: [1.25, 1.3, 0.8], jitter: 10 },
  plane_tree: { out: [90, 118], drop: [318, 350], turn: [294, 320], autumn: ['#b98a3a', '#9c6a2a'], fresh: [1.2, 1.25, 0.8], jitter: 10 },
  oak: { out: [94, 122], drop: [326, 356], turn: [300, 326], autumn: ['#a9742c', '#8f5a24'], fresh: [1.25, 1.25, 0.8], jitter: 10 },
  poplar: { out: [88, 114], drop: [318, 348], turn: [292, 318], autumn: ['#e2c13a', '#d4a82e'], fresh: [1.3, 1.35, 0.8], jitter: 8 },
  birch: { out: [92, 118], drop: [312, 344], turn: [286, 312], autumn: ['#e0c23c', '#d9a62e'], fresh: [1.3, 1.35, 0.8], jitter: 8 },
  pagoda_tree: { out: [100, 125], drop: [310, 345], turn: [290, 318], autumn: ['#c9b43c', '#b39a2e'], fresh: [1.2, 1.3, 0.8], jitter: 9 },
  persimmon: { out: [95, 120], drop: [305, 335], turn: [280, 305], autumn: ['#d0602a', '#b8431f'], fresh: [1.25, 1.3, 0.8], jitter: 10 },
  jujube: { out: [108, 132], drop: [306, 336], turn: [288, 312], autumn: ['#d2b13a', '#c49a30'], fresh: [1.2, 1.3, 0.8], jitter: 8 },
};

const hexLin = (h) => { const c = new THREE.Color(h); return vec3(c.r, c.g, c.b); };

/** The day of the year as a uniform, updated each frame from the climate's season numbers. */
const asked = typeof location !== 'undefined' ? Number(new URLSearchParams(location.search).get('day')) : 0;
export const DAY = uniform(asked > 0 ? asked : 180).onFrameUpdate(() => {
  if (asked > 0) return;
  const th = Math.atan2(-ENV.seasonAutumn.value, ENV.seasonWinter.value);
  DAY.value = ((th / (2 * Math.PI) * 365.25 + 15) % 365.25 + 365.25) % 365.25;
});

/** The plant's own random, 0…1 (the tint the flora writes in the instance colour's red). */
const plantRandom = () => clamp(instanceColor.x.sub(0.88).div(0.24), 0, 1);

/** The patchy per-plant noise over the crown's cards: 0…1 per ~0.3 m cell. */
function cellNoise(rnd) {
  const cell = floor(positionGeometry.mul(3.4));
  return fract(sin(dot(cell, vec3(12.9898, 78.233, 37.719)).add(rnd.mul(91.7))).mul(43758.5453));
}

/**
 * The seasonal leaf look. base: the colour of the leaves in summer (vec3), lum: their brightness
 * over the texture's average (for the autumn colours' variety), returns { color, keep } where keep
 * (0 or 1) cuts the texels of leaves not on the plant (and the shadow's mask is keep > 0.5).
 */
export function seasonLook(P, base, lum) {
  const rnd = plantRandom();
  const d = DAY.add(rnd.sub(0.5).mul(2 * (P.jitter ?? 10)));
  const S = (a, b) => smoothstep(a, b, d);
  const n = cellNoise(rnd);
  const leaf = S(P.out[0], P.out[1]).mul(float(1).sub(S(P.drop[0], P.drop[1])));
  let cover = mix(float(P.twig ?? 0), float(1), leaf);
  let color = base;
  // new leaves: light and yellow-green, deepening to full green by early summer
  if (P.fresh) {
    const fresh = S(P.out[0], P.out[1]).mul(float(1).sub(S(P.out[1] + 14, P.out[1] + 62)));
    color = mix(color, color.mul(vec3(...P.fresh)), fresh);
  }
  // summer: deep full green
  const summer = S(150, 180).mul(float(1).sub(S(240, 275)));
  color = mix(color, color.mul(vec3(0.88, 0.96, 0.86)), summer);
  // autumn
  if (P.autumn) {
    const turn = S(P.turn[0], P.turn[1]);
    const a = mix(hexLin(P.autumn[0]), hexLin(P.autumn[1]), fract(n.mul(7.31)));
    color = mix(color, a.mul(lum.mul(0.7).add(0.45)), turn);
  }
  // the bare winter twigs (a willow's threads) take their own colour
  if (P.twig) color = mix(hexLin(P.twigCol), color, smoothstep(0.0, 0.5, leaf));
  // blossom: petals on part of the cards, before and among the first leaves
  if (P.bloom) {
    const B = P.bloom;
    const bk = S(B.on[0], B.on[1]).mul(float(1).sub(S(B.off[0], B.off[1])));
    const flowers = step(n, bk.mul(B.share));
    const petal = mix(hexLin(B.col[0]), hexLin(B.col[1]), fract(n.mul(13.7).add(rnd))).mul(lum.mul(0.3).add(0.85));
    // petals take the cards' texels that the leaves have not (leaves come as the petals fall)
    const petalK = flowers.mul(float(1).sub(leaf.mul(0.85)));
    color = mix(color, petal, petalK);
    cover = max(cover, bk.mul(B.share).mul(0.92));
    cover = mix(cover, float(1), leaf);
  }
  return { color, keep: step(n.mul(0.999), cover) };
}

// The wild animals of the open country as shapes (src/planet/wild-fauna.js draws them): the beasts
// of src/objects/animals.js (their lofted horses, camels, llamas, oxen, pigs, dogs, goats and the
// African elephant) with the dimensions of the wild kin — deer, boar, wolf, reindeer, antelope, oryx,
// zebra (the horse, striped), giraffe, bison, guanaco, ibex, a macaque — and a kangaroo and the birds
// made here in the same manner (lofted tubes). Pure: the same in Node (tests, tools) and the page.
//
// A model is arrays per vertex, 14 floats: position (standing), normal, the position with the head
// down (grazing; the blend between them is the instance's), a colour role (0 coat, 1 dark, 2 horn or
// ivory, 3 pale), a part (0 body, 1 head and neck, 2 leg, 3 tail), the leg's weight, and the pivot
// (y, z) the leg or the neck turns about. The shader (wild-fauna.js) strides the legs in diagonal
// pairs, nods the head and lowers it; nothing is moved on the CPU.

import { buildBeast, elephantParts, beastGear, BEASTS } from '../objects/animals.js';
import { assembly, tube, slathe } from '../objects/kit.js';

const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const VSTRIDE = 14;

/** Beast parameters (src/objects/animals.js BEASTS: L body length, H height at the withers, B body radius, neck, na, head, ha, hr, leg …). */
const K = {
  deer: { L: 1.25, H: 1.0, B: 0.2, neck: 0.42, na: 48, head: 0.3, ha: -50, hr: 0.42, leg: 0.03, ears: 0.13, horns: 0.34, back: 1, tail: 'stub', hoof: 1, graze: 1 },
  boar: { L: 1.25, H: 0.85, B: 0.3, neck: 0.1, na: 0, head: 0.46, ha: -22, hr: 0.55, leg: 0.036, ears: 0.1, tail: 'thin', snout: 1, hoof: 1, graze: 1 },
  wolf: { L: 1.0, H: 0.8, B: 0.15, neck: 0.3, na: 40, head: 0.3, ha: -10, hr: 0.55, leg: 0.03, ears: 0.1, tail: 'thin', paw: 1 },
  reindeer: { L: 1.4, H: 1.12, B: 0.22, neck: 0.4, na: 40, head: 0.34, ha: -50, hr: 0.42, leg: 0.036, ears: 0.1, horns: 0.55, back: 1, tail: 'stub', hoof: 1, graze: 1 },
  antelope: { L: 1.0, H: 0.82, B: 0.15, neck: 0.34, na: 50, head: 0.27, ha: -50, hr: 0.4, leg: 0.026, ears: 0.1, horns: 0.3, back: 1, tail: 'thin', hoof: 1, graze: 1 },
  oryx: { L: 1.6, H: 1.25, B: 0.26, neck: 0.46, na: 42, head: 0.44, ha: -45, hr: 0.4, leg: 0.042, ears: 0.14, horns: 0.85, back: 1, tail: 'thin', hoof: 1, graze: 1 },
  horse: { ...BEASTS.horse, L: 1.5, H: 1.32, B: 0.26, leg: 0.044, neck: 0.7 },
  camel: { ...BEASTS.camel },
  giraffe: { L: 1.9, H: 3.1, B: 0.32, neck: 1.9, na: 62, head: 0.55, ha: -28, hr: 0.28, leg: 0.052, ears: 0.14, horns: 0.12, tail: 'thin', hoof: 1, graze: 1 },
  bison: { L: 2.0, H: 1.7, B: 0.45, neck: 0.38, na: 5, head: 0.52, ha: -58, hr: 0.4, leg: 0.065, ears: 0.1, horns: 0.22, hump: 0.36, tail: 'thin', skirt: 1, hoof: 1, graze: 1 },
  llama: { ...BEASTS.llama, L: 1.1, H: 1.22, B: 0.26 },
  ibex: { L: 1.15, H: 0.9, B: 0.2, neck: 0.3, na: 40, head: 0.3, ha: -50, hr: 0.45, leg: 0.034, ears: 0.1, horns: 0.7, back: 1, tail: 'up', beard: 1, hoof: 1, graze: 1 },
  macaque: { L: 0.5, H: 0.4, B: 0.085, neck: 0.1, na: 50, head: 0.13, ha: -15, hr: 0.72, leg: 0.016, ears: 0.03, tail: 'thin', paw: 1 },
  donkey: { ...BEASTS.donkey },
  ox: { ...BEASTS.ox },
};

/** Head, legs and pivots of a lofted beast, from its parameters. */
const rules = (k) => {
  const A = k.L / 2, B = k.B, by = k.H - B * 1.05;
  return { legTop: by - B * 1.18, legFull: by - B * 1.45, legX: B * 0.28, front: [by + B * 0.3, -A * 0.66], hind: [by + B * 0.35, A * 0.68], neck: [by + B * 0.35, -A * 0.72] };
};

/** The models: id → { parts(a, graze), rules, hop, scale (the range of body scales), … }. */
export const MODELS = {};
for (const [id, k] of Object.entries(K)) MODELS[id] = { id, parts: (a, graze) => buildBeast(k, id, graze, a), rules: rules(k), graze: true };
// the elephant (the African: the big ears): no grazing pose, the head and the trunk nod
MODELS.elephant = {
  id: 'elephant', parts: (a) => elephantParts(a, { african: true, tusks: 'long' }), graze: false, paleLeg: true,
  rules: { legTop: 1.0, legFull: 0.7, legX: 0.3, front: [1.55, -0.68], hind: [1.5, 0.86], neck: [1.75, -0.95] }, headTest: (x, y, z) => z < -0.92,
};

// the working beasts of the roads, with their gear: the donkey with its panniers, the camel with its pack saddle and bales,
// the horse with its saddle cloth (travellers.js)
for (const [id, base, kind] of [['donkeyPack', K.donkey, 'donkey'], ['camelPack', K.camel, 'camel'], ['horseGear', K.horse, 'horse']]) {
  MODELS[id] = { id, parts: (a, graze) => { buildBeast(base, kind, graze, a); beastGear(base, kind, a); }, rules: rules(base), graze: true };
}

/** The kangaroo: upright on its hind legs and tail, small forearms, a long face and big ears; grazing, it leans down on its arms. */
function kangarooParts(a, graze) {
  const hide = (g) => a('hide', g), head = (g) => a('hhide', g);
  const lean = graze ? 1 : 0;
  const hip = [0, 0.62, 0.22], sh = [0, 0.98 - 0.36 * lean, -0.2 - 0.22 * lean], nk = [0, 1.15 - 0.55 * lean, -0.3 - 0.36 * lean], hd = [0, 1.26 - 0.7 * lean, -0.4 - 0.5 * lean];
  hide(tube([[0, 0.5, 0.42, 0.14, 0.17], [...hip, 0.22, 0.28], [0, 0.78 - 0.14 * lean, 0.0 - 0.06 * lean, 0.2, 0.28], [...sh, 0.15, 0.2]], 8));
  head(tube([[...sh, 0.1, 0.14], [...nk, 0.07, 0.1], [...hd, 0.075, 0.08]], 7));
  head(tube([[...hd, 0.07, 0.08], [hd[0], hd[1] - 0.04 - 0.08 * lean, hd[2] - 0.2, 0.05, 0.055], [hd[0], hd[1] - 0.07 - 0.1 * lean, hd[2] - 0.32, 0.018, 0.02]], 6));
  for (const s of [-1, 1]) {
    head(tube([[s * 0.04, hd[1] + 0.06, hd[2] + 0.04, 0.035, 0.02], [s * 0.07, hd[1] + 0.2, hd[2] + 0.07, 0.04, 0.02], [s * 0.08, hd[1] + 0.31, hd[2] + 0.08, 0.006]], 5));
    // the hind leg: the big thigh, the shin, the long foot flat on the ground
    hide(tube([[s * 0.1, 0.66, 0.2, 0.1, 0.14], [s * 0.15, 0.38, 0.3, 0.1, 0.12], [s * 0.14, 0.15, 0.4, 0.045, 0.05], [s * 0.13, 0.045, 0.28, 0.03, 0.035], [s * 0.13, 0.03, 0.02, 0.03, 0.025]], 6));
    a('dark', slathe([[0.001, 0], [0.04, 0.003], [0.035, 0.03], [0.001, 0.04]], 6).scale(1, 1, 1.8).translate(s * 0.13, 0, 0.0));
    // the forearm (hanging, or on the ground when grazing)
    hide(tube([[s * 0.09, sh[1] - 0.05, sh[2] + 0.0, 0.04, 0.05], [s * 0.12, sh[1] - 0.22 - 0.1 * lean, sh[2] - 0.08 - 0.1 * lean, 0.028, 0.03], [s * 0.12, Math.max(0.05, sh[1] - 0.38 - 0.35 * lean), sh[2] - 0.13 - 0.12 * lean, 0.022]], 5));
  }
  // the tail: thick at the root, along the ground and tapering
  hide(tube([[0, 0.5, 0.42, 0.1, 0.1], [0, 0.34, 0.8, 0.09, 0.08], [0, 0.17, 1.2, 0.06, 0.055], [0, 0.07, 1.62, 0.03, 0.03], [0, 0.05, 1.85, 0.012]], 6));
  a('pale', tube([[0, 0.9 - 0.34 * lean, -0.16 - 0.2 * lean, 0.11, 0.1], [0, 0.72 - 0.1 * lean, -0.1 - 0.06 * lean, 0.13, 0.16]], 7));
}
MODELS.kangaroo = { id: 'kangaroo', parts: kangarooParts, graze: true, hop: true, rules: { legTop: -9, legFull: -9, legX: 9, front: [0, 0], hind: [0, 0], neck: [0.8, -0.1] } };

// role → [colour code, head?, gear?] (codes: 0 coat, 1 dark, 2 horn, 3 pale, 4 cloth, 5 load, 6 leather)
const ROLE = { hide: [0, 0], hhide: [0, 1], dark: [1, 0], hdark: [1, 1], horn: [2, 1], pale: [3, 1], ivory: [2, 1], cloth: [4, 0, 1], leather: [6, 0, 1], wicker: [5, 0, 1], bale: [5, 0, 1], rope: [5, 0, 1], skin: [6, 0, 1] };

const CACHE = new Map();
/**
 * The model of a kind as typed arrays: { data: Float32Array (VSTRIDE a vertex), n (vertices), tris,
 * height (m, at the head up), length, hop }.
 */
export function beastModel(id) {
  if (CACHE.has(id)) return CACHE.get(id);
  const M = MODELS[id];
  if (!M) throw new Error('no wild model ' + id);
  const up = assembly(`wild|${id}|`, (a) => M.parts(a, false)), gr = M.graze ? assembly(`wild|${id}|g`, (a) => M.parts(a, true)) : up;
  const R = M.rules;
  let n = 0;
  for (const g of Object.values(up)) n += g.attributes.position.count;
  const data = new Float32Array(n * VSTRIDE);
  let o = 0, top = 0, zmin = Infinity, zmax = -Infinity;
  for (const [role, g] of Object.entries(up)) {
    const P = g.attributes.position.array, N = g.attributes.normal.array, G = gr[role]?.attributes.position.array;
    const same = G && G.length === P.length;
    let [code, isHead, gearRole] = ROLE[role] ?? [0, 0, 0];
    if (role === 'pale' && M.paleLeg) isHead = 0;
    for (let i = 0; i < P.length; i += 3, o += VSTRIDE) {
      const x = P[i], y = P[i + 1], z = P[i + 2];
      const head = isHead || (M.headTest && M.headTest(x, y, z));
      let part = head ? 1 : 0, w = 0, pv = [0, 0];
      if (head) pv = R.neck;
      else if (R.legTop > -5 && !gearRole) {
        w = sm(R.legTop, R.legFull, y) * sm(R.legX * 0.8, R.legX * 1.2, Math.abs(x));
        if (w > 0.001) { part = 2; pv = z < 0 ? R.front : R.hind; } else w = 0;
      }
      data.set([x, y, z, N[i], N[i + 1], N[i + 2], same ? G[i] : x, same ? G[i + 1] : y, same ? G[i + 2] : z, code, part, w, pv[0], pv[1]], o);
      top = Math.max(top, y); zmin = Math.min(zmin, z); zmax = Math.max(zmax, z);
    }
  }
  const out = { id, data, n, tris: n / 3, height: top, length: zmax - zmin, hop: !!M.hop };
  CACHE.set(id, out);
  return out;
}

// ── birds ────────────────────────────────────────────────────────────────────
/**
 * One bird for all: a body, a neck of its own length, a head and bill, a tail, two wings and two legs;
 * beak toward −z, wings along ±x, a wing's half-span 1 at scale 1 (the instance's span and neck stretch
 * them). Per vertex 8 floats: position, normal, part (0 body, 1 wing — its s along the wing in the
 * next float, 2 neck and head, 3 bill, 4 tail, 5 leg), s.
 */
export const BSTRIDE = 8;
export function birdModel() {
  if (CACHE.has('bird')) return CACHE.get('bird');
  const out = [];
  const piece = (g, part, s = 0) => {
    const P = g.attributes.position.array, N = g.attributes.normal.array;
    for (let i = 0; i < P.length; i += 3) out.push(P[i], P[i + 1], P[i + 2], N[i], N[i + 1], N[i + 2], part, s);
  };
  // the body: a plump spindle along z, the beak end −z; 0.5 long, wings spanning 1 each side
  piece(tube([[0, 0, -0.2, 0.0, 0.0], [0, 0, -0.15, 0.06, 0.06], [0, 0.005, -0.04, 0.1, 0.095], [0, 0, 0.1, 0.095, 0.09], [0, -0.01, 0.22, 0.055, 0.05], [0, -0.015, 0.3, 0.012, 0.012]], 6, { capA: false, capB: false }), 0);
  // the neck and head, rising a little from the breast (part 2: the instance's neck stretches the neck's length along −z/up)
  piece(tube([[0, 0.02, -0.15, 0.04, 0.04], [0, 0.07, -0.25, 0.028, 0.03], [0, 0.1, -0.3, 0.036, 0.036]], 5), 2);
  piece(tube([[0, 0.1, -0.3, 0.032, 0.03], [0, 0.1, -0.36, 0.02, 0.02], [0, 0.098, -0.43, 0.004, 0.004]], 4), 3);
  // the tail: a short fan
  const fan = (z0, z1, w0, w1, part) => {
    const A = [-w0, 0, z0], B = [w0, 0, z0], C = [w1, 0, z1], D = [-w1, 0, z1], pos = [];
    for (const [p, q, r] of [[A, B, C], [A, C, D], [A, C, B], [A, D, C]]) pos.push(...p, ...q, ...r);
    const g = { attributes: { position: { array: pos }, normal: { array: pos.map((_, i) => (i % 3 === 1 ? ((i / 9 | 0) % 4 < 2 ? 1 : -1) : 0)) } } };
    piece(g, part);
  };
  fan(0.22, 0.48, 0.03, 0.09, 4);
  // the wings: three sections each side, the leading edge forward, the chord narrowing toward the tip; two-sided
  for (const sg of [-1, 1]) {
    const secs = [0, 0.3, 0.65, 1].map((s) => {
      const lead = -0.1 - 0.05 * Math.sin(s * 3.14), chord = 0.3 * (1 - 0.62 * s * s) + 0.03, z = sg * (0.06 + 0.94 * s);
      return [[z, 0.02 - 0.02 * s, lead], [z, 0.02 - 0.03 * s, lead + chord], s];
    });
    for (let k = 0; k < 3; k++) {
      const [a0, a1, s0] = secs[k], [b0, b1, s1] = secs[k + 1], pos = [], sv = [];
      for (const [p, q, r, ss] of [[a0, a1, b1, s0], [a0, b1, b0, s1], [a0, b1, a1, s0], [a0, b0, b1, s1]]) { pos.push(...p, ...q, ...r); sv.push(ss, ss, ss); }
      const nor = []; for (let t = 0; t < 4; t++) for (let v = 0; v < 3; v++) nor.push(0, t < 2 ? 1 : -1, 0);
      const P = pos, S = sv;
      for (let i = 0; i < P.length / 3; i++) out.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2], nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2], 1, Math.min(1, Math.max(0, S[i])));
    }
  }
  // the legs: two thin prisms hanging from the belly (part 5, their length the instance's)
  for (const sg of [-1, 1]) piece(tube([[sg * 0.03, -0.06, 0.04, 0.008], [sg * 0.03, -0.3, 0.06, 0.006], [sg * 0.03, -0.33, 0.02, 0.012]], 4), 5);
  const data = new Float32Array(out);
  const m = { id: 'bird', data, n: data.length / BSTRIDE, tris: data.length / BSTRIDE / 3 };
  CACHE.set('bird', m);
  return m;
}

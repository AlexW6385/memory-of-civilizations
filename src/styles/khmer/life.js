// The plants and things of the Khmer country round Angkor Wat (docs/settlements/angkor.md §14):
// the sugar palm (Borassus flabellifer) standing singly on the rice-field dykes and round the houses,
// the tapper's bamboo ladder tied up its trunk; the palanquin — a hammock slung from a carrying pole,
// as the reliefs of Angkor show it — borne by two men.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { assembly, placer, tube, slathe } from '../../objects/kit.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Triangles (flat array) as a geometry with flat normals, both faces. */
function twoSided(T) {
  const P = [...T];
  for (let i = 0; i < T.length; i += 9) P.push(T[i], T[i + 1], T[i + 2], T[i + 6], T[i + 7], T[i + 8], T[i + 3], T[i + 4], T[i + 5]);
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(P, 3));
  g.computeVertexNormals();
  return g;
}
/** A fan leaf: from the petiole's end c, facing n (unit), spread across u (unit, ⟂ n) and v = n × u; radius R; pleated. */
function fan(T, c, n, u, R, droop = 0) {
  const v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]], m = 14;
  const P = (a, r, f) => [c[0] + (u[0] * Math.cos(a) + v[0] * Math.sin(a)) * r + n[0] * f, c[1] + (u[1] * Math.cos(a) + v[1] * Math.sin(a)) * r + n[1] * f - droop * r * r, c[2] + (u[2] * Math.cos(a) + v[2] * Math.sin(a)) * r + n[2] * f];
  for (let k = 0; k < m; k++) {
    const a0 = -Math.PI * 0.75 + k / m * Math.PI * 1.5, a1 = a0 + Math.PI * 1.5 / m, am = (a0 + a1) / 2, f = k % 2 ? 0.07 : -0.07;
    // each segment a pleat: its rib out to the ragged tip
    T.push(...c, ...P(a0, R, 0), ...P(am, R * 1.06, f), ...c, ...P(am, R * 1.06, f), ...P(a1, R, 0));
  }
}
/** The sugar palm's parts (trunk, leaf, dead, ladder roles), its foot at the origin, about 15 m to the crown. */
function palmParts(a, ladder) {
  const H = 15, r = rng(ladder ? 7 : 3);
  a('trunk', tube([[0, -0.2, 0, 0.36], [0, 0.4, 0, 0.34], [0, 1.6, 0, 0.27], [0, H * 0.5, 0, 0.24], [0, H * 0.85, 0, 0.26], [0, H, 0, 0.3]], 9));
  // the leaf bases clasping the trunk's head
  a('dead', slathe([[0.3, H - 0.3], [0.42, H], [0.45, H + 0.4], [0.3, H + 0.7], [0.001, H + 0.75]], 9));
  const L = [], D = [];
  // the live leaves: a round head of some thirty fans on long stalks, the lower ones level, the upper rising
  for (let k = 0; k < 30; k++) {
    const az = k * 2.39996 + r() * 0.2, el = -0.25 + (k / 30) * 1.3 + (r() - 0.5) * 0.2, st = 1.4 + r() * 0.4;
    const d = [Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el)], b = [d[0] * 0.3, H + 0.45, d[2] * 0.3];
    const c = [b[0] + d[0] * st, b[1] + d[1] * st, b[2] + d[2] * st];
    a('dead', tube([[...b, 0.05], [...c, 0.03]], 4));
    // the blade faces up and out, across the stalk
    const up = [-d[0] * d[1], 1 - d[1] * d[1], -d[2] * d[1]], ul = Math.hypot(...up) || 1, n = [d[0] * 0.5 + up[0] / ul * 0.85, d[1] * 0.5 + up[1] / ul * 0.85, d[2] * 0.5 + up[2] / ul * 0.85], nl = Math.hypot(...n);
    const nn = n.map((x) => x / nl), side = [-Math.sin(az), 0, Math.cos(az)];
    fan(L, c, nn, side, 1.05 + r() * 0.3, 0.07);
  }
  // a skirt of dead leaves hanging down below the crown
  for (let k = 0; k < 9; k++) {
    const az = k * 0.7 + r() * 0.3, b = [Math.cos(az) * 0.32, H - 0.1, Math.sin(az) * 0.32], c = [Math.cos(az) * 0.75, H - 1.0, Math.sin(az) * 0.75];
    a('dead', tube([[...b, 0.045], [...c, 0.03]], 4));
    fan(D, c, [Math.cos(az) * 0.9, -0.3, Math.sin(az) * 0.9].map((x, i, q) => x / Math.hypot(...q)), [-Math.sin(az), 0, Math.cos(az)], 0.7, -0.25);
  }
  a('leaf', twoSided(L)); a('dead', twoSided(D));
  // the tapper's ladder: a bamboo pole tied up the trunk, short rungs lashed across it
  if (ladder) {
    a('ladder', tube([[0.33, 0.0, 0, 0.035], [0.29, H * 0.5, 0, 0.032], [0.33, H - 0.2, 0, 0.03]], 6));
    for (let y = 0.5; y < H - 0.5; y += 0.45) { const x = y < H * 0.5 ? 0.33 - 0.04 * y / (H * 0.5) : 0.29 + 0.04 * (y - H * 0.5) / (H * 0.5); a('ladder', tube([[x, y, -0.2, 0.018], [x + 0.02, y, 0.2, 0.018]], 4)); }
  }
}
/** sugar_palm: { at, y, s (scale), rot, ladder } — a Borassus palm, built once and placed as an instance. */
export function sugarPalm(el, { bag, col }) {
  const A = assembly(`k-sugar-palm|${el.ladder ? 'l' : ''}`, (a) => palmParts(a, !!el.ladder));
  const put = placer({ at: el.at, y: el.y ?? 0, rot: el.rot ?? 0, s: el.s ?? 1 }, bag);
  put('palm_trunk', A.trunk.clone()); put('palm_leaf', A.leaf.clone()); put('thatch_palm', A.dead.clone());
  if (A.ladder) put('bamboo_culm', A.ladder.clone());
  col.circle(el.at[0], el.at[1], 0.32 * (el.s ?? 1), el.y ?? 0, (el.y ?? 0) + 3);
}

/**
 * k_palanquin: { at, y, rot } — a hammock of cloth slung from a long carrying pole whose ends turn up,
 * a cushion in it; the pole along the local x (the bearers stand at its ends, placed by the plan).
 */
export function palanquin(el, { bag }) {
  const A = assembly('k-palanquin', (a) => {
    // the pole, 4.2 m, a little bent, its ends curving up and carved
    a('pole', tube([[-2.2, 1.62, 0, 0.04], [-1.9, 1.5, 0, 0.045], [0, 1.44, 0, 0.05], [1.9, 1.5, 0, 0.045], [2.2, 1.62, 0, 0.04]], 7));
    for (const s of [-1, 1]) a('gilt', slathe([[0.05, 0], [0.07, 0.06], [0.03, 0.16], [0.001, 0.2]], 8).translate(s * 2.2, 1.62, 0));
    // the hammock: a cloth hung from two cords near the ends, sagging into a cradle
    const T = [], n = 12, m = 6;
    const P = (i, j) => { const x = -1.1 + 2.2 * i / n, t = j / m - 0.5, sag = 0.55 * (1 - Math.pow(x / 1.1, 2)); return [x, 1.15 - sag - 0.12 * Math.cos(t * Math.PI) * (1 - Math.abs(x) / 1.3), t * 0.6 * (0.6 + 0.4 * (1 - Math.abs(x) / 1.1))]; };
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) T.push(...P(i, j), ...P(i + 1, j), ...P(i + 1, j + 1), ...P(i, j), ...P(i + 1, j + 1), ...P(i, j + 1));
    a('cloth', twoSided(T));
    for (const s of [-1, 1]) for (const z of [-0.18, 0.18]) a('cord', tube([[s * 1.45, 1.46, 0, 0.012], [s * 1.1, 1.15, z, 0.012]], 3));
    a('cushion', slathe([[0.001, 0], [0.16, 0.01], [0.2, 0.08], [0.16, 0.15], [0.001, 0.16]], 10).scale(1.6, 1, 1).translate(-0.35, 0.62, 0));
  });
  const put = placer({ at: el.at, y: el.y ?? 0, rot: el.rot ?? 0 }, bag);
  put('lacquer_red', A.pole.clone()); put('clay_gilt', A.gilt.clone()); put(el.cloth ?? 'cloth_red', A.cloth.clone()); put('rope_fibre', A.cord.clone()); put('cloth_ochre', A.cushion.clone());
}

/** k_parasol: { at, y (the canopy's foot), cloth } — the canopy of a parasol borne on a staff: a shallow dome of cloth, its fringe, a gilt finial. */
export function parasol(el, { bag }) {
  const A = assembly('k-parasol', (a) => {
    a('cloth', slathe([[0.62, -0.04], [0.6, 0.0], [0.5, 0.12], [0.3, 0.22], [0.1, 0.27], [0.001, 0.28]], 16));
    a('cloth', slathe([[0.001, 0.25], [0.29, 0.19], [0.48, 0.09], [0.58, -0.01], [0.6, -0.04]], 16));
    a('fringe', slathe([[0.62, -0.16], [0.63, -0.04], [0.61, -0.04], [0.6, -0.16]], 16));
    a('gilt', slathe([[0.03, 0.26], [0.05, 0.34], [0.03, 0.42], [0.001, 0.46]], 8));
    a('gilt', slathe([[0.025, -0.2], [0.025, 0.26], [0.001, 0.26]], 6));
  });
  const put = placer({ at: el.at, y: el.y ?? 0, rot: 0 }, bag);
  put(el.cloth ?? 'cloth_red', A.cloth.clone()); put('clay_gilt', A.fringe.clone()); put('clay_gilt', A.gilt.clone());
}

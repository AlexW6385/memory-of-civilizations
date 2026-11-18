// The Chalke's east lunette in mosaic (docs/settlements/constantinople.md §4.11): over the palace door "in the middle the emperor and Theodora rejoicing over the captive Vandal and
// Gothic kings, the Senate round them" (Procopius, Buildings I.10) [stated]. The shared Chalke draws them as flattened mannequins; here each is a modelled figure in low relief
// (the Parthenon body kit squeezed to 4–7 cm): the emperor and the empress in purple with the gold nimbus, the kings bowed before them, the senators in white, face and neck in
// flesh tones, drapery with folds that follow the body, laid on the lunette's gold a little proud of the old figures, which they hide. [inferred: poses, numbers, colours]
import { STYLES } from '../../core/build.js';
import { lathe } from '../../core/geom.js';
import { Float32BufferAttribute } from '../../core/three.js';
import { bodyOf, setFigure, reliefSqueeze } from '../../buildings/parthenon/bodies.js';
import '../../styles/roman/town.js';

/** The triangles of g with their centre above (or below) y. */
function part(g, y, above) {
  const P = g.attributes.position.array, N = g.attributes.normal.array, p = [], n = [];
  for (let i = 0; i < P.length; i += 9) { const c = (P[i + 1] + P[i + 4] + P[i + 7]) / 3; if ((c >= y) === above) for (let k = 0; k < 9; k++) { p.push(P[i + k]); n.push(N[i + k]); } }
  const out = g.clone(); out.setAttribute('position', new Float32BufferAttribute(p, 3)); out.setAttribute('normal', new Float32BufferAttribute(n, 3)); out.index = null;
  return out;
}

export function cnChalkeLunette(el, { bag }) {
  const [cx, cz] = el.c, y0 = el.y, s = 6, xw = cx + s - 0.2;                // the plane the figures stand on, 20 cm off the wall
  const ys = y0 + 7.6 + 0.35;
  const people = [
    [-4.3, 'cloth_white', 2.0, 0], [-3.4, 'cloth_white', 2.0, 0], [-2.5, 'cloth_white', 2.0, 0],
    [-1.2, 'cloth_red', 2.4, 1], [-0.4, 'cloth_grey', 1.4, 2], [0.4, 'cloth_ochre', 1.4, 2], [1.2, 'cloth_red', 2.3, 3],
    [2.5, 'cloth_white', 2.0, 0], [3.4, 'cloth_white', 2.0, 0], [4.3, 'cloth_white', 2.0, 0],
  ];
  for (const [dz, cloth, h, role] of people) {
    if (Math.abs(dz) > Math.sqrt(Math.max(0, (s - 0.35) ** 2 - (h + 0.35) ** 2))) continue;
    const bow = role === 2, fem = role === 3;
    const fig = bodyOf({ pose: 'stand', drape: 'chiton', female: fem, beard: role === 0 || bow, lod: 1, hair: fem ? 'bun' : bow ? 'curls' : 'curls', pitch: bow ? 28 : 0,
      cloak: role === 1 || fem ? { dir: [-1, -0.4, -0.1], len: 0.5, w: 0.2 } : undefined, arms: bow ? { R: [-0.17, 0.5, 0.18], L: [0.17, 0.5, 0.18] } : undefined });
    const jz = 0.03 * Math.sin(dz * 12.9);
    const g = setFigure(fig, h, xw, ys, cz + dz + jz, -Math.PI / 2, reliefSqueeze(0.5, 0)).stone;
    const cut = ys + 0.845 * h;
    bag.add(cloth, part(g, cut, false)); bag.add('skin_light', part(g, cut, true));
    if (role === 1 || fem) {                                                  // the gold nimbus behind the head
      const halo = lathe(Array.from({ length: 9 }, (_, i) => { const a = i / 8 * Math.PI; return [Math.max(0.001, Math.sin(a) * 0.3), 0.3 - Math.cos(a) * 0.3]; }), 16).scale(0.05, 1, 1).translate(xw + 0.01, ys + 0.915 * h, cz + dz + jz);
      halo.rotateZ(0); bag.add('gold', halo);
    }
  }
}
Object.assign(STYLES.roman.elements, { cn_chalke_lunette: cnChalkeLunette });

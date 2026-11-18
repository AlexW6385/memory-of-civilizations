// The Porta della Carta's figures, the corner groups of the Doge's Palace, the Tetrarchs.
import { CV, GB, at, put, person, bodyOf, skeleton, V, blob, limb, tube, lionModel, ring, hash, flip } from './stone.js';
import { faceFrame } from '../renaissance/face.js';
import { Matrix4 } from '../../core/three.js';
import { lathe } from '../../core/geom.js';

const TAU = Math.PI * 2;
/** Joints of a kneeling figure (units of the height): the knees down, the feet behind, the hands to the chest. */
export const KNEE = {
  pose: 'seat', legBendR: [0, 0.15, 1], legBendL: [0, 0.15, 1],
  J: { pelvis: [0, 0.3, -0.04], chest: [0, 0.46, -0.02], neck: [0, 0.6, 0.0], head: [0, 0.69, 0.02], shR: [-0.118, 0.575, -0.02], shL: [0.118, 0.575, -0.02],
    hipR: [-0.058, 0.29, -0.03], hipL: [0.058, 0.29, -0.03], anR: [-0.06, 0.035, -0.3], anL: [0.06, 0.035, -0.3], wrR: [-0.03, 0.5, 0.14], wrL: [0.03, 0.5, 0.14] },
};
/** The doge's cap (the corno) on a head at J.head, in units of the height. */
function corno(head) {
  return [blob(V.add(head, [0, 0.05, -0.005]), 0.06, [1, 0.55, 1.05], 8),
    tube([V.add(head, [0, 0.07, -0.01]), V.add(head, [0, 0.1, -0.04]), V.add(head, [0, 0.11, -0.075])], [[0.034, 0.034], [0.026, 0.026], [0.012, 0.012]], { seg: 6, sub: 0 }),
    ring(0.058, 0.058, 0.007, 12, 4).translate(head[0], head[1] + 0.035, head[2])];
}
/** The doge kneeling in his robe and mantle, hands joined, in the local frame facing +x (the lion's side). */
export function doge(L, m, lod, mat) {
  const o = { ...KNEE, drape: 'chiton', hair: 'none', beard: true, lod, cloak: { dir: [-0.3, -1, 0], len: 0.55, w: 0.2, side: [0, 0, 1] } };
  const f = bodyOf(o), J = skeleton(o);
  put(L, mat, f.stone, m); put(L, mat, corno(J.head), m);
}
const jug = () => lathe([[0.001, 0], [0.03, 0.005], [0.04, 0.05], [0.032, 0.1], [0.018, 0.125], [0.026, 0.145], [0.001, 0.145]], 8);
/** The four Virtues: 0 Prudence (the mirror), 1 Fortitude (the shield and the column), 2 Temperance (two jugs), 3 Charity (the heart and the child). */
export function virtue(L, k, m, lod, mat) {
  const o = { pose: 'stand', drape: 'chiton', female: true, hair: 'long', lod }, extra = [];
  if (k === 0) { o.arms = { R: [-0.1, 0.74, 0.12], L: [0.16, 0.55, 0.1] }; extra.push(ring(0.062, 0.062, 0.007, 14, 4).rotateX(Math.PI / 2).translate(-0.1, 0.83, 0.14), blob([-0.1, 0.83, 0.14], 0.055, [1, 1, 0.16], 8)); }
  else if (k === 1) { o.shield = 'L'; o.shieldMetal = false; o.spear = 'R'; o.spearDir = [0.02, 1, 0]; o.arms = { R: [-0.15, 0.58, 0.1], L: [0.16, 0.6, 0.12] }; }
  else if (k === 2) { o.arms = { R: [-0.1, 0.6, 0.17], L: [0.1, 0.58, 0.17] }; for (const [x, y] of [[-0.1, 0.6], [0.1, 0.58]]) extra.push(jug().translate(x, y - 0.01, 0.2)); }
  else { o.arms = { R: [-0.06, 0.66, 0.12], L: [0.16, 0.5, 0.06] }; extra.push(blob([-0.06, 0.7, 0.15], 0.03, [1, 1, 0.8], 6), blob([-0.075, 0.71, 0.15], 0.018, [1, 1, 0.8], 5)); }
  const f = bodyOf(o);
  put(L, mat, f.stone, m); put(L, mat, f.metal, m); put(L, mat, extra, m);
  if (k === 3) { const c = bodyOf({ pose: 'stand', drape: 'nude', lod: 2, hair: 'curls', arms: { R: [-0.12, 0.62, 0.0], L: [0.12, 0.62, 0.0] } }); put(L, mat, c.stone, new Matrix4().copy(m).multiply(new Matrix4().makeScale(0.32, 0.32, 0.32).setPosition(0.17, 0.33, 0.06))); }
}
/** Justice with her sword: standing, the sword raised in the right hand. */
export function justice(L, m, lod, mat) {
  const f = bodyOf({ pose: 'stand', drape: 'peplos', female: true, hair: 'long', lod, spear: 'R', spearDir: [0, 1, 0], arms: { R: [-0.15, 0.62, 0.05], L: [0.17, 0.6, 0.12] } });
  put(L, mat, f.stone, m); put(L, mat, f.metal, m);
}
/** The gateway's figures: el { rect, face, y, uP }. */
export function portaFigures(L, el, lod) {
  const { M } = faceFrame(el.rect, el.face, el.y), uP = el.uP;
  const fm = (s, u, y, d, yaw = 0) => at(s, u, y, d, yaw).premultiply(M);
  // the lion in the lunette, gilt, and the doge kneeling to him
  put(L, GB, lionModel({ lod, book: true }), fm(0.52, uP - 0.35, 4.6, 0.72, 0));
  doge(L, fm(1.55, uP + 1.05, 4.58, 0.72, -Math.PI / 2), lod, GB);
  for (const sg of [-1, 1]) for (const [y0, k] of [[0.9, 0], [5.0, 1]]) virtue(L, sg < 0 ? k * 2 : k * 2 + 1, fm(1.65, uP + sg * 2.1, y0, 0.74, 0), lod, CV);
}

// ── the corner groups of the palace, built on the capital of the corner column, facing +z (the corner's diagonal turns it)
const fig = (L, o, h, x, y, z, yaw, mat = CV) => put(L, mat, (() => { const f = bodyOf(o); return [...f.stone, ...f.metal]; })(), at(h, x, y, z, yaw));
const fruitTree = (L, lod, o = {}) => {
  const tx = o.x ?? 0, tz = o.z ?? -0.1, H = o.h ?? 2.3, g = [];
  g.push(tube([[tx, 0, tz], [tx + 0.05, H * 0.35, tz - 0.03], [tx - 0.04, H * 0.7, tz + 0.02], [tx, H, tz]], [[0.14, 0.13], [0.1, 0.1], [0.08, 0.08], [0.05, 0.05]], { seg: 7, sub: 1, mod: (th, t) => 1 + 0.12 * Math.cos(5 * th + 6 * t) }));
  const n = lod === 0 ? 11 : 6;
  for (let i = 0; i < n; i++) { const a = i / n * TAU, r = 0.35 + 0.2 * hash(i, tx, 1), y = H + 0.1 + 0.3 * hash(i, tz, 2); g.push(blob([tx + Math.cos(a) * r, y - 0.18 * Math.abs(Math.sin(a * 2)), tz + Math.sin(a) * r * 0.8], 0.2, [1.2, 0.5, 1], 5)); }
  g.push(blob([tx, H + 0.35, tz], 0.3, [1.2, 0.6, 1.1], 6));
  if (o.fruit) for (const [a, y] of [[0.5, 2.0], [2.6, 2.05], [4.1, 2.1]]) g.push(blob([tx + Math.cos(a) * 0.3, y, tz + Math.sin(a) * 0.3 + 0.05], 0.045, [1, 1, 1], 5));
  put(L, CV, g);
};
const serpent = (L, tx, tz) => {
  const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10, a = t * 9; pts.push([tx + Math.cos(a) * 0.17, 0.35 + t * 1.5, tz + Math.sin(a) * 0.17]); }
  pts.push([tx + 0.28, 1.95, tz + 0.2]);
  put(L, CV, [tube(pts, pts.map((_, i) => 0.045 - 0.0015 * i), { seg: 5, sub: 1 }), blob([tx + 0.31, 1.99, tz + 0.22], 0.05, [1.3, 0.8, 1], 5)]);
};
const leaf = (z) => blob([0, 0.46, z], 0.05, [1.2, 1.4, 0.4], 5);
export function cornerGroup(L, kind, lod) {
  const base = { lod }, put2 = (g, m) => put(L, CV, g, m);
  if (kind === 'adam') {
    fruitTree(L, lod, { fruit: true }); serpent(L, 0, -0.1);
    const a = bodyOf({ ...base, pose: 'ease', drape: 'nude', beard: true, hair: 'curls', arms: { L: [0.22, 0.78, 0.1], R: [-0.14, 0.5, 0.02] } });
    put2([...a.stone, leaf(0.065)], at(1.75, -0.62, 0, 0.1, 0.35));
    const e = bodyOf({ ...base, pose: 'ease', drape: 'nude', female: true, hair: 'long', mirror: true, arms: { R: [-0.22, 0.74, 0.1], L: [0.12, 0.55, 0.06] } });
    put2([...e.stone, leaf(0.065)], at(1.65, 0.62, 0, 0.1, -0.35));
  } else if (kind === 'noah') {
    // the vine over Noah asleep with the wine, Ham pointing at him, Shem covering him with a cloak
    fruitTree(L, lod, { x: 0.05, z: -0.4, h: 2.2 });
    for (const [a, y] of [[0.6, 1.9], [2.0, 1.95], [3.4, 1.85], [4.6, 1.92], [5.5, 1.88]]) put(L, CV, [blob([0.05 + Math.cos(a) * 0.3, y, -0.4 + Math.sin(a) * 0.28 + 0.12], 0.06, [1, 1.5, 1], 5)]);
    const n = bodyOf({ ...base, pose: 'recline', drape: 'mantle', beard: true, hair: 'curls', seat: 'rock' });
    put2([...n.stone], at(1.35, 0.2, 0, 0.35, Math.PI * 0.05));
    const ham = bodyOf({ ...base, pose: 'ease', drape: 'chiton', beard: false, hair: 'curls', arms: { R: [-0.2, 0.68, 0.14], L: [0.15, 0.52, 0.04] } });
    put2([...ham.stone, ...ham.metal], at(1.55, 0.8, 0, 0.0, -0.5));
    const shem = bodyOf({ ...base, pose: 'stand', drape: 'mantle', bareLegs: true, beard: true, hair: 'curls', arms: { R: [-0.2, 0.7, 0.2], L: [0.2, 0.7, 0.2] }, lean: 6 });
    put2([...shem.stone, ...shem.metal], at(1.55, -0.78, 0, 0.0, 0.5));
    put(L, CV, [tube([[-0.5, 1.15, 0.28], [-0.25, 0.95, 0.4], [0.05, 0.78, 0.42], [0.3, 0.6, 0.38]], [[0.2, 0.025], [0.24, 0.03], [0.22, 0.03], [0.16, 0.03]], { seg: 8, sub: 1, side: [0, 0, 1], mod: (th, t) => 1 + 0.12 * Math.cos(5 * th + 7 * t) })]);
  } else {
    // the Judgment of Solomon: the king enthroned, the soldier with the sword and the child, the mother kneeling
    const k = bodyOf({ ...base, pose: 'seat', drape: 'chiton', beard: true, hair: 'curls', seat: { backrest: true }, cloak: { dir: [0.0, -1, -0.5], len: 0.45, w: 0.2, side: [0, 0, 1] }, arms: { R: [-0.2, 0.62, 0.2], L: [0.16, 0.42, 0.14] } });
    put2([...k.stone, ...k.metal], at(1.7, -0.05, 0.0, -0.3, 0));
    const crown = ring(0.06, 0.06, 0.008, 12, 4).translate(0, 0.935, 0.02); put2([crown], at(1.7, -0.05, 0.0, -0.3, 0));
    const s = bodyOf({ ...base, pose: 'stride', drape: 'mantle', bareLegs: true, beard: false, hair: 'curls', arms: { R: [-0.12, 1.02, 0.06], L: [0.26, 0.45, 0.1] }, spear: 'R', spearDir: [0.15, 1, 0] });
    put2([...s.stone, ...s.metal], at(1.55, 0.72, 0, 0.28, -0.3));
    const ch = bodyOf({ lod: 2, pose: 'stand', drape: 'nude', hair: 'curls', arms: { R: [-0.12, 0.2, 0.0], L: [0.12, 0.2, 0.0] } });
    put2([...ch.stone], new Matrix4().makeRotationZ(Math.PI).multiply(new Matrix4().makeScale(0.3, 0.3, 0.3)).setPosition(0.99, 0.85, 0.31));
    const m = bodyOf({ ...KNEE, ...base, drape: 'chiton', female: true, hair: 'long', J: { ...KNEE.J, wrR: [-0.08, 0.7, 0.16], wrL: [0.08, 0.7, 0.16] } });
    put2([...m.stone, ...m.metal], at(1.55, -0.68, 0, 0.3, 0.3));
  }
}
// ── the Tetrarchs: four emperors in porphyry, two pairs embracing, each with a hand on his sword
export function tetrarchs(L, el, lod) {
  const { x, y, z } = el, h = 1.3;
  const pair = (px, pz, yaw) => {
    for (const s of [-1, 1]) {
      const o = { lod, pose: 'stand', drape: 'mantle', bareLegs: true, beard: true, hair: 'curls', arms: s < 0 ? { L: [0.34, 0.77, -0.04], R: [-0.13, 0.5, 0.07] } : { R: [-0.34, 0.77, -0.04], L: [0.13, 0.5, 0.07] } };
      const f = bodyOf(o), m = at(h, px, y, pz, yaw).multiply(new Matrix4().makeTranslation(s * 0.135, 0, s * 0));
      put(L, 'porphyry', [...f.stone, ...f.metal], m);
    }
  };
  pair(x + 0.45, z - 0.15, Math.PI / 2); pair(x - 0.15, z + 0.45, 0);
}

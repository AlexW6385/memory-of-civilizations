// Mohenjo-daro, c. 2500 BC, by night (docs/settlements/mohenjo-daro.md §16.2). What lit the city [inferred: no lamp is certain; small clay lamps, soot-blackened niches and hearths
// are the likeliest]: the hearth and a small clay oil lamp in each lived-in room, the lamp in a niche by the door, the braziers at the stair's head, the lamps of the Bath's
// galleries and of the College's shrine, the lamp of the wayside shrine; the kilns of the workshops glow through the court. No torches, no lanterns: none are attested.
// Everything here is geometry in one material, `halo` (palette.js): light ADDED over what is behind it, at night only, with no light, no shadow and no collision, so the
// day view is unchanged and the glows read at the low preset. The shape of each piece is carried by its normals (y 1 at a disc's middle, 0 at its rim). Every element of
// the indus style that puts a light into its plan is wrapped here (the style's files stay as they were). Each glow is a function of its own place: no counters, no Math.random.
import '../../styles/indus/index.js';
import './walkdress.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { lotFrame } from '../../styles/indus/kit.js';
import { doorU } from './layout.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const TAU = Math.PI * 2, MAT = 'halo';
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1]) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f, nh[1] * q] : [Math.cos(a) * q, f, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  floor(x, y, z, r, rz = r, segs = 8, k = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [k, 0.42 * k, 0]); }
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }); `floor` the height of the floor it stands over, if known. */
function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

const sink = new Proxy(function () {}, { get: () => sink, apply: () => sink });
let depth = 0;
/** Wrap one element builder: the halo of every light it adds; the door's spill, the niche's lamp and a glow at the court's kiln for a lived-in house or workshop. */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  depth++;
  try { var r = fn.call(this, el, ctx); } finally { depth--; }
  const H = new Halo(), house = name === 'indus_house', floor = el.y ?? 0;
  for (const l of lights.slice(n)) lightHalo(H, l, house || name === 'indus_college' || name === 'indus_bath' || name === 'indus_granary' || name === 'indus_pillared' ? floor : undefined);
  if (house && el.open) {
    const F = lotFrame({ bag: sink, col: sink }, el.rect, el.front, floor), du = doorU({ seed: el.seed, front: el.front, rect: el.rect });
    // the door ajar: the lamp's light spilling over the step into the lane, and the soot-black niche by the door with its own small flame
    const [px, pz] = F.pt(du, -1.0); H.floor(px, floor + 0.06, pz, 2.0, 1.5, 8, 0.7);
    const side = du < F.W / 2 ? 1 : -1, [nx, nz] = F.pt(du + side * 1.05, -0.12); H.ball(nx, floor + 1.4, nz, 0.3, 0.55);
    if (el.kind !== 'house' && el.kind !== 'small') { const [kx, kz] = F.pt(F.W / 2, F.D - 5.5); H.ball(kx, floor + 0.9, kz, 0.9, 0.5); H.floor(kx, floor + 0.05, kz, 2.4, 2.4, 10, 0.55); }   // the kiln's mouth glowing through the court
  }
  if (name === 'indus_topdress' && el.stair) {
    const [sx0, sz0, , sz1] = el.stair;
    for (const z of [sz0 - 2.5, sz1 + 2.5]) { const x = sx0 - 2.2; H.ball(x, el.y + 1.1, z, 0.55, 0.6); H.floor(x, el.y + 0.03, z, 2.6, 2.6, 10, 0.7); }
  }
  if (name === 'md_lanework') {
    const [kind, x, z, y = 0, face = 'n'] = el.spot ?? el.at, D = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[face], U = [-D[1], D[0]];
    if (kind === 'shrine') { const px = x + U[0] * 0.34 + D[0] * 0.6, pz = z + U[1] * 0.34 + D[1] * 0.6; H.ball(px, y + 0.7, pz, 0.34, 0.62); H.floor(px, y + 0.03, pz, 1.8, 1.8, 8, 0.6); }
    if (kind === 'stand') { const px = x + D[0] * 1.0, pz = z + D[1] * 1.0; H.floor(px, y + 0.03, pz, 1.3, 1.3, 8, 0.25); }
  }
  H.flush(ctx.bag);
  return r;
};

/** nightlight: the bath's gallery lamps: a small flame in each lamp niche of the stepped piers on the court's long sides (indus_bathdress). */
function bathdressNight(el, ctx) {
  const [cx0, cz0, cx1, cz1] = el.B.court, H = new Halo();
  for (const z of [cz0 + 4, cz1 - 4]) for (let k = 0; k < 3; k++) { const x = cx0 + 4 + k * ((cx1 - cx0 - 8) / 2); H.ball(x, el.y + 2.0, z, 0.32, 0.55); }
  // two standing oil-lamp bowls on brick stands at the court, ahead of the visitor on arrival: their pools of light on the paving
  for (const x of [cx0 + (cx1 - cx0) * 0.3, cx0 + (cx1 - cx0) * 0.7]) { const z = cz1 - 9; H.ball(x, el.y + 1.0, z, 0.3, 0.6); H.floor(x, el.y + 0.03, z, 3.4, 3.0, 10, 0.75); }
  H.flush(ctx.bag);
}

let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.indus.elements;
  for (const k of Object.keys(E)) if (typeof E[k] === 'function') E[k] = wrap(k, E[k]);
  const base = E.indus_bathdress;
  E.indus_bathdress = function nightBath(el, ctx) { const r = base.call(this, el, ctx); if (ctx.lights) bathdressNight(el, ctx); return r; };
}
registerNight();

// Thebes by night: the light of its lamps and braziers (docs/settlements/thebes.md §15b).
// The point lights of the plans are real lights only where the renderer has the budget; in the low preset a lamp is a small cone and
// nothing round it is lit. What it lacks is the light it gives to what is round it: made of geometry in the engine's one material `halo`
// (palette.js, materials.js 'halo': light ADDED over what is behind it, at night only, no light, no shadow, no collision), the
// brightness carried by the vertex normals' y. Same construction as Suzhou's and Athens' (their files are not imported).
// Here: a glow ball and a pool of light on the floor round the clay lamp of every entered house, a lit pane at the house's high
// window slit, a glow over each brazier of the avenue and the courts, and the two lamps either side of the temple gateway.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { litSpots } from '../../styles/newkingdom/doorsite.js';
import { box as boxGeo } from '../../core/geom.js';
import { QUAY } from './layout.js';

const TAU = Math.PI * 2;

/** Triangles (position and a normal per corner) of the halo material. */
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
  floor(x, y, z, r, segs = 8) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, r, null, segs, [1, 0.42, 0], [0, 0.5, 1]); }
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** A sheet of one brightness f over the rectangle w x h centred at (x, y, z) facing nz (+1 / -1 along z): the lamp of a room behind a window. */
  pane(x, y, z, w, h, nz, f = 0.8) {
    const P = (a, b) => [x + a * w / 2, y + b * h / 2, z], N = [0, f, 0], A = P(-1, -1), B = P(1, -1), C = P(1, 1), D = P(-1, 1);
    if (nz > 0) { this.tri(A, N, B, N, C, N); this.tri(A, N, C, N, D, N); } else { this.tri(A, N, C, N, B, N); this.tri(A, N, D, N, C, N); }
  }
  /** The spill of a lit slit on the wall round it and on the street before it: an upright disc and a small pool. */
  spill(x, y, z, nz, r) { this.disc([x, y, z + nz * 0.02], [1, 0, 0], [0, 1, 0], r, r * 0.8, [0, nz], 8, [0.55, 0], [0, 1]); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g);
    this.pos = []; this.nor = [];
  }
}

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }) over the floor at `g`. */
function lightHalo(H, l, g) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  const fy = Math.min(g ?? y - 0.5, y - 0.2);
  if (y - fy < 3) H.floor(x, fy + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), 10);
}

/**
 * The lamps either side of the temple gateway (the door of the enclosure wall at x = −170): a stone lamp-stand with a bowl of oil [inferred]. Both are
 * `thebes_stand` elements: a sandstone stand and a pottery bowl (the light of the lamp is in the night plan's halo, with no light of its own). Placed 8 m off the axis, before the gateway's towers.
 */
function stand(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0.02, H = null;
  bag.add('sandstone_dressed', boxGeo(x - 0.3, y, z - 0.3, x + 0.3, y + 0.2, z + 0.3));
  bag.add('sandstone_dressed', boxGeo(x - 0.1, y + 0.2, z - 0.1, x + 0.1, y + 1.15, z + 0.1));
  bag.add('terracotta', boxGeo(x - 0.17, y + 1.15, z - 0.17, x + 0.17, y + 1.25, z + 0.17));
  col.rect([x - 0.3, z - 0.3, x + 0.3, z + 0.3], y, y + 1.4);
  void H;
}

/** The stands' places (one either side of the gateway, before its towers). */
export const STANDS = [-1, 1].map((s) => [-182, s * 8]);
/** The fires that no element makes (§15b): a stand either side of the gateway. */
export function fires() { return STANDS.map((at) => ({ t: 'thebes_stand', at, y: 0.02 })); }

/**
 * thebes_halo: { lots, braziers, stands } — the whole night's glow in one plan, one draw: for each entered lot its lamps' glow ball and the pool of light on the
 * floor under it and the lit pane and spill at each of its window slits (litSpots), a glow over each brazier's bowl and over each stand's bowl.
 */
function haloEl(el, { bag }) {
  const H = new Halo();
  for (const l of el.lots) {
    const sp = litSpots(l);
    if (!sp) continue;
    const front = l.front === 's', sg = front ? -1 : 1, zs = front ? l.rect[3] : l.rect[1], X = (u) => l.rect[0] + u, Z = (v) => zs + sg * v;
    for (const a of sp.lamps) lightHalo(H, { at: [X(a.u), a.y + a.h + 0.3, Z(a.v)], distance: 7, intensity: a.i }, a.y);
    for (const w of sp.windows) { H.pane(X(w.u), w.y + w.h / 2, Z(-0.05), w.w + 0.06, w.h + 0.06, -sg); H.spill(X(w.u), w.y + w.h / 2, Z(-0.05), -sg, 0.8 + w.w); }
  }
  for (const [x, z] of el.braziers) lightHalo(H, { at: [x, 1.25, z], distance: 8, intensity: 3 }, 0);
  for (const [x, z] of el.stands) lightHalo(H, { at: [x, 1.55, z], distance: 9, intensity: 3 }, 0.02);
  H.flush(bag);
}

let done = false;
/** Registers the night's elements in the newkingdom style (once). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.newkingdom.elements;
  E.thebes_stand = stand; E.thebes_halo = haloEl;
}
void QUAY;

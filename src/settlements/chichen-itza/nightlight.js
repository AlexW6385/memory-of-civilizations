// Chichén Itzá c. 1000 by night — what lit the city and the light it throws (docs/settlements/chichen-itza.md §19.2).
// Lit by fire: the hearth of every house (three stones and the embers banked through the night), a lamp or a torch of ocote (resinous pine) in the long houses,
// the braziers of the Castillo's temple and the copal censers of the altars, torches at the stairs, the pilgrims' small fires, the sweat bath's firebox.
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow
// and no collision, so the day view is unchanged and the pools of real light (off at the low preset) are not needed. The shape of each piece is carried by its normals
// (y: 1 at a disc's middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor or ground, and a pane in a lit doorway. The houses'
// and long houses' elements are wrapped from here (the style's file is shared and stays as it was); `cz_glow` carries the rest. Each light is a function of its
// own place: no counters, no Math.random. The method is that of the Suzhou reference, written for Maya fires; nothing of Suzhou's is imported.

import '../../styles/maya/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { hashAt } from './hash.js';
import { variant } from './house.js';
import { box } from '../../core/geom.js';

export { hashAt };
const TAU = Math.PI * 2, MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material; the brightness is the normal's y (1 at a disc's middle, 0 at its rim). */
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
  /** A disc lying flat at height y (the ground or a floor), rx by rz across, k its strength. */
  floor(x, y, z, r, rz = r, segs = 8, k = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [k, 0.42 * k, 0]); }
  /** A cheaper pool (one ring of 6 triangles fading to nothing at its rim), for the many small ones. */
  pool(x, y, z, r, rz = r, k = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, 6, [k, 0], [0, 1]); }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A flat sheet (a lit doorway) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

/** A lit doorway: a pane in the opening (centre [x, z], facing n, width w, from y0 to y1) and the light spilling over the threshold onto the ground. */
export function litDoor(H, x, z, n, w, y0, y1, f, ground) {
  const t = [-n[1], n[0]], hw = w / 2 - 0.06, o = 0.012, px = x + n[0] * o, pz = z + n[1] * o;
  H.quad([px - t[0] * hw, y0 + 0.05, pz - t[1] * hw], [px + t[0] * hw, y0 + 0.05, pz + t[1] * hw], [px + t[0] * hw, y1 - 0.08, pz + t[1] * hw], [px - t[0] * hw, y1 - 0.08, pz - t[1] * hw], n, f);
  const sx = Math.abs(n[0]) > 0.5, d = 1.1;
  H.pool(x + n[0] * d, ground + 0.06, z + n[1] * d, sx ? 2.0 : 1.4, sx ? 1.4 : 2.0, 0.7 * (0.7 + 0.6 * f));
}

let done = false;
/** Adds the night's elements (halo only, no collision): `cz_hearths`, `cz_glow`, and `cz_torch` (the torch's pole and real light). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.maya.elements;
  /**
   * cz_hearths: { box, lots: [{ houses: [{ c, a, b, dir, seed }], range }] } — the glow of the fires of the lots' houses: the hearth's ball and pool (or the weaver's lamp), the doorways
   * lit (the doors face each other across the room: the hearth shows through both; the embers are banked, the doors open for the air), the light spilling over each threshold;
   * the long house's lamp of ocote and its three lit doorways. A house used as a store has no fire. Which houses are lit is the hash of the house's own place (some are dark).
   */
  const hearths = (el, H) => {
    const TS = TAU / 48;
    for (const l of el.lots) {
      for (const h of l.houses) {
        const v = variant(h);
        if (v.use === 'store' || hashAt(h.c[0], h.c[1], 6) < 0.12) continue;
        const alongX = h.dir !== 'z', [cx, cz] = h.c, f = v.F, ax = alongX ? [1, 0] : [0, 1], r = v.use === 'home' ? h.a - 1.0 : h.a - 2.2;
        H.ball(cx + ax[0] * r, f + (v.use === 'home' ? 0.75 : 1.1), cz + ax[1] * r, v.use === 'home' ? 0.6 : 0.5, v.use === 'home' ? 0.62 : 0.5);
        H.pool(cx + ax[0] * r, f + 0.1, cz + ax[1] * r, 1.9, 1.9, 0.75);
        const hw = 3 * TS * h.b;
        for (const s of [-1, 1]) {
          const nn = alongX ? [0, s] : [s, 0], x = cx + nn[0] * (h.b - 0.03), z = cz + nn[1] * (h.b - 0.03);
          litDoor(H, x, z, nn, hw * 1.9, f, f + 2.1, 0.34 + 0.3 * hashAt(x, z, 3), 0);
        }
      }
      if (l.range) {
        const r = l.range, [cx, cz] = r.c, c = Math.cos(r.rot), s = Math.sin(r.rot), F = (r.y ?? 0) + 0.9;
        const [lx, lz] = [cx, cz];
        H.ball(lx, F + 1.7, lz, 0.75, 0.62); H.pool(lx, F + 0.08, lz, 3.0, 2.2, 0.8);
        for (const u of [-r.a * 0.62, 0, r.a * 0.62]) {
          const x = cx + u * c + r.b * s, z = cz - u * s + r.b * c;
          litDoor(H, x, z, [s, c], 1.8, F, F + 2.05, 0.3 + 0.25 * hashAt(x, z, 4), F);
        }
      }
    }
  };
  /**
   * cz_glow: { box: [x0, z0, x1, z1], spots: [{ k: 'fire' | 'torch' | 'lamp' | 'censer', x, y, z, g (the ground under it) }] } — the glow of fires set about the city: a fire the ball of its
   * flames and a wide pool on the ground; a torch or a lamp a smaller ball and pool; a censer a faint small ball (the copal's embers, a red point in the dark).
   */
  const glow = (el, H) => {
    for (const sp of el.spots) {
      const r = sp.k === 'fire' ? 0.8 : sp.k === 'censer' ? 0.32 : 0.55, q = 0.9 + 0.2 * hashAt(sp.x, sp.z, 2);
      H.ball(sp.x, sp.y, sp.z, r * q, sp.k === 'censer' ? 0.5 : 0.66);
      if (sp.k !== 'censer') H.floor(sp.x, (sp.g ?? sp.y - 0.9) + 0.09, sp.z, (sp.k === 'fire' ? 3.0 : 2.2) * q, (sp.k === 'fire' ? 3.0 : 2.2) * q, 8, sp.k === 'fire' ? 0.85 : 0.7);
    }
  };
  /** cz_night: { box, lots, spots } — all of the above in one piece of geometry (one draw). */
  E.cz_night = function night(el, { bag }) { const H = new Halo(); hearths(el, H); glow(el, H); H.flush(bag); };
  /** cz_torch: { at: [x, z], y, h? } — a pole of pine with a torch of resinous ocote bound at its head, burning (its glow is in `cz_glow`; no real light, so that it costs no draw). */
  E.cz_torch = function torch({ at, y = 0, h = 2.1 }, { bag, col }) {
    const [x, z] = at, q = 0.9 + 0.2 * hashAt(x, z, 5);
    bag.add('log_pine', box(x - 0.05, y, z - 0.05, x + 0.05, y + h * q, z + 0.05));
    bag.add('rope_fibre', box(x - 0.09, y + h * q - 0.02, z - 0.09, x + 0.09, y + h * q + 0.28, z + 0.09));
    col.circle(x, z, 0.14, y, y + h * q);
  };
}
registerNight();

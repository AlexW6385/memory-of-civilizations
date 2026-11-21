// Machu Picchu c. 1450–1530 by night — what lit the town and the light it throws (docs/settlements/machu-picchu.md §14).
// The Inca had no lamp of oil: the light of the place was the hearth of each house (the q'uncha, kept in all night under its ash), the torch (a
// pole tipped with resinous wood or tallow-soaked ichu) at the gates of the state's buildings, and the brazier of embers at the shrine, the post of
// the runners and the watch [inferred: general, Inca; no lamp is attested at the site]. Windows were unglazed and unshuttered: a lit house
// shows its light through its doorway (an Inca door had a hanging mat or none) and the smoke-hole of its thatch.
// Everything here is geometry in one material, `halo` (palette.js): light ADDED over what is behind it, at night only, with no light, no shadow
// and no collision, so the day view is unchanged and the pools of real light (off at the low preset) are not needed. The shape of each piece is
// carried by its normals (y: 1 at a disc's middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the ground, and a lit
// doorway. Every house that is lit (its `lights`) is wrapped here (the style file stays as it was); each light is a function of its own place:
// no counters, no Math.random. The method is that of the Suzhou reference and of Knossos; nothing of theirs is imported.

import '../../styles/inca/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, rod, box } from '../../core/geom.js';
import { houses, houseKind, KALLANKA, KNOLL } from './layout.js';
import { ground } from './ground.js';
import { FIRES, litHouse, FEAST, GUARD_BRAZIER } from './walk.js';
import { openHouse } from './walkroutes.js';
import { OPEN_DOOR, KALLANKA_DOOR } from './walk.js';
import { STYLES } from '../../core/build.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

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
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** The flame itself: two upright discs crossed at right angles, w wide and h tall, at its foot (x, y, z): drawn in the halo, so by day nothing shows. */
  flame(x, y, z, w = 0.07, h = 0.22) {
    for (let i = 0; i < 2; i++) { const a = i * Math.PI / 2 + 0.6, c = Math.cos(a), s = Math.sin(a); this.disc([x, y + h * 0.5, z], [c, 0, s], [0, 1, 0], w, h * 0.5, [-s, c], 8, [1, 0.05], [0, 1]); }
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

/** The halo of one fire: the ball round the flame and the pool it throws on the ground `floor` metres... at that height. */
function fireHalo(H, [x, y, z], r, pool, floor, foot = y - 0.18) {
  H.ball(x, y, z, r); H.flame(x, foot, z);
  if (floor !== undefined && pool > 0) H.floor(x, floor + 0.03, z, pool, pool, 10, 0.8);
}

const OUT = { e: [1, 0], w: [-1, 0], n: [0, -1], s: [0, 1] };
/** The lit doorway of a house: a sheet in the doorway (the wall's middle plane), narrowing to the head like the door, facing out. */
function doorGlow(H, el, f, at = null, k = 0.4, spill = 0.55) {
  const [x0, z0, x1, z1] = el.rect, o = OUT[f], t = [-o[1], o[0]], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, y = (el.y ?? 0) + 0.06;
  const edge = at || (f === 'e' ? [x1, cz] : f === 'w' ? [x0, cz] : f === 'n' ? [cx, z0] : [cx, z1]);
  const w = (el.doorW ?? (el.humble ? 0.9 : 1.0)) / 2 - 0.06, hd = (el.doorH ?? (el.humble ? 1.8 : 1.95)) - 0.1, wt = w * 0.8, m = (el.th ?? 0.7) * 0.3;
  const P = (u, v) => [edge[0] + t[0] * u - o[0] * m, y + v, edge[1] + t[1] * u - o[1] * m];
  H.quad(P(-w, 0), P(w, 0), P(wt, hd), P(-wt, hd), o, k + 0.3 * hashAt(edge[0], edge[1], 3));
  // the light spilling over the step into the court or the lane
  H.floor(edge[0] + o[0] * 1.3, y, edge[1] + o[1] * 1.3, 1.9, 1.3, 8, spill);
}

/**
 * mp_fire: { at: [x, z], y, kind: 'torch' | 'brazier', seed } — a torch (a pole of wood leaning in a socket of cut stone, its head wrapped in ichu soaked
 * in tallow or resin and burning) before the gate of a state building, or a brazier (a bowl of pecked stone on three stone feet, heaped with embers)
 * at the shrine, the post of the runners and the watch [inferred: general, Inca; no lamp is attested at the site]. The glow round the flame and its pool.
 */
function fire({ at, y = 0, kind = 'torch', seed = 1 }, { bag, col }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 5), lean = 0.04 + 0.05 * hashAt(x, z, 6), ang = hashAt(x, z, 7) * TAU;
  if (kind === 'brazier') {
    const s = 0.9 + 0.2 * q;
    bag.add('granite_rough', lathe([[0.001, 0.34], [0.16 * s, 0.34], [0.3 * s, 0.5], [0.34 * s, 0.62], [0.28 * s, 0.62], [0.001, 0.52]], 12, null, x, y, z));
    for (let i = 0; i < 3; i++) { const a = ang + i * TAU / 3; bag.add('granite_rough', rod([x + Math.cos(a) * 0.12, y + 0.36, z + Math.sin(a) * 0.12], [x + Math.cos(a) * 0.24 * s, y, z + Math.sin(a) * 0.24 * s], 0.055, 6)); }
    col.circle(x, z, 0.34 * s, y, y + 0.62);
  } else {
    const h = 1.75 + 0.2 * q, tx = x + Math.cos(ang) * lean * h, tz = z + Math.sin(ang) * lean * h;
    bag.add('granite_rough', box(x - 0.17, y - 0.04, z - 0.17, x + 0.17, y + 0.4, z + 0.17));
    bag.add('timber', rod([x, y + 0.36, z], [tx, y + h, tz], 0.034, 6));
    bag.add('timber', lathe([[0.034, 0], [0.07, 0.04], [0.085, 0.14], [0.06, 0.24], [0.001, 0.26]], 8, null, tx, y + h - 0.02, tz));
    col.circle(x, z, 0.2, y, y + 0.4);
  }
  void seed; void H;
}

/**
 * mp_glow: the light of the whole night in ONE element (so one halo mesh, one draw, whatever the number of lights): the hearth glow and the lit doorway of every
 * lit house, the kallanka's hearth and its seven lit doors, the plaza's feast fire, the watch's brazier on the knoll, the torches and braziers of `FIRES`.
 * A pure function of the layout.
 */
function glow(el, { bag }) {
  const H = new Halo(), all = houses();
  all.forEach((h, i) => {
    const [x0, z0, x1, z1] = h.rect, y = Math.min(ground.height(x0, z0), ground.height(x1, z0), ground.height(x0, z1), ground.height(x1, z1)), { rank } = houseKind(h);
    if (!litHouse(h)) return;
    const open = openHouse(i), e = { rect: h.rect, y, th: 0.7, humble: rank === 2, ...(open ? { doorW: OPEN_DOOR.w, doorH: OPEN_DOOR.h } : {}) };
    H.ball((x0 + x1) / 2, y + 1.15, (z0 + z1) / 2, 0.62);
    doorGlow(H, e, h.front);
    // the smoke-hole: the hearth's glow shows through the thatch at the ridge, so a lit house reads from behind and from above [inferred]
    { const B = Math.min(x1 - x0, z1 - z0) / 2, hh = open ? 2.8 : 2.6, ry = y + hh + B * 1.45, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      H.ball(cx, ry + 0.15, cz, 0.7, 0.55); H.floor(cx, ry + 0.1, cz, 0.55, 0.55, 8, 0.5); }
  });
  // the chaski's hut (lit, its door to the road) and the kallanka's hall
  { const r = [6.5, 118.6, 10.9, 123.2], y = ground.height(8.7, 120.9);
    H.ball(8.7, y + 1.15, 120.9, 0.62); doorGlow(H, { rect: r, y, th: 0.55, doorW: OPEN_DOOR.w, doorH: OPEN_DOOR.h }, 'w'); }
  { const [x0, z0, x1, z1] = KALLANKA, m = 0.48, hx = (x0 + x1) / 2 + 0.1, hz = (z0 + z1) / 2 - (z1 - z0 - 2 * m) / 14, y = 0;
    H.ball(hx, y + 0.5, hz, 1.1); H.flame(hx, y + 0.08, hz, 0.12, 0.34); H.floor(hx, y + 0.07, hz, 2.0, 3.4, 10, 0.8);   // (the pool kept inside the walls: the hall is 4.9 m wide)
    for (let i = 0; i < 7; i++) doorGlow(H, { rect: KALLANKA, y, th: 0.8, doorW: KALLANKA_DOOR.w, doorH: KALLANKA_DOOR.h }, 'w', [x0, z1 - (i + 0.5) * (z1 - z0) / 7], 0.2, 0.9); }
  { const fy = ground.height(FEAST[0], FEAST[1]); fireHalo(H, [FEAST[0] + 1.3, fy + 0.55, FEAST[1] + 1.18], 0.95, 3.4, fy, fy + 0.06); }
  fireHalo(H, [GUARD_BRAZIER[0], GUARD_BRAZIER[2] + 0.8, GUARD_BRAZIER[1]], 0.8, 3.0, GUARD_BRAZIER[2], GUARD_BRAZIER[2] + 0.5);
  for (const f of FIRES) {
    const y = f.y ?? ground.height(f.at[0], f.at[1]), q = hashAt(f.at[0], f.at[1], 5), ang = hashAt(f.at[0], f.at[1], 7) * TAU, lean = 0.04 + 0.05 * hashAt(f.at[0], f.at[1], 6);
    if (f.kind === 'brazier') fireHalo(H, [f.at[0], y + 0.85, f.at[1]], 0.8, 3.0, y);
    else { const h = 1.75 + 0.2 * q; fireHalo(H, [f.at[0] + Math.cos(ang) * lean * h, y + h + 0.3, f.at[1] + Math.sin(ang) * lean * h], 0.72, 2.8, y); }
  }
  H.flush(bag);
  void el; void KNOLL;
}

let done = false;
/** Registers the night's elements (once). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.inca.elements;
  E.mp_fire = fire;
  E.mp_glow = glow;
}
registerNight();

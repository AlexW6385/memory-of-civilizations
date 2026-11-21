// Cahokia about 1175 by night — what lit it and the light it throws (docs/settlements/cahokia.md §10.2).
// Fire is the light of the place: the hearth of each house under its smoke hole, the fires of the plaza, of the neighbourhoods' rings and the yards,
// the braziers burning at the foot of each stair, the two hearths of the chief's hall and the eternal fire of the charnel house, the watch fires on the
// palisade's bastions, the embers of the canoe makers' trough and the potters' firing pit. No lamp, no candle, no glass, no oil: nothing the place had not.
// Everything here is geometry in one material, `halo` (palette.js): light ADDED over what is behind it, at night only, with no light, shadow or collision,
// so the day view is unchanged and it shows at the low preset. The shape of each piece is carried by its normals (y: 1 at a disc's middle, 0 at its rim).
// ALL of it is one element, `night_town`, of the landmark plan (one halo mesh for the whole settlement: one draw, whatever the view), computed from the
// layout's and the town's data (the fires' places as the style puts them), never from the builders: a halo in each of the town's 170 plans would be 5 draws
// at the arrival. Each light is a function of its own place (no counters, no Math.random).
import '../../styles/mississippian/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { frontRule } from '../../styles/mississippian/front.js';
import { rng } from '../../styles/mississippian/kit.js';
import { HALLS, LODGES, MOUNDS, FOX, PLAZA, PALISADE, height, lots, smallPlazas } from './layout.js';
import { openSet, fillerList, PLAZA_FIRES } from './town.js';

const TAU = Math.PI * 2;
/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** Triangles of the halo material (position and a normal per corner). */
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
  /** A disc lying flat at height y: the pool of a fire on the ground or a floor. */
  floor(x, y, z, r, rz = r, segs = 8, k = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [k, 0.42 * k, 0]); }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** The same in two discs of six (the far houses' glow: 12 triangles). */
  ball2(x, y, z, r, k = 0.55) {
    for (let i = 0; i < 2; i++) { const a = i * Math.PI / 2 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 6, [k, 0], [0, 1]); }
  }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g); this.pos = []; this.nor = [];
  }
}

const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
/** A flame of height h (the style's lathes) whose base stands at yb over ground yg: its ball of light and the pool on the ground. k dims it (embers). */
function fire(H, x, yb, z, h, yg = yb, k = 1, lift = false) {
  H.ball(x, yb + h * 0.55, z, (0.35 + 1.5 * h) * (k < 1 ? 0.8 : 1), 0.7 * k);
  const R = (0.6 + 3 * h) * (lift ? 0.65 : 1) * (k < 1 ? 0.8 : 1);
  H.floor(x, yg + 0.05, z, R, R * 0.9, 10, 0.85 * k);
}
/** A house's hearth burns in about six of ten (the cooler months and the evening: "the central hearth was the focus of much activity, particularly in the winter" [stated: RiverWeb]). */
const BURNS = [0.62, 0.5, 0.4];
/** A house: the glow round its door (the hide, the mat, the gap), the pool of light before it, and over a hipped roof the glow of the smoke hole at the apex. */
function houseGlow(H, l, open, g) {
  const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, lod = l.lod ?? 0, y = l.y ?? 0, far = lod >= 2;
  if (hashAt(cx, cz, 5) >= BURNS[Math.min(2, lod)]) return;
  if (open) {
    // an opened house (`rise` as the style's openHouse: the first draw of its generator): the door in the south wall, 1.6 m wide, the hearth in the middle, its light out of the door
    const rise = 2.8 + rng(l.seed || 1)() * 0.8, hz = cz + 0.15;
    fire(H, cx, y + 0.1, hz, 0.3, y + 0.05);
    H.floor(cx, y + 0.09, z1 + 1.6, 2.0, 1.5, 10, 0.75);
    H.ball(cx, y + 1.1, z1 + 0.1, 0.9, 0.35);
    H.ball(cx, y + 2.6 + rise + 0.4, cz, 0.85, 0.42);
    return;
  }
  const fr = frontRule(l.seed || 1, lod, x1 - x0), f = l.door === 'n' ? z0 : z1, sg = f === z0 ? -1 : 1, mx = cx + fr.off;
  const r = rng(l.seed || 1), wh = 1.75 + r() * 0.5, rise = 2.4 + r() * 1.6; r(); const hipped = r() < 0.5;
  if (far) { H.ball2(mx, y + 0.9, f + sg * 0.1, 0.8, 0.5); if (hipped) H.ball2(cx, y + wh + rise + 0.4, cz, 0.8, 0.4); return; }
  H.ball(mx, y + 0.85, f + sg * 0.12, 0.7, 0.4);
  H.floor(mx, g(mx, f + sg * 1.1) + 0.06, f + sg * 1.1, 1.3, 1.0, 8, 0.6);
  if (hipped) H.ball(cx, y + wh + rise + 0.4, cz, 0.8, 0.4);
}
/** A chief's hall or a lodge (the style's chiefHall): its two hearths down the floor, the light out of the door onto the court, the glow of the smoke hoods on the ridge. */
function hallGlow(H, rect, y, h, rise) {
  const [x0, z0, x1, z1] = rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, L = x1 - x0, D = z1 - z0, long = L >= D, F = y + 0.04;
  for (const f of [0.3, 0.7]) fire(H, long ? x0 + L * f : cx, F + 0.1, long ? cz : z0 + D * f, 0.58, F);
  H.floor(cx, y + 0.08, z1 + 2.4, 3.2, 2.4, 10, 0.8);
  H.ball(cx, y + 1.5, z1 + 0.2, 1.3, 0.4);
  const ry = y + h - 0.1 + rise + 0.95, len = Math.abs(L - D), u0 = (long ? x0 : z0) + Math.min(L, D) / 2;
  for (const u of len > 12 ? [0.25, 0.75] : [0.5]) { const t = u0 + len * u; H.ball(long ? t : cx, ry + 0.4, long ? cz : t, 1.4, 0.55); }
}
/** The two braziers of a ramp's gate (the style's rampGate): at the foot of each post, 1.5 m south of the gate's line. */
function gateGlow(H, [cx, cz], span) {
  for (const sd of [-1, 1]) { const x = cx + sd * span / 2 - sd * 1.6, z = cz + 1.5, yg = height(x, z) + 0.02; fire(H, x, yg + 1.3, z, 0.5, yg, 1, true); }
}
/** The night's fires, the whole settlement: one halo mesh. */
function nightTown(el, { bag }) {
  const H = new Halo();
  // the houses (the opened ones as the style's openHouse, the rest closed, the far ones in a lighter glow)
  const open = openSet(), L = lots();
  L.forEach((l, k) => houseGlow(H, l, open.has(k), height));
  // the landmark: the three gates' braziers, the halls and the lodges
  for (const [cx, cz] of [[-25, -42], [-25, -78], [-25, -151]]) gateGlow(H, [cx, cz], 14);
  hallGlow(H, HALLS[0], height(...mid(HALLS[0])), 4.5, 11); hallGlow(H, HALLS[1], height(-4, -93), 3.5, 7);
  for (const r of LODGES) hallGlow(H, r, height(...mid(r)), 4, 6.5);
  for (const m of MOUNDS) hallGlow(H, [m[0] - 0.45 * m[2], m[1] - 0.33 * m[2], m[0] + 0.45 * m[2], m[1] + 0.33 * m[2]], height(m[0], m[1]), 4.2, 6);
  // the fires of the yards: the summit's, the terrace's, the plaza's rings beside the arbors, those of the empty cells of the house grid
  for (const [x, z] of [[8, -176], [-6, -116], [14, -112]]) { const y = height(x, z); fire(H, x, y + 0.06, z, 0.38, y); }
  for (const [x, z] of PLAZA_FIRES) fire(H, x, 0.06, z, 0.38, 0);
  // the pottery pits (a craft arbor of the potters: its pit 1.8 m beyond the arbor's east side) and the monks plan's own two arbors
  const pit = (x1, z0, z1) => { const x = x1 + 1.8, z = (z0 + z1) / 2, y = height(x, z); fire(H, x, y + 0.06, z, 0.45, y); };
  pit(-48.6, -124, -121.6);
  for (const e of fillerList()) {
    if (e.t === 'yard_fire') { const [x, z] = e.c, y = height(x, z); fire(H, x, y + 0.06, z, 0.38, y); }
    else if (e.t === 'craft_arbor' && e.trade === 'pottery') pit(e.rect[2], e.rect[1], e.rect[3]);
    else if (e.t === 'sweat_lodge') { const [cx, cz] = e.c, s = (e.seed || 0) % 2 ? 1 : -1, x = cx + s * 1.9, z = cz + 0.2, y = height(x, z); fire(H, x, y + 0.06, z, 0.34, y); }
  }
  // each neighbourhood plaza's ring of stones, its embers in the middle, and the potters' pit if the arbor is the potters'
  smallPlazas().forEach((p, i) => {
    const [cx, cz] = p.c, y = height(cx, cz);
    H.ball(cx, y + 0.45, cz, 0.9, 0.6); H.floor(cx, y + 0.12, cz, 2.8, 2.6, 10, 0.8);
    if (i % 2) { const x = cx + 6.8 + 1.8, z = cz - 5.5, yy = height(x, z); fire(H, x, yy + 0.06, z, 0.45, yy); }
  });
  // the charnel house: the eternal fire seen through the door in the north wall, its light on the plaza's south end
  { const [cx, cz] = mid(FOX), y = height(cx, cz), hs = 4.5; H.ball(cx, y + 0.5, cz - hs + 2.6, 1.0, 0.45); H.floor(cx, y + 0.08, cz - hs - 1.5, 2.2, 1.7, 10, 0.7); }
  // the watch fires of the palisade: a small fire in a clay pot on every third bastion's platform, the sentry beside it
  { const [x0, z0, x1, z1] = PALISADE, h = 4.5, every = 26, sides = [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]];
    for (const [a, b] of sides) {
      const Ls = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / Ls, uz = (b[1] - a[1]) / Ls, n = Math.round(Ls / every);
      for (let k = 0; k < n; k += 3) { const s1 = (k + 1) * Ls / n, px = a[0] + ux * s1, pz = a[1] + uz * s1, bx = px + uz * 1.8, bz = pz - ux * 1.8, yb = Math.min(height(bx, bz), height(px, pz)); H.ball(bx, yb + h + 0.8, bz, 1.1, 0.55); }
    } }
  H.flush(bag);
}
let done = false;
export function registerNight() {
  if (done) return; done = true;
  STYLES.mississippian.elements.night_town = nightTown;
}
registerNight();

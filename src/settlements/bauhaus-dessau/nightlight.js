// Dessau by night, 1927 (docs/settlements/bauhaus-dessau.md §15.2): the electric light of the street, the shop windows and the pubs, the lit flats of the
// tenements, the Törten and Masters' windows, the school's glass wall and the Prellerhaus studios, the tram — made of geometry in the engine's one `halo`
// material (palette.js, materials.js: light ADDED over what is behind it, at night only, no light, no shadow, no collision), as Ming Suzhou's lanterns and
// Sydney's windows are (`Halo` is a copy of theirs). It shows at the low preset, where the pool of real lamps is off. The halo has one warm colour, so
// the tungsten of a window and the lamps' white are not told apart [inferred: a glow, not a measure]. What is lit and where is read off the builders'
// own numbers (the lots, frontOf(), the school's ribbon windows, the Törten and Masters' frames), so a glow stands in a window that is there.
// Pure functions of places: no counters, no Math.random. One plan, always shown, one draw.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { registerStyle } from '../../core/build.js';
import { Fr } from '../../styles/bauhaus/frame.js';
import { frontOf } from '../../styles/bauhaus/tenement.js';
import { LV, PL, B, MASTERS, TORTEN, TORTEN_FRONT, KONSUM, TRAM_TRACKS, TRAM_STOP, lots } from './layout.js';
import { lampSites, LAMP_H } from './lamps.js';

const TAU = Math.PI * 2;
/** A number in [0, 1) from numbers alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Triangles (position and a normal per corner) of the halo material (a copy of Sydney's `Halo`). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  get tris() { return this.pos.length / 9; }
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
  /** A pool of light on the paving (a disc lying at height y); yaw turns its first semi-axis r from +x toward −z. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]);
  }
  /** The glow round a lamp: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let j = 0; j < 3; j++) { const a = j * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 6, [k, 0], [0, 1]); }
  }
  /** A flat sheet a b c d of brightness f (0…1) facing n = [x, z] (both faces are seen): a lit window. */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  geometry() { const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3)); return g; }
}

/** The street lamps (lamps.js): a glow at the lamp and its pool on the paving. [inferred: electric lamps in enamel shades on posts; no source read] */
function lamps(H) {
  for (const [x, z] of lampSites()) { H.ball(x, LAMP_H + 0.3, z, 0.95, 0.62); H.floor(x, 0.08, z, 4.2, 4.2, 0, 8, 0.7); }
}

/** A lit window in a frame F: u0..u1, y0..y1 at depth v, brightness f. */
function win(H, F, u0, u1, y0, y1, v, f) {
  const a = F.at(u0, v), b = F.at(u1, v), n = F.alongX ? [0, F.out] : [F.out, 0];
  H.quad([a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], n, f);
}
/** A pool of light on the paving before a frame's front at u (about d out, radius r). */
function pool(H, F, u, d, r, k) { const p = F.at(u, -d); H.floor(p[0], 0.08, p[1], r, r * 0.8, F.alongX ? 0 : Math.PI / 2, 8, k); }

// How lit each trade's front is in the evening: the pubs open to the closing hour; the other trades shut at seven (the Ladenschluss of 1919 **[inferred]**), their windows lit dim
const EVE = { pub: 0.85, grocer: 0.34, baker: 0.3, butcher: 0.28, tobacco: 0.4, hardware: 0.26, draper: 0.36 };

/** The tenements: the ground floor's shop windows and the door's spill, the lit flats above (a share of the windows by lot). */
function tenements(H) {
  for (const l of lots()) {
    const f = frontOf(l), F = new Fr(null, l.rect, l.front), { spec, W } = f, FL = 0.12;
    if (l.shop) {
      const k = EVE[f.kind] * (0.85 + 0.3 * hashAt(l.rect[0], l.rect[1], 51)), a = 0.6, b = W - 0.6, y0 = FL + 0.7, y1 = spec.yc - 1.2;
      for (const [s0, s1] of [[a, f.du - 0.9], [f.du + 0.9, b]]) if (s1 - s0 > 1.0) { win(H, F, s0 + 0.05, s1 - 0.05, y0, y1, 0.27, k); pool(H, F, (s0 + s1) / 2, 1.4, Math.min((s1 - s0) * 0.6, 2.6), 0.55 * k); }
      pool(H, F, f.du, 1.1, 1.3, 0.7 * k);
    } else if (hashAt(l.rect[0], l.rect[1], 52) < 0.35) {
      // a flat's front room lit behind its ground-floor window
      const c = (hashAt(l.rect[0], l.rect[1], 53) * f.cols) | 0, u = f.cu(c);
      if (Math.abs(u - f.du) > 1.4) win(H, F, u - 0.5, u + 0.5, FL + 0.95, FL + 2.6, 0.27, 0.45);
    }
    // the upper storeys: the windows' columns, each lit by chance
    const share = 0.3, w = spec.modern ? 0.8 : 0.52;
    for (let s = 1; s < spec.n; s++) {
      const sb = spec.yb + (s - 1) * spec.SH, y0 = sb + 0.85, y1 = sb + spec.SH - (spec.modern ? 0.55 : 0.5);
      for (let c = 0; c < f.cols; c++) {
        const u = f.cu(c);
        if (hashAt(l.rect[0] + u, l.rect[1] + s * 7, 54) > share) continue;
        win(H, F, u - w + 0.05, u + w - 0.05, y0 + 0.05, y1 - 0.05, 0.27, 0.34 + 0.4 * hashAt(u, sb, l.seed % 97));
      }
    }
  }
}

/** The Törten rows (torten.js: the street ribbon above and the shop-front window below, per house) and the Konsum. */
function torten(H) {
  const Y = 0.15, YC = Y + 2.75, YB = YC + 0.3, T = 0.3;
  TORTEN.forEach((r, ri) => {
    const [x0, z0, x1, z1] = r, pw = (x1 - x0) / 14;
    for (let i = 0; i < 14; i++) {
      const F = new Fr(null, [x0 + i * pw, z0, x0 + (i + 1) * pw, z1], TORTEN_FRONT[ri], i % 2 === 1), W = F.W, du = W - 1.5;
      if (hashAt(x0 + i * pw, z0, 61) < 0.45) win(H, F, 0.5, du - 0.9, Y + 0.85, Y + 2.15, T * 0.45 + 0.06, 0.42);
      if (hashAt(x0 + i * pw, z0, 62) < 0.4) win(H, F, 0.4, W - 0.4, YB + 0.75, YB + 1.95, T * 0.45 + 0.06, 0.4);
    }
  });
  // the Konsum's café and shop windows (torten.js: the low block's front on the south, the café strip 0.5…5.2 and the shop window 6.9…W−0.5)
  const [x0, z0, x1, z1] = KONSUM, F = new Fr(null, [x0, z0, x1 - 6.5, z1], 's', false), W = F.W;
  win(H, F, 0.55, 5.15, 0.15 + 0.5, 4.2 - 0.9, 0.3, 0.6); win(H, F, 6.95, W - 0.55, 0.15 + 0.6, 0.15 + 2.6, 0.3, 0.55);
  pool(H, F, 2.8, 1.4, 2.2, 0.4); pool(H, F, 9, 1.4, 2.2, 0.38);
}

/** The Masters' Houses (masters.js: the south front's windows, the studio window on the north), a share lit. */
function masters(H) {
  const Y0 = 0.3, HH = 3.0, YF = Y0 + HH + 0.3, T = 0.3;
  for (const m of MASTERS) {
    const [x0, z0, x1, z1] = m.rect, halves = m.kind === 'double' ? [[[x0, z0, (x0 + x1) / 2, z1], false], [[(x0 + x1) / 2, z0, x1, z1], true]] : [[[x0, z0, x1, z1], false]];
    halves.forEach(([rect, mirror], hi) => {
      const F = new Fr(null, rect, 's', mirror), W = F.W, D = F.D, doorU = W - 2.9, lr0 = 0.8, lr1 = doorU - 0.9, per = Math.max(1, Math.floor((lr1 - lr0) / 2.6));
      const on = (s) => hashAt(x0 + hi * 5, z0, s) < 0.6;
      for (let i = 0; i < per; i++) {
        const a = lr0 + i * (lr1 - lr0) / per, b = a + (lr1 - lr0) / per - 0.4;
        if (on(70 + i)) win(H, F, a + 0.05, b - 0.05, Y0 + 0.55, Y0 + 2.45, T * 0.45 + 0.06, 0.5);
        if (hashAt(x0 + hi * 5, z0, 80 + i) < 0.5) win(H, F, a + 0.05, b - 0.05, YF + 0.6, YF + 2.35, T * 0.45 + 0.06, 0.4);
      }
      // the north studio's wide window (the glass wall of the studio): the master at work
      if (on(90)) win(H, F, 0.85, W - 0.85, Y0 + 0.95, Y0 + 2.8, D - T + T * 0.45 - 0.06, 0.55);
      if (hashAt(x0 + hi * 5, z0, 91) < 0.5) win(H, F, 0.85, W - 0.85, YF + 0.95, YF + 2.55, D - T + T * 0.45 - 0.06, 0.4);
      const p = F.at(W - 2.9, -1.2); H.floor(p[0], 0.1, p[1], 1.2, 1.2, 0, 8, 0.35);
    });
  }
}

/** The school (school.js): the workshop wing's glass wall lit bay by bay, the Aula's tall glazing, the Prellerhaus studios' windows and balcony doors. */
function school(H) {
  const [wx0, wz0, , wz1] = B.ww, { f0, f1, f2, roof } = LV, X = wx0 + 0.75;
  // the glass wall (three floors of open panes between the dark bands, school.js): bays 2.5 m wide, a share of each floor lit
  const floors = [[f0 + 0.95, f1 - 0.55, 0.55, 'carpentry'], [f1 + 0.35, f2 - 0.55, 0.78, 'weaving'], [f2 + 0.35, roof - 0.95, 0.7, 'metal and wall-painting']];
  for (const [y0, y1, share] of floors) {
    for (let z = wz0 + 0.4; z + 2.5 < wz1 - 0.3; z += 2.5) {
      if (hashAt(wx0 + z, y0, 31) > share) continue;
      H.quad([X, y0, z], [X, y0, z + 2.4], [X, y1, z + 2.4], [X, y1, z], [-1, 0], 0.55 + 0.3 * hashAt(z, y0, 32));
    }
  }
  for (let z = wz0 + 3; z < wz1 - 2; z += 5.5) if (hashAt(z, 0, 33) < 0.8) H.floor(wx0 - 2.4, 0.1, z, 2.6, 3.2, 0, 8, 0.42);
  // the Aula's south glazing (festBlock: ribbon 1.6…40.4, sill 0.7, head 0.45, 3.2 wide, 0.7 piers), lit for an evening in the hall
  {
    const u0 = 1.6, u1 = 40.4, w = 3.2, pier = 0.7, n = Math.max(1, Math.floor((u1 - u0 - pier) / (w + pier))), step = (u1 - u0 - pier) / n, z = B.fest[3] - 0.7;
    for (let i = 0; i < n; i++) {
      const a = u0 + pier + i * step, b = a + step - pier;
      if (hashAt(a, 0, 34) < 0.7) H.quad([a, 1.0, z], [b, 1.0, z], [b, 3.75, z], [a, 3.75, z], [0, 1], 0.55);
    }
  }
  // the studios (prellerhaus: seven to a floor on the east face at x 49.7, the door's glass 1.6 wide up to 2.4 m), the lit ones
  {
    const [, z0, , z1] = B.pre, F = [PL.f0, PL.f1, PL.f2, PL.f3, PL.f4], SZ = (z1 - 0.3 - (z0 + 0.3)) / 7, x = 49.3;
    for (let k = 1; k <= 4; k++) for (let i = 0; i < 7; i++) {
      if (hashAt(i, k, 35) > 0.5) continue;
      const zc = z0 + 0.3 + i * SZ + SZ / 2;
      H.quad([x, F[k] + 0.8, zc - 0.7], [x, F[k] + 0.8, zc + 0.7], [x, F[k] + 2.3, zc + 0.7], [x, F[k] + 2.3, zc - 0.7], [1, 0], 0.5 + 0.2 * hashAt(i, k, 36));
    }
  }
  // the lamp over the door on Kothener Strasse (detail.js `entrance`: the lamp by the door at about x 4, z 9) and the forecourt's pool
  H.ball(3.5, 3.2, 9.9, 0.8, 0.6); H.floor(5, 0.1, 6, 4.5, 4, 0, 8, 0.55);
}

/** The tram at its stop: its windows lit, the headlamps, the stop's lamp and the pool under it. */
function tram() {
  const H = new Halo(), cx = TRAM_STOP[0] + 5, cz = TRAM_TRACKS[1], L = 8.6, Wd = 2.2, y0 = 1.8, y1 = 2.5;
  for (const sg of [-1, 1]) {
    const z = cz + sg * (Wd / 2 + 0.05);
    for (let k = 0; k < 7; k++) { const a = cx - L / 2 + 0.35 + k * (L - 0.5) / 7, b = a + (L - 0.5) / 7 - 0.15; H.quad([a, y0, z], [b, y0, z], [b, y1, z], [a, y1, z], [0, sg], 0.6); }
  }
  for (const e of [-1, 1]) H.ball(cx + e * (L / 2 + 0.2), 1.8, cz, 0.6, 0.62);
  H.floor(cx, 0.08, cz, 6, 2.8, 0, 10, 0.35);
  return H;
}

/** dessau_night: the plan's one element; the light is made here from the places. */
export function dessauNight(el, { bag }) {
  const H = new Halo();
  lamps(H); tenements(H); torten(H); masters(H); school(H);
  const T = tram(); H.pos.push(...T.pos); H.nor.push(...T.nor);
  if (H.pos.length) bag.add('halo', H.geometry());
}
registerStyle('dessau_night', { trim: () => {}, opening: () => {}, column: () => {}, elements: { dessau_night: dessauNight }, objects: {} });

/** The night plan: always shown (one draw), in the town's frame; `plan` is town.js's plan helper. */
export function nightPlan(plan) { return plan('dessau-night', 'dessau_night', [{ t: 'dessau_night', seed: 1927 }], null, { nocollide: true }); }

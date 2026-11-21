// Brasília by night, about 1970 (docs/settlements/brasilia.md §13): the electric light of the capital, made of geometry in the engine's one
// `halo` material (palette.js 'halo': light ADDED over what is behind it, at night only, no light, no shadow, no collision), as Sydney's
// and Suzhou's are (sydney/nightlight.js, ming-suzhou/nightlight.js; `Halo` is a copy of theirs). It shows at the low preset, where the
// pool of real lamps is off. What is lit, and where, is read off the builders' own numbers (lamps.js, layout.js, styles/brasilia/trades.js
// and the style's own window grids), so a glow is on a window or a lamp that is there. One warm colour: the mercury-vapour lamps of the
// avenues and the tungsten of the shops are not told apart [inferred: a glow, not a measure]. One plan, always shown, one draw.
// Pure functions of places: no counters, no Math.random.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { registerStyle } from '../../core/build.js';
import { lampPosts } from './lamps.js';
import { MINISTRIES, ITAMARATY, JUSTICE, ALL_BLOCKS, GALLERY, STRIP, KIOSKS, CAMP_FIRES, CATH, TOWERS, DECK, RADIUS } from './layout.js';

const TAU = Math.PI * 2;
/** A number in [0, 1) from numbers alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

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
  quad(a, b, c, d, n, f0) {
    const f = 0.6 + 0.39 * f0;                                  // (rendered, the sheets show only above about 0.6: the scale is lifted so that 0 is dim, 1 bright)
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  /** A lit sheet on a wall in the plane x = at (axis 'x') or z = at (axis 'z'), from u0 to u1 along the wall and y0 to y1, facing n. */
  pane(axis, at, u0, u1, y0, y1, n, f) {
    const P = (u, y) => (axis === 'x' ? [at, y, u] : [u, y, at]);
    this.quad(P(u0, y0), P(u1, y0), P(u1, y1), P(u0, y1), n, f);
  }
  geometry() { const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3)); return g; }
}

/** The places the night is drawn round (the arrival, the gallery on the lawn, the Cathedral, the strip of the superquadra, the Square): the far windows stay dark. */
const POINTS = [[-120, 0], [-173, -90], [0, 0], [-175, 205], [55, 330], [-80, 150], [-80, -150], [200, 0]];
const nearest = (x, z) => Math.min(...POINTS.map(([a, b]) => Math.hypot(x - a, z - b)));

/** The street lamps (lamps.js: the Esplanade's kerbs, the avenue, the Square, the apron, the deck): the head's glow and the pool on the paving. */
function lamps(H) {
  for (const l of lampPosts()) {
    const [x, z] = l.at;
    H.ball(x, l.y + l.h + 0.1, z, 1.2, 0.64); H.floor(x, l.y + 0.07, z, l.h + 0.8, l.h + 0.8, 0, 10, 0.72);
  }
}

/** What a trade lights in the evening (the commerce of a quadra shut at about seven; the snack bar, the pharmacy on duty and the bakery open later) [inferred]. */
const EVE = { lanchonete: 0.85, farmacia: 0.8, padaria: 0.72, banca: 0.62, mercearia: 0.5, hortifruti: 0.3, barbearia: 0.4, papelaria: 0.26, sapataria: 0.24, armarinho: 0.24, otica: 0.28, acougue: 0.24 };
/** The units of both strips (the services gallery on the lawn and the superquadra's comércio local; fronts face west): the glazed fronts lit either side of the door, the door's spill on the pavement under the arcade. */
function shopFronts(H) {
  for (const u of [...GALLERY, ...STRIP]) {
    const k = (EVE[u.trade] ?? 0.3) * (0.85 + 0.3 * hashAt(u.fx, u.z, 51)), x0 = u.strip[0], zd0 = u.door - 0.8, zd1 = u.door + 0.8;
    H.pane('x', u.fx - 0.12, u.z + 0.2, zd0 - 0.05, 0.45, 2.9, [-1, 0], k);
    H.pane('x', u.fx - 0.12, zd1 + 0.05, u.z + 4.0, 0.45, 2.9, [-1, 0], k);
    H.pane('x', u.fx + 0.06, zd0, zd1, 2.5, 2.95, [-1, 0], k * 0.9);                       // the transom over the door
    H.floor(x0 + 1.5, 0.08, u.door, 2.3, 1.9, 0, 8, 0.8 * k + 0.1);                         // the spill under the arcade
    H.floor(x0 - 2.2, 0.08, u.door, 2.6, 2.4, 0, 8, 0.5 * k);                               // and on the pavement beyond
  }
}

/** The superquadra's blocks: the sliding glass doors of the balconies on the south face (flats.js: 6 bays 9.3 m apart from x0 + 3, glazing 0.6…6.8 m, floors every 3 m over the 3.6 m pilotis), a share lit; the lobbies' glass under the pilotis. */
function flats(H) {
  for (const b of ALL_BLOCKS) {
    const [x0, z0, x1, z1] = b.rect, d = nearest((x0 + x1) / 2, (z0 + z1) / 2), share = 0.34 * (1 - smooth(200, 440, d));
    if (share < 0.02) continue;
    for (let y = 3.6 + 3.0; y < 21.6; y += 3.0) for (let x = x0 + 3; x < x1 - 3; x += 9.3) {
      if (hashAt(x, y + z0, 71) > share) continue;
      const f = 0.34 + 0.42 * hashAt(x, y, 72);
      H.pane('z', z1 - 0.44, x + 0.7, x + 6.7, y + 0.2, y + 2.5, [0, 1], f);
    }
    for (const t of [0.26, 0.74]) { const xc = x0 + (x1 - x0) * t; H.pane('z', z1 - 2.35, xc - 3.0, xc + 3.0, 0.15, 2.6, [0, 1], 0.5); H.floor(xc, 0.08, z1 - 0.6, 3.2, 1.8, 0, 8, 0.55); }   // the lobby, its door's spill
  }
}

/** A ministry (ministry.js): ten floors from 4.6 m by 3.7 m, glass between the slab edges on both long faces (x0 + 0.3, x1 − 0.3) and two windows a floor on the end face; the lobby's glass under the pilotis. */
function ministries(H) {
  for (const m of MINISTRIES) {
    const [x0, z0, x1, z1] = m.rect, front = m.side === 'n' ? 1 : -1, d = nearest((x0 + x1) / 2, (z0 + z1) / 2), share = 0.3 * (1 - smooth(160, 420, d));
    if (share >= 0.02) for (let k = 0; k < 10; k++) {
      const y = 4.6 + k * 3.7;
      for (const [at, n] of [[x0 + 0.2, -1], [x1 - 0.2, 1]]) for (let z = z0 + 1.5; z < z1 - 3.5; z += 4.5) {
        if (hashAt(at + z, y, 81) > share) continue;
        H.pane('x', at, z, z + 3.6, y + 0.5, y + 3.1, [n, 0], 0.3 + 0.4 * hashAt(z, y, 82));
      }
      for (const dx of [3.0, 9.0]) if (hashAt(x0 + dx, y + z0, 83) < share * 1.4) H.pane('z', front > 0 ? z1 + 0.06 : z0 - 0.06, x0 + dx, x0 + dx + 4.0, y + 1.0, y + 2.8, [0, front], 0.4 + 0.3 * hashAt(dx, y, 84));
    }
    // the lobby (the first core, 30 % along): its glass wall toward the end, lit, and the spill under the pilotis
    const zc = z0 + (z1 - z0) * 0.3, zs = zc - 3, dxm = (x0 + 5 + x1 - 5) / 2;
    H.pane('z', zs - 0.04, x0 + 5.4, dxm - 1.0, 0.2, 2.9, [0, -1], 0.55); H.pane('z', zs - 0.04, dxm + 1.0, x1 - 5.4, 0.2, 2.9, [0, -1], 0.55);
    H.floor(dxm, 0.08, zs - 1.8, 3.0, 2.2, 0, 8, 0.6);
  }
}

/** The Itamaraty and the Palace of Justice (blocks.js arcadePalace): the lobby's glass on four sides and the two glazed storeys above, floodlit and lit within. */
function palaces(H) {
  for (const r of [ITAMARATY, JUSTICE]) {
    const gx0 = r[0] + 11, gx1 = r[2] - 11, gz0 = r[1] + 11, gz1 = r[3] - 11;
    for (const [axis, at, n, a, b] of [['x', gx0 - 0.05, [-1, 0], gz0 + 0.5, gz1 - 0.5], ['x', gx1 + 0.05, [1, 0], gz0 + 0.5, gz1 - 0.5], ['z', gz0 - 0.05, [0, -1], gx0 + 0.5, gx1 - 0.5], ['z', gz1 + 0.05, [0, 1], gx0 + 0.5, gx1 - 0.5]]) {
      H.pane(axis, at, a, b, 0.7, 4.5, n, 0.5);
      for (const [y0, y1] of [[5.4, 8.8], [9.6, 13.0]]) for (let u = a; u < b - 1; u += 6) if (hashAt(at + u, y0, 91) < 0.55) H.pane(axis, at + (n[0] + n[1]) * 0.1, u, Math.min(u + 5, b), y0, y1, n, 0.34 + 0.3 * hashAt(u, y0, 92));
    }
  }
}

/** The Congress's two towers (congress.js: glass between steel mullions, a floor every 3.5 m from the deck, spandrel 0.95 m): offices lit by bays on both long faces. */
function towers(H) {
  const [tx0, tx1] = TOWERS.x;
  for (const [ta, tb] of TOWERS.z) for (let k = 0, y = DECK + 0.4; y < TOWERS.h - 4.4; y += 3.5, k++) for (let z = ta + 1.7; z < tb - 3; z += 6.2) for (const [at, n] of [[tx0 - 0.2, -1], [tx1 + 0.2, 1]]) {
    if (hashAt(at + z, y, 101) > 0.3) continue;
    H.pane('x', at, z, z + 5.4, y + 1.4, y + 2.5, [n, 0], 0.34 + 0.4 * hashAt(z, y, 102));
  }
}

/** The kiosks (the service window 2 m wide, 1.0…1.85 m up, on the front, awning over): lit; the pool before it. */
function kiosks(H) {
  KIOSKS.forEach(([x, z, r, kind], i) => {
    const P = (u, v) => [[x + u, z + v], [x + v, z - u], [x - u, z - v], [x - v, z + u]][((r % 4) + 4) % 4], F = [[0, 1], [1, 0], [0, -1], [-1, 0]][((r % 4) + 4) % 4];
    const a = P(-1.0, 0.95), b = P(1.0, 0.95), k = kind === 'lanchonete' ? 0.8 : kind === 'sorvete' ? 0.7 : 0.55;
    H.quad([a[0], 1.0, a[1]], [b[0], 1.0, b[1]], [b[0], 1.85, b[1]], [a[0], 1.85, a[1]], F, k);
    const p = P(0, 2.4); H.floor(p[0], 0.08, p[1], 2.4, 2.0, F[0] ? Math.PI / 2 : 0, 8, 0.6 * k + 0.2 + 0.02 * (i % 3));
  });
}

/** The candangos' camp: the three hearths of the yard glow orange on the faces round them (one of the places the night is not electric). */
function camp(H) {
  for (const [x, z] of CAMP_FIRES) { H.ball(x, 0.7, z, 1.2, 0.8); H.floor(x, 0.07, z, 4.5, 4.5, 0, 8, 0.85); }
}

/** The Cathedral: the glass of the hyperboloid lit from within, a soft glow in the nave seen through the coloured panels, the plaza's pool of light. */
function cathedral(H) {
  const [cx, cz] = CATH.c;
  H.ball(cx, 13, cz, 13, 0.42); H.ball(cx, 22, cz, 9, 0.36);
  H.floor(cx, 0.07, cz, CATH.pool + 6, CATH.pool + 6, 0, 16, 0.3);
}

function brasiliaNight(el, { bag }) {
  const H = new Halo();
  lamps(H); shopFronts(H); flats(H); ministries(H); palaces(H); towers(H); kiosks(H); camp(H); cathedral(H);
  if (H.pos.length) bag.add('halo', H.geometry());
}
registerStyle('brasilia_night', { trim: () => {}, opening: () => {}, column: () => {}, elements: { brasilia_night: brasiliaNight }, objects: {} });

/** The night plan: always shown (one draw), all in the city's frame. */
export function nightPlan(base) {
  return base('brasilia-night', 'brasilia_night', [{ t: 'brasilia_night', seed: 1970 }]);
}
void RADIUS;

// Joinery and painted work of the Great East Hall (docs/buildings/foguang-east-hall.md; docs/settlements/tang-wutai.md §10):
// the plank doors in their frames with batten rails and iron studs, the straight-lattice (zhiling) windows with
// their square bars set on the diagonal, the painted crescent beams, the ink inscription of 857 under a beam.

import { box, lathe, orientOutward, fromTriangles } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function hexa(out, b, t) {
  const tris = [];
  const q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}
/** A box in a frame whose x axis is the wall's normal: (n0..n1) out of the wall, (s0..s1) along it; the wall along z when az, else along x. */
const frameBox = (az, c) => (n0, s0, n1, s1, y0, y1) => (az ? box(c[0] + n0, y0, c[1] + s0, c[0] + n1, y1, c[1] + s1) : box(c[0] + s0, y0, c[1] + n0, c[0] + s1, y1, c[1] + n1));

/**
 * tang_door { at [x, z] (the opening's centre on the wall's middle line), axis 'z' (the wall runs along z) | 'x',
 * y (the floor), w (the opening), h, th (the wall's thickness), out (+1 | −1: which side of the wall is outside, on its normal axis) }:
 * the jambs and head lining the opening, the threshold, and two leaves swung open inward, each of vertical
 * planks with three battens, rows of iron studs, a ring pull; the leaves' hinges at the opening's edges.
 */
export function tangDoor(el, { bag, col }) {
  const az = (el.axis ?? 'z') === 'z', w = el.w ?? 3.6, h = el.h ?? 3.9, t = el.th ?? 0.9, y = el.y, out = el.out ?? -1, c = el.at;
  const B = frameBox(az, c), put = (m, ...a) => bag.add(m, B(...a));
  const n0 = -t / 2, n1 = t / 2, hw = w / 2;
  // jambs and head, a threshold board
  put('timber_red', n0, -hw, n1, -hw + 0.1, y, y + h); put('timber_red', n0, hw - 0.1, n1, hw, y, y + h);
  put('timber_red', n0, -hw, n1, hw, y + h - 0.12, y + h);
  put('limestone', n0, -hw, n1, hw, y - 0.02, y + 0.17);
  // the leaves: standing against the inner face, each hinged at its jamb
  const inner = out < 0 ? n1 : n0, dirIn = -out;                  // toward the hall's inside, along the wall's normal
  for (const s of [-1, 1]) {
    const hz = s * (hw - 0.1), len = hw - 0.1 - 0.02, th = 0.1;
    const a0 = inner + (dirIn > 0 ? 0.04 : -0.04 - len), a1 = a0 + len;     // the leaf's extent along the normal
    const z0 = hz - (s > 0 ? th : 0), z1 = z0 + th;
    const leaf = (m, p0, q0, p1, q1, ya, yb) => bag.add(m, B(p0, q0, p1, q1, ya, yb));
    leaf('timber_red', a0, z0, a1, z1, y + 0.03, y + h - 0.15);
    // faces: the planks' joints as thin ridges, three battens, the studs and the ring pull — on both faces
    for (const face of [-1, 1]) {
      const zf0 = face > 0 ? z1 : z0 - 0.02, zf1 = face > 0 ? z1 + 0.02 : z0;
      for (let k = 1; k < 9; k++) { const a = a0 + len * k / 9; leaf('wood_dark', a - 0.006, zf0, a + 0.006, zf1, y + 0.05, y + h - 0.17); }
      for (const hy of [0.35, h / 2 - 0.05, h - 0.55]) leaf('timber_red', a0, face > 0 ? z1 + 0.02 : z0 - 0.045, a1, face > 0 ? z1 + 0.045 : z0 - 0.02, y + hy, y + hy + 0.2);
      for (const hy of [0.45, h / 2 + 0.05, h - 0.45]) for (let k = 0; k < 6; k++) { const a = a0 + len * (k + 0.5) / 6; leaf('iron', a - 0.03, face > 0 ? z1 + 0.045 : z0 - 0.065, a + 0.03, face > 0 ? z1 + 0.065 : z0 - 0.045, y + hy + 0.07, y + hy + 0.13); }
    }
    // the ring pull near the free edge, at the height of the hand
    const af = dirIn > 0 ? a1 - 0.2 : a0 + 0.2;
    leaf('bronze', af - 0.05, z0 - 0.07, af + 0.05, z0 - 0.02, y + 1.3, y + 1.4); leaf('bronze', af - 0.05, z1 + 0.02, af + 0.05, z1 + 0.07, y + 1.3, y + 1.4);
    // the iron hinge straps at the jamb
    for (const hy of [0.5, h - 0.7]) leaf('iron', a0, z0 - 0.012, a0 + Math.min(0.5, len), z1 + 0.012, y + hy, y + hy + 0.08);
    col.rect(el.axis === 'x' ? [c[0] + z0, c[1] + a0, c[0] + z1, c[1] + a1] : [c[0] + a0, c[1] + z0, c[0] + a1, c[1] + z1], y, y + h - 0.15);
  }
}

/**
 * tang_window { at [x, z], axis, y (sill), w, h, t (wall thickness `th`) }: a straight-lattice (zhiling) window: a frame
 * of timber lining the opening, two rails and the vertical bars of square section set on the diagonal, a sill board.
 */
export function tangWindow(el, { bag }) {
  const az = (el.axis ?? 'z') === 'z', w = el.w ?? 2.6, h = el.h ?? 1.8, t = el.th ?? 0.9, y = el.y, c = el.at;
  const B = frameBox(az, c), put = (m, ...a) => bag.add(m, B(...a)), hw = w / 2;
  put('timber_red', -t / 2, -hw, t / 2, -hw + 0.1, y, y + h); put('timber_red', -t / 2, hw - 0.1, t / 2, hw, y, y + h);
  put('timber_red', -t / 2, -hw, t / 2, hw, y + h - 0.1, y + h); put('timber_red', -t / 2, -hw, t / 2, hw, y, y + 0.1);
  for (const f of [0.28, 0.5, 0.72]) put('timber_red', -0.05, -hw + 0.1, 0.05, hw - 0.1, y + h * f - 0.03, y + h * f + 0.03);
  // the bars: 5 cm squares turned 45°, 18 cm apart, between the rails; the paper behind them is the room's dark
  const n = Math.floor((w - 0.2) / 0.18), tris = [];
  for (let k = 0; k < n; k++) {
    const s = -hw + 0.1 + (k + 0.5) * (w - 0.2) / n, r = 0.045, pt = (a, b, yy) => (az ? [c[0] + a, yy, c[1] + s + b] : [c[0] + s + b, yy, c[1] + a]);
    hexa(tris, [pt(-r, 0, y + 0.1), pt(0, r, y + 0.1), pt(r, 0, y + 0.1), pt(0, -r, y + 0.1)], [pt(-r, 0, y + h - 0.1), pt(0, r, y + h - 0.1), pt(r, 0, y + h - 0.1), pt(0, -r, y + h - 0.1)]);
  }
  bag.add('timber_red', fromTriangles(tris));
  put('limestone', -t / 2 - 0.12, -hw - 0.1, -t / 2 + 0.02, hw + 0.1, y - 0.1, y);       // a sill stone on the outer side
}

/** tang_beam_paint { a, b, y0, y1 (the beam's faces), th (its thickness across) }: white lines along the arrises of a beam of red lacquer and banded ends. */
export function tangBeamPaint(el, { bag }) {
  const [ax, az] = el.a, [bx, bz] = el.b, alongZ = Math.abs(ax - bx) < 0.01, th = el.th ?? 0.3, e = 0.004;
  const bx_ = (m, s0, s1, c0, c1, ya, yb) => bag.add(m, alongZ ? box(ax + c0, ya, Math.min(az, bz) + s0, ax + c1, yb, Math.min(az, bz) + s1) : box(Math.min(ax, bx) + s0, ya, az + c0, Math.min(ax, bx) + s1, yb, az + c1));
  const L = Math.hypot(bx - ax, bz - az), h = el.y1 - el.y0, h2 = th / 2;
  // the white lines on both side faces near the lower arris and a green one above, on the underside a central white
  for (const s of [-1, 1]) {
    bx_('paint_white', 0.55, L - 0.55, s > 0 ? h2 : -h2 - e, s > 0 ? h2 + e : -h2, el.y0 + 0.05, el.y0 + 0.09);
    bx_('clay_green', 0.55, L - 0.55, s > 0 ? h2 : -h2 - e, s > 0 ? h2 + e : -h2, el.y0 + 0.12, el.y0 + 0.15);
  }
  if (!el.noCentre) bx_('paint_white', 0.55, L - 0.55, -0.02, 0.02, el.y0 - e, el.y0);
  // the beam ends: bands of white, green and red across the lower face
  for (const [s0, s1] of [[0, 0.5], [L - 0.5, L]]) for (let k = 0; k < 5; k++) {
    const a = s0 + (s1 - s0) * k / 5, b = s0 + (s1 - s0) * (k + 1) / 5 - 0.02;
    bx_(k % 2 ? 'clay_green' : 'paint_white', a, b, -h2 + 0.02, h2 - 0.02, el.y0 - e, el.y0);
  }
  void h;
}

/**
 * tang_inscription { a: [x, z] (one end of the line of text along the beam), b, y (the beam's underside), w (the width), cols, seed }:
 * the ink inscription of 857 on the underside of a beam, in columns of brush strokes (horizontal, vertical, falling
 * strokes and dots in cells of a hand's size), read from the front; not legible words, only their rhythm and weight.
 */
export function tangInscription(el, { bag }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
  const cols = el.cols ?? 4, w = el.w ?? 0.3, rand = rng(el.seed ?? 857), y = el.y, gw = 0.095, gh = 0.12, rows = Math.floor((L - 0.2) / gh);
  const tris = [], P = (s, c, yy) => [ax + ux * s + nx * c, yy, az + uz * s + nz * c];
  const stroke = (s0, c0, s1, c1, th) => {
    const dx = s1 - s0, dc = c1 - c0, l = Math.hypot(dx, dc) || 1e-3, ps = -dc / l * th / 2, pc = dx / l * th / 2;
    hexa(tris, [P(s0 - ps, c0 - pc, y - 0.006), P(s0 + ps, c0 + pc, y - 0.006), P(s1 + ps, c1 + pc, y - 0.006), P(s1 - ps, c1 - pc, y - 0.006)], [P(s0 - ps, c0 - pc, y), P(s0 + ps, c0 + pc, y), P(s1 + ps, c1 + pc, y), P(s1 - ps, c1 - pc, y)]);
  };
  const pitch = (w - 0.06) / cols;
  for (let k = 0; k < cols; k++) {
    const c = -w / 2 + 0.03 + (k + 0.5) * pitch, n = Math.max(4, rows - Math.floor(rand() * 4));
    for (let r = 0; r < n; r++) {
      if (rand() < 0.06) continue;                                    // a gap: a worn character
      const s = 0.1 + r * gh, strokes = 2 + Math.floor(rand() * 4), g = Math.min(gw, pitch * 0.85) / 2;
      for (let i = 0; i < strokes; i++) {
        const t = rand();
        if (t < 0.3) { const o = (rand() - 0.5) * gh * 0.8; stroke(s + o, c - g, s + o + (rand() - 0.5) * 0.01, c + g, 0.008); }
        else if (t < 0.55) { const o = (rand() - 0.5) * g * 1.6; stroke(s - gh * 0.45, c + o, s + gh * 0.45, c + o, 0.008); }
        else if (t < 0.8) { const o = (rand() - 0.5) * g; stroke(s - gh * 0.4, c + o + g * 0.6, s + gh * 0.4, c + o - g * 0.6, 0.007); }
        else stroke(s + (rand() - 0.5) * gh * 0.6, c + (rand() - 0.5) * g, s + 0.012 + (rand() - 0.5) * gh * 0.6, c + (rand() - 0.5) * g + 0.01, 0.014);
      }
    }
  }
  bag.add('lacquer_black', fromTriangles(tris));
}
export const hallElements = { tang_door: tangDoor, tang_window: tangWindow, tang_beam_paint: tangBeamPaint, tang_inscription: tangInscription };

/**
 * bell { at, y (the rim), h (1.25) }: a temple bell of bronze, a flared waist, a crown with a loop, bands on the
 * waist and a ring of studs; hangs from a beam above it (the beam is the plan's).
 */
function bell(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, k = (el.h ?? 1.25) / 1.25, r = 0.55 * k;
  bag.add('bronze', lathe([[r * 1.04, 0], [r * 1.0, 0.1 * k], [r * 0.86, 0.5 * k], [r * 0.78, 0.95 * k], [r * 0.7, 1.15 * k], [r * 0.5, 1.25 * k], [0.001, 1.27 * k]], 20, null, x, y, z));
  bag.add('bronze', lathe([[r * 1.06, 0.0], [r * 1.06, 0.06 * k], [r * 1.0, 0.06 * k], [r * 1.0, 0.0]], 20, null, x, y, z));            // the lip
  for (const f of [0.38, 0.7]) bag.add('bronze', lathe([[r * (0.9 - 0.12 * f) + 0.02, 0], [r * (0.9 - 0.12 * f) + 0.02, 0.05 * k], [r * (0.9 - 0.12 * f) - 0.01, 0.05 * k]], 20, null, x, y + f * 1.1 * k, z));
  // the loop (a crouching dragon in the real bell), the hook to the beam
  bag.add('bronze', lathe([[0.001, 0], [0.09, 0], [0.09, 0.22], [0.001, 0.22]], 8, null, x, y + 1.25 * k, z));
  bag.add('iron', lathe([[0.001, 0], [0.025, 0], [0.025, 0.3], [0.001, 0.3]], 6, null, x, y + 1.47 * k, z));
  col.circle(x, z, r * 1.1, y, y + 1.3 * k);
}
/** censer { at, y }: a bronze incense burner (xianglu): a round cauldron on three legs, two upright handles, a domed lid pierced for smoke with a knob. */
function censer(el, { bag, col }) {
  const [x, z] = el.at, y = el.y;
  bag.add('bronze', lathe([[0.001, 0.32], [0.4, 0.36], [0.5, 0.55], [0.5, 0.78], [0.44, 0.84], [0.001, 0.84]], 18, null, x, y, z));
  bag.add('bronze', lathe([[0.52, 0.8], [0.44, 0.9], [0.3, 1.02], [0.1, 1.1], [0.07, 1.18], [0.001, 1.22]], 18, null, x, y, z));            // the lid
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.4; bag.add('bronze', lathe([[0.001, 0], [0.07, 0.02], [0.05, 0.3], [0.001, 0.36]], 6, null, x + Math.cos(a) * 0.38, y, z + Math.sin(a) * 0.38)); }
  for (const s of [-1, 1]) bag.add('bronze', box(x + s * 0.5 - 0.03, y + 0.78, z - 0.1, x + s * 0.5 + 0.03, y + 1.0, z + 0.1));
  col.circle(x, z, 0.6, y, y + 1.2);
}
export const hallObjects = { bell, censer };

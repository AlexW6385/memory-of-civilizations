// The Bayn al-Qasrayn (docs/settlements/mamluk-cairo.md §11): the wide stretch of al-Mu'izz street between the
// complexes of Qalawun, al-Nasir Muhammad and Barquq. bayn_front builds one complex's street front: sections of
// ashlar wall with tall pointed recessed panels (each holding a grilled window, a pointed window and an oculus,
// its head ringed with ablaq voussoirs), the portal with its muqarnas hood, the Gothic marble portal of al-Nasir
// Muhammad, the stepped cornice with stalactites and merlons.

import { box, lathe } from '../../core/geom.js';
import { arcadeWall } from '../mughal/index.js';
import { S, rng, frame, polyGeo, archPoly, voussoirs, archRing, circlePoly, cornice } from './kit.js';

/** One section of facade: the wall with its panels along face fr from u0 to u1, plane at d = proj (outward of the base plane). */
function section(bag, col, fr, r, y, sec, kind, rand) {
  const { u0, u1, h, proj = 0, mat = S, portal } = sec, th = 0.6, len = u1 - u0;
  const a = fr.P(u0, proj - th / 2), b = fr.P(u1, proj - th / 2);
  const inside = fr.P((u0 + u1) / 2, -20);
  // the panels: pitch 4.4 m, each 3.2 m wide with its sill 1.4 m up; the head 2.6 m under the cornice
  const sill = 1.4, ph = h - 2.6 - sill, arches = [];
  const gap = portal ? [portal.u - portal.w / 2 - 1.2 - u0, portal.u + portal.w / 2 + 1.2 - u0] : null;
  const n = Math.max(1, Math.round(len / 4.4)), pitch = len / n, pw = Math.min(3.2, pitch - 1.0);
  const panels = [];
  for (let i = 0; i < n; i++) {
    const c = (i + 0.5) * pitch;
    if (gap && c + pw / 2 > gap[0] && c - pw / 2 < gap[1]) continue;
    panels.push(c); arches.push({ at: c, w: pw, h: ph, sill, depth: 0.1, back: mat });
  }
  if (portal && portal.h > 0) arches.push({ at: portal.u - u0, w: portal.w, h: portal.h, sill: 0, depth: 0.1, back: 'opening' });
  arcadeWall(bag, col, a, b, y, h, th, mat, arches, inside);
  // the mass behind the wall (its front just behind the panels' back planes), and the string course at the foot
  const back = fr.P(u0, proj - th - 0.15), back1 = fr.P(u1, proj - th - 0.15), deep = fr.P(u0, -r[4]), deep1 = fr.P(u1, -r[4]);
  const rect = [Math.min(back[0], back1[0], deep[0], deep1[0]), Math.min(back[1], back1[1], deep[1], deep1[1]), Math.max(back[0], back1[0], deep[0], deep1[0]), Math.max(back[1], back1[1], deep[1], deep1[1])];
  bag.add(mat, box(rect[0], y - 0.4, rect[1], rect[2], y + h - 0.5, rect[3]));
  bag.add('flagstone', fr.B(u0, u1, y - 0.1, y + 0.45, proj - th - 0.02, proj + 0.12));
  bag.add(mat, fr.B(u0, u1, y + 0.45, y + 0.55, proj - th, proj + 0.18));
  // each panel's furnishing: the pointed ring of ablaq voussoirs at its head, the windows within
  for (const c of panels) {
    const u = u0 + c, top = sill + ph, pu = u - pw / 2, d1 = proj + 0.04, dback = proj - th - 0.12;
    voussoirs(bag, fr, pu, y + sill, pw, ph, 0.38, proj - 0.02, d1 + 0.06, kind === 'nasir' ? ['marble_smooth', 'plaster'] : ['marble_dark', 'marble_smooth']);
    // the lower window: a grille in a marble frame, the sill
    const wy = y + sill + 1.7, ww = Math.min(1.2, pw * 0.38);
    bag.add('marble_smooth', fr.B(u - ww - 0.12, u + ww + 0.12, wy - 0.15, wy, dback - 0.02, dback + 0.12));
    bag.add('opening', fr.B(u - ww, u + ww, wy, wy + 1.9, dback - 0.01, dback + 0.06));
    for (const s of [-1, 0, 1]) bag.add('iron', fr.B(u + s * ww * 0.6 - 0.025, u + s * ww * 0.6 + 0.025, wy, wy + 1.9, dback + 0.06, dback + 0.1));
    for (let g = 1; g < 4; g++) bag.add('iron', fr.B(u - ww, u + ww, wy + g * 0.45, wy + g * 0.45 + 0.04, dback + 0.06, dback + 0.1));
    bag.add('marble_dark', fr.B(u - ww - 0.12, u + ww + 0.12, wy + 1.9, wy + 2.05, dback - 0.02, dback + 0.12));
    // the upper window (pointed) and the oculus above it, if the panel is tall enough
    if (ph > 7.5) {
      const vy = y + sill + ph - 5.9, vw = Math.min(1.3, pw * 0.42);
      bag.add('opening', polyGeo(fr, archPoly(u - vw / 2, vy, vw, 2.7), dback - 0.01, dback + 0.06));
      archRing(bag, 'marble_smooth', fr, u - vw / 2, vy, vw, 2.7, 0.14, dback - 0.02, dback + 0.1);
      for (const s of [-1, 1]) bag.add('iron', fr.B(u + s * vw * 0.2 - 0.02, u + s * vw * 0.2 + 0.02, vy, vy + 2.0, dback + 0.06, dback + 0.09));
      const oy = y + sill + ph - 1.9;
      bag.add('marble_dark', polyGeo(fr, circlePoly(u, oy, 0.62, 14), dback - 0.02, dback + 0.1));
      bag.add('opening', polyGeo(fr, circlePoly(u, oy, 0.5, 14), dback + 0.08, dback + 0.12));
      for (let k = 0; k < 4; k++) { const t = k / 4 * Math.PI; bag.add('marble_smooth', polyGeo(fr, [[u + Math.cos(t) * 0.5 - 0.02, oy + Math.sin(t) * 0.5], [u + Math.cos(t) * 0.5 + 0.02, oy + Math.sin(t) * 0.5], [u - Math.cos(t) * 0.5 + 0.02, oy - Math.sin(t) * 0.5], [u - Math.cos(t) * 0.5 - 0.02, oy - Math.sin(t) * 0.5]], dback + 0.1, dback + 0.14)); }
      // a band of inscription under the panel's head
      if (rand() < 0.5) bag.add('stucco', fr.B(u - pw / 2 + 0.1, u + pw / 2 - 0.1, y + sill + ph - 3.0, y + sill + ph - 2.8, dback - 0.01, dback + 0.04));
    } else {
      bag.add('opening', polyGeo(fr, archPoly(u - 0.55, y + sill + 3.9, 1.1, 2.2), dback - 0.01, dback + 0.06));
      archRing(bag, 'marble_smooth', fr, u - 0.55, y + sill + 3.9, 1.1, 2.2, 0.12, dback - 0.02, dback + 0.1);
    }
  }
  cornice(bag, fr, u0, u1, y + h - 0.5 + 0.5, mat, true);
  // collision of the mass
  col.rect(rect, y, y + h);
}

/** The projecting portal of Qalawun's and Barquq's type: piers, a recess with the muqarnas hood, the door, the ablaq arch. */
export function portalBlock(bag, col, fr, u, w, hh, y, proj, kind, open = false) {
  // the two piers standing out from the face, a lintel course under the cornice, the recess between them
  const pw = 1.5, out = 1.1;
  for (const s of [-1, 1]) bag.add(S, fr.B(s < 0 ? u - w / 2 - pw : u + w / 2, s < 0 ? u - w / 2 : u + w / 2 + pw, y, y + hh + 1.4, proj - 0.3, proj + out));
  voussoirs(bag, fr, u - w / 2, y + 0.1, w, hh - 0.2, 0.55, proj - 0.1, proj + out + 0.04, ['marble_dark', 'marble_pink', 'marble_smooth'], 9);
  // the muqarnas hood inside the arch: tiers of cells stepping back and up
  const tiers = 6;
  for (let k = 0; k < tiers; k++) {
    const yy = y + hh * 0.58 + k * (hh * 0.4) / tiers, cells = Math.max(2, Math.round((w - 0.5 - k * 0.5) / 0.55));
    for (let i = 0; i < cells; i++) {
      const ww = Math.max(0.2, (w - 0.3 - k * 0.55) / cells), uu = u - (w - 0.3 - k * 0.55) / 2 + i * ww;
      bag.add(S, fr.B(uu, uu + ww - 0.04, yy, yy + hh * 0.4 / tiers + 0.02, proj - 0.6, proj - 0.6 + 0.5 - k * 0.03));
      bag.add(i % 2 ? 'marble_dark' : S, fr.B(uu + 0.06, uu + ww - 0.1, yy - 0.02, yy + 0.1, proj - 0.6, proj - 0.6 + 0.65));
    }
  }
  if (open) { for (const s of [-1, 1]) bag.add(S, fr.B(s < 0 ? u - w / 2 - pw - 2.2 : u + w / 2 + pw, s < 0 ? u - w / 2 - pw : u + w / 2 + pw + 2.2, y, y + 0.55, proj + 0.1, proj + 0.75)); return; }
  // the door: stone jambs, the leaves of studded bronze-bound wood, the grilled double window and oculus above
  bag.add(S, fr.B(u - 1.5, u + 1.5, y, y + 4.3, proj - 0.62, proj - 0.5));
  for (const s of [-1, 1]) bag.add('wood_dark', fr.B(s < 0 ? u - 1.3 : u + 0.03, s < 0 ? u - 0.03 : u + 1.3, y, y + 3.6, proj - 0.5, proj - 0.4));
  for (let k = 0; k < 6; k++) for (const s of [-1, 1]) bag.add('bronze', fr.B(u + s * (0.2 + k * 0.18) - 0.03, u + s * (0.2 + k * 0.18) + 0.03, y + 0.9, y + 3.3, proj - 0.4, proj - 0.37));
  bag.add('marble_dark', fr.B(u - 1.5, u + 1.5, y + 3.6, y + 4.3, proj - 0.5, proj - 0.4));
  for (const s of [-1, 1]) { const uu = u + s * 0.8; bag.add('opening', fr.B(uu - 0.55, uu + 0.55, y + 5.0, y + 6.9, proj - 0.5, proj - 0.44)); for (let g = 1; g < 6; g++) bag.add('iron', fr.B(uu - 0.55, uu + 0.55, y + 5.0 + g * 0.3, y + 5.0 + g * 0.3 + 0.03, proj - 0.44, proj - 0.4)); bag.add('marble_smooth', fr.B(uu - 0.62, uu + 0.62, y + 6.9, y + 7.05, proj - 0.5, proj - 0.36)); }
  bag.add('marble_dark', polyGeo(fr, circlePoly(u, y + 7.8, 0.5, 12), proj - 0.5, proj - 0.4));
  // the stone benches either side of the door (mastaba), the step
  for (const s of [-1, 1]) { bag.add(S, fr.B(s < 0 ? u - w / 2 - pw - 2.2 : u + w / 2 + pw, s < 0 ? u - w / 2 - pw : u + w / 2 + pw + 2.2, y, y + 0.55, proj + 0.1, proj + 0.75)); }
  bag.add(S, fr.B(u - 2.2, u + 2.2, y, y + 0.14, proj - 0.5, proj + 0.5));
  // the block of the piers is solid
  void col; void kind;
}

/** The Gothic marble portal of al-Nasir Muhammad: a pointed arch of stepped orders on three slender columns each side. */
function gothicPortal(bag, fr, u, y, proj, hh) {
  const w0 = 4.2;
  for (const s of [-1, 1]) bag.add('plaster', fr.B(s < 0 ? u - w0 / 2 - 1.5 : u + w0 / 2, s < 0 ? u - w0 / 2 : u + w0 / 2 + 1.5, y, y + hh, proj - 0.3, proj + 0.5));
  for (let k = 0; k < 3; k++) {
    const w = w0 + k * 0.5 - 0.0, ring = 0.26, d0 = proj + 0.3 - k * 0.0, uu = u - w / 2;
    archRing(bag, k % 2 ? 'marble_dark' : 'marble_smooth', fr, uu - 0.0, y + 0.3, w - 0.5 * (k === 0 ? 0 : 0), hh - 1.2 + k * 0.0, ring, proj - 0.2 + k * 0.12, proj + 0.5 + k * 0.1);
    void d0;
  }
  // the three slender columns each side, with their capitals, standing under the arch's orders
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const cu = u + s * (w0 / 2 + 0.12 + k * 0.3), [px, pz] = fr.P(cu, proj + 0.6 + k * 0.08);
    bag.add('marble_column', lathe([[0.1, 0], [0.085, 0.15], [0.075, hh * 0.55], [0.12, hh * 0.55 + 0.2], [0.12, hh * 0.55 + 0.3]], 8, null, px, y + 0.3, pz));
    bag.add('marble_smooth', lathe([[0.15, 0], [0.15, 0.3], [0.001, 0.3]], 8, null, px, y, pz));
  }
  // the recess: the tympanum of white marble over a lintel, the door
  bag.add('marble_smooth', polyGeo(fr, archPoly(u - w0 / 2 + 0.4, y + 3.6, w0 - 0.8, hh - 5.2), proj - 0.5, proj - 0.4));
  bag.add('opening', polyGeo(fr, archPoly(u - w0 / 2 + 0.7, y + 3.8, w0 - 1.4, hh - 5.6), proj - 0.4, proj - 0.35));
  bag.add(S, fr.B(u - w0 / 2 + 0.4, u + w0 / 2 - 0.4, y + 3.3, y + 3.6, proj - 0.5, proj - 0.3));
  for (const s of [-1, 1]) bag.add('wood_dark', fr.B(s < 0 ? u - 1.4 : u + 0.03, s < 0 ? u - 0.03 : u + 1.4, y, y + 3.3, proj - 0.5, proj - 0.38));
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) bag.add('bronze', fr.B(u + s * (0.2 + k * 0.24) - 0.03, u + s * (0.2 + k * 0.24) + 0.03, y + 0.8, y + 3.0, proj - 0.38, proj - 0.35));
}

/**
 * bayn_front: { rect, face, y, kind ('qalawun' | 'nasir' | 'barquq'), seed } — the street front of one complex on the
 * Bayn al-Qasrayn. rect: the complex's block; its face the street; the base plane is the face. Heights and sections per
 * complex (docs §11): Qalawun's 67 m front of the mausoleum, the entrance passage, the madrasa whose hall projects, and
 * the lower wall of the maristan; al-Nasir's brick front with its Gothic portal; Barquq's with a recessed ablaq portal.
 */
export function baynFront(el, { bag, col }) {
  const f = el.face ?? 'e', r = el.rect, y = el.y ?? 0, fr = frame(r, f), rand = rng(el.seed || 5);
  const L = f === 'e' || f === 'w' ? r[3] - r[1] : r[2] - r[0], depth = f === 'e' || f === 'w' ? r[2] - r[0] : r[3] - r[1];
  const R = [...r, depth];
  const k = el.kind;
  let secs = [];
  if (k === 'qalawun') {
    // from the north: the mausoleum (24 m), the entrance passage (9), the madrasa (17, its hall projecting 1.8), the maristan's wall (17)
    secs = [{ u0: 0, u1: 24, h: 19 }, { u0: 24, u1: 33, h: 21, portal: { u: 28.5, w: 4.6, h: 12 } }, { u0: 33, u1: 50, h: 18, proj: 1.8 }, { u0: 50, u1: L, h: 13 }];
    secs[1].portal = { u: 28.5 - 24, w: 4.6, h: 12 };
  } else if (k === 'nasir') {
    secs = [{ u0: 0, u1: 14, h: 15, mat: 'plaster' }, { u0: 14, u1: 25, h: 16.5, mat: 'plaster', proj: 0.6, portal: { u: 5.5, w: 5.2, h: 0 } }, { u0: 25, u1: L, h: 15, mat: 'plaster' }];
  } else {
    secs = [{ u0: 0, u1: 15, h: 17 }, { u0: 15, u1: 27, h: 18.5, portal: { u: 6, w: 4.4, h: 11 } }, { u0: 27, u1: L, h: 17 }];
  }
  for (const s of secs) {
    const sec = { ...s };
    if (sec.portal) sec.portal = { ...sec.portal, u: sec.u0 + sec.portal.u };
    section(bag, col, fr, R, y, sec, k, rand);
  }
  // the side walls closing a projecting section (its hall) against its neighbours
  for (const s of secs) if (s.proj) for (const u of [s.u0, s.u1]) bag.add(S, fr.B(u - 0.3, u + 0.3, y, y + s.h, -0.6, s.proj - 0.6));
  // the portals
  if (k === 'qalawun') { const s = secs[1]; portalBlock(bag, col, fr, s.u0 + 4.5, 4.6, 12, y, 0, k); }
  if (k === 'barquq') { const s = secs[1]; portalBlock(bag, col, fr, s.u0 + 6, 4.4, 11, y, 0, k); }
  if (k === 'nasir') { gothicPortal(bag, fr, 14 + 5.5, y, 0.6, 9.4); }
  // a band of inscription under each cornice, a string course
  for (const s of secs) bag.add('stucco', fr.B(s.u0 + 0.2, s.u1 - 0.2, y + s.h - 2.3, y + s.h - 1.9, (s.proj ?? 0) - 0.02, (s.proj ?? 0) + 0.06));
}

/** The Bayn's paving: a wide flagged bed with a drain's line down its middle. { rect, y } */
export function baynBed(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0;
  bag.add('flagstone', box(x0, y - 0.3, z0, x1, y + 0.03, z1)); col.floor(el.rect, y + 0.03);
  const cx = (x0 + x1) / 2;
  bag.add('brick_paving', box(cx - 0.35, y + 0.02, z0, cx + 0.35, y + 0.045, z1));
  const n = Math.floor((z1 - z0) / 12);
  for (let i = 0; i <= n; i++) bag.add('marble_dark', box(x0, y + 0.025, z0 + i * (z1 - z0) / n - 0.05, x1, y + 0.05, z0 + i * (z1 - z0) / n + 0.05));
}

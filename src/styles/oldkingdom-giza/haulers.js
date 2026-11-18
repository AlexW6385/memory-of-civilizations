// The gang hauling a block of Tura stone on its sledge, as posed, modelled bodies (docs/settlements/giza.md §18): pullers leaning
// into the rope with the rear leg driving and the rope in the inner hand, the overseer with his staff, the boy pouring water on
// the sand before the runners, two men levering at the back, a porter with a basket on his head; the sledge with its runners,
// crossbars, lashed block and the two hauling ropes drawn taut from the runners' noses through the pullers' hands.
// Element ok_haul { at [x, z] (the sledge), ang (its heading, the direction of the haul), y, ref [x, z] (where the visitor
// stands, for the detail), items: [{ kind, lat, fwd, off, hand }] in the sledge's frame (lat: x of its local frame, fwd: along the haul) }.
// Detail by distance from the visitor: full within 15 m, reduced to 40 m (beyond it the figure is left to the street life).

import { Sculpt, stand, man, hash3 } from './anatomy.js';
import { tube, blob, blobDir } from '../nabataean/sculpt.js';

const PI = Math.PI;

function poseOf(kind, sg, h) {
  const j = (a) => (h - 0.5) * a;
  switch (kind) {
    case 'pull': {
      const alt = h > 0.5, rope = [-sg * 0.2, 0.98, 0.07], free = [sg * 0.26, 0.8 + (alt ? 0.06 : 0), alt ? -0.2 : 0.3], inL = rope[0] < 0;
      return { pelvis: [0, 0.80, 0.02], lean: 0.56 + j(0.1), tilt: 0.3, footL: [-0.11, 0.075, alt ? 0.34 : -0.3], footR: [0.11, 0.075, alt ? -0.3 : 0.34], toeL: alt ? 0 : 0.5, toeR: alt ? 0.5 : 0,
        handL: inL ? rope : free, handR: inL ? free : rope, headTurn: j(0.4), ropeLeft: inL };
    }
    case 'brace': return { pelvis: [0, 0.74, 0], lean: 0.5, tilt: 0.3, footL: [-0.12, 0.075, 0.38], footR: [0.12, 0.075, -0.28], toeR: 0.5, handL: [-0.16, 0.95, 0.5], handR: [0.16, 0.8, 0.52], headTurn: j(0.3) };
    case 'overseer': return { pelvis: [0, 0.89, 0], lean: -0.04, tilt: -0.04, footL: [-0.1, 0.075, 0.1], footR: [0.1, 0.075, -0.12], handL: [-0.21, 0.98, 0.1], handR: [0.2, 0.72, 0.1], headTurn: j(0.3), headPitch: 0.04 };
    case 'boy': return { pelvis: [0, 0.74, 0.0], lean: 0.42, tilt: 0.3, footL: [-0.1, 0.075, 0.18], footR: [0.1, 0.075, -0.16], handL: [-0.1, 0.78, 0.4], handR: [0.1, 0.9, 0.3], headTurn: j(0.3) };
    case 'porter': return { pelvis: [0, 0.89, 0], lean: 0.05, tilt: 0.03, footL: [-0.1, 0.075, 0.26], footR: [0.1, 0.1, -0.2], toeR: 0.4, handL: [-0.17, 1.74, 0.0], handR: [0.17, 1.74, 0.0], headTurn: 0.1, headPitch: -0.05 };
    default: return { pelvis: [0, 0.89, 0], footL: [-0.1, 0.075, 0], footR: [0.1, 0.075, 0], handL: [-0.2, 0.75, 0], handR: [0.2, 0.75, 0] };
  }
}

export function haul(el, { bag, col }) {
  const [sx, sz] = el.at, a = el.ang, y0 = el.y ?? 0.06, fy = y0 - 0.04, ref = el.ref ?? [sx, sz];
  const M = { skin: new Sculpt(), cloth: new Sculpt(), hair: new Sculpt() }, X = { rope: new Sculpt(), timber: new Sculpt(), stone: new Sculpt(), reed: new Sculpt() };
  const W = 1.15, Lb = 1.7, fx = Math.cos(a), fz = Math.sin(a);
  const sled = ([lx, ly, lw]) => stand(sx, y0, sz, a)([lx, ly, lw]);
  const world = (lat, y, fwd) => sled([lat, y, fwd]);
  // ── the sledge ─────────────────────────────────────────────────────────────────────────────────────────────────
  X.timber.xf = X.stone.xf = X.rope.xf = sled;
  for (const lat of [-W * 0.42, W * 0.42]) tube(X.timber, [[lat, 0.07, -Lb / 2 - 0.3, 0.045, 0.075], [lat, 0.07, 0, 0.045, 0.075], [lat, 0.07, Lb / 2 + 0.2, 0.045, 0.075], [lat, 0.13, Lb / 2 + 0.4, 0.045, 0.07], [lat, 0.3, Lb / 2 + 0.62, 0.04, 0.06]], { seg: 8, sub: 2, ref: [1, 0, 0] });
  for (let u = -Lb / 2 - 0.1, i = 0; u < Lb / 2 + 0.2; u += 0.45, i++) tube(X.timber, [[-W * 0.56, 0.17, u, 0.045, 0.04], [0, 0.17 + 0.006 * (i % 2), u, 0.045, 0.04], [W * 0.56, 0.17, u, 0.045, 0.04]], { seg: 6, sub: 1, ref: [0, 1, 0] });
  const top = 0.26 + W * 0.85;
  X.stone.box(-W / 2, 0.26, -Lb / 2, W / 2, top, Lb / 2);
  for (const u of [-Lb * 0.3, Lb * 0.3]) tube(X.rope, [[-W * 0.55, 0.17, u, 0.022], [-W / 2 - 0.03, 0.3, u, 0.022], [-W / 2 - 0.03, top + 0.02, u, 0.022], [0, top + 0.04, u, 0.022], [W / 2 + 0.03, top + 0.02, u, 0.022], [W / 2 + 0.03, 0.3, u, 0.022], [W * 0.55, 0.17, u, 0.022]], { seg: 6, sub: 2, ref: [0, 0, 1] });
  col.rect([sx - Lb / 2 - 0.4, sz - Lb / 2 - 0.4, sx + Lb / 2 + 0.4, sz + Lb / 2 + 0.4], y0, y0 + 0.3 + W);
  // ── the people ─────────────────────────────────────────────────────────────────────────────────────────────────
  const grips = { '-1': [], '1': [] };
  for (const it of el.items) {
    const [px, , pz] = world(it.lat, 0, it.fwd), h = hash3(px, 0, pz, 7);
    const dist = Math.hypot(px - ref[0], pz - ref[1]), lod = dist < 15 ? 0 : dist < 40 ? 1 : 2;
    if (lod > 1) continue;
    const heading = a + (it.off ?? 0), xf = stand(px, fy, pz, heading, it.k ?? 1);
    for (const m of Object.values(M)) m.xf = xf;
    const sg = Math.sign(it.lat) || 1, P = poseOf(it.kind, sg, h);
    const wig = it.kind === 'overseer';
    const J = man(M, P, { lod, hair: it.kind === 'boy' ? 'crop' : 'crop', wig, heavy: 0.94 + h * 0.14 });
    if (it.kind === 'pull') grips[sg].push({ fwd: it.fwd, p: xf(P.ropeLeft ? J.wrL : J.wrR) });
    if (it.kind === 'overseer') {                                                                // the staff in the left hand, the sash across the chest
      const w = J.wrL; X.timber.xf = xf; tube(X.timber, [[w[0], 0.0, w[2], 0.016], [w[0], 0.9, w[2] + 0.02, 0.018], [w[0], 1.75, w[2] + 0.03, 0.02]], { seg: 6, sub: 1, ref: [1, 0, 0] });
      M.cloth.xf = xf; tube(M.cloth, [[...J.shL, 0.03, 0.02], [...J.chest, 0.17, 0.04], [...J.hpR, 0.04, 0.03]], { seg: 8, sub: 2, ref: [0, 0, 1] });
    }
    if (it.kind === 'brace') { X.timber.xf = xf; const w = J.wrR, w2 = J.wrL; tube(X.timber, [[w[0] * 0.5 + w2[0] * 0.5, 0.05, 0.9, 0.03], [w[0] * 0.5 + w2[0] * 0.5, 0.9, 0.55, 0.035], [w[0] * 0.5 + w2[0] * 0.5, 1.2, 0.35, 0.03]], { seg: 6, sub: 1, ref: [1, 0, 0] }); }
    if (it.kind === 'boy') {                                                                      // the jar held tipped over the sand
      const c = [(J.wrL[0] + J.wrR[0]) / 2, (J.wrL[1] + J.wrR[1]) / 2 + 0.06, (J.wrL[2] + J.wrR[2]) / 2 + 0.04];
      M.skin.xf = xf; blobDir(M.skin, c, [0, -0.5, 1], 0.14, 0.095, 0.095, [1, 0, 0], 4, 9);
      blobDir(M.skin, [c[0], c[1] - 0.06, c[2] + 0.12], [0, -0.8, 1], 0.03, 0.05, 0.05, [1, 0, 0], 2, 7);
    }
    if (it.kind === 'porter') {                                                                   // the basket, wide and shallow, on the head
      const bc = [0, J.head[1] + 0.2, J.head[2]]; X.reed.xf = xf;
      blob(X.reed, bc, [0.22, 0.09, 0.22], 3, 10); blob(X.reed, [bc[0], bc[1] + 0.05, bc[2]], [0.17, 0.06, 0.17], 2, 9);
    }
  }
  // the hauling ropes: from the runners' noses, rising to the pullers' hands and on through them
  X.rope.xf = (p) => p;
  for (const sgn of [-1, 1]) {
    const gs = grips[sgn].sort((p, q) => p.fwd - q.fwd);
    if (gs.length < 2) continue;
    const lat = -0.45 * sgn * 0.6, f0 = Lb / 2 + 0.62;
    tube(X.rope, [[...world(sgn < 0 ? W * 0.42 : -W * 0.42, 0.3, f0), 0.024], [...world(lat * 1.3, 0.62, f0 + (gs[0].fwd - f0) * 0.45), 0.024], ...gs.map((g) => [...g.p, 0.024]), [...world(-0.45 * sgn * 0.6, 0.95, gs[gs.length - 1].fwd + 0.9), 0.024]], { seg: 6, sub: 2, ref: [0, 1, 0] });
  }
  for (const [m, S] of [['terracotta', M.skin], ['plaster_white', M.cloth], ['pottery_dark', M.hair], ['rope_fibre', X.rope], ['timber', X.timber], ['tura_limestone', X.stone], ['reed_mat', X.reed]]) if (S.triangles) bag.add(m, S.geometry());
  void PI; void fx; void fz;
}

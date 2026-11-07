// The street of Baroque Rome (docs/settlements/baroque-rome.md §5, "Coaches and pilgrims"): the coach of
// a cardinal or an ambassador about 1670 — the body hung on leather braces between the standards of a
// long perch carriage, the large hind wheels and the smaller fore wheels, the coachman's box under its
// fringed hammercloth, the footmen's board behind, the roof with its gilt vases, the doors with the
// arms, the windows with curtains — and the pole and traces to its pair of horses (the horses
// themselves are the shared objects' animals). A sedan chair as the Romans used it too.

import { box, lathe, rod } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { Local, ext } from '../renaissance/face.js';

/** A spoked wheel in the x = 0 plane at height r (its hub at the origin's y = r): rim, nave, spokes. */
function wheel(L, r, w, spokes, mat) {
  const N = 20;
  for (let i = 0; i < N; i++) {
    const a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2, am = (a0 + a1) / 2, len = 2 * r * Math.sin(Math.PI / N) + 0.01;
    const g = box(-w / 2, -0.05, -len / 2, w / 2, 0.05, len / 2); g.rotateX(am); g.translate(0, r + Math.cos(am) * (r - 0.05), Math.sin(am) * (r - 0.05)); L.add(mat, g);
  }
  L.add('iron', lathe([[r + 0.012, -w / 2 - 0.005], [r + 0.012, w / 2 + 0.005]].map(([a, b]) => [a, b]), 24).rotateZ(Math.PI / 2).translate(0, r, 0));
  const nave = lathe([[0.09, -0.16], [0.12, -0.05], [0.12, 0.05], [0.09, 0.16]], 10); nave.rotateZ(Math.PI / 2); nave.translate(0, r, 0); L.add(mat, nave);
  for (let k = 0; k < spokes; k++) { const a = k / spokes * Math.PI * 2; L.add(mat, rod([0, r + Math.cos(a) * 0.1, Math.sin(a) * 0.1], [0, r + Math.cos(a) * (r - 0.08), Math.sin(a) * (r - 0.08)], 0.022, 5)); }
}

/** coach: { at, rot, y, body ('lacquer_black' | 'wood_painted'), cloth, horses (true: the pole and traces reach 2.6 m ahead) } — built facing −z. */
export function coach(el, { bag, col }) {
  const L = new Local(), body = el.body ?? 'lacquer_black', cloth = el.cloth ?? 'cloth_red', G = 'gilt_bronze', TI = 'wood_painted', y0 = 0;
  const rr = 0.78, rf = 0.52, zr = 1.25, zf = -1.35, tr = 0.82, tf = 0.72;                  // the wheels' radii, axle positions, half-tracks
  for (const s of [-1, 1]) { const W1 = new Local(); wheel(W1, rr, 0.07, 12, TI); for (const [m, gs] of W1.m) for (const g of gs) L.add(m, g.translate(s * tr, y0, zr)); }
  for (const s of [-1, 1]) { const W2 = new Local(); wheel(W2, rf, 0.06, 10, TI); for (const [m, gs] of W2.m) for (const g of gs) L.add(m, g.translate(s * tf, y0, zf)); }
  // the axles, the perch from axle to axle, the standards rising at both ends that carry the braces
  L.add(TI, box(-tr - 0.05, rr - 0.06, zr - 0.06, tr + 0.05, rr + 0.06, zr + 0.06));
  L.add(TI, box(-tf - 0.05, rf - 0.06, zf - 0.06, tf + 0.05, rf + 0.06, zf + 0.06));
  L.add(TI, box(-0.07, rf + 0.06, zf - 0.3, 0.07, rf + 0.2, zr + 0.6));
  for (const s of [-1, 1]) {
    L.add(TI, rod([s * 0.5, rr + 0.06, zr + 0.1], [s * 0.55, 1.95, zr + 0.25], 0.045, 6));
    L.add(TI, rod([s * 0.45, rf + 0.12, zf + 0.15], [s * 0.5, 1.8, zf + 0.05], 0.04, 6));
    L.add(G, lathe([[0.06, 0], [0.08, 0.06], [0.001, 0.14]], 8, null, s * 0.55, 1.95, zr + 0.25));
    L.add(G, lathe([[0.06, 0], [0.08, 0.06], [0.001, 0.14]], 8, null, s * 0.5, 1.8, zf + 0.05));
  }
  // the body: a box swelling at the bottom (its sides in a curve), hung on four leather braces
  const by = 0.95, bh = 1.45, bl = 1.0, bw = 0.68;
  const side = [[-bl, by + 0.25], [-bl + 0.18, by], [bl - 0.18, by], [bl, by + 0.25], [bl + 0.08, by + bh], [-bl - 0.08, by + bh]];
  const hole = [[-0.32, by + 0.75], [0.32, by + 0.75], [0.32, by + 1.3], [-0.32, by + 1.3]];
  for (const s of [-1, 1]) {
    const g = ext(side, [hole], -0.04, 0.04); g.rotateY(-Math.PI / 2); g.translate(s * bw, 0, 0); L.add(body, g);
    // the door's mouldings, the arms painted on its lower panel, the curtain drawn half across the window
    const pane = box(-0.02, by + 0.28, -0.38, 0.02, by + 0.68, 0.38); pane.translate(s * (bw + 0.04), 0, 0); L.add(G, pane);
    L.add(cloth, box(s * (bw + 0.055) - 0.012, by + 0.4, -0.18, s * (bw + 0.055) + 0.012, by + 0.6, 0.18));
    L.add(cloth, box(s * (bw - 0.02) - 0.01, by + 0.78, -0.3, s * (bw - 0.02) + 0.01, by + 1.28, 0.02));
    for (const yy of [by + 0.645, by + 1.33]) L.add(G, box(s * bw - 0.07, yy, -0.38, s * bw + 0.07, yy + 0.04, 0.38));
  }
  for (const s of [-1, 1]) {                                                                // the front and back panels, windows in them
    const z = s * bl, g = ext([[-bw, by + 0.25], [bw, by + 0.25], [bw + 0.02, by + bh], [-bw - 0.02, by + bh]], [[[-0.4, by + 0.8], [0.4, by + 0.8], [0.4, by + 1.28], [-0.4, by + 1.28]]], -0.04, 0.04);
    g.translate(0, 0, z + (s < 0 ? -0.0 : 0)); L.add(body, g);
  }
  L.add(body, box(-bw, by - 0.02, -bl + 0.2, bw, by + 0.25, bl - 0.2));                 // the floor's swell
  L.add('hide_black', box(-bw - 0.12, by + bh, -bl - 0.12, bw + 0.12, by + bh + 0.1, bl + 0.12));     // the leather roof
  L.add(G, box(-bw - 0.14, by + bh - 0.07, -bl - 0.14, bw + 0.14, by + bh - 0.03, bl + 0.14));
  for (const [x, z] of [[-bw, -bl], [bw, -bl], [-bw, bl], [bw, bl]]) L.add(G, lathe([[0.07, 0], [0.1, 0.08], [0.07, 0.16], [0.03, 0.2], [0.001, 0.26]], 8, null, x, by + bh + 0.1, z));
  L.add(cloth, box(-bw + 0.05, by + 0.3, -bl + 0.06, bw - 0.05, by + 0.72, -bl + 0.5));    // the seats inside, in velvet
  L.add(cloth, box(-bw + 0.05, by + 0.3, bl - 0.5, bw - 0.05, by + 0.72, bl - 0.06));
  for (const [x, z] of [[-bw + 0.1, -bl + 0.1], [bw - 0.1, -bl + 0.1], [-bw + 0.1, bl - 0.1], [bw - 0.1, bl - 0.1]])  // the braces from the standards
    L.add('hide_brown', rod([x, by + 0.15, z], [Math.sign(x) * 0.52, z < 0 ? 1.78 : 1.93, z < 0 ? zf + 0.05 : zr + 0.25], 0.025, 4));
  // the coachman's box over the fore wheels, its hammercloth; the footmen's board behind
  L.add(TI, box(-0.45, 1.55, zf - 0.55, 0.45, 1.65, zf + 0.05));
  L.add(cloth, box(-0.5, 1.15, zf - 0.6, 0.5, 1.68, zf + 0.1));
  L.add(G, box(-0.52, 1.13, zf - 0.62, 0.52, 1.18, zf + 0.12));
  L.add(TI, box(-0.4, 1.0, zf - 0.75, 0.4, 1.05, zf - 0.55));
  L.add(TI, box(-0.5, 1.05, zr + 0.45, 0.5, 1.12, zr + 0.75));
  for (const s of [-1, 1]) L.add(TI, rod([s * 0.45, 1.12, zr + 0.7], [s * 0.45, 1.95, zr + 0.4], 0.025, 4));
  // the pole and the swingletrees, and the traces to the horses' collars ahead
  if (el.horses !== false) {
    L.add(TI, rod([0, rf + 0.15, zf - 0.2], [0, 1.0, zf - 3.6], 0.05, 6));
    L.add(TI, box(-0.75, rf + 0.12, zf - 0.32, 0.75, rf + 0.22, zf - 0.22));
    for (const s of [-1, 1]) for (const d of [-0.22, 0.22]) L.add('hide_brown', rod([s * 0.62 + d * 0.3, rf + 0.17, zf - 0.3], [s * 0.6 + d, 1.05, zf - 2.15], 0.018, 4));
  }
  const M = new Matrix4().makeRotationY(el.rot ?? 0).setPosition(el.at[0], el.y ?? 0, el.at[1]);
  L.emit(bag, M);
  const c = Math.cos(el.rot ?? 0), s2 = Math.sin(el.rot ?? 0);
  for (const zz of [zf, 0, zr]) col.circle(el.at[0] + s2 * zz, el.at[1] + c * zz, 0.9, el.y ?? 0, (el.y ?? 0) + 2.5);
}

/** sedan_chair: { at, rot, y, body, cloth } — the closed chair on its two poles, set down, its door toward −z. */
export function sedanChair(el, { bag, col }) {
  const L = new Local(), body = el.body ?? 'lacquer_black', cloth = el.cloth ?? 'cloth_red', G = 'gilt_bronze';
  const w = 0.36, d = 0.45, h = 1.6;
  L.add(body, box(-w, 0.12, -d + 0.04, w, h - 0.02, d));                                            // the box, its front left open by the door
  L.add(body, box(-w - 0.03, 0.05, -d, -w + 0.03, h - 0.02, d)); L.add(body, box(w - 0.03, 0.05, -d, w + 0.03, h - 0.02, d));
  L.add('hide_black', box(-w - 0.06, h, -d - 0.06, w + 0.06, h + 0.12, d + 0.06));
  L.add(G, box(-w - 0.07, h - 0.04, -d - 0.07, w + 0.07, h, d + 0.07));
  L.add(G, lathe([[0.06, 0], [0.08, 0.06], [0.001, 0.16]], 8, null, 0, h + 0.12, 0));
  L.add(body, box(-w + 0.04, 0.12, -d - 0.02, w - 0.04, h - 0.05, -d + 0.02));               // the door, shut
  L.add(G, box(-w + 0.12, 0.85, -d - 0.035, w - 0.12, 1.35, -d - 0.02));                      // its window, framed
  L.add(cloth, box(-w + 0.15, 0.88, -d - 0.04, w - 0.15, 1.32, -d - 0.03));
  for (const s of [-1, 1]) {
    L.add(cloth, box(s * (w + 0.031) - 0.01, 0.85, -0.25, s * (w + 0.031) + 0.01, 1.3, 0.25));   // the side windows' curtains
    L.add('wood_dark', box(s * (w + 0.06) - 0.03, 0.82, -1.35, s * (w + 0.06) + 0.03, 0.88, 1.35));   // the poles through their irons
    for (const z of [-0.3, 0.3]) L.add('iron', box(s * (w + 0.02), 0.78, z - 0.03, s * (w + 0.1), 0.92, z + 0.03));
    for (const z of [-1.3, 1.3]) L.add('wood_dark', box(s * (w + 0.06) - 0.03, 0, z - 0.03, s * (w + 0.06) + 0.03, 0.82, z + 0.03));   // the trestle feet at the poles' ends
  }
  const M = new Matrix4().makeRotationY(el.rot ?? 0).setPosition(el.at[0], el.y ?? 0, el.at[1]);
  L.emit(bag, M);
  col.circle(el.at[0], el.at[1], 0.55, el.y ?? 0, (el.y ?? 0) + 1.7);
}

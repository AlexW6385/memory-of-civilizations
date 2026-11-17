// The Chrysler Building's lobby of 1930 (docs/settlements/new-york.md §1n): behind the three revolving doors of the Lexington
// Avenue portal a hall three storeys high, its walls of red African marble with panels of lit onyx in chrome frames, a floor of
// travertine with a black border, a ceiling painted blue with a sunburst of gold rays (Edward Trumbull's mural "Transport and
// Human Endeavor"), and the elevators' doors of steel framed in chrome, each leaf inlaid with a stylised lotus in light wood.

import { box } from '../../core/geom.js';

const RM = 'marble_africano', GB = 'granite_black', CH = 'steel_chrome', GD = 'gilt_bronze', ON = 'lamp_white', WD = 'wood_dark', WO = 'wood_ochre';

/** A lining on a wall (axis 'x': the wall at x = p, spanning z u0…u1; 'z': at z = p, spanning x), out into the room by sg. */
function lin(bag, mat, axis, p, sg, u0, u1, y0, y1, d0 = 0, d1 = 0.04) {
  const a = p + sg * d0, b = p + sg * d1;
  bag.add(mat, axis === 'x' ? box(Math.min(a, b), y0, Math.min(u0, u1), Math.max(a, b), y1, Math.max(u0, u1)) : box(Math.min(u0, u1), y0, Math.min(a, b), Math.max(u0, u1), y1, Math.max(a, b)));
}
/** A wall of the hall: the red marble, a black skirting, a chrome cornice with its stepped course, onyx panels framed in chrome every `pitch`. */
function wall(bag, axis, p, sg, u0, u1, y0, y1, pitch = 2.75, panels = true) {
  if (u1 - u0 < 0.3) return;
  lin(bag, RM, axis, p, sg, u0, u1, y0 + 0.4, y1 - 0.6, 0, 0.05);
  lin(bag, GB, axis, p, sg, u0, u1, y0, y0 + 0.4, 0, 0.08);
  lin(bag, CH, axis, p, sg, u0, u1, y0 + 0.4, y0 + 0.46, 0.05, 0.1);                        // the chrome line over the skirting
  lin(bag, CH, axis, p, sg, u0, u1, y1 - 0.6, y1 - 0.5, 0.0, 0.18);
  lin(bag, GB, axis, p, sg, u0, u1, y1 - 0.5, y1 - 0.2, 0.0, 0.12);
  lin(bag, CH, axis, p, sg, u0, u1, y1 - 0.2, y1, 0.0, 0.24);
  if (!panels) return;
  const n = Math.floor((u1 - u0) / pitch);
  for (let i = 0; i < n; i++) {
    const c = u0 + (i + 0.5) * (u1 - u0) / n, hw = 0.34;
    lin(bag, CH, axis, p, sg, c - hw - 0.07, c + hw + 0.07, y0 + 1.0, y1 - 1.5, 0.05, 0.11);        // the frame
    lin(bag, ON, axis, p, sg, c - hw, c + hw, y0 + 1.07, y1 - 1.57, 0.05, 0.14);                     // the onyx, lit from behind
    lin(bag, CH, axis, p, sg, c - 0.015, c + 0.015, y0 + 1.07, y1 - 1.57, 0.14, 0.17);
  }
}
/** An elevator door: a chrome surround, two steel leaves each inlaid with a lotus of light wood fanned from its foot, the indicator over it. */
function elevator(bag, axis, p, sg, c, yF) {
  lin(bag, CH, axis, p, sg, c - 0.82, c + 0.82, yF, yF + 2.85, 0.05, 0.12);
  lin(bag, GB, axis, p, sg, c - 0.7, c + 0.7, yF, yF + 2.65, 0.12, 0.14);
  for (const [a, b] of [[c - 0.67, c - 0.015], [c + 0.015, c + 0.67]]) {
    const zc = (a + b) / 2;
    lin(bag, WD, axis, p, sg, a, b, yF, yF + 2.6, 0.14, 0.17);
    for (const [y0, y1] of [[0.08, 0.14], [2.4, 2.46]]) lin(bag, CH, axis, p, sg, a + 0.03, b - 0.03, yF + y0, yF + y1, 0.17, 0.19);
    for (let k = -2; k <= 2; k++) {                                                          // the lotus: five petals fanned from the foot
      const t = k * 0.24, L = k === 0 ? 1.05 : Math.abs(k) === 1 ? 0.9 : 0.68;
      const g = box(-0.035, 0, -0.01, 0.035, L, 0.01).rotateZ(-t);
      const m = g.translate(0, 0, 0);
      // place on the wall plane: local x runs along the wall (u), y up, z out
      const off = p + sg * 0.18;
      if (axis === 'x') { m.rotateY(sg > 0 ? Math.PI / 2 : -Math.PI / 2).translate(off, yF + 0.5, zc); } else { if (sg < 0) m.rotateY(Math.PI); m.translate(zc, yF + 0.5, off); }
      bag.add(WO, m);
    }
    lin(bag, WO, axis, p, sg, zc - 0.12, zc + 0.12, yF + 0.42, yF + 0.5, 0.17, 0.19);            // the lotus's base
  }
  lin(bag, CH, axis, p, sg, c - 0.4, c + 0.4, yF + 2.95, yF + 3.25, 0.1, 0.17);                 // the indicator
  for (let k = -2; k <= 2; k++) lin(bag, GD, axis, p, sg, c + k * 0.14 - 0.03, c + k * 0.14 + 0.03, yF + 3.0, yF + 3.2, 0.17, 0.19);
}

/** The hall: H = [x0, z0, x1, z1] (entered at x0 from the Lexington portal), y the street, top the ceiling's height. */
export function chryslerLobby(bag, col, lights, H, y, top, mouth) {
  const [hx0, hz0, hx1, hz1] = H, yF = y + 0.04, cz = (hz0 + hz1) / 2, cx = (hx0 + hx1) / 2;
  // the floor: Siena travertine with a black border and a gold line inside it
  bag.add('travertine', box(hx0, y - 0.5, hz0, hx1, yF, hz1)); col.floor(H, yF);
  for (const [a, b, c, d] of [[hx0, hz0, hx1, hz0 + 0.5], [hx0, hz1 - 0.5, hx1, hz1], [hx1 - 0.5, hz0 + 0.5, hx1, hz1 - 0.5]]) bag.add(GB, box(a, yF, b, c, yF + 0.01, d));
  for (const [a, b, c, d] of [[hx0, hz0 + 0.55, hx1 - 0.55, hz0 + 0.62], [hx0, hz1 - 0.62, hx1 - 0.55, hz1 - 0.55], [hx1 - 0.62, hz0 + 0.62, hx1 - 0.55, hz1 - 0.62]]) bag.add(GD, box(a, yF, b, c, yF + 0.012, d));
  // the walls: north and south with the elevators' banks, the west beside the doors, the east with the great onyx panel
  for (const [p, sg] of [[hz0, 1], [hz1, -1]]) {
    wall(bag, 'z', p, sg, hx0, hx1, yF, top, 2.75, false);
    for (let i = 0; i < 5; i++) { const c = hx0 + 3.4 + i * (hx1 - hx0 - 6.8) / 4; elevator(bag, 'z', p, sg, c, yF); }
    for (let i = 0; i < 4; i++) { const c = hx0 + 3.4 + (i + 0.5) * (hx1 - hx0 - 6.8) / 4; lin(bag, CH, 'z', p, sg, c - 0.4, c + 0.4, yF + 1.0, yF + 3.3, 0.05, 0.11); lin(bag, ON, 'z', p, sg, c - 0.33, c + 0.33, yF + 1.07, yF + 3.23, 0.05, 0.14); }
  }
  wall(bag, 'x', hx1, -1, hz0, hz1, yF, top, 2.75, false);
  wall(bag, 'x', hx0, 1, hz0, mouth[0], yF, top, 2.75, false); wall(bag, 'x', hx0, 1, mouth[1], hz1, yF, top, 2.75, false);
  // the great panel of the east wall: onyx in a stepped frame of chrome, gilt chevrons across it
  lin(bag, CH, 'x', hx1, -1, cz - 2.5, cz + 2.5, yF + 0.9, yF + 7.3, 0.05, 0.13);
  lin(bag, GB, 'x', hx1, -1, cz - 2.35, cz + 2.35, yF + 1.05, yF + 7.15, 0.13, 0.16);
  lin(bag, ON, 'x', hx1, -1, cz - 2.2, cz + 2.2, yF + 1.2, yF + 7.0, 0.16, 0.22);
  for (let k = 0; k < 6; k++) for (const s of [-1, 1]) { const a = cz, b = cz + s * (2.1 - k * 0.12), yy = yF + 1.6 + k * 0.85; const l = 0.04; lin(bag, GD, 'x', hx1, -1, Math.min(a, b), Math.max(a, b), yy, yy + l, 0.22, 0.25); lin(bag, GD, 'x', hx1, -1, b - 0.02, b + 0.02, yy, yy + 0.55, 0.22, 0.25); }
  for (const s of [-1, 1]) for (let k = 0; k < 8; k++) lin(bag, CH, 'x', hx1, -1, cz + s * (2.55 + 0.17 * k) - 0.04, cz + s * (2.55 + 0.17 * k) + 0.04, yF + 0.9, yF + 7.3 - k * 0.7, 0.05, 0.12);   // the fluted wings
  // the ceiling: the mural's blue sky, a sunburst of gold rays from the middle, chrome ribs across it
  bag.add('prussian_blue', box(hx0, top - 0.08, hz0, hx1, top, hz1));
  for (const x of [hx0 + 2.5, hx0 + 8, hx0 + 14, hx1 - 2.5]) bag.add(CH, box(x - 0.07, top - 0.2, hz0 + 0.3, x + 0.07, top - 0.08, hz1 - 0.3));
  for (let k = 0; k < 36; k++) {
    const t = k / 36 * Math.PI * 2, L = k % 3 === 0 ? 4.8 : k % 3 === 1 ? 3.6 : 2.6;
    bag.add(GD, box(0.9, -0.02, -0.04, 0.9 + L, 0, 0.04).rotateY(t).translate(cx - 1, top - 0.08, cz));
  }
  bag.add(GD, box(-0.9, -0.03, -0.9, 0.9, 0, 0.9).rotateY(Math.PI / 4).translate(cx - 1, top - 0.08, cz));
  for (let q = 0; q < 8; q++) { const a = (q + 0.5) * Math.PI / 4; bag.add(CH, box(-0.18, -0.025, -0.018, 0.18, 0, 0.018).rotateY(a).translate(cx - 1 + Math.cos(a) * 6.4, top - 0.08, cz + Math.sin(a) * 4.0)); }   // the aeroplanes' wings, small
  // the light: from the ceiling's cove and the onyx
  for (const x of [hx0 + 4, hx0 + 11, hx0 + 18]) lights.push({ at: [x, top - 1.2, cz], color: '#ffe0b0', intensity: 5, distance: 14 });
  lights.push({ at: [hx1 - 1, yF + 4, cz], color: '#ffd9a0', intensity: 4, distance: 9 });
}

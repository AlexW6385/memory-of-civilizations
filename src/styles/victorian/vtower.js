// The Victoria Tower (docs/settlements/london.md §8.1): Barry's square tower at the south end of the palace, 98.5 m to the base of its
// iron flagstaff, the Sovereign's Entrance on its west face — the great arched porch the monarch drives into at the State Opening —
// the Royal Arms over it between the statues of the Queen, Justice and Mercy, the tall traceried windows in four stages on every face,
// the corner turrets rising to crocketed pinnacles, the pierced parapet, the low iron roof and the flagstaff with its crown finial.
// Face frames as in ../dutch/facade.js: u along the face from its left corner, v up from the tower's foot, d outward.

import { box, lathe, frustum } from '../../core/geom.js';
import { faceFrame, prism, fbox } from '../dutch/facade.js';
import { windowOn, kingNiche, hexa, pointed } from './hall.js';

const S = 'limestone_yellow', ST = 'limestone';
const turret = (bag, x, z, y0, y1, r) => {
  bag.add(S, lathe([[r, 0], [r, y1 - y0]], 8, null, x, y0, z));
  for (let y = y0 + 9; y < y1 - 2; y += 9.5) bag.add(ST, lathe([[r + 0.28, 0], [r + 0.28, 0.45], [r, 0.5]], 8, null, x, y, z));          // the string courses ringing it
  bag.add(ST, lathe([[r + 0.45, 0], [r + 0.45, 0.35], [r, 0.4]], 8, null, x, y1, z));
  bag.add('lead', lathe([[r + 0.3, 0], [0.001, 6.5]], 8, null, x, y1 + 0.4, z));                                                              // the cap
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + Math.PI / 8; bag.add(ST, box(x + Math.cos(a) * (r * 0.62) - 0.15, y1 + 1.4 + (k % 2) * 0.5, z + Math.sin(a) * (r * 0.62) - 0.15, x + Math.cos(a) * (r * 0.62) + 0.15, y1 + 2.0 + (k % 2) * 0.5, z + Math.sin(a) * (r * 0.62) + 0.15)); }   // the crockets up its ribs
  bag.add('gilt_bronze', lathe([[0.2, 0], [0.1, 0.8], [0.001, 1.5]], 6, null, x, y1 + 6.8, z));
};

/** victoria_tower: { c: [x, z], s, h, y } — s the side (22 m), h the height to the base of the flagstaff. The west face holds the Sovereign's Entrance. */
export function victoriaTower(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, s = el.s ?? 22, h = el.h ?? 98.5, y = el.y ?? 0, R = [cx - s / 2, cz - s / 2, cx + s / 2, cz + s / 2];
  const [x0, z0, x1, z1] = R, Pd = 5, pw = 3.6, vsp = 9, rise = 5, top = vsp + rise;       // the porch: depth, half width, springing, rise of the arch
  const F = { n: faceFrame(R, 'n'), s: faceFrame(R, 's'), e: faceFrame(R, 'e'), w: faceFrame(R, 'w') };
  const A = (f, m, ...r) => bag.add(m, fbox(F[f], y, ...r)), Pz = (f, m, pts, d0, d1) => bag.add(m, prism(F[f], y, pts, d0, d1));
  // ── the mass: the body, and on the west face the porch cut into it
  bag.add(S, box(x0 + Pd, y - 0.5, z0, x1, y + h, z1)); col.rect([x0 + Pd, z0, x1, z1], y - 0.5, y + h);
  bag.add(S, box(x0, y - 0.5, z0, x0 + Pd, y + h, cz - pw)); bag.add(S, box(x0, y - 0.5, cz + pw, x0 + Pd, y + h, z1));
  col.rect([x0, z0, x0 + Pd, cz - pw], y - 0.5, y + h); col.rect([x0, cz + pw, x0 + Pd, z1], y - 0.5, y + h);
  bag.add(S, box(x0, y + top, cz - pw, x0 + Pd, y + h, cz + pw)); col.rect([x0, cz - pw, x0 + Pd, cz + pw], y + top, y + h);
  { const n = 16; for (let i = 0; i < n; i++) { const a = -pw + 2 * pw * i / n, b = -pw + 2 * pw * (i + 1) / n, ha = y + vsp + pointed(a, pw, rise), hb = y + vsp + pointed(b, pw, rise);
    bag.add(S, hexa([[x0, ha, cz + a], [x0, hb, cz + b], [x0 + Pd, hb, cz + b], [x0 + Pd, ha, cz + a]], [[x0, y + top + 0.01, cz + a], [x0, y + top + 0.01, cz + b], [x0 + Pd, y + top + 0.01, cz + b], [x0 + Pd, y + top + 0.01, cz + a]])); } }   // the spandrels over the vault
  // ── the porch's mouldings: three orders of the arch on the face, jamb shafts, the label, the plinth under them
  { const uc = s / 2, n = 16;
    for (const [k, w] of [[0, 0.5], [1, 0.5], [2, 0.5]]) {
      const r0 = pw + k * w, r1 = r0 + w, ga = r1 / r0, ri0 = rise * (r0 / pw) * 0.98, d0 = -0.02, d1 = 0.16 + k * 0.1;
      for (let i = 0; i < n; i++) { const a = -r0 + 2 * r0 * i / n, b = -r0 + 2 * r0 * (i + 1) / n; Pz('w', k % 2 ? ST : S, [[uc + a, vsp + pointed(a, r0, ri0)], [uc + b, vsp + pointed(b, r0, ri0)], [uc + b * ga, vsp + pointed(b * ga, r1, ri0 * ga)], [uc + a * ga, vsp + pointed(a * ga, r1, ri0 * ga)]], d0, d1); }
      for (const sg of [-1, 1]) { const ua = sg < 0 ? uc - r1 : uc + r0, ub = sg < 0 ? uc - r0 : uc + r1; A('w', k % 2 ? ST : S, ua, ub, 0.6, vsp, d0, d1); }
    }
    for (const sg of [-1, 1]) A('w', ST, uc + sg * (pw + 0.9) - 0.65, uc + sg * (pw + 0.9) + 0.65, 0, 0.6, 0, 0.5);               // the jambs' plinths
    const rl = pw + 1.5, rl2 = rl * 1.0;
    for (let i = 0; i < n; i++) { const a = -rl + 2 * rl * i / n, b = -rl + 2 * rl * (i + 1) / n, c = rl + 0.5, g2 = c / rl; Pz('w', S, [[uc + a, vsp + pointed(a, rl, rise * 1.52)], [uc + b, vsp + pointed(b, rl, rise * 1.52)], [uc + b * g2, vsp + pointed(b * g2, c, rise * 1.52 * g2) + 0.1], [uc + a * g2, vsp + pointed(a * g2, c, rise * 1.52 * g2) + 0.1]], 0.1, 0.5); }
    void rl2;
    // inside: the back wall with the pair of oak doors with their iron strap hinges and studs, the tracery light over them
    for (const sg of [-1, 1]) {
      const ua = sg < 0 ? uc - 3.0 : uc + 0.04, ub = sg < 0 ? uc - 0.04 : uc + 3.0;
      A('w', 'wood_dark', ua, ub, 0, 6.2, -Pd, -Pd + 0.14);
      for (const v of [0.9, 2.2, 3.6, 5.0]) A('w', 'iron', ua + 0.1, ub - 0.1, v, v + 0.12, -Pd + 0.14, -Pd + 0.2);
      for (let i = 0; i < 4; i++) for (const v of [1.6, 2.9, 4.3, 5.6]) A('w', 'gilt_bronze', ua + 0.4 + i * 0.7, ua + 0.5 + i * 0.7, v, v + 0.1, -Pd + 0.14, -Pd + 0.19);
    }
    A('w', ST, uc - 3.2, uc + 3.2, 6.2, 6.5, -Pd, -Pd + 0.3);
    windowOn(bag, F.w, y, { uc, hw: 3.0, v0: 6.5, vs: 10.2, rise: 2.8, lights: 4, transoms: [8.6], glass: 'opening', d: -Pd, depth: 0.2, label: false });
    // the Royal Arms over the arch in a square-headed frame: the shield quartered, gilt supporters' crown above, the label of the mouldings
    const sv = 19;
    A('w', ST, uc - 1.6, uc + 1.6, sv - 1.5, sv + 1.5, 0.1, 0.35); A('w', S, uc - 1.4, uc + 1.4, sv - 1.3, sv + 1.3, 0.35, 0.45);
    for (const [dx, dv, m] of [[-0.65, 0.65, 'cloth_red'], [0.65, 0.65, 'cloth_blue'], [-0.65, -0.65, 'cloth_blue'], [0.65, -0.65, 'cloth_red']]) A('w', m, uc + dx - 0.6, uc + dx + 0.6, sv + dv - 0.6, sv + dv + 0.6, 0.45, 0.52);
    for (const [dx, dv] of [[-0.65, 0.65], [0.65, 0.65], [-0.65, -0.65], [0.65, -0.65]]) { A('w', 'gold', uc + dx - 0.3, uc + dx + 0.3, sv + dv - 0.12, sv + dv + 0.28, 0.52, 0.58); A('w', 'gold', uc + dx - 0.15, uc + dx + 0.15, sv + dv - 0.4, sv + dv + 0.1, 0.52, 0.58); }   // the lions and the harp, as gilt strokes
    A('w', 'gold', uc - 0.35, uc + 0.35, sv + 1.3, sv + 1.75, 0.35, 0.5);                                                         // the crown
    // the statues of the Queen between Justice and Mercy, each in a canopied niche
    for (const [u, sd] of [[uc - 5.4, 5], [uc, 7], [uc + 5.4, 9]]) kingNiche(bag, F.w, y, u, 23.2, 0.1, ctx, sd);
    for (const sg of [-1, 1]) for (const v of [3.4, 12]) kingNiche(bag, F.w, y, uc + sg * 7.6, v + 1.5, 0, ctx, 20 + (v > 12 ? 1 : 0) + (sg > 0 ? 2 : 0));        // the patron saints on the flanking piers
    // the great window of the stage over the arms
    windowOn(bag, F.w, y, { uc, hw: 2.2, v0: 28.5, vs: 34, rise: 3, lights: 3, transoms: [31.5], glass: 'opening', depth: 0.3 });
  }
  // ── the faces in stages: a string course over each, the windows in their tracery between shafts, the plinth and the base courses
  const bounds = [0, 22, 40, 57, 74, 91, h - 1.2], uc = s / 2;
  for (const f of 'nsew') {
    const w = f === 'w';
    if (w) { A(f, ST, 0, uc - 5.2, 0, 1.4, 0, 0.5); A(f, ST, 0, uc - 5.2, 1.4, 1.6, 0, 0.62); A(f, ST, uc + 5.2, s, 0, 1.4, 0, 0.5); A(f, ST, uc + 5.2, s, 1.4, 1.6, 0, 0.62); }
    else { A(f, ST, 0, s, 0, 1.4, 0, 0.5); A(f, ST, 0, s, 1.4, 1.6, 0, 0.62); }
    for (let k = 1; k < bounds.length; k++) { A(f, ST, 0, s, bounds[k] - 0.5, bounds[k], 0, 0.45); A(f, ST, 0, s, bounds[k] - 0.62, bounds[k] - 0.5, 0, 0.6); }
    if (!w) for (const u of [s * 0.19, s * 0.5, s * 0.81]) A(f, S, u - 0.45, u + 0.45, 1.6, h - 1.4, 0, 0.5);                       // the vertical shafts between the bays
    for (let j = 1; j <= 4; j++) {
      if (w && j === 1) continue;
      const st = bounds[j], v0 = st + (j === 1 ? 3 : 2.5), vs = st + (j === 1 ? 12.4 : 11.3), rs = j === 1 ? 2.4 : 2.3;
      for (const u of [s * 0.345, s * 0.655]) windowOn(bag, F[f], y, { uc: u, hw: 1.15, v0, vs, rise: rs, lights: 2, transoms: [vs - 2.6], glass: 'opening', depth: 0.2, label: false });
    }
    if (!w) for (const u of [s * 0.345, s * 0.655]) windowOn(bag, F[f], y, { uc: u, hw: 1.1, v0: 4, vs: 14.5, rise: 3, lights: 2, transoms: [7.2, 11.2], glass: 'opening', depth: 0.2, label: false });
    // the top stage under the parapet: blind panels, the louvred openings; the parapet pierced with quatrefoils
    for (let i = 0; i < 9; i++) { const u = s * (0.12 + i * 0.095); A(f, ST, u - 0.07, u + 0.07, bounds[5] + 1, h - 2.2, 0.5, 0.62); }
    A(f, ST, 0, s, h - 1.2, h, 0, 0.7); A(f, ST, -0.2, s + 0.2, h - 0.1, h + 0.35, 0, 0.9);
    for (let i = 0; i < 11; i++) { const u = s * (0.07 + i * 0.086); A(f, 'opening', u - 0.3, u + 0.3, h - 0.95, h - 0.35, 0.69, 0.72); }
    for (const u of [s * 0.345, s * 0.655]) { A(f, 'opening', u - 0.8, u + 0.8, bounds[5] + 1.4, bounds[5] + 5.2, 0.0, 0.06); for (let l = 0; l < 7; l++) A(f, 'lead', u - 0.8, u + 0.8, bounds[5] + 1.6 + l * 0.5, bounds[5] + 1.68 + l * 0.5, 0.06, 0.14); }
  }
  // ── the corner turrets, the parapet's pinnacles, the roof and the flagstaff
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { turret(bag, x, z, y - 0.5, y + h + 2, 2.1); col.circle(x, z, 2.2, y - 0.5, y + h + 2); }
  for (const f of 'nsew') for (const u of [s * 0.2, s * 0.5, s * 0.8]) {
    const [x, z] = F[f].at(u, 0.35);
    bag.add(ST, box(x - 0.35, y + h + 0.3, z - 0.35, x + 0.35, y + h + 1.8, z + 0.35)); bag.add(ST, lathe([[0.45, 0], [0.001, 2.8]], 4, null, x, y + h + 1.8, z));
  }
  bag.add('iron_galv', frustum([x0 + 1.2, z0 + 1.2, x1 - 1.2, z1 - 1.2], y + h, y + h + 5.5, 7.5, 7.5, 7.5, 7.5));                                     // the low iron roof
  bag.add('iron', box(cx - 3.6, y + h + 5.5, cz - 3.6, cx + 3.6, y + h + 5.9, cz + 3.6));
  for (let i = -3; i <= 3; i++) { bag.add('iron', box(cx + i * 1.0 - 0.04, y + h + 5.9, cz - 3.6, cx + i * 1.0 + 0.04, y + h + 6.8, cz - 3.52)); bag.add('iron', box(cx + i * 1.0 - 0.04, y + h + 5.9, cz + 3.52, cx + i * 1.0 + 0.04, y + h + 6.8, cz + 3.6)); }   // the iron cresting
  bag.add('iron', lathe([[0.3, 0], [0.12, 16]], 8, null, cx, y + h + 5.9, cz));
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.5, 0.5], [0.35, 1.3], [0.55, 2.0], [0.2, 2.4], [0.001, 3.2]], 8, null, cx, y + h + 19.0, cz));         // the crown finial
}

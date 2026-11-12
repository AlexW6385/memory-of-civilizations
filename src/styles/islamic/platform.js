// The Dome of the Rock's platform furnished (docs/settlements/jerusalem.md §1e): the Dome of the Chain (Qubbat
// al-Silsila) east of the Dome, a small open domed building on columns, built by 'Abd al-Malik beside it; a
// water station (a stone bench with the porous jars and cups, a cloth over them) and a shoe rack at a door.
// Registered into the `islamic` style. Local frame: set at `at` ([x, z]) and y.

import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import './index.js';

/**
 * chain_dome: { at, y, r (the outer ring's radius, 5.1) } — an eleven-sided open ring of columns on a low stone floor, six columns inside
 * it under a drum and a lead dome on gilded finial; the outer ring carries a shallow lead roof sloping to the inner ring, on a beam.
 */
function chainDome(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, R = el.r ?? 5.1, Ri = R * 0.5, HO = 3.3, HI = 4.3;
  // the floor: a stepped disc
  bag.add('limestone_carved', lathe([[R + 0.9, 0], [R + 0.9, 0.16], [R + 0.5, 0.2], [R + 0.5, 0.36], [0.001, 0.36]], 22, null, x, y, z));
  col.circle(x, z, R + 0.9, y, y + 0.2);
  const Y0 = y + 0.36;
  // the eleven outer columns and the six inner: base, shaft, capital, impost
  const colAt = (cx, cz, h, r, shaft) => {
    bag.add('limestone_carved', lathe([[r * 1.45, 0], [r * 1.45, 0.1], [r * 1.1, 0.16], [r, 0.2]], 10, null, cx, Y0, cz));
    bag.add(shaft, lathe([[r, 0], [r * 0.88, h - 0.5]], 10, null, cx, Y0 + 0.2, cz));
    bag.add('marble', lathe([[r * 0.9, 0], [r * 1.3, 0.2], [r * 1.5, 0.4], [r * 1.5, 0.46], [r * 1.2, 0.5]], 10, null, cx, Y0 + h - 0.5, cz));
    col.circle(cx, cz, r * 1.45, Y0, Y0 + h);
  };
  const NO = 11, NI = 6, SH = ['granite_grey', 'marble_smooth', 'proconnesian', 'granite_red'];
  for (let k = 0; k < NO; k++) { const a = k * Math.PI * 2 / NO + 0.3; colAt(x + Math.cos(a) * R, z + Math.sin(a) * R, HO, 0.2, SH[k % 4]); }
  for (let k = 0; k < NI; k++) { const a = k * Math.PI * 2 / NI + 0.3; colAt(x + Math.cos(a) * Ri, z + Math.sin(a) * Ri, HI, 0.22, SH[(k + 1) % 4]); }
  // the entablatures: a ring beam over each ring, round arches' soffit left plain
  bag.add('limestone_carved', lathe([[R + 0.3, 0], [R + 0.3, 0.42], [R - 0.3, 0.42], [R - 0.3, 0]], 22, null, x, Y0 + HO, z));
  bag.add('limestone_carved', lathe([[Ri + 0.3, 0], [Ri + 0.3, 0.42], [Ri - 0.3, 0.42], [Ri - 0.3, 0]], 18, null, x, Y0 + HI, z));
  // the outer roof: lead, sloping up from the outer beam to the inner one
  bag.add('lead', lathe([[R + 0.55, HO - 0.02], [R + 0.4, HO + 0.34], [Ri + 0.3, HI + 0.38], [Ri - 0.1, HI + 0.38], [Ri - 0.1, HI + 0.3], [Ri + 0.2, HI + 0.3], [R + 0.3, HO + 0.3], [R + 0.45, HO - 0.02]], 22, null, x, Y0, z));
  // the dome: a drum of arched windows (plain, in stone) and a lead dome with a gilt finial
  const D0 = HI + 0.42, rd = Ri + 0.1;
  bag.add('limestone', lathe([[rd, 0], [rd, 1.0], [rd - 0.2, 1.0], [rd - 0.2, 0]], 18, null, x, Y0 + D0, z));
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6 + 0.3; bag.add('mosaic_gold', box(x + Math.cos(a) * (rd + 0.02) - 0.16, Y0 + D0 + 0.28, z + Math.sin(a) * (rd + 0.02) - 0.16, x + Math.cos(a) * (rd + 0.02) + 0.16, Y0 + D0 + 0.82, z + Math.sin(a) * (rd + 0.02) + 0.16)); }
  const prof = [[rd + 0.1, 1.0]]; for (let k = 1; k <= 9; k++) { const t = k / 9 * Math.PI / 2 * 0.95; prof.push([(rd + 0.1) * Math.cos(t), 1.0 + (rd + 0.1) * 1.0 * Math.sin(t)]); }
  bag.add('lead', lathe(prof, 20, null, x, Y0 + D0, z));
  const top = 1.0 + (rd + 0.1) * Math.sin(Math.PI / 2 * 0.95);
  bag.add('gilt_bronze', lathe([[0.1, 0], [0.16, 0.1], [0.07, 0.4], [0.2, 0.55], [0.1, 0.7], [0.001, 0.95]], 8, null, x, Y0 + D0 + top - 0.05, z));
  // the mihrab-less open sides: a low screen is NOT drawn (the building stands open on all sides); a stone bench of the poor at the floor's rim
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.78; bag.add('limestone', box(x + Math.cos(a) * (R + 0.75) - 0.5, y + 0.2, z + Math.sin(a) * (R + 0.75) - 0.5, x + Math.cos(a) * (R + 0.75) + 0.5, y + 0.4, z + Math.sin(a) * (R + 0.75) + 0.5)); }
}

/**
 * water_station: { at, dir, y } — a bench of stone with three porous jars on it under a hanging cloth awning, the cups on a rail:
 * the waqf's water given to pilgrims on the platform. dir: the way it faces ([dx, dz], default south).
 */
function waterStation(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, [dx, dz] = el.dir ?? [0, 1], yaw = Math.atan2(dx, dz), c = Math.cos(yaw), s = Math.sin(yaw);
  const P = (u, v) => [x + u * c + v * s, z - u * s + v * c];   // u across, v along the way it faces
  const rect = (u0, v0, u1, v1, y0, y1, mat) => { const a = P(u0, v0), b = P(u1, v1); bag.add(mat, box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]))); };
  rect(-1.5, -0.35, 1.5, 0.35, y, y + 0.9, 'limestone_carved');
  rect(-1.55, -0.4, 1.55, 0.4, y + 0.9, y + 0.98, 'limestone');
  for (const u of [-1.0, 0, 1.0]) { const p = P(u, 0); bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.04], [0.26, 0.28], [0.3, 0.5], [0.24, 0.74], [0.13, 0.88], [0.15, 0.93], [0.001, 0.93]], 12, null, p[0], y + 0.98, p[1])); }
  // two posts and a cloth awning over it, a brass cup rail
  for (const u of [-1.6, 1.6]) { const p = P(u, -0.45); bag.add('cedar', box(p[0] - 0.05, y, p[1] - 0.05, p[0] + 0.05, y + 2.6, p[1] + 0.05)); }
  rect(-1.9, -0.8, 1.9, 0.5, y + 2.55, y + 2.6, 'cloth_white'); rect(-1.9, 0.5, 1.9, 0.52, y + 2.1, y + 2.6, 'cloth_white');
  rect(-1.0, 0.3, 1.0, 0.34, y + 0.98, y + 1.04, 'bronze');
  const a = P(-1.6, -0.5), b = P(1.6, 0.5);
  col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 1.0);
}

/** shoe_rack: { at, dir, y, len } — a low timber rack by a door, slippers and sandals set in pairs on its boards. */
function shoeRack(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, [dx, dz] = el.dir ?? [0, 1], yaw = Math.atan2(dx, dz), c = Math.cos(yaw), s = Math.sin(yaw), L = el.len ?? 2.4;
  const P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const rect = (u0, v0, u1, v1, y0, y1, mat) => { const a = P(u0, v0), b = P(u1, v1); bag.add(mat, box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]))); };
  for (const u of [-L / 2, L / 2]) rect(u - 0.03, -0.25, u + 0.03, 0.25, y, y + 0.75, 'cedar');
  for (const h of [0.12, 0.42]) rect(-L / 2, -0.28, L / 2, 0.28, y + h, y + h + 0.04, 'cedar');
  const M = ['hide_brown', 'hide_tan', 'hide_black', 'cloth_red'];
  for (const h of [0.16, 0.46]) for (let k = 0; k < Math.floor(L / 0.32); k++) { const u = -L / 2 + 0.2 + k * 0.32; if ((k * 7 + Math.round(h * 10)) % 4 === 0) continue; rect(u - 0.07, -0.18, u + 0.07, 0.08, y + h, y + h + 0.045, M[(k + Math.round(h * 9)) % 4]); rect(u - 0.07, -0.02, u + 0.07, 0.2, y + h, y + h + 0.045, M[(k + 1 + Math.round(h * 9)) % 4]); }
  const a = P(-L / 2, -0.28), b = P(L / 2, 0.28);
  col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 0.8);
}

Object.assign(STYLES.islamic.elements, { chain_dome: chainDome, water_station: waterStation, shoe_rack: shoeRack });

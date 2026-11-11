// The Xianyang palace hall on its rammed-earth terrace (docs/settlements/qin-xianyang.md §2, §5): a two-tier terrace of beaten
// earth with a coping of grey brick, the great stair of brick steps with hollow-brick cheeks, the hall of vermilion walls
// and round red columns under a grey-tiled hipped roof, black and ochre architraves, simple bracket blocks, the throne dais,
// the screen, lamps and the bells of the hall inside; the twin que (gate towers) at the stair's foot.
import { box, frustum, lathe, rod } from '../../core/geom.js';
import { hipRoof } from '../chinese/index.js';
import { TERRACE, STAIR, HALL, QUE } from '../../settlements/qin-xianyang/layout.js';

const TOP = TERRACE.h, T1 = TERRACE.h1;

/** qin_terrace: {} — the two tiers, the coping, the colonnade's floor. The stair is a generic `stair` element. */
export function qinTerrace(el, { bag, col }) {
  const { x0, z0, x1, z1, rim } = TERRACE, sx = STAIR.x, sw = STAIR.w / 2;
  bag.add('earth_wall', frustum([x0 - rim, z0 - rim, x1 + rim, z1 + rim], 0, T1, 0.6, 0.6, 0.6, 0.6, { noBottom: true }));
  col.rect([x0 - rim, z0 - rim, x1 + rim, z1 + rim], 0, T1);
  bag.add('earth_wall', frustum([x0, z0, x1, z1], T1, TOP, 0.5, 0.5, 0.5, 0.5, { noBottom: true }));
  col.rect([x0, z0, x1, z1], T1, TOP);
  col.floor([x0, z0, x1, z1], TOP);
  // the lower tier's walk (its surface is 3.5 m up: reached from the hall's side stairs) and its coping
  const cp = (r, y, h = 0.3) => { bag.add('brick_grey', box(r[0], y, r[1], r[2], y + h, r[3])); };
  const w = 0.7;
  for (const [a, b, c, d] of [[x0, z0, x1, z0 + w], [x0, z0, x0 + w, z1], [x1 - w, z0, x1, z1]]) { bag.add('brick_grey', box(a, TOP, b, c, TOP + 1.0, d)); col.rect([a, b, c, d], TOP, TOP + 1.0); }
  for (const [a, b, c, d] of [[x0, z1 - w, sx - sw - 0.4, z1], [sx + sw + 0.4, z1 - w, x1, z1]]) { bag.add('brick_grey', box(a, TOP, b, c, TOP + 1.0, d)); col.rect([a, b, c, d], TOP, TOP + 1.0); }
  // the hollow-brick cheeks of the stair (barrier bricks, stepped with it)
  const n = Math.round(TOP / 0.16), run = STAIR.run / n, zs = z1 + STAIR.run;
  for (let i = 0; i < n; i++) for (const s of [-1, 1]) {
    const y = (i + 1) * (TOP / n);
    bag.add('brick_grey', box(sx + s * (sw + 0.2) - 0.2, 0, zs - (i + 1) * run, sx + s * (sw + 0.2) + 0.2, y + 0.45, zs - i * run));
  }
  void cp;
}

/** qin_hall: {} — the principal hall on the terrace, its interior. */
export function qinHall(el, { bag, col, lights }) {
  const { x0, z0, x1, z1 } = HALL, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, ch = 6.4, y = TOP;
  const wall = 3.4, c = [x0 + wall, z0 + wall, x1 - wall, z1 - wall], th = 1.0;
  // the floor of grey brick over the whole hall
  bag.add('brick_grey', box(x0, y, z0, x1, y + 0.08, z1));
  col.floor([x0, z0, x1, z1], y + 0.08);
  // the peristyle: round red columns on stone bases, along the four sides
  const colAt = (x, z) => {
    bag.add('granite_grey', lathe([[0.62, 0], [0.62, 0.16], [0.5, 0.2]], 12, null, x, y + 0.08, z));
    bag.add('timber_red', lathe([[0.46, 0], [0.42, ch * 0.5], [0.38, ch - 0.5]], 14, null, x, y + 0.28, z));
    bag.add('timber_red', box(x - 0.55, y + ch - 0.22, z - 0.55, x + 0.55, y + ch - 0.02, z + 0.55));       // the cap block
    col.circle(x, z, 0.5, y, y + ch);
  };
  const nx = 9, nz = 5;
  for (let i = 0; i <= nx; i++) for (const z of [z0 + 0.6, z1 - 0.6]) colAt(x0 + 0.6 + i * (x1 - x0 - 1.2) / nx, z);
  for (let j = 1; j < nz; j++) for (const x of [x0 + 0.6, x1 - 0.6]) colAt(x, z0 + 0.6 + j * (z1 - z0 - 1.2) / nz);
  // the architrave: black, with an ochre band, the rafters' ends below the eave
  const ay = y + ch;
  for (const [a, b, c2, d] of [[x0, z0, x1, z0 + 1.2], [x0, z1 - 1.2, x1, z1], [x0, z0, x0 + 1.2, z1], [x1 - 1.2, z0, x1, z1]]) {
    bag.add('lacquer_black', box(a, ay, b, c2, ay + 0.7, d));
    bag.add('paint_ochre', box(a - (c2 - a > 2 ? 0 : 0.02), ay + 0.7, b - (d - b > 2 ? 0 : 0.02), c2 + (c2 - a > 2 ? 0 : 0.02), ay + 0.82, d + (d - b > 2 ? 0 : 0.02)));
  }
  // the enclosed core: vermilion walls (a dark dado), doors in the south wall, a window slit row in the others
  const Wl = (r, y0 = y, y1 = y + ch) => { bag.add('palace_wall', box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  const doors = [cx - 12, cx, cx + 12], dw = 4.4;
  Wl([c[0], c[1] - th, c[2], c[1]]); Wl([c[0] - th, c[1] - th, c[0], c[3] + th]); Wl([c[2], c[1] - th, c[2] + th, c[3] + th]);
  let xa = c[0] - th;
  for (const d of doors) { Wl([xa, c[3], d - dw / 2, c[3] + th]); xa = d + dw / 2; bag.add('timber_red', box(d - dw / 2, y + 3.6, c[3], d + dw / 2, y + ch, c[3] + th)); col.rect([d - dw / 2, c[3], d + dw / 2, c[3] + th], y + 3.6, y + ch); bag.add('lacquer_black', box(d - dw / 2 - 0.2, y + 3.4, c[3] - 0.05, d + dw / 2 + 0.2, y + 3.6, c[3] + th + 0.05)); }
  Wl([xa, c[3], c[2] + th, c[3] + th]);
  bag.add('lacquer_black', box(c[0] - th - 0.04, y + 0.08, c[1] - th - 0.04, c[2] + th + 0.04, y + 1.0, c[1] - th));
  bag.add('lacquer_black', box(c[0] - th - 0.05, y + ch - 0.4, c[1] - th - 0.05, c[2] + th + 0.05, y + ch + 0.06, c[3] + th + 0.05));       // the wall plate, under the roof
  // inside the core: two rows of columns, the dais, the screen, seats and tables, lamps, bells, a drum
  for (let i = -3; i <= 3; i++) { if (i === 0) continue; for (const z of [cz - 3.5, cz + 5]) { const x = cx + i * 6; bag.add('timber_red', lathe([[0.4, 0], [0.37, ch * 0.5], [0.34, ch - 0.7]], 12, null, x, y + 0.08, z)); bag.add('lacquer_black', box(x - 0.5, y + ch - 0.7, z - 0.5, x + 0.5, y + ch - 0.4, z + 0.5)); col.circle(x, z, 0.45, y, y + ch); } }
  const dz0 = c[1] + 0.2, dz1 = c[1] + 8.0;
  bag.add('lacquer_black', box(cx - 9, y + 0.08, dz0, cx + 9, y + 1.1, dz1)); col.floor([cx - 9, dz0, cx + 9, dz1], y + 1.1);
  for (let k = 0; k < 4; k++) bag.add('timber_red', box(cx - 3 - k * 0.0, y + 0.08, dz1 + k * 0.4 + 0.0, cx + 3, y + 1.1 - (k + 1) * 0.27, dz1 + k * 0.4 + 0.4));
  col.ramp([cx - 3, dz1, cx + 3, dz1 + 1.6], y + 0.08, y + 1.1, 'n');
  bag.add('lacquer_red', box(cx - 3.2, y + 1.1, dz0 + 0.4, cx + 3.2, y + 1.16, dz0 + 3.4));              // the sovereign's mat
  bag.add('cloth_black', box(cx - 3.0, y + 1.16, dz0 + 0.5, cx + 3.0, y + 1.19, dz0 + 3.3));
  col.rect([cx - 3.2, dz0 + 0.4, cx + 3.2, dz0 + 3.4], y + 1.1, y + 1.5);
  bag.add('lacquer_black', box(cx - 5, y + 1.1, dz0 + 0.02, cx + 5, y + 4.6, dz0 + 0.3));                // the screen (pingfeng)
  bag.add('paint_ochre', box(cx - 4.7, y + 1.4, dz0 + 0.3, cx + 4.7, y + 1.5, dz0 + 0.34)); bag.add('paint_ochre', box(cx - 4.7, y + 4.1, dz0 + 0.3, cx + 4.7, y + 4.2, dz0 + 0.34));
  for (let i = 0; i < 5; i++) bag.add('palace_wall', box(cx - 4.2 + i * 1.9, y + 1.8, dz0 + 0.3, cx - 3.0 + i * 1.9, y + 3.8, dz0 + 0.34));
  // officials' seats: low lacquer tables on mats in two ranks down the hall
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) {
    const x = cx + s * 13, z = dz1 + 3 + i * 2.6;
    bag.add('reed_mat', box(x - 1.2, y + 0.08, z - 0.9, x + 1.2, y + 0.11, z + 0.9));
    bag.add('lacquer_red', box(x - 0.55, y + 0.11, z - 0.3, x + 0.55, y + 0.4, z + 0.3));
  }
  // lamp trees of bronze either side of the dais, braziers
  for (const s of [-1, 1]) {
    const x = cx + s * 7.5, z = dz1 + 0.8;
    bag.add('bronze', lathe([[0.3, 0], [0.25, 0.1], [0.05, 0.3], [0.04, 1.8], [0.2, 1.9], [0.001, 2.0]], 10, null, x, y + 0.08, z)); col.circle(x, z, 0.3, y, y + 2);
    bag.add('flame', lathe([[0.001, 0], [0.06, 0.08], [0.001, 0.3]], 6, null, x, y + 2.0, z));
    lights.push({ at: [x, y + 2.3, z], color: '#ffb468', intensity: 2.4, distance: 14 });
  }
  // the bell frame (bianzhong): two posts, a beam, two rows of bronze bells; a great drum on a stand
  { const bx = c[0] + 3, bz = cz + 3;
    for (const dz of [-3.4, 3.4]) { bag.add('lacquer_black', box(bx - 0.18, y + 0.08, bz + dz - 0.18, bx + 0.18, y + 2.8, bz + dz + 0.18)); col.rect([bx - 0.2, bz + dz - 0.2, bx + 0.2, bz + dz + 0.2], y, y + 2.8); }
    bag.add('lacquer_black', box(bx - 0.14, y + 2.7, bz - 3.5, bx + 0.14, y + 2.9, bz + 3.5)); bag.add('lacquer_black', box(bx - 0.14, y + 1.6, bz - 3.5, bx + 0.14, y + 1.75, bz + 3.5));
    for (let i = 0; i < 9; i++) { const zz = bz - 3 + i * 0.75; bag.add('bronze', lathe([[0.001, -0.5], [0.2, -0.46], [0.24, -0.1], [0.1, 0]], 8, null, bx, y + 2.7, zz)); }
    for (let i = 0; i < 8; i++) { const zz = bz - 2.6 + i * 0.75; bag.add('bronze', lathe([[0.001, -0.4], [0.16, -0.36], [0.19, -0.08], [0.08, 0]], 8, null, bx, y + 1.6, zz)); }
    const dx = c[2] - 3;
    bag.add('timber_red', lathe([[0.7, 0.9], [0.9, 1.5], [0.9, 2.2], [0.001, 2.2]], 16, null, dx, y + 0.08, bz)); col.circle(dx, bz, 0.9, y, y + 2.3);
    bag.add('lacquer_black', box(dx - 0.7, y + 0.08, bz - 0.7, dx + 0.7, y + 0.9, bz + 0.7));
  }
  // the hipped roof of grey tiles, the eaves reaching 3.5 m past the colonnade
  const A = (x1 - x0) / 2 + 3.5, B = (z1 - z0) / 2 + 3.5;
  hipRoof({ c: [cx, cz], A, B, y: ay + 1.2, rise: 6.4, lift: 0.3, pow: 1.3, mat: 'tile_dark', soffit: 'timber_red', ridgeMat: 'tile_dark', noChiwei: true }, { bag });
  // the eave's round tile-ends: a row of small discs under the edge
  for (let x = cx - A + 1; x < cx + A - 0.5; x += 1.0) for (const z of [cz - B, cz + B]) bag.add('terracotta', rod([x, ay + 0.9, z], [x, ay + 1.15, z], 0.17, 8));
  // the great bronze tripod (ding) before the stair
  { const dx = STAIR.x, dz = TERRACE.z1 + STAIR.run + 6;
    bag.add('bronze', lathe([[0.001, 0.6], [0.6, 0.7], [0.9, 1.2], [0.85, 1.6], [0.001, 1.6]], 14, null, dx, 0, dz));
    for (const a of [0.3, 2.4, 4.5]) bag.add('bronze', rod([dx + Math.cos(a) * 0.55, 0, dz + Math.sin(a) * 0.55], [dx + Math.cos(a) * 0.55, 0.9, dz + Math.sin(a) * 0.55], 0.14, 6));
    col.circle(dx, dz, 1.0, 0, 1.7); }
}

/** qin_que: { at [x, z] } — a gate tower: a rammed-earth base, a timber room above, a hipped roof. */
export function qinQue(el, { bag, col }) {
  const [x, z] = el.at, hw = QUE.w / 2, hd = QUE.d / 2, h = QUE.h - 3, rise = 2.6;
  bag.add('earth_wall', frustum([x - hw, z - hd, x + hw, z + hd], 0, h, 0.9, 0.9, 0.9, 0.9, { noBottom: true }));
  col.rect([x - hw, z - hd, x + hw, z + hd], 0, h);
  bag.add('brick_grey', box(x - hw + 0.4, 0, z - hd + 0.4, x + hw - 0.4, 0.6, z + hd - 0.4));
  bag.add('palace_wall', box(x - hw + 1.3, h, z - hd + 1.3, x + hw - 1.3, h + 3, z + hd - 1.3));
  bag.add('lacquer_black', box(x - hw + 1.2, h + 2.6, z - hd + 1.2, x + hw - 1.2, h + 3.1, z + hd - 1.2));
  col.rect([x - hw + 1.3, z - hd + 1.3, x + hw - 1.3, z + hd - 1.3], h, h + 3.1);
  hipRoof({ c: [x, z], A: hw + 1.4, B: hd + 1.4, y: h + 3.3, rise, lift: 0.2, pow: 1.3, mat: 'tile_dark', soffit: 'timber_red', ridgeMat: 'tile_dark', noChiwei: true }, { bag });
}

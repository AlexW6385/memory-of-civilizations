// The camp and the country's plants at Ubirr (docs/settlements/kakadu.md §4, §5): paperbark and pandanus, termite mounds, water lilies;
// the family's bark hut and lean-to, the fire with its bark trough and grindstone, the rack with geese and a goanna. Sizes [inferred].
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { placer, assembly, tube, slathe, rng } from '../../objects/kit.js';

const at = (g, x, y, z) => { g.translate(x, y, z); return g; };
const hang = (g, x, y, z, yaw) => { g.rotateY(yaw); g.translate(x, y, z); return g; };

/** A weeping paperbark: a leaning white trunk with peeling sheets, a few thick limbs, drooping crowns of narrow leaves. */
export function paperbark(el, { bag }) {
  const put = placer(el, bag), v = (el.seed ?? 1) % 4, H = el.h ?? 8;
  const A = assembly(`ka_paperbark|${v}|${H}`, (a) => {
    const r = rng(300 + v * 17), lean = (r() - 0.5) * 0.9;
    a('bark', tube([[0, 0, 0, 0.3 * H / 8, 0.3 * H / 8], [lean * 0.15, H * 0.2, 0.05, 0.2 * H / 8], [lean * 0.4, H * 0.5, 0, 0.14 * H / 8], [lean * 0.8, H * 0.78, 0, 0.1 * H / 8], [lean, H * 0.92, 0.1, 0.05]], 8));
    for (let k = 0; k < 5; k++) {                                                  // peeling sheets hanging from the trunk
      const y = H * (0.1 + r() * 0.5), th = r() * 6.28, rr = 0.2 * H / 8 * (1 - y / H * 0.6);
      a('bark_dark', rod([Math.cos(th) * rr, y, Math.sin(th) * rr], [Math.cos(th) * (rr + 0.1), y - 0.5 - r() * 0.7, Math.sin(th) * (rr + 0.1)], 0.045, 4));
    }
    for (let k = 0; k < 5; k++) {                                                  // limbs and their weeping crowns
      const th = k / 5 * 6.28 + r(), y = H * (0.62 + r() * 0.3), L = H * (0.28 + r() * 0.2), cx = lean * y / H * 0.9 + Math.cos(th) * L, cz = Math.sin(th) * L;
      a('bark', tube([[lean * y / H * 0.9, y, 0, 0.09], [cx * 0.6, y + L * 0.35, cz * 0.6, 0.06], [cx, y + L * 0.3, cz, 0.035]], 5));
      for (let q = 0; q < 6; q++) { const t = q / 6 * 6.28, d = L * 0.28; a('leaf', rod([cx, y + L * 0.3, cz], [cx + Math.cos(t) * d, y + L * 0.3 - H * 0.28, cz + Math.sin(t) * d], 0.2, 3)); }
      a('leaf', at(slathe([[0.001, 0], [L * 0.38, 0.1], [L * 0.32, L * 0.32], [L * 0.1, L * 0.42], [0.001, L * 0.44]], 8), cx, y + L * 0.05, cz));
    }
  });
  put('bark_birch', A.bark.clone()); if (A.bark_dark) put('bark_dark', A.bark_dark.clone()); put('palm_leaf', A.leaf.clone());
}
/** A pandanus: a slender trunk with the spiral of old leaf bases, crowns of long strap leaves spiralling at the tips, an orange fruit. */
export function pandanus(el, { bag }) {
  const put = placer(el, bag), v = (el.seed ?? 1) % 3, H = el.h ?? 5;
  const A = assembly(`ka_pandanus|${v}|${H}`, (a) => {
    const r = rng(500 + v * 9), n = 1 + (v === 2 ? 2 : v);
    for (let c = 0; c < n; c++) {
      const th = c * 2.4, off = c ? 0.5 : 0, h = H * (c ? 0.55 + r() * 0.3 : 1), bx = Math.cos(th) * off, bz = Math.sin(th) * off, tilt = (r() - 0.5) * 0.8;
      a('trunk', tube([[bx, 0, bz, 0.14], [bx + tilt * 0.3, h * 0.5, bz, 0.1], [bx + tilt, h, bz, 0.07]], 7));
      for (let k = 0; k < 7; k++) { const y = 0.3 + k * h / 8; a('trunk', at(slathe([[0.001, 0], [0.12 - k * 0.006, 0.02], [0.12 - k * 0.006, 0.06], [0.001, 0.08]], 7), bx + tilt * y / h, y, bz)); }
      const tx = bx + tilt, tz = bz;
      for (let k = 0; k < 20; k++) {
        const t = k / 20 * 6.28 * 2.2, d = 1.1 + r() * 0.7, up = 0.5 - k / 20 * 0.5 + r() * 0.2;
        a('leaf', tube([[tx, h + 0.05, tz, 0.05, 0.012], [tx + Math.cos(t) * d * 0.55, h + 0.05 + up * d * 0.6, tz + Math.sin(t) * d * 0.55, 0.045, 0.01], [tx + Math.cos(t) * d, h - 0.1 - (0.3 - up) * d * 0.35, tz + Math.sin(t) * d, 0.02, 0.006]], 4, { capA: false }));
      }
      if (c === 0) a('fruit', at(slathe([[0.001, 0], [0.16, 0.05], [0.2, 0.2], [0.1, 0.34], [0.001, 0.36]], 7), tx + 0.1, h - 0.35, tz + 0.1));
    }
  });
  put('wood_dark', A.trunk.clone()); put('palm_leaf', A.leaf.clone()); put('clay_robe', A.fruit.clone());
}
/** A termite mound: a low cone of grey-brown earth with a rough top, 0.6–1.8 m. */
export function termite(el, { bag }) {
  const put = placer(el, bag), h = el.h ?? 1.2;
  put('earth_wall', assembly(`ka_termite|${h}`, (a) => a('m', slathe([[0.001, 0], [h * 0.45, 0], [h * 0.4, h * 0.18], [h * 0.3, h * 0.5], [h * 0.18, h * 0.78], [h * 0.07, h * 0.95], [0.001, h]], 9, (th) => 1 + 0.18 * Math.sin(th * 5 + h)))).m.clone());
}
/** Water lilies: floating pads with a few white flowers; at: centre, n pads scattered within r. */
export function lilies(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? -0.38, r = rng(el.seed ?? 5), put = (m, g) => bag.add(m, g);
  for (let k = 0; k < (el.n ?? 14); k++) {
    const a = r() * 6.28, d = Math.sqrt(r()) * (el.r ?? 4), px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d, pr = 0.16 + r() * 0.16;
    put('lotus_leaf', lathe([[pr, 0], [pr * 0.9, 0.008], [0.001, 0.004]], 8, null, px, y + 0.01, pz));
    if (r() < 0.3) put('cloth_white', lathe([[0.001, 0], [0.05, 0.02], [0.07, 0.07], [0.04, 0.09], [0.001, 0.08]], 6, null, px + 0.05, y + 0.014, pz));
  }
}
/** The bark hut: a pole frame, three slanting sheets of stringybark and a ridge pole, an earth floor with a mat, a fire at the mouth. o: yaw, s. */
export function hut(el, { bag }) {
  const put = placer(el, bag), W = 1.5, D = 1.5, H = 1.7;
  const B = assembly('ka_hut2', (a) => {
    for (const s of [-1, 1]) {
      for (const z of [-D, D]) a('pole', rod([s * W, 0, z], [s * 0.1, H, z * 0.7], 0.045, 5));
      for (let k = 0; k < 3; k++) {                                                     // sheets of bark leaned on the frame
        const z0 = -D + k * (2 * D / 3) + 0.03, z1 = z0 + 2 * D / 3 - 0.06;
        a('sheet', quadSheet([s * (W + 0.05), 0, z0], [s * (W + 0.05), 0, z1], [s * 0.1, H + 0.04, z1 * 0.7], [s * 0.1, H + 0.04, z0 * 0.7]));
      }
    }
    a('pole', rod([0, H, -D * 0.7], [0, H, D * 0.7], 0.06, 5));
    a('mat', box(-W * 0.8, 0.01, -D * 0.8, W * 0.8, 0.03, D * 0.8));
  });
  put('wood_dark', B.pole.clone()); put('roof_bark', B.sheet.clone()); put('reed_mat', B.mat.clone());
}
/** A bark sheet as two triangles each side (thin: a box leaning would do; this is a flat quad slab 3 cm). */
function quadSheet(p0, p1, p2, p3) {
  const o = (p, d) => [p[0], p[1] + d, p[2]], t = [];
  const side = (A, B, C, D, flip) => { const T = flip ? [A, C, B, A, D, C] : [A, B, C, A, C, D]; for (const p of T) t.push(...p); };
  side(p0, p1, p2, p3, false); side(o(p0, -0.03), o(p1, -0.03), o(p2, -0.03), o(p3, -0.03), true);
  return fromTriangles(t);
}
/** The lean-to: a ridge pole on two forks with sheets of bark leaned against it on one side; a fire before it. */
export function leanto(el, { bag }) {
  const put = placer(el, bag), L = 3, H = 1.5;
  const A = assembly('ka_leanto', (a) => {
    for (const z of [-L / 2, L / 2]) a('pole', rod([0, 0, z], [0, H, z], 0.05, 5));
    a('pole', rod([0, H, -L / 2 - 0.2], [0, H, L / 2 + 0.2], 0.05, 5));
    for (let k = 0; k < 4; k++) { const z0 = -L / 2 + k * L / 4 + 0.02, z1 = z0 + L / 4 - 0.04; a('sheet', quadSheet([-1.7, 0.05, z0], [-1.7, 0.05, z1], [0, H, z1], [0, H, z0])); }
    a('pole', rod([-1.2, 0.05, -L / 2], [0, H * 0.75, -L / 2], 0.03, 4)); a('pole', rod([-1.2, 0.05, L / 2], [0, H * 0.75, L / 2], 0.03, 4));
    a('mat', box(-1.3, 0.01, -1.2, -0.2, 0.03, 1.2));
  });
  put('wood_dark', A.pole.clone()); put('roof_bark', A.sheet.clone()); put('reed_mat', A.mat.clone());
}
/** A fire: a ring of stones, ash, crossed logs and a low flame; with `turtle` a long-necked turtle roasting in the coals; `trough`: a folded bark trough; `grind`: a grindstone and handstone. */
export function fire(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, r = rng(el.seed ?? 3), put = (m, g) => bag.add(m, g);
  put('rock_boulder', lathe([[0.001, 0], [0.5, 0], [0.5, 0.01], [0.001, 0.01]], 10, null, x, y, z));
  for (let k = 0; k < 8; k++) { const t = k / 8 * 6.28; put('rock_boulder', lathe([[0.001, 0], [0.1, 0.02], [0.08, 0.1], [0.001, 0.12]], 6, null, x + Math.cos(t) * 0.42, y, z + Math.sin(t) * 0.42)); }
  put('pottery_dark', lathe([[0.36, 0.01], [0.3, 0.015], [0.001, 0.02]], 10, null, x, y, z));
  for (let k = 0; k < 3; k++) { const t = k * 1.05 + r(); put('bark_dark', rod([x + Math.cos(t) * 0.32, y + 0.05, z + Math.sin(t) * 0.32], [x - Math.cos(t) * 0.1, y + 0.1, z - Math.sin(t) * 0.1], 0.04, 5)); }
  put('flame', lathe([[0.1, 0], [0.07, 0.08], [0.03, 0.2], [0.001, 0.3]], 7, (th) => 1 + 0.25 * Math.sin(th * 3), x, y + 0.08, z));
  if (el.turtle) put('hide_brown', lathe([[0.001, 0], [0.2, 0.0], [0.18, 0.07], [0.08, 0.11], [0.001, 0.11]], 9, (th) => 1 + 0.3 * Math.cos(th * 2), x + 0.55, y + 0.02, z + 0.2));
  if (el.trough) put('roof_bark', lathe([[0.001, 0], [0.12, 0.0], [0.2, 0.08], [0.18, 0.09], [0.1, 0.02], [0.001, 0.02]], 8, (th) => 1 + 0.9 * Math.abs(Math.cos(th)), x - 0.9, y, z + 0.8));
  if (el.grind) { put('sandstone_yellow', box(x + 0.7, y, z - 1.2, x + 1.3, y + 0.07, z - 0.7)); put('sandstone_white', box(x + 0.9, y + 0.07, z - 1.05, x + 1.1, y + 0.12, z - 0.9)); }
  if (el.fish) { put('roof_bark', box(x - 0.2, y, z + 0.9, x + 0.5, y + 0.03, z + 1.3)); for (let k = 0; k < 3; k++) put('hide_grey', lathe([[0.001, 0], [0.05, 0.05], [0.04, 0.15], [0.001, 0.3]], 6, null, x + k * 0.15, y + 0.03, z + 1.1)); }
}
/** The drying rack: two forked poles and a cross pole at 1.5 m, geese (black and white) and a goanna hanging from it. */
export function rack(el, { bag }) {
  const put = placer(el, bag), L = el.len ?? 2.2;
  const A = assembly(`ka_rack|${L}`, (a) => {
    for (const s of [-1, 1]) a('pole', rod([s * L / 2, 0, 0], [s * L / 2, 1.7, 0], 0.045, 5));
    a('pole', rod([-L / 2 - 0.1, 1.55, 0], [L / 2 + 0.1, 1.55, 0], 0.035, 5));
    for (let k = 0; k < 3; k++) { const x = -L / 2 + 0.45 + k * 0.55; a('goose', at(slathe([[0.001, 0], [0.09, 0.08], [0.11, 0.25], [0.07, 0.42], [0.03, 0.5], [0.001, 0.5]], 7), x, 0.95, 0)); a('legs', rod([x, 1.45, 0], [x, 1.55, 0], 0.01, 3)); }
    a('lizard', rod([L / 2 - 0.35, 1.5, 0], [L / 2 - 0.35, 0.8, 0], 0.045, 5));
  });
  put('wood_dark', A.pole.clone()); put('cloth_white', A.goose.clone()); put('hide_black', A.legs.clone()); put('hide_grey', A.lizard.clone());
}

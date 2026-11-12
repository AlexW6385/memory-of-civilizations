// The woodland, the small things of the camps and the shelters, the bark canoe (docs/settlements/kakadu.md §4, §5, §8): stringybark
// gums, cycads, grass and spinifex tufts, fallen logs and scree; spears, dilly bags, bark sheets, firewood, shell middens, grass beds,
// fish traps, pandanus mats, the painter's stones and pole ladder, yams; the sewn bark canoe. Sizes [inferred]; every piece is an
// instance of a cached shape (assembly) so that hundreds cost a few draws.
import { box, lathe, rod } from '../../core/geom.js';
import { placer, assembly, tube, slathe, rng } from '../../objects/kit.js';

const at = (g, x, y, z) => { g.translate(x, y, z); return g; };

/** A stringybark gum: a dark fibrous base, a pale upper trunk, a few limbs, ragged oblate crowns of grey-green leaf. */
export function gum(el, { bag }) {
  const put = placer(el, bag), v = (el.seed ?? 1) % 3, H = el.h ?? 10;
  const A = assembly(`ka_gum|${v}|${H}`, (a) => {
    const r = rng(700 + v * 13 + Math.round(H * 3)), lean = (r() - 0.5) * 0.9, s = H / 10;
    a('base', tube([[0, 0, 0, 0.34 * s], [lean * 0.04, H * 0.12, 0, 0.24 * s], [lean * 0.1, H * 0.34, 0, 0.18 * s]], 8));
    a('trunk', tube([[lean * 0.1, H * 0.32, 0, 0.18 * s], [lean * 0.3, H * 0.52, 0.1, 0.14 * s], [lean * 0.6, H * 0.7, 0.1, 0.1 * s], [lean * 0.85, H * 0.84, 0, 0.05 * s]], 7));
    const nb = 4 + Math.floor(r() * 3);
    for (let k = 0; k < nb; k++) {
      const th = k / nb * 6.28 + r(), y = H * (0.5 + r() * 0.28), L = H * (0.2 + r() * 0.2), x0 = lean * 0.75 * y / H;
      const cx = x0 + Math.cos(th) * L, cz = Math.sin(th) * L, cy = y + L * (0.45 + r() * 0.3), q = H * (0.1 + r() * 0.06);
      a('trunk', tube([[x0, y, 0, 0.08 * s], [(x0 + cx) / 2, y + L * 0.2, cz / 2, 0.055 * s], [cx, cy, cz, 0.025 * s]], 5));
      a('leaf', at(slathe([[0.001, -q * 0.4], [q * 0.8, -q * 0.25], [q * 1.15, 0.05 * q], [q * 0.8, q * 0.4], [0.001, q * 0.55]], 9, (t) => 0.85 + 0.3 * Math.sin(t * 3 + k * 2 + v)), cx, cy, cz));
    }
  });
  put('bark_dark', A.base.clone()); put('bark_grey', A.trunk.clone()); put('flax_leaf', A.leaf.clone());
}
/** A cycad (Cycas): a short stub of a trunk with rings of old frond bases, a crown of arching pinnate fronds. */
export function cycad(el, { bag }) {
  const put = placer(el, bag), v = (el.seed ?? 1) % 3, h = el.h ?? 1;
  const A = assembly(`ka_cycad|${v}|${h}`, (a) => {
    const r = rng(800 + v * 7), n = 15 + v * 3;
    a('trunk', tube([[0, 0, 0, 0.12], [0, h * 0.5, 0, 0.1], [0, h, 0, 0.09]], 7));
    for (let k = 0; k < 5; k++) a('trunk', at(slathe([[0.001, 0], [0.13, 0.02], [0.13, 0.05], [0.001, 0.07]], 7), 0, h * (0.1 + k * 0.18), 0));
    for (let k = 0; k < n; k++) {
      const t = k / n * 6.28 * 1.6 + r(), d = 0.9 + r() * 0.7, up = 0.35 + (k % 3) * 0.2 + r() * 0.15;
      a('leaf', tube([[0, h, 0, 0.02, 0.008], [Math.cos(t) * d * 0.5, h + up, Math.sin(t) * d * 0.5, 0.09, 0.01], [Math.cos(t) * d, h + up * 0.3, Math.sin(t) * d, 0.07, 0.008], [Math.cos(t) * d * 1.2, h - 0.15, Math.sin(t) * d * 1.2, 0.01, 0.005]], 4));
    }
  });
  put('bark_dark', A.trunk.clone()); put('palm_leaf', A.leaf.clone());
}
/** One tuft of spinifex or dry grass: a dome of thin arching blades. */
function tuftShape(v) {
  return assembly(`ka_tuft|${v}`, (a) => {
    const r = rng(900 + v * 5), n = 15 + v * 3;
    for (let k = 0; k < n; k++) {
      const t = r() * 6.28, d = 0.18 + r() * 0.3, h = 0.28 + r() * 0.3, b = r() * 0.05;
      a('b', rod([Math.cos(t) * b, 0, Math.sin(t) * b], [Math.cos(t) * d, h, Math.sin(t) * d], 0.007, 3));
    }
  });
}
export function tufts(el, { bag }) {
  for (const [x, z, y, s, rot, m] of el.list) {
    const put = placer({ t: 'ka_tuft', at: [x, z], y, rot, s }, bag);
    put(m ?? 'ichu', tuftShape(Math.floor(rot * 7) % 3).b.clone());
  }
}
/** Fallen logs, grey and split, lying along `rot`. list: [x, z, y, length, rot]. */
export function logs(el, { bag }) {
  for (const [x, z, y, L, rot] of el.list) {
    const put = placer({ t: 'ka_log', at: [x, z], y, rot }, bag), r = 0.13 + (L % 1) * 0.1;
    const A = assembly(`ka_log|${L.toFixed(1)}`, (a) => {
      a('log', rod([-L / 2, r * 0.9, 0], [L / 2, r, 0], r, 7));
      a('log', rod([-L * 0.1, r, 0], [L * 0.05, r * 2.6, r * 0.8], r * 0.35, 4));
    });
    put('bark_grey', A.log.clone());
  }
}
/** Rock fragments at the foot of the faces and chips on the shelters' floors. list: [x, z, y, s, rot, tone]. */
export function scree(el, { bag }) {
  const shapes = [0, 1, 2].map((v) => assembly(`ka_chip|${v}`, (a) => { const r = rng(1100 + v); a('c', slathe([[0.001, 0], [0.5, 0.01], [0.42 + r() * 0.1, 0.22], [0.2, 0.4], [0.001, 0.44]], 6, (t) => 0.75 + 0.5 * Math.abs(Math.sin(t * 1.5 + v * 2)))); }).c);
  for (const [x, z, y, s, rot, tone] of el.list) {
    const put = placer({ t: 'ka_chip', at: [x, z], y: y - 0.04 * s, rot, s }, bag);
    put(tone === 2 ? 'rock_boulder' : tone === 1 ? 'tuff_red' : 'sandstone_rose', shapes[Math.floor(rot * 5) % 3].clone());
  }
}

/** A sewn bark canoe, 3.4 m: one sheet of stringybark folded and sewn at the upturned ends, ribbed with spreaders, a clay pad for a fire. */
function canoeShape() {
  return assembly('ka_canoe', (a) => {
    const L = 3.4, W = 0.55, D = 0.3, N = 12;
    const lift = (g) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const t = Math.abs(p.getZ(i)) / (L / 2); p.setY(i, p.getY(i) + 0.22 * t * t); } return g; };
    const outer = slathe([[0.001, 0], [W * 0.6, D * 0.1], [W * 0.95, D * 0.55], [W, D]], 14).scale(1, 1, L / 2 / W);
    const inner = slathe([[W - 0.02, D], [W * 0.93, D * 0.55], [W * 0.58, D * 0.12], [0.001, 0.02]], 14).scale(1, 1, L / 2 / W);
    a('bark', lift(outer)); a('inner', lift(inner));
    for (let k = -2; k <= 2; k++) { const z = k * 0.6, t = Math.abs(z) / (L / 2), y = D + 0.22 * t * t - 0.03; a('wood', rod([-W * 0.93, y, z], [W * 0.93, y, z], 0.018, 5)); }
    for (const s of [-1, 1]) { a('tie', rod([-0.04, D + 0.22 + 0.02, s * (L / 2 - 0.02)], [0.04, D + 0.22 + 0.02, s * (L / 2 - 0.02)], 0.035, 5)); }
    a('clay', at(slathe([[0.001, 0], [0.22, 0], [0.2, 0.05], [0.001, 0.06]], 8), 0, 0.09, 0.2));
    a('wood', rod([-0.5, 0.09, -0.3], [0.5, 0.09, -0.3], 0.03, 5));
  });
}
export function canoe(el, { bag }) {
  const put = placer(el, bag), A = canoeShape();
  put('roof_bark', A.bark.clone()); put('bark_dark', A.inner.clone()); put('wood_dark', A.wood.clone()); put('rope_fibre', A.tie.clone()); put('earth_wall', A.clay.clone());
  if (el.pole) { const g = rod([0.45, 0.05, 0.9], [0.1, 2.9, 1.0], 0.02, 5); put('wood_dark', g); }
}

/** The small things (el.kind): spears, bags, bark, wood, midden, bed, trap, mat, paint, ladder, yams, hearth_stones. */
export function item(el, { bag }) {
  const put = placer(el, bag), kind = el.kind, v = (el.seed ?? 1) % 3;
  const A = assembly(`ka_item|${kind}|${v}`, (a) => {
    const r = rng(1300 + v * 11 + kind.length * 3);
    switch (kind) {
      case 'spears': {
        for (const s of [-1, 1]) a('pole', rod([s * 0.25, 0, 0], [s * 0.02, 1.35, 0], 0.025, 4));
        a('pole', rod([-0.3, 1.2, 0], [0.3, 1.2, 0], 0.02, 4));
        for (let k = 0; k < 4; k++) { const t = k / 4 * 6.28, tx = Math.cos(t) * 0.1, tz = Math.sin(t) * 0.12; a('spear', rod([tx * 3.2, 0, tz * 3.2], [tx, 2.25 + r() * 0.3, tz], 0.012, 4)); a('tip', rod([tx, 2.2, tz], [tx * 0.98, 2.5 + r() * 0.2, tz], 0.006, 3)); }
        a('thrower', box(0.35, 0.02, -0.04, 1.25, 0.05, 0.02));
        break;
      }
      case 'bags': {
        for (const s of [-1, 1]) a('pole', rod([s * 0.9, 0, 0], [s * 0.85, 1.55, 0.05], 0.03, 5));
        a('pole', rod([-1.0, 1.5, 0], [1.0, 1.52, 0.05], 0.025, 5));
        for (let k = 0; k < 3; k++) { const x = -0.55 + k * 0.5 + r() * 0.1; a('cord', rod([x, 1.5, 0.04], [x, 1.22, 0.04], 0.006, 3)); a(k % 2 ? 'bag2' : 'bag', at(slathe([[0.001, -0.3], [0.1, -0.26], [0.15, -0.12], [0.12, 0.02], [0.001, 0.06]], 8, (t) => 1 + 0.1 * Math.sin(t * 4 + k)), x, 1.22, 0.04)); }
        break;
      }
      case 'bark': {
        for (let k = 0; k < 5; k++) { const g = box(-0.5, 0, -0.012, 0.5, 0.95 + r() * 0.25, 0.012); g.rotateX(-0.28 - k * 0.012); g.translate((r() - 0.5) * 0.3, 0, -0.45 + k * 0.06); a('sheet', g); }
        a('pole', rod([-0.6, 0, -0.5], [-0.6, 1.0, -0.5], 0.03, 4)); a('pole', rod([0.6, 0, -0.5], [0.6, 1.0, -0.5], 0.03, 4));
        break;
      }
      case 'wood': {
        for (let k = 0; k < 9; k++) { const row = k % 3, col = Math.floor(k / 3), y = 0.05 + row * 0.08, z = (col - 1) * 0.14 + (r() - 0.5) * 0.03; a('log', rod([-0.5 - r() * 0.1, y + col * 0.01, z], [0.5 + r() * 0.15, y, z + (r() - 0.5) * 0.04], 0.04 + r() * 0.015, 5)); }
        break;
      }
      case 'midden': {
        a('shell', slathe([[0.001, 0], [0.9, 0], [0.8, 0.12], [0.5, 0.24], [0.2, 0.3], [0.001, 0.31]], 9, (t) => 0.8 + 0.35 * Math.abs(Math.sin(t * 2 + v))));
        for (let k = 0; k < 5; k++) { const t = r() * 6.28, d = 0.2 + r() * 0.5; a('bone', rod([Math.cos(t) * d, 0.28, Math.sin(t) * d], [Math.cos(t) * d + 0.2, 0.31, Math.sin(t) * d + 0.05], 0.014, 3)); }
        break;
      }
      case 'bed': {
        a('grass', at(slathe([[0.001, 0], [0.9, 0.01], [0.85, 0.09], [0.001, 0.12]], 10).scale(1, 1, 0.45), 0, 0, 0));
        a('sheet', box(0.9, 0, -0.35, 1.7, 0.02, 0.35));
        break;
      }
      case 'trap': {
        a('wick', slathe([[0.38, 0], [0.34, 0.2], [0.24, 0.5], [0.12, 0.8], [0.04, 0.95]], 9, (t, i) => 1 + (i % 2 ? 0.06 : 0)));
        a('wick', rod([0.3, 0.2, 0], [0.55, 0.12, 0.2], 0.02, 4));
        break;
      }
      case 'mat': {
        a('mat', box(-0.6, 0, -0.45, 0.6, 0.02, 0.45));
        for (let k = 0; k < 5; k++) a('strip', rod([0.7, 0.05 + k * 0.012, -0.15 + k * 0.05], [1.5, 0.06 + k * 0.012, -0.1 + k * 0.05], 0.02, 4));
        break;
      }
      case 'paint': {
        a('stone', at(slathe([[0.001, 0], [0.34, 0], [0.3, 0.07], [0.001, 0.08]], 8).scale(1.2, 1, 0.9), 0, 0, 0));
        a('red', at(slathe([[0.001, 0], [0.1, 0.01], [0.07, 0.04], [0.001, 0.05]], 6), -0.12, 0.075, 0.02));
        a('yel', at(slathe([[0.001, 0], [0.09, 0.01], [0.06, 0.04], [0.001, 0.05]], 6), 0.08, 0.075, -0.06));
        a('wht', at(slathe([[0.001, 0], [0.08, 0.01], [0.06, 0.04], [0.001, 0.045]], 6), 0.12, 0.075, 0.12));
        a('shell', at(slathe([[0.06, 0.03], [0.05, 0.01], [0.001, 0], [0.001, 0.0]], 6), 0.55, 0, 0.05)); a('shell', at(slathe([[0.001, 0], [0.07, 0.01], [0.075, 0.045], [0.06, 0.05]], 7), 0.55, 0, 0.05));
        for (let k = 0; k < 3; k++) a('brush', rod([0.45 + k * 0.05, 0.015, -0.3], [0.5 + k * 0.05, 0.018, -0.05], 0.007 + k * 0.002, 4));
        break;
      }
      case 'ladder': {
        // two poles leaned on a wall that lies at +z… the item's -z side is the wall; the poles rise toward it
        for (const s of [-1, 1]) a('pole', rod([s * 0.3, 0, 0.9], [s * 0.3, 3.3, 0.03], 0.035, 5));
        for (let k = 1; k < 8; k++) { const y = k * 0.4, z = 0.9 - 0.87 * y / 3.3; a('rung', rod([-0.3, y, z], [0.3, y, z], 0.022, 4)); a('lash', at(slathe([[0.001, 0], [0.05, 0.001], [0.05, 0.05], [0.001, 0.05]], 5), -0.3, y - 0.025, z)); a('lash', at(slathe([[0.001, 0], [0.05, 0.001], [0.05, 0.05], [0.001, 0.05]], 5), 0.3, y - 0.025, z)); }
        break;
      }
      case 'yams': {
        a('sheet', box(-0.45, 0, -0.3, 0.45, 0.015, 0.3));
        for (let k = 0; k < 7; k++) { const t = r() * 0.4 - 0.2, g = slathe([[0.001, 0], [0.04, 0.05], [0.045, 0.3], [0.025, 0.5], [0.001, 0.56]], 6); g.rotateZ(Math.PI / 2 + t); g.translate(-0.2 + r() * 0.1, 0.05 + (k % 3) * 0.05, -0.2 + k * 0.07); a('yam', g); }
        a('stick', rod([0.5, 0.0, -0.2], [0.9, 0.4, 0.5], 0.015, 4));
        break;
      }
      default: a('shell', slathe([[0.001, 0], [0.2, 0], [0.001, 0.1]], 6));
    }
  });
  const m = { pole: 'wood_dark', spear: 'wood_dark', tip: 'wood_dark', thrower: 'wood_dark', cord: 'rope_fibre', bag: 'rope_fibre', bag2: 'hide_tan', sheet: 'roof_bark', log: 'wood_dark', shell: kind === 'midden' ? 'chalk' : 'sandstone_white', bone: 'chalk', grass: 'ichu', wick: 'wicker', mat: 'reed_mat', strip: 'palm_leaf', stone: 'sandstone_yellow', red: 'paint_minoan_red', yel: 'paint_ochre', wht: 'paint_white', brush: 'wood_dark', rung: 'wood_dark', lash: 'rope_fibre', yam: 'hide_brown', stick: 'wood_dark' };
  for (const [role, g] of Object.entries(A)) put(m[role] ?? 'wood_dark', g.clone());
}

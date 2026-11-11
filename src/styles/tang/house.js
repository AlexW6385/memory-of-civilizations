// The houses and shops of Tang Chang'an: courtyard houses in their rammed-earth walls (gate, main hall, wings), huts of earth
// and thatch, and the rows of open-fronted shops of the market (party walls, a counter and the goods of each trade, the
// wine flag on its pole). Lot-based, like the other towns: a lot { rect, front, kind, seed, det } becomes one house.

import { box, lathe } from '../../core/geom.js';
import { inFrame, YAW, rng, wallRun, tangRoof } from './kit.js';
import { buildHall } from './hall.js';
import { furnishHouse } from './interior.js';

const ext = (rect, front) => { const w = rect[2] - rect[0], d = rect[3] - rect[1], al = front === 'n' || front === 's'; return al ? [w, d] : [d, w]; };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

/** The gate of a courtyard house in the front wall (local +z side) at x = gx: two posts, a lintel and a small gabled roof. */
function plainGate(L, gx, z, rich) {
  const { bag, col } = L;
  for (const s of [-1, 1]) { bag.add('timber_red', box(gx + s * 1.25 - 0.2, 0, z - 0.3, gx + s * 1.25 + 0.2, 3.0, z + 0.3)); }
  bag.add('timber_red', box(gx - 1.45, 2.65, z - 0.3, gx + 1.45, 3.0, z + 0.3));
  tangRoof(L.bag, { cx: gx, cz: z, A: 2.5, B: 1.6, y: 3.05, rise: 0.75, gable: !rich, thick: 0.18, chi: 0.5 });
  bag.add('wood_dark', box(gx - 1.2, 0, z + 0.22, gx - 0.15, 2.65, z + 0.3));      // one door leaf open against the post
  void col;
}

/** tang_house { rect, front, kind: 'mansion' | 'house' | 'hut', seed, det }. */
export function tangHouse(el, ctx) {
  const rect = el.rect, f = el.front || 's', [W, D] = ext(rect, f), det = el.det ?? 1, kind = el.kind || 'house', rand = rng(el.seed || 1);
  const c = mid(rect), gx = (rand() < 0.5 ? -1 : 1) * W * 0.2;
  inFrame(ctx, c, YAW[f], (L) => {
    const { bag, col } = L, wh = kind === 'hut' ? 1.1 : 2.7, th = 0.55;
    const op = [{ at: W / 2 + gx, w: kind === 'hut' ? 1.6 : 2.5, h: 4, y0: 0 }];
    // the wall of rammed earth round the lot, capped with tile; the gate in the front wall
    const ring = [[[-W / 2, -D / 2], [W / 2, -D / 2]], [[-W / 2, -D / 2], [-W / 2, D / 2]], [[W / 2, -D / 2], [W / 2, D / 2]]];
    for (const [a, b] of ring) wallRun(L, 'earth_wall', a, b, th, 0, wh);
    wallRun(L, 'earth_wall', [-W / 2, D / 2], [W / 2, D / 2], th, 0, wh, kind === 'hut' ? [{ at: W / 2 + gx, w: 1.6, h: wh, y0: 0 }] : [{ at: W / 2 + gx, w: 2.5, h: 4.2, y0: 0 }]);
    if (kind !== 'hut') {
      for (const [a, b, o] of [[ring[0][0], ring[0][1], []], [ring[1][0], ring[1][1], []], [ring[2][0], ring[2][1], []], [[-W / 2, D / 2], [W / 2, D / 2], []]]) void o, a, b;
      const cap = (a, b, o) => { const Lw = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / Lw, uz = (b[1] - a[1]) / Lw; let s = 0; for (const q of [...o, { s0: Lw, s1: Lw }]) { if (q.s0 - s > 0.1) bag.add('tile_grey', Math.abs(ux) > 0.5 ? box(Math.min(a[0] + ux * s, a[0] + ux * q.s0) - 0.0, wh, a[1] - 0.45, Math.max(a[0] + ux * s, a[0] + ux * q.s0), wh + 0.28, a[1] + 0.45) : box(a[0] - 0.45, wh, Math.min(a[1] + uz * s, a[1] + uz * q.s0), a[0] + 0.45, wh + 0.28, Math.max(a[1] + uz * s, a[1] + uz * q.s0))); s = q.s1; } };
      cap(ring[0][0], ring[0][1], []); cap(ring[1][0], ring[1][1], []); cap(ring[2][0], ring[2][1], []);
      cap([-W / 2, D / 2], [W / 2, D / 2], [{ s0: W / 2 + gx - 1.5, s1: W / 2 + gx + 1.5 }]);
    }
    void op;
    if (kind === 'hut') {
      // a hut of earth: walls of rammed earth, a door and a small window, a low thatched gable roof; a fenced yard before it
      const hw = Math.min(W - 3, 6.4), hd = 4.4, hz = -D / 2 + hd / 2 + 1.5;
      bag.add('mud_plaster', box(-hw / 2, 0, hz - hd / 2, hw / 2, 2.3, hz + hd / 2)); col.rect([-hw / 2, hz - hd / 2, hw / 2, hz + hd / 2], 0, 2.3);
      bag.add('wood_dark', box(-0.5, 0, hz + hd / 2 - 0.04, 0.5, 1.8, hz + hd / 2 + 0.04));
      bag.add('lattice_red', box(1.2, 1.0, hz + hd / 2 - 0.03, 2.0, 1.7, hz + hd / 2 + 0.04));
      tangRoof(bag, { cx: 0, cz: hz, A: hw / 2 + 0.5, B: hd / 2 + 0.6, y: 2.25, rise: 1.35, gable: true, tile: 'thatch', soffit: 'thatch', ridge: 'thatch', chiwei: false, thick: 0.3, gableMat: 'mud_plaster' });
      return;
    }
    // the gate
    if (kind === 'mansion') inFrame(L, [gx, D / 2], 0, (G) => buildHall(G, { w: 7.2, d: 4.4, y: 0, plat: 0.3, H: 3.3, nb: 3, kind: 'open', det: Math.max(1, det), bh: 0.95, over: 1.7, steps: false, roof: 'hip', through: true }));
    if (kind !== 'mansion') plainGate(L, gx, D / 2, false);
    // the main hall at the back, facing the gate; the wings on both sides of the court
    const hw = Math.min(W - 5.5, kind === 'mansion' ? 17.5 : 11.5), hd = kind === 'mansion' ? 7.4 : 5.8, nb = hw > 15 ? 5 : 3, hz = -D / 2 + hd / 2 + 2.0;
    inFrame(L, [0, hz], 0, (H) => {
      const plat = kind === 'mansion' ? 0.55 : 0.4;
      buildHall(H, { w: hw, d: hd, y: 0, plat, H: kind === 'mansion' ? 4.0 : 3.3, nb, kind: 'hall', det, bh: kind === 'mansion' ? 1.2 : 0.9, over: kind === 'mansion' ? 2.2 : 1.8, roof: 'hip', doorW: 2.4, steps: true, big: kind === 'mansion', interior: !!el.furnished });
      if (el.furnished) furnishHouse(H, { w: hw, d: hd, y: plat });
    });
    if (D > 24 && W > 20) for (const s of [-1, 1]) {
      const wl = Math.min(D * 0.36, 11.6), wx = s * (W / 2 - 3.6), wz = hz + hd / 2 + 1.4 + wl / 2 + 1.5;
      if (wz + wl / 2 > D / 2 - 5) continue;
      inFrame(L, [wx, wz], s > 0 ? Math.PI / 2 * -1 : Math.PI / 2, (H) => buildHall(H, { w: wl, d: 4.2, y: 0, plat: 0.3, H: 2.9, nb: 3, kind: 'hall', det: Math.min(det, 1), bh: 0.75, over: 1.4, roof: 'gable', steps: false, doorW: 1.8 }));
    }
    // the path of brick from the gate to the hall steps
    bag.add('brick_grey', box(gx - 0.8, 0, hz + hd / 2 + 1.0, gx + 0.8, 0.025, D / 2 - 0.2));
  });
}

// ── the market's rows of shops ─────────────────────────────────────────────────────────────────────────────────────
const GOODS = {
  cloth: ['cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_green'], silk: ['cloth_red', 'cloth_ochre', 'cloth_blue', 'cloth_white'],
  grain: ['sacking', 'sacking', 'wicker'], medicine: ['wood_dark', 'lacquer_red', 'paint_white'], books: ['paint_white', 'cloth_indigo'],
  pottery: ['terracotta', 'pottery_dark', 'glaze_green', 'glaze_white'], iron: ['iron', 'iron', 'wood_dark'], saddlery: ['hide_brown', 'hide_black', 'iron'],
  lacquer: ['lacquer_red', 'lacquer_black', 'glaze_white'], carpet: ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_maroon'], spice: ['wicker', 'cloth_ochre', 'terracotta', 'cloth_brown'],
  jade: ['glaze_green', 'glaze_white', 'cloth_red'], food: ['wicker', 'glaze_white', 'iron'], wine: ['pottery_dark', 'terracotta'], dye: ['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_green'], paper: ['paint_white', 'lime_plaster'],
};
export const TRADE_LIST = Object.keys(GOODS);

function jar(bag, x, y, z, r, h, mat) {
  bag.add(mat, lathe([[0.001, 0], [r * 0.7, 0], [r, h * 0.35], [r * 0.92, h * 0.7], [r * 0.5, h * 0.92], [r * 0.55, h], [0.001, h]], 10, null, x, y, z));
}
/** The goods on a counter between x0 and x1 at depth z (top y): by trade. */
function goods(bag, trade, x0, x1, z, y, rand) {
  const mats = GOODS[trade] || GOODS.cloth, step = trade === 'wine' ? 0.5 : 0.34;
  for (let x = x0 + 0.25; x < x1 - 0.2; x += step) {
    const m = mats[Math.floor(rand() * mats.length)];
    if (trade === 'wine' || trade === 'pottery' || trade === 'spice') jar(bag, x, y, z, 0.16, 0.3 + rand() * 0.12, m);
    else if (trade === 'cloth' || trade === 'silk' || trade === 'carpet' || trade === 'dye') bag.add(m, box(x - 0.14, y, z - 0.2, x + 0.14, y + 0.2 + rand() * 0.25, z + 0.2));
    else bag.add(m, box(x - 0.13, y, z - 0.14, x + 0.13, y + 0.18 + rand() * 0.14, z + 0.14));
  }
}

/**
 * tang_shop_row { foot, front, units: [{ nb, trade }], seed, det }: a run of shops under one roof — the front open between posts, a counter
 * in the outer bays and the door in the middle one, party walls between the units, the goods, a sign pole at each unit's end.
 */
export function tangShopRow(el, ctx) {
  const f = el.front || 's', [W, D] = ext(el.foot, f), rand = rng(el.seed || 1), units = el.units, nbT = units.reduce((s, u) => s + u.nb, 0);
  const hw = W - 1.6, hd = D - 1.6, bay = hw / nbT;
  inFrame(ctx, mid(el.foot), YAW[f], (L) => {
    const { bag, col } = L;
    buildHall(L, { w: hw, d: hd, y: 0, plat: 0.3, H: 3.5, nb: nbT, kind: 'open', det: el.det ?? 1, bh: 0.8, over: 1.5, steps: false, roof: el.roof || 'gable', counter: false, pal: { plinth: 'brick_grey' } });
    let k = 0;
    units.forEach((u, ui) => {
      const x0 = -hw / 2 + k * bay, x1 = x0 + u.nb * bay;
      if (ui > 0) bag.add('plaster_white', box(x0 - 0.15, 0.3, -hd / 2, x0 + 0.15, 3.1, hd / 2 - 0.2));
      if ((el.det ?? 1) >= 1) {
        for (let b = 0; b < u.nb; b++) {
          if (u.nb >= 3 && b === Math.floor(u.nb / 2)) continue;                       // the door bay
          const a0 = x0 + b * bay + 0.2, a1 = x0 + (b + 1) * bay - 0.2;
          bag.add('wood_dark', box(a0, 0.3, hd / 2 - 0.55, a1, 1.2, hd / 2 - 0.1)); bag.add('timber', box(a0 - 0.05, 1.2, hd / 2 - 0.6, a1 + 0.05, 1.26, hd / 2 - 0.04));
          col.rect([a0, hd / 2 - 0.6, a1, hd / 2], 0.3, 1.26);
          goods(bag, u.trade, a0, a1, hd / 2 - 0.35, 1.26, rand);
        }
        // the shelves along the back wall with the goods, a lamp bracket
        bag.add('wood_dark', box(x0 + 0.4, 0.3, -hd / 2 + 0.2, x1 - 0.4, 2.2, -hd / 2 + 0.55)); goods(bag, u.trade, x0 + 0.4, x1 - 0.4, -hd / 2 + 0.55, 1.2, rand);
        col.rect([x0 + 0.4, -hd / 2 + 0.2, x1 - 0.4, -hd / 2 + 0.55], 0.3, 2.2);
        // the sign pole at the unit's end, before the platform, its flag
        const px = x0 + 0.5, pz = hd / 2 + 1.35;
        bag.add('bamboo_culm', box(px - 0.05, 0, pz - 0.05, px + 0.05, 5.2, pz + 0.05)); col.circle(px, pz, 0.1, 0, 5.2);
        bag.add(u.trade === 'wine' ? 'cloth_ochre' : (['cloth_indigo', 'cloth_red', 'cloth_white'][(ui + (el.seed | 0)) % 3]), box(px + 0.05, 3.6, pz - 0.02, px + 0.6, 5.0, pz + 0.02));
        if (u.trade === 'wine') for (let j = 0; j < 3; j++) jar(bag, x0 + 1.0 + j * 0.8, 0, hd / 2 + 1.0, 0.2, 0.55, 'pottery_dark');
      }
      k += u.nb;
    });
  });
}

export const HOUSE_ELEMENTS = { tang_house: tangHouse, tang_shop_row: tangShopRow };

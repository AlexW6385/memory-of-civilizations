// Dunhuang c. 850 — wear and writing (docs/settlements/dunhuang.md §15.5): the hollow worn in the threshold of every opened door by the feet that cross it, the treads
// of the cliff's stair polished in their middles, and the shop signs: one character on a pale board beside the door of four trades, written in the standard form
// of the characters that Suzhou's script table holds (each of them verified there stroke by stroke; the generic brush engine of that table is used, none of its data
// is Suzhou's). Wraps the style's `dh_house` and `dh_cliff` from here (the style files stay as they were); pure functions of the element's own numbers.
import '../../styles/dunhuang/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { frame } from '../../styles/dunhuang/town.js';
import { doorU } from '../../styles/dunhuang/homes.js';
import { inscription, canWrite } from '../ming-suzhou/script.js';
import { STAIR, FLOOR, GALLERY, CAVES, XF, ZEND, rng } from './layout.js';
import { hashAt } from './nightlight.js';

/** The sign of a trade: the one character of its board [inferred: the wine-shop's banner (酒旗) is the Tang custom named in its poetry; the others are the plainest names of their trades]. */
export const SIGNS = { wine: '酒', drugs: '藥', cloth: '布', scribe: '書', grain: '米', bake: '麵', pottery: '瓷', smith: '金' };

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.dunhuang.elements, house = E.dh_house, cliff = E.dh_cliff;
  E.dh_house = function worn(el, ctx) {
    const r = house.call(this, el, ctx), { bag } = ctx, f = frame(el.rect, el.front), W = f.W, dw = 1.15, du = doorU(W, !!el.trade, rng((el.seed || 1) * 7 + 3)());
    const put = (m, u0, v0, u1, v1, y0, y1) => { const q = f.rc(u0, v0, u1, v1); bag.add(m, box(q[0], y0, q[1], q[2], y1, q[3])); };
    // the threshold (its top at 0.08): a hollow worn in the middle, wider on the side the feet come from, a second small one by the jamb
    put('banco_smooth', du - 0.42, -0.55, du + 0.42, 0.3, 0.08, 0.084);
    put('banco_smooth', du - 0.26, -0.45, du + 0.26, 0.2, 0.084, 0.087);
    void dw;
    const ch = SIGNS[el.trade];
    if (ch && canWrite(ch) && du + 1.05 < W) {
      // a board of pale plaster on the wall right of the door (0.3 × 0.9 m, its foot at 1.25 m), the character in black ink on it; the street-side face reads from outside
      const [cx, cz] = f.P(du + 0.9, -0.01), yaw = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[el.front];
      const b = box(-0.15, -0.45, -0.005, 0.15, 0.45, 0.035); b.rotateY(yaw).translate(cx, 1.7, cz);
      bag.add('lime_plaster', b);
      const g = inscription(ch, { pitch: 0.3, size: 0.25, z0: 0.035, z1: 0.047, thick: 1.5 }); g.rotateY(yaw).translate(cx, 1.7, cz);
      bag.add('lacquer_black', g);
    }
    return r;
  };
  E.dh_cliff = function worn(el, ctx) {
    const r = cliff.call(this, el, ctx), { bag } = ctx, { x0, x1, z0, z1 } = STAIR, n = Math.round((FLOOR[1] - FLOOR[0]) / 0.17), L = (z1 - z0) / n;
    // the treads of the stair up to the second tier, polished pale in their middles by the pilgrims' feet (every tread, a hollow narrower at the foot, wider higher up)
    for (let k = 0; k < n; k += 2) {
      const top = FLOOR[0] + (FLOOR[1] - FLOOR[0]) * (k + 1) / n, cx = (x0 + x1) / 2, hw = 0.3 + 0.25 * (k % 3) / 2;
      bag.add('limestone', box(cx - hw, top, z0 + k * L + 0.03, cx + hw, top + 0.004, z0 + (k + 1) * L - 0.03));
    }
    // the apron: before every cave door a worn way of paler, polished stone from the door out to the apron's middle (wider at the door, where the feet turn in); a worn trail
    // along the apron's walking line in broken lengths; the stair's foot trodden and the gallery's deck polished down its middle and before the doors of its caves [inferred: feet]
    const Y = FLOOR[0] + 0.004, Y1 = FLOOR[1];
    for (const c of CAVES) {
      if (!['hall', 'pillar', 'cell', 'great'].includes(c.kind) || c.tier > 1) continue;
      const y = c.tier ? Y1 + 0.003 : Y, hw = c.kind === 'cell' ? 0.55 : c.kind === 'great' ? 2.4 : 0.9, len = c.tier ? 1.8 : 4.2, q = hashAt(c.z, c.tier, 17);
      bag.add(c.tier ? 'banco_smooth' : 'marble_dark', box(XF + 0.05, y, c.z - hw, XF + 0.05 + len * (0.8 + 0.2 * q), y + 0.004, c.z + hw));
      bag.add(c.tier ? 'banco_smooth' : 'marble_dark', box(XF + 0.05, y + 0.004, c.z - hw * 0.6, XF + 0.05 + len * 0.5, y + 0.008, c.z + hw * 0.6));
    }
    for (let z = -ZEND + 6; z < ZEND - 8; z += 5) {
      const q = hashAt(XF, z, 23); if (q < 0.3) continue;
      const a = z + q * 1.2, b = a + 2.2 + 2.4 * hashAt(XF, z, 24), xc = XF + 5.9 + 0.3 * Math.sin(z * 0.37);
      bag.add('marble_dark', box(xc - 0.34, Y, a, xc + 0.34, Y + 0.004, b));
    }
    bag.add('marble_dark', box(STAIR.x0 + 0.4, FLOOR[0] + 0.001, STAIR.z0 - 1.2, STAIR.x1 - 0.4, FLOOR[0] + 0.005, STAIR.z0));
    for (let z = GALLERY.z0 + 1; z < GALLERY.z1 - 2; z += 3.4) {
      const q = hashAt(GALLERY.x0, z, 29); if (q < 0.2) continue;
      const a = z + q, b = a + 1.6 + 1.6 * hashAt(GALLERY.x0, z, 30), xc = (GALLERY.x0 + GALLERY.x1) / 2 - 0.1;
      bag.add('banco_smooth', box(xc - 0.3, Y1 + 0.003, a, xc + 0.3, Y1 + 0.006, Math.min(b, GALLERY.z1 - 0.2)));
    }
    return r;
  };
}
registerWear();

// Karakorum, 1254 — wear and writing (docs/settlements/mongol-karakorum.md §14.5). Wraps the mongol style's elements from here (the style files stay as they were); every
// piece is a pure function of the element's own numbers.
// Wear: the hollow worn in the floor of a shop at its way in (the one lane every buyer takes, between the end of the counter and the party wall) and the trodden strip of the street
// before it; the smoke-stain on the felt round every ger's crown ring (the fire under it is never out in winter) and the bare trodden ground at its door [inferred: ordinary effects of
// felt, smoke and feet; the dossier's dry climate gives dust, not moss].
// Writing: the Chinese rows of the east (the Cathayan quarter: Chinese craftsmen, §3b) carry on the blade sign of each bay the one character of its trade — 布 cloth, 藥 medicines and
// spices, 瓷 pottery, 金 metal, 米 grain and food, 酒 wine — in gilt relief, from the stroke tables of the Suzhou reference's script (each character checked there stroke by stroke:
// src/settlements/ming-suzhou/brush-data.js, a generic Chinese character set; the forms are the traditional ones, which the 13th century wrote too) [inferred: the shops' trades are
// the dossier's; that the boards read so is ours]. Nothing is written in the Mongol script (vertical, from the Uyghur: its letters are not in any table here and are not guessed),
// nor in Arabic or Syriac at the mosques and the church (not verified): those boards and walls stay plain.
import '../../styles/mongol/index.js';
import './nightlight.js';
import { Matrix4 } from '../../core/three.js';
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { canWrite, inscription } from '../ming-suzhou/script.js';
import { bayLeft, rowTrades } from '../../styles/mongol/shops.js';
import { hashAt } from './nightlight.js';

/** The character of each trade's board (east rows). */
export const SIGNS = { cloth: '布', spice: '藥', pots: '瓷', metal: '金', food: '米', wine: '酒' };

const frameOf = (el) => {
  const w = 3.6, d = el.d ?? 5, n = el.n ?? 4, face = el.face ?? 's';
  const [x0, z0, x1, z1] = face === 's' || face === 'n' ? [el.a[0], el.a[1], el.a[0] + n * w, el.a[1] + d] : [el.a[0], el.a[1], el.a[0] + d, el.a[1] + n * w];
  return face === 's' ? { O: [x0, z1], U: [1, 0], V: [0, 1] } : face === 'n' ? { O: [x0, z0], U: [1, 0], V: [0, -1] } : face === 'e' ? { O: [x1, z0], U: [0, 1], V: [1, 0] } : { O: [x0, z0], U: [0, 1], V: [-1, 0] };
};

function wornRow(el, bag) {
  const F = frameOf(el), n = el.n ?? 4, w = 3.6, seed = el.seed || 9;
  const P = (u, v) => [F.O[0] + F.U[0] * u + F.V[0] * v, F.O[1] + F.U[1] * u + F.V[1] * v];
  const put = (mat, u0, v0, u1, v1, y0, y1) => { const a = P(u0, v0), b = P(u1, v1); bag.add(mat, box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]))); };
  const trades = rowTrades(seed);
  for (let i = 0; i < n; i++) {
    const ul = bayLeft(seed, i) ? i * w + 2.55 : i * w + 1.05, q = 0.8 + 0.4 * hashAt(ul, F.O[0] + F.O[1], 2);
    put('earth_wall', ul - 0.5 * q, -0.9, ul + 0.5 * q, -0.1, 0.03, 0.036);                  // the hollow worn in the floor at the way in
    put('earth_wall', ul - 0.35 * q, -0.1, ul + 0.35 * q, 0.7, 0.0, 0.012);                  // the sill: the street's ground trodden bare
    put('earth_wall', ul - 0.45 * q, 0.7, ul + 0.45 * q, 2.4, 0.0, 0.008);                   // and the trodden strip out to the street
  }
  if (el.east) for (let i = 0; i < n; i++) {
    const ch = SIGNS[trades[i % trades.length]];
    if (!ch || !canWrite(ch)) continue;
    // the blade sign hung at the party wall (shops.js: u = bu, v 0.5–0.9, y 1.7–2.6, 4 cm thick) carries the character on both faces, gilt, reading to a visitor walking the street
    // (the name board over the opening is hidden behind the awning from the street, so the writing is not put there)
    const bu = bayLeft(seed, i) ? (i + 1) * w - 0.2 + 0.05 : i * w + 0.2 - 0.05;
    for (const sd of [-1, 1]) {
      const N = [F.U[0] * sd, F.U[1] * sd], [x, z] = P(bu + sd * 0.026, 0.7), R = [N[1], 0, -N[0]];
      const g = inscription(ch, { pitch: 0.3, size: 0.3, z0: 0.0, z1: 0.014, thick: 1.15 });
      g.applyMatrix4(new Matrix4().makeBasis({ x: R[0], y: R[1], z: R[2] }, { x: 0, y: 1, z: 0 }, { x: N[0], y: 0, z: N[1] }).setPosition(x, 2.13, z));
      bag.add('gilt_bronze', g);
    }
  }
}

function stainedGer(el, bag) {
  const [cx, cz] = el.c, r = el.r ?? 3.2, y = el.y ?? 0, open = !!el.open, cart = !!el.cart, da = el.door ?? Math.PI / 2;
  const wh = open ? 2.05 : (r > 3.6 ? 1.6 : 1.4), rise = r * 0.3 + 0.5, Y = cart ? y + 1.32 : y, top = Y + wh + rise, ringR = 0.62;
  // the felt's own profile, upper segment (ger.js): from (r * 0.35, Y + wh + rise * 0.78) to (ringR + 0.1, top - 0.02); the stain is that segment pushed 1.5 cm out along its normal
  const a = [r * 0.35, Y + wh + rise * 0.78], b = [ringR + 0.1, top - 0.02], dr = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dr, dy), nr = -dy / l * 0.015, ny = dr / l * 0.015;
  const k = 0.55 + 0.35 * hashAt(cx, cz, 6);                                                   // how far down the stain reaches
  const m = [a[0] + dr * (1 - k) * 0.0 + (b[0] - a[0]) * (1 - k), a[1] + (b[1] - a[1]) * (1 - k)];
  bag.add('hide_brown', lathe([[m[0] + nr, m[1] + ny], [b[0] + nr, b[1] + ny]], 20, null, cx, 0, cz));
  if (!cart) bag.add('earth_wall', lathe([[0.001, 0], [1.05, 0]], 14, (th) => 1 + 0.22 * Math.sin(th * 2 + cx), cx + Math.cos(da) * (r + 0.95), y + 0.012, cz + Math.sin(da) * (r + 0.95)));   // the ground trodden bare at the door
}

/** The great plaque over the Great Hall's south door: 大雄寶殿 (the name given the main hall of a Chinese Buddhist temple), gilt on black, read right to left [inferred: that the hall bore it; the
 *  hall is the dossier's Chinese-type Buddhist temple of the Cathayan quarter, DAI]. All four characters are in the checked table. */
function plaque(el, bag) {
  const text = '大雄寶殿';
  if (!canWrite(text)) return;
  const [cx, cz] = el.c, z = cz + 18.2 + 0.2, y = (el.y ?? 1.5) + 0.04 + 5.0;
  bag.add('lacquer_black', box(cx - 1.75, y - 0.5, z, cx + 1.75, y + 0.5, z + 0.07));
  bag.add('gilt_bronze', box(cx - 1.8, y - 0.55, z, cx + 1.8, y - 0.5, z + 0.09)); bag.add('gilt_bronze', box(cx - 1.8, y + 0.5, z, cx + 1.8, y + 0.55, z + 0.09));
  const g = inscription(text, { pitch: 0.82, size: 0.68, z0: 0.0, z1: 0.025, thick: 1.2 });
  g.applyMatrix4(new Matrix4().makeTranslation(cx, y, z + 0.07));
  bag.add('gilt_bronze', g);
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.mongol.elements, row = E.shop_row, ger = E.ger, hall = E.great_hall;
  E.shop_row = function worn(el, ctx) { const r = row.call(this, el, ctx); if (!el.simple) wornRow(el, ctx.bag); return r; };
  E.great_hall = function plaqued(el, ctx) { const r = hall.call(this, el, ctx); if (!el.simple) plaque(el, ctx.bag); return r; };
  E.ger = function stained(el, ctx) { const r = ger.call(this, el, ctx); if (!el.simple) stainedGer(el, ctx.bag); return r; };
}
registerWear();

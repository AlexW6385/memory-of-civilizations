// The town of Dessau around the school (docs/settlements/bauhaus-dessau.md §3–§4): the Masters' Houses in the pines, the rendered
// tenement blocks of 1900 with shops at their feet, the Törten rows, a bicycle. Plan coordinates, metres.
import { frustum } from '../../core/geom.js';
import { S, rng } from './kit.js';

const WALL = ['stucco_pale', 'stucco_cream', 'stucco_warm', 'facade_buff', 'stucco_ochre'];
const SHUT = ['shutter_green', 'shutter_brown', 'shutter_grey'];

/** A pane on a wall face: `face` 'n' | 's' | 'e' | 'w' of rect at (u0..u1, y0..y1), standing 0.02 proud with a frame. */
function winOn(sk, rect, face, u0, u1, y0, y1, frame = 'paint_white', glass = 'glass_outer') {
  const [x0, z0, x1, z1] = rect, alongX = face === 'n' || face === 's', c = face === 'n' ? z0 : face === 's' ? z1 : face === 'w' ? x0 : x1;
  const n = face === 'n' || face === 'w' ? -1 : 1, t = 0.04;
  sk.pane(glass, { alongX, x: c + n * 0.02, z: c + n * 0.02, u0, u1, y0, y1, n });
  const bx = (a, b, ya, yb) => (alongX ? sk.b(frame, a, ya, Math.min(c, c + n * t), b, yb, Math.max(c, c + n * t)) : sk.b(frame, Math.min(c, c + n * t), ya, a, Math.max(c, c + n * t), yb, b));
  bx(u0 - 0.06, u1 + 0.06, y0 - 0.06, y0); bx(u0 - 0.06, u1 + 0.06, y1, y1 + 0.06); bx(u0 - 0.06, u0, y0, y1); bx(u1, u1 + 0.06, y0, y1); bx((u0 + u1) / 2 - 0.025, (u0 + u1) / 2 + 0.025, y0, y1);
}
function hip(sk, rect, y, mat = 'roof_tile', rise = 0.9) {
  const [x0, z0, x1, z1] = rect, w = x1 - x0, d = z1 - z0, m = Math.min(w, d) / 2 - 0.1;
  sk.bag.add(mat, frustum([x0 - 0.35, z0 - 0.35, x1 + 0.35, z1 + 0.35], y, y + (m + 0.35) * rise, m + 0.35, m + 0.35, m + 0.35, m + 0.35, { noBottom: true }));
}

/**
 * dessau_house: { rect, front ('n' | 's' | 'e' | 'w': the street side), storeys, shop, roof ('hip' | 'mansard' | 'flat'), modern, seed } — a rendered
 * tenement of the years about 1900 (a plinth, windows with lintels and shutters, a cornice, a hipped tile roof with dormers and a chimney,
 * a shop front with its sign and awning at the street), or a plain flat-roofed house of the new building.
 */
function dessauHouse(el, ctx) {
  const sk = new S(ctx), r = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, n = el.storeys, SH = el.modern ? 3.0 : 3.3, top = 0.5 + n * SH;
  const mat = el.modern ? 'plaster_white' : WALL[Math.floor(r() * WALL.length)];
  sk.s(mat, x0, 0, z0, x1, top, z1);
  sk.b('brick', x0 - 0.03, 0, z0 - 0.03, x1 + 0.03, 0.6, z1 + 0.03);
  const f = el.front, alongX = f === 'n' || f === 's', L = alongX ? x1 - x0 : z1 - z0, u0 = alongX ? x0 : z0;
  // the street front: windows on every storey, a door and (a shop) the shop front below
  const dw = u0 + L * (0.3 + r() * 0.4), shut = SHUT[Math.floor(r() * 3)];
  const cols = Math.max(2, Math.floor(L / 3.0)), pitch = L / cols;
  for (let s = 0; s < n; s++) {
    const y = 0.5 + s * SH;
    for (let c = 0; c < cols; c++) {
      const cu = u0 + pitch * (c + 0.5);
      if (s === 0 && (Math.abs(cu - dw) < 1.5 || el.shop)) continue;
      const w = el.modern ? 0.75 : 0.5, y0 = y + 0.9, y1 = y + SH - (el.modern ? 0.7 : 0.55);
      winOn(sk, el.rect, f, cu - w, cu + w, y0, y1, el.modern ? 'steel_grey' : 'paint_white');
      if (!el.modern) {
        const [bx0, bz0, bx1, bz1] = alongX ? [cu - w - 0.15, f === 'n' ? z0 - 0.06 : z1, cu + w + 0.15, f === 'n' ? z0 : z1 + 0.06] : [f === 'w' ? x0 - 0.06 : x1, cu - w - 0.15, f === 'w' ? x0 : x1 + 0.06, cu + w + 0.15];
        sk.b('sandstone_white', bx0, y1, bz0, bx1, y1 + 0.18, bz1);      // the lintel
        if (r() < 0.5) { const o = 0.16; if (alongX) { sk.b(shut, bx0 - o, y0, bz0, bx0, y1, bz1); sk.b(shut, bx1, y0, bz0, bx1 + o, y1, bz1); } else { sk.b(shut, bx0, y0, bz0 - o, bx1, y1, bz0); sk.b(shut, bx0, y0, bz1, bx1, y1, bz1 + o); } }
      }
    }
  }
  const face = (u, a, b, ya, yb, m, d = 0.06) => (alongX ? sk.b(m, u - 0.0, ya, f === 'n' ? z0 - d : z1, u + 0.0 + a, yb, f === 'n' ? z0 : z1 + d) : sk.b(m, f === 'w' ? x0 - d : x1, ya, u, f === 'w' ? x0 : x1 + d, yb, u + a));
  // the door (or the shop front: a wide glazed window, a sign band, an awning)
  if (el.shop) {
    const a = u0 + 0.8, w = L - 1.6;
    winOn(sk, el.rect, f, a, a + w * 0.62, 0.7, 2.6, 'wood_dark');
    winOn(sk, el.rect, f, a + w * 0.7, a + w, 0.0, 2.6, 'wood_dark');
    const sign = ['car_black', 'cloth_green', 'car_blue', 'car_cream', 'cloth_maroon'][Math.floor(r() * 5)];
    face(u0 + 0.4, L - 0.8, 0, 2.7, 3.35, sign, 0.12);
    const aw = ['cloth_red', 'cloth_white', 'cloth_green', 'cloth_ochre'][Math.floor(r() * 4)], out = 1.0;
    if (alongX) sk.b(aw, a, 2.55, f === 'n' ? z0 - out : z1, a + w * 0.65, 2.65, f === 'n' ? z0 : z1 + out); else sk.b(aw, f === 'w' ? x0 - out : x1, 2.55, a, f === 'w' ? x0 : x1 + out, 2.65, a + w * 0.65);
  } else face(dw - 0.55, 1.1, 0, 0.5, 2.7, el.modern ? 'car_blue' : 'wood_dark', 0.1);
  // the cornice and the roof
  if (el.modern || el.roof === 'flat') { sk.b('concrete_light', x0 - 0.05, top, z0 - 0.05, x1 + 0.05, top + 0.12, z1 + 0.05); sk.b('plaster_white', x0, top + 0.12, z0, x1, top + 0.55, z0 + 0.2); sk.b('plaster_white', x0, top + 0.12, z1 - 0.2, x1, top + 0.55, z1); }
  else {
    sk.b('sandstone_white', x0 - 0.12, top - 0.2, z0 - 0.12, x1 + 0.12, top + 0.05, z1 + 0.12);
    hip(sk, el.rect, top + 0.05, 'roof_tile', el.roof === 'mansard' ? 0.75 : 0.6);
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, rh = (Math.min(x1 - x0, z1 - z0) / 2 + 0.25) * (el.roof === 'mansard' ? 0.75 : 0.6);
    sk.b('brick', cx - 0.3, top, cz - 0.3, cx + 0.3, top + rh + 0.9, cz + 0.3);
    sk.b('iron', cx - 0.36, top + rh + 0.9, cz - 0.36, cx + 0.36, top + rh + 1.0, cz + 0.36);
  }
}

/** bauhaus_master: a Master's House — a cubic white volume, a glazed studio, a flat roof with a terrace and an entrance canopy. */
function masterHouse(el, ctx) {
  const sk = new S(ctx), r = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, h = el.kind === 'double' ? 6.2 : 6.6, w = x1 - x0, d = z1 - z0;
  // the volumes: two for a double (mirrored), an L for the single; all white, flat-roofed
  const vols = el.kind === 'double' ? [[x0, z0, x0 + w * 0.52, z1, h], [x0 + w * 0.52, z0 + d * 0.15, x1, z1 - d * 0.1, h - 1.2]] : [[x0, z0, x1 - w * 0.25, z1, h], [x1 - w * 0.25, z0 + d * 0.3, x1, z1, h - 3.2]];
  for (const [a, b, c, e, hh] of vols) {
    sk.s('plaster_white', a, 0.0, b, c, hh, e);
    sk.b('concrete_light', a - 0.05, hh, b - 0.05, c + 0.05, hh + 0.12, e + 0.05);
    sk.b('plaster_white', a, hh + 0.12, b, c, hh + 0.5, b + 0.15); sk.b('plaster_white', a, hh + 0.12, e - 0.15, c, hh + 0.5, e);
    // ribbon windows on the south and north faces on two storeys, a tall studio window on the garden side
    for (const [face, zc] of [['s', e], ['n', b]]) for (let s = 0; s < 2; s++) {
      const y = 0.4 + s * 3.0;
      for (let u = a + 1.2; u + 2.2 < c; u += 3.0) winOn(sk, [a, b, c, e], face, u, u + 2.0, y + 0.9, y + 2.2, 'steel_grey');
      void zc;
    }
    winOn(sk, [a, b, c, e], 'w', b + 1.0, e - 1.0, 3.6, 6.0, 'steel_grey');
    winOn(sk, [a, b, c, e], 'e', b + 1.0, e - 1.0, 3.6, 6.0, 'steel_grey');
  }
  const [a, b, c, e] = vols[0];
  sk.b('car_blue', (a + c) / 2 - 0.55, 0, e, (a + c) / 2 + 0.55, 2.4, e + 0.1);                        // the front door
  sk.b('concrete_light', (a + c) / 2 - 1.4, 2.6, e, (a + c) / 2 + 1.4, 2.75, e + 1.5);                // the canopy
  sk.b('brick', x0 - 0.2, 0, z0 - 0.2, x1 + 0.2, 0.3, z0);                                              // garden step
  sk.b('paint_cab_yellow', x1 - 1.2, 0.3, z1 - 0.1, x1 - 0.3, 1.0, z1 + 0.02);
  void r;
}

/** torten_row: { rect (the row, houses side by side), n, seed } — pale flat-roofed two-storey houses with ribbon casements, a door each, a kitchen garden behind. */
function tortenRow(el, ctx) {
  const sk = new S(ctx), r = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, n = el.n, pw = (x1 - x0) / n, h = 6.2;
  sk.s('plaster_white', x0, 0, z0, x1, h, z1);
  sk.b('concrete_light', x0 - 0.05, h, z0 - 0.05, x1 + 0.05, h + 0.12, z1 + 0.05);
  for (let i = 0; i < n; i++) {
    const a = x0 + i * pw, c = a + pw;
    if (i) sk.b('concrete_light', a - 0.04, 0, z0 - 0.15, a + 0.04, h, z0); // party-wall edge
    winOn(sk, el.rect, 's', a + 0.6, a + pw - 1.6, 3.5, 4.8, 'steel_grey'); winOn(sk, el.rect, 's', a + 0.6, a + 2.0, 0.9, 2.1, 'steel_grey');
    sk.b(['car_blue', 'car_red', 'paint_cab_yellow', 'car_cream'][Math.floor(r() * 4)], c - 1.3, 0, z1, c - 0.4, 2.2, z1 + 0.08);
    sk.b('concrete_light', c - 1.6, 2.4, z1, c - 0.1, 2.5, z1 + 0.9);
    winOn(sk, el.rect, 'n', a + 0.8, a + pw - 0.8, 3.5, 4.8, 'steel_grey'); winOn(sk, el.rect, 'n', a + 1.0, a + 2.4, 0.9, 2.1, 'steel_grey');
    // the garden behind: beds, a path, a shed
    const gz = z0 - 8;
    for (let b = 0; b < 4; b++) sk.b('soil', a + 0.9 + b * 0.8, 0, gz + 1, a + 1.5 + b * 0.8, 0.12, z0 - 1.5);
    sk.b('timber', c - 1.8, 0, z0 - 3.0, c - 0.6, 2.0, z0 - 1.8); sk.b('tar_wood', c - 1.9, 2.0, z0 - 3.1, c - 0.5, 2.1, z0 - 1.7);
  }
}

/** bicycle: a 1920s roadster standing at `at` turned by rot. */
function bicycle(el, ctx) {
  const sk = new S(ctx), [x, z] = el.at, c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0), y = el.y ?? 0, W = (u, h) => [x + u * s, y + h, z + u * c];
  for (const u of [-0.55, 0.55]) for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, b = a + Math.PI / 4; sk.rod('iron', W(u + Math.cos(a) * 0.33, 0.34 + Math.sin(a) * 0.33), W(u + Math.cos(b) * 0.33, 0.34 + Math.sin(b) * 0.33), 0.012, 3); }
  sk.rod('iron', W(-0.55, 0.34), W(0.0, 0.62), 0.015, 4); sk.rod('iron', W(0.0, 0.62), W(0.5, 0.65), 0.015, 4); sk.rod('iron', W(0.5, 0.65), W(0.55, 0.34), 0.015, 4);
  sk.rod('iron', W(0.5, 0.65), W(0.46, 0.92), 0.015, 4); sk.rod('iron', W(0.36, 0.95), W(0.56, 0.95), 0.012, 4); sk.b('iron', W(-0.05, 0.64)[0] - 0.12, y + 0.64, W(-0.05, 0.64)[2] - 0.05, W(-0.05, 0.64)[0] + 0.12, y + 0.68, W(-0.05, 0.64)[2] + 0.05);
}

export const HOUSE_ELEMENTS = { dessau_house: dessauHouse, bauhaus_master: masterHouse, torten_row: tortenRow, bicycle };

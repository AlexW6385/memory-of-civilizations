// The household trades of Pagan's yards (docs/settlements/bagan.md §12): what a family of a given trade kept behind its house — the potter's clamp kiln and rack of unfired ware, the weaver's loom
// and indigo pots, the farmer's rice stack and plough, the sugar-boiler's pan, the lacquerer's drying rack, the basket-maker's stacks, the fisher's net and dugout, the brick- and thatch-maker's
// stacks, the devout household's festival pole and offering table. Each fills about 3.6 m by 2.6 m centred on (cx, cv) of a frame F, on the ground (y 0); nothing stands in a doorway.
import { pot, firewood, laundryLine, bench, festPole, offering, loom } from './detail.js';
import { lathe } from '../../core/geom.js';

export const TRADE_KINDS = [['farmer', 0.25], ['weaver', 0.12], ['potter', 0.1], ['sugar', 0.1], ['lacquer', 0.1], ['basket', 0.1], ['fisher', 0.08], ['brick', 0.08], ['devout', 0.07]];
export function pickTrade(x) { let a = 0; for (const [k, w] of TRADE_KINDS) { a += w; if (x < a) return k; } return 'farmer'; }

const P = (prof, s = 1) => prof.map(([r, y]) => [r * s, y * s]);

export function tradeYard(F, kind, cx, cv, r) {
  const L = (mat, prof, u, y, v, seg = 10) => F.lathe(mat, prof, u, y, v, seg);
  switch (kind) {
    case 'potter': {
      L('brick', [[1.1, 0], [1.05, 0.4], [0.8, 0.8], [0.4, 1.05], [0.001, 1.15]], cx - 0.7, 0, cv, 12);
      F.circle(cx - 0.7, cv, 1.05, 0, 1.1);
      F.b('wood_dark', cx - 0.95, 0.1, cv + 0.95, cx - 0.45, 0.55, cv + 1.12, false);
      F.b('plaster_streak', cx - 1.3, 0, cv + 1.1, cx - 0.1, 0.02, cv + 1.5, false);
      for (const [x, z] of [[0.7, -0.4], [1.8, -0.4], [0.7, 0.4], [1.8, 0.4]]) F.b('timber', cx + x - 0.04, 0, cv + z - 0.04, cx + x + 0.04, 1.0, cv + z + 0.04, false);
      for (const y of [0.32, 0.9]) {
        F.b('wood_dark', cx + 0.62, y, cv - 0.48, cx + 1.88, y + 0.04, cv + 0.48, false);
        for (let i = 0; i < 4; i++) pot(F, cx + 0.85 + i * 0.3, y + 0.04, cv + (i % 2 ? 0.15 : -0.15), 0.85 + 0.1 * (i % 3), 'terracotta');
      }
      L('mud_plaster', [[0.55, 0], [0.45, 0.2], [0.2, 0.34], [0.001, 0.4]], cx + 1.2, 0, cv + 1.05, 8);
      for (let i = 0; i < 3; i++) pot(F, cx + 0.4 + i * 0.5, 0, cv - 0.95, 1.4, i === 1 ? 'pottery_dark' : 'terracotta');
      break;
    }
    case 'weaver': {
      loom(F, cx, cv - 0.5, r);
      for (let i = 0; i < 3; i++) { const x = cx + 1.0 + (i % 2) * 0.55, z = cv + 0.2 + (i >> 1) * 0.6 + (i % 2) * 0.1; pot(F, x, 0, z, 1.5, 'pottery_dark'); L('cloth_indigo', [[0.17, 0], [0.001, 0.02]], x, 0.8, z, 8); }
      laundryLine(F, cx - 1.7, cv + 1.0, cx + 0.5, cv + 1.0, 1.9, r);
      F.b('reed_mat', cx - 1.5, 0, cv - 0.3, cx - 0.7, 0.02, cv + 0.5, false);
      F.b('cloth_red', cx - 1.4, 0.02, cv - 0.2, cx - 0.9, 0.12, cv + 0.3, false);
      break;
    }
    case 'sugar': {
      F.b('brick', cx - 0.4, 0, cv - 0.4, cx + 0.8, 0.5, cv + 0.4, true);
      L('bronze', [[0.3, 0], [0.55, 0.05], [0.6, 0.2], [0.52, 0.2], [0.001, 0.03]], cx + 0.2, 0.5, cv, 12);
      F.b('wood_dark', cx - 0.7, 0.55, cv - 0.04, cx - 0.4, 0.6, cv + 0.04, false);    // the stirring paddle laid by the pan
      firewood(F, cx + 1.0, cv - 0.5, 0.9, 0.6, r);
      for (let i = 0; i < 5; i++) F.b('bamboo_culm', cx - 1.7 + i * 0.11 - 0.04, 0, cv - 0.6, cx - 1.7 + i * 0.11 + 0.04, 1.6, cv - 0.52, false);
      F.b('rope_fibre', cx - 1.72, 0.9, cv - 0.62, cx - 1.1, 0.95, cv - 0.5, false);
      for (let i = 0; i < 3; i++) pot(F, cx - 1.5 + i * 0.5, 0, cv + 0.7, 1.3, 'pottery_dark');
      break;
    }
    case 'lacquer': {
      for (const [x, z] of [[-1.3, -0.4], [0.3, -0.4], [-1.3, 0.4], [0.3, 0.4]]) F.b('timber', cx + x - 0.04, 0, cv + z - 0.04, cx + x + 0.04, 1.7, cv + z + 0.04, false);
      for (let k = 0; k < 3; k++) {
        const y = 0.5 + k * 0.55;
        F.b('wood_dark', cx - 1.38, y, cv - 0.48, cx + 0.38, y + 0.04, cv + 0.48, false);
        for (let i = 0; i < 4; i++) L((i + k) % 2 ? 'lacquer_black' : 'lacquer_red', [[0.22, 0], [0.27, 0.04], [0.001, 0.05]], cx - 1.15 + i * 0.4, y + 0.04, cv + (i % 2 ? 0.14 : -0.14), 10);
      }
      bench(F, cx + 0.8, cv + 0.5, 1.4);
      for (let i = 0; i < 3; i++) L('lacquer_red', [[0.1, 0], [0.16, 0.04], [0.18, 0.12], [0.001, 0.12]], cx + 0.95 + i * 0.4, 0.44, cv + 0.62, 8);
      break;
    }
    case 'basket': {
      for (let c = 0; c < 3; c++) for (let k = 0; k < 3 - (c === 2 ? 1 : 0); k++) L('wicker', [[0.22, 0], [0.3, 0.1], [0.32, 0.3], [0.001, 0.3]], cx - 1.3 + c * 0.7, k * 0.3, cv + 0.7, 9);
      for (const x of [0.2, 1.7]) { F.b('timber', cx + x - 0.04, 0, cv - 0.6, cx + x + 0.04, 0.6, cv - 0.5, false); F.b('timber', cx + x - 0.04, 0, cv - 0.2, cx + x + 0.04, 0.6, cv - 0.1, false); }
      for (let i = 0; i < 5; i++) F.b('bamboo_culm', cx + 0.1, 0.6 + (i % 2) * 0.06, cv - 0.55 + i * 0.09, cx + 1.8, 0.66 + (i % 2) * 0.06, cv - 0.5 + i * 0.09, false);
      L('wicker', [[0.3, 0], [0.34, 0.1], [0.3, 0.2], [0.001, 0.2]], cx + 1.0, 0, cv + 0.7, 9);
      break;
    }
    case 'fisher': {
      for (const x of [-1.5, 0.5]) F.b('bamboo_culm', cx + x - 0.04, 0, cv - 0.64, cx + x + 0.04, 2.4, cv - 0.56, false);
      F.b('rope_fibre', cx - 1.46, 1.0, cv - 0.63, cx + 0.46, 2.2, cv - 0.6, false);
      for (const x of [-0.6, 0.9]) for (const z of [0.2, 0.8]) F.b('timber', cx + x - 0.05, 0, cv + z - 0.04, cx + x + 0.05, 0.4, cv + z + 0.04, false);
      F.b('wood_ochre', cx - 0.9, 0.4, cv + 0.15, cx + 1.7, 0.75, cv + 0.85, false);
      F.b('wood_dark', cx - 0.8, 0.7, cv + 0.25, cx + 1.6, 0.75, cv + 0.75, false);
      F.b('wood_dark', cx + 1.85, 0, cv + 0.9, cx + 1.9, 1.9, cv + 0.96, false);
      F.b('wood_dark', cx + 1.8, 1.5, cv + 0.88, cx + 1.95, 1.9, cv + 0.98, false);
      break;
    }
    case 'brick': {
      for (let k = 0; k < 5; k++) for (let i = 0; i < 4; i++) F.b('brick', cx - 1.5 + i * 0.32 - (k % 2) * 0.1, k * 0.14, cv - 0.1, cx - 1.5 + i * 0.32 + 0.28 - (k % 2) * 0.1, k * 0.14 + 0.12, cv + 0.5, false);
      for (let k = 0; k < 6; k++) F.b('thatch_palm', cx + 0.2 - (k % 2) * 0.08, k * 0.07, cv - 0.5, cx + 1.9 - (k % 2) * 0.08, k * 0.07 + 0.06, cv + 0.4, false);
      F.b('wood_dark', cx - 1.3, 0, cv + 0.9, cx - 0.6, 0.06, cv + 1.2, false);            // a brick mould laid on the ground
      F.b('mud_plaster', cx - 0.5, 0, cv + 0.8, cx + 0.5, 0.1, cv + 1.2, false);
      break;
    }
    case 'devout': {
      festPole(F, cx - 1.4, cv - 0.5, 6.5, r);
      offering(F, cx + 0.2, 0, cv + 0.5, 1.2, r);
      F.b('reed_mat', cx - 0.7, 0, cv - 0.9, cx + 1.1, 0.02, cv - 0.1, false);
      F.b('wood_dark', cx + 0.9, 0, cv - 0.6, cx + 1.7, 0.3, cv - 0.2, false);
      break;
    }
    default: { // the farmer: the rice stack on its pole, the plough, the grain bin
      L('thatch_palm', [[0.9, 0], [0.95, 0.3], [0.9, 0.9], [0.6, 1.5], [0.3, 1.9], [0.001, 2.1]], cx - 1.0, 0.1, cv, 10);
      F.b('timber', cx - 1.04, 0, cv - 0.04, cx - 0.96, 2.5, cv + 0.04, false);
      F.b('wood_dark', cx - 1.5, 0, cv - 0.1, cx - 0.5, 0.1, cv + 0.1, false);
      F.circle(cx - 1.0, cv, 0.85, 0, 1.6);
      F.b('wood_dark', cx + 0.3, 0.3, cv - 0.5 - 0.04, cx + 1.9, 0.38, cv - 0.5 + 0.04, false);
      F.b('wood_dark', cx + 0.3, 0.3, cv - 0.5 - 0.04, cx + 0.38, 1.1, cv - 0.5 + 0.04, false);
      F.b('iron', cx + 1.7, 0.1, cv - 0.5 - 0.05, cx + 1.9, 0.3, cv - 0.5 + 0.05, false);
      L('wicker', [[0.5, 0], [0.55, 0.3], [0.55, 0.8], [0.45, 1.0], [0.001, 1.05]], cx + 1.2, 0, cv + 0.7, 10);
      L('thatch_palm', [[0.6, 1.0], [0.3, 1.2], [0.001, 1.3]], cx + 1.2, 0, cv + 0.7, 10);
      F.circle(cx + 1.2, cv + 0.7, 0.5, 0, 1.0);
      break;
    }
  }
}

/** What hangs from the tie beam of a house of the trade (the beam runs along u at v, at height y): a hat, a sickle, skeins, a net, a basket. */
export function beamHangings(F, kind, u0, u1, v, y) {
  const cord = (u, len) => F.b('rope_fibre', u - 0.01, y - len, v - 0.01, u + 0.01, y, v + 0.01, false);
  const hat = (u, l) => { cord(u, l); F.lathe('wicker', [[0.3, 0], [0.001, 0.14]], u, y - l - 0.14, v, 10); };
  const u = u0 + 0.6, w = u1 - 0.6;
  switch (kind) {
    case 'farmer': hat(u, 0.3); cord(w, 0.4); F.b('iron', w - 0.01, y - 0.7, v - 0.04, w + 0.01, y - 0.4, v + 0.12, false); break;
    case 'weaver': cord(u, 0.5); F.b('cloth_red', u - 0.07, y - 0.9, v - 0.05, u + 0.07, y - 0.5, v + 0.05, false); cord(w, 0.5); F.b('cloth_indigo', w - 0.07, y - 0.85, v - 0.05, w + 0.07, y - 0.5, v + 0.05, false); break;
    case 'fisher': cord(u, 0.3); F.b('rope_fibre', u - 0.25, y - 0.8, v - 0.05, u + 0.25, y - 0.3, v + 0.05, false); hat(w, 0.3); break;
    case 'sugar': case 'potter': cord(u, 0.5); pot(F, u, y - 0.5 - 0.5, v, 0.9, 'terracotta'); hat(w, 0.3); break;
    case 'lacquer': cord(u, 0.4); F.lathe('lacquer_red', [[0.2, 0], [0.24, 0.04], [0.001, 0.05]], u, y - 0.45, v, 10); hat(w, 0.3); break;
    default: hat(u, 0.3); cord(w, 0.4); F.lathe('wicker', [[0.12, 0], [0.2, 0.08], [0.22, 0.18], [0.001, 0.18]], w, y - 0.6, v, 8); break;
  }
}
void lathe; void P;

// Ming Suzhou's own pieces, on top of the Jiangnan vocabulary (src/styles/ming/): the furniture and
// objects of the garden's halls and of a scholar's study (props.js, study.js, halls.js), the courts'
// vat, drums, screen wall and plants (court.js), the inscribed boards over the halls and the couplets
// on their columns, the potted landscapes (penjing) on their stands
// (docs/settlements/ming-suzhou.md §11).

import { STYLES, registerStyle } from '../../core/build.js';
import '../../objects/index.js';
import { suzhouShop } from './shops.js';
import '../../styles/ming/index.js';
import { Parts, table, rock, pine, plaqueBuild, box, lathe } from './props.js';
import { scholarStudy } from './study.js';
import { hallFurniture } from './halls.js';
import { courtPiece } from './court.js';

/**
 * plaque: an inscribed board { at, y (its foot), facing ([dx, dz]), w, h, n (characters), ink }: a frame
 * of dark lacquer round a field of wood, the characters raised on it in malachite green — each a
 * few strokes (the inscriptions themselves are not modelled; ours are generic strokes).
 */
function plaque(el, { bag }) {
  const P = new Parts(); plaqueBuild(P, el);
  const [fx, fz] = el.facing ?? [0, 1];
  P.emit(bag, el.at[0], el.y, el.at[1], Math.atan2(fx, fz));
}

/** penjing: a potted landscape on its stand { at, y, kind ('pine' | 'rock'), s, seed, stand ('stone' | 'wood') }. */
function penjing(el, { bag, col }) {
  const P = new Parts(), s = el.s ?? 1, sh = el.stand === 'wood' ? 0.75 : 0.55;
  if (el.stand === 'wood') { const Q = new Parts(); table(Q, 0.6 * s, 0.4 * s, sh); Q.emit(P, 0, 0, 0); }
  else { P.add('granite_grey', box(-0.32 * s, 0, -0.22 * s, 0.32 * s, sh - 0.05, 0.22 * s)); P.add('granite_grey', box(-0.36 * s, sh - 0.05, -0.26 * s, 0.36 * s, sh, 0.26 * s)); }
  const Q = new Parts();
  if (el.kind === 'rock') { Q.add('glaze_white', lathe([[0.001, 0], [0.3, 0], [0.32, 0.05], [0.29, 0.05], [0.001, 0.03]], 8).scale(1.4, 1, 0.9)); Q.add('water', lathe([[0.29, 0.042], [0.001, 0.042]], 8).scale(1.4, 1, 0.9)); const R = new Parts(); rock(R, 0.45, el.seed ?? 3); R.emit(Q, 0.05, 0.03, 0); }
  else pine(Q, 1, el.seed ?? 4, el.basin ?? 'glaze_blue');
  Q.emit(P, 0, sh, 0, 0, s);
  P.emit(bag, el.at[0], el.y ?? 0, el.at[1], el.rot ?? 0);
  col.circle(el.at[0], el.at[1], 0.35 * s, el.y ?? 0, (el.y ?? 0) + sh);
}
const base = STYLES.ming;
registerStyle('suzhou-site', { ...base, elements: { ...base.elements, scholar_study: scholarStudy, hall_furniture: hallFurniture, court_piece: courtPiece, plaque, penjing } });

// the shop fronts are an element of the street life (instanced pieces, shared settlement-wide)
STYLES.life.elements.suzhou_shop = suzhouShop;

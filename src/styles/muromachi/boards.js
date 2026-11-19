// The name boards (gaku) of the temples' gates and halls (docs/settlements/muromachi-kyoto.md §12): a black lacquered board in a thin frame with the
// name in gold characters raised from it, written as the Zen temples of the age wrote their names, right to left. { at: [x, z] (the board's
// middle), y (its height), rot (the heading it faces: +z at 0), text, w, h, pitch, size }.
import { box } from '../../core/geom.js';
import { inscription, canWrite } from './script.js';

function board(el, { bag }) {
  if (!canWrite(el.text)) throw new Error('kyoto_board: no verified glyph for ' + el.text);
  const [x, z] = el.at, y = el.y ?? 3, w = el.w ?? 1.6, h = el.h ?? 0.55, rot = el.rot ?? 0, n = [...el.text].length;
  const place = (g) => bag.add(g.mat, g.geo.rotateY(rot).translate(x, y, z));
  const bd = 0.04;
  place({ mat: 'lacquer_black', geo: box(-w / 2, -h / 2, -0.03, w / 2, h / 2, 0.02) });
  for (const [a, b, c, d] of [[-w / 2 - bd, -h / 2 - bd, w / 2 + bd, -h / 2], [-w / 2 - bd, h / 2, w / 2 + bd, h / 2 + bd], [-w / 2 - bd, -h / 2, -w / 2, h / 2], [w / 2, -h / 2, w / 2 + bd, h / 2]]) place({ mat: 'gilt_bronze', geo: box(a, b, -0.034, c, d, 0.026) });
  const size = el.size ?? Math.min(h * 0.78, (w * 0.9) / n / 1.08), pitch = el.pitch ?? size * 1.08;
  place({ mat: 'gilt_bronze', geo: inscription(el.text, { pitch, size, z0: 0.02, z1: 0.034 }) });
}
export const boardElements = { kyoto_board: board };

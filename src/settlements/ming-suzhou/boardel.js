// The inscribed boards of the temple and the pavilions as an element of the north style (docs/settlements/ming-suzhou.md §30):
// { at: [x, z], y (the board's foot), facing: [dx, dz], w, h, text, finish ('gilt' | 'wood'), vertical }.
import { Parts, plaqueBuild } from './props.js';
import { boardLit } from './boards.js';

export function boardElement(el, { bag }) {
  const P = new Parts(); plaqueBuild(P, { ...el, glow: el.glow ?? (!!el.text && boardLit(el.at, el.y)) });
  const [fx, fz] = el.facing ?? [0, 1];
  P.emit(bag, el.at[0], el.y, el.at[1], Math.atan2(fx, fz));
}

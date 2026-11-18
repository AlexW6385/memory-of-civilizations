// The walks up the stairs of the houses whose upper floors can be climbed (docs/settlements/florence.md §15): from the street through the
// door, up the stair along the left wall, to the room of the first floor, out on the balcony where there is one, and up to the top floor.
import { lots } from './layout.js';
import { enterable, upper } from './town.js';
import { layout, balconyOf } from '../../styles/renaissance/casa-up.js';

export function upperWalks() {
  const all = lots(), open = enterable(all), out = [];
  for (const l of all) {
    if (!open.has(l) || !upper(l)) continue;
    const el = { ...l, open: true, use: open.get(l), upper: true }, lay = layout(el);
    if (lay.m < 1) continue;
    const { P, ve, m, L } = lay, W = (u, v) => P(u, v);
    const r = [W(L / 2, -1.6), W(L / 2, 0.8), W(0.9, 0.6), W(0.9, ve[0] - 0.05), W(2.3, ve[0] - 0.05), W(2.3, ve[0] + 1.0)];
    for (let k = 1; k < m; k++) r.push(W(2.3, ve[k - 1] - 0.05), W(0.9, ve[k - 1] - 0.05), W(0.9, ve[k] - 0.05), W(2.3, ve[k] - 0.05), W(2.3, ve[k] + 1.0));
    // out on the balcony and back, then up to the top floor's rooms
    const bal = balconyOf(el, lay);
    if (bal) { r.splice(6, 0, W(2.3, 1.0), W(bal.u, 1.0), W(bal.u, -0.55), W(bal.u, 1.0), W(2.3, 1.0), W(2.3, ve[0] - 0.05)); }
    r.y0 = 0;
    out.push(r);
  }
  return out;
}

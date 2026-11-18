// Worker: the shapes of the people on the roads (src/planet/travellers.js), made off the main thread.
// The page sends { key, ids } — the settlements whose dress the road's travellers wear; the worker
// takes each one's walkers from its movers data (src/settlements/<id>/movers.js WALKERS: a few kinds,
// porters with their poles included) and makes them, with a rider in the dress of the first, into one
// set (movers-kit.js SetBuilder) and answers { key, sets, kinds } with transferable arrays.

import { MOVER_SITES } from '../engine/movers-sites.js';
import { SetBuilder, addFigure } from '../engine/movers-kit.js';
import { figure } from '../objects/figures.js';

self.onmessage = async (e) => {
  const { key, ids } = e.data;
  try {
    const sb = new SetBuilder(['skin', 'cloth', 'fibre', 'wood']), kinds = [];
    let first = null;
    for (const id of ids) {
      const D = await MOVER_SITES[id]();
      let n = 0;
      for (const k of D.WALKERS) {
        if (n >= 2 || sb.variants.length > 28) break;
        const v = sb.variant(`${id}/${k.id}`);
        addFigure(sb, v, figure, { ...k.el }, { far: false });
        kinds.push({ v, id: `${id}/${k.id}`, weight: k.weight ?? 1, c1: k.c1, c2: k.c2, c3: k.c3 ?? ['cloth_black'], speed: k.speed, stride: k.stride, h: k.h ?? null, swing: k.swing ?? 1, pole: !!k.pole || ['pole', 'pails'].includes(k.el.carry) });
        first ??= k;
        n++;
      }
    }
    // a rider, seated astride (the mahout's seat, src/objects/animals.js): in the first kind's colours
    if (first) {
      try {
        const v = sb.variant('rider');
        addFigure(sb, v, figure, { dress: 'tunic', legs: 'hose', hat: 'turban', pose: 'ride', feet: 'bare', hair: first.el.hair }, { far: false });
        kinds.push({ v, id: 'rider', rider: true, weight: 1, c1: first.c1, c2: first.c2, c3: first.c3 ?? ['cloth_black'], speed: [1.6, 2.2], stride: 1.4, h: [0.95, 1.0], swing: 0, pole: false });
      } catch (err) { /* no rider */ }
    }
    const groups = sb.finish(), transfer = [];
    for (const g of Object.values(groups)) for (const a of Object.values(g)) transfer.push(a.buffer);
    self.postMessage({ key, sets: { groups, variants: sb.variants }, kinds }, transfer);
  } catch (err) {
    self.postMessage({ key, error: String(err?.stack || err) });
  }
};

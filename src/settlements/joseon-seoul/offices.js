// The palace's offices in the Heungnyemun court (docs/settlements/joseon-seoul.md §17): the ranges of layout.js OFFICES as plans of the
// joseon style (open rooms with their ondol floors, lattice doors, desks, chests, brazier and the paper lantern), the people in them and
// what stands before their veranda. World coordinates; positions from the ranges' own frame (styles/joseon/house.js rangeFrame).
import { OFFICES, RADIUS } from './layout.js';
import { rangeFrame } from '../../styles/joseon/house.js';

const base = (id, style, elements, extra = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], elements, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 70], facing: 'n' }, ...extra });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function officePlans() {
  const rand = rng(1888 + 17), sd = () => Math.floor(rand() * 1e9), F = [], D = [];
  const face = ([dx, dz]) => Math.atan2(-dx, -dz);
  for (const o of OFFICES) {
    const f = rangeFrame(o), { P, spans, bw, FL, C, V } = f, s = o.face === 's', dir = (a, b) => (s ? [a, b] : [b, a]);   // a direction given as (along, deep) in world
    const fig = (u, v, toward, extra = {}) => { const p = P(u, v); F.push({ t: 'figure', at: p, y: extra.y ?? FL + 0.04, rot: face(dir(...toward)), seed: sd(), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', skin: rand() < 0.6 ? 'skin_light' : 'skin_medium', hat: 'brim', hatMat: 'lacquer_black', beard: rand() < 0.5, h: 1.6 + rand() * 0.1, hair: 'topknot', ...extra }); };
    for (const sp of spans) {
      const c = (sp.a0 + sp.a1) / 2;
      if (sp.kind === 'sarangbang') {
        fig(c, 1.15, [0, 1], { pose: 'cross', arms: 'cross', y: FL + 0.1, cloth: o.use === 'wait' ? 'cloth_blue' : 'cloth_white', cloth2: 'cloth_white' });          // the official on his cushion
        if (o.use !== 'wait') fig(sp.a0 + 1.15, 2.2, [0, -1], { pose: 'cross', arms: 'cross', cloth: 'linen' });                       // the clerk at his desk
      } else if (sp.kind === 'daecheong') {
        if (sp.a1 - sp.a0 > 4) fig(c + 0.3, 2.3, [0, -1], { pose: 'cross', arms: 'cross', y: FL + 0.03, cloth: o.use === 'guard' || o.use === 'guard5' ? 'cloth_indigo' : 'cloth_white' });
      } else if (sp.kind === 'kitchen') {
        fig(sp.a1 - 2.2, 1.25, [1, 0], { pose: 'squat', y: 0, hat: 'none', hair: 'bun', beard: false, cloth: 'cloth_green', cloth2: 'cloth_white' });                    // the maid at the stove
        F.push({ t: 'firewood', at: P(sp.a0 + 0.9, C + V + 1.6), y: 0.03, rot: s ? 0 : Math.PI / 2, len: 1.3, seed: sd() });
        F.push({ t: 'pot', kind: 'vat', at: P(sp.a1 - 0.7, C + V + 1.4), y: 0.03, rot: 0, n: 1, seed: sd() });
      }
    }
    // at the guard-rooms a spearman stands at the veranda's end, a bench before it; clerks' offices have a stool and a basket of documents
    const last = spans[spans.length - 1], bx = last.a1 - bw / 2;
    if (o.use === 'guard' || o.use === 'guard5') {
      fig(bx, C + 0.7, [0, 1], { pose: 'staff', carry: 'staff', len: 2.6, staffMat: 'timber', cloth: 'cloth_indigo', cloth2: 'cloth_red', hatMat: 'cloth_black', y: FL + 0.03, h: 1.72 });
      F.push({ t: 'bench', at: P(bx - 3.2, C + V + 1.8), y: 0.03, rot: s ? 0 : Math.PI / 2, len: 1.8 });
      fig(bx - 3.2, C + V + 1.8, [0, 1], { pose: 'sit', cloth: 'cloth_indigo', cloth2: 'cloth_red', hatMat: 'cloth_black', y: 0.45 });
    } else if (o.use === 'clerk' || o.use === 'clerk4' || o.use === 'office') {
      F.push({ t: 'stool', at: P(bx - 2.0, C + V + 1.5), y: 0.03, rot: 0.5 }); F.push({ t: 'basket', at: P(bx - 3.1, C + V + 1.6), y: 0.03, rot: 0.3, n: 2, seed: sd() });
    } else if (o.use === 'wait') {
      for (const k of [0, 1]) fig(bx - 2.6 - k * 1.0, C + V + 2.0, [0, 1], { pose: k ? 'talk' : 'stand', cloth: 'cloth_blue', cloth2: 'cloth_white', hat: 'brim', hatMat: 'lacquer_black', y: 0.04 });   // officials waiting to be called
    } else F.push({ t: 'pot', kind: 'dark_pot', at: P(bx - 1.6, C + V + 1.5), y: 0.03, rot: 0, n: 3, seed: sd() });
    // a paper lantern at the eave over the first doorway of every range, a second by the last
    for (const u of [spans[0].a0 + bw * 1.5, last.a1 - bw * 0.5]) D.push({ t: 'hang_lantern', at: P(u, C + V - 0.05), y: FL + 1.9, rot: 0, kind: u === spans[0].a0 + bw * 1.5 ? 'paper' : 'white', drop: 0.15, seed: 1 });
  }
  return [base('joseon-seoul-offices', 'joseon', OFFICES.map((o) => ({ t: 'joseon_precinct_range', rect: o.face === 's' ? [o.org[0] - 1, o.org[1] - 1, o.org[0] + o.L + 1, o.org[1] + 5.2] : [o.org[0] - 1, o.org[1] - 1, o.org[0] + 5.2, o.org[1] + o.L + 1], ...o, thatch: o.use === 'pantry' || o.use === 'serv' }))), { ...base('joseon-seoul-office-life', 'life', [...F, ...D]), center: [0, 120], near: 200 }];
}

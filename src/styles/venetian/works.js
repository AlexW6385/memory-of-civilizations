// The sculpture of the Piazza as elements (docs/settlements/venice.md §4j): { t: 'sculpt', what, lod, … }. Each is
// one Local, so one geometry a material; built in the world's frame (the plans put them in near and far versions).
import { Local, CV, GB, BZ, MB, at, put, person, quadrigaHorse, lionModel, crocodile, theodore, flip } from './stone.js';
import { Matrix4 } from '../../core/three.js';
import { box } from '../../core/geom.js';
import { horsesOf, patronOf } from './works-a.js';
import { capitalFigures } from './works-c.js';
import { portaFigures, cornerGroup, tetrarchs } from './works-b.js';

export function sculpt(el, { bag, col }) {
  const L = new Local(), lod = el.lod ?? 0;
  if (el.what === 'horses') horsesOf(L, el, lod);
  else if (el.what === 'patron') patronOf(L, el, lod);
  else if (el.what === 'capitals') capitalFigures(L, el, lod);
  else if (el.what === 'porta') portaFigures(L, el, lod);
  else if (el.what === 'corner') { const f = at(1, el.x, el.y, el.z, Math.atan2(el.dx, el.dz)); const T = new Local(); cornerGroup(T, el.kind, lod); for (const [mat, list] of T.m) put(L, mat, list, f); }
  else if (el.what === 'tetrarchs') {
    tetrarchs(L, el, lod);
    L.add('marble', box(el.x - 1.1, el.y - 1.5, el.z - 1.1, el.x + 1.1, el.y, el.z + 1.1));
    col?.rect([el.x - 1.1, el.z - 1.1, el.x + 1.1, el.z + 1.1], el.y - 1.5, el.y);
  }
  else throw new Error('sculpt: ' + el.what);
  if (lod === 2) { const R = { limestone_carved: 'limestone', bronze: 'wood_dark', porphyry: 'terracotta' }; const out = new Local(); for (const [m, list] of L.m) for (const g of list) out.add(R[m] ?? m, g); out.emit(bag); return; }
  L.emit(bag);
}

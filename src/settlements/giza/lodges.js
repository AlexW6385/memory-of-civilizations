// Giza — the ordinary buildings of the plateau within the arrival's reach (docs/settlements/giza.md §15): the works' lodgings, the scribes'
// tally house, the tool store, the masons' workshops, the grain store, the lector priest's house, a bakery and a gang's barracks.
// Pure data: rect (the outside of the walls), the side of the door, and the people inside.

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));

export const LODGES = [
  { t: 'ok_lodge', kind: 'lodging', rect: [262, -59, 269, -53.5], door: 'w', seed: 1 },
  { t: 'ok_lodge', kind: 'lodging', rect: [263, -88, 270.5, -82.5], door: 'w', seed: 2 },
  { t: 'ok_lodge', kind: 'scribe', rect: [266, -40, 271.5, -35.5], door: 'w', seed: 3 },
  { t: 'ok_lodge', kind: 'store', rect: [258, -32, 263.5, -26.5], door: 'w', seed: 4 },
  { t: 'ok_lodge', kind: 'workshop', rect: [186, -93, 195, -87], door: 's', seed: 5 },
  { t: 'ok_lodge', kind: 'workshop', rect: [171, -60, 178.5, -53.5], door: 'e', seed: 6 },
  { t: 'ok_lodge', kind: 'granary', rect: [264, -74, 273, -69], door: 'w', seed: 7 },
  { t: 'ok_lodge', kind: 'priest', rect: [170, -77, 179, -70], door: 's', seed: 8 },
  { t: 'bakery', rect: [176, -98, 183.5, -92.5], seed: 9 },
  { t: 'gallery_hall', rect: [176, -108, 188, -102.4], seed: 10 },
];

/** The people inside: a point in the building's own frame (u along the door wall, v from the back wall) turned to the world. */
function at(l, u, v) {
  const [x0, z0, x1, z1] = l.rect, d = l.door;
  return d === 's' ? [x0 + u, z0 + v] : d === 'n' ? [x1 - u, z1 - v] : d === 'e' ? [x0 + v, z0 + u] : [x1 - v, z1 - u];
}
export function lodgeLife() {
  const rand = rng(2581), L = [];
  const fig = (l, u, v, toward, o) => { const p = at(l, u, v), q = toward ? at(l, toward[0], toward[1]) : p; L.push({ t: 'figure', at: p, y: 0, rot: toward ? face(p, q) : rand() * 6.28, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o }); };
  const dims = (l) => { const [x0, z0, x1, z1] = l.rect, ns = l.door === 's' || l.door === 'n'; return ns ? [x1 - x0, z1 - z0] : [z1 - z0, x1 - x0]; };
  for (const l of LODGES) {
    if (l.t !== 'ok_lodge') continue;
    const [W, D] = dims(l), uc = W / 2;
    if (l.kind === 'lodging') fig(l, uc - 0.9, D * 0.5, [uc, D], { over: 'sash', pose: l.seed % 2 ? 'talk' : 'stand' });
    else if (l.kind === 'scribe') { fig(l, uc, 1.95, [uc, 1.3], { over: 'sash', pose: 'sit', hair: 'shaven' }); fig(l, uc + 1.6, D + 1.1, [uc, D + 3], { carry: 'basket' }); }
    else if (l.kind === 'store') fig(l, uc + 0.2, D * 0.55 - 0.7, [uc, D * 0.55 + 1], { carry: 'basket' });
    else if (l.kind === 'workshop') { fig(l, 1.1, 2.0, [1.1, 1.1], { pose: 'kneel' }); if (l.seed % 2) fig(l, W - 1.3, 2.4, [W - 1.3, 1.2], { pose: 'kneel' }); }
    else if (l.kind === 'granary') fig(l, uc - 1.4, D - 1.4, [uc - 1.4, D * 0.4], { over: 'sash', pose: 'talk' });
    else if (l.kind === 'priest') fig(l, uc - 0.2, 1.9, [uc, 0.4], { over: 'sash', hair: 'shaven', pose: 'stand' });
  }
  return L;
}

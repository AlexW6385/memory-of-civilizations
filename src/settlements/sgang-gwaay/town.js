// The row of houses, the poles, canoes, racks and stacks of the street between the houses and the water (docs/settlements/
// sgang-gwaay.md §5), sheds and trails behind, and the people of the village at their work (§9): hats of spruce root and capes
// of cedar bark, the canoes launched and landed, fish split and hung, a log being hollowed, children and dogs on the beach.
import { RADIUS, G, LANDMARK, houses, village, height, shoreX, arc, toWorld, inHouse, tiers, SEA } from './layout.js';
import { yards } from './yards.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0
const plan = (id, style, elements, bounds = [-RADIUS, -RADIUS, RADIUS, RADIUS]) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds, entrance: { at: [40, 0], facing: 'w' } });

export async function town() {
  const H = houses(), v = village(), rand = rng(1850), plans = [], E = [], P = [];
  // each house its own plan (culled by its own bounds)
  for (const h of H) {
    if (h.landmark) continue;
    const r = Math.max(h.w, h.d) / 2 + 6;
    // every house is open and furnished (the pit is dug in layout.js's ground; tiers are its floors)
    plans.push(plan('sgang-house-' + h.i, 'haida', [{ t: 'haida_house', c: h.c, yaw: h.yaw, w: h.w, d: h.d, age: h.age, ridge: h.ridge, eave: h.eave, seed: h.seed, g: G, landmark: false, tiers: tiers(h), pole: 5.2 + (h.w - 11) * 0.5 }], [h.c[0] - r, h.c[1] - r, h.c[0] + r, h.c[1] + r]));
  }
  // the yards: what stands before each house, on the beach and in the shallows; who sits there and inside
  const Y = yards(), grp = H.map(() => ({ E: [], P: [], pts: [] }));
  const nearest = (x, z) => { let b = 0, bd = 1e9; H.forEach((h, k) => { const d = Math.hypot(h.c[1] - z, (h.c[0] - x) * 0.3); if (d < bd) { bd = d; b = k; } }); return b; };
  for (const p of Y.props) { const g = grp[nearest(...p.c)]; g.E.push({ t: 'haida_prop', kind: p.kind, c: p.c, yaw: p.yaw, y: p.y, w: p.w, seed: p.seed }); g.pts.push(p.c, [p.c[0] + 5, p.c[1] + 5], [p.c[0] - 5, p.c[1] - 5]); }
  // the poles of the street, the graveyard at the south end
  for (const p of v.poles) E.push({ t: 'haida_pole', kind: p.kind, c: p.c, yaw: p.yaw, h: p.h, r: p.r, seed: p.seed, y: height(...p.c), age: 0.45 + rand() * 0.5 });
  for (const c of v.canoes) E.push({ t: 'haida_canoe', c: c.c, yaw: c.yaw, l: c.l, moored: c.moored, seed: c.seed, y: c.moored ? SEA - 0.3 : height(...c.c) + 0.38 });
  for (const r of v.racks) E.push({ t: 'haida_rack', c: r.c, yaw: r.yaw, w: r.w, seed: r.seed, y: height(...r.c) });
  for (const s of v.stacks) E.push({ t: 'haida_stack', c: s.c, yaw: s.yaw, kind: s.kind, seed: s.seed, y: height(...s.c) });
  for (const l of v.logs) E.push({ t: 'haida_log', c: l.c, yaw: l.yaw, l: l.l, r: l.r, y: height(...l.c) });
  E.push({ t: 'haida_hollow', c: v.hollow.c, yaw: v.hollow.yaw, l: v.hollow.l, y: height(...v.hollow.c) });
  // sheds behind the houses
  H.forEach((h, k) => { if (k % 2 === 1) { const p = toWorld(h, (rand() - 0.5) * h.w * 0.5, h.d / 2 + 5.5); if (!inHouse(p[0], p[1], -3)) E.push({ t: 'haida_shed', c: p, yaw: h.yaw, seed: 900 + k, y: height(...p) }); } });
  plans.push(plan('sgang-fittings', 'haida', E));
  const bnd = (g, pad = 4) => { const xs = g.pts.map((q) => q[0]), zs = g.pts.map((q) => q[1]); return [Math.min(...xs) - pad, Math.min(...zs) - pad, Math.max(...xs) + pad, Math.max(...zs) + pad]; };

  // ---- the people ----
  const skin = () => (rand() < 0.7 ? 'skin_medium' : 'skin_light');
  const CAPE = ['roof_bark', 'cloth_brown', 'hide_tan', 'cloth_ochre'];
  const person = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: CAPE[Math.floor(rand() * CAPE.length)], cloth2: 'cloth_brown', over: 'cape', skin: skin(), hat: rand() < 0.75 ? 'straw' : 'none', feet: 'bare', hair: 'long', beard: false, ...o });
  const at = (x, z) => [x, z, height(x, z)];
  // the people of the yards: benches, fires, hide frames; inside every house; the crews of the boats
  const WHO = {
    elder: () => ({ dress: 'wrap', over: 'cloak', cloth: ['cloth_grey', 'cloth_brown', 'roof_bark'][Math.floor(rand() * 3)], hat: 'straw', hair: 'long' }),
    woman: () => ({ hat: rand() < 0.6 ? 'straw' : 'none' }),
    man: () => ({ dress: 'tunic', hair: 'bun', hat: rand() < 0.5 ? 'straw' : 'none', over: 'cape' }),
    child: () => ({ child: true, h: 1.05, hat: 'none', over: 'none' }),
  };
  const folk = (f, o = {}) => person([f.at[0], f.at[1]], f.y, f.rot, { ...WHO[f.who](), pose: f.pose, ...o });
  for (const f of Y.sit) { const k = nearest(...f.at); folk(f); grp[k].pts.push(f.at); }
  const inFolk = H.map(() => []);
  for (const f of Y.folk) { const old = P.length; folk(f); inFolk[f.house].push(P.pop()); void old; }
  H.forEach((h, k) => {
    const r = Math.max(h.w, h.d) / 2 + 3, pp = [...inFolk[k]];
    const sitters = Y.sit.filter((f) => nearest(...f.at) === k).length;
    void sitters;
    if (grp[k].E.length) plans.push(plan('sgang-yard-' + h.i, 'haida', grp[k].E, bnd({ pts: [...grp[k].pts, [h.c[0] - r, h.c[1] - r], [h.c[0] + r, h.c[1] + r]] })));
    if (pp.length) plans.push(plan('sgang-folk-' + h.i, 'life', pp, [h.c[0] - r, h.c[1] - r, h.c[0] + r, h.c[1] + r]));
  });
  // the boats in the bay: a canoe at its mooring, two paddlers and a fisher
  { const B = [], C = [];
    for (const b of Y.boats) {
      B.push({ t: 'haida_canoe', c: b.c, yaw: b.yaw, l: b.l, moored: true, seed: b.seed, y: SEA - 0.3 });
      const s = Math.sin(b.yaw), c = Math.cos(b.yaw);
      for (let j = 0; j < b.crew; j++) {
        const dz = (-0.18 + j * 0.2) * b.l, x = b.c[0] + dz * s, z = b.c[1] + dz * c;
        C.push({ t: 'figure', at: [x, z], y: SEA - 0.45, rot: b.yaw, seed: Math.floor(rand() * 1e9), dress: j % 2 ? 'wrap' : 'tunic', cloth: CAPE[Math.floor(rand() * CAPE.length)], cloth2: 'cloth_brown', over: 'cape', skin: skin(), hat: 'straw', feet: 'bare', hair: j % 2 ? 'long' : 'bun', beard: false, pose: 'row', carry: 'oars' });
      }
    }
    if (B.length) { plans.push(plan('sgang-boats', 'haida', B)); plans.push(plan('sgang-crews', 'life', C)); } }
  // at the racks: women splitting and hanging fish
  for (const r of v.racks) { const c = Math.cos(r.yaw), s = Math.sin(r.yaw), p = at(r.c[0] - s * 0.9, r.c[1] - c * 0.9); person([p[0], p[1]], p[2], face([p[0], p[1]], r.c), { pose: 'talk' }); }
  // at the canoes on the beach: men with paddles and gear, two at the hollowed log
  for (const cn of v.canoes.filter((c) => !c.moored).slice(0, 7)) { const p = at(cn.c[0] + 1.6, cn.c[1] + 1.6); person([p[0], p[1]], p[2], rand() * 6.28, { dress: 'tunic', hair: 'bun', over: 'cape', hat: 'none' }); }
  { const [x, z] = v.hollow.c; for (const dz of [-2.2, 1.6]) { const p = at(x - 1.3, z + dz); person([p[0], p[1]], p[2], face([p[0], p[1]], [x, z]), { dress: 'tunic', hair: 'bun', hat: 'none', pose: 'kneel', over: 'belt' }); } }
  // in the street and before the houses
  for (let k = 0; k < 34; k++) {
    const h = H[Math.floor(rand() * H.length)], [fx, fz] = h.front, d = 11 + rand() * 4, x = arc(h.c[1]) - d * fx + (rand() - 0.5) * 3, z = h.c[1] + (rand() - 0.5) * (h.w + 2);
    if (inHouse(x, z, -1.5) || height(x, z) < 0.5) continue;
    const r = rand(), pos = [x, z], y = height(x, z);
    if (r < 0.25) person(pos, y, rand() * 6.28, { child: true, h: 1.1, hat: 'none' });
    else if (r < 0.55) { person(pos, y, rand() * 6.28, { pose: 'talk' }); const b = [x + 1.1, z + 0.3]; person(b, height(...b), face(b, pos)); }
    else person(pos, y, rand() * 6.28, rand() < 0.4 ? { dress: 'tunic', hair: 'bun', hat: 'none', over: 'cape' } : {});
  }
  // children and dogs on the beach
  for (let k = 0; k < 10; k++) { const z = -120 + rand() * 240, x = shoreX(z) - 1 - rand() * 4; if (height(x, z) > -0.5) P.push({ t: 'animal', kind: 'dog', at: [x, z], y: height(x, z), rot: rand() * 6.28, seed: k + 5 }); }
  for (let k = 0; k < 6; k++) { const z = -100 + rand() * 200, x = shoreX(z) - 3 - rand() * 3; person([x, z], height(x, z), rand() * 6.28, { child: true, h: 1.05, hat: 'none' }); }
  plans.push(plan('sgang-people', 'life', P));
  void LANDMARK;
  return plans;
}

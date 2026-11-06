// The houses, storehouses, pits, canoes and kūmara gardens (docs/settlements/maori.md §5); and the
// work and the people of the pā (§4b): a pōwhiri on the marae ātea before the chief's house, the
// cooking place and the weavers on the tihi, men on the fighting stages, and on the lake shore the
// flax, the fish racks and a canoe being hollowed.
import { RADIUS, PATH, HILL, LAKE, village, inGarden, height } from './layout.js';
import pa from './plan.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0
const plan = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 160], facing: 'n' } });
const shoreZ = (x) => LAKE.z + 14 * Math.sin(x / 41) + 6 * Math.sin(x / 13 + 2);
// cloaks of flax fibre (muka, a pale gold), of dyed fibre (brown, black) and of dog skin (white, brown)
const CLOAK = ['cloth_ochre', 'cloth_ochre', 'cloth_brown', 'hide_tan', 'cloth_black'];
const CHIEF = ['hide_white', 'hide_brown'];

export async function town() {
  const v = village(), E = [], P = [], rand = rng(1769);
  for (const h of v.houses.slice(1)) E.push({ t: 'whare', carved: false, ...h });
  for (const p of v.pataka.slice(1)) E.push({ t: 'pataka', ...p });
  for (const p of v.pits) E.push({ t: 'rua', ...p });
  for (const w of v.waka) E.push({ t: 'waka', ...w });
  // the gardens south of the hill: plots of mounds in fences, paths between, the climbing path kept clear
  let seed = 1;
  for (let z0 = 154; z0 < RADIUS; z0 += 15) for (let x0 = -116; x0 < 116; x0 += 21) {
    const r = [x0, z0, x0 + 18, z0 + 12];
    if (r[0] < PATH.w + 2 && r[2] > -PATH.w - 2) continue;
    if (![[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].every(([x, z]) => inGarden(x, z))) continue;
    E.push({ t: 'mara', rect: r, y: height((r[0] + r[2]) / 2, (r[1] + r[3]) / 2), seed: seed++ });
  }

  // ---- the people ----------------------------------------------------------------------------
  const skin = () => (rand() < 0.75 ? 'skin_medium' : 'skin_dark');
  const person = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: CLOAK[Math.floor(rand() * CLOAK.length)], cloth2: 'cloth_brown', skin: skin(), hat: 'none', feet: 'bare', ...o });
  const woman = (at, y, rot, o = {}) => person(at, y, rot, { hair: 'long', beard: false, over: 'shawl', ...o });
  const man = (at, y, rot, o = {}) => person(at, y, rot, { hair: 'bun', beard: false, over: rand() < 0.5 ? 'cape' : 'shawl', ...o });
  // a warrior stripped for action: bare but for the belt and kilt (drawn as a short garment in the
  // colour of the skin, its belt of flax), the taiaha held upright in the right hand at his side
  const warrior = (at, y, rot, o = {}) => {
    let s = 0, g = 1;
    for (let k = 0; k < 50; k++) { s = Math.floor(rand() * 1e9); const r = rng(s); g = 0.92 + r() * 0.18; if (r() >= 0.3) break; }   // a seed whose arms hang
    const sk = skin(), lx = 0.215 * g + 0.035, lz = -0.03, c = Math.cos(rot), sn = Math.sin(rot);
    P.push({ t: 'figure', at, y, rot, seed: s, h: 1.65, dress: 'tunic', cloth: sk, cloth2: 'cloth_brown', over: 'belt', skin: sk, hat: 'none', feet: 'bare', hair: 'bun', beard: false, pose: 'stand', ...o });
    E.push({ t: 'taiaha', at: [at[0] + lx * c + lz * sn, at[1] - lx * sn + lz * c], y, h: 1.8 });
  };
  const [hx, hz] = HILL.c, top = HILL.top;

  // the pōwhiri on the marae ātea: the chief's house faces south over it (its porch at z ≈ 10.5);
  // the hosts before the house — the old men seated on the right as one looks out, the women
  // standing, the caller among them; the visitors come in through the summit's gateway in a
  // body, women in front, the men behind with their chief; between them the challenger, a dart
  // laid on the ground before the visitors' chief (docs/settlements/maori.md §4b)
  const H0 = v.houses[0], hxm = H0.c[0];
  E.push({ t: 'paepae', a: [hxm + 0.6, 13.3], b: [hxm + 7.4, 13.3], y: top });
  for (let k = 0; k < 7; k++) { const at = [hxm + 1.2 + k * 0.95, 13.45]; man(at, top, 0 + Math.PI + (rand() - 0.5) * 0.15, { pose: 'sit', beard: rand() < 0.3, ...(rand() < 0.5 ? { cloth: CHIEF[k % 2] } : {}) }); }
  for (let k = 0; k < 9; k++) { const at = [hxm - 6.6 + k * 0.8, 14.2 + (k % 2) * 0.35]; woman(at, top, face(at, [hxm + 2, 30]), k === 4 ? { pose: 'talk' } : {}); }
  for (let k = 0; k < 6; k++) { const at = [hxm - 5.5 + k * 1.1, 12.2]; (k % 2 ? man : woman)(at, top, face(at, [hxm + 2, 30])); }
  const vc = [-6.2, 27.5];                                                // the visitors' body
  for (let k = 0; k < 10; k++) { const at = [vc[0] - 3.6 + (k % 5) * 1.15 + (rand() - 0.5) * 0.2, vc[1] - 1.2 + Math.floor(k / 5) * 0.9]; woman(at, top, face(at, [hxm, 11]) + (rand() - 0.5) * 0.2); }
  for (let k = 0; k < 12; k++) { const at = [vc[0] - 4 + (k % 6) * 1.0 + (rand() - 0.5) * 0.2, vc[1] + 1.0 + Math.floor(k / 6) * 0.9]; man(at, top, face(at, [hxm, 11]) + (rand() - 0.5) * 0.2, { beard: rand() < 0.2 }); }
  const lead = [vc[0] + 0.2, vc[1] - 2.3];
  man(lead, top, face(lead, [hxm, 11]), { cloth: 'hide_white', over: 'cape' });
  const ch = [vc[0] + 0.6, vc[1] - 5.2];
  warrior(ch, top, face(ch, lead));
  E.push({ t: 'rakau', at: [lead[0] + 0.1, lead[1] - 1.1], y: top, yaw: 0.4 });

  // the cooking place on the east of the tihi, women at the ovens; the weavers on the west
  const hg = [hx + 13, hz + 10];
  E.push({ t: 'hangi', c: hg, y: top, yaw: 0, seed: 11 });
  for (const [u, w, pose] of [[-0.2, 1.1, 'squat'], [1.0, 2.4, 'stand'], [2.6, 0.6, 'squat'], [-2.5, 0.9, 'stand']]) { const at = [hg[0] + u, hg[1] + w]; woman(at, top, face(at, [hg[0] - 1.4, hg[1]]) + (rand() - 0.5) * 0.3, { pose, over: 'none' }); }
  for (const [x, z, yaw] of [[hx - 16, hz + 9, 0.3], [hx - 19, hz + 3, -0.4], [hx - 13, hz + 14, 0.9]]) {
    E.push({ t: 'weaving', at: [x, z], y: top, yaw, seed: Math.floor(rand() * 1e5) });
    const at = [x + Math.sin(yaw) * 1.6, z + Math.cos(yaw) * 1.6];
    woman(at, top, face(at, [x, z]), { pose: 'squat', over: 'none' });
    if (rand() < 0.6) { const b = [x + Math.cos(yaw) * 1.5, z - Math.sin(yaw) * 1.5]; woman(b, top, face(b, [x, z]), { pose: 'squat', over: 'none' }); }
  }

  // men on the fighting stages, every other stage, looking out over the palisade
  pa.elements.filter((e) => e.t === 'stage').forEach((s, k) => {
    if (k % 2) return;
    const out = face([hx, hz], s.c);
    warrior(s.c, s.y + s.h, out);
  });

  // the lake shore: clumps of flax, racks of fish drying, a canoe being hollowed, its builders
  const taken = [...v.houses, ...v.pataka, ...v.pits].map((o) => o.c);
  const clear = (x, z, m) => taken.every(([a, b]) => Math.hypot(a - x, b - z) > m) && v.waka.every((w) => Math.hypot(w.c[0] - x, w.c[1] - z) > w.l / 2 + 3);
  // the canoe being hollowed and the fish racks first, at the first clear places along the shore
  const shore = [];
  for (let x = -230; x <= 230; x += 6) shore.push(x);
  shore.sort((p, q) => Math.abs(p + 160) - Math.abs(q + 160));                 // nearest first to the west end of the beach
  for (const x of shore) {
    const z = shoreZ(x) + 13, yaw = Math.PI / 2 + 0.2;
    if (Math.hypot(x, z) > RADIUS - 50 || !clear(x, z, 9)) continue;
    E.push({ t: 'waka_build', c: [x, z], y: height(x, z), yaw, l: 11 });
    for (const u of [-4.5, -1.5, 1.5, 4.5]) taken.push([x + Math.sin(yaw) * u, z + Math.cos(yaw) * u]);
    for (const [u, w, pose] of [[1.6, -1.5, 'stand'], [-1.6, 2.5, 'squat'], [1.5, 3.4, 'squat']]) { const at = [x + w, z + u]; const sk = skin(); P.push({ t: 'figure', at, y: height(at[0], at[1]), rot: face(at, [x + w * 0.5, z]), seed: Math.floor(rand() * 1e9), dress: 'tunic', cloth: sk, cloth2: 'cloth_brown', over: 'belt', skin: sk, hat: 'none', feet: 'bare', hair: 'bun', beard: false, pose }); }
    break;
  }
  let nw = 0;
  for (const x of shore) {
    if (nw >= 3) break;
    const z = shoreZ(x) + 17;
    if (Math.hypot(x, z) > RADIUS - 45 || !clear(x, z, 5.5)) continue;
    E.push({ t: 'whata', a: [x - 2.2, z], b: [x + 2.2, z], y: height(x, z), h: 2.0 }); taken.push([x, z]); nw++;
    if (nw === 1) { const at = [x + 0.6, z + 1.4]; woman(at, height(at[0], at[1]), face(at, [x, z]), { over: 'none' }); }
  }
  let nf = 0;
  for (let k = 0; k < 600 && nf < 70; k++) {
    const x = -220 + rand() * 440, z = shoreZ(x) + 7 + rand() * 16;
    if (Math.hypot(x, z) > RADIUS - 45 || !clear(x, z, 5)) continue;
    E.push({ t: 'harakeke', at: [x, z], y: height(x, z), h: 1.5 + rand() * 0.8, seed: Math.floor(rand() * 1e5) }); taken.push([x, z]); nf++;
  }
  return [plan('maori-kainga', 'maori', E), plan('maori-people', 'life', P)];
}

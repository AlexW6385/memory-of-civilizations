// The houses, storehouses, pits, canoes and kūmara gardens (docs/settlements/maori.md §5); and the
// work and the people of the pā (§4b): a pōwhiri on the marae ātea before the chief's house, the
// cooking place and the weavers on the tihi, men on the fighting stages, and on the lake shore the
// flax, the fish racks and a canoe being hollowed.
import { RADIUS, PATH, HILL, LAKE, VENTS, village, inGarden, height, inLake } from './layout.js';
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
  for (const h of v.houses.slice(1)) E.push({ t: 'whare', carved: false, walls: (h.c[0] * 7 + h.c[1] * 3) % 5 < 2 ? 'reed_mat' : 'raupo', ...h, ...(Math.hypot(h.c[0], h.c[1]) > 250 ? { furnished: false } : {}) });
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
  // eel pots (hīnaki) on the shore by the racks, lying in twos and threes, one leaning on a rack's post
  // [stated: the hīnaki, Te Ara "Te hopu tuna"; inferred: their places]
  const racks = E.filter((e) => e.t === 'whata');
  racks.forEach((r, k) => {
    const cx = (r.a[0] + r.b[0]) / 2, cz = r.a[1];
    for (let q = 0; q < 2 + (k % 2); q++) { const at = [cx - 1.4 + q * 0.55, cz + 2.4 + (q % 2) * 0.3]; E.push({ t: 'hinaki', at, y: height(at[0], at[1]), yaw: Math.PI / 2 + (rand() - 0.5) * 0.4, len: 1.0 + rand() * 0.3 }); taken.push(at); }
  });
  // kurī — "small, long-haired dogs about the size of a border collie … pricked ears … the tail was
  // bushy"; coats black, white, mixed or yellow [stated: Te Ara "Kurī — Polynesian dogs"]
  const KURI = ['hide_black', 'hide_white', 'hide_tan', 'hide_black', 'hide_white'];
  for (let k = 0; k < 18; k++) {
    const onTihi = k < 4, spots = [[hx + 4, hz + 21], [hx - 14, hz + 14], [hx + 18, hz - 6], [hx + 3, hz + 10]];
    const at = onTihi ? spots[k] : [-220 + rand() * 440, -140 + rand() * 300];
    if (!onTihi && (Math.hypot(at[0] - hx, at[1] - hz) < HILL.ditch + 8 || Math.hypot(at[0], at[1]) > RADIUS - 45 || !clear(at[0], at[1], 3))) continue;
    if (onTihi && P.some((p) => Math.hypot(p.at[0] - at[0], p.at[1] - at[1]) < 1.5)) continue;
    P.push({ t: 'animal', kind: 'dog', at, y: onTihi ? top : height(at[0], at[1]), rot: rand() * 6.28, mat: KURI[k % 5], seed: 900 + k });
  }
  let nf = 0;
  for (let k = 0; k < 600 && nf < 70; k++) {
    const x = -220 + rand() * 440, z = shoreZ(x) + 7 + rand() * 16;
    if (Math.hypot(x, z) > RADIUS - 45 || !clear(x, z, 5)) continue;
    E.push({ t: 'harakeke', at: [x, z], y: height(x, z), h: 1.5 + rand() * 0.8, seed: Math.floor(rand() * 1e5) }); taken.push([x, z]); nf++;
  }
  // ---- the hot ground: pools with their steam boxes, and women cooking at them ----------------
  VENTS.forEach(([x, z], k) => {
    if (inLake(x, z) || !clear(x, z, 4)) return;
    E.push({ t: 'ngawha', c: [x, z], y: height(x, z), r: 1.2 + 0.5 * rand(), yaw: rand() * 6.28, seed: 30 + k }); taken.push([x, z]);
    if (k % 2 === 0) { const at = [x + 2.6, z + 1.2]; woman(at, height(at[0], at[1]), face(at, [x, z]), { pose: 'squat', over: 'none' }); }
  });
  // ---- the household work of the kāinga: before each few houses the cooking place or the racks, the flax, the weaver, a man at his adze or net -----------
  const houses = v.houses.slice(1).filter((h) => Math.hypot(h.c[0] - hx, h.c[1] - hz) > HILL.ditch + 10 && Math.hypot(h.c[0], h.c[1]) < RADIUS - 60 && !inLake(h.c[0], h.c[1] - 12));
  const door = (h, d) => [h.c[0] - Math.sin(h.yaw) * (h.l / 2 + d), h.c[1] - Math.cos(h.yaw) * (h.l / 2 + d)];   // before the porch
  const gy = (p) => height(p[0], p[1]);
  // every house on the hill and below it: the dressing of its front (firewood, the cloak line, kete, gourds, adze, fish, windbreak)
  v.houses.slice(1).forEach((h, k) => {
    if (inLake(h.c[0], h.c[1] - 8) || Math.hypot(h.c[0], h.c[1]) > RADIUS - 48) return;
    const d = door(h, 0.25);
    E.push({ t: 'yard', c: d, y: gy(d), yaw: h.yaw, w: h.w, seed: 100 + k, items: 2 + (k % 3 === 0 ? 1 : 0) });
  });
  houses.forEach((h, k) => {
    const rot = h.yaw + Math.PI, at0 = door(h, 3.2);
    if (Math.hypot(at0[0], at0[1]) > RADIUS - 55 || !clear(at0[0], at0[1], 1.5)) return;
    if (k % 7 === 2) { const w = [at0[0] + Math.cos(h.yaw) * 1.4, at0[1] - Math.sin(h.yaw) * 1.4]; E.push({ t: 'weaving', at: w, y: gy(w), yaw: rot, seed: 50 + k }); const q = [w[0] - Math.sin(rot) * 1.5, w[1] - Math.cos(rot) * 1.5]; woman(q, gy(q), face(q, w), { pose: 'squat', over: 'none' }); }
    else if (k % 7 === 5) { const q = door(h, 2.6); man(q, gy(q), face(q, h.c), { pose: 'squat' }); }
    else if (k % 7 === 6) { const q = door(h, 2.2); woman(q, gy(q), face(q, h.c) + 0.4, { pose: 'sit' }); }
    else if (k % 7 === 3) { const q = door(h, 3.0); (k % 2 ? man : woman)(q, gy(q), rand() * 6.28, { pose: 'talk' }); const q2 = [q[0] + 0.8, q[1] + 0.3]; woman(q2, gy(q2), face(q2, q), {}); }
    // flax at the corner of the house, a hīnaki or two by the wall
    const hk = [h.c[0] + Math.cos(h.yaw) * (h.w / 2 + 1.6), h.c[1] - Math.sin(h.yaw) * (h.w / 2 + 1.6)];
    if (clear(hk[0], hk[1], 2)) E.push({ t: 'harakeke', at: hk, y: gy(hk), h: 1.4 + rand() * 0.7, seed: Math.floor(rand() * 1e5) });
    if (k % 3 === 0) { const hn = [hk[0] - Math.cos(h.yaw) * 1.2, hk[1] + Math.sin(h.yaw) * 1.2]; E.push({ t: 'hinaki', at: hn, y: gy(hn), yaw: rand() * 3, len: 1.0 + rand() * 0.3 }); }
  });
  // the terraces: a person at about every third door, a cooking place on each terrace, a dog or two
  const terr = v.houses.slice(1).filter((h) => Math.hypot(h.c[0] - hx, h.c[1] - hz) < HILL.foot - 4 && Math.hypot(h.c[0] - hx, h.c[1] - hz) > HILL.tihi + 4);
  terr.forEach((h, k) => {
    const at = door(h, 2.8 + (k % 2) * 0.6), a2 = [at[0] + Math.cos(h.yaw) * 0.9, at[1] - Math.sin(h.yaw) * 0.9];
    if (k % 3 === 0) (k % 2 ? woman : man)(at, h.y, face(at, h.c) + (rand() - 0.5) * 0.6, { pose: k % 4 === 0 ? 'squat' : 'stand', over: k % 2 ? 'none' : undefined });
    if (k % 9 === 4) woman(a2, h.y, face(a2, at), { pose: 'squat', over: 'none' });
    if (k % 13 === 6 && clear(door(h, 6.2)[0], door(h, 6.2)[1], 5.5)) { taken.push(door(h, 6.2)); E.push({ t: 'hangi', c: door(h, 6.2), y: h.y, yaw: h.yaw + Math.PI, seed: 300 + k }); }
    if (k % 17 === 8) P.push({ t: 'animal', kind: 'dog', at: a2, y: h.y, rot: rand() * 6.28, mat: KURI[k % 5], seed: 1000 + k });
  });
  // ---- the whānau yards: each compound's cooking place in the middle, its women and children, a man at work, the dogs --------------------
  v.compounds.forEach((c, k) => {
    const [cx, cz] = c.c;
    if (Math.hypot(cx, cz) > RADIUS - 56) return;
    E.push({ t: 'hangi', c: [cx, cz], y: gy([cx, cz]), yaw: rand() * 6.28, seed: 200 + k });
    const ring = (n, r0, f) => { for (let i = 0; i < n; i++) { const a = rand() * 6.28, r = r0 + rand() * 1.4, at = [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; if (inLake(at[0], at[1])) continue; f(at, i); } };
    ring(2, 3.6, (at) => woman(at, gy(at), face(at, [cx, cz]), { pose: 'squat', over: 'none' }));
    ring(2, 5.6, (at, i) => P.push({ t: 'figure', at, y: gy(at), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: CLOAK[i], cloth2: 'cloth_brown', over: 'none', skin: skin(), hat: 'none', feet: 'bare', hair: 'short', beard: false, h: 1.05, pose: 'stand' }));
    ring(1, 6.2, (at) => man(at, gy(at), face(at, [cx, cz]), { pose: 'squat' }));
    const kd = [cx + (rand() - 0.5) * 8, cz + (rand() - 0.5) * 8];
    if (clear(kd[0], kd[1], 1)) P.push({ t: 'animal', kind: 'dog', at: kd, y: gy(kd), rot: rand() * 6.28, mat: KURI[k % 5], seed: 960 + k });
    // a cabbage tree or two by the compound, a tree fern or two behind
    for (let q = 0; q < 2; q++) { const a = rand() * 6.28, r = c.r + 11 + rand() * 6, at = [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; if (clear(at[0], at[1], 3) && !inLake(at[0], at[1] - 10) && Math.hypot(at[0], at[1]) < RADIUS - 50) { E.push({ t: q ? 'ponga' : 'tikouka', at, y: gy(at), h: q ? 2.5 + rand() * 2.5 : 4 + rand() * 3, seed: Math.floor(rand() * 1e5) }); taken.push(at); } }
  });
  // ---- trees: cabbage trees along the shore, tree ferns on the banks and the scarps, a grove behind the hill -----------------------------
  for (let k = 0, n = 0; k < 800 && n < 60; k++) {
    const x = -250 + rand() * 500, z = shoreZ(x) + 6 + rand() * 22;
    if (Math.hypot(x, z) > RADIUS - 48 || !clear(x, z, 4) || inLake(x, z - 2)) continue;
    E.push({ t: 'tikouka', at: [x, z], y: height(x, z), h: 3.5 + rand() * 3.5, seed: Math.floor(rand() * 1e5) }); taken.push([x, z]); n++;
  }
  for (let k = 0, n = 0; k < 600 && n < 70; k++) {
    const a = rand() * 6.28, r = HILL.ditch + 6 + rand() * 30, x = hx + Math.cos(a) * r, z = hz + Math.sin(a) * r;
    if (Math.hypot(x, z) > RADIUS - 48 || Math.abs(x - PATH.x) < PATH.w + 3 || inLake(x, z - 6) || !clear(x, z, 3.5) || inGarden(x, z)) continue;
    E.push({ t: 'ponga', at: [x, z], y: height(x, z), h: 2 + rand() * 3.5, seed: Math.floor(rand() * 1e5) }); taken.push([x, z]); n++;
  }
  // ---- the way in, at the gardens' end: carved posts on either side of the path and the gardeners at their plots ------------------------
  for (const [dx, zz] of [[-4.5, 150], [4.5, 150], [-4.5, 124], [4.5, 124]]) { const at = [dx, zz]; E.push({ t: 'pou', at, y: gy(at), h: 2.2 + (zz === 124 ? 0.4 : 0), yaw: dx < 0 ? 0.35 : -0.35 }); taken.push(at); }
  for (const [px, pz] of [[hxm - 9, 18], [hxm + 9, 18], [hxm - 9, 31], [hxm + 9, 31]]) E.push({ t: 'pou', at: [px, pz], y: top, h: 2.6, yaw: Math.PI });   // the marae ātea's carved posts
  const lanes = []; for (let x0 = -116; x0 < 116; x0 += 21) lanes.push(x0 + 19.5);
  let gk = 0;
  for (const lx of lanes) for (const zz of [158 + rand() * 6, 188 + rand() * 8, 228 + rand() * 10]) {
    if (Math.abs(lx) < PATH.w + 4 || !inGarden(lx, zz) || (gk++ % 2 && zz > 200)) continue;
    const at = [lx + (rand() - 0.5) * 1.2, zz], toPlot = lx > 0 ? -1 : 1;
    (rand() < 0.65 ? woman : man)(at, gy(at), Math.PI / 2 * toPlot + (rand() - 0.5) * 0.5, { pose: rand() < 0.6 ? 'squat' : 'stand', over: 'none' });
  }
  // by the path as one arrives: two boys with a kurī, a man with a kete of kūmara resting
  for (const [px, pz, o] of [[5.2, 156, { pose: 'stand' }], [-5.4, 163, { pose: 'squat' }], [5.6, 172, { pose: 'sit' }]]) { const at = [px, pz]; man(at, gy(at), face(at, [0, 150]) + 0.4, o); }
  P.push({ t: 'animal', kind: 'dog', at: [4.2, 158.5], y: gy([4.2, 158.5]), rot: 1.2, mat: 'hide_white', seed: 990 });
  // ---- the gardens' corridor (the clear way through the plots, x −11 … 10): the gardeners' huts facing the path, a rack, a store, cabbage trees lining the way ----
  [[-8.2, 186, -Math.PI / 2], [8.2, 211, Math.PI / 2], [-8.4, 243, -Math.PI / 2], [8.4, 276, Math.PI / 2]].forEach(([x, z, yaw], k) => {
    E.push({ t: 'whare', carved: false, c: [x, z], yaw, w: 2.9 + (k % 2) * 0.4, l: 4.2, h: 1.1, y: height(x, z), rank: 0 });
    const d = [x - Math.sin(yaw) * 2.35, z - Math.cos(yaw) * 2.35];
    E.push({ t: 'yard', c: d, y: gy(d), yaw, w: 3.4, seed: 700 + k, items: 2 });
    const q = [x - Math.sin(yaw) * 4.2, z - Math.cos(yaw) * 4.2 + 1.0];
    (k % 2 ? man : woman)(q, gy(q), face(q, [x, z]) + 0.3, { pose: k % 2 ? 'squat' : 'sit', over: 'none' });
    taken.push([x, z]);
  });
  { const a = [-6, 166], b = [-2.6, 166]; E.push({ t: 'whata', a, b, y: gy(a), h: 1.9 }); }
  { const at = [7.6, 168]; E.push({ t: 'pataka', c: at, y: gy(at), yaw: -Math.PI / 2 }); taken.push(at); }
  for (let z = 176; z < RADIUS - 52; z += 21 + rand() * 6) for (const sx of [-1, 1]) {
    const at = [sx * (9.6 + rand() * 0.8), z + rand() * 5];
    if (Math.hypot(at[0], at[1]) < RADIUS - 52 && clear(at[0], at[1], 3)) { E.push({ t: 'tikouka', at, y: gy(at), h: 3.2 + rand() * 3, seed: Math.floor(rand() * 1e5) }); taken.push(at); }
  }
  // tree ferns and flax on the terraces' scarps (the steep banks between the terraces)
  HILL.rings.slice(1).forEach(([r0], ri) => {
    for (let k = 0; k < 26; k++) {
      const a = rand() * 6.28, r = r0 + 0.2 + rand() * 1.8, x = hx + Math.cos(a) * r, z = hz + Math.sin(a) * r;
      if (Math.abs(x - PATH.x) < PATH.w + 2 && z > hz) continue;
      E.push(k % 3 ? { t: 'harakeke', at: [x, z], y: height(x, z), h: 1.1 + rand() * 0.6, seed: Math.floor(rand() * 1e5) } : { t: 'ponga', at: [x, z], y: height(x, z), h: 1.6 + rand() * 1.8, seed: Math.floor(rand() * 1e5) });
    }
    void ri;
  });
  // ---- the lake: fishing canoes with their crews, a waka taua paddling in ---------------------------------------------------------
  const seat = (wx, wz, yw, u, w) => [wx + Math.sin(yw) * u + Math.cos(yw) * w, wz + Math.cos(yw) * u - Math.sin(yw) * w];
  [[-70, 26, 0.5, 6.5, 2], [95, 40, -0.4, 6, 2], [-190, 34, 0.2, 5.5, 2], [40, 70, 3.0, 14, 8]].forEach(([x, dz, yw, l, crew], q) => {
    const z = shoreZ(x) - dz; if (Math.hypot(x, z) > RADIUS - 40) return;
    E.push({ t: 'waka', c: [x, z], y: LAKE.level - 0.22, yaw: yw, l, seed: q });
    for (let i = 0; i < crew; i++) {
      const u = -l * 0.3 + i * (l * 0.6 / Math.max(1, crew - 1)) * (crew > 3 ? 1 : 0.85) + (crew > 3 ? 0 : 0.4), at = seat(x, z, yw, u, 0), sk = skin();
      P.push({ t: 'figure', at, y: LAKE.level - 0.05, rot: yw + (q === 3 ? 0 : (i % 2 ? 0.5 : -0.5)), seed: Math.floor(rand() * 1e9), dress: 'tunic', cloth: sk, cloth2: 'cloth_brown', over: 'belt', skin: sk, hat: 'none', feet: 'bare', hair: 'bun', beard: false, pose: 'sit' });
    }
  });
  // ---- the summit made busy (docs/settlements/maori.md §4f): a carver at his pou, cloaks airing, children at play, a second pātaka, trees at the rim, throwing stones and spears at every gate ----
  { // the carver's place east of the chief's pātaka: the log, a man kneeling at the head with his adze, an old man watching, a boy with the chips
    const c = [hx + 17, hz - 2];
    E.push({ t: 'whakairo', c, y: top, yaw: 0.35, seed: 41 });
    const hd = [c[0] + Math.sin(0.35) * 1.6 + 0.9, c[1] + Math.cos(0.35) * 1.6];
    man(hd, top, face(hd, [c[0] + Math.sin(0.35) * 1.4, c[1] + Math.cos(0.35) * 1.4]), { pose: 'squat', over: 'none' });
    const w2 = [c[0] - 1.8, c[1] + 2.6]; man(w2, top, face(w2, c), { pose: 'stand', beard: true, cloth: 'hide_brown' });
    const b = [c[0] + 2.4, c[1] - 1.2]; person(b, top, face(b, c), { hair: 'short', h: 1.05, over: 'none', pose: 'squat' });
  }
  E.push({ t: 'kakahu', a: [hx - 19.5, hz - 4], b: [hx - 16.2, hz - 4.6], y: top });                    // cloaks airing on the west
  { const a = [hx - 17.8, hz - 2.4]; woman(a, top, face(a, [hx - 17.8, hz - 4.3]), { pose: 'stand', over: 'none' }); }
  // children at play between the marae and the cooking place: a ring squatting at a string game, two running, a girl with a kete
  for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28, at = [hx + 5.5 + Math.cos(a) * 0.8, hz + 14 + Math.sin(a) * 0.8]; person(at, top, a + Math.PI + 0.3, { hair: k % 2 ? 'short' : 'long', h: 0.95 + 0.1 * (k % 3) * 0.5, over: 'none', pose: 'squat', beard: false }); }
  for (const [px, pz, r] of [[hx + 9, hz + 19, 2.2], [hx + 2, hz + 24, -1.0]]) person([px, pz], top, r, { hair: 'short', h: 1.0, over: 'none', pose: 'stand', cloth: 'cloth_ochre' });
  // a second and a third store, a rack for the chief's cloaks; the second pātaka carved like the first
  for (const [x, z, yaw] of [[hx - 17, hz - 11, Math.PI], [hx + 16, hz - 12, Math.PI]]) E.push({ t: 'pataka', c: [x, z], y: top, yaw });
  // cabbage trees and tree ferns at the summit's rim, inside the palisade, and a pair at the gate
  for (const [a, t] of [[-0.9, 'tikouka'], [0.15, 'ponga'], [0.9, 'tikouka'], [2.2, 'ponga'], [3.0, 'tikouka'], [4.1, 'ponga'], [5.1, 'tikouka']]) {
    const at = [hx + Math.cos(a) * 20.5, hz + Math.sin(a) * 20.5];
    if (Math.abs(at[0]) < 5 && at[1] > hz) continue;
    E.push({ t, at, y: top, h: t === 'tikouka' ? 3.6 + rand() * 1.4 : 2 + rand() * 1.2, seed: Math.floor(rand() * 1e5) });
  }
  // at each gate of the climbing path: heaps of throwing stones and a rack of spears on the inner side, a sentry at the upper gates
  [HILL.tihi - 1.5, ...HILL.rings.map(([, r1]) => r1 - 2), HILL.ditch + 5].forEach((r, k) => {
    const gz = hz + r, gyv = height(PATH.x, gz);
    for (const sx of [-1, 1]) { const at = [sx * 3.4, gz + (k === 0 ? 2.6 : -2.4)]; E.push({ t: 'kamaka', at, y: height(at[0], at[1]), r: 0.8, yaw: sx * 0.5, spears: sx > 0 ? 5 : 0 }); }
    if (k < 4) { const at = [-2.9, gz + 3.2]; warrior(at, height(at[0], at[1]), face(at, [0, gz + 9])); }
    void gyv;
  });
  // the shared street life (src/objects/life.js) keeps its figures off what it sees as footprints — a `c` with a radius `r`,
  // a rectangle or a line: give every house, store, oven, tree and post one, and mark the way in and the marae ātea as kept clear
  const RAD = { whare: (e) => e.l / 2 + 0.7, pataka: () => 2.2, rua: () => 2.4, hangi: () => 2.8, waka_build: () => 5, waka: (e) => (e.l ?? 10) / 2, harakeke: () => 0.5, hinaki: () => 0.4, tikouka: () => 0.6, ponga: () => 0.5, pou: () => 0.4, yard: () => 1.4, weaving: () => 1.2, whakairo: () => 2.4, kamaka: (e) => (e.r ?? 0.9) + 0.4 };
  for (const e of E) if (RAD[e.t] && !e.r) { const at = e.c ?? e.at; if (!at) continue; e.r = RAD[e.t](e); if (!e.c) e.c = at; }
  E.push({ t: 'trim', rect: [-2.6, HILL.c[1] + HILL.ditch, 2.6, RADIUS - 20] });
  E.push({ t: 'trim', rect: [hxm - 10, 11, hxm + 10, 33] });
  return [plan('maori-kainga', 'maori', E), plan('maori-people', 'life', P)];
}

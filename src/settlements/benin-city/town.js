// The town of Benin (docs/settlements/benin-city.md §2, §4, §5): the Iya's double palisade and its gates, the guild yards on their lane
// with the casters at work, the Oba market with its stalls and its crowd, the pages and guards at the palace gate, and the compounds
// in rows along the streets.
import { lodTiles } from '../lod.js';
import { frame } from '../../styles/greek/agora.js';
import { RADIUS, GATES, GATE_W, MARKET, YARDS, GATE_X, GREAT, CROSS, SQUARE, ALLEYS_X, crest, height, lots, depth, inRect, onStreet } from './layout.js';

const base = (id, elements, extra = {}) => ({ id, style: 'benin', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [GATE_X, 12], facing: 'n' }, ...extra });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));

/** The palisade along the crest in chords, broken at the gates, and the gates. */
function iya() {
  const E = [], step = 0.052;
  for (let a = 0; a < Math.PI * 2 - 1e-6; a += step) {
    const pt = (t) => { const r = crest(t); return [Math.cos(t) * r, Math.sin(t) * r]; };
    const p = pt(a), q = pt(a + step), m = pt(a + step / 2);
    if (GATES.some((g) => Math.hypot(g.at[0] - m[0], g.at[1] - m[1]) < GATE_W + 4.2)) continue;
    E.push({ t: 'benin_posts', a: p, b: q, ys: [height(p[0], p[1]), height(m[0], m[1]), height(q[0], q[1])], at: m });
  }
  for (const g of GATES) E.push({ t: 'benin_gate', at: g.at, th: Math.atan2(g.dir[1], g.dir[0]), w: GATE_W - 0.4, y: height(g.at[0], g.at[1]), seed: Math.round(g.at[0]) });
  return lodTiles('benin-iya', 'benin', E, { R: RADIUS });
}

// ── the people ──
const CL = ['cloth_white', 'cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_blue', 'cloth_green', 'cloth_white', 'cloth_maroon'];
function folk(rand) {
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const P = [];
  const base = () => ({ seed: Math.floor(rand() * 1e9), skin: 'skin_dark', hair: 'short', hairMat: 'hair_dark', feet: 'bare' });
  const man = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, ...base(), dress: 'wrap', top: 'bare', cloth: pick(CL), cloth2: pick(CL), hat: 'none', over: 'none', ...o });
  const woman = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, ...base(), dress: 'wrap', cloth: pick(CL), cloth2: pick(CL), hat: 'none', hair: 'bun', over: 'shawl', ...o });
  const chief = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, ...base(), dress: 'wrap', top: 'bare', cloth: 'cloth_white', cloth2: 'cloth_red', over: 'collar', hat: 'cap', hatMat: 'cloth_red', beard: false, ...o });
  return { P, man, woman, chief, pick };
}
function yardPeople(F) {
  const { P, man, woman, pick } = F; void woman;
  void P;
  const rand = rng(77);
  for (const yd of YARDS) {
    const fr = frame(yd.rect, yd.front), { D, L } = fr;
    const at = (u, v) => fr.P(u, v);
    if (yd.kind === 'cast') {
      const f = at(4.2, D - 9), c = at(4.2, D - 7.6), b = at(2.9, D - 8.6), b2 = at(5.5, D - 8.6);
      man(c, 0.05, face(c, f), { pose: 'squat', dress: 'loincloth' });
      man(b, 0.05, face(b, f), { pose: 'squat', dress: 'loincloth', h: 1.5 });
      if (rand() < 0.7) man(b2, 0.05, face(b2, f), { pose: 'squat', dress: 'loincloth' });
      const t = at(L - 3.7, D - 5.2); man(t, 0.05, face(t, at(L - 3.7, D - 3.4)), { pose: 'stand' });
    } else if (yd.kind === 'carve') {
      const b = at(L / 2, D - 5.6); man(b, 0.05, face(b, at(L / 2, D - 3.8)), { pose: 'sit_ground', dress: 'wrap' });
    } else {
      const w = at(4, D - 6.0); woman(w, 0.05, face(w, at(4, D - 4.2)), { pose: 'sit_ground' });
    }
    const v = at(L / 2 + (rand() - 0.5) * 6, 5 + rand() * 4);
    (rand() < 0.5 ? man : woman)(v, 0.05, rand() * 6.28, { pose: rand() < 0.4 ? 'talk' : 'stand' });
  }
  void pick;
}
function marketFolk(F) {
  const { man, woman, chief, pick } = F, rand = rng(1612);
  for (let k = 0; k < 46; k++) {
    const x = MARKET[0] + 6 + rand() * (MARKET[2] - MARKET[0] - 12), z = MARKET[1] + 8 + rand() * (MARKET[3] - MARKET[1] - 16), at = [x, z], rot = rand() * 6.28;
    const r = rand();
    if (r < 0.52) woman(at, 0, rot, { carry: rand() < 0.4 ? pick(['pot', 'basket']) : 'none', pose: rand() < 0.3 ? 'talk' : 'stand' });
    else if (r < 0.9) man(at, 0, rot, { pose: rand() < 0.3 ? 'talk' : 'stand', carry: rand() < 0.15 ? 'pole' : 'none' });
    else chief(at, 0, rot, { pose: 'stand' });
  }
}
function palaceFolk(F) {
  const { man, chief, pick } = F, rand = rng(5);
  for (const s of [-1, 1]) man([GATE_X + s * 3.6, -3], 0.12, face([GATE_X + s * 3.6, -3], [GATE_X + s * 3.6, 8]), { dress: 'wrap', cloth: 'cloth_red', cloth2: 'cloth_white', carry: 'staff', len: 1.9, over: 'collar', pose: 'stand' });
  for (let k = 0; k < 7; k++) { const at = [-120 + rand() * 108, -10 - rand() * 50]; man(at, 0.03, rand() * 6.28, { cloth: pick(['cloth_white', 'cloth_red']), pose: rand() < 0.4 ? 'talk' : 'stand', over: 'collar' }); }
  for (const s of [-1, 1]) chief([-65 + s * 4.5, -74.5], 0.9, 0, { pose: 'stand', carry: 'staff', len: 1.7 });
  chief([-65, -72.2], 1.45 - 0.55, 0, { pose: 'sit', cloth: 'cloth_white', cloth2: 'cloth_red', hat: 'cap' });
}

// ── the life of the streets (docs/settlements/benin-city.md §10): near the arrival and the great street at full strength, thinner beyond ──
const ARR = [-65, 24];
const lookOut = (F) => Math.atan2(-F.out[0], -F.out[1]);
/** The clay seat under a verandah or beside a trading front, if the house has one: { at: [x, z], y of the floor, rot (to the street) }. */
function seatOf(l) {
  if (l.kind !== 'porch' && l.kind !== 'trade') return null;
  const F = frame(l.rect, l.front), L = F.L, dw = 2.4, wide = l.kind === 'trade' ? Math.min(L - 3, 6.4) : dw, dc = l.kind === 'trade' ? L / 2 : l.du + dw / 2;
  const a = 0.9, b = dc - wide / 2 - 0.5;
  if (b - a <= 2.2) return null;
  const u = (a + 0.3 + Math.min(b - 0.3, a + 3.6)) / 2;
  return { at: F.P(u, -0.52), y: 0.12, rot: lookOut(F), F, door: F.P(l.kind === 'trade' ? L / 2 : l.du + dw / 2, -1.8) };
}
function streetLife(F) {
  const { P, woman, man, pick } = F, rand = rng(1604), L = [];
  const Y = (x, z) => height(x, z);
  const near = (x, z, d) => Math.hypot(x - ARR[0], z - ARR[1]) < d;
  // the great street's verges: goods on mats with the seller behind, a basket of fowls, a goat tethered
  const mats = (z, rot, x0, x1, step) => {
    for (let x = x0; x < x1; x += step * (0.8 + rand() * 0.5)) {
      if (inRect(SQUARE, x, z, 2) || depth(x, z) < 22 || Math.abs(x - 98) < 16) continue;
      const g = pick([['heap', 'baskets'], ['pottery', 'baskets'], ['bolts', 'baskets'], ['spice', 'heap'], ['heap', 'pottery'], ['fish', 'heap']]);
      L.push({ t: 'goods_mat', at: [x, z], y: 0, rot, goods: g, seed: Math.floor(rand() * 1e9), produce: ['cloth_red', 'cloth_ochre', 'cloth_green'], spices: ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_brown'] });
      const sx = x + Math.sin(rot) * 0.0, sz = z + (rot ? 0.75 : -0.75);
      woman([sx, sz], 0, rot ? 0 : Math.PI, { pose: 'sit_ground', dress: 'wrap', carry: 'none' });
      if (rand() < 0.35) L.push({ t: 'chickens', at: [x + 1.3, z + (rot ? 0.3 : -0.3)], y: 0, rot: rand() * 6.28, n: 3, seed: Math.floor(rand() * 1e9) });
    }
  };
  mats(GREAT[3] - 1.6, Math.PI, -250, 250, 15);
  mats(GREAT[1] + 1.8, 0, -250, 250, 17);
  // the verandahs and the clay seats: someone sits there, a woman sells at the door, the hens in the lane
  for (const l of lots()) {
    const c = [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
    if (!near(c[0], c[1], 200) && rand() > 0.35) continue;
    const st = seatOf(l);
    if (st && rand() < 0.75) (rand() < 0.55 ? man : woman)(st.at, st.y, st.rot, { pose: 'sit', carry: 'none' });
    const Fr = frame(l.rect, l.front), dc = l.du + 1.2;
    if (rand() < 0.5) { const p = Fr.P(dc + (rand() < 0.5 ? -2.6 : 2.6), -2.3 - rand() * 2.2); L.push({ t: 'chickens', at: p, y: 0, rot: rand() * 6.28, n: 3 + Math.floor(rand() * 3), seed: Math.floor(rand() * 1e9) }); }
    if (rand() < 0.28) { const p = Fr.P(dc + (rand() < 0.5 ? -4 : 4), -2.6); L.push({ t: 'animal', kind: 'goat', at: p, y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) }); }
    if (rand() < 0.12) { const p = Fr.P(dc, -2.0); L.push({ t: 'animal', kind: 'dog', at: p, y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) }); }
    if (rand() < 0.3) { const p = Fr.P(dc + 1.4, -1.6); woman(p, 0, lookOut(Fr) + Math.PI, { pose: 'talk', carry: pick(['basket', 'pot', 'none']) }); const q = Fr.P(dc + 2.4, -1.9); man(q, 0, lookOut(Fr) + 2.6, { pose: 'talk', carry: 'none' }); }
    if (rand() < 0.3) { const p = Fr.P(dc - 1.5, -2.4); P2.push({ t: 'figure', at: p, y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), skin: 'skin_dark', hair: 'short', hairMat: 'hair_dark', feet: 'bare', dress: 'loincloth', top: 'bare', cloth: pick(CL), cloth2: pick(CL), hat: 'none', over: 'none', pose: 'squat', h: 0.62 }); }
  }
  return L;
}
/** The king's square at the arrival: petitioners and chiefs on the clay seats, the drummer at the log drum, groups in talk, women with pots, children, fowls and goats, sellers on mats along the street side. */
function squareFolk(F, out) {
  const { man, woman, chief, pick } = F, rand = rng(2024), [x0, z0, x1, z1] = SQUARE, cx = (x0 + x1) / 2;
  const clear = (x, z) => Math.hypot(x - ARR[0], z - ARR[1]) > 4 && !(Math.abs(x - ARR[0]) < 4 && z > ARR[1] - 8 && z < ARR[1] + 1);
  const put = (f, at, rot, o) => { if (clear(at[0], at[1])) f(at, 0, rot, o); };
  // the north row of seats faces the middle (south), the south row faces north; two or three sit on each
  for (let k = 0; k < 5; k++) {
    const x = x0 + 12 + k * (x1 - x0 - 24) / 4;
    for (let j = 0; j < 2 + (k % 2); j++) {
      const at = [x - 1.3 + j * 1.3 + (rand() - 0.5) * 0.2, z0 + 3.55];
      put(j === 0 && k % 2 === 0 ? chief : rand() < 0.4 ? woman : man, at, Math.PI + (rand() - 0.5) * 0.3, { pose: 'sit', carry: 'none' });
    }
  }
  for (let k = 0; k < 4; k++) {
    const x = x0 + 18 + k * (x1 - x0 - 36) / 3;
    for (let j = 0; j < 2; j++) put(rand() < 0.5 ? woman : man, [x - 0.8 + j * 1.6, z1 - 3.65], (rand() - 0.5) * 0.3, { pose: 'sit', carry: 'none' });
  }
  // the drummer at the log drum, a boy at the bells
  put(man, [cx + 12, z0 + 13.4], 0, { pose: 'stand', cloth: 'cloth_red', over: 'collar' });
  put(man, [cx + 16.6, z0 + 13.0], -Math.PI / 2, { dress: 'loincloth', h: 0.7, pose: 'stand' });
  // groups in talk, strollers and women with pots on the open ground, at 6–30 m from the gate-side arrival
  for (let k = 0; k < 26; k++) {
    const x = x0 + 8 + rand() * (x1 - x0 - 16), z = z0 + 8 + rand() * (z1 - z0 - 16), r = rand();
    if (r < 0.4) put(woman, [x, z], rand() * 6.28, { pose: rand() < 0.4 ? 'talk' : 'stand', carry: pick(['pot', 'basket', 'none']) });
    else if (r < 0.85) { put(man, [x, z], rand() * 6.28, { pose: rand() < 0.5 ? 'talk' : 'stand' }); put(man, [x + 1.1, z - 0.7], rand() * 6.28, { pose: 'talk', cloth: pick(CL) }); }
    else put(chief, [x, z], rand() * 6.28, { pose: 'stand' });
  }
  for (let k = 0; k < 4; k++) { const x = x0 + 14 + rand() * (x1 - x0 - 28), z = z0 + 14 + rand() * 16; put(man, [x, z], rand() * 6.28, { dress: 'loincloth', h: 0.64, pose: 'stand', carry: 'none' }); }
  // fowls and goats, a dog by the seats
  for (let k = 0; k < 7; k++) { const at = [x0 + 10 + rand() * (x1 - x0 - 20), z0 + 7 + rand() * 26]; if (clear(at[0], at[1])) out.push({ t: 'chickens', at, y: 0, rot: rand() * 6.28, n: 3 + Math.floor(rand() * 3), seed: Math.floor(rand() * 1e9) }); }
  for (let k = 0; k < 4; k++) { const at = [x0 + 15 + rand() * (x1 - x0 - 30), z0 + 10 + rand() * 24]; if (clear(at[0], at[1])) out.push({ t: 'animal', kind: pick(['goat', 'goat', 'dog']), at, y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) }); }
  // sellers on mats on the street side of the square, goods before them
  for (let x = x0 + 10; x < x1 - 8; x += 9 + rand() * 4) {
    if (!clear(x, z1 - 7)) continue;
    const g = pick([['pottery', 'baskets'], ['bolts', 'baskets'], ['spice', 'heap'], ['melons', 'greens'], ['fish', 'baskets']]);
    out.push({ t: 'goods_mat', at: [x, z1 - 7.5], y: 0, rot: 0, goods: g, seed: Math.floor(rand() * 1e9), produce: ['cloth_red', 'cloth_ochre', 'cloth_green'], spices: ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_brown'] });
    woman([x, z1 - 8.3], 0, 0, { pose: 'sit_ground', dress: 'wrap' });
  }
}
const P2 = [];
/** The gates of the Iya: two guards with staves, travellers with loads waiting to be let in. */
function gateFolk(F) {
  const { man, woman, pick } = F, rand = rng(881);
  for (const g of GATES) {
    const [dx, dz] = g.dir, lx = -dz, lz = dx, at = (a, b) => [g.at[0] - dx * a + lx * b, g.at[1] - dz * a + lz * b];
    for (const s of [-1, 1]) { const p = at(2.2, s * 3.2), y = height(p[0], p[1]); man(p, y, Math.atan2(-dx, -dz), { carry: 'staff', len: 1.9, over: 'collar', cloth: 'cloth_red', cloth2: 'cloth_white', pose: 'stand' }); }
    for (let k = 0; k < 3; k++) { const p = at(-3 - k * 1.8, (k % 2 ? -1 : 1) * (1 + rand() * 1.4)), y = height(p[0], p[1]); (k === 1 ? woman : man)(p, y, Math.atan2(dx, dz) + (rand() - 0.5) * 0.8, { carry: pick(['headload', 'basket', 'pole']), pose: 'stand' }); }
  }
}
export async function town() {
  P2.length = 0;
  const F = folk(rng(1600));
  yardPeople(F); marketFolk(F); palaceFolk(F); gateFolk(F);
  const lifeEls = streetLife(F);
  squareFolk(F, lifeEls);
  { // the open floor of the Oba market south of the stalls: sellers on their mats, fowls and goats, a shade of baskets
    const rand = rng(404), { woman, man, pick } = F;
    for (const z of [17, 22.5, 28, 32.5]) for (let x = MARKET[0] + 6; x < MARKET[2] - 5; x += 4.3 + rand() * 1.4) {
      if (rand() < 0.3) continue;
      const g = pick([['heap', 'baskets'], ['pottery', 'baskets'], ['bolts', 'heap'], ['spice', 'heap'], ['melons', 'greens'], ['fish', 'baskets']]);
      lifeEls.push({ t: 'goods_mat', at: [x, z], y: 0, rot: Math.PI, goods: g, seed: Math.floor(rand() * 1e9), produce: ['cloth_red', 'cloth_ochre', 'cloth_green'], spices: ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_brown'] });
      (rand() < 0.75 ? woman : man)([x, z + 0.8], 0, 0, { pose: 'sit_ground', dress: 'wrap' });
      const r = rand();
      if (r < 0.3) lifeEls.push({ t: 'chickens', at: [x + 1.5, z + 0.3], y: 0, rot: rand() * 6.28, n: 4, seed: Math.floor(rand() * 1e9) });
      else if (r < 0.45) lifeEls.push({ t: 'animal', kind: 'goat', at: [x + 1.5, z + 0.4], y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
    }
  }
  const plans = [...iya()];
  // the guild yards
  const ye = YARDS.map((y) => ({ t: 'caster_yard', ...y }));
  plans.push(...lodTiles('benin-yards', 'benin', ye, { R: RADIUS }));
  // the market: stalls in rows facing aisles
  const rand = rng(88), st = [];
  for (const zc of [-82, -52, -22, 8]) for (const [z0, front] of [[zc - 4, 's'], [zc + 1.6, 'n']]) for (let x = MARKET[0] + 6; x + 3 < MARKET[2] - 4; x += 4.4) {
    if (rand() < 0.18) continue;
    st.push({ t: 'benin_stall', rect: [x, z0, x + 3, z0 + 2.4], front, seed: Math.floor(rand() * 1e6) });
  }
  plans.push(...lodTiles('benin-market', 'benin', st, { R: RADIUS }));

  // the street furniture: lamps along the great and the cross streets, the king's square, the firewood and pots at the lane mouths
  {
    const st = [], ok = (x, z) => depth(x, z) > 20 && !inRect(SQUARE, x, z, 3) && !inRect(MARKET, x, z, 2);
    for (const z of [GREAT[1] + 2.0, GREAT[3] - 2.0]) for (let x = -250; x < 250; x += 36) if (ok(x, z) && !ALLEYS_X.some((a) => Math.abs(x - a) < 6) && Math.abs(x - CROSS[0] - 12) > 14) st.push({ t: 'benin_lamp', at: [x + (z < 57 ? 0 : 18), z], y: 0, seed: Math.round(x) });
    for (const x of [CROSS[0] + 2, CROSS[2] - 2]) for (let z = -230; z < 230; z += 40) if (ok(x, z) && !(z > GREAT[1] - 8 && z < GREAT[3] + 8)) st.push({ t: 'benin_lamp', at: [x, z + 12], y: 0, seed: z });
    st.push({ t: 'benin_square', rect: SQUARE, seed: 5 });
    for (const a of ALLEYS_X) for (const [z, dz] of [[GREAT[3] - 1.2, 1], [GREAT[1] + 1.2, -1]]) if (ok(a, z) && depth(a, z) > 26) st.push({ t: 'benin_mouth', at: [a + 5.6, z], along: [1, 0], seed: Math.round(a + z) });
    plans.push(...lodTiles('benin-street', 'benin', st, { R: RADIUS }));
  }
  plans.push({ ...base('benin-people', [...F.P, ...P2]), style: 'life' });
  plans.push({ ...base('benin-street-life', lifeEls), style: 'life' });
  const els = lots().map((l) => ({ t: 'benin_house', rect: l.rect, seed: l.seed, y: l.y, front: l.front, chief: l.chief, kind: l.kind, du: l.du }));
  plans.push(...lodTiles('benin-houses', 'benin', els, { R: RADIUS }));
  return plans;
}

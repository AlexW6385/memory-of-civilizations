// The town of Benin (docs/settlements/benin-city.md §2, §4, §5): the Iya's double palisade and its gates, the guild yards on their lane
// with the casters at work, the Oba market with its stalls and its crowd, the pages and guards at the palace gate, and the compounds
// in rows along the streets.
import { lodTiles } from '../lod.js';
import { frame } from '../../styles/greek/agora.js';
import { RADIUS, GATES, GATE_W, MARKET, YARDS, GATE_X, crest, height, lots } from './layout.js';

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
export async function town() {
  const F = folk(rng(1600));
  yardPeople(F); marketFolk(F); palaceFolk(F);
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
  plans.push({ ...base('benin-people', F.P), style: 'life' });
  const els = lots().map((l) => ({ t: 'benin_house', rect: l.rect, seed: l.seed, y: l.y, front: l.front, chief: l.chief }));
  plans.push(...lodTiles('benin-houses', 'benin', els, { R: RADIUS }));
  return plans;
}

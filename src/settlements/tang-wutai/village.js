// The village of Mount Wutai's valley (docs/settlements/tang-wutai.md §5): walled yards on a lane grid, each with its
// house at the back (flat earth roof, single-pitch roof or brick-arched), often a side wing, the yard's gate on the
// lane; a well and a stone roller mill on the green; the goods and animals of the yards (plan of the `life` style).
// Elements of the chinese style (src/styles/chinese/village.js). Pure data from layout.js.

import { lots, height, GREEN, GATE_X } from './layout.js';
import { frame, dirOf } from '../../styles/chinese/village.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const g4 = (r) => [height(r[0], r[1]), height(r[2], r[1]), height(r[0], r[3]), height(r[2], r[3])];
const gh = (x, z) => height(x, z);

let BUILT = null;
/** { chinese: [elements], life: [elements], doors: [[x, z]] } for the whole village (computed once). */
export function village() {
  if (BUILT) return BUILT;
  const C = [], Lf = [], smoke = [];
  const all = lots();
  // the open houses: the three yards nearest the gate on the main lane's two sides, an inn first
  const near = [...all].filter((l) => (l.rect[2] - l.rect[0]) >= 13).sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2 + 76, (a.rect[1] + a.rect[3]) / 2) - Math.hypot((b.rect[0] + b.rect[2]) / 2 + 76, (b.rect[1] + b.rect[3]) / 2)).slice(0, 3);
  for (const l of all) {
    const rand = rng(l.seed), fr = frame(l.rect, l.front), { L, D, P, R } = fr, open = near.includes(l);
    const dist = Math.hypot((l.rect[0] + l.rect[2]) / 2 + 80, (l.rect[1] + l.rect[3]) / 2);
    // the gate on the lane side, away from the house's front door
    const gu = L * (0.22 + rand() * 0.2) + (rand() < 0.5 ? L * 0.38 : 0);
    C.push({ t: 'wutai_yard', rect: l.rect, front: l.front, hc: g4(l.rect), gate: [gu, 2.2], seed: l.seed, wall: rand() < 0.6 ? 'earth_wall' : 'mud_plaster' });
    // the house: by the yard's means — the inner yards richer (brick-arched, three bays), the outer poorer
    const r = rand(), rich = dist < 70 || r < 0.2;
    let kind = open ? 'flat' : rich && r < 0.45 ? 'arch' : r < 0.6 ? 'flat' : r < 0.85 ? 'shed' : 'flat';
    const wing = L >= 16 && rand() < 0.75, nb = rich || open ? 3 : 2 + (rand() < 0.4 ? 1 : 0), bay = kind === 'arch' ? 3.6 : 3.3, Wh = nb * bay;
    const Dh = kind === 'arch' ? 4.8 : kind === 'shed' ? 5.0 : 5.4;
    const v0 = D - 1.3 - Dh, u0 = Math.min(L - Wh - 1.0, wing ? 4.9 + rand() * 1.0 : (L - Wh) / 2 + (rand() - 0.5) * 1.2);
    const hr = R(u0, v0, u0 + Wh, v0 + Dh), hs = [[hr[0], hr[1]], [hr[2], hr[1]], [hr[0], hr[3]], [hr[2], hr[3]]].map(([x, z]) => gh(x, z));
    // the house's front faces the lane, as the yard does
    C.push({ t: 'wutai_house', rect: hr, front: l.front, y: Math.max(...hs), foot: Math.min(...hs), seed: l.seed + 7, kind, nb, ...(open ? { open: true } : {}) });
    const hy = Math.max(...hs), vf = v0, doorU = u0 + (Math.floor(nb / 2) + 0.5) * bay;
    smoke.push({ p: [...P(u0 + Wh - 0.5, v0 + Dh - 0.6)], y: hy + 0.4 + (kind === 'shed' ? 2.5 : 3.7), r: l.seed });
    // the wing: a lean-to of two rooms along the yard's side wall, facing across the yard
    if (wing) {
      const wr = R(0.7, v0 - 0.5, 0.7 + 3.4, v0 - 0.5 + 6.2), ws = [[wr[0], wr[1]], [wr[2], wr[1]], [wr[0], wr[3]], [wr[2], wr[3]]].map(([x, z]) => gh(x, z));
      C.push({ t: 'wutai_house', rect: wr, front: dirOf(fr, 1, 0), y: Math.max(...ws), foot: Math.min(...ws), seed: l.seed + 11, kind: 'shed', nb: 2, bare: true });
    }
    // the yard's things: the water vat by the door, firewood against the house's side, a haystack or the drying rack,
    // hens, now and then a goat or a donkey, a ladder on a flat roof's side
    const at = (u, v) => P(u, v), put = (el, u, v, extra = {}) => { const [x, z] = at(u, v); Lf.push({ ...el, at: [x, z], y: gh(x, z), ...extra }); };
    const yaw = { n: 0, s: Math.PI, e: -Math.PI / 2, w: Math.PI / 2 };
    put({ t: 'pot', kind: 'vat', n: 1, seed: l.seed }, doorU + 1.2, vf - 0.9);
    put({ t: 'firewood', seed: l.seed + 3, rot: yaw[l.front] + Math.PI / 2 }, u0 + Wh + 0.7, v0 + 1.0);
    if (rand() < 0.6) put({ t: 'chickens', n: 3 + Math.floor(rand() * 3), kind: 'hen', seed: l.seed + 5 }, Math.min(L - 2, u0 + Wh * 0.5), vf - 2.6);
    if (rand() < 0.35) put({ t: 'haystack', seed: l.seed + 9 }, Math.max(1.8, u0 - 1.6), 2.2);
    if (rand() < 0.22) put({ t: 'animal', kind: ['goat', 'sheep', 'donkey', 'ox'][Math.floor(rand() * 4)], seed: l.seed + 13, rot: rand() * 6.28 }, L * (0.3 + rand() * 0.4), vf - 4.2);
    if (kind === 'flat' && !open && rand() < 0.5) put({ t: 'ladder', seed: l.seed + 15, rot: yaw[l.front] }, u0 + Wh - 1.0, v0 - 0.1);
    if (rand() < 0.45) { const [x, z] = at(L * 0.55, vf - 1.4); C.push({ t: 'wutai_rack', at: [x, z], y: gh(x, z), rot: l.front === 'n' || l.front === 's' ? 0 : Math.PI / 2, len: 3 }); }
    if (open) {
      // inside: ladder off, a basket and a dish of grain on the kang's low table are in the house itself (src/styles/chinese/village.js)
    }
  }
  // the green before the gate: the village well, a stone roller mill, a bench
  const gx = (GREEN[0] + GREEN[2]) / 2;
  C.push({ t: 'wutai_well', at: [gx - 6, 7.5], y: gh(gx - 6, 7.5) });
  C.push({ t: 'wutai_mill', at: [gx + 8, -8.5], y: gh(gx + 8, -8.5) });
  Lf.push({ t: 'barrel', at: [gx - 4.5, 7.2], y: gh(gx - 4.5, 7.2), n: 2, seed: 4 }, { t: 'basket', at: [gx - 7.2, 8.4], y: gh(gx - 7.2, 8.4), n: 2, seed: 5 });
  Lf.push({ t: 'animal', kind: 'donkey', at: [gx + 6.4, -8.4], y: gh(gx + 6.4, -8.4), rot: 1.2, seed: 21 });
  BUILT = { chinese: C, life: Lf, smoke };
  return BUILT;
}

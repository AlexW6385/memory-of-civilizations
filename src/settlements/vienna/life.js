// Vienna, spring 1902 — the still life: shopkeepers behind their counters, guests at the coffee-house tables, stallholders at the
// Naschmarkt, the chestnut-seller, anglers on the Wien's promenade, visitors in the Secession's court, the audience of the Court
// Opera and its dancers. Static figures of the shared style `life`; the walkers are movers.js.
import { faceFrame } from '../../styles/dutch/facade.js';
import { tables, SHOP_T, SHOP_RD } from '../../styles/viennese/shopint.js';
import { operaSeats } from '../../styles/viennese/opera-int.js';
import { lots, NASCH, NS, WIEN, OPERA, SEC_COURT, RADIUS, TRADES } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const CL = ['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo', 'cloth_maroon', 'cloth_green'];
const FRONT_N = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] };

export function life() {
  const rand = rng(1902), L = [], pick = (a) => a[Math.floor(rand() * a.length)], seed = () => Math.floor(rand() * 1e9);
  const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  const man = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'trousers', hair: 'short', hat: pick(['none', 'brim', 'cap']), over: 'collar', cloth: pick(CL), cloth2: pick(['cloth_black', 'cloth_grey']), cloth3: 'cloth_black', skin: 'skin_light', beard: rand() < 0.5 ? 0.6 : 0, pose: 'stand', ...o });
  const woman = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'robe', hair: 'bun', hat: pick(['none', 'brim']), over: pick(['shawl', 'cape']), cloth: pick(['cloth_maroon', 'cloth_green', 'cloth_indigo', 'cloth_grey', 'cloth_blue']), cloth2: 'cloth_white', cloth3: 'cloth_black', skin: 'skin_light', h: 1.55, pose: 'stand', ...o });
  const either = (...a) => (rand() < 0.5 ? man : woman)(...a);

  // the shops and coffee houses
  for (const l of lots()) {
    if (!l.open) continue;
    const F = faceFrame(l.rect, l.front), o = F.at(0, 1), p = F.at(0, 0), out = [o[0] - p[0], o[1] - p[1]], inward = [-out[0], -out[1]];
    const db = -(SHOP_T + Math.min(SHOP_RD, F.D - 4)), y = 0.12;
    if (l.open === 'kaffeehaus' || l.open === 'konditorei') {
      const T = tables(l.open, F.w);
      T.forEach(([a, dd], i) => {
        if (rand() < 0.45) return;
        const [x, z] = F.at(a, dd), sg = rand() < 0.5 ? -1 : 1;
        either([x, z + sg * 0.5], y, faceTo([0, -sg]), { pose: 'sit', carry: 'none' });
        if (rand() < 0.4) either([x, z - sg * 0.5], y, faceTo([0, sg]), { pose: 'sit' });
        void i;
      });
      woman(F.at(F.w * 0.5, db + 1.0), y, faceTo(out), { over: 'apron' });
    } else {
      const k = F.at(F.w * (0.35 + rand() * 0.3), db + 0.9);
      (rand() < 0.6 ? man : woman)(k, y, faceTo(out), { over: 'apron', hat: 'none' });
      if (rand() < 0.35) either(F.at(F.w * (0.3 + rand() * 0.4), db + 4.2), y, faceTo(rand() < 0.5 ? out : inward), { pose: rand() < 0.5 ? 'talk' : 'stand' });
    }
  }

  // the Naschmarkt: a stallholder in each third stall
  for (const row of NASCH.rows) {
    let i = 0;
    for (let x = NASCH.x0 + 3; x < NASCH.x1 - 6; x += 3.6 + rand() * 1.4) {
      if (NS.some((s) => Math.abs(x - s.x) < s.w / 2 + 3) || (row.front === 'n' && x > -116 && x < -104)) continue;
      if (i++ % 2) continue;
      const z = row.front === 's' ? row.z1 - 1.0 : row.z0 + 1.0, to = row.front === 's' ? [0, 1] : [0, -1];
      (rand() < 0.65 ? woman : man)([x, z], 0.11, faceTo(to), { hat: 'none', over: 'apron', ...(rand() < 0.5 ? { hair: 'bun' } : {}) });
    }
  }
  // the chestnut-seller at his brazier on the Karlsplatz
  man([118, -2.4], 0.11, 0, { hat: 'cap', over: 'apron', cloth: 'cloth_brown' });

  // anglers on the Wien's promenade, old men on the parapet
  for (const x of [-30, 22, 48, 95, 135, 185]) if (!NS.some((s) => Math.abs(x - s.x) < s.w / 2 + 4)) man([x, WIEN.z0 - 1.1], 0.11, faceTo([0, 1]), { hat: 'brim', carry: 'staff', cloth: pick(['cloth_brown', 'cloth_grey']) });

  // visitors in the Secession's court
  for (let k = 0; k < 9; k++) {
    const x = SEC_COURT[0] + 4 + rand() * (SEC_COURT[2] - SEC_COURT[0] - 8), z = SEC_COURT[1] + 3 + rand() * 6;
    either([x, z], 0.1, rand() * 6.28, { pose: rand() < 0.5 ? 'talk' : 'stand' });
  }

  // the Opera: the audience in the stalls and the dancers on the stage
  const xc = (OPERA[0] + OPERA[2]) / 2, z0 = OPERA[1];
  for (const [s, t] of operaSeats()) if (rand() < 0.4) either([xc + s, z0 + t], 0.12, faceTo([0, 1]), { pose: 'sit', hat: 'none' });
  for (let k = 0; k < 7; k++) woman([xc - 9 + k * 3 + rand(), z0 + 44 + rand() * 6], 0.12 + 1.1, rand() * 6.28, { hat: 'none', over: 'none', cloth: 'cloth_white', pose: rand() < 0.5 ? 'stand' : 'talk' });
  void RADIUS; void TRADES; void FRONT_N;
  return L.filter((e) => Math.hypot(e.at[0], e.at[1]) < RADIUS - 20);
}

// Southern Song Lin'an — the temple path up Yuelun Hill (docs/settlements/song-hangzhou.md §26): from the upper terrace of Kaihua Temple a
// stair of granite treads zigzags up the hill's face to a pavilion on the summit shoulder, a rest pavilion on a levelled shelf beside its second
// turn, landings at the turns; pilgrims and monks on it. The treads follow the ground (layout.js `hill`, pads included), each at most 0.22 m above the last.
import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';
import '../../styles/song/index.js';
import { HILL_PADS } from './layout.js';
import { treads } from './hillpath.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
/** hz_hillpath { }: the treads (granite, a kerb along each side, moss on the old ones), the landings and the pavilions' pads' stone floors. */
function hillPath(el, { bag, col }) {
  const rand = rng(el.seed || 3);
  for (const t of treads()) {
    const [x0, z0, x1, z1] = t.rect, y1 = t.top, y0 = y1 - 0.9;
    bag.add(t.landing ? 'granite_block' : 'granite_grey', box(x0, y0, z0, x1, y1, z1));
    col.floor(t.rect, y1);
    const alongX = x1 - x0 > z1 - z0;
    // kerb stones along both edges, a hand high, and worn middle (a darker strip)
    for (const sd of [-1, 1]) {
      const k = alongX ? [x0, sd < 0 ? z0 - 0.14 : z1, x1, sd < 0 ? z0 : z1 + 0.14] : [sd < 0 ? x0 - 0.14 : x1, z0, sd < 0 ? x0 : x1 + 0.14, z1];
      bag.add('granite_block', box(k[0], y1 - 0.5, k[1], k[2], y1 + 0.12, k[3]));
    }
  }
  for (const p of HILL_PADS) {
    const r = p.r + 0.5, n = 14;
    bag.add('granite_block', box(p.c[0] - r, p.y - 0.6, p.c[1] - r, p.c[0] + r, p.y + 0.02, p.c[1] + r));   // the pavilions' stone floors
    col.floor([p.c[0] - r, p.c[1] - r, p.c[0] + r, p.c[1] + r], p.y + 0.02);
    void n;
  }
}
STYLES.song.elements.hz_hillpath = hillPath;

/** Static elements of the hill: the path and the two pavilions (ming_pavilion on the song style's table). */
export function hillStatic() {
  const E = [{ t: 'hz_hillpath', seed: 3 }];
  HILL_PADS.forEach((p, i) => E.push({ t: 'ming_pavilion', c: p.c, shape: i === 0 ? 'hex' : 'square', r: 3.4, w: 4.6, d: 4.6, y: p.y + 0.02, H: 3.4, open: [0, 1, 2, 3], plat: 0.3 }));
  return E;
}
/** Pilgrims and monks on the path, a monk sweeping a landing, a woman with her basket at the rest pavilion. */
export function hillLife() {
  const L = [], rand = rng(606), pick = (a) => a[Math.floor(rand() * a.length)], seed = () => Math.floor(rand() * 1e9), T = treads();
  const person = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'robe', cloth: pick(['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_white']), cloth2: pick(['cloth_black', 'cloth_grey']), skin: 'skin_light', hat: pick(['none', 'cap']), carry: 'none', ...extra });
  for (let i = 8; i < T.length; i += 11 + Math.floor(rand() * 9)) {
    const t = T[i], c = [(t.rect[0] + t.rect[2]) / 2, (t.rect[1] + t.rect[3]) / 2], nxt = T[Math.min(T.length - 1, i + 3)], nc = [(nxt.rect[0] + nxt.rect[2]) / 2, (nxt.rect[1] + nxt.rect[3]) / 2];
    const up = rand() < 0.5, d = [nc[0] - c[0], nc[1] - c[1]], dd = up ? d : [-d[0], -d[1]];
    if (rand() < 0.4) person(c, t.top, faceTo(dd), { pose: 'staff', carry: 'staff', hair: 'shaven', cloth: pick(['cloth_ochre', 'cloth_grey']), hat: 'none' });
    else person(c, t.top, faceTo(dd), { pose: 'stand', carry: pick(['basket', 'none', 'staff']), woman: rand() < 0.4 });
  }
  const p = HILL_PADS[1];
  person([p.c[0] + 1.2, p.c[1] + 0.8], p.y + 0.02, faceTo([-1, 0]), { pose: 'sit', dress: 'robe', cloth: 'cloth_ochre', hair: 'shaven', hat: 'none' });
  person([p.c[0] - 1.0, p.c[1] - 0.6], p.y + 0.02, faceTo([1, 0.5]), { pose: 'talk', woman: true, carry: 'basket' });
  const q = HILL_PADS[0];
  person([q.c[0] + 1.3, q.c[1] - 1.0], q.y + 0.02, faceTo([1, 1]), { pose: 'stand', cloth: 'cloth_white', hat: 'cap' });
  person([q.c[0] - 0.8, q.c[1] + 1.1], q.y + 0.02, faceTo([1, 1]), { pose: 'sit', cloth: 'cloth_grey', hair: 'shaven', hat: 'none' });
  return L;
}

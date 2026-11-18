// Which of the shop lots have their upper floors open (docs/settlements/new-york.md §1p): pure data from layout.js, read by both
// forms of the blocks (town.js passes it on as `up`; the near form builds the rooms, the far form only the stair hall's mass).
import { lots, onElStair } from './layout.js';

/** The width of the stair hall cut from the end of the lot away from the shop's door (m, with its outer wall). */
export const SW = 1.9;
/** The upper floors' use over each trade: the family's flat over the grocer, the baker and the deli; the doctor's and the dentist's offices over the drug store, the haberdasher and the cigar store; the trades' lofts over the hatter, the tailor and the dry goods; the rooming house over the lunch room and the barber's. */
const USE = { drug: 'office', haber: 'office', cigar: 'office', deli: 'flat', bakery: 'flat', shoe: 'flat', grocer: 'flat', butcher: 'flat', hat: 'loft', tailor: 'loft', fabric: 'loft', hardware: 'loft', barber: 'rooming', lunch: 'rooming', automat: 'rooming' };
const ENTRANCE = [4, 176];
const HOW_MANY = 8;
let OPEN = null;
function decide() {
  if (OPEN) return;
  OPEN = new Map();
  const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
  const cand = lots().filter((l) => l.room && !l.iron && !l.row && l.rect[2] - l.rect[0] - SW >= 8 && (l.rect[3] - l.rect[1]) >= 12 && !onElStair(...mid(l.rect), 4))
    .map((l) => ({ l, d: Math.hypot(mid(l.rect)[0] - ENTRANCE[0], mid(l.rect)[1] - ENTRANCE[1]) })).sort((a, b) => a.d - b.d);
  for (const { l } of cand) {
    if (OPEN.size >= HOW_MANY) break;
    // the hall at the end away from the shop's door, unless that end is a corner (its side face has a shop front of its own)
    const want = l.room.door === 1 ? 'lo' : 'hi', blocked = (e) => l.shops.includes(e === 'lo' ? 'w' : 'e');
    const end = !blocked(want) ? want : !blocked(want === 'lo' ? 'hi' : 'lo') ? (want === 'lo' ? 'hi' : 'lo') : null;
    if (!end) continue;
    OPEN.set(l, { end, use: USE[l.room.kind] ?? 'flat' });
  }
}
/** The opening of a lot ({ end: 'lo' | 'hi' (the hall at the low or high u end), use }) or undefined. */
export function upOf(l) { decide(); return OPEN.get(l); }
/** The lot's rectangle without the stair hall's strip (the shop is built in it, in both forms). */
export function narrowRect(el) {
  const r = el.rect, o = el.up;
  if (!o) return r;
  const along = el.front === 'n' || el.front === 's';
  if (!along) throw new Error('upper floors: only lots fronting n or s');
  return o.end === 'lo' ? [r[0] + SW, r[1], r[2], r[3]] : [r[0], r[1], r[2] - SW, r[3]];
}
/** The strip: the hall's rectangle. */
export function stripRect(el) {
  const r = el.rect, o = el.up;
  return o.end === 'lo' ? [r[0], r[1], r[0] + SW, r[3]] : [r[2] - SW, r[1], r[2], r[3]];
}
/** The side ads that stay: the one on the hall's end is lost (its wall is the hall's). */
export const adsOf = (el) => (el.up && el.ads ? el.ads.filter((a) => a.f !== (el.up.end === 'lo' ? 'w' : 'e')) : el.ads);

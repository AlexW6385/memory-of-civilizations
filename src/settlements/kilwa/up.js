// The houses whose upper floors are open (docs/settlements/kilwa.md §21): their routes and doors, from a dry run of the house's own build (memoised).
import { upRoute } from '../../styles/swahili/house.js';
import { isOpen, isDuka, upSet, SIMPLE_FROM } from './layout.js';

const MEMO = new Map();
/** { A, B, yU, zc, flip, z0, UP } of an opened house (its own coordinates), or null. */
export function upFacts(l) {
  if (!upSet().has(l)) return null;
  if (!MEMO.has(l)) MEMO.set(l, upRoute({ t: 'swahili_house', ...l, open: isOpen(l), simple: l.dh > SIMPLE_FROM, duka: isDuka(l) }));
  return MEMO.get(l);
}

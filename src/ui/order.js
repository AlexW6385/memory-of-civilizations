// One random order for the whole page: a single shuffled round of every settlement, used by the map's
// Random city button, the R key and the tour. No repeats until all have been visited, then it reshuffles.
import { BUILT } from '../planet/relief.js';
import { dot } from '../planet/geo.js';

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
let round = [];
// ?tour=a,b,c (the promo recorder): a fixed order of those settlements instead, cycling
const FIXED = (new URLSearchParams(globalThis.location?.search || '').get('tour') || '').split(',').map((id) => BUILT.find((S) => S.id === id)).filter(Boolean);
let fi = 0;

/** The settlement nearest to the planet direction u. */
export function nearest(u) {
  if (FIXED.length) return FIXED[0];
  let best = null, bd = -2;
  for (const S of BUILT) { const d = dot(u, S.u); if (d > bd) { bd = d; best = S; } }
  return best;
}

/** The next settlement of the round (not `cur`, the one the visitor is in), without taking it. */
export function peek(cur = null) {
  if (FIXED.length) return FIXED[(fi + (FIXED[fi % FIXED.length] === cur ? 1 : 0)) % FIXED.length];
  round = round.filter((S) => S !== cur);
  if (!round.length) round = shuffle(BUILT.filter((S) => S !== cur));
  return round[0] || null;
}

/** The next settlement, taken off the round. */
export function take(cur = null) {
  const S = peek(cur);
  if (FIXED.length) { fi = FIXED.indexOf(S) + 1; return S; }
  if (S) round.shift();
  return S;
}

/** Mark S as visited (off the round) without travelling by it. */
export function visit(S) { round = round.filter((x) => x !== S); }

// One random order for the whole page: a single shuffled round of every settlement, used by the map's
// Random city button, the R key and the tour. No repeats until all have been visited, then it reshuffles.
import { BUILT } from '../planet/relief.js';
import { dot } from '../planet/geo.js';

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
let round = [];

/** The settlement nearest to the planet direction u. */
export function nearest(u) {
  let best = null, bd = -2;
  for (const S of BUILT) { const d = dot(u, S.u); if (d > bd) { bd = d; best = S; } }
  return best;
}

/** The next settlement of the round (not `cur`, the one the visitor is in), without taking it. */
export function peek(cur = null) {
  round = round.filter((S) => S !== cur);
  if (!round.length) round = shuffle(BUILT.filter((S) => S !== cur));
  return round[0] || null;
}

/** The next settlement, taken off the round. */
export function take(cur = null) {
  const S = peek(cur);
  if (S) round.shift();
  return S;
}

/** Mark S as visited (off the round) without travelling by it. */
export function visit(S) { round = round.filter((x) => x !== S); }

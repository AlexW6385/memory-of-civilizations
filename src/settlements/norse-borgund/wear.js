// Borgund — wear on what is entered (docs/settlements/norse-borgund.md, Round 6 §R6.5): the trodden mud before each open door, the pale places where hands have
// rubbed the tar off the door-jambs, the worn way inside — a darker trodden strip on a dwelling's earth floor, a swept pale band across a barn's plank floor,
// charcoal dust round the smith's anvil and forge — and in the church the pale scrubbed track of feet on the planks from the west door to the chancel screen.
// Wraps the style's `log_house` and `stave_church` from here (the style file stays as it was); pure functions of the building's own numbers.
// NO WRITING: the church has runic inscriptions in life, but the dossier gives neither their text nor where they are, and a rune is not drawn here unless
// both are known; no board, sign or tablet is made. [damp 0.85 in the ground's climate already gives the moss and the rain streaks]
import '../../styles/norse/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { doorOf, height } from './layout.js';

const PALE = 'log_pine', DARK = 'bark_dark', DUST = 'wood_dark', MUD = 'silt';

/** An axis-aligned rectangle given by a centre, a half-length along the outward normal n and a half-width across it. */
const rectOf = (c, n, hl, hw) => (n[0] ? [c[0] - hl, c[1] - hw, c[0] + hl, c[1] + hw] : [c[0] - hw, c[1] - hl, c[0] + hw, c[1] + hl]);

const wrapHouse = (fn) => function worn(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (!el.open || el.simple) return r;
  const { bag } = ctx, { at, n } = doorOf(el), y = el.y ?? 0, fl = y + 0.17, kind = el.kind, barn = kind === 'barn', dw = barn ? 2.2 : 0.85;
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, perp = [-n[1], n[0]];
  // before the door: a trodden apron of mud beyond the step (the step stands 0.2–0.9 out), flat where the ground is flat
  {
    const c = [at[0] + n[0] * 1.75, at[1] + n[1] * 1.75], [a, b, d, e] = rectOf(c, n, 0.6, dw / 2 + 0.3);
    const hs = [height(a, b), height(d, b), height(a, e), height(d, e)], lo = Math.min(...hs), hi = Math.max(...hs);
    if (hi - lo < 0.1) bag.add(MUD, box(a, lo - 0.06, b, d, hi + 0.012, e));
  }
  // the jambs: where hands steady themselves the tar is rubbed away to the pale wood (the jamb's inner face, between 0.8 and 1.25 m, at the lock side and the other)
  for (const s of [-1, 1]) {
    const lat = dw / 2 - 0.006, c = [at[0] + n[0] * 0.2 + perp[0] * s * lat, at[1] + n[1] * 0.2 + perp[1] * s * lat];   // (a patch 0.016 m proud of the jamb's face: closer than 0.012 would fight it)
    const [a, b, d, e] = n[0] ? [c[0] - 0.05, c[1] - 0.011, c[0] + 0.05, c[1] + 0.011] : [c[0] - 0.011, c[1] - 0.05, c[0] + 0.011, c[1] + 0.05];
    bag.add(PALE, box(a, y + 0.15 + (s > 0 ? 0.82 : 0.9), b, d, y + 0.15 + (s > 0 ? 1.22 : 1.2), e));
  }
  // inside, from the threshold
  const into = [-n[0], -n[1]], depth = n[0] ? x1 - x0 : z1 - z0;
  if (kind === 'stue') {
    const L = Math.min(1.8, depth * 0.4), c = [at[0] + into[0] * (0.25 + L / 2), at[1] + into[1] * (0.25 + L / 2)], [a, b, d, e] = rectOf(c, n, L / 2, 0.42);
    bag.add(DARK, box(a, fl, b, d, fl + 0.005, e));
    if (el.use !== 'cook') { const [a2, b2, d2, e2] = rectOf([at[0] + into[0] * 0.55, at[1] + into[1] * 0.55], n, 0.3, 0.3); bag.add(DUST, box(a2, fl + 0.005, b2, d2, fl + 0.008, e2)); }   // a darker, worn hollow at the sill
  } else if (barn) {
    const c = [at[0] + into[0] * 0.9, at[1] + into[1] * 0.9], [a, b, d, e] = rectOf(c, n, 0.9, 1.0);
    bag.add(PALE, box(a, fl + 0.003, b, d, fl + 0.016, e));         // the threshing floor swept pale across the doors
  } else if (kind === 'smithy') {
    const c = [cx + (n[0] ? 0 : 0.6), cz + (n[0] ? 0.6 : 0)], [a, b, d, e] = [c[0] - 0.9, c[1] - 0.8, c[0] + 0.9, c[1] + 0.8];
    bag.add(DUST, box(a, fl + 0.003, b, d, fl + 0.006, e));        // charcoal dust and scale round the anvil
    const [a2, b2, d2, e2] = rectOf([at[0] + into[0] * 0.6, at[1] + into[1] * 0.6], n, 0.35, 0.45);
    bag.add(DARK, box(a2, fl + 0.003, b2, d2, fl + 0.006, e2));
  }
  return r;
};

const wrapChurch = (fn) => function wornChurch(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (el.simple) return r;
  const { bag } = ctx, [cx, cz] = el.c, y = el.y ?? 0, s = el.s ?? 1, F = y + 0.35 * s, X = (v) => cx + v * s, Z = (v) => cz + v * s;
  // the track of feet on the planks: west door (the porch), the nave's long axis to the chancel screen, pale from scrubbing and wear; wider where the door's threshold is
  bag.add(PALE, box(X(-8.7), F + 0.003, Z(-0.55), X(-4.3), F + 0.016, Z(0.55)));
  bag.add(PALE, box(X(-4.3), F + 0.003, Z(-0.4), X(3.2), F + 0.016, Z(0.4)));
  bag.add(DARK, box(X(-7.5), F + 0.004, Z(-0.7), X(-7.1), F + 0.03, Z(0.7)));      // the worn hollow of the sill under the porch's door
  return r;
};

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.norse.elements;
  if (typeof E.log_house === 'function') E.log_house = wrapHouse(E.log_house);
  if (typeof E.stave_church === 'function') E.stave_church = wrapChurch(E.stave_church);
}
registerWear();

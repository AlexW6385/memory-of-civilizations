// Where the new night lights stand (nightlight.js; docs/settlements/han-changan.md §14): the fire baskets at the gates of the palaces, the city and the markets and at
// the ward gates, the courtyard torches of the forecourt and the crown. Pure data (elements of the han styles); positions beside the guards, never in a gate's passage.
import { AX, PALACE, SOUTH_GATE, EAST_GATE, CHANGLE, CHANGLE_HALL, WARDS, WARD_WALL, WEST_MARKET, EAST_MARKET, MARKET_WALL, WALL_W, WALL_S, GATE_W, GATE_S, CROWN, RAMP } from './layout.js';

const C = (x, z) => ({ t: 'han_cresset', at: [x, z] });
const T = (x, z, y = 0) => ({ t: 'han_tingliao', at: [x, z], y });

/** The palace precinct (style hanlodge plan 'han-palace'): the three gates' inner sides, the ramp's foot, the courtyard torches of the forecourt. */
export function palaceNight() {
  const E = [], g = 9.6;
  for (const s of [-1, 1]) E.push(C(SOUTH_GATE.x + s * g, PALACE[3] - 3.6), C(PALACE[2] - 3.6, EAST_GATE.z + s * g), C(AX + s * g, PALACE[1] + 3.6), C(AX + s * 9, RAMP.z1 + 3));
  // the courtyard torches (庭燎): in pairs down the forecourt, clear of the lamp trees (±7.5), the banners (±11) and the steles (±20)
  for (const z of [-76, -38, 0, 38, 76]) for (const s of [-1, 1]) E.push(T(AX + s * 16, z));
  return E;
}
/** The Changle Palace's gates (plan 'han-changle'). */
export function changleNight() {
  const E = [], g = 9.6;
  for (const s of [-1, 1]) E.push(C(CHANGLE[0] + 3.6, EAST_GATE.z + s * g), C(CHANGLE_HALL.cx + s * g, CHANGLE[3] - 3.6));
  return E;
}
/** The crown's apron before the Front Hall (landmark plan): the pair of courtyard torches beside the way to the hall's steps. */
export function crownNight() {
  return [-1, 1].map((s) => T(AX + s * 17.5, -145, CROWN));
}
/** The city gates (plan 'han-citywall'): the inner and the outer sides of the west and the south gate. */
export function cityNight() {
  const E = [];
  for (const s of [-1, 1]) {
    E.push(C(WALL_W + 7.5, GATE_W.z + s * 16), C(WALL_W - 7.5, GATE_W.z + s * 16));
    E.push(C(GATE_S.x + s * 16, WALL_S - 7.5), C(GATE_S.x + s * 16, WALL_S + 7.5));
  }
  return E;
}
/** The ward gates' watch fires (plan 'han-wards'): at the first lane's two gates of each ward, off the lane's middle. */
export function wardNight() {
  const E = [];
  for (const w of WARDS) { const c = w[1] + WARD_WALL + 24.55; E.push(C(w[0] + 4.0, c + 1.2), C(w[2] - 4.0, c + 1.2)); }
  return E;
}
/** A market's gates' watch fires (market plans): inside each of the four gates. */
export function marketNight(rect) {
  const [x0, z0, x1, z1] = rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, th = MARKET_WALL.th;
  return [C(cx + 4.8, z0 + th + 1.4), C(cx + 4.8, z1 - th - 1.4), C(x0 + th + 1.4, cz + 4.8), C(x1 - th - 1.4, cz + 4.8)];
}
void WEST_MARKET; void EAST_MARKET;

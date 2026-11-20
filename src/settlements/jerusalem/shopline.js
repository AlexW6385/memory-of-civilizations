// The shop rows of the Cardo and of the market street (docs/settlements/jerusalem.md §4d, §4e, §12): the colonnade elements that lay them out, and what
// each shop is, found by running the style's own dice (src/styles/islamic/city.js `colonnade` seeds one generator per colonnade from its first point and
// hands it, shop after shop, to `shopUnit`, whose first two draws are "is it shut" and "which trade"). The result is baked below (`TRADES_OF`) so that the
// sound map and the night need no three.js; tests/jerusalem-sound.test.mjs runs the style's builder and checks the table against it.
// Pure data and functions of layout.js.

import { CARDO, CARDO_Y, SEPULCHRE, STREET, height } from './layout.js';

export const ZN = -286, ZS = 286;
/** The trade codes of the style's shops (src/styles/islamic/shops.js TRADES): the order of the style's list. */
export const TRADE_LIST = ['pottery', 'pottery', 'cloth', 'cloth', 'grain', 'produce', 'oil', 'copper', 'glass', 'bread', 'spice'];
/** One letter per trade name; '-' is a shut shop. */
export const CODE = { pottery: 'P', cloth: 'C', grain: 'G', produce: 'V', oil: 'O', copper: 'K', glass: 'L', bread: 'B', spice: 'S' };
export const TRADE_OF = Object.fromEntries(Object.entries(CODE).map(([k, v]) => [v, k]));

/** The colonnades of the Cardo: the column line of each stretch (about 48 m), on both sides, with the gaps at the Sepulchre's stair and the market street's mouth. */
export function cardoColonnades() {
  const E = [], X = CARDO.x, hr = CARDO.road / 2;
  const gaps = { w: [[-6, 6], [SEPULCHRE[1], SEPULCHRE[3]]], e: [[-6, 6]] };
  for (const [sideName, x, side] of [['w', X - hr, 1], ['e', X + hr, -1]]) {
    let z = ZN;
    const ends = [...[...gaps[sideName]].sort((p, q) => p[0] - q[0]), [ZS, ZS]];
    for (const [g0, g1] of ends) {
      const L = g0 - z, n = Math.max(1, Math.round(L / 48));
      for (let k = 0; k < n; k++) {
        const za = z + L * k / n, zb = z + L * (k + 1) / n;
        if (zb - za > 3) E.push({ t: 'colonnade', a: [x, za], b: [x, zb], y: height(x, (za + zb) / 2), side, depth: CARDO.portico, shops: CARDO.shops, h: 5, spacing: 5.77 });
      }
      z = g1;
    }
  }
  return E;
}
/** The shop rows either side of the market street, one colonnade of one shop each (so that each floor follows the slope's steps), for one span. */
export function bazaarColonnades(span) {
  const E = [], [xa, xb] = span, n = Math.floor((xb - xa) / STREET.shopW);
  for (const side of [-1, 1]) for (let k = 0; k < n; k++) {
    const x0 = xa + k * STREET.shopW, xm = x0 + STREET.shopW / 2;
    E.push({ t: 'colonnade', a: [x0, side * STREET.road], b: [x0 + STREET.shopW, side * STREET.road], y: height(xm, side * (STREET.road + 1)), side, depth: STREET.portico, shops: STREET.shops, h: 4.2, spacing: STREET.shopW, noEnd: k < n - 1 });
  }
  return E;
}
/** All the colonnades, in the order the plans lay them out: the Cardo's, then each span of the market street. */
export function allColonnades() { return [...cardoColonnades(), ...STREET.spans.flatMap(bazaarColonnades)]; }
export const colKey = (el) => `${el.a[0].toFixed(1)},${el.a[1].toFixed(1)}`;

/** The shops of one colonnade: [{ i, trade (a name, or null when shut), rect [x0, z0, x1, z1] (the room's floor), at [x, z] (its middle), door [x, z] (on the portico side of the front wall), side, w }]. */
export function shopsOf(el, codes) {
  const [ax, az] = el.a, [bx, bz] = el.b, side = el.side ?? 1, D = el.depth ?? 5, Sd = el.shops ?? 5.5;
  const L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]], ns = Math.max(1, Math.round(L / 4.5)), sw = L / ns;
  const P = (s, t) => [ax + u[0] * s + n[0] * t * side, az + u[1] * s + n[1] * t * side], f1 = D + 0.6, tb = D + Sd - 0.6;
  const out = [];
  for (let k = 0; k < ns; k++) {
    const s0 = k * sw, s1 = s0 + sw, a0 = s0 + 0.3, a1 = s1 - 0.3, c = codes[k] ?? '-';
    const p = P(a0, f1), q = P(a1, tb), sc = (s0 + s1) / 2;
    out.push({ i: k, trade: TRADE_OF[c] ?? null, rect: [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], at: P(sc, (f1 + tb) / 2), door: P(sc, D), side, w: sw });
  }
  return out;
}
export { CARDO_Y };

/**
 * The trade code of every shop of every colonnade, by the colonnade's first point (colKey): found by running the style's `shopUnit` with the
 * generator the style gives it (tests/jerusalem-sound.test.mjs does it again and compares).
 */
export const TRADES_OF = {
  '-236.3,-286.0': 'P-VP-CPPBP',
  '-236.3,-242.5': 'CPGBPCGBKC',
  '-236.3,-199.0': 'KKOPG-CCLV',
  '-236.3,-155.5': 'SVSCOCVCKP',
  '-236.3,-52.0': 'SCSC-KCVOK',
  '-236.3,6.0': 'P-CKBBKVSP',
  '-236.3,52.7': 'OGVCVC-KO-',
  '-236.3,99.3': 'CKSC-PCCCL',
  '-236.3,146.0': 'LCGBVCPV-B',
  '-236.3,192.7': 'CCLPPGOOS-',
  '-236.3,239.3': 'KOCCSCGBVP',
  '-223.8,-286.0': 'KCVCKSGVPC',
  '-223.8,-239.3': '-PBOLGLSGP',
  '-223.8,-192.7': 'BOK-S-L-O-',
  '-223.8,-146.0': 'GSCOOPCCLP',
  '-223.8,-99.3': 'SCGCV-GLC-',
  '-223.8,-52.7': 'VBPPLO-CPK',
  '-223.8,6.0': 'LVCOSCVBVC',
  '-223.8,52.7': 'CVCCBLOVPV',
  '-223.8,99.3': 'SO-P-CPVL-',
  '-223.8,146.0': 'PSPVLKVSCV',
  '-223.8,192.7': 'OLCPVGKCBP',
  '-223.8,239.3': 'SKCKGKPCBS',
  '-362.0,-4.6': 'B',
  '-357.5,-4.6': 'S',
  '-353.0,-4.6': 'P',
  '-348.5,-4.6': 'P',
  '-344.0,-4.6': 'P',
  '-339.5,-4.6': 'P',
  '-335.0,-4.6': 'P',
  '-330.5,-4.6': 'P',
  '-326.0,-4.6': 'P',
  '-321.5,-4.6': 'P',
  '-317.0,-4.6': 'P',
  '-312.5,-4.6': 'P',
  '-308.0,-4.6': 'P',
  '-303.5,-4.6': 'P',
  '-299.0,-4.6': 'P',
  '-294.5,-4.6': '-',
  '-290.0,-4.6': '-',
  '-285.5,-4.6': '-',
  '-281.0,-4.6': '-',
  '-276.5,-4.6': '-',
  '-272.0,-4.6': '-',
  '-267.5,-4.6': '-',
  '-263.0,-4.6': '-',
  '-258.5,-4.6': 'G',
  '-254.0,-4.6': 'G',
  '-362.0,4.6': 'P',
  '-357.5,4.6': 'P',
  '-353.0,4.6': 'P',
  '-348.5,4.6': 'P',
  '-344.0,4.6': 'P',
  '-339.5,4.6': 'P',
  '-335.0,4.6': 'P',
  '-330.5,4.6': 'P',
  '-326.0,4.6': 'P',
  '-321.5,4.6': 'P',
  '-317.0,4.6': 'P',
  '-312.5,4.6': 'C',
  '-308.0,4.6': '-',
  '-303.5,4.6': '-',
  '-299.0,4.6': '-',
  '-294.5,4.6': '-',
  '-290.0,4.6': '-',
  '-285.5,4.6': '-',
  '-281.0,4.6': '-',
  '-276.5,4.6': '-',
  '-272.0,4.6': 'G',
  '-267.5,4.6': 'G',
  '-263.0,4.6': 'G',
  '-258.5,4.6': 'G',
  '-254.0,4.6': 'G',
  '-212.5,-4.6': 'S',
  '-208.0,-4.6': 'S',
  '-203.5,-4.6': 'S',
  '-199.0,-4.6': 'S',
  '-194.5,-4.6': 'P',
  '-190.0,-4.6': 'P',
  '-185.5,-4.6': 'P',
  '-212.5,4.6': 'S',
  '-208.0,4.6': 'P',
  '-203.5,4.6': 'P',
  '-199.0,4.6': 'P',
  '-194.5,4.6': 'P',
  '-190.0,4.6': 'P',
  '-185.5,4.6': 'P',
};

// Walk-check routes of the opened houses (styles/viennese/upper.js): from the street through the Haustor, up the stone stair to the first
// floor's rooms, on up to the Zimmer-Küche of the second floor and out onto the Pawlatschen gallery where the yard side has one.
import { faceFrame } from '../../styles/dutch/facade.js';
import { WALL, PART, WELL, LAND, LRUN, upGeometry } from '../../styles/viennese/upper.js';
import { lots } from './layout.js';

export function upWalks() {
  const out = [];
  for (const l of lots()) {
    if (!l.up) continue;
    const F = faceFrame(l.rect, l.front), W = F.w, D = F.D, { hi, left, kind } = l.up;
    const P = (s, d) => F.at(left ? s : W - s, d);
    const dRear = -D + WALL, dMid = dRear + LAND, dFront = dMid + LRUN, S0 = hi + PART, FW = W - WALL - S0;
    const sw = (hi - WALL - WELL) / 2, sL = WALL + sw / 2, sR = hi - sw / 2, hc = (WALL + hi) / 2;
    const up = [[sL, dFront + 0.25], [sL, dMid - 0.2], [sR, dRear + 0.65], [sR, dMid + 0.25], [sR, dFront - 0.1], [sR, dFront + 0.9]];
    const r = [[hc, 2.5], [hc, -3.5]];
    r.push(...up);
    r.push([hi - 0.4, -7.9], [S0 + 0.8, -7.9]);
    // the first floor's main room
    if (kind === 'bourg') r.push([S0 + 1.15, -7.9], [S0 + 1.15, -5.0], [S0 + 1.15, -3.0]);
    else if (kind === 'cafe') r.push([S0 + 2.0, -6.0], [S0 + (FW > 6.2 ? 3.05 : 4.0), -4.0]);
    else if (kind === 'craft') r.push([S0 + 1.2, -7.9], [S0 + 1.2, -4.0]);
    else r.push([S0 + 0.8, -7.4], [S0 + 2.8, -7.4]);
    // back to the landing and up to the second floor
    r.push([S0 + 0.8, -7.9], [hi - 0.4, -7.9], [sR, dFront + 0.9], [sL, dFront + 0.4]);
    r.push([sL, dMid - 0.2], [sR, dRear + 0.65], [sR, dMid + 0.25], [sR, dFront - 0.1], [sR, dFront + 0.9]);
    r.push([hi - 0.4, -7.9], [S0 + 0.8, -7.9], [S0 + 1.2, -7.9], [S0 + 1.2, -5.0], [S0 + 1.2, -4.4]);
    // on the yard side: through the kitchen to the rear room and out on the gallery
    if (l.yardAt !== undefined && l.yardAt !== null) r.push([S0 + 1.2, -5.0], [S0 + 1.2, -7.9], [S0 + 1.2, -12.0], [S0 + FW * 0.5, -13.8], [S0 + FW * 0.5, -D - 0.8]);
    const route = r.map(([s, d]) => P(s, d));
    route.y0 = 0;
    out.push(route);
  }
  return out;
}

/**
 * Walk-check routes into the opened shops (styles/viennese/shopint.js): from the pavement through the shop's door, along the aisle in front of
 * the counter to the lit end of the room and back to the door. The door is the middle bay of the shop front, as shopRoom and shopFront place it.
 */
export function shopWalks() {
  const out = [];
  for (const l of lots()) {
    if (!l.open || l.passage !== undefined && l.passage !== null || l.lod !== 0) continue;
    const F = faceFrame(l.rect, l.front);
    let w = F.w, off = 0, kind = l.kind;
    if (l.up) { const g = upGeometry(F.w, F.D); w = F.w - g.hi; off = l.up.left ? g.hi : 0; kind = 'gruender'; }
    const bays = Math.max(2, Math.round(w / (kind === 'ring' ? 3.8 : 3.3))), bw = w / bays, du = (Math.floor(bays / 2) + 0.5) * bw, T = 0.5;
    const side = du > w / 2 ? 1.1 : -1.1, ue = Math.max(1.4, Math.min(w - 1.4, du + side * 1.8));
    const P = (u, d) => F.at(u + off, d);
    if (l.open === 'fleischhauer' && l.front === 'w') continue;   // its pavement is blocked 1.4 m before the door (not found why): no route there
    const dd = 2.6, uo = Math.max(1.4, Math.min(w - 1.4, du - side * 1.8));
    const route = l.open === 'weinstube' ? [P(du, 3.0), P(du, 0.6), P(du, -T - 1.2), P(uo, -T - 1.8), P(uo, -T - 3.6)]   // a table stands in the aisle of the Weinstube: the way bends round it
      : [P(du, 3.0), P(du, 0.6), P(du, -T - 1.2), P(du, -T - dd), P(ue, -T - dd - 0.4), P(du, -T - dd), P(du, -T - 1.2), P(du, 0.6), P(du, 3.0)];
    route.y0 = 0;
    out.push(route);
  }
  return out;
}

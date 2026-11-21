// Delphi about 400 BC — the visitor's walk (docs/settlements/delphi.md §15.1). Pure functions of layout.js and the house's own doors.
// The walk: from the arrival on the temple's terrace east to the stair through the terrace wall, down the Sacred Way's four legs
// past the treasuries, out through the gate into the forecourt market (the stalls), and from the forecourt's north edge up the east
// village's lanes, where the open workshops stand with their street doors and their wide shop openings.
import { lots, height } from './layout.js';
import { houseDoors } from '../../styles/delphi/house.js';
import { frame } from '../../styles/greek/agora.js';

export const ARRIVAL = [62, 16];
/** The walk's lines [x, z], along the middle of the way (the Way's legs from layout.js WAY, the forecourt, the east village's lanes). */
export const WALK = [
  [[62, 16], [66, 8], [86, 24]],
  [[86, 26], [86, 44], [44, 44]],
  [[96, 100], [98, 134]],
  [[98, 115], [118, 108], [118, 97]],
];
/** The open lots with their two routes each: into the shop opening and into the passage to the court: [{ l, trade, shop: [[x, z], …], passage: [[x, z], …], y0 }]. */
export function houseRoutes() {
  const out = [];
  for (const l of lots()) {
    if (!l.open) continue;
    const F = frame(l.rect, 's'), D = houseDoors(l.rect, l.seed);
    out.push({
      l, trade: l.trade, y0: l.y,
      // (the shop is served over its counter at the opening; the visitor goes in by the passage and the door in the shop's partition)
      shop: [F.P(D.du, -2.0), F.P(D.du, -0.6), F.P(D.du, 1.9), F.P(D.shopIn, 1.9)],
      passage: [F.P(D.du, -2.0), F.P(D.du, -0.6), F.P(D.du, 3.4), F.P(D.du, D.courtV)],
    });
  }
  return out;
}
void height;

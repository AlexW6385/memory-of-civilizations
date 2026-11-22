// Teotihuacan by night (docs/settlements/teotihuacan.md §19): where the light was. No oil lamps and no street lighting [inferred: none are known for Mesoamerica];
// the lit places are the fires of the temples (kept burning, as at the other Mesoamerican temples [inferred]), the incense braziers of the plazas (stone bowls of copal
// embers, dossier §15), the braziers at the market's gates where its watchers stood, the censers on the plaza altars, the doors of the temple chambers (a fire within) and
// the doors of the households' hearth rooms. Pure data: the light list that plan.js/town.js turn into one mesh of the engine's additive `halo` material
// (styles/teotihuacano/halo.js). The points of light of the rooms (`ctx.lights` in rooms.js) stay as they were; they are real lights, off at the low preset.
import { avenueItems } from './dress.js';
import { lodges, compounds, platformTemples, MOON, PLAZA, SUN, CIUD, MARKET } from './layout.js';
import { lodgeGeom } from './walk.js';
import { roomDoors } from '../../styles/teotihuacano/doors.js';

/** The Feathered Serpent Pyramid (plan.js: c [150, 260], 20 m high, its temple 14 m with a chamber, the stair on the west). */
const FSP = { c: [150, 260], h: 20, temple: 14 };
const AH = 2.4, CH = 7;

/** The lights, { k, x, y, z, gy, s?, n?, w?, h?, f? } (see styles/teotihuacano/halo.js). */
export function lights() {
  const L = [];
  // the incense braziers of the avenue's plazas, the Moon Plaza and the Ciudadela's court: a glow of coals in the bowl (its rim 0.65 m up) and the pool on the floor
  for (const o of avenueItems()) if (o.k === 'brazier') L.push({ k: 'brazier', x: o.x, y: o.y + 0.72, z: o.z, gy: o.y, s: o.big ? 1.7 : 0.9 });
  // the braziers at the market's four gates (market.js: 5 m in from each gate's line, 3.4 m either side of the lane)
  { const [x0, z0, x1, z1] = MARKET, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    for (const [gx, gz, fx, fz] of [[cx, z0, 0, 1], [cx, z1, 0, -1], [x0, cz, 1, 0], [x1, cz, -1, 0]]) for (const sd of [-1, 1]) L.push({ k: 'brazier', x: gx + fx * 5 + (fz ? sd * 3.4 : 0), y: 0.04 + 0.72, z: gz + fz * 5 + (fx ? sd * 3.4 : 0), gy: 0.04, s: 1 }); }
  // the censers on the arrival plaza's altar (palace.js ttPlazaAltars: two at x ±1.6, z −1.2 from the centre, on the top 1.66 m up) and the lone altar's
  L.push({ k: 'brazier', x: -1.6, y: 1.66 + 0.45, z: 13.8, gy: 1.66, s: 0.8 }, { k: 'brazier', x: 1.6, y: 1.66 + 0.45, z: 13.8, gy: 1.66, s: 0.8 }, { k: 'brazier', x: -9, y: 1.03 + 0.4, z: 42, gy: 1.03, s: 0.7 });
  // the fires on the summits of the Sun and the Moon (the stairs' heads: the Sun's on the west face, the Moon's on the south)
  L.push({ k: 'fire', x: SUN.c[0] - 8 - 2.2, y: SUN.h + 1.3, z: SUN.c[1], gy: SUN.h, s: 1.15 }, { k: 'fire', x: 0, y: MOON.rise + MOON.h + 1.3, z: MOON.c[1] + MOON.td / 2 - 1.8, gy: MOON.rise + MOON.h, s: 1 });
  // the doors of the temple chambers, a fire within (the door passage 2.4 m wide, 2.5 m high, the lit sheet in the wall's middle, the light spilling out on the landing):
  const door = (x, z, n, gy, w = 2.2, h = 2.4, f = 0.55) => L.push({ k: 'door', x, z, n, gy, w, h, f, s: 1.2 });
  //  the big temples of the avenue's west platform (summit 8 m over the platform, the temple 11 × 10 m, stair and door east)
  for (const t of platformTemples()) if (t.big && t.sd < 0) door(-36 + 5.5 - 1.0, t.z, [1, 0], t.lv + AH + 8);
  //  the Sun's temple (16 m, walls 3 m, the door west) and the Feathered Serpent's (14 m, walls 3 m, the door west)
  door(SUN.c[0] - 8 + 1.5, SUN.c[1], [-1, 0], SUN.h, 2.2, 2.4, 0.6);
  door(FSP.c[0] - FSP.temple / 2 + 1.5, FSP.c[1], [-1, 0], FSP.h);
  //  the four temples round the Moon Plaza with chambers (plan.js: the east pair at x −78, facing east, the west pair at x 78 facing west; the summit 9 m over the terrace)
  for (const [x, z, fx] of [[-78, PLAZA[1] + 14, 1], [-78, PLAZA[1] + 44, 1], [78, PLAZA[1] + 14, -1], [78, PLAZA[1] + 44, -1]]) door(x + fx * (5.5 - 1.0), z, [fx, 0], MOON.rise + 9);
  //  the Ciudadela's temples facing out over the avenue on the west bank and in on the east (the summit 12 m, the temple 8.4 m, the door west)
  { const [cx0, cz0, cx1, cz1] = CIUD, bw = 22, cm = (cz0 + cz1) / 2;
    for (const z of [cz0 + 40, cz0 + 68, cz1 - 68, cz1 - 40]) door(cx0 + bw / 2 - 4.2 + 1.2, z, [-1, 0], CH + 5, 2.2, 2.2, 0.5);
    for (const z of [cz0 + 48, cm, cz1 - 48]) door(cx1 - bw / 2 - 4.2 + 1.2, z, [-1, 0], CH + 5, 2.2, 2.2, 0.5); }
  // the houses of those who serve the avenue: the lit door of the room each is entered by (the hearth of the dwelling's kitchen; the copal embers of the priest's shrine, dimmer and redder; the
  // craft houses' workrooms are worked by daylight and stand dark, but for the hearth in their store or sleeping room: a faint door)
  for (const l of lodges()) {
    const g = lodgeGeom(l), d = g.door, [x, z] = d.out, shrine = l.kind === 'lodge', craft = ['workshop', 'potter', 'weaver'].includes(l.kind);
    L.push({ k: 'door', x: x + g.fx * 0.15, z: z + g.fz * 0.15, n: [g.fx, g.fz], gy: l.y + g.ph, w: 1.6, h: 1.8, f: shrine ? 0.32 : craft ? 0.28 : 0.5, s: 0.9 });
  }
  // the compounds near the arrival: the kitchen's doorway on the main patio (the west block's first door, facing east into the patio), the hearth's glow
  const A = [0, 70];
  for (const c of compounds()) {
    const [x0, z0, x1, z1] = c.rect, cw = (x1 - x0 - 2) / 3, cd = (z1 - z0 - 2) / 3, cm = [(x0 + x1) / 2, (z0 + z1) / 2];
    if (Math.hypot(cm[0] - A[0], cm[1] - A[1]) > 210 || (c.open && c.gate === 2)) continue;
    const r = [x0 + 1.6, z0 + 1 + cd + 0.6, x0 + 1 + cw - 0.6, z0 + 1 + 2 * cd - 0.6], back = [r[0], r[1], r[2] - 2.6, r[3]], nr = r[3] - r[1] > 11 ? 3 : 2, d = roomDoors(back, [1, 0], nr)[0];
    L.push({ k: 'door', x: d.out[0] + 0.15, z: d.out[1], n: [1, 0], gy: 0.5, w: 1.6, h: 1.8, f: 0.5, s: 0.9 });
  }
  return L;
}

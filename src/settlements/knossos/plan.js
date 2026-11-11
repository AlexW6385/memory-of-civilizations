// The palace of Knossos about 1600 BC (docs/settlements/knossos.md §2–§4): the West Wing of three
// storeys with its magazines and, on the court, the Throne Room's antechamber and the Tripartite
// Shrine; the North Wing split by the North Entrance Passage under the bastion's portico; the East
// Wing of four storeys (the residential quarter, the Grand Staircase) with its portico on the
// court; the South Wing and the south propylon; the West Court; the theatral area.

import { COURT, THEATRAL } from './layout.js';

const E = [];
// the Central Court's paving
E.push({ t: 'floor', rect: COURT, y: 0.05, th: 0.3, mat: 'flagstone' });
// the wings
// the West Wing, with the Throne Room cut into it behind its antechamber: the room, the lustral basin sunk in its
// south-west corner under a light well open to the sky, the two double doors from the antechamber
const TR = [-25.8, -19.6, -19.8, -12.6], PIT = [-25.8, -15.4, -22.8, -12.6];
// the West Magazines: the Long Corridor running north–south through the wing's ground floor, eighteen long
// store-rooms opening off its west side, the way in from the north
const CORR = [-41, -48, -37.5, 22], MAG = { x0: -57, z0: -46, z1: 20, n: 18 }, MP = (MAG.z1 - MAG.z0) / MAG.n;
const magHoles = Array.from({ length: MAG.n }, (_, i) => ({ rect: [MAG.x0, MAG.z0 + i * MP + 0.8, CORR[0], MAG.z0 + (i + 1) * MP - 0.8], h: 3.2 }));
E.push({ t: 'wing', rect: [-62, -60, -19, 58], storeys: 3, windows: 'w', seed: 1,
  holes: [{ rect: TR, h: 3.6 }, { rect: PIT, h: 99 }, { rect: [-19.8, -18.2, -19.0, -16.6], h: 2.6, lintel: true }, { rect: [-19.8, -15.6, -19.0, -14.0], h: 2.6, lintel: true },
    { rect: CORR, h: 3.4 }, { rect: [CORR[0], -60, CORR[2], CORR[1]], h: 3.0, lintel: true }, ...magHoles],
  pits: [{ rect: PIT, depth: 1.0 }] });
E.push({ t: 'magazines', corridor: CORR, ...MAG, y: 0 });
E.push({ t: 'throne_room', rect: TR, y: 0, throne: [-23.2, -19.6], pit: PIT, pitDepth: 1.0 });
E.push({ t: 'stair', rect: [-24.0, -14.1, -22.8, -12.6], dir: 'e', y0: -1.0, y1: 0, riser: 0.25, base: -1.0, mat: 'gypsum_minoan' });
// the west façade in setbacks: blocks standing forward of the line by a metre or three, at different heights,
// so that the long front breaks into sun and shadow; the west entrance with its porch in the south part
for (const [z0, z1, out, st, sd] of [[-60, -38, 2.4, 3, 11], [-30, -12, 1.2, 2, 12], [-4, 14, 3.0, 3, 13], [22, 30, 1.6, 2, 14], [48, 58, 2.2, 3, 15]]) E.push({ t: 'wing', rect: [-62 - out, z0, -62, z1], storeys: st, windows: 'wns', seed: sd, horns: st === 3 });
E.push({ t: 'portico', a: [-62, 34], b: [-62, 44], n: 1, depth: 4, side: -1, h: 3.6 });
// three rooms cut in the wings and furnished (§4e): the archive in the North Wing's east part (opening on the Entrance passage), the oil store in its west part, the kitchen in the South Wing (a doorway on the court)
const AR = [4.6, -52, 15, -41], ST = [-17, -52, -6.4, -41], KI = [6, 30, 16.4, 39];
E.push({ t: 'wing', rect: [-19, -62, -3, -28], storeys: 2, windows: 'n', seed: 2, holes: [{ rect: ST, h: 3.3 }, { rect: [ST[2], -48, -3, -46], h: 2.6, lintel: true }] },
  { t: 'wing', rect: [3, -62, 40, -28], storeys: 2, windows: 'ne', seed: 3, holes: [{ rect: AR, h: 3.3 }, { rect: [3, -48, AR[0], -46], h: 2.6, lintel: true }] });
E.push({ t: 'furnished_room', rect: AR, y: 0, front: 'w', kind: 'archive', seed: 31 }, { t: 'furnished_room', rect: ST, y: 0, front: 'e', kind: 'store', seed: 32 });
// the East Wing of four storeys: the light well of the Grand Staircase, its colonnades storey above storey; the
// Queen's Megaron opening off it with the dolphins on its wall; a passage in from the court's portico
const LW = [23, -2, 29, 6], QM = [23, 6, 31, 13];
// the residential hall (the Hall of the Double Axes' kind) and the lapidary's workshop, each with its pier-and-door partition on a light well (§4d)
const HALL = [23, 14, 41, 24], HALLW = [41, 14, 46, 24], WS = [23, 27, 41, 37], WSW = [41, 27, 46, 37];
E.push({ t: 'wing', rect: [19, -28, 62, 58], storeys: 4, windows: 'es', seed: 4,
  holes: [{ rect: LW, h: 99 }, { rect: QM, h: 3.6 }, { rect: [19, 0, 23, 2], h: 2.6, lintel: true },
    { rect: HALL, h: 3.4 }, { rect: HALLW, h: 99 }, { rect: [19, 18.5, 23, 21], h: 2.6, lintel: true }, { rect: [30.5, 24, 32.5, 27], h: 2.6, lintel: true }, { rect: WS, h: 3.4 }, { rect: WSW, h: 99 }] });
E.push({ t: 'double_axe_hall', rect: HALL, well: HALLW, y: 0, seed: 5, door: [18.5, 21] }, { t: 'lapidary_workshop', rect: WS, well: WSW, y: 0, seed: 9, door: [30.5, 32.5] });
E.push({ t: 'lightwell_tiers', rect: LW, y: 0, storeys: 4, sh: 3.6 });
E.push({ t: 'fresco', kind: 'dolphins', at: [27, 13], face: 'n', y0: 1.4, w: 3.6, h: 1.3, bg: 'plaster_white' });
// the Queen's Megaron furnished (§4c): the bathroom at its east end behind the low partition and its column, the
// clay bath; the gypsum bench on the west wall under the dancing lady
E.push({ t: 'queens_bath', rect: [28.4, 9.4, 31, 13], y: 0, h: 3.6 });
E.push({ t: 'megaron_bench', rect: [23, 7.0, 23.45, 12.2], y: 0 });
E.push({ t: 'fresco', kind: 'dancer', at: [23, 9.6], face: 'e', y0: 1.3, w: 1.7, h: 1.6, bg: 'plaster_white' });
// the bull-leaping fresco on the back wall of the east portico, toward its north end
E.push({ t: 'fresco', kind: 'bull_leaping', at: [19, -12], face: 'w', y0: 1.1, w: 1.9, h: 1.0, bg: 'egyptian_blue' });
E.push({ t: 'wing', rect: [-19, 28, -3, 58], storeys: 2, windows: 's', seed: 5 }, { t: 'wing', rect: [3, 28, 19, 58], storeys: 2, windows: 's', seed: 6, holes: [{ rect: KI, h: 3.3 }, { rect: [10, 28, 12.4, KI[1]], h: 2.6, lintel: true }] });
E.push({ t: 'furnished_room', rect: KI, y: 0, front: 'n', kind: 'kitchen', seed: 33 });
// porticoes on the court: the Throne Room's antechamber, the Tripartite Shrine, the east side, the south
E.push({ t: 'portico', a: [-14.2, -20], b: [-14.2, -8], n: 4, depth: 4.6, side: -1, h: 3.4 });
// the antechamber shut on the north and south by its walls; the wooden throne and the gypsum benches (§4c)
for (const z of [[-20.3, -20], [-8, -7.7]]) E.push({ t: 'block', rect: [-19, z[0], -14.55, z[1]], y0: 0, y1: 3.65, mat: 'plaster_ochre' });
E.push({ t: 'antechamber', rect: [-19, -20, -14.6, -8], y: 0, throne: [-16.8, -20] });
E.push({ t: 'portico', a: [-14.2, 0], b: [-14.2, 12], n: 3, depth: 4.6, side: -1, h: 3.4 });
E.push({ t: 'portico', a: [14.2, -22], b: [14.2, 22], n: 10, depth: 4.6, side: 1, h: 3.6 });
// the North Entrance: the passage between the wings, the bastion's portico above its ramp
E.push({ t: 'portico', a: [-6, -66], b: [6, -66], n: 4, depth: 4, side: -1, h: 3.4 });
// the West Bastion: a portico raised over the passage, the charging bull in painted relief on its back wall
E.push({ t: 'bastion', rect: [-12, -72, -6, -62], y: 0, podium: 2.4, front: 'e' }, { t: 'wing', rect: [6, -72, 12, -62], storeys: 1, sh: 4.4, windows: '' });
// the south propylon
E.push({ t: 'portico', a: [-3, 60], b: [3, 60], n: 2, depth: 3, side: 1, h: 3.4 });
// the Procession Fresco along both walls of the south passage, over the gypsum dado: the bearers walking in toward
// the court (Evans set copies of it in the South Propylaeum, §4c)
E.push({ t: 'procession_wall', at: [-3, 43], face: 'e', y0: 1.2, w: 28, h: 2.1 });
E.push({ t: 'procession_wall', at: [3, 43], face: 'w', y0: 1.2, w: 28, h: 2.1, flip: true });
// the West Court's raised walks and the theatral area
E.push({ t: 'floor', rect: [-120, -50, -64, 50], y: 0.05, th: 0.3, mat: 'flagstone' });
// the theatral area where the Royal Road ends: a paved court about 13 × 10 m; on its east the flight of eighteen low
// steps, a little over 10 m broad; on its south the six steps, 15.5 m long; at the corner between them the bastion,
// where a pavilion may have stood for the ruler to watch from (§4b)
const [T0, T1] = [THEATRAL[0] + 4, THEATRAL[1] + 6];                // the court's south-west corner: x −100, z −92
E.push({ t: 'floor', rect: [T0, T1, T0 + 14, T1 + 10], y: 0.05, th: 0.3, mat: 'flagstone' });
E.push({ t: 'steps', rect: [T0, T1 + 10, T0 + 15.5, T1 + 16], n: 6, rise: 0.25, dir: 's' });
E.push({ t: 'steps', rect: [T0 + 14, T1 - 0.4, T0 + 22, T1 + 10], n: 18, rise: 0.12, dir: 'e' });
E.push({ t: 'block', rect: [T0 + 15.5, T1 + 10, T0 + 22, T1 + 16], y0: -0.5, y1: 2.16, mat: 'gypsum_minoan', walk: true });
E.push({ t: 'portico', a: [T0 + 16.2, T1 + 15.4], b: [T0 + 16.2, T1 + 10.6], n: 2, depth: 5, side: 1, y: 2.16, h: 2.8 });

// the West Court furnished (docs/settlements/knossos.md §4e): the raised causeways of limestone slabs that cross it (the way from the west entrance
// out to the Royal Road and the theatral area), the three stone-lined pits (kouloures) at its north-west, benches of gypsum along the façade between
// the setbacks, tubs of plants and jar stands along the causeways, torch stands either side of the west entrance, a cult stand with horns
E.push({ t: 'floor', rect: [-118, 38.3, -66, 39.7], y: 0.2, th: 0.2, mat: 'limestone' }, { t: 'floor', rect: [-90.7, -49, -89.3, 39.7], y: 0.2, th: 0.2, mat: 'limestone' });
E.push({ t: 'floor', rect: [-89.3, -44.7, -66, -43.3], y: 0.2, th: 0.2, mat: 'limestone' });
for (const z of [-43, -35.5, -28]) E.push({ t: 'ring_pit', c: [-110, z], r: 2.7, y: 0.05 });
E.push({ t: 'court_dress', y: 0.05, seed: 3,
  benches: [[-62.6, -37.4, -62.0, -30.6], [-62.6, -11.6, -62.0, -4.6], [-62.6, 14.6, -62.0, 21.6], [-62.6, 30.4, -62.0, 31.0]],
  stands: [[-66.6, 31.5], [-66.6, 46.5], [-66.6, 10], [-66.6, -22], [-88, 20], [-88, -20], [-95, 37.2]],
  tubs: [[-92, -30], [-92, -10], [-92, 10], [-92, 30], [-93, 37], [-87.5, 37], [-100, 36.5]],
  torches: [[-67.4, 33.4], [-67.4, 44.6], [-92, -47]],
  niches: [[-64.45, -52], [-64.45, -46], [-65.05, 2.4], [-65.05, 7.6], [-65.05, 11.6]],
  horns: [[-67.0, -49, 1], [-67.8, 5, 1]] });
// the theatral area: tubs and a torch stand at the corners of its court, jar stands before the steps
E.push({ t: 'court_dress', y: 0.05, seed: 5, tubs: [[THEATRAL[0] + 4.8, THEATRAL[1] + 15.2]], stands: [[THEATRAL[0] + 7, THEATRAL[1] + 14.8], [THEATRAL[0] + 12, THEATRAL[1] + 14.8]], torches: [[THEATRAL[0] + 4.6, THEATRAL[1] + 10.4]] });
// the Central Court: tubs at the corners, torch stands under the porticoes, the cult stand with horns before the Tripartite Shrine's portico
E.push({ t: 'court_dress', y: 0.05, seed: 4,
  benches: [[-12.6, -24.6, -12.15, -22.2], [12.15, 22.2, 12.6, 24.6], [-12.6, 22.2, -12.15, 24.6]],
  tubs: [[-11.5, -23.5], [11.5, -23.5], [11.5, 23.5], [-11.5, 23.5]],
  stands: [[-12.2, 18], [12.2, -17], [12.2, 17], [-12.2, -17]],
  torches: [[-13.0, -9], [13.0, -1], [13.0, 12], [-13.0, 3]] });

const room = (id, rect, y, kind, extra = {}) => ({ id, rect, y, kind, ...extra });
const rooms = [room('central court', COURT, 0.05, 'open'), room('west court', [-120, -50, -64, 50], 0.05, 'open', { market: true }), room('throne room antechamber', [-19, -20, -14, -8], 0, 'hall'),
  room('throne room', TR, 0, 'inner'), room('long corridor', CORR, 0, 'inner'), room('grand staircase light well', LW, 0, 'open'), room("queen's megaron", QM, 0, 'inner'), room('south propylaeum', [-3, 28, 3, 63], 0, 'hall'),
  room('hall of the double axes', HALL, 0, 'hall'), room('lapidary workshop', WS, 0, 'inner'), room('archive', AR, 0, 'inner'), room('oil store', ST, 0, 'inner'), room('kitchen', KI, 0, 'inner')];
const walks = [[[-100, 0], [-90, -60], [-92, -87], [-92, -95], [-70, -95], [-60, -89], [0, -89], [0, -60], [0, 0]], [[-39, -66], [-39, -54], [-39, 0], [-46, 0.5]]];
walks.push([[0, 20], [19, 19.75], [30, 19.75], [31.5, 25], [31.5, 31]]);
walks.push([[0, -46], [4.4, -47], [10, -46.5]], [[0, -46], [-6, -47], [-12, -46.5]], [[0, 24], [11.2, 27], [11.2, 33], [11, 36]]);
for (const w of walks) w.y0 = 0;
walks[2].y0 = 0;
walks[1].y0 = 0;
walks[0].y0 = 0;

export const palace = {
  id: 'knossos-palace',
  name: { en: 'The Palace of Knossos', zh: '克诺索斯王宫' },
  era: { en: 'Minoan Crete, about 1600 BC', zh: '米诺斯克里特，约公元前1600年' },
  style: 'minoan',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-100, 0], facing: 'e' },
  bounds: [-125, -100, 66, 64],
  view: COURT,
  bakeTop: 18,
  elements: E,
  rooms,
  walks,
};
export default palace;

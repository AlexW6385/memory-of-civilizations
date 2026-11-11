// Vienna, spring 1902: the two landmarks (docs/settlements/vienna.md §1, §4–§5) — Olbrich's Secession building with the
// Beethoven exhibition inside (Klinger's statue in the main hall, Klimt's frieze in the aisle), and Loos's Café Museum.
import { SEC, SEC_COURT, CAFE } from './layout.js';

const cx = (SEC[0] + SEC[2]) / 2, z0 = SEC[1], FLR = 0.35;
const Z = (b) => z0 + b;
export const secession = {
  id: 'vienna-secession',
  name: { en: 'The Secession building', zh: '分离派展览馆' },
  era: { en: 'Vienna, spring 1902', zh: '维也纳，1902年春' },
  style: 'viennese',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [cx, SEC_COURT[1] + 4], facing: 's' },
  bounds: [SEC_COURT[0] - 2, SEC_COURT[1] - 2, SEC_COURT[2] + 2, SEC[3] + 2],
  view: [-40, -92, 40, -50],
  bakeTop: 32,
  elements: [
    { t: 'secession', rect: SEC, y: 0 },
    // the forecourt between the building and the street: flagstones, lamps and the advertising column of the exhibition
    { t: 'floor', rect: [SEC_COURT[0], SEC_COURT[1], SEC_COURT[2], SEC[1] - 0.35], y: 0.03, th: 0.2, mat: 'flagstone' },
    { t: 'litfass', at: [-22, SEC[1] - 8], y: 0.03, seed: 1 },
    { t: 'kiosk', at: [24, SEC[1] - 9], y: 0.03, rot: 0, seed: 2 },
  ],
  rooms: [
    { id: 'forecourt', rect: [SEC_COURT[0] + 1, SEC_COURT[1] + 1, SEC_COURT[2] - 1, SEC[1] - 0.6], y: 0.03, kind: 'open' },
    { id: 'vestibule', rect: [cx - 10.3, Z(3.9), cx + 10.3, Z(8.4)], y: FLR, kind: 'inner' },
    { id: 'west side room', rect: [cx - 16.2, Z(3.9), cx - 11.4, Z(8.4)], y: FLR, kind: 'inner' },
    { id: 'east side room', rect: [cx + 11.4, Z(3.9), cx + 16.2, Z(8.4)], y: FLR, kind: 'inner' },
    { id: 'main hall (Klinger\'s Beethoven)', rect: [cx - 10.3, Z(9.3), cx + 10.3, Z(24.8)], y: FLR, kind: 'hall' },
    { id: 'aisle (Klimt\'s Beethoven Frieze)', rect: [cx - 16.2, Z(9.2), cx - 11.4, Z(25.0)], y: FLR, kind: 'hall' },
    { id: 'east aisle', rect: [cx + 11.4, Z(9.2), cx + 16.2, Z(25.0)], y: FLR, kind: 'hall' },
  ],
  walks: [
    Object.assign([[cx, SEC_COURT[1] + 4], [cx, Z(-1)], [cx, Z(6)], [cx, Z(11)], [cx - 6, Z(13)], [cx - 6, Z(21)], [cx, Z(23.5)]], { y0: 0 }),
    Object.assign([[cx, Z(6)], [cx - 9, Z(6.1)], [cx - 13.5, Z(6.1)], [cx - 13.5, Z(12)], [cx - 13.5, Z(22)]], { y0: FLR }),
    Object.assign([[cx, Z(6)], [cx + 9, Z(6.1)], [cx + 13.5, Z(6.1)], [cx + 13.5, Z(12)], [cx + 13.5, Z(22)]], { y0: FLR }),
  ],
};

const CY = 0.1;
export const cafe = {
  id: 'vienna-cafe-museum',
  name: { en: 'Café Museum', zh: '博物馆咖啡馆' },
  era: { en: 'Vienna, spring 1902', zh: '维也纳，1902年春' },
  style: 'viennese',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [CAFE[2] - 4.2, CAFE[3] + 3], facing: 'n' },
  bounds: [CAFE[0] - 3, CAFE[1] - 3, CAFE[2] + 3, CAFE[3] + 6],
  view: [CAFE[0] - 10, CAFE[1] - 4, CAFE[2] + 10, CAFE[3] + 16],
  bakeTop: 28,
  elements: [{ t: 'cafe_house', rect: CAFE, storeys: 5, seed: 7, y: 0 }],
  rooms: [{ id: 'the coffee house', rect: [CAFE[0] + 0.7, CAFE[1] + 0.7, CAFE[2] - 0.7, CAFE[3] - 0.7], y: CY, kind: 'inner' }],
  walks: [Object.assign([[CAFE[2] - 4.2, CAFE[3] + 3], [CAFE[2] - 4.2, CAFE[3] - 1.2], [CAFE[2] - 4.2, CAFE[3] - 2.6], [CAFE[0] + 4, CAFE[3] - 2.6]], { y0: 0 })],
};

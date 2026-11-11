// The Bauhaus building, Dessau (docs/settlements/bauhaus-dessau.md §2, §6): one plan, the whole school — workshop wing, bridge, north wing,
// Aula and canteen, Prellerhaus — with the rooms the visitor can walk into.
import { B, LV, PL } from './layout.js';

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('vestibule', [-16, 5, 0, 13], LV.f0, 'hall'),
  room('carpentry', [-16, 15, -5, 23], LV.f0, 'workshop'),
  room('machine-shop', [-16, 25, -5, 33], LV.f0, 'workshop'),
  room('lecture-hall', [-16, 5, 0, 13], LV.f1, 'hall'),
  room('weaving', [-16, 15, -5, 23], LV.f1, 'workshop'),
  room('weaving-2', [-16, 25, -5, 33], LV.f1, 'workshop'),
  room('exhibition', [-16, 5, 0, 13], LV.f2, 'hall'),
  room('metal-workshop', [-16, 15, -5, 23], LV.f2, 'workshop'),
  room('wall-painting', [-16, 25, -5, 33], LV.f2, 'workshop'),
  room('administration', [-14, -9, 0, 3], LV.f1, 'hall'),
  room('building-office', [-14, -9, 0, 3], LV.f2, 'hall'),
  room('classrooms', [1, -26, 11, -14], LV.f0, 'hall'),
  room('library', [13, -26, 22, -14], LV.f1, 'hall'),
  room('drawing-class', [1, -26, 11, -14], LV.f2, 'hall'),
  room('foyer', [2, 16, 6, 32], LV.f0, 'aula'),
  room('aula', [9, 16, 23, 32], LV.f0, 'aula'),
  room('stage', [26, 18, 32, 30], LV.f0 + 0.9, 'aula'),
  room('canteen', [34, 16, 40, 32], LV.f0, 'aula'),
  room('studio-1', [45.5, 9, 49, 11.5], PL.f1, 'studio'),
  room('studio-top', [45.5, 29, 49, 31.5], PL.f4, 'studio'),
  room('gymnasium', [45.5, 10, 49, 20], PL.f0, 'hall'),
  room('forecourt', [-12, -6, 40, 3], 0, 'open'),
];

export const school = {
  id: 'bauhaus-school',
  name: { en: 'The Bauhaus building', zh: '包豪斯校舍' },
  era: { en: 'Bauhaus Dessau, 1926', zh: '德绍包豪斯，1926年' },
  style: 'bauhaus',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [4, 9.2], facing: 'w' },
  bounds: [-24, -34, 58, 42],
  bakeBounds: [-24, -34, 58, 42],
  view: [-17, -28, 51, 34],
  bakeTop: 18,
  elements: [{ t: 'bauhaus_school' }],
  rooms,
  walks: [],
};
export default school;

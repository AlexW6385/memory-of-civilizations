// The Mycenaean style (Late Helladic IIIB, about 1250 BC; docs/settlements/mycenae.md §4): Cyclopean walls and dressed conglomerate, the Lion Gate, the
// palace with its megaron, the tholos tomb, the houses of rubble and plastered mudbrick. Frescoes and the downward-tapering column come from the Minoan style.
import { registerStyle } from '../../core/build.js';
import '../minoan/index.js';
import '../minoan/rooms.js';
import { wallRun, northGate, lionGate } from './wall.js';
import { palaceWing, court, propylon, megaron } from './palace.js';
import { treasury, graveCircle } from './tomb.js';
import { house, granary, yard } from './house.js';

registerStyle('mycenaean', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { wall_run: wallRun, north_gate: northGate, lion_gate: lionGate, palace_wing: palaceWing, court, propylon, megaron, treasury, grave_circle: graveCircle, house, granary, yard },
  objects: {},
});

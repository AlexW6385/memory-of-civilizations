// The town of Dessau around the school (docs/settlements/bauhaus-dessau.md §3–§4, §11): the tenements, the Masters' Houses, the Törten rows and the
// Konsum, the street furniture, and a bicycle. The builders live in tenement.js, masters.js, torten.js and street.js. Plan coordinates, metres.
import { S } from './kit.js';
import { dessauHouse } from './tenement.js';
import { masterHouse } from './masters.js';
import { tortenRow, konsum } from './torten.js';
import { dessauStreet } from './street.js';
import { bauhausGarden } from './garden.js';

/** bicycle: a 1920s roadster standing at `at` turned by rot. */
function bicycle(el, ctx) {
  const sk = new S(ctx), [x, z] = el.at, c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0), y = el.y ?? 0, W = (u, h) => [x + u * s, y + h, z + u * c];
  for (const u of [-0.55, 0.55]) for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, b = a + Math.PI / 4; sk.rod('iron', W(u + Math.cos(a) * 0.33, 0.34 + Math.sin(a) * 0.33), W(u + Math.cos(b) * 0.33, 0.34 + Math.sin(b) * 0.33), 0.012, 3); }
  sk.rod('iron', W(-0.55, 0.34), W(0.0, 0.62), 0.015, 4); sk.rod('iron', W(0.0, 0.62), W(0.5, 0.65), 0.015, 4); sk.rod('iron', W(0.5, 0.65), W(0.55, 0.34), 0.015, 4);
  sk.rod('iron', W(0.5, 0.65), W(0.46, 0.92), 0.015, 4); sk.rod('iron', W(0.36, 0.95), W(0.56, 0.95), 0.012, 4); sk.b('iron', W(-0.05, 0.64)[0] - 0.12, y + 0.64, W(-0.05, 0.64)[2] - 0.05, W(-0.05, 0.64)[0] + 0.12, y + 0.68, W(-0.05, 0.64)[2] + 0.05);
}

export const HOUSE_ELEMENTS = { dessau_house: dessauHouse, bauhaus_master: masterHouse, torten_row: tortenRow, konsum, dessau_street: dessauStreet, bauhaus_garden: bauhausGarden, bicycle };

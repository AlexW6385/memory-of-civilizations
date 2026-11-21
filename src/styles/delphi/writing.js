// What is written at Delphi (docs/settlements/delphi.md §15.5): Greek capitals laid as thin rods (the table of src/styles/ptolemaic/script.js, which carries the
// verified letters of Athens and adds Ξ and Ω; a letter it lacks makes the text refuse, so nothing is written wrong). The maxims on the pronaos wall and the
// trade words on the shop boards. Registers `dl_text` { lines, at: [x, z], n: [nx, nz], y (top of the first line), h, mat, pitch } into the greek elements, as house.js does.
import { STYLES } from '../../core/build.js';
import '../greek/index.js';
import { inscribe, layout, missing } from '../ptolemaic/script.js';

/** The words on the boards: the goods of each trade, in the plain nominative (ΧΑΛΚΟΣ bronze, ΜΥΡΟΝ perfume, ΙΜΑΤΙΑ cloaks, ΟΙΝΟΣ wine, ΚΕΡΑΜΟΣ pottery, ΑΡΤΟΙ loaves, ΤΕΚΤΩΝ carpenter, ΛΙΘΟΙ stones). */
export const TRADE_WORD = { bronze: 'ΧΑΛΚΟΣ', perfume: 'ΜΥΡΟΝ', cloth: 'ΙΜΑΤΙΑ', wine: 'ΟΙΝΟΣ', pottery: 'ΚΕΡΑΜΟΣ', baker: 'ΑΡΤΟΙ', carpenter: 'ΤΕΚΤΩΝ', mason: 'ΛΙΘΟΙ' };
/** The maxims of the pronaos: Know thyself; Nothing in excess (the third, "Surety brings ruin", is left uncut: its elided form is not in the table). */
export const MAXIMS = [['ΓΝΩΘΙ', 'ΣΑΥΤΟΝ'], ['ΜΗΔΕΝ', 'ΑΓΑΝ']];
/** The half-width of a line of `text` at letter height h (m). */
export const textWidth = (text, h, pitch = 0.22) => layout(text, pitch).width * h;

function dlText(el, { bag }) {
  for (const t of el.lines) if (missing(t).length) throw new Error(`delphi text cannot be written: ${t}`);
  inscribe(bag, el.lines, { at: el.at, n: el.n, y: el.y, h: el.h ?? 0.2, mat: el.mat ?? 'marble_dark', pitch: el.pitch ?? 0.22, line: el.line ?? 1.5 });
}
Object.assign(STYLES.greek.elements, { dl_text: dlText });

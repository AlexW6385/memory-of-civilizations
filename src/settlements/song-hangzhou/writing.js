// Writing in Lin'an (docs/settlements/song-hangzhou.md §31): the pagoda's name in gilt relief on the name board of the temple court's south gate.
// The brush is Suzhou's (src/settlements/ming-suzhou/brush.js, read-only: a generic stroke-to-ribbon routine, no Suzhou data); the characters are
// 和 and 塔 from Suzhou's checked set and 六 from writing-data.js (checked there). Only characters whose forms are verified are written.
import { STYLES } from '../../core/build.js';
import { GLYPH } from '../ming-suzhou/brush-data.js';
import { reliefGeometry } from '../ming-suzhou/brush.js';
import { GLYPH_HZ } from './writing-data.js';
import '../../styles/song/index.js';

/** The strokes of a character we can write, or null (never a guess). */
export const strokesOf = (ch) => GLYPH_HZ[ch] ?? GLYPH[ch] ?? null;
export const canWrite = (text) => [...text].every((c) => strokesOf(c));

/**
 * hz_gate_name { c: [x, z] (the gate's centre), y, dir ('s' | 'n'), text, gap, size }: the characters of `text`, left to right as the viewer outside the
 * gate sees them, raised on the gate's name board (templeGate in src/styles/song/hangzhou.js: the dark field under the lintel, 0.26 m high, 0.02 m proud).
 */
STYLES.song.elements.hz_gate_name = (el, { bag }) => {
  if (!canWrite(el.text)) return;
  const [cx, cz] = el.c, sd = el.dir === 'n' ? -1 : 1, size = el.size ?? 0.22, gap = el.gap ?? 0.62, chars = [...el.text];
  const by = el.y + 4.3 - 0.42, cy = by - 0.25, z = cz + sd * 0.42;
  chars.forEach((ch, i) => {
    const u = (i - (chars.length - 1) / 2) * gap;
    const g = reliefGeometry(strokesOf(ch), 0, 0, size, 0, 0.012, { top: 0.6 });
    if (sd < 0) g.rotateY(Math.PI);
    bag.add('clay_gilt', g.translate(cx + u, cy, z));
  });
};

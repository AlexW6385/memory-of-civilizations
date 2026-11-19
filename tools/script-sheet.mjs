#!/usr/bin/env node
// Dumps the 2D outlines of Ming Suzhou's brush characters as JSON, for tools/script-sheet.py (which lays
// them over a typeface to check every stroke): node tools/script-sheet.mjs [chars] > /tmp/sz/outlines.json
import { GLYPH, COUNT } from '../src/settlements/ming-suzhou/brush-data.js';
import { outlines, weightOf } from '../src/settlements/ming-suzhou/brush.js';
const want = [...(process.argv[2] ?? Object.keys(GLYPH).join(''))];
const out = {};
for (const c of want) { if (!GLYPH[c]) { console.error('no glyph', c); continue; } out[c] = { count: COUNT[c], strokes: GLYPH[c].length, W: weightOf(GLYPH[c]), polys: outlines(GLYPH[c]) }; }
console.log(JSON.stringify(out));

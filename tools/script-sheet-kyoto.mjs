#!/usr/bin/env node
// Dumps the 2D outlines of Muromachi Kyoto's brush characters as JSON, for tools/script-sheet.py (which lays them over a typeface to
// check every stroke): node tools/script-sheet-kyoto.mjs [chars] > /tmp/kyo/outlines.json
import { GLYPH, COUNT, glyphOf, countOf } from '../src/styles/muromachi/script.js';
import { outlines, weightOf } from '../src/settlements/ming-suzhou/brush.js';
const want = [...(process.argv[2] ?? Object.keys(GLYPH).join(''))];
const out = {};
for (const c of want) { const g = glyphOf(c); if (!g) { console.error('no glyph', c); continue; } out[c] = { count: countOf(c), strokes: g.length, W: weightOf(g), polys: outlines(g) }; }
void COUNT;
console.log(JSON.stringify(out));

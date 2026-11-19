// Every settlement's sound voices go into the engine's one shared voice table; a name defined twice used to be silently
// overwritten (one settlement played another's voice). This loads every voice module as the engine does and fails on any
// name (voice or gain-table key) defined by more than one module. Give each settlement's voices its prefix (ath, ott, qing, flo, ven ...).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  ...fs.readdirSync(path.join(root, 'src/engine')).filter((f) => /^voices(-.*)?\.js$/.test(f)).map((f) => `src/engine/${f}`),
  ...fs.readdirSync(path.join(root, 'src/settlements'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).flatMap((d) => fs.readdirSync(path.join(root, 'src/settlements', d)).filter((f) => /^voices.*\.js$/.test(f)).map((f) => `src/settlements/${d}/${f}`)),
];
const engine = await import(pathToFileURL(path.join(root, 'src/engine/voices.js')).href);
const loadErrors = [];
for (const f of files) {
  try { await import(pathToFileURL(path.join(root, f)).href); } catch (e) { loadErrors.push(`${f}: ${e.message}`); }
}

test('no voice or gain name is defined by more than one module', () => {
  const lines = engine.VOICE_CONFLICTS.map((c) => `${c.kind} '${c.name}' defined by ${c.modules.join(' and ')}`);
  assert.deepEqual(lines, [], `voice names defined twice:\n  ${lines.join('\n  ')}`);
  assert.deepEqual(loadErrors, [], `voice modules failed to load:\n  ${loadErrors.join('\n  ')}`);
});

test('every voice module is registered through addVoices (none writes VOICES/GAIN itself)', () => {
  const owners = new Set(engine.VOICE_OWNER.values());
  for (const f of files) {
    const src = fs.readFileSync(path.join(root, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    if (f.endsWith('/voices.js') && f.startsWith('src/engine')) continue;
    assert.ok(!/Object\.assign\(\s*(VOICES|GAIN)\b|\b(VOICES|GAIN)\[[^\]]+\]\s*=[^=]/.test(src), `${f} writes VOICES/GAIN directly; use addVoices`);
    if (/export const \w*VOICES\w* =/.test(src)) assert.ok([...owners].some((o) => f.endsWith(o)), `${f} defines voices but none are registered`);
  }
});

test('addVoices refuses to overwrite and names the name and both modules', () => {
  const before = engine.VOICE_CONFLICTS.length;
  engine.addVoices('a-test.js', { zzTestVoice() {} }, { zzTestVoice: 1 });
  assert.throws(() => engine.addVoices('b-test.js', { zzTestVoice() {} }), /voice 'zzTestVoice' \(a-test\.js and b-test\.js\)/);
  assert.throws(() => engine.addVoices('c-test.js', {}, { zzTestVoice: 2 }), /gain 'zzTestVoice' \(a-test\.js and c-test\.js\)/);
  assert.throws(() => engine.addVoices('d-test.js', { hammer() {} }), /voice 'hammer' \(voices\.js and d-test\.js\)/);
  assert.equal(engine.VOICES.zzTestVoice.name, 'zzTestVoice', 'the first stays');
  engine.VOICE_CONFLICTS.length = before;     // these were deliberate
  delete engine.VOICES.zzTestVoice; delete engine.GAIN.zzTestVoice; engine.VOICE_OWNER.delete('zzTestVoice'); engine.GAIN_OWNER.delete('zzTestVoice');
});

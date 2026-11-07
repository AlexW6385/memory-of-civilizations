#!/usr/bin/env node
// Checks the cached shadow cascades (src/engine/shadow-cache.js) in a small scene drawn through
// the game's renderer: a view held still is the same, pixel for pixel, whether its cascades come
// from the cache or are drawn whole; a moving caster leaves no trace once it has moved back; the
// cascades come from the cache while nothing moves. usage: node tools/shadow-cache-check.mjs
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { serve } from './serve.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const srv = await serve(0);
const browser = await chromium.launch({ args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--use-webgpu-adapter=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 480, height: 270 } });
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(m.type(), m.text().slice(0, 300)); });
page.on('pageerror', (e) => console.log('pageerror', e.message));
const SAVE = process.env.SAVE;
let shotN = 0;
const shot = async () => { const b = await page.screenshot(); if (SAVE) { mkdirSync(SAVE, { recursive: true }); writeFileSync(`${SAVE}/${shotN++}.png`, b); } return PNG.sync.read(b); };
const diff = (a, b) => { let n = 0; for (let i = 0; i < a.data.length; i += 4) if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) n++; return n; };
let ok = true;
const check = (name, cond, info = '') => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${name} ${info}`); ok &&= cond; };
try {
  await page.goto(`http://127.0.0.1:${srv.address().port}/tools/shadow-cache-check.html${process.argv[2] || ''}`, { timeout: 600000 });
  await page.waitForFunction('window.READY === true', null, { timeout: 600000 });
  await page.evaluate(() => T.frames(8));
  const A = await shot();
  const s0 = await page.evaluate(() => T.stats());
  await page.evaluate(() => T.frames(6));
  const s1 = await page.evaluate(() => T.stats());
  check('cache on', s0.cache === true, JSON.stringify(s1));
  check('held still: cascades from the cache', s1.full === s0.full && s1.cached > s0.cached);
  const A2 = await shot();
  check('held still: frames alike', diff(A, A2) === 0, `${diff(A, A2)} px`);
  await page.evaluate(() => { T.dirty(); return T.frames(6); });
  const B = await shot();
  check('cached = drawn whole', diff(A, B) === 0, `${diff(A, B)} px`);
  await page.evaluate(() => { T.shift(3); return T.frames(6); });
  const M = await shot();
  check('moving caster: its shadow moves', diff(A, M) > 200, `${diff(A, M)} px`);
  const s2 = await page.evaluate(() => T.stats());
  check('moving caster: static part still cached', s2.full === s1.full + 3 || s2.full - s1.full <= 3, JSON.stringify(s2));
  await page.evaluate(() => { T.shift(0); return T.frames(6); });
  const C = await shot();
  check('moved back: no trace', diff(A, C) === 0, `${diff(A, C)} px`);
  const s3 = await page.evaluate(() => T.stats());
  await page.evaluate(() => { T.moveBox(4); return T.frames(6); });
  const D = await shot(), s4 = await page.evaluate(() => T.stats());
  check('a static caster moved: cascades drawn again', s4.full > s3.full && diff(A, D) > 200, `${diff(A, D)} px`);
  await page.evaluate(() => { T.moveBox(-4); return T.frames(6); });
  const E = await shot();
  check('moved back: as before', diff(A, E) === 0, `${diff(A, E)} px`);
  await page.evaluate(() => { T.hideDyn(true); return T.frames(6); });
  const s5 = await page.evaluate(() => T.stats());
  await page.evaluate(() => T.frames(6));
  const s6 = await page.evaluate(() => T.stats());
  check('nothing moving: cascades not drawn at all', s6.skipped > s5.skipped && s6.cached === s5.cached && s6.full === s5.full, JSON.stringify(s6));
} catch (e) { console.log('failed:', e.message.split('\n')[0]); ok = false; } finally { await browser.close(); srv.close(); }
process.exitCode = ok ? 0 : 1;

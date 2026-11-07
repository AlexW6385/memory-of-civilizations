#!/usr/bin/env node
// Sound check without the world: the audio engine in a browser, through each kind of room
// (src/engine/acoustics.js), the early reflections outdoors, the place's voices and every event of
// the hours (src/engine/soundscape.js). Reports the output level of each and any page error.
//
// usage: node tools/sound-check.mjs
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const srv = await serve(0);
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) errors.push(m.text()); });
await page.goto(`http://127.0.0.1:${srv.address().port}/tools/showroom.html`).catch(() => {});
const out = await page.evaluate(async () => {
  const { Music } = await import('/src/engine/audio.js');
  const { HALLS, acoustics } = await import('/src/engine/acoustics.js');
  const sc = (await import('/src/settlements/constantinople/music.js')).default;
  const m = new Music();
  m.start();
  await m.ctx.resume();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const peak = async (ms) => { let p = 0; const t1 = performance.now() + ms; while (performance.now() < t1) { p = Math.max(p, m.level()); await wait(50); } return p; };
  const res = {};
  m.ambience(0.6, 0.4, false);
  m.place({ water: 0.5, birds: 1, town: 0.8, voices: { dove: 1, crow: 1, gull: 1, koel: 1, kite: 1, tropic: 1, sparrow: 1 }, animals: { rooster: 1, dog: 1, donkey: 1, cattle: 1, goat: 1, sheepbell: 1, horse: 1 }, cicadas: 1, frogs: 1, dawn: 1, roof: 'tile', rain: 0.6 });
  m.set(sc, 'open'); m.room(null); m.surround([3, 5, Infinity, 8, 20, Infinity, 4, 6]);
  res.outdoors = await peak(2500);
  for (const [id, room] of [['hagia-sophia', 'nave'], ['norse-borgund-church', 'nave'], ['giza-great-pyramid', 'kings-chamber'], ['sainte-chapelle', 'upper-chapel']]) {
    const A = acoustics(id + '/' + room, HALLS[id][room]);
    const t0 = performance.now();
    m.set(sc, 'hall'); m.room(A);
    res['ir ' + id] = Math.round(performance.now() - t0) + ' ms';
    res[id] = await peak(1500);
  }
  res.fed = m.slots.filter((s) => s.fed).length;
  m.room(null);
  await wait(500);
  for (const ev of ['angelus', 'office', 'strike:3', 'marangona', 'carillon:2', 'quarter:3', 'hour:2', 'toki:4', 'bonsho', 'hanshan', 'bosingak', 'zhong', 'gu', 'drum-tower', 'zvon', 'semantron', 'dungchen', 'puja', 'adhan:fajr']) {
    m.ringBusy = 0;
    m.ring(ev, { many: true });
    res[ev] = await peak(700);
  }
  for (const roof of ['thatch', 'slate', 'shingle', 'flat']) m.place({ roof, rain: 1, indoors: true });
  res.nodes = 'ok';
  return res;
});
for (const [k, v] of Object.entries(out)) console.log(`${k}: ${typeof v === 'number' ? v.toFixed(4) : v}`);
for (const e of errors) console.log('  error: ' + e);
await browser.close();
srv.close();
process.exit(errors.length || Object.values(out).some((v) => typeof v === 'number' && v < 0.002 && v !== out.fed) ? 1 : 0);

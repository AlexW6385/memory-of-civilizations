// The hours of each place (src/engine/soundscape.js): bells, drums and calls fall when the sources
// say, and only where they belong.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, existsSync } from 'node:fs';
import { PROFILES, profileOf, due } from '../src/engine/soundscape.js';

// a day at the equinox, sampled every 0.5 game-minutes: the sun's elevation from the hour at latitude lat
const day = (P, lat) => {
  const evs = [];
  let prev = null;
  for (let m = 0; m <= 24 * 60; m += 0.5) {
    const hour = (m / 60) % 24, H = (hour - 12) * 15 * Math.PI / 180, L = lat * Math.PI / 180;
    const el = Math.asin(Math.cos(L) * Math.cos(H)) * 180 / Math.PI;
    const now = { hour, el, lat };
    for (const e of due(P, prev, now)) evs.push([hour, e]);
    prev = now;
  }
  return evs;
};

test('every settlement has a profile', () => {
  const root = new URL('../src/settlements/', import.meta.url);
  for (const id of readdirSync(root)) if (existsSync(new URL(id + '/index.js', root))) assert.ok(PROFILES[id], id);
});

test('five calls to prayer a day, in order, only where the adhan is heard', () => {
  const ev = day(profileOf('mamluk-cairo'), 30).filter(([, e]) => e.startsWith('adhan'));
  assert.deepEqual(ev.map(([, e]) => e), ['adhan:fajr', 'adhan:dhuhr', 'adhan:asr', 'adhan:maghrib', 'adhan:isha']);
  const [fajr, dhuhr, asr, maghrib, isha] = ev.map(([h]) => h);
  assert.ok(fajr > 4.5 && fajr < 5.2, `fajr ${fajr}`);
  assert.ok(dhuhr > 12 && dhuhr < 12.2);
  assert.ok(asr > 15 && asr < 16, `asr ${asr}`);
  assert.ok(maghrib > 17.9 && maghrib < 18.2, `maghrib ${maghrib}`);
  assert.ok(isha > 19 && isha < 19.6, `isha ${isha}`);
  // the Hanafi Asr (Ottoman) is later than the Shafi'i (Mamluk)
  const hanafi = day(profileOf('ottoman-istanbul'), 41).find(([, e]) => e === 'adhan:asr')[0], shafii = day(profileOf('mamluk-cairo'), 41).find(([, e]) => e === 'adhan:asr')[0];
  assert.ok(hanafi > shafii + 0.5, `${hanafi} vs ${shafii}`);
  for (const id of ['paris', 'nara', 'constantinople', 'giza', 'new-york']) assert.equal(day(profileOf(id), 40).filter(([, e]) => e.startsWith('adhan')).length, 0, id);
});

test('bells by the sources', () => {
  const names = (id) => day(profileOf(id), 40).map(([, e]) => e);
  assert.equal(names('joseon-seoul').filter((e) => e === 'bosingak').length, 2);
  assert.equal(names('florence').filter((e) => e === 'angelus').length, 3);
  assert.equal(names('paris').filter((e) => e === 'angelus').length, 0, 'no Angelus in 1248');
  assert.equal(names('constantinople').filter((e) => e === 'semantron').length, 2);
  assert.ok(!names('constantinople').some((e) => /angelus|office|strike/.test(e)), 'no bells in 562');
  const ld = day(profileOf('london'), 51);
  assert.equal(ld.length, 96, 'Westminster: every quarter');
  assert.deepEqual(ld.find(([h]) => h > 12 && h < 12.01)[1], 'hour:12');
  const edo = day(profileOf('edo-himeji'), 35).map(([h, e]) => [Math.round(h), e]);
  assert.deepEqual(edo.find(([h]) => h === 12), [12, 'toki:9']);
  assert.deepEqual(edo.find(([h]) => h === 18), [18, 'toki:6']);
});

test('a jump of the clock rings nothing', () => {
  assert.deepEqual(due(profileOf('london'), { hour: 3, el: -40, lat: 51 }, { hour: 9, el: 30, lat: 51 }), []);
});

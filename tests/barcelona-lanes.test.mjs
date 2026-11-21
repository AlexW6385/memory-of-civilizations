// Nothing stands in the lane to a shop's or a portal's door (docs/settlements/barcelona.md §15.3): the street sellers and the gas lamps keep off it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blockElements, vendors, fanals, inLane } from '../src/settlements/barcelona/town.js';
import { arrivalLife, arrivalStreet } from '../src/settlements/barcelona/arrival.js';

test('vendors, lamps and the arrival street keep out of the door lanes', () => {
  const els = blockElements();
  for (const e of vendors(els)) if (e.at) assert.ok(!inLane(e.at[0], e.at[1], els, 1.0, 0.3), `${e.t} at ${e.at}`);
  for (const e of fanals(els)) assert.ok(!inLane(e.at[0], e.at[1], els, 1.0, 0.3), `lamp at ${e.at}`);
  for (const e of [...arrivalLife(), ...arrivalStreet()]) if (e.at) assert.ok(!inLane(e.at[0], e.at[1], els, 0.6, 0.6), `${e.t} at ${e.at}`);
});

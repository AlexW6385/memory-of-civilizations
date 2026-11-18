// Life in the open country (DESIGN §4.2): wild animals by biome (src/planet/wild-fauna.js) and the
// travellers on the roads between a region's settlements (src/planet/travellers.js). A system
// (src/engine/systems.js) that works in the planet's frame, not a settlement's: it draws only where
// the visitor stands in the open country — in a settlement's zone (its disc and blend) and high up
// nothing is drawn and nothing is made, so a settlement's arrival costs none of it. `?wild=0` turns it off.

import { registerSystem } from './systems.js';
import { ENV } from './env.js';
import { WildFauna } from '../planet/wild-fauna.js';
import { Travellers } from '../planet/travellers.js';
import { PLANET_RADIUS } from '../planet/sites.js';

const ON = typeof location === 'undefined' || new URLSearchParams(location.search).get('wild') !== '0';
const DEBUG = typeof location !== 'undefined' && new URLSearchParams(location.search).has('wilddebug');
let wild = null, trav = null, clock = 0;

export const WILD_LIFE = registerSystem({
  update(dt, camera, world) {
    if (!ON || !world.planet || !world.r) return;
    if (!wild) {
      wild = new WildFauna(world.planet);
      trav = new Travellers(world.planet, wild.beasts);
      const pre = world.r.precompile ? (o) => world.r.precompile(o) : null;
      wild.precompile = pre; trav.precompile = pre;
    }
    if (DEBUG && !globalThis.__wildlife) globalThis.__wildlife = { wild, trav };
    clock += dt;
    const cam = world.toPlanet(camera.position.toArray()), alt = Math.hypot(cam[0], cam[1], cam[2]) - PLANET_RADIUS;
    // (nothing while the start loads, nor in a settlement's zone)
    const off = !!world.anchor?.site || !!world.starting;
    const o = { night: ENV.night.value, rain: ENV.rain.value, quality: world.r.quality, off, time: clock };
    wild.update(dt, cam, alt, o);
    trav.update(dt, cam, alt, o);
    wild.finish();
  },
});

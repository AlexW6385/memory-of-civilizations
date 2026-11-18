// The hall's sculpture, registered into its own `foguang-hall` style (docs/settlements/tang-wutai.md §18): the seated figures of
// the altar, the standing and kneeling bodhisattvas, the mounts, the portrait figures. Each element is ONE geometry per material.

import { STYLES, registerStyle } from '../../core/build.js';
import './roofwork.js';
import { place } from '../../core/geom.js';
import { seated } from './sculpt-buddha.js';
import { bodhisattva } from './sculpt-bodhi.js';
import { elephant, lion } from './sculpt-mount.js';
import { portrait } from './sculpt-portrait.js';
import { fgBracketSet } from './sculpt-bracket.js';
import { fgDoor, fgCheek } from './sculpt-arch.js';

const put = (el, bag, A, s) => {
  const [x, z] = el.at, dir = el.dir || [-1, 0], yaw = Math.atan2(dir[0], dir[1]);
  A.emit(bag, (g) => place(g, x, el.y, z, yaw, s));
};

/** fg_buddha { at, y, h, dir, pose, pendant, hexSeat, crown, robe, robe2, lod, seed }: a seated figure on its throne, 5.2 m high at h = 5.2. */
function fgBuddha(el, { bag }) {
  const H = el.h || 5.2;
  put(el, bag, seated({ ...el, seed: el.seed ?? Math.round(el.at[0] * 13 + el.at[1] * 29) }), H / 5.2);
}

/** fg_bodhi { at, y, h, dir, pose: 'stand' | 'kneel', lod, robe, robe2, seed }: a standing or kneeling bodhisattva, 2.4 m at h = 2.4 (pedestal included). */
function fgBodhi(el, { bag }) {
  put(el, bag, bodhisattva({ ...el, seed: el.seed ?? Math.round(el.at[0] * 31 + el.at[1] * 17 + 1000) }), (el.h || 2.4) / 2.4);
}

/** fg_mount { at, y, dir, animal: 'lion' | 'elephant', rider (the rider's height), lod }: the animal, and on its back a crowned bodhisattva on a lotus. */
function fgMount(el, { bag }) {
  const big = el.animal === 'elephant', seed = el.seed ?? Math.round(el.at[0] * 7 + el.at[1] * 13 + 500);
  put(el, bag, (big ? elephant : lion)({ ...el, seed }), 1);
  const top = big ? 1.98 : 1.36, [x, z] = el.at, d = el.dir || [-1, 0];
  const sc = (el.rider || 2.9) / 5.2, yaw = Math.atan2(d[1] === undefined ? 0 : d[0], d[1]);
  const R = seated({ crown: true, rider: true, robe: 'clay_green', robe2: 'clay_robe', seed, lod: el.lod ?? 2 });
  R.emit(bag, (g) => place(g, x - d[0] * (big ? 0 : 0.2), el.y + top - 1.1 * sc, z - d[1] * (big ? 0 : 0.2), yaw, sc));
}

/** fg_portrait { at, y, dir, who: 'donor' | 'monk', lod }: Ning Gongyu or the monk Yuancheng, seated life-size on a low dais. */
function fgPortrait(el, { bag }) {
  put(el, bag, portrait({ ...el, seed: el.seed ?? Math.round(el.at[0] * 11 + el.at[1] * 3 + 40) }), 1);
}

const base = STYLES['foguang-hall'];
registerStyle('foguang-hall', { ...base, elements: { ...base.elements, fg_bracket_set: fgBracketSet, fg_door: fgDoor, fg_cheek: fgCheek }, objects: { ...base.objects, fg_buddha: fgBuddha, fg_bodhi: fgBodhi, fg_mount: fgMount, fg_portrait: fgPortrait } });

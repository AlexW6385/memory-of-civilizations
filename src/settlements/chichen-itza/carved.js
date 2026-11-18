// Chichén Itzá, sculpture pass (docs/settlements/chichen-itza.md §18): the modelled carvings, registered on the maya style from this folder.
import '../../styles/maya/index.js';
import { STYLES } from '../../core/build.js';
import { Parts, at, frameM } from './sculpt.js';
import { serpentHead, serpentColumn, ballRing } from './serpent.js';

const E = STYLES.maya.elements, yawOf = ([dx, dz]) => Math.atan2(dx, dz);

/** cz_serpent_head { at [x, z] (the block's back), dir [dx, dz] (the jaws), y, s, lod }. */
E.cz_serpent_head = (el, { bag }) => {
  const [x, z] = el.at, [dx, dz] = el.dir ?? [0, 1], s = el.s ?? 1, P = serpentHead(new Parts(), { part: el.part ?? 'all' });
  P.emit(bag, at(x - dx * 0.3 * s, el.y ?? 0, z - dz * 0.3 * s, yawOf([dx, dz]), s));
};
/** cz_serpent_column { at [x, z], dir, y, H, lod }. */
E.cz_serpent_column = (el, { bag, col }) => {
  const [x, z] = el.at, d = el.dir ?? [0, 1], P = serpentColumn(new Parts(), el.H, { part: el.part ?? 'all' });
  P.emit(bag, at(x, el.y ?? 0, z, yawOf(d)));
  if (!el.nocollide) col.rect([x - 0.45, z - 0.45, x + 0.45, z + 0.45], el.y ?? 0, (el.y ?? 0) + el.H);
};
E.cz_ball_ring = (el, { bag }) => {
  ballRing(new Parts(), { part: el.part ?? 'all' }).emit(bag, at(el.at[0], el.y, el.at[1], yawOf(el.dir)));
};

import { Matrix4 } from '../../core/three.js';
import { warrior, atlantean, chacmool } from './figures.js';
import { reliefSqueeze } from './sculpt.js';
/** Showroom items: a figure by name { what, at, y, h, yaw, k }. */
E.cz_figure = (el, { bag }) => {
  const P = new Parts(), lod = el.lod ?? 0;
  ({ warrior, atlantean, chacmool })[el.what](P, { part: el.part ?? 'all' });
  P.emit(bag, at(el.at[0], el.y ?? 0, el.at[1], el.yaw ?? 0, el.h ?? 1), el.k ? reliefSqueeze(el.k, 0) : null);
};
void Matrix4;

import { pillarFace, ballPanel } from './relief.js';
/** Showroom: a panel by name. */
E.cz_panel = (el, { bag }) => {
  const P = el.what === 'pillar' ? pillarFace(el.part ?? 'base') : ballPanel(el.part ?? 'base', el.w ?? 12);
  P.emit(bag, at(el.at[0], el.y ?? 0, el.at[1], el.yaw ?? 0));
};

import { atlantean as atlanteanFig, chacmool as chacmoolFig } from './figures.js';

// ---- the new ones ----
/** cz_chacmool { at, dir, y, part, nocollide }: lying along the carving's x, the face turned to +z (the way the stair goes down). */
E.cz_chacmool = (el, { bag, col }) => {
  const [x, z] = el.at, [dx, dz] = el.dir, y = el.y;
  const P = chacmoolFig(new Parts(), { part: el.part ?? 'all' });
  P.emit(bag, at(x, y + 0.27, z, yawOf([dx, dz])).multiply(new Matrix4().makeRotationY(Math.PI / 2).multiply(new Matrix4().makeScale(1.5, 1.5, 1.5))));
  if (!el.nocollide) col.rect(dx ? [x - 0.4, z - 0.9, x + 0.4, z + 0.9] : [x - 0.9, z - 0.4, x + 0.9, z + 0.4], y, y + 1);
};
/** cz_atlanteans { list: [[x, z, dx, dz]], y, part, s }: the little figures under the altar. */
E.cz_atlanteans = (el, { bag }) => {
  const P = atlanteanFig(new Parts(), { part: el.part ?? 'all' });
  for (const [x, z, dx, dz] of el.list) P.emit(bag, at(x, el.y, z, yawOf([dx, dz]), 1).multiply(new Matrix4().makeScale(1.35 * (el.s ?? 0.9), el.s ?? 0.9, el.s ?? 0.9)));
};
/** cz_pillars { list: [[x, z, y (the first face's foot), scale]], part }: the carved faces over the warriors' pillars (the old flat panels stand 9 cm out; these clear them). */
E.cz_pillars = (el, { bag }) => {
  for (const [x, z, y, sc] of el.list) {
    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([fx, fz], i) => {
      pillarFace(el.part, i % 2 ? -1 : 1).emit(bag, at(x + fx * 0.4, y, z + fz * 0.4, yawOf([fx, fz]), sc ?? 1));
    });
  }
};
/** cz_ball_panel { O, U, V, N, part, w, h }: a bench panel laid on the slanted face (the frame of the old panels). */
E.cz_ball_panel = (el, { bag }) => { ballPanel(el.part, el.w ?? 12, el.h ?? 1.95).emit(bag, frameM(el.O, el.U, el.V, el.N)); };

import { skullBand, eaglePanel, jaguarPanel } from './relief.js';
/** cz_skulls { bands: [[x, y, z, nx, nz, len]], part }: a band of skulls along (the wall's direction), facing (nx, nz). */
E.cz_skulls = (el, { bag }) => {
  for (const [x, y, z, ux, uz, nx, nz, len] of el.bands) {
    // the band's x runs along (ux, uz), its z out along (nx, nz)
    const m = new Matrix4().set(ux, 0, nx, x, 0, 1, 0, y, uz, 0, nz, z, 0, 0, 0, 1);
    skullBand(el.part, len, Math.round(x * 3 + z)).emit(bag, m);
  }
};
/** cz_animal_panel { what: 'eagle' | 'jaguar', f, at, y, dir, part }. */
E.cz_animal_panel = (el, { bag }) => {
  (el.what === 'eagle' ? eaglePanel : jaguarPanel)(el.part, el.f).emit(bag, at(el.at[0], el.y, el.at[1], yawOf(el.dir)));
};

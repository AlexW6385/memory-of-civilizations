// Bianjing's own townscape pieces on top of the Song vocabulary (src/styles/song): the commoners' houses (houses.js).
import { STYLES, registerStyle } from '../../core/build.js';
import '../../styles/song/index.js';
import { houseSong } from './houses.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { houseFar } from './far.js';
import { bianRevetment, wharf } from './banks.js';

/**
 * The Iron Pagoda (the song style's pagoda_oct) with the moulded bricks' smallest pieces left out: the heads, hands, topknots and bosses of the
 * relief, under 10 cm across (under two pixels from the arrival, 50 m off), are a third of its ~1.1 M triangles.
 */
const TINY = 0.1;
function ironPagoda(el, ctx) {
  const bag = Object.create(ctx.bag), inst = ctx.bag.addInstance.bind(ctx.bag);
  // a brick's pieces (one material, one matrix, one after another) are merged into one shape and placed once: a fifth of the calls
  let pend = null;
  const flush = () => {
    if (!pend) return;
    const { mat, parts, matrix, o } = pend; pend = null;
    let n = 0; for (const g of parts) n += g.attributes.position.array.length;
    const pos = new Float32Array(n), nor = new Float32Array(n);
    let k = 0; for (const g of parts) { pos.set(g.attributes.position.array, k); nor.set(g.attributes.normal.array, k); k += g.attributes.position.array.length; }
    const m = new BufferGeometry();
    m.setAttribute('position', new Float32BufferAttribute(pos, 3)); m.setAttribute('normal', new Float32BufferAttribute(nor, 3));
    inst(mat, m, matrix, o);
  };
  bag.addInstance = (mat, g, matrix, o) => {
    g.computeBoundingBox();
    const b = g.boundingBox;
    if (Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z) < TINY) return;
    if (g.index) g = g.toNonIndexed();
    if (pend && pend.mat === mat && pend.matrix.equals(matrix)) { pend.parts.push(g); return; }
    flush();
    pend = { mat, parts: [g], matrix: matrix.clone(), o };
  };
  STYLES.song.elements.pagoda_oct(el, { ...ctx, bag });
  flush();
}
registerStyle('kaifeng-site', { ...STYLES.song, elements: { ...STYLES.song.elements, house_song: houseSong, kf_pagoda: ironPagoda, kf_far_wall: houseFar, kf_mid_wall: houseSong, bian_revetment: bianRevetment, wharf } });

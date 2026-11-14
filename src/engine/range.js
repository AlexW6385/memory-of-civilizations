// How far things are drawn, as a multiple of the distances each part of the engine names: plants and their
// shadows, street life, fine detail and its shadows, the full-detail copies of repeated pieces, the sun's
// shadow cascades. 1.5 by default; `?range=1` (or any number from 0.5 to 3) sets it for a visit.
const q = +new URLSearchParams(globalThis.location?.search || '').get('range');
export const RANGE = Number.isFinite(q) && q >= 0.5 && q <= 3 ? q : 1.5;

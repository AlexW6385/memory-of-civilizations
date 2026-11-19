// The temple's halls inside (docs/settlements/ming-suzhou.md §26): the main hall's altar with the three Buddhas, the disciples and arhats,
// the offerings, banners, canopy, cushions, drum and bell; the side halls by their use; the gate's guardian kings.
import { Parts } from './props.js';
import { Fig, buddha, throne, disciple, king, lohan, attendant } from './templefig.js';

/** temple_figure { kind, at: [x, z], y, yaw, k, ...options }: one image, for looking at. */
export function templeFigure(el, { bag }) {
  const F = new Fig(el.k ?? 1), P = new Parts();
  if (el.kind === 'buddha') { buddha(F, el); throne(F, 0.62, 0.6, el.lod ?? 0); }
  else if (el.kind === 'disciple') disciple(F, el);
  else if (el.kind === 'king') king(F, el);
  else if (el.kind === 'lohan') lohan(F, el);
  else attendant(F, el);
  F.into(P);
  P.emit(bag, el.at[0], el.y ?? 0, el.at[1], el.yaw ?? 0);
}

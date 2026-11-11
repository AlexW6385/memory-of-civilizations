// The architecture of Qufu (docs/settlements/lu-qufu.md §5): the Temple of Confucius in yellow tile and red wall, its stone portals, stele
// pavilions, Apricot Altar and the Dacheng Hall with its dragon columns; the grey brick town. The Qing and Ming vocabularies (src/styles/qing,
// src/styles/ming) are used read-only: halls, terraces, stairs, walls, galleries, bronzes, courtyard houses.
import { registerStyle, STYLES } from '../../core/build.js';
import '../qing/index.js';
import { dacheng } from './dacheng.js';
import { pailou, stele, stelePavilion, altar, tomb } from './ritual.js';
import { shopRow } from './shops.js';

const base = STYLES.qing;
registerStyle('lu', {
  ...base,
  elements: { ...base.elements, lu_dacheng: dacheng, lu_pailou: pailou, lu_stele: stele, lu_stele_pavilion: stelePavilion, lu_altar: altar, lu_tomb: tomb, lu_shop_row: shopRow },
});

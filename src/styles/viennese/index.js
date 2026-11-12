// The Vienna of 1902 (docs/settlements/vienna.md §3): the Gründerzeit tenement with its piano nobile and mansard, the older
// Biedermeier house, Olbrich's Secession, Loos's café, Wagner's Stadtbahn pavilions, the Opera and the Karlskirche, the walled
// Wien and its bridges, trams, Fiakers and advertising columns.

import { registerStyle, STYLES } from '../../core/build.js';
import '../qing/index.js';
import '../../objects/index.js';
import { mietshaus } from './mietshaus.js';
import { secession } from './secession.js';
import { cafeHouse } from './cafe.js';
import { stadtbahnPavilion } from './pavilion.js';
import { opera, karlskirche } from './landmarks.js';
import { tram, litfass, fiaker, wienChannel, wienBridge, tramRails } from './street.js';
import { naschmarktStall, gaslamp, bench } from './market.js';
import { hofWing, hofYard } from './hof.js';
import { tramWire, manholes, hydrant, maroni, trough, flowerbed, hedge, monument, fountain, marktamt, stadtbahnTrain } from './street2.js';
import { FURNITURE } from '../modernisme/furniture.js';

registerStyle('viennese', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, mietshaus, hof_wing: hofWing, tram_wire: tramWire, manholes, hydrant, maroni, trough, flowerbed, hedge, monument, fountain, marktamt, stadtbahn_train: stadtbahnTrain, hof_yard: hofYard, secession, cafe_house: cafeHouse, stadtbahn_pavilion: stadtbahnPavilion, opera, karlskirche, tram, litfass, fiaker, wien_channel: wienChannel, wien_bridge: wienBridge, tram_rails: tramRails, naschmarkt_stall: naschmarktStall, gaslamp, park_bench: bench, kiosk: FURNITURE.kiosk, terrace_set: FURNITURE.terrace_set },
  objects: {},
});

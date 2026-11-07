// The reverberation of each hall, measured to its volume and its materials (DESIGN §5 "Sound").
//
// A room's reverberation time is worked out by Eyring's formula from its volume V, its surface S
// and the absorption of what that surface is made of, band by band, with the air's own absorption:
//
//   T60 = 0.161 V / (−S ln(1 − ᾱ) + 4 m V)
//
// The impulse response the audio engine convolves with is then generated to that decay, band by
// band (the low end rings longer in stone, the top dies first in the air and on cloth), with a
// gap before the first reflection set by the room's mean free path (4V/S).
//
// Pure (no Web Audio here): the engine and the tests both use it.
//
// Sources:
// - Absorption coefficients (125…4000 Hz) of marble/tile, brick, smooth and rough plaster, wood,
//   carpet on concrete, heavy curtain, window glass, plate glass, water: the tables at
//   https://sengpielaudio.com/calculator-RT60Coeff.htm [stated]. Laboratory values for new, smooth
//   surfaces; old masonry in place (open joints, porous stone, the scatter of mouldings, columns,
//   cornices and grilles, the doors and the cracks round them) absorbs several times more. The
//   "in place" factor below is calibrated on the one great hall measured in our set — Hagia Sophia,
//   V = 255,800 m³, T ≈ 11 s empty with the source under the dome, about 12 s at 250–500 Hz and 10
//   and 8 s at 1 and 2 kHz (Stanford CCRMA, Icons of Sound,
//   https://ccrma.stanford.edu/wp/iconsofsound/hagiasophiaacoustics) [stated] — and checked against
//   the trend lines of measured mid-band reverberation against volume for Byzantine churches,
//   T = 2.2958 ln V − 18.744, and Ottoman mosques (carpeted), T = 1.1753 ln V − 7.897 (Fausti et al.,
//   "Comparing the acoustics of mosques and Byzantine churches", CIPA 2003,
//   https://www.cipaheritagedocumentation.org/wp-content/uploads/2018/11/Fausti-e.a.-Comparing-the-acoustics-of-mosques-and-Byzantine-churches.pdf)
//   [stated]; see tests/acoustics.test.mjs.
// - Air absorption at 20 °C and 50 % humidity, about 0.4, 1.0, 1.9, 3.7, 9.7 and 33 dB/km at
//   125…4000 Hz (ISO 9613-1) [stated]; m = dB/km ÷ 4343.
// - The halls' dimensions: the dossiers (docs/settlements/<id>.md, docs/buildings/<id>.md) and the
//   figures quoted beside each entry below; where a height or a share of a surface is not given it is
//   marked [inferred].

export const BANDS = [125, 250, 500, 1000, 2000, 4000];

/** Absorption coefficients by band (laboratory values, sengpielaudio [stated] unless marked). */
export const ALPHA = {
  marble: [0.01, 0.01, 0.01, 0.01, 0.02, 0.02],          // marble / glazed tile / mosaic
  stone: [0.03, 0.03, 0.03, 0.04, 0.05, 0.07],           // dressed stone, unglazed brick (as brick, unglazed)
  brick: [0.03, 0.03, 0.03, 0.04, 0.05, 0.07],
  plaster: [0.013, 0.015, 0.02, 0.03, 0.04, 0.05],       // smooth plaster on masonry
  earth: [0.02, 0.03, 0.04, 0.05, 0.04, 0.03],           // mud plaster, adobe: as rough plaster [inferred]
  timber: [0.15, 0.11, 0.10, 0.07, 0.06, 0.07],          // boards on joists, panelling, timber ceilings
  lattice: [0.2, 0.2, 0.25, 0.3, 0.3, 0.3],              // paper and lattice screens, open timber grilles [inferred]
  carpet: [0.02, 0.06, 0.14, 0.37, 0.60, 0.65],          // carpet on stone (as on concrete)
  textile: [0.07, 0.31, 0.49, 0.75, 0.70, 0.60],         // heavy hangings (as 14 oz curtain)
  leather: [0.15, 0.19, 0.22, 0.39, 0.38, 0.30],         // benches and seats, empty (as empty wood/metal seats)
  glass: [0.35, 0.25, 0.18, 0.12, 0.07, 0.04],           // window glass in leads
  mirror: [0.18, 0.06, 0.04, 0.03, 0.02, 0.02],          // large plate glass
  water: [0.008, 0.008, 0.013, 0.015, 0.02, 0.025],
  open: [1, 1, 1, 1, 1, 1],                              // doors, arcades, an open court, an oculus
};

/** Old surfaces in place absorb more than new ones in the laboratory (calibrated, see above) [inferred]. */
const IN_PLACE = { marble: 2.3, stone: 2.2, brick: 2.2, plaster: 2.2, earth: 2.2, timber: 1.2, lattice: 1, carpet: 1, textile: 1, leather: 1, glass: 1, mirror: 2, water: 1, open: 1 };

/** Air absorption, 4m (1/m), by band (ISO 9613-1, 20 °C, 50 % RH) [stated]. */
const AIR4M = [0.4, 1.0, 1.9, 3.7, 9.7, 33].map((db) => 4 * db / 4343);

/**
 * Reverberation time by band (s) of a room { V, S, surf: { material: share of S } } by Eyring.
 * Shares need not sum to one; they are normalised.
 */
export function rt60({ V, S, surf }) {
  const tot = Object.values(surf).reduce((s, v) => s + v, 0);
  return BANDS.map((_, b) => {
    let a = 0;
    for (const [m, share] of Object.entries(surf)) a += (share / tot) * Math.min(0.99, ALPHA[m][b] * (IN_PLACE[m] ?? 1));
    return 0.161 * V / (-S * Math.log(1 - a) + AIR4M[b] * V);
  });
}

/** Mean absorption (in place) at a band index. */
export function meanAlpha({ surf }, b = 2) {
  const tot = Object.values(surf).reduce((s, v) => s + v, 0);
  let a = 0;
  for (const [m, share] of Object.entries(surf)) a += (share / tot) * Math.min(0.99, ALPHA[m][b] * (IN_PLACE[m] ?? 1));
  return a;
}

/** A box L × W × H, its surface enlarged by `relief` for columns, niches, galleries and mouldings. */
export function box(L, W, H, relief = 1.3) {
  return { V: L * W * H, S: 2 * (L * W + L * H + W * H) * relief };
}

/**
 * A room's acoustics: { key, V, S, rt: [by band], mid (500–1000 Hz mean), gap (s, first reflection),
 * wet (reverberant level against the music's direct sound) }.
 */
export function acoustics(key, spec) {
  const rt = rt60(spec), mid = (rt[2] + rt[3]) / 2;
  // the gap before the reverberant field arrives: the mean free path, 4V/S, at 343 m/s
  const gap = Math.min(0.12, 4 * spec.V / spec.S / 343);
  // the reverberant field against the direct sound of a player some 5 m away: the room constant
  // R = S ᾱ / (1 − ᾱ) sets the reverberant energy, 4/R, against the direct, 1/(4π r²)
  const a = meanAlpha(spec), R = spec.S * a / (1 - a), r = 5;
  const wet = Math.max(0.18, Math.min(0.9, Math.sqrt(16 * Math.PI * r * r / R)));
  return { key, V: spec.V, S: spec.S, rt, mid, gap, wet, surf: spec.surf };
}

// ---------------------------------------------------------------------------------------------
// The halls. Keyed by plan id; each entry maps room ids to a space. Rooms that open into one volume
// (Hagia Sophia's nave, aisles and galleries) share the same space, so walking between them does not
// change the reverberation.

const S_ = (o) => o;
const HAGIA = S_({ V: 255800, S: 62000, surf: { marble: 0.42, plaster: 0.36, stone: 0.14, glass: 0.045, timber: 0.02, open: 0.006 } });

export const HALLS = {
  // Hagia Sophia: V 255,800 m³ (Icons of Sound) [stated]; the marble revetment and floor, the
  // mosaics and plaster of the vaults, the windows of the dome and tympana; S from the
  // articulated interior [inferred]
  'hagia-sophia': {
    nave: HAGIA, 'west-bay': HAGIA, bema: HAGIA, 'north-aisle': HAGIA, 'south-aisle': HAGIA,
    'north-gallery': HAGIA, 'south-gallery': HAGIA, 'west-gallery': HAGIA,
    // the narthexes: the inner about 60 × 9.5 m and some 15 m high under its groin vaults, marble
    // revetment; the outer lower and narrower [inferred], both opening by doors
    'inner-narthex': S_({ ...box(60, 9.5, 15, 1.2), surf: { marble: 0.6, plaster: 0.3, open: 0.03, glass: 0.03 } }),
    'outer-narthex': S_({ ...box(60, 5.5, 10, 1.2), surf: { stone: 0.5, marble: 0.3, plaster: 0.15, open: 0.06 } }),
    ramp: S_({ ...box(4, 4, 6, 1.1), surf: { stone: 0.9, open: 0.1 } }),
  },
  // The Pantheon: the rotunda 43.3 m across and as high, a cylinder to the springing and a
  // hemisphere above (V ≈ 53,000 m³) [widely published dimensions: stated]; marble and porphyry
  // floor and walls, the coffered concrete dome; the oculus 8.9 m across open to the sky (62 m²) [stated]
  pantheon: (() => {
    const r = 21.65, V = Math.PI * r * r * 21.65 + 2 / 3 * Math.PI * r ** 3;
    const S = (Math.PI * r * r + 2 * Math.PI * r * 21.65 + 2 * Math.PI * r * r) * 1.6;
    const R = { V, S, surf: { marble: 0.42, stone: 0.5, open: 62 / S + 0.01, timber: 0.01 } };
    return { rotunda: R, apse: R, 'niche-east': R, 'niche-west': R };
  })(),
  // St Peter's: the nave 27.5 m wide and 46 m high, about 186 m long to the apse, the crossing
  // under the dome 42 m across and 117 m to the lantern (V ≈ 450,000 m³) [inferred from the dossier's
  // dimensions]; marble floors and revetment, stucco and gilding, coffered vaults
  'baroque-rome-stpeter': (() => {
    const R = { V: 450000, S: 120000, surf: { marble: 0.55, plaster: 0.33, stone: 0.08, glass: 0.025, timber: 0.01, open: 0.002 } };
    return { nave: R, crossing: R };
  })(),
  // Florence Cathedral: the nave and aisles 38 m wide, 43 m high, about 153 m long with the crossing
  // and the octagon under Brunelleschi's dome 45.5 m across (V ≈ 180,000 m³) [inferred]; stone
  // (pietra forte, pietra serena), plaster vaults, polychrome marble floor, stained glass
  'florence-centre': (() => {
    const R = { V: 180000, S: 42000, surf: { stone: 0.5, plaster: 0.3, marble: 0.15, glass: 0.03, timber: 0.02, open: 0.002 } };
    return { nave: R, crossing: R };
  })(),
  // Sainte-Foy, Conques: the nave 6.8 m wide and 22 m high under its barrel vault, the church about
  // 56 m long with transepts and ambulatory (V ≈ 16,000 m³) [inferred]; schist and sandstone, small windows
  'sainte-foy-conques': (() => {
    const R = { V: 16000, S: 7600, surf: { stone: 0.93, glass: 0.025, timber: 0.035, open: 0.005 } };
    return { nave: R, crossing: R, 'north-transept': R, 'south-transept': R, choir: R, ambulatory: R };
  })(),
  // The Sainte-Chapelle: the upper chapel 33 × 10.7 m and 20.5 m high, two-thirds of its walls
  // stained glass (about 600 m²) [after the dossier, figures not re-checked: inferred]; the lower chapel 33 × 17 m and 6.6 m high
  'sainte-chapelle': {
    'upper-chapel': S_({ ...box(33, 10.7, 20.5, 1.15), surf: { glass: 0.38, stone: 0.3, plaster: 0.2, marble: 0.1, timber: 0.02 } }),
    'kings-gallery': S_({ ...box(21, 3, 6, 1.1), surf: { stone: 0.85, glass: 0.05, open: 0.1 } }),
    'lower-chapel': S_({ ...box(33, 17, 6.6, 1.5), surf: { stone: 0.6, plaster: 0.3, glass: 0.06, open: 0.02, timber: 0.02 } }),
  },
  // Westminster: the Hall 73 × 20.7 m under its oak hammerbeam roof, 28 m to the ridge [stated,
  // dossier]; the Commons and Lords chambers about 21 × 14 m and 14 m high, panelled in oak, with
  // leather benches and a timber ceiling [inferred]
  'london-westminster': {
    'westminster hall': S_({ V: 73 * 20.7 * 21, S: 2 * (73 * 20.7 + 73 * 21 + 20.7 * 21) * 1.5, surf: { stone: 0.6, timber: 0.36, glass: 0.03, open: 0.01 } }),
    "st stephen's porch": S_({ ...box(14, 10.5, 15, 1.2), surf: { stone: 0.8, glass: 0.12, open: 0.08 } }),
    "st stephen's hall": S_({ ...box(29, 9, 17, 1.2), surf: { stone: 0.7, marble: 0.14, glass: 0.12, open: 0.04 } }),
    'central lobby': S_({ V: 18 * 18 * 0.83 * 22, S: 2400, surf: { stone: 0.5, marble: 0.3, glass: 0.1, timber: 0.05, open: 0.05 } }),
    'commons corridor': S_({ ...box(24.7, 6, 9, 1.2), surf: { stone: 0.5, timber: 0.4, open: 0.06, glass: 0.04 } }),
    "lords corridor and peers' lobby": S_({ ...box(25.5, 6, 9, 1.2), surf: { stone: 0.45, timber: 0.4, textile: 0.05, open: 0.06, glass: 0.04 } }),
    'house of commons': S_({ ...box(21, 14, 14, 1.3), surf: { timber: 0.55, leather: 0.22, glass: 0.1, textile: 0.05, stone: 0.08 } }),
    'house of lords': S_({ ...box(24.4, 13.7, 13.7, 1.3), surf: { timber: 0.45, leather: 0.25, glass: 0.1, textile: 0.12, stone: 0.08 } }),
  },
  // The Hall of Mirrors: 73 × 10.5 m and 12.3 m high; 357 mirrors in 17 arches facing 17 windows;
  // marble pilasters, painted vault [after the dossier, figures not re-checked: inferred]
  'versailles-chateau': {
    'hall of mirrors': S_({ ...box(73, 10.5, 12.3, 1.25), surf: { mirror: 0.16, glass: 0.16, marble: 0.3, plaster: 0.33, timber: 0.05 } }),
  },
  // The Süleymaniye: the prayer hall about 58 × 59 m, the dome 26.5 m across and 53 m high, the
  // semidomes east and west (V ≈ 100,000 m³) [inferred]; carpeted, plastered and painted, stone,
  // many windows; Sinan's resonating clay pots set in the domes [after the dossier, figures not re-checked: inferred]
  'ottoman-istanbul-suleymaniye': {
    'prayer hall': S_({ V: 100000, S: 24000, surf: { carpet: 0.15, plaster: 0.42, stone: 0.33, glass: 0.08, timber: 0.02 } }),
    'tomb of hurrem sultan': S_({ V: 8.8 * 8.8 * 0.83 * 16, S: 560, surf: { marble: 0.6, plaster: 0.25, carpet: 0.1, glass: 0.05 } }),
  },
  // The Madrasa of Sultan Hasan: the qibla iwan 20 m wide, 26 m deep and 28 m high, its fourth side
  // open on the court [after the dossier, figures not re-checked: inferred]; stone and marble
  'mamluk-cairo-hasan': {
    'qibla iwan': S_({ ...box(26, 20, 28, 1.1), surf: { stone: 0.62, marble: 0.14, open: 0.2, carpet: 0.04 } }),
  },
  // The Taj Mahal's tomb chamber: an octagon about 22 m across under the inner dome, some 24.4 m
  // high; marble throughout, pierced marble screens round the cenotaphs [after the dossier, figures not re-checked: inferred]
  'mughal-agra-taj': {
    'tomb chamber': S_({ V: 22 * 22 * 0.83 * 18 + 2 / 3 * Math.PI * 11 ** 3 * 0.5, S: 2300, surf: { marble: 0.9, open: 0.04, lattice: 0.06 } }),
  },
  // The Dome of the Rock: the dome 20.4 m across, the drum and dome some 35 m high over the rock, the
  // two ambulatories round it (V ≈ 40,000 m³) [inferred]; marble revetment, mosaics, a timber dome
  'dome-of-the-rock': (() => {
    const R = { V: 40000, S: 12500, surf: { marble: 0.45, plaster: 0.15, timber: 0.15, carpet: 0.15, glass: 0.06, stone: 0.04 } };
    return { 'outer-ambulatory': R, 'inner-ambulatory': R };
  })(),
  // Isfahan: the Lotfollah mosque's chamber 19 m square under a dome 22 m across, 32 m high, tiled
  // throughout [after the dossier, figures not re-checked: inferred]; the Ali Qapu music room, its walls cut into vessel-shaped niches
  // in stucco (absorbing and scattering) [after the dossier, figures not re-checked: inferred]; the bazaar's brick vaults
  'isfahan-maidan': {
    lotfollah: S_({ V: 19 * 19 * 14 + 2 / 3 * Math.PI * 11 ** 3, S: 3300, surf: { marble: 0.7, plaster: 0.08, carpet: 0.15, glass: 0.04, open: 0.03 } }),
    music_room: S_({ ...box(9, 8, 10, 2.2), surf: { lattice: 0.55, plaster: 0.35, carpet: 0.1 } }),
    talar: S_({ ...box(18, 12, 12, 1.3), surf: { timber: 0.4, mirror: 0.1, carpet: 0.1, open: 0.4 } }),
    bazaar: S_({ ...box(74, 5, 9, 1.4), surf: { brick: 0.75, textile: 0.1, open: 0.15 } }),
  },
  // Tōdai-ji's Great Buddha Hall of 752: about 86 × 50 m, 47 m high outside; inside a timber frame
  // open to the roof, earth floor paved in stone, the bronze Buddha 16 m high [after the dossier, figures not re-checked: inferred]
  'nara-todaiji': {
    'great buddha hall': S_({ V: 86 * 50 * 28, S: 2 * (86 * 50 + 86 * 28 + 50 * 28) * 1.6, surf: { timber: 0.6, stone: 0.25, lattice: 0.1, open: 0.05 } }),
  },
  // The Hall of Supreme Harmony: 64 × 37 m, the coffered ceiling some 20 m up [inferred], polished
  // "golden" fired-clay paving, timber columns and doors with lattice
  'qing-beijing-palace': {
    taihe: S_({ ...box(64, 37, 20, 1.35), surf: { timber: 0.5, stone: 0.3, lattice: 0.15, open: 0.05 } }),
    zhonghe: S_({ ...box(24, 24, 12, 1.25), surf: { timber: 0.5, stone: 0.3, lattice: 0.2 } }),
    baohe: S_({ ...box(49, 24, 15, 1.3), surf: { timber: 0.5, stone: 0.3, lattice: 0.15, open: 0.05 } }),
  },
  // Gyeongbokgung's Geunjeongjeon: the throne hall, two storeys under one space, about 30 × 21 m and
  // 16 m high [inferred]; timber, stone floor, lattice doors
  'joseon-seoul-gyeongbokgung': { hall: S_({ ...box(30, 21, 16, 1.3), surf: { timber: 0.55, stone: 0.25, lattice: 0.2 } }) },
  // The Dormition Cathedral: about 35 × 24 m, the vaults on four round piers, frescoed plaster
  // throughout, the iconostasis [after the dossier, figures not re-checked: inferred]; some 20 m to the vaults, the drums higher [inferred]
  'muscovy-dormition': { nave: S_({ ...box(35, 24, 22, 1.4), surf: { plaster: 0.72, stone: 0.12, timber: 0.1, glass: 0.04, open: 0.02 } }) },
  // Borgund stave church: a small nave about 7 × 5 m, the roof open to the ridge 13 m up; all pine,
  // tarred [after the dossier, figures not re-checked: inferred]
  'norse-borgund-church': (() => {
    const R = { V: 7 * 5 * 9 + 4 * 4 * 6, S: 2 * (7 * 5 + 7 * 9 + 5 * 9) * 1.5 + 100, surf: { timber: 0.97, open: 0.03 } };
    return { nave: R, chancel: R };
  })(),
  // The Great Pyramid's King's Chamber: 10.47 × 5.23 m and 5.97 m high, all red granite [after the dossier, figures not re-checked: inferred]
  'giza-great-pyramid': {
    'kings-chamber': S_({ ...box(10.47, 5.23, 5.97, 1.0), surf: { stone: 0.99, open: 0.01 } }),
    temple: S_({ ...box(52, 41, 6, 1.4), surf: { stone: 0.6, open: 0.4 } }),
  },
  // Edfu: the hypostyle hall (pronaos) 18 columns, about 34 × 13 m (inside) and 15 m high, its
  // front screened only to half height; the inner hypostyle and the halls behind darker and closed
  // [after the dossier, figures not re-checked: inferred]; sandstone
  edfu: (() => {
    const inner = (L, W, H) => ({ ...box(L, W, H, 1.2), surf: { stone: 0.97, open: 0.03 } });
    return {
      pronaos: { ...box(34, 13.3, 15, 1.6), surf: { stone: 0.82, open: 0.18 } },
      'hall-of-appearances': { ...box(20.4, 11.8, 12, 1.5), surf: { stone: 0.95, open: 0.05 } },
      'offering-hall': inner(20.4, 6.8, 10), 'hall-of-the-ennead': inner(20.4, 5.8, 9),
      sanctuary: inner(5.2, 11.2, 8),
    };
  })(),
  // Persepolis: the Apadana 60 × 60 m, 36 columns 19–20 m high, the cedar roof; mud-brick walls
  // plastered, open porticoes on three sides [after the dossier, figures not re-checked: inferred]
  'persepolis-terrace': {
    apadana: S_({ ...box(60, 60, 19.5, 1.5), surf: { earth: 0.25, stone: 0.2, timber: 0.3, open: 0.25 } }),
    'hundred columns': S_({ ...box(70, 70, 11, 1.6), surf: { earth: 0.35, stone: 0.2, timber: 0.35, open: 0.1 } }),
  },
  // The Great Mosque of Djenné: the prayer hall about 26 × 50 m, nine rows of massive mud-brick
  // piers, a palm-timber and earth roof some 6 m up [inferred]; earth throughout, mats on the sand floor
  'djenne-great-mosque': { hall: S_({ ...box(50, 26, 6, 2.2), surf: { earth: 0.75, timber: 0.1, lattice: 0.1, open: 0.05 } }) },
  // Kilwa's Great Mosque: the domed and vaulted extension, low bays of coral rag and lime plaster,
  // about 4–5 m high; the earlier flat roof on timber columns [after the dossier, figures not re-checked: inferred]
  'kilwa-mosque': { 'prayer hall': S_({ ...box(60, 50, 4.8, 2.0), surf: { plaster: 0.55, stone: 0.2, lattice: 0.1, open: 0.15 } }) },
  // The Meenakshi temple's thousand-pillar hall: granite pillars in close rows, a stone ceiling some
  // 5–6 m up [inferred]; the tank court open to the sky
  'madurai-meenakshi': {
    'thousand-pillar hall': S_({ ...box(60, 35, 5.5, 2.6), surf: { stone: 0.92, open: 0.08 } }),
    'ashta shakti mandapam': S_({ ...box(20, 8, 6, 1.6), surf: { stone: 0.85, open: 0.15 } }),
  },
  // The Potala's Great East Hall: about 24 × 22 m, 64 timber columns, low beamed ceiling some 5 m
  // up, hung with thangkas and banners, carpets on the benches [inferred]
  'lhasa-potala': { 'great east hall': S_({ ...box(24, 22, 5.5, 1.8), surf: { timber: 0.45, textile: 0.25, carpet: 0.15, plaster: 0.1, open: 0.05 } }) },
  // Lalibela: Medhane Alem's interior, 5 aisles of rock piers under a rock ceiling, about 33 × 23 m
  // outside and 11 m high [after the dossier, figures not re-checked: inferred]; Bete Maryam smaller; tuff, textiles and mats [inferred]
  'lalibela-churches': {
    'medhane-in': S_({ ...box(26, 16, 8, 1.9), surf: { stone: 0.82, textile: 0.1, open: 0.04, carpet: 0.04 } }),
    'maryam-in': S_({ ...box(14.4, 7.2, 6.5, 1.7), surf: { stone: 0.82, textile: 0.1, open: 0.04, carpet: 0.04 } }),
  },
  // Angkor Wat: the central sanctuary's cella, a corbelled tower some 40 m high above a 5 m square
  // [inferred]; the "hall of echoes" (a chamber of the western gallery where a blow on the chest
  // rings back) [after the dossier, figures not re-checked: inferred]; sandstone
  'angkor-wat': {
    sanctuary: S_({ ...box(5, 5, 30, 1.1), surf: { stone: 0.96, open: 0.04 } }),
    'hall-of-echoes': S_({ ...box(32, 3, 8, 1.1), surf: { stone: 0.98, open: 0.02 } }),
  },
  // Mount Wutai, Foguang's Great East Hall: 34 × 17.7 m, timber columns and a lattice ceiling about
  // 7 m up over the inner bays [after the dossier, figures not re-checked: inferred]; earth walls, stone floor, clay statues
  'foguang-east-hall': (() => {
    const R = { ...box(34, 17.7, 7.5, 1.6), surf: { timber: 0.45, earth: 0.3, stone: 0.15, lattice: 0.1 } };
    return { 'front-aisle': R, 'rear-aisle': R };
  })(),
  // The Amsterdam Town Hall's Burgerzaal: 34 × 17 m and 28 m high, marble floor and walls [after the dossier, figures not re-checked: inferred]
  'amsterdam-dam': {
    burgerzaal: S_({ ...box(34, 17, 28, 1.25), surf: { marble: 0.85, glass: 0.1, open: 0.05 } }),
    vestibule: S_({ ...box(26.6, 8, 9, 1.2), surf: { marble: 0.8, open: 0.15, glass: 0.05 } }),
  },
};

/** Surfaces by building tradition, for the rooms not in the table. */
const STYLE_SURF = [
  [/^(ming|qing|chinese|song|joseon|nara|edo|japanese|tang)/, { timber: 0.5, stone: 0.25, lattice: 0.2, open: 0.05 }],
  [/^(norse|maori|pueblo)/, { timber: 0.6, earth: 0.3, open: 0.1 }],
  [/^(sahel|swahili|babylonian|sumerian|zimbabwe)/, { earth: 0.7, timber: 0.15, open: 0.15 }],
  [/^(tibetan)/, { timber: 0.4, textile: 0.25, plaster: 0.25, open: 0.1 }],
  [/^(victorian|dutch|classical_fr)/, { plaster: 0.45, timber: 0.25, marble: 0.1, glass: 0.12, textile: 0.04, open: 0.04 }],
  [/^(mughal|safavid|ottoman|mamluk|nasrid|islamic)/, { plaster: 0.5, marble: 0.2, carpet: 0.15, lattice: 0.1, open: 0.05 }],
];
const STONE_SURF = { stone: 0.85, plaster: 0.08, open: 0.07 };

/**
 * The acoustics of a room of a plan: from the table if it is there, else estimated from the size of
 * the room's rectangle (a height in proportion, at least 3.5 m) and the plan's building tradition.
 * Rooms of kind 'open' (courts, squares, terraces) have none: outdoors is dry.
 */
const memo = new WeakMap();
export function roomAcoustics(plan, room) {
  if (!room || room.kind === 'open') return null;
  if (memo.has(room)) return memo.get(room);
  const spec = HALLS[plan.id]?.[room.id];
  let out;
  if (spec) {
    // rooms sharing one space share one key (and so one impulse response)
    const shared = Object.entries(HALLS[plan.id]).find(([, s]) => s === spec)[0];
    out = acoustics(plan.id + '/' + shared, spec);
  } else {
    const [x0, z0, x1, z1] = room.rect, L = Math.max(2, Math.abs(x1 - x0)), W = Math.max(2, Math.abs(z1 - z0));
    const H = Math.max(3.5, Math.min(25, 0.45 * Math.min(L, W) + 2.5));
    const surf = STYLE_SURF.find(([re]) => re.test(plan.style || ''))?.[1] || STONE_SURF;
    out = acoustics(plan.id + '/' + room.id, { ...box(L, W, H, 1.3), surf });
  }
  memo.set(room, out);
  return out;
}

/**
 * The impulse response of a room, as channel arrays (no Web Audio): stereo decorrelated noise in
 * three bands, each decaying at its own rate (−60 dB at the band's T60), after the gap of the first
 * reflection and a few discrete early reflections; normalised to unit energy per channel.
 * len is capped (the tail of a 12 s hall is cut where it is 60 dB down at mid band).
 */
export function impulseResponse(A, sr, rand = Math.random) {
  const tLow = (A.rt[0] + A.rt[1]) / 2, tMid = A.mid, tHigh = (A.rt[4] + A.rt[5]) / 2;
  const len = Math.floor(sr * Math.min(12.5, Math.max(0.25, Math.max(tLow, tMid) * 1.05 + A.gap)));
  const out = [new Float32Array(len), new Float32Array(len)];
  const kLow = 6.91 / tLow, kMid = 6.91 / tMid, kHigh = 6.91 / tHigh;
  const g0 = Math.floor(A.gap * sr);
  // one-pole splits at about 350 Hz and 2.5 kHz
  const cL = 1 - Math.exp(-2 * Math.PI * 350 / sr), cH = 1 - Math.exp(-2 * Math.PI * 2500 / sr);
  for (let c = 0; c < 2; c++) {
    const d = out[c];
    let lp1 = 0, lp2 = 0, eL = 2.2, eM = 1, eH = 0.8;
    // the envelopes by recurrence (one multiplication a sample, not an exponential)
    const mL = Math.exp(-kLow / sr), mM = Math.exp(-kMid / sr), mH = Math.exp(-kHigh / sr);
    const riseN = Math.max(0.004, A.gap * 0.8) * sr;
    for (let i = g0; i < len; i++) {
      const n = rand() * 2 - 1;
      lp1 += cL * (n - lp1); lp2 += cH * (n - lp2);
      // the build-up: the reverberant field grows in over the first few tens of milliseconds
      const k = i - g0, rise = k < riseN ? k / riseN : 1;
      d[i] = rise * (lp1 * eL + (lp2 - lp1) * eM + (n - lp2) * eH);
      eL *= mL; eM *= mM; eH *= mH;
    }
    // early reflections: a handful of discrete arrivals from the nearer walls within the first 2·gap
    const n = 6;
    for (let k = 0; k < n; k++) {
      const at = g0 + Math.floor((0.25 + 1.6 * rand()) * A.gap * sr);
      if (at < len) d[at] += (rand() < 0.5 ? -1 : 1) * (0.35 + 0.4 * rand()) * Math.exp(-kMid * at / sr) * 6;
    }
    let e = 0;
    for (let i = 0; i < len; i++) e += d[i] * d[i];
    const s = 1 / Math.sqrt(e || 1);
    for (let i = 0; i < len; i++) d[i] *= s;
  }
  return out;
}

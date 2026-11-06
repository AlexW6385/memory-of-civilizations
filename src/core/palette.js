// Material keys used by plans, with the physical values shared by the renderer (which adds
// procedural detail on top) and the light baker (which needs only the average albedo).
// Colours are linear-ish sRGB hex of the average surface; roughness/metalness as in PBR.

export const MATERIALS = {
  // Nubian sandstone from Gebel el-Silsila: warm buff, fine grained, laid in ashlar courses
  sandstone:        { color: '#c2aa89', roughness: 0.88, kind: 'ashlar', course: 0.52, block: 1.15 },
  sandstone_column: { color: '#c0a886', roughness: 0.86, kind: 'drums', course: 0.72 },
  sandstone_floor:  { color: '#b39d80', roughness: 0.82, kind: 'paving', course: 0.95, block: 1.4 },
  sandstone_dressed:{ color: '#c8b092', roughness: 0.84, kind: 'smooth' },
  // Pentelic marble, freshly finished (432 BC): white with a faint warm cast
  marble:           { color: '#e9e1cf', roughness: 0.42, kind: 'ashlar', course: 0.52, block: 1.25 },
  marble_column:    { color: '#e7dfcc', roughness: 0.4, kind: 'drums', course: 0.95 },
  marble_floor:     { color: '#e0d7c5', roughness: 0.38, kind: 'paving', course: 1.2, block: 1.2 },
  marble_smooth:    { color: '#e8e2d6', roughness: 0.4, kind: 'smooth' },
  marble_dark:      { color: '#5b5856', roughness: 0.35, kind: 'smooth' },   // Eleusinian grey limestone
  ivory:            { color: '#eadcc0', roughness: 0.32, kind: 'smooth' },
  granite_grey:     { color: '#6b6966', roughness: 0.32, kind: 'granite' },
  granite_black:    { color: '#2a2a2b', roughness: 0.22, kind: 'granite' },
  granite_red:      { color: '#9a6b5e', roughness: 0.34, kind: 'granite' },        // pink Aswan granite
  // Roman Imperial finishes
  stucco:           { color: '#d8d0c0', roughness: 0.9, kind: 'smooth' },
  dome_stucco:      { color: '#cbc4b7', roughness: 0.88, kind: 'smooth' },
  revetment:        { color: '#ddd3c2', roughness: 0.3, kind: 'ashlar', course: 1.1, block: 1.7 },   // pavonazzetto and giallo slabs
  giallo:           { color: '#d4b071', roughness: 0.3, kind: 'smooth' },
  pavonazzetto:     { color: '#e2dbcf', roughness: 0.3, kind: 'smooth' },
  porphyry:         { color: '#6a2c2c', roughness: 0.28, kind: 'granite' },
  opus_sectile:     { color: '#9c8b78', roughness: 0.3, kind: 'sectile', block: 3.2, colors: ['#6a2c2c', '#7d7b78', '#d4b071', '#e4ddd0'] },
  travertine:       { color: '#d6cbb6', roughness: 0.8, kind: 'paving', course: 1.0, block: 1.5 },
  gilt_bronze:      { clean: true, color: '#c99b45', roughness: 0.35, metalness: 1, kind: 'metal' },
  cedar:            { color: '#7a4a2a', roughness: 0.6, kind: 'wood' },
  bronze:           { color: '#8a6234', roughness: 0.38, metalness: 1, kind: 'metal' },
  gold:             { clean: true, color: '#d9a640', roughness: 0.28, metalness: 1, kind: 'metal' },
  ground:           { color: '#b59a74', roughness: 0.97, kind: 'ground' },
  // open ground of the hills: earth and grass on the gentle parts, grey limestone where steep
  terrain:          { color: '#a89577', roughness: 0.95, kind: 'terrain' },
  river:            { color: '#3a4434', roughness: 1, kind: 'river' },
  silt:             { color: '#6f5a43', roughness: 0.95, kind: 'ground' },
  mudbrick:         { color: '#8f7656', roughness: 0.96, kind: 'mudbrick', course: 0.12, block: 0.36 },
  plaster:          { color: '#d8cdb6', roughness: 0.9, kind: 'smooth' },
  opening:          { clean: true, color: '#191512', roughness: 0.9, kind: 'opening' },
  reed_mat:         { color: '#9c8a5e', roughness: 0.95, kind: 'smooth' },
  palm_trunk:       { color: '#6d5a44', roughness: 0.95, kind: 'smooth', side: 'double' },
  palm_leaf:        { color: '#55703a', roughness: 0.75, kind: 'leaf' },
  doum_leaf:        { color: '#6a7a45', roughness: 0.7, kind: 'leaf' },
  papyrus:          { color: '#6b8442', roughness: 0.7, kind: 'leaf' },
  // bark of the trees: fissured, in vertical plates
  bark_dark:        { color: '#4c3f33', roughness: 0.95, kind: 'bark' },
  bark_grey:        { color: '#7a746a', roughness: 0.9, kind: 'bark' },
  bark_pine:        { color: '#6b4d3a', roughness: 0.95, kind: 'bark', plates: 1 },
  bark_plane:       { color: '#9c9783', roughness: 0.85, kind: 'bark' },            // plane tree: peeling, mottled
  bark_birch:       { color: '#cfcac0', roughness: 0.85, kind: 'bark', plates: 0 },
  bark_olive:       { color: '#6f6a60', roughness: 0.92, kind: 'bark' },
  bark_redpine:     { color: '#8a5440', roughness: 0.92, kind: 'bark', plates: 1 },   // Japanese red pine: reddish, flaking above
  bamboo_culm:      { color: '#7f8b4d', roughness: 0.55, kind: 'smooth' },
  rock_boulder:     { color: '#8f897f', roughness: 0.9, kind: 'rock' },
  // Byzantine (Hagia Sophia, 562): gold glass mosaic, book-matched revetment, verde antico, lead
  mosaic_gold:      { color: '#c8963a', roughness: 0.3, metalness: 1, kind: 'mosaic' },
  mosaic_silver:    { color: '#b9bbbd', roughness: 0.3, metalness: 1, kind: 'mosaic' },
  verde_antico:     { color: '#3d5747', roughness: 0.28, kind: 'granite' },
  proconnesian:     { color: '#d6d4cf', roughness: 0.35, kind: 'veined', block: 1.6, course: 1.6, colors: ['#dcdad4', '#d2d1cc', '#8a8d91'] },
  revetment_byz:    { color: '#c9c2b4', roughness: 0.25, kind: 'veined', block: 1.05, course: 2.1, colors: ['#ddd6c8', '#c9cdc0', '#d6c3ad', '#c2c0ba', '#77736b'] },
  marble_pink:      { color: '#c99c8f', roughness: 0.3, kind: 'veined', block: 1.2, course: 1.2, colors: ['#d1a597', '#c08f82', '#e2c8bc'] },
  revetment_green:  { color: '#6f8173', roughness: 0.25, kind: 'veined', block: 1.05, course: 2.1, colors: ['#71877a', '#5f7366', '#e5e2d8'] },
  lead:             { color: '#80868c', roughness: 0.55, metalness: 0.45, kind: 'metal' },
  roof_tile:        { color: '#a65c3d', roughness: 0.85, kind: 'tiles' },
  brick:            { color: '#9b5e46', roughness: 0.9, kind: 'mudbrick', course: 0.09, block: 0.37 },
  stucco_warm:      { color: '#d9ccb4', roughness: 0.9, kind: 'smooth' },
  silver:           { clean: true, color: '#cfd0d2', roughness: 0.22, metalness: 1, kind: 'metal' },
  // Jerusalem limestone (meleke): pale, warm, in ashlar courses
  limestone:        { color: '#d8c8a6', roughness: 0.85, kind: 'ashlar', course: 0.48, block: 0.95 },
  ceiling_painted:  { color: '#4a3826', roughness: 0.6, kind: 'sectile', block: 0.9, colors: ['#5e2a20', '#1e2c4a', '#a8843a', '#2c2116'] },
  mosaic_green:     { color: '#4f7a5c', roughness: 0.3, metalness: 0.2, kind: 'mosaic' },
  // Gothic (Sainte-Chapelle, 1248): stained glass, painted and gilded stone
  stained_glass:    { color: '#2a2440', roughness: 0.2, kind: 'glass', side: 'double' },
  daylight:         { clean: true, color: '#202020', roughness: 0.3, kind: 'daylight' },
  daylight_plain:   { clean: true, color: '#202020', roughness: 0.3, kind: 'daylight', plain: true },
  glass_outer:      { clean: true, color: '#1c1f24', roughness: 0.12, metalness: 0.0, kind: 'smooth' },
  paint_fleur:      { color: '#22336e', roughness: 0.55, kind: 'fleur', colors: ['#1f2f6a', '#c9a24a'] },
  paint_castle:     { color: '#7a2a22', roughness: 0.55, kind: 'fleur', colors: ['#7b2620', '#c9a24a'] },
  vault_stars:      { color: '#1d2c66', roughness: 0.6, kind: 'fleur', colors: ['#1c2a63', '#d4ae52'], stars: 1 },
  paint_robe:       { color: '#7a3b2e', roughness: 0.7, kind: 'smooth' },
  slate:            { color: '#4d535c', roughness: 0.6, kind: 'tiles' },
  half_timber:      { color: '#d7cdb8', roughness: 0.9, kind: 'timberframe' },
  // Tang China (Foguang, 857): red-ochre timber, grey tiles and brick, earth walls, painted clay
  timber_red:       { color: '#7e2f1f', roughness: 0.7, kind: 'wood' },
  wall_red:         { color: '#8c3a26', roughness: 0.92, kind: 'smooth' },
  tile_grey:        { color: '#55575a', roughness: 0.75, kind: 'tiles' },
  brick_grey:       { color: '#7b7a76', roughness: 0.92, kind: 'mudbrick', course: 0.065, block: 0.29 },
  earth_wall:       { color: '#b39a72', roughness: 0.95, kind: 'smooth' },
  clay_gilt:        { color: '#c79a48', roughness: 0.45, metalness: 0.6, kind: 'metal' },
  clay_robe:        { color: '#8a3b2b', roughness: 0.7, kind: 'smooth' },
  clay_green:       { color: '#3f6a54', roughness: 0.7, kind: 'smooth' },
  ceiling_grid:     { color: '#6e3a24', roughness: 0.75, kind: 'fleur', colors: ['#7a4127', '#2e1a10'], grid: 1 },
  // India (Sanchi): buff and pinkish sandstone, lime plaster on the dome, Ashoka's polished stone
  sandstone_rail:   { color: '#bf9a7c', roughness: 0.86, kind: 'smooth' },
  lime_plaster:     { color: '#e0d8c6', roughness: 0.92, kind: 'smooth' },
  polished_sandstone: { color: '#c9b69a', roughness: 0.25, kind: 'smooth' },
  // Heian Japan: red earth paint (ni) on the timber, white plaster, dark clay tiles, cypress bark
  timber_ni:        { color: '#9a3b22', roughness: 0.75, kind: 'wood' },
  paint_ochre:      { color: '#c9a04a', roughness: 0.8, kind: 'smooth' },
  plaster_white:    { color: '#e2ddd0', roughness: 0.9, kind: 'smooth' },
  plaster_damp:     { color: '#a9aa9c', roughness: 0.95, kind: 'smooth' },     // whitewash greyed by damp and lichen
  plaster_streak:   { color: '#c4c0b2', roughness: 0.95, kind: 'smooth' },     // rain streaks under a coping
  tile_dark:        { color: '#45484c', roughness: 0.7, kind: 'tiles' },
  roof_bark:        { color: '#5a4334', roughness: 0.95, kind: 'bark' },
  thatch:           { color: '#7d6a4c', roughness: 1.0, kind: 'bark' },
  roof_ridge:       { color: '#4a3d33', roughness: 0.95, kind: 'wood' },
  pebbles:          { color: '#8e8a83', roughness: 0.95, kind: 'rock' },
  lacquer_black:    { clean: true, color: '#1c1714', roughness: 0.3, kind: 'smooth' },
  ceiling_coffer:   { color: '#7a3a22', roughness: 0.7, kind: 'fleur', colors: ['#8a4428', '#c9a04a'], grid: 1 },
  paint_white:      { color: '#ddd6c6', roughness: 0.85, kind: 'smooth' },
  flame:            { clean: true, color: '#000000', roughness: 1, kind: 'flame' },
  glass_lamp:       { clean: true, color: '#b9c6b4', roughness: 0.08, kind: 'smooth' },
  timber:           { color: '#6e5038', roughness: 0.75, kind: 'wood' },
  water:            { clean: true, color: '#2b4a4e', roughness: 0.05, kind: 'water' },
  linen:            { color: '#d9d2bf', roughness: 0.95, kind: 'smooth' },
  paint_blue:       { color: '#2f5f8a', roughness: 0.9, kind: 'smooth' },
  // Romanesque Rouergue (Conques): red sandstone below, yellow limestone above, schist rubble,
  // roofs of schist slabs (lauzes), flagged floors, wrought iron, the cloister's green serpentine
  sandstone_red:    { color: '#9b6352', roughness: 0.88, kind: 'ashlar', course: 0.34, block: 0.62 },
  limestone_yellow: { color: '#cdb27e', roughness: 0.85, kind: 'ashlar', course: 0.36, block: 0.7 },
  schist_rubble:    { color: '#6f6a62', roughness: 0.92, kind: 'ashlar', course: 0.16, block: 0.3 },
  lauze:            { color: '#58564f', roughness: 0.8, kind: 'tiles' },
  flagstone:        { color: '#998d7a', roughness: 0.85, kind: 'paving', course: 0.8, block: 1.0 },
  iron:             { color: '#3a3836', roughness: 0.5, metalness: 0.8, kind: 'metal' },
  serpentine:       { color: '#3f5b4c', roughness: 0.3, kind: 'veined', block: 1.0, course: 1.2, colors: ['#3f5b4c', '#2f4a3c', '#7e9686'] },
  // Ming Jiangnan (Suzhou): chestnut-lacquered timber, latticed doors and windows over paper,
  // white lime plaster, black tiles, grey-blue bluestone paving, granite canal walls, Taihu rock,
  // pebble mosaic paths, lotus leaves
  lacquer_chestnut: { color: '#4b2b1c', roughness: 0.42, kind: 'smooth' },
  lattice:          { color: '#4b2b1c', roughness: 0.6, kind: 'lattice', paper: '#e9e2cf', cell: 0.09 },
  lattice_ice:      { color: '#4b2b1c', roughness: 0.6, kind: 'lattice', paper: '#e9e2cf', cell: 0.16, ice: 1 },
  taihu:            { color: '#77766f', roughness: 0.92, kind: 'taihu' },
  bluestone:        { color: '#5e6467', roughness: 0.8, kind: 'paving', course: 0.5, block: 1.1 },
  granite_block:    { color: '#807c74', roughness: 0.85, kind: 'ashlar', course: 0.42, block: 1.1 },
  pebble_mosaic:    { color: '#8e8a83', roughness: 0.9, kind: 'pebbles' },
  lotus_leaf:       { color: '#4f7a3a', roughness: 0.6, kind: 'leaf', side: 'double' },
  plaster_grey:     { color: '#bdb8ad', roughness: 0.92, kind: 'smooth' },
  // Ming–Qing Beijing: yellow glazed tiles, vermilion columns and walls, beams painted blue and
  // green, white marble terraces, grey brick courtyards; the grey-brick courtyard houses
  tile_yellow:      { color: '#c8932c', roughness: 0.32, kind: 'tiles' },
  tile_green:       { color: '#3f6b45', roughness: 0.35, kind: 'tiles' },
  lacquer_red:      { color: '#8e2a1c', roughness: 0.45, kind: 'smooth' },
  lattice_red:      { color: '#8e2a1c', roughness: 0.6, kind: 'lattice', paper: '#e6dcc3', cell: 0.1 },
  paint_caihua:     { color: '#2d5f63', roughness: 0.6, kind: 'smooth' },
  palace_wall:      { color: '#9a3826', roughness: 0.9, kind: 'smooth' },
  cotto_floor:      { color: '#9c624a', roughness: 0.85, kind: 'paving', course: 0.3, block: 0.3 },
  brick_paving:     { color: '#7c7870', roughness: 0.88, kind: 'paving', course: 0.34, block: 0.68 },
  // Khmer (Angkor, 12th c.): grey-brown sandstone weathered dark with lichen, red laterite in the
  // platforms and enclosure walls; the village: timber on stilts, palm-leaf thatch, woven walls
  sandstone_khmer:  { color: '#8f8576', roughness: 0.9, kind: 'ashlar', course: 0.45, block: 0.95 },
  sandstone_carved: { color: '#857b6c', roughness: 0.92, kind: 'rock' },
  laterite:         { color: '#8b5a3d', roughness: 0.95, kind: 'ashlar', course: 0.4, block: 0.6 },
  thatch_palm:      { color: '#8a7350', roughness: 1.0, kind: 'bark' },
  // the Maya (Chichén Itzá, 10th–11th c.): pale limestone, lime-plastered and painted (red, with
  // blue and yellow details), dry-stone rubble walls, palm thatch on the houses
  limestone_maya:   { color: '#cbc3b1', roughness: 0.88, kind: 'ashlar', course: 0.4, block: 0.7 },
  stucco_red:       { color: '#a1452f', roughness: 0.85, kind: 'smooth' },
  maya_blue:        { color: '#4f8fa1', roughness: 0.8, kind: 'smooth' },
  rubble:           { color: '#9c9585', roughness: 0.95, kind: 'rock' },
  // Old Kingdom Egypt (Giza, 26th c. BC): the pyramid's casing of fine white Tura limestone, its
  // core of local yellow-brown limestone, red Aswan granite, black basalt paving, mudbrick and mud
  // plaster in the workers' town
  tura_limestone:   { color: '#e2d9c4', roughness: 0.55, kind: 'ashlar', course: 1.2, block: 1.6 },
  limestone_core:   { color: '#b59a6e', roughness: 0.92, kind: 'ashlar', course: 0.75, block: 1.2 },
  basalt:           { color: '#3b3a38', roughness: 0.6, kind: 'paving', course: 1.0, block: 1.3 },
  mud_plaster:      { color: '#a68a66', roughness: 0.95, kind: 'smooth' },
  // the Sahel (Djenné): banco — mud plaster renewed every year, warm brown, its surface smoothed
  // by hand; palm-wood beams (toron) standing out of the walls
  banco:            { color: '#9c7451', roughness: 0.97, kind: 'rock' },
  banco_smooth:     { color: '#a47b56', roughness: 0.95, kind: 'smooth' },
  // the Inca (Machu Picchu): white granite, finely fitted in the temples, rougher in the houses;
  // roofs of ichu grass thatch
  granite_inca:     { color: '#a3a097', roughness: 0.8, kind: 'ashlar', course: 0.55, block: 0.8 },
  granite_rough:    { color: '#8e8b82', roughness: 0.9, kind: 'rock' },
  ichu:             { color: '#a28c5c', roughness: 1.0, kind: 'bark' },
  // Safavid Isfahan: buff fired brick, tile mosaic (lapis, turquoise, cream), straw-mud plaster
  brick_buff:       { color: '#b39570', roughness: 0.9, kind: 'mudbrick', course: 0.07, block: 0.24 },
  glaze_lapis:      { color: '#204b8c', roughness: 0.22, kind: 'mudbrick', course: 0.09, block: 0.34 },
  glaze_yellow:     { clean: true, color: '#d2a23a', roughness: 0.25, kind: 'smooth' },
  tile_lapis:       { color: '#23497f', roughness: 0.28, metalness: 0.05, kind: 'mosaic' },
  tile_turquoise:   { color: '#3b9aa0', roughness: 0.25, metalness: 0.05, kind: 'mosaic' },
  tile_cream:       { color: '#c8b089', roughness: 0.3, metalness: 0.03, kind: 'mosaic' },
  kahgel:           { color: '#b59d7c', roughness: 0.97, kind: 'smooth' },
  // Edo Japan: fitted granite of the ramparts, the castle's lime plaster, dark-stained wood, the
  // townhouse lattice (koshi) and paper screens (shoji)
  ishigaki:         { color: '#8a857a', roughness: 0.92, kind: 'ashlar', course: 0.5, block: 0.9 },
  plaster_castle:   { color: '#eceae3', roughness: 0.88, kind: 'smooth' },
  wood_dark:        { color: '#3a2b20', roughness: 0.8, kind: 'wood' },
  koshi:            { color: '#4a3424', roughness: 0.7, kind: 'lattice', paper: '#6b5640', cell: 0.09 },
  shoji:            { color: '#7a5a3c', roughness: 0.7, kind: 'lattice', paper: '#ece6d6', cell: 0.25 },
  // Sailendra Java: grey andesite, the latticed stupas, black palm-fibre thatch
  andesite:         { color: '#6f6d67', roughness: 0.9, kind: 'ashlar', course: 0.32, block: 0.55 },
  andesite_lattice: { color: '#6f6d67', roughness: 0.9, kind: 'lattice', paper: '#262422', cell: 0.42 },
  ijuk:             { color: '#3a332b', roughness: 1.0, kind: 'bark' },
  // Ur III: baked brick set in bitumen over the mud-brick core
  brick_baked:      { color: '#8a6a4e', roughness: 0.92, kind: 'mudbrick', course: 0.085, block: 0.3 },
  // Lalibela: red volcanic tuff, hewn
  tuff_red:         { color: '#8a5a48', roughness: 0.92, kind: 'rock' },
  tuff_hewn:        { color: '#94634f', roughness: 0.88, kind: 'smooth' },
  // Teotihuacan: stucco over rubble, ochre with red panels
  stucco_ochre:     { color: '#b49478', roughness: 0.9, kind: 'smooth' },
  rubble_teo:       { color: '#7d7368', roughness: 0.95, kind: 'ashlar', course: 0.3, block: 0.45 },
  // Taos: red-brown adobe plaster, peeled vigas
  adobe_taos:       { color: '#9c7558', roughness: 0.96, kind: 'smooth' },
  viga:             { color: '#8a7a64', roughness: 0.85, kind: 'wood' },
  // Joseon: dancheong (green-blue painted timber), granite
  paint_dancheong:  { color: '#3e7564', roughness: 0.75, kind: 'smooth' },
  granite_korea:    { color: '#a4a29b', roughness: 0.8, kind: 'ashlar', course: 0.5, block: 1.0 },
  // Northern Song: the Iron Pagoda's brown glazed brick
  tile_iron:        { color: '#6a4b35', roughness: 0.35, metalness: 0.05, kind: 'tiles' },
  // Tibet: limewash white and red, the pembe frieze, the yellow court
  limewash_white:   { color: '#e9e4d8', roughness: 0.92, kind: 'smooth' },
  limewash_red:     { color: '#7e2a20', roughness: 0.9, kind: 'smooth' },
  pembe:            { color: '#5a2a22', roughness: 1.0, kind: 'bark' },
  limewash_yellow:  { color: '#c9a24e', roughness: 0.9, kind: 'smooth' },
  // Dravidian South India (Madurai): grey granite halls, gopurams of painted stucco, terracotta-tiled houses
  granite_tamil:    { color: '#8a857c', roughness: 0.75, kind: 'ashlar', course: 0.6, block: 1.4 },
  stucco_sky:       { color: '#5a8fb8', roughness: 0.85, kind: 'smooth' },
  stucco_rose:      { color: '#c46a64', roughness: 0.85, kind: 'smooth' },
  stucco_leaf:      { color: '#5f9a5a', roughness: 0.85, kind: 'smooth' },
  stucco_saffron:   { color: '#d9a23e', roughness: 0.85, kind: 'smooth' },
  stucco_cream:     { color: '#e2d6b8', roughness: 0.85, kind: 'smooth' },
  // Achaemenid Persia (Persepolis): dark grey limestone, mudbrick walls plastered, cedar roofs
  limestone_persian:{ color: '#77736c', roughness: 0.45, kind: 'ashlar', course: 0.9, block: 1.8 },
  plaster_persian:  { color: '#b9a688', roughness: 0.92, kind: 'smooth' },
  // Nabataea (Petra): the rose sandstone cut in the cliff, its ashlar in the free-standing buildings
  sandstone_rose:   { color: '#b9786a', roughness: 0.95, kind: 'rock' },
  sandstone_rose_ashlar: { color: '#b07868', roughness: 0.9, kind: 'ashlar', course: 0.45, block: 0.9 },
  // Minoan Crete (Knossos): gypsum, red and black painted columns and walls, ochre plaster
  gypsum_minoan:    { color: '#d8d2c4', roughness: 0.4, kind: 'veined', block: 1.2, course: 0.9, colors: ['#ddd7ca', '#d2ccbd', '#bfb7a6'] },
  paint_minoan_red: { color: '#8e2c22', roughness: 0.7, kind: 'smooth' },
  paint_minoan_black:{ color: '#1e1b1a', roughness: 0.6, kind: 'smooth' },
  plaster_ochre:    { color: '#c9a46a', roughness: 0.9, kind: 'smooth' },
  // Rapa Nui: the yellow-brown tuff of Rano Raraku, red scoria topknots, basalt ahu facing
  tuff_moai:        { color: '#7c7060', roughness: 0.95, kind: 'rock' },
  scoria_red:       { color: '#8a4430', roughness: 1.0, kind: 'rock' },
  basalt_ahu:       { color: '#4a4744', roughness: 0.8, kind: 'ashlar', course: 0.7, block: 1.1 },
  // Maori pa: carved timber in red ochre (kokowai), raupo thatch, palisade posts
  kokowai:          { color: '#7a2d1e', roughness: 0.8, kind: 'wood' },
  raupo:            { color: '#8a7a55', roughness: 1.0, kind: 'bark' },
  palisade:         { color: '#5a4a3a', roughness: 0.95, kind: 'bark' },
  // Norse Norway: tarred pine staves and shingles, round-log walls, sod roofs
  tar_shingle:      { color: '#2b221c', roughness: 0.85, kind: 'tiles' },
  tar_wood:         { color: '#3a2c22', roughness: 0.8, kind: 'wood' },
  log_pine:         { color: '#7a5a3e', roughness: 0.9, kind: 'wood' },
  sod:              { color: '#5c6a38', roughness: 1.0, kind: 'bark' },
  // Muscovy: the Kremlin's red brick, white stone trim, plank roofs
  brick_kremlin:    { color: '#8e3e2e', roughness: 0.9, kind: 'mudbrick', course: 0.09, block: 0.3 },
  planks_grey:      { color: '#6d665c', roughness: 0.95, kind: 'wood' },
  // Modern New York: the towers' faces — limestone, buff and red brick, granite, glass curtain walls
  facade_limestone: { color: '#c9bfa8', roughness: 0.85, kind: 'facade', glass: '#2b3139', bay: 1.6, storey: 3.7, wu: 0.5, wv: 0.6 },
  facade_buff:      { color: '#b8a07a', roughness: 0.9, kind: 'facade', glass: '#2b3139', bay: 1.5, storey: 3.4, wu: 0.5, wv: 0.6 },
  facade_brick:     { color: '#8a4f3a', roughness: 0.9, kind: 'facade', glass: '#262b33', bay: 1.5, storey: 3.3, wu: 0.5, wv: 0.6 },
  facade_grey:      { color: '#9a9690', roughness: 0.8, kind: 'facade', glass: '#2b3139', bay: 1.7, storey: 3.8, wu: 0.55, wv: 0.6 },
  facade_glass:     { color: '#58646e', roughness: 0.3, kind: 'facade', glass: '#26313b', bay: 1.5, storey: 3.8, wu: 0.9, wv: 0.85 },
  steel_chrome:     { clean: true, color: '#b8bcc0', roughness: 0.25, metalness: 0.9, kind: 'smooth' },
  asphalt:          { color: '#3a3a3c', roughness: 0.95, kind: 'smooth' },
  // Modern Sydney: the Opera House's tiles and granite podium, the bridge's grey steel
  tile_opera:       { color: '#ece7da', roughness: 0.35, kind: 'tiles' },
  granite_podium:   { color: '#9a7a66', roughness: 0.6, kind: 'granite' },
  steel_grey:       { color: '#7f8589', roughness: 0.55, metalness: 0.6, kind: 'smooth' },
  // Objects of use and life (src/objects/): pottery, wicker, cloth, hides, skin
  terracotta:       { color: '#a5603f', roughness: 0.85, kind: 'smooth' },
  pottery_dark:     { color: '#5e4636', roughness: 0.8, kind: 'smooth' },
  glaze_green:      { clean: true, color: '#4f6b4a', roughness: 0.3, kind: 'smooth' },
  glaze_blue:       { clean: true, color: '#2f4f7a', roughness: 0.25, kind: 'smooth' },
  glaze_white:      { clean: true, color: '#ddd8cc', roughness: 0.25, kind: 'smooth' },
  wicker:           { color: '#9a7b4f', roughness: 0.95, kind: 'bark' },
  sacking:          { color: '#8f7a5a', roughness: 1.0, kind: 'smooth' },
  cloth_white:      { color: '#d9d3c4', roughness: 0.95, kind: 'smooth' },
  cloth_indigo:     { color: '#2e3b5c', roughness: 0.95, kind: 'smooth' },
  cloth_red:        { color: '#8c2f24', roughness: 0.95, kind: 'smooth' },
  cloth_ochre:      { color: '#b58a3c', roughness: 0.95, kind: 'smooth' },
  cloth_brown:      { color: '#6a4d36', roughness: 0.95, kind: 'smooth' },
  cloth_green:      { color: '#4b5e3a', roughness: 0.95, kind: 'smooth' },
  cloth_black:      { color: '#25221f', roughness: 0.95, kind: 'smooth' },
  cloth_grey:       { color: '#6f6c66', roughness: 0.95, kind: 'smooth' },
  hide_brown:       { color: '#6b4630', roughness: 0.9, kind: 'smooth' },
  hide_tan:         { color: '#a07a4e', roughness: 0.9, kind: 'smooth' },
  hide_grey:        { color: '#7d7870', roughness: 0.9, kind: 'smooth' },
  hide_white:       { color: '#d5cfc2', roughness: 0.9, kind: 'smooth' },
  hide_black:       { color: '#2b2622', roughness: 0.9, kind: 'smooth' },
  skin_light:       { clean: true, color: '#c9a184', roughness: 0.7, kind: 'smooth' },
  skin_medium:      { clean: true, color: '#a0734f', roughness: 0.7, kind: 'smooth' },
  skin_dark:        { clean: true, color: '#6a4a33', roughness: 0.7, kind: 'smooth' },
  hair_dark:        { clean: true, color: '#1f1a17', roughness: 0.8, kind: 'smooth' },
  car_black:        { clean: true, color: '#1c1d20', roughness: 0.3, metalness: 0.4, kind: 'smooth' },
  car_cream:        { clean: true, color: '#d6ccb0', roughness: 0.35, metalness: 0.3, kind: 'smooth' },
  car_red:          { clean: true, color: '#8a2a22', roughness: 0.35, metalness: 0.3, kind: 'smooth' },
  car_blue:         { clean: true, color: '#34507a', roughness: 0.35, metalness: 0.3, kind: 'smooth' },
  lamp_paper:       { clean: true, color: '#b8432c', roughness: 0.8, kind: 'glow', glow: '#ff7a3a', power: 2.2 },
  lamp_white:       { clean: true, color: '#e8dcc0', roughness: 0.8, kind: 'glow', glow: '#ffc27a', power: 2.4 },
  lamp_glass:       { clean: true, color: '#c9c2a8', roughness: 0.2, kind: 'glow', glow: '#ffd08a', power: 3.2 },
  // Mediterranean and French town houses: shutters, painted stuccoes, pietra serena, painted timber
  shutter_green:    { color: '#3d5a3e', roughness: 0.7, kind: 'wood' },
  shutter_brown:    { color: '#5a3c28', roughness: 0.7, kind: 'wood' },
  shutter_grey:     { color: '#7c8584', roughness: 0.7, kind: 'wood' },
  stucco_venice:    { color: '#b0573f', roughness: 0.88, kind: 'smooth' },
  stucco_siena:     { color: '#b9814f', roughness: 0.88, kind: 'smooth' },
  stucco_pale:      { color: '#dccfb2', roughness: 0.88, kind: 'smooth' },
  stucco_rome:      { color: '#c88a46', roughness: 0.88, kind: 'smooth' },
  pietra_serena:    { color: '#8d8e86', roughness: 0.75, kind: 'ashlar', course: 0.4, block: 0.8 },
  wood_painted:     { color: '#8a5a3a', roughness: 0.8, kind: 'wood' },
  wood_ochre:       { color: '#a8834a', roughness: 0.8, kind: 'wood' },
  coral_plaster:    { color: '#d9d2c2', roughness: 0.92, kind: 'mudbrick', course: 0.32, block: 0.55 },
  sandstone_relief: { color: '#a98d6c', roughness: 0.9, kind: 'rock' },
  rubber:           { clean: true, color: '#1a1a1a', roughness: 0.9, kind: 'smooth' },
};

export function albedo(key) {
  const m = MATERIALS[key] || MATERIALS.sandstone;
  const h = parseInt(m.color.slice(1), 16);
  // sRGB → linear
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return [lin((h >> 16) & 255), lin((h >> 8) & 255), lin(h & 255)];
}

// Where one arrives after travelling to a settlement from the map: for every settlement, the place
// and direction from which its landmark is seen best on foot (DESIGN §4.4, "Arrival").
//
// [x, y, z, yaw, pitch] in the settlement's frame: x, z in metres; y the height of the feet
// (null: on the ground there); yaw 0 looks north (−z), π/2 west (−x); pitch up is positive.
// Each was chosen by looking: from the screenshot tool's viewpoints (tools/viewpoints.json) where one
// was good, otherwise composed on the spot. Change one only after looking at it again.
export const ARRIVALS = {
  'tang-wutai':       [35, 13.1, 6, -1.40, 0.36],        // on the upper terrace, the Great East Hall's front, eaves and Buddhas
  'tang-changan':     [102, 0.1, 112, -0.62, 0.40],       // Daci'en's pagoda court, west of the main hall: the Big Wild Goose Pagoda on its platform, cypresses and monks in the court
  'song-kaifeng':     [160, 0.1, -140, 0, 0.38],         // the Iron Pagoda, whole, in its enclosure
  'song-hangzhou':    [-110, 0.1, 138, 0, 0.32],         // the stair up to the pagoda
  'ming-suzhou':      [4, 0.3, -49.5, 3.027, 0.08],      // from the zigzag bridge between the two islands, south across the lotus pond to the Hall of Distant Fragrance, whole on its terrace
  'qing-beijing':     [0, 0.05, 70, 0, 0.1],             // the Hall of Supreme Harmony on its marble terrace, up the imperial way
  'lhasa':            [0, 0.1, 134, 0, 0.3],             // the Potala rising over the Shöl street, from the lane crossing in the open middle (no stall pole or awning at the shoulder)
  'muromachi-kyoto':  [200, 0.1, 17, 0, 0.16],           // the Kannon-den of Ginkaku-ji across the narrowed pond, the wooded hill behind
  'nara':             [0, 0.1, 20, 0, 0.25],             // the Great Buddha Hall from its court
  'heian-uji':        [40, null, 0, 1.5708, 0.06],       // the Phoenix Hall across its pond, wings spread
  'edo-himeji':       [-25, 37.1, -3, 0, 0.36],          // the keep cluster whole on its stone base, from the Honmaru's south edge (from 9 m nearer the top roof was cut)
  'joseon-seoul':     [0, 0.1, 80, 0, 0.15],             // the throne hall across its court and rank stones
  'sanchi':           [0, 22.1, 60, 0, 0.15],            // the Great Stupa, its gateway and Ashoka's pillar
  'khajuraho':        [-14, null, -60, 1.5708, 0.22],    // up the pilgrims' approach lane between the shops of flowers and sweets to the stair of Kandariya Mahadeva's terrace, the porch and the climbing spires over the roofs
  'madurai':          [-20, 0.1, 170, 0, 0.3],           // the painted gopuram over the street
  'mughal-agra':      [0, 0.4, 60, 0, 0.1],              // the Taj Mahal down the garden's water channel
  'angkor':           [-178, 1.05, 1.5, -1.5708, 0.08],  // Angkor Wat's towers at the end of the causeway
  'borobudur':        [110, 0.1, 0, 1.5708, 0.18],       // the monument up the east way
  'abbasid-baghdad':  [-110, 0.1, 16, 0, 0.2],               // the Palace of the Golden Gate and its Green Dome across the esplanade, now busy with petitioners, horses, a caravan and mat-sellers
  'ur':               [0, 0.1, -118, 3.1416, 0.17],      // the ziggurat across its court: the pale way, the standards and the three stairways under the white house of Nanna (pitch lowered from 0.22 now that the enclosure's front is a low parapet and the whole stage shows)
  'babylon':          [-40, 0.1, -360, 3.1416, 0.2],     // the Processional Way's lions to the Ishtar Gate
  'persepolis':       [-122, 14.05, -60, -1.571, 0.16],  // at the head of the royal way, the guards' ranks leading to the Apadana's stair
  'isfahan':          [0, 0.1, 170, 3.1416, 0.17],       // the mosque's portal and minarets over the square, its dome rising beside them (from 44 m the court's wall hid the dome)
  'timurid-samarkand': [14, 0.1, 0, 1.5708, 0.32],      // the Registan: Ulugh Beg's madrasa, its pishtaq and four minarets across the square
  'petra':            [146, 0.1, -160, 1.5708, 0.36],    // the Treasury close at the Siq's mouth, 36 m off: columns, pediment and tholos each legible
  'jerusalem':        [-67.6, 18, -40, -1.78, 0.16],     // on the esplanade, the Dome of the Rock
  'constantinople':   [-10, 0.1, 86, -0.12, 0.22],       // the south door of Hagia Sophia across the forecourt: the dome over the buttressed flank, the procession on the right, the pilgrims' market and its shop fronts either side
  'ottoman-istanbul': [0, 22.1, -91, 3.1416, 0.42],      // the Süleymaniye's cascading domes and four minarets, whole
  'giza':             [242, 0.1, -50, 1.62, 0.24],       // on the plateau's east side, 270 m from the apex: the Great Pyramid whole over the mortuary temple and the causeway's head, a queen's pyramid at the left, the casing ramp half taken down and its hauling gangs at the right, a procession crossing before the doorway
  'mamluk-cairo':     [110, null, 120, 1.03, 0.22],      // Sultan Hasan's walls, dome and minarets from the square
  'djenne':           [95, 0.1, 30, 1.25, 0.13],         // the Great Mosque over the market
  'lalibela':         [-236, null, 176, -0.45, -0.27],   // on the hill's shoulder south-west of Bete Giyorgis, the triple cross on its roof seen whole from above, the pilgrims' trench going down on the left, pilgrims sitting at the edge below
  'kilwa':            [-9.95, null, 32.5, 0, 0.12],      // in the Great Mosque, down an aisle between its pillars to the great dome
  'great-zimbabwe':   [46, 0.1, 60, 3.1416, 0.1],        // the Great Enclosure's curved walls
  'knossos':          [0, 0.2, 22, 0, 0.05],             // the central court between its red columns
  'athens':           [86.8, 70, 36, 1.4, 0.15],         // on the Acropolis, the Parthenon's east front
  'rome':             [0, 0.1, -120, 3.1416, 0.15],      // the Pantheon across its forecourt
  'baroque-rome':     [110, 0.1, 0, 1.5708, 0.25],       // St Peter's, the obelisk and the colonnade's arms
  'stonehenge':       [34, null, -16, 2.01, 0.06],       // the circle, clear of the Heel Stone
  'conques':          [-47, null, 12, -1.29, 0.28],      // Sainte-Foy's west front and the Last Judgement tympanum, from the abbey terrace (the lane above was shut in by houses and bushes)
  'paris':            [-250, 1.1, -10, -1.5708, 0.25],   // the Sainte-Chapelle's rose and spire from the palace court
  'granada':          [19.5, 30.1, 3, 0, 0.25],          // the Court of the Myrtles to the Comares Tower (by the south arcade, clear of the pool's end)
  'florence':         [-152, 0, -108, -1.68, 0.2],       // from the square's north-west corner: Brunelleschi's dome over the nave, the front, the campanile and the Baptistery (from the south-west the front and the campanile hid the dome)
  'venice':           [-60, 1.3, -5, -1.5708, 0.2],      // San Marco across the piazza
  'amsterdam':        [20, 1.1, -210, 1.5708, 0.2],      // the Town Hall on the Dam
  'versailles':       [-60, 6.1, 0, -1.5708, 0.15],      // the garden front over the water parterre
  'london':           [200, 2.5, -170, 1.9, 0.2],        // the Clock Tower and Westminster from the bridge
  'barcelona':        [240, null, -52, 0.695, 0.4],  // from the Marina's east kerb at the cross street, 47 m back: the whole Nativity façade, its four towers and the scaffolding on the Charity crown in the frame
  'norse-borgund':    [-30, null, -28, -1.509, 0.27],     // the stave church in its valley, across the churchyard wall (8 m off)
  'muscovy':          [40, 0.1, 40, 3.0, 0.22],          // St Basil's and the Kremlin wall across Red Square
  'teotihuacan':      [0, 0.1, 70, -0.85, 0.2],          // from the avenue's plaza, the Pyramid of the Sun whole to the north-east, its Adosada and stair
  'chichen-itza':     [30, 0.1, 75, 0.38, 0.17],         // El Castillo
  'maya-tikal':       [-18, 0.1, 28, -1.2, 0.3],         // Temple I across the Great Plaza
  'tenochtitlan':     [-10, 0.1, 30, -1.293, 0.25],      // the Templo Mayor's twin shrines
  'machu-picchu':     [-21, null, 129.8, -0.08, -0.12],         // from the Guardhouse's knoll (17.6 m) at the saddle's narrow south end, down the neck and over the terraced town to Huayna Picchu, the gorge's walls on both sides
  'cahokia':          [-25, 0.1, 20, 0, 0.25],           // Monks Mound across the Grand Plaza
  'shaolin':          [0, 0.1, 160, 0, 0.07],            // from the village road north up the axis to the Shanmen, red walls and grey roofs, Mount Song behind
  'hakka-tulou':      [0, 0.1, 72, 0, 0.1],             // from the stream's near bank, north to the round tulou whole on its plinth
  'taos':             [-30, 0.1, -20, -0.35, 0.14],       // the North House's tall middle close across the racks and the plaza's life
  'bhaktapur':        [19, 0.1, 21, 0.66, 0.3],          // the Nyatapola whole on its plinth across Taumadhi square
  'new-york':         [-14.15, 0.1, 37.89, 2.282, 0.55], // the Empire State whole over Fifth Avenue's towers (the grid turned 29°: Fifth at 38th, looking down the avenue)
  'rapa-nui':         [0, 0.3, 46, 3.1416, 0.12],        // the row of moai on their platform, whole
  'fez':              [-132.5, null, -7.2, 3.1416, 0.1],   // the Bou Inania's court from its north gallery: the basin, the prayer hall beyond
  'nan-madol':        [-10, null, 28, 0, 0.1],           // the crossroads of Idehd, 36 m back down the causeway's axis: Nandauwas's whole south wall, its gate and its upturned corners between the nahs
  'maori':            [0, 0.2, 150, 0, 0.2],             // the pā's palisade and carved gateway
  'ayutthaya':        [10, 0.1, -100, 0, 0.3],      // the three chedis of Wat Phra Si Sanphet in their row, from the forecourt in line with the gate
  'alexandria':       [100, null, -86, 0.62, 0.15],      // the Pharos across the Great Harbour, from the quay before the Museion
  'sydney':           [222, null, -116, 1.02, 0.06],        // at the sea wall of Mrs Macquarie's Point: the Opera House across the water, the Harbour Bridge behind
  'dunhuang': [14, 0.1, 0, 1.5708, 0.2],   // On the main street east of the stream, looking west along its axis over the timber bridge: the Mogao cliff with its tiers of caves and galleries, the Nine-Storey building stepping up over the Great Buddha's hall at its middle.
  'catalhoyuk':       [1.2, 2.6, 19, 1.1, -0.05],            // the landmark house whole across the ground: its south wall, the ladder up to the roof, the packed roofscape behind
  'abu-simbel': [-4, null, 17, 1.22, 0.12],  // the Great Temple's façade from the terrace's south-east, 41 m off and slightly oblique: the four painted colossi of Ramesses II fill the frame, the baboon frieze above, the cliff cut off
  'nalanda': [-2, null, 70, 0.2, 0.28],   // the Great Temple's stepped east face and its stair, and Monastery 1's gate and turrets across the sacred way
  'han-changan': [-110, 7.75, -122, 0, 0.15],   // near the head of the ramp-stair: the Front Hall across the crown's apron, banners and the officials' ranks
  'lu-qufu': [-26, null, -59, -0.45, 0.18],   // across the court before the Dacheng Hall: the Apricot Altar and the double-eaved hall on its terrace
  'thebes': [-236, 0.1, 0, -1.5708, 0.12],   // from the Nile quay at the avenue's end, down the double row of ram sphinxes to the gateway in the great mudbrick wall, the second pylon of Karnak and its flagstaffs standing over it
  'mongol-karakorum': [70, 0.1, -12, 0, 0.2],   // Standing in the south gate of Möngke Khan's palace compound: the great hall on its rammed-earth podium across the court, the nine-tailed banners on either hand, the brick wall and the storehouses beyond.
  'shibam': [-6, null, -8, -1.264, 0.3],   // the merchant's tower house across the square: seven storeys of brown mud brick, the top two limewashed, white-framed windows, the parapet against the sky, the street door at its foot
  'delphi': [62, null, 16, 1.25, 0.22],   // on the Temple of Apollo's terrace before the Chians' altar and the Serpent Column: the temple's east front whole, the sacred hill rising behind to the Phaedriades
  'mycenae': [-136, null, 0, -1.5708, 0.2],   // on the approach road west of the citadel: the Lion Gate in its dressed conglomerate front between the bastion and the wall's end, the Cyclopean circuit rising behind it to the palace on the summit
  'qin-xianyang':     [126.5, null, -121, 1.5708, -0.02],  // in the front gallery of Pit 1 just inside the middle ramp's door, looking west down the aisle of corridor 5: the three ranks of painted archers at 10 to 13 m, the files of soldiers receding beyond
  'wei-ye': [-112, null, -88, 1.5708, 0.1],   // from the Tongque Garden east of the terraces, west up the Bronze Sparrow's stair to the tower on its crown, the Golden Tiger and the Ice Well on either hand
  'ajanta': [-21.5, null, -4, 1.05, 0.22],   // From the east bank's path across the Waghora, 38 m from the cliff: the whole horseshoe wall with its tiers of caves, the painted vihara's porch (Cave 1) centred on the ledge, pilgrims on the path and the washing place before it.
  'mohenjo-daro': [-155, 7.0, -72.5, 0, -0.12],   // from the south edge of the Great Bath's court on the Citadel, north across the paved court to the brick pool with its stairs at both ends, the gallery of stepped piers behind it
  'shang-yinxu': [20, 0.1, -34, 0, 0.1],   // from the court, up the axis: the ancestral hall of the kings whole on its rammed-earth platform, the stair in the middle bay, the flanking halls either side, the rows of covered sacrificial pits across the court
  'manueline-lisbon': [-206, null, 117, 0.0, 0.3],   // The Jerónimos' south portal whole across the plaza, the Belém Tower in the river to the left.
  'bali-village': [0, 0.1, -26, 0, 0.1],   // up the village street under the festival's penjors to the split gate of the pura at its end: the two stepped halves of brick and carved stone with the stair between them, the roofed gate beyond and the black-thatched merus rising behind the walls
  'bagan': [30, null, 0, -1.5708, 0.12],   // inside the Ananda precinct's west gate, looking east along the cross passage's axis to the temple: porch, terraces and gilded spire
  'kakadu': [-1, null, -13, 0, 0.15],   // from the apron before the Main Gallery: the sandstone outlier's jointed face and the overhang whole, the X-ray paintings under it at eye level, a camp's lean-to, fire and turtle ten metres to the right, a bark hut and grindstone to the left
  'benin-city': [-65, null, 24, 0, 0.14],   // from the king's square before the palace gate, north across the red earth with its clay seats, petitioners and the log drum to the gatehouse, its leopards and the turrets of the palace
  'dogon': [3, null, 29, 0, 0.18],   // From the village place: the toguna with its low eight-layer roof at the left, the terraced rows of mud compounds with their niched ginna facades and granaries rising up the slope, the sandstone cliff with the Tellem dwellings on its ledges closing the sky
  'vienna': [0, null, -66, 3.1416, 0.22],   // from Friedrichstraße across the Secession's forecourt: Olbrich's white building with its four pylons, the motto and the three gorgons over the door, and the golden laurel dome rising behind
  'brasilia': [-120, 0.1, 0, -1.5708, 0.2],   // From the apron at the foot of the Congress ramp on the Monumental Axis, looking east: the two chambers (the Senate's dome and the Chamber's bowl) on the marble roof deck between the twin 28-storey towers, the two pools at the ramp's sides, the Esplanade's lawn and the ministries behind.
  'bauhaus-dessau': [-33, null, 46, -0.66, 0.1],    // from Mauerstrasse's west kerb south of the school, looking north-east: the workshop wing's glass curtain wall with its workshops, the bridge over Kothener Strasse beyond it, the festive block and the Prellerhaus rising behind, the school garden and students in the street
  'sgang-gwaay': [43, null, 5, 1.2, 0.1],   // From the beach top before the row of cedar-plank houses: the landmark house across the street, its frontal pole standing at the door, the low gabled roof weighted with poles and stones under the cedars, canoes drawn up, the mortuary and memorial poles, rain.
};

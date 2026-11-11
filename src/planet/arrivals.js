// Where one arrives after travelling to a settlement from the map: for every settlement, the place
// and direction from which its landmark is seen best on foot (DESIGN §4.4, "Arrival").
//
// [x, y, z, yaw, pitch] in the settlement's frame: x, z in metres; y the height of the feet
// (null: on the ground there); yaw 0 looks north (−z), π/2 west (−x); pitch up is positive.
// Each was chosen by looking: from the screenshot tool's viewpoints (tools/viewpoints.json) where one
// was good, otherwise composed on the spot. Change one only after looking at it again.
export const ARRIVALS = {
  'tang-wutai':       [35, 13.1, 6, -1.40, 0.36],        // on the upper terrace, the Great East Hall's front, eaves and Buddhas
  'song-kaifeng':     [160, 0.1, -140, 0, 0.38],         // the Iron Pagoda, whole, in its enclosure
  'song-hangzhou':    [-110, 0.1, 138, 0, 0.32],         // the stair up to the pagoda
  'ming-suzhou':      [4, 0.3, -49.5, 3.027, 0.08],      // from the zigzag bridge between the two islands, south across the lotus pond to the Hall of Distant Fragrance, whole on its terrace
  'qing-beijing':     [0, 0.05, 70, 0, 0.1],             // the Hall of Supreme Harmony on its marble terrace, up the imperial way
  'lhasa':            [-4, 0.1, 120, 0, 0.32],           // the Potala over the town's lanes
  'muromachi-kyoto':  [200, 0.1, 25, 0, 0.14],           // the Kannon-den of Ginkaku-ji whole across its pond
  'nara':             [0, 0.1, 20, 0, 0.25],             // the Great Buddha Hall from its court
  'heian-uji':        [40, null, 0, 1.5708, 0.06],       // the Phoenix Hall across its pond, wings spread
  'edo-himeji':       [-25, 37.1, -3, 0, 0.36],          // the keep cluster whole on its stone base, from the Honmaru's south edge (from 9 m nearer the top roof was cut)
  'joseon-seoul':     [0, 0.1, 80, 0, 0.15],             // the throne hall across its court and rank stones
  'sanchi':           [0, 22.1, 60, 0, 0.15],            // the Great Stupa, its gateway and Ashoka's pillar
  'khajuraho':        [-28, null, -98, 2.356, 0.24],     // Kandariya Mahadeva from the north-east, its spires climbing to the sanctum (seen end-on from the east they read as one)
  'madurai':          [-20, 0.1, 170, 0, 0.3],           // the painted gopuram over the street
  'mughal-agra':      [0, 0.4, 60, 0, 0.1],              // the Taj Mahal down the garden's water channel
  'angkor':           [-178, 1.05, 1.5, -1.5708, 0.08],  // Angkor Wat's towers at the end of the causeway
  'borobudur':        [110, 0.1, 0, 1.5708, 0.18],       // the monument up the east way
  'abbasid-baghdad':  [-110, 0.1, 0, 0, 0.22],               // the Palace of the Golden Gate and its Green Dome across the esplanade, the Great Mosque on the left
  'ur':               [0, 0.1, -118, 3.1416, 0.22],      // the ziggurat across its court
  'babylon':          [-40, 0.1, -360, 3.1416, 0.2],     // the Processional Way's lions to the Ishtar Gate
  'persepolis':       [-135, 14.05, -75, -1.571, 0.16],  // on the terrace, the Apadana's porch
  'isfahan':          [0, 0.1, 170, 3.1416, 0.17],       // the mosque's portal and minarets over the square, its dome rising beside them (from 44 m the court's wall hid the dome)
  'timurid-samarkand': [14, 0.1, 0, 1.5708, 0.32],      // the Registan: Ulugh Beg's madrasa, its pishtaq and four minarets across the square
  'petra':            [160, 0.1, -158, 1.5708, 0.25],    // the Treasury at the end of the Siq
  'jerusalem':        [-67.6, 18, -40, -1.78, 0.16],     // on the esplanade, the Dome of the Rock
  'constantinople':   [-70, null, 110, -0.517, 0.16],    // Hagia Sophia's dome over its buttresses, from the south-west
  'ottoman-istanbul': [0, 22.1, -91, 3.1416, 0.42],      // the Süleymaniye's cascading domes and four minarets, whole
  'giza':             [160, 0.1, -285, 2.563, 0.2],      // the Great Pyramid whole from the north-east across the plateau, two faces (the enclosure's corner had stood in front)
  'mamluk-cairo':     [110, null, 120, 1.03, 0.22],      // Sultan Hasan's walls, dome and minarets from the square
  'djenne':           [95, 0.1, 30, 1.25, 0.13],         // the Great Mosque over the market
  'lalibela':         [-217, 0.1, 113, -2.356, -0.42],   // at the pit's north-west corner, down its diagonal onto the cross
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
  'barcelona':        [239.5, null, -101, 1.712, 0.45],  // the Nativity façade's portals, from the far pavement of the Carrer de la Marina (south of the tram standing at the façade)
  'norse-borgund':    [-30, null, -28, -1.509, 0.27],     // the stave church in its valley, across the churchyard wall (8 m off)
  'muscovy':          [40, 0.1, 40, 3.0, 0.22],          // St Basil's and the Kremlin wall across Red Square
  'teotihuacan':      [0, 0.1, 60, 0, 0.1],              // up the Avenue of the Dead
  'chichen-itza':     [30, 0.1, 75, 0.38, 0.17],         // El Castillo
  'tenochtitlan':     [-10, 0.1, 30, -1.293, 0.25],      // the Templo Mayor's twin shrines
  'machu-picchu':     [-17.6, null, 128.6, -0.07, -0.02],    // from the Guardhouse's knoll at the saddle's south end, over the town to Huayna Picchu
  'cahokia':          [-25, 0.1, 20, 0, 0.25],           // Monks Mound across the Grand Plaza
  'shaolin':          [0, 0.1, 160, 0, 0.07],            // from the village road north up the axis to the Shanmen, red walls and grey roofs, Mount Song behind
  'taos':             [0, 0.1, 25, 0.3, 0.12],           // the north house across the plaza
  'new-york':         [-14.15, 0.1, 37.89, 2.282, 0.55], // the Empire State whole over Fifth Avenue's towers (the grid turned 29°: Fifth at 38th, looking down the avenue)
  'rapa-nui':         [0, 0.3, 46, 3.1416, 0.12],        // the row of moai on their platform, whole
  'fez':              [-132.5, null, -7.2, 3.1416, 0.1],   // the Bou Inania's court from its north gallery: the basin, the prayer hall beyond
  'maori':            [0, 0.2, 150, 0, 0.2],             // the pā's palisade and carved gateway
  'alexandria':       [100, null, -86, 0.50, 0.17],      // the Pharos across the Great Harbour, from the quay before the Museion
  'sydney':           [214.5, null, -112, 1.0, 0.05],    // at the sea wall of Mrs Macquarie's Point: the Opera House across the water, the Harbour Bridge behind
  'dunhuang': [14, 0.1, 0, 1.5708, 0.2],   // On the main street east of the stream, looking west along its axis over the timber bridge: the Mogao cliff with its tiers of caves and galleries, the Nine-Storey building stepping up over the Great Buddha's hall at its middle.
  'catalhoyuk':       [1.2, 2.6, 19, 1.1, -0.05],            // the landmark house whole across the ground: its south wall, the ladder up to the roof, the packed roofscape behind
  'abu-simbel': [4, null, 0, 1.5708, 0.3],   // the Great Temple's façade whole across the terrace: four seated colossi of Ramesses II cut in the cliff, the baboon frieze above the door, the Nile below
  'nalanda': [-2, null, 70, 0.2, 0.28],   // the Great Temple's stepped east face and its stair, and Monastery 1's gate and turrets across the sacred way
  'han-changan': [-110, null, 10, 0, 0.1],   // from the Weiyang forecourt up the ramp-stair to the Front Hall on its terrace
  'thebes': [-243, null, 0, -1.5708, 0.1],   // from the Nile quay at the avenue's end, down the double row of ram sphinxes to the gateway in the great mudbrick wall, the second pylon of Karnak and its flagstaffs standing over it
  'mongol-karakorum': [70, 0.1, -12, 0, 0.2],   // Standing in the south gate of Möngke Khan's palace compound: the great hall on its rammed-earth podium across the court, the nine-tailed banners on either hand, the brick wall and the storehouses beyond.
  'shibam': [-6, null, -8, -1.264, 0.3],   // the merchant's tower house across the square: seven storeys of brown mud brick, the top two limewashed, white-framed windows, the parapet against the sky, the street door at its foot
  'delphi': [62, null, 16, 1.25, 0.22],   // on the Temple of Apollo's terrace before the Chians' altar and the Serpent Column: the temple's east front whole, the sacred hill rising behind to the Phaedriades
  'mycenae': [-136, null, 0, -1.5708, 0.2],   // on the approach road west of the citadel: the Lion Gate in its dressed conglomerate front between the bastion and the wall's end, the Cyclopean circuit rising behind it to the palace on the summit
  'qin-xianyang': [175, null, -121, 1.5708, 0.12],   // from the head of the middle ramp, down into the front gallery of Pit 1: the three ranks of archers across the gallery and the first corridors of painted soldiers behind them
};

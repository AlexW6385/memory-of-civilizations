// Where one arrives after travelling to a settlement from the map: for every settlement, the place
// and direction from which its landmark is seen best on foot (DESIGN §4.4, "Arrival").
//
// [x, y, z, yaw, pitch] in the settlement's frame: x, z in metres; y the height of the feet
// (null: on the ground there); yaw 0 looks north (−z), π/2 west (−x); pitch up is positive.
// Each was chosen by looking: from the screenshot tool's viewpoints (tools/viewpoints.json) where one
// was good, otherwise composed on the spot. Change one only after looking at it again.
export const ARRIVALS = {
  'tang-wutai':       [38, 13.1, 0, -1.5708, 0.22],      // on the upper terrace, the Great East Hall's front and its Buddhas
  'song-kaifeng':     [160, 0.1, -140, 0, 0.38],         // the Iron Pagoda, whole, in its enclosure
  'song-hangzhou':    [-110, 0.1, 138, 0, 0.32],         // the stair up to the pagoda
  'ming-suzhou':      [0, 0.95, -23.5, 0, -0.04],        // across the lotus pond to the pavilion
  'qing-beijing':     [0, 0.05, 70, 0, 0.1],             // the Hall of Supreme Harmony on its marble terrace, up the imperial way
  'lhasa':            [-4, 0.1, 120, 0, 0.32],           // the Potala over the town's lanes
  'nara':             [0, 0.1, 20, 0, 0.25],             // the Great Buddha Hall from its court
  'heian-uji':        [40, null, 0, 1.5708, 0.06],       // the Phoenix Hall across its pond, wings spread
  'edo-himeji':       [-20, 37.1, -12, 0, 0.38],         // the keep and its turrets from the inner bailey
  'joseon-seoul':     [0, 0.1, 80, 0, 0.15],             // the throne hall across its court and rank stones
  'sanchi':           [0, 22.1, 60, 0, 0.15],            // the Great Stupa, its gateway and Ashoka's pillar
  'khajuraho':        [0, 0.1, -60, 1.5708, 0.3],        // Kandariya Mahadeva rising among the temples
  'madurai':          [-20, 0.1, 170, 0, 0.3],           // the painted gopuram over the street
  'mughal-agra':      [0, 0.4, 60, 0, 0.1],              // the Taj Mahal down the garden's water channel
  'angkor':           [-178, 1.05, 1.5, -1.5708, 0.08],  // Angkor Wat's towers at the end of the causeway
  'borobudur':        [110, 0.1, 0, 1.5708, 0.18],       // the monument up the east way
  'ur':               [0, 0.1, -118, 3.1416, 0.22],      // the ziggurat across its court
  'babylon':          [-40, 0.1, -360, 3.1416, 0.2],     // the Processional Way's lions to the Ishtar Gate
  'persepolis':       [-135, 14.05, -75, -1.571, 0.16],  // on the terrace, the Apadana's porch
  'isfahan':          [0, 0.1, 205, 3.1416, 0.2],        // the mosque's portal and minarets over the square
  'petra':            [160, 0.1, -158, 1.5708, 0.25],    // the Treasury at the end of the Siq
  'jerusalem':        [-67.6, 18, -40, -1.78, 0.16],     // on the esplanade, the Dome of the Rock
  'constantinople':   [-70, null, 110, -0.517, 0.16],    // Hagia Sophia's dome over its buttresses, from the south-west
  'ottoman-istanbul': [0, 22.1, -90, 3.1416, 0.25],      // the Süleymaniye's cascading domes and four minarets
  'giza':             [150, 0.1, -190, 2.36, 0.25],      // the Great Pyramid from its corner
  'edfu':             [0, 0.1, 150, 0, 0.2],             // the pylon with its flagpoles, through the palms
  'mamluk-cairo':     [110, null, 120, 1.03, 0.22],      // Sultan Hasan's walls, dome and minarets from the square
  'djenne':           [95, 0.1, 30, 1.25, 0.13],         // the Great Mosque over the market
  'lalibela':         [-218, 0.1, 112, -2.356, -0.24],   // from the pit's north-west corner, down its diagonal onto the cross
  'kilwa':            [5, null, 30, 0.785, 0.15],        // in the Great Mosque, among its pillars
  'great-zimbabwe':   [46, 0.1, 60, 3.1416, 0.1],        // the Great Enclosure's curved walls
  'knossos':          [0, 0.2, 22, 0, 0.05],             // the central court between its red columns
  'athens':           [86.8, 70, 36, 1.4, 0.15],         // on the Acropolis, the Parthenon's east front
  'rome':             [0, 0.1, -120, 3.1416, 0.15],      // the Pantheon across its forecourt
  'baroque-rome':     [110, 0.1, 0, 1.5708, 0.25],       // St Peter's, the obelisk and the colonnade's arms
  'stonehenge':       [34, null, -16, 2.01, 0.06],       // the circle, clear of the Heel Stone
  'conques':          [-29.8, 6.9, -52.9, -2.88, 0.166], // Sainte-Foy's towers up the village lane
  'paris':            [-250, 1.1, -10, -1.5708, 0.25],   // the Sainte-Chapelle's rose and spire from the palace court
  'granada':          [19.5, 30.1, 3, 0, 0.25],          // the Court of the Myrtles to the Comares Tower (by the south arcade, clear of the pool's end)
  'florence':         [-142.6, 0, -21.9, -1.309, 0.216], // the Baptistery, the cathedral front and the campanile
  'venice':           [-60, 1.3, -5, -1.5708, 0.2],      // San Marco across the piazza
  'amsterdam':        [20, 1.1, -210, 1.5708, 0.2],      // the Town Hall on the Dam
  'versailles':       [-60, 6.1, 0, -1.5708, 0.15],      // the garden front over the water parterre
  'london':           [200, 2.5, -170, 1.9, 0.2],        // the Clock Tower and Westminster from the bridge
  'barcelona':        [240.3, null, -92, 1.5708, 0.5],   // the Nativity façade's portals, from the far pavement of the Carrer de la Marina
  'norse-borgund':    [-24, 0.1, -28, -1.5708, 0.3],     // the stave church in its valley
  'muscovy':          [40, 0.1, 40, 3.1416, 0.3],        // St Basil's and the Kremlin wall across Red Square
  'teotihuacan':      [0, 0.1, 60, 0, 0.1],              // up the Avenue of the Dead
  'chichen-itza':     [30, 0.1, 75, 0.38, 0.17],         // El Castillo
  'tenochtitlan':     [-10, 0.1, 30, -1.9, 0.25],        // the Templo Mayor's twin shrines
  'machu-picchu':     [-14, null, 0, 3.05, 0.1],         // over the town to Huayna Picchu
  'cahokia':          [-25, 0.1, 20, 0, 0.25],           // Monks Mound across the Grand Plaza
  'taos':             [0, 0.1, 25, 0.3, 0.12],           // the north house across the plaza
  'new-york':         [4, 0.1, 176, 3.1416, 0.6],        // up Fifth Avenue between the towers
  'rapa-nui':         [0, 0.3, 62, 3.1416, 0.12],        // the row of moai on their platform
  'maori':            [0, 0.2, 150, 0, 0.2],             // the pā's palisade and carved gateway
  'sydney':           [220, null, -100, 0.901, 0.05],    // the Opera House across the cove, the Harbour Bridge behind
};

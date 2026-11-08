# Changelog

Newest first. What you can visit and what looks better, in plain words.

## v10.12 — Smooth tour (2026-11-07)
- Within a settlement the tour never jumps or jerks: its height follows the roofs from a dense survey of the ground and buildings along the loop with clearance, climbing and descending gently and never dipping below them; turns are eased; the gaze lifts if something stands close ahead. Stopping the tour leaves you exactly where you are, floating if you were in the air.

## v10.11 — Buttons, tour, phones (2026-11-07)
- The map's Random city and Tour buttons now look like buttons (filled, with an icon, a pointer and a press). Sound, language, the corner map and its zoom no longer end the tour - only input on the world itself or a key does. On phones a double tap no longer zooms the page.

## v10.10 — Closer tour (2026-11-07)
- The tour flies lower and closer - just over the roofs - and makes one even loop round the landmark in a minute, at about half the earlier speed, looking steadily ahead and a little in toward the landmark.

## v10.9 — Flyover tour (2026-11-07)
- The tour lifts off smoothly from where you stand - straight up at first, then leaning out - and flies low over the whole town along a winding route that passes the landmark, looking ahead and down, about a minute a settlement.

## v10.8 — Aerial tour (2026-11-07)
- The tour is now an aerial overview: at each settlement it stands a moment at the arrival view, rises smoothly over the town and circles once round the landmark so the whole place is seen, about a minute, then flies on to the next in a shuffled order, without end. Nothing is shown while it runs; any key, click or touch stops it.

## v10.7 — Brisker tour (2026-11-07)
- The tour now takes one brisk loop through each whole settlement - past all its viewpoints and around its landmark at a running pace, gliding a little above the ground where a wall bars the way - with no wait on arrival, then moves on. Only Esc stops it; a small pill at the top says so.

## v10.6 — Tour (2026-11-07)
- Every settlement's name now stands fixed beside its dot on the map, in a crisper small type with an outline, the current one in blue. A Tour button (or T) sets off on its own: from the nearest settlement it shows the arrival view, then walks slowly between the place's viewpoints, and after about a minute travels on to the next in a shuffled order, without end; any key, click or touch hands control back.

## v10.5 — Controls, map, random city (2026-11-07)
- The loading screen lists the controls (walk, look, run, fly, cruise, map, random city; touch gestures on phones). The map's labels no longer pile on each other: where settlements crowd, the nearest keep their names and the rest show as dots that name themselves on hover; the list is grouped by region and sorted by date. A Random city button (R with the map open) takes you to a settlement chosen at random.

## v10.4 — Smoother (2026-11-07)
- Fewer stutters and a lighter frame: the buildings' shadows are kept and redrawn only when the sun or the view has moved enough, with only moving things drawn each frame; the picture's resolution steps down a little when the graphics card is behind and back up when it has room; the first visit picks its quality from the frame rate; shaders are prepared before things appear, plants and new buildings are put in over several frames, and a hall's reverberation is worked out off the main thread. Beijing's marble balustrades, posts and dragon spouts are rebuilt lighter. With ?perf, any frame over 50 ms is logged with what took the time (palace.hitches).

## v10.3 — Parallel work written down (2026-11-07)
- How the work runs with many agents in parallel is now written in docs/parallel-work.md and the brief every agent gets in docs/agent-brief.md.

## v10.2 — Arrival views checked (2026-11-07)
- Every settlement's arrival view was looked at and the poor ones moved: Giza now shows the Great Pyramid whole across the plateau, Florence the dome, nave, front, campanile and Baptistery together, Isfahan the dome beside its portal, Conques the west front and tympanum, Khajuraho the Kandariya's cluster of spires, Himeji the whole keep, Sydney the Opera House across open water with the Bridge behind, New York the Empire State whole down Fifth Avenue, Muscovy, the Suleymaniye, Foguang and Tongariki framed whole. Kilwa's mosque columns are dressed coral. An explicit ?weather= now holds every region (the closest state where a region lacks it).

## v10.1 — Lighter shadows, sealed rooms (2026-11-07)
- Smoother again: shadows are cast by size - small things only into the nearest shadow layer, middle-sized into the first two, only big masses into the farthest - and each layer stops just past its own range. Standing in a closed hall (the Sainte-Chapelle's upper chapel, Hagia Sophia, the crossings of Florence and St Peter's), what lies far outside is not drawn. Wrought-iron railings are drawn within 150 m, the simplified versions of things are made off the main thread. The Sainte-Chapelle's upper chapel falls from 3.6 M to 2.3 M triangles a frame, Barcelona from 9.4 M to 5.9 M, Teotihuacan from 9.5 M to 5.3 M.

## v10.0 — Water where it belongs (2026-11-07)
- Water across the planet is right now: the sea meets a settlement's flat ground exactly at its rim, so coasts, rivers and harbours sit at their level and boats float on them. Kilwa's and Rapa Nui's seas no longer sink away from the shore; the Nile at Edfu, the Yamuna at Agra, Tenochtitlan's lake, the cenote at Chichen Itza, Rano Raraku's crater lake, the Maori lake and Borgund's river are drawn at last; the Conques gorge, Jerusalem's valleys and Stonehenge are no longer flooded by the sea; Amsterdam's ships float on the IJ.

## v9.99 — Indoor light, corrected (2026-11-07)
- Every baked interior has been re-baked after a fix in the light baker, which had been taking the wrong surface's colour (and the wrong glass's transmission) at almost every bounce; interiors now take their light from their own walls. New bakes: the Great Pyramid's passages and King's Chamber, San Marco, St Basil's, the Empire State lobby, the Sydney Concert Hall. 44 landmarks are baked, all current.

## v9.98 — Fewer triangles (2026-11-07)
- Smoother in the heaviest places: big merged meshes are cut into 128 m cells so what is out of view is skipped again; fine repeated pieces (balustrade posts, brackets, capitals) are simplified beyond 60 m and cast simpler shadows; thin bars are drawn within 100 m; street life is simplified beyond 50 m. Triangles per frame fall by about a quarter overall (Beijing 14.7 M to 9.0 M, the Maori pa 18.9 M to 4.6 M, the Sainte-Chapelle 4.6 M to 3.6 M).

## v9.97 — Fixes (2026-11-07)
- Venice's canals, basin and lagoon now hold water (they were dry, with boats hanging over their beds). Flames glow yellow to orange instead of pale cream. The dark spikes inside the Sydney Concert Hall are gone. Standing in a gap between a building's rooms no longer switches the indoor haze and exposure off. Kaifeng's signboards read the right way; Beijing's lanes stop at the moat street; Knossos' frescoes no longer flicker. Every part of the scene is now compiled before it shows (some, like the maquis, had silently failed to draw).

## v9.96 — Angkor, Djenne, Lalibela, Granada (2026-11-07)
- Angkor: the eight bas-relief galleries told by subject, the towers' gilded lotus crowns, Zhou Daguan's market of women on mats, an elephant and a palanquin on the moat road, sugar palms with tappers' ladders. Djenne: a year's rain worn into every mud-brick face, clay soaking for the replastering, ladders and baskets at the mosque. Lalibela: the tuff's layers and the masons' ledges in every cut face, drainage channels, the pools in Bete Maryam's court. Granada: star-tile dados and the Nasrid shield in the palaces, the muqarnas niches of the Myrtles, courtiers and envoys; Albaicin patio houses with porticoes and viewing towers, cisterns with women filling jars. Street life keeps clear of each arrival point; guards carry spears, not porters' loads.

## v9.95 — Jerusalem and the modern cities (2026-11-07)
- Jerusalem: the Dome of the Rock's mosaic trees in every spandrel and the gold-on-turquoise inscription band, the Rock remade with its cave beneath, every courtyard house rebuilt with cisterns, ovens and stairs, four houses to enter, pilgrims. New York: the Empire State lobby to walk into, a diner and a walk-up flat, soot on the fronts, people waiting at the corners. Sydney: the Concert Hall opened inside with its stage, rings and stalls, a salt band on the sea wall, passengers on the ferry. Barcelona: the Mercat de la Concepcio of 1888 with its stalls, grime and rain streaks on the Eixample fronts.

## v9.94 — Amsterdam, Muscovy, Borgund, Edo (2026-11-07)
- Amsterdam: canal houses to walk into - marble halls, box beds, Delft tiles, paintings and maps; painted gable stones, door cases, lighters on the canals. Muscovy: St Basil's central church hollow up into its tent, with its iconostasis and candles; furnished izby with their stoves and icon corners; sledges and pedlars; the izby's roofs turned the right way. Borgund: carved masks and beasts on the staves; each farm's stue open, with its hearth, benches, loom and high-seat posts. Edo: machiya shops open with noren and goods, a samurai reception room with armour and scroll, a palanquin, pedlars.

## v9.93 — Venice, Florence, Baroque Rome, Versailles (2026-11-07)
- Venice: San Marco opened inside - five domes on pendentives in gold mosaic, marble walls, the iconostasis of 1394, the Pala d'Oro; stone quay walls with their weed and tide bands along every canal; the timber Rialto bridge of 1458 with its shops and lifting span; the Rialto market; a traghetto. Florence: a painter's and sculptor's bottega to walk into, the dyers' yard on the Arno. Baroque Rome: coaches, sedan chairs, pilgrims and beggars; Bernini's steps worn. Versailles: orange trees in their boxes, gardeners, gilt and hired sedan chairs, coaches.

## v9.92 — Baked light everywhere, later China, the Americas, Islamic cities (2026-11-07)
- Baked indoor light for every landmark with an interior (39 bakes; some to be refreshed after this wave's changes). Beijing: the palace beams painted in hexi caihua with Qing bracket sets, the Temple of Heaven with its three-coloured roofs as c. 1700, a furnished courtyard house, camel strings and Peking carts. Suzhou: a scholar's study after Wen Zhenheng, penjing, inscribed boards. Hangzhou: the Kaihua temple hall furnished, boatmen on every boat. Lhasa: murals and a chapel with a great prayer wheel and butter lamps. Teotihuacan, Tenochtitlan, Chichen Itza: rooms opened and furnished, farmers' houses on the chinampas, the Platform of Venus, a ball game; Machu Picchu: lichen, a chaski post, tree ferns. Isfahan, Istanbul, Cairo, Agra: courtyard houses to walk into, a coffee house, a Mamluk qa'a, caravanserais, enamelled mosque lamps, carpets, bazaar shops by trade.

## v9.91 — Greece, Rome, medieval Europe, early East Asia (2026-11-07)
- Knossos: the Procession Fresco, the Queen's bathroom, a potter's yard. Athens: Simon the shoemaker's house with its andron to walk into, Kimon's plane trees. Rome: the Pantheon's bronze roof truss, an atrium house with a thermopolium, a litter with its bearers. Constantinople: Hagia Sophia's ambo after Paul the Silentiary, a procession with the emperor and the patriarch. Stonehenge: freshly dressed white sarsens with tooling and lichen on the crust, the midwinter feast at Durrington. Conques: carved capitals, the dressed altar and the treasury beside Sainte Foy. Paris: the Sainte-Chapelle's gilt arcade, money-changers on the Grand Pont. London: terrace houses to enter with a Victorian parlour, costermongers, a crossing sweeper; the terraces now back to back as built. Foguang: the Tang mural and the donors' portraits. Byodo-in: Amida's lacquered dais, courtiers across the pond. Nara: the eye-opening ceremony of 752. Kaifeng: a grain boat unloading, the tax office.

## v9.90 — Africa, Mesopotamia, the Levant (2026-11-07)
- Great Zimbabwe: daga houses to walk into, furnished, cattle in kraals, coast trade goods. Kilwa: the Great Mosque's inset porcelain bowls and carved mihrab, coconut palms and baobabs, ivory and dhows on the beach. Edfu: painted reliefs in the inner halls, offering tables, priests censing. Giza: the workers' houses rebuilt and furnished, bakeries and brewers, a block hauled on a sledge, barges and skiffs; the walk reaches the King's Chamber again. Ur and Babylon: houses to enter, furnished room by room, markets, scribes, donkeys and caravans; Nebuchadnezzar's glazed inscription; reed layers in the walls. Persepolis: the bull capitals carved, the Treasury furnished, an archive of tablets. Petra: the garden and pool of Aretas IV with its island pavilion, a triclinium with diners and musicians, a camel caravan.

## v9.89 — Light in the air (2026-11-07)
- Inside, sunbeams now show as shafts of light in dust; stained glass throws coloured shafts down to its pools on the floor; temples hold incense haze by tradition (thick in Buddhist, Hindu, Egyptian and Orthodox halls, light in mosques); the nearest lamps and lanterns light the walls round you and flicker; water shows the moon's glitter path at night.

## v9.88 — Fewer draw calls (2026-11-07)
- Smoother: once a settlement has loaded, its unchanging parts are merged into one mesh per material and per repeated shape, town tiles are batched, and street life uses one mesh per shape; draw calls per frame fall by about a third on average (Barcelona 1530 to 560, New York 1330 to 604). Leaving a settlement now frees its buildings' memory.

## v9.87 — Seoul, c. 1888 (2026-11-07)
- Joseon Seoul is now c. 1888, after Gyeongbokgung's rebuilding: Gyeonghoeru as rebuilt in 1867 on its 48 granite pillars, with its island, balustrade and bridges; the Hyangwonjeong pavilion on its lotus pond with the Chwihyanggyo bridge; Geoncheonggung; Amisan's terraces with their patterned chimneys; the licensed shops of Jongno and the bell pavilion; about 150 people in white coats, black hats and green head-cloaks, porters with A-frames, oxen with brushwood; hanok with papered doors, verandas and jar terraces.

## v9.86 — Weather of each place, seasons (2026-11-07)
- Each place now has its typical weather: monsoon downpours over Angkor, snow at Borgund and in Muscovy that whitens ground and roofs, harmattan dust over Djenne, morning mist on West Lake, fog on the Thames, haze and khamsin at Giza, morning mists at Borobudur, Machu Picchu and Venice. Mist lies low on ground and water; dust and fog veil the sky. The open country follows the season of your visit: straw grass in autumn, russet and bare broadleaf forests, a lower snow line and white northern lowlands in winter. ?weather= and ?season= hold a weather or season.

## v9.85 — South Asia and Java (2026-11-07)
- Khajuraho: Kandariya with all 84 spires, carved porch doorways, lamps, bells and garlands, priests, pilgrims, flower sellers and cows. Sanchi: relief scenes along the gateways' architraves and on their posts, garlands and lamps, planting on the summit. Madurai: the Pudhu Mandapam with its Nayaka kings, four-armed gods on the gopurams, jasmine sellers. Borobudur: the 32 guardian lions, lamps and flowers.

## v9.84 — Life, sound, Oceania and North America (2026-11-07)
- Porters with loads (sacks, bundles, the Korean jige, yokes, carrying poles, head-loads), sweepers, people on stools at their doors, laundry strung across the lanes of Venice, Rome and Cairo, sellers on ground mats, pigeons and turkeys. Each hall now rings with its own reverberation, worked out from its volume and materials; rain sounds on the roof you stand under; birds, insects and animals by place; bells, drums and the call to prayer at their hours. Taos: a furnished room, worn plaster, turkeys. Cahokia: thatch, four furnished houses, chunkey players. Rapa Nui: weathered moai, stone-mulched gardens, a house being rethatched. Maori pa: carved bargeboards, eel pots, kuri.

## v9.83 — Wave 9 finished (2026-11-06)
- Chichen Itza's Temple of the Warriors opened, with its painted procession and Atlantean altar, and offerings at the Sacred Cenote; Lalibela's Bete Medhane Alem and Bete Maryam hollowed, with deacons and pilgrims; the Great Pyramid's interior from the north entrance up the Grand Gallery to the King's Chamber; Amsterdam's Town Hall vestibule, Vierschaar and Burgerzaal; Machu Picchu turned the right way, with its walls, storehouses and people; the Generalife's hedges, jets, stucco and people; Sydney's wharves peopled; market goods, water jars, handcarts and barrows per culture.

## v9.82 — Wave 9 merged (2026-11-06)
- The Generalife on its hill; Djenné facades and the landing; Teotihuacan and Tenochtitlan shrines opened; Falqués bench-lamps, the Sixth Avenue El, Sydney's sea wall; Ivan the Great, the Archangel and Annunciation; Borgund's dragons and portal; dance poses, musicians, cats, ducks, geese, elephants with howdahs; light baked for ten landmarks in their settlements.

## v9.81 — Seam fix (2026-11-06)
- Fixed the line across the middle of the screen with the lower half darker: half-resolution ambient occlusion picked the farthest of four depth texels under the reversed depth buffer.

## v9.80 — No seam across the middle of the screen (2026-11-06)
- The scene pass writes its view normals for the ambient occlusion (one more target in the same draw); GTAO rebuilding them from the reversed depth buffer had left a seam across the middle row of every view, the lower half darker.

## v9.79 — The Lotfollah dome inside; the Taj's screen and bazaars (2026-11-06)
- Sheikh Lotfollah's chamber inside: the bent passage, lapis and marble walls, eight cable-outlined arches with script bands, squinch hoods, the windowed drum and the buff dome with twelve rings of lemon medallions round a sunburst, the muqarnas mihrab; the Qeysarieh portal's Sagittarius tile panel; horses and people on the square; the Taj's octagonal pierced-marble screen with inlaid frames and kanguras round Mumtaz Mahal's cenotaph; the forecourt's bazaar streets of cusped verandahs with gates; goods, keepers, buyers, horses and boats on the Yamuna.

## v9.78 — Athens: the Theatre of Dionysos, the Odeion, the houses (2026-11-06)
- The Theatre of Dionysos of about 410 with its polygonal wooden seating on the slope, the orchestra with its altar and the wooden skene with painted panels, the stoa and the Older Temple behind; the Odeion of Pericles with its ninety columns and hipped roof; on the Acropolis the Brauronion, the bronze Trojan horse, the Chalkotheke with its armour, the Lemnian Athena, stelae and the Mycenaean wall; every house given a court wall, framed door, shuttered windows and plaster gables, those by the ways with a herm at the door and an altar, well-head and jar in the court.

## v9.77 — The Süleymaniye inside; the Partal and the Rauda (2026-11-06)
- The Süleymaniye's square prayer hall: four piers, great arches, pendentives with script roundels, the 32-window drum, the painted dome, semidomes and tympana on red granite columns, domed aisles, the muqarnas mihrab, Iznik panels and coloured-glass windows of the qibla wall, the marble minbar, the sultan's loge, the muezzins' platform, the great low lamp rings and carpets; Granada's Partal with its portico, pool and the Tower of the Ladies, the Rauda's mausoleum and garden of tombs, the Alcazaba's keep and Torre de la Vela with the military quarter, houses of the medina inside the walls.

## v9.76 — The Iron Pagoda's glazed skin; tea houses (2026-11-06)
- The Iron Pagoda clad in moulded glazed bricks (seated Buddhas in niches, rosettes, flying figures with lions, arched framed openings, glazed bracket sets); the Kaibao gate hall's two clay guardians; horizontal name boards over shop fronts in Kaifeng and Hangzhou; tea houses with landscape scrolls, plum vases, braziers, kettles and black bowls, potted pines and customers; Buddhas on hexagonal thrones with altar tables and carved bases in the Liuhe Pagoda's chambers and corridors.

## v9.75 — Angkor's open sanctuary; Borobudur's Buddhas and reliefs (2026-11-06)
- Borobudur's Buddhas in framed niches with kala lintels and mudras by direction, the latticed stupas' Buddhas teaching, relief panels with composed scenes on the walls and the balustrades' inner faces, devotees, monks and pilgrims, the monastery's life; Angkor Wat's central sanctuary opened to the four quarters with the eight-armed Vishnu, naga balustrades on columns rising into nine-headed fans, lions at the causeway, wooden coffered ceilings under the gallery vaults, quarter-vaulted half-galleries, Brahmin priests, dancers and musicians on the Terrace of Honour, devotees with offerings.

## v9.74 — Throne halls of Beijing and Seoul; Gyeonghoeru of 1412 (2026-11-06)
- A shared throne module with carved dragons: the Hall of Supreme Harmony's throne at its published size on its dais before the seven-leaf screen, luduan, enamel elephants, cranes, gilt dragon columns and the dragon caisson; the Halls of Central and Preserving Harmony furnished; Geunjeongjeon's red throne, canopy and three-leaf sun-moon-five-peaks screen; Gyeonghoeru as Taejong's pavilion with its 48 dragon-carved stone pillars; Beijing's courtyard houses with goldfish jars, pomegranates and chrysanthemums; Seoul's court in session at the rank stones, with guards at the gates.

## v9.73 — Esagila and the Euphrates; Persepolis' wall and delegations (2026-11-06)
- Esagila at Koldewey's size with its towered gates, court of altars and Marduk's gold-sheeted cella with the golden throne, table and image; Etemenanki's summit temple in blue glaze with Herodotus's couch and table; the Euphrates bridge on boat-shaped piers; the east-bank quay wall with towers; round hide boats; Babylonians, boatmen, porters and priests; Persepolis' mudbrick fortification with towers along the east edge and up the slope; guards with pomegranate spears at the gates; five delegations with ushers, gifts and animals walking to the Apadana.

## v9.72 — Street dressing turned with New York; seated poses; Māori dress; the kneeling Doge (2026-11-06)
- Generic street dressing reads lots inside turned elements (New York's benches, crates, stalls and figures back, aligned with the 29° grid); distinct ids for generic life plans; new seated poses on steps, on the ground and seiza, used where people sat on chairs that weren't there; a Māori dress kit (flax rāpaki, cloaks, topknots with bone combs); Madurai's temple elephant on the shared model with ash stripes, bell and anklets; Doge Barbarigo kneeling before the lion on the Clock Tower.

## v9.71 — Showroom: game lighting, 68°, any size, site views (2026-11-06)
- The showroom serves its items as JSON (any list size), lights with the game's renderer and climate (metals and gilding read as in game; --light simple for speed), uses the game's 68° field of view, renders real settlement views from a pose or the arrival in 2–4 minutes (--site, --at, --arrival, nearby elements only), and can build the viewer's welded geometry (--weld).

## v9.70 — Nineteen new materials (2026-11-06)
- Tin-mercury mirror glass in the Hall of Mirrors, maroon cloth for Lhasa's monks, africano marble in St Peter's, Prussian blue on Big Ben's dials, green leather on the Commons benches, rough lime plaster and coral rag at Kilwa (and coral_plaster without coursing), carved pietra serena and Elba granite in the Mercato Vecchio, white and yellow sandstone in Petra's bands, chalk at Stonehenge, coral and obsidian eyes on the moai, fibre rope, flax leaves at the pā, dull aluminium on the Empire State Building, light concrete and brush box at the Opera House.

## v9.69 — The Palace of Westminster inside (2026-11-06)
- Westminster Hall's south arch opened to St Stephen's Porch; St Stephen's Hall with its statesmen and stained glass; the Central Lobby under its mosaic vault with the chandelier, sixteen sovereigns and Poynter's St George, the Central Tower over it; the Commons and Lords corridors and lobbies with Ward's paintings and the Brass Gates; the House of Commons (green benches, Speaker's chair, Table and mace, galleries, the Ladies' grille); the House of Lords (red benches, Woolsack, the gilded throne and canopy, barons in niches, frescoes, heraldic ceiling); the Great Clock's opal dials with gilt surrounds and the Latin prayer.

## v9.68 — Versailles: the Hall of Mirrors and the Grand Apartment (2026-11-06)
- The garden block opened inside; the Hall of Mirrors with 17 windows facing 357 mirrors, Rance pilasters with French-order capitals, trophies, the painted barrel vault, chandeliers, parquet and the silver furniture of the 1680s; the Salons de la Guerre (Coysevox's relief) and de la Paix; the King's Grand Apartment in its enfilade (Apollo's silver throne, Mercury's bed, Mars, Diana, Venus with Warin's statue); the Ambassadors' Staircase with its fountain and painted Parts of the World; the Grand Canal ending in a stone landing with steps, quay and boats.

## v9.67 — Constantinople's Chalke and Senate; Jerusalem's walls and Umayyad palace (2026-11-06)
- The Chalke gate with its gilded bronze roof, domed bay, gold mosaic vaults and the mosaics of Justinian, Theodora and Belisarius; the Senate house with its six-column porch and statues; the Augustaion's porticoes opened; the Mese's roofed porticoes with shops; the Forum of Constantine's two-storey ring and arches; 6th-century street life; Jerusalem's Herodian retaining walls with margined blocks and Umayyad courses, the Double, Triple and Golden Gates, al-Walid's palace with its court, reused columns, cistern and bridge to the Haram, the pillared building, people.

## v9.66 — Wutai, Uji and Sanchi, second pass (2026-11-06)
- Foguang's red-lacquered ping'an ceilings and oil lamps before the Buddhas, monks' quarters, pilgrims on the stairs; the Phoenix Hall's mother-of-pearl canopy with its openwork inner canopy and mirror, the 66 ceiling mirrors, raigō paintings on the walls and doors, the Byōdō-in bell tower, fishing weirs and boats on the Uji, travellers and an ox cart on the bridge; Sanchi's Stupa 2 with its carved medallion railing and L-shaped entrances, Temple 40's hall of fifty pillars, monks and pilgrims.

## v9.65 — The Potala as one body; Shöl's courtyard houses (2026-11-06)
- Joint blocks close the V-notches between the Potala's battered masses (46, carrying roof, frieze and coping on to the higher walls); windows skip faces covered by stairs and neighbouring masses; the zigzag stairs bedded into the wall and the ground; Shöl's houses as two-storey courtyard houses with galleries, gates, roof-corner flag bundles and incense urns; the Shöl printing house with its woodblock racks and printers' benches; pilgrims with prayer wheels walking the circuit clockwise, monks in the Deyang Shar and on the roofs.

## v9.64 — Florence: room to build; Palazzo Medici, the Mercato Vecchio, Santa Maria Novella (2026-11-06)
- Florence's houses re-tiled in 150 m tiles (1489 → 875 meshes, half the draw calls); the Palazzo Medici with graded rustication, great cornice, the open corner loggia, shops and the court with tondi, sgraffito and Donatello's David; the Mercato Vecchio with the column of Abundance and the Dovizia, the market hall and its counters; Alberti's front of Santa Maria Novella with avelli, striped pilasters, the Rucellai sails, the rose, the inscription and the left volute only inlaid.

## v9.63 — St Peter's in marble (2026-11-06)
- St Peter's nave in polychrome marble: fluted proconnesian pilasters with gilt capitals, pier faces with Innocent X's medallions held by putti, coloured-marble niches and panels, reclining Virtues on the arches, the inlaid floor with its roundels and porphyry disc, the bronze St Peter, the tombs of Urban VIII and Paul III; the church raised on a travertine socle with three flights of front steps and its sagrato; the transepts opened into coffered apses.

## v9.62 — New York at 29°; arrivals re-checked (2026-11-06)
- New York's grid turned 29° as Manhattan's is (a turned element rotates geometry, instances, lights and obstacles exactly; floors become strips), its arrival with it; every arrival surveyed with a new view-check script (rays over the view cone, nearest hits, the landmark's offset): Borgund, Machu Picchu (now from the saddle to Huayna Picchu), Kilwa, Barcelona, Isfahan and Tenochtitlan re-aimed.

## v9.61 — The Palais de la Cité and the Sainte-Chapelle (2026-11-06)
- The Sainte-Chapelle's flanks with framed upper windows, crocketed gables and pinnacled buttresses, the cornice and openwork balustrade, the lead roof with its fleur-de-lis crest, the archangel and the flèche, spherical-triangle windows below, the stair with arcaded parapets; the king's gallery to the Grand-Salle with its twin naves and roses; Tour Bonbec, Tour César and Tour d'Argent on the quay; the walled Barillerie side with its gate; the stone quay with water stairs and boats; the king's garden with raised beds, arbour, well and orchard; the unsourced east hall removed.

## v9.60 — Figures: dress and poses; elephants (2026-11-06)
- The figure library gains loincloth, shendyt and sheath dresses, bare chests, broad collars and wigs; kneeling, cross-legged, praying, pulling, staff, rowing and punting poses (combinable with arms); a child on the hip; a detailed Asian or African elephant with tusks and caparison; regional dress defaults for Egypt, South and Southeast Asia, the Americas and the Pacific, with Ur, Knossos and Great Zimbabwe overrides; boat crews pole their boats.

## v9.59 — Ur's shrine and harbour; Giza's mastaba streets; Edfu's ceilings; Durrington (2026-11-06)
- Ur: plain stairs in mud brick, the House of Nanna on the summit (towered entrance, cella with the crescent standard), the upper stages set back so the shrine is reached, Sumerian reed boats with horned ends, the harbour quay; Giza: mastabas re-laid on north–south streets with stelae and mud-brick chapels, funerary priests, offering bearers, bakers, painted relief registers and star ceilings in the temples; Edfu: the gate's winged disc at its true span with lintel and jamb reliefs, the granite naos of Nectanebo II, astronomical ceilings in both hypostyles, the Nile quay with barges and porters; Stonehenge: the Southern Circle's five timber rings, the Durrington avenue, long and bowl barrows.

## v9.58 — Florence's Baptistery and Orsanmichele; Venice's Clock Tower; St Peter's (2026-11-06)
- The Baptistery in white and green marble with Ghiberti's gilt Gate of Paradise and the two quatrefoil doors; Orsanmichele with its fourteen guild tabernacles as about 1480; Venice's Clock Tower of 1499 with its dial, Magi doors, lion and giants; the old Procuratie after Bellini; the Piazzetta's lion and St Theodore on their columns; St Peter's front by Maderno with the Loggia of the Blessings and its inscription; St Peter's walkable inside: coffered nave, crossing piers with saints, the dome with its inscription, Bernini's baldacchino and the Cathedra Petri.

## v9.57 — Rapa Nui's walking moai; the pōwhiri (2026-11-06)
- Coral and obsidian eyes on the Tongariki moai; a moai walked upright by three rope teams along its road from the quarry; plank canoes with fishermen; bananas in the manavai; people on the plaza; at the pā a pōwhiri before the chief's house (elders on the paepae, the caller, the visitors at the gate, the challenger with taiaha and dart), a hāngī with an open and a covered oven, weavers and flax, fish racks, a waka being hollowed, warriors on the fighting stages.

## v9.56 — El Castillo's stairs; the Ball Court; the Empire State Building (2026-11-06)
- El Castillo's stairs as solid masses outside the tiers at 45° (no ledges through the treads), platform stairs with real treads; the Great Ball Court's slanted benches with the decapitation reliefs, carved rings and the Temples of the Jaguars; El Caracol; a market of mats south of the Thousand Columns; Knossos' West Magazines with pithoi, the theatral area after Evans, the paved Royal Road, town houses after the Town Mosaic; Conques' bridge over the Dourdou; the Empire State Building with its setbacks, spandrels, entrance and mooring mast; the Sixth Avenue El with stations; Grand Central's 42nd Street front and the Park Avenue viaduct; shop fronts, newsstands and tenement yards; Sydney's Rocks terraces and bond stores, the Harbour Bridge's trusses in true proportion with the 1973 deck, Circular Quay's wharves with gangways, the Opera House's shell undersides and northern foyers.

## v9.55 — Westminster Hall; Versailles' Marble Court (2026-11-06)
- Westminster Hall in its true section with Herland's thirteen hammerbeam trusses, carved angels, traceried windows, the north front and St Stephen's Porch, enterable; hansom cabs, knifeboard omnibuses, gas lamps, paddle steamers, lighters and a floating pier; terrace houses removed from inside the hall and New Palace Yard; Versailles' Marble Court in its U plan with the marble paving, brick-and-stone fronts with busts on consoles and gilded balconies, slate mansards with gilt cresting, the paired red marble columns and the clock pediment with Mars and Hercules, the gilded railings of the Royal Court and forecourt.

## v9.54 — Ming wall gates open; Suzhou's garden (2026-11-06)
- Ming wall copings closed over gates so their passages are walkable (Suzhou, Seoul, Angkor and every wall gate); doorways no longer drawn filled in; plinths stop at gates; leaky-window bars given sides; Suzhou's garden: hanging fretwork under gallery and pavilion beams, gallery frames with leaky windows, zigzag granite bridges with landing slabs and rails, rockery paths among Taihu stones with a grotto, women washing at the public landings; the garden door moved off the back of the women's building.

## v9.53 — Borgund inside, Moscow's Red Square (2026-11-06)
- Borgund's arrival set on the ground; the stave church hollow and walkable (staves, knee-brace arcades, St Andrew's crosses, round openings, open roof, chancel with crucifix beam, apse, altar, font), dry-stone churchyard wall and lychgate, farm life; the Dormition Cathedral's interior with painted piers, the iconostasis tiers and the Monomakh throne; the Spassky and Nikolsky gate passages opened; the moat with its trestle bridges and booksellers; the stone trading rows of 1595, the Lobnoye Mesto, the Tsar Cannon.

## v9.52 — Welded geometry: 28% less memory; Machu Picchu, Taos, Cahokia (2026-11-06)
- Merged meshes welded (identical position and normal only) and indexed, normals packed to 16 bits, 16-bit indices kept 16-bit on the GPU: all sites 1297 → 935 MB with the same picture; Machu Picchu's stone canal and sixteen fountains, the Royal Tomb under the raised Torreón, the Sacred Rock with its wayronas, the Main Temple's niches and great stones; Taos' sunken kivas with pole palisades, the battered wall, log footbridges, mealing bins; Cahokia's charnel house on Fox Mound.

## v9.51 — Fifth wave: every place reachable on foot (2026-11-06)
- plan-check walks as the viewer's walker does; reachability fixed at Djenné (doors, roof stair), Kaifeng (monastery gate hall), Lhasa (ramps, Deyang Shar gate, Great East Hall, stairs to the Red Palace roof), Madurai (gopuram plinths, the Golden Lotus tank dug out), Persepolis (palace stairs, the Tachara and Hadish), Borobudur (stupas spaced off the axes), Isfahan (Ali Qapu's interior and music room), Himeji (a gate to the keep's court, every floor reached), Nara (gate steps), Paris (Sainte-Chapelle's porch eave), Cairo (a market street to Sultan Hasan); new: Djenné's Monday market, Kilwa's second suite and South Court vaults, Great Zimbabwe's Hill Complex and Valley Ruins, Kaifeng's shops, fortune tellers, ox carts and trackers, Liuhe's interior, Madurai's Ashta Shakti Mandapam, temple car and elephants, Khajuraho's platforms and Varaha pavilion, Petra's colonnaded street and Great Temple, Angkor's cruciform cloister, Isfahan's arcade shops, Nara's attendant bodhisattvas, Niō and deer, Himeji's Hishi gate, Uji's pebble shore and island, Notre-Dame hollow and walkable with its jubé, Paris's bridges with houses and mills, the Cairo Citadel's road, walls and mosque; Amsterdam's sledges, no stalls in ceremonial plazas, draw-wells by region.

## v9.50 — Stairs that can be climbed; material swaps (2026-11-06)
- The walker climbs stairs built over solid masses (the mass under a stair is cut back to its sides; roof-top cells lowered to the stair) and steps onto terraces and plinths within a step; Giza's mortuary temple door, causeway on the plateau into the valley temple, the valley temple on the valley floor with its quay; Machu Picchu's plaza banks and temple steps; footbridges into Isfahan's square; a side door and steps at Suzhou; stairs up Borobudur's round terraces; arrivals re-aimed at Lalibela, Granada and Barcelona. Materials applied: breccia, bitumen and red-glazed manes at Babylon, pietra dura stones and water jets at Agra, water jets and a 31.3 m Myrtles pool at Granada, Egyptian blue and fresco green at Athens and Knossos, muqarnas recesses in the Shah Mosque's court arcades.

## v9.49 — Petra's Siq in rock (2026-11-06)
- The Siq's walls as real sandstone: some seventy colour bands matched across both walls, worn grooves and ledges, cracks, inward lean closing overhead, flood-worn foot, fallen blocks; the cliffs joined round the square, the Outer Siq, the theatre and the valley, the Khazneh set in its recess; no stalls in the gorge; the Street of Façades with three crow-step tomb types; the theatre rebuilt with three tiers and a two-storey stage, moved off the walkway; the Palace, Corinthian, Silk and Urn Tombs standing on the valley floor.

## v9.48 — Hagia Sophia, the Pantheon, Sainte-Foy and Sanchi (2026-11-06)
- Hagia Sophia after Paul the Silentiary: the cross at the dome's crown, 80 lamps on the cornice, gilt-moulded marble cornices, porphyry spandrel discs, the silver chancel barrier with three doors, the silver ciborium over a gold altar, the lamp ring of silver discs; the Pantheon's eight aediculae with porphyry columns, the attic band, the bronze doorway with open leaves and lattice transom, the pediment eagle; Sainte-Foy's golden Majesty on its throne and the tribunes' twin arches; Sanchi's harmika railing and three-tiered parasol.

## v9.47 — Amsterdam's Dam (2026-11-06)
- The Dam paved in setts with bluestone kerbs and stone-edged gutters; the Waag with its great balances, porch roofs and city arms; the Damrak harbour with moored boats and quay houses; fish benches, goods sledges with horses and carters (sledges, not carts, as sources record), greengrocers, porters and burghers; the houses round the square turned to face it; house backs everywhere with framed windows, back gables, annexes, yard walls and privies.

## v9.46 — Kilwa: Husuni Kubwa on its headland (2026-11-06)
- Kilwa's ground in terraces with retaining walls and cliffs (the palace no longer runs off the plateau); Husuni Kubwa rebuilt: the audience court with niched walls and verandahs, the pavilion up nine steps, the sunken octagonal pool, private and domestic courts, the double suite, vaulted ranges, the South Court's 48 storerooms, the cliff stair to the beach mosque; coral-stone houses raised over the lanes with sunken courts, pole ceilings, niche walls with porcelain; the Great Mosque's doorways opened; walkable from the arrival (332,000 m², was 2,500).

## v9.45 — Teotihuacan and Tenochtitlan, second pass (2026-11-06)
- Teotihuacan's avenue rising plaza by plaza toward the Moon, the Palace of Quetzalpapalotl with its carved bird pillars and the Jaguars' patio murals, altars, censers and worshippers on the arrival plaza, the Great Goddess in the Moon Plaza; Tenochtitlan's House of the Eagles with its warrior benches and eagle warriors, the calmecac, the blue and ochre coatepantli serpent walls round the Templo Mayor, the precinct's enclosing platform, Ehecatl's round temple with its serpent-mouth door, the Temple of Tezcatlipoca, a causeway bridge.

## v9.44 — Barcelona's Nativity façade in 1910 (2026-11-06)
- The Nativity façade's three parabolic portals with their sculpture (the Charity trumeau, star, Annunciation and Coronation; Hope and Faith scenes), palm columns on turtle and tortoise, four broken-off towers in timber scaffolding; trams on the Passeig de Gràcia and round the cut corners with overhead wires, closed cars and open jardineres; hackney carriages; the Eixample's court gardens; plane trees in rows.

## v9.43 — The Süleymaniye külliye (2026-11-06)
- The four medreses with domed porticoes, chimneyed cells and dershanes, the arasta shops, the darüşşifa with its octagonal pool, the imaret's kitchens and bakery, the hamam with its 3×3 hot room and glass bulbs, the dar'ül-hadis; Iznik tiles in Hürrem Sultan's türbe.

## v9.42 — Third wave: materials, shared styles, tools and follow-ups (2026-11-06)
- New materials (soapstone, carved limestone, spotted dolerite, breccia, bitumen, water jets and foam, pietra dura, Iznik tile, mirror work, pāua, tukutuku, kōwhaiwhai, cast-iron plates, rough banco) used across ten sites; the shared figures, animals, stalls, carts and boats rebuilt with regional dress; vernacular houses with framed windows, real eaves and a Mamluk Cairo house type; ming roofs laid along their hips, scroll ridge ends, leaky windows, Taihu rocks, canal walls and landings; surface-check rewritten (streams, reports failed builds, fits big sites), showroom --inplace/--ground/--timeout, plan-check and walk-check for settlements; Foguang's Tang bracket sets and altar, the Dome of the Rock's walls, the Phoenix Hall's Amida, Sainte-Chapelle's west front; Tenochtitlan's calli houses, tecpan palace, tzompantli and ballcourt; Persepolis' lamassu, throne-hall door reliefs and traces of colour; Babylon's palace against its wall; the Hephaisteion, Agora stoas, Tholos and the Erechtheion's north court; the Taj's closed iwan recesses, garden and riverfront; the Court of the Myrtles, Comares and the halls round the Lions; Joseon white upper walls, dancheong and brackets, Beijing's corner towers and moat wall, the Potala's Deyang Shar, triple stair and banner, Bete Giyorgis' pit re-proportioned; Nara's deep eaves; rare street-life shapes merged indexed.

## v9.41 — Second parallel wave: 29 sites in detail (2026-11-06)
- Persepolis' bull capitals and Apadana stair reliefs, Petra's full Khazneh and sheer Siq, Isfahan's arabesque domes and Ali Qapu talar; Stonehenge's shaped sarsens, curved lintel ring, trilithons, houses and gathering; Jerusalem's Aqsa hypostyle, walls, Cardo and Holy Sepulchre; Kaifeng's woven Rainbow Bridge, lowering-mast boats, colour gates, sedans and camels, Liuhe's bracketed galleries and tide-day stands, Wutai's pillar and Zushi pagoda; Nara's square pagodas, bronze lantern and Rushana, Uji's phoenixes and timber bridge, Himeji's windows, shachi, kara-hafu and loopholes; Amsterdam's gabled canal houses, Westertoren, Town Hall and quays; London's Perpendicular river front, 1862 bridge, embankments and Abbey; Notre-Dame's portals, rose, Gallery of Kings and flying buttresses; Conques' Last Judgement; Versailles' garden front, Latona and canal life; the Signoria, Loggia and Ponte Vecchio; the Doge's Palace and San Marco's horses; Bernini's angels and St Peter's square; the Court of the Lions; the Süleymaniye's court, minarets and Hürrem's tomb; Cairo's minarets, mashrabiya fronts and sabil-kuttabs; Kandariya's clustered śikhara, Sanchi's torana figures and Ashoka capital, Madurai's gopuram crowns, the Taj's inscriptions, inlay and fountains; the Chrysler crown and 1931 streets, the 1910 Sagrada Família, Casa Milà and Batlló, the Eixample, Sydney's glass walls and ferries.

## v9.40 — Athens and Knossos in detail (2026-11-06)
- The Parthenon's two pediments of posed figures, all 92 metopes in high relief, the 160 m frieze procession, painted triglyphs and palmette eaves; the Propylaia rebuilt with Ionic hall, starred ceiling, five doors and Pinakotheke; Ionic temples given a true Ionic entablature; the Nike temple and its Victory parapet; the Erechtheion with its north porch and caryatids; bronze Promachos and a gold-and-ivory Athena Parthenos; Knossos' Throne Room with griffins and lustral basin, the West Bastion's charging bull, the Grand Staircase light well, the Queen's Megaron dolphins and the bull-leaping fresco.

## v9.39 — Mesoamerica in detail (2026-11-06)
- Teotihuacan's Avenue of the Dead as a run of sunken plazas crossed by red talud-tablero platforms with stairs and temples, the Moon Plaza lifted out of the ground, framed tableros, about 300 heads on the Feathered Serpent Pyramid, the Ciudadela's fifteen temples, apartment compounds with patios and porticoes; carved serpent heads and serpent columns, Chaac masks, the chacmool and warrior pillars at Chichen Itza; the Templo Mayor's painted twin shrines, Coyolxauhqui stone, beam bridges, dugout canoes and a market with sellers on mats at Tenochtitlan.

## v9.38 — Mesopotamia, Rome, Byzantium, the North, Beijing and Seoul in detail (2026-11-06)
- Babylon's paved Processional Way, glazed lion walls with rosettes, stepped battlements, Ishtar Gate rows of bulls and dragons, a walkable Southern Palace with the enamelled throne-room facade, Etemenanki's south stair; Ur's houses after Woolley, the cone-studded temenos terrace and gate towers; two-storey arcaded stadium facades, Ostia-type insulae with shops; the Hippodrome's carceres, obelisk, Serpent Column and kathisma, Hagia Eirene as a domed basilica, the columns of Justinian and Constantine and the Milion, the Mese rerouted; Borgund's open svalgang, turret, bell tower and log farm; the Kremlin's swallowtail merlons and tented towers, St Basil's arcade and kokoshniks, izby with horse-head ridges; the Forbidden City's carved balustrades, dragon spouts, lions, terrace bronzes, roof beasts and nailed gates; Gyeongbokgung's japsang, haetae and balustrades.

## v9.37 — Egypt, Angkor, Borobudur, the Pacific and the Potala in detail (2026-11-06)
- Edfu's falcons, pylon smiting reliefs, flagpole clamps and a real birth house; Giza's royal ship, sealed boat pits and bakeries; Angkor's redented lotus-bud towers, porticoes, bas-relief, balustered windows, devatas and libraries; Borobudur's 72 pierced stupas, crowning stupa, kala-makara gates, spouts and pilgrims; sculpted moai, fitted ahu, Rano Raraku quarry and hare paenga; the Māori pā's carved figures, chief's house, pātaka, waka taua and kūmara gardens; the Potala in stepped battered masses with Tibetan windows, pembe friezes, zigzag stairs and banners, Shöl walled with gates and pillars.

## v9.36 — Africa and the Americas in detail (2026-11-06)
- Djenné's arcaded prayer hall, ribbed qibla towers and roof vents; Kilwa's domed and vaulted mosque and sewn mtepe boats; Great Zimbabwe's tower dentelle, Eastern Enclosure birds and hill boulders; Lalibela's Aksumite windows, triple-cross roof and pilgrims; Machu Picchu's battered trapezoid-opening walls, Torreón and Intihuatana; Taos' vigas, roof hatches and racks; Cahokia's daubed palisade with round bastions, summit house and chunkey yards.

## v9.35 — The Shah Mosque's iwan (2026-11-06)
- Isfahan's great iwans (the Shah Mosque's portal and court iwans, Lotfollah's portal) have their muqarnas hoods: eight tiers of tile-faced cells stepping in from the springing to the crown, cream, lapis and turquoise by turns with white edges, a lapis crown panel; below, the iwan's walls lined with a lapis dado and a band of white letters on blue at the springing (tile_white).

## v9.34 — Babylon's lions; slower movement (2026-11-06)
- The lions of Babylon's Processional Way are redrawn: striding, one fore and one hind leg forward, the tail raised with its tuft, the jaws open, the ear; the yellow mane with its edge in tufts; a blue eye. Movement is slower at the owner's word: walking 2.6 → 2.0 m/s, running 6.5 → 5.2; aloft the horizontal speeds 12 + 0.3/m up to 160 → 9 + 0.22/m up to 120, and with Shift 24 + 0.6/m up to 300 → 18 + 0.45/m up to 240.

## v9.33 — Weathered garden walls (2026-11-06)
- Suzhou's long white walls (ming_wall with the white plaster) are weathered on both faces: a ragged band of damp and lichen rising above the plinth, rain streaks under the tiled coping, kept clear of the gates and leaky windows (plaster_damp, plaster_streak).

## v9.32 — A tavern and a joiner's workshop in Paris (2026-11-05)
- The two timber houses nearest Paris' arrival are open on the ground floor (house_timber takes open and use; openTimber): a wide door in the stone front with its leaves open, a step, flags, the beams overhead. The tavern: trestle tables with benches, jugs and cups, the hearth with jambs, hood and pot, casks on a stand, a shelf of jugs. The joiner's workshop: the bench with its vice and shavings, a half-made chest, a trestle, planks stacked, tools on a rail, a tool chest, shavings on the floor. Dossier noted.

## v9.31 — Village houses to enter (2026-11-05)
- The village houses of Tang Wutai, Nara, Heian Uji, Khajuraho, Sanchi and Conques can be entered: the three nearest each arrival are hollow (gabledHouse takes open; openGabled): walls with the door's way cut, the leaf open inside, a step, the floor and a ceiling of boards on beams, furnished by region — China: the kang with its mat and low table, the stove feeding it, glazed water jars, a chest; Japan: the raised board floor, the sunken hearth with its kettle on a hook, mats, a low table, a lacquered chest, a hanging shelf; India: the clay stove, water pots, two string beds, a clay grain bin; the Rouergue: the hearth and its pot, table and bench, chest, a bed of boards with straw. Dossiers noted.

## v9.30 — Houses to enter in six more towns (2026-11-05)
- In Florence, Rome, Venice, Versailles, Granada and Istanbul the three houses nearest the arrival can be entered (openLots in src/settlements/lod.js; house_med takes open and use): a step up from the street, the door leaf standing open inside, a floor of terracotta, flags or brick, the ceiling's beams. The first is an inn in the Christian towns: tables with benches, the counter with jugs, wine barrels behind it, the hearth with its jambs, hood and pot, hams and cheeses hanging. Homes: table and stools, the hearth, a chest, a bed, a cupboard of crockery. In Granada and Istanbul: the divan round the walls with mattresses and cushions, a rug, the brass tray on its stand, a hanging lamp, a painted chest. Dossiers noted.

## v9.29 — Houses to enter in Suzhou (2026-11-05)
- The first enterable houses (DESIGN §4.3): in Suzhou the two shops and two homes nearest the way in are open and furnished. Shops: the counter with a way in at one end, abacus and steelyard, a stool, shelves of glazed jars and bolts of cloth, a paper lantern. Homes: the door leaf folded open; the hall's long table against the back wall with incense burner, vase and a hanging scroll; the square table between two armchairs; a tall cabinet, a washstand with its basin, stools; a canopied bed with curtains half drawn behind a screen; a brick floor and the upper floor's boards and joists overhead. house_jiangnan takes open: true.

## v9.28 — The great rivers (2026-11-05)
- The open country has its great rivers (DESIGN §4.1): the Nile, Tigris, Euphrates, Indus, Ganges, Yangtze, Yellow River, Danube, Rhine, Amazon and Mississippi, each a coarse line of Earth's coordinates from the mouth upstream carried onto the planet through the layout's map (src/planet/rivers.js); densified every 45 m and given meanders; bent round the settlements' discs and blends (the layout moved the sites for room, so a true course may cross a disc not its own: a run inside is laid on the disc's ring, the short way round). The relief cuts the bed below the sea's level, so the sea's surface is the river's water and it cannot be waded; the banks fall to it over 26 m in mud and sand, without trees. 22–60 m wide. tests/rivers.test.mjs: every river laid with water along it, none through a disc.

## v9.27 — Roads between a region's settlements (2026-11-05)
- The open country now carries the roads that join the settlements of one region (DESIGN §4.1): a spanning tree of each region's settlements, shortest links first and none longer than 2.6 km (23 roads: China, Japan, India, Mesopotamia, Persia, the Levant, the Bosphorus, Egypt, the Aegean, Latium, Britain, France, Iberia, Italy, Mexico); each a great-circle arc from centre to centre that wanders a little, 5–8 m of beaten earth, with a strip of fields either side except in the desert, not on steep, high or snowy ground nor on the beach. tests/roads.test.mjs checks they are laid and show on the ground. Life: the landmarks' raised open rooms take their own height directly (no longer by building every landmark's floors), so laying out the life is fast again.

## v9.26 — Conques' west front (2026-11-05)
- Sainte-Foy's west gable is no longer a stack of stepped slabs: a smooth stone triangle with a coping along both slopes, a stone cross at the apex, and a corbel table under a moulding along its foot; two flat buttresses flank the portal up to the windows' sills under sloped caps. New romanesque element: west_gable.

## v9.25 — Kilwa's ground, Ur's skin, the Taj's minarets (2026-11-05)
- Kilwa's ground is no longer snow-white: inland the coral rag weathers to a grey-brown sandy soil under grass, only the beach stays white; round the mosque and palace less paving. Ur's ziggurat: rows of weeper holes through the baked-brick skin every 1.8 m up each stage, between the buttresses (dossier §4, sourced), and low parapets rising with the central stair. The Taj Mahal's minarets: an octagonal base, the shaft tapering, its marble blocks outlined by thin dark joints (rings and verticals), the three balconies on brackets with railings.

## v9.24 — Crafts at the doors (2026-11-05)
- Crafts at about one door in fifteen, by region: a potter squatting among his pots and a big jar (most regions), a basket-maker sitting among her baskets (Asia, Africa, the Americas, the Pacific), a dyer's cloth on lines by a dark vat (the Near East, South Asia, Africa, the Andes, China), a carpenter with timber and a ladder, a cooper among his barrels (Europe, Venice). Goods unloaded on the quays follow the region: sacks, baskets and jars except in Europe (sacks, crates, barrels).

## v9.23 — Work in the fields, goods on the quays (2026-11-05)
- Field work in every settlement with fields: people hoeing or bent over the crop in twos and threes, an ox, buffalo or zebu by region, a basket at the edge (Giza, Angkor and others). By boats moored at the shore, their goods set down on land (sacks, crates, barrels; sacks, baskets and jars in East Asia) with porters. A new figure load: the hoe, held in both hands. Fixed: a figure's own load and height given by the life pass were overwritten by its dress (the porters' poles, the people on raised terraces).

## v9.22 — People in the landmarks' open places (2026-11-05)
- Every landmark's open rooms (precincts, courts, terraces, plazas, gardens) now have people about in them, thinner in gardens and denser in courts; a terrace well above the ground keeps its own height. A building that encloses its court (Sultan Hasan's block, the Alhambra's courts) no longer blocks people from standing in it. Courts are no longer taken for markets, so no stalls in a mosque's or a palace's court. House-front fittings are sparser (a third of plain houses, most shops), the Near East's mostly washing, single lanterns outside East Asia, spaced 3 m apart.

## v9.21 — House fronts and boat crews in every town (2026-11-05)
- The life pass dresses the house fronts of every town by its region: paper or white lanterns under the eaves and cloth banners (East Asia, Japan), white lanterns (the Near East), painted board signs on scrolled iron brackets (medieval and early-modern Europe, Venice, the industrial cities), washing on bamboo poles out of upper windows (the Mediterranean, East Asia, South Asia, Venice, Europe), spaced so neighbours' signs never clash. Boats along the shores now carry their crew: the gondolier or boatman standing at the stern (with the sculling oar on sampans), or someone sitting amidships. Suzhou keeps its own canal-side life.

## v9.20 — Life along Suzhou's canals (2026-11-05)
- Suzhou's canal quarter is lived in: shops with cloth banners on brackets (read along the street), pairs of paper lanterns under the eaves, jars, baskets and sacks on the counters, shopkeepers and customers; tea tables set out in the street with people sitting at them; washing on bamboo poles pushed out of the upper windows over the water; waterside houses with their own steps down to the canal and women washing at the bottom; boats with the boatman standing at the sculling oar, carrying jars, sacks, baskets or a passenger (they replace the empty boats); people along the streets with shoulder poles and baskets, knots talking, dogs, hens, wheelbarrows; benches on the canal side with old men sitting. New shared objects: shop_sign, hang_lantern, laundry_pole, tea_table, drying_tray, oar. Dossier §6 extended, after Qiu Ying's Ming scroll.

## v9.19 — Interiors: Santa Maria del Fiore (2026-11-05)
- Florence's cathedral is hollow as it stood in 1480: the central west door open into the nave of four great bays; composite piers of pietra serena with half-columns and leaf capitals; pointed arcades to the aisles; groin rib vaults (two pointed barrels crossing, ribs of pietra serena); the walkway on corbels at the springing; round stained-glass windows in the clerestory and lancets in the aisles where the outer skin has its windows; a cotto floor; Uccello's 24-hour clock on the inner façade. Under the dome: the octagon's walls with great arches to the nave and the three tribunes, the drum's eight round windows of stained glass, the inner shell white between its ribs, open to the lantern; Brunelleschi's octagonal wooden choir round the high altar. The tribunes have five chapels each, lit by lancets, under ribbed half-domes, joined to the crossing by closed necks. The crossing and the tribunes now turn so that a face, not a corner, looks down each arm. Dossier §4 extended, sourced.

## v9.18 — Interiors: the Taj Mahal's tomb chamber (2026-11-05)
- The Taj Mahal can be entered by the south iwan's door and a vestibule into the tomb chamber: an octagon of 7.3 m sides, each face with two storeys of arched niches, the axial ones glazed with light behind marble lattices (jali); carved dado panels with flower bosses, thin dark frames, inlay of red, green, gold and blue stones in the spandrels; a ring to the inner dome with the sun at its crown; an octagonal floor; at the centre the marble screen of 1643, three pierced panels a side between posts, one open on the south, round the cenotaph of Mumtaz Mahal on its platform (Shah Jahan's came in 1666, so it is not shown). Dossier §4 extended, sourced.

## v9.17 — Interiors: the court and iwans of Sultan Hasan (2026-11-05)
- Sultan Hasan's madrasa can be entered: a corridor from the portal (its bronze doors open) through the north range to the court's corner. Round the court, four iwans cut into the block, the qibla iwan the greatest, each under a pointed barrel vault opening on the court through an arch rimmed in red and black voussoirs, with glass lamps on chains all at one height. The qibla iwan has a dado of white, rose and dark marble panels, the stucco Kufic band at the springing, the marble mihrab (niche, colonnettes, pointed hood), windows in bronze grilles either side and an oculus above, the bronze doors to the tomb, the marble minbar with its stair and domed canopy, and the dikka on eight columns in front. In the court: the octagonal basin, the madrasas' doors in the corners, a cornice round the top. The solid block is now carved by void boxes (carve()). Dossier §4 extended, sourced.

## v9.16 — Interiors: Himeji's main keep (2026-11-05)
- Himeji's main keep is hollow: its stone base a ring round the basement, entered by a door on the west from the courtyard between the keeps; a stone sink and a grid of posts in the basement; every storey with plastered walls between posts, barred windows lit from outside, boarded floors on exposed joists, the warriors' corridor marked by a ring of posts, gun racks between the windows on the three lower storeys; steep open stairs from floor to floor on alternating sides; the two great pillars, east and west, from the basement to the top storey's floor. The lower roofs are now skirts round the storey above (rectRoof takes a hole), and two passages were shortened where they met the keep. Dossier §4 extended, sourced; the Osakabe shrine is left out (moved to the top floor only after 1945).

## v9.15 — Interiors: the Süleymaniye and the Thousand-Pillar Hall (2026-11-05)
- The Süleymaniye's prayer hall is hollow: thick walls with a north door, four piers, the drum closed to the dome, the painted inner dome with its ring of windows and blue medallion, the great iron chandelier ring of 48 lamps, marble floor under red carpet, the tiled mihrab and the marble minbar; windows seen from inside are a new clear-glass material in a grille of round panes, lit by the sky. Madurai's Thousand-Pillar Hall is carved: some 290 Nayaka pillars in square blocks with framed reliefs between octagonal bands under lotus-bud bracket capitals, a widened central aisle lined both sides with rearing yalis, the ceiling beamed and painted with a lotus in every bay, standing brass lamps, and the bronze Nataraja in his ring of fire at the north end (dossier §4 extended, sourced).

## v9.14 — Kilwa's prayer hall (2026-11-05)
- Kilwa: the Great Mosque's prayer hall is furnished — the mihrab in the middle of the north (qibla) wall in a stepped frame of dressed coral, its niche dark under a pointed head and a band of inset blue bowls above, the wooden minbar of three steps beside it, reed mats in rows facing the qibla across the hall, and glass lamps hanging on chains in the bays.

## v9.13 — The Apadana's throne (2026-11-05)
- Persepolis: the Apadana has the king's place inside — a carpet down the aisle from the north door, a dais of two steps, the throne on lion feet with its high back and cushion, the footstool, the canopy on four gilded posts with its fringe, and two incense burners on tall stands; the hall's south wall is closed behind the throne.

## v9.12 — Geunjeongjeon's throne (2026-11-05)
- Seoul: Geunjeongjeon is furnished inside — its inner columns, the throne on a dais of three tiers with a single stair, the screen of the sun, the moon and the five peaks over the waves in its red frame, bronze cranes and incense burners, the coffered ceiling with gilt bosses and the caisson over the throne. (The throne hall builder now takes the dais's size, a screen kind, and leaves out the gilt dragon columns and the elephants where they do not belong.)

## v9.11 — The Hall of Supreme Harmony's throne room (2026-11-05)
- Beijing: the Hall of Supreme Harmony is furnished inside — the inner columns of its grid (the six round the throne gilded, a dragon wound round each), the three-tiered dais in red lacquer edged with gilt and its three stairs, the dragon throne, the seven-leaved gilt screen, bronze cranes and incense burners on the dais, elephants bearing vases before it, the coffered ceiling with gilt bosses, the stepped caisson over the throne with the pearl hanging from it, and a floor of dark polished bricks.

## v9.10 — Arriving at the best view (2026-11-05)
- Travelling to a settlement from the map now sets you down where its landmark is seen best: the Taj Mahal down its water channel, Angkor Wat at the end of its causeway, the Ishtar Gate down the Processional Way, the Opera House across the cove with the Harbour Bridge behind, the Phoenix Hall across its pond — chosen by eye for every one of the 57 settlements, instead of a spot worked out automatically that often stood too close, behind a wall or facing a blank side.

## v9.09 — Borobudur's reliefs and niche Buddhas (2026-11-05)
- Borobudur: the terrace walls carry their narrative reliefs — one or two registers of framed panels along every straight side, figures standing out in each — and the niches in the upper part of the walls hold seated Buddhas instead of standing empty.

## v9.08 — Kaifeng's Iron Pagoda (2026-11-05)
- Kaifeng: the Iron Pagoda's thirteen storeys are skinned in moulded glazed tiles — rows of raised tile panels on every face, clear round the doors and windows — with engaged columns at the corners and a row of brick bracket sets under each eave, instead of plain brown walls.

## v9.07 — St Peter's front (2026-11-05)
- Rome: St Peter's front has its entablature and attic with windows, giant pilasters on the outer bays, the pediment over the middle columns, five doors in marble surrounds, windows over them under alternating triangular and flat pediments, the benediction loggia with its balcony in the middle, and the statues standing on the attic instead of hidden behind it.

## v9.06 — San Marco's west front (2026-11-05)
- Venice: San Marco's west front has its five portals — round arches set deep in three stepped archivolts (the middle ring in pink marble), dark doors under lunettes of gold mosaic, two tiers of coloured colonnettes on the piers between them — the loggia's balustrade with the four gilded horses, and over it five gold lunettes under ogee crowns with crockets and statues at their tips, with pinnacled tabernacles between them.

## v9.05 — The Opera House's shells (2026-11-05)
- Sydney: the Opera House's shells are cut as from one sphere — each half of their section an arc, the two meeting in a sharp ridge along the top, narrowing as they rise to the mouth — instead of smooth round domes; a rib of cream tiles runs along each ridge and lighter ribs fan down the faces.

## v9.04 — Giotto's windows (2026-11-05)
- Florence: Giotto's campanile has its windows — two storeys of paired two-light windows and the tall three-light belfry above, each light dark under a pointed head, the lights parted by slender shafts, each window framed in white marble under a gable with a small rose — instead of three plain slots a face.

## v9.03 — New York's shopfronts and cornices (2026-11-05)
- New York: every block has its ground-floor shops — plate-glass windows between short piers under a cornice, here and there an awning — and its lower buildings a frieze under the cornice and a belt course over the base; the towers have a parapet at each setback and vertical piers standing out on their lowest and top stages, so the streets read less as stacked boxes.

## v9.02 — The Clock Tower's dials and belfry (2026-11-05)
- London: the Palace of Westminster's towers are panelled in storeys of Perpendicular tracery — mullions, string courses, dark windows in alternate storeys — instead of bare slots; the Clock Tower has round white dials in square gilded frames with hour marks and hands, a belfry of louvred openings with pinnacles at its corners, and lucarnes on its spire.

## v9.01 — Knossos' west façade (2026-11-05)
- Knossos: the West Wing's long front breaks into setbacks — blocks standing forward of the line by one to three metres at two and three storeys, some crowned with horns — and the west entrance has its porch with a single red column, so the façade over the West Court is no longer one flat wall.

## v9.0 — Sultan Hasan's façade, Athens' roofs (2026-11-05)
- Cairo: the madrasa's façades stand in bays between pilasters, each bay with tiers of paired windows (the lower square under iron grilles, the upper with pointed heads) and a muqarnas cap stepping out at its top; the portal is two piers with a hood of muqarnas stepping out across the recess, the door at the back under a grilled window — no longer a black slot and a grid of black panes. Athens: the town's courtyard houses keep their tiled roofs at a distance too (they had been dropped in the simple houses). Athens' first view is from the west, above the town, with the Acropolis and its temples in sight.

## v8.99 — Sagrada Família's Nativity portals (2026-11-05)
- Barcelona: the Nativity façade's three portals are tall parabolic arches set deep in three stepped archivolts, dark doorways at the back and a trumeau in the middle one, each under a steep gable fringed with crockets and a finial — instead of three black rectangles. The Cairo portal view is moved out of the house it stood in.

## v8.98 — Borgund's dragons and portal (2026-11-05)
- Borgund: the stave church's dragons are carved heads on curving necks rising from the nave's gable ends, with open jaws and crests curling back; the west portal has broad carved jambs with capitals and a round head; crosses stand on the porch and chancel gables. The Barcelona view is moved out of the wall it stood in.

## v8.97 — Edfu's carved columns (2026-11-05)
- Edfu: the columns of the pronaos and the hypostyle hall are carved in registers — in each a plain line, then the raised outlines of the king and a god facing each other (feet, legs, kilt and robe, body, head and crown) with a column of signs between the scenes — as the Ptolemaic shafts are; the court's colonnade stays plain. Costs about 80k triangles.

## v8.96 — Screenshot tool fix (2026-11-05)
- Tools: shot.mjs no longer adds the old design's per-building views (no settlement carries them, and they crashed the run at its end); interiors are shot with --pose in the settlement's frame.

## v8.95 — Gyeongbokgung's rank stones (2026-11-05)
- Seoul: Geunjeongjeon's court has its royal path in three lanes (the king's in the middle, a little higher) from the gate to the platform's stair, and the two rows of twelve rank stones beside it, the civil ranks east and the military west.

## v8.94 — Angkor's naga rails and gate, Huayna Picchu (2026-11-05)
- Angkor: the causeway's naga balustrades are round serpent bodies ringed with their scales' bands on short posts with moulded caps; the western gate opens at its middle, and the gate's and temple's towers have doorways framed in colonnettes under a lintel; the causeway view now stands on the causeway over the moat. Machu Picchu: the peaks keep their ribs and crags on the flanks but rise to a rounded summit instead of a cluster of spires, and the cloud forest clings to their steep slopes.

## v8.93 — The Potala's windows (2026-11-05)
- Lhasa: the Potala's windows stand in vertical bands with plain wall between them, the bands of varying width, a few missing at random, the top two rows larger (the halls and chapels) — the palace no longer reads as a regular grid of windows.

## v8.92 — Builder import fix (2026-11-05)
- The Persepolis style imports three.js through src/core/three.js, as builders must (they also run in a worker).

## v8.91 — Persepolis' winged bulls, Petra's cliffs (2026-11-05)
- Persepolis: the Gate of All Nations' winged bulls are carved instead of stacked blocks — striding legs, the body and chest, one great curved wing along the outer flank with the ridges of its feathers rising behind the head, the long square beard in curled rows, the tall horned crown. Petra: at the foot of the Siq's cliffs the ground is rock with drifted sand, so the walls stay rose down to the floor instead of fading pale.

## v8.90 — Lalibela's rims lie flush (2026-11-05)
- Lalibela: the ground is cut only inside the rock walls' inner faces, so it stays level right up to the walls and their tops lie flush with it — no more raised slab with a visible edge round each pit; the walls are built in two-metre lengths, each topped at the ground's level, so the trenches climbing out onto the slopes beyond the precinct keep their walls up to the surface.

## v8.89 — Djenné's market and toron (2026-11-05)
- Djenné: the market's stalls are real stalls — poles a little out of true under a sagging mat roof, a low table of sticks with its mat, calabashes, pots, baskets and heaps of grain and kola on it, sacks and a water jar beside — instead of a bare block; the mosque's walls bristle with toron, three palm sticks to a bay in every row, and the three towers carry them on all three outer faces, following their batter. Lalibela's rim view moved to the corner of Bet Giyorgis' pit.

## v8.88 — Nara's doors and windows (2026-11-05)
- Nara: the halls, gates and galleries have the older doors and windows — board doors in two leaves with rows of bronze studs, and windows of upright square bars (renji) before a dark opening — instead of Ming-style lattice; the Great Buddha Hall's front no longer reads as a wall of lattice.

## v8.87 — Foguang's terrace walls (2026-11-05)
- Foguang Monastery: the two terrace walls stand on a footing of dressed stone under a stone coping, with a low brick parapet capped in grey tiles along their fronts (open at the stairs), and stepped stone cheek walls flank both flights of stairs.

## v8.86 — The Alhambra's Court of the Myrtles, Versailles' water parterre (2026-11-04)
- Granada: the Court of the Myrtles' pool now shows (its kerb had covered the water), wider, with a round basin and jet at each end and the myrtle hedges clipped in lengths; both courts' porticoes carry stilted round arches cut in the stucco under a frieze and eaves; the courts' walls have a dado of green glazed tile with a lapis border, and the long sides doors in stucco frames with paired windows above; the Comares Tower has paired arched windows high on every face. Versailles: the parterre by the château is the water parterre of 1690 — two great basins with stone kerbs and bronze figures reclining round their rims; the Latona fountain rises in four marble tiers ringed with bronze frogs to the figure at the top; the Apollo fountain has the god's gilded chariot, four horses plunging and two tritons. Stonehenge's avenue view now looks at the stones.

## v8.85 — Sanchi's gateways, cypresses, Uji's garden (2026-11-04)
- Sanchi: the toranas carved — posts in panels, capitals of four elephants back to back, architraves curving up to triple spiral ends with processions in relief on both faces, bracket figures under trees leaning from the posts, figures between the architraves, a spoked wheel. Spindle crowns (cypress, poplar, arborvitae, sugi, spruce) stand on a leader carried up through them, their clumps spread evenly up the height; the cypress tighter and narrower (no more floating lumps in Agra's garden). Uji: the garden in moss with a gravel beach round the pond and more pines and maples (dossier: gravel and moss, pines and maples).

## v8.84 — Smoother to move through (2026-11-04)
- Turning and walking are smoother: shadows are lighter to draw, small street objects far away no longer cast shadows (draw calls down by about a third), and a still view no longer redraws 60 times a second.
- Memory no longer creeps up while flying: a town you leave while it is still loading is dropped completely, and at most four towns are built at once.

## v8.83 — Mute button, steady eyes, Great Zimbabwe's walls (2026-11-04)
- A sound button top right (muted by default, remembered; muting suspends the audio context). Eye adaptation samples six points round the eye and takes the brightest, treats a near-zero reading as open air, and opens up at most 1.6× outdoors (night 3×) instead of 8×, more slowly (2 s): a probe inside a wall, column or tree, or a GI volume not yet lit, no longer whites out the view. Great Zimbabwe: dry walls as smooth battered curves with rounded ends at the entrances and an uneven top; the chevron band only on the north-east fifth of the outer wall. Plants kept off every landmark's paved ways (lanes, paving, causeways, sacbe, paths); Borobudur's eastern way is clear.

## v8.82 — Nara's Great Buddha and the hall's interior (2026-11-04)
- Nara: the Great Buddha rebuilt in detail (lotus throne of upturned petals, crossed legs with soles up, raised right hand and open left on the knee, robe hem, curls and topknot, long lobes, flame-edged mandorla with haloes and thirteen small Buddhas) with two gilt attendants on a stone dais behind an altar; the hall's inner two rings of posts, a coffered ceiling of great beams and painted panels, silk banners; tall halls (H > 8) now stand on posts that thicken with height and have doors at the foot, a tie beam and plaster above with a band of lattice windows (Tōdai-ji, the gates, the Forbidden City's Hall of Supreme Harmony). Showroom takes --look.

## v8.81 — Edfu's pylon reliefs (2026-11-04)
- Detail: Edfu's pylon carries its reliefs — on each tower the king in the double crown smiting his enemies before the falcon god, and above them two registers of the king before standing and seated gods — and Petra's rock is a deeper rose.

## v8.80 — Giza's pyramidion, Ur's court (2026-11-04)
- Detail: the Great Pyramid's pyramidion is gilded; the Court of Nanna at Ur is paved; people gather at Giza's mortuary temple, along the queens' pyramids and at the valley temple.

## v8.79 — Great Zimbabwe's chevrons and savanna (2026-11-04)
- Detail: the Great Enclosure's wall carries its chevron band — blocks set on edge in a zigzag between plain courses — on both faces; the valley is miombo savanna, long dry grass with open woodland, wild figs and granite boulders.

## v8.78 — Peaks, red rock, coral stone (2026-11-04)
- Detail: Huayna Picchu and Machu Picchu mountain are craggy sugarloaves with ribs, ledges and crags; rock where the ground is red (Petra) is rose and ochre sandstone in wavy bands; Kilwa's Great Mosque has its coral-stone walls with doorways in stone frames, small windows, buttresses and a cresting of merlons, and the stone houses carved doors in their frames, barred windows, mangrove pole ends and parapets.

## v8.77 — The Castillo's panels and busier plazas (2026-11-04)
- Detail: the Castillo's terraces carry their framed panels in rows, the stairs' runs left clear; plazas and courts paved as lanes (Chichén Itzá's Great Plaza, Isfahan's walks, Beijing's lanes) now fill with people too; market stalls held to a sensible number per square.

## v8.76 — People at Angkor (2026-11-04)
- Detail: people walk the causeway to Angkor Wat and the road along its moat, saffron and ochre among them.

## v8.75 — Beijing's approach (2026-11-04)
- Detail: the paved ring before the Forbidden City's walls and the approach to the gate are clear of trees; officials and visitors stand in the approach and in the palace's courts.

## v8.74 — Knossos's walls (2026-11-04)
- Detail: the palace of Knossos shows its timber frame in the plaster — posts between the red-framed windows — and a painted frieze of blue, red and ochre under the roof's edge, below the horns of consecration.

## v8.73 — The Opera House's podium (2026-11-04)
- Detail: the Opera House's monumental stair has granite nosings and sloping cheek walls; the podium's sides are coursed and glazed with the long bands of the foyers and the concourse; Bennelong Point is paved; the arrival view looks along the podium to the shells.

## v8.72 — Lhasa's windows, flags and yaks (2026-11-04)
- Detail: Lhasa and the Potala get their Tibetan windows — black trapezoid surrounds, red frames and lattices, painted lintels and striped cloth awnings — on every storey; the houses of Shöl have doors, windows on their street sides, and strings of prayer flags in the five colours from their poles; yaks, goats and sheep in the lanes, people in Tibetan robes.

## v8.71 — Teotihuacan's avenue and fuller stalls (2026-11-04)
- Detail: the Avenue of the Dead is lined on both sides with platform temples in talud-tablero, their stairs coming down to it, and people walk it; market stalls are laid with cloth and heaped with goods, baskets and sacks beneath and beside them.

## v8.70 — Khajuraho's temples (2026-11-04)
- Detail: Khajuraho's temples get their sculpture — three bands of figures in niches between pilasters round every hall and the sanctum, couples among them, balconied windows on the great hall and the sanctum, moulded plinths with a frieze; the halls' roofs step up in ledged tiers with rows of finials; the tower is clustered with climbing towers in three rings. Carts and cars line up with the streets.

## v8.69 — Jerusalem's esplanade (2026-11-04)
- Detail: people walk and talk on the Haram esplanade round the Dome of the Rock; the esplanade's arrival view no longer faces a wall.

## v8.68 — London's terraces (2026-11-04)
- Detail and a fix: London's terrace windows were hidden behind their stucco surrounds — now sash windows with their bars (taller on the first floor), front doors with fanlights and stone steps, a stucco band and cornice, iron area railings along the fronts; the terraces drawn in two levels of detail.

## v8.67 — Amsterdam's houses and Town Hall (2026-11-04)
- Detail and a fix: Amsterdam's canal-house windows were hidden behind their white frames — now dark sash windows with glazing bars in white frames, windows on the garden side too, stone stoops with iron rails at the doors, white stone copings and scrolls on the gables, an attic window in each gable. The Town Hall has its giant pilasters, its windows on every front (two main floors and their mezzanines), a plinth and cornices. Doors in the Mediterranean and French towns have their leaves, some ajar.

## v8.66 — Knossos loads again; lit windows (2026-11-04)
- Fix: Knossos could not load (a marble missing its colours stopped it); a test now makes every material. Detail: at night about one window in four is lit warm from inside, and by day the dark of a window is a little lighter toward its sill.

## v8.65 — Madurai's gopurams (2026-11-04)
- Detail: Madurai's gopurams are crowded with their painted gods and guardians — a row on every tier between pilasters, arms and gilt crowns, little vaulted shrines with their niches along the cornices — and the granite bases have pilasters, niches and moulded bands.

## v8.64 — Babylon's beasts and gathered people (2026-11-04)
- Detail: Babylon's glazed walls are now glazed brick in their courses with Ishtar's lions striding in white with yellow manes between bands of rosettes, and the Ishtar Gate's towers carry rows of Marduk's dragons and Adad's bulls; people gather in the open places of the landmarks — the Pantheon's forecourt, Chichén Itzá's and Teotihuacan's plazas, Tenochtitlan's precinct, Babylon's, Ur's and the Süleymaniye's courts, Parliament Square — standing on the paving where it is raised.

## v8.63 — Markets and Florentine marble (2026-11-04)
- Detail: the great squares hold markets — rows of stalls with sellers squatting and buyers talking in the Maidan of Isfahan, the Agora, the Rumayla, San Marco, Djenné's market, the Signoria, the parvis of Notre-Dame, Red Square and Cahokia's plaza — and stalls stand here and there in the streets. Florence's cathedral, campanile and Baptistery wear their green, white and pink marble — pilasters, bands, framed panels, tall pointed windows — and the cathedral's front is shown as it stood in 1480, Arnolfo's marble lower third with its portals and niches below the rough wall.

## v8.62 — Town houses and people (2026-11-04)
- Detail: the houses of Florence, Rome, Venice, Granada, Istanbul and Versailles are rebuilt each in its own manner — Tuscan and Roman stuccoes with stone surrounds, green shutters, shop arches and wide eaves; Venetian reds with funnel chimneys and roof loggias; whitewashed Granada with latticed balconies and flat roofs; Ottoman timber upper storeys with their bays; French limestone with slate roofs, dormers and tall chimneys — tower houses here and there. Figures now have shoulders, arms, hands and faces, and stand in knots talking, sit on benches, squat at their pots and by their stalls. Near houses are drawn in full, far ones simply.

## v8.61 — Crops and northern trees (2026-11-04)
- Detail: fields carry their crops — wheat round the Mediterranean, the Near East, Europe and Africa, rice in East, South and Southeast Asia, maize in the Americas; spruce and birch are new species (Norway's slopes are now wooded, Moscow has its birches, the open taiga grows spruce instead of Japanese cedar).

## v8.60 — Life in the streets (2026-11-04)
- Detail: every settlement now has the things of daily life — pots, baskets, firewood, ladders, laundry and lanterns by the doors; carts, barrows, beasts (horses, oxen, buffalo, camels, llamas, goats, dogs, hens…) and a few still figures in local dress in the streets; stalls in the market squares; boats along the shores — chosen by each culture's kit. Walls weather (a darker foot, rain streaks, moss on the north side where the climate is damp), lanterns glow at night, and each place has its sounds: water at the shore, birds by day, crickets at night, a town's murmur and knocks, traffic in the modern cities.

## v8.59 — Modern Sydney (2026-11-04)
- New settlement: Sydney at the Opera House's opening in 1973 — the shells on their granite podium above the harbour, the Harbour Bridge's steel arch, Circular Quay's wharves and the Cahill Expressway, Australia Square's round tower, the city and the Rocks, the Botanic Garden. Every site on the planet now has a settlement of its own.

## v8.58 — Modern New York (2026-11-04)
- New settlement: Midtown Manhattan in 1931 — the Empire State Building at its true 381 m with its setbacks, steel piers and mooring mast, the Chrysler Building's stainless crown and spire, the Chanin and Lincoln towers, Grand Central, the Public Library and Bryant Park, Broadway, the Sixth Avenue El and ~800 buildings with water tanks; towers get windows from a new façade material.

## v8.57 — Mississippian Cahokia (2026-11-04)
- New settlement: Cahokia about 1175 — Monks Mound rising 30 m in its terraces with the great house on its summit and a ramp from the Grand Plaza, the twin mounds, the palisade with its bastions, Woodhenge's circle of cedar posts, smaller mounds, ~1,300 thatched houses, fields and Cahokia Creek.

## v8.56 — Muscovy (2026-11-04)
- New settlement: Moscow about 1600 — the Kremlin's red walls and towers, Cathedral Square with the Dormition, the Archangel, the Annunciation and Ivan the Great's bell tower, Red Square with the Lobnoye Mesto and the trading rows, St Basil's with its tented church and eight onion-domed chapels, the Moskva, the log houses.

## v8.55 — Norse Norway (2026-11-04)
- New settlement: Borgund about 1250 — the stave church with its raised nave, ambulatory, apse tower, stacked shingle roofs, spire and dragon heads; the bell house and churchyard; eight farms of log buildings under sod, lofts on posts; fields and meadows on the floor of Lærdal, the river, the steep wooded sides.

## v8.54 — Baroque Rome (2026-11-04)
- New settlement: Baroque Rome about 1670 — St Peter's with Michelangelo's block, Maderno's front and the ribbed dome, Bernini's oval piazza with its four-deep colonnades and statues, the obelisk and the fountains, the Vatican Palace, the Passetto, Castel Sant'Angelo, the Tiber and its bridge, the Borgo's houses and the Vatican gardens.

## v8.53 — Barcelona (2026-11-03)
- New settlement: Barcelona about 1910 — the Eixample's grid of six-storey blocks with cut corners and iron balconies, plane trees along the streets, the Sagrada Família rising in scaffolding with its Nativity towers and a crane, La Pedrera's waves of stone and the scaled roof of Casa Batlló.

## v8.52 — Victorian London (2026-11-03)
- New settlement: Victorian London about 1870 — the Palace of Westminster's long pinnacled river front, the Clock Tower with its four faces and the great Victoria Tower, Westminster Hall and the Abbey, the bridge across the grey Thames, and rows of brick terraces with slate roofs and chimneys under a smoky sky.

## v8.51 — Versailles (2026-11-03)
- New settlement: Versailles about 1690 — the château's long pale garden front with its wings, the brick-and-stone courts under slate, the water parterre and fountains, the Tapis Vert down to the Apollo fountain and the cross-shaped Grand Canal between dense groves; the town beyond its three avenues.

## v8.50 — Amsterdam (2026-11-03)
- New settlement: Amsterdam about 1670 — the half-rings of canals lined with elms and tall gabled brick houses, the Town Hall on the Dam with its cupola, the Westerkerk's stacked tower, bridges over the canals and ships crowding the IJ.

## v8.49 — Venice (2026-11-03)
- New settlement: Venice about 1500 — the Piazza San Marco with the basilica's five lead domes and golden front, the tall brick campanile, the long arcaded Procuratie, the Piazzetta's two columns at the water, the Doge's Palace on its double arcade; canals and the Grand Canal winding between islands of houses in the lagoon.

## v8.48 — Florence (2026-11-03)
- New settlement: Florence about 1480 — the cathedral with Brunelleschi's great ribbed dome and lantern, Giotto's banded campanile, the octagonal Baptistery, the Palazzo della Signoria's tower over its square and the Loggia, the Ponte Vecchio with its shops over the Arno, and streets of tiled houses.

## v8.47 — Granada (2026-11-03)
- New settlement: Nasrid Granada about 1390 — the Alhambra's red walls and towers along its hill, the Court of the Myrtles with its long pool before the tall Comares Tower, the Court of the Lions with its forest of slender columns and the fountain, the Alcazaba at the west end; the white houses of the Albaicín across the Darro.

## v8.46 — Stonehenge (2026-11-03)
- New settlement: Stonehenge about 2500 BC — the sarsen circle with its lintels and the great trilithons inside, the bluestones, the Heel Stone out on the Avenue toward the midsummer sunrise, the white chalk ditch and bank, barrows on the open down, and the builders' thatched houses.

## v8.45 — Great Zimbabwe (2026-11-03)
- New settlement: Great Zimbabwe about 1350 — the Great Enclosure's towering curved granite wall with its chevron band, the narrow passage and the conical tower inside; walls winding among the boulders of the Hill Complex; smaller enclosures and round clay houses with thatched cones across the valley.

## v8.44 — Kilwa (2026-11-03)
- New settlement: Kilwa Kisiwani about 1330 — the island town of white coral stone: the Great Mosque's hall of pillars under rows of small domes, the sultan's palace on its cliff with its octagonal pool, stone houses round courts, dhows on the beach, palms and the Indian Ocean all round.

## v8.43 — Mamluk Cairo (2026-11-03)
- New settlement: Mamluk Cairo about 1363 — the Madrasa of Sultan Hasan, a cliff of stone with tiers of tall windows, a crenellated crown, the deep portal and the founder's dome between two great minarets; the Citadel walled on its spur across the square; the crowded city of flat-roofed houses.

## v8.42 — Ottoman Istanbul (2026-11-03)
- New settlement: Ottoman Istanbul about 1560 — Sinan's Süleymaniye crowning the third hill, its great lead dome rising over half-domes and cascades of smaller domes, four pencil minarets, the domed courtyard; madrasas round it on the terrace; timber houses tumbling down the slopes.

## v8.41 — Babylon (2026-11-03)
- New settlement: Babylon about 570 BC — the great seven-stage ziggurat Etemenanki in its precinct with Esagila beside it, the blue-glazed Ishtar Gate in the city's double wall, the Processional Way between glazed walls with lions, the Southern Palace, the Euphrates and a city of courtyard houses.

## v8.40 — Khajuraho (2026-11-03)
- New settlement: Khajuraho about 1050 — the Western Group of Chandela temples, each on its high terrace with halls under stepped roofs rising to a sanctum tower clustered with smaller towers like a mountain; the Shivsagar tank; a village among neem and palms.

## v8.39 — Nara (2026-11-03)
- New settlement: Nara in 752 — Tōdai-ji with the vast Great Buddha Hall in its corridored court, the Middle and Great South Gates, two seven-storey pagodas in their own courts, the lecture hall and monks' quarters, Wakakusa's grassy slope behind, and the capital's timber houses to the west.

## v8.38 — Sanchi (2026-11-03)
- Early Buddhist India is now Sanchi in the 1st century: the Great Stupa with its gateways on the flat top of its hill, the path climbing the north slope, a village of mud houses at the foot among neem and palms, fields on the plain.

## v8.37 — Uji (2026-11-03)
- Heian Japan is now Uji in 1053: the Phoenix Hall across its pond in a garden of gravel, pines and maples, the swift Uji River with its long bridge, wooded hills beyond, and a village of timber houses with bark and thatch roofs.

## v8.36 — Mount Wutai (2026-11-03)
- Tang China is now Foguang Monastery in 857 among the hills of Mount Wutai: the Great East Hall high on its terraces against the hill, the old brick pagoda on the slope, a village of earth-walled houses and fields in the valley below, pines on the hills.

## v8.35 — Conques (2026-11-03)
- Conques is now the whole village about 1120: the abbey church of Sainte-Foy on its terrace on the steep hillside, the schist houses with stone-slab roofs above and below it, and the Dourdou far below with its stone bridge, woods all round.

## v8.34 — Paris (2026-11-03)
- Paris is now the Île de la Cité in 1248: the Sainte-Chapelle in the royal palace's court with the great hall and towers on the quay, Notre-Dame and its twin towers at the island's east end, the two arms of the Seine with their bridges, and rows of timber-framed houses on the island and both banks.

## v8.33 — Edfu (2026-11-03)
- Edfu is now the temple and its town in the 1st century BC: the Temple of Horus inside its high mudbrick enclosure, the birth house before the pylon, the sacred lake, a town of mudbrick houses toward the Nile, palms, reeds and green fields.

## v8.32 — Jerusalem (2026-11-03)
- Jerusalem is now the city about 700: the Dome of the Rock on the great esplanade raised on its retaining walls, the al-Aqsa mosque at its south end, the Kidron valley with olive groves below, and the city of stone courtyard houses climbing west to the Church of the Holy Sepulchre.

## v8.31 — Constantinople (2026-11-03)
- Constantinople is now the city's first hill in 562: Hagia Sophia with the Augustaion and Justinian's column before it, Hagia Eirene, the Baths of Zeuxippus, the Hippodrome, the Great Palace stepping down toward the sea, the colonnaded Mese to the Forum of Constantine and its porphyry column, and houses all round.

## v8.30 — Imperial Rome (2026-11-03)
- Rome is now a quarter of the city under Hadrian: the Pantheon over its forecourt, the Baths of Agrippa behind it, the long porticoed Saepta Julia, the Stadium of Domitian with its tiers of seats, the Tiber's bend, and blocks of tall brick apartment houses.

## v8.29 — Athens (2026-11-03)
- Athens is now a whole city of about 410 BC: the Parthenon stands on the Acropolis among the Propylaia, the little Nike temple on its bastion, the Erechtheion with its maidens and the bronze Athena; a ramp climbs the west end; below, the Agora with the Hephaisteion on its hill, the stoas and the round Tholos, the Panathenaic Way, and houses packed all round.

## v8.28 — A pā by Lake Rotorua (2026-11-03)
- New settlement: a Māori pā of the later 18th century — a volcanic hill by the lake cut into terraces, each edged with palisades and fighting stages, carved gateways up the path, the chief's carved house and storehouse on the summit; houses and kūmara pits on the terraces; the open village, gardens and canoes below.

## v8.27 — Firm roofs, steady surfaces (2026-11-04)
- Roofs hold you everywhere: the ones that let you fall through (many tiled roofs, palace walls, bridges) now carry you, and you can no longer walk into a roof's slope from the side.
- No more flickering: faces of two materials in the same plane no longer fight, and distant surfaces stay steady.

## v8.26 — Rapa Nui (2026-11-03)
- New settlement: Rapa Nui about 1500 — Ahu Tongariki on the shore with its fifteen moai facing inland, some crowned with red topknots; Rano Raraku behind with its crater lake and its quarry of half-cut and buried moai; boat-shaped thatched houses, stone chicken houses and garden walls on the grassy plain; the sea all round.

## v8.25 — Knossos (2026-11-03)
- New settlement: Knossos about 1600 BC — the palace of Minos round its Central Court, wings of three and four storeys in ochre plaster over gypsum, porticoes of red columns that widen upward under black capitals, horns of consecration along the roofs, the north entrance under its bastion, the West Court and the stepped theatral area; the town of flat-roofed houses among olive groves.

## v8.24 — Petra (2026-11-03)
- New settlement: Petra about AD 50 — down the narrow Siq between rock walls to the Khazneh's carved façade; the Outer Siq with its tomb façades and the rock-cut theatre; the valley with the Royal Tombs in its cliff, the colonnaded street, the Great Temple, Qasr al-Bint and houses of rose stone.

## v8.23 — Persepolis (2026-11-03)
- New settlement: Persepolis about 480 BC — the great stone terrace against its mountain, the double stair, the Gate of All Nations with its winged bulls, the Apadana's forest of 20 m columns with bull capitals, the Hall of a Hundred Columns, the palaces and the treasury; the mudbrick town of Parsa on the plain.

## v8.22 — The Meenakshi temple (2026-11-03)
- New settlement: Madurai about 1650 — the Meenakshi temple inside its granite wall with four painted gopurams up to 52 m, the inner shrines with their own gopurams and gilded towers, the stepped Golden Lotus tank in its colonnade, the Thousand-Pillar Hall; the city in square rings of streets round it, with verandahed tiled houses among palms.
- Fixes: looking toward the sun no longer washes the view out white; the Foguang terraces no longer flicker.

## v8.21 — The Potala (2026-11-03)
- New settlement: Lhasa in 1694 — the Potala climbing its hill, white palaces either side of the Red Palace and its gilded roofs, walls leaning inward with rows of black-framed windows under dark friezes, stairs up the front; the walled village of Shöl at its foot; the valley ringed by mountains.

## v8.20 — Bianjing (2026-11-03)
- New settlement: Northern Song Bianjing around 1120 — the slender Iron Pagoda of brown glazed brick rising thirteen storeys in its monastery; the Bian River of the Qingming scroll with its arched timber Rainbow Bridge and grain boats; the city's east wall with the water gate and gate tower; streets of shops, inns and houses.

## v8.19 — Gyeongbokgung (2026-11-03)
- New settlement: Hanyang around 1430 — Gyeongbokgung on its axis: Gwanghwamun on its stone base, the inner gates and the bridge over the palace stream, the throne hall on its double terrace in its cloistered court, the inner halls, and Gyeonghoeru standing on 48 stone pillars in its pond; the ministries along the avenue outside the gate; quarters of hanok houses with tiled and thatched roofs in their walled yards.

## v8.18 — Taos Pueblo (2026-11-03)
- New settlement: Taos Pueblo around 1500 — the North and South Houses rising in terraces of adobe rooms to five and four storeys, with ladders, parapets and beam ends; the plaza crossed by Red Willow Creek and its log bridges; round kivas; drying racks; the perimeter wall, with cottonwoods, willows and fields beyond and the land rising toward the mountain.

## v8.17 — Teotihuacan (2026-11-03)
- New settlement: Teotihuacan around 400 — the Avenue of the Dead stepped by its cross walls, the Pyramid of the Sun at its full 225 m and 65 m, the Pyramid of the Moon closing the avenue with the platform temples of its plaza, the Ciudadela with the Feathered Serpent Pyramid, and walled apartment compounds round patios, all in the talud-tablero manner.

## v8.16 — Tenochtitlan (2026-11-03)
- New settlement: Tenochtitlan in 1519 — the Sacred Precinct inside its serpent wall, the Templo Mayor at full size with its twin stairways and the blue and red shrines of Tlaloc and Huitzilopochtli, the round temple of the wind god, smaller pyramids, the ballcourt and the skull rack; Moctezuma's palace; canals with canoes and bridges, white houses round patios, chinampa fields with willows, the lake and the causeway.

## v8.15 — Lalibela (2026-11-03)
- New settlement: Lalibela around 1220 — the churches hewn down into the red rock: Bete Giyorgis, the great cross in its pit; Medhane Alem ringed by pillars, with Maryam and Golgotha; the rock-cut Jordan and the churches beyond it; trenches to walk down into them; a village of round stone houses with conical thatch on the slopes around.

## v8.14 — Ur (2026-11-03)
- New settlement: Ur around 2050 BC — the great ziggurat with its three stages, the three stairways meeting at the gatehouse and the shrine on top, on its terrace before the Court of Nanna; the walled sacred precinct with the Giparu and the palace; a town of courtyard houses on narrow lanes; the harbour with its quay, reeds, date palms and boats.

## v8.13 — Borobudur (2026-11-03)
- New settlement: Java around 825 — Borobudur at its full 123 m: the terraces with their galleries, balustrades and little stupas, the stairs up the four sides, the three round terraces of 72 latticed stupas and the great stupa at the top; a monastery of open pavilions; hamlets of houses on stilts in palm and bamboo groves among the fields.

## v8.12 — Lin'an and the Liuhe Pagoda (2026-11-03)
- New settlement: Southern Song Lin'an around 1200 — the Liuhe Pagoda, seven storeys of red galleries and upturned eaves on its octagonal base above the Qiantang River, with the temple's halls and the wooded hill behind; the stone flood wall and the river road, boats on the river; a quarter of shophouses and tea houses along a canal that meets the river at its lock.

## v8.11 — Himeji (2026-11-03)
- New settlement: Himeji Castle around 1620 — the white keep of five tiers on its stone base atop the hill, its three small keeps and roofed passages, the baileys on curved stone ramparts with walls and turrets, the long gallery, the lord's residence below, the moat with its rampart and gate; the samurai quarter of walled compounds, and across the middle moat a street of merchants' townhouses.

## v8.10 — Isfahan (2026-11-03)
- New settlement: Safavid Isfahan around 1630 — Naqsh-e Jahan Square at its full 560 m with two-storey arcades of shops, the canal and plane trees round the polo field and the stone goalposts; the Shah Mosque with its tiled portal and minarets, a court with four iwans turned toward Mecca and the great turquoise dome (walk in through the portal); the Sheikh Lotfollah Mosque with its cream dome; Ali Qapu with its columned terrace; the Qeysarieh portal and the vaulted bazaar under its little domes; the royal garden; a town of courtyard houses.
- Distant brick and stone walls no longer shimmer.

## v8.9 — The Taj Mahal (2026-11-03)
- New settlement: Mughal Agra in 1653 — the Taj Mahal on its marble plinth with the four minarets, the great dome and chhatris, pointed iwans; the red sandstone mosque and its twin; the four-part garden with its water channels, central pool and cypresses; the walled enclosure, the great gate and its forecourt; the bazaar town of Taj Ganj beside the river.

## v8.8 — Machu Picchu (2026-11-03)
- New settlement: Machu Picchu, Pachacuti's estate — the town on its saddle between Huayna Picchu and Machu Picchu mountain, fifteen rings of terraces with stairs, the Temple of the Sun on its rock, the Sacred Plaza with the Main Temple and the Temple of the Three Windows, the Intihuatana on its terraced hill, the Main Plaza, houses of granite under ichu thatch, the canyon below in cloud forest (dossier: `docs/settlements/machu-picchu.md`). New style `inca`.
- Settlements can stand on a height above the open country (no more sea showing in deep valleys).

## v8.7 — Djenné (2026-11-03)
- New settlement: Djenné in the Mali Empire — the Great Mosque on its high platform, its qibla wall with three towers crowned by ostrich eggs, pilasters and palm-wood toron, the prayer hall's pillars and the court; the market below the qibla wall; the town of two-storey banco houses with their pinnacled facades on an island in the Bani's floodplain (dossier: `docs/settlements/djenne.md`). New style `sahel`.

## v8.6 — Giza (2026-11-03)
- New settlement: Giza in Khufu's reign — the Great Pyramid in its white casing (230.3 m square, 146.6 m high; one can climb its faces), its court and enclosure wall, the mortuary temple with granite pillars round a basalt court, the three queens' pyramids, the covered causeway down to the valley temple and the harbour, the cemeteries of mastabas, the Wall of the Crow and the workers' town of galleries and houses (dossier: `docs/settlements/giza.md`). New style `oldkingdom`.

## v8.5 — Chichén Itzá (2026-11-03)
- New settlement: Chichén Itzá, c. 1000 — the Castillo with its nine terraces, four stairways and serpent heads, the Great Ball Court with its rings and temples, the Temple of the Warriors with its colonnades, the Group of the Thousand Columns, the Platform of Venus, the Tzompantli, the white road to the Sacred Cenote, and the town of walled house lots with oval thatched houses (dossier: `docs/settlements/chichen-itza.md`). New style `maya`.
- Fix: beams, ridges, rails and raised walks (Ming, Qing, Khmer) had their top faces turned inward and could look hollow from above.

## v8.4 — Angkor (2026-11-03)
- New settlement: Angkor Wat, c. 1150 — the three levels of galleries, the quincunx of lotus-bud towers, the steep stairs of the central level, the libraries and basins, the causeway bordered by seven-headed serpents, the laterite enclosure with its western gate, the moat — and a village of houses on stilts among sugar palms, rice fields beyond (dossier: `docs/settlements/angkor.md`). New style `khmer`.

## v8.3 — Ming–Qing Beijing (2026-11-03)
- New settlement: the Forbidden City's Outer Court — the Meridian Gate, the Inner Golden Water River with five marble bridges, the Gate of Supreme Harmony, the great courtyard with its galleries and pavilions, the three-tiered marble terrace with the Halls of Supreme, Central and Preserving Harmony (the first at its true 64 × 37 m), bronze vats, tripods and lions, the red wall with corner towers and the moat — and round it lanes of grey-brick courtyard houses with their gates, screen walls and courtyard trees (dossier: `docs/settlements/qing-beijing.md`). New style `qing`.
- Far views for the settlements of their own (Ming Suzhou, Beijing).
- Latticed doors and windows no longer shimmer from afar.

## v8.2 — Ming Suzhou; one corner card; no arriving inside things (2026-11-03)
- New settlement: Ming Suzhou, c. 1530 — the Humble Administrator's Garden as Wen Zhengming painted it, its owner's residence, and a canal quarter of streets beside canals, whitewashed houses, humpbacked bridges and boats (dossier: `docs/settlements/ming-suzhou.md`). New style `ming`: halls with lattice doors, pavilions with swept roofs, galleries, garden walls with moon gates and leaky windows, Taihu rock, lotus, canal houses.
- The small map, the clock and the speed are one card (top left); the language button is top right. The English period name no longer squeezes the pause button.
- A simpler loading screen; the bar is weighted by this machine's last load and never goes back.
- After travel one is set on the nearest free spot (never inside a building, under a roof or below the ground); the walker cannot sink below the ground; close walls are no longer cut away on high ground.

## v8.1 — A lean interface; night on the maps; standing on roofs (2026-11-03)
- The interface is the small map (top left; click it for the globe), the clock-and-speed card (top right) and a language button. The settings panel is removed; quality is always the highest.
- The globe and the small map shade night; settlements glow on the night side.
- Choosing a settlement on the map (or clicking near it) lands beside its landmark, facing it.
- Roofs and wall tops can be landed on from the air and walked on (a height field of each building's upper surfaces).

## v8.0 — The planet (2026-11-03)

- **The world is now a small planet** — Memory of Civilizations / 文明的记忆. A sphere of 8 km radius with Earth's continents, seas and latitudes: walk out of a settlement into open country — beaches, rolling land, hills, the mountain ranges where Earth has them, deserts, forests, snow toward the poles — and fly over it; the higher you go, the faster, up to 1.5 km, where the ground curves away below.
- **The ten landmarks stand near their true places**, each in its settlement with its houses, plants and ground: Edfu by the Red Sea, the Parthenon in Greece, the Pantheon in Italy, Hagia Sophia by the straits, the Dome of the Rock in the Levant, the Sainte-Chapelle and Conques in France, Foguang in northern China, the Phoenix Hall in Japan, Sanchi in India.
- **One sun for the whole planet:** it stands high over India and low over France; while it is afternoon in Athens it is evening in Uji. The clock shows the hour where you are. Each settlement keeps its own sky and weather; the open country has its own by climate.
- **The globe** is the large map: turn it, come closer, click a settlement or any point of the land to go there. The small map shows the land round you.
- More civilizations — about fifty in all, each a place and a time — come next, each a landmark with the townscape of its people.

## v7.1 — Romanesque: Sainte-Foy de Conques (2026-10-28)

- **A new district, Rouergue,** at the west edge of the city beside Francia: a slope of schist and stone houses under steep stone-slab roofs, lanes, orchards, oaks and walnuts.
- **Sainte-Foy de Conques** (c. 1050–1120), the pilgrimage church on the road to Santiago: enter under the tympanum of the Last Judgment into the tall, dim nave under its barrel vault, between arcades on piers with half-columns and the tribunes above; the crossing opens upward to the octagonal lantern on its squinches; the aisled transept with its two chapels; the choir behind iron grilles with the golden statue of the saint, the ambulatory round it and three chapels under half-domes. Red sandstone below, yellow limestone above. South of the nave, the cloister of Bégon with arcades on paired columns and its green serpentine basin.
- **Music:** chant over the drone of an organistrum, an early organum voice in the choir, bells outside.
- **A square in every district,** where the way to its building leaves the avenue: paved in the district's manner — flags, travertine, marble, pebbles, brick — with a well in the middle.

## v7.0 — One compact city (2026-10-28)

- **The world is now one dense palace-city** instead of a land of separate valleys: nine districts of about 200 × 200 m that touch directly, each with its building and a small surrounding of its own time — streets and lanes, some 1,400 houses of the period (mud-brick tower and courtyard houses round Edfu, tiled houses in Rome, Athens and Constantinople, domed stone houses by the Haram, timber-framed houses in Paris, grey-brick courtyard houses at Foguang, timber houses at Uji, limewashed houses at Sanchi), gardens, its own trees and ground, and the rock, hill or pond it stands on. From Edfu it is a short walk to the Pantheon, up the Acropolis or across to Hagia Sophia.
- **One sky over the whole city:** the same time and weather everywhere; set the hour on the clock, or let the days run.
- **Fly:** hold Space (or the arrow button on a phone) to rise, let go to glide gently down — onto a street, a roof or a wall top. Walking and running keep their true speed; the speed levels and the jump are gone.
- **The corner shows how you are moving:** walking, running or flying, your speed in km/h and, in the air, your height.
- **Quicker arrival:** the city is small, buildings are made a little at a time while the world keeps running, and those you leave are kept ready for when you come back.

## v6.1 — A small map, a clock, speeds and jumping (2026-10-28)

- **Top left: a small map** of the land round you (north up), the buildings and your arrow, with the region's name; click it for the large map, hide it with its button.
- **The clock beside it:** the hour of the day — drag it to any hour, pause the time or let the days run.
- **Getting about faster:** four speeds — walking, striding, riding, galloping (up to about fourteen times a walk) — with the mouse wheel or the keys 1–4; Shift still runs. **Space jumps** about 0.8 m, onto ledges and over low walls.
- **Arriving where you meant:** a click on the large map near a building takes you to its entrance; a click on open land turns you to face the nearest building.

## v6.0 — The world as a patch of land; faster start and travel (2026-10-27)

- **The regions now lie side by side** in a patch of land instead of along one valley: the Nile in the middle, and round it in a spiral by age Rome, Greece, Byzantium, the Levant, Francia, Tang China, Heian Japan and India. New regions will be added on the outside, ring by ring.
- **Mountain ridges between neighbouring regions,** crossed by passes; higher mountains at the world's end. **A river runs down each column of regions,** each as wide as its region needs (the Nile and the Bosphorus wide, the Tiber and the Seine narrower), through gorges in the ridges; **stone bridges** carry the roads over them. The roads join the regions in the spiral's order, and every road has been walked end to end by the new road check.
- **Faster start:** the world opens as soon as the buildings, ground and plants round your feet are ready and what you can see is compiled; the rest comes in as you go. One scene pass instead of two (the ambient occlusion now reads the depth), so about half as many shaders to compile and half the drawing each frame; the ground is computed several times faster; towns are made only when you come near.
- **Faster travel by map:** the view fades out, only the place you arrive at is made ready, and buildings far behind you are taken down so that memory does not grow.
- **Day and night:** days now pass (a day lasts half an hour): the sun climbs and sets on each region's own course for its latitude and season, the sky reddens at dusk, and at night the full moon lights the land, the stars and the Milky Way come out over a deep blue sky, and your eyes adapt to the dark. In the settings the time can also be held at morning, noon, evening or night, or at each place's own hour.
- **Picture quality** starts at "medium" on laptops (8 cores or fewer); "high" can be chosen in the settings.

## v5.9 — India and the Great Stupa at Sanchi (2026-10-27)

- **A new region, India,** north of Heian Japan over the pass of Mount Hira: the plain of Malwa with its red-brown earth, fields and palmyra palms, great banyans, teak and neem on the hills, a village of limewashed houses under clay tiles, and a warm, hazy winter afternoon.
- **The Great Stupa at Sanchi** as completed in the 1st century CE, on its flat-topped hill: climb the road to the south gateway past Ashoka's polished pillar with its lions; walk round the dome between the stone railing and the drum, then up the double stairway to the terrace and round again under the great white dome, with its square railing and triple parasol on top. The four gateways stand at the cardinal points, each of two posts with animal capitals and three architraves with curled ends. Nearby: Stupa 3 with its single gateway and a monastery of cells round a court.
- **Music:** a drone of tonic and fifth, a plucked string in a slow pentatonic mode, chant near the stupa.

## v5.8 — Heian Japan and the Phoenix Hall (2026-10-27)

- **A new region, Heian Japan,** north of Tang China over the pass of Mount Wutai: the green plain of Uji by the river, wooded hills of red pines and cryptomerias, maples in autumn red, bamboo groves, rice fields, a village of timber houses under bark and thatch roofs, and a soft autumn morning with mist on the water.
- **The Phoenix Hall of Byōdō-in** (1053), Amida's palace on earth: seen across its pond on its island, the central hall with its hip-and-gable roof and gilt phoenixes on the ridge, the pent roof lifted at the front so that Amida's face shows from the far bank, the wing corridors of two levels turning forward to their corner towers, the tail corridor behind; cross the arched bridge and walk round to the open doors to see the gilt Amida on his lotus pedestal before his nimbus, under the canopy, with the bodhisattvas on clouds high on the walls.
- **Ponds:** garden water dug into the ground, which you cannot wade; bridges cross it.
- **Music:** court music of the Heian period — a shō cluster, a flute and a koto outside; chant and a small bell inside.

## v5.7 — Tang China and the Foguang East Hall (2026-10-27)

- **A new region, Tang China,** north of Francia over a pass: loess hills with terraced fields, Chinese pines and arborvitae, a valley of elms and poplars, a village of grey-brick houses, and a dry northern sky that sometimes turns yellow with dust.
- **The Great East Hall of Foguang Monastery** (857), the grandest surviving Tang timber building: up three terraces to the hall facing west into the late sun; seven bays by four on red columns with lotus bases, bracket sets of seven ranks with their descending cantilevers on every column, the "seven red, eight white" architraves, the deep eaves and the hipped roof of grey tiles with its chiwei; inside, the latticed ceilings over two rings of columns and the altar with three seated Buddhas, attendants, Manjuśrī on his lion, Samantabhadra on his elephant and the heavenly kings. The Tang stone pillar of 857 and the old hexagonal pagoda stand on the terrace.
- **Music:** a chanted sutra on the pentatonic scale with the wooden fish and the bowl-bell; the pipa and flute outside.

## v5.6 — Francia and the Sainte-Chapelle (2026-10-27)

- **A new region, Francia,** north of the Levant over a pass: the plain of the Seine with Montmartre and Sainte-Geneviève, oaks, elms, poplars and willows, apple orchards and fields in strips, a summer sky that clouds over and showers, and a town of timber-framed houses with jettied storeys and steep gables.
- **The Sainte-Chapelle** as consecrated in 1248: the lower chapel under blue vaults on painted columns; up the stair to the upper porch and into the upper chapel — fifteen windows of stained glass between slender gilded shafts, rib vaults of blue with gold stars, the apse with the tribune of the relics, the apostles on the piers; outside, buttresses with pinnacles, gables over the windows, the rose, the steep lead roof and the spire, and the round towers of the palace.
- **Stained glass that colours the light:** the sun through the windows throws coloured patches; the baked light passes through the glass too.
- **Gothic vocabulary:** pointed arches, quadripartite and apse rib vaults, bar tracery, buttresses, gables, roofs and spires.
- **Music:** organum of the Notre-Dame school (a held tenor and a voice in the long–short rhythmic mode), plainchant below, bells outside.

## v5.5 — Faster start, travel by map (2026-10-27)

- **The world opens by itself** when it is ready — no more Enter button. Click (or press a key) to look around and start the music.
- **A real loading bar:** what is being prepared (renderer, land, buildings, plants, light), the percentage, and about how many seconds are left; from the second visit on, the estimate uses how long the last start took on your machine.
- **Faster start:** only the land, buildings and plants near you are made before the world opens — the distant ones keep arriving while you look around; materials of the same kind now share one shader, and all the plants share theirs, so far fewer shaders are compiled (about 90 pipelines instead of 310).
- **Travel by map:** click anywhere on the land to go there (a crosshair shows where); click a building or its name to go to its entrance. The map now shows the whole world.

## v5.4 — The Levant and the Dome of the Rock (2026-10-27)

- **A new region, the Levant,** north of Byzantium over a pass: Mount Moriah with the esplanade, the Kidron valley and the Mount of Olives, olive groves on the slopes, cypresses, carobs and garrigue, a clear dry sky (sometimes the hot dusty sharav, sometimes a winter shower), and a town of pale stone houses with low domes on their flat roofs.
- **The Dome of the Rock** as completed in 691/92: the octagon of walls with marble below and glass mosaic above, the four porches and doors, 36 arched windows; inside, the octagonal arcade of piers and columns tied by gilded beams, the circular arcade round the Rock, the gold drum with its sixteen windows, the gilded double dome; painted ceilings over the two ambulatories; the Rock itself behind a wooden screen. On its raised platform with four flights of stairs, and the **Dome of the Chain** beside it, with its eleven and six columns and its mihrab.
- **Music:** inside, a single ornamented voice over a drone in a mode with a three-quarter-tone step; outside, the oud, the reed flute and the frame drum.

## v5.3 — Byzantium and Hagia Sophia (2026-10-27)

- **A new region, Byzantium,** north of Greece over a mountain pass: the hills of Constantinople above the water, a grey sea-air climate with drizzle, sea mist and the north-east wind, cypresses and plane trees, and a town of tiled houses with upper storeys jutting over the streets.
- **Hagia Sophia** as rebuilt in 562, at true scale: the great dome floating on its ring of forty windows over four pendentives, the two semidomes and four exedrae with porphyry and green marble columns, the galleries (climb the ramp tower), the tympana full of windows, the apse with the clergy's tiers, the silver chancel and ciborium, the ambo, rings of oil lamps, the two narthexes and the Imperial Door, the atrium with its fountain. Gold mosaic on every vault, walls of book-matched marble.
- **Byzantine chant**: voices over a held drone, ringing for twelve seconds under the dome; the wooden semantron outside.
- Fixes: the sun's glare no longer floods the picture; leaves and grass are no longer black against the light; gentler sand ripples; redder Attic earth.

## v5.2 — Regions, sky and weather (2026-10-26)

Every building now stands in a small world of its own.

- **Three regions along one river**, each a basin between ridges, crossed by roads over passes: **the Nile** (flood plain with fields, palm groves, papyrus and reeds at the water, a desert escarpment and dunes, and the mud-brick town of Edfu on its mound around the temple), **Rome** (a plain among hills with stone pines, cypresses, holm oaks and oleanders, and the Pantheon's forecourt closed by granite porticoes), **Greece** (olive groves in rows, Aleppo pines and maquis on the hills, red earth and dry grass, the Acropolis rising over the plain).
- **Each region has its own sky:** its own time of day (Egyptian late afternoon, a Roman spring morning, an Attic noon), haze and light, and **weather that changes** every few minutes — clouds whose shadows drift over the ground, dust in Egypt, showers in Rome with wet ground and puddles, the meltemi in Greece. Crossing a pass, the sky changes with the land.
- **Lower, more natural exposure**, and baked light in every building matched to its region's sun.
- **Plants that move:** trees, palms, shrubs and grass sway in the wind, harder when it blows.
- **Music fixed** (it could stay silent after entering); rain and wind can now be heard.

## v5.1 — The Parthenon and the Pantheon (2026-10-26)

- **The Pantheon** (Rome, c. AD 114–128) at true scale: the portico of sixteen granite Corinthian columns in three aisles, grey in front and pink behind; the bronze doors; the rotunda, a sphere of 43.3 m with seven niches between giallo antico and pavonazzetto columns, eight aediculae with porphyry columns, the floor of porphyry, granite and marble circles and squares; the dome of 140 coffers, each stepped back four times, and the open oculus throwing its disc of sun across them. Outside, the step rings and the gilt-bronze roof.

- **The Parthenon** (Athens, 447–432 BC) at true scale on a new **Acropolis** rock north of Edfu: 46 Doric columns with their 20 flutes and measured entasis, the corner columns thicker and closer, triglyphs and metopes with the corner triglyphs pushed to the corners, pediments, marble roof tiles and antefixes, the marble-coffered walkway around the cella. Inside: the two-tier colonnade around the gold-and-ivory Athena Parthenos with her shield, spear and Nike, the shallow pool before her, the timber coffered ceiling; behind, the treasury room with its four Ionic columns. The east door between its two windows lights the statue.
- **Hills and cliffs:** the world now has terrain; climb the Acropolis from the west, the cliffs on the other sides cannot be climbed.
- **Music** of the Parthenon: kithara and aulos in the ancient Dorian mode.
- Edfu: the roof stairs and the roof, inner cedar doors, a finer sacred barque and palms.

## v5.0 — A world of architecture begins (2026-10-26)

The project starts again as a walkable, realistic world of buildings from every age and civilization.

- **The Temple of Horus at Edfu, rebuilt at true scale** from a new sourced dossier: a 36 m pylon with flagpoles and granite falcons, the court of 32 columns with every capital different and paired across the axis, the pronaos of 18 columns behind its screen walls, the hall of appearances and its side rooms, the offering hall, the hall of the Ennead, the sanctuary with the granite naos of Nectanebo II and the sacred barque, the corridor of mysteries with nine chapels, and the ambulatory inside the enclosure wall. Each hall a step higher, lower and darker than the last.
- **Realistic light:** sun with soft cascaded shadows, light bounced off the stone and from the sky baked into every room, oil lamps glowing in the inner chapels, ambient occlusion, and eyes that adapt as you walk from the sunlit court into the dark sanctuary.
- **Stone that looks like stone:** sandstone laid in real courses, column drums, paving flags, polished granite, cedar doors — all generated, nothing copied.
- **Music** in the manner of a Ptolemaic temple — harp, sistrum, frame drum, a sung drone — which changes from the open court to the halls to the sanctuary.
- **The river** runs beside the temple, with palms along the forecourt and the enclosure.
- **Walk freely**: no markers, no numbers, no route on screen. A map jumps to any building. English and Chinese.
- The old loci, notes and toy-style models are gone.

# Victorian London (Westminster), about 1870 — dossier

Settlement id: `london` · Style: `victorian` (on the gothic vocabulary) · Region: Britain (the Thames at Westminster) · Code: `src/settlements/london/`
Status of this dossier: L1–L2 (the Palace of Westminster's river front in bays of tall windows and pinnacles, its inner ranges, the Clock Tower with its four faces and spire, the Victoria Tower, the central spire, Westminster Hall; Westminster Abbey's massing; Parliament Square; Westminster Bridge; the Thames; brick terraces on both banks; ground, planting, weather, music). L3 in part (v. north2): the river front's Perpendicular detail, Westminster Bridge's iron arches, the embankments with their dolphin lamps, chimney pots (§1.1); Westminster Abbey's true form with Hawksmoor's towers and Henry VII's chapel (§1.2). L3 in part (v. lv): Westminster Hall rebuilt and enterable with its hammerbeam roof (§1.3); cabs, omnibuses, gas lamps, steamers, lighters and a pier (§1.4). Still for later: the palace's interior route (St Stephen's Hall, the Central Lobby, the Commons), St Margaret's, St Thomas' Hospital across the river, fog.

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The real example

- **Landmark:** the Palace of Westminster, rebuilt by Charles Barry and A. W. N. Pugin after the fire of 1834. Its river front is about 266 m long; the Victoria Tower is about 98.5 m and the Clock Tower (Elizabeth Tower) about 96 m [stated: Wikipedia "Palace of Westminster"; "Big Ben"].
- **Westminster Hall:** the medieval hall kept within the palace [stated: Wikipedia "Westminster Hall"].
- **Westminster Abbey:** across Parliament Square to the west [stated: Wikipedia "Westminster Abbey"].
- **Westminster Bridge:** the new bridge of cast iron opened in 1862 [stated: Wikipedia "Westminster Bridge"].
- **Moment shown:** about 1870, the palace complete.

### 1.1 Detail of the river front, the bridge and the embankments (v. north2)

- **The palace's fabric:** slate roofs, and galvanised cast-iron plate roofs on Barry's work; a cruciform and axial plan with the principal elevations to the river; Barry's symmetry on the river-front terrace against the asymmetry of the towers and the central flèche; Pugin's Perpendicular detail — "the rhythmic buttresses and bay windows", "the close panelling with open and blind tracery", and "the wealth of sculpture, carved crockets, pinnacles and finials" [stated: Historic England list entry 1226284, via British Listed Buildings]. Ours (`river_front`, `src/styles/victorian/palace.js`): four storeys of square-headed two-light windows with transoms, cusped heads and label moulds; full-height panelling shafts and blind tracery panels with carved shields between the storeys; buttresses set back at each storey rising into crocketed pinnacles; an openwork parapet pierced with quatrefoils; three projecting pavilions (both ends and the centre) with octagonal turrets under lead caps; the iron roof (drawn in lead grey) with iron cresting on the ridge. [inferred: the storey heights and the pavilions' widths]
- **Westminster Bridge (1862):** built by Thomas Page, Gothic detail by Charles Barry; seven arches of 96 to 120 ft, 16 to 20 ft above high water; 826.8 ft long, 88 ft wide; cast iron in the ribs near the abutments and wrought iron near the crown; the piers surmounted by octagonal pillars of Cornish granite; the north footway paved with Stamford terracotta tiles, edged with red granite from Mull [stated: Grace's Guide, "Westminster Bridge, London"]. Ours (`iron_bridge`, `src/styles/victorian/bridge.js`): seven segmental iron arches, largest in the middle, five ribs across, open spandrels with posts and tracery rings on the outer ribs, the deck girder with cusped arcading, granite piers with pointed cutwaters, octagonal granite pedestals over them carrying three-lantern lamp standards [inferred: the lamps' form], a roadway of setts between raised footways with granite kerbs, a cast-iron parapet of pointed arcading. Narrower than life (16 m), as the river is.
- **The embankments:** the dolphin lamp standards were designed by George John Vulliamy and modelled by C. H. Mabey, designs published in 1870: two stylised dolphins or sturgeons writhe round the base of a fluted column carrying a white globe under a metal crown, many on granite plinths; they line the Victoria and Albert Embankments — the river wall between Lambeth and Westminster bridges has 36 [stated: Wikipedia "Dolphin lamp standard"]. Ours (`embankment`): a granite river wall with a parapet and coping, a string course on the river face, a dolphin lamp every 18 m, a bronze lion's head holding a mooring ring under each lamp [inferred: the lion masks are the Victoria Embankment's], along the Westminster bank north of the bridge (the Victoria Embankment, finished 1870) and the Lambeth bank south of it (the Albert Embankment, 1866–69). [inferred: dates from the dossier's L3 notes]
- **The terraces:** chimney stacks on the party walls now carry a stone coping and a row of terracotta pots, one per flue (2–4). [inferred]

### 1.2 Westminster Abbey (v. north2; `abbey`, `src/styles/victorian/abbey.js`)

- The highest Gothic vault in England, nearly 102 ft, the narrow aisles making the nave look taller; flying buttresses among the features taken from Reims, Amiens and Chartres; stone from Caen and Reigate, Purbeck marble columns; the west towers designed by Nicholas Hawksmoor and completed in 1745 in Portland stone, finished by John James; no tower, dome or spire was ever built over the lantern, though Wren, Dickinson and Hawksmoor proposed them; Henry VII's Lady Chapel, 1503–1519, Perpendicular, with a fan vault; the north front's upper part and rose were restored and altered by J. L. Pearson late in the 19th century [stated: Westminster Abbey, "Architecture"].
- Ours: a nave 32 m to the eaves between aisles of 14 m, flyers from buttress piers over the aisles to the clerestory, two-light pointed windows in clerestory and aisles, a lead roof; transepts with rose windows over lancets, portals, buttress turrets and gables; a low lantern with a pyramid roof over the crossing; the apse; Henry VII's chapel lower beyond it, its buttresses polygonal turrets with ogee lead caps and gilt finials; Hawksmoor's towers (69 m) with octagonal corner turrets and pinnacles, a belfry with louvres, a pierced parapet with a gablet on each face, and a clock on the north tower. [inferred: dimensions other than the vault, the turrets' caps, the dial's colour, the clock's faces; the north front shown before Pearson's work only in outline] The previous generic two-towered cathedral is gone.

### 1.3 Westminster Hall (v. lv; `westminster_hall`, `src/styles/victorian/hall.js`)

- **The hall:** about 73 by 20 m (240 by 67 ft), floor about 1,547 m² [stated: Grace's Guide "Westminster Hall"; Wikipedia "Westminster Hall"]. Richard II's remodelling refaced the thick stone walls and added a cornice, a string course carved with the king's emblems, corbels, traceried windows and flying buttresses; two towers on the north front; Soane rebuilt the north front in 1819–22 in Richard II's style; Barry changed the south end after 1834 — St Stephen's Porch there; of the thirteen kings' statues commissioned in 1385, six remain in niches on the south wall [stated: Wikipedia "Westminster Hall"]. Smirke refaced the interior in Huddlestone stone and laid a Purbeck stone floor in the 1830s [stated: UK Parliament "Reconstruction: fire of 1834"]. The walls leaned and were shored by flying buttresses at alternate trusses [stated: Grace's Guide].
- **The roof:** commissioned 1393, by Henry Yevele and the carpenter Hugh Herland; 20.7 by 73.2 m, timber lifted to about 28 m; the arches meet in a span of 18 m or more; framed near Farnham; two lanterns on the ridge (1397–98); about 660 tons of oak under 176 tons of lead [stated: UK Parliament "The hammer beam roof"]. Span 20.8 m; opening between the hammer ends 7.77 m; floor to hammer beam 12.19 m; to the underside of the collar 19.35 m; the great arched timber rising from a wall piece to the collar; hammer beams carried on curved braces, their ends commonly carved with angels holding shields [stated: Wikipedia "Hammerbeam roof"]; twenty-six carved angels [stated: Wikipedia "Westminster Hall"] — hence thirteen trusses with an angel at each end [inferred].
- **Ours:** walls 1.6 m thick to 14 m, a parapet and cornice; inside a string course with carved bosses at 6.5 m and a two-light window of Perpendicular tracery in each bay between the trusses (inside, daylight; outside, glass) [inferred: window size and height]; stepped buttresses at every truss (the flyers left out: in 1870 Soane's law courts stood against the west side) [inferred]; thirteen trusses — stone corbel, wall post, curved brace, hammer beam projecting 6.5 m with its angel and shield, hammer post to the principal rafter, the great arch from 9 m on the wall to the collar at 19.35 m, struts of open tracery, king and queen struts over the collar — purlins and wall plates the length of the hall, oak boarding under lead with its rolls, the ridge at 28 m; one octagonal louvred lantern on the ridge (the second of 1397 not shown) [inferred: the lantern's form]; the north front with the great doorway in three moulded orders and its label, the oak leaves open, the eight-light great window with two transoms, the towers in stages with angle buttresses, a king in a niche and lancets on each face, battlements and pinnacles [inferred: the towers' height (27.5 m) and stages]; at the south end a flight of fourteen steps 16 m wide up to a landing with a balustrade, the porch's moulded arch, six kings in canopied niches, the great south window [inferred: the flight's size]. The hall is entered from New Palace Yard by the north door (a music zone of its own). Terrace houses which the old plan had left standing inside and in front of the hall's footprint are gone.

### 1.4 The street and the river about 1870 (v. lv; `src/styles/victorian/street.js`, placed in `town.js`)

- **The hansom cab:** two wheels (first 7 ft 6 in, later much smaller but still large beside the body); the driver's seat high at the rear (Chapman's design of 1836); folding wooden doors over the passengers' legs, a curved fender before them against the mud the horse threw up; a roof hatch to the driver; a low-slung body with one forward-facing seat for two; one horse; the commonest vehicle for hire [stated: Wikipedia "Hansom cab"]. Ours: wheels 1.6 m, black body with a coloured waist line, small side windows, lamps at the front corners, the driver in a cape and hat on his perch with the reins over the roof [inferred: the colours and the lamps].
- **The knifeboard omnibus:** a single long back-to-back bench along the roof (the "knifeboard"); up to 12 inside and 26 in all; rungs at the back, curved stairs only from the 1870s; two horses; each bus with a fleet name and colour scheme showing its route, with the company's name, the destination and advertising lettered on it [stated: London Transport Museum, "Thomas Tilling 'knifeboard' type horse bus, about 1875"]. Ours: body with five windows a side, route boards and advertising boards, the knifeboard with its rail, the driver's box and footboard, a pole to the pair, the conductor on the back step, passengers on the roof facing outward; three liveries [inferred].
- **The steamers:** paddle steamers, many double-ended, with tall funnels whose rings showed the destination; fore-cabin and aft saloon; piers on both banks, a service at Westminster Bridge; London Bridge to Westminster a penny [stated: The History of London, "Victorian passenger steamboats on the Thames"]. Ours: two steamers (30 m, compressed with the river) — black hull, planked deck and rail, paddle boxes with their sponsons and the bridge between them, the raked funnel ringed in a route colour, a mast with a flag, a low saloon aft, passengers at the rail; one at a floating pier with a shelter and gangway north of the bridge on the Westminster side [inferred: the pier's place and form]. Coal and sack lighters with their lightermen and sweeps [inferred].
- **Gas lamps:** cast-iron columns with ladder bars and four-paned lanterns along Bridge Street and Parliament Street [inferred]. Horses, drivers and passengers are built in a plan of the life style (`london-traffic-life`) so they are instanced with the town's other figures.

## 2. Layout of the settlement (radius 420 m)

| Part | Where (m, +x east, +z south) | Notes |
|---|---|---|
| Thames | x ≈ 115–255, flowing north–south | [stated: the river runs north–south here; width ours] |
| Palace | the west bank, 270 m long | [stated] |
| Clock Tower, Victoria Tower | north and south ends | [stated] |
| Abbey | west | [stated] |
| Parliament Square | north-west | [stated] |
| Bridge | north of the Clock Tower, across to Lambeth | [stated] |

## 3. Orientation

The palace's river front faces east across the Thames. [stated]

## 4. The style

Gothic Revival in Anston limestone with iron roofs; brick terraces with slate roofs, chimney stacks and sash windows. [stated: materials]

## 5. The town

About 2,900 terrace houses on both banks. [inferred]

## 6. Ground and water

Setts and pavements; the square's lawn and plane trees; the grey Thames and its mud. [inferred]

## 7. Sky and climate

Overcast and smoky; rain. [inferred]

## 8. Paths

From Parliament Square past the Clock Tower onto the bridge. [inferred]

## 9. Sound

The Great Bell's chimes, church bells, the barrel organ, hymns. [inferred]

## Sources

- [Palace of Westminster — Wikipedia](https://en.wikipedia.org/wiki/Palace_of_Westminster)
- [Big Ben — Wikipedia](https://en.wikipedia.org/wiki/Big_Ben)
- [Westminster Hall — Wikipedia](https://en.wikipedia.org/wiki/Westminster_Hall)
- [Westminster Abbey — Wikipedia](https://en.wikipedia.org/wiki/Westminster_Abbey)
- [Westminster Bridge — Wikipedia](https://en.wikipedia.org/wiki/Westminster_Bridge)
- [Westminster Bridge, London — Grace's Guide](https://gracesguide.co.uk/Westminster_Bridge,_London)
- [Houses of Parliament and the Palace of Westminster, list entry 1226284 — British Listed Buildings](https://britishlistedbuildings.co.uk/101226284)
- [Architecture — Westminster Abbey](https://westminster-abbey.org/our-history/architecture)
- [Westminster Hall — Grace's Guide](https://www.gracesguide.co.uk/Westminster_Hall)
- [The hammer beam roof — UK Parliament](https://webtest.parliament.uk/about/living-heritage/building/palace/westminsterhall/architecture/the-hammer-beam-roof-)
- [Reconstruction: fire of 1834 — UK Parliament](https://webtest.parliament.uk/about/living-heritage/building/palace/westminsterhall/architecture/reconstruction-fire-of-1834)
- [Hammerbeam roof — Wikipedia](https://en.wikipedia.org/wiki/Hammerbeam_roof)
- [Hansom cab — Wikipedia](https://en.wikipedia.org/wiki/Hansom_cab)
- [Thomas Tilling 'knifeboard' type horse bus, about 1875 — London Transport Museum](https://ltmuseum.co.uk/collections/stories/transport/collections-close-thomas-tilling-knifeboard-type-horse-bus-about-1875)
- [Victorian passenger steamboats on the Thames — The History of London](https://www.thehistoryoflondon.co.uk/victorian-passenger-steamboats-on-the-thames/)
- [Dolphin lamp standard — Wikipedia (IPFS mirror)](https://ipfs.aleph.im/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/wiki/Dolphin_lamp_post.html)

# Rome under Hadrian (the Campus Martius), about AD 128 — dossier

Settlement id: `rome` · Style: `roman` · Region: Latium (Rome, the Campus Martius) · Code: `src/settlements/rome/`
Replaces the legacy district of the previous design. The Pantheon itself is the full building from that design (`src/buildings/pantheon`, dossier `docs/buildings/pantheon.md`) with its forecourt.
Status of this dossier: L1–L2; the stadium's façade and the insulae at L2–L3 (the Pantheon and its colonnaded forecourt; the Baths of Agrippa with their domed hall; the Saepta Julia's porticoed enclosure; the Stadium of Domitian's tiers round its arena; the Via Lata; the Tiber's bend; insulae in the blocks; ground, planting, weather, music). L3 pass (§4.3, §4.4, §10): the Pantheon's bronze portico truss, an atrium house with its thermopolium walked into and furnished, a litter with its bearers, vendors on the Via Lata, people. L3 recorded for later: the Basilica of Neptune and the Stagnum Agrippae, the Temple of Matidia, the Odeon, the Mausoleum of Augustus and the Ara Pacis to the north, the Capitol to the south-east, street life, fountains, aqueducts.

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The real example

- **Landmark:** the Pantheon, rebuilt under Hadrian about AD 114–128, its rotunda 43.3 m across and high, facing north through its portico onto a colonnaded forecourt [stated: `docs/buildings/pantheon.md` and its sources].
- **Its neighbours in the Campus Martius:**
  - the Baths of Agrippa, the first great public baths of Rome, behind the Pantheon to the south [stated: Wikipedia "Baths of Agrippa"];
  - the Saepta Julia, a long porticoed enclosure east of the Pantheon, about 310 × 120 m [stated: Wikipedia "Saepta Julia"];
  - the Stadium of Domitian, about 275 m long, whose arena is now the Piazza Navona, to the west [stated: Wikipedia "Stadium of Domitian"];
  - the Via Lata (the urban Via Flaminia), running north–south on the east [stated: Wikipedia "Via Lata"];
  - the Tiber bending round the Campus on the west [stated: geography].
- **Housing:** most Romans lived in insulae, apartment blocks of several storeys of brick-faced concrete over shops [stated: Wikipedia "Insula (building)"].
- **Moment shown:** about AD 128, the Pantheon just completed.

## 2. Layout of the settlement (radius 420 m)

| Part | Where (m, +x east, +z south) | Notes |
|---|---|---|
| Pantheon and forecourt | rotunda at the centre, the forecourt north to z = −165 | [stated: orientation] |
| Baths of Agrippa | south of the rotunda, 140 × 100 m | [stated: position; size inferred] |
| Saepta Julia | east, 60 × 320 m | [stated: length; width compressed — inferred] |
| Stadium of Domitian | west, 106 × 275 m, the curve north | [stated: size; orientation] |
| Via Lata | x = 175 | [inferred position] |
| Tiber | at the west edge | [stated: geography; brought nearer] |
| Insulae | in blocks between | [inferred] |

## 3. Orientation

The Pantheon faces north; the stadium runs north–south. [stated]

## 4. The style

Brick-faced concrete with travertine and marble; Corinthian colonnades; tiled roofs; the baths' great arched windows and domed hall; tiers of travertine seats in the stadium. [stated: materials; inferred: details]

### 4.1 The Stadium of Domitian (as built, `stadium` in `src/styles/roman/town.js`)

- Footprint about 275 × 106 m (Colini), or 265 × 106 m; one end semicircular, the other flattened [stated: Wikipedia "Stadium of Domitian"; stadiodomiziano.com]. Built here at 275 × 106 m, the curve to the north [stated: the curved end lies under the north end of Piazza Navona].
- The outer façade in two tiers of arches on piers, the lower tier with the Ionic order and the upper with the Corinthian; outer porticoes and entrance atria of travertine, the rest brick [stated: stadiodomiziano.com]. The façades resembled the Colosseum's; the perimeter arcaded beneath the seating, travertine pilasters between [stated: Wikipedia].
- The cavea in two tiers of steps; capacity about 30,000; the track of compacted earth [stated]. Built as 14 rows on a podium of about 2.2 m round the arena [inferred].
- As built: bays of about 6.4 m, arches 3.9 m wide; an engaged half-column on each pier (angular Ionic capitals with a volute at each corner, as on the Temple of Saturn, below; Corinthian above); entablature of architrave, frieze and cornice over each tier; a parapet in each upper arch; an attic band with pilasters and a cornice; an ambulatory about 5 m deep behind the arcades, floored at the upper tier, with a dark door into the cavea in every bay [inferred: proportions and the attic, from the Colosseum's type; the number of storeys and the orders are stated]. Height raised from 16 to 20 m [inferred].
- Not built: the four entrance porches on the sides [stated as existing; left for later].

### 4.2 Insulae (as built, `insula`)

- Apartment blocks over tabernae; Augustus limited height to about 70 Roman feet (20.7 m) and Trajan to about 60 (17.75 m) [stated: Wikipedia "Insula (building)"]. Built at four or five storeys, 14.2–17.4 m.
- The Hadrianic House of the Balcony with Corbels at Ostia (I,VI,2): shops on the street, large windows over the doorways, a brick balcony on travertine corbels under the windows, an outside stair to the flats above [stated: ostia-antica.org]. Luxury blocks had large glazed windows and pilasters at the stair doors [stated: Wikipedia].
- As built: shop doorways 2.7 m wide under travertine lintels on travertine thresholds, a mezzanine window over each; about a third shut with their boards, a third with a masonry counter in the door [inferred]; one stair door between brick pilasters; brick string courses at the floors; windows with travertine sills, some with wooden shutters open or shut [inferred]; a corbelled brick cornice with a travertine crown; a hipped tile roof; on about half the blocks a brick balcony on travertine corbels with a timber rail along the first floor of the long face [stated type; inferred frequency and the rail]. Built in two levels of detail in 100 m tiles (`src/settlements/lod.js`).

### 4.3 The Pantheon's bronze roof truss (L3 pass)

- The portico's "roof truss that is made entirely made from bronze", with gilded covering plates, stood intact until 1625/26, when Urban VIII had it removed and its bronze (180 tons; 152 tons in the published study) made into cannon; two of its bronze rivets survive (Berlin, Florence); Borromini, present at the demolition, left measured drawings [stated: University of Cologne, Institute of Archaeology, "The Bronze Roof Truss of the Vestibule of the Pantheon in Rome"; Heinzelmann & Heinzelmann, "The metal roof truss of the Pantheon's portico in Rome – 152 tonnes of bronze"]. **Built:** five trusses under the portico's roof between the front and the block, each a tie beam of bronze box girders on the side entablatures (carried over the inner marble beams by short bronze posts), two rafters under the roof's slopes meeting at the ridge, a king post and two struts, a row of gilt rivet heads along the tie [inferred: the form of a king-post truss after the Renaissance drawings as generally reproduced, the number of stations, the posts].

### 4.4 A house walked into: an atrium house with a thermopolium (L3 pass)

- **The thermopolium:** the Regio V thermopolium at Pompeii is a multi-sided counter with deep terracotta jars set into it for hot food; painted on it a Nereid riding a seahorse, a nymph on a horse, mallard ducks, a rooster, a dog on a leash; in it remains of duck, goat, pig, fish and snail, beans in a wine container, nine amphorae, a bronze patera, flasks and an olla [stated: sci.news, 2020]. **Built** (Pompeii as the model for the Rome of Hadrian [inferred]): in the west shop of a house on the street north of the Pantheon, the L-shaped counter of brick under a marble top, faced in offcuts of coloured marble, three dolia sunk flush in it (one lidded), the stepped shelf of jugs at the return's end, the Nereid's panel on blue painted on the return, a bronze patera on the counter; behind it the hearth bench with its pot and the soot above, amphorae racked against the back wall, the painted lararium (the genius between two lares, the serpent's green band) with its shelf; a bronze lamp hanging [inferred: the layout, the number of dolia, the colours].
- **The atrium house:** **Built** behind the two shops (a thermopolium and a wine shop with amphorae, a board counter and a pair of scales): the fauces from the street door (a painted sign over it), the atrium with its roof sloping in to the compluvium and the marble impluvium below with the rain in it, the cistern head, the marble table (cartibulum) with a bronze bowl, the strongbox (arca) of wood bound in bronze on its base, the lararium as a little stucco temple with a lamp burning; four cubicula with beds and a chest; the tablinum on a floor of coloured marble with the writing table, a chair and a case of scrolls; the triclinium with three couches round a round marble table and a silver dish; the kitchen with its masonry hearth bench, pots and soot, amphorae; walls painted with a black dado under red, ochre or white fields and a band under the ceiling, left open over every doorway; worn travertine thresholds [inferred: the plan after the atrium houses of Pompeii, sizes and colours ours].

## 10. Life (L3 pass)

- **The litter:** the lecticarii, "strong, preferably tall", four to eight to a litter depending on its weight; poles fastened to the sides of the couch let them lift it onto their shoulders; an overhead canopy on four posts gave shade, a rod above it carried curtains that could be drawn; in the city the law forbade wheeled vehicles by day, so the litter was used more by women [stated: VRoma, "Litter"]. **Built:** a litter going east along the street north of the Pantheon: the couch with its mattress and cushion, the canopy on four posts, the curtains gathered at the posts, the two poles at shoulder height; six bearers in red tunics with the poles on their right shoulders, an attendant with a staff clearing the way ahead [inferred: the colours, the attendant].
- **Street vendors and people:** **Built:** stalls on both sides of the Via Lata with bread, vegetables, pots, cloth and fish, the vendor behind each and buyers before it; citizens in the white toga, men in belted tunics, women in the stola with a shawl, some veiled; donkeys with loads; a few togate men in the Pantheon's forecourt; the keeper behind the thermopolium's counter and a customer before it [inferred: numbers and places, §5 of DESIGN].

## 5. The town

About 300 insulae of four or five storeys with arcaded shops on the street. [inferred]

## 6. Ground and water

The flat Campus Martius; umbrella pines and cypresses in gardens; reeds and willows on the Tiber's banks. [inferred]

## 7. Sky and climate

The soft light of Latium; cloud sometimes; a shower. [inferred]

## 8. Paths

From the north across the forecourt to the Pantheon's portico. [inferred]

## 9. Sound

As for the Pantheon (`docs/buildings/pantheon.md` §9).

## 4.5 Streets: rows of tabernae (batch pass)

- Ground-floor shops (tabernae) opened wide under travertine lintels between brick piers, shut at night with boards set in a groove in the threshold; flats of brick-faced concrete above [stated: Wikipedia "Insula (building)"; ostia-antica.org, House of the Balcony with Corbels]. **Built** (`taberna_row`): rows of 3-5 shops 4.4 m wide on both sides of the Via Lata and on the north side of the street before the Pantheon, each walked into: a masonry counter with dolia sunk in it and amphorae along the wall (wine, oil, hot food), a shop of pots and cloth, a smith's forge with anvil, or shut with its boards; joists of the mezzanine overhead; three storeys of flats above with a corbelled cornice and, on some, a balcony [inferred: the trade mix, the sizes].
- Fountains: street fountains of the Pompeian type (a trough with a pier carrying a spout) in the alleys between rows; the Aqua Virgo ended in the middle of the Campus Martius before the Saepta Julia and fed Agrippa's baths [stated: Wikipedia "Aqua Virgo"]. **Built** (`fountain`): eight troughs with a carved head and a bronze spout, one round basin in the forum [inferred: positions].

## 4.6 The forum west of the Pantheon and a podium temple

- Hadrian built a temple to his deified mother-in-law Matidia (died 119, deified at once) in the Campus Martius near the Pantheon and the Saepta Julia; its form is not recorded [stated: Wikipedia "Temple of Matidia"]. **Built** (`temple`, `colonnade`, `forum_floor`, `statue`): a square of travertine flags 96 x 88 m with a colonnade of 7.6 m travertine columns on three sides (a gap on the axis), a Corinthian hexastyle temple on a 2.6 m podium at the west end (marble stair across the front, pronaos two bays deep, cella with bronze door and a gilt cult statue, entablature all round, pediment and tiled roof), and six statues on plinths [inferred: the whole form, after the temples of the Campus Martius and of the Hadrianic type].
- The Pantheon's floor: squares of pavonazzetto framed in white marble with discs of porphyry and giallo antico alternating [stated in part: `docs/buildings/pantheon.md`; inferred: the grid]; a light hung under the oculus [inferred].

## 4.7 The public latrine

- At Ostia (by the Forum baths, Hadrianic shops): twenty marble seats with a hole in each along three sides of a room, a channel under them for water, a wash basin on a pillar between two entrances with revolving doors [stated: Parco archeologico di Ostia antica, "Latrina presso le Terme del Foro", ostiaantica.cultura.gov.it]. **Built** (`latrine`) at the street south of the baths: that plan, with the channel before the bench, painted walls and a Fortuna shrine [inferred: the shrine, the colours; the entrances here are plain doors].

## 4.8 The mill-bakery (pistrinum)

- A mill-bakery: on average about nine mills, each a fixed cone-shaped meta and an hourglass catillus turned by mules or horses through a wooden frame; large ovens with a cupola 3.5 to 5 m across; floors of basalt blocks; basins for water; kneading machines of volcanic stone [stated: ostia-antica.org, "The mills-bakeries of Ostia"]. **Built** (`pistrinum`): a bread shop with counter and shelves of loaves on the street; three mills on basalt floor with their bars; a water basin, sacks, the domed oven with arched mouth and chimney, a stack of wood, the kneading bench [inferred: three mills for the plot, the sizes].

## 11. Life, batch pass

- Walkers (`movers.js`): citizens in the white toga, workmen and slaves in belted tunics, porters with baskets and sacks, matrons in veiled stola and palla, soldiers in red with a staff, boys; Via Lata, the two cross streets, the forum and the forecourt. Fauna: swifts and swallows, pigeons on the forum paving, crows over the stadium, egrets on the Tiber. Smoke: the bakery's chimney from before dawn, kitchen smoke at breakfast and the noon meal, steam from cookshops, incense at the temple [inferred].
- Sources added: [Temple of Matidia](https://en.wikipedia.org/wiki/Temple_of_Matidia); [Aqua Virgo](https://en.wikipedia.org/wiki/Aqua_Virgo); [Latrina presso le Terme del Foro](https://ostiaantica.cultura.gov.it/en/educational-panels-and-maps/the-central-area-and-the-official-complexes/latrina-presso-le-terme-del-foro/); [The mills-bakeries of Ostia](https://ostia-antica.org/dict/topics/bakeries/bakart.htm).

## Sources

- [The Bronze Roof Truss of the Vestibule of the Pantheon in Rome — University of Cologne](https://archaeologie.phil-fak.uni-koeln.de/en/research/research-projects/the-bronze-roof-truss-of-the-vestibule-of-the-pantheon-in-rome)
- [The metal roof truss of the Pantheon's portico in Rome – 152 tonnes of bronze — AMiner record](https://www.aminer.org/pub/619b5b8f1c45e57ce917c9fa/the-metal-roof-truss-of-the-pantheon-s-portico-in-rome-tonnes)
- [2,000-year-old fast food shop uncovered in Pompeii — sci.news](https://www.sci.news/archaeology/pompeii-thermopolium-09193.html)
- [Litter — VRoma](https://www.vroma.org/vromans/araia/litter.html)

- The Pantheon's own sources: `docs/buildings/pantheon.md`
- [Baths of Agrippa — Wikipedia](https://en.wikipedia.org/wiki/Baths_of_Agrippa)
- [Saepta Julia — Wikipedia](https://en.wikipedia.org/wiki/Saepta_Julia)
- [Stadium of Domitian — Wikipedia](https://en.wikipedia.org/wiki/Stadium_of_Domitian)
- [Via Lata — Wikipedia](https://en.wikipedia.org/wiki/Via_Lata)
- [Insula (building) — Wikipedia](https://en.wikipedia.org/wiki/Insula_(building))
- [Stadio di Domiziano — the stadium's own site (architecture page)](https://stadiodomiziano.com/?p=317)
- [House of the Balcony with Corbels (I,VI,2) — ostia-antica.org](https://ostia-antica.org/regio1/6/6-2.htm)

# Rome under Hadrian (the Campus Martius), about AD 128 — dossier

Settlement id: `rome` · Style: `roman` · Region: Latium (Rome, the Campus Martius) · Code: `src/settlements/rome/`
Replaces the legacy district of the previous design. The Pantheon itself is the full building from that design (`src/buildings/pantheon`, dossier `docs/buildings/pantheon.md`) with its forecourt.
Status of this dossier: L1–L2; the stadium's façade and the insulae at L2–L3 (the Pantheon and its colonnaded forecourt; the Baths of Agrippa with their domed hall; the Saepta Julia's porticoed enclosure; the Stadium of Domitian's tiers round its arena; the Via Lata; the Tiber's bend; insulae in the blocks; ground, planting, weather, music). L3 recorded for later: the Basilica of Neptune and the Stagnum Agrippae, the Temple of Matidia, the Odeon, the Mausoleum of Augustus and the Ara Pacis to the north, the Capitol to the south-east, street life, fountains, aqueducts.

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

## Sources

- The Pantheon's own sources: `docs/buildings/pantheon.md`
- [Baths of Agrippa — Wikipedia](https://en.wikipedia.org/wiki/Baths_of_Agrippa)
- [Saepta Julia — Wikipedia](https://en.wikipedia.org/wiki/Saepta_Julia)
- [Stadium of Domitian — Wikipedia](https://en.wikipedia.org/wiki/Stadium_of_Domitian)
- [Via Lata — Wikipedia](https://en.wikipedia.org/wiki/Via_Lata)
- [Insula (building) — Wikipedia](https://en.wikipedia.org/wiki/Insula_(building))
- [Stadio di Domiziano — the stadium's own site (architecture page)](https://stadiodomiziano.com/?p=317)
- [House of the Balcony with Corbels (I,VI,2) — ostia-antica.org](https://ostia-antica.org/regio1/6/6-2.htm)

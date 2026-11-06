# Gothic Paris (the Île de la Cité), 1248 — dossier

Settlement id: `paris` · Style: `gothic` (with `vernacular` houses and bridges) · Region: France (the Seine) · Code: `src/settlements/paris/`
Replaces the legacy district of the previous design. The Sainte-Chapelle itself is the full building from that design (`src/buildings/sainte-chapelle`, dossier `docs/buildings/sainte-chapelle.md`), in the palace court.
Status of this dossier: L1–L2 (the island between the Seine's two arms; the royal palace with its great hall and towers on the north quay and the Sainte-Chapelle in its court; Notre-Dame's massing (nave, aisles, transept, apse, west towers and rose) and its parvis; the Grand Pont and the Petit Pont; rows of timber-framed houses on the island and both banks; ground, planting, weather, music). Notre-Dame in detail (§1a). L3 recorded for later: the palace's buildings in detail, the Châtelet and the Petit-Châtelet at the bridges' ends, houses on the bridges, mills on the river, the walls of Philip Augustus, people and boats.

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The real example

- **Landmark:** the Sainte-Chapelle, built 1242–1248 in the court of the royal palace on the Île de la Cité [stated: `docs/buildings/sainte-chapelle.md` and its sources].
- **The palace:** the Palais de la Cité occupied the island's west end, with its great hall and towers along the north arm of the Seine [stated: Wikipedia "Palais de la Cité"].
- **Notre-Dame:** at the island's east end, about 128 m long, its west towers about 69 m high, the towers finished about 1250 [stated: Wikipedia "Notre-Dame de Paris"].
- **The bridges:** the Grand Pont crossed the north arm to the Right Bank, the Petit Pont the south arm to the Left Bank [stated: Wikipedia "Grand-Pont"; "Petit-Pont"].
- **Moment shown:** 1248, the Sainte-Chapelle consecrated.

## 1a. Notre-Dame in detail (built: `src/styles/gothic/notre-dame.js`, element `notre_dame`)

- **Overall:** 128 m long, 48 m wide; nave vault about 33–35 m; towers 69 m [stated: Kiddle "Notre Dame de Paris"; notredamedeparis.fr]. Bays of about 6.2 m in the nave and 6.4 m in the choir, the transept a little past the middle [inferred from the length].
- **West front:** 41 m wide, 69 m to the towers' tops [stated: notredamedeparis.fr]. Three portals: the Virgin on the left (north, about 1210–20; trumeau the Virgin and Child; lintels with prophets and kings by the Ark, the Virgin's death; her coronation above), the Last Judgement in the centre (1220–30; the twelve apostles six a side on the jambs; the trumeau the teaching Christ; the dead rising on the lower lintel, Saint Michael weighing souls with the elect and the damned on the upper, Christ in judgement above), Saint Anne on the right (south, installed about 1200; Saint Marcel on the trumeau; the Virgin in majesty above two lintels) [stated: Friends of Notre-Dame de Paris, "Portals"]. The archivolts hold a heavenly court of angels, patriarchs, prophets, martyrs and virgins [stated: same]. Built: each portal as orders stepping in and back, a column-statue on a corbel under a canopy on each step (six a side in the centre, four a side in the side portals — the source counts nine a side for the side portals, which we read as counting the small figures; [inferred]), files of small figures up every archivolt, the tympanum's figures in their registers, the doors with iron scrollwork [inferred: the 13th-century ironwork of the Saint Anne doors as type]. Four statues on the buttresses at portal level [stated: notredamedeparis.fr].
- **Gallery of Kings:** 28 kings of Judah, about 3.5 m each, about 20 m up [stated: notredamedeparis.fr; aroundus "Galerie des Rois"]; built under an arcade of 28 pointed arches on colonnettes, crowns painted ochre [inferred: traces of colour on the heads at Cluny]. Above it the Virgin's gallery, an openwork balustrade [stated: notredamedeparis.fr].
- **Rose:** 9.60 m, about 1225 [stated: notredamedeparis.fr]; built with a central oculus, twelve spokes to an inner ring with trefoil heads, twenty-four colonnettes under small arches to the rim [inferred: the rose's pattern]. Either side, in each tower, a great window of two lancets and an oculus [inferred].
- **Great gallery and towers:** an open screen of slender arches across the front; above it the towers, each face pierced with two tall bays with beaded and crocketed voussoirs [stated: notredamedeparis.fr], here with timber louvres inside; the flat top with a pierced parapet and gargoyles at the corners [inferred]. The chimeras of the gallery are Viollet-le-Duc's (19th century) and are not shown [stated: Kiddle].
- **Nave and choir:** the clerestory of two lancets and an oculus per bay, the tribunes under low lead roofs, the outer aisles; chapels between the uprights of the flying buttresses along the nave (built about 1235–50); the choir's chapels came later (about 1270–1330) and are not shown [inferred: general histories; recorded as inferred]. Flying buttresses spanning both aisles in one flight from uprights with crocketed pinnacles; a gargoyle on each upright [inferred: Notre-Dame's flyers; the 14th-century choir flyers reach 15 m, Kiddle]. Lead roofs [stated: "the forest" under lead].
- **Transept:** arms projecting just beyond the chapels, each gable with a rose (the north rose about 1250, the south 1258–60: shown in their place though the new façades were only begun) [stated: Kiddle; inferred: their state in 1248].
- **Spire:** of oak sheathed in lead over the crossing, about 1220–30, about 78 m above the floor, taken down 1786–92 [stated: Wikiwand "Spire of Notre-Dame de Paris"]; built as an octagonal lantern with pointed bays, gablets and corner pinnacles under a crocketed needle with its cross and cock [inferred].

## 2. Layout of the settlement (radius 420 m)

| Part | Where (m, +x east, +z south) | Notes |
|---|---|---|
| Île de la Cité | x −330…330, z −95…95 | [inferred shape] |
| North arm, south arm | z −165…−105 and 105…150 | [inferred widths] |
| Palace and Sainte-Chapelle | the west end; the chapel at (−200, −10) | [stated: positions] |
| Notre-Dame and parvis | the east end | [stated] |
| Grand Pont, Petit Pont | x = 0 north, x = 110 south | [stated: arms; positions inferred] |
| Houses | in rows on the island and both banks | [inferred] |

## 3. Orientation

Churches face west (the apse east); the river runs east–west. [stated]

## 4. The style

Rayonnant Gothic in limestone with lead and slate roofs; timber-framed houses jettied over the street, gables to the street, slate or tile roofs. [stated: materials; inferred: details]

## 5. The town

About 2,300 houses in rows. [inferred]

**A tavern and a workshop to enter (L3, built).** The two timber houses nearest the arrival are open on the ground floor (DESIGN §4.3): a wide door in the stone front, a floor of flags, the beams of the floor above. The tavern: trestle tables with benches, jugs and cups, the hearth with its jambs, hood and pot, casks on a stand, a shelf of jugs. The joiner's workshop: the bench with its vice and shavings, a half-made chest, a trestle, planks stacked along the wall, tools hung on a rail, a chest of tools, shavings on the floor [inferred: the trades of the Cité's streets as the 13th-century crafts were practised].

**House detail (vernacular `house_timber`).** Each storey's windows on its own jettied face, framed, with a mullion (some shuttered); the jetty 0.3–0.45 m by house; a plank door under a stone lintel in the stone storey; roof slabs with eave and verge boards; a stone chimney stack on some houses [inferred].

## 6. Ground and water

Streets of mud and paving; gardens with fruit trees; willows and reeds on the banks; the Seine. [inferred]

## 7. Sky and climate

Changeable, often cloudy, with rain. [inferred]

## 8. Paths

From the Grand Pont across the island to the palace court and the Sainte-Chapelle; east to the parvis of Notre-Dame. [inferred]

## 9. Sound

As for the Sainte-Chapelle (`docs/buildings/sainte-chapelle.md` §9).

## Sources

- The Sainte-Chapelle's own sources: `docs/buildings/sainte-chapelle.md`
- [Palais de la Cité — Wikipedia](https://en.wikipedia.org/wiki/Palais_de_la_Cit%C3%A9)
- [Notre-Dame de Paris — Wikipedia](https://en.wikipedia.org/wiki/Notre-Dame_de_Paris)
- [Grand-Pont — Wikipedia (fr)](https://fr.wikipedia.org/wiki/Grand-Pont)
- [Petit-Pont — Wikipedia](https://en.wikipedia.org/wiki/Petit-Pont)
- [The Western Facade — notredamedeparis.fr](https://www.notredamedeparis.fr/en/?p=3428)
- [Portals — Friends of Notre-Dame de Paris](https://friendsofnotredamedeparis.org/cathedral/artifacts/portals)
- [Galerie des Rois — aroundus](https://aroundus.com/p/175212302-galerie-des-rois)
- [Notre Dame de Paris — Kiddle](https://kids.kiddle.co/Notre_Dame_de_Paris)
- [Spire of Notre-Dame de Paris — Wikiwand](https://wikiwand.com/en/articles/Spire_of_Notre-Dame_de_Paris)

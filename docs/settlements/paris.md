# Gothic Paris (the Île de la Cité), 1248 — dossier

Settlement id: `paris` · Style: `gothic` (with `vernacular` houses and bridges) · Region: France (the Seine) · Code: `src/settlements/paris/`
Replaces the legacy district of the previous design. The Sainte-Chapelle itself is the full building from that design (`src/buildings/sainte-chapelle`, dossier `docs/buildings/sainte-chapelle.md`), in the palace court.
Status of this dossier: L2–L3 (the island between the Seine's two arms; the royal palace with its great hall and towers on the north quay and the Sainte-Chapelle in its court; Notre-Dame's massing (nave, aisles, transept, apse, west towers and rose) and its parvis; the Grand Pont and the Petit Pont; rows of timber-framed houses on the island and both banks; ground, planting, weather, music). Notre-Dame in detail (§1a), inside (§1b); the bridges with their houses, mills and boats (§2a). The palace (§1c): the Grand-Salle, the king's gallery, the towers on the Seine, the enclosure, the quay with its boats, the king's garden. L3 recorded for later: the palace's interiors, the logis du roi, the Châtelet and the Petit-Châtelet at the bridges' ends, the walls of Philip Augustus, people and boats.

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

## 1b. Notre-Dame inside (built: `src/styles/gothic/nd-interior.js` and `notre-dame.js`)

- **Entering.** The three west portals stand open, their leaves turned in against the passage: the central portal into the west bay of the nave between the towers, the side portals into the towers' vaulted ground floors (four cells on a central column), which open east into the aisles and, by an arch, into the west bay [inferred: the nave "entered through two arcades under the towers", stated: Bluffton, Notre-Dame interior]. The west bay is vaulted higher than the nave (round-headed lunette over the west rose), a transverse wall with the nave's arch between [inferred: so the rose, which our façade sets at 31 m, shows whole inside].
- **The nave:** eight bays and two aisles each side [stated: Bluffton]; massive plain cylindrical piers with crocketed capitals [stated: Bluffton; Hanover]; sexpartite rib vaults, each over two bays of the elevation [stated: Hanover; Bluffton]; the clerestory windows enlarged about 1225, removing the old oculus storey [stated: Bluffton]. Built: piers 1.4 m across on square plinths, crocket capitals under square abaci at 6.4 m; the arcade's pointed arches; above, the tribune over the inner aisle opening to the nave through three arches on two colonnettes under a relieving arch; the clerestory of two lancets and an oculus (the glass of the exterior's windows, now set in the wall's thickness); three vaulting shafts from each abacus to the vault's springing at 23.5 m; the vault's crown at 33.5 m [stated: 33–35 m, §1a]; the columns between the aisles, every other one with eight attached shafts (the alternation of the double aisles) [inferred]; the inner aisle vaulted at 10 m under the tribune's floor, the tribune vaulted at 21 m under its lead terrace, the outer aisle and the chapels between the buttresses at 11 m [inferred: heights from the exterior].
- **Transept and crossing:** the crossing on four great piers, its quadripartite vault; the arms quadripartite, their end walls pierced by the door's window, five lancets and the rose (glass inside and out); the west and east walls of the arms open to the aisles and the tribunes below, a window above [inferred].
- **Choir:** four bays as the nave, sexpartite; the hemicycle of five sides on its piers, its radiating vault, the double ambulatory with the tribune over the inner ring, its vault cells over the trapezoids between the rings [inferred: the plan, the triangular cells of the real ambulatory simplified].
- **The jubé** across the choir's entrance east of the crossing: of the 1230s, polychrome, separating the choir from the nave; the deacon read the Gospel from it; destroyed early in the 18th century; over a thousand fragments found under the crossing in 2022, some 650 with their colour [stated: culture.gouv.fr; Aleteia]. Its form is not described by these sources; built in the manner of the period's screens [inferred]: an arcade of five pointed bays on colonnettes (the middle one the door, the others altars' recesses on a blue ground sown with gold), a frieze of the Passion in painted figures over it, a cornice and a parapet of quatrefoils, the rood on the platform (the cross with Christ, the Virgin and Saint John). The carved choir enclosure with its scenes is of the 14th century (Pierre de Chelles, finished 1351) [stated: notredamedeparis.fr, "The Jube of Cathedrals"] and is not shown.
- **Furnishings:** the canons' oak stalls in two rows along the choir with desks and a canopy [inferred]; the high altar in the hemicycle on its steps, a painted frontal, a gilt retable, the cross and two candlesticks [inferred].
- **Glass:** the 13th-century windows in the stained-glass material everywhere (clerestory, tribunes, chapels, ambulatory, transept roses and lancets, the west rose) [inferred].
- **Floor:** flags throughout [inferred].

## 1c. The palace about 1248 (built: `src/styles/gothic/palace.js`; the gallery in `src/buildings/sainte-chapelle/style.js`)

- **Position.** The Sainte-Chapelle stands in the palace court; the Grand-Salle lies north-west of it and the towers on the north arm's quay north of that; the gardens stretched west toward the island's point, with an orchard behind them [stated: techno-science "Conciergerie"; Wikipedia "Sainte-Chapelle" — visitors entering the court saw "the north flank and eastern apse ... to their left"]. Built: the Grand-Salle at x −265…−199, z −72…−44; the towers on the quay at z −104.5; the garden at the west end, x −322…−270 [inferred: positions scaled to our island].
- **Grand-Salle.** Where the king held his *lits de justice* and receptions; split into two naves by a row of pillars, each under a panelled timber barrel vault, statues of the kings on the walls and pillars [stated: techno-science "Conciergerie"] — that is the hall as Philip IV rebuilt it (finished 1313). The hall of Saint Louis's day is not described by our sources; built after the later one on the same site [inferred]: 66 × 28 m, two naves under twin slate roofs, an undercroft with small pointed windows, the hall over it lit by tall windows of two lights between buttresses, at each end two gables with a window of four lights and a rose, a cornice on a corbel table.
- **The king's gallery.** The galerie des Merciers was built under Saint Louis with the chapel to give the king direct access from his apartments to the upper chapel [stated: techno-science "Conciergerie"]; the upper chapel was reached only by the palace's upper galleries [stated: techno-science "Sainte-Chapelle"]. Built: a gallery 34 m long on an open arcade of pointed arches, running north from the upper porch's landing at the upper chapel's floor to the Grand-Salle, lit by windows of two lights between buttresses, a slate roof and a gable at the far end; the walker can enter it from the landing [inferred: its form]. The straight stair from the court to the landing (standing for the Grand Degré, which led to the gallery [stated: ibid.]) now has sloping parapets with pinnacle posts and blind arcading on its sides [inferred], in place of a plain wall.
- **Towers on the Seine.** Tour Bonbec stood on the north side of Saint Louis's palace, flanking the *salle sur l'eau*; Tour César (on Roman foundations) and Tour d'Argent (named for the royal treasure kept there) were existing towers that Philip IV reinforced [stated: techno-science "Conciergerie"]. The Tour de l'Horloge at the north-east corner is of Jean II's time (clock about 1371) [stated: ibid.] and is not shown — the round tower that stood there in our previous plan is removed. Built: round towers 10–10.6 m across, their battered feet in the river, string courses, stair slits, two-light windows with mullion and transom toward the river, a double corbel table under a crenellated parapet, conical slate roofs with a lead finial and an iron vane [inferred: details; the conical roofs as in the user's brief and the towers' surviving form].
- **The enclosure.** The palace was walled [stated: techno-science "Conciergerie"]; Philip IV's wall along the Seine (finished 1313) is later [stated: ibid.]. Built: a crenellated wall on the Barillerie side (x = −112) with a pointed gate between two small round towers, a tower at its south end [inferred: its line and form]. The long hall our previous plan put east of the chapel (x −150…−118) had no source and is removed: that side was the open court (the Cour de Mai, where a tree was planted each spring [stated: ibid.]).
- **The quay.** A revetment of ashlar from the river bed with a coping, the top paved, water stairs at three places down to landings awash, timber mooring posts with iron rings; seven boats moored along it [inferred: the river trade of §2a].
- **The king's garden.** Gardens west toward the point with an orchard [stated: techno-science "Conciergerie", for Philip IV's time; inferred for 1248]. Medieval gardens were enclosed by walls (stone for the wealthy), hedges or wattle; raised beds with paths between; herbs included roses, lilies, sage and rosemary; orchards of apples and pears [stated: Wikipedia "Medieval gardening"]; wattle hurdles edging and supporting beds [stated: the Met, "Whence Willow Wattle?" — of the modern Cloisters garden, after medieval practice]. Built: a rubble wall with a stone coping and doors east and west; 64 raised beds edged with wattle on stakes, of herbs, roses with red flowers and white lilies; a tunnel arbour of poles grown over with vine along the path from the door; a well with its windlass under a little roof; the orchard of apple trees in rows in the west part [inferred: the arbour and the well].

## 2. Layout of the settlement (radius 420 m)

| Part | Where (m, +x east, +z south) | Notes |
|---|---|---|
| Île de la Cité | x −330…330, z −95…95 | [inferred shape] |
| North arm, south arm | z −165…−105 and 105…150 | [inferred widths] |
| Palace and Sainte-Chapelle | the west end; the chapel at (−200, −10) | [stated: positions] |
| Notre-Dame and parvis | the east end | [stated] |
| Grand Pont, Petit Pont | x = 0 north, x = 110 south | [stated: arms; positions inferred] |
| Boats | along the Right Bank east of the Grand Pont (the Grève), a few on the river, two at the Left Bank | [inferred] |
| Houses | in rows on the island and both banks | [inferred] |
| Palace garden | x −322…−270, z −40…50 | [inferred] |
| Palace quay | x −326…−112, its face at z −107 | [inferred] |

## 2a. The bridges, mills and boats (built: `src/styles/gothic/town.js`, `pont`, `mill_pendant`, `boat_seine`)

- **The bridges** were lined with houses and shops and served as streets and markets [stated: Paris Zigzag]; in the mid-12th century Louis VII had the money-changers and goldsmiths work on the Grand Pont (later the Pont au Change) [stated: Wikipedia "Pont au Change"; stickymangorice]; the Petit Pont was rebuilt in stone in 1175 with the support of Bishop Maurice de Sully [stated: Wikipedia "Petit Pont"]; stone bridges stood on the Grand Pont's site until the floods of 1296 [stated: stickymangorice]. Built: both in stone, 18 m wide, on round arches (seven on the Grand Pont, five on the Petit Pont) about 6 m in span between piers 2.6 m thick with pointed cutwaters up- and downstream, a string course, the deck paved; a street 6 m wide between kerbs, and on the strips either side timber houses of three or four storeys, their fronts to the street, jettied over it [inferred: widths, arch counts].
- **Mills:** two water-mills hung on the Grand Pont's downstream face over the stream, each a boarded mill-house on cantilevered beams and struts, an undershot wheel beside it on its post [inferred: Paris's bridges carried mills hung under or beside them — the later Pont aux Meuniers was named for them; their exact place in 1248 not sourced].
- **Boats:** flat-bottomed river boats of planks with square raised ends, thwarts, a steering oar and a pole, loaded with casks, sacks or wood, moored at the Right Bank's strand east of the Grand Pont (the port of the Grève) and on the river [inferred: the river trade of the *marchands de l'eau*].

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
- [Conciergerie — techno-science.net](https://www.techno-science.net/fr/definitions/conciergerie)
- [Sainte-Chapelle — techno-science.net](https://www.techno-science.net/glossaire-definition/Sainte-Chapelle.html)
- [Sainte-Chapelle — Wikipedia (IPFS mirror)](https://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq.ipfs.4everland.io/wiki/Sainte-Chapelle.html)
- [Medieval gardening — Wikipedia (IPFS mirror)](https://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq.ipfs.4everland.io/wiki/Medieval_gardening.html)
- [Whence Willow Wattle? — The Met](https://www.metmuseum.org/articles/whence-willow-wattle)
- [Notre-Dame de Paris — Wikipedia](https://en.wikipedia.org/wiki/Notre-Dame_de_Paris)
- [Grand-Pont — Wikipedia (fr)](https://fr.wikipedia.org/wiki/Grand-Pont)
- [Petit-Pont — Wikipedia](https://en.wikipedia.org/wiki/Petit-Pont)
- [The Western Facade — notredamedeparis.fr](https://www.notredamedeparis.fr/en/?p=3428)
- [Portals — Friends of Notre-Dame de Paris](https://friendsofnotredamedeparis.org/cathedral/artifacts/portals)
- [Galerie des Rois — aroundus](https://aroundus.com/p/175212302-galerie-des-rois)
- [Notre Dame de Paris — Kiddle](https://kids.kiddle.co/Notre_Dame_de_Paris)
- [Spire of Notre-Dame de Paris — Wikiwand](https://wikiwand.com/en/articles/Spire_of_Notre-Dame_de_Paris)
- [Notre-Dame, interior — Bluffton University](https://homepages.bluffton.edu/~SULLIVANM/france/paris/notredame/notredame5.html)
- [Notre Dame, Paris, nave — Hanover College](https://history.hanover.edu/courses/art/ndnave.html)
- [The Jube of Cathedrals — notredamedeparis.fr](https://www.notredamedeparis.fr/en/?p=3445)
- [Notre-Dame de Paris : des découvertes archéologiques majeures — DRAC Île-de-France](https://www.culture.gouv.fr/fr/regions/drac-ile-de-france/Actualites/actualite-a-la-une/notre-dame-de-paris-des-decouvertes-archeologiques-majeures)
- [On a retrouvé le jubé de Notre-Dame — Aleteia](https://fr.aleteia.org/2024/11/15/j-22-on-a-retrouve-le-jube-de-notre-dame/)
- [Pont au Change — Wikipedia](https://en.wikipedia.org/wiki/Pont_au_Change)
- [History of Paris' medieval bridges — stickymangorice](https://stickymangorice.com/2023/06/05/history-of-paris-bridges/)
- [Jusqu'à quand les ponts parisiens ont-ils été habités ? — Paris Zigzag](https://www.pariszigzag.fr/insolite/histoire-insolite-paris/ponts-habitation-sparis/)
- [Histoire des ponts de Paris — cometoparis](https://www.cometoparis.com/fre/decouvrir-paris/petites-histoires/ponts-de-paris-s1066)

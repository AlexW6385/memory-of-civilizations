# Mississippian Cahokia, about 1175 — dossier

Settlement id: `cahokia` · Style: `mississippian` · Region: the Mississippi valley (the American Bottom) · Code: `src/settlements/cahokia/`
Status of this dossier: L1–L2 (second pass: the charnel house on Fox Mound, §4.1; third pass toward L3: the houses' banked walls and coursed thatch, four houses furnished, people, chunkey players and dogs, §5.1–§5.2). Built: Monks Mound in the ground itself (the main summit at 30 m, the first terrace at 12 m, a west terrace, the ramp from the plaza), with the great house on the summit and a smaller one on the first terrace; the levelled Grand Plaza with its pole; the twin mounds at the plaza's south end (Fox Mound, a platform with its building, and the conical Roundtop); six smaller platform mounds with buildings; the palisade round the central precinct with its bastions and screened gates; Woodhenge (48 red cedar posts and a centre post); ~1,300 wall-trench houses; fields, woods, Cahokia Creek; ground, planting, weather, music. Recorded for L3, later: the full count of ~120 mounds and their true places; Mound 72; the borrow pits and ponds; the mound's fourth terrace; people playing chunkey in the plaza (the yards and stones are built); the true scale (Monks Mound 291 × 236 m).

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The real example

- **Monks Mound:** the largest prehistoric earthwork in the Americas, about 30 m high with a base of 291 × 236 m. It was built in stages from about 900 to 1200 and has four terraces. A large building stood on its summit [stated: Wikipedia "Monks Mound"].
- **Grand Plaza:** a levelled plaza of about 20 ha south of Monks Mound [stated: Wikipedia "Cahokia"].
- **Palisade:** a stockade with bastions round the central precinct, built about 1175 and rebuilt three times [stated: Wikipedia "Cahokia"].
- **Woodhenge:** circles of red cedar posts west of Monks Mound, used for observing the sun [stated: Wikipedia "Woodhenge (Cahokia)"].
- **Twin Mounds:** a platform mound and a conical mound at the plaza's south end [stated: Wikipedia "Cahokia"].
- **Houses:** rectangular houses of poles set in wall trenches, plastered and thatched [stated: Wikipedia "Mississippian culture"].
- **Moment shown:** about 1175, at the city's height, with the palisade new.

## 2. Layout of the settlement (radius 420 m)

| Part | Where (m, +x east, +z south) | Notes |
|---|---|---|
| Monks Mound | x ±80, z −265 to −62 | [stated: north of the plaza; compressed — inferred] |
| Grand Plaza | x ±115, z −40 to 150 | [stated] |
| Twin mounds | z ≈ 200 | [stated] |
| Palisade | x ±160, z −300 to 252 | [stated: round the precinct; size ours] |
| Woodhenge | (−290, −40), radius 45 | [stated: west of Monks Mound] |
| Cahokia Creek | z ≈ −365 | [stated: north of the mound] |

## 3. Orientation

The precinct is laid out roughly on the cardinal directions, with Monks Mound facing south over the plaza. [stated]

## 4. The style

Earthen mounds; buildings of poles and clay under steep grass thatch; log palisade plastered with clay. [stated]

### 4.1 Detail (as built in `src/styles/mississippian/index.js`)

- **The summit building.** On a slightly raised area at the north end of the summit plateau stood a building "over 100 ft (30 m) long, the largest in the entire Cahokia Mounds urban zone"; Reed's excavation found a socket "for a post about three feet (one metre) in diameter" [stated: Wikipedia "Monks Mound"]. Built: the great house (42 × 20 m, compressed plan kept) with a timber wall plate, a hipped roof of grass thatch laid in courses whose butts stand proud, a ridge roll, carved red posts at the ridge's ends [inferred: the ornaments], a framed doorway with posts, lintel pole and clay sill on the south; the great red cedar post, 1 m thick and ~9 m high, on the summit before it [inferred: its place and height].
- **Palisade.** "Two miles in length, built using some 15,000 logs, and studded with bastions" [stated: HistoryRise]; postholes with plaster alongside, a rectangular compound with rounded bastions [stated: Archaeology, 2013]; logs set upright in a dug trench, lashed and buried at the foot, bastions regularly spaced [stated: Illinois State Museum, RiverWeb]. Built: the wall as logs daubed with clay, the logs' rounded tops standing above the daub at ~0.36 m centres; round bastions 5.2 m across standing out of the wall every ~26 m [inferred spacing], with a parapet of post tops round a fighting platform; each gate a 3 m gap screened by a stretch of wall 4 m outside it [inferred].
- **Chunkey.** The game "originated around 600 CE in the Cahokia region"; chunkey stones and a copper sheath in Mound 72; stones disc-shaped, the thrown stick about six feet long; Choctaw yards 12 × 100 feet, Muscogee yards cleared and levelled "with embankments on both sides and a pole in the center", a Mandan "clay pavement worn smooth and hard" [stated: Wikipedia "Chunkey"]; discoidals "from about three to five or more inches" across, of granitic rock [stated: Illinois State Museum]. Built: three yards on the Grand Plaza (36 × 4 m) of beaten clay with low earth banks down their sides, discoidal stones of 11–15 cm with dished faces and a pair of 1.8 m poles at one end [inferred: the yards' places on the plaza].

- **The twin mounds and the charnel house.** Each pair of twin mounds is a rectangular platform mound and a conical mound on one earthen platform; the building on the platform mound was "probably a charnel house", where the dead were kept or prepared for burial, the conical mound perhaps for burial — a mortuary complex [stated: Cahokia Mounds State Historic Site, "Twin Mounds", Google Arts & Culture]; Fox Mound (Mound 60) is a large rectangular platform about 49 × 38 m, its pairing with Round Top "matched by other paired mounds at the site" and compared to "platform charnel-house mounds and conical burial mounds" in the Southeast [stated: cahokiamounds.org, "Mound 60"]. No building on Fox Mound has been excavated, so the house follows the temple of the Natchez, the Mississippians' heirs, as Le Page du Pratz described it: about 30 feet a side; four corner posts of cypress a foot and a half thick rising ten feet; walls of mud not more than nine inches thick; a vaulted roof on a ridge not more than six feet long, with three carved birds on flat boards along the ridge, twice the size of a goose, without feet, white with red feathers, facing east; a small wall dividing it into a front part of about twenty feet, with the eternal fire, and a back part of about ten, dark, lit only through the door on the north; an altar about four feet high, six long and two broad holding a coffer of split cane; logs stacked near for the fire [stated: Le Page du Pratz, *Histoire de la Louisiane* III.2, tr. Sayre]. Built so: 9 m square, door on the north toward the plaza, the corner posts standing at the corners, the vault of thatch in courses closed under the eaves, a ceiling of cane mats inside, the birds on the ridge, the fire in its clay ring with its light, the partition with its doorway, the altar and coffer in the back part, a stack of logs by the door [inferred: the transfer from the Natchez to Cahokia; the coffer's contents are not shown].

## 5. The town

About 1,300 houses round small courtyards, inside and outside the palisade. [stated: tens of thousands of people at the peak; count ours — inferred] They are "single-family wattle and daub structures plastered by clay with thatch roofing" [stated: HistoryRise]; built with daubed walls, the thatch closed under the eaves, a doorway framed by two posts and a lintel [inferred: the frame].

### 5.1 Third pass (L3): the houses' walls and thatch, four houses furnished

- **The house type.** "The typical Mississippian house was a four-sided, partially subterranean structure with dirt banked along woven mat walls and a steeply pitched thatch roof"; poles set in a wall trench; wattle-and-daub walls, common in reconstructions, "are not known from the American Bottom"; thatch of grass bundles, cord-wrapped at one end; the type dominant by the Stirling phase (1100–1200) [stated: Illinois State Museum, RiverWeb, "Residence"]. This corrects §5's "wattle and daub": the outside faces stay drawn in clay (`mud_plaster`) for now, as the mats were banked and mud impressions on them suggest repair [stated: same], recorded here as a known difference [inferred]. Built on every house: a bank of earth (`silt`) against the foot of the walls, 0.45 m out; the hipped roofs in three courses of thatch with their butts proud (as the great houses), the gabled ones with a ridge roll [inferred: courses].
- **The furnished houses** (`miss_house` with `open`; the four lots nearest the ramp below Monks Mound, south of the first terrace): "Also situated inside the house were a number of storage pits"; "When it was present, the central hearth was the focus of much activity, particularly in the winter" [stated: Illinois State Museum, "Storage and cooking"]; jars served to store "seeds, nuts, dried fruits, and other foods" and as cooking pots; Powell Plain plates and bowls held "part of an individual's meal" [stated: Illinois State Museum, "Ceramic function"]. Built: the walls lined inside with mats (`reed_mat`); rafters of poles under the thatch; a clay hearth basin in the middle with ash, embers, a fire and its light; a storage pit in a corner with a mat over half of it; a bench of poles and cane along the back wall with a hide and a rolled robe; dark shell-tempered jars, bowls and a plate; baskets; a chert hoe on its handle; a log mortar with its pestle by the door; maize hung in bundles from the rafters; a woman kneeling at the hearth [inferred: the bench and the mortar after Southeastern practice; the arrangement]. **Concessions:** the floor is level with the ground, not dug in, because the settlement's ground cannot be cut under a house; the doorway is 0.85 × 1.95 m so that the house can be walked into [inferred].

### 5.2 Life of the plaza and the yards

- **Chunkey** (§4.1): at the head of each of the three yards two players with their six-foot poles, the crowd along both banks, some squatting [stated: the game and its pole; inferred: the players' places, the crowd].
- **People:** about forty on the plaza, some with baskets; men going up and down the ramp of Monks Mound; at each furnished house a woman inside and someone by the door; at about one house in seven outside it a figure, a cluster of jars, a stack of firewood or baskets. Men in the breechcloth, some with a mantle of skin; women in a wrap skirt with a mantle; moccasins [inferred: dress].
- **Dogs:** about thirty, on the plaza and among the houses [inferred: the dog as the one domestic animal of the Mississippians].

## 6. Ground and water

Grassed mounds, a clay plaza, fields of maize, squash and sunflower, bottomland woods along the creek. [stated: crops; inferred: planting]

## 7. Sky and climate

Hot, humid summers with thunderstorms. [inferred]

## 8. Paths

Arrival is in the plaza, looking north at the mound and its ramp; one can climb to the summit. [inferred]

## 9. Sound

Drums and rattles, cane flutes, voices at ceremonies. [inferred]

## Sources

- [Monks Mound — Wikipedia](https://en.wikipedia.org/wiki/Monks_Mound)
- [Cahokia — Wikipedia](https://en.wikipedia.org/wiki/Cahokia)
- [Woodhenge (Cahokia) — Wikipedia](https://en.wikipedia.org/wiki/Woodhenge_(Cahokia))
- [Mississippian culture — Wikipedia](https://en.wikipedia.org/wiki/Mississippian_culture)
- [Mound 38, Monks Mound — Cahokia Mounds](https://cahokiamounds.org/mound/mound-38-monks-mound/)
- [Cahokia, North America's largest pre-Columbian settlement — HistoryRise](https://historyrise.com/cahokia-north-americas-largest-pre-columbian-settlement/)
- [Cahokia palisade wall — Archaeology (2013)](https://archaeology.org/news/2013/05/30/130530-illinois-cahokia-palisade-wall/)
- [Palisade — Illinois State Museum, RiverWeb](https://www.museum.state.il.us/RiverWeb/landings/Ambot/prehistory/mississippian/technology/fac-palisade2.html)
- [Chunkey — Wikipedia](https://en.wikipedia.org/wiki/Chunkey)
- [Discoidal or chunkey stone — Illinois State Museum](https://story.illinoisstatemuseum.org/node/175)
- [Twin Mounds — Cahokia Mounds State Historic Site, Google Arts & Culture](https://artsandculture.google.com/asset/twin-mounds-cahokia-mounds-state-historic-site/YQGWC664rf49KQ)
- [Mound 60 (Fox Mound) — cahokiamounds.org](https://cahokiamounds.org/mound/mound-60/)
- [Residence — Illinois State Museum, RiverWeb](https://www.museum.state.il.us/RiverWeb/landings/Ambot/prehistory/mississippian/technology/fac-residence.html)
- [Storage and cooking — Illinois State Museum, RiverWeb](https://www.museum.state.il.us/RiverWeb/landings/Ambot/prehistory/mississippian/technology/fac-storage-cooking.html)
- [Ceramic function — Illinois State Museum, RiverWeb](https://www.museum.state.il.us/RiverWeb/landings/Ambot/prehistory/mississippian/technology/ceramic-func.html)
- [Le Page du Pratz, Histoire de la Louisiane, vol. III ch. 2 (tr. G. Sayre)](https://darkwing.uoregon.edu/~gsayre/LPDPIII,2.html)

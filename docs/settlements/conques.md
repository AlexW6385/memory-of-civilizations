# Conques (Sainte-Foy and its village), about 1120 — dossier

Settlement id: `conques` · Style: `romanesque` (with `vernacular` houses) · Region: France (the Rouergue, the gorge of the Dourdou) · Code: `src/settlements/conques/`
Replaces the legacy district of the previous design. The abbey church itself is the full building from that design (`src/buildings/sainte-foy-conques`, dossier `docs/buildings/sainte-foy-conques.md`), with its cloister.
Status of this dossier: L1–L2 (the steep south-facing hillside; the abbey church on its terrace with its retaining wall; the village of schist houses with lauze roofs on the slope; the Dourdou in its rocky bed with a stone bridge; woods and gardens; ground, planting, weather, music). L3 recorded for later: the monastic buildings round the cloister, the village gates and walls, the pilgrims' road (the Via Podiensis to Santiago), the chapel of Saint-Roch above, lanes and stairs, people and pilgrims.

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The real example

- **Landmark:** the abbey church of Sainte-Foy, built about 1050–1120, a pilgrimage church on the road to Santiago [stated: `docs/buildings/sainte-foy-conques.md` and its sources].
- **The village:** Conques stands on a steep hillside above the confluence of the Dourdou and the Ouche. Its houses are of schist and limestone with roofs of schist slabs (lauzes) [stated: Wikipedia "Conques"].
- **The bridge:** the "Roman bridge" over the Dourdou, a medieval bridge used by pilgrims [stated: Wikipedia "Conques"].
- **Moment shown:** about 1120, the church completed.

## 1b. The bridge over the Dourdou (built: `pont` in `src/styles/romanesque/index.js`)

- A semicircular-arch masonry bridge of the 14th century, five spans of 2.00, 3.80, 6.50, 10.30 and 6.60 m, its deck 2.30 m wide [stated: Structurae "Conques Bridge"]. The pilgrims to Santiago arrived in Conques by this bridge [stated: Callahan, Illinois Wesleyan].
- **Date:** the standing bridge is later than our moment (c. 1120); we build it as the type of the crossing the pilgrims used, an earlier bridge on the same site being assumed [inferred].
- **Built:** the five round arches in that order across the river, the great one over the stream; piers of 2.0–2.4 m [inferred]; the body of schist rubble with the arch rings in dressed stone standing a little proud; pointed cutwaters on both sides of each pier, capped with lauze; a paved deck humped over the great arch, 2.3 m between low parapets with a coping [inferred: the parapets and the cutwaters, after medieval bridges of the Rouergue]. Replaces the generic flat stone bridge.

## 1a. The tympanum of the Last Judgement (built: `tympanum` in `src/styles/romanesque/index.js`)

- About 6.70 m wide and 3.60 m high, a wide half-circle set in the deep arch of the west portal; first half of the 12th century, probably under Abbot Boniface (1107–25); at least 124 figures; three registers parted by bands bearing inscriptions; once brightly painted, blue dominating Paradise and red Hell [stated: tourisme-conques.fr "The tympanum"].
- **Top:** the cross with the inscription, the sun and moon, angels holding the nail and the lance, angels sounding horns at the corners [stated: christianiconography.info]. Built: the gilt cross, two angels, a gold sun and a pale moon, two angels with horns.
- **Middle:** Christ in majesty in an almond-shaped glory set with stars, one hand raised to the elect, one lowered to the damned; angels with candles at his feet [stated: tourisme-conques.fr]. On his right the procession of the elect: the Virgin, Saint Peter with the keys, the hermit Dadon, an abbot leading Charlemagne, saints; on his left four angels with a book, a censer, a lance and a sword, then the damned and their devils [stated: christianiconography.info].
- **Between the registers:** Saint Michael weighing a soul while a devil presses on the scale; the dead rising from their tombs; Sainte Foy kneeling before the hand of God [stated: both sources].
- **Lowest register:** on the left Abraham enthroned with souls in his lap among the just under the arcades of the heavenly Jerusalem, the gate of Paradise; on the right the mouth of Hell receiving the damned and Satan enthroned among the torments [stated: christianiconography.info; art-roman-conques.fr: the compartments as houses with gabled roofs, gates, walls and arcades].
- **Archivolts:** three rings, the little "curious" heads peering over the inner one [stated: tourisme-conques.fr names them; their placing inferred].
- Figures are composed as simple carved and painted masses in the manner of the sources, not copied from photographs [inferred].

## 2. Layout of the settlement (radius 360 m)

| Part | Where (m, +x east, +z south) | Notes |
|---|---|---|
| Abbey church | west front at (−20, 0), the chevet east, the cloister south | [stated: orientation] |
| Terrace | round the church | [inferred] |
| Village | on the slope above and below | [stated] |
| Dourdou and bridge | at the bottom, ≈ 235 m south and 44 m down | [stated: river; distances inferred] |

## 3. Orientation

The church faces west; the hillside faces south over the gorge. [stated]

## 4. The style

Romanesque in yellow limestone and grey schist (see the church's dossier); village houses of schist rubble or yellow stone with steep lauze roofs. [stated]

## 5. The town

About 300 houses on the slope. [inferred]

**People (built: `town.js`).** Pilgrims on the road to Santiago before the west front looking up at the tympanum, two sitting at the terrace's edge, four more coming down the lane; each standing pilgrim with his staff (bourdon) and gourd; monks of the abbey in black habits at the cloister's door and on the terrace [inferred: Conques as a stage of the Via Podiensis, docs/buildings/sainte-foy-conques.md; the pilgrims' staff and gourd as the period's attributes].

**Houses that can be entered (L3, built).** The three houses nearest the arrival are open (DESIGN §4.3): the hearth against the end wall with its pot, a table and bench, a chest, a bed of boards with straw; a step up to the door, the leaf open inside, a ceiling of boards on beams [inferred: the period's village interiors].

**House detail (vernacular `house_rouergue`).** Small windows (0.6–0.75 m) in yellow-stone frames with plank shutters, open or closed; doors under stone lintels with a step; dressed yellow quoins at the corners of the schist houses; lauze roofs with real thickness and boards under the eaves [inferred].

## 6. Ground and water

The steep slope of schist and thin soil; gardens and fruit trees near the village; oak and chestnut woods beyond (oak stands in); the rocky river. [inferred]

## 7. Sky and climate

Mild, with morning mist in the gorge and rain. [inferred]

## 8. Paths

Down the lanes to the terrace before the west front, and down to the bridge. [inferred]

## 9. Sound

As for the church (`docs/buildings/sainte-foy-conques.md` §9).

## Sources

- The church's own sources: `docs/buildings/sainte-foy-conques.md`
- [Conques — Wikipedia](https://en.wikipedia.org/wiki/Conques)
- [Conques Bridge — Structurae](https://structurae.net/en/structures/conques-bridge)
- [Conques, the medieval bridge — Callahan, Illinois Wesleyan University](https://sun.iwu.edu/~callahan/conques-pont-e.html)
- [The tympanum of the Last Judgment — Conques tourist office](https://tourisme-conques.fr/en/en-conques/the-tympanum)
- [The West Tympanum at Conques — christianiconography.info](https://www.christianiconography.info/conques/tympanum.htm)
- [The structure of the tympanum — art-roman-conques.fr](https://www.art-roman-conques.fr/english/structure.html)

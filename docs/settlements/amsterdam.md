# Amsterdam, about 1670 — dossier

Settlement id: `amsterdam` · Style: `dutch` · Region: the Low Countries (the IJ) · Code: `src/settlements/amsterdam/`
Status of this dossier: L1–L2 (the four half-ring canals round the old centre; the Dam with the Town Hall and its cupola and the Nieuwe Kerk's tower; the Westerkerk on the Prinsengracht; tall gabled canal houses — stepped, neck and bell gables — along the canals under elms; bridges; the IJ with ships; ground, planting, weather, music). L3 in part (v. north2): canal houses with period gables, cross-windows, stoops and hoist beams; the Westerkerk and Westertoren, the Nieuwe Kerk without its tower, the Town Hall's fronts and cupola; quay walls and vaulted bridges (§5.1–5.3, §6). Still for later: drawbridges, the radial canals and streets, the houses' density (ours ~190 along the rings, thinner than life), the Weigh House, the Oude Kerk, warehouses of the VOC, the Montelbaanstoren, the windmills on the bastions, boats on the canals, people.

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The real example

- **Landmark:** the Town Hall on the Dam (today the Royal Palace), built 1648–1665 to Jacob van Campen's design, classical, with a cupola [stated: Wikipedia "Royal Palace of Amsterdam"].
- **The canal ring:** the Herengracht, Keizersgracht and Prinsengracht, laid out from 1613, in half-rings round the medieval centre with the Singel [stated: Wikipedia "Canals of Amsterdam"].
- **The Westerkerk:** finished 1631, its tower about 85 m, on the Prinsengracht [stated: Wikipedia "Westerkerk"].
- **The houses:** narrow, tall, of brick, with stepped, neck and bell gables and hoisting beams [stated: Wikipedia "Canal houses" (Grachtenpand)].
- **Moment shown:** about 1670.

## 2. Layout of the settlement (radius 400 m)

| Part | Where (m, +x east, +z south) | Notes |
|---|---|---|
| IJ | the north edge | [stated] |
| Canal rings | half-rings of radius 130–295 m round a centre on the IJ's shore | [stated: plan; compressed — inferred] |
| Dam, Town Hall | inside the first ring | [stated] |
| Westerkerk | on the Prinsengracht, west | [stated] |

## 3. Orientation

The rings open to the IJ in the north. [stated]

## 4. The style

Dark brick with white stone trim; gables; tiled roofs; pale sandstone on the Town Hall; stacked towers. [stated]

## 5. The town

About 190 canal houses along the rings (the true density is higher; recorded for later). [inferred]

### 5.1 The canal house about 1670 (built in `src/styles/dutch/house.js`)

- **Gables in use in 1670:** the stepped gable (c. 1600–1655, common until about 1665), the spout gable (c. 1620–1720, mainly warehouses, with loading doors and wooden shutters, so on the outer canals), the neck gable (c. 1640–1770, first designed by Philips Vingboons, often decorated with fruit or flowers) and the bell gable (c. 1660–1790; the 17th-century ones lower than the 18th-century) [stated: Museum of the Canals, "Architecture in the canal district"]. Neck gables have a tall brick centre topped by a pediment and flanked by "clawed inserts with volutes" (claw pieces) [stated: Snail in the City, "Dutch gables, examples from Amsterdam"]. Our mix: 30% stepped, 35% neck, 25% bell, 10% spout warehouses. [inferred]
- **Hoisting beam:** historic houses in Amsterdam have a hoist beam in the gable top for lifting goods and furniture to the upper floors and the loft [stated: Snail in the City]; ours carries an iron hook over the attic's loading hatch. [inferred: hatch]
- **Windows:** the heavy cross-frame (kruiskozijn) is the window of the period; sliding sashes came in only late in the century after English models (noted by Tessin at Het Loo and Honselersdijk), together with wooden glazing bars replacing leaded glass, and Van Campen's Town Hall still used leaded glass in dark grey frames [stated: Kuyper/Fockema Andreae, *Duizend jaar bouwen in Nederland*, dbnl]. So: cross-windows, leaded upper lights, shutters on the lower lights (closed, folded open or absent), frames painted dark red-brown or dark brown [inferred: colours], sandstone sills, lintels and keystones. No sash windows.
- **The rest of the front:** a half-sunk basement with barred windows; a stone stoop with iron rails up to the door, its stone case and barred fanlight; sometimes a carved gable stone over the door; iron wall anchors at each floor; brick mostly red-brown, some brown and some yellow (IJssel brick); a chimney on the party wall; a plain brick back gable. [inferred from the house type, Wikipedia "Grachtenpand"]

### 5.2 The Westerkerk and the Nieuwe Kerk (built in `src/styles/dutch/landmarks.js`)

- **Westerkerk:** Hendrick de Keyser's design, finished 1631, in a more developed Renaissance style than his Zuiderkerk; the transept gables differ from his design [stated: archimon.nl]. A three-aisled church, rectangular, with two transepts of equal size — two Greek crosses joined — 58 m long and 29 m wide [stated: Wikipedia "Westerkerk"]. Ours: a nave 22 × 52 m behind the tower, transepts standing 3.5 m out each side, Renaissance gables in tiers with scrolls and pediments, tall round-arched windows with stone mullions, a slate roof. [inferred: the gable form and roof covering]
- **Westertoren:** 87 m, the tallest church tower in Amsterdam; Hendrick de Keyser's octagonal spire was never built as designed; topped by the Imperial Crown of Maximilian I, repainted in its original blue in 2006 [stated: Wikipedia "Westerkerk"]. Finished 1638 by Pieter de Keyser, with a square upper section where an octagonal one had been planned [stated: archimon.nl]. Brick, natural stone and leadwork, with a blue crown under the weather vane [stated: AT5, "Grote opknapbeurt voor Westertoren"]. Ours: a brick shaft with sandstone quoins and bands to 33 m, a square sandstone stage with the belfry and the clocks, a square stage and an octagon of lead-clad timber with columns, a lantern, the ogee cap and the blue-and-gilt crown with its arches, orb and vane. [inferred: the stage heights and the dials' colour]
- **Nieuwe Kerk:** burned almost entirely in 1645 and rebuilt in Gothic style [stated: Wikipedia "Nieuwe Kerk"]. A tower meant to be the tallest in the Republic was begun in 1646 and never completed [stated: Kuipers, "The foundations of the Nieuwe Kerk Tower in Amsterdam (1645–52)", UvA]. So in 1670 no tower: ours carries a lead ridge turret over the crossing [inferred], buttresses, pointed windows with tracery, a steep slate roof. (Before this version a 60 m tower stood here, which was wrong.)

### 5.3 The Town Hall (built in `src/styles/dutch/landmarks.js`)

- Bentheim sandstone throughout; 13,659 wooden piles; the cupola topped by a weather vane in the form of a cog ship [stated: Wikipedia "Royal Palace of Amsterdam"]. Corinthian pilasters in rhythm; a central block with corner pavilions; on the east and west fronts a projecting centre with a pediment — east: the Maid of Amsterdam and the bounties of the sea, with Peace, Prudence and Justice above; west: the four continents, with Atlas, Fortitude and Temperance; festoons of fruit, flowers, sea creatures and ships' instruments by Artus Quellinus; the cupola perhaps after Bramante's Tempietto [stated: Brewminate, "Architectural history of the Town Hall of Amsterdam"]. Ours: the main front to the Dam (east), two orders of pilasters with windows and mezzanines, the pavilions and the centre projecting, seven round arches at the foot of the centre [inferred: the seven provinces, from guide literature], the tympanum's relief as rounded figure masses, three statues on each pediment (Atlas with a bronze globe on the west), a round colonnade of sixteen columns round the drum, the lead dome, a lantern and the gilt cog.

## 6. Ground and water

Brick quays and streets; rows of elms on the quays; canals; the IJ. [stated: elms along canals — inferred from paintings]

The canals stand in brick quay walls with a sandstone coping, a band of grey stone at the waterline, wooden mooring posts on the quay (`quay_wall`), and the IJ's front likewise [inferred]. Amsterdam had about 200 bridges in the 17th century; they were vault bridges, high and steep, and movable drawbridges were common in the Northern Netherlands [stated: Museum of the Canals, "More about the bridges in Amsterdam"]. Ours (`canal_bridge`): three segmental brick vaults with sandstone arch rings, the deck rising 1.8 m to its crown, brick parapets with stone copings, the deck paved in brick. Drawbridges recorded for later. [inferred]

## 7. Sky and climate

Grey light, big clouds, drizzle. [inferred]

## 8. Paths

From the canals into the Dam before the Town Hall. [inferred]

## 9. Sound

Carillons and the organ; the lute and the viol; songs in the taverns. [inferred]

## Sources

- [Royal Palace of Amsterdam — Wikipedia](https://en.wikipedia.org/wiki/Royal_Palace_of_Amsterdam)
- [Canals of Amsterdam — Wikipedia](https://en.wikipedia.org/wiki/Canals_of_Amsterdam)
- [Westerkerk — Wikipedia](https://en.wikipedia.org/wiki/Westerkerk)
- [Grachtenpand (canal house) — Wikipedia (nl)](https://nl.wikipedia.org/wiki/Grachtenpand)
- [Architecture in the canal district — Museum of the Canals](https://grachten.museum/en/?p=5673)
- [More about the bridges in Amsterdam — Museum of the Canals](https://grachten.museum/en/?p=4759)
- [Dutch gables, examples from Amsterdam — Snail in the City](https://snailinthecity.blogspot.com/2015/01/dutch-gables-examples-from-amsterdam.html)
- [Duizend jaar bouwen in Nederland — dbnl](https://dbnl.org/tekst/fock001duiz01_01/fock001duiz01_01_0038.php)
- [Westerkerk — archimon.nl](https://www.archimon.nl/noordholland/amsterdamwesterkerk.html)
- [Westerkerk — Wikipedia (IPFS mirror)](https://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq.ipfs.4everland.io/wiki/Westerkerk.html)
- [Grote opknapbeurt voor Westertoren — AT5](https://www.at5.nl/artikelen/218805/grote-opknapbeurt-voor-westertoren-metselwerk-brokkelt-af)
- [Nieuwe Kerk (Amsterdam) — Wikipedia (IPFS mirror)](https://ipfs.aleph.im/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/wiki/New_Church_(Amsterdam).html)
- [The foundations of the Nieuwe Kerk Tower in Amsterdam (1645–52) — UvA](https://dare.uva.nl/id/7c9da77e-0494-47d2-920c-475574c3c713)
- [Royal Palace of Amsterdam — Wikipedia (IPFS mirror)](https://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq.ipfs.4everland.io/wiki/Dam_Palace.html)
- [Architectural history of the Town Hall of Amsterdam from 1648 — Brewminate](https://brewminate.com/architectural-history-of-the-town-hall-of-amsterdam-from-1648/)

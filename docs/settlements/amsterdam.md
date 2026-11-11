# Amsterdam, about 1670 — dossier

Settlement id: `amsterdam` · Style: `dutch` · Region: the Low Countries (the IJ) · Code: `src/settlements/amsterdam/`
Status of this dossier: L2–L3 on the Dam (v. dam: the Weigh House with its balances; the Dam paved; the Damrak and its fish market; sledges, porters, stalls and people; houses facing the square; the houses' backs, annexes and privies, §5.4–§5.7). L1–L2 (the four half-ring canals round the old centre; the Dam with the Town Hall and its cupola and the Nieuwe Kerk's tower; the Westerkerk on the Prinsengracht; tall gabled canal houses — stepped, neck and bell gables — along the canals under elms; bridges; the IJ with ships; ground, planting, weather, music). L3 in part (v. north2): canal houses with period gables, cross-windows, stoops and hoist beams; the Westerkerk and Westertoren, the Nieuwe Kerk without its tower, the Town Hall's fronts and cupola; quay walls and vaulted bridges (§5.1–5.3, §6). L3 (v. north3): furnished canal-house ground floors, gable stones, classical door cases, praams on the canals, weathering (§5.9–5.10). Still for later: drawbridges, the radial canals and streets, the houses' density (ours ~160 along the rings and round the Dam, thinner than life), the Oude Kerk, warehouses of the VOC, the Montelbaanstoren, the windmills on the bastions.

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

### 5.4 The Weigh House on the Dam (built in `src/styles/dutch/dam.js`, `waag`)

- **The building:** the Waag on the Dam was built in 1565 and stood in front of the (new) Town Hall, with the Nieuwe Kerk behind it; Louis Bonaparte had it demolished in 1808 because it spoiled his view [stated: Art in Space, "Frederik de Wit: View on the Dam Square (1655)"]. By 1617 it had become too small for the trade, and the Sint Antoniespoort on the Nieuwmarkt was turned into a second weigh house to relieve it [stated: Wikipedia (nl) "Waag (Amsterdam)"; HMdb "Anthoniespoort"]. Jan Veenhuysen engraved it as "De Waegh op de Dam" for Van Domselaer's *Beschryving van Amsterdam* (1665) [stated: Harvard Art Museums].
- **Its look about 1675:** in Ruisdael's *Dam Square* (Berlin, c. 1675) the Waag is a block-like building in cool blue-grey; bundles of goods lie under its porch roof, where they are weighed on a large balance hung in the gateway; the city's richly decorated arms catch the light; the Damrak full of boats lies to the right [stated: Staatliche Museen zu Berlin, museum-digital object 61412].
- **Ours:** 18 × 12 m, its long sides to the north and south; brick with bands (speklagen) and quoins of sandstone over a bluestone plinth; three round-arched gateways on each long side and one at each end, their voussoirs alternately stone and brick with a larger keystone, on stone imposts; a balance in each long-side gateway — the iron beam on its hook rod from the ceiling, four chains to each wooden pan, a bale or a cask on one pan and a stack of iron weights on the other — and more weights stacked inside; a flagged floor a step up, a plank ceiling on beams; a lead-covered porch roof (luifel) on timber brackets along each long side; a stone string course, cross-windows above, a cornice; a steep hipped roof of slate with two stone-fronted dormers a side, a lead ridge and finials; on the ends the arms of Amsterdam (red, a black pale with three white saltires) under the imperial crown, held by two lions, on a stone cartouche. [inferred: dimensions, number of gateways, roof covering, dormers, the brackets — composed from the type of the Dutch weigh house of the period and the views cited; the Haarlem Waag by Lieven de Key (1597) shows the type: stone, a great balance inside, goods weighed and taxed under a weighmaster — stated: Zonderzorg, "De Waag"]
- **Where:** before the Town Hall's north wing, its west face about 10 m from the Town Hall's front [inferred; the Dam is compressed].

### 5.5 The Dam: its paving, its houses, the Damrak

- **The Damrak:** the old mouth of the Amstel, the city's inland harbour, runs from the IJ to the Dam; about 1675 it was "filled with sailing boats", its far bank lined with gabled houses and storehouses [stated: museum-digital 61412; Wikipedia "Dam Square"]. Ours: 14 m wide (compressed), from the IJ to the Dam's north edge, in brick quay walls with posts and rings like the canals, its east quay lined with three houses (one a warehouse with a spout gable) fronting the water; rowboats moored at its head and along its sides. [inferred: width, the houses]
- **The paving:** "the streets in general are well paved, and the houses built of brick or stone" [stated: Encyclopaedia Britannica, 2nd ed. 1778, "Amsterdam"]. Ours: the square in grey setts in fields edged with bluestone kerbs, crossed by gutters — a bluestone channel 5 cm below the setts between two edging stones — and a band of red brick (klinkers) before the house fronts on its south side, where each house's stoop stands. [inferred from the paintings of the Dam by Berckheyde and Van der Heyden: the pattern and the stones]
- **The houses round the square:** the canal houses next to the Dam had stood with their backs to it (their fronts to the Singel); the square was closed by houses facing it [inferred from the period views, which show house fronts round the Dam]. Ours: a row along the south side (two houses west of the street to the Singel, six east of it, fronts north to the square) and one along the north side between the Town Hall's corner and the Damrak (fronts south); any ring-row house whose back would face the Dam is turned round. (Before this version the south side showed only the plain backs of the Singel houses.)

### 5.6 Life on the Dam (`fish_bench`, `sledge` in `dam.js`; the people in `town.js`)

- **The fish market:** the Dam was called the "fishermen's dam" because the fish market was there; it was open-air with room for about 120 fishmongers; fishermen moored their boats there and were obliged to sell their fish alive; river fish were sold in the centre and sea fish on the left as seen from the Damrak; it was removed only in 1841 [stated: Art in Space, "Pieter Schenk: The fish market on the Dam square (1693)"]. A large fish market arose where ships moored at the dam [stated: Wikipedia "Dam Square"]. Ours: thirteen benches in two rows at the Damrak's head — a plank table on trestles, round fish and flatfish on it, a split fish on a board, a tub of live fish in water before it, baskets beneath — with the fishwives behind them and buyers before. [inferred: the bench's form]
- **Greengrocers and burghers:** in Ruisdael's view greengrocers and fishmongers offer their wares, and strollers and elegantly dressed men and women stand in conversation [stated: museum-digital 61412]. Ours: four stalls of produce and baskets on the south of the square; burghers in black with broad hats and white collars, women in hoods and capes, in knots of two or three. [inferred: dress, after the period's portraits and genre paintings]
- **The porters:** the Amsterdam weigh-house porters (waagdragers) were organised in companies, two of them nicknamed the *klapmutsen* and the *bontehoeden* (cap-wearers and fur-hat wearers) [stated: *Woordenboek der Nederlandsche Taal*, "veem", dbnl]. Ours: porters in caps and broad hats, red or black, at the balances and among the casks, sacks and crates under the porch roof. [inferred: the colours]
- **Sledges, not carts:** Amsterdam, "seated in a marshy soil, is built on piles of wood, for which reason no coaches are allowed, except to great men and physicians, who pay a tax for that privilege; and all kinds of goods are drawn on sledges" [stated: Encyclopaedia Britannica, 2nd ed. 1778]. The sleigh-men's guild had 285 sleigh-men serving the whole city with land sleds the year round; on the cobbles they could not go fast [stated: Pierik, "Winter Water and Mobility in Early Modern Amsterdam", Environment & Society Portal]. Heavy goods such as hogsheads went "by preference on sledges", a small keg at the front dripping water under the runners and an oiled rag dragged beneath to ease the friction [stated: *Household Words* XVI, p. 449]; heavy taxes on wheeled vehicles made the sleigh the city's ordinary transport [stated: Somerset & Wood, "18th-century Amsterdam"]. Ours: three goods sledges on the Dam — two runners with upturned noses and iron shoes, a plank bed on cross-bars, stakes and rails, the shafts to the horse, the water keg at the front, a load of two casks lying or of bales — each with its horse and its carter walking beside. [inferred: dimensions] (Note: the shared life generator still scatters wheeled carts in the streets of the early-modern kit; for Amsterdam they should be sledges — recorded for later.)

### 5.7 The backs of the houses (built in `src/styles/dutch/house.js`)

- Deep narrow plots developed into merchants' houses with daylight from two sides through a courtyard, rooms at the back; houses standing back to back had daylight at the front only [stated: DASH, "From Dwelling to Dwelling", Herengracht 249, TU Delft]. Cesspits — covered pits near the house or further out in the yard — served as privies [stated: UvA, "Huisraad uit beerputten toont diversiteit van verdwenen wijk Vlooienburg" (2022)]. Back walls with cross-windows (kruisvensters) to the back room are recorded in houses of the period [stated: *Jaarboek* (dbnl), Voorstraat 97: "eiken kruisvensters van de achterkamer"].
- **Ours:** every back wall has a window a bay on each floor, in its frame, with a transom, a brick sill and a brick relieving arch, some with a shutter on the lower light; three in ten houses have cross-windows in the first-floor back rooms; a door to the yard; iron anchors; the back gable with its attic window and loading hatch, in three houses in ten boarded in tarred timber over a brick course with barge boards. About half the houses stand 3.4 m short of their plot's back with a one-storey brick annex (aanbouw) under a tiled lean-to roof on half the width, a window and a door to the lane, a brick yard wall with a stone coping across the rest, and the privy (secreet), a boarded closet with its own lean-to roof, in the yard's corner. [inferred: proportions, the share of each]


### 5.8 Inside the Town Hall (built in `src/styles/dutch/townhall.js`)

- **The Burgerzaal:** the citizens' hall runs across the building on the main floor, a marble hall under a barrel vault, galleries round it; its floor is inlaid with two maps of the hemispheres and a map of the northern sky; Atlas bearing the heavens stands at the west end, the Maid of Amsterdam enthroned over the east door [stated: Wikipedia "Royal Palace of Amsterdam"]. Ours: about 37 x 17 m [inferred: dimensions, fitted to the compressed plan], five arches each side to the galleries, pilasters and entablature, the vault with transverse ribs and round windows in its ends, the three maps 6.24 m across in marble with metal coasts, graticule and stars (the coastlines after the Blaeu maps, simplified [inferred]), relief panels over the arches as rounded figure masses [inferred: their subjects].
- **The Vierschaar:** the tribunal on the ground floor, in white marble, where death sentences were pronounced; caryatids by Artus Quellinus and reliefs of judgement (Solomon, Zaleucus, Brutus); the public watched through bronze grilles [stated: Wikipedia "Royal Palace of Amsterdam"; Paleis Amsterdam, "Vierschaar"]. Ours: seen from the vestibule through three grilled openings, not entered.
- **The vestibule and the stair:** the seven arches on the Dam open into a vestibule; narrow stairways lead up to the Burgerzaal [stated: Brewminate, "Architectural history of the Town Hall of Amsterdam"; inferred: the dimensions and the four-flight stair].
- **Date:** built 1648–1665, inaugurated 1655 [stated: Wikipedia]; the settlement's date (about 1670) shows it finished.

### 5.9 The canal house inside, its door case and its gable stone (L3, 2026-11-07; `src/styles/dutch/interior.js`, `house.js`)

- **The rooms and their things** [stated: Rembrandthuis, *Lesbrief Wonen in de Gouden Eeuw*]: the front hall (voorhuis) often had marble flags on its floor, its woodwork round the doors and the chimneypiece painted to look like marble; most houses had one room where the fire always burned, the binnenhaard; there were no separate bedrooms in the 17th century — box beds (bedsteden) stood all over the house, even in the kitchen, and in the living room (zaal) slept the master and mistress; the box beds had curtains, of costly stuff in rich houses; chairs and a table stood in the zaal, the so-called Spanish chairs upholstered in cloth or leather, sometimes fringed; a mirror was a costly luxury; walls were often hung from top to bottom with paintings, and even farmers and labourers had cheap paintings and prints; the walls of many rooms had painted tiles along their foot, which served as skirting when the floor was scrubbed; window curtains came in only in the second half of the century.
- **Ours** (the eight houses on the Dam's south side and about one canal house in eleven, `open`): the front door's two leaves stand open into the hall and the ground floor's windows are glazed but open to the light (no dark panes); the hall floored in black and white marble laid on the diagonal, the steep oak stair up the door side's party wall into the open stairwell, an oak linen cupboard (kast) on ball feet with panelled doors, pilasters and a cornice carrying a garniture of three Delft vases, two paintings over it and one either side in black frames, a wall map hung from black rods on the partition, a brass chandelier of six arms with candles; behind the partition (its oak door standing open) the zaal on broad boards: the hearth on the party wall with columned jambs of dark marble, a tiled back and an iron fireback, andirons and a fire of logs, the mantel with its pleated valance (schoorsteenkleed) and three Delft plates set up on it, the plastered hood in two stages carrying a chimneypiece painting; in the back corner the box bed — a panelled oak front with its opening, the curtains on an iron rod (one drawn half across, one pushed back), the mattress, red coverlet and bolster; the table under a Turkish carpet (maroon with a red border near its hem, a medallion and corner pieces in its field) with a pewter jug, a roemer and a Delft dish on it, a Spanish chair of leather on brass-knobbed posts at either end; a mirror and two paintings on the far wall, a painting on the partition; three rows of white tiles with blue figures along the foot of every wall where nothing stands; the whitewashed walls, the oak beams (moerbalken) from party wall to party wall under a boarded ceiling. [inferred: the plan of the two rooms, sizes, materials of the furniture, the colours]
- **Gable stones:** gable stones "serve both to identify and embellish the building", came into use in the 16th century before house numbers, are "carved and often colourfully painted", show a profession by a symbol (a ship for a sailor) and are set "usually at about 4 metres from the ground"; about 850 survive in Amsterdam [stated: Wikipedia "Gable stone"]. Ours (one house in three): a moulded sandstone frame in the first-floor pier beside the door's bay, a dark band under it for the name and year; in its painted field a ship under sail on the sea, a tree on its ground, a gilt sun with its rays or two crossed gilt keys. (Before, a plain slab over the door that overlapped the first-floor window.) [inferred: the subjects' drawing and colours; the pier as the place, the door's bay being taken by the window above it]
- **Door cases:** half the houses keep the plain stone case; the others have the classical case of the period — Tuscan pilasters on bases with capitals, an entablature whose frieze carries carved festoons, a projecting cornice and, on some, a low segmental pediment. [inferred: from the classicism of the 1660s canal houses (Vingboons, the Town Hall), not from a measured example]

### 5.10 The lighters on the canals, weathering (L3, 2026-11-07; `src/styles/dutch/boats.js`)

- Along the canal ring merchants built warehouses where they "loaded and unloaded their goods, to be taken by barge along the canal" [stated: MarineLives, "Amsterdam in the Seventeenth Century"]. Ours: seventeen praams moored along the quays of the four canals (clear of the bridges) and at the Damrak — flat-bottomed open lighters 9.5–12.5 m long of tarred planks, bluff and round at both ends with the sheer rising to them, a green-painted gunwale and a rubbing strake, short decks fore and aft, the leeboards (zwaarden) hung on the sides, the rudder and its tiller; laden with casks, bales or peat, or empty; on each the boatman on the after deck, standing or poling. [inferred: the boat's form and proportions, after the common Dutch inland craft]
- **Weathering:** the climate set damp (0.85): moss on north faces and roofs, rain streaks down the brick; soot blackening the mouths of the chimneys. [inferred]

Sources (2026-11-07):
- [Lesbrief Wonen in de Gouden Eeuw — Rembrandthuis](https://www.rembrandthuis.nl/wp-content/uploads/2016/02/Lesbrief_Wonen_in_de_Gouden_Eeuw.pdf)
- [Gable stone — Wikipedia](https://en.wikipedia.org/wiki/Gable_stone)
- [Amsterdam in the Seventeenth Century — MarineLives](https://www.marinelives.org/wiki/Amsterdam_in_the_Seventeenth_Century)

### 5.11 The VOC's warehouses and the ships on the IJ (L3, 2026-11-11; `src/styles/dutch/warehouse.js`, `boats.js` `ship`)

- **The VOC and its stores:** the Amsterdam chamber of the Dutch East India Company bought the island of Oostenburg, reclaimed from the IJ, in 1661, for its shipyard and East Indian warehouses [stated: Wikipedia, "Oostenburgervaart"]; the company's wharf and warehouse are shown in Mulder's print of 1725 [stated: World History Encyclopedia, "The VOC Wharf and Warehouse in Amsterdam"]. Amsterdam as "warehouse of the world" kept grain, spices and wares in tall brick pakhuizen with hoisting gables and loading hatches on every floor [stated: Hollandroute, "Amsterdam: pakhuis van de wereld"; Museum of the Canals on spout gables, §5.1].
- **Ours** (`voc_warehouse`, six along the IJ's quay in `VOC`, layout.js; two with the ground floor open to the visitor): 28 × 12 m, brick on a bluestone plinth, three floors (ground 4.0 m, upper 3.1 m: 10.2 m to the eaves) under a steep tiled roof, the long front to the quay [inferred: sizes from the surviving 17th–18th-century pakhuizen]. Bays about 4.3 m: on every second bay a double-leaf hatch one over another through all floors (the hoist axis), between them small barred (ground) or shuttered windows; sandstone quoins, string courses at the floors, lintels with a brick relieving course, iron wall anchors at each floor; the timber cornice; on the roof the hoist gables (hijsgevels) with the loading hatch, a projecting beam from the apex with its pulley, rope and hook [stated: hoist beams, §5.1; inferred: the beam on the roof gable]; brick gable ends with a stone coping. No chimney: a warehouse kept no fire [inferred].
- **Inside** (the two open ones): floor of planks on sleepers, ceiling of boards on joists and summer beams carried by timber posts on stone pads, casks, sacks, corded bales and iron-bound chests along the walls, a counting table with the ledger by the first door [inferred].
- **The ships:** the harbour on the IJ was full of masts; the fluyt had a pear-shaped hull seen from the bow or stern, shallow draft, square-rigged on two or three masts, the mizzen often with a lateen sail, a small crew and about twice the cargo of rival ships [stated: Wikipedia, "Fluyt"]. Ours (`ship`, ten in the IJ): a three-masted merchantman of 28–40 m, beamy, with tumblehome, a high stern with a gallery, lantern and the Prince's flag (orange-white-blue, usual in the 1660s [inferred]), a bowsprit, three masts with topmasts, yards and shrouds; one ship in three with sails set in loose bellies, the others furled on their yards [inferred, after the harbour views of the van de Veldes].

### 5.12 Density, ways and life (L3, 2026-11-11; `layout.js`, `movers.js`, `smoke.js`, `fauna.js`)

- **The blocks:** the land between two canals is 33 m wide; ours holds a quay street of 5 m on each bank and two rows of houses 10 m deep back to back (the earlier layout built only the outer bank of each ring: 163 houses, now 250 with the Dam's), with a street through at every bridge [inferred from the plan of the canal belt: Museum of the Canals, §5.1].
- **Walkers:** burghers in black with collar and broad hat, merchants in a short cloak, ladies with collars and caps, housewives and maids in brown and red with white caps, the Weigh House's porters with sacks, milk-women with a yoke of pails, sailors, servants (the dress of Ruisdael's and Berckheyde's views of the Dam, §5.6); on the Dam's open ground and along the quay streets, over the bridges. [inferred]
- **Boats:** praams poled and sculled on the IJ and the Damrak, laden with casks or covered with a canvas tilt (the canal rings keep their moored lighters: their arcs do not suit the movers' axis-aligned water graph). [inferred]
- **Smoke:** hearth smoke from two houses in five all day, peaking at the meals (the cold damp climate); mist on the canals, the IJ and the Damrak at dawn. **Animals:** carp in the canals and the harbour, swallows over the water, rooks at the Westerkerk's tower at dusk, sparrows on the Dam and the quays, a heron on the IJ's quay. [inferred]

Sources (2026-11-11):
- [Oostenburgervaart — Wikipedia](https://en.wikipedia.org/wiki/Oostenburgervaart)
- [The VOC Wharf and Warehouse in Amsterdam — World History Encyclopedia](https://www.worldhistory.org/image/18022)
- [Amsterdam: pakhuis van de wereld — Hollandroute](https://www.hollandroute.nl/?p=964)
- [Fluyt — Wikipedia](https://en.wikipedia.org/wiki/Fluyt)

### 5.13 Inside the churches (L3, 2026-11-11; `src/styles/dutch/church.js`)

- **What is documented:** the Nieuwe Kerk has a pulpit by Albert Jansz Vinckenbrinck and a transept organ by Van Hagerbeer of 1645, and is the burial place of naval heroes (de Ruyter, van Galen) and of Vondel [stated: Wikipedia "Nieuwe Kerk, Amsterdam"; de Ruyter's tomb is of 1681, after our date, so not built]. The Reformed church of the Golden Age was whitewashed, with gravestones in the floor, benches and chairs round the pulpit, brass chandeliers and funeral hatchments (rouwborden) on the columns, as in Saenredam's and De Witte's interiors [inferred from those paintings, not from a measured source].
- **Ours** (both churches, `interior: true` in plan.js; walls 0.9 m thick, a door 3 m wide in the nave's south end standing open; rooms `nieuwe-kerk*`, `westerkerk*`): whitewashed inner walls; two rows of round stone columns 9.2 m apart; an elliptic plastered barrel vault over the nave (8.5 m to the spring, 12.1 m to the crown) with the groins where the transepts cross it (a heightfield of the higher of the two vaults), flat aisle ceilings on oak beams; the floor of bluestone with about a hundred grey and black gravestones, some with a lead inlay; arched windows lit from the aisles; an octagonal oak pulpit with its stair and sounding board against the east column of the nave; arcs of benches round it; eight-armed brass chandeliers (lit); black hatchments in gilt frames on columns; the Commandments boards by the door; a poor box; the organ on a gallery at the north end with its three towers of gilt pipes [inferred: the real Nieuwe Kerk organ stood in the transept, so ours differs in place]. The space over the vault is solid.

### 5.14 Fronts, quays and shops (L3, 2026-11-11; `src/styles/dutch/dress.js`, `src/settlements/amsterdam/quay.js`)

- **Lamps:** Jan van der Heyden's street lighting scheme for Amsterdam "remained in operation from 1669 until 1840" [stated: Wikipedia "Jan van der Heyden"]; ours: a lantern on a post every 24 m along the water's edge of every quay street (the fuel is not stated; lit at night by the engine's lamp glass).
- **Shop fronts** (three houses in ten that are not open): the lower shutter folded down into the counter on two brackets, the upper propped as an awning on two poles, the wares of a baker, draper, grocer or apothecary on the counter, and a painted board on an iron bracket with a gilt device (pretzel, ell, cheese, mortar) [inferred from Vermeer's *The Little Street* and De Hooch's street scenes]. Also: damp rising in the brick at the foot, a cellar hatch (kelderluik) of two slanting leaves with iron straps in the pavement (four houses in ten), a bay tree in a tub by the stoop, a bench against the front.
- **Open houses:** one in four within 190 m of the Dam and one in nine beyond (60 of 249; before, 30), and four of the six VOC warehouses.
- **Quay life:** benches, barrels, firewood and peat stacked, sacks and crates, handcarts before the houses; neighbours in talk, a maid sweeping her step, an angler on a stool at the quay's edge, a child at play; rowing boats with a rower in the middle of the canals; on the Dam a lute-player with his listeners, a water-carrier, children, dogs, handcarts. [inferred from the street scenes of Berckheyde and van der Heyden]

### 5.15 The mills on the rampart (L3, 2026-11-11; `src/styles/dutch/mill.js`)

- As part of the 17th-century fortifications (completed around 1663) "windmills were placed on top of most of the bastions" [stated: Wikipedia "Walls of Amsterdam"]. Ours: seven smock mills (an eight-sided tarred timber tower on a brick base, a stage round it, a thatched cap, four lattice sails turned to the south-west wind) on a ring at 350 m from the origin, beyond the last canal's houses. [inferred: type, size and number]

Sources (2026-11-11, §5.13–5.15):
- [Nieuwe Kerk, Amsterdam — Wikipedia](https://en.wikipedia.org/wiki/Nieuwe_Kerk,_Amsterdam)
- [Jan van der Heyden — Wikipedia](https://en.wikipedia.org/wiki/Jan_van_der_Heyden)
- [Walls of Amsterdam — Wikipedia](https://en.wikipedia.org/wiki/Walls_of_Amsterdam)

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

- [Vierschaar — Paleis Amsterdam](https://www.paleisamsterdam.nl/en/)
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
- [Frederik de Wit: View on the Dam Square (1655) — Art in Space](https://art-in-space.blogspot.com/2017/03/frederik-de-wit-view-on-dam-square-1655.html)
- [Pieter Schenk: The fish market on the Dam square (1693) — Art in Space](https://art-in-space.blogspot.com/2021/03/pieter-schenk-fish-market-on-dam-square.html)
- [Jacob van Ruisdael, Der Damplatz zu Amsterdam (c. 1675) — Staatliche Museen zu Berlin, museum-digital](https://smb.museum-digital.de/object/61412)
- [Jan Veenhuysen, The Weigh-house on the Dam (1665) — Harvard Art Museums](https://harvardartmuseums.org/collections/object/236616)
- [Waag (Amsterdam) — Wikipedia (nl), via Wikiwand](https://www.wikiwand.com/nl/Waag_(Amsterdam))
- [Anthoniespoort — HMdb](https://www.hmdb.org/m.asp?m=105583)
- [De Waag (Haarlem) — Zonderzorg](https://anotherlifeofzonderzorg.blogspot.com/2016/11/de-waag.html)
- [Dam Square — Wikipedia (IPFS mirror)](https://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq.ipfs.4everland.io/wiki/Dam_Square.html)
- [Amsterdam — Encyclopaedia Britannica, 2nd ed. (1778)](https://jimclifford.ca/early_encyclopedia_britannica/articles/1778/eb_2nd_1778_001180.html)
- [Bob Pierik, Winter Water and Mobility in Early Modern Amsterdam — Environment & Society Portal](https://www.environmentandsociety.org/printpdf/9875)
- [Household Words XVI, p. 449](https://djo.org.uk/household-words/volume-xvi/page-449.html)
- [18th-century Amsterdam — Somerset & Wood](https://somersetandwood.com/blogs/news/18thcentury-amsterdam)
- [Veem — Woordenboek der Nederlandsche Taal, dbnl](https://www.dbnl.org/tekst/weil004nede14_01/weil004nede14_01_2464.php)
- [From Dwelling to Dwelling (Herengracht 249) — DASH, TU Delft](https://journals.open.tudelft.nl/dash/article/download/5077/4630)
- [Voorstraat 97 — Jaarboek, dbnl](https://www.dbnl.org/tekst/_jaa030199601_01/_jaa030199601_01_0031.php)
- [Huisraad uit beerputten toont diversiteit van verdwenen wijk Vlooienburg — UvA](https://www.uva.nl/shared-content/faculteiten/nl/faculteit-der-geesteswetenschappen/nieuws/2022/12/huisraad-uit-beerputten-toont-diversiteit-van-verdwenen-wijk-vlooienburg.html)

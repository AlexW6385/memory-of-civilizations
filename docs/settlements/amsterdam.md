# Amsterdam, about 1670 — dossier

Settlement id: `amsterdam` · Style: `dutch` · Region: the Low Countries (the IJ) · Code: `src/settlements/amsterdam/`
Status of this dossier: L2–L3 on the Dam (v. dam: the Weigh House with its balances; the Dam paved; the Damrak and its fish market; sledges, porters, stalls and people; houses facing the square; the houses' backs, annexes and privies, §5.4–§5.7). L1–L2 (the four half-ring canals round the old centre; the Dam with the Town Hall and its cupola and the Nieuwe Kerk's tower; the Westerkerk on the Prinsengracht; tall gabled canal houses — stepped, neck and bell gables — along the canals under elms; bridges; the IJ with ships; ground, planting, weather, music). L3 in part (v. north2): canal houses with period gables, cross-windows, stoops and hoist beams; the Westerkerk and Westertoren, the Nieuwe Kerk without its tower, the Town Hall's fronts and cupola; quay walls and vaulted bridges (§5.1–5.3, §6). L3 (v. north3): furnished canal-house ground floors, gable stones, classical door cases, praams on the canals, weathering (§5.9–5.10). Also L3 (v. 2026-11-16): kitchens, counting rooms and open stores in the houses, the Montelbaanstoren, drawbridges (§5.16–5.18). Still for later: the radial canals and streets, the houses' density (ours ~160 along the rings and round the Dam, thinner than life), the Oude Kerk.

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

### 5.16 Rooms beyond the living room: kitchens, counting rooms, stores (L3, 2026-11-16; `src/styles/dutch/rooms.js`, `interior.js`, `house.js`)

- **What is documented:** in the 17th-century house there was no strict division of rooms: box beds stood even in the kitchen [stated: Rembrandthuis, *Lesbrief Wonen in de Gouden Eeuw*, §5.9]. The inventory of a Delft household of 1676 lists, in the back kitchen, copper pots, a copper kettle, a milk pan and a pancake pan and four iron pots; and, in the inner room, an octagonal oak table, an oak chest, a small sideboard, a coat rack, chairs, paintings and a water pump in the kitchen [stated: Vermeer-info, "Copper pans, iron pots" and "In the inner kitchen"; Kalden]. Amsterdam as "warehouse of the world" kept grain and wares in brick pakhuizen with hoisting gables [stated: Hollandroute; §5.11].
- **Ours** (the back room of each open house now has one of three uses by a dice of its own, 45% living room as before, 30% kitchen, 25% counting room): the **kitchen**: a dresser with a rack of Delft plates and pewter jugs against the back wall, a sink bench of bluestone with a lead-lined basin, an iron pump and buckets in the corner by the hearth, a copper kettle on the hearth stone, a scrubbed deal table with a loaf, a copper bowl and a cabbage on two stools, copper pots hung by their handles from an iron rail on the partition. The **counting room** (kantoor): a standing desk with a sloped top and the open ledger, an iron-bound oak chest, a high stool, two shelves of ledgers over them, the table and Spanish chairs kept. [inferred: the pieces' forms and places, from the inventories above and Dutch genre painting; the counting room from the merchant house's need, not a measured example]
- **The store** (pakhuis): the houses with spout gables (the warehouses, §5.1) are now built open too (one in three, as the others): a stoop to a wide double door in the middle bay, the ground floor one room — planked floor on sleepers, boards on beams with a summer beam over the aisle, the hoist's trap and its rope with a bale hooked on, an aisle from the door to the back, on both sides stacks of grain sacks, barrels in tiers and corded bales, by the door a counting desk with its ledger, a hand balance and weights, and a hanging lantern. [inferred: layout and goods, after §5.11]
- **Open houses:** one in three beyond 190 m from the Dam (before, one in nine); the Dam's south row as before.

### 5.17 The Montelbaanstoren (L3, 2026-11-16; `src/styles/dutch/tower.js`)

- The tower was built in 1516 as part of the city's defences, and its top half was extended to its decorative form in 1606 to Hendrick de Keyser's design; 48 m high [stated: Wikipedia "Montelbaanstoren"]. Ours (`montelbaan`, on the IJ's quay at the east end, clear of the VOC warehouses): an octagonal brick body on a stone plinth, 22 m, with string courses and slit windows in stone frames on every face at three levels and a landward door; a stone gallery cornice; an octagonal wooden clock stage with a clock (gilt rim, white face, black hands) on each of the four main flats, stone corner posts; a lead-clad bell stage with louvres; an octagonal lead spire with a gilt ball and a vane. [inferred: the octagonal plan of the body, the stage heights, the clock's place — the web search gave the dates and the height only; the nl article could not be fetched]

### 5.18 Drawbridges (L3, 2026-11-16; `src/styles/dutch/canal.js`)

- About 200 bridges in the 17th century; movable drawbridges were a notable feature of the Northern Netherlands, and the Magere Brug was a wooden pedestrian bridge by 1640 [stated: Museum of the Canals, "More about the bridges in Amsterdam"]; the Magerebrug over the Amstel is "a well-known wooden lifting bridge, end of the 17th century" [stated: Hollandroute]. Ours (`canal_bridge` with `draw`; every second street over the two outer canals, the inner ones keeping their vaults): brick vaults at the sides and a timber leaf of 7 m between two brick piers, planked, with a timber balustrade; on each pier a post, over it a balance beam with a lead counterweight at its tail and a chain from its nose to the leaf's end, a cross-tie between the posts. [inferred: the gear's form and sizes; no source gave its construction]

Sources (2026-11-16, §5.16–5.18):
- [Montelbaanstoren — Wikipedia](https://en.wikipedia.org/wiki/Montelbaanstoren)
- [More about the bridges in Amsterdam — Museum of the Canals](https://grachten.museum/en/?p=4759)
- [Bridges in Amsterdam — Hollandroute](https://www.hollandroute.nl/?p=1460)
- [Copper pans, iron pots — Vermeer-info (Kalden)](https://kalden.home.xs4all.nl/vermeer-info/house/hz-koperpan-eng.htm)
- [In the inner kitchen — Vermeer-info (Kalden)](https://kalden.home.xs4all.nl/vermeer-info/house/h-binnenkeucken-eng.htm)

### 5.19 The landmark and the canal front seen close (L3, 2026-11-17; `src/styles/dutch/house.js`, `gables.js`, `reveal.js`, `canal.js`, `landmarks.js`)

- **Windows in reveals:** the cross-window (kruiskozijn) with leaded upper lights is the window of the period; Van Campen's Town Hall kept leaded glass in dark grey frames [stated: Kuyper/Fockema Andreae, §5.1]. Ours: the front of each canal house is two layers, the body behind and a front layer 0.3 m thick cut through at every window and the door, the frame and glass standing 0.2 m back, a stone sill through the reveal and a lintel bearing on the jambs; shutters are planked leaves with a batten, closed in the reveal or folded back on the wall. [inferred: depths, plank pattern]
- **Town Hall windows:** glass 0.3 m behind a proud architrave of four bars, a stone cross of mullion and transom, leaded lights in dark frames, sills, cornices, and over the upper main windows pediments alternately triangular and segmental; swags of fruit under them (Quellinus's festoons, §5.3). [inferred: proportions]
- **Gables:** neck gables with a cove of brick (flat at the shoulder, upright at the neck) edged by a broad sandstone roll ending in a volute, an urn on each shoulder ("clawed inserts with volutes" [stated: Snail in the City, §5.1]); bell gables with volutes beside the crown, urns and a finial; stepped gables with sandstone obelisks on the steps. [inferred: the carving]
- **Stoops:** moulded landing, nosed steps, sloping stone cheek walls, wrought railings (level over the landing, raking beside the steps, balusters, newels with balls, a curl at the foot). [inferred]
- **Bridges:** arch rings in dressed voussoirs, every second proud, a keystone to each vault, a string course under the parapets, stone end piers with pyramid caps and balls. [inferred]

### 5.20 The upper floors of the open canal houses (L3, 2026-11-18; `src/styles/dutch/upper.js`, `house.js`, `interior.js`, `rooms.js`, `town.js`)

Eleven houses nearest the arrival (the Dam's south row, then the Damrak and the first canal rows) are open up to the roof: merchants', an inn, craftsmen's (cooper, weaver, joiner), lodgings, a counting house and warehouses. The lot at the Town Hall's corner is left shut: its stoop lies in the 2 m gap beside the hall.

- **The stair:** from the hall (voorhuis) a steep straight flight (about 52 degrees, treads 0.23 m, no more than a metre wide) rises beside the party wall; on each floor it turns, so flight on flight in two strips, each coming up through a trap in the floor above, with a foot rail and a balustrade at the opening. [inferred: the narrow, steep Amsterdam house stair is a given of the type, §5.1; the exact slope is our choice, kept walkable: ramp colliders, STEP 0.5]
- **Floors:** each floor a collider with its holes cut; the front chamber (voorkamer) and back chamber (achterkamer) either side of a partition with a door. Ceiling heights fall with the floor (high first floor, low upper ones). [inferred]
- **By use:** sleeping rooms with box beds (bedsteden) in the wall and chests; a press (kast) with linen; the merchant's table and chairs and a painting; the counting house's desks and ledger shelves; the cooper's barrels and staves, the weaver's loom, the joiner's bench; the lodgings' several beds. [inferred from the trades listed in §5.1-5.5 and from inventories of the period; nothing in a particular house is documented]
- **Windows:** each room's windows are open reveals (cross-window with leaded upper lights, shutters to the lower lights) giving a street or canal view. [inferred, as §5.19]
- **The attic (zolder) and the loft:** the roof is lined with boards, the loft deck under the gable is reached by a ladder, goods (sacks, bales, a barrel) stand under the slopes. In the gable the hoist hatch (luik) opens under the hoist beam (hijsbalk) with its hook; goods went up outside and in through the hatch, which is why the stair is not for furniture. [inferred; the hoist beam on the gable is stated in §5.1]
- **Warehouse floors:** the spout-gable stores have loading doors at each floor and a hatch in the gable instead of a stair of rooms; sacks, bales and casks in aisles at least 1.2 m wide, a hole in each floor for the hoist.
- **No loggia:** an upper gallery or loggia is not a feature of a 1670 Amsterdam house; the nearest equivalent is the hoist hatch with its bar, and at street level the warehouses' loading doors. Nothing was invented for it.
- **Check:** `node tools/walk-check.mjs --sites amsterdam` walks 23 routes (from the street up every flight to the first-floor back chamber, then on to the attic and the loft deck), added to the plan's `walks`.

## 6. Ground and water

Brick quays and streets; rows of elms on the quays; canals; the IJ. [stated: elms along canals — inferred from paintings]

The canals stand in brick quay walls with a sandstone coping, a band of grey stone at the waterline, wooden mooring posts on the quay (`quay_wall`), and the IJ's front likewise [inferred]. Amsterdam had about 200 bridges in the 17th century; they were vault bridges, high and steep, and movable drawbridges were common in the Northern Netherlands [stated: Museum of the Canals, "More about the bridges in Amsterdam"]. Ours (`canal_bridge`): three segmental brick vaults with sandstone arch rings, the deck rising 1.8 m to its crown, brick parapets with stone copings, the deck paved in brick. Drawbridges: §5.18. [inferred]

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

## 10. Match to the reference standard (the visitor's walk, night, sound, animals, writing)

Marking: [stated] has a source named beside it; [inferred] is this dossier's reasoning from the place and date. Nothing here changes a choice made in §1–§9.

### 10.1 The visitor's walk
- [stated] Shop fronts of the 17th-century canal houses were open stall-like fronts: the lower shutters folded down into a counter, goods laid on the stoop, on ledges and under awnings, shops clustering around the Dam (Clé Lesger, *The Rise of the Amsterdam Market and Information Exchange*, 2006/2015, on retail and shop fronts). So the open ground floors on the walk carry a counter board, goods and an awning of the trade's cloth.
- [inferred] The trades chosen (baker, cheese, draper, grocer, Delft ware, tobacco) are those the dossier's §5 already names for the Dam's surroundings; their goods (loaves, cheese rounds, cloth bolts, jars and sacks, plates, tobacco rolls) are the ordinary stock of each. The keeper stands inside at the window (a wife for the food trades, a burgher for cloth and ware).
- [inferred] Which lots stand open: those whose fronts lie within 9 m of the walk (the Dam's south row, the Damrak quay, the Singel's quay street, the way to the Nieuwe Kerk), the twelve nearest the arrival; eight of them are shops, the rest lived-in houses with their halls enterable. The street's clutter keeps off the way to every open door (barrels and benches stand beside the stoop, not on it).

### 10.2 Night
- [stated] Amsterdam's street lighting: Jan van der Heyden's oil lamps from 1669 (a lamp on a post about every 125-150 ft; some 1,800 by 1670), lit from dusk by the lamplighters (Wikipedia, *Jan van der Heyden*; Rijksmuseum notes on his *Fire Engine* and lamp designs). The glow of every lamp of the quays and the Dam is a halo on the lamps' own positions.
- [inferred] Candle and rushlight behind the small panes of the houses, more on the lower floors and fewer upstairs; shops open into the early evening with a hanging lantern over the counter; a lantern at the Weigh House door. The shares of lit windows are a hash of the house and the pane, not a count of households.

### 10.3 Sound
- [stated] Carillons sounded in the town (the Town Hall's dome and the Westerkerk among them, §5 and §9 of this dossier) and struck the hours (the profile's `carillon` hours were already set).
- [inferred] Transport of goods in the old town went on sledges, not carts, and by boat (the sledges of the Dam in §5.6 of this dossier; the ordinance against carts is from memory, not re-checked). Hence `amSledge` and `amPraam`.
- [inferred] The rest is reasoning from the trades: the Weigh House's weights and chains (the building weighed goods, §5.4), the treadwheel cranes of the warehouses, caulkers' mallets at the IJ's yards, the fishwives' market at the Damrak's head, a lute on the Dam, the Nieuwe Kerk's bell before the sermons, the rattle-watch at night (the night watch in Dutch towns carried rattles: attested for the Dutch Republic generally, not confirmed for Amsterdam in 1670), the cries of milk, fish, peat, sand and old clothes. Every melody is invented; no word is sung.

### 10.4 Animals
- [inferred] Domestic ducks on the canals; pigeons and sparrows on the squares and quays (the town's carp, swallows, gulls, rooks and heron were already in fauna.js).
- [inferred] Cats before open shops (against rats in the goods), dogs at the warehouse doors (watchdogs; dogs also drew small carts in the Netherlands), pigeons on the Dam's paving. No census exists.

### 10.5 Writing
- [stated] Latin capitals, as the Dutch Republic wrote on signs, gable stones and public buildings. The letter table is Rome's verified one (`src/settlements/rome/lettering.js`: A-Z without J, U, W), read only; a text is written only if every letter is in it.
- [inferred] The board words in the spelling of the time: BROOD (bread), KAES (cheese), LAKEN (cloth), SPECERYE (spices), POTTEN (pots, for Delft ware), TABAK. The spellings are plausible for 1670 but were not checked against a dated sign.
- Not done: wear (worn treads and thresholds, the quay walls' waterline stain) and inscriptions on the Town Hall and the Weigh House.

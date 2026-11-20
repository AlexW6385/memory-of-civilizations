# Vienna, spring 1902 — dossier

Settlement id: `vienna` · Style: `viennese` (`src/styles/viennese/`) · Region: the Danube (Austria-Hungary) · Code: `src/settlements/vienna/` · Class M, radius 330 m
Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The moment and the real example

- **The moment:** 15 April – 27 June 1902, the XIV. Secession exhibition, the "Beethoven exhibition": twenty-one artists working under Josef Hoffmann's direction, Max Klinger's Beethoven statue in the middle of the main hall, Klimt's Beethoven Frieze painted straight on the walls of the left-hand aisle, the first space a visitor entered; nearly 60,000 visitors [stated: [secession.at](https://secession.at/en/beethovenfrieze)]. (Mahler conducted his arrangement of the Ninth's finale at the opening, 15 April 1902 [stated: [Mahler Foundation](https://mahlerfoundation.org/?p=1038); not re-read for this dossier].) The city is Vienna of the Lueger years, imperial capital of 2 million, the "fin-de-siècle capital of modern thought" (DESIGN §7: Freud, Mahler, Klimt, Wittgenstein).
- **The landmark (enterable): the Secession building**, Friedrichstraße 12, built 1897–98 by Joseph Maria Olbrich with Koloman Moser and Gustav Klimt contributing; financed by Karl Wittgenstein; about 40 × 30 m, 1,000 m² of floor [stated: [Wikipedia, Secession Building](https://en.wikipedia.org/wiki/Secession_Building)]. White, with a golden dome of about 2,500 gilded iron laurel leaves, 8.5 m across, the "golden cabbage" [stated: [Visiting Vienna](https://www.visitingvienna.com/footsteps/secession/)]. Above the entrance the motto "To every age its art, to every art its freedom"; under it a sculpture of three gorgons for painting, sculpture and architecture; Moser's owls on the facade [stated: Wikipedia]. A wall-mounted tree-and-laurel ornament in relief and gilt on the pylons' faces, tripod bowls on the entrance wall [inferred from photographs; not in the sources fetched].
- **The townscape** (compressed: the true distances between these places are 150–800 m; ours 80–260 m, §2): the Karlsplatz Stadtbahn pavilions of Otto Wagner, c. 1899 — apple green and white, gold sunflower ornament, a decorated entrance arch with gold patterning under the eaves, checkered floor tiles inside [stated: [Visiting Vienna](https://visitingvienna.com/footsteps/otto-wagner-pavilion)]; Café Museum, Friedrichstraße 6 / Operngasse 7, opened 1899 with Adolf Loos's plain interior, nicknamed "Café Nihilismus" by Ludwig Hevesi, Thonet bentwood chairs, the front gold lettering "Café Museum" on white [stated: [Wikipedia, Café Museum](https://en.wikipedia.org/wiki/Caf%C3%A9_Museum)]; the Naschmarkt along the Wienzeile, over the Wien river (the first pavilions over the river built in 1902) [stated: [Wikipedia, Naschmarkt](https://en.wikipedia.org/wiki/Naschmarkt)]; the Ringstrasse and its historicist blocks; the Karlskirche (1716–37, Fischer von Erlach) beyond the Karlsplatz [stated: general knowledge, DESIGN §7 does not name it; its dome about 72 m is [inferred]].

## 2. Layout (compressed; +x east, +z south, north up; the Secession's front faces north)

| Part | Where (m) | Notes |
|---|---|---|
| Secession | [-17, -40, 17, -12], court [-30, -53, 30, -40] | the landmark, front to the street at z −60 |
| Friedrichstraße / Operngasse | E–W at z −60 (14 m); N–S streets at x ±60 (12 m) | Café Museum at the corner of the north side |
| The Ring (Opernring) | E–W at z −230, 50 m wide, two rows of trees, tram tracks, Fiaker rank | the Ringstrasse is 57 m wide [stated: general knowledge, Franz Joseph's decree of 1857] |
| The Opera | [-62, -300, 52, -255] | the court opera, 1869, neo-Renaissance with loggia [stated: general knowledge] |
| The Naschmarkt | x −250 … −62, z 28 … 58 | rows of stalls along the Wienzeile |
| The Wien | channel z 62 … 78, walled, bridges | open, in Wagner's stone walls, before the vaulting; Stadtbahn on the far bank [inferred] |
| Karlsplatz and the stations | x 62 … 245, z −50 … 30; pavilions at x ≈ 95 | Wagner's two pavilions, gardens |
| Karlskirche | x ≈ 235, z ≈ −10 | dome, portico, two columns |
| Blocks | the rest | Gründerzeit tenements, a few Biedermeier houses, Wagner's Wienzeile houses |

## 3. The style (built in `src/styles/viennese/`)

- **The Mietshaus (tenement) of the Gründerzeit:** four to five storeys over a rusticated ground floor (shops and the Haustor, an arched carriage-gate into the yard), the piano nobile with window pediments, then plain floors, a heavy cornice, a mansard roof of slate with dormers; plastered in cream, ochre or pale grey, painted [stated: general knowledge]. About 22 m to the cornice [inferred].
- **Biedermeier houses:** two or three storeys, plain plaster fronts, rows of simple windows, a hipped tile roof [stated: general knowledge].
- **Wagner's Wienzeile houses (1898–99), left of the Wien:** no. 40, the Majolikahaus, its front covered with pink, green and blue faience flowers; no. 38 with gilded medallions by Moser and lion heads on the corners [stated: general knowledge; the Wikipedia page for no. 40 could not be fetched].
- **Secession ornament:** squares, laurel leaves, gold on white; owls, gorgons [stated, §1].

## 4. The Secession in 1902 (built in `src/styles/viennese/secession.js`)

- Exterior: a white cube-like mass of plain plaster walls; the entrance front with four square pylons rising above the wall (two flanking the doors, one at each corner), gilded lettering of the motto in a band, the three gorgon heads in a frieze over the door, the tripod bowls, two Moser owls; laurel-tree ornaments in gilt relief on the pylons; the dome (drum of white stucco, a lattice dome of gilded iron laurel leaves, 8.5 m across) set over the main hall; behind, low plain flanks with high windows. [inferred from photographs]
- Interior: a vestibule at the front; the main hall behind it with a glass ceiling (the old Secession hall was lit from above, its movable partitions allowed each exhibition its own plan [inferred from the building's purpose, stated by Wikipedia as a flexible exhibition hall]); in 1902: Klinger's Beethoven seated in the middle of the main hall, an enthroned figure in marble and bronze with an eagle at his side [stated: secession.at, "stood at the center of the main hall"; the figure's materials stated in general knowledge: coloured marbles, ivory, bronze, ~3 m]; the Klimt frieze in the left-hand aisle, on three walls, its panels at about 2 m above the floor, gold and blue-grey grounds with elongated figures, the Hostile Forces on the narrow wall, the Ode to Joy and the kiss on the long wall [stated: secession.at for the three walls; the frieze's content stated in general knowledge: Longing for Happiness, Hostile Forces, Ode to Joy]; an opening in the wall gave from the aisle a view of Klinger's statue [stated: secession.at].
- Ours: the interior is built to scale in the building's frame; the frieze panels are suggested by gilt and colour fields with figure silhouettes. [inferred]

## 5. The townscape (built in `src/settlements/vienna/town.js`, `src/styles/viennese/`)

- Blocks of tenements round the streets, fronts continuous, gates into the yards. Colours: cream, ochre, pale grey, rose, some brick-red (Ziegel) at the back. [inferred]
- Street furniture: gas lamps along the older streets and electric arc lamps on the Ring (Vienna's first electric street lighting from 1890s) [inferred]; kiosks (Tabaktrafik), advertising columns (Litfaßsäulen) [stated: general knowledge].
- **Café Museum** (§1) in full: a corner ground floor with its gold-lettered front, marble tables with bentwood chairs, newspaper holders on the wall, a bar, plain panelled walls, globe lamps; walkable. [stated for chairs and lettering; inferred for the rest]
- The Naschmarkt: stalls with striped awnings, boxes of vegetables and fruit, women in headscarves and aprons, carts. [stated: Wikipedia for the goods; inferred for 1902 dress]
- Trams (electric from 1897–1903), Fiakers (the two-horse carriages of Vienna, their drivers in bowler hats), a tram stands in the Ring: static ones with horses in the plan, moving ones by the engine's life.

## 6. Materials (palette names)

stucco_cream, stucco_ochre, stucco_pale, stucco_rose, plaster_white, limestone, sandstone_white, marble, gold, gilt_bronze, paint_white, slate, tile_dark, roof_tile, brick_baked, iron, steel_grey, wood_dark, wood_painted, cloth_*, paint_blue, paint_ochre, glaze_green, glaze_white, daylight, opening, cotto_floor, flagstone, granite_block, brick_paving, asphalt, terracotta, shutter_green, cloth_*.

## 7. People (movers.js, town.js)

Dress of 1902: men in frock coats and dark suits with bowler (Melone), top hat or the straw boater, high collars, moustaches; officers of the k.u.k. army in pike-grey and red; women in long skirts and high-necked blouses, large hats with feathers; students; market women (Marktfrauen) in headscarves and long aprons; Fiaker drivers; waiters ("Herr Ober") in black with white aprons; newspaper sellers. [inferred from the period's photographs]

## 8. Sound (music.js, soundscape)

Hoofbeats on the paving, tram bells, the Fiaker's call, the market's cries, church bells (Karlskirche), brass bands in the park, café talk, a piano; Mahler's world: a waltz and a Ländler in the drone. Scale: major with a lowered seventh. [inferred]

## 9. Planting and weather

Chestnuts and planes along the Ring (Rosskastanie, Platane), lindens in the squares; lawns and shrubs in the Karlsplatz gardens. Continental climate, bright spring light, thin clouds. [inferred]

## 10. What the town adds (built in `src/settlements/vienna/`)

- Streets (layout.js `paving`): granite setts for the carriageways, asphalt on the Ring (the Ring's 7 m promenades paved in flagstone and planted with plane rows), flagstone pavements at kerbs of 0.08 m; pebble paths in the Karlsplatz and the garden behind the Secession [inferred from period photographs; the paving materials are general knowledge, not checked against a source].
- Street furniture: cast-iron gas lamps on the older streets, advertising columns and newspaper kiosks at corners, slatted benches, two electric trams on the Ring's double track, four Fiakers with their pairs at the rank before the Opera and one in Friedrichstraße [stated: general knowledge for the Fiaker and the Litfaßsäule; the Ring's electric tram is 1897–1903, §5].
- The Naschmarkt: two rows of stalls under striped awnings round an aisle between the Wienzeile and the Wien's north wall, crates of vegetables and fruit on counter and ground, cross-passages every few stalls [stated: Wikipedia, Naschmarkt, §1; the awnings and goods are inferred].
- The Wien: granite walls, the Stadtbahn's ledge on the south side, seven road bridges [inferred; the river was vaulted over from 1898 to 1910 and the Stadtbahn ran along it, so 1902 is a moment when both states stood side by side; compressed here to an open channel].

## 11. The deepening pass (built in `src/settlements/vienna/`, `src/styles/viennese/`)

- Tenement houses: a share of the ground floors carry lettered fascias (a 3x5 block alphabet, instanced), shop windows with goods, flower boxes, curtains, enamel street-number plates and weathering; wide lots get oriels, corner lots turrets; roofs vary (slate, dark tile, three dormer types, chimney pots). [inferred from the Gruenderzeit house type; the lettering is stylised]
- Courtyards (Hoefe): seventeen paved yards behind the blocks with rear wings, galleries (Pawlatschen) on the rear faces, a carpet-beating frame, a washing line, a pump, bins and firewood. [stated: Viennese tenements were built round courtyards with open access galleries and a communal tap (Bassena)] Chestnut trees in the yards are shown as maples (nearest tree species in the kit).
- Durchhaeuser: one house per yard has a through passage from street to yard (carriage gate, Portier's window, letter boxes, a lit lamp, a handcart). Enterable.
- Shops (28) with furnished interiors: fourteen trades (coffee house, confectioner, baker, tobacconist, pharmacy, grocer, butcher, bookseller, hatter, wine tavern, tailor, watchmaker, shoemaker, florist). The coffee houses and confectioners have marble tables and chairs inside. [stated: the Viennese coffee house with marble tables and bentwood chairs]
- Karlskirche: enterable; round nave under the inner dome with gilt ribs, niches, pews, high altar, pulpit, chandeliers. [stated: Fischer von Erlach, built 1716-37]
- Court Opera: enterable; foyer, horseshoe hall with four tiers, stalls, painted ceiling, great chandelier, stage with curtain and flats. [stated: van der Nuell and Sicardsburg, opened 1869]
- Naschmarkt: stall frames corrected (stalls had overlapped the aisle); stalls by kind (greens, barrels, cheese, fish, flowers, meat), a drinking fountain and the Marktamt hut. [inferred]
- Street life: tram wires on the Ring, manholes, hydrants, a chestnut roaster on the Karlsplatz [stated: Maroni sellers are a Viennese winter-spring custom], cab troughs, flower beds and hedges, the Ressel monument, a Stadtbahn steam train on the Wien's ledge. [stated: Otto Wagner's Stadtbahn opened 1898]
- People: shopkeepers, coffee-house guests, stallholders, the chestnut seller, anglers on the Wien promenade, visitors in the Secession's court, the Opera's audience and dancers (plan `vienna-life`, style `life`); movers also cross the yards. Smoke from the roaster and the Stadtbahn engine; sparrows in the yards.
- Not built: tenement upper floors (flats), worshippers in the Karlskirche, the Fiakers' drivers, the Stadtbahn pavilions' furnishing beyond what exists, a moving train.

## Round 5 check: what can be entered near the arrival

Measured from `layout.js` (arrival 0, -66): 28 of the 499 lots within 120 m are open, furnished shops and Kaffeehäuser (each with its room, lamp and goods; `life.js` puts a shopkeeper behind the counter and guests at the tables); of the 66 lots within 100 m the fronts differ in kind (Gründerzeit, Ring house, Biedermeier), storeys (2 to 6), tint, sgraffito/pilasters/oriel/faience/medallions, shop front and Durchhaus (44 distinct combinations). Nothing added. Fixed: the women of `life.js` were set 0.93 m tall (a scale mistaken for a height); now 1.55 m.

## 12. Detail pass (L2 toward L3)

Sources used: [Wikipedia, Beethoven (sculpture)](https://en.wikipedia.org/wiki/Beethoven_(sculpture)) [stated: black marble plinth; Beethoven seated on a throne, bare-chested, hunched, ghost-like; an eagle in front of him]; [secession.at, building](https://secession.at/building) and the frieze page of §1 (search results only, pages not re-read). Everything else below is [inferred] from period photographs and from the Viennese trades, as in the earlier sections.
- Klinger's Beethoven rebuilt (secession.js): black marble plinth in two steps with a gilt edge, a base and seat of coloured marble with bronze caps and gilt inlay, bronze cheeks carrying ivory angel heads, a tall bronze back with marble inlay panels and gilt bands; the figure bare to the waist (ivory), chest leaning forward, bowed head with hair, arms to clenched fists on the knees, bronze drapery with folds over the knees, feet on the base, the eagle on the plinth's step at his side. Throne materials and the angel heads are general knowledge of the work, not in the fetched page [inferred].
- The Secession's front: the recessed wall panels between the pylons carry a gilt frame, a gilt laurel tree on a mound and a course of small gilt squares under the cornice [inferred from photographs].
- Klimt frieze: gilt spirals above the long walls (replacing the squares where they stand), four floating women with streaming hair on the Longing for Happiness wall [stated: the frieze's content, §4; the forms are stylised].
- Three more trades for the shops: barber (friseur: two leather chairs before a long mirror, basins and bottles, a waiting bench), dairy (Milchmeierei: milk cans, marble counter, jars, butter and cheese, the scale), joiner (Tischler: planks on the wall, bench with vices, tools, a chair in the making, sawhorses, a cask, shavings). [inferred]
- More shops enterable: the open lots now reach 245 m from the arrival and number 52 (were 28 within 175 m); the fronts stay by rule (kind, storeys, tint, trade sign and awning), the trade by order; no second figure in the three new trades' rooms.
- Level: L2, with L3 parts in the Secession's hall. Missing for L3: tenement upper floors (flats), worshippers in the Karlskirche, wear on the Secession's stone, the Stadtbahn pavilions' furnishing, Fiaker drivers.

## 13. Landmark pass (round 2): the Secession seen first and close

All [inferred] from period photographs of the building and general knowledge of its parts; no new source pages were fetched.
- The motto is now real lettering: two lines of gilded capitals in a 5 x 7 raster (DER ZEIT IHRE KUNST / DER KUNST IHRE FREIHEIT), reading correctly from the street (the header's frame had been mirrored), clear of the gorgon medallions below it.
- Pylons: a base course, a stepped cornice over a row of dentils, a raised stucco frame round the laurel field on the outer pylons.
- Portal: a stepped architrave, panelled doors with gilt handles, a transom glazed in bars.
- Flanks: cornice and string course, a stucco frame (jambs, sill, lintel) and glazing bars round every clerestory window; the first window moved clear of the pylon.
- Dome: seventeen rings of laurel leaves (were eleven); the square drum has a base course, a second cornice step and on each face a framed wreath of gilt laurel round a disc (the wreath is our reading of the drum's ornament).
- Moser's owls: body, broad head with ear tufts, round gilt eyes, beak, folded-wing lines, breast feathers, toes.

## 14. Upstairs (round 6): the opened houses

Sixteen of the shops near the arrival (the open lots within 125 m wide enough for a hall beside the shop; `layout.js` `up`, built in `styles/viennese/upper.js` and `upfurn.js`) can be climbed. Marks as before: [stated] by a source, [inferred] from the building type and period interiors; no new pages were fetched this round, so everything here is [inferred] from the Gründerzeit Zinshaus as the dossier describes it (§3, §11: Haustor, courtyard, Pawlatschen, Bassena).
- **The way up:** the Haustor beside the shop front (a stone-framed gate, one leaf thrown back) opens into the Hausflur: granite flags, a painted dado, letter boxes, a bracket lamp. At its end the stair rises round a narrow well — two flights to a half landing under a tall window at the back, two more to the next floor — of granite treads with limestone nosings, an iron balustrade (square bars) on the well side and a wooden handrail; the floors have a hole over the well and a stone landing in front of it [inferred: the Viennese "zweiläufige Treppe um ein Treppenauge"].
- **First floor, by the house's use:** the bourgeois flat (anteroom with coat rail and bench; salon with tiled stove, sofa, piano, round table and chairs, chandelier, pictures, a balcony reached through the window-door; dining room with table, chairs and sideboard; bedroom with two beds, wardrobe and washstand) for the baker, tobacconist, chemist, grocer, butcher, florist, dairy; above the coffee house and the confectioner the billiard and card room (billiard tables under long shades, marble tables with bentwood chairs, a wall bench, newspaper holders, a mirror) with the pantry behind it; above the craftsman's shop (tailor, hatter, joiner, watchmaker, cobbler, barber, bookseller) his workroom on the street (benches, shelves of stock, a dummy) with the family's Wohnküche and a bedchamber behind; above the wine tavern a corridor with three rented rooms (bed, washstand, wardrobe, a table).
- **Second floor:** a worker's Zimmer-Küche flat [stated: the type, §11]: the kitchen at the stair door (iron range with its pipe, dresser, table, pans on the wall), the room to the street with two beds, a cradle, the stove, a crucifix, a Kabinett for a lodger, a back room of firewood and tubs. The **Bassena** (cast-iron basin with a brass tap on a bracket, a pail under it) hangs on the landing wall [stated: communal tap on the Gang, §11]. Where the yard side has its Pawlatschen the back room opens on the gallery, which is walkable.
- **Windows:** the windows of the first two floors have no glass; the casings, sills and curtains show inside and the street shows through (the Secession's motto from a salon). The corner of the first floor has a balcony whose window is a door.
- **Still shut:** the third floor and above (solid), the mansard and its attic, the Durchhäuser's stairs (the passage houses are lod 1 and wider than the plan above allows), the Ring houses and the Biedermeier houses.

## 15. Toward the reference: night, sound, animals, wear, the walk (round 7; `night.js`, `soundmap.js`, `voices-vienna.js`, `fauna.js`, `wear.js`)

Marks: **[stated]** a source says it, with the page; **[inferred]** our reasoning from the place and date; **[placed]** our own choice of where. What a page was fetched for is named; pages the shell or the tool refused are listed as not read. The date stays 15 April – 27 June 1902.

### 15.1 Light at night (what lit Vienna in 1902)
- Street lamps: gas, and increasingly the Auer incandescent mantle. [stated: Wien Geschichte Wiki, "Öffentliche Beleuchtung" (https://www.geschichtewiki.wien.gv.at/Gasbeleuchtung): Auer's gas incandescent light was first used in public street lighting in 1893, on the Herrengasse and the road to the new Rathaus; the municipal Simmering gas works opened on 31 October 1899.] [inferred] by 1902 the lantern on a cast-iron post gave a steady white-yellow light, not the flicker of an open flame; ours is the engine's one warm halo, a little too orange.
- Electric arc lamps on the Ring. [stated: same page: in 1902, with the electrification of the trams, a "Lichtwerk" was set up and "the first electric arc lamps were installed on the Ringstraße, alongside existing gas lighting"; a trial of arc lamps on the Kohlmarkt in 1893.] So the Opernring's lamps (`layout`/`town.js` furniture, `gaslamp` at the Ring's kerbs) get a larger, higher halo than the gas lamps of the side streets. [placed: the arc lamps on the Ring's promenade posts, the gas lamps elsewhere.]
- Shop windows lit from within. [inferred] gas jets and opal globes lit the shop windows of a Gründerzeit street into the evening (the town's own shopRoom hangs opal globes, `shopint.js`); a pool of light lies on the pavement before each open shop and the pane of the window glows. The Kaffeehäuser stayed open late. [stated: general knowledge, Viennese coffee houses open into the night; no page read.]
- Windows of the flats. [inferred] a share of the upper windows of the tenements show a lit room (gas or paraffin lamp behind the curtain), by hash of the window's place: 38 % on the first two floors, 28 % above; the Biedermeier houses 30 %. Not lit: the mansard dormers (service rooms).
- Café Museum, the Secession and the Opera. [inferred] The café's windows are strongly lit (the Kaffeehaus at night is its picture); the Secession's court has two lamps and its clerestory is dark (the exhibition closed at dusk); the Opera's foyer windows are lit in the evening (performances began at seven). [stated: the Café Museum's lamps of the 2010 renovation are the restoration of its original globes (Wikipedia, Café Museum): the globe lamp is [inferred] for 1902.]
- Not drawn: the lamplighter's round (Vienna lit its gas lamps by a lamplighter with a pole until remote ignition; no page read), tram headlamps, the Stadtbahn's lamps.

### 15.2 Sound of the place (what Vienna sounded like)
No recording of Vienna in 1902 exists as we can use it; everything below is [inferred] from the trades, the town's own data and general knowledge, except where marked. The sounds are synthesised (voices-vienna.js, `vie…`). [stated: tram electrification: horse trams were replaced by electric trams, "the electric" (habsburger.net, "Let there be light": https://www.habsburger.net/en/chapter/let-there-be-light-gas-and-electricity-light-vienna).]
- The electric tram on the Ring's double track: motor whine, joints clacking, the trolley's hiss, the driver's foot gong. [placed: on the Ring's two tracks, z = −233 and −227.]
- The Fiaker: two horses at a trot on granite setts, harness bells; rubber-tyred carriages hush the wheel (the "Gummiradler") [inferred; the Wien Geschichte Wiki page on the Fiaker was refused by the tool and not read]. The Fiaker rank before the Opera and in Friedrichstraße.
- The Stadtbahn on its ledge along the Wien: a steam train passing, the chuff, the rolling stock, a whistle. [stated: Wagner's Stadtbahn opened 1898 (dossier §11); steam operation until the electrification in the 1920s is general knowledge, [inferred] here.] [placed: along the ledge (`LEDGE`), 78–90 m south.]
- The Werkelmann, the barrel-organ man of the courtyards, a waltz or a Wienerlied played in the Hof, heard through the Durchhaus. [inferred: the figure is a known Viennese type; the Wien Geschichte Wiki page "Werkelmann" was refused and not read.] [placed: two of the nearest yards.]
- Carpet beating (Teppichklopfen) at the frame of the Hof (the frame exists in `hof.js`), in the morning, and the Bassena's pump. [inferred; the town's yard has the frame and the pump.]
- The Maroni seller's call and the brazier's crackle on the Karlsplatz (the roaster is built; April is the end of the Maroni season). [stated: dossier §11.]
- The Naschmarkt: the Marktfrauen's calls (wordless, a falling contour), crates set down, the scale's clink, coins. [inferred; Wikipedia on the Naschmarkt gives the goods.] The market's drinking fountain: water falling into a basin.
- Church bells: the Angelus from the Karlskirche at 6, 12 and 18 [inferred: the Catholic custom, the same as the engine's 'angelus' hours].
- The coffee houses: the murmur, cups on saucers, the glass of water set down with the coffee, spoons, newspapers on their holders turned, billiard balls (Café Museum and the coffee house at its lot; [stated: Viennese coffee houses had billiard tables and chess: habsburger.net, "Viennese coffee house": https://habsburger.net/en/chapter/viennese-coffee-house]), a piano in the evening; the Heuriger's Schrammelmusik (violins, a guitar, an accordion) in the Weinstube by evening. [inferred]
- The shops at work, each its trade's sound (the baker's oven door and trays, the Tabak's till, the chemist's pestle, the grocer's scale, the butcher's cleaver, the hatter's brush, the tailor's treadle sewing machine and shears, the watchmaker's clocks, the cobbler's hammer, the barber's strop, the dairy's cans, the joiner's plane, the florist's pail).
- The Opera: tuning (the oboe's A, then the strings) before seven, a soprano warming up by day. [inferred: the Hofoper under Mahler; the pitch about 435 Hz of the "diapason normal" is general knowledge, [inferred] here.] The Secession: visitors' steps and a murmur in the hall and aisle (nearly 60,000 visitors in the run, §1).
- The Haustor locked at ten: the Hausmeister's key and bolt at the Durchhaus gates. [inferred: general knowledge of the Viennese custom of the locked house door and its fee, the "Sperrsechserl"; no page read.]
- Newspaper boys' cries, morning and evening; the Sicherheitswache's measured steps at night (Vienna's police, in uniform, walked beats). [inferred]
- Rooms: the coffee house (open to the street, murmurous), the shops (small, dry), the Secession's hall and the Karlskirche (stone, long), the Opera, the passage of a Durchhaus (a hard echo), the stairs and flats upstairs (rain loud under the slate).

### 15.3 Animals
- Pigeons on the Karlsplatz, the Ring and the Secession's court; in the cities of the Habsburg lands the feeding of pigeons by old women and children in the parks is general knowledge [inferred]. [placed: ground flocks of three or four at the benches, the Naschmarkt's aisle (where the stalls spill grain and crusts) and the court.]
- The coffee house's cat; the Hausmeister's dog in the Durchhaus; the house cat of a Hof. [inferred: the creatures of a Viennese house]
- A canary in its cage at a flat's Pawlatsche or window (the canary was a common Viennese household bird, [inferred]).
- Horses: the Fiaker pairs (already placed, `animal`) stay; no critter model of a horse is added.
- Sparrows in the yards, swallows and swifts, crows round the Opera and the Karlskirche and the heron on the Wien are already in `fauna.js`.
- Not done: ducks on the Wien (the river of 1902 was foul and half vaulted; none claimed), hens (not kept in the inner city), swans.

### 15.4 Wear and writing
- Wear at doors and steps. [inferred] The granite thresholds of the Haustor and the shop doors are dished by feet; the worn middle of each limestone sill; kerbs rounded; the iron foot-scrapers by doors; the Prellsteine (guard stones, already drawn) polished on the street side by cart hubs. The soot of gas lamps blackens the wall above a shop's lamp and the underside of its awning. Damp stains at the foot of the north-facing and yard walls; the lower metre of the street front darker (the layer of street dirt); dust on cills.
- Writing. The Latin alphabet is correct in German: shop names (KAFFEEHAUS, BÄCKEREI, KONDITOREI, APOTHEKE, TABAK …) were already lettered by `lettering.js`; its glyphs for umlauts and Ä, Ö, Ü are checked below. New: the street-name plates (blue-white enamel, "Friedrichstraße", "Operngasse", "Getreidemarkt" … in white capitals on blue, with the district number, I. Bezirk), the tram stop plates (Haltestelle), the enamel advertising plates already in `detail.js`, and the Café Museum's front lettering "Café Museum" in gold. [stated: the Café Museum's front: gold lettering on white (Wikipedia, Café Museum).] [stated: the Secession's motto, already built, §13.] [inferred: the Viennese street-name plate is a white-on-blue enamel rectangle with the district number; no page read.]

### 15.5 What was built (round 7 result)
- Walk [inferred]: 20 new walk-check routes through the doors of opened shops (`shopWalks` in `upwalks.js`), added to the 16 stair routes; one butcher's pavement and the Weinstube aisles (a table stands in it) are not routed. Not done: new opened shops (52 existed), coachmen on the Fiaker box seats, street-name plates.
- Night: one non-tiled plan `vienna-night` of `halo` (about 47k triangles): gas lamps with pool, lit shop fronts, lit flats by hash of position, Café Museum, tram windows, passage lamps. Single warm colour only (engine); no cooler arc light, no lamplighter, no Opera or Secession window light.
- Sound: 33 `vie…` voices (`voices-vienna.js`), the placed map (`soundmap.js`) with the Angelus from the Karlskirche, trams, Fiaker, Maroni, market, Werkelmann, yards, cafés, Opera, Secession hall; test `tests/vienna-sound.test.mjs`. Not heard (cannot listen). The geschichtewiki pages on Werkelmann and Fiaker were refused by the fetch tool and not read: those voices are [inferred].
- Animals: critters (pigeons, dogs in passages, cats on yard benches, canaries on balconies); test `tests/vienna-critters.test.mjs`. Not seen moving.
- Wear and writing: worn steps, damp at yard walls, tram-stop plates (HALTESTELLE), Café Museum lettering (CAFÉ MUSEUM); Latin only.
- Numbers at the arrival: main draws 409 to 410, main triangles 1.86 M to 1.91 M; walk positions main 301 / 421 draws, 1.48 / 1.94 M triangles; geo-one 44 MB, 1688 meshes.

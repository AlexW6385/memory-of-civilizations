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

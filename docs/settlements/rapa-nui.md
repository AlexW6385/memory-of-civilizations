# Rapa Nui (Ahu Tongariki and Rano Raraku), about 1500 — dossier

Settlement id: `rapa-nui` · Style: `rapanui` · Region: Polynesia (Rapa Nui, the south-east coast) · Code: `src/settlements/rapa-nui/`
Status of this dossier: L2, parts toward L3 (Ahu Tongariki with fifteen moai facing inland, some with pukao, its ramp and plaza; Rano Raraku's cone, crater lake and quarry with moai standing buried to the shoulders and moai half-cut in the rock; a village of hare paenga with paved forecourts, hare moa and manavai; the rocky shore and the sea; ground, planting, weather, music). Since raised: the moai sculpted in full (face, ears, hands, hami, ring-and-girdle), the ahu's fitted slabs, ramp and wings, quarry bays with half-cut statues, hare paenga with curb, porch, poro pavement and umu (§4a). L3 recorded for later: the coral-and-obsidian eyes, the transport roads, Orongo and the birdman cult, rongorongo, tattoo, the canoes, people.

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The real example

- **Landmark:** Ahu Tongariki, the largest ahu on the island: about 100 m long, with fifteen moai (re-erected in the 1990s), facing inland with the sea behind; the heaviest weighs about 86 t; one pukao has been replaced [stated: Wikipedia "Tongariki"; Britannica "Easter Island"].
- **Rano Raraku:** the volcanic crater about 1 km inland from Tongariki, the quarry of nearly all moai. Its slopes hold hundreds of moai, many buried to the shoulders, and others left unfinished in the rock; there is a reed-filled lake in the crater [stated: Wikipedia "Rano Raraku"].
- **The moai:** monolithic figures of Rano Raraku tuff, with heavy brows, long noses and ears, and hands on the belly. Some wore red scoria topknots (pukao) quarried at Puna Pau [stated: Wikipedia "Moai"].
- **Houses:** the hare paenga, boat-shaped houses on curbs of dressed basalt with a paved forecourt [stated: Wikipedia "Hare paenga"]; the hare moa, stone chicken houses, and the manavai, stone-walled garden enclosures [stated: Britannica].
- **Moment shown:** about 1500, with the statues standing (some with pukao).

## 2. Layout of the settlement (radius 320 m)

| Part | Where (m, +x east, +z south) | Notes |
|---|---|---|
| Ahu Tongariki | the coast, 100 m long east–west, facing north (inland) | [stated: length and facing] |
| Plaza | before the ahu | [inferred] |
| Rano Raraku | to the north-west, brought to ≈ 200 m (it is ≈ 1 km) | [stated: 1 km; compressed — inferred] |
| Village | on the plain between | [inferred] |
| Sea | south of the shore and round the disc's edge (the island ends there) | [inferred] |

## 3. Orientation

The ahu faces inland, its back to the sea. [stated]

## 4. The style

Moai of yellow-brown tuff; ahu of fitted basalt with a paved ramp of rounded stones; red scoria pukao; thatched boat-shaped houses on basalt curbs. [stated]

## 4a. Detail of the moai, the ahu, the quarry and the houses

**The moai** (`moaiGeometry`, src/styles/rapanui/index.js):
- Head about three-eighths of the whole statue [stated: Wikipedia "Moai": "overly large heads, which account for three-eighths of the size of the whole statue"]; we put the jaw at 0.6 of the height [inferred].
- Heavy brows, long nose with a fish-hook-shaped curl of the nostrils; lips protruding in a thin pout; long oblong ears; big chin; jaw lines standing out against the truncated neck; deep eye slits [stated: Wikipedia "Moai"].
- Heavy torso, collarbones faintly outlined; arms in low relief; hands with long slender fingers resting along the hips, thumbs sometimes toward the navel, meeting at the hami (loincloth) [stated: Wikipedia "Moai"]. Nipples and the navel are carved [inferred from photographs of standing moai].
- Backs generally plain, some with the ring-and-girdle motif on the lower back [stated: Wikipedia "Moai"]; we give it to the ahu statues [inferred].
- Eye sockets were made to hold coral eyes with obsidian or red scoria pupils [stated: Wikipedia "Moai"]. Statues in the quarry are shown without sockets, as they stand on Rano Raraku today [inferred]; inserted eyes are left out (not shown as a standing state around 1500) [inferred].
- Pukao: cylindrical, with a dent on the underside to fit the head and a boss or knot on top, ring-like grooves along the bottom edge; set so that the pukao protrudes forward; 1.8–3 m across [stated: Wikipedia "Pukao"]. Ours: 0.26 of the statue's height across (≈ 1.9 m on a 7.4 m statue), pushed 0.02 h forward [inferred].
- Average moai about 4 m tall and 1.6 m wide at the base [stated: Wikipedia "Moai"]; Tongariki's are taller and squatter (86 t) [stated]. Ours are 0.37 of their height wide [inferred].

**The ahu** (`ahu`): seaward wall of large dressed basalt slabs (1.4–3 m wide, 1.5–2.3 m tall) with smaller blocks coursed above; inland face of smaller squared blocks; top paved in flags; the ramp sloping from 0.42 of the platform's height to the plaza, paved with water-worn boulders (poro) and kerbed with set stones; low rubble wings at both ends [inferred from photographs of Tongariki and other ahu; the poro as paving material is stated for house forecourts by The Past, below].

**The quarry** (`quarry_bay`, `BAYS` in layout.js): almost all moai were carved at Rano Raraku; about 400 statues remain, half unfinished; carvers cut trenches along the sides to detach a statue, and in the last stage a keel of stone along the back was removed; finished statues were slid down to the soil of the lower slopes, set in pits and now stand buried halfway or more [stated: easterisland.travel "Rano Raraku"]. Ours: eight niches cut into the outer south-east face, each statue on its back, head up the slope, keel under its back, a 0.55 m trench each side, rock standing round it, basalt picks (toki) in the trenches [inferred]; 22 finished statues stand buried to the shoulders lower down, leaning a little [stated: buried; inferred: lean].

**Hare paenga** (`hare_paenga`): shaped black basalt blocks (paenga) set end to end form a boat-shaped foundation; holes in their tops held poles about 2 m long, pulled together and lashed to a ridge pole into a keel-like roof; a semicircle of water-worn stones (poro) before the entrance [stated: The Past]. Typical houses 12–16 m long, low, with an entrance so low people crawled; thatch of totora reeds, sugar-cane leaves or grass; earth ovens (umu pae) beside them [stated: easterisland.travel "Hare Paenga"]. Ours: 10–17 m long, 1.9–2.4 m wide, 2.2–2.7 m high; the door in a short thatched porch on the long side; a ring of stones set on edge for the umu [inferred: sizes, porch].

**Hare moa and manavai:** rubble cairns with small openings at their foot and slab caps; round walls of dry-laid boulders round sunken gardens [inferred from the Britannica description and photographs].

## 5. The town

About forty hare paenga, chicken houses and garden walls scattered on the plain. [inferred]

## 6. Ground and water

Grass over red-brown soil; bare tuff on the cone; reeds in the crater lake; a dark rocky shore. The island was nearly treeless by then [stated: Wikipedia "Easter Island"]. Bananas and sugar cane grew in the manavai; bamboo stands in for them. [inferred]

## 7. Sky and climate

Trade-wind cloud, sunshine, passing squalls. [inferred]

## 8. Paths

From the plain to the plaza, facing the moai with the sea behind them. [inferred]

## 9. Sound

Chant (riu) with hand-clapping and a stamping stone; voices and a drone stand in, under the wind and the surf. [inferred]

## Sources

- [Tongariki — Wikipedia](https://en.wikipedia.org/wiki/Tongariki)
- [Rano Raraku — Wikipedia](https://en.wikipedia.org/wiki/Rano_Raraku)
- [Moai — Wikipedia](https://en.wikipedia.org/wiki/Moai)
- [Hare paenga — Wikipedia](https://en.wikipedia.org/wiki/Hare_paenga)
- [Easter Island — Wikipedia](https://en.wikipedia.org/wiki/Easter_Island)
- [Easter Island — Britannica](https://www.britannica.com/place/Easter-Island)
- [Pukao — Wikipedia](https://en.wikipedia.org/wiki/Pukao)
- [Hare paenga: the canoe-shaped houses and monumental archaeology of Rapa Nui — The Past](https://the-past.com/feature/hare-paenga-the-canoe-shaped-houses-and-monumental-archaeology-of-rapa-nui-easter-island)
- [Hare Paenga in Rapa Nui — easterisland.travel](https://www.easterisland.travel/blog/?p=521)
- [Rano Raraku, the quarry — easterisland.travel](https://www.easterisland.travel/places-to-visit/rano-raraku)

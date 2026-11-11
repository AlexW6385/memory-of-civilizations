# Batches: every settlement to the Suzhou standard

The plan for bringing all 94 settlements of DESIGN §7 to Ming Suzhou's standard (`docs/suzhou-method.md`): what is done first, which settlements go in which batch, and how many agents each gets. Decided by the coordinator at the author's request and approved by the author (2026-11-10). The coordinator keeps this file current: when a batch is done, mark it done in the table header line and move any settlement that failed the survey into the next batch's fix-up slots. No logs here.

## Order of the whole

1. **Phase 0 — engine** (coordinator, Opus). Items 2–4 run alongside B1: B1's settlements supply their own living-system data in Suzhou's format, so they do not wait for the defaults.
2. **B1 — the pilot** (China, closest to Suzhou). After it, stop: survey in the author's Chrome, fix the method and the slot sizes, then go on.
3. **B2–B9 — the 55 other built settlements**, in priority order.
4. **B10–B16 — the 38 L0 settlements**, built from nothing to the standard. Their dossiers are written earlier, in the background (below), so that a batch of new settlements starts from finished research.

Priority, used to order the batches: (a) how much the settlement carries the whole — fame, a ●●● density, a large class; (b) closeness to what is already proven (the pilot reuses Suzhou's Chinese vocabulary); (c) one style family per batch, so a shared style is rebuilt once, by one agent, for all who use it; (d) the region stands together on the planet and is surveyed together.

## Phase 0 — engine

Done in order; each is one push.

1. **Enlarge the planet** to about 12 km (`PLANET_RADIUS`, `src/planet/sites.js`); every site's radius set to its class (DESIGN §4.5); `tools/planet-layout.mjs` re-run, `docs/world.md` updated; arrival views checked; impostors and light bakes redone. First, because every radius and position after it depends on it. *Done (v10.54): 12 km, every settlement placed with its class's room, the 38 planned ones included.*
2. **Living systems by default.** Today walkers, boats, birds, fish, smoke and shops exist only for Suzhou, from its own data files, and `systems-list.js` imports Suzhou's smoke by name. Make each system run on any settlement from what the settlement already has: walkers from its street graph, boats from its canals and quays, birds and animals from its region and climate, smoke from its house types and hearths, shop goods from a per-style table. A settlement's own `movers.js`, `fauna.js`, `smoke.js`, `shops.js` override the defaults (Suzhou keeps its own). Counts by time of day as in Suzhou.
3. **One check for the standard.** A script (`tools/standard-check.mjs <id>`) that runs surface-check, geo-one, plan-check and the walk route, and reports against suzhou-method §7: which data files exist, enterable rooms and their furnishing count, living systems attached, `damp`/`waterline` set, music zones. Agents and coordinator use the same script.
4. **Shared styles opened by ownership.** In each batch every shared style its settlements use (`chinese`, `ming`, `roman`, `vernacular`, `src/objects/*`) is assigned to exactly one agent, named in the assignment; only that agent edits it. `docs/agent-brief.md` and `docs/parallel-work.md` say so.

## Slots

A **slot** is one implementing agent (Sonnet). A batch is about **10 slots** (the author's number); the coordinator may run 11 when one city needs it.

| Class · density | Upgrade (built) | From L0 | How the slots split |
|---|---|---|---|
| Large ●●● | 3 | 4 | landmark (`plan.js` + its style) · townscape (`layout`, `town`, `ground`, planting) · life (data for the living systems, interiors and their objects, shops, sound); from L0 a fourth for the outer quarters |
| Large ●● | 2 | 3 | landmark + interiors · townscape + life |
| Large ● | 2 | 2 | as above |
| Medium ●●● | 2 | 3 | landmark + interiors · townscape + life |
| Medium ●● / ● | 1 | 2 / 1 | one agent; from L0 split landmark / town |
| Small ●●● | 1 | 2 | one agent |
| Small ●● / ● | 1 | 1 | one agent |
| Point | ½ | ½ | two to one agent |

Agents on one settlement edit disjoint files of its folder (the split above); the landmark agent owns `index.js`.

**Dossiers for L0**, two extra Sonnet agents (low effort, research only, no code) run beside each batch from B3 on, writing `docs/settlements/<id>.md` for the next L0 settlements in the order of B10–B16. They touch no code, so they never conflict.

## The batches

Slots in brackets; S = shared style owned in that batch, by the agent named.

### B1 — Pilot: Chinese capitals (10) — *in progress*

| Settlement | Class | Slots |
|---|---|---|
| Northern Song Kaifeng (`song-kaifeng`) | L ●●● | 3 |
| Southern Song Lin'an (`song-hangzhou`) | L ●●● | 3 |
| Ming–Qing Beijing (`qing-beijing`) | L ●●● | 3 |
| Tang Foguang, Wutai (`tang-wutai`) | S ●● | 1 |

S: `song` (Kaifeng, Hangzhou, Wutai) → Kaifeng landmark, except its per-settlement files `song/hangzhou.js` → Hangzhou landmark and `song/wutai.js` → the Wutai agent; `qing` → Beijing landmark; `chinese` → the Wutai agent (`vernacular` untouched this batch); `ming` stays untouched (Suzhou, the reference). **Gate:** surveyed in Chrome against Suzhou (≥ 55 fps turning, p95 ≤ 25 ms, ≤ 800 draws; detail looked at from a metre); suzhou-method.md and the slot table revised with what the pilot taught.

### B2 — East Asia and India, the dense ones (10)

| Settlement | Class | Slots |
|---|---|---|
| Lhasa (`lhasa`) | M ●●● | 2 |
| Joseon Hanyang (`joseon-seoul`) | M ●●● | 2 |
| Madurai (`madurai`) | M ●●● | 2 |
| Nara (`nara`) | M ●● | 1 |
| Edo Himeji (`edo-himeji`) | M ●● | 1 |
| Heian Uji (`heian-uji`) | S ●●● | 1 |
| Khajuraho (`khajuraho`) | S ●●● | 1 |

S: `chinese` → Nara (used by Nara, Uji).

### B3 — Medieval and Renaissance West (10)

| Settlement | Class | Slots |
|---|---|---|
| Gothic Paris (`paris`) | L ●●● | 3 |
| Venice (`venice`) | L ●●● | 3 |
| Renaissance Florence (`florence`) | M ●●● | 2 |
| Nasrid Granada (`granada`) | M ●●● | 2 |

S: `vernacular` (incl. `houses-med.js`) → Florence townscape.

### B4 — The Bosphorus and Islamic cities (11)

| Settlement | Class | Slots |
|---|---|---|
| Justinian's Constantinople (`constantinople`) | L ●●● | 3 |
| Ottoman Istanbul (`ottoman-istanbul`) | L ●●● | 3 |
| Mamluk Cairo (`mamluk-cairo`) | L ●●● | 3 |
| Safavid Isfahan (`isfahan`) | M ●●● | 2 |

S: `vernacular` → Istanbul townscape; `roman` (its `town.js`) and `byzantine` → Constantinople townscape.

### B5 — Classical antiquity and the two Romes (10)

| Settlement | Class | Slots |
|---|---|---|
| Hadrian's Rome (`rome`) | L ●●● | 3 |
| Baroque Rome (`baroque-rome`) | M ●●● | 2 |
| Classical Athens (`athens`) | M ●●● | 2 |
| Umayyad Jerusalem (`jerusalem`) | M ●● | 1 |
| Petra (`petra`) | M ●● | 1 |
| Knossos (`knossos`) | S ●● | 1 |

S: `roman` → Rome landmark; `vernacular` → Baroque Rome townscape; `greek` → Athens landmark; `islamic` → Jerusalem. Athens adds its schools (§7).

### B6 — Early modern and modern Europe (10)

| Settlement | Class | Slots |
|---|---|---|
| Versailles (`versailles`) | L ●●● | 3 |
| Victorian London (`london`) | L ●●● | 3 |
| Amsterdam (`amsterdam`) | M ●●● | 2 |
| Art Nouveau Barcelona (`barcelona`) | M ●● | 1 |
| Muscovy (`muscovy`) | M ●● | 1 |

S: `vernacular` → Versailles townscape.

### B7 — Ancient Near East, Egypt, South and South-East Asia (10)

| Settlement | Class | Slots |
|---|---|---|
| Babylon (`babylon`) | L ●● | 2 |
| Angkor (`angkor`) | L ●● | 2 |
| Ur (`ur`) | M ●● | 1 |
| Persepolis (`persepolis`) | M ●● | 1 |
| Giza (`giza`) | M ●● | 1 |
| Mughal Agra (`mughal-agra`) | M ●● | 1 |
| Borobudur (`borobudur`) | S ●●● | 1 |
| Sanchi (`sanchi`) | S ●● | 1 |

S: `chinese` and `vernacular` → Sanchi; `ming` → Agra (only what Agra uses of it; Suzhou re-checked after merge).

### B8 — The Americas (10)

| Settlement | Class | Slots |
|---|---|---|
| Teotihuacan (`teotihuacan`) | L ●● | 2 |
| Tenochtitlan (`tenochtitlan`) | L ●● | 2 |
| Modern New York (`new-york`) | L ●● | 2 |
| Chichén Itzá (`chichen-itza`) | M ●● | 1 |
| Cahokia (`cahokia`) | M ● | 1 |
| Machu Picchu (`machu-picchu`) | S ●● | 1 |
| Taos (`taos`) | S ● | 1 |

### B9 — Africa, the North and Oceania, the small ones (9½)

| Settlement | Class | Slots |
|---|---|---|
| Djenné (`djenne`) | M ●● | 1 |
| Modern Sydney (`sydney`) | M ● | 1 |
| Lalibela (`lalibela`) | S ●● | 1 |
| Kilwa (`kilwa`) | S ●● | 1 |
| Conques (`conques`) | S ●● | 1 |
| Borgund (`norse-borgund`) | S ●● | 1 |
| Great Zimbabwe (`great-zimbabwe`) | S ● | 1 |
| Rapa Nui (`rapa-nui`) | S ● | 1 |
| Māori pā (`maori`) | S ● | 1 |
| Stonehenge (`stonehenge`) | P ● | ½ |

S: `vernacular` → Conques. The half slot left is a fix-up slot for any earlier settlement that failed its survey.

### B10 — New: Tang and the Buddhist north (10)

Tang Chang'an (L ●●●, 4) · Muromachi Kyoto (M ●●●, 3) · Dunhuang (S ●●●, 2) · Shaolin and Mount Song (S ●●, 1).

### B11 — New: the Silk Road and the Islamic world (10)

Abbasid Baghdad (L ●●, 3) · Timurid Samarkand (M ●●●, 3) · Fez (M ●●●, 3) · Mongol Karakorum (S ●, 1).

### B12 — New: Egypt and the ancient Mediterranean (10½)

New Kingdom Thebes (M ●●●, 3) · Alexandria (L ●●, 3) · Delphi (S ●●, 1) · Abu Simbel (S ●●, 1) · Mycenae (S ●, 1) · Shibam (S ●●, 1) · Çatalhöyük (P, ½).

### B13 — New: early China (11)

Han Chang'an (L ●●, 3) · Qin Xianyang (M ●●, 2) · Qufu (M ●●, 2) · Ye (M ●●, 2) · Yinxu (M ●, 1) · Hakka tulou (S ●●, 1).

### B14 — New: South and South-East Asia (10)

Ajanta (S ●●●, 2) · Bhaktapur (S ●●●, 2) · Ayutthaya (M ●●, 2) · Nalanda (S ●●, 1) · Mohenjo-daro (M ●, 1) · Bagan (M ●, 1) · the Balinese temple village (S ●●, 1).

### B15 — New: modern Europe and the Americas (10)

Vienna (M ●●●, 3) · Manueline Lisbon (M ●●, 2) · Tikal (M ●●, 2) · Brasília (L ●, 2) · Bauhaus Dessau (S ●●, 1).

### B16 — New: Africa and the Pacific (6), with the last fix-ups

Benin City (M ●●, 2) · SG̱ang Gwaay (S ●●, 1) · Nan Madol (S ●, 1) · the Dogon villages (P, ½) · Kakadu (P, ½); the remaining slots fix whatever earlier surveys left.

## After each batch

1. Merge, the heavy checks, CI green, one push per batch or per city (`docs/parallel-work.md`).
2. Survey every settlement of the batch in the author's Chrome: arrival view, the densest views turning (≥ 55 fps, p95 ≤ 25 ms, ≤ 800 draws), a walk of the main route, a close look at landmark, a house and a shop.
3. Set each settlement's level in DESIGN §7 from the survey, not from its dossier. One that fails goes into the next batch's fix-up slot, with what failed.
4. Mark the batch done here; tell the author what the batch brought.

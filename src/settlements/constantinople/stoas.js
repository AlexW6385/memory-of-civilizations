// The porticoes of the Mese and of the forecourt, with the shops behind them (docs/settlements/constantinople.md §4.5, §4.8): pure data, read by plan.js (the stoas),
// interiors.js (the shops' fittings), shops.js, the sound map and the walk.

// the Mese's porticoes with the shops behind them (§4.5): open between the Milion and the Augustaion and
// at the corners; on the south of the first leg a shallow portico against the Baths of Zeuxippus, on the
// west of the second a portico backed by a wall along the Hippodrome
export const MESE_STOAS = [
  { a: [-112, 103], b: [-170, 103], side: 1, shops: 5 },
  { a: [-102, 117], b: [-170, 117], side: -1, depth: 2.4 },
  { a: [-173, 100], b: [-173, 50], side: 1, shops: 5 },
  { a: [-187, 100], b: [-187, 50], side: -1, back: true },
  { a: [-190, 33], b: [-296, 33], side: 1, shops: 5 },
  { a: [-190, 47], b: [-296, 47], side: -1, shops: 5 },
  // the forecourt south of Hagia Sophia (layout.js FORECOURT): a row of shops under a portico on either side, their doors on the court
  { a: [-54, 50], b: [-54, 92], side: 1, shops: 5 },
  { a: [42, 94], b: [42, 50], side: 1, shops: 5 },
];

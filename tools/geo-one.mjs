// Geometry budget of one or more settlements: node tools/geo-one.mjs <id>... (the limits are in tools/geo-budget.mjs).
const { measureSite } = await import('./geo-budget.mjs');
for (const id of process.argv.slice(2)) { const S = await measureSite(id); console.log(id, (S.bytes / 1e6).toFixed(1), 'MB', S.meshes, 'meshes'); }

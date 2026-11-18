// Module-level counters that give repeated pieces a millimetre of variation (so they merge instead of being instanced) must start from
// the same state in every build, or the n-th build of a plan differs from the first and its light bake always reads as stale.
// A module registers its reset here; buildPlan / buildPlanAsync call resetBuildState() before the first element of every plan.
const RESETS = [];
/** Register a function that puts a module's jitter counter back to its initial value. */
export const onBuildStart = (fn) => { RESETS.push(fn); };
export const resetBuildState = () => { for (const f of RESETS) f(); };

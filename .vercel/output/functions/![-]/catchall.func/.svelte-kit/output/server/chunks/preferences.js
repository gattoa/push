const STORAGE_KEY = "push_preferences";
const DEFAULTS = {
  reviewDay: 6,
  units: "lbs",
  restTimerDefault: 90
};
function getPreferences() {
  if (typeof window === "undefined") return DEFAULTS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}
export {
  getPreferences as g
};

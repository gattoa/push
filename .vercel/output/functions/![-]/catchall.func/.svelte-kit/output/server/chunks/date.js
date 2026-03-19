function getTodayIndex() {
  const jsDay = (/* @__PURE__ */ new Date()).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}
export {
  getTodayIndex as g
};

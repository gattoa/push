const load = async ({ locals: { safeGetSession }, depends }) => {
  depends("supabase:auth");
  const { session } = await safeGetSession();
  return { session };
};
export {
  load
};

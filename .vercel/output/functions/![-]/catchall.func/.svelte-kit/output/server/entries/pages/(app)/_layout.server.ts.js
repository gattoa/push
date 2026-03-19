import { redirect } from "@sveltejs/kit";
const load = async ({ locals: { safeGetSession, supabase } }) => {
  const { session, user } = await safeGetSession();
  if (!session) redirect(303, "/login");
  if (!user?.user_metadata?.onboarding_complete) redirect(303, "/onboarding");
  const { data: settings } = await supabase.from("user_settings").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!settings) {
    await supabase.auth.updateUser({ data: { onboarding_complete: false } });
    redirect(303, "/onboarding");
  }
  return { session, user };
};
export {
  load
};

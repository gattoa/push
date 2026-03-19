import { redirect } from "@sveltejs/kit";
const GET = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth callback error:", error.message);
      redirect(303, "/login");
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.onboarding_complete) {
      redirect(303, "/");
    } else {
      redirect(303, "/onboarding");
    }
  }
  redirect(303, "/login");
};
export {
  GET
};

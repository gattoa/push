import { redirect } from "@sveltejs/kit";
const load = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();
  if (session) redirect(303, "/");
};
export {
  load
};

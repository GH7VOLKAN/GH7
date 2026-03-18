import { createClient } from "@/lib/supabase/server";

export const ADMIN_EMAILS = [
  "info@gh7.ai",
  "kaizen.isitmax@gmail.com",
  "volkan@isitmax.com",
];

/**
 * Check if the current user is an admin.
 * Returns the user object if admin, null otherwise.
 */
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;
  if (!ADMIN_EMAILS.includes(user.email)) return null;

  return user;
}

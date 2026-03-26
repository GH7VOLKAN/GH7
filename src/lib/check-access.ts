/**
 * GH7.ai — Server-side plan access check
 * Use at the top of server components to gate pages by plan.
 */

import { getActiveBrand } from "@/lib/dal/brand";
import { hasAccess, type SubscriptionTier } from "@/lib/subscription";
import { redirect } from "next/navigation";

/**
 * Check if the current user has access to a page requiring `requiredTier`.
 * Redirects to /panel/upgrade if not.
 * Returns the active brand data on success.
 */
export async function checkPageAccess(
  requiredTier: SubscriptionTier,
  pathname: string,
) {
  const activeBrand = await getActiveBrand();

  if (!activeBrand) {
    redirect("/login");
  }

  const userPlan = activeBrand.plan ?? "free";

  if (!hasAccess(userPlan, requiredTier)) {
    redirect(
      `/panel/upgrade?from=${encodeURIComponent(pathname)}&required=${requiredTier}`,
    );
  }

  return activeBrand;
}

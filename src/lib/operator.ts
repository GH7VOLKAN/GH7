/**
 * Single-operator allowlist. The operator account is created MANUALLY in the
 * Supabase Auth dashboard (no password in code/env). The app only checks that
 * the signed-in email is on this allowlist. There is no customer login.
 */
export const OPERATOR_EMAILS = ["volkan.simsirkaya@gmail.com"];

export function isOperator(email: string | null | undefined): boolean {
  if (!email) return false;
  return OPERATOR_EMAILS.includes(email.trim().toLowerCase());
}

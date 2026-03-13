import { createHash, randomInt } from "crypto";

/** Generate a 6-digit OTP code */
export function generateOtpCode(): string {
  return randomInt(100000, 999999).toString();
}

/** Hash an OTP code with SHA-256 */
export function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/** Verify a plain code against its hash */
export function verifyCodeHash(code: string, hash: string): boolean {
  return hashCode(code) === hash;
}

/** OTP expiry time in minutes */
export const OTP_EXPIRY_MINUTES = 5;

/** Max verification attempts before code becomes invalid */
export const OTP_MAX_ATTEMPTS = 3;

/** Cooldown in seconds before resending to same email */
export const OTP_COOLDOWN_SECONDS = 60;

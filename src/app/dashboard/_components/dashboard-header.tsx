import Link from "next/link";
import s from "../dashboard.module.css";

type Props = {
  profile: {
    phone: string | null;
    email: string | null;
    plan: string;
  };
  brandName: string;
};

function formatPhone(raw: string): string {
  // 905326629792 → +90 532 662 97 92
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) {
    return `+90 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  return raw;
}

export function DashboardHeader({ profile, brandName }: Props) {
  const planLabel = profile.plan === "free" ? "Free" : "Pro";

  // Email varsa ve synthetic değilse göster, yoksa formatted phone
  const isSyntheticEmail =
    !!profile.email &&
    profile.email.startsWith("phone_") &&
    profile.email.endsWith("@gh7.ai");
  const displayName =
    profile.email && !isSyntheticEmail
      ? profile.email
      : profile.phone
        ? formatPhone(profile.phone)
        : "Kullanıcı";

  return (
    <header className={s.header}>
      <div className={s.headerInner}>
        <Link href="/dashboard" className={s.logo}>
          <span className={s.logoText}>GH7</span>
        </Link>

        <div className={s.headerRight}>
          <span className={s.brandTag}>{brandName}</span>
          <span className={s.divider}>•</span>
          <span className={s.user}>{displayName}</span>
          <span
            className={`${s.plan} ${profile.plan === "free" ? s.planFree : s.planPro}`}
          >
            {planLabel}
          </span>
        </div>
      </div>
    </header>
  );
}

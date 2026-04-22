import Link from "next/link";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import s from "../dashboard.module.css";

type Props = {
  slug: string;
  brand: string;
  subtitle: string;
  description: string;
  metric?: string;
  metricLabel?: string;
  href: string;
  locked: boolean;
  buttonLabel: string;
};

export function BrandCard({
  brand,
  subtitle,
  description,
  metric,
  metricLabel,
  href,
  locked,
  buttonLabel,
}: Props) {
  return (
    <Link href={href} className={s.cardLink}>
      <Card className={`${s.card} ${locked ? s.cardLocked : ""}`}>
        <div className={s.cardHeader}>
          <div className={s.cardBrand}>
            <span className={s.cardGh7}>GH7</span>
            <span className={s.cardBrandName}>{brand}</span>
          </div>
          {locked && <Lock className={s.lockIcon} size={16} />}
        </div>

        <h3 className={s.cardSubtitle}>{subtitle}</h3>

        {metric && (
          <div className={s.cardMetric}>
            <span className={s.cardMetricValue}>{metric}</span>
            {metricLabel && (
              <span className={s.cardMetricLabel}>{metricLabel}</span>
            )}
          </div>
        )}

        <p className={s.cardDescription}>{description}</p>

        <div className={s.cardAction}>{buttonLabel}</div>
      </Card>
    </Link>
  );
}

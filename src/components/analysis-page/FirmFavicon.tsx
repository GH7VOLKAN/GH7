/* eslint-disable @next/next/no-img-element */

interface FirmFaviconProps {
  domain: string | null;
  firmName: string;
  size?: number;
}

export function FirmFavicon({ domain, firmName, size = 20 }: FirmFaviconProps) {
  if (!domain) {
    return (
      <span
        className="inline-flex items-center justify-center rounded bg-muted text-muted-foreground text-xs font-medium"
        style={{ width: size, height: size }}
      >
        {firmName.charAt(0).toUpperCase()}
      </span>
    );
  }

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  return (
    <img
      src={`https://www.google.com/s2/favicons?sz=32&domain=${cleanDomain}`}
      alt={firmName}
      width={size}
      height={size}
      className="rounded"
      loading="lazy"
    />
  );
}

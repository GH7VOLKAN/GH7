"use client";

import { useState, useCallback, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface TurkeyMapProps {
  cityData: Record<string, { score: number; status: string }>;
  onCityClick?: (city: string) => void;
  className?: string;
}

interface CityPosition {
  name: string;
  x: number;
  y: number;
  region: string;
}

const CITIES: CityPosition[] = [
  // Marmara
  { name: "İstanbul", x: 180, y: 60, region: "Marmara" },
  { name: "Edirne", x: 100, y: 40, region: "Marmara" },
  { name: "Kırklareli", x: 130, y: 30, region: "Marmara" },
  { name: "Tekirdağ", x: 130, y: 60, region: "Marmara" },
  { name: "Çanakkale", x: 100, y: 100, region: "Marmara" },
  { name: "Balıkesir", x: 150, y: 115, region: "Marmara" },
  { name: "Bursa", x: 200, y: 100, region: "Marmara" },
  { name: "Yalova", x: 210, y: 80, region: "Marmara" },
  { name: "Kocaeli", x: 230, y: 70, region: "Marmara" },
  { name: "Sakarya", x: 260, y: 70, region: "Marmara" },
  { name: "Bilecik", x: 250, y: 100, region: "Marmara" },
  { name: "Düzce", x: 280, y: 65, region: "Marmara" },

  // Ege
  { name: "İzmir", x: 110, y: 160, region: "Ege" },
  { name: "Manisa", x: 140, y: 145, region: "Ege" },
  { name: "Aydın", x: 120, y: 185, region: "Ege" },
  { name: "Denizli", x: 170, y: 185, region: "Ege" },
  { name: "Muğla", x: 130, y: 210, region: "Ege" },
  { name: "Uşak", x: 195, y: 155, region: "Ege" },
  { name: "Kütahya", x: 210, y: 130, region: "Ege" },
  { name: "Afyonkarahisar", x: 230, y: 155, region: "Ege" },

  // Akdeniz
  { name: "Antalya", x: 215, y: 230, region: "Akdeniz" },
  { name: "Burdur", x: 200, y: 200, region: "Akdeniz" },
  { name: "Isparta", x: 220, y: 190, region: "Akdeniz" },
  { name: "Mersin", x: 320, y: 240, region: "Akdeniz" },
  { name: "Adana", x: 360, y: 230, region: "Akdeniz" },
  { name: "Hatay", x: 380, y: 260, region: "Akdeniz" },
  { name: "Osmaniye", x: 380, y: 235, region: "Akdeniz" },
  { name: "Kahramanmaraş", x: 400, y: 210, region: "Akdeniz" },

  // İç Anadolu
  { name: "Ankara", x: 290, y: 115, region: "İç Anadolu" },
  { name: "Konya", x: 290, y: 195, region: "İç Anadolu" },
  { name: "Eskişehir", x: 250, y: 120, region: "İç Anadolu" },
  { name: "Kırşehir", x: 340, y: 135, region: "İç Anadolu" },
  { name: "Nevşehir", x: 350, y: 165, region: "İç Anadolu" },
  { name: "Aksaray", x: 320, y: 170, region: "İç Anadolu" },
  { name: "Niğde", x: 340, y: 195, region: "İç Anadolu" },
  { name: "Kayseri", x: 370, y: 170, region: "İç Anadolu" },
  { name: "Sivas", x: 420, y: 140, region: "İç Anadolu" },
  { name: "Yozgat", x: 370, y: 130, region: "İç Anadolu" },
  { name: "Kırıkkale", x: 310, y: 120, region: "İç Anadolu" },
  { name: "Çankırı", x: 310, y: 90, region: "İç Anadolu" },
  { name: "Karaman", x: 300, y: 210, region: "İç Anadolu" },

  // Karadeniz
  { name: "Bolu", x: 280, y: 75, region: "Karadeniz" },
  { name: "Zonguldak", x: 260, y: 55, region: "Karadeniz" },
  { name: "Bartın", x: 270, y: 50, region: "Karadeniz" },
  { name: "Karabük", x: 285, y: 60, region: "Karadeniz" },
  { name: "Kastamonu", x: 320, y: 55, region: "Karadeniz" },
  { name: "Çorum", x: 350, y: 90, region: "Karadeniz" },
  { name: "Amasya", x: 385, y: 90, region: "Karadeniz" },
  { name: "Tokat", x: 415, y: 100, region: "Karadeniz" },
  { name: "Samsun", x: 400, y: 70, region: "Karadeniz" },
  { name: "Ordu", x: 430, y: 75, region: "Karadeniz" },
  { name: "Giresun", x: 450, y: 80, region: "Karadeniz" },
  { name: "Trabzon", x: 480, y: 75, region: "Karadeniz" },
  { name: "Rize", x: 510, y: 72, region: "Karadeniz" },
  { name: "Artvin", x: 530, y: 62, region: "Karadeniz" },
  { name: "Gümüşhane", x: 470, y: 95, region: "Karadeniz" },
  { name: "Bayburt", x: 490, y: 90, region: "Karadeniz" },
  { name: "Sinop", x: 370, y: 50, region: "Karadeniz" },

  // Doğu Anadolu
  { name: "Erzurum", x: 510, y: 100, region: "Doğu Anadolu" },
  { name: "Erzincan", x: 460, y: 115, region: "Doğu Anadolu" },
  { name: "Tunceli", x: 460, y: 140, region: "Doğu Anadolu" },
  { name: "Elazığ", x: 440, y: 150, region: "Doğu Anadolu" },
  { name: "Malatya", x: 430, y: 165, region: "Doğu Anadolu" },
  { name: "Bingöl", x: 480, y: 140, region: "Doğu Anadolu" },
  { name: "Muş", x: 510, y: 135, region: "Doğu Anadolu" },
  { name: "Bitlis", x: 530, y: 150, region: "Doğu Anadolu" },
  { name: "Van", x: 570, y: 145, region: "Doğu Anadolu" },
  { name: "Hakkari", x: 580, y: 175, region: "Doğu Anadolu" },
  { name: "Ağrı", x: 550, y: 110, region: "Doğu Anadolu" },
  { name: "Kars", x: 560, y: 85, region: "Doğu Anadolu" },
  { name: "Iğdır", x: 580, y: 90, region: "Doğu Anadolu" },
  { name: "Ardahan", x: 550, y: 65, region: "Doğu Anadolu" },

  // Güneydoğu Anadolu
  { name: "Gaziantep", x: 400, y: 230, region: "Güneydoğu Anadolu" },
  { name: "Kilis", x: 390, y: 245, region: "Güneydoğu Anadolu" },
  { name: "Adıyaman", x: 430, y: 195, region: "Güneydoğu Anadolu" },
  { name: "Şanlıurfa", x: 460, y: 210, region: "Güneydoğu Anadolu" },
  { name: "Diyarbakır", x: 480, y: 170, region: "Güneydoğu Anadolu" },
  { name: "Mardin", x: 510, y: 190, region: "Güneydoğu Anadolu" },
  { name: "Batman", x: 510, y: 170, region: "Güneydoğu Anadolu" },
  { name: "Siirt", x: 530, y: 165, region: "Güneydoğu Anadolu" },
  { name: "Şırnak", x: 540, y: 185, region: "Güneydoğu Anadolu" },
];

const TURKISH_CHAR_MAP: Record<string, string> = {
  "ç": "c",
  "ğ": "g",
  "ı": "i",
  "İ": "i",
  "i": "i",
  "I": "i",
  "ö": "o",
  "ş": "s",
  "ü": "u",
  "Ç": "c",
  "Ğ": "g",
  "Ö": "o",
  "Ş": "s",
  "Ü": "u",
};

function toSlug(name: string): string {
  return name
    .split("")
    .map((char) => TURKISH_CHAR_MAP[char] ?? char)
    .join("")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getColor(
  cityName: string,
  cityData: Record<string, { score: number; status: string }>
): string {
  const slug = toSlug(cityName);
  const data = cityData[slug] ?? cityData[cityName];
  if (!data || data.status === "not-tracked") return "#E5E7EB";
  if (data.score >= 70) return "#22C55E";
  if (data.score >= 40) return "#F59E0B";
  if (data.score > 0) return "#EF4444";
  return "#E5E7EB";
}

function getCityInfo(
  cityName: string,
  cityData: Record<string, { score: number; status: string }>
): { score: number; status: string } {
  const slug = toSlug(cityName);
  return cityData[slug] ?? cityData[cityName] ?? { score: 0, status: "not-tracked" };
}

function darkenColor(hex: string): string {
  if (hex === "#E5E7EB") return "#D1D5DB";
  if (hex === "#22C55E") return "#16A34A";
  if (hex === "#F59E0B") return "#D97706";
  if (hex === "#EF4444") return "#DC2626";
  return "#D1D5DB";
}

const RECT_W = 38;
const RECT_H = 22;
const RECT_RX = 4;

export function TurkeyMap({ cityData, onCityClick, className }: TurkeyMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!hoveredCity) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left + 12,
        y: e.clientY - rect.top - 10,
      });
    },
    [hoveredCity]
  );

  const handleCityClick = useCallback(
    (cityName: string) => {
      const slug = toSlug(cityName);
      if (onCityClick) {
        onCityClick(slug);
      } else {
        window.location.href = `/panel/iller/${slug}`;
      }
    },
    [onCityClick]
  );

  const tooltipInfo = hoveredCity ? getCityInfo(hoveredCity, cityData) : null;

  return (
    <div
      className={cn("relative w-full", className)}
      onMouseMove={handleMouseMove}
    >
      <svg
        viewBox="0 0 800 350"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ maxHeight: "500px" }}
      >
        {/* Background outline hint */}
        <rect
          x="0"
          y="0"
          width="800"
          height="350"
          fill="transparent"
          rx="8"
        />

        {CITIES.map((city) => {
          const fill = getColor(city.name, cityData);
          const isHovered = hoveredCity === city.name;
          const activeFill = isHovered ? darkenColor(fill) : fill;
          const rx = city.x - RECT_W / 2;
          const ry = city.y - RECT_H / 2;

          return (
            <g
              key={city.name}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredCity(city.name)}
              onMouseLeave={() => setHoveredCity(null)}
              onClick={() => handleCityClick(city.name)}
            >
              <rect
                x={rx}
                y={ry}
                width={RECT_W}
                height={RECT_H}
                rx={RECT_RX}
                fill={activeFill}
                stroke={isHovered ? "#1F2937" : "#9CA3AF"}
                strokeWidth={isHovered ? 1.5 : 0.5}
                className="transition-colors duration-150"
              />
              <text
                x={city.x}
                y={city.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="5.5"
                fontWeight={isHovered ? 700 : 500}
                fill={fill === "#E5E7EB" ? "#6B7280" : "#FFFFFF"}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {city.name}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(640, 290)">
          <rect x="0" y="0" width="12" height="12" rx="2" fill="#22C55E" />
          <text x="16" y="10" fontSize="8" fill="#374151">
            Güçlü (70+)
          </text>

          <rect x="0" y="18" width="12" height="12" rx="2" fill="#F59E0B" />
          <text x="16" y="28" fontSize="8" fill="#374151">
            Orta (40-69)
          </text>

          <rect x="0" y="36" width="12" height="12" rx="2" fill="#EF4444" />
          <text x="16" y="46" fontSize="8" fill="#374151">
            Zayıf (1-39)
          </text>

          <rect
            x="0"
            y="54"
            width="12"
            height="12"
            rx="2"
            fill="#E5E7EB"
            stroke="#9CA3AF"
            strokeWidth="0.5"
          />
          <text x="16" y="64" fontSize="8" fill="#374151">
            Takip Yok
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredCity && tooltipInfo && (
        <div
          className="absolute z-50 pointer-events-none rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translateY(-100%)",
          }}
        >
          <p className="font-semibold">{hoveredCity}</p>
          <p>
            {tooltipInfo.score}/100 &mdash;{" "}
            {tooltipInfo.status === "not-tracked"
              ? "Takip Edilmiyor"
              : tooltipInfo.status}
          </p>
        </div>
      )}
    </div>
  );
}

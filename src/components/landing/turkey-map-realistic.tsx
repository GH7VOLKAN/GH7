"use client";

/**
 * Gerçekçi Türkiye haritası — landing page için.
 * 81 il gerçek coğrafi koordinatlarıyla yerleştirilmiş.
 * SVG simplified Turkey outline + data points.
 */

interface City {
  name: string;
  lat: number;
  lng: number;
  score?: number;
  status?: "strong" | "moderate" | "weak" | "untracked";
}

// 81 Türk ili, gerçek lat/lng koordinatları
const CITIES: City[] = [
  { name: "İstanbul", lat: 41.0082, lng: 28.9784, score: 82, status: "strong" },
  { name: "Ankara", lat: 39.9334, lng: 32.8597, score: 71, status: "strong" },
  { name: "İzmir", lat: 38.4192, lng: 27.1287, score: 65, status: "moderate" },
  { name: "Bursa", lat: 40.1824, lng: 29.0670, score: 58, status: "moderate" },
  { name: "Antalya", lat: 36.8969, lng: 30.7133, score: 45, status: "moderate" },
  { name: "Adana", lat: 37.0000, lng: 35.3213, status: "untracked" },
  { name: "Konya", lat: 37.8714, lng: 32.4846, score: 38, status: "weak" },
  { name: "Gaziantep", lat: 37.0660, lng: 37.3833, status: "untracked" },
  { name: "Mersin", lat: 36.8000, lng: 34.6333, status: "untracked" },
  { name: "Diyarbakır", lat: 37.9144, lng: 40.2306, score: 12, status: "weak" },
  { name: "Kayseri", lat: 38.7312, lng: 35.4787, status: "untracked" },
  { name: "Eskişehir", lat: 39.7667, lng: 30.5256, status: "untracked" },
  { name: "Samsun", lat: 41.2867, lng: 36.3300, status: "untracked" },
  { name: "Denizli", lat: 37.7765, lng: 29.0864, status: "untracked" },
  { name: "Malatya", lat: 38.3552, lng: 38.3095, status: "untracked" },
  { name: "Trabzon", lat: 41.0015, lng: 39.7178, score: 22, status: "weak" },
  { name: "Erzurum", lat: 39.9000, lng: 41.2700, score: 15, status: "weak" },
  { name: "Balıkesir", lat: 39.6484, lng: 27.8826, score: 91, status: "strong" },
  { name: "Manisa", lat: 38.6191, lng: 27.4289, status: "untracked" },
  { name: "Sakarya", lat: 40.7569, lng: 30.3781, status: "untracked" },
  { name: "Kocaeli", lat: 40.8533, lng: 29.8815, status: "untracked" },
  { name: "Tekirdağ", lat: 40.9833, lng: 27.5167, status: "untracked" },
  { name: "Van", lat: 38.4942, lng: 43.3800, status: "untracked" },
  { name: "Şanlıurfa", lat: 37.1674, lng: 38.7955, status: "untracked" },
  { name: "Kahramanmaraş", lat: 37.5858, lng: 36.9371, status: "untracked" },
  { name: "Hatay", lat: 36.4018, lng: 36.3498, status: "untracked" },
  { name: "Aydın", lat: 37.8560, lng: 27.8416, status: "untracked" },
  { name: "Muğla", lat: 37.2153, lng: 28.3636, status: "untracked" },
  { name: "Afyonkarahisar", lat: 38.7507, lng: 30.5567, status: "untracked" },
  { name: "Isparta", lat: 37.7648, lng: 30.5566, status: "untracked" },
  { name: "Tokat", lat: 40.3167, lng: 36.5500, status: "untracked" },
  { name: "Sivas", lat: 39.7477, lng: 37.0179, status: "untracked" },
  { name: "Ordu", lat: 40.9839, lng: 37.8764, status: "untracked" },
  { name: "Rize", lat: 41.0201, lng: 40.5234, status: "untracked" },
  { name: "Giresun", lat: 40.9175, lng: 38.3925, status: "untracked" },
  { name: "Artvin", lat: 41.1828, lng: 41.8183, status: "untracked" },
  { name: "Ağrı", lat: 39.7191, lng: 43.0503, status: "untracked" },
  { name: "Muş", lat: 38.7432, lng: 41.5065, status: "untracked" },
  { name: "Bitlis", lat: 38.4011, lng: 42.1081, status: "untracked" },
  { name: "Hakkari", lat: 37.5833, lng: 43.7333, status: "untracked" },
  { name: "Şırnak", lat: 37.5167, lng: 42.4500, status: "untracked" },
  { name: "Siirt", lat: 37.9333, lng: 41.9500, status: "untracked" },
  { name: "Batman", lat: 37.8811, lng: 41.1351, status: "untracked" },
  { name: "Mardin", lat: 37.3122, lng: 40.7351, status: "untracked" },
  { name: "Elazığ", lat: 38.6744, lng: 39.2228, status: "untracked" },
  { name: "Bingöl", lat: 38.8847, lng: 40.4986, status: "untracked" },
  { name: "Tunceli", lat: 39.3074, lng: 39.4388, status: "untracked" },
  { name: "Erzincan", lat: 39.7464, lng: 39.4914, status: "untracked" },
  { name: "Bayburt", lat: 40.2552, lng: 40.2249, status: "untracked" },
  { name: "Gümüşhane", lat: 40.4603, lng: 39.4814, status: "untracked" },
  { name: "Kars", lat: 40.6013, lng: 43.0975, status: "untracked" },
  { name: "Ardahan", lat: 41.1105, lng: 42.7022, status: "untracked" },
  { name: "Iğdır", lat: 39.9167, lng: 44.0333, status: "untracked" },
  { name: "Çorum", lat: 40.5506, lng: 34.9556, status: "untracked" },
  { name: "Amasya", lat: 40.6499, lng: 35.8353, status: "untracked" },
  { name: "Kastamonu", lat: 41.3887, lng: 33.7827, status: "untracked" },
  { name: "Sinop", lat: 42.0231, lng: 35.1531, status: "untracked" },
  { name: "Bartın", lat: 41.6344, lng: 32.3375, status: "untracked" },
  { name: "Karabük", lat: 41.2061, lng: 32.6204, status: "untracked" },
  { name: "Zonguldak", lat: 41.4564, lng: 31.7987, status: "untracked" },
  { name: "Düzce", lat: 40.8438, lng: 31.1565, status: "untracked" },
  { name: "Bolu", lat: 40.5760, lng: 31.5788, status: "untracked" },
  { name: "Çankırı", lat: 40.6013, lng: 33.6134, status: "untracked" },
  { name: "Kırıkkale", lat: 39.8468, lng: 33.5153, status: "untracked" },
  { name: "Yozgat", lat: 39.8181, lng: 34.8147, status: "untracked" },
  { name: "Kırşehir", lat: 39.1425, lng: 34.1709, status: "untracked" },
  { name: "Nevşehir", lat: 38.6939, lng: 34.6857, status: "untracked" },
  { name: "Niğde", lat: 37.9667, lng: 34.6833, status: "untracked" },
  { name: "Aksaray", lat: 38.3687, lng: 34.0370, status: "untracked" },
  { name: "Karaman", lat: 37.1759, lng: 33.2287, status: "untracked" },
  { name: "Adıyaman", lat: 37.7648, lng: 38.2786, status: "untracked" },
  { name: "Osmaniye", lat: 37.0742, lng: 36.2466, status: "untracked" },
  { name: "Kilis", lat: 36.7184, lng: 37.1212, status: "untracked" },
  { name: "Burdur", lat: 37.7261, lng: 30.2880, status: "untracked" },
  { name: "Uşak", lat: 38.6823, lng: 29.4082, status: "untracked" },
  { name: "Kütahya", lat: 39.4167, lng: 29.9833, status: "untracked" },
  { name: "Bilecik", lat: 40.1451, lng: 29.9792, status: "untracked" },
  { name: "Yalova", lat: 40.6500, lng: 29.2667, status: "untracked" },
  { name: "Edirne", lat: 41.6764, lng: 26.5556, status: "untracked" },
  { name: "Kırklareli", lat: 41.7333, lng: 27.2167, status: "untracked" },
  { name: "Çanakkale", lat: 40.1553, lng: 26.4142, status: "untracked" },
];

// Türkiye bounding box (approx)
const BOUNDS = {
  minLat: 35.8,
  maxLat: 42.3,
  minLng: 25.6,
  maxLng: 44.8,
};

// SVG viewport
const VIEW_W = 800;
const VIEW_H = 320;

function projectToSVG(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * VIEW_W;
  const y = VIEW_H - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * VIEW_H;
  return { x, y };
}

const COLORS: Record<string, string> = {
  strong: "#22C55E",
  moderate: "#F59E0B",
  weak: "#EF4444",
  untracked: "#D4D4D8",
};

export function TurkeyMapRealistic() {
  const strongCount = CITIES.filter((c) => c.status === "strong").length;
  const moderateCount = CITIES.filter((c) => c.status === "moderate").length;
  const weakCount = CITIES.filter((c) => c.status === "weak").length;
  const untrackedCount = CITIES.filter((c) => c.status === "untracked").length;

  // Tracked cities with scores (shown with labels)
  const trackedCities = CITIES.filter((c) => c.status && c.status !== "untracked");

  return (
    <div style={{ width: "100%" }}>
      <div style={{
        position: "relative",
        width: "100%",
        aspectRatio: `${VIEW_W} / ${VIEW_H}`,
        background: "linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)",
        borderRadius: 16,
        border: "1px solid #e5e5e5",
        overflow: "hidden",
      }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          {/* Türkiye ana kara parçası - basitleştirilmiş outline */}
          <path
            d="M 20,160 Q 30,140 55,135 L 90,128 Q 120,125 155,130 L 195,133 Q 230,138 268,142 L 305,145 Q 340,148 378,150 L 415,152 Q 452,150 490,148 L 528,148 Q 565,150 602,155 L 640,160 Q 675,168 705,178 L 735,190 Q 755,202 770,220 L 778,240 Q 775,258 760,268 L 740,275 Q 715,280 685,278 L 650,275 Q 615,272 580,270 L 540,270 Q 500,272 460,272 L 420,272 Q 380,270 340,268 L 300,264 Q 260,260 222,256 L 185,252 Q 148,248 115,240 L 85,230 Q 55,218 35,200 L 22,180 Z"
            fill="#fff"
            stroke="#d4d4d8"
            strokeWidth="1.5"
          />

          {/* Data points (dots) */}
          {CITIES.map((city) => {
            const { x, y } = projectToSVG(city.lat, city.lng);
            const color = COLORS[city.status ?? "untracked"];
            const radius = city.status === "untracked" ? 2 : 5;
            return (
              <g key={city.name}>
                {city.status !== "untracked" && (
                  <circle
                    cx={x}
                    cy={y}
                    r={radius + 4}
                    fill={color}
                    opacity={0.2}
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={city.status === "untracked" ? 0 : 1.5}
                />
              </g>
            );
          })}

          {/* Tracked city labels */}
          {trackedCities.map((city) => {
            const { x, y } = projectToSVG(city.lat, city.lng);
            return (
              <text
                key={`label-${city.name}`}
                x={x}
                y={y - 10}
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                fill="#27272a"
                style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
              >
                {city.name} {city.score && `(${city.score})`}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: 20,
        display: "flex",
        flexWrap: "wrap",
        gap: 20,
        justifyContent: "center",
        fontSize: 13,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: COLORS.strong }} />
          <strong>{strongCount}</strong> güçlü il
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: COLORS.moderate }} />
          <strong>{moderateCount}</strong> orta il
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: COLORS.weak }} />
          <strong>{weakCount}</strong> zayıf il
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: COLORS.untracked }} />
          <strong>{untrackedCount}</strong> takip dışı
        </div>
      </div>
    </div>
  );
}

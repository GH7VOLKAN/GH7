const weekData = [
  { day: "Pzt", value: 35 },
  { day: "Sal", value: 42 },
  { day: "Çar", value: 38 },
  { day: "Per", value: 52 },
  { day: "Cum", value: 48 },
  { day: "Cmt", value: 55 },
  { day: "Paz", value: 65 },
];

export function FeatureVisualTracking() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-950">
            <svg
              className="size-3.5 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          </div>
          <p className="text-sm font-bold">Haftalık Takip</p>
        </div>
        <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700 dark:bg-green-950 dark:text-green-400">
          +12% bu hafta
        </span>
      </div>

      {/* Chart */}
      <div className="flex h-32 items-end gap-2">
        {weekData.map((d, i) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={`w-full rounded-t-md transition-all ${
                i === weekData.length - 1
                  ? "bg-foreground"
                  : "bg-muted-foreground/15"
              }`}
              style={{ height: `${d.value}%` }}
            />
            <span className="text-[10px] text-muted-foreground">{d.day}</span>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
        <div className="text-center">
          <p className="text-lg font-bold">65</p>
          <p className="text-[10px] text-muted-foreground">Bu Hafta</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">35</p>
          <p className="text-[10px] text-muted-foreground">Geçen Hafta</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-500">+30</p>
          <p className="text-[10px] text-muted-foreground">Değişim</p>
        </div>
      </div>
    </div>
  );
}

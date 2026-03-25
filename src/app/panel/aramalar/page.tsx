"use client";

import { useState, useMemo } from "react";
import { DEMO_KEYWORDS, DEMO_KEYWORD_DISCOVERY } from "@/data/demo-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Compass,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";

// --- Provider colors ---
const PROVIDERS = [
  { key: "chatgpt", label: "ChatGPT", color: "#10A37F" },
  { key: "gemini", label: "Gemini", color: "#8B5CF6" },
  { key: "perplexity", label: "Perplexity", color: "#22D3EE" },
  { key: "ai-overview", label: "AI Overview", color: "#4285F4" },
  { key: "claude", label: "Claude", color: "#D97706" },
  { key: "copilot", label: "Copilot", color: "#00BCF2" },
] as const;

const PLATFORMS = ["Tümü", "ChatGPT", "Gemini", "Perplexity", "AI Overview", "Claude", "Copilot"];

const CITIES = ["Tümü", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Konya"];

const CATEGORIES = [
  { value: "all", label: "Tümü" },
  { value: "satin-alma", label: "Satın Alma" },
  { value: "fiyat", label: "Fiyat" },
  { value: "bilgi", label: "Bilgi" },
];

// Extend DEMO_KEYWORDS with extra display fields
const keywordsWithMeta = DEMO_KEYWORDS.map((kw, i) => ({
  ...kw,
  id: i,
  providers: PROVIDERS.slice(0, 2 + (i % 4)).map((p) => p.key),
  city: i % 2 === 0 ? "İstanbul" : i % 3 === 0 ? "Ankara" : "İzmir",
  lastAnalysis: i === 0 ? "2 saat önce" : i === 1 ? "5 saat önce" : i === 2 ? "1 gün önce" : i === 3 ? "3 gün önce" : "1 hafta önce",
}));

// Discovery tab config
const DISCOVERY_TABS = [
  { key: "satin-alma", emoji: "\u{1F6D2}", label: "Sat\u0131n Alma Niyetli" },
  { key: "rakip-alternatifleri", emoji: "\u{1F504}", label: "Rakip Alternatifleri" },
  { key: "fiyat", emoji: "\u{1F4B0}", label: "Fiyat Kar\u015F\u0131la\u015Ft\u0131rma" },
  { key: "bilgi", emoji: "\u{1F50D}", label: "Bilgi & Ke\u015Fif" },
  { key: "il-bazli", emoji: "\u{1F4CD}", label: "\u0130l Bazl\u0131 Aramalar" },
] as const;

function ProviderDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

// --- Simple dropdown ---
function SimpleDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
      >
        {label}: {value}
        <ChevronDown className="size-3.5 text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 ${
                value === opt ? "font-medium text-black" : "text-gray-600"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Provider select for discovery ---
function ProviderSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = PROVIDERS.find((p) => p.key === value) ?? PROVIDERS[0];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50"
      >
        <ProviderDot color={selected.color} />
        {selected.label}
        <ChevronDown className="size-3 text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[150px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {PROVIDERS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => {
                onChange(p.key);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${
                value === p.key ? "font-medium" : ""
              }`}
            >
              <ProviderDot color={p.color} />
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AramalarPage() {
  // --- State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("Tümü");
  const [cityFilter, setCityFilter] = useState("Tümü");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [autoAnalysis, setAutoAnalysis] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [discoverySelected, setDiscoverySelected] = useState<Set<string>>(new Set());
  const [discoveryProviders, setDiscoveryProviders] = useState<Record<string, string>>({});

  // --- Filtered keywords ---
  const filteredKeywords = useMemo(() => {
    return keywordsWithMeta.filter((kw) => {
      if (searchQuery && !kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (categoryFilter !== "all" && kw.category !== categoryFilter) return false;
      if (cityFilter !== "Tümü" && kw.city !== cityFilter) return false;
      return true;
    });
  }, [searchQuery, platformFilter, cityFilter, categoryFilter]);

  // --- Handlers ---
  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredKeywords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredKeywords.map((kw) => kw.id)));
    }
  }

  function toggleDiscoveryKeyword(kw: string) {
    setDiscoverySelected((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) next.delete(kw);
      else next.add(kw);
      return next;
    });
  }

  function setDiscoveryProvider(kw: string, provider: string) {
    setDiscoveryProviders((prev) => ({ ...prev, [kw]: provider }));
  }

  return (
    <div className="space-y-6">
      {/* Empty state - aktif data yokken gösterilir */}
      {/* {filteredKeywords.length === 0 && (
        <EmptyState
          icon={Search}
          title="Henüz arama eklemediniz"
          description="Takip etmek istediğiniz aramaları ekleyerek başlayın."
          action={<button className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium">+ Arama Ekle</button>}
        />
      )} */}

      {/* --- 3.1 Üst Bar --- */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Arama ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-gray-400"
            />
          </div>

          {/* Platform chips */}
          <div className="flex items-center gap-1">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatformFilter(p)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  platformFilter === p
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* İl dropdown */}
          <SimpleDropdown
            label="İl"
            options={CITIES}
            value={cityFilter}
            onChange={setCityFilter}
          />

          {/* Kategori dropdown */}
          <SimpleDropdown
            label="Kategori"
            options={CATEGORIES.map((c) => c.label)}
            value={CATEGORIES.find((c) => c.value === categoryFilter)?.label ?? "Tümü"}
            onChange={(v) => {
              const cat = CATEGORIES.find((c) => c.label === v);
              setCategoryFilter(cat?.value ?? "all");
            }}
          />

          {/* Buttons */}
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus className="size-4" />
            Arama Ekle
          </button>

          <Dialog open={discoveryOpen} onOpenChange={setDiscoveryOpen}>
            <DialogTrigger
              render={
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
                />
              }
            >
              <Compass className="size-4" />
              Keşfet
            </DialogTrigger>

            {/* --- 3.3 Keşfet Modal --- */}
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Markanız İçin Arama Keşfet</DialogTitle>
                <DialogDescription>
                  Sektörünüze uygun arama önerilerini keşfedin ve takip listenize ekleyin.
                </DialogDescription>
              </DialogHeader>

              {/* Free limit banner */}
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-2 text-xs text-yellow-800">
                5 arama limitine ulaştınız &middot;{" "}
                <a href="#" className="font-medium underline">
                  Pro&apos;ya geçin &rarr;
                </a>
              </div>

              <Tabs defaultValue="satin-alma">
                <TabsList className="w-full flex-wrap" variant="line">
                  {DISCOVERY_TABS.map((tab) => (
                    <TabsTrigger key={tab.key} value={tab.key} className="text-xs">
                      {tab.emoji} {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {DISCOVERY_TABS.map((tab) => {
                  const data =
                    DEMO_KEYWORD_DISCOVERY[
                      tab.key as keyof typeof DEMO_KEYWORD_DISCOVERY
                    ];
                  return (
                    <TabsContent key={tab.key} value={tab.key}>
                      <div className="mt-2 max-h-[320px] space-y-1 overflow-y-auto">
                        {data.keywords.map((kw) => (
                          <div
                            key={kw}
                            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-gray-50"
                          >
                            <label className="flex items-center gap-2.5 text-sm cursor-pointer flex-1 min-w-0">
                              <Checkbox
                                checked={discoverySelected.has(kw)}
                                onCheckedChange={() => toggleDiscoveryKeyword(kw)}
                              />
                              <span className="truncate">{kw}</span>
                            </label>
                            <ProviderSelect
                              value={discoveryProviders[kw] ?? "chatgpt"}
                              onChange={(v) => setDiscoveryProvider(kw, v)}
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>

              <DialogFooter>
                <button
                  type="button"
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setDiscoveryOpen(false)}
                >
                  Tümünü Ekle
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  onClick={() => setDiscoveryOpen(false)}
                >
                  Seçilenleri Ekle ({discoverySelected.size})
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <Switch
              checked={autoAnalysis}
              onCheckedChange={() => setAutoAnalysis(!autoAnalysis)}
            />
            Haftalık otomatik analiz
          </label>
        </div>
      </div>

      {/* --- 3.2 Arama Listesi --- */}
      <div className="rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-shadow">
        {/* Table header */}
        <div className="grid grid-cols-[40px_1fr_120px_80px_120px_80px] items-center gap-2 border-b border-gray-100 px-4 py-3 text-xs font-medium text-gray-500">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                filteredKeywords.length > 0 &&
                selectedIds.size === filteredKeywords.length
              }
              onCheckedChange={toggleSelectAll}
            />
          </div>
          <div>Arama</div>
          <div>Sağlayıcılar</div>
          <div>İl</div>
          <div>Son Analiz</div>
          <div className="text-right">İşlemler</div>
        </div>

        {/* Rows */}
        {filteredKeywords.map((kw) => (
          <div
            key={kw.id}
            className="grid grid-cols-[40px_1fr_120px_80px_120px_80px] items-center gap-2 border-b border-gray-50 px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-center">
              <Checkbox
                checked={selectedIds.has(kw.id)}
                onCheckedChange={() => toggleSelect(kw.id)}
              />
            </div>
            <div className="truncate font-medium text-gray-900">
              {kw.keyword}
            </div>
            <div className="flex items-center gap-1">
              {kw.providers.map((pKey) => {
                const provider = PROVIDERS.find((p) => p.key === pKey);
                return provider ? (
                  <ProviderDot key={pKey} color={provider.color} />
                ) : null;
              })}
            </div>
            <div>
              <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {kw.city}
              </span>
            </div>
            <div className="text-xs text-gray-500">{kw.lastAnalysis}</div>
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredKeywords.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-gray-400">
            Aramanızla eşleşen sonuç bulunamadı.
          </div>
        )}

        {/* Bottom bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span className="text-sm text-gray-600">
              {selectedIds.size} seçili
            </span>
            <button
              type="button"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
            >
              Toplu Sil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

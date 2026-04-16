"use client";

import { useState, useRef, useEffect } from "react";
import { TURKEY_CITIES, searchCities } from "@/data/turkey-cities";
import { X, Search } from "lucide-react";

interface Props {
  selected: string[];
  onChange: (cities: string[]) => void;
  max?: number;
}

export function CityMultiselect({ selected, onChange, max = 3 }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCities = query
    ? searchCities(query, 50)
    : TURKEY_CITIES.filter((c) => !selected.includes(c)).slice(0, 20);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addCity = (city: string) => {
    if (selected.length >= max) return;
    if (selected.includes(city)) return;
    onChange([...selected, city]);
    setQuery("");
  };

  const removeCity = (city: string) => {
    onChange(selected.filter((c) => c !== city));
  };

  const atLimit = selected.length >= max;

  return (
    <div ref={containerRef} className="relative">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {city}
              <button
                type="button"
                onClick={() => removeCity(city)}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={atLimit ? `En fazla ${max} il seçebilirsiniz` : "İl ara... (ör: h → Hakkari, Hatay)"}
          disabled={atLimit}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
        />
      </div>

      {/* Dropdown */}
      {open && !atLimit && filteredCities.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredCities.map((city) => {
            const isSelected = selected.includes(city);
            return (
              <button
                key={city}
                type="button"
                onClick={() => addCity(city)}
                disabled={isSelected}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  isSelected
                    ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {city}
                {isSelected && <span className="text-xs text-gray-400 ml-2">(seçildi)</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {open && !atLimit && filteredCities.length === 0 && query && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-400">
          &quot;{query}&quot; için il bulunamadı
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-gray-400 mt-1.5">
        {selected.length} / {max} il seçildi
      </p>
    </div>
  );
}

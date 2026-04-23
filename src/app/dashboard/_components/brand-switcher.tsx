"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Check } from "lucide-react";

type Brand = {
  id: string;
  name: string;
  domain: string;
};

type Props = {
  brands: Brand[];
  activeBrand: Brand;
};

export function BrandSwitcher({ brands, activeBrand }: Props) {
  // Tek marka varsa dropdown yok, sadece bilgi göster
  if (brands.length <= 1) {
    return (
      <div className="hidden items-center gap-2 text-sm sm:flex">
        <span className="font-medium">{activeBrand.name}</span>
        <span className="text-xs text-muted-foreground">
          {activeBrand.domain}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="flex aspect-square size-6 items-center justify-center rounded bg-black text-[10px] font-semibold text-white">
          {activeBrand.name[0]?.toUpperCase() || "B"}
        </div>
        <div className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-sm font-medium">{activeBrand.name}</span>
          <span className="text-[10px] text-muted-foreground">
            {activeBrand.domain}
          </span>
        </div>
        <ChevronDown className="size-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuLabel>Markalar ({brands.length})</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {brands.map((brand) => {
          const isActive = brand.id === activeBrand.id;
          return (
            <DropdownMenuItem
              key={brand.id}
              render={<Link href={`/dashboard?brand=${brand.id}`} />}
              className="flex cursor-pointer items-center gap-2"
            >
              <div className="flex aspect-square size-7 items-center justify-center rounded bg-muted text-xs font-semibold">
                {brand.name[0]?.toUpperCase() || "B"}
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{brand.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {brand.domain}
                </span>
              </div>
              {isActive && <Check className="size-4" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href="/analiz" />}
          className="flex cursor-pointer items-center gap-2"
        >
          <Plus className="size-4" />
          <span>Yeni Marka Ekle</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

/**
 * BrandSwitcher — subtle border'suz dropdown (Brief F Adım 1.5)
 *
 * - 1 marka: düz metin (brand.name)
 * - Çoklu: dropdown, border-none, hover'da bg-muted
 */

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
  if (brands.length <= 1) {
    return (
      <div className="hidden items-center gap-2 text-sm tracking-tight sm:flex">
        <span className="font-medium">{activeBrand.name}</span>
        <span className="text-xs text-muted-foreground">
          {activeBrand.domain}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm tracking-tight transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="font-medium">{activeBrand.name}</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {activeBrand.domain}
        </span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuLabel className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
          Markalar · {brands.length}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {brands.map((brand) => {
          const isActive = brand.id === activeBrand.id;
          return (
            <DropdownMenuItem
              key={brand.id}
              render={<Link href={`/dashboard?brand=${brand.id}`} />}
              className="flex cursor-pointer items-center gap-3 py-2"
            >
              <div className="flex flex-1 flex-col leading-tight">
                <span className="text-sm font-medium tracking-tight">
                  {brand.name}
                </span>
                <span className="text-[11px] text-muted-foreground">
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
          className="flex cursor-pointer items-center gap-2 py-2"
        >
          <Plus className="size-4" />
          <span className="text-sm tracking-tight">Yeni Marka Ekle</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

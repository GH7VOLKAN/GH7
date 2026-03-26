"use client";

import Link from "next/link";

export function NavSection() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-5 sm:px-10 h-[60px] flex items-center justify-between bg-white/90 backdrop-blur-[16px] border-b border-zinc-100">
      <Link href="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight text-[#09090B] no-underline" style={{ letterSpacing: "-0.5px" }}>
        <div className="w-7 h-7 bg-[#09090B] rounded-[7px] flex items-center justify-center text-white text-[11px] font-extrabold" style={{ letterSpacing: "-0.3px" }}>
          G7
        </div>
        GH7.ai
      </Link>
      <div className="flex items-center gap-7">
        <a href="#profil" className="hidden sm:inline text-[13px] text-zinc-500 font-medium hover:text-[#09090B] no-underline transition-colors">
          Çözümler
        </a>
        <a href="#fiyat" className="hidden sm:inline text-[13px] text-zinc-500 font-medium hover:text-[#09090B] no-underline transition-colors">
          Fiyatlar
        </a>
        <a href="#blog" className="hidden sm:inline text-[13px] text-zinc-500 font-medium hover:text-[#09090B] no-underline transition-colors">
          Blog
        </a>
        <a href="#sss" className="hidden sm:inline text-[13px] text-zinc-500 font-medium hover:text-[#09090B] no-underline transition-colors">
          SSS
        </a>
        <Link href="/login" className="bg-[#09090B] text-white px-[18px] py-2 rounded-lg text-[13px] font-semibold no-underline">
          Giriş
        </Link>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";

export function NavSection() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-5 sm:px-10 h-16 flex items-center justify-between bg-white/90 backdrop-blur-[16px] border-b border-[#E5E7EB]">
      <Link
        href="/"
        className="flex items-center gap-0.5 font-extrabold text-lg tracking-tight text-[#09090B] no-underline"
        style={{ letterSpacing: "-0.5px" }}
      >
        GH7
        <span className="text-[#9CA3AF]">.ai</span>
      </Link>

      <div className="hidden sm:flex items-center gap-7">
        <a
          href="#geo"
          className="text-[13px] text-[#6B7280] font-medium hover:text-[#09090B] no-underline transition-colors"
        >
          GEO Nedir
        </a>
        <a
          href="#pricing"
          className="text-[13px] text-[#6B7280] font-medium hover:text-[#09090B] no-underline transition-colors"
        >
          Fiyatlar
        </a>
        <a
          href="#faq"
          className="text-[13px] text-[#6B7280] font-medium hover:text-[#09090B] no-underline transition-colors"
        >
          SSS
        </a>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden sm:inline text-[13px] text-[#6B7280] font-medium hover:text-[#09090B] no-underline transition-colors"
        >
          Giriş
        </Link>
        <Link
          href="/analiz"
          className="bg-[#09090B] text-white px-[18px] py-2 rounded-lg text-[13px] font-semibold no-underline"
        >
          Ücretsiz Test &rarr;
        </Link>
      </div>
    </nav>
  );
}

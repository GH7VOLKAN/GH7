"use client";
import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href="/" className="logo">GH7<span>.ai</span></Link>
      <ul className="nav-links">
        <li><a href="#cozum">Cozumler</a></li>
        <li><a href="#pricing">Fiyatlar</a></li>
        <li><a href="#faq">SSS</a></li>
      </ul>
      <div className="nav-right">
        <Link href="/giris" className="btn-ghost">Giris</Link>
        <a href="#test" className="btn-black">Ucretsiz Test &rarr;</a>
      </div>
    </nav>
  );
}

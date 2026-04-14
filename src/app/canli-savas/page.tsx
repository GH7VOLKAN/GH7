import { BattleArena } from "@/components/canli-savas/battle-arena";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Canlı AI Savaşı — Yapay Zeka Sizi Tanıyor mu? | GH7",
  description:
    "5 AI platformuna aynı anda sorun, yanıtları canlı izleyin. Markanızın yapay zekada nasıl göründüğünü gerçek zamanlı görün.",
};

export default function CanliSavasPage() {
  return <BattleArena checkFreeLimit />;
}

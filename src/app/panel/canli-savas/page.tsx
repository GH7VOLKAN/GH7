import { checkPageAccess } from "@/lib/check-access";
import { BattleArena } from "@/components/canli-savas/battle-arena";

export default async function PanelCanliSavasPage() {
  await checkPageAccess("pro", "/panel/canli-savas");

  return <BattleArena hideCTA />;
}

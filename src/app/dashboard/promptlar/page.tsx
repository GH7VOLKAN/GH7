import { PromptStatsCards } from "@/components/promptlar/prompt-stats-cards";
import { PromptTable } from "@/components/promptlar/prompt-table";
import { SuggestedPromptsTable } from "@/components/promptlar/suggested-prompts-table";

export default function PromptlarPage() {
  return (
    <>
      <PromptStatsCards />
      <div className="px-4 lg:px-6">
        <PromptTable />
      </div>
      <div className="px-4 lg:px-6">
        <SuggestedPromptsTable />
      </div>
    </>
  );
}

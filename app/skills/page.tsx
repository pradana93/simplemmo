import { SkillPanel } from "@/components/skill-panel";
import { WalletBar } from "@/components/wallet-bar";

export default function SkillsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Skills</h1>
      <WalletBar />
      <SkillPanel />
    </div>
  );
}

import { PvpPanel } from "@/components/pvp-panel";
import { CombatLog } from "@/components/combat-log";

export default function PvpPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">PvP</h1>
      <PvpPanel />
      <CombatLog />
    </div>
  );
}

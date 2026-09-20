import { WalletBar } from "@/components/wallet-bar";
import { CombatLog } from "@/components/combat-log";
import { OfflineClaim } from "@/components/offline-claim";
import { StatsChart } from "@/components/stats-chart";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <WalletBar />
      <OfflineClaim />
      <StatsChart />
      <CombatLog />
      <div className="game-card p-4 text-sm text-muted">
        <p>
          Train skills, fight in PvP, trade on the Black Market. Progress accrues idle for up to 12h
          at 60% efficiency — claim when you return. Hold 100 SHARD for full GOLD rates.
        </p>
      </div>
    </div>
  );
}

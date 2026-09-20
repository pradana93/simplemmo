import { MarketBrowser } from "@/components/market-browser";

export default function MarketPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Black Market</h1>
      <MarketBrowser shardBalance={0} />
      <p className="text-sm text-muted">
        Public: 3% fee • Premium (SHARD-gated): 5% fee into buyback pool • Bids in final 15s extend
        by 15s.
      </p>
    </div>
  );
}

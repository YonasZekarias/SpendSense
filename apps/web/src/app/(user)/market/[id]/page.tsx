"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { TrendChart } from "@/components/market/trend-chart";
import {
  getItemById,
  getPriceAverages,
  getPriceTrends,
  type MarketItem,
  type MarketTrendRow,
  type PriceAverageRow,
} from "@/services/marketService";

function toPrice(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function MarketItemDetailPage() {
  const params = useParams<{ id: string }>();
  const itemId = Number(params.id);
  const [item, setItem] = useState<MarketItem | null>(null);
  const [trends, setTrends] = useState<MarketTrendRow[]>([]);
  const [averages, setAverages] = useState<PriceAverageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(itemId)) {
      setError("Invalid item id.");
      setLoading(false);
      return;
    }

    const boot = async () => {
      setLoading(true);
      setError(null);
      try {
        const [itemResult, trendsResult, averagesResult] = await Promise.all([
          getItemById(itemId),
          getPriceTrends({ item_id: itemId }),
          getPriceAverages({ item_id: itemId }),
        ]);
        setItem(itemResult);
        setTrends(trendsResult);
        setAverages(averagesResult);
      } catch (loadError) {
        const detail =
          loadError instanceof Error ? loadError.message : "Unable to load item details right now.";
        setError(detail);
      } finally {
        setLoading(false);
      }
    };

    void boot();
  }, [itemId]);

  const latestPrice = useMemo(() => {
    if (!trends.length) return null;
    return toPrice(trends[trends.length - 1]?.average_price ?? "0");
  }, [trends]);

  const previousPrice = useMemo(() => {
    if (trends.length < 2) return null;
    return toPrice(trends[trends.length - 2]?.average_price ?? "0");
  }, [trends]);

  const weeklyChange = useMemo(() => {
    if (!latestPrice || !previousPrice || previousPrice === 0) return null;
    return ((latestPrice - previousPrice) / previousPrice) * 100;
  }, [latestPrice, previousPrice]);

  const topCity = useMemo(() => {
    if (!averages.length) return "—";
    const top = averages.slice().sort((a, b) => toPrice(a.average_price) - toPrice(b.average_price))[0];
    return top?.city ?? "—";
  }, [averages]);

  const overallAverage = useMemo(() => {
    if (!averages.length) return null;
    const total = averages.reduce((sum, row) => sum + toPrice(row.average_price), 0);
    return total / averages.length;
  }, [averages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/market" className="inline-flex items-center gap-2 text-sm font-semibold text-[#135bec]">
          <ArrowLeft className="size-4" />
          Back to Market
        </Link>
        <Button asChild className="bg-[#135bec] hover:bg-blue-700">
          <Link href="/market/submit">Submit Price</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold tracking-tight">
            {item?.name ?? `Commodity #${Number.isFinite(itemId) ? itemId : "—"}`}
          </CardTitle>
          <CardDescription>
            {item ? `${item.category} · Unit: ${item.unit}` : "Historical market trends and city-level averages."}
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Card>
          <CardContent className="pt-6 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      {!error && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Current average</CardDescription>
                <CardTitle className="text-2xl text-[#135bec]">
                  {loading || latestPrice == null ? "—" : `${latestPrice.toFixed(2)} ETB`}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Trend change</CardDescription>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  {loading || weeklyChange == null ? (
                    "—"
                  ) : (
                    <>
                      {weeklyChange >= 0 ? (
                        <TrendingUp className="size-5 text-red-500" />
                      ) : (
                        <TrendingDown className="size-5 text-emerald-600" />
                      )}
                      <span className={weeklyChange >= 0 ? "text-red-500" : "text-emerald-600"}>
                        {weeklyChange >= 0 ? "+" : ""}
                        {weeklyChange.toFixed(2)}%
                      </span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Most affordable city</CardDescription>
                <CardTitle className="text-2xl">{loading ? "—" : topCity}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Price Trend</CardTitle>
              <CardDescription>Source: `GET /api/market/trends/`</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart rows={trends} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>City Comparison</CardTitle>
              <CardDescription>Source: `GET /api/market/items/{'{id}'}/` + averages by city</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                National blended average:{" "}
                <span className="font-semibold text-foreground">
                  {overallAverage == null ? "—" : `${overallAverage.toFixed(2)} ETB`}
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead>Average Price</TableHead>
                    <TableHead className="text-right">Submissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!loading && averages.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-muted-foreground" colSpan={3}>
                        No approved city averages available yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    averages
                      .slice()
                      .sort((a, b) => toPrice(a.average_price) - toPrice(b.average_price))
                      .map((row) => (
                        <TableRow key={`${row.city}-${row.item_id}`}>
                          <TableCell>{row.city}</TableCell>
                          <TableCell className="font-semibold">{row.average_price} ETB</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

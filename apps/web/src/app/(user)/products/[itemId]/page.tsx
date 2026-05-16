import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductHero } from "@/components/product-detail/product-hero";
import { PriceHistoryChart } from "@/components/product-detail/price-history-chart";
import { VendorComparisonTable } from "@/components/product-detail/vendor-comparison-table";
import { ChartTimeRange } from "@/components/product-detail/chart-time-range";
import { PriceStatCards } from "@/components/product-detail/price-stat-cards";
import { SimilarProducts } from "@/components/product-detail/similar-products";
import { PriceSubmissions } from "@/components/product-detail/price-submissions";
import { 
  getProductDetail, 
  getPriceHistory, 
  getVendorPriceComparisons, 
  getSimilarProducts, 
  getRecentPriceSubmissions 
} from "@/lib/product-details";

interface ProductPageProps {
  params: Promise<{
    itemId: string;
  }>;
  searchParams: Promise<{
    timeRange?: string;
    location?: string;
  }>;
}

export default async function ProductDetailsPage({ params, searchParams }: ProductPageProps) {
  const { itemId } = await params;
  const resolvedSearchParams = await searchParams;
  const timeRange = resolvedSearchParams.timeRange || '6M';
  const location = resolvedSearchParams.location;

  try {
    // Parallel fetch all data for the page
    const [
      product,
      history,
      vendors,
      similar,
      submissions
    ] = await Promise.all([
      getProductDetail(itemId),
      getPriceHistory(itemId, timeRange),
      getVendorPriceComparisons(itemId, location),
      getSimilarProducts(itemId),
      getRecentPriceSubmissions(itemId)
    ]);

    return (
      <div className="pb-20 max-w-[1600px] mx-auto px-4 md:px-6">
        <ProductHero product={product} />
        
        <div className="mb-8">
          <PriceStatCards product={product} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 bg-white dark:bg-[#1e2330] rounded-3xl border border-[#e5e7eb] dark:border-[#2a3140] p-6 lg:p-8 shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold text-[#111318] dark:text-white">Price History & Forecast</h3>
                <p className="text-sm text-[#616f89] mt-1">Track price changes over time</p>
              </div>
              <ChartTimeRange />
            </div>
            
            <div className="flex-1 min-h-[350px]">
              <PriceHistoryChart history={history} currentPrice={product.currentAveragePrice} />
            </div>
          </div>

          <div className="lg:col-span-4">
            <PriceSubmissions submissions={submissions} />
          </div>
        </div>

        <div className="mb-8" id="compare">
          <VendorComparisonTable vendors={vendors} />
        </div>

        <SimilarProducts products={similar} />
      </div>
    );
  } catch (error) {
    console.error("Failed to load product details", error);
    notFound();
  }
}

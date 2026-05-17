
import { notFound } from "next/navigation";
import { ProductHero } from "@/components/product-detail/product-hero";
import { PriceHistoryChart } from "@/components/product-detail/price-history-chart";
import { VendorComparisonTable } from "@/components/product-detail/vendor-comparison-table";
import { PriceStatCards } from "@/components/product-detail/price-stat-cards";
import { SimilarProducts } from "@/components/product-detail/similar-products";
import { PriceSubmissions } from "@/components/product-detail/price-submissions";
import { VendorOfferPanel } from "@/components/product-detail/vendor-offer-panel";
import type { VendorOfferContext } from "@/components/product-detail/vendor-offer-panel";
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
    // Vendor context (passed when navigating from a vendor page)
    vendorId?: string;
    listingId?: string;
    vendorPrice?: string;
    vendorName?: string;
    vendorLocation?: string;
    vendorRegion?: string;
    vendorRating?: string;
    vendorVerified?: string;
    vendorImageUrl?: string;
    stockQty?: string;
    stockStatus?: string;
  }>;
}

function parseVendorOffer(
  sp: Awaited<ProductPageProps["searchParams"]>,
  itemName: string,
  unit: string,
): VendorOfferContext | null {
  const { vendorId, listingId, vendorPrice, vendorName } = sp;
  if (!vendorId || !listingId || !vendorPrice || !vendorName) return null;

  const price = parseFloat(vendorPrice);
  const listingIdNum = parseInt(listingId, 10);
  if (isNaN(price) || isNaN(listingIdNum)) return null;

  const rawStockStatus = sp.stockStatus;
  const stockStatus: VendorOfferContext["stockStatus"] =
    rawStockStatus === "LowStock" ? "LowStock"
    : rawStockStatus === "OutOfStock" ? "OutOfStock"
    : "InStock";

  return {
    listingId: listingIdNum,
    vendorId,
    vendorName,
    vendorLocation: sp.vendorLocation ?? "",
    vendorRegion: sp.vendorRegion ?? "",
    vendorRating: parseFloat(sp.vendorRating ?? "0") || 0,
    vendorVerified: sp.vendorVerified === "true",
    vendorImageUrl: sp.vendorImageUrl ?? null,
    price,
    unit,
    itemName,
    stockQuantity: parseInt(sp.stockQty ?? "0", 10) || 0,
    stockStatus,
  };
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

    const vendorOffer = parseVendorOffer(resolvedSearchParams, product.name, product.unit);

    return (
      <div className="pb-20 max-w-[1600px] mx-auto px-4 md:px-6">
        {/* Vendor Offer Panel — shown only when navigating from a vendor page */}
        {vendorOffer && (
          <div className="pt-6">
            <VendorOfferPanel offer={vendorOffer} vendorId={vendorOffer.vendorId} />
          </div>
        )}

        <ProductHero product={product} />
        
        <div className="mb-8">
          <PriceStatCards product={product} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 bg-white dark:bg-[#1e2330] rounded-3xl border border-[#e5e7eb] dark:border-[#2a3140] p-6 lg:p-8 shadow-sm flex flex-col">
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

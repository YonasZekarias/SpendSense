import { ProductDetailResponse } from "@/types/api/product-details";
import { ProductImageGallery } from "./product-image-gallery";
import { ProductActions } from "./product-actions";
import { PriceTrendBadge } from "@/components/shared/price-trend-badge";
import { Clock, ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ProductHeroProps {
  product: ProductDetailResponse;
}

export function ProductHero({ product }: ProductHeroProps) {
  const timeAgo = formatDistanceToNow(new Date(product.lastUpdated), { addSuffix: true });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
      {/* Left Column - Visuals */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="relative aspect-square rounded-2xl border bg-white overflow-hidden shadow-sm flex flex-col">
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold rounded-full shadow-sm">
              {product.category}
            </span>
          </div>
          <ProductImageGallery images={product.imageUrls} fallbackName={product.name} />
        </div>
      </div>

      {/* Right Column - Core Info */}
      <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
        <div className="space-y-2">
          <nav className="text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/products" className="hover:text-primary">Groceries</Link>
            <span className="mx-2">›</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {product.name}
          </h1>
          

        </div>

        <div className="flex flex-wrap items-end gap-4 border-b border-border/50 pb-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Current Average Price</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold">{product.currentAveragePrice.toFixed(2)}</span>
              <span className="text-xl text-muted-foreground font-medium">ETB / {product.unit}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pb-1">
            <PriceTrendBadge trend={product.priceTrend} className="text-base bg-muted/50 px-2.5 py-1 rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Updated {timeAgo}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {product.lowestPrice && (
            <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 p-3 rounded-lg flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900/50 p-1.5 rounded-md text-green-600 dark:text-green-400 mt-0.5">
                <ArrowDown className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Lowest Found</p>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {product.lowestPrice.price.toFixed(2)} ETB <span className="font-normal opacity-80">at {product.lowestPrice.vendorName}</span>
                </p>
              </div>
            </div>
          )}

          {product.highestPrice && (
            <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-3 rounded-lg flex items-start gap-3">
              <div className="bg-red-100 dark:bg-red-900/50 p-1.5 rounded-md text-red-600 dark:text-red-400 mt-0.5">
                <ArrowUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Highest Found</p>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  {product.highestPrice.price.toFixed(2)} ETB <span className="font-normal opacity-80">at {product.highestPrice.vendorName}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <ProductActions productId={product.id} unit={product.unit} />
      </div>
    </div>
  );
}

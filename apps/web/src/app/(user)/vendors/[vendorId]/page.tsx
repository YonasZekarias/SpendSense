import { getVendorDetail, getVendorProducts, getVendorReviews } from "@/lib/vendor-details";
import { notFound } from "next/navigation";
import { Star, MapPin, Phone, MessageCircle, Heart, Share2, CheckCircle, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import type { VendorProductListResponse, VendorReviewListResponse } from "@/types/api/vendor-details";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ vendorId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const emptyProductList: VendorProductListResponse = {
  products: [],
  pagination: {
    total_records: 0,
    total_pages: 0,
    page_size: 0,
    current_page: 1,
  },
  categories: [],
  priceRange: { min: 0, max: 0 },
};

const emptyReviewList: VendorReviewListResponse = {
  reviews: [],
  pagination: {
    total_records: 0,
    total_pages: 0,
    page_size: 0,
    current_page: 1,
  },
  averageRating: 0,
  totalReviews: 0,
  distribution: {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  },
};

function normalizeSearchParams(searchParams: Awaited<PageProps["searchParams"]>) {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  );
}

export default async function VendorDetailsPage({ params, searchParams }: PageProps) {
  const { vendorId } = await params;
  const resolvedParams = await searchParams;
  const productParams = normalizeSearchParams(resolvedParams);

  let vendorDetail;

  try {
    vendorDetail = await getVendorDetail(vendorId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const [productsResult, reviewsResult] = await Promise.allSettled([
    getVendorProducts(vendorId, productParams),
    getVendorReviews(vendorId),
  ]);

  const vendorProducts =
    productsResult.status === "fulfilled" ? productsResult.value : emptyProductList;
  const vendorReviews =
    reviewsResult.status === "fulfilled" ? reviewsResult.value : emptyReviewList;
  const productsUnavailable = productsResult.status === "rejected";
  const reviewsUnavailable = reviewsResult.status === "rejected";

  return (
    <div className="container mx-auto py-8 px-4 space-y-10 max-w-7xl">
      {/* 1. Hero Section */}
      <section className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-800 w-full relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 relative -top-16 mb-[-3rem]">
            <div className="w-32 h-32 rounded-full border-4 border-card bg-muted overflow-hidden shrink-0 shadow-md">
              {vendorDetail.imageUrl ? (
                <Image src={vendorDetail.imageUrl} alt={vendorDetail.shopName} width={128} height={128} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center text-3xl font-bold text-muted-foreground">
                  {vendorDetail.shopName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 pt-18 sm:pt-20">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{vendorDetail.shopName}</h1>
                    {vendorDetail.verifiedStatus === "Verified" && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium text-foreground">{vendorDetail.rating}</span>
                      <span>({vendorDetail.reviewCount})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {vendorDetail.location}, {vendorDetail.region}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {vendorDetail.contactInfo}
                    </span>
                  </div>
                  <div className="inline-flex items-center py-1 px-2.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
                    Score: {vendorDetail.competitivenessScore}/100 — Top vendor in {vendorDetail.region}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                  <button className="p-2 border rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 border rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Grid Layout for Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Main Content (Products & Reviews) */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Products</h2>
            <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg border">
                 <div className="text-sm text-muted-foreground px-2">Filters go here (nuqs)</div>
            </div>
            
            {productsUnavailable ? (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card">
                 <Package className="w-12 h-12 text-muted-foreground mb-4" />
                 <h3 className="text-lg font-medium">Products are unavailable</h3>
                 <p className="text-muted-foreground">The vendor profile loaded, but products could not be fetched.</p>
              </div>
            ) : vendorProducts.products.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card">
                 <Package className="w-12 h-12 text-muted-foreground mb-4" />
                 <h3 className="text-lg font-medium">No products found</h3>
                 <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {vendorProducts.products.map(product => {
                  const vendorParams = new URLSearchParams({
                    vendorId: vendorDetail.id,
                    listingId: product.id,
                    vendorPrice: String(product.price),
                    vendorName: vendorDetail.shopName,
                    vendorLocation: vendorDetail.location,
                    vendorRegion: vendorDetail.region,
                    vendorRating: String(vendorDetail.rating),
                    vendorVerified: String(vendorDetail.verifiedStatus === "Verified"),
                    stockQty: String(product.stockQuantity),
                    stockStatus: product.stockStatus,
                  });
                  if (vendorDetail.imageUrl) vendorParams.set("vendorImageUrl", vendorDetail.imageUrl);
                  const productUrl = `/products/${product.itemId}?${vendorParams.toString()}`;

                  return (
                  <Link href={productUrl} key={product.id} className="border rounded-xl p-4 bg-card hover:shadow-md transition-all hover:-translate-y-0.5 block group">
                     <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.itemName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <span className="text-2xl font-bold text-muted-foreground/40">{product.itemName.charAt(0)}</span>
                        )}
                     </div>
                     <p className="font-semibold truncate">{product.itemName}</p>
                     <p className="text-sm text-muted-foreground">{product.category}</p>
                     <div className="flex items-center justify-between mt-2">
                       <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{product.price.toFixed(2)} ETB</p>
                       <p className="text-xs text-muted-foreground">/ {product.unit}</p>
                     </div>
                     <p className={`text-xs mt-1 font-medium ${
                       product.stockStatus === "InStock" ? "text-green-600" :
                       product.stockStatus === "LowStock" ? "text-amber-600" : "text-red-500"
                     }`}>
                       {product.stockStatus === "InStock" ? "✓ In Stock" :
                        product.stockStatus === "LowStock" ? "⚠ Low Stock" : "✗ Out of Stock"}
                     </p>
                  </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold">Reviews ({vendorReviews.totalReviews})</h2>
              {reviewsUnavailable ? (
                <div className="border border-dashed rounded-xl p-6 bg-card text-sm text-muted-foreground">
                  Reviews could not be loaded right now.
                </div>
              ) : (
                <div className="space-y-4">
                 {vendorReviews.reviews.map(review => (
                   <div key={review.id} className="border rounded-xl p-4 bg-card space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                           {review.userInitial}
                        </div>
                        <span className="font-medium">{review.userName}</span>
                        <div className="flex ml-auto text-amber-500">
                           {Array.from({length: review.rating}).map((_, i) => <Star key={i} className="w-3 h-3 fill-current"/>)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                   </div>
                 ))}
                </div>
              )}
          </section>

        </div>

        {/* Right Col: About & Details */}
        <div className="space-y-6">
          <section className="border rounded-2xl p-6 bg-card space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">About the Shop</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {vendorDetail.description}
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Business Hours</span>
                <span className="font-medium">{vendorDetail.businessHours}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">{vendorDetail.deliveryAvailable ? vendorDetail.deliveryEstimate : 'Pick up only'}</span>
              </div>
              <div className="flex justify-between text-sm items-start">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium text-right max-w-[60%] leading-tight">
                   {vendorDetail.paymentMethods.join(", ")}
                </span>
              </div>
            </div>
          </section>

          <section className="border rounded-2xl p-6 bg-card space-y-4">
             <h3 className="font-bold text-lg border-b pb-2">Vendor Stats</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-xs text-muted-foreground">Products</p>
                   <p className="text-xl font-bold">{vendorDetail.itemsListed}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-xs text-muted-foreground">Sales</p>
                   <p className="text-xl font-bold">{vendorDetail.totalSales}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-xs text-muted-foreground">Response Time</p>
                   <p className="text-xl font-bold">{vendorDetail.responseTimeMinutes}m</p>
                </div>
                <div className="space-y-1">
                   <p className="text-xs text-muted-foreground">Member Since</p>
                   <p className="text-sm font-bold mt-1">{new Date(vendorDetail.memberSince).getFullYear()}</p>
                </div>
             </div>
          </section>
        </div>

      </div>
    </div>
  );
}

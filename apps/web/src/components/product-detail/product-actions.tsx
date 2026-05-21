"use client";

import { useState } from "react";
import { Bell, Plus, Scale, Share2, PencilLine } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { PriceAlertModal } from "./price-alert-modal";
import Link from "next/link";
import { toast } from "sonner";
import { ShoppingListQuickAdd } from "./shopping-list-quick-add";

interface ProductActionsProps {
  productId: string;
  unit: string;
}

export function ProductActions({ productId, unit }: ProductActionsProps) {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "SpendSense Price Comparison",
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      <Button 
        onClick={() => setIsAlertModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium"
      >
        <Bell className="w-4 h-4" />
        Set Price Alert
      </Button>
      
      {/* <ShoppingListQuickAdd itemId={productId} unit={unit} /> */}

      <Button variant="outline" className="gap-2" asChild>
        <a href="#compare">
          <Scale className="w-4 h-4" />
          <span className="hidden sm:inline">Compare</span>
        </a>
      </Button>

      <Button variant="ghost" size="icon" onClick={handleShare}>
        <Share2 className="w-4 h-4" />
      </Button>

      <Link 
        href={`/market/submit?item=${productId}`}
        className="ml-auto flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <PencilLine className="w-4 h-4" />
        Submit Price
      </Link>

      <PriceAlertModal 
        itemId={productId}
        isOpen={isAlertModalOpen} 
        onClose={() => setIsAlertModalOpen(false)} 
      />
    </div>
  );
}

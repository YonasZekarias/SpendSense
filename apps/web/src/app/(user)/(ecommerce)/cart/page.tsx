"use client";

import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Store, 
  Wallet, 
  ShoppingCart, 
  MoreHorizontal, 
  Plus, 
  Settings, 
  LogOut, 
  Search, 
  HelpCircle, 
  Trash2, 
  Minus, 
  Tag, 
  ArrowRight, 
  Lightbulb, 
  TrendingDown, 
  ShieldCheck, 
  HeadphonesIcon 
} from "lucide-react";

import { getCart, addToCart } from "@/actions/ecommerce";
import type { Cart, CartItem } from "@/lib/ecommerce-types";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import { Card, CardContent } from "@repo/ui/components/card";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCart() {
      setLoading(true);
      setError(null);

      try {
        const response = await getCart();
        if (!active) {
          return;
        }

        setCart(response);
        setItems(response.items);
      } catch {
        if (active) {
          setError("Unable to load cart.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCart();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading cart...</div>;
  }

  if (error) {
    return <div className="p-8 text-sm text-destructive">{error}</div>;
  }

  const updateQuantity = (id: number, delta: number) => {
    const current = items.find((item) => item.listing_id === id);
    if (!current) {
      return;
    }

    if (delta > 0) {
      void addToCart({
        listing_id: current.listing_id,
        vendor_id: current.vendor_id,
        item_name: current.item_name,
        unit: current.unit,
        quantity: delta,
        unit_price: current.unit_price,
      }).then((nextCart) => {
        setCart(nextCart);
        setItems(nextCart.items);
      }).catch(() => {
        setError("Unable to update cart quantity.");
      });
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.listing_id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
      ),
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.listing_id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const serviceFee = 5.0;
  const total = subtotal + tax + serviceFee;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Main Content Area */}
      <div className="flex-1">


        {/* Content */}
        <main className=" max-w-7xl mx-auto pb-24 lg:pb-8">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Shopping Cart</h2>
            <nav className="flex items-center text-sm font-medium text-muted-foreground">
              <span className="hover:text-primary cursor-pointer">Market</span>
              <span className="mx-2">/</span>
              <span className="text-primary">Cart</span>
            </nav>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Column: List */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {items.map((item) => (
                <Card key={`${item.vendor_id}-${item.listing_id}`} className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-primary/5">
                        <LayoutDashboard className="text-primary" size={32} />
                    </div>
                    
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg">{item.item_name}</h3>
                        <p className="font-bold text-primary">
                          ETB {item.unit_price.toFixed(2)} <span className="text-xs font-medium text-muted-foreground">/unit</span>
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {item.unit ? item.unit : `Listing #${item.listing_id}`} • Vendor {item.vendor_id}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-secondary rounded-lg p-1">
                          <button 
                            onClick={() => updateQuantity(item.listing_id, -1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-background rounded transition-all active:scale-90"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-4 font-bold text-sm">{item.quantity.toString().padStart(2, '0')}</span>
                          <button 
                            onClick={() => updateQuantity(item.listing_id, 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-background rounded transition-all active:scale-90"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.listing_id)}
                          className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {items.length === 0 && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-8 text-sm text-muted-foreground">
                    Your cart is empty.
                  </CardContent>
                </Card>
              )}

              {/* Promo Code */}
              <div className="flex items-center gap-4 rounded-xl bg-secondary p-4">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input className="border-none bg-background pl-10 h-12" placeholder="Promo code" />
                </div>
                <Button variant="outline" className="h-12 px-8 font-bold">Apply</Button>
              </div>
            </div>

            {/* Right Column: Checkout */}
            <aside className="col-span-12 lg:col-span-4 space-y-8">
              <Card className="border-none shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h4 className="font-extrabold text-lg">Order Summary</h4>
                </div>
                <CardContent className="p-6 space-y-4">
                  <SummaryRow label={`Subtotal (${items.length} items)`} value={`ETB ${subtotal.toFixed(2)}`} />
                  <SummaryRow label="Infrastructure Tax" value={`ETB ${tax.toFixed(2)}`} />
                  <SummaryRow label="Service Fee" value={`ETB ${serviceFee.toFixed(2)}`} />
                  
                  <Separator className="my-4 border-dashed" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Monthly</span>
                    <span className="text-2xl font-extrabold text-primary">ETB {total.toFixed(2)}</span>
                  </div>

                  <Button className="w-full h-14 rounded-xl font-extrabold text-lg gap-2 mt-4 shadow-lg shadow-primary/20">
                    Proceed to Checkout <ArrowRight size={20} />
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold mt-4">
                    Secure Payment Powered by EthioPay
                  </p>
                </CardContent>
              </Card>

              {/* Tip Card */}
              <div className="relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground group">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                      <Lightbulb size={16} fill="currentColor" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">SpendSense Tip</span>
                  </div>
                  <h5 className="text-lg font-bold mb-2">Save up to ETB 45/mo</h5>
                  <p className="text-sm text-primary-foreground/80 leading-relaxed mb-6">
                    Combining your items by vendor can reduce duplicate delivery costs and simplify procurement.
                  </p>
                  <Button variant="secondary" size="sm" className="font-bold text-primary">
                    Apply Recommendation
                  </Button>
                </div>
                <TrendingDown className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
                  <ShieldCheck className="text-primary" size={18} />
                  <span className="text-[10px] font-bold leading-tight">256-bit AES Encryption</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
                  <HeadphonesIcon className="text-primary" size={18} />
                  <span className="text-[10px] font-bold leading-tight">24/7 Expert Support</span>
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <div className="fixed bottom-0 left-0 flex h-16 w-full items-center justify-around border-t bg-background px-4 lg:hidden z-50">
          <LayoutDashboard className="text-muted-foreground" />
          <Store className="text-muted-foreground" />
          <div className="flex h-12 w-12 -translate-y-4 items-center justify-center rounded-full bg-primary text-white shadow-lg">
            <ShoppingCart fill="currentColor" />
          </div>
          <Wallet className="text-muted-foreground" />
          <Settings className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

// Sub-components for cleaner code
function NavItem({ icon, label, active = false, variant = "default" }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  variant?: "default" | "destructive"
}) {
  return (
    <div className={`
      group flex items-center px-4 py-3 cursor-pointer transition-all duration-200
      ${active 
        ? "text-primary font-bold border-r-4 border-primary bg-primary/10" 
        : "text-muted-foreground font-medium hover:bg-secondary"}
      ${variant === "destructive" ? "hover:text-destructive" : ""}
    `}>
      <span className="mr-3">{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
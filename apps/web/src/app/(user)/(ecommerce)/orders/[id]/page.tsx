"use client";

import {
	Box,
	Check,
	ChevronRight,
	Clock,
	Download,
	Headset,
	MapPin,
	TrendingUp,
	Truck,
	Verified
} from "lucide-react";
import React from "react";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";

export default function OrderDetailsPage() {
  const items = [
    {
      id: 1,
      name: "Precision Workstation Pro",
      price: 1299.0,
      specs: "Space Gray | 32GB RAM | 1TB SSD",
      qty: 1,
      img: "/products/laptop.jpg"
    },
    {
      id: 2,
      name: "SonicFlow ANC Headphones",
      price: 349.0,
      specs: "Carbon Black | Midnight Edition",
      qty: 1,
      img: "/products/headphones.jpg"
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
            <span>Orders</span>
            <ChevronRight size={10} />
            <span className="text-primary">#ORD-2024-8821</span>
          </nav>
          <h2 className="text-3xl font-extrabold tracking-tight">Order Details</h2>
          <p className="text-muted-foreground mt-1">Placed on October 24, 2023 at 2:45 PM</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 font-semibold shadow-sm">
            <Download size={16} /> Invoice
          </Button>
          <Button className="gap-2 font-semibold shadow-sm">
            <Headset size={16} /> Get Help
          </Button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Delivery Status Stepper */}
        <Card className="lg:col-span-12 border-none shadow-sm bg-card">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-bold text-lg">Delivery Status</h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold px-3 py-1">
                In Transit
              </Badge>
            </div>
            
            <div className="relative px-4">
              {/* Connector Line */}
              <div className="absolute top-5 left-10 right-10 h-1 bg-muted z-0">
                <div className="h-full bg-primary w-2/3 rounded-full transition-all duration-1000" />
              </div>
              
              <div className="relative z-10 flex justify-between">
                <StatusStep icon={<Check size={20}/>} label="Ordered" sub="Oct 24, 02:45 PM" active />
                <StatusStep icon={<Check size={20}/>} label="Processed" sub="Oct 24, 05:12 PM" active />
                <StatusStep icon={<Truck size={20}/>} label="In Transit" sub="Oct 25, 09:00 AM" active pulse />
                <StatusStep icon={<Box size={20}/>} label="Delivered" sub="Pending" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Item List & Map */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-base font-bold">Order Items ({items.length})</CardTitle>
            </CardHeader>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex items-center gap-6 group">
                  <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-slate-200 animate-pulse" /> {/* Placeholder for img */}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-bold group-hover:text-primary transition-colors">{item.name}</h4>
                      <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.specs}</p>
                    <div className="mt-2 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded w-fit">
                      Qty: {item.qty}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Shipment Map Placeholder */}
          <div className="bg-muted rounded-xl shadow-sm overflow-hidden h-[300px] relative border border-border">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
               {/* Map integration here (Google Maps/Leaflet) */}
               <p className="text-xs uppercase tracking-widest font-bold">Live Tracking Map: Addis Ababa</p>
            </div>
            <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
              <div className="bg-background/90 backdrop-blur-md p-3 rounded-lg shadow-md border pointer-events-auto">
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Last Location</p>
                <p className="text-xs font-bold">Logistics Hub, Addis Ababa</p>
              </div>
              <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-md pointer-events-auto flex items-center gap-2">
                <Clock size={14} />
                <span className="text-xs font-bold">Arriving in 2h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment Summary */}
          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg mb-4">Payment Summary</h3>
              <div className="space-y-3 text-sm">
                <SummaryRow label="Subtotal" value="$1,648.00" />
                <SummaryRow label="Shipping (Express)" value="$25.00" />
                <SummaryRow label="Tax (VAT 15%)" value="$247.20" />
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base">Total</span>
                  <span className="text-2xl font-black text-primary">$1,920.20</span>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-muted/50 rounded-lg flex items-center gap-3">
                <div className="w-10 h-6 bg-slate-900 rounded flex items-center justify-center text-[8px] text-white font-bold">
                  VISA
                </div>
                <div>
                  <p className="text-[10px] font-bold">Ending in 4429</p>
                  <p className="text-[10px] text-muted-foreground">Expires 08/26</p>
                </div>
                <Verified size={16} className="ml-auto text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <MapPin size={18} />
                <h3 className="font-bold text-foreground">Shipping Address</h3>
              </div>
              <p className="font-bold text-sm">Amanuel Tekle</p>
              <address className="not-italic text-sm text-muted-foreground leading-relaxed mt-1">
                Bole Road, Africa Avenue<br/>
                Noah Plaza, 4th Floor<br/>
                Addis Ababa, 1000<br/>
                Ethiopia
              </address>
              <Separator className="my-4" />
              <p className="text-xs font-bold text-muted-foreground uppercase">Phone Number</p>
              <p className="text-sm font-medium">+251 911 234 567</p>
            </CardContent>
          </Card>

          {/* Smart Tip - Glassmorphism style */}
          <Card className="bg-primary text-primary-foreground border-none shadow-lg relative overflow-hidden">
            <CardContent className="p-6 relative z-10">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <TrendingUp size={18} /> Smart Tip
              </h4>
              <p className="text-primary-foreground/80 text-xs leading-relaxed">
                You've saved <span className="text-white font-extrabold">$42.50</span> in transaction fees this month by using SpendSense Direct pay.
              </p>
              <Button variant="link" className="mt-2 h-auto p-0 text-white font-bold text-xs underline decoration-white/30 hover:decoration-white">
                View Savings Report
              </Button>
            </CardContent>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </Card>
        </div>
      </div>
    </div>
  );
}

// Sub-components for cleaner JSX
function StatusStep({ 
  icon, 
  label, 
  sub, 
  active = false, 
  pulse = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  sub: string; 
  active?: boolean; 
  pulse?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center max-w-[100px]">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all
        ${active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}
        ${pulse ? 'ring-4 ring-primary/20 animate-pulse' : ''}
      `}>
        {icon}
      </div>
      <span className={`mt-3 text-xs font-bold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
      <span className="text-[10px] text-muted-foreground">{sub}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
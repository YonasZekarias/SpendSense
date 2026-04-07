import React from "react";
import { 
  TrendingDown, 
  TrendingUp, 
  CheckCircle, 
  Store,
  Coffee, 
  Barrel,
  MapPin, 
  Verified, 
  Search,
  Bell
} from "lucide-react";

// Standard UI Components
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

export default function SmartShopping() {
  return (
    <div className="flex min-h-screen bg-[#f6f6f8] text-[#111318]">
      
      {/* --- Main Content --- */}
      <main className="ml-64 flex-1 min-h-screen">
        
        {/* Header Section */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec] transition-all outline-none" 
              placeholder="Search for items..." 
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell size={20} />
            </Button>
            <Avatar className="size-8 border-2 border-[#dbe1ff]">
              <AvatarImage src="/api/placeholder/32/32" />
              <AvatarFallback>YA</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Page Title & Status */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-1">Smart Shopping</h2>
              <p className="text-slate-500">Real-time market insights across Addis Ababa.</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 py-1 px-3 gap-1.5">
              <CheckCircle size={14} fill="currentColor" className="text-green-600" />
              Market Updated 2m ago
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: Items & Vendor Table */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Trending Items Section */}
              <section>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Store className="text-[#135bec]" size={20} />
                  Trending Items
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ItemCard 
                    title="Sidamo Coffee Beans"
                    priceRange="850 - 920"
                    unit="/ kg"
                    icon={<Coffee size={24} />}
                    vendor="Kaldi's"
                    forecast="Buy Now (Price drop expected to end)"
                    forecastType="positive"
                  />
                  <ItemCard 
                    title="Sunflower Oil (3L)"
                    priceRange="1,200 - 1,450"
                    unit=""
                    icon={<Barrel size={24} />}
                    vendor="Shoa"
                    forecast="Wait (Supplies increasing next week)"
                    forecastType="warning"
                    color="tertiary"
                  />
                </div>
              </section>

              {/* Vendor Comparison Table */}
              <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold">Detailed Vendor Comparison</h3>
                  <Button variant="link" className="text-[#135bec] p-0 font-medium">View Map</Button>
                </div>
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-[10px] uppercase font-bold px-6">Vendor Name</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-6">Current Price</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-6">Distance</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-6">Status</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-6 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <VendorRow name="Shoa Supermarket" price="1,210" dist="1.2 km" badge="BEST DEAL" />
                    <VendorRow name="Friendship Mart" price="1,340" dist="0.8 km" badge="AVAILABLE" neutral />
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* RIGHT: Sidebar Recommendations */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* AI Recommendation Highlight */}
              <Card className="bg-[#135bec] text-white p-6 rounded-xl shadow-xl relative overflow-hidden group border-none">
                <div className="absolute -right-8 -bottom-8 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
                  <Verified size={160} fill="white" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-4">Smart Recommendation</h4>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Verified size={28} fill="white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-tight">Buy Groceries Now</p>
                      <p className="text-white/70 text-sm">Optimal pricing trend</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-80">Best Location</span>
                      <span className="font-bold">Shoa, Bole</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3">
                      <span className="opacity-80">Est. Savings</span>
                      <span className="font-bold text-green-300">+2,450 ETB / mo</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 py-6 bg-white text-[#135bec] hover:bg-slate-100 font-bold rounded-xl shadow-lg">
                    Add to Shopping List
                  </Button>
                </div>
              </Card>

              {/* Savings Velocity Visualization */}
              <Card className="p-6 border-slate-200 shadow-sm bg-white">
                <h4 className="font-bold mb-4">Savings Velocity</h4>
                <div className="h-32 w-full flex items-end gap-2 px-1">
                  {[40, 55, 45, 75, 65, 90, 80].map((h, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-t-sm bg-[#135bec] transition-all hover:brightness-110`} 
                      style={{ height: `${h}%`, opacity: i === 5 ? 1 : 0.4 }} 
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-4 text-center">
                  Efficiency improved by <span className="text-[#135bec] font-bold">12%</span> this month.
                </p>
              </Card>

              {/* Quick Map Look */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm h-48 relative bg-slate-200">
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10" />
                <div className="absolute bottom-4 left-4 z-20">
                  <p className="text-white font-bold text-sm">Nearby Vendors (12)</p>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <MapPin size={10} /> Bole, Addis Ababa
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

{/* --- Atomic UI Elements --- */}

function ItemCard({ title, priceRange, unit, icon, vendor, forecast, forecastType, color = "primary" }: any) {
  const isPositive = forecastType === "positive";
  return (
    <Card className="bg-white p-5 border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${color === 'primary' ? 'bg-[#dbe1ff]/40 text-[#135bec]' : 'bg-[#ffdbcf]/40 text-[#902e00]'} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <Badge className={`text-[9px] ${color === 'primary' ? 'bg-[#135bec]' : 'bg-slate-500'} text-white border-none`}>
          Cheapest: {vendor}
        </Badge>
      </div>
      <h4 className="font-bold text-lg">{title}</h4>
      <p className="text-[#135bec] font-semibold text-xl mb-3">{priceRange} ETB <span className="text-xs font-normal text-slate-400">{unit}</span></p>
      <div className={`flex items-center gap-2 py-2 px-3 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
        {isPositive ? <TrendingDown size={14} className="text-green-600" /> : <TrendingUp size={14} className="text-red-600" />}
        <span className={`text-[11px] font-medium ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
          {forecast}
        </span>
      </div>
    </Card>
  );
}

function VendorRow({ name, price, dist, badge, neutral = false }: any) {
  return (
    <TableRow className="hover:bg-slate-50 transition-colors">
      <TableCell className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">
            {name.charAt(0)}
          </div>
          <span className="font-semibold text-sm">{name}</span>
        </div>
      </TableCell>
      <TableCell className="px-6 py-4 font-medium text-sm">{price} ETB</TableCell>
      <TableCell className="px-6 py-4 text-slate-500 text-sm">{dist}</TableCell>
      <TableCell className="px-6 py-4">
        <Badge className={`text-[10px] font-bold ${neutral ? 'bg-slate-100 text-slate-600' : 'bg-[#135bec] text-white'} border-none`}>
          {badge}
        </Badge>
      </TableCell>
      <TableCell className="px-6 py-4 text-right">
        <Button variant="ghost" size="sm" className="text-[#135bec] font-bold">Directions</Button>
      </TableCell>
    </TableRow>
  );
}
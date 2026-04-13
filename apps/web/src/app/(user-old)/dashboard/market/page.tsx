"use client";

import {
    Bell,
    DollarSign,
    Filter,
    MapPin,
    Menu,
    Minus,
    Search,
    ShoppingBasket,
    ShoppingCart,
    TrendingDown,
    TrendingUp
} from "lucide-react";
import { useState } from "react";

// Monorepo Imports
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@repo/ui/components/table";
import Link from "next/link";

export default function MarketPricesPage() {
  const [items] = useState([
    { id: 1, name: "Teff (Magna)", category: "Grains & Cereals", unit: "100 kg", avg: "14,500 ETB", best: "13,800 ETB", location: "Shola Market", trend: "-2.1%", trendType: "down", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop" },
    { id: 2, name: "Coffee Beans (Raw)", category: "Beverages", unit: "1 kg", avg: "480 ETB", best: "450 ETB", location: "Merkato", trend: "+5.3%", trendType: "up", img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop" },
    { id: 3, name: "Red Onions", category: "Vegetables", unit: "1 kg", avg: "75 ETB", best: "62 ETB", location: "Atkilt Tera", trend: "0.0%", trendType: "flat", img: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=100&h=100&fit=crop" },
    { id: 4, name: "Cooking Oil", category: "Household", unit: "5 Liters", avg: "1,150 ETB", best: "1,080 ETB", location: "Alle Bejimla", trend: "-1.5%", trendType: "down", img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop" },
    { id: 5, name: "Berbere", category: "Spices", unit: "1 kg", avg: "650 ETB", best: "600 ETB", location: "Kera Market", trend: "+3.8%", trendType: "up", img: "https://images.unsplash.com/photo-1599940824399-b87987cb9723?w=100&h=100&fit=crop" },
  ]);

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101622] font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2330] px-6 md:px-10 lg:px-40 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-[#135bec]">
             <DollarSign size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#111318] dark:text-white">PriceWatch ET</h2>
        </div>
        
        <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
          <nav className="flex items-center gap-6">
            <Button variant="ghost" className="text-sm font-medium text-slate-500">Dashboard</Button>
            <Button variant="ghost" className="text-sm font-bold text-[#135bec]">Market Trends</Button>
            <Button variant="ghost" className="text-sm font-medium text-slate-500">Budget Planner</Button>
            <Button variant="ghost" className="text-sm font-medium text-slate-500">Profile</Button>
          </nav>
          <Button className="bg-[#135bec] hover:bg-blue-700 text-white font-bold h-9 px-6">Login</Button>
        </div>
        
        <div className="md:hidden">
          <Menu className="text-slate-900 dark:text-white" />
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-40 py-8">
        {/* Page Title & Live Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#111318] dark:text-white tracking-tight">Current Market Prices</h1>
            <p className="text-[#616f89] dark:text-gray-400 mt-2">Live tracking of essential goods and cost-of-living metrics across Ethiopia.</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full border border-green-100 dark:border-green-900/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">Live Feed Active • Updated 2m ago</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MarketStatCard 
            title="Avg. Basket Cost" 
            value="4,250 ETB" 
            badge="+2.4% vs last week" 
            badgeType="positive"
            icon={<ShoppingBasket className="text-[#135bec]" />}
          />
          <MarketStatCard 
            title="Most Volatile Item" 
            value="Red Onions" 
            subValue="/ kg"
            badge="High Volatility" 
            badgeType="negative"
            icon={<TrendingUp className="text-orange-600" />}
          />
          <MarketStatCard 
            title="Best Value Vendor" 
            value="Merkato Zone 3" 
            badge="Addis Ababa" 
            badgeType="neutral"
            icon={<ShoppingCart className="text-purple-600" />}
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-white dark:bg-[#1e2330] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <Input 
              className="pl-10 bg-slate-50 dark:bg-[#2a3140] border-none focus-visible:ring-2 focus-visible:ring-[#135bec]" 
              placeholder="Search items (e.g. Teff, Coffee, Onions)..." 
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <SelectDropdown placeholder="Category: All" items={["Grains", "Vegetables", "Household"]} />
            <SelectDropdown placeholder="Region: Addis" items={["Addis Ababa", "Dire Dawa", "Hawassa"]} />
            <SelectDropdown placeholder="Sort: Popularity" items={["Low to High", "High to Low"]} />
            <Button variant="secondary" size="icon" className="bg-slate-50 dark:bg-[#2a3140]">
              <Filter size={18} className="text-slate-500" />
            </Button>
          </div>
        </div>

        {/* Price Table */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-[#252b38]">
                <TableRow className="border-b border-slate-200 dark:border-slate-800">
                  <TableHead className="py-4 pl-6 uppercase text-[10px] font-bold tracking-widest text-slate-500">Item Name</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest text-slate-500">Unit</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest text-slate-500">National Avg.</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest text-[#135bec]">Best Price</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest text-slate-500">Location</TableHead>
                  <TableHead className="text-center uppercase text-[10px] font-bold tracking-widest text-slate-500">Trend (7d)</TableHead>
                  <TableHead className="pr-6 text-right uppercase text-[10px] font-bold tracking-widest text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors border-slate-100 dark:border-slate-800">
                    <TableCell className="py-4 pl-6">
                      <Link href={`/dashboard/market/${item.id}`} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100">
                          <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#135bec] transition-colors">{item.name}</p>
                          <p className="text-[11px] text-slate-500">{item.category}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.unit}</TableCell>
                    <TableCell className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">{item.avg}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-50 dark:bg-blue-900/40 text-[#135bec] dark:text-blue-300 border-blue-100 dark:border-blue-800 font-bold px-3 py-1">
                        {item.best}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <MapPin size={14} className="text-slate-400" />
                        {item.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center justify-center gap-1 text-xs font-bold ${
                        item.trendType === 'down' ? 'text-green-600' : item.trendType === 'up' ? 'text-red-500' : 'text-slate-400'
                      }`}>
                        {item.trendType === 'down' && <TrendingDown size={16} />}
                        {item.trendType === 'up' && <TrendingUp size={16} />}
                        {item.trendType === 'flat' && <Minus size={16} />}
                        {item.trend}
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#135bec]">
                        <Bell size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-[#252b38] border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="text-slate-900 dark:text-white font-bold">1-5</span> of 128 results
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold">Next</Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

// Helper Components
function MarketStatCard({ title, value, subValue, badge, badgeType, icon }: any) {
  const badgeStyles = {
    positive: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    negative: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
  };

  return (
    <Card className="bg-white dark:bg-[#1e2330] border-slate-200 dark:border-slate-800 shadow-sm p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-slate-50 dark:bg-[#2a3140] rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
          {icon}
        </div>
        <Badge variant="outline" className={`border-none font-bold text-[10px] px-2 py-1 ${badgeStyles[badgeType as keyof typeof badgeStyles]}`}>
          {badge}
        </Badge>
      </div>
      <p className="text-xs font-semibold text-slate-500 mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
        {subValue && <span className="text-xs text-slate-400 font-medium">{subValue}</span>}
      </div>
    </Card>
  );
}

function SelectDropdown({ placeholder, items }: { placeholder: string; items: string[] }) {
  return (
    <Select>
      <SelectTrigger className="w-[160px] h-10 bg-slate-50 dark:bg-[#2a3140] border-none font-semibold text-xs focus:ring-2 focus:ring-[#135bec]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map(item => (
          <SelectItem key={item} value={item.toLowerCase()}>{item}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
import React from "react";
import { 
  LayoutDashboard, 
  ReceiptText, 
  Wallet, 
  TrendingUp, 
  ShoppingCart, 
  Settings, 
  Search, 
  Bell, 
  Info, 
  Verified, 
  Tag, 
  Download,
  ChevronDown
} from "lucide-react";

// Shadcn & Custom Monorepo Components
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
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

// Note: In a real app, you'd use Recharts here for the "Price Trend Prediction" 
// but I've maintained the layout structure for now.

export default function PriceForecast() {
  return (
    <div className="flex min-h-screen bg-[#f6f6f8] text-[#111318]">
      
      {/* --- Side Navigation --- */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-white flex flex-col p-4 z-50">
        <div className="px-2 py-4 mb-4">
          <h1 className="text-xl font-black tracking-tighter text-[#135bec]">SpendSense</h1>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Ethiopia</p>
        </div>
        
        <nav className="flex flex-col space-y-1">
          <SideNavItem icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SideNavItem icon={<ReceiptText size={20} />} label="Expenses" />
          <SideNavItem icon={<Wallet size={20} />} label="Budgets" />
          <SideNavItem icon={<TrendingUp size={20} />} label="Forecast" active />
          <SideNavItem icon={<ShoppingCart size={20} />} label="Smart Shopping" />
          <SideNavItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="mt-auto p-4 bg-[#dbe1ff]/30 rounded-xl border border-[#dbe1ff]">
          <p className="text-xs font-bold text-[#135bec] mb-1">PRO PLAN</p>
          <p className="text-[11px] text-slate-500 leading-tight">Access advanced ML trends and real-time market data.</p>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="ml-64 flex-1 min-h-screen">
        
        {/* Header */}
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-[#135bec]">SpendSense Ethiopia</span>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <Search size={16} className="text-slate-400" />
              <input className="bg-transparent border-none text-sm focus:ring-0 w-48 placeholder:text-slate-400" placeholder="Search commodities..." />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell size={20} className="text-slate-600" />
            </Button>
            <Avatar className="size-8 border border-slate-200">
              <AvatarImage src="/api/placeholder/32/32" />
              <AvatarFallback>ET</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Price Forecast</h2>
              <p className="text-slate-500 mt-1">Predict future price trends using AI and historical market data.</p>
            </div>
            <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
              <Button variant="ghost" size="sm" className="text-xs h-8 px-4">7d</Button>
              <Button variant="secondary" size="sm" className="text-xs h-8 px-4 bg-white shadow-sm text-[#135bec]">30d</Button>
              <Button variant="ghost" size="sm" className="text-xs h-8 px-4">90d</Button>
            </div>
          </div>

          {/* Filter Bar */}
          <Card className="p-4 flex flex-wrap items-center gap-6 shadow-sm bg-white border-slate-200">
            <FilterDropdown label="Item" value="White Teff (Sergegna)" />
            <FilterDropdown label="Location" value="Addis Ababa (Merkato)" />
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-400 italic">
              <Info size={14} />
              Last updated: Today, 08:45 AM
            </div>
          </Card>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Chart Area */}
            <Card className="lg:col-span-3 p-6 shadow-sm bg-white border-slate-200 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bold">Price Trend Prediction</h3>
                  <p className="text-xs text-slate-500">ETB per Quintal • Monthly View</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <LegendItem label="Historical" dashed={false} />
                  <LegendItem label="Forecast" dashed={true} />
                </div>
              </div>
              
              {/* Visual Placeholder for ML Chart */}
              <div className="h-80 w-full bg-linear-to-b from-[#135bec]/5 to-transparent rounded-lg flex items-center justify-center border border-dashed border-slate-200">
                <p className="text-xs text-slate-400">ML Visualizer Component (BiLSTM Output)</p>
              </div>
            </Card>

            {/* Sidebar Stats */}
            <div className="space-y-4">
              <InsightCard 
                label="Expected Trend" 
                value="Rising" 
                icon={<TrendingUp className="text-[#135bec]" />}
                description={<>Prices expected to increase by <span className="text-[#e73908] font-bold">4.2%</span> over the next 30 days.</>}
              />
              <InsightCard 
                label="Price Range" 
                value="6,450 - 6,820" 
                icon={<Tag className="text-[#135bec]" />}
                description="ETB / Quintal"
                showProgress
              />
              <Card className="bg-[#135bec] p-5 shadow-sm text-white border-none">
                <div className="flex items-center justify-between mb-4 opacity-80">
                  <span className="text-xs font-bold uppercase tracking-widest">Confidence Score</span>
                  <Verified size={20} />
                </div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl font-black">92%</h4>
                  <span className="text-xs font-medium opacity-80">High</span>
                </div>
                <p className="text-[10px] mt-3 opacity-70 italic">Based on local market data and rainfall correlations.</p>
              </Card>
            </div>
          </div>

          {/* Data Table */}
          <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold">Weekly Price Projections</h3>
              <Button variant="ghost" size="sm" className="text-[#135bec] font-bold gap-1.5">
                <Download size={14} /> Export CSV
              </Button>
            </div>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-bold px-6">Week Period</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold px-6">Projected Price (ETB)</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold px-6">Change (%)</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold px-6">Market Condition</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold px-6">Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <ForecastRow date="Jan 15 - Jan 21" price="6,420" change="+0.8%" status="Tight Supply" confidence={98} />
                <ForecastRow date="Jan 22 - Jan 28" price="6,550" change="+2.0%" status="High Demand" confidence={92} />
              </TableBody>
            </Table>
          </Card>

          {/* Footer */}
          <footer className="flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 pt-8 border-t border-slate-200 gap-4">
            <div className="flex items-center gap-4">
              <span>© 2026 SpendSense Ethiopia</span>
              <button className="hover:text-[#135bec]">Methodology</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              ML Engine: Active & Calibrated (Model v2.4.1)
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

{/* --- Atomic UI Components --- */}

function SideNavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full ${active ? "bg-slate-100 text-[#135bec] font-semibold" : "text-slate-600 hover:bg-slate-50 font-medium"}`}>
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

function FilterDropdown({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-slate-500">{label}:</span>
      <Button variant="outline" size="sm" className="bg-slate-50 gap-2 font-medium">
        {value} <ChevronDown size={14} />
      </Button>
    </div>
  );
}

function LegendItem({ label, dashed }: { label: string, dashed: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-0.5 bg-[#135bec] ${dashed ? 'border-t border-dashed border-[#135bec] bg-transparent' : ''}`} />
      <span>{label}</span>
    </div>
  );
}

function InsightCard({ label, value, icon, description, showProgress }: any) {
  return (
    <Card className="p-5 shadow-sm bg-white border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className={`text-2xl font-black`}>{value}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      {showProgress && (
        <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#135bec] w-2/3 ml-4 rounded-full" />
        </div>
      )}
    </Card>
  );
}

function ForecastRow({ date, price, change, status, confidence }: any) {
  return (
    <TableRow className="hover:bg-slate-50 transition-colors">
      <TableCell className="px-6 py-4 font-semibold text-sm">{date}</TableCell>
      <TableCell className="px-6 py-4 font-medium text-sm">{price}</TableCell>
      <TableCell className="px-6 py-4 text-[#e73908] font-bold text-sm">{change}</TableCell>
      <TableCell className="px-6 py-4">
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] font-bold uppercase">
          {status}
        </Badge>
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="bg-[#135bec] h-full" style={{ width: `${confidence}%` }} />
          </div>
          <span className="text-[10px] font-bold">{confidence}%</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
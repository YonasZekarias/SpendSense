import React from "react";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  User,
  Settings,
  LogOut,
  Calendar as CalendarIcon,
  Plus,
  Verified,
  CreditCard,
  Clock,
  TrendingDown,
  Store,
  DollarSign,
  Info,
  Download,
  MoreVertical,
} from "lucide-react";

// Shadcn Imports from your monorepo
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

export default function VendorDashboard() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f6f8] dark:bg-[#101622] text-[#111318] dark:text-white font-sans antialiased">
      
      {/* --- SideNavBar --- */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1e2736] shrink-0 transition-colors">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-4">
            {/* User Profile Snippet */}
            <div className="flex items-center gap-3 px-2 py-3 mb-2">
              <Avatar className="size-12 ring-2 ring-slate-100 dark:ring-slate-700 shadow-sm">
                <AvatarImage src="https://github.com/shadcn.png" alt="Abyssinia Traders" />
                <AvatarFallback>AT</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h1 className="text-base font-bold leading-tight">Abyssinia Traders</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Vendor Portal</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-1">
              <NavItem icon={<LayoutDashboard size={22} />} label="Dashboard" active />
              <NavItem icon={<Package size={22} />} label="Inventory" />
              <NavItem icon={<BarChart3 size={22} />} label="Sales Reports" />
              <NavItem icon={<User size={22} />} label="Profile" />
              <NavItem icon={<Settings size={22} />} label="Settings" />
            </nav>
          </div>

          <div className="px-2">
            <Button variant="ghost" className="w-full justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
              <LogOut size={20} />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-8 pb-10">
            
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black tracking-tight">Welcome back, Abyssinia</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Oct 24, 2023 - Here is your daily store overview.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="hidden md:flex gap-2 bg-white dark:bg-[#1e2736]">
                  <CalendarIcon size={18} />
                  Oct 24, 2023
                </Button>
                <Button className="bg-primary hover:bg-[#0f4bc2] font-bold shadow-md shadow-blue-500/20">
                  <Plus size={18} className="mr-2" />
                  Add Product
                </Button>
              </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                icon={<Package size={20} />} 
                label="Total Products Listed" 
                value="142" 
                trend="+5%" 
                variant="blue" 
              />
              <StatCard 
                icon={<Verified size={20} />} 
                label="Competitiveness Score" 
                value="8.5" 
                subValue="/10"
                trend="+0.2 pts" 
                variant="purple" 
              />
              <StatCard 
                icon={<DollarSign size={20} />} 
                label="Total Revenue (Mo)" 
                value="ETB 45,000" 
                trend="+12%" 
                variant="green" 
              />
              <StatCard 
                icon={<Clock size={20} />} 
                label="Pending Orders" 
                value="12" 
                variant="orange" 
              />
            </div>

            {/* Middle Section: Chart + Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart */}
              <Card className="lg:col-span-2 border-slate-100 dark:border-slate-800 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">Price Competitiveness</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">vs. Market Average (Addis Ababa)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary text-2xl font-bold">ETB 2,400</p>
                    <p className="text-xs text-slate-500">Avg Market Price</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full relative">
                    <CompetitivenessChart />
                  </div>
                  <div className="flex justify-between mt-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                  </div>
                </CardContent>
              </Card>

              {/* Live Alerts Feed */}
              <Card className="flex flex-col border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row justify-between items-center space-y-0">
                  <CardTitle className="text-lg font-bold">Live Market Alerts</CardTitle>
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Live
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-2">
                  <div className="flex flex-col gap-2">
                    <AlertItem icon={<TrendingDown size={16} />} text="Sugar prices dropped by 5% in Bole area." time="12 mins ago" color="text-primary" bg="bg-blue-50 dark:bg-blue-900/20" />
                    <AlertItem icon={<Store size={16} />} text='Competitor "Merkato Fresh" updated Teff prices.' time="45 mins ago" color="text-orange-600" bg="bg-orange-50 dark:bg-orange-900/20" />
                    <AlertItem icon={<DollarSign size={16} />} text="Onion demand spiking in your region." time="2 hrs ago" color="text-green-600" bg="bg-green-50 dark:bg-green-900/20" />
                    <AlertItem icon={<Info size={16} />} text="System maintenance scheduled for tonight." time="5 hrs ago" color="text-slate-500" bg="bg-slate-100 dark:bg-slate-800" />
                  </div>
                </CardContent>
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Button variant="link" className="text-primary text-xs font-bold uppercase tracking-wider">View All Alerts</Button>
                </div>
              </Card>
            </div>

            {/* Recent Sales Table */}
            <Card className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 space-y-0">
                <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
                <Button variant="outline" size="sm" className="gap-2 text-xs text-slate-500">
                  <Download size={16} />
                  Export CSV
                </Button>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                    <TableRow className="border-b border-slate-100 dark:border-slate-800">
                      <TableHead className="px-6 text-xs font-semibold uppercase">Product Name</TableHead>
                      <TableHead className="px-6 text-xs font-semibold uppercase">Date</TableHead>
                      <TableHead className="px-6 text-xs font-semibold uppercase text-right">Quantity</TableHead>
                      <TableHead className="px-6 text-xs font-semibold uppercase text-right">Unit Price</TableHead>
                      <TableHead className="px-6 text-xs font-semibold uppercase text-center">Status</TableHead>
                      <TableHead className="px-6 text-xs font-semibold uppercase text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TransactionRow name="White Teff (Premium)" sku="SKU-2301" date="Oct 24, 2023" qty="50 kg" price="ETB 6,500" status="Completed" />
                    <TransactionRow name="Red Lentils" sku="SKU-9921" date="Oct 23, 2023" qty="25 kg" price="ETB 2,100" status="Pending" />
                    <TransactionRow name="Jimma Coffee (Export)" sku="SKU-8820" date="Oct 23, 2023" qty="100 kg" price="ETB 45,000" status="Completed" />
                    <TransactionRow name="Berbere Spice Mix" sku="SKU-1102" date="Oct 22, 2023" qty="10 kg" price="ETB 850" status="Cancelled" />
                  </TableBody>
                </Table>
              </div>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}

{/* --- Sub-Components --- */}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
      active ? "bg-primary/10 text-primary font-semibold" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
    }`}>
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, trend, variant }: { 
  icon: React.ReactNode, label: string, value: string, subValue?: string, trend?: string, variant: 'blue' | 'purple' | 'green' | 'orange' 
}) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-primary",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  };

  return (
    <Card className="p-5 border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${colors[variant]}`}>{icon}</div>
        {trend && <Badge variant="secondary" className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-none font-bold">{trend}</Badge>}
      </div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold">
        {value}{subValue && <span className="text-base text-slate-400 font-normal">{subValue}</span>}
      </p>
    </Card>
  );
}

function AlertItem({ icon, text, time, color, bg }: { icon: React.ReactNode, text: string, time: string, color: string, bg: string }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
      <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${bg} ${color}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">{text}</p>
        <span className="text-xs text-slate-400 mt-1">{time}</span>
      </div>
    </div>
  );
}

function TransactionRow({ name, sku, date, qty, price, status }: { name: string, sku: string, date: string, qty: string, price: string, status: string }) {
  const statusStyles = {
    Completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <TableRow className="group hover:bg-blue-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800">
      <TableCell className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-700 bg-cover bg-center" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{name}</span>
            <span className="text-xs text-slate-500">ID: #{sku}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm text-slate-500">{date}</TableCell>
      <TableCell className="text-sm font-medium text-right">{qty}</TableCell>
      <TableCell className="text-sm text-right">{price}</TableCell>
      <TableCell className="text-center">
        <Badge className={`border-none ${statusStyles[status as keyof typeof statusStyles]}`}>
          {status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
          <MoreVertical size={20} />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function CompetitivenessChart() {
  return (
    <div className="w-full h-full relative">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 250">
        <defs>
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#135bec" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#135bec" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="1" x1="0" x2="800" y1="200" y2="200" />
        <line className="stroke-slate-200 dark:stroke-slate-700" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="150" y2="150" />
        <line className="stroke-slate-200 dark:stroke-slate-700" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="100" y2="100" />
        <line className="stroke-slate-200 dark:stroke-slate-700" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="50" y2="50" />
        
        {/* Vendor Line */}
        <path d="M0,180 C100,180 150,120 200,130 C250,140 300,100 350,90 C400,80 450,110 500,100 C550,90 600,60 650,70 C700,80 750,50 800,40" fill="none" stroke="#135bec" strokeWidth="3" />
        <path d="M0,180 C100,180 150,120 200,130 C250,140 300,100 350,90 C400,80 450,110 500,100 C550,90 600,60 650,70 C700,80 750,50 800,40 V250 H0 Z" fill="url(#chartGradient)" />
        
        {/* Market Avg Line */}
        <path className="stroke-slate-400 dark:stroke-slate-600" d="M0,160 C120,160 180,140 240,145 C300,150 360,110 420,115 C480,120 540,90 600,95 C660,100 720,70 800,75" fill="none" strokeDasharray="6 6" strokeWidth="2" />
      </svg>
      {/* Tooltip */}
      <div className="absolute top-[20%] left-[60%] bg-[#111318] text-white text-[10px] py-1 px-2 rounded -translate-x-1/2 -translate-y-full shadow-lg">
        ETB 2,350
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-[#111318]" />
      </div>
      <div className="absolute top-[26%] left-[60%] w-3 h-3 bg-white border-2 border-primary rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm" />
    </div>
  );
}
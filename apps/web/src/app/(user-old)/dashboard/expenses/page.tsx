"use client";

import React, { useState } from "react";
import { 
  Wallet, 
  Receipt, 
  PiggyBank, 
  ShoppingBag, 
  Download, 
  Printer, 
  TrendingUp, 
  PlusCircle, 
  MoreVertical,
  Utensils,
  Bus,
  Zap,
  ArrowUpRight,
  ChevronDown,
  LayoutDashboard
} from "lucide-react";

// Monorepo Imports
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
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
import { Progress } from "@repo/ui/components/progress";
import { Badge } from "@repo/ui/components/badge";

export default function ExpenseTrackerPage() {
  const [expenses] = useState([
    { id: 1, date: "Oct 24, 2023", category: "Food", desc: "Grocery shopping - Teff & Oil", amount: 2300, icon: Utensils, color: "text-orange-600 bg-orange-100" },
    { id: 2, date: "Oct 23, 2023", category: "Transport", desc: "Ride Taxi to Bole", amount: 450, icon: Bus, color: "text-blue-600 bg-blue-100" },
    { id: 3, date: "Oct 22, 2023", category: "Utilities", desc: "Electricity Bill", amount: 350, icon: Zap, color: "text-purple-600 bg-purple-100" },
    { id: 4, date: "Oct 21, 2023", category: "Shopping", desc: "New Shirt", amount: 1200, icon: ShoppingBag, color: "text-pink-600 bg-pink-100" },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-slate-900 px-4 md:px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#135bec] rounded-lg text-white">
            <Wallet size={20} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">BudgetEthiopia</h2>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Button variant="ghost" className="text-sm font-medium">Dashboard</Button>
          <Button variant="ghost" className="text-sm font-bold text-[#135bec]">Expenses</Button>
          <Button variant="ghost" className="text-sm font-medium">Budget</Button>
          <Button variant="ghost" className="text-sm font-medium">Shopping List</Button>
        </nav>

        <div className="flex items-center gap-4">
          <Button className="hidden md:flex bg-[#135bec] hover:bg-blue-700 text-white">Add Expense</Button>
          <div className="h-10 w-10 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yonas" alt="User Profile" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Page Heading & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Expense Tracker</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track your daily spending in ETB and manage your cost of living.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2 shadow-sm">
              <Download size={16} /> Export CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-2 shadow-sm">
              <Printer size={16} /> Print
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Budget" value="Br 25,000" trend="+10%" trendUp icon={<PiggyBank className="text-[#135bec]" />} />
          <StatCard title="Total Spent" value="Br 12,450" progress={50} icon={<Receipt className="text-orange-600" />} />
          <StatCard title="Remaining" value="Br 12,550" subtext="Sufficient for 15 more days" icon={<Wallet className="text-emerald-600" />} />
          <StatCard title="Daily Avg." value="Br 830" trend="Br 50 > Target" trendUp={false} icon={<TrendingUp className="text-blue-600" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Add New Expense Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Add New Expense</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                  <Input placeholder="e.g. Lunch at Taitu Hotel" className="focus-visible:ring-[#135bec]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                  <Select>
                    <SelectTrigger className="focus:ring-[#135bec]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="transport">Transportation</SelectItem>
                      <SelectItem value="housing">Housing</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount (ETB)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">Br</span>
                      <Input className="pl-8 focus-visible:ring-[#135bec]" type="number" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                    <Input type="date" className="focus-visible:ring-[#135bec]" />
                  </div>
                </div>
                <Button className="w-full bg-[#135bec] hover:bg-blue-700 text-white gap-2 font-bold shadow-md mt-2">
                  <PlusCircle size={18} /> Save Expense
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Recent Transactions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <Badge className="bg-[#135bec] hover:bg-blue-600 px-4 py-1">View All</Badge>
                <Badge variant="secondary" className="px-4 py-1 cursor-pointer">Food</Badge>
                <Badge variant="secondary" className="px-4 py-1 cursor-pointer">Transport</Badge>
                <Badge variant="secondary" className="px-4 py-1 cursor-pointer">Housing</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Sort:</span>
                <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs font-semibold bg-slate-50 dark:bg-slate-800">
                  Date (Newest) <ChevronDown size={14} />
                </Button>
              </div>
            </div>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
                <Button variant="link" className="text-[#135bec] font-semibold p-0 h-auto">View Full History</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                      <TableRow>
                        <TableHead className="uppercase text-[10px] font-bold tracking-wider">Date</TableHead>
                        <TableHead className="uppercase text-[10px] font-bold tracking-wider">Category</TableHead>
                        <TableHead className="uppercase text-[10px] font-bold tracking-wider">Description</TableHead>
                        <TableHead className="uppercase text-[10px] font-bold tracking-wider text-right">Amount</TableHead>
                        <TableHead className="text-center"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((item) => (
                        <TableRow key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <TableCell className="font-medium text-sm">{item.date}</TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold w-fit border ${item.color.replace('text-', 'border-').replace('600', '200')} ${item.color}`}>
                              <item.icon size={12} /> {item.category}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{item.desc}</TableCell>
                          <TableCell className="text-right font-bold text-slate-900 dark:text-white">- Br {item.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#135bec]"><MoreVertical size={16} /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-500 font-medium">Showing <span className="text-slate-900 dark:text-white font-bold">1-5</span> of 42 results</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold" disabled>Previous</Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold">Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  subtext?: string;
  progress?: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, trend, trendUp, subtext, progress, icon }: StatCardProps) {
  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">{icon}</div>
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{value}</h3>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${trendUp ? "text-emerald-600" : "text-red-500"}`}>
            {trendUp ? <TrendingUp size={14} /> : <ArrowUpRight size={14} />}
            {trend}
          </div>
        )}
        {subtext && <p className="text-xs text-slate-400 font-medium mt-2">{subtext}</p>}
        {progress !== undefined && (
          <div className="mt-4 space-y-2">
            <Progress value={progress} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
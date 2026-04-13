"use client";

import React from "react";
import { 
  Star, 
  MapPin, 
  Mail, 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  ShoppingBag, 
  LayoutGrid,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@repo/ui/components/select";

const PRODUCTS = [
  { id: 1, name: "NovaStation Ultra X1", price: "ETB 84,500", cat: "Featured", desc: "High-performance enterprise workstation optimized for financial modeling." },
  { id: 2, name: "CloudMesh Rack Pro", price: "ETB 156,000", cat: "Enterprise", desc: "Scalable infrastructure solution for local data hosting." },
  { id: 3, name: "SpendSense API Access", price: "ETB 2,400/mo", cat: "Subscription", desc: "Direct integration for automated bookkeeping." },
  { id: 4, name: "CyberShield Gateway", price: "ETB 32,800", cat: "Security", desc: "Military-grade hardware firewall with Ethiopian threat detection." },
];

export default function VendorProfile() {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      
      {/* Hero Header Section */}
      <section className="relative h-64 rounded-3xl overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-slate-900">
          {/* Background image would go here */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
        </div>
        
        <div className="absolute bottom-8 left-8 flex items-end gap-6">
          <div className="w-28 h-28 rounded-2xl border-4 border-white bg-white shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-slate-100 flex items-center justify-center font-black text-primary text-2xl">TN</div>
          </div>
          <div className="mb-2 space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tighter">TechNova Solutions</h2>
            <div className="flex items-center gap-4 text-white/80">
              <Badge className="bg-white/20 hover:bg-white/30 backdrop-blur-md border-none text-white font-bold gap-1">
                <Star size={12} fill="currentColor" /> 4.9
              </Badge>
              <span className="text-sm font-bold flex items-center gap-1">
                <ShieldCheck size={14} className="text-blue-400" /> Platinum Merchant
              </span>
              <span className="text-sm font-medium flex items-center gap-1 opacity-80">
                <MapPin size={14} /> Addis Ababa, ET
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8">
          <Button size="lg" className="rounded-2xl font-black gap-2 shadow-2xl active:scale-95 transition-all">
            <Mail size={18} /> Contact Vendor
          </Button>
        </div>
      </section>

      {/* KPI Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Orders Fulfilled", val: "12,482", sub: "+12%", color: "text-emerald-600", icon: <TrendingUp size={16}/> },
          { label: "Success Rate", val: "99.8%", sub: "Elite", color: "text-emerald-600", icon: <CheckCircle2 size={16}/> },
          { label: "Avg. Delivery", val: "2.4 Days", sub: "Express", color: "text-primary", icon: <Zap size={16}/> },
          { label: "Client Trust", val: "5.0 / 5", sub: "2.4k reviews", color: "text-amber-500", icon: <Star size={16} fill="currentColor"/> },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl p-6 bg-white dark:bg-slate-900">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black tracking-tighter">{stat.val}</h3>
            <div className={`mt-2 flex items-center gap-1 font-black text-[10px] uppercase ${stat.color}`}>
              {stat.icon} {stat.sub}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Catalog Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black tracking-tight">Product Catalog</h4>
            <div className="flex items-center gap-3">
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px] rounded-xl font-bold bg-slate-50 border-none">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="it">Electronics</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="rounded-xl"><LayoutGrid size={20}/></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRODUCTS.map((product) => (
              <Card key={product.id} className="group overflow-hidden rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur text-slate-950 font-black border-none text-[10px]">
                    {product.cat}
                  </Badge>
                  {/* Image placeholder */}
                </div>
                <CardContent className="p-6">
                  <h5 className="font-black text-lg group-hover:text-primary transition-colors">{product.name}</h5>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 font-medium">{product.desc}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xl font-black text-primary tracking-tight">{product.price}</span>
                    <Button size="icon" className="rounded-2xl shadow-lg active:scale-90"><ShoppingBag size={18}/></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar: Reviews & Summary */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-black">Latest Reviews</h4>
            <Button variant="link" className="text-primary font-black text-xs uppercase p-0">View All</Button>
          </div>
          
          <div className="space-y-4">
            {["Abebe Molla", "Sara Hailu"].map((name, i) => (
              <Card key={i} className="border-none shadow-sm rounded-2xl p-5 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-black text-xs">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h6 className="text-sm font-black">{name}</h6>
                    <div className="flex text-amber-500"><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {i === 0 ? "Best hardware supplier in Addis. Their support team is incredibly responsive." : "Fast delivery of workstations. Arrived pre-configured for our team."}
                </p>
                <p className="text-[9px] font-black text-slate-400 mt-3 uppercase tracking-wider">Verified Purchase • 2 days ago</p>
              </Card>
            ))}
          </div>

          <Card className="bg-primary/5 border-primary/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Sparkles size={18} />
              <h5 className="text-sm font-black uppercase tracking-tight">Vendor Insight</h5>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
              TechNova ranks in the top 1% for fulfillment speed in the Ethiopian tech market sector.
            </p>
            <Button variant="outline" className="w-full bg-white rounded-xl font-black text-[10px] uppercase tracking-tighter gap-2">
              Analytics Report <ArrowUpRight size={14} />
            </Button>
          </Card>
        </div>
      </div>

      {/* Floating Action */}
      <div className="fixed bottom-8 right-8">
        <Button size="icon" className="w-14 h-14 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
          <MessageSquare size={24} />
        </Button>
      </div>
    </div>
  );
}
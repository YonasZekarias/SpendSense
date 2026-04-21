import {
    Bell,
    Bot,
    Gavel,
    HelpCircle,
    LayoutDashboard,
    LogOut,
    ReceiptText,
    Search,
    Settings,
    Settings2,
    Shapes,
    ShieldCheck,
    Store,
    Users,
} from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

type PanelTab = "dashboard" | "users" | "vendors" | "verification" | "moderation" | "settings" | "categories" | "ml" | "audit";

interface AdminPanelShellProps {
  title: string;
  subtitle: string;
  activeTab: PanelTab;
  children: ReactNode;
}

const NAV = [
  { key: "users", label: "Users", href: "/admin/admin-panel/users", icon: <Users size={18} /> },
  { key: "vendors", label: "Vendors", href: "/admin/admin-panel/vendors", icon: <Store size={18} /> },
  { key: "dashboard", label: "Dashboard", href: "/admin/admin-panel/dashboard", icon: <LayoutDashboard size={18} /> },
  { key: "verification", label: "Vendor Verification", href: "/admin/admin-panel/vendor-verification", icon: <ShieldCheck size={18} /> },
  { key: "moderation", label: "Price Moderation", href: "/admin/admin-panel/price-moderation", icon: <Gavel size={18} /> },
  { key: "settings", label: "System Settings", href: "/admin/admin-panel/system-settings", icon: <Settings2 size={18} /> },
  { key: "categories", label: "Categories", href: "/admin/admin-panel/categories", icon: <Shapes size={18} /> },
  { key: "ml", label: "ML Monitoring", href: "/admin/admin-panel/ml-monitoring", icon: <Bot size={18} /> },
  { key: "audit", label: "Audit Logs", href: "/admin/admin-panel/audit-logs", icon: <ReceiptText size={18} /> },
] as const;

export default function AdminPanelShell({ title, subtitle, activeTab, children }: AdminPanelShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#111318] antialiased">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-100 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-slate-900">SpendSense Ethiopia</h1>
          <div className="hidden w-72 items-center rounded-lg bg-slate-100 px-3 py-1.5 md:flex">
            <Search className="text-slate-500" size={16} />
            <input className="w-full border-none bg-transparent pl-2 text-sm outline-none" placeholder="Search admin panel..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full p-2 hover:bg-slate-100" type="button"><Bell className="text-slate-600" size={18} /></button>
          <button className="rounded-full p-2 hover:bg-slate-100" type="button"><HelpCircle className="text-slate-600" size={18} /></button>
          <button className="rounded-full p-2 hover:bg-slate-100" type="button"><Settings className="text-slate-600" size={18} /></button>
          <div className="mx-1 h-8 w-px bg-slate-200" />
          <div className="h-9 w-9 rounded-full bg-slate-200" />
        </div>
      </header>

      <div className="flex">
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-slate-200 bg-slate-50 px-4 py-6">
          <div className="mb-8 px-2">
            <h2 className="text-lg font-black tracking-tight text-blue-700">SpendSense Admin</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Precision Spend Analysis</p>
          </div>
          <nav className="space-y-1">
            {NAV.map((item) => {
              const isActive = item.key === activeTab;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive ? "border-r-4 border-blue-600 bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-blue-600",
                  ].join(" ")}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <button className="mt-8 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600" type="button">
            <LogOut size={18} /> Logout
          </button>
        </aside>

        <main className="ml-64 flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

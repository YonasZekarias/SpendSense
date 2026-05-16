"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Loader2, 
  ChevronRight, 
  Edit3, 
  MapPin, 
  Camera, 
  UploadCloud, 
  Lightbulb, 
  Search,
  Target,
  Trophy,
  X
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useAuth } from "@/providers/auth-provider";
import { fetchMarketItems, createPriceSubmission, type MarketItem } from "@/services/marketService";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function MarketSubmitPage() {
  const { accessToken, status } = useAuth();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [itemId, setItemId] = useState<number | "">("");
  const [price, setPrice] = useState("");
  const [marketLocation, setMarketLocation] = useState("");
  const [city, setCity] = useState("Addis Ababa");
  const [dateObserved, setDateObserved] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    void fetchMarketItems()
      .then((list) => {
        setItems(list);
        if (list[0]) setItemId(list[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (status === "unauthenticated") {
      setMsg({ type: 'error', text: "Authentication required. Please sign in to contribute." });
      return;
    }
    if (itemId === "") {
      setMsg({ type: 'error', text: "Please select an item to proceed." });
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setMsg({ type: 'error', text: "A valid positive price is required." });
      return;
    }
    if (!marketLocation.trim()) {
      setMsg({ type: 'error', text: "Please specify the market or store name." });
      return;
    }

    setSaving(true);
    setMsg(null);
    setWarn(null);
    try {
      const res = await createPriceSubmission(accessToken || "", {
        item_id: Number(itemId),
        price_value: Number(price),
        market_location: marketLocation,
        city,
        date_observed: dateObserved,
      });
      
      if (res.outlier_warning) setWarn(res.outlier_warning);
      
      setMsg({ 
        type: 'success', 
        text: "Your contribution has been submitted! It will appear on the dashboard after a quick verification." 
      });
      
      setPrice("");
      setMarketLocation("");
      setFile(null);
      setPreviewUrl(null);
      
      // Auto-scroll to message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "We couldn't save your submission. Please check your inputs and try again.";
      setMsg({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setFile(null);
    setPreviewUrl(null);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8]">
        <Loader2 className="mr-2 size-6 animate-spin text-[#135bec]" />
        <span className="font-medium text-[#616f89]">Accessing Market Data...</span>
      </div>
    );
  }

  return (
    <main className="bg-[#f6f6f8] px-8 text-[#111318] antialiased">
      <div className="mx-auto max-w-6xl">
        
        {/* Header & Breadcrumbs */}
        <div className="mb-8">
          <nav className="mb-2 flex items-center gap-2 text-sm text-[#616f89]">
            <span>Market</span>
            <ChevronRight size={14} />
            <span className="font-medium text-[#135bec]">Submit Price</span>
          </nav>
          <h2 className="text-3xl font-bold tracking-tight text-[#111318]">Crowdsource Price Data</h2>
          <p className="mt-1 text-[#616f89]">Help the community by providing real-time market data across Ethiopia.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Main Form Section */}
          <div className="space-y-6 lg:col-span-8">
            <section className="overflow-hidden rounded-xl border border-[#cbd5e1]/30 bg-white shadow-sm">
              
              {/* Item Details */}
              <div className="p-8">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                  <Edit3 className="text-[#135bec]" size={20} />
                  Item Details
                </h3>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="col-span-2 md:col-span-1">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">Select Item</label>
                    <select
                      className="w-full border-none bg-[#f0f2f4] p-3 text-sm focus:ring-2 focus:ring-[#135bec]/20 rounded-lg font-medium"
                      value={itemId === "" ? "" : String(itemId)}
                      onChange={(e) => setItemId(Number(e.target.value))}
                    >
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">Date Observed</label>
                    <input 
                      type="date"
                      className="w-full border-none bg-[#f0f2f4] p-3 text-sm focus:ring-2 focus:ring-[#135bec]/20 rounded-lg font-medium"
                      value={dateObserved}
                      onChange={(e) => setDateObserved(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">Price (ETB)</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="text-sm font-bold text-[#135bec]">ETB</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full border-none bg-[#f0f2f4] p-3 pl-14 text-sm font-bold focus:ring-2 focus:ring-[#135bec]/20 rounded-lg"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="border-t border-[#cbd5e1]/30 bg-[#f0f2f4]/50 p-8">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                  <MapPin className="text-[#135bec]" size={20} />
                  Market Location
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">City</label>
                    <input 
                      type="text"
                      className="w-full border-none bg-white p-3 text-sm focus:ring-2 focus:ring-[#135bec]/20 rounded-lg font-medium shadow-sm"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">Specific Market / Store</label>
                    <input 
                      type="text"
                      placeholder="e.g. Merkato, Shola"
                      className="w-full border-none bg-white p-3 text-sm focus:ring-2 focus:ring-[#135bec]/20 rounded-lg font-medium shadow-sm"
                      value={marketLocation}
                      onChange={(e) => setMarketLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Google Map Embed */}
                <div className="w-full h-64 rounded-xl overflow-hidden border border-[#cbd5e1]/50 shadow-sm bg-white">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent((marketLocation ? marketLocation + ", " : "") + city)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              </div>

              {/* Proof of Purchase Section */}
              <div className="border-t border-[#cbd5e1]/30 bg-white p-8">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                  <Camera className="text-[#135bec]" size={20} />
                  Proof of Purchase / Price Tag
                </h3>
                <div className="flex w-full items-center justify-center">
                  <label htmlFor="dropzone-file" className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed ${previewUrl ? 'border-[#135bec]/30 bg-[#f0f2f4]/30' : 'border-[#cbd5e1]/60 bg-[#f8f9fa] hover:bg-[#f0f2f4]'} transition-colors relative overflow-hidden`}>
                    {previewUrl ? (
                      <div className="relative h-full w-full p-2 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewUrl} alt="Preview" className="h-full max-w-full object-contain rounded-lg" />
                        <button 
                          onClick={handleRemoveFile} 
                          className="absolute top-4 right-4 bg-red-500/90 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pb-6 pt-5">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e2e6ff]">
                          <UploadCloud className="size-6 text-[#135bec]" />
                        </div>
                        <p className="mb-1 text-sm font-bold text-[#111318]">Click to upload photo</p>
                        <p className="text-xs text-[#616f89]">PNG, JPG or PDF (Max 5MB)</p>
                      </div>
                    )}
                    <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, application/pdf" onChange={handleFileChange} />
                  </label>
                </div>
              </div>

              {/* Success/Warning Messages */}
              <div className="px-8 pt-4 pb-4 space-y-4">
                {warn && (
                  <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-xs font-bold uppercase tracking-wider">Note</AlertTitle>
                    <AlertDescription className="text-sm font-medium">
                      {warn}
                    </AlertDescription>
                  </Alert>
                )}
                
                {msg && (
                  <Alert variant={msg.type === 'success' ? 'default' : 'destructive'} 
                         className={msg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : ''}>
                    {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle className="text-xs font-bold uppercase tracking-wider">
                      {msg.type === 'success' ? 'Submission Received' : 'Error'}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-medium">
                      {msg.text}
                      {msg.type === 'success' && (
                        <div className="mt-3 flex gap-3">
                          <Button variant="outline" size="sm" asChild className="h-8 bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100">
                            <Link href="/market">Go to Dashboard</Link>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setMsg(null)} className="h-8 text-emerald-700 hover:bg-emerald-100">
                            Submit another
                          </Button>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end items-center gap-6 border-t border-[#cbd5e1]/30 bg-white p-6 md:p-8">
              
                <Button
                  disabled={saving}
                  onClick={handleSubmit}
                  className="bg-[#135bec] px-8 py-2.5 font-bold text-white shadow-sm hover:bg-[#0d4fd4] active:scale-95 transition-all rounded-lg disabled:opacity-50"
                >
                  {saving ? "Submitting..." : "Submit Price"}
                </Button>
              </div>
            </section>
          </div>

          {/* Sidebar / Stats Section */}
          <div className="space-y-6 lg:col-span-4">
            
            {/* Contributor Card */}
            <section className="relative overflow-hidden rounded-xl border border-[#cbd5e1]/30 bg-white p-6 shadow-sm">
              <div className="absolute -mr-16 -mt-16 right-0 top-0 h-32 w-32 rounded-full bg-[#135bec]/5"></div>
              <div className="relative mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#135bec] bg-[#e2e6ff] text-[#135bec]">
                  <Target size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-[#111318]">Your Contribution</h4>
                  <span className="inline-flex items-center gap-1 rounded bg-[#ffdbcf] px-2 py-0.5 text-[10px] font-bold uppercase text-[#380d00]">
                    Silver Contributor
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-xs font-bold">
                    <span className="text-[#616f89]">Rank Progress</span>
                    <span className="text-[#135bec]">84%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f2f4]">
                    <div className="h-full bg-[#135bec]" style={{ width: "84%" }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-[#f0f2f4] p-3">
                    <p className="text-[10px] font-bold uppercase text-[#616f89]">Points</p>
                    <p className="text-xl font-bold">2,450</p>
                  </div>
                  <div className="rounded-lg bg-[#f0f2f4] p-3">
                    <p className="text-[10px] font-bold uppercase text-[#616f89]">Verified</p>
                    <p className="text-xl font-bold">112</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Mini Leaderboard */}
            <section className="rounded-xl border border-[#cbd5e1]/30 bg-white p-6 shadow-sm">
              <h4 className="mb-4 flex items-center gap-2 font-bold text-[#111318]">
                <Trophy size={18} className="text-amber-500" />
                Weekly Top Contributors
              </h4>
              <div className="space-y-4">
                <LeaderboardItem name="Selam W." points="+890" rank={1} />
                <LeaderboardItem name="Abel T." points="+720" rank={2} />
                <LeaderboardItem name="Hanna K." points="+645" rank={3} />
              </div>
              <button className="mt-6 w-full text-sm font-bold text-[#135bec] hover:underline">
                View full leaderboard
              </button>
            </section>

            {/* Tips Card */}
            <section className="rounded-xl bg-[#135bec] p-6 text-white shadow-lg">
              <Lightbulb className="mb-2 opacity-50" size={32} />
              <h4 className="mb-2 font-bold">How to earn more?</h4>
              <p className="text-xs leading-relaxed text-white/80">
                Include high-resolution photos of official price tags to earn a "Verified" badge and 2x bonus points.
              </p>
            </section>
          </div>

        </div>
      </div>
    </main>
  );
}

function LeaderboardItem({ name, points, rank }: { name: string, points: string, rank: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          rank === 1 ? 'bg-[#135bec]/10 text-[#135bec]' : 'bg-[#f0f2f4] text-[#616f89]'
        }`}>
          {rank}
        </div>
        <span className="text-sm font-semibold">{name}</span>
      </div>
      <span className="text-xs font-bold text-[#135bec]">{points} pts</span>
    </div>
  );
}
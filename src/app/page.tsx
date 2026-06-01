"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useEffect } from "react";
import { Clock, MapPin, Wifi, WifiOff, Zap, ZapOff, Coffee, CheckCircle, AlertTriangle, Compass } from "lucide-react";
import { cafes, Cafe, getHaversineDistance, formatDistance } from "@/lib/cafes";
import CafeDrawer from "@/components/CafeDrawer";
import SearchBar from "@/components/SearchBar";
import BottomNav from "@/components/BottomNav";

const CafeMap = dynamic(() => import("@/components/CafeMap"), { ssr: false });

type Tab = "map" | "list";

const plugMeta: Record<
  Cafe["plugs"],
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  many: {
    label: "ปลั๊กเยอะมาก",
    color: "text-stone-900 border-brand-yellow bg-brand-yellow/30",
    bg: "bg-brand-yellow/10",
    icon: <Zap className="h-3 w-3 fill-brand-black text-brand-black" />,
  },
  some: {
    label: "ปลั๊กพอมี",
    color: "text-orange-900 border-orange-255 bg-orange-50",
    bg: "bg-orange-50",
    icon: <Zap className="h-3 w-3 fill-orange-500 text-orange-500" />,
  },
  few: {
    label: "ปลั๊กน้อย",
    color: "text-stone-700 border-stone-200 bg-stone-100",
    bg: "bg-stone-100",
    icon: <ZapOff className="h-3 w-3 text-stone-400" />,
  },
};

// Simple onboarding walkthrough steps definitions
const onboardingSteps = [
  {
    title: "⚡ ค้นหาพิกัดปลั๊กไฟสุดฟิน",
    desc: "ค้นหาจุดทำงานมีเครื่องดื่มดีๆ ที่เพียบพร้อมด้วยปลั๊กไฟจำนวนมาก (ป้ายสีเหลือง) พร้อมเช็คสัญญาณ WiFi แรงๆ ได้ทันทีรอบย่านคุณ",
    icon: <Zap className="h-12 w-12 text-brand-black fill-brand-yellow shrink-0 mx-auto" />
  },
  {
    title: "⚠️ ตรวจสอบปลั๊กไฟชำรุด",
    desc: "ร่วมรายงานจุดชำรุด (แนบรูปถ่ายหลักฐาน) เพื่อบอกสถานะกับเพื่อนๆ ในกลุ่ม หรือดูตราเครื่องหมายประทับรับรองอย่างเป็นทางการโดยร้านค้า",
    icon: <AlertTriangle className="h-12 w-12 text-amber-500 fill-amber-100 shrink-0 mx-auto" />
  },
  {
    title: "📍 นำทางเที่ยวทำงานในคลิกเดียว",
    desc: "ตรวจดูระยะทางห่างจริงจากตัวคุณด้วยระบบจัดเรียงใกล้ที่สุดก่อน และบินข้ามไปนำทางอย่างแม่นยำสู่ Google Maps ทันที",
    icon: <Compass className="h-12 w-12 text-brand-black fill-brand-yellow/10 shrink-0 mx-auto animate-pulse" />
  }
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Cafe | null>(null);
  const [tab, setTab] = useState<Tab>("map");

  // Advanced Filtering States
  const [filterPlugs, setFilterPlugs] = useState(false);
  const [filterWifi, setFilterWifi] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Dynamic state hooks for cafes
  const [cafesList, setCafesList] = useState<Cafe[]>(cafes);

  // Geolocation position hook (defaults to Bangkok center so distance displays immediately!)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>({
    lat: 13.745,
    lng: 100.555,
  });

  // Onboarding walkthrough guide states
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Trigger geolocation on mount automatically
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPos({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Auto geolocation bypassed or denied:", error);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Update dynamic cafe state callback
  const handleUpdateCafe = (updatedCafe: Cafe) => {
    setCafesList((prev) =>
      prev.map((c) => (c.id === updatedCafe.id ? updatedCafe : c))
    );
    // Sync active drawer selection
    if (selected && selected.id === updatedCafe.id) {
      setSelected(updatedCafe);
    }
  };

  const filtered = useMemo(() => {
    let list = cafesList.filter((c) => {
      // Search query match
      if (query) {
        const q = query.toLowerCase();
        const matchesSearch =
          c.name.toLowerCase().includes(q) ||
          c.area.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // Plugs filter
      if (filterPlugs && c.plugs !== "many") {
        return false;
      }

      // Wifi filter
      if (filterWifi && !c.wifi) {
        return false;
      }

      // Selected Tag filter
      if (selectedTag && !c.tags.includes(selectedTag)) {
        return false;
      }

      return true;
    });

    // Dynamic proximity sorting from closest to farthest if user geolocation is active
    if (userPos) {
      list = [...list].sort((a, b) => {
        const distA = getHaversineDistance(userPos.lat, userPos.lng, a.lat, a.lng);
        const distB = getHaversineDistance(userPos.lat, userPos.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    return list;
  }, [query, filterPlugs, filterWifi, selectedTag, userPos, cafesList]);

  // Open Help callback
  const handleShowHelp = () => {
    setOnboardingStep(0);
    setShowOnboarding(true);
  };

  return (
    <div className="relative isolate h-dvh w-full overflow-hidden bg-stone-50 flex flex-col font-sans">
      
      {/* MAP TAB */}
      {tab === "map" && (
        <div className="relative h-full w-full">
          <SearchBar
            value={query}
            onChange={setQuery}
            filterPlugs={filterPlugs}
            onFilterPlugsChange={setFilterPlugs}
            filterWifi={filterWifi}
            onFilterWifiChange={setFilterWifi}
            selectedTag={selectedTag}
            onSelectedTagChange={setSelectedTag}
          />
          
          <div className="h-full w-full z-0">
            <CafeMap
              cafes={filtered}
              selected={selected}
              onSelect={setSelected}
              userPos={userPos}
              onLocate={setUserPos}
              onShowHelp={handleShowHelp}
            />
          </div>

          <CafeDrawer
            cafe={selected}
            onClose={() => setSelected(null)}
            userPos={userPos}
            onUpdateCafe={handleUpdateCafe}
          />
        </div>
      )}

      {/* LIST TAB */}
      {tab === "list" && (
        <div className="relative h-full w-full flex flex-col">
          <SearchBar
            value={query}
            onChange={setQuery}
            filterPlugs={filterPlugs}
            onFilterPlugsChange={setFilterPlugs}
            filterWifi={filterWifi}
            onFilterWifiChange={setFilterWifi}
            selectedTag={selectedTag}
            onSelectedTagChange={setSelectedTag}
          />
          
          {/* Scrollable Container with centered column layout */}
          <div className="flex-1 overflow-y-auto pt-[162px] pb-[105px] px-4 custom-scrollbar bg-gradient-to-b from-stone-50 via-stone-100/40 to-stone-50">
            <div className="max-w-md mx-auto">
              
              {/* Premium Brand Header Block incorporating logo.png */}
              <div className="flex flex-col items-center justify-center pt-2 pb-6 border-b border-stone-200/50 mb-5 animate-scale-in">
                <div className="flex items-center gap-2.5">
                  <img 
                    src="/logo.png" 
                    alt="TidPlug Logo" 
                    className="h-10 w-10 object-contain select-none" 
                  />
                  <h1 className="font-extrabold text-stone-900 text-[22px] tracking-tight uppercase leading-none">
                    TIDPLUG
                  </h1>
                </div>
                <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-widest mt-1.5 leading-none">
                  Specialty Plug Finder
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Count Indicator */}
                <div className="flex justify-between items-center px-1 py-1">
                  <span className="text-[11px] font-extrabold text-stone-400 tracking-wider uppercase">
                    {userPos ? "ใกล้ตัวคุณที่สุด" : "คาเฟ่ที่ผ่านตัวกรอง"} ({filtered.length})
                  </span>
                  {(filterPlugs || filterWifi || selectedTag || query) && (
                    <button
                      onClick={() => {
                        setQuery("");
                        setFilterPlugs(false);
                        setFilterWifi(false);
                        setSelectedTag(null);
                      }}
                      className="text-[11px] font-extrabold text-brand-black hover:text-stone-850 cursor-pointer select-none transition-colors"
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                  )}
                </div>

                {filtered.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-stone-200/50 rounded-2xl p-6 shadow-sm animate-fade-in-up">
                    <Coffee className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                    <p className="font-extrabold text-stone-700 mb-1 text-sm">ไม่พบร้านคาเฟ่ที่คุณกำลังหา</p>
                    <p className="text-xs text-stone-400">ลองล้างหรือเปลี่ยนตัวกรองค้นหาด้านบนดูนะคะ</p>
                  </div>
                ) : (
                  filtered.map((cafe) => {
                    const meta = plugMeta[cafe.plugs];
                    const hasDamage = cafe.brokenPlugsReport && cafe.brokenPlugsReport.status === "pending";

                    return (
                      <button
                        key={cafe.id}
                        onClick={() => {
                          setSelected(cafe);
                          setTab("map");
                        }}
                        className={`w-full rounded-2xl bg-white px-5 py-4 border hover:shadow-md transition-all duration-300 text-left relative group cursor-pointer animate-fade-in-up shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)] ${
                          hasDamage
                            ? "border-amber-300 hover:border-amber-400 bg-amber-50/15"
                            : "border-stone-200/50 hover:border-brand-black"
                        }`}
                      >
                        {/* Top Row: Title + Verification Badges + Broken Alerts */}
                        <div className="flex flex-wrap items-start justify-between gap-2.5 mb-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-extrabold text-stone-800 text-[15px] group-hover:text-stone-900 transition-colors leading-snug">
                              {cafe.name}
                            </span>
                            
                            {/* Owner Verified Badge */}
                            {cafe.addedBy === "owner" && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-yellow/15 border border-brand-yellow/50 px-2 py-0.5 text-[9px] font-extrabold text-stone-900 shadow-sm leading-none shrink-0 animate-scale-in">
                                <CheckCircle className="h-2.5 w-2.5 fill-brand-black text-brand-yellow" />
                                <span>ยืนยันโดยร้าน</span>
                              </span>
                            )}

                            {/* Informal User Suggested Badge */}
                            {cafe.addedBy === "user" && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[9px] font-extrabold text-stone-500 leading-none shrink-0">
                                <span>เสนอโดยผู้ใช้</span>
                              </span>
                            )}

                            {/* Damage Alert Flag */}
                            {hasDamage && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[9px] font-extrabold text-amber-900 shadow-sm leading-none shrink-0 animate-pulse">
                                <span>⚠️ ปลั๊กชำรุด ({cafe.brokenPlugsReport?.count})</span>
                              </span>
                            )}
                          </div>
                          
                          <span
                            className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${meta.color} ${meta.bg}`}
                          >
                            {meta.icon}
                            {meta.label}
                          </span>
                        </div>

                        {/* Middle Details Grid */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 text-xs text-stone-500 font-semibold mb-3">
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <MapPin className="h-3.5 w-3.5 text-brand-black shrink-0" />
                            <span>{cafe.area}</span>
                            {userPos && (
                              <span className="text-[10px] font-bold text-stone-755 bg-stone-100/65 border border-stone-200 px-1.5 py-0.5 ml-1">
                                ห่าง {formatDistance(getHaversineDistance(userPos.lat, userPos.lng, cafe.lat, cafe.lng))}
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                            {cafe.openHours}
                          </span>
                          <span className="flex items-center gap-1.5">
                            {cafe.wifi ? (
                              <Wifi className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <WifiOff className="h-3.5 w-3.5 text-stone-300 shrink-0" />
                            )}
                            {cafe.wifi ? "มี WiFi แรง" : "ไม่มี WiFi"}
                          </span>
                        </div>

                        {/* Tag capsules */}
                        {cafe.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-stone-100">
                            {cafe.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-lg bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-500"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

            </div>
          </div>

          <CafeDrawer
            cafe={selected}
            onClose={() => setSelected(null)}
            userPos={userPos}
            onUpdateCafe={handleUpdateCafe}
          />
        </div>
      )}

      {/* Floating Island Dock */}
      <BottomNav active={tab} onChange={setTab} />

      {/* BRAND ONBOARDING WALKTHROUGH OVERLAY MODAL */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-5 bg-stone-950/45 backdrop-blur-md animate-fade-in select-none">
          <div className="glass-panel max-w-sm w-full rounded-[2.5rem] bg-white p-6 shadow-2xl relative border border-stone-200/50 flex flex-col justify-between items-center text-center animate-scale-in min-h-[420px]">
            
            {/* Header Brand */}
            <div className="w-full">
              <div className="flex justify-center mb-3">
                <img
                  src="/logo.png"
                  alt="TidPlug Logo"
                  className="h-12 w-12 object-contain select-none animate-pulse"
                />
              </div>
              <h2 className="text-[10px] uppercase tracking-widest font-extrabold text-stone-400">ยินดีต้อนรับสู่</h2>
              <h1 className="text-[20px] font-extrabold text-stone-900 tracking-tight leading-none mt-1">TIDPLUG (ติดปลั๊ก)</h1>
              
              <div className="h-[1px] bg-stone-100 my-4 w-full" />
            </div>

            {/* Slider Content */}
            <div className="my-2 px-1 flex-1 flex flex-col justify-center">
              <div className="mb-4">
                {onboardingSteps[onboardingStep].icon}
              </div>
              <h3 className="font-extrabold text-stone-850 text-sm tracking-tight mb-2">
                {onboardingSteps[onboardingStep].title}
              </h3>
              <p className="text-xs text-stone-400 font-semibold leading-relaxed px-3">
                {onboardingSteps[onboardingStep].desc}
              </p>
            </div>

            {/* Pagination Indicators & Buttons */}
            <div className="w-full mt-6 space-y-4">
              {/* Pagination Dots */}
              <div className="flex justify-center gap-2">
                {onboardingSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      onboardingStep === i ? "w-6 bg-brand-black" : "w-2 bg-stone-200"
                    }`}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 w-full">
                {onboardingStep < onboardingSteps.length - 1 ? (
                  <>
                    <button
                      onClick={() => setShowOnboarding(false)}
                      className="flex-1 py-3 text-xs font-extrabold text-stone-500 hover:text-stone-700 cursor-pointer select-none rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                    >
                      ข้ามสอน
                    </button>
                    <button
                      onClick={() => setOnboardingStep((prev) => prev + 1)}
                      className="flex-1 py-3 text-xs font-extrabold bg-brand-black text-brand-yellow rounded-xl shadow-md cursor-pointer select-none hover:bg-zinc-900 transition-colors"
                    >
                      หน้าถัดไป
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowOnboarding(false)}
                    className="w-full py-3 text-xs font-extrabold bg-brand-black text-brand-yellow rounded-xl shadow-md cursor-pointer select-none hover:bg-zinc-900 transition-colors animate-pulse"
                  >
                    เข้าสู่ระบบแผนที่พิกัด!
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

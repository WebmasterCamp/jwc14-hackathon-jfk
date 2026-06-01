"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
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
    title: "ค้นหาร้านใกล้ตัว",
    desc: "ดูร้านที่มีปลั๊กและ WiFi รอบตัวคุณได้ทันที",
    icon: <Zap className="h-10 w-10 text-brand-black fill-brand-yellow shrink-0 mx-auto" />
  },
  {
    title: "ดูข้อมูลสำคัญ",
    desc: "เช็กเวลาเปิด ระยะทาง และสถานะของแต่ละร้าน",
    icon: <AlertTriangle className="h-10 w-10 text-amber-500 fill-amber-100 shrink-0 mx-auto" />
  },
  {
    title: "เริ่มใช้งานได้เลย",
    desc: "แตะปุ่มด้านล่างเพื่อเปิดแผนที่หรือรายการ",
    icon: <Compass className="h-10 w-10 text-brand-black fill-brand-yellow/10 shrink-0 mx-auto" />
  }
];

// Interactive and extremely premium onboarding illustration canvas renderer
const renderOnboardingIllustration = (step: number) => {
  switch (step) {
    case 0:
      return (
        <div className="relative w-full h-full flex items-center justify-center select-none">
          {/* Map Grid Background Simulation */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1.5px,transparent_1.5px)] bg-size-[16px_16px] opacity-60 rounded-2xl" />
          
          {/* Ambient Pulse Glow */}
          <div className="absolute w-24 h-24 rounded-full bg-brand-yellow/20 animate-ping duration-1000" />
          
          {/* Premium Floating Yellow Marker Card */}
          <div className="relative flex flex-col items-center animate-scale-in">
            <div className="w-16 h-16 bg-brand-yellow border-[3px] border-brand-black rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(255,222,89,0.35)] custom-marker-active">
              <Zap className="h-8 w-8 text-brand-black fill-brand-black" />
            </div>
            {/* Tooltip label indicator */}
            <div className="mt-2.5 bg-brand-black text-brand-yellow text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md border border-stone-800">
              ปลั๊กเยอะมาก (Many)
            </div>
          </div>
        </div>
      );
    case 1:
      return (
        <div className="relative w-full h-full flex items-center justify-center select-none">
          <div className="absolute inset-0 bg-linear-to-tr from-amber-500/5 to-amber-500/10 rounded-2xl" />
          {/* Split Comparison Cards */}
          <div className="relative flex items-center justify-center gap-3.5 w-full px-4">
            
            {/* User Report Card */}
            <div className="bg-white border border-amber-250 rounded-2xl p-3 shadow-md w-28 text-center animate-scale-in flex flex-col items-center">
              <span className="h-6 w-6 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-[10px] mb-1.5 shrink-0">👤</span>
              <p className="text-[9px] font-black text-stone-850 truncate w-full">รายงานชำรุด</p>
              <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[8px] font-extrabold text-amber-900 leading-none">
                ⚠️ เสีย 2 จุด
              </span>
            </div>

            {/* Connecting icon */}
            <div className="text-stone-300 font-extrabold text-lg flex items-center justify-center shrink-0">
              ⚡
            </div>

            {/* Owner Approved Card */}
            <div className="bg-white border border-emerald-250 rounded-2xl p-3 shadow-md w-28 text-center animate-scale-in flex flex-col items-center">
              <span className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[10px] mb-1.5 shrink-0">🏢</span>
              <p className="text-[9px] font-black text-stone-850 truncate w-full">อนุมัติซ่อมโดยร้าน</p>
              <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[8px] font-extrabold text-emerald-900 leading-none">
                ✓ เรียบร้อย
              </span>
            </div>

          </div>
        </div>
      );
    case 2:
      return (
        <div className="relative w-full h-full flex items-center justify-center select-none">
          {/* Map Grid Background Simulation */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1.5px,transparent_1.5px)] bg-size-[16px_16px] opacity-40 rounded-2xl" />
          
          {/* Compass Cockpit */}
          <div className="relative flex items-center justify-center gap-4 w-full px-5 animate-scale-in">
            {/* Radar Dial */}
            <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center shrink-0">
              <div className="absolute inset-2 rounded-full border border-stone-200 flex items-center justify-center">
                <Compass className="h-7 w-7 text-brand-black animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              {/* Ping pointer */}
              <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-brand-yellow shadow border border-brand-black" />
            </div>
            
            {/* Direction text card */}
            <div className="bg-brand-black text-white p-3 rounded-2xl border border-stone-800 shadow-md flex-1 text-left min-w-0">
              <p className="text-[8px] font-bold text-brand-yellow uppercase tracking-widest leading-none mb-1">ระยะห่างจริง</p>
              <h4 className="text-[12px] font-black tracking-tight leading-none mb-1">ห่างจากคุณ 120 ม.</h4>
              <p className="text-[9px] text-stone-400 font-semibold leading-none mt-1">เดินเพียง 2 นาที 🚶</p>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

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

  // Landing Page & Onboarding walkthrough guide states (onboarding set to false initially to avoid mount flicker!)
  const [showLanding, setShowLanding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
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
          <div 
            className="flex-1 overflow-y-auto pt-40.5 px-4 custom-scrollbar bg-linear-to-b from-stone-50 via-stone-100/40 to-stone-50"
            style={{ paddingBottom: "calc(max(env(safe-area-inset-bottom, 0px), 16px) + 115px)" }}
          >
            <div className="max-w-md mx-auto">
              
              {/* Premium Brand Header Block incorporating logo.png */}
              <div className="flex flex-col items-center justify-center pt-2 pb-6 border-b border-stone-200/50 mb-5 animate-scale-in">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/logo.png"
                    alt="TidPlug Logo"
                    width={40}
                    height={40}
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
        <div className="fixed inset-0 z-2000 flex items-center justify-center p-5 bg-stone-950/45 animate-fade-in select-none">
          <div className="max-w-sm w-full rounded-[28px] bg-white p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] relative border border-stone-200 flex flex-col justify-between items-center text-center animate-scale-in min-h-110 max-h-[92vh] overflow-y-auto no-scrollbar">
            
            {/* Instagram-style Top Segmented Progress Bar */}
            <div className="w-full flex gap-1.5 mb-4 select-none shrink-0">
              {onboardingSteps.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full bg-stone-100 overflow-hidden"
                >
                  <div
                    className={`h-full bg-linear-to-r from-amber-400 to-brand-yellow transition-all duration-500 rounded-full ${
                      i < onboardingStep
                        ? "w-full"
                        : i === onboardingStep
                        ? "w-full animate-pulse"
                        : "w-0"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Header Brand */}
            <div className="w-full shrink-0 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="TidPlug Logo"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain select-none"
                />
                <div className="text-left">
                  <h1 className="text-[14px] font-black text-stone-900 tracking-tight leading-none">TidPlug</h1>
                  <span className="text-[8px] tracking-[0.2em] font-semibold text-stone-400 leading-none block mt-0.5">ตัวช่วยหาร้านมีปลั๊ก</span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowOnboarding(false)}
                className="text-[10px] font-bold text-stone-500 hover:text-stone-700 transition-colors px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer select-none"
              >
                ข้าม
              </button>
            </div>

            {/* Illustration Canvas */}
            <div className="h-40 w-full flex items-center justify-center bg-stone-50 rounded-3xl border border-stone-200 p-4 overflow-hidden relative shrink-0">
              {renderOnboardingIllustration(onboardingStep)}
            </div>

            {/* Slider Content */}
            <div className="w-full text-center mt-4 mb-3 flex-1 flex flex-col justify-center min-h-21">
              <h3 className="font-black text-stone-900 text-[15px] tracking-tight mb-2">
                {onboardingSteps[onboardingStep].title}
              </h3>
              <p className="text-[13px] text-stone-500 font-medium leading-relaxed px-2">
                {onboardingSteps[onboardingStep].desc}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="w-full shrink-0 pt-0 mt-1">
              {onboardingStep < onboardingSteps.length - 1 ? (
                <button
                  onClick={() => setOnboardingStep((prev) => prev + 1)}
                  className="w-full py-3.5 text-sm font-black bg-brand-black text-brand-yellow rounded-2xl shadow-md cursor-pointer select-none hover:bg-zinc-900 transition-all active:scale-[0.98] tracking-wide flex items-center justify-center gap-1.5"
                >
                  <span>ถัดไป</span>
                  <span className="text-[10px]">➜</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowOnboarding(false)}
                  className="w-full py-3.5 text-sm font-black bg-brand-yellow text-brand-black rounded-2xl shadow-[0_6px_20px_rgba(255,222,89,0.22)] cursor-pointer select-none hover:brightness-105 transition-all active:scale-[0.98] tracking-wide font-sans"
                >
                  เริ่มใช้งาน
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* FULLSCREEN BRAND LANDING PAGE OVERLAY (Styled directly after the laundry app example) */}
      <div
        className={`fixed inset-0 z-2500 bg-white flex flex-col justify-between items-center transition-transform duration-750 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          showLanding ? "translate-y-0" : "-translate-y-full pointer-events-none invisible"
        }`}
      >
        {/* Top Bar Greeting */}
        <div className="w-full text-center pt-12 shrink-0 px-6">
          <div className="flex justify-center mb-3">
            <Image
              src="/logo.png"
              alt="TidPlug Logo"
              width={56}
              height={56}
              className="h-14 w-14 object-contain select-none"
            />
          </div>
          <h1 className="text-[28px] font-extrabold text-stone-900 tracking-tight leading-none">
            ยินดีต้อนรับสู่
          </h1>
          <h2 className="text-[22px] font-black text-brand-black tracking-tight mt-1.5 uppercase leading-none">
            TIDPLUG
          </h2>
          <div className="h-0.5 bg-brand-yellow/60 w-16 mx-auto mt-4" />
        </div>

        {/* Central Digital Nomad 3D Hero Illustration */}
        <div className="flex-1 flex items-center justify-center p-6 w-full max-w-sm shrink-0">
          <img
            src="/images/landing_hero.png"
            alt="TidPlug Landing Hero"
            width={960}
            height={540}
            className="w-full max-h-70 object-contain select-none animate-scale-in"
            priority
          />
        </div>

        {/* Bottom Curved Wave Branding Banner (Sweeping Solid Black Curve) */}
        <div className="w-full bg-brand-black text-white px-6 pt-10 pb-12 shrink-0 flex flex-col items-center justify-end text-center relative rounded-t-[3.5rem] shadow-[0_-12px_40px_rgba(0,0,0,0.18)] max-w-md mx-auto">
          {/* Small accent slide handle */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-stone-700/60" />

          <h3 className="font-extrabold text-brand-yellow text-xs tracking-widest uppercase mb-2">
            Specialty Plug Finder
          </h3>
          
          <h2 className="text-base font-extrabold text-white tracking-tight leading-snug px-3 mb-6">
            ให้การหาที่ทำงานมีปลั๊กไฟเป็นเรื่องง่ายในทุกย่านคุณ
          </h2>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              setShowLanding(false);
              // Sequenced onboarding pop-in to completely resolve any mount rendering flash/flicker!
              setTimeout(() => {
                setShowOnboarding(true);
              }, 750); // Matches the slide-up duration perfectly!
            }}
            className="w-full bg-brand-yellow text-brand-black font-extrabold text-sm py-4 rounded-2xl shadow-lg active:scale-98 select-none transition-all hover:bg-yellow-400 cursor-pointer font-sans tracking-wide"
          >
            ค้นหาพิกัดปลั๊กเลย!
          </button>
        </div>
      </div>

    </div>
  );
}

"use client";

import { Search, X, Wifi, Zap, Award, Clock } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  filterPlugs: boolean;
  onFilterPlugsChange: (v: boolean) => void;
  filterWifi: boolean;
  onFilterWifiChange: (v: boolean) => void;
  selectedTag: string | null;
  onSelectedTagChange: (tag: string | null) => void;
};

export default function SearchBar({
  value,
  onChange,
  filterPlugs,
  onFilterPlugsChange,
  filterWifi,
  onFilterWifiChange,
  selectedTag,
  onSelectedTagChange,
}: Props) {
  return (
    <div className="fixed top-5 left-4 right-4 z-[1010] md:max-w-md md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-full animate-fade-in-up">
      <div className="glass-panel flex flex-col gap-2 rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300">
        
        {/* Main Search Input with Brand Logo Integration */}
        <div className="flex items-center gap-2.5 rounded-xl bg-stone-50 border border-stone-200/80 px-3 py-2 transition-all duration-200 focus-within:border-brand-black focus-within:ring-2 focus-within:ring-brand-yellow/30">
          
          {/* Brand logo.png badge */}
          <img
            src="/logo.png"
            alt="TidPlug Logo"
            className="h-7 w-7 object-contain shrink-0 select-none animate-scale-in"
          />
          <div className="h-4.5 w-[1px] bg-stone-200 shrink-0 mx-0.5" />
          
          <Search className="h-4 w-4 shrink-0 text-stone-400 transition-colors" />
          <input
            type="text"
            placeholder="ค้นหาร้านคาเฟ่มีปลั๊ก..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-stone-850 placeholder-stone-400 outline-none"
          />
          {value && (
            <button
              onClick={() => onChange("")}
              className="rounded-lg p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-200/50 transition-all duration-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-stone-100 mx-1" />

        {/* Scrolling Filters Row (Yellow & Black branding) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-1">
          {/* Plugs Filter */}
          <button
            onClick={() => onFilterPlugsChange(!filterPlugs)}
            className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all duration-200 cursor-pointer select-none ${
              filterPlugs
                ? "bg-brand-black text-brand-yellow border-brand-black shadow-sm"
                : "bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700"
            }`}
          >
            <Zap className={`h-3 w-3 ${filterPlugs ? "fill-brand-yellow text-brand-yellow" : ""}`} />
            <span>ปลั๊กเยอะ</span>
          </button>

          {/* Wifi Filter */}
          <button
            onClick={() => onFilterWifiChange(!filterWifi)}
            className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all duration-200 cursor-pointer select-none ${
              filterWifi
                ? "bg-brand-black text-brand-yellow border-brand-black shadow-sm"
                : "bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700"
            }`}
          >
            <Wifi className={`h-3 w-3 ${filterWifi ? "text-brand-yellow" : ""}`} />
            <span>มี WiFi</span>
          </button>

          {/* Tag "นั่งนาน" Filter */}
          <button
            onClick={() => onSelectedTagChange(selectedTag === "นั่งนาน" ? null : "นั่งนาน")}
            className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all duration-200 cursor-pointer select-none ${
              selectedTag === "นั่งนาน"
                ? "bg-brand-black text-brand-yellow border-brand-black shadow-sm"
                : "bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700"
            }`}
          >
            <Award className={`h-3 w-3 ${selectedTag === "นั่งนาน" ? "text-brand-yellow" : ""}`} />
            <span>นั่งนานได้</span>
          </button>

          {/* Tag "เปิด 24ชม" Filter */}
          <button
            onClick={() => onSelectedTagChange(selectedTag === "เปิด 24ชม" ? null : "เปิด 24ชม")}
            className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all duration-200 cursor-pointer select-none ${
              selectedTag === "เปิด 24ชม"
                ? "bg-brand-black text-brand-yellow border-brand-black shadow-sm"
                : "bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700"
            }`}
          >
            <Clock className={`h-3 w-3 ${selectedTag === "เปิด 24ชม" ? "text-brand-yellow" : ""}`} />
            <span>เปิด 24ชม.</span>
          </button>
        </div>
      </div>
    </div>
  );
}

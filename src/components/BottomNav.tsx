"use client";

import { Map, List } from "lucide-react";

type Tab = "map" | "list";

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "map", label: "แผนที่", Icon: Map },
  { id: "list", label: "รายการ", Icon: List },
];

export default function BottomNav({ active, onChange }: Props) {
  const activeIndex = tabs.findIndex((t) => t.id === active);

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1010] w-[88%] max-w-xs pb-safe animate-fade-in-up">
      <div className="glass-panel relative rounded-full p-2 flex justify-between items-center shadow-[0_16px_40px_-8px_rgba(0,0,0,0.12)] border-white/60">
        
        {/* Sliding Pill Background (50/50 split width) */}
        <div
          className="absolute top-2 bottom-2 rounded-full bg-brand-black shadow-md transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
          style={{
            left: `calc(${activeIndex * 50}% + 8px)`,
            width: `calc(50% - 16px)`,
          }}
        />

        {/* Tab Buttons */}
        {tabs.map(({ id, label, Icon }, index) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`relative z-10 flex flex-1 flex-col items-center gap-1 py-2.5 rounded-full text-[11px] font-extrabold transition-all duration-300 select-none cursor-pointer outline-none ${
                isActive 
                  ? "text-brand-yellow scale-102" 
                  : "text-stone-400 hover:text-stone-600 active:scale-95"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform duration-300 ${
                  isActive ? "scale-110" : "scale-100 hover:scale-105"
                }`}
                strokeWidth={isActive ? 2.8 : 1.8}
              />
              <span className="tracking-wider">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

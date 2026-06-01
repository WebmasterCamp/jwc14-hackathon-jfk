"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Locate } from "lucide-react";
import { Cafe } from "@/lib/cafes";

// Fix default Leaflet icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function makeIcon(plugs: Cafe["plugs"], selected: boolean) {
  const size = selected ? 46 : 36;
  const border = selected 
    ? "border-brand-black border-[3.5px] shadow-[0_8px_20px_rgba(0,0,0,0.18)] scale-110" 
    : "border-brand-black border-[2px] shadow-[0_4px_12px_rgba(0,0,0,0.06)]";
  const bg = "bg-brand-yellow"; // Full yellow circle!
  
  // Custom vector plug SVG (Lucide plug path)
  const plugSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${selected ? 20 : 16}" height="${selected ? 20 : 16}" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plug shrink-0">
      <path d="M12 22v-5"/>
      <path d="M9 8V2"/>
      <path d="M15 8V2"/>
      <path d="M18 8H6v5a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8z"/>
    </svg>`;

  // High-contrast color indicators for plug abundance
  const indicatorColor = 
    plugs === "many" ? "bg-emerald-500 border-white" : 
    plugs === "some" ? "bg-orange-500 border-white" : 
    "bg-stone-400 border-white";

  const html = `
    <div class="relative flex items-center justify-center rounded-full transition-all duration-300 ${bg} ${border}" style="width: ${size}px; height: ${size}px;">
      <!-- Bold Black plug vector icon at the absolute center -->
      ${plugSvg}
      <!-- Bottom-right plug abundance indicator dot -->
      <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[2px] ${indicatorColor} shadow-sm z-20"></div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: selected ? "custom-marker-active transition-all duration-300" : "transition-all duration-300",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Pulsing blue current location indicator
const userMarkerIcon = L.divIcon({
  html: `
    <div class="relative w-6 h-6 flex items-center justify-center animate-scale-in">
      <div class="absolute inset-0 bg-blue-500 rounded-full opacity-35 animate-ping" style="animation-duration: 2.2s;"></div>
      <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
    </div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

type Props = {
  cafes: Cafe[];
  selected: Cafe | null;
  onSelect: (cafe: Cafe) => void;
  userPos: { lat: number; lng: number } | null;
  onLocate: (pos: { lat: number; lng: number }) => void;
  onShowHelp: () => void;
};

export default function CafeMap({ cafes, selected, onSelect, userPos, onLocate, onShowHelp }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      center: [13.745, 100.555],
      zoom: 13,
      zoomControl: false, 
    });

    mapRef.current = map;

    // CartoDB Positron - ultra-minimalist light tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const map = mapRef.current;
    const layerGroup = L.layerGroup().addTo(map);

    // Draw user coordinate pulse dot if active
    if (userPos) {
      L.marker([userPos.lat, userPos.lng], {
        icon: userMarkerIcon,
      }).addTo(layerGroup);
    }

    // Draw cafes pins displaying logo.png
    cafes.forEach((cafe) => {
      const marker = L.marker([cafe.lat, cafe.lng], {
        icon: makeIcon(cafe.plugs, selected?.id === cafe.id),
      }).addTo(layerGroup);

      marker.on("click", () => onSelect(cafe));
    });

    if (selected) {
      map.flyTo([selected.lat, selected.lng], 15, { duration: 0.8 });
    }

    return () => {
      layerGroup.remove();
    };
  }, [cafes, selected, onSelect, userPos]);

  // Request/locate coordinate fly-to handler
  const handleLocateClick = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          onLocate(newPos);
          if (mapRef.current) {
            mapRef.current.flyTo([newPos.lat, newPos.lng], 16, { duration: 0.8 });
          }
        },
        (error) => {
          alert("ไม่สามารถระบุพิกัดของคุณได้ กรุณาอนุญาตสิทธิ์เข้าถึง GPS ของบราวเซอร์นะคะ");
          console.log("GPS trigger error:", error);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  return (
    <div className="h-full w-full bg-stone-150 relative z-0">
      {/* Map Element */}
      <div ref={containerRef} className="h-full w-full z-0" />

      {/* Floating Onboarding Help Button */}
      <button
        onClick={onShowHelp}
        className="absolute bottom-[156px] right-4 z-[1005] w-12 h-12 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full border border-stone-200/80 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12)] text-brand-black hover:text-brand-black active:scale-95 transition-all select-none hover:bg-stone-50 cursor-pointer font-extrabold text-sm shadow-md"
        title="แนะนำการใช้งาน"
      >
        ?
      </button>

      {/* Floating Locate GPS Button */}
      <button
        onClick={handleLocateClick}
        className="absolute bottom-[96px] right-4 z-[1005] w-12 h-12 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full border border-stone-200/80 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12)] text-brand-black hover:text-brand-black active:scale-95 transition-all select-none hover:bg-stone-50 cursor-pointer"
        title="หาตำแหน่งของฉัน"
      >
        <Locate className="w-5 h-5 shrink-0" />
      </button>
    </div>
  );
}

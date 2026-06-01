export type Cafe = {
  id: string;
  name: string;
  area: string;
  plugs: "many" | "some" | "few";
  openHours: string;
  tags: string[];
  lat: number;
  lng: number;
  image: string;
  addedBy: "owner" | "user" | "system";
  brokenPlugsReport: {
    reportedAt: string;
    zone: string;
    issue: string;
    note?: string;
    status: "pending" | "repaired";
  } | null;
};

export const cafes: Cafe[] = [
  {
    id: "1",
    name: "Roots Coffee Roaster",
    area: "สีลม",
    plugs: "many",
    openHours: "07:00–19:00",
    tags: ["เงียบ", "แอร์เย็น", "โต๊ะใหญ่"],
    lat: 13.7234,
    lng: 100.5295,
    image: "/images/cafe_cozy.png",
    addedBy: "owner",
    brokenPlugsReport: null,
  },
  {
    id: "2",
    name: "Brave Roasters",
    area: "อารีย์",
    plugs: "many",
    openHours: "08:00–18:00",
    tags: ["นั่งนาน", "ปลั๊กทุกโต๊ะ"],
    lat: 13.7749,
    lng: 100.5455,
    image: "/images/cafe_industrial.png",
    addedBy: "system",
    brokenPlugsReport: null,
  },
  {
    id: "3",
    name: "Factory Coffee",
    area: "ทองหล่อ",
    plugs: "some",
    openHours: "08:00–20:00",
    tags: ["บรรยากาศดี"],
    lat: 13.7291,
    lng: 100.5814,
    image: "/images/cafe_industrial.png",
    addedBy: "user",
    brokenPlugsReport: {
      reportedAt: "1 มิ.ย. 15:30",
      zone: "โต๊ะริมหน้าต่าง",
      issue: "ไฟไม่เข้าเลย 🔌",
      note: "ตัวริมสุดด้านขวา",
      status: "pending",
    },
  },
  {
    id: "4",
    name: "% Arabica",
    area: "เอกมัย",
    plugs: "few",
    openHours: "08:00–18:00",
    tags: ["ดีไซน์สวย", "คนเยอะ"],
    lat: 13.7223,
    lng: 100.5822,
    image: "/images/cafe_industrial.png",
    addedBy: "user",
    brokenPlugsReport: null,
  },
  {
    id: "5",
    name: "Ink & Lion Cafe",
    area: "อนุสาวรีย์",
    plugs: "many",
    openHours: "10:00–22:00",
    tags: ["นั่งนาน", "เปิดดึก", "ปลั๊กเยอะ"],
    lat: 13.7649,
    lng: 100.5402,
    image: "/images/cafe_cozy.png",
    addedBy: "owner",
    brokenPlugsReport: null,
  },
  {
    id: "6",
    name: "Too Fast To Sleep",
    area: "สุขุมวิท",
    plugs: "many",
    openHours: "00:00–24:00",
    tags: ["เปิด 24ชม", "remote-friendly"],
    lat: 13.7431,
    lng: 100.5601,
    image: "/images/cafe_studious.png",
    addedBy: "system",
    brokenPlugsReport: null,
  },
];

export const plugLabel: Record<Cafe["plugs"], string> = {
  many: "10+ จุดชาร์จ",
  some: "5+ จุดชาร์จ",
  few: "1-2 จุดชาร์จ",
};

export const plugColor: Record<Cafe["plugs"], string> = {
  many: "bg-emerald-100 text-emerald-700",
  some: "bg-yellow-100 text-yellow-700",
  few: "bg-red-100 text-red-600",
};

// Haversine formula to compute straight-line distance in km between two lat/lng coordinates
export function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

// Helper to format distance nicely (e.g. "350 ม." or "2.4 กม.")
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} ม.`;
  }
  return `${km.toFixed(1)} กม.`;
}

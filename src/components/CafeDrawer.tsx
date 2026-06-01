"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import {
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  Zap,
  ZapOff,
  ChevronRight,
  Plus,
  Navigation,
  Copy,
  Check,
  Compass,
  CheckCircle,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Cafe, getHaversineDistance, formatDistance } from "@/lib/cafes";

type Props = {
  cafe: Cafe | null;
  onClose: () => void;
  userPos: { lat: number; lng: number } | null;
  onUpdateCafe: (updatedCafe: Cafe) => void;
};

const plugMeta: Record<
  Cafe["plugs"],
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  many: {
    label: "ปลั๊กเยอะมาก",
    color: "text-stone-900 border-brand-yellow bg-brand-yellow/30",
    bg: "bg-brand-yellow/10",
    icon: <Zap className="h-3.5 w-3.5 fill-brand-black text-brand-black" />,
  },
  some: {
    label: "ปลั๊กพอมี",
    color: "text-orange-900 border-orange-200 bg-orange-50",
    bg: "bg-orange-50",
    icon: <Zap className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />,
  },
  few: {
    label: "ปลั๊กน้อย",
    color: "text-stone-700 border-stone-300 bg-stone-100",
    bg: "bg-stone-100",
    icon: <ZapOff className="h-3.5 w-3.5 text-stone-500" />,
  },
};

export default function CafeDrawer({ cafe, onClose, userPos, onUpdateCafe }: Props) {
  const [copied, setCopied] = useState(false);
  const meta = cafe ? plugMeta[cafe.plugs] : null;

  // Local drawer interactive states for Plug Reporting and Owner Resolution
  const [isReporting, setIsReporting] = useState(false);
  const [brokenCount, setBrokenCount] = useState(1);
  const [hasEvidence, setHasEvidence] = useState(true);

  const [isOwnerPortal, setIsOwnerPortal] = useState(false);
  const [ownerPasskey, setOwnerPasskey] = useState("");

  const distance = cafe && userPos
    ? getHaversineDistance(userPos.lat, userPos.lng, cafe.lat, cafe.lng)
    : null;

  const handleCopy = () => {
    if (!cafe) return;
    navigator.clipboard.writeText(`${cafe.lat},${cafe.lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasDamage = cafe?.brokenPlugsReport && cafe.brokenPlugsReport.status === "pending";

  return (
    <Drawer.Root
      open={!!cafe}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setIsReporting(false);
          setIsOwnerPortal(false);
          setOwnerPasskey("");
        }
      }}
    >
      <Drawer.Portal>
        {/* Raised Overlay to sit above leaflet panes (z-[1040]) */}
        <Drawer.Overlay className="fixed inset-0 bg-stone-950/45 z-[1040] backdrop-blur-sm transition-all duration-300" />
        
        {/* Raised Content to sit above overlay (z-[1050]) and centered nicely on large screens */}
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[1050] md:max-w-md md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-full flex flex-col rounded-t-[2.5rem] bg-white shadow-2xl max-h-[85vh] pb-safe focus:outline-none overflow-hidden border border-stone-200/50 animate-scale-in">
          
          {/* Drag Handle Container */}
          <div className="absolute top-3 left-0 right-0 flex justify-center z-25 shrink-0">
            <div className="h-1.5 w-12 rounded-full bg-white/70 backdrop-blur-md shadow-sm" />
          </div>

          {/* Visually hidden title for accessibility */}
          <Drawer.Title className="sr-only">
            {cafe?.name ?? "ข้อมูลคาเฟ่"}
          </Drawer.Title>

          {cafe && meta && (
            <div className="flex flex-col h-full w-full relative">
              
              {/* Premium Cafe Atmosphere Hero Image Header */}
              <div className="relative h-44 w-full overflow-hidden shrink-0 flex items-end p-5">
                <img
                  src={cafe.image}
                  alt={cafe.name}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500 brightness-95"
                />
                
                {/* Soft ambient overlays to blend image into white body while keeping badges readable */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/40 to-transparent z-1" />
                
                {/* Badges inside Hero */}
                <div className="relative z-10 w-full flex items-center justify-between">
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${meta.color} ${meta.bg} shadow-sm backdrop-blur-md`}
                  >
                    {meta.icon}
                    {meta.label}
                  </span>
                  
                  {cafe.wifi ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-black text-brand-yellow border border-brand-black px-3 py-1 text-xs font-extrabold shadow-sm backdrop-blur-md">
                      <Wifi className="h-3.5 w-3.5" /> High-Speed WiFi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-500 px-3 py-1 text-xs font-extrabold shadow-sm">
                      <WifiOff className="h-3.5 w-3.5" /> ไม่มี WiFi
                    </span>
                  )}
                </div>
              </div>

              {/* Scrollable details container */}
              <div className="overflow-y-auto px-6 pt-4 pb-8 custom-scrollbar">
                
                {/* Title and zone area */}
                <div className="mb-4">
                  <h2 className="text-xl font-extrabold text-stone-900 tracking-tight leading-snug mb-1">
                    {cafe.name}
                  </h2>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-stone-500">
                    <MapPin className="h-4 w-4 shrink-0 text-brand-black" />
                    <span>โซน {cafe.area}</span>
                  </div>
                </div>

                {/* Verification Source attribution card */}
                <div className="mb-5">
                  {cafe.addedBy === "owner" ? (
                    <div className="flex items-start gap-3 rounded-2xl bg-brand-yellow/15 border border-brand-yellow px-4 py-3 text-xs font-semibold text-stone-900 shadow-sm animate-fade-in-up">
                      <CheckCircle className="h-5 w-5 fill-brand-black text-brand-yellow shrink-0 mt-0.5" />
                      <div>
                        <p className="leading-tight font-extrabold text-brand-black">ร้านค้าอย่างเป็นทางการ (Official Verified)</p>
                        <p className="text-[10px] text-stone-500 font-bold leading-normal mt-0.5">ข้อมูลพิกัดและสิ่งอำนวยความสะดวกทั้งหมดได้รับการตรวจสอบและรับรองโดยตรงจากทางร้านค้า</p>
                      </div>
                    </div>
                  ) : cafe.addedBy === "user" ? (
                    <div className="flex items-start gap-3 rounded-2xl bg-stone-100/60 border border-stone-200/80 px-4 py-3 text-xs font-semibold text-stone-600 animate-fade-in-up">
                      <div className="h-5 w-5 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-[10px] font-extrabold text-stone-500 shrink-0 mt-0.5">👤</div>
                      <div>
                        <p className="leading-tight font-extrabold text-stone-850">เสนอข้อมูลโดยเพื่อนในบอร์ด (Contributor)</p>
                        <p className="text-[10px] text-stone-400 font-bold leading-normal mt-0.5">พิกัดนี้เป็นข้อมูลสาธารณะแนะนำโดยสมาชิกเพื่อร่วมแชร์จุดทำงานดีๆ ขอบคุณที่แบ่งปันนะคะ</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 rounded-2xl bg-stone-50 border border-stone-200 px-4 py-3 text-xs font-semibold text-stone-600 animate-fade-in-up">
                      <Compass className="h-5 w-5 text-stone-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="leading-tight font-extrabold text-stone-800">ฐานข้อมูลของระบบ (System Verified)</p>
                        <p className="text-[10px] text-stone-400 font-bold leading-normal mt-0.5">ได้รับการตรวจสอบตำแหน่งพิกัด ละติจูด ลองจิจูด และจุดให้บริการปลั๊กโดยทีมแอดมินระบบ</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Crowdsourced Damage alert warning banner */}
                {hasDamage && cafe.brokenPlugsReport && (
                  <div className="rounded-2xl bg-amber-50/80 border border-amber-300 p-4.5 mb-5 text-xs text-amber-900 shadow-sm animate-pulse flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-[13px] text-amber-950 mb-0.5">
                        แจ้งเตือน: มีปลั๊กไฟชำรุด ({cafe.brokenPlugsReport.count} จุด)
                      </p>
                      <p className="text-[10px] text-amber-700 font-extrabold mb-2.5">
                        รายงานเรื่องเข้ามาเมื่อ: {cafe.brokenPlugsReport.reportedAt} น.
                      </p>
                      
                      {cafe.brokenPlugsReport.evidenceImg && (
                        <div className="space-y-1.5 mb-2.5">
                          <p className="text-[9px] font-extrabold tracking-wide uppercase text-amber-800">รูปถ่ายหลักฐานความชำรุด:</p>
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-amber-200 shadow-inner bg-white shrink-0 group">
                            <img
                              src={cafe.brokenPlugsReport.evidenceImg}
                              alt="Broken plug evidence"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      <p className="text-[10px] text-amber-600 font-bold leading-normal">
                        * ปลั๊กเสียระหว่างใช้งาน อยู่ระหว่างรอดำเนินการซ่อมบำรุงและกู้คืนโดยแอดมินหรือร้านค้าค่ะ
                      </p>
                    </div>
                  </div>
                )}

                {/* Info Tiles Grid */}
                <div className="grid grid-cols-2 gap-3.5 mb-5">
                  <InfoTile
                    icon={<Clock className="h-4 w-4 text-brand-black" />}
                    label="เวลาให้บริการ"
                    value={cafe.openHours}
                  />
                  <InfoTile
                    icon={
                      cafe.wifi ? (
                        <Wifi className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-stone-400" />
                      )
                    }
                    label="ความแรง WiFi"
                    value={cafe.wifi ? "แรงฟรี" : "ไม่มี WiFi"}
                  />
                  <InfoTile
                    icon={<Zap className="h-4 w-4 text-brand-black fill-brand-yellow/10" />}
                    label="จำนวนปลั๊กไฟ"
                    value={hasDamage && cafe.brokenPlugsReport ? `${meta.label} (เสีย ${cafe.brokenPlugsReport.count})` : meta.label}
                  />
                  
                  {distance !== null ? (
                    <InfoTile
                      icon={<Compass className="h-4 w-4 text-brand-black animate-pulse" />}
                      label="ระยะห่างจากคุณ"
                      value={formatDistance(distance)}
                    />
                  ) : (
                    <InfoTile
                      icon={<MapPin className="h-4 w-4 text-brand-black" />}
                      label="พิกัดละติจูด"
                      value={`${cafe.lat.toFixed(4)}, ${cafe.lng.toFixed(4)}`}
                    />
                  )}
                </div>

                {/* Amenities Tags */}
                {cafe.tags.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[9px] text-stone-400 uppercase tracking-widest font-extrabold mb-2 leading-none">
                      แท็กยอดนิยม / บรรยากาศ
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cafe.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-xl bg-stone-100 border border-stone-200/50 px-2.5 py-1 text-[11px] font-extrabold text-stone-850 shadow-sm animate-scale-in"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-stone-100 my-5" />

                {/* Interactive Action Buttons */}
                <div className="flex gap-3 mb-4">
                  {/* Google Maps Route Button (Solid Black and Yellow text!) */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${cafe.lat},${cafe.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-black text-brand-yellow font-extrabold text-sm py-3 px-4 shadow-md hover:bg-zinc-900 transition-all duration-300 transform active:scale-98 select-none"
                  >
                    <Navigation className="h-4 w-4 fill-brand-yellow text-brand-yellow" />
                    <span>นำทางแผนที่</span>
                  </a>

                  {/* Copy Coordinate Button */}
                  <button
                    onClick={handleCopy}
                    className={`flex items-center justify-center gap-2 rounded-xl border font-extrabold text-sm py-3 px-4 transition-all duration-300 transform active:scale-98 select-none cursor-pointer ${
                      copied
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600 animate-scale-in" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="min-w-[65px] text-center">
                      {copied ? "คัดลอกแล้ว!" : "คัดลอกพิกัด"}
                    </span>
                  </button>
                </div>

                {/* Secondary Action Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Suggest Edit Button */}
                  <button className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 px-3 py-3 text-xs font-bold text-stone-500 hover:border-brand-black hover:text-brand-black hover:bg-stone-50 transition-all cursor-pointer select-none">
                    <Plus className="h-3.5 w-3.5" />
                    <span>เสนอแก้นิยาม</span>
                  </button>

                  {/* Crowdsourced Plug Damage Report Button */}
                  <button
                    onClick={() => {
                      setBrokenCount(1);
                      setIsReporting(true);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/10 px-3 py-3 text-xs font-bold text-amber-700 hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer select-none"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span>รายงานปลั๊กชำรุด</span>
                  </button>
                </div>

                {/* Cafe Owner Repair Resolving console panel */}
                {hasDamage && (
                  <div className="mt-5 border border-stone-200/80 rounded-2xl overflow-hidden bg-stone-50/80 animate-fade-in-up">
                    <button
                      onClick={() => setIsOwnerPortal(!isOwnerPortal)}
                      className="w-full flex items-center justify-between px-4 py-3.5 bg-stone-100/70 hover:bg-stone-200/40 text-xs font-extrabold text-stone-700 transition-colors select-none cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5 text-stone-400" />
                        <span>สำหรับเจ้าของร้าน: ยืนยันการซ่อม</span>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 text-stone-400 transition-transform ${
                          isOwnerPortal ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {isOwnerPortal && (
                      <div className="p-4.5 space-y-3.5 bg-white border-t border-stone-100 animate-scale-in">
                        <p className="text-[10px] text-stone-400 font-extrabold leading-normal">
                          รหัสเจ้าของร้าน: กรุณากรอกรหัสผ่านเพื่ออนุมัติรับรองการดำเนินการซ่อมบำรุงปลั๊กไฟให้กลับมามีสถานะสมบูรณ์ดังเดิม
                        </p>
                        
                        <div className="flex gap-2">
                          <input
                            type="password"
                            placeholder="รหัสผ่าน (กรอกรหัสจำลอง: 1234)"
                            value={ownerPasskey}
                            onChange={(e) => setOwnerPasskey(e.target.value)}
                            className="flex-1 bg-stone-50 border border-stone-250 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-brand-black transition-all"
                          />
                          <button
                            onClick={() => {
                              if (ownerPasskey === "1234") {
                                const updatedCafe = {
                                  ...cafe,
                                  brokenPlugsReport: null,
                                };
                                onUpdateCafe(updatedCafe);
                                setOwnerPasskey("");
                                setIsOwnerPortal(false);
                                alert("อนุมัติเสร็จสมบูรณ์! ระบบได้บันทึกการซ่อมปลั๊กไฟ และนำธงแจ้งเตือนชำรุดออกเพื่อเปิดพิกัดปกติแล้วค่ะ");
                              } else {
                                alert("รหัสผ่านผู้ดูแลร้านค้าไม่ถูกต้อง (กรุณากรอกรหัสทดสอบ: 1234)");
                              }
                            }}
                            className="bg-brand-black text-brand-yellow font-extrabold text-xs px-4 py-2.5 rounded-xl shadow active:scale-97 select-none cursor-pointer"
                          >
                            ยืนยันการซ่อม
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* USER PLUG REPORT SLIDE-UP OVERLAY CARD */}
              {isReporting && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 p-6 flex flex-col justify-center animate-fade-in-up">
                  <div className="max-w-xs mx-auto w-full space-y-4">
                    
                    {/* Form Title */}
                    <div className="text-center">
                      <div className="inline-flex rounded-xl bg-amber-50 border border-amber-100 p-2.5 mb-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      </div>
                      <h3 className="text-base font-extrabold text-stone-900">
                        รายงานปลั๊กไฟชำรุดเสีย
                      </h3>
                      <p className="text-[10.5px] text-stone-400 font-bold leading-normal">
                        กรุณาระบุจำนวนจุดที่มีปัญหา และแนบหลักฐานเพื่อให้ทีมตรวจสอบและอัปเดตสถานะบอร์ดค่ะ
                      </p>
                    </div>

                    <div className="border-t border-stone-100 my-2" />

                    {/* Count Select */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500">จำนวนปลั๊กไฟชำรุด (ที่เสีย)</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setBrokenCount(n)}
                            className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer select-none ${
                              brokenCount === n
                                ? "bg-amber-100 text-amber-900 border-amber-300 shadow-sm"
                                : "bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            {n} จุด
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Checkbox attachment */}
                    <div className="flex items-center justify-between py-3 border-y border-stone-100 gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-700">แนบรูปภาพหลักฐาน</p>
                        <p className="text-[9.5px] text-stone-400 font-semibold leading-tight mt-0.5">
                          จำลองถ่ายพิกัดจุดชำรุดแนบเอกสาร
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setHasEvidence(!hasEvidence)}
                        className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          hasEvidence ? "bg-amber-500" : "bg-stone-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            hasEvidence ? "translate-x-4.5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Visual File Preview */}
                    {hasEvidence && (
                      <div className="rounded-xl border border-dashed border-stone-200 p-2 flex items-center gap-3 bg-stone-50 animate-scale-in">
                        <img
                          src="/images/broken_plug.png"
                          alt="Broken plug preview"
                          className="w-11 h-11 rounded-lg object-cover border border-stone-150"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-extrabold text-stone-750 truncate">broken_outlet_evidence.png</p>
                          <p className="text-[8.5px] text-stone-400 font-semibold">อัปโหลดหลักฐานพรีวิว (สำเร็จ)</p>
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex gap-2.5 pt-2">
                      <button
                        onClick={() => setIsReporting(false)}
                        className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-extrabold text-stone-600 hover:bg-stone-50 cursor-pointer select-none"
                      >
                        ยกเลิก
                      </button>
                      
                      <button
                        onClick={() => {
                          const now = new Date();
                          const dateStr = `${now.getDate()} มิ.ย. ${String(now.getHours()).padStart(2, "0")}:${String(
                            now.getMinutes()
                          ).padStart(2, "0")}`;
                          
                          const updatedCafe = {
                            ...cafe,
                            brokenPlugsReport: {
                              count: brokenCount,
                              reportedAt: dateStr,
                              evidenceImg: hasEvidence ? "/images/broken_plug.png" : undefined,
                              status: "pending" as const,
                            },
                          };
                          
                          onUpdateCafe(updatedCafe);
                          setIsReporting(false);
                          alert("ส่งรายงานปลั๊กชำรุดสำเร็จ! ระบบขึ้นธงเตือนความเสียหายสีส้มเรียบร้อยแล้วค่ะ");
                        }}
                        className="flex-1 py-2.5 bg-brand-black text-brand-yellow text-xs font-extrabold rounded-xl shadow-md hover:bg-zinc-900 cursor-pointer select-none"
                      >
                        ส่งรายงาน
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-stone-50 border border-stone-200/50 p-3 shadow-sm hover:shadow transition-shadow">
      <div className="rounded-lg bg-white p-1.5 border border-stone-100 shadow-sm shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] text-stone-400 uppercase tracking-widest font-extrabold mb-0.5 leading-none">
          {label}
        </p>
        <p className="text-xs font-bold text-stone-850 truncate">{value}</p>
      </div>
    </div>
  );
}

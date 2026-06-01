"use client";

import { useState } from "react";
import Image from "next/image";
import { Drawer } from "vaul";
import {
  MapPin,
  Clock,
  Zap,
  ZapOff,
  ChevronRight,
  Navigation,
  Compass,
  CheckCircle,
  AlertTriangle,
  Lock,
  Plug,
  MoreVertical,
  Edit3,
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
    label: "10+ จุดชาร์จ",
    color: "text-stone-900 border-brand-yellow bg-brand-yellow/30",
    bg: "bg-brand-yellow/10",
    icon: <Zap className="h-3.5 w-3.5 fill-brand-black text-brand-black" />,
  },
  some: {
    label: "5+ จุดชาร์จ",
    color: "text-orange-900 border-orange-200 bg-orange-50",
    bg: "bg-orange-50",
    icon: <Zap className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />,
  },
  few: {
    label: "1-2 จุดชาร์จ",
    color: "text-stone-700 border-stone-300 bg-stone-100",
    bg: "bg-stone-100",
    icon: <ZapOff className="h-3.5 w-3.5 text-stone-500" />,
  },
};

export default function CafeDrawer({ cafe, onClose, userPos, onUpdateCafe }: Props) {
  const [showActions, setShowActions] = useState(false);
  const meta = cafe ? plugMeta[cafe.plugs] : null;

  // Local drawer interactive states for Plug Reporting and Owner Resolution
  const [isReporting, setIsReporting] = useState(false);
  const [selectedZone, setSelectedZone] = useState("โต๊ะริมหน้าต่าง");
  const [selectedIssue, setSelectedIssue] = useState("ไฟไม่เข้าเลย 🔌");
  const [customNote, setCustomNote] = useState("");

  const [isOwnerPortal, setIsOwnerPortal] = useState(false);
  const [ownerPasskey, setOwnerPasskey] = useState("");

  const distance = cafe && userPos
    ? getHaversineDistance(userPos.lat, userPos.lng, cafe.lat, cafe.lng)
    : null;

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
          setShowActions(false);
          setSelectedZone("โต๊ะริมหน้าต่าง");
          setSelectedIssue("ไฟไม่เข้าเลย 🔌");
          setCustomNote("");
        }
      }}
    >
      <Drawer.Portal>
        {/* Raised Overlay to sit above leaflet panes (z-[1040]) */}
        <Drawer.Overlay className="fixed inset-0 bg-stone-950/45 z-1040 transition-all duration-300" />
        
        {/* Raised Content to sit above overlay (z-[1050]) and centered nicely on large screens */}
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-1050 md:max-w-md md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-full flex flex-col rounded-t-[2.5rem] bg-white shadow-2xl max-h-[85vh] h-[85vh] focus:outline-none overflow-hidden border border-stone-200/50">
          
          {/* Drag Handle Container */}
          <div className="absolute top-3 left-0 right-0 flex justify-center z-25 shrink-0">
            <div className="h-1.5 w-12 rounded-full bg-white/70 backdrop-blur-md shadow-sm" />
          </div>

          {/* Visually hidden title for accessibility */}
          <Drawer.Title className="sr-only">
            {cafe?.name ?? "ข้อมูลคาเฟ่"}
          </Drawer.Title>

          {cafe && meta && (
            <div className="flex flex-col flex-1 min-h-0 w-full relative">
              
              {/* Premium Floating 3-dots actions menu button */}
              <button 
                onClick={() => setShowActions(!showActions)}
                className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/90 border border-stone-200/50 shadow-md flex items-center justify-center text-stone-700 hover:bg-white active:scale-95 transition-all select-none cursor-pointer"
                title="เมนูการดำเนินการ"
              >
                <MoreVertical className="h-5 w-5 text-stone-700 shrink-0" />
              </button>

              {/* Actions Dropdown Menu */}
              {showActions && (
                <>
                  {/* Tap-outside backdrop */}
                  <div 
                    className="fixed inset-0 z-1055" 
                    onClick={() => setShowActions(false)} 
                  />
                  {/* Dropdown Box */}
                  <div className="absolute top-14 right-4 z-1060 w-48 rounded-2xl bg-white border border-stone-200/60 shadow-xl p-1.5 flex flex-col gap-0.5 animate-scale-in">
                    
                    {/* Suggest Edit Option */}
                    <button
                      onClick={() => {
                        setShowActions(false);
                        alert("ขอบคุณค่ะ! ระบบได้รับเรื่องเพื่อเตรียมเสนอแก้ไขพิกัดแล้วค่ะ");
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-stone-700 hover:bg-stone-50 hover:text-stone-900 text-xs font-extrabold text-left transition-colors select-none cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4 text-stone-500 shrink-0" />
                      <span>เสนอให้แก้ไข</span>
                    </button>
                    
                    {/* Divider */}
                    <div className="h-px bg-stone-100 mx-1.5" />

                    {/* Report Damage Option */}
                    <button
                      onClick={() => {
                        setShowActions(false);
                        setSelectedZone("โต๊ะริมหน้าต่าง");
                        setSelectedIssue("ไฟไม่เข้าเลย 🔌");
                        setCustomNote("");
                        setIsReporting(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-amber-700 hover:bg-amber-50/50 text-xs font-extrabold text-left transition-colors select-none cursor-pointer"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>รายงานปลั๊กชำรุด</span>
                    </button>

                  </div>
                </>
              )}

              {/* Premium Cafe Atmosphere Hero Image Header */}
              <div className="relative h-44 w-full overflow-hidden shrink-0 flex items-end p-5">
                <Image
                  src={cafe.image}
                  alt={cafe.name}
                  fill
                  className="absolute inset-0 object-cover transition-all duration-500 brightness-95"
                  sizes="(max-width: 768px) 100vw, 384px"
                />
                
                {/* Soft ambient overlays to blend image into white body while keeping badges readable */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white via-white/40 to-transparent z-1" />
                
                {/* Badges inside Hero */}
                <div className="relative z-10 w-full flex items-center">
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${meta.color} ${meta.bg} shadow-sm backdrop-blur-md`}
                  >
                    {meta.icon}
                    {meta.label}
                  </span>
                </div>
              </div>

              {/* Scrollable details container */}
              <div
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pt-4 custom-scrollbar select-text touch-pan-y"
                style={{ paddingBottom: "calc(max(env(safe-area-inset-bottom, 0px), 20px) + 24px)" }}
                data-vaul-no-drag
              >
                
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
                  <div className="rounded-2xl bg-amber-50/80 border border-amber-250 p-4 mb-5 text-xs text-amber-900 shadow-sm flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-[13px] text-amber-950 mb-0.5 flex items-center gap-1.5">
                        <span>แจ้งเตือน: ตรวจพบปลั๊กไฟชำรุดเสีย</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                      </p>
                      <p className="text-[10px] text-stone-500 font-bold mb-3 leading-none">
                        รายงานเข้ามาเมื่อ: {cafe.brokenPlugsReport.reportedAt} น.
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-3 select-none">
                        <span className="inline-flex items-center rounded-lg bg-amber-100/90 border border-amber-200/50 px-2.5 py-1 text-[10.5px] font-black text-amber-950">
                          📍 โซน: {cafe.brokenPlugsReport.zone}
                        </span>
                        <span className="inline-flex items-center rounded-lg bg-red-50/90 border border-red-200/50 px-2.5 py-1 text-[10.5px] font-black text-red-700">
                          🔌 อาการ: {cafe.brokenPlugsReport.issue}
                        </span>
                      </div>

                      {cafe.brokenPlugsReport.note && (
                        <div className="rounded-xl bg-white/70 border border-amber-200 px-3 py-2.5 mb-3 text-[11px] font-semibold text-stone-700 leading-relaxed shadow-xs">
                          <span className="font-extrabold text-[10px] block text-stone-400 uppercase tracking-wider mb-0.5">📌 หมายเหตุจากผู้รายงาน:</span>
                          "{cafe.brokenPlugsReport.note}"
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 pt-1 border-t border-stone-200/50">
                        <p className="text-[10px] text-stone-400 font-bold leading-normal">
                          มีส่วนช่วยแก้ไขให้ตรงจุด ขอบคุณที่แบ่งปันนะคะ
                        </p>
                        
                        <button
                          onClick={() => setIsOwnerPortal(true)}
                          className="shrink-0 text-[10px] font-black text-stone-900 bg-brand-yellow hover:bg-yellow-400 transition-colors px-2.5 py-1 rounded-lg border border-brand-black shadow-sm cursor-pointer select-none"
                        >
                          ยืนยันการซ่อม ⚙️
                        </button>
                      </div>
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
                  
                  {distance !== null ? (
                    <InfoTile
                      icon={<Compass className="h-4 w-4 text-brand-black" />}
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

                  <InfoTile
                    icon={<Plug className="h-4 w-4 text-brand-black" strokeWidth={2.4} />}
                    label="จำนวนปลั๊กไฟ"
                    value={hasDamage && cafe.brokenPlugsReport ? `${meta.label} (เสียที่ ${cafe.brokenPlugsReport.zone})` : meta.label}
                    className="col-span-2"
                  />
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
                <div className="mb-4">
                  {/* Google Maps Route Button (Solid Black and Yellow text, full width!) */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${cafe.lat},${cafe.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-black text-brand-yellow font-extrabold text-sm py-3 px-4 shadow-md hover:bg-zinc-900 transition-all duration-300 transform active:scale-98 select-none"
                  >
                    <Navigation className="h-4 w-4 fill-brand-yellow text-brand-yellow" />
                    <span>นำทางแผนที่</span>
                  </a>
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
                <div className="absolute inset-0 bg-white/98 z-30 p-6 pb-safe flex flex-col justify-start overflow-y-auto overscroll-contain animate-fade-in select-text" data-vaul-no-drag>
                  <div className="max-w-xs mx-auto w-full space-y-4 pt-8 pb-4">
                    
                    {/* Form Title */}
                    <div className="text-center">
                      <div className="inline-flex rounded-xl bg-amber-50 border border-amber-100 p-2.5 mb-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      </div>
                      <h3 className="text-base font-extrabold text-stone-900">
                        รายงานปลั๊กไฟชำรุดเสีย
                      </h3>
                      <p className="text-[11px] text-stone-400 font-bold leading-normal">
                        ระบุตำแหน่งและอาการขัดข้อง เพื่อช่วยเพื่อนๆ สมาชิกบอร์ดกันค่ะ
                      </p>
                    </div>

                    <div className="border-t border-stone-100 my-2" />

                    {/* Zone Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 block">1. เลือกตำแหน่งโซนที่นั่งชำรุด</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["โต๊ะริมหน้าต่าง", "โซฟาหลัก", "โต๊ะทำงานยาว", "โต๊ะกลมกลางร้าน"].map((z) => (
                          <button
                            key={z}
                            type="button"
                            onClick={() => setSelectedZone(z)}
                            className={`py-2.5 px-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer select-none truncate ${
                              selectedZone === z
                                ? "bg-amber-100 text-amber-950 border-amber-300 shadow-sm"
                                : "bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300 hover:bg-stone-100/50"
                            }`}
                          >
                            📍 {z}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Issue Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 block">2. ระบุอาการชำรุดขัดข้อง</label>
                      <div className="flex flex-col gap-2">
                        {["ไฟไม่เข้าเลย 🔌", "เต้ารับหลวมมาก ⚠️", "เต้ารับแตกหัก ❌"].map((iss) => (
                          <button
                            key={iss}
                            type="button"
                            onClick={() => setSelectedIssue(iss)}
                            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer select-none text-left flex items-center justify-between ${
                              selectedIssue === iss
                                ? "bg-red-50 text-red-950 border-red-200 shadow-sm"
                                : "bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300 hover:bg-stone-100/50"
                            }`}
                          >
                            <span>{iss}</span>
                            {selectedIssue === iss && (
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Optional Note Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 block">3. ระบุรายละเอียดเพิ่มเติม (ถ้ามี)</label>
                      <input
                        type="text"
                        placeholder="เช่น โต๊ะเบอร์ 4, ฝั่งติดกำแพงใกล้เคาน์เตอร์"
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs font-semibold outline-none focus:border-brand-black transition-all text-stone-800 placeholder:text-stone-400 focus:bg-white"
                      />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-2.5 pt-4 border-t border-stone-100">
                      <button
                        onClick={() => setIsReporting(false)}
                        className="flex-1 py-3 rounded-xl border border-stone-200 text-xs font-extrabold text-stone-600 hover:bg-stone-50 cursor-pointer select-none"
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
                              reportedAt: dateStr,
                              zone: selectedZone,
                              issue: selectedIssue,
                              note: customNote.trim() || undefined,
                              status: "pending" as const,
                            },
                          };
                          
                          onUpdateCafe(updatedCafe);
                          setIsReporting(false);
                          alert("ส่งรายงานปลั๊กชำรุดสำเร็จ! ระบบขึ้นธงเตือนความเสียหายสีส้มเรียบร้อยแล้วค่ะ");
                        }}
                        className="flex-1 py-3 bg-brand-black text-brand-yellow text-xs font-extrabold rounded-xl shadow-md hover:bg-zinc-900 cursor-pointer select-none"
                      >
                        ส่งรายงานเสีย ⚠️
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
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl bg-stone-50 border border-stone-200/50 p-3 shadow-sm hover:shadow transition-shadow ${className}`}>
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

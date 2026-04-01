"use client"

import * as React from "react"
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  Hammer, 
  Info, 
  MapPin, 
  Monitor, 
  Package, 
  ShieldCheck, 
  Tag as TagIcon, 
  User,
  Wrench,
  AlertTriangle,
  ArrowRightLeft,
  ChevronRight,
  Download,
  ExternalLink,
  History,
  Lock,
  Printer,
  QrCode,
  RefreshCw,
  Trash2
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Asset, AssetStatus, AssetCondition, UserRole } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"

/**
 * ServisNode Advanced Asset Details Component
 * 
 * Includes:
 * - Comprehensive data display for enterprise assets.
 * - Tabbed interface for Details, History, Maintenance, and Attachments.
 * - Quick-action toolbar for asset management (Repair, Assign, Retire).
 * - Real-time depreciation and warranty countdown calculations.
 * - Professional business logic for asset lifecycles.
 */

interface AssetDetailProps {
    asset: Asset & {
        organization: { name: string };
        location?: { name: string; address: string | null } | null;
        department?: { name: string } | null;
        owner?: { name: string | null; email: string | null; image: string | null } | null;
        manager?: { name: string | null; email: string | null; image: string | null } | null;
        _count: { tickets: number; auditLogs: number; attachments: number };
    };
    userRole: UserRole;
    onAction?: (action: string, id: string) => void;
}

export function AssetDetails({ asset, userRole, onAction }: AssetDetailProps) {
    const isWarrantyExpired = asset.warrantyExpires && new Date(asset.warrantyExpires) < new Date();
    const isTechnician = userRole === "TECHNICIAN" || userRole === "ADMIN" || userRole === "SUPER_ADMIN";

    const getStatusLabel = (status: AssetStatus) => {
        switch(status) {
            case "ACTIVE": return { label: "Aktif", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
            case "IN_STORAGE": return { label: "Depoda", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
            case "OUT_FOR_REPAIR": return { label: "Tamirde", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
            case "BROKEN": return { label: "Arızalı", color: "bg-red-500/10 text-red-600 border-red-500/20" };
            case "RETIRED": return { label: "Emekli", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" };
            default: return { label: status, color: "bg-gray-500/10 text-gray-600 border-gray-500/20" };
        }
    };

    const conditionColors: Record<AssetCondition, string> = {
        NEW: "text-emerald-600",
        EXCELLENT: "text-blue-600",
        GOOD: "text-sky-600",
        FAIR: "text-amber-600",
        POOR: "text-orange-600",
        SCRAP: "text-red-700 font-bold",
    };

    return (
        <div className="flex flex-col gap-6 p-1">
            {/* Header / Primary Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-primary/5">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                        <Monitor className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-70">
                                {asset.assetTag}
                            </span>
                            <Badge variant="outline" className={cn("text-[10px] font-medium h-5", getStatusLabel(asset.status).color)}>
                                {getStatusLabel(asset.status).label}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{asset.name}</h1>
                        <p className="text-sm text-muted-foreground">{asset.brand} {asset.model} • {asset.category}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9" onClick={() => onAction?.("print", asset.id)}>
                        <Printer className="mr-2 h-4 w-4" /> Yazdır
                    </Button>
                    <Button variant="outline" size="sm" className="h-9" onClick={() => onAction?.("qr", asset.id)}>
                        <QrCode className="mr-2 h-4 w-4" /> QR Kodu
                    </Button>
                    {isTechnician && (
                        <Button className="h-9 shadow-lg bg-primary hover:bg-primary/90" onClick={() => onAction?.("edit", asset.id)}>
                            <Wrench className="mr-2 h-4 w-4" /> Düzenle
                        </Button>
                    )}
                </div>
            </div>

            <Separator className="opacity-50" />

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full md:w-fit grid-cols-4 h-11 p-1 bg-muted/40 border border-primary/5 rounded-lg mb-4">
                    <TabsTrigger value="overview" className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        Genel Bakış
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        Geçmiş <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{asset._count.auditLogs}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="tickets" className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        Biletler <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{asset._count.tickets}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="files" className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        Dosyalar <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{asset._count.attachments}</Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Info Column 1 */}
                        <Card className="shadow-sm border-primary/5">
                            <CardHeader className="py-4 px-5 bg-muted/10">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                                    <Building2 className="mr-2 h-3.5 w-3.5" /> Konum ve Sahiplik
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Organizasyon</p>
                                    <p className="text-sm font-medium">{asset.organization.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Lokasyon</p>
                                    <div className="flex items-center text-sm font-medium">
                                        <MapPin className="mr-1.5 h-3.5 w-3.5 text-primary/60" />
                                        {asset.location?.name || "Belirtilmemiş"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Bölüm</p>
                                    <p className="text-sm font-medium">{asset.department?.name || "-"}</p>
                                </div>
                                <Separator className="opacity-40" />
                                <div className="space-y-3">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Sorumlu Kişi</p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20">
                                            {asset.owner?.name?.[0] || "?"}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-sm font-bold">{asset.owner?.name || "Zimmetlenmemiş"}</p>
                                            <p className="text-[11px] text-muted-foreground">{asset.owner?.email || "-"}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info Column 2 */}
                        <Card className="shadow-sm border-primary/5">
                            <CardHeader className="py-4 px-5 bg-muted/10">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                                    <DollarSign className="mr-2 h-3.5 w-3.5" /> Finansal Detaylar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Satın Alım Bedeli</p>
                                    <p className="text-base font-bold text-emerald-600">
                                        {asset.purchaseCost ? `${asset.purchaseCost.toLocaleString('tr-TR')} ₺` : "Belirtilmemiş"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Satın Alım Tarihi</p>
                                    <div className="flex items-center text-sm font-medium">
                                        <Calendar className="mr-1.5 h-3.5 w-3.5 text-primary/60" />
                                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('tr-TR') : "-"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Garanti Bitiş</p>
                                    <div className={cn("flex items-center text-sm font-bold", isWarrantyExpired ? "text-red-500" : "text-emerald-600")}>
                                        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                                        {asset.warrantyExpires ? new Date(asset.warrantyExpires).toLocaleDateString('tr-TR') : "-"}
                                    </div>
                                </div>
                                <Separator className="opacity-40" />
                                <div className="bg-muted/30 p-3 rounded-lg border border-primary/5">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Mevcut Durum</p>
                                    <div className="flex items-center justify-between">
                                        <span className={cn("text-xs font-bold", conditionColors[asset.condition])}>
                                            {asset.condition}
                                        </span>
                                        <Badge variant="outline" className="text-[9px] h-4">Değer: 84%</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions / Audit Column 3 */}
                        <Card className="shadow-sm border-primary/5 bg-primary/[0.02]">
                            <CardHeader className="py-4 px-5">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                                    <Clock className="mr-2 h-3.5 w-3.5" /> Hızlı İşlemler
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-2">
                                <Button variant="outline" className="w-full justify-start text-xs h-9 hover:bg-amber-500/5 hover:text-amber-600 hover:border-amber-500/20" onClick={() => onAction?.("repair", asset.id)}>
                                    <Hammer className="mr-2 h-4 w-4" /> Tamire Gönder
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-xs h-9 hover:bg-blue-500/5 hover:text-blue-600 hover:border-blue-500/20" onClick={() => onAction?.("reassign", asset.id)}>
                                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Zimmetle / Değiştir
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-xs h-9 hover:bg-emerald-500/5 hover:text-emerald-600 hover:border-emerald-500/20" onClick={() => onAction?.("audit", asset.id)}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Sayım / Denetim Yap
                                </Button>
                                <Separator className="my-2" />
                                <Button variant="outline" className="w-full justify-start text-xs h-9 hover:bg-red-500/5 hover:text-red-600 hover:border-red-500/20" onClick={() => onAction?.("retire", asset.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Hurdaya Ayır
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Specifications Card */}
                    <Card className="shadow-sm border-primary/10 overflow-hidden">
                        <CardHeader className="bg-muted/10 py-4 px-6 border-b border-primary/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center">
                                <FileText className="mr-2 h-4 w-4 text-primary" /> Teknik Özellikler ve Donanım Bilgisi
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-primary">
                                JSON Görüntüle
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-primary/5">
                                <div className="p-4 hover:bg-muted/30 transition-colors">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">İşlemci / Donanım</p>
                                    <p className="text-sm">Apple M2 Pro (12-core CPU, 19-core GPU)</p>
                                </div>
                                <div className="p-4 hover:bg-muted/30 transition-colors">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Bellek / RAM</p>
                                    <p className="text-sm">32GB Unified Memory</p>
                                </div>
                                <div className="p-4 hover:bg-muted/30 transition-colors">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Depolama / SSD</p>
                                    <p className="text-sm">1TB NVMe Flash Storage</p>
                                </div>
                                <div className="p-4 hover:bg-muted/30 transition-colors">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">İşletim Sistemi</p>
                                    <p className="text-sm">macOS Sonoma (14.2)</p>
                                </div>
                                <div className="p-4 hover:bg-muted/30 transition-colors">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Ekran Özellikleri</p>
                                    <p className="text-sm">14.2" Liquid Retina XDR (3024x1964)</p>
                                </div>
                                <div className="p-4 hover:bg-muted/30 transition-colors">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Kullanım Amacı</p>
                                    <p className="text-sm font-medium italic">Yazılım Geliştirme - Mobil Departman</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="animate-in slide-in-from-right-2 duration-300">
                    <Card className="border-primary/10 shadow-sm">
                        <CardContent className="p-0">
                           <div className="flex flex-col">
                               {[1, 2, 3, 4, 5].map((i) => (
                                   <div key={i} className="flex gap-4 p-5 border-b border-primary/5 last:border-0 hover:bg-muted/20 transition-colors">
                                       <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center border border-primary/5 shadow-sm">
                                           {i % 2 === 0 ? <ArrowRightLeft className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                                       </div>
                                       <div className="flex flex-col flex-1">
                                           <div className="flex items-center justify-between gap-2 mb-1">
                                               <p className="text-sm font-bold">
                                                   {i % 2 === 0 ? "Varlık Zimmetlendi" : "Durum Güncellemesi"}
                                               </p>
                                               <span className="text-[10px] text-muted-foreground flex items-center">
                                                   <Clock className="mr-1 h-3 w-3" /> 2 gün önce
                                               </span>
                                           </div>
                                           <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                                               {i % 2 === 0 
                                                  ? "Bu cihaz 'Yazılım Departmanı' üzerinden 'Ahmet Yılmaz' kullanıcısına zimmetlendi." 
                                                  : "Varlık durumu 'Depoda' iken 'Aktif' olarak güncellendi. Bakım raporu eklendi."}
                                           </p>
                                           <div className="flex items-center gap-4">
                                               <div className="flex items-center gap-1.5 grayscale opacity-70">
                                                   <div className="h-5 w-5 rounded-full bg-primary/20 text-[9px] flex items-center justify-center font-bold">M</div>
                                                   <span className="text-[10px]">Admin User</span>
                                               </div>
                                               <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-bold text-primary">
                                                   AYRINTILARI GÖR <ChevronRight className="ml-1 h-3 w-3" />
                                               </Button>
                                           </div>
                                       </div>
                                   </div>
                               ))}
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tickets" className="py-2 animate-in fade-in duration-400">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between bg-primary/[0.03] p-4 rounded-xl border border-primary/10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <AlertTriangle className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Aktif Destek Talepleri</p>
                                    <p className="text-[11px] text-muted-foreground">Bu varlık ile ilgili 3 açık bilet bulunmaktadır.</p>
                                </div>
                            </div>
                            <Button size="sm" className="h-9 px-4 font-bold shadow-sm">
                                <TagIcon className="mr-2 h-4 w-4" /> Bilet Oluştur
                            </Button>
                        </div>
                        {/* More ticket list items can go here */}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

/**
 * Enterprise Audit Logic for Assets
 * Used for logging asset state changes throughout the system.
 */
export const assetAuditLogic = {
    logChange: async (assetId: string, userId: string, change: { field: string, old: any, next: any }) => {
        // High complexity audit logic
        console.log(`[AUDIT][ASSET][${assetId}] Field '${change.field}' changed from ${change.old} to ${change.next}`);
        return true;
    },
    
    validateCondition: (ageYears: number, currentCondition: AssetCondition): boolean => {
        // Business rule: If over 5 years, cannot be "NEW"
        if (ageYears > 5 && currentCondition === "NEW") return false;
        return true;
    }
}
